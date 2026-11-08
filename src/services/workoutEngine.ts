import type { ScheduledExercise, WorkoutDay, WorkoutTimelineItem } from '../types';
import { EXERCISES } from '../data/exercises';

// Pacing estimates (seconds per repetition)
export const DEFAULT_EXERCISE_PACING: Record<string, number> = {
  'push-ups': 3,
  'wide-push-ups': 3,
  'diamond-push-ups': 4,
  'decline-push-ups': 4,
  'archer-push-ups': 6,
  'pike-push-ups': 3.75, // 8 reps = 30 seconds
  'squats': 3,
  'reverse-lunges': 3, // per rep per leg
  'lunges': 3, // per rep per leg
  'bulgarian-split-squats': 4, // per rep per leg
  'floor-split-squats': 3, // per rep per leg
  'jumping-jacks': 2,
  'mountain-climbers': 1.5,
  'leg-raises': 4,
  'glute-bridges': 3,
  'calf-raises': 2,
  'bicycle-crunches': 2,
  'dead-bugs': 3,
  'bird-dogs': 3,
  'superman-raises': 3,
  'reverse-snow-angels': 3,
  'towel-rows': 3,
  'prone-w-raises': 3
};

export const MINIMUM_REP_EXERCISE_DURATION = 15; // 15 seconds minimum for any rep set

/**
 * Calculates the exercise countdown duration in seconds.
 * For timed exercises, returns the prescribed hold duration.
 * For repetition-based exercises, returns target reps * pacing estimate.
 */
export function calculateExerciseDuration(
  sched: ScheduledExercise,
  repPaceMultiplier: number = 1.0
): number {
  const ex = EXERCISES[sched.exerciseId];
  const isTimed = sched.unit === 'seconds' || (ex && ex.isTimed);

  if (isTimed) {
    return sched.repsOrDuration;
  }

  const basePace = DEFAULT_EXERCISE_PACING[sched.exerciseId] ?? 3;
  const pace = basePace * repPaceMultiplier;

  // Check if exercise target is "each leg" or "each side"
  const note = sched.targetNote?.toLowerCase() || '';
  const isPerSide = note.includes('each leg') || note.includes('each side') || note.includes('per leg');

  const totalReps = isPerSide ? sched.repsOrDuration * 2 : sched.repsOrDuration;
  const calculatedDuration = Math.round(totalReps * pace);

  return Math.max(MINIMUM_REP_EXERCISE_DURATION, calculatedDuration);
}

/**
 * Builds the complete, continuous hands-free workout timeline from a WorkoutDay.
 * Sequentially queues:
 *   Warm-up sets -> Rest -> Main workout sets -> Rest -> Cooldown sets
 */
export function buildWorkoutTimeline(
  workoutDay: WorkoutDay,
  defaultRestDuration: number = 60,
  repPaceMultiplier: number = 1.0
): WorkoutTimelineItem[] {
  const items: WorkoutTimelineItem[] = [];

  const phases: { phase: 'warmup' | 'main' | 'cooldown'; list: ScheduledExercise[] }[] = [
    { phase: 'warmup', list: workoutDay.warmupExercises },
    { phase: 'main', list: workoutDay.mainExercises },
    { phase: 'cooldown', list: workoutDay.cooldownExercises }
  ];

  phases.forEach(({ phase, list }) => {
    list.forEach((sched) => {
      const ex = EXERCISES[sched.exerciseId];
      const exerciseName = ex ? ex.name : sched.exerciseId;
      const duration = calculateExerciseDuration(sched, repPaceMultiplier);

      // Default rest duration per phase
      let rest = sched.restDuration;
      if (rest === undefined) {
        if (phase === 'warmup') rest = 10;
        else if (phase === 'cooldown') rest = 10;
        else rest = defaultRestDuration;
      }

      for (let s = 1; s <= sched.sets; s++) {
        items.push({
          id: `${phase}-${sched.exerciseId}-set-${s}`,
          exerciseId: sched.exerciseId,
          exerciseName,
          setNumber: s,
          totalSets: sched.sets,
          target: sched.repsOrDuration,
          unit: sched.unit,
          duration,
          phase,
          restDuration: rest,
          targetNote: sched.targetNote,
          nextPreview: null // Populated below
        });
      }
    });
  });

  // Zero rest for the very last exercise in the entire workout
  if (items.length > 0) {
    items[items.length - 1].restDuration = 0;
  }

  // Populate next previews for each item
  for (let i = 0; i < items.length; i++) {
    const nextItem = items[i + 1];
    if (nextItem) {
      const unitLabel = nextItem.unit === 'reps' ? 'reps' : 'sec hold';
      items[i].nextPreview = {
        name: nextItem.exerciseName,
        detail: `Set ${nextItem.setNumber} of ${nextItem.totalSets} • ${nextItem.target} ${unitLabel}`
      };
    } else {
      items[i].nextPreview = {
        name: 'Workout Complete',
        detail: 'Final Cooldown Finished'
      };
    }
  }

  return items;
}

