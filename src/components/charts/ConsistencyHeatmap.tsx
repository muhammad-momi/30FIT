import React from 'react';
import type { WorkoutSession } from '../../types';
import { WORKOUT_DAYS } from '../../data/program';

interface ConsistencyHeatmapProps {
  completedSessions: WorkoutSession[];
  currentChallengeDay: number;
  onSelectDay?: (dayNumber: number) => void;
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  completedSessions,
  currentChallengeDay,
  onSelectDay
}) => {
  const completedDayNumbers = new Set(
    completedSessions.filter(s => s.isCompleted && s.sessionType === 'evening').map(s => s.dayNumber)
  );
  const partialDayNumbers = new Set(
    completedSessions.filter(s => !s.isCompleted && s.sessionType === 'evening').map(s => s.dayNumber)
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
        {WORKOUT_DAYS.map((day) => {
          const isToday = day.dayNumber === currentChallengeDay;
          const isCompleted = completedDayNumbers.has(day.dayNumber);
          const isPartial = partialDayNumbers.has(day.dayNumber) && !isCompleted;
          const isRecovery = day.isRecovery;

          let bgClass = 'bg-white/5 text-white/50 border-white/10';
          if (isCompleted) {
            bgClass = 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/50 font-bold';
          } else if (isPartial) {
            bgClass = 'bg-amber-500/20 text-amber-400 border-amber-500/50';
          } else if (isRecovery) {
            bgClass = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
          }

          if (isToday) {
            bgClass += ' ring-2 ring-[#a3e635] shadow-[0_0_12px_rgba(163,230,53,0.35)]';
          }

          return (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay && onSelectDay(day.dayNumber)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition hover:scale-105 active:scale-95 ${bgClass}`}
              title={`Day ${day.dayNumber}: ${day.title}`}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-60">D{day.dayNumber}</span>
              <span className="text-xs font-semibold mt-0.5">
                {isCompleted ? '✓' : isRecovery ? 'Zz' : isToday ? 'NOW' : `P${day.phase}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-[11px] text-white/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#22c55e]/40 border border-[#22c55e]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-sky-500/30 border border-sky-400" />
          <span>Recovery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded border-2 border-[#a3e635]" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/20" />
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
};
