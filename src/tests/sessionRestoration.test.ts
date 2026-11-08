import { describe, it, expect } from 'vitest';
import { normalizeSavedSession, getSafeExercise } from '../services/sessionRestoration';
import { buildWorkoutTimeline } from '../services/workoutEngine';
import { WORKOUT_DAYS } from '../data/program';

describe('Saved Session Restoration & Backward Compatibility', () => {
  const day1 = WORKOUT_DAYS.find(d => d.dayNumber === 1)!;
  const timeline = buildWorkoutTimeline(day1, 60);

  it('correctly migrates legacy ActiveWorkoutState session with currentPhase & currentExerciseIndex', () => {
    // Legacy session from earlier 30FIT version:
    // User was on main exercises, index 0 (push-ups), set 1 (set 2 of 3)
    const legacySession = {
      dayNumber: 1,
      currentPhase: 'main',
      currentExerciseIndex: 0,
      currentSetIndex: 1,
      isPaused: true,
      exerciseTimer: { remaining: 18, duration: 30 },
      elapsedActiveSeconds: 120,
      elapsedRestSeconds: 60
    };

    const restored = normalizeSavedSession(legacySession, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.isValid).toBe(true);

    // Timeline index must point to push-ups set 2!
    const targetItem = timeline[restored!.timelineIndex];
    expect(targetItem.exerciseId).toBe('push-ups');
    expect(targetItem.setNumber).toBe(2);
    expect(restored!.remainingSeconds).toBe(18);
    expect(restored!.totalSeconds).toBe(180);
    expect(restored!.state).toBe('EXERCISING');
  });

  it('safely recovers when timelineIndex is undefined or NaN', () => {
    const brokenSession = {
      dayNumber: 1,
      timelineIndex: undefined,
      state: 'EXERCISING',
      remainingSeconds: undefined
    };

    const restored = normalizeSavedSession(brokenSession, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.isValid).toBe(true);
    expect(restored!.timelineIndex).toBe(0);
    expect(restored!.remainingSeconds).toBe(timeline[0].duration);
    expect(restored!.state).toBe('EXERCISING');
  });

  it('clamps timelineIndex when out of bounds (e.g. 9999 or -10)', () => {
    const oobSession = {
      dayNumber: 1,
      timelineIndex: 9999,
      remainingSeconds: 20
    };

    const restored = normalizeSavedSession(oobSession, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.timelineIndex).toBe(timeline.length - 1);
  });

  it('correctly restores RESTING state when restTimer was active in saved session', () => {
    const restSession = {
      dayNumber: 1,
      timelineIndex: 4,
      restTimer: { active: true, remaining: 42 },
      state: 'RESTING'
    };

    const restored = normalizeSavedSession(restSession, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.state).toBe('RESTING');
    expect(restored!.restRemainingSeconds).toBe(42);
  });

  it('getSafeExercise provides safe fallback for undefined or missing exercise ID without throwing', () => {
    const safeEx = getSafeExercise('non-existent-exercise-id');
    expect(safeEx).toBeDefined();
    expect(safeEx.name).toBeTruthy();
    expect(safeEx.primaryMuscles).toBeDefined();
    expect(safeEx.instructions).toBeDefined();

    const nullEx = getSafeExercise(undefined);
    expect(nullEx).toBeDefined();
    expect(nullEx.name).toBe('Push-ups');
  });
});

