import { describe, it, expect } from 'vitest';
import {
  calculateExerciseDuration,
  buildWorkoutTimeline
} from '../services/workoutEngine';
import { WORKOUT_DAYS } from '../data/program';
import type { ScheduledExercise } from '../types';

describe('Workout Engine: Duration & Timeline Calculations', () => {
  it('correctly calculates duration for 10 push-ups (30 seconds)', () => {
    const sched: ScheduledExercise = {
      exerciseId: 'push-ups',
      sets: 3,
      repsOrDuration: 10,
      unit: 'reps',
      restDuration: 60
    };
    expect(calculateExerciseDuration(sched)).toBe(30);
  });

  it('correctly calculates duration for 15 squats (45 seconds)', () => {
    const sched: ScheduledExercise = {
      exerciseId: 'squats',
      sets: 3,
      repsOrDuration: 15,
      unit: 'reps',
      restDuration: 60
    };
    expect(calculateExerciseDuration(sched)).toBe(45);
  });

  it('correctly calculates duration for 20 jumping jacks (40 seconds)', () => {
    const sched: ScheduledExercise = {
      exerciseId: 'jumping-jacks',
      sets: 3,
      repsOrDuration: 20,
      unit: 'reps',
      restDuration: 45
    };
    expect(calculateExerciseDuration(sched)).toBe(40);
  });

  it('correctly calculates duration for 10 lunges per leg (60 seconds)', () => {
    const sched: ScheduledExercise = {
      exerciseId: 'reverse-lunges',
      sets: 2,
      repsOrDuration: 10,
      unit: 'reps',
      restDuration: 60,
      targetNote: '10 each leg'
    };
    expect(calculateExerciseDuration(sched)).toBe(60);
  });

  it('correctly calculates duration for 8 pike push-ups (30 seconds)', () => {
    const sched: ScheduledExercise = {
      exerciseId: 'pike-push-ups',
      sets: 2,
      repsOrDuration: 8,
      unit: 'reps',
      restDuration: 60
    };
    expect(calculateExerciseDuration(sched)).toBe(30);
  });

  it('preserves exact programmed duration for plank (30-second hold)', () => {
    const sched: ScheduledExercise = {
      exerciseId: 'plank',
      sets: 3,
      repsOrDuration: 30,
      unit: 'seconds',
      restDuration: 60
    };
    expect(calculateExerciseDuration(sched)).toBe(30);
  });

  it('enforces a minimum sensible duration of 15 seconds for rep exercises', () => {
    const sched: ScheduledExercise = {
      exerciseId: 'squats',
      sets: 1,
      repsOrDuration: 2, // 2 * 3 = 6s, below 15s min
      unit: 'reps',
      restDuration: 60
    };
    expect(calculateExerciseDuration(sched)).toBe(15);
  });

  it('builds a continuous automated timeline for Day 1 with correct sequence and no rest on last cooldown item', () => {
    const day1 = WORKOUT_DAYS.find(d => d.dayNumber === 1)!;
    const timeline = buildWorkoutTimeline(day1, 60);

    expect(timeline.length).toBeGreaterThan(15);

    // First item is warmup
    expect(timeline[0].phase).toBe('warmup');
    expect(timeline[0].exerciseId).toBe('arm-circles');
    expect(timeline[0].duration).toBe(30);
    expect(timeline[0].restDuration).toBe(10);

    // Warmup -> Main transition
    const mainItems = timeline.filter(t => t.phase === 'main');
    expect(mainItems.length).toBeGreaterThan(0);
    expect(mainItems[0].exerciseId).toBe('push-ups');
    expect(mainItems[0].setNumber).toBe(1);
    expect(mainItems[0].totalSets).toBe(3);

    // Last item is cooldown and has 0 rest duration
    const lastItem = timeline[timeline.length - 1];
    expect(lastItem.phase).toBe('cooldown');
    expect(lastItem.restDuration).toBe(0);
    expect(lastItem.nextPreview?.name).toBe('Workout Complete');
  });
});
