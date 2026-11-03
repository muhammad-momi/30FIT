import React, { useState, useEffect } from 'react';
import {
  Award,
  Save
} from 'lucide-react';
import type { AssessmentRecord, UserSettings } from '../../types';
import { ASSESSMENT_FIELDS, ASSESSMENT_DAYS } from '../../data/assessments';
import { SvgBarChart } from '../../components/charts/SvgBarChart';
import { db } from '../../services/db';

interface AssessmentsViewProps {
  currentDay: number;
  settings: UserSettings;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ currentDay }) => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<1 | 10 | 20 | 30>(1);

  // Form Inputs for active test day
  const [formData, setFormData] = useState({
    pushupsMax: 0,
    squatsOneMin: 0,
    plankMaxSeconds: 0,
    legRaisesMax: 0,
    jumpingJacksOneMin: 0,
    notes: ''
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load assessments from Dexie
  const loadAssessments = async () => {
    try {
      const records = await db.assessments.toArray();
      setAssessments(records);
    } catch (err) {
      console.error('Failed to load assessment records:', err);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  // Sync form inputs when switching selectedDayNumber
  useEffect(() => {
    const existing = assessments.find(a => a.dayNumber === selectedDayNumber);
    if (existing) {
      setFormData({
        pushupsMax: existing.pushupsMax || 0,
        squatsOneMin: existing.squatsOneMin || 0,
        plankMaxSeconds: existing.plankMaxSeconds || 0,
        legRaisesMax: existing.legRaisesMax || 0,
        jumpingJacksOneMin: existing.jumpingJacksOneMin || 0,
        notes: existing.notes || ''
      });
    } else {
      setFormData({
        pushupsMax: 0,
        squatsOneMin: 0,
        plankMaxSeconds: 0,
        legRaisesMax: 0,
        jumpingJacksOneMin: 0,
        notes: ''
      });
    }
    setSavedSuccess(false);
  }, [selectedDayNumber, assessments]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date().toISOString().split('T')[0];
      const existing = assessments.find(a => a.dayNumber === selectedDayNumber);

      const record: AssessmentRecord = {
        id: existing?.id,
        dayNumber: selectedDayNumber,
        date: now,
        ...formData
      };

      if (existing?.id) {
        await db.assessments.put(record);
      } else {
        await db.assessments.add(record);
      }

      setSavedSuccess(true);
      await loadAssessments();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save assessment record:', err);
    }
  };

  // Assessment lookup helpers
  const getRecord = (day: 1 | 10 | 20 | 30) => assessments.find(a => a.dayNumber === day);
  const baseline = getRecord(1);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 lg:pb-12 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Award size={26} className="text-[#a3e635]" />
            <span>FITNESS ASSESSMENTS</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Day {currentDay} of 30 • Benchmark strength, endurance, and core capacity across 4 phases.
          </p>
        </div>

        <div className="text-xs font-semibold text-white/60 bg-[#16191f] border border-white/5 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {assessments.length} of 4 Milestones Recorded
        </div>
      </div>

      {/* Milestone Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ASSESSMENT_DAYS.map(day => {
          const record = getRecord(day.dayNumber);
          const isSelected = selectedDayNumber === day.dayNumber;
          const isDone = !!record;

          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#a3e635] text-black border-[#a3e635] font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                  : isDone
                  ? 'bg-[#22c55e]/10 text-white border-[#22c55e]/30 hover:bg-[#22c55e]/15'
                  : 'bg-[#16191f] text-white/60 border-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-black' : 'text-white/40'}`}>
                  Milestone
                </span>
                {isDone && (
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-black' : 'text-[#22c55e]'}`}>
                    ✓ Saved
                  </span>
                )}
              </div>
              <div className="text-sm font-black mt-1">
                Day {String(day.dayNumber).padStart(2, '0')}
              </div>
              <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-black/80' : 'text-white/50'}`}>
                {day.dayNumber === 1 ? 'Baseline' : day.dayNumber === 30 ? 'Final Test' : `Phase ${day.dayNumber / 10}`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Data Entry Form on Left, Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#a3e635] uppercase tracking-wider">
                Milestone Test Form
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/50">Day {selectedDayNumber}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Record Assessment Numbers</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Strict form only. Maintain identical technique across all tests.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5">
            {ASSESSMENT_FIELDS.map(f => (
              <div key={f.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white/90 flex items-center gap-1.5">
                    <span>{f.label}</span>
                    <span className="text-white/40 text-[10px]">({f.measurement})</span>
                  </label>
                  <span className="text-[10px] text-white/40">{f.unit}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData[f.key] || ''}
                  onChange={e =>
                    setFormData({ ...formData, [f.key]: Math.max(0, Number(e.target.value)) })
                  }
                  placeholder="0"
                  className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#a3e635]"
                />
              </div>
            ))}

            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-white/90">Assessment Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="RPE, energy level, or conditions during testing..."
                rows={2}
                className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#a3e635]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#a3e635] text-black font-bold text-xs hover:bg-[#bef264] transition shadow-[0_0_15px_rgba(163,230,53,0.3)] flex items-center justify-center gap-1.5"
            >
              <Save size={15} />
              <span>Save Day {selectedDayNumber} Assessment</span>
            </button>

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-xs text-[#22c55e] text-center font-semibold">
                ✓ Assessment saved locally in IndexedDB!
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Comparative Analysis Matrix & Chart */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Milestone Comparison</h3>
                <p className="text-xs text-white/50">Day 1 vs Day 10 vs Day 20 vs Day 30</p>
              </div>
              <span className="text-xs font-bold text-[#a3e635]">Verified Data</span>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase font-bold">
                    <th className="pb-2">Discipline</th>
                    <th className="pb-2 text-center">Day 1 (Base)</th>
                    <th className="pb-2 text-center">Day 10</th>
                    <th className="pb-2 text-center">Day 20</th>
                    <th className="pb-2 text-center">Day 30 (Final)</th>
                    <th className="pb-2 text-right">Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ASSESSMENT_FIELDS.map(f => {
                    const d1 = getRecord(1)?.[f.key] || 0;
                    const d10 = getRecord(10)?.[f.key] || 0;
                    const d20 = getRecord(20)?.[f.key] || 0;
                    const d30 = getRecord(30)?.[f.key] || 0;

                    // Latest record for comparison
                    const latest = d30 || d20 || d10 || d1;
                    const diff = d1 > 0 ? latest - d1 : 0;
                    const pct = d1 > 0 ? Math.round((diff / d1) * 100) : 0;

                    return (
                      <tr key={f.key} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 font-semibold text-white">{f.label}</td>
                        <td className="py-2.5 text-center text-white/60 font-mono">{d1 > 0 ? d1 : '—'}</td>
                        <td className="py-2.5 text-center text-white/60 font-mono">{d10 > 0 ? d10 : '—'}</td>
                        <td className="py-2.5 text-center text-white/60 font-mono">{d20 > 0 ? d20 : '—'}</td>
                        <td className="py-2.5 text-center text-white font-mono font-bold">{d30 > 0 ? d30 : '—'}</td>
                        <td className="py-2.5 text-right font-bold">
                          {d1 > 0 && latest > d1 ? (
                            <span className="text-[#a3e635]">+{diff} (+{pct}%)</span>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Native SVG Visual Push-ups & Squats Chart */}
          <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-3">
            <h4 className="text-sm font-bold text-white">Push-ups Progression Benchmark</h4>
            <SvgBarChart
              data={[
                { label: 'Day 01', value: getRecord(1)?.pushupsMax || 0 },
                { label: 'Day 10', value: getRecord(10)?.pushupsMax || 0 },
                { label: 'Day 20', value: getRecord(20)?.pushupsMax || 0 },
                { label: 'Day 30', value: getRecord(30)?.pushupsMax || 0, highlight: true }
              ]}
              unit="reps"
              emptyMessage="Record your baseline assessment to graph push-up progression."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
