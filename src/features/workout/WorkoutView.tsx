import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle,
  Clock,
  Award,
  X,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';
import type {
  WorkoutSetRecord,
  ExerciseSessionRecord,
  WorkoutSession,
  UserSettings,
  ScheduledExercise
} from '../../types';
import { WORKOUT_DAYS } from '../../data/program';
import { EXERCISES } from '../../data/exercises';
import { ExerciseAnimator } from '../../components/animations/ExerciseAnimator';
import { ProgressRing } from '../../components/common/ProgressRing';
import { soundEngine } from '../../services/audio';
import { triggerHaptic } from '../../services/vibrate';
import { wakeLockService } from '../../services/wakeLock';
import { db } from '../../services/db';

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
  const workoutDay = WORKOUT_DAYS.find(d => d.dayNumber === dayNumber) || WORKOUT_DAYS[0];

  // Workout Phases: 'warmup' | 'main' | 'cooldown'
  const [currentPhase, setCurrentPhase] = useState<'warmup' | 'main' | 'cooldown'>(
    workoutDay.warmupExercises.length > 0 ? 'warmup' : 'main'
  );

  // Active exercises based on current phase
  const activeExerciseList: ScheduledExercise[] =
    currentPhase === 'warmup'
      ? workoutDay.warmupExercises
      : currentPhase === 'cooldown'
      ? workoutDay.cooldownExercises
      : workoutDay.mainExercises;

  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);

  // Sets record state per exercise: { [exerciseId]: WorkoutSetRecord[] }
  const [recordedSets, setRecordedSets] = useState<Record<string, WorkoutSetRecord[]>>(() => {
    const initial: Record<string, WorkoutSetRecord[]> = {};
    const all = [...workoutDay.warmupExercises, ...workoutDay.mainExercises, ...workoutDay.cooldownExercises];
    all.forEach(sched => {
      if (!initial[sched.exerciseId]) {
        initial[sched.exerciseId] = Array.from({ length: sched.sets }, (_, i) => ({
          setNumber: i + 1,
          target: sched.repsOrDuration,
          actual: sched.repsOrDuration,
          completed: false,
          skipped: false
        }));
      }
    });
    return initial;
  });

  // Current rep or duration input adjuster for active set
  const currentSched = activeExerciseList[exerciseIndex] || workoutDay.mainExercises[0];
  const currentEx = EXERCISES[currentSched?.exerciseId] || EXERCISES['push-ups'];
  const [activeValue, setActiveValue] = useState<number>(() => currentSched?.repsOrDuration || 10);

  // Global Stopwatch & Active State
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [restSeconds, setRestSeconds] = useState<number>(0);

  // Rest Timer State (Reliable absolute timestamp target)
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restDuration, setRestDuration] = useState<number>(currentSched?.restDuration || settings.defaultRestDuration);
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const restTargetTimestampRef = useRef<number | null>(null);

  // Timed Exercise Countdown (Plank, holds, high knees)
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState<boolean>(false);
  const [exerciseTimerRemaining, setExerciseTimerRemaining] = useState<number>(currentSched?.repsOrDuration || 30);
  const exerciseTimerTargetRef = useRef<number | null>(null);

  // Dialog States
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [showInstructionModal, setShowInstructionModal] = useState<boolean>(false);

  // Screen Wake Lock & Sound config
  useEffect(() => {
    wakeLockService.setEnabled(settings.wakeLockEnabled);
    wakeLockService.request();
    soundEngine.setEnabled(settings.soundEnabled);

    return () => {
      wakeLockService.release();
    };
  }, [settings]);

  // Update activeValue when switching exercise
  useEffect(() => {
    if (currentSched) {
      const existingSets = recordedSets[currentSched.exerciseId];
      const target = existingSets?.[currentSetIndex]?.target || currentSched.repsOrDuration;
      setActiveValue(target);

      // Reset exercise timer state
      if (currentEx.isTimed) {
        setExerciseTimerRemaining(target);
        setIsExerciseTimerRunning(false);
        exerciseTimerTargetRef.current = null;
      }
    }
  }, [exerciseIndex, currentSetIndex, currentPhase, currentSched, currentEx.isTimed, recordedSets]);

  // Start Rest Timer
  const triggerRestTimer = useCallback((duration: number) => {
    setIsResting(true);
    setRestDuration(duration);
    setRestRemaining(duration);
    restTargetTimestampRef.current = Date.now() + duration * 1000;
  }, []);

  const skipRest = () => {
    setIsResting(false);
    restTargetTimestampRef.current = null;
    setRestRemaining(0);
  };

  const addRestTime = (secondsToAdd: number) => {
    if (restTargetTimestampRef.current !== null) {
      restTargetTimestampRef.current += secondsToAdd * 1000;
      setRestRemaining(prev => prev + secondsToAdd);
    }
  };

  // Timed exercise controls
  const startExerciseTimer = () => {
    setIsExerciseTimerRunning(true);
    exerciseTimerTargetRef.current = Date.now() + exerciseTimerRemaining * 1000;
  };

  const pauseExerciseTimer = () => {
    setIsExerciseTimerRunning(false);
    exerciseTimerTargetRef.current = null;
  };

  // Celebrate and finish
  const finishAndCelebrate = useCallback(() => {
    soundEngine.playWorkoutComplete();
    triggerHaptic([100, 80, 150, 100, 300], settings.vibrationEnabled);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a3e635', '#22c55e', '#ffffff', '#38bdf8']
      });
    } catch {
      // Ignore confetti error
    }

    setShowCompletionModal(true);
  }, [settings.vibrationEnabled]);

  // Handle phase transitions (warmup -> main -> cooldown -> finished)
  const handlePhaseTransition = useCallback(() => {
    setIsResting(false);
    if (currentPhase === 'warmup') {
      setCurrentPhase('main');
      setExerciseIndex(0);
      setCurrentSetIndex(0);
    } else if (currentPhase === 'main') {
      if (workoutDay.cooldownExercises.length > 0) {
        setCurrentPhase('cooldown');
        setExerciseIndex(0);
        setCurrentSetIndex(0);
      } else {
        finishAndCelebrate();
      }
    } else {
      finishAndCelebrate();
    }
  }, [currentPhase, workoutDay.cooldownExercises.length, finishAndCelebrate]);

  // Complete a Set
  const handleCompleteSet = useCallback((actualRepsOrDuration?: number) => {
    const valueToRecord = actualRepsOrDuration !== undefined ? actualRepsOrDuration : activeValue;
    const exId = currentSched.exerciseId;

    setRecordedSets(prev => {
      const existing = prev[exId] ? [...prev[exId]] : [];
      if (existing[currentSetIndex]) {
        existing[currentSetIndex] = {
          ...existing[currentSetIndex],
          actual: valueToRecord,
          completed: true,
          skipped: false
        };
      }
      return { ...prev, [exId]: existing };
    });

    soundEngine.playFinish();
    triggerHaptic(50, settings.vibrationEnabled);

    // If more sets remain in this exercise
    if (currentSetIndex < currentSched.sets - 1) {
      setCurrentSetIndex(prev => prev + 1);
      triggerRestTimer(currentSched.restDuration || settings.defaultRestDuration);
    } else {
      // Completed all sets for this exercise!
      if (exerciseIndex < activeExerciseList.length - 1) {
        setExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        triggerRestTimer(currentSched.restDuration || settings.defaultRestDuration);
      } else {
        handlePhaseTransition();
      }
    }
  }, [
    activeValue,
    currentSched,
    currentSetIndex,
    exerciseIndex,
    activeExerciseList.length,
    settings.defaultRestDuration,
    settings.vibrationEnabled,
    triggerRestTimer,
    handlePhaseTransition
  ]);

  // Master Clock Loop (Uses performance.now / Date.now absolute target calculations)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused) return;

      setTotalSeconds(prev => prev + 1);

      // Handle Rest Timer
      if (isResting && restTargetTimestampRef.current !== null) {
        const remaining = Math.max(0, Math.ceil((restTargetTimestampRef.current - Date.now()) / 1000));
        setRestRemaining(remaining);
        setRestSeconds(prev => prev + 1);

        if (remaining <= 3 && remaining > 0) {
          soundEngine.playTick();
        }

        if (remaining <= 0) {
          setIsResting(false);
          restTargetTimestampRef.current = null;
          soundEngine.playRestComplete();
          triggerHaptic([100, 50, 100], settings.vibrationEnabled);
        }
      } else {
        setActiveSeconds(prev => prev + 1);
      }

      // Handle Timed Exercise Countdown
      if (isExerciseTimerRunning && exerciseTimerTargetRef.current !== null) {
        const remaining = Math.max(0, Math.ceil((exerciseTimerTargetRef.current - Date.now()) / 1000));
        setExerciseTimerRemaining(remaining);

        if (remaining <= 3 && remaining > 0) {
          soundEngine.playTick();
        }

        if (remaining <= 0) {
          setIsExerciseTimerRunning(false);
          exerciseTimerTargetRef.current = null;
          soundEngine.playFinish();
          triggerHaptic(200, settings.vibrationEnabled);
          handleCompleteSet(currentSched.repsOrDuration);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isResting, isExerciseTimerRunning, currentSched, settings, handleCompleteSet]);

  // Undo Last Set
  const handleUndoSet = () => {
    const exId = currentSched.exerciseId;
    if (currentSetIndex > 0) {
      const targetSetIdx = currentSetIndex - 1;
      setRecordedSets(prev => {
        const existing = [...prev[exId]];
        if (existing[targetSetIdx]) {
          existing[targetSetIdx].completed = false;
        }
        return { ...prev, [exId]: existing };
      });
      setCurrentSetIndex(targetSetIdx);
      setIsResting(false);
    } else if (exerciseIndex > 0) {
      const prevExIdx = exerciseIndex - 1;
      const prevSched = activeExerciseList[prevExIdx];
      setExerciseIndex(prevExIdx);
      setCurrentSetIndex(prevSched.sets - 1);
      setIsResting(false);
    }
  };

  // Skip Exercise
  const handleSkipExercise = () => {
    const exId = currentSched.exerciseId;
    setRecordedSets(prev => {
      const existing = prev[exId] ? [...prev[exId]] : [];
      return {
        ...prev,
        [exId]: existing.map(s => ({ ...s, skipped: true, completed: false }))
      };
    });

    if (exerciseIndex < activeExerciseList.length - 1) {
      setExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setIsResting(false);
    } else {
      handlePhaseTransition();
    }
  };

  // Save session record to Dexie
  const handleSaveAndExit = async (isFullComplete: boolean) => {
    const sessionExercises: ExerciseSessionRecord[] = workoutDay.mainExercises.map(sched => {
      const sets = recordedSets[sched.exerciseId] || [];
      const ex = EXERCISES[sched.exerciseId];
      return {
        exerciseId: sched.exerciseId,
        exerciseName: ex ? ex.name : sched.exerciseId,
        sets: sets,
        skipped: sets.every(s => s.skipped)
      };
    });

    const now = new Date();
    const session: WorkoutSession = {
      dayNumber: workoutDay.dayNumber,
      dateCompleted: now.toISOString().split('T')[0],
      startedAt: new Date(Date.now() - totalSeconds * 1000).toISOString(),
      finishedAt: now.toISOString(),
      totalDurationSeconds: totalSeconds,
      activeDurationSeconds: activeSeconds,
      restDurationSeconds: restSeconds,
      isCompleted: isFullComplete,
      exercises: sessionExercises,
      sessionType: 'evening'
    };

    try {
      await db.sessions.add(session);
    } catch (err) {
      console.error('Failed to save session to IndexedDB:', err);
    }

    onFinishWorkout(session);
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculate overall workout progress
  const totalSetsInWorkout = workoutDay.mainExercises.reduce((acc, e) => acc + e.sets, 0);
  const completedSetsInWorkout = workoutDay.mainExercises.reduce((acc, e) => {
    const sets = recordedSets[e.exerciseId] || [];
    return acc + sets.filter(s => s.completed).length;
  }, 0);
  const workoutProgressPct = Math.round((completedSetsInWorkout / Math.max(1, totalSetsInWorkout)) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 pb-24 lg:pb-8 animate-fadeIn select-none">
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between bg-[#16191f] border border-white/10 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
            title="Exit Workout"
          >
            <X size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-[#a3e635]">
                DAY {String(workoutDay.dayNumber).padStart(2, '0')}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {currentPhase} Phase
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {workoutDay.title}
            </h3>
          </div>
        </div>

        {/* Stopwatch & Pause */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono font-bold text-white">{formatTime(totalSeconds)}</span>
            <span className="text-[10px] text-white/40">Active: {formatTime(activeSeconds)}</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl transition ${
              isPaused ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 hover:bg-white/10 text-white'
            }`}
            title={isPaused ? 'Resume Workout' : 'Pause Workout'}
          >
            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {/* Phase Selector Tabs */}
      <div className="flex items-center gap-2 px-1 text-xs font-semibold">
        {workoutDay.warmupExercises.length > 0 && (
          <button
            onClick={() => {
              setCurrentPhase('warmup');
              setExerciseIndex(0);
              setCurrentSetIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl border transition ${
              currentPhase === 'warmup'
                ? 'bg-[#a3e635]/20 text-[#a3e635] border-[#a3e635]/40'
                : 'bg-white/5 text-white/50 border-white/5 hover:text-white'
            }`}
          >
            1. Warm-up
          </button>
        )}
        <button
          onClick={() => {
            setCurrentPhase('main');
            setExerciseIndex(0);
            setCurrentSetIndex(0);
          }}
          className={`px-3 py-1.5 rounded-xl border transition ${
            currentPhase === 'main'
              ? 'bg-[#a3e635] text-black border-[#a3e635] font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)]'
              : 'bg-white/5 text-white/50 border-white/5 hover:text-white'
          }`}
        >
          2. Main Workout
        </button>
        {workoutDay.cooldownExercises.length > 0 && (
          <button
            onClick={() => {
              setCurrentPhase('cooldown');
              setExerciseIndex(0);
              setCurrentSetIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl border transition ${
              currentPhase === 'cooldown'
                ? 'bg-[#a3e635]/20 text-[#a3e635] border-[#a3e635]/40'
                : 'bg-white/5 text-white/50 border-white/5 hover:text-white'
            }`}
          >
            3. Cooldown
          </button>
        )}
      </div>

      {/* Main Grid: Responsive Side-by-Side on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Animated Exercise Demonstration */}
        <div className="lg:col-span-7 space-y-3">
          <ExerciseAnimator
            exercise={currentEx}
            speed={settings.animationSpeed}
            showControls={true}
            className="w-full min-h-[280px] sm:min-h-[350px]"
          />

          {/* Alternative Notice if applicable */}
          {currentEx.hasEquipmentAlternative && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              <span className="font-bold">No-Equipment Setup: </span>
              {currentEx.equipmentAlternativeNotice}
            </div>
          )}
        </div>

        {/* Right Column: Active Exercise Controls & Set Recorder */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Exercise Title & Instructions Link */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#a3e635] uppercase tracking-wider">
                  Exercise {exerciseIndex + 1} of {activeExerciseList.length}
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  {currentEx.name}
                </h2>
                <p className="text-xs text-white/50">
                  Target: {currentSched.sets} sets × {currentSched.repsOrDuration} {currentSched.unit}
                </p>
              </div>

              <button
                onClick={() => setShowInstructionModal(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                title="View Form Tips & Common Mistakes"
              >
                <HelpCircle size={18} />
              </button>
            </div>

            {/* Set Progress Indicators */}
            <div className="p-3.5 rounded-2xl bg-[#16191f] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60 font-semibold">
                <span>
                  SET {currentSetIndex + 1} OF {currentSched.sets}
                </span>
                <span>{workoutProgressPct}% Workout Done</span>
              </div>

              <div className="flex items-center gap-2">
                {Array.from({ length: currentSched.sets }).map((_, idx) => {
                  const setRec = recordedSets[currentSched.exerciseId]?.[idx];
                  const isDone = setRec?.completed;
                  const isCurrent = idx === currentSetIndex;

                  return (
                    <div
                      key={idx}
                      className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-[#22c55e]'
                          : isCurrent
                          ? 'bg-[#a3e635] ring-2 ring-[#a3e635]/40 animate-pulse'
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Rep / Duration Active Selector or Countdown */}
            {!currentEx.isTimed ? (
              <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 flex flex-col items-center justify-center space-y-3">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Recorded Repetitions
                </span>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setActiveValue(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xl font-bold transition active:scale-95"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-white">{activeValue}</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest mt-1">reps</span>
                  </div>

                  <button
                    onClick={() => setActiveValue(prev => prev + 1)}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xl font-bold transition active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ) : (
              /* Timed Exercise Mode (Plank, holds) */
              <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 flex flex-col items-center justify-center space-y-3">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Hold Countdown
                </span>
                <div className="relative flex items-center justify-center my-1">
                  <ProgressRing
                    progress={((currentSched.repsOrDuration - exerciseTimerRemaining) / currentSched.repsOrDuration) * 100}
                    size={130}
                    strokeWidth={10}
                    progressColor="#a3e635"
                  >
                    <span className="text-3xl font-black text-white font-mono">
                      {formatTime(exerciseTimerRemaining)}
                    </span>
                    <span className="text-[10px] text-white/50 uppercase mt-0.5">Remaining</span>
                  </ProgressRing>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={isExerciseTimerRunning ? pauseExerciseTimer : startExerciseTimer}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] text-black font-bold text-xs shadow-md transition"
                  >
                    {isExerciseTimerRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                    <span>{isExerciseTimerRunning ? 'Pause Timer' : 'Start Countdown'}</span>
                  </button>

                  <button
                    onClick={() => {
                      pauseExerciseTimer();
                      setExerciseTimerRemaining(currentSched.repsOrDuration);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white"
                    title="Reset Timer"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Button: COMPLETE SET */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleCompleteSet(activeValue)}
              className="w-full py-4 rounded-2xl bg-[#a3e635] text-black font-black text-base hover:bg-[#bef264] transition-all shadow-[0_0_20px_rgba(163,230,53,0.35)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              <span>Complete Set {currentSetIndex + 1}</span>
            </button>

            {/* Sub-actions: Undo, Skip, Rest */}
            <div className="flex items-center justify-between text-xs text-white/60">
              <button
                onClick={handleUndoSet}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <RotateCcw size={13} />
                <span>Undo Set</span>
              </button>

              <button
                onClick={() => triggerRestTimer(currentSched.restDuration || settings.defaultRestDuration)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <Clock size={13} />
                <span>Rest Timer</span>
              </button>

              <button
                onClick={handleSkipExercise}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <SkipForward size={13} />
                <span>Skip Movement</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* REST TIMER OVERLAY MODAL */}
      {/* ======================================================== */}
      {isResting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#16191f] border border-white/10 rounded-3xl p-6 text-center space-y-5 shadow-2xl relative">
            <div>
              <span className="text-xs font-bold text-[#a3e635] uppercase tracking-wider">
                Rest & Recovery
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Catch Your Breath</h3>
            </div>

            <div className="flex items-center justify-center">
              <ProgressRing
                progress={((restDuration - restRemaining) / restDuration) * 100}
                size={160}
                strokeWidth={12}
                progressColor="#a3e635"
                trackColor="#242b35"
              >
                <span className="text-4xl font-black text-white font-mono">{restRemaining}</span>
                <span className="text-xs text-white/40 uppercase tracking-widest mt-0.5">seconds</span>
              </ProgressRing>
            </div>

            {/* Quick add time */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => addRestTime(15)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80"
              >
                +15s
              </button>
              <button
                onClick={() => addRestTime(30)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80"
              >
                +30s
              </button>
              <button
                onClick={() => addRestTime(60)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80"
              >
                +60s
              </button>
            </div>

            {/* Skip rest button */}
            <button
              onClick={skipRest}
              className="w-full py-3 rounded-xl bg-[#a3e635] text-black font-bold text-sm hover:bg-[#bef264] transition"
            >
              Skip Rest & Begin Next Set
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORM INSTRUCTIONS MODAL */}
      {/* ======================================================== */}
      {showInstructionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#16191f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowInstructionModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-xs font-bold text-[#a3e635] uppercase tracking-wider">
                Exercise Guide
              </span>
              <h3 className="text-xl font-black text-white">{currentEx.name}</h3>
            </div>

            <div className="space-y-3 text-xs text-white/80">
              <div className="p-3 rounded-xl bg-white/5">
                <h5 className="font-bold text-white mb-1">Starting Position:</h5>
                <p className="text-white/70 leading-relaxed">{currentEx.instructions.startingPosition}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5">
                <h5 className="font-bold text-white mb-1">Movement Execution:</h5>
                <p className="text-white/70 leading-relaxed">{currentEx.instructions.movement}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5">
                <h5 className="font-bold text-white mb-1">Breathing Cadence:</h5>
                <p className="text-white/70 leading-relaxed">{currentEx.instructions.breathing}</p>
              </div>

              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <h5 className="font-bold text-red-400 mb-1">Common Mistakes:</h5>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                  {currentEx.instructions.commonMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInstructionModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#a3e635] text-black font-bold text-xs"
            >
              Back to Workout
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EXIT CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Exit Workout Session?</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              You have completed {completedSetsInWorkout} of {totalSetsInWorkout} sets. How would you like to proceed?
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSaveAndExit(false)}
                className="w-full py-3 rounded-xl bg-[#a3e635] text-black font-bold text-xs hover:bg-[#bef264] transition"
              >
                Save Partial Progress & Exit
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-semibold text-xs transition"
              >
                Discard & Exit Without Saving
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white font-medium text-xs transition"
              >
                Resume Training
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WORKOUT COMPLETION CELEBRATION MODAL */}
      {/* ======================================================== */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md bg-[#16191f] border border-[#a3e635]/30 rounded-3xl p-7 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-[#a3e635]/20 text-[#a3e635] mx-auto flex items-center justify-center border border-[#a3e635]/40 shadow-[0_0_30px_rgba(163,230,53,0.35)]">
              <Award size={36} />
            </div>

            <div>
              <span className="text-xs font-bold text-[#a3e635] uppercase tracking-wider">
                Workout Complete!
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Day {workoutDay.dayNumber} Crushed</h3>
              <p className="text-xs text-white/60 mt-1">
                Discipline builds strength. Another session in the record books.
              </p>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Total Time</span>
                <div className="text-sm font-black text-white mt-0.5">{formatTime(totalSeconds)}</div>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Sets Done</span>
                <div className="text-sm font-black text-[#a3e635] mt-0.5">{completedSetsInWorkout}</div>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Phase</span>
                <div className="text-sm font-black text-white mt-0.5">P{workoutDay.phase}</div>
              </div>
            </div>

            <button
              onClick={() => handleSaveAndExit(true)}
              className="w-full py-3.5 rounded-2xl bg-[#a3e635] text-black font-black text-sm hover:bg-[#bef264] transition shadow-[0_0_20px_rgba(163,230,53,0.4)]"
            >
              Save Record & Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
