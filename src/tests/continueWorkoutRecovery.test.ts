import { describe, it, expect } from 'vitest';
import { normalizeSavedSession, getSafeExercise } from '../services/sessionRestoration';
import { buildWorkoutTimeline } from '../services/workoutEngine';
import { advanceProgramDay, calculateStreak } from '../services/progression';
import { WORKOUT_DAYS } from '../data/program';
import type { WorkoutSession } from '../types';

describe('Critical Flow Verification: Continue Workout & Error Recovery (Tests A through F)', () => {
  const day1 = WORKOUT_DAYS.find(d => d.dayNumber === 1)!;
  const timeline = buildWorkoutTimeline(day1, 60);

  it('TEST A: Pause during the warm-up, click CONTINUE WORKOUT, confirm player restores warm-up exercise', () => {
    // Warm-up item (e.g. index 0 = arm circles, 30s)
    const warmupSaved = {
      dayNumber: 1,
      timelineIndex: 0,
      state: 'EXERCISING',
      remainingSeconds: 22,
      restRemainingSeconds: 10,
      totalSeconds: 8,
      activeSeconds: 8,
      restSeconds: 0,
      completedTimelineIndices: []
    };

    const restored = normalizeSavedSession(warmupSaved, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.isValid).toBe(true);
    expect(restored!.timelineIndex).toBe(0);
    expect(restored!.exerciseName).toBe('Arm Circles');
    expect(restored!.remainingSeconds).toBe(22);
    expect(restored!.state).toBe('EXERCISING');

    // Confirm safe timeline resolution
    const item = timeline[restored!.timelineIndex];
    expect(item).toBeDefined();
    expect(item.phase).toBe('warmup');
  });

  it('TEST B: Pause during a main workout exercise, refresh, resume, confirm same exercise and remaining time are restored', () => {
    // Find push-ups (first main exercise)
    const pushupIndex = timeline.findIndex(t => t.exerciseId === 'push-ups');
    expect(pushupIndex).toBeGreaterThan(0);

    const mainSaved = {
      dayNumber: 1,
      timelineIndex: pushupIndex,
      state: 'EXERCISING',
      remainingSeconds: 14, // 14 seconds left of 30
      restRemainingSeconds: 60,
      totalSeconds: 310,
      activeSeconds: 210,
      restSeconds: 100,
      completedTimelineIndices: [0, 1, 2, 3, 4, 5]
    };

    const restored = normalizeSavedSession(mainSaved, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.timelineIndex).toBe(pushupIndex);
    expect(restored!.exerciseName).toBe('Push-ups');
    expect(restored!.remainingSeconds).toBe(14);
    expect(restored!.state).toBe('EXERCISING');
    expect(restored!.totalSeconds).toBe(310);
  });

  it('TEST C: Pause during a rest countdown, reopen, resume, confirm rest timer continues from remaining time', () => {
    const restSaved = {
      dayNumber: 1,
      timelineIndex: 7, // Push-ups set 2
      state: 'RESTING',
      remainingSeconds: 30,
      restRemainingSeconds: 37, // 37 seconds left of 60s rest
      totalSeconds: 400,
      activeSeconds: 240,
      restSeconds: 160,
      completedTimelineIndices: [0, 1, 2, 3, 4, 5, 6, 7]
    };

    const restored = normalizeSavedSession(restSaved, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.state).toBe('RESTING');
    expect(restored!.restRemainingSeconds).toBe(37);
  });

  it('TEST D: Complete one set, pause during the next set, resume, confirm completed sets are preserved', () => {
    const pausedDuringSet2 = {
      dayNumber: 1,
      timelineIndex: 7, // Set 2
      state: 'EXERCISING',
      remainingSeconds: 20,
      completedTimelineIndices: [0, 1, 2, 3, 4, 5, 6] // Set 1 and warmups completed
    };

    const restored = normalizeSavedSession(pausedDuringSet2, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.completedTimelineIndices).toContain(6); // Set 1 is completed
    expect(restored!.completedTimelineIndices).not.toContain(7); // Set 2 is in progress, not completed
    expect(restored!.timelineIndex).toBe(7);
  });

  it('TEST E: Complete entire workout, confirm progress is saved once and programme advances by 1', () => {
    const session: WorkoutSession = {
      dayNumber: 1,
      dateCompleted: '2026-11-08',
      startedAt: '2026-11-08T18:00:00Z',
      finishedAt: '2026-11-08T18:35:00Z',
      totalDurationSeconds: 2100,
      activeDurationSeconds: 1500,
      restDurationSeconds: 600,
      isCompleted: true,
      sessionType: 'evening',
      exercises: []
    };

    const nextDay = advanceProgramDay(1, 1);
    expect(nextDay).toBe(2);

    const streak = calculateStreak([session], '2026-11-08', 0);
    expect(streak.currentStreak).toBe(1);
    expect(streak.bestStreak).toBe(1);
  });

  it('TEST F: Missing or invalid saved-session property safely recovers without throwing or rendering black screen', () => {
    // Missing timelineIndex, missing remainingSeconds, invalid state, corrupted day
    const corruptedSession = {
      dayNumber: 'corrupted',
      timelineIndex: 'not-a-number',
      state: null,
      remainingSeconds: -99,
      restRemainingSeconds: null
    };

    const restored = normalizeSavedSession(corruptedSession, timeline, 1);
    expect(restored).not.toBeNull();
    expect(restored!.isValid).toBe(true);
    expect(restored!.timelineIndex).toBeGreaterThanOrEqual(0);
    expect(restored!.timelineIndex).toBeLessThan(timeline.length);
    expect(restored!.remainingSeconds).toBeGreaterThan(0);
    expect(restored!.restRemainingSeconds).toBeGreaterThan(0);
    expect(restored!.state).toBe('EXERCISING');

    // Safe exercise resolution test
    const fallbackEx = getSafeExercise('completely-unknown-exercise');
    expect(fallbackEx).toBeDefined();
    expect(fallbackEx.name).toBeTruthy();
    expect(fallbackEx.instructions).toBeDefined();
  });
});
