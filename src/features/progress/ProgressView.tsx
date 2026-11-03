import React, { useState } from 'react';
import {
  TrendingUp,
  Flame,
  Edit2,
  X,
  Save,
  ChevronRight
} from 'lucide-react';
import type { WorkoutSession, UserSettings } from '../../types';
import { WORKOUT_DAYS, formatDatePretty, getDateForDay } from '../../data/program';
import { SvgBarChart } from '../../components/charts/SvgBarChart';
import { SvgLineChart } from '../../components/charts/SvgLineChart';
import { ConsistencyHeatmap } from '../../components/charts/ConsistencyHeatmap';
import { db } from '../../services/db';

interface ProgressViewProps {
  sessions: WorkoutSession[];
  settings: UserSettings;
  currentDay: number;
  onRefreshSessions: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  sessions,
  settings,
  currentDay,
  onRefreshSessions
}) => {
  const [inspectSession, setInspectSession] = useState<WorkoutSession | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);

  // Compute aggregate statistics
  const completedEveningSessions = sessions.filter(s => s.isCompleted && s.sessionType === 'evening');
  const completedDayNumbers = new Set(completedEveningSessions.map(s => s.dayNumber));
  const totalCompletedDays = completedDayNumbers.size;
  const totalCompletedSessions = sessions.filter(s => s.isCompleted).length;

  let totalCompletedSets = 0;
  let totalRepsCompleted = 0;
  let totalTimeSeconds = 0;

  sessions.forEach(s => {
    totalTimeSeconds += s.totalDurationSeconds || 0;
    s.exercises?.forEach(ex => {
      ex.sets?.forEach(set => {
        if (set.completed) {
          totalCompletedSets++;
          totalRepsCompleted += set.actual || 0;
        }
      });
    });
  });

  // Calculate phase completions
  const phase1Days = WORKOUT_DAYS.filter(d => d.phase === 1 && !d.isRecovery).map(d => d.dayNumber);
  const phase2Days = WORKOUT_DAYS.filter(d => d.phase === 2 && !d.isRecovery).map(d => d.dayNumber);
  const phase3Days = WORKOUT_DAYS.filter(d => d.phase === 3 && !d.isRecovery).map(d => d.dayNumber);

  const phase1Done = phase1Days.filter(d => completedDayNumbers.has(d)).length;
  const phase2Done = phase2Days.filter(d => completedDayNumbers.has(d)).length;
  const phase3Done = phase3Days.filter(d => completedDayNumbers.has(d)).length;

  const trainingDaysCount = WORKOUT_DAYS.filter(d => !d.isRecovery).length;
  const overallPercentage = Math.round((totalCompletedDays / trainingDaysCount) * 100);

  // Compute streaks
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
      continue;
    } else if (d < currentDay) {
      tempStreak = 0;
      currentStreak = 0;
    }
  }

  // Chart Data: Reps per session
  const repsPerSessionData = sessions
    .filter(s => s.sessionType === 'evening')
    .slice(-10)
    .map(s => {
      let reps = 0;
      s.exercises?.forEach(e => e.sets?.forEach(st => { if (st.completed) reps += st.actual; }));
      return {
        label: `Day ${s.dayNumber}`,
        value: reps
      };
    });

  // Chart Data: Workout Duration History (minutes)
  const durationData = sessions
    .filter(s => s.sessionType === 'evening')
    .slice(-10)
    .map(s => ({
      label: `D${s.dayNumber}`,
      value: Math.round(s.totalDurationSeconds / 60)
    }));

  // Handle Session Update (Correction)
  const handleSaveSessionEdit = async () => {
    if (!editingSession || !editingSession.id) return;
    try {
      await db.sessions.put(editingSession);
      setInspectSession(editingSession);
      setEditingSession(null);
      onRefreshSessions();
    } catch (err) {
      console.error('Failed to update workout record:', err);
    }
  };

  const formatHoursMinutes = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 lg:pb-12 animate-fadeIn select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp size={26} className="text-[#a3e635]" />
            <span>PROGRESS & ANALYTICS</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Program start: {formatDatePretty(getDateForDay(settings.challengeStartDate, 1))} • Day {currentDay} of 30.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {overallPercentage}% Challenge Completed
        </div>
      </div>

      {/* Main Aggregates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5">
          <span className="text-[11px] font-semibold text-white/50 uppercase">Days Completed</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {totalCompletedDays} <span className="text-xs font-normal text-white/40">/ {trainingDaysCount}</span>
          </div>
          <span className="text-[10px] text-[#a3e635] font-semibold mt-0.5 block">{overallPercentage}% Program Complete</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5">
          <span className="text-[11px] font-semibold text-white/50 uppercase">Total Repetitions</span>
          <div className="text-2xl sm:text-3xl font-black text-[#a3e635] mt-1">
            {totalRepsCompleted.toLocaleString()}
          </div>
          <span className="text-[10px] text-white/40 mt-0.5 block">{totalCompletedSets} sets performed</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5">
          <span className="text-[11px] font-semibold text-white/50 uppercase">Training Time</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatHoursMinutes(totalTimeSeconds)}
          </div>
          <span className="text-[10px] text-white/40 mt-0.5 block">{totalCompletedSessions} sessions recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5">
          <span className="text-[11px] font-semibold text-white/50 uppercase">Discipline Streak</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
            <Flame size={22} className={currentStreak > 0 ? 'text-amber-400' : 'text-white/20'} />
            <span>{currentStreak}</span>
            <span className="text-xs font-normal text-white/40">days</span>
          </div>
          <span className="text-[10px] text-white/40 mt-0.5 block">Personal Best: {bestStreak} days</span>
        </div>
      </div>

      {/* Phase Completion Progress */}
      <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Phase Progression</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Phase 1 */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white">Phase 1 — Foundation</span>
              <span className="text-[#a3e635]">{Math.round((phase1Done / phase1Days.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#a3e635] rounded-full transition-all duration-500"
                style={{ width: `${(phase1Done / phase1Days.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-white/50 block">{phase1Done} of {phase1Days.length} workouts</span>
          </div>

          {/* Phase 2 */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white">Phase 2 — Strength</span>
              <span className="text-[#a3e635]">{Math.round((phase2Done / phase2Days.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#a3e635] rounded-full transition-all duration-500"
                style={{ width: `${(phase2Done / phase2Days.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-white/50 block">{phase2Done} of {phase2Days.length} workouts</span>
          </div>

          {/* Phase 3 */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white">Phase 3 — Advanced</span>
              <span className="text-[#a3e635]">{Math.round((phase3Done / phase3Days.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#a3e635] rounded-full transition-all duration-500"
                style={{ width: `${(phase3Done / phase3Days.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-white/50 block">{phase3Done} of {phase3Days.length} workouts</span>
          </div>
        </div>
      </div>

      {/* 30-Day Training Consistency Heatmap */}
      <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">30-Day Training Consistency</h3>
        <ConsistencyHeatmap
          completedSessions={sessions}
          currentChallengeDay={currentDay}
        />
      </div>

      {/* Native SVG Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Repetitions per Workout */}
        <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Total Repetitions Over Time</h4>
            <span className="text-xs text-white/40">Recent Sessions</span>
          </div>
          <SvgBarChart
            data={repsPerSessionData}
            unit="reps"
            highlightColor="#a3e635"
            emptyMessage="No workout sessions completed yet to display repetition volume."
          />
        </div>

        {/* Workout Duration Trend */}
        <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Workout Duration History (Minutes)</h4>
            <span className="text-xs text-white/40">Session Length</span>
          </div>
          <SvgLineChart
            data={durationData}
            unit="mins"
            lineColor="#38bdf8"
            emptyMessage="Complete workouts to graph your active training duration."
          />
        </div>
      </div>

      {/* Workout History List */}
      <div className="p-5 rounded-2xl bg-[#16191f] border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Workout History ({sessions.length} Recorded Sessions)
        </h3>

        {sessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/40 border border-white/5 rounded-xl">
            No completed workouts yet. Start Day 1 to record your first workout session!
          </div>
        ) : (
          <div className="space-y-2">
            {[...sessions].reverse().map(session => {
              const day = WORKOUT_DAYS.find(d => d.dayNumber === session.dayNumber);

              let repsInSession = 0;
              let setsInSession = 0;
              session.exercises?.forEach(e => e.sets?.forEach(s => {
                if (s.completed) {
                  setsInSession++;
                  repsInSession += s.actual;
                }
              }));

              return (
                <div
                  key={session.id}
                  onClick={() => setInspectSession(session)}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#a3e635]/10 text-[#a3e635] flex items-center justify-center font-bold text-xs">
                      D{session.dayNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#a3e635] transition">
                        {day ? day.title : `Day ${session.dayNumber}`}
                      </h4>
                      <p className="text-[11px] text-white/50">
                        {session.dateCompleted} • {Math.round(session.totalDurationSeconds / 60)} mins • {setsInSession} sets • {repsInSession} reps
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] font-semibold">
                      {session.isCompleted ? 'Complete' : 'Partial'}
                    </span>
                    <ChevronRight size={16} className="text-white/40 group-hover:text-white transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SESSION INSPECT & EDIT MODAL */}
      {/* ======================================================== */}
      {inspectSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#16191f] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 relative">
            <button
              onClick={() => { setInspectSession(null); setEditingSession(null); }}
              className="absolute top-5 right-5 text-white/50 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-xs font-bold text-[#a3e635] uppercase tracking-wider">
                Workout Session Details
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Day {inspectSession.dayNumber} Record
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Completed on {inspectSession.dateCompleted} • Duration: {Math.round(inspectSession.totalDurationSeconds / 60)} minutes
              </p>
            </div>

            {/* Exercises and sets in session */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Completed Sets</h4>
                {!editingSession && (
                  <button
                    onClick={() => setEditingSession(JSON.parse(JSON.stringify(inspectSession)))}
                    className="flex items-center gap-1.5 text-xs text-[#a3e635] hover:underline font-semibold"
                  >
                    <Edit2 size={13} /> Edit Recorded Sets
                  </button>
                )}
              </div>

              {/* Read / Edit view */}
              <div className="space-y-3">
                {(editingSession || inspectSession).exercises?.map((exRecord, exIdx) => (
                  <div key={exIdx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <h5 className="text-xs font-bold text-white">{exRecord.exerciseName}</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {exRecord.sets?.map((set, setIdx) => (
                        <div key={setIdx} className="p-2 rounded-lg bg-black/30 border border-white/5 text-xs">
                          <span className="text-[10px] text-white/40 block">Set {set.setNumber}</span>
                          {editingSession ? (
                            <input
                              type="number"
                              value={set.actual}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setEditingSession(prev => {
                                  if (!prev) return null;
                                  const updated = { ...prev };
                                  updated.exercises[exIdx].sets[setIdx].actual = val;
                                  return updated;
                                });
                              }}
                              className="w-16 bg-white/10 rounded px-1.5 py-0.5 text-xs text-white mt-1"
                            />
                          ) : (
                            <span className="font-bold text-white">{set.actual} reps</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
              {editingSession ? (
                <>
                  <button
                    onClick={() => setEditingSession(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSessionEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#a3e635] text-black font-bold text-xs"
                  >
                    <Save size={13} /> Save Corrections
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setInspectSession(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
