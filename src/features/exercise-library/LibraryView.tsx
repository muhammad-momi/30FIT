import React, { useState, useMemo } from 'react';
import {
  Search,
  Dumbbell,
  Filter,
  X,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { Exercise } from '../../types';
import { EXERCISES } from '../../data/exercises';
import { ExerciseAnimator } from '../../components/animations/ExerciseAnimator';

interface LibraryViewProps {
  onStartCustomExercise?: (exerciseId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const exerciseList = useMemo(() => Object.values(EXERCISES), []);

  const categories: Array<string> = [
    'All',
    'Upper Body',
    'Lower Body',
    'Core',
    'Cardio',
    'Stretching'
  ];

  const difficulties: Array<string> = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = useMemo(() => {
    return exerciseList.filter(ex => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primaryMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;

      return matchesSearch && matchesCat && matchesDiff;
    });
  }, [exerciseList, searchQuery, selectedCategory, selectedDifficulty]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 lg:pb-12 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Dumbbell size={26} className="text-[#a3e635]" />
            <span>EXERCISE LIBRARY</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Browse 38 human-body animated vector demonstrations with strict biomechanics and form cues.
          </p>
        </div>

        <div className="text-xs font-semibold text-white/60 bg-[#16191f] border border-white/5 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {filteredExercises.length} Movements Available
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#16191f] border border-white/5 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search exercises by name or muscle group (e.g. push-ups, squats, core)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d0f12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#a3e635] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-white/40 mr-1 flex items-center gap-1">
            <Filter size={12} /> Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-[#a3e635] text-black font-bold'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
          <span className="text-[11px] font-semibold text-white/40 mr-1">Difficulty:</span>
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition ${
                selectedDifficulty === diff
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exercises */}
      {filteredExercises.length === 0 ? (
        <div className="py-16 text-center space-y-2 border border-white/5 rounded-2xl bg-white/[0.01]">
          <Dumbbell size={32} className="mx-auto text-white/20" />
          <h4 className="text-base font-bold text-white">No exercises found</h4>
          <p className="text-xs text-white/50">Try broadening your search or resetting category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map(ex => (
            <div
              key={ex.id}
              onClick={() => setActiveExercise(ex)}
              className="p-4 rounded-2xl bg-[#16191f] border border-white/5 hover:border-[#a3e635]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Mini Animated Preview */}
                <div className="rounded-xl overflow-hidden bg-[#0d0f12] border border-white/5 mb-3 pointer-events-none">
                  <ExerciseAnimator
                    exercise={ex}
                    showControls={false}
                    className="w-full h-36"
                    autoPlay={true}
                  />
                </div>

                {/* Details */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#a3e635] transition">
                    {ex.name}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      ex.difficulty === 'Beginner'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : ex.difficulty === 'Intermediate'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {ex.difficulty}
                  </span>
                </div>

                {/* Muscle targets */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {ex.primaryMuscles.map(m => (
                    <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                      {m}
                    </span>
                  ))}
                  {ex.supportingMuscles.slice(0, 2).map(m => (
                    <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.02] text-white/40">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                <span>
                  {ex.defaultSets} × {ex.defaultRepsOrDuration} {ex.unit}
                </span>
                <span className="text-[#a3e635] font-semibold group-hover:underline">Inspect Form →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAILED EXERCISE MODAL */}
      {/* ======================================================== */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#16191f] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto relative space-y-5">
            <button
              onClick={() => setActiveExercise(null)}
              className="absolute top-5 right-5 text-white/50 hover:text-white p-1.5 rounded-xl bg-white/5 z-20"
            >
              <X size={18} />
            </button>

            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 text-xs font-bold uppercase tracking-wider">
                  {activeExercise.category}
                </span>
                <span className="text-xs text-white/50">•</span>
                <span className="text-xs text-white/60 font-semibold">{activeExercise.difficulty}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {activeExercise.name}
              </h3>
            </div>

            {/* Interactive Vector Animation Demonstration */}
            <div className="w-full">
              <ExerciseAnimator
                exercise={activeExercise}
                showControls={true}
                className="w-full min-h-[260px] sm:min-h-[320px]"
              />
            </div>

            {/* Targets and Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center text-xs">
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Recommended Sets</span>
                <div className="text-sm font-black text-white mt-0.5">{activeExercise.defaultSets} Sets</div>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Target Volume</span>
                <div className="text-sm font-black text-[#a3e635] mt-0.5">
                  {activeExercise.defaultRepsOrDuration} {activeExercise.unit}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Rest Period</span>
                <div className="text-sm font-black text-white mt-0.5">{activeExercise.restRecommendation}s</div>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Type</span>
                <div className="text-sm font-black text-white mt-0.5">
                  {activeExercise.isTimed ? 'Timed Hold' : 'Repetitions'}
                </div>
              </div>
            </div>

            {/* Muscle Involvements */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Target Muscles</h4>
              <div className="flex flex-wrap gap-2">
                {activeExercise.primaryMuscles.map(m => (
                  <span
                    key={m}
                    className="text-xs px-2.5 py-1 rounded-xl bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 font-semibold"
                  >
                    Primary: {m}
                  </span>
                ))}
                {activeExercise.supportingMuscles.map(m => (
                  <span
                    key={m}
                    className="text-xs px-2.5 py-1 rounded-xl bg-white/5 text-white/70 border border-white/5"
                  >
                    Supporting: {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Biomechanics Instructions */}
            <div className="space-y-3 text-xs text-white/80">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <h5 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#a3e635]" />
                  1. Starting Position
                </h5>
                <p className="text-white/70 leading-relaxed">
                  {activeExercise.instructions.startingPosition}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <h5 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#a3e635]" />
                  2. Movement Execution
                </h5>
                <p className="text-white/70 leading-relaxed">
                  {activeExercise.instructions.movement}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <h5 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#a3e635]" />
                  3. Breathing Rhythm
                </h5>
                <p className="text-white/70 leading-relaxed">
                  {activeExercise.instructions.breathing}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                <h5 className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  4. Common Mistakes to Avoid
                </h5>
                <ul className="list-disc list-inside space-y-1 text-white/70">
                  {activeExercise.instructions.commonMistakes.map((mistake, idx) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              </div>

              {/* Equipment Alternative Notice */}
              {activeExercise.hasEquipmentAlternative && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <h5 className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                    <Info size={14} />
                    Equipment-Free Variation
                  </h5>
                  <p className="text-white/70 leading-relaxed">
                    {activeExercise.equipmentAlternativeNotice}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveExercise(null)}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
