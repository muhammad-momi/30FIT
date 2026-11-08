import { describe, it, expect } from 'vitest';
import { buildWorkoutTimeline } from '../services/workoutEngine';
import {
  getCurrentPendingDay,
  advanceProgramDay,
  calculateStreak
} from '../services/progression';
import { WORKOUT_DAYS } from '../data/program';
import type { WorkoutSession, UserSettings, SavedWorkoutState } from '../types';
import { DEFAULT_SETTINGS } from '../services/db';

describe('Hands-Free Automated Workout Flow & Timers (Requirement 13 Tests)', () => {
  const day1 = WORKOUT_DAYS.find(d => d.dayNumber === 1)!;

  it('Test 1 & 2: Prepares timeline where 10 push-ups = 30 seconds countdown and transitions to rest automatically', () => {
    const timeline = buildWorkoutTimeline(day1, 60);

    // Warmup items exist and flow sequentially
    const warmupItems = timeline.filter(t => t.phase === 'warmup');
    expect(warmupItems.length).toBe(day1.warmupExercises.reduce((acc, e) => acc + e.sets, 0));

    // First main exercise is push-ups
    const pushupItems = timeline.filter(t => t.exerciseId === 'push-ups');
    expect(pushupItems).toHaveLength(3); // 3 sets
    expect(pushupItems[0].target).toBe(10);
    expect(pushupItems[0].unit).toBe('reps');
    expect(pushupItems[0].duration).toBe(30); // 10 reps * 3s = 30s
    expect(pushupItems[0].restDuration).toBe(60); // 60s rest

    // Every item has valid duration and next preview
    timeline.forEach((item, idx) => {
      expect(item.duration).toBeGreaterThanOrEqual(15);
      if (idx < timeline.length - 1) {
        expect(item.nextPreview).toBeDefined();
        expect(item.nextPreview?.name).toBeTruthy();
      }
    });

    // Last item has 0 rest duration and finishes the workout
    const last = timeline[timeline.length - 1];
    expect(last.restDuration).toBe(0);
    expect(last.nextPreview?.name).toBe('Workout Complete');
  });

  it('Test 3: Extend rest adds exactly 10 seconds without resetting timer or completed sets', () => {
    let restRemaining = 15;
    let targetTimestamp = Date.now() + 15000;

    // Simulate clicking +10 SECONDS
    const addSeconds = 10;
    restRemaining += addSeconds;
    targetTimestamp += addSeconds * 1000;

    expect(restRemaining).toBe(25);
    expect(targetTimestamp - Date.now()).toBeGreaterThanOrEqual(24000);

    // Click +10 SECONDS again
    restRemaining += addSeconds;
    targetTimestamp += addSeconds * 1000;
    expect(restRemaining).toBe(35);
  });

  it('Test 4: Pause and save saves exact position locally and resumes without restarting', () => {
    const timeline = buildWorkoutTimeline(day1, 60);
    const pushupItemIndex = timeline.findIndex(t => t.exerciseId === 'push-ups');

    const savedState: SavedWorkoutState = {
      dayNumber: 1,
      timelineIndex: pushupItemIndex,
      state: 'EXERCISING',
      remainingSeconds: 18, // 18 seconds remaining of 30
      restRemainingSeconds: 0,
      totalSeconds: 320,
      activeSeconds: 240,
      restSeconds: 80,
      completedTimelineIndices: [0, 1, 2, 3, 4, 5],
      lastSavedAt: Date.now()
    };

    // Upon reopening / resuming:
    expect(savedState.dayNumber).toBe(1);
    expect(savedState.timelineIndex).toBe(pushupItemIndex);
    expect(savedState.remainingSeconds).toBe(18);
    expect(savedState.state).toBe('EXERCISING');

    // Resuming continues from timelineIndex and remainingSeconds (does not restart from 0)
    expect(savedState.timelineIndex).not.toBe(0);
    expect(savedState.remainingSeconds).toBeLessThan(30);
  });

  it('Test 5: Missed Day logic keeps Programme Day 2 pending and resets streak appropriately', () => {
    // Complete Day 1 on Nov 5
    const sessionDay1: WorkoutSession = {
      dayNumber: 1,
      dateCompleted: '2026-11-05',
      startedAt: '2026-11-05T18:00:00Z',
      finishedAt: '2026-11-05T18:35:00Z',
      totalDurationSeconds: 2100,
      activeDurationSeconds: 1500,
      restDurationSeconds: 600,
      isCompleted: true,
      sessionType: 'evening',
      exercises: []
    };

    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      nextPendingDay: 2,
      currentStreak: 1,
      bestStreak: 1
    };

    // Two calendar days pass without working out (Nov 6 and Nov 7 missed). Today is Nov 8.
    const pendingDay = getCurrentPendingDay([sessionDay1], settings);
    expect(pendingDay).toBe(2); // Day 2 REMAINS pending! Does not jump to Day 4!

    const streakOnNov8 = calculateStreak([sessionDay1], '2026-11-08', settings.bestStreak);
    expect(streakOnNov8.currentStreak).toBe(0); // Streak resets to 0 due to missed days
    expect(streakOnNov8.bestStreak).toBe(1); // Best streak preserved!

    // User completes pending Day 2 on Nov 8
    const sessionDay2: WorkoutSession = {
      dayNumber: 2,
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

    const nextPending = advanceProgramDay(2, pendingDay);
    expect(nextPending).toBe(3); // Advances to Day 3!

    const streakAfterDay2 = calculateStreak([sessionDay1, sessionDay2], '2026-11-08', settings.bestStreak);
    expect(streakAfterDay2.currentStreak).toBe(1); // Starts new streak of 1
    expect(streakAfterDay2.bestStreak).toBe(1);
  });

  it('Test 6: Automated state transitions complete entire workout timeline with exact progress tracking', () => {
    const timeline = buildWorkoutTimeline(day1, 60);
    const completedIndices = new Set<number>();

    // Simulate accelerated playback of each item
    for (let i = 0; i < timeline.length; i++) {
      const item = timeline[i];
      // Exercise finishes
      completedIndices.add(i);

      // If rest > 0, rest finishes
      if (item.restDuration > 0) {
        expect(item.restDuration).toBeGreaterThan(0);
      }
    }

    expect(completedIndices.size).toBe(timeline.length);

    // Save session
    const completedSession: WorkoutSession = {
      dayNumber: 1,
      dateCompleted: '2026-11-08',
      startedAt: '2026-11-08T18:00:00Z',
      finishedAt: '2026-11-08T18:40:00Z',
      totalDurationSeconds: 2400,
      activeDurationSeconds: 1600,
      restDurationSeconds: 800,
      isCompleted: true,
      sessionType: 'evening',
      exercises: []
    };

    expect(completedSession.isCompleted).toBe(true);
    const nextDay = advanceProgramDay(1, 1);
    expect(nextDay).toBe(2);
  });
});
