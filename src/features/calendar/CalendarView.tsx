import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Play,
  X,
  Award
} from 'lucide-react';
import type { WorkoutSession, UserSettings, WorkoutDay } from '../../types';
import { WORKOUT_DAYS, getDateForDay, formatDatePretty } from '../../data/program';
import { EXERCISES } from '../../data/exercises';
import { ExerciseAnimator } from '../../components/animations/ExerciseAnimator';

interface CalendarViewProps {
  currentDay: number;
  settings: UserSettings;
  sessions: WorkoutSession[];
  onStartWorkout: (dayNumber: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDay,
  settings,
  sessions,
  onStartWorkout
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'all' | 1 | 2 | 3>('all');
  const [inspectDay, setInspectDay] = useState<WorkoutDay | null>(null);
  const [demoExerciseId, setDemoExerciseId] = useState<string | null>(null);

  const completedSessionMap = new Map<number, WorkoutSession>();
  sessions.filter(s => s.sessionType === 'evening').forEach(s => {
    completedSessionMap.set(s.dayNumber, s);
  });

  const filteredDays = selectedPhase === 'all'
    ? WORKOUT_DAYS
    : WORKOUT_DAYS.filter(d => d.phase === selectedPhase);

  const handleDayClick = (day: WorkoutDay) => {
    setInspectDay(day);
    setDemoExerciseId(null);
  };

  const handleStartWorkoutFromModal = (dayNumber: number) => {
    if (dayNumber > currentDay) {
      const confirmFuture = window.confirm(
        `Day ${dayNumber} is a future day (Today is Day ${currentDay}). Are you sure you want to start this workout ahead of schedule?`
      );
      if (!confirmFuture) return;
    }
    setInspectDay(null);
    onStartWorkout(dayNumber);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 lg:pb-12 animate-fadeIn select-none">
      {/* Title & Phase Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon size={26} className="text-[#a3e635]" />
            <span>30-DAY PROGRAMME CALENDAR</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Exact 30-day progression across Foundation, Strength, and Advanced phases.
          </p>
        </div>

        {/* Phase Filter Buttons */}
        <div className="flex bg-[#16191f] border border-white/5 p-1 rounded-xl text-xs font-semibold text-white/70 overflow-x-auto">
          {[
            { id: 'all', label: 'All 30 Days' },
            { id: 1, label: 'Phase 1 (1–10)' },
            { id: 2, label: 'Phase 2 (11–20)' },
            { id: 3, label: 'Phase 3 (21–30)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedPhase(tab.id as 'all' | 1 | 2 | 3)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedPhase === tab.id
                  ? 'bg-[#a3e635] text-black shadow font-bold'
                  : 'hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredDays.map(day => {
          const calendarDate = getDateForDay(settings.challengeStartDate, day.dayNumber);
          const isToday = day.dayNumber === currentDay;
          const session = completedSessionMap.get(day.dayNumber);
          const isCompleted = session?.isCompleted;
          const isPartial = session && !session.isCompleted;
          const isRecovery = day.isRecovery;
          const isFuture = day.dayNumber > currentDay;

          // Status badges & border colors
          let borderClass = 'border-white/5 hover:border-white/20';
          let statusBadge = (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-medium">
              {isFuture ? 'Locked' : 'Upcoming'}
            </span>
          );

          if (isCompleted) {
            borderClass = 'border-[#22c55e]/50 bg-[#22c55e]/5';
            statusBadge = (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 font-bold flex items-center gap-1">
                <CheckCircle2 size={10} /> Completed
              </span>
            );
          } else if (isPartial) {
            borderClass = 'border-amber-500/40 bg-amber-500/5';
            statusBadge = (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                Partial
              </span>
            );
          } else if (isRecovery) {
            borderClass = 'border-sky-500/30 bg-sky-500/5';
            statusBadge = (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-medium">
                Recovery
              </span>
            );
          }

          if (isToday) {
            borderClass = 'border-2 border-[#a3e635] shadow-[0_0_20px_rgba(163,230,53,0.25)] bg-[#191d24]';
          }

          return (
            <div
              key={day.dayNumber}
              onClick={() => handleDayClick(day)}
              className={`p-4 rounded-2xl bg-[#16191f] border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:translate-y-[-2px] ${borderClass}`}
            >
              <div>
                {/* Header: Day number & Date */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black tracking-wider text-white/80">
                    DAY {String(day.dayNumber).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {formatDatePretty(calendarDate)}
                  </span>
                </div>

                {/* Workout Type Title */}
                <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 mb-1">
                  {day.title}
                </h4>

                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                  {day.description}
                </p>
              </div>

              {/* Footer status & exercise count */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                  {day.isAssessment ? (
                    <span className="text-amber-400 flex items-center gap-1 font-semibold">
                      <Award size={12} /> Test
                    </span>
                  ) : isRecovery ? (
                    <span className="text-sky-400">Rest</span>
                  ) : (
                    <span>{day.mainExercises.length} Exercises</span>
                  )}
                </div>

                {statusBadge}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Inspection Modal */}
      {inspectDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#16191f] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setInspectDay(null)}
              className="absolute top-5 right-5 text-white/50 hover:text-white p-1.5 rounded-xl bg-white/5"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 mb-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 text-xs font-bold uppercase tracking-wider">
                  Phase 0{inspectDay.phase} • Day {String(inspectDay.dayNumber).padStart(2, '0')}
                </span>
                <span className="text-xs text-white/50">
                  {formatDatePretty(getDateForDay(settings.challengeStartDate, inspectDay.dayNumber))}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {inspectDay.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/60">
                {inspectDay.description}
              </p>
            </div>

            {/* Exercise Preview Animation (if an exercise is selected for demo) */}
            {demoExerciseId && EXERCISES[demoExerciseId] && (
              <div className="mb-6 p-4 rounded-2xl bg-[#0d0f12] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a3e635]" />
                    {EXERCISES[demoExerciseId].name} Demonstration
                  </h4>
                  <button
                    onClick={() => setDemoExerciseId(null)}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Close Demo
                  </button>
                </div>
                <ExerciseAnimator exercise={EXERCISES[demoExerciseId]} />
              </div>
            )}

            {/* Exercise List */}
            {!inspectDay.isRecovery ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  Programmed Exercises ({inspectDay.mainExercises.length})
                </h4>
                <div className="space-y-2">
                  {inspectDay.mainExercises.map((sched, idx) => {
                    const ex = EXERCISES[sched.exerciseId];
                    if (!ex) return null;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/[0.08] transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-white/5 text-white/40 text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                              <span>{ex.name}</span>
                              {sched.alternativeExerciseId && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                  Has Zero-Equipment Alt
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/50 mt-0.5">
                              {sched.sets} sets × {sched.repsOrDuration} {sched.unit} • {sched.restDuration}s rest
                              {sched.targetNote && ` (${sched.targetNote})`}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setDemoExerciseId(demoExerciseId === ex.id ? null : ex.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#a3e635]/20 text-[#a3e635] text-xs font-semibold transition"
                        >
                          {demoExerciseId === ex.id ? 'Hide' : 'Demo'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center space-y-2">
                <span className="text-2xl">💤</span>
                <h4 className="text-base font-bold text-white">Scheduled Active Recovery Day</h4>
                <p className="text-xs text-white/70 max-w-md mx-auto">
                  Take a 20-minute gentle outdoor walk and perform gentle stretches. Recovery is where your muscles rebuild stronger.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-7 pt-4 border-t border-white/5 flex items-center justify-end gap-3">
              <button
                onClick={() => setInspectDay(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-white/80 hover:text-white text-xs font-semibold"
              >
                Close
              </button>

              {!inspectDay.isRecovery && (
                <button
                  onClick={() => handleStartWorkoutFromModal(inspectDay.dayNumber)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-bold transition shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Start Day {inspectDay.dayNumber} Workout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
