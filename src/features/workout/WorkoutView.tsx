import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Award,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Heart,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type {
  WorkoutSession,
  UserSettings,
  WorkoutTimelineItem,
  PlayerState,
  SavedWorkoutState,
  ExerciseSessionRecord
} from '../../types';
import { WORKOUT_DAYS } from '../../data/program';
import { EXERCISES } from '../../data/exercises';
import { ExerciseAnimator } from '../../components/animations/ExerciseAnimator';
import { soundEngine, speechEngine } from '../../services/audio';
import { triggerHaptic } from '../../services/vibrate';
import { wakeLockService } from '../../services/wakeLock';
import { db, updateUserSettings } from '../../services/db';
import { buildWorkoutTimeline } from '../../services/workoutEngine';
import {
  formatLocalDate,
  advanceProgramDay,
  calculateStreak
} from '../../services/progression';
import {
  normalizeSavedSession,
  getSafeExercise,
  type NormalizedSavedSession
} from '../../services/sessionRestoration';

interface WorkoutViewProps {
  dayNumber: number;
  settings: UserSettings;
  onFinishWorkout: (session: WorkoutSession) => void;
  onExit: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  dayNumber,
  settings,
  onFinishWorkout,
  onExit
}) => {
  const workoutDay = useMemo(() => {
    return WORKOUT_DAYS.find(d => d.dayNumber === dayNumber) || WORKOUT_DAYS[0];
  }, [dayNumber]);

  // Pre-build the entire workout timeline before playback
  const timeline: WorkoutTimelineItem[] = useMemo(() => {
    if (workoutDay.isRecovery) return [];
    return buildWorkoutTimeline(
      workoutDay,
      settings.defaultRestDuration,
      settings.repPaceMultiplier || 1.0
    );
  }, [workoutDay, settings.defaultRestDuration, settings.repPaceMultiplier]);

  // State machine: IDLE | PREPARING | EXERCISING | RESTING | PAUSED | COMPLETED
  const [playerState, setPlayerState] = useState<PlayerState>('IDLE');
  const [timelineIndex, setTimelineIndex] = useState<number>(0);

  // Timers and stopwatch
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [prepareRemaining, setPrepareRemaining] = useState<number>(3);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [restSeconds, setRestSeconds] = useState<number>(0);

  // Saved / paused workout in local storage
  const [savedWorkout, setSavedWorkout] = useState<NormalizedSavedSession | null>(null);

  // Sound and Voice toggles
  const [soundOn, setSoundOn] = useState<boolean>(settings.soundEnabled);
  const [voiceOn, setVoiceOn] = useState<boolean>(settings.voiceEnabled);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(() => new Set());

  // High-accuracy timestamp references to prevent drift & survive backgrounding
  const targetEndTimeRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Current timeline item
  const currentItem: WorkoutTimelineItem | undefined = timeline[timelineIndex];
  const currentEx = currentItem ? getSafeExercise(currentItem.exerciseId) : undefined;

  // Next item preview
  const nextItem: WorkoutTimelineItem | undefined = timeline[timelineIndex + 1];

  // Initialize audio and wake lock
  useEffect(() => {
    soundEngine.setEnabled(soundOn);
    speechEngine.setEnabled(voiceOn);
  }, [soundOn, voiceOn]);

  useEffect(() => {
    if (playerState === 'EXERCISING' || playerState === 'RESTING' || playerState === 'PREPARING') {
      wakeLockService.setEnabled(settings.wakeLockEnabled);
      wakeLockService.request();
    } else {
      wakeLockService.release();
    }
    return () => {
      wakeLockService.release();
    };
  }, [playerState, settings.wakeLockEnabled]);

  // Check for any existing paused workout in IndexedDB on mount & normalize safely
  useEffect(() => {
    let isMounted = true;
    async function checkSaved() {
      try {
        const saved = await db.activeWorkout.get('current');
        if (isMounted && saved && saved.state) {
          const normalized = normalizeSavedSession(saved.state, timeline, dayNumber);
          if (normalized && normalized.dayNumber === dayNumber) {
            setSavedWorkout(normalized);
          }
        }
      } catch (err) {
        console.error('Error loading active workout state:', err);
      }
    }
    checkSaved();
    return () => {
      isMounted = false;
    };
  }, [dayNumber, timeline]);

  // Format MM:SS helper
  const formatTime = (secs: number): string => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // =========================================================================
  // AUTOMATIC COMPLETION
  // =========================================================================
  const handleWorkoutComplete = useCallback(async () => {
    setPlayerState('COMPLETED');
    targetEndTimeRef.current = null;
    speechEngine.stop();
    soundEngine.playWorkoutComplete();
    triggerHaptic([100, 80, 150, 100, 300], settings.vibrationEnabled);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a3e635', '#22c55e', '#ffffff', '#38bdf8']
      });
    } catch {
      // Ignore confetti error
    }

    // Build session exercises record
    const sessionExercises: ExerciseSessionRecord[] = workoutDay.mainExercises.map(sched => {
      const ex = EXERCISES[sched.exerciseId];
      return {
        exerciseId: sched.exerciseId,
        exerciseName: ex ? ex.name : sched.exerciseId,
        sets: Array.from({ length: sched.sets }, (_, i) => ({
          setNumber: i + 1,
          target: sched.repsOrDuration,
          actual: sched.repsOrDuration,
          completed: true,
          skipped: false
        })),
        skipped: false
      };
    });

    const now = new Date();
    const todayStr = formatLocalDate(now);
    const session: WorkoutSession = {
      dayNumber: workoutDay.dayNumber,
      dateCompleted: todayStr,
      startedAt: new Date(Date.now() - totalSeconds * 1000).toISOString(),
      finishedAt: now.toISOString(),
      totalDurationSeconds: Math.max(60, totalSeconds),
      activeDurationSeconds: activeSeconds,
      restDurationSeconds: restSeconds,
      isCompleted: true,
      sessionType: 'evening',
      exercises: sessionExercises,
      notes: 'Completed automatically hands-free'
    };

    try {
      // Save session to IndexedDB
      await db.sessions.add(session);
      // Clear paused session from activeWorkout table
      await db.activeWorkout.delete('current');

      // Advance programme by exactly one day
      const nextDay = advanceProgramDay(workoutDay.dayNumber, settings.nextPendingDay);
      const allSessions = await db.sessions.toArray();
      const streakInfo = calculateStreak(allSessions, todayStr, settings.bestStreak);

      await updateUserSettings({
        nextPendingDay: nextDay,
        currentStreak: streakInfo.currentStreak,
        bestStreak: streakInfo.bestStreak
      });
    } catch (err) {
      console.error('Failed to save completed workout:', err);
    }
  }, [
    workoutDay,
    totalSeconds,
    activeSeconds,
    restSeconds,
    settings.vibrationEnabled,
    settings.nextPendingDay,
    settings.bestStreak
  ]);

  // Handle Recovery Day 1-click completion
  const handleCompleteRecoveryDay = async () => {
    soundEngine.playWorkoutComplete();
    const now = new Date();
    const todayStr = formatLocalDate(now);

    const session: WorkoutSession = {
      dayNumber: workoutDay.dayNumber,
      dateCompleted: todayStr,
      startedAt: now.toISOString(),
      finishedAt: now.toISOString(),
      totalDurationSeconds: 1200,
      activeDurationSeconds: 1200,
      restDurationSeconds: 0,
      isCompleted: true,
      sessionType: 'evening',
      exercises: [],
      notes: 'Observed scheduled recovery day'
    };

    try {
      await db.sessions.add(session);
      await db.activeWorkout.delete('current');

      const nextDay = advanceProgramDay(workoutDay.dayNumber, settings.nextPendingDay);
      const allSessions = await db.sessions.toArray();
      const streakInfo = calculateStreak(allSessions, todayStr, settings.bestStreak);

      await updateUserSettings({
        nextPendingDay: nextDay,
        currentStreak: streakInfo.currentStreak,
        bestStreak: streakInfo.bestStreak
      });

      onFinishWorkout(session);
    } catch (err) {
      console.error('Failed to save recovery day:', err);
    }
  };

  // =========================================================================
  // AUTOMATIC TIMELINE STEP TRANSITIONS
  // =========================================================================
  const startExerciseStep = useCallback((idx: number) => {
    const item = timeline[idx];
    if (!item) {
      handleWorkoutComplete();
      return;
    }

    setTimelineIndex(idx);
    setTimerRemaining(item.duration);
    setPlayerState('EXERCISING');
    targetEndTimeRef.current = Date.now() + item.duration * 1000;

    // Audio & Voice announcement
    speechEngine.announceExercise(
      item.exerciseName,
      item.target,
      item.unit,
      item.duration
    );
  }, [timeline, handleWorkoutComplete]);

  const startRestStep = useCallback((restDurationSeconds: number) => {
    setRestRemaining(restDurationSeconds);
    setPlayerState('RESTING');
    targetEndTimeRef.current = Date.now() + restDurationSeconds * 1000;

    soundEngine.playFinish();
    triggerHaptic(100, settings.vibrationEnabled);
    speechEngine.announceRest(restDurationSeconds);
  }, [settings.vibrationEnabled]);

  const handleExerciseTimerZero = useCallback(() => {
    setCompletedIndices(prev => new Set(prev).add(timelineIndex));
    const item = timeline[timelineIndex];

    if (!item) {
      handleWorkoutComplete();
      return;
    }

    // If item has rest duration > 0, transition immediately to REST
    if (item.restDuration > 0) {
      startRestStep(item.restDuration);
    } else {
      // No rest (e.g. final cooldown set) -> advance directly or complete
      if (timelineIndex < timeline.length - 1) {
        startExerciseStep(timelineIndex + 1);
      } else {
        handleWorkoutComplete();
      }
    }
  }, [timelineIndex, timeline, startRestStep, startExerciseStep, handleWorkoutComplete]);

  const handleRestTimerZero = useCallback(() => {
    soundEngine.playRestComplete();
    triggerHaptic([100, 50, 100], settings.vibrationEnabled);

    if (timelineIndex < timeline.length - 1) {
      startExerciseStep(timelineIndex + 1);
    } else {
      handleWorkoutComplete();
    }
  }, [timelineIndex, timeline.length, settings.vibrationEnabled, startExerciseStep, handleWorkoutComplete]);

  // =========================================================================
  // ONE START BUTTON FOR THE ENTIRE WORKOUT
  // =========================================================================
  const handleStartWorkout = () => {
    if (timeline.length === 0) return;
    setPlayerState('PREPARING');
    setPrepareRemaining(3);
    targetEndTimeRef.current = Date.now() + 3000;
    speechEngine.speak('Workout starting in three, two, one.');
  };

  // =========================================================================
  // REST EXTENSION (+10 SECONDS BUTTON)
  // =========================================================================
  const handleExtendRest = () => {
    if (playerState !== 'RESTING') return;
    setRestRemaining(prev => {
      const next = prev + 10;
      if (targetEndTimeRef.current !== null) {
        targetEndTimeRef.current += 10000;
      } else {
        targetEndTimeRef.current = Date.now() + next * 1000;
      }
      return next;
    });
    triggerHaptic(50, settings.vibrationEnabled);
  };

  // Optional manual skip rest if user feels ready early
  const handleSkipRest = () => {
    if (playerState !== 'RESTING') return;
    handleRestTimerZero();
  };

  // =========================================================================
  // ONLY ONE MAIN CONTROL — PAUSE & SAVE
  // =========================================================================
  const handlePauseAndSave = async () => {
    if (playerState === 'PAUSED' || playerState === 'COMPLETED' || playerState === 'IDLE') return;

    const savedStateVal: SavedWorkoutState = {
      dayNumber,
      timelineIndex,
      state: playerState,
      remainingSeconds: timerRemaining,
      restRemainingSeconds: restRemaining,
      totalSeconds,
      activeSeconds,
      restSeconds,
      completedTimelineIndices: Array.from(completedIndices),
      lastSavedAt: Date.now()
    };

    setPlayerState('PAUSED');
    targetEndTimeRef.current = null;
    speechEngine.stop();
    const normalized = normalizeSavedSession(savedStateVal, timeline, dayNumber);
    setSavedWorkout(normalized);

    try {
      await db.activeWorkout.put({ id: 'current', state: savedStateVal });
    } catch (err) {
      console.error('Failed to save paused state:', err);
    }
  };

  // Resume Workout from paused point
  const handleResumeWorkout = () => {
    if (!savedWorkout) {
      startExerciseStep(0);
      return;
    }

    const stateToResume = savedWorkout.state === 'RESTING' ? 'RESTING' : 'EXERCISING';
    const remaining = stateToResume === 'RESTING'
      ? savedWorkout.restRemainingSeconds
      : savedWorkout.remainingSeconds;

    const safeIndex = Math.max(0, Math.min(timeline.length - 1, savedWorkout.timelineIndex));
    setTimelineIndex(safeIndex);
    setTimerRemaining(savedWorkout.remainingSeconds);
    setRestRemaining(savedWorkout.restRemainingSeconds);
    setTotalSeconds(savedWorkout.totalSeconds);
    setActiveSeconds(savedWorkout.activeSeconds);
    setRestSeconds(savedWorkout.restSeconds);
    setCompletedIndices(new Set(savedWorkout.completedTimelineIndices || []));

    setPlayerState(stateToResume);
    targetEndTimeRef.current = Date.now() + remaining * 1000;

    const current = timeline[safeIndex];
    if (current && stateToResume === 'EXERCISING') {
      speechEngine.speak(`Resuming ${current.exerciseName}.`);
    } else {
      speechEngine.speak('Resuming rest.');
    }
  };

  // Reset and Discard Workout
  const handleDiscardWorkout = async () => {
    setPlayerState('IDLE');
    setSavedWorkout(null);
    targetEndTimeRef.current = null;
    setTotalSeconds(0);
    setActiveSeconds(0);
    setRestSeconds(0);
    setTimelineIndex(0);
    setCompletedIndices(new Set());
    try {
      await db.activeWorkout.delete('current');
    } catch (err) {
      console.error('Failed to clear active workout:', err);
    }
  };

  // =========================================================================
  // HIGH-RESOLUTION TICK LOOP & BACKGROUND VISIBILITY SYNC
  // =========================================================================
  useEffect(() => {
    if (playerState === 'IDLE' || playerState === 'PAUSED' || playerState === 'COMPLETED') {
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      lastTickTimeRef.current = now;

      // Update stopwatch
      setTotalSeconds(prev => prev + 1);
      if (playerState === 'EXERCISING') {
        setActiveSeconds(prev => prev + 1);
      } else if (playerState === 'RESTING') {
        setRestSeconds(prev => prev + 1);
      }

      // Handle precise timestamp countdown
      if (targetEndTimeRef.current !== null) {
        const remainingMs = targetEndTimeRef.current - now;
        const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));

        if (playerState === 'PREPARING') {
          setPrepareRemaining(remainingSecs);
          if (remainingSecs <= 3 && remainingSecs > 0) {
            soundEngine.playTick();
          }
          if (remainingSecs <= 0) {
            startExerciseStep(0);
          }
        } else if (playerState === 'EXERCISING') {
          setTimerRemaining(remainingSecs);

          // 3-2-1 countdown tick
          if (remainingSecs <= 3 && remainingSecs > 0) {
            soundEngine.playTick();
          }

          if (remainingSecs <= 0) {
            handleExerciseTimerZero();
          }
        } else if (playerState === 'RESTING') {
          setRestRemaining(remainingSecs);

          // 3-2-1 rest countdown tick & speech warning
          if (remainingSecs === 3) {
            speechEngine.announceNextUpcoming(nextItem?.exerciseName || 'Next exercise');
            soundEngine.playTick();
          } else if (remainingSecs <= 2 && remainingSecs > 0) {
            soundEngine.playTick();
          }

          if (remainingSecs <= 0) {
            handleRestTimerZero();
          }
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    playerState,
    startExerciseStep,
    handleExerciseTimerZero,
    handleRestTimerZero,
    nextItem?.exerciseName
  ]);

  // Sync accurately when returning from background (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && targetEndTimeRef.current !== null) {
        const remainingSecs = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        if (playerState === 'EXERCISING') {
          setTimerRemaining(remainingSecs);
          if (remainingSecs <= 0) handleExerciseTimerZero();
        } else if (playerState === 'RESTING') {
          setRestRemaining(remainingSecs);
          if (remainingSecs <= 0) handleRestTimerZero();
        } else if (playerState === 'PREPARING') {
          setPrepareRemaining(remainingSecs);
          if (remainingSecs <= 0) startExerciseStep(0);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [playerState, handleExerciseTimerZero, handleRestTimerZero, startExerciseStep]);

  // Toggle Fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Workout progress percentage across all sets
  const totalSetsCount = Math.max(1, timeline.length);
  const completedSetsCount = completedIndices.size;
  const progressPct = Math.min(100, Math.round((completedSetsCount / totalSetsCount) * 100));

  // =========================================================================
  // RENDER: RECOVERY DAY SCREEN
  // =========================================================================
  if (workoutDay.isRecovery) {
    return (
      <div className="w-full max-w-2xl mx-auto min-h-[80vh] flex flex-col justify-center items-center text-center p-6 space-y-6 animate-fadeIn select-none">
        <div className="w-20 h-20 rounded-3xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.2)]">
          <Heart size={40} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-wider border border-sky-500/20">
            DAY {String(workoutDay.dayNumber).padStart(2, '0')} • Active Recovery Day
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">{workoutDay.title}</h2>
          <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
            {workoutDay.description || 'Rest, rebuild muscle fibers, and let your central nervous system recharge. Take a gentle 20–30 minute walk or perform light stretching.'}
          </p>
        </div>

        <div className="w-full p-5 rounded-2xl bg-[#16191f] border border-white/5 space-y-3 text-left">
          <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Prescribed Recovery Activities:</h4>
          <ul className="space-y-2 text-xs text-white/60">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>20–30 minute gentle outdoor walk for blood flow</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Hydrate adequately (at least 2.5–3 litres)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Full body mobility flow and gentle hamstring/quad stretches</span>
            </li>
          </ul>
        </div>

        <div className="w-full space-y-3 pt-2">
          <button
            onClick={handleCompleteRecoveryDay}
            className="w-full py-4 rounded-2xl bg-sky-400 text-black font-black text-base hover:bg-sky-300 transition shadow-[0_0_25px_rgba(56,189,248,0.35)] active:scale-98 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            <span>Mark Recovery Day Observed</span>
          </button>

          <button
            onClick={onExit}
            className="w-full py-3 rounded-xl bg-white/5 text-white/60 hover:text-white text-xs font-semibold transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: IDLE (LAUNCH SCREEN - ONE START BUTTON)
  // =========================================================================
  if (playerState === 'IDLE') {
    return (
      <div className="w-full max-w-3xl mx-auto min-h-[85vh] flex flex-col justify-between p-4 sm:p-6 space-y-6 animate-fadeIn select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`p-2 rounded-xl border transition ${
                soundOn ? 'bg-white/10 text-white border-white/10' : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
              title={soundOn ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Workout Information Card */}
        <div className="space-y-5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#a3e635]/15 border border-[#a3e635]/30 text-xs font-black text-[#a3e635] uppercase tracking-wider">
            <Sparkles size={13} />
            <span>DAY {String(workoutDay.dayNumber).padStart(2, '0')} • PHASE 0{workoutDay.phase}</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {workoutDay.title}
            </h1>
            <p className="text-sm sm:text-base text-white/60 mt-2 max-w-xl leading-relaxed">
              {workoutDay.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#16191f] border border-white/5 text-center">
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Total Sets</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{timeline.length}</div>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Estimated Time</span>
              <div className="text-xl sm:text-2xl font-black text-[#a3e635] mt-0.5">
                ~{Math.round(timeline.reduce((acc, i) => acc + i.duration + i.restDuration, 0) / 60)}m
              </div>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Hands-Free</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">100%</div>
            </div>
          </div>

          {/* Sequence Overview */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/70 space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Automatic Workout Flow</span>
              <span className="text-[#a3e635] font-normal">Continuous Hands-Free</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-amber-300">
                1. Warm-up ({workoutDay.warmupExercises.length} drills)
              </span>
              <span>→</span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[#a3e635]">
                2. Main Strength ({workoutDay.mainExercises.length} movements)
              </span>
              <span>→</span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-sky-300">
                3. Cooldown ({workoutDay.cooldownExercises.length} stretches)
              </span>
            </div>
          </div>
        </div>

        {/* Start / Continue Button Container */}
        <div className="space-y-3 pt-4">
          {savedWorkout ? (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <div>
                  <span className="font-bold">Paused Session Found: </span>
                  <span>
                    {savedWorkout.exerciseName || timeline[savedWorkout.timelineIndex]?.exerciseName || 'Workout'} • Set {savedWorkout.setNumber || timeline[savedWorkout.timelineIndex]?.setNumber || 1} of {savedWorkout.totalSets || timeline[savedWorkout.timelineIndex]?.totalSets || 1}
                  </span>
                </div>
                <button
                  onClick={handleDiscardWorkout}
                  className="text-[11px] underline hover:text-white"
                >
                  Discard
                </button>
              </div>

              <button
                onClick={handleResumeWorkout}
                className="w-full py-5 rounded-2xl bg-[#a3e635] text-black font-black text-lg hover:bg-[#bef264] transition-all shadow-[0_0_30px_rgba(163,230,53,0.4)] active:scale-98 flex items-center justify-center gap-3"
              >
                <Play size={22} fill="currentColor" />
                <span>CONTINUE WORKOUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartWorkout}
              className="w-full py-5 rounded-2xl bg-[#a3e635] text-black font-black text-lg hover:bg-[#bef264] transition-all shadow-[0_0_30px_rgba(163,230,53,0.4)] active:scale-98 flex items-center justify-center gap-3"
            >
              <Play size={22} fill="currentColor" />
              <span>START WORKOUT</span>
            </button>
          )}

          <p className="text-[11px] text-center text-white/40">
            Press once, place phone on stand, and train hands-free. Timers & transitions run automatically.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: PREPARING (3, 2, 1 COUNTDOWN)
  // =========================================================================
  if (playerState === 'PREPARING') {
    return (
      <div className="w-full h-[100dvh] max-h-screen flex flex-col justify-center items-center text-center p-6 space-y-6 select-none bg-[#0d0f12]">
        <span className="text-xs font-bold text-[#a3e635] uppercase tracking-widest">
          GET READY
        </span>
        <div className="text-8xl sm:text-9xl font-black font-mono text-white animate-bounce">
          {prepareRemaining}
        </div>
        <p className="text-sm text-white/60">
          First up: <span className="text-white font-bold">{timeline[0]?.exerciseName}</span>
        </p>
      </div>
    );
  }

  // =========================================================================
  // RENDER: PAUSED SCREEN (PAUSE & SAVE STATE)
  // =========================================================================
  if (playerState === 'PAUSED') {
    return (
      <div className="w-full max-w-md mx-auto min-h-[80vh] flex flex-col justify-center items-center text-center p-6 space-y-6 animate-fadeIn select-none">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <Pause size={38} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-3xl font-black text-white">WORKOUT PAUSED</h2>
          <p className="text-sm text-[#a3e635] font-semibold">Progress saved locally.</p>
          <p className="text-xs text-white/50 max-w-xs mx-auto">
            Safe to leave the page or close your browser. You can resume from this exact point anytime.
          </p>
        </div>

        {/* Current Position Card */}
        <div className="w-full p-4 rounded-2xl bg-[#16191f] border border-white/5 text-left space-y-1">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Saved Position</span>
          <div className="text-base font-black text-white">
            {currentItem?.exerciseName || timeline[Math.max(0, Math.min(timeline.length - 1, timelineIndex))]?.exerciseName || 'Push-ups'}
          </div>
          <div className="text-xs text-white/60">
            Set {currentItem?.setNumber || timeline[Math.max(0, Math.min(timeline.length - 1, timelineIndex))]?.setNumber || 1} of {currentItem?.totalSets || timeline[Math.max(0, Math.min(timeline.length - 1, timelineIndex))]?.totalSets || 3} • Time remaining: {formatTime(timerRemaining)}
          </div>
        </div>

        {/* Resume Button */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={handleResumeWorkout}
            className="w-full py-4 rounded-2xl bg-[#a3e635] text-black font-black text-base hover:bg-[#bef264] transition shadow-[0_0_20px_rgba(163,230,53,0.35)] active:scale-98 flex items-center justify-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            <span>RESUME WORKOUT</span>
          </button>

          <button
            onClick={onExit}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition"
          >
            Exit to Dashboard (Keep Saved)
          </button>

          <button
            onClick={handleDiscardWorkout}
            className="w-full py-2.5 rounded-xl text-red-400 hover:text-red-300 text-xs font-medium transition"
          >
            Discard Workout & Reset
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: COMPLETED SCREEN (CELEBRATION)
  // =========================================================================
  if (playerState === 'COMPLETED') {
    return (
      <div className="w-full max-w-lg mx-auto min-h-[85vh] flex flex-col justify-center items-center text-center p-6 space-y-6 animate-fadeIn select-none">
        <div className="w-24 h-24 rounded-3xl bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40 flex items-center justify-center shadow-[0_0_40px_rgba(163,230,53,0.4)]">
          <Award size={48} />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#a3e635] uppercase tracking-widest">
            SESSION COMPLETE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Day {workoutDay.dayNumber} Crushed!
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto">
            Discipline builds strength. The entire hands-free workout has been verified and saved to your progress history.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="w-full grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#16191f] border border-white/5 text-center">
          <div>
            <span className="text-[10px] text-white/40 uppercase font-semibold">Total Duration</span>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">{formatTime(totalSeconds)}</div>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase font-semibold">Completed Sets</span>
            <div className="text-base sm:text-lg font-black text-[#a3e635] mt-0.5">{timeline.length}</div>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase font-semibold">Rep Log Type</span>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 text-xs truncate">Estimated</div>
          </div>
        </div>

        <div className="w-full p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/60 text-center">
          <span className="text-[#a3e635] font-bold">Programme Advanced: </span>
          <span>Day {Math.min(30, workoutDay.dayNumber + 1)} is now your next pending workout.</span>
        </div>

        <button
          onClick={() => onFinishWorkout({} as WorkoutSession)}
          className="w-full py-4 rounded-2xl bg-[#a3e635] text-black font-black text-base hover:bg-[#bef264] transition shadow-[0_0_20px_rgba(163,230,53,0.35)] active:scale-98"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // =========================================================================
  // RENDER: REST SCREEN (DURING REST INTERVALS)
  // =========================================================================
  if (playerState === 'RESTING') {
    const nextPreviewEx = nextItem ? getSafeExercise(nextItem.exerciseId) : undefined;

    return (
      <div className="w-full h-[100dvh] max-h-screen flex flex-col justify-between p-3 sm:p-5 select-none bg-[#0d0f12] overflow-hidden">
        {/* Overall Workout Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider">
            <span>Overall Progress</span>
            <span className="text-[#a3e635]">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#a3e635] transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Rest Content (Centered, huge timer, next preview) */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto">
          <div className="space-y-1 text-center">
            <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-widest">
              REST & RECOVER
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white/80">
              {nextItem ? `Next: ${nextItem.exerciseName} — Set ${nextItem.setNumber} of ${nextItem.totalSets}` : 'Final Cooldown'}
            </h3>
          </div>

          {/* Huge Rest Countdown Timer - readable from 2-3m */}
          <div className="text-7xl sm:text-9xl font-black font-mono text-white tracking-tight text-center drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
            {formatTime(restRemaining)}
          </div>

          {/* Optional next exercise preview illustration */}
          {nextPreviewEx && (
            <div className="w-full max-w-xs h-[140px] sm:h-[180px] rounded-2xl overflow-hidden opacity-75 border border-white/10">
              <ExerciseAnimator
                exercise={nextPreviewEx}
                showControls={false}
                className="w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Controls: +10 SECONDS & PAUSE & SAVE */}
        <div className="space-y-2.5 w-full max-w-md mx-auto pb-1">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExtendRest}
              className="py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-sm transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus size={16} />
              <span>+10 SECONDS</span>
            </button>

            <button
              onClick={handleSkipRest}
              className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-xs transition"
            >
              Skip Rest & Begin
            </button>
          </div>

          <button
            onClick={handlePauseAndSave}
            className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Pause size={14} />
            <span>PAUSE & SAVE</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: EXERCISING (ACTIVE HANDS-FREE FULL-SCREEN PLAYER)
  // =========================================================================
  const safeTimelineIndex = Math.max(0, Math.min(Math.max(0, timeline.length - 1), timelineIndex));
  const safeCurrentItem: WorkoutTimelineItem | undefined = currentItem || timeline[safeTimelineIndex] || timeline[0];
  const safeExercise = currentEx || (safeCurrentItem ? getSafeExercise(safeCurrentItem.exerciseId) : getSafeExercise('push-ups'));

  if (!safeCurrentItem) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col justify-center items-center text-center p-6 space-y-4 text-white select-none">
        <h3 className="text-xl font-bold">UNABLE TO RESUME WORKOUT</h3>
        <p className="text-xs text-white/60">Workout timeline could not be initialized.</p>
        <button onClick={onExit} className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold">
          RETURN TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] max-h-screen flex flex-col justify-between p-3 sm:p-5 select-none bg-[#0d0f12] overflow-hidden">
      {/* 1. Overall Workout Progress Bar */}
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-white/50 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                safeCurrentItem.phase === 'warmup'
                  ? 'bg-amber-500/20 text-amber-300'
                  : safeCurrentItem.phase === 'cooldown'
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-[#a3e635]/20 text-[#a3e635]'
              }`}
            >
              {safeCurrentItem.phase === 'warmup' ? 'WARM-UP' : safeCurrentItem.phase === 'cooldown' ? 'COOLDOWN' : 'MAIN WORKOUT'}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/80">DAY {String(workoutDay.dayNumber).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              className={`text-xs font-semibold px-2 py-0.5 rounded border transition ${
                voiceOn ? 'bg-[#a3e635]/20 text-[#a3e635] border-[#a3e635]/30' : 'bg-white/5 text-white/40 border-white/10'
              }`}
              title={voiceOn ? 'Voice Coaching On' : 'Voice Coaching Off'}
            >
              Voice
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded text-white/50 hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <span className="text-[#a3e635] font-black">{progressPct}%</span>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[#a3e635] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 2. Current Exercise Header */}
      <div className="text-center space-y-1 pt-1">
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight truncate">
          {safeCurrentItem.exerciseName}
        </h2>

        {/* Set and Target Information */}
        <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-bold">
          <span className="text-white/90">
            SET {safeCurrentItem.setNumber} OF {safeCurrentItem.totalSets}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[#a3e635] uppercase tracking-wide">
            TARGET: {safeCurrentItem.target} {safeCurrentItem.unit === 'reps' ? 'REPS' : 'SEC HOLD'}
            {safeCurrentItem.targetNote ? ` (${safeCurrentItem.targetNote})` : ''}
          </span>
        </div>
      </div>

      {/* 3. Large Animated Exercise Demonstration (Main visual element) */}
      <div className="flex-1 flex items-center justify-center w-full max-w-xl mx-auto min-h-[170px] sm:min-h-[220px] max-h-[40vh] my-1">
        <ExerciseAnimator
          exercise={safeExercise}
          showControls={false}
          speed={settings.animationSpeed}
          className="w-full h-full max-h-[38vh]"
        />
      </div>

      {/* 4. Very Large Countdown Timer (Readable from 2–3 metres away) */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-[#a3e635] drop-shadow-[0_0_30px_rgba(163,230,53,0.35)]">
          {formatTime(timerRemaining)}
        </div>

        {/* Next Exercise Preview */}
        <div className="text-[11px] sm:text-xs font-semibold text-white/50 mt-1 truncate max-w-xs sm:max-w-md">
          {safeCurrentItem.restDuration > 0
            ? `NEXT: REST — ${safeCurrentItem.restDuration} SECONDS`
            : safeCurrentItem.nextPreview
            ? `NEXT: ${safeCurrentItem.nextPreview.name}`
            : 'NEXT: WORKOUT FINISH'}
        </div>
      </div>

      {/* 5. One Main Control: PAUSE & SAVE */}
      <div className="w-full max-w-md mx-auto pt-1 pb-1">
        <button
          onClick={handlePauseAndSave}
          className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-sm tracking-wider uppercase transition shadow-lg active:scale-98 flex items-center justify-center gap-2"
        >
          <Pause size={16} fill="currentColor" />
          <span>PAUSE & SAVE</span>
        </button>
      </div>
    </div>
  );
};
