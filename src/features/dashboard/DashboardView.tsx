import React from 'react';
import {
  Play,
  Flame,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sun,
  Dumbbell,
  Sparkles,
  ArrowRight,
  Heart
} from 'lucide-react';
import type { WorkoutSession, UserSettings } from '../../types';
import { WORKOUT_DAYS, getDateForDay, formatDatePretty } from '../../data/program';
import { ProgressRing } from '../../components/common/ProgressRing';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';

interface DashboardViewProps {
  currentDay: number;
  settings: UserSettings;
  sessions: WorkoutSession[];
  onStartWorkout: (dayNumber: number) => void;
  onNavigate: (tab: 'calendar' | 'workout' | 'library' | 'progress' | 'assessments' | 'settings') => void;
  onToggleMorningDay: (dayNumber: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentDay,
  settings,
  sessions,
  onStartWorkout,
  onNavigate,
  onToggleMorningDay
}) => {
  const todayWorkout = WORKOUT_DAYS.find(d => d.dayNumber === currentDay) || WORKOUT_DAYS[0];
  const nextWorkout = WORKOUT_DAYS.find(d => d.dayNumber === currentDay + 1);
  const nextRecoveryDay = WORKOUT_DAYS.find(d => d.dayNumber > currentDay && d.isRecovery);

  // Derive actual stats from sessions
  const completedEveningSessions = sessions.filter(s => s.isCompleted && s.sessionType === 'evening');
  const completedDayNumbers = new Set(completedEveningSessions.map(s => s.dayNumber));
  const totalCompletedDays = completedDayNumbers.size;

  // 30 days total minus scheduled recovery days (Days 7, 14, 21, 28 = 4 recovery days => 26 training days)
  const trainingDaysCount = WORKOUT_DAYS.filter(d => !d.isRecovery).length;
  const overallProgressPct = Math.round((totalCompletedDays / trainingDaysCount) * 100);

  // Compute streak
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (let d = 1; d <= 30; d++) {
    const day = WORKOUT_DAYS.find(w => w.dayNumber === d);
    if (!day) continue;

    if (completedDayNumbers.has(d)) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
      if (d <= currentDay) currentStreak = tempStreak;
    } else if (day.isRecovery) {
      // Scheduled recovery days do NOT break a streak!
      continue;
    } else if (d < currentDay) {
      tempStreak = 0;
      currentStreak = 0;
    }
  }

  const isTodayCompleted = completedDayNumbers.has(currentDay);
  const isMorningCompleted = settings.completedMorningDays?.includes(currentDay);
  const calendarDate = getDateForDay(settings.challengeStartDate, currentDay);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 lg:pb-12 animate-fadeIn select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              DAY {String(currentDay).padStart(2, '0')}{' '}
              <span className="text-white/40 text-lg sm:text-xl font-normal">/ 30</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 text-xs font-bold uppercase tracking-wider">
              Phase 0{todayWorkout.phase}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            {formatDatePretty(calendarDate)} • {todayWorkout.phaseName}
          </p>
        </div>

        <OfflineIndicator />
      </div>

      {/* Hero Workout Status Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1e27] via-[#14171d] to-[#0e1014] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a3e635]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">
              <Sparkles size={13} className="text-[#a3e635]" />
              <span>Today's Programmed Session</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {todayWorkout.title}
              </h3>
              <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
                {todayWorkout.description}
              </p>
            </div>

            {/* Workout Meta Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 font-semibold text-white">
                {todayWorkout.workoutType}
              </span>
              {!todayWorkout.isRecovery && (
                <>
                  <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                    {todayWorkout.mainExercises.length} Movements
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                    ~30–45 Mins
                  </span>
                </>
              )}
              {todayWorkout.isAssessment && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                  ★ Assessment Day
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartWorkout(currentDay)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95 ${
                  isTodayCompleted
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    : 'bg-[#a3e635] text-black hover:bg-[#bef264] shadow-[0_0_20px_rgba(163,230,53,0.35)]'
                }`}
              >
                {isTodayCompleted ? <CheckCircle2 size={18} className="text-[#a3e635]" /> : <Play size={18} fill="currentColor" />}
                <span>{isTodayCompleted ? 'Completed — Train Again' : 'Start Today’s Workout'}</span>
              </button>

              <button
                onClick={() => onNavigate('calendar')}
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 hover:text-white font-medium text-sm transition"
              >
                <Calendar size={16} />
                <span>View 30-Day Plan</span>
              </button>
            </div>
          </div>

          {/* Progress Circular Hero */}
          <div className="flex flex-col items-center justify-center p-4">
            <ProgressRing
              progress={overallProgressPct}
              size={150}
              strokeWidth={12}
              progressColor="#a3e635"
              trackColor="#232934"
            >
              <span className="text-3xl font-black text-white">{overallProgressPct}%</span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-0.5">Overall</span>
            </ProgressRing>
            <span className="text-xs text-white/60 font-medium mt-3">
              {totalCompletedDays} of {trainingDaysCount} sessions done
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Current Streak</span>
            <Flame size={16} className={currentStreak > 0 ? 'text-amber-400' : 'text-white/30'} />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{currentStreak}</span>
            <span className="text-xs text-white/50 ml-1.5">days</span>
          </div>
          <div className="text-[11px] text-white/40 mt-1">Best: {bestStreak} days</div>
        </div>

        {/* Sessions Done */}
        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Completed</span>
            <CheckCircle2 size={16} className="text-[#22c55e]" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalCompletedDays}</span>
            <span className="text-xs text-white/50 ml-1.5">days</span>
          </div>
          <div className="text-[11px] text-[#22c55e] mt-1">Verified records</div>
        </div>

        {/* Next Workout */}
        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Next Workout</span>
            <Dumbbell size={16} className="text-white/40" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white truncate">{nextWorkout ? nextWorkout.workoutType : 'Finish line!'}</div>
            <div className="text-[11px] text-white/50 truncate mt-0.5">{nextWorkout ? `Day ${nextWorkout.dayNumber}` : 'Day 30 completed'}</div>
          </div>
          <div className="text-[11px] text-white/40 mt-1">Scheduled next</div>
        </div>

        {/* Next Recovery */}
        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Next Recovery</span>
            <Heart size={16} className="text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-sky-400 truncate">
              {todayWorkout.isRecovery ? 'Today!' : nextRecoveryDay ? `Day ${nextRecoveryDay.dayNumber}` : 'None remaining'}
            </div>
            <div className="text-[11px] text-white/50 truncate mt-0.5">
              {todayWorkout.isRecovery ? 'Active rest day' : nextRecoveryDay ? formatDatePretty(getDateForDay(settings.challengeStartDate, nextRecoveryDay.dayNumber)) : 'Final stretch'}
            </div>
          </div>
          <div className="text-[11px] text-white/40 mt-1">Rest & rebuild</div>
        </div>
      </div>

      {/* Split Section: Optional Morning Routine & Exercise Library Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Morning Session Card */}
        {todayWorkout.morningRoutine && (
          <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Sun size={17} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Morning Awakening (Optional)</h4>
                  <p className="text-[11px] text-white/50">~{todayWorkout.morningRoutine.durationMinutes} Mins • Light Mobility</p>
                </div>
              </div>

              <button
                onClick={() => onToggleMorningDay(currentDay)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isMorningCompleted
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                }`}
              >
                <CheckCircle2 size={14} className={isMorningCompleted ? 'text-[#22c55e]' : 'text-white/40'} />
                <span>{isMorningCompleted ? 'Completed' : 'Mark Done'}</span>
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              {todayWorkout.morningRoutine.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {todayWorkout.morningRoutine.exercises.map((ex, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 text-white/60">
                  {ex}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access to Exercise Library */}
        <div
          onClick={() => onNavigate('library')}
          className="p-5 rounded-2xl bg-[#16191f] border border-white/5 hover:border-[#a3e635]/40 transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#a3e635]/10 text-[#a3e635] flex items-center justify-center">
                <Dumbbell size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#a3e635] transition">Exercise Library</h4>
                <p className="text-[11px] text-white/50">38 Animated Human Body Demonstrations</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/40 group-hover:text-[#a3e635] group-hover:translate-x-1 transition" />
          </div>

          <p className="text-xs text-white/60 mt-3">
            Inspect starting postures, movement mechanics, breathing guides, and muscle targets for every movement in the challenge.
          </p>

          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-[#a3e635]">
            <span>Explore all 38 movements</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
