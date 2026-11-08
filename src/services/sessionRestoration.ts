import type { WorkoutTimelineItem, SavedWorkoutState, Exercise } from '../types';
import { EXERCISES } from '../data/exercises';
import { WORKOUT_DAYS } from '../data/program';

export interface NormalizedSavedSession {
  dayNumber: number;
  timelineIndex: number;
  state: 'EXERCISING' | 'RESTING';
  remainingSeconds: number;
  restRemainingSeconds: number;
  totalSeconds: number;
  activeSeconds: number;
  restSeconds: number;
  completedTimelineIndices: number[];
  lastSavedAt: number;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  isValid: boolean;
}

/**
 * Safe exercise lookup that never throws or returns undefined.
 */
export function getSafeExercise(exerciseId: string | undefined): Exercise {
  if (exerciseId && EXERCISES[exerciseId]) {
    return EXERCISES[exerciseId];
  }

  // Fallback safe exercise
  return {
    id: exerciseId || 'push-ups',
    name: exerciseId ? exerciseId.replace(/-/g, ' ').toUpperCase() : 'Push-ups',
    category: 'Full Body',
    primaryMuscles: ['Chest', 'Core'],
    supportingMuscles: ['Arms'],
    difficulty: 'Beginner',
    isTimed: false,
    defaultSets: 3,
    defaultRepsOrDuration: 10,
    unit: 'reps',
    restRecommendation: 60,
    instructions: {
      startingPosition: 'Position your body with core tight and back straight.',
      movement: 'Execute controlled movement with good form.',
      breathing: 'Inhale on the eccentric phase; exhale on exertion.',
      commonMistakes: ['Rushing the movement', 'Losing core alignment']
    }
  };
}

/**
 * Normalizes, migrates, and validates any saved workout session object
 * (whether modern SavedWorkoutState or legacy ActiveWorkoutState or partial).
 *
 * Guarantees that timelineIndex is a valid integer within [0, timeline.length - 1],
 * remaining timers are positive numbers, and the exercise exists.
 */
export function normalizeSavedSession(
  rawState: unknown,
  timeline: WorkoutTimelineItem[],
  expectedDayNumber: number
): NormalizedSavedSession | null {
  if (!rawState || typeof rawState !== 'object') {
    return null;
  }

  const raw = rawState as Record<string, any>;
  const dayNum = Number(raw.dayNumber) || expectedDayNumber;

  if (timeline.length === 0) {
    return null;
  }

  // 1. Identify timelineIndex
  let resolvedTimelineIndex: number | null = null;

  // Case A: Modern SavedWorkoutState has timelineIndex
  if (typeof raw.timelineIndex === 'number' && !isNaN(raw.timelineIndex)) {
    resolvedTimelineIndex = Math.max(0, Math.min(timeline.length - 1, Math.floor(raw.timelineIndex)));
  }

  // Case B: Legacy ActiveWorkoutState (currentPhase, currentExerciseIndex, currentSetIndex)
  if (resolvedTimelineIndex === null && (raw.currentPhase !== undefined || raw.currentExerciseIndex !== undefined)) {
    const phase = raw.currentPhase || 'warmup';
    const exIdx = Number(raw.currentExerciseIndex) || 0;
    const setIdx = Number(raw.currentSetIndex) || 0;

    const workoutDay = WORKOUT_DAYS.find(d => d.dayNumber === dayNum) || WORKOUT_DAYS[0];
    const exerciseList = phase === 'warmup'
      ? workoutDay.warmupExercises
      : phase === 'cooldown'
      ? workoutDay.cooldownExercises
      : workoutDay.mainExercises;

    const targetSched = exerciseList[exIdx];
    if (targetSched) {
      // Find matching item in the pre-built timeline
      const foundIdx = timeline.findIndex(
        item => item.phase === phase && item.exerciseId === targetSched.exerciseId && item.setNumber === (setIdx + 1)
      );
      if (foundIdx !== -1) {
        resolvedTimelineIndex = foundIdx;
      }
    }
  }

  // Case C: Fallback to first uncompleted or first item
  const completedIndices: number[] = Array.isArray(raw.completedTimelineIndices)
    ? raw.completedTimelineIndices.filter((n: any) => typeof n === 'number' && n >= 0 && n < timeline.length)
    : [];

  if (resolvedTimelineIndex === null) {
    const completedSet = new Set(completedIndices);
    const firstUncompleted = timeline.findIndex((_, idx) => !completedSet.has(idx));
    resolvedTimelineIndex = firstUncompleted !== -1 ? firstUncompleted : 0;
  }

  // Clamp index safely
  resolvedTimelineIndex = Math.max(0, Math.min(timeline.length - 1, resolvedTimelineIndex));
  const currentItem = timeline[resolvedTimelineIndex];

  // 2. Resolve Active State (EXERCISING vs RESTING)
  let resolvedState: 'EXERCISING' | 'RESTING' = 'EXERCISING';
  if (raw.state === 'RESTING') {
    resolvedState = 'RESTING';
  } else if (raw.restTimer && raw.restTimer.active === true) {
    resolvedState = 'RESTING';
  } else if (raw.isResting === true) {
    resolvedState = 'RESTING';
  }

  // 3. Resolve Timers
  let remainingSeconds = Number(raw.remainingSeconds);
  if (isNaN(remainingSeconds) || remainingSeconds <= 0) {
    if (raw.exerciseTimer && typeof raw.exerciseTimer.remaining === 'number' && raw.exerciseTimer.remaining > 0) {
      remainingSeconds = raw.exerciseTimer.remaining;
    } else {
      remainingSeconds = currentItem.duration;
    }
  }

  let restRemainingSeconds = Number(raw.restRemainingSeconds);
  if (isNaN(restRemainingSeconds) || restRemainingSeconds <= 0) {
    if (raw.restTimer && typeof raw.restTimer.remaining === 'number' && raw.restTimer.remaining > 0) {
      restRemainingSeconds = raw.restTimer.remaining;
    } else {
      restRemainingSeconds = currentItem.restDuration;
    }
  }

  // 4. Resolve Durations
  const totalSeconds = Number(raw.totalSeconds) || (Number(raw.elapsedActiveSeconds || 0) + Number(raw.elapsedRestSeconds || 0));
  const activeSeconds = Number(raw.activeSeconds) || Number(raw.elapsedActiveSeconds || 0);
  const restSeconds = Number(raw.restSeconds) || Number(raw.elapsedRestSeconds || 0);
  const lastSavedAt = Number(raw.lastSavedAt) || Number(raw.lastTickTimestamp || Date.now());

  return {
    dayNumber: dayNum,
    timelineIndex: resolvedTimelineIndex,
    state: resolvedState,
    remainingSeconds: Math.max(1, remainingSeconds),
    restRemainingSeconds: Math.max(1, restRemainingSeconds),
    totalSeconds: Math.max(0, totalSeconds),
    activeSeconds: Math.max(0, activeSeconds),
    restSeconds: Math.max(0, restSeconds),
    completedTimelineIndices: completedIndices,
    lastSavedAt,
    exerciseName: currentItem.exerciseName,
    setNumber: currentItem.setNumber,
    totalSets: currentItem.totalSets,
    isValid: true
  };
}
