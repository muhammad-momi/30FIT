import { describe, it, expect } from 'vitest';
import {
  getCurrentPendingDay,
  advanceProgramDay,
  calculateStreak
} from '../services/progression';
import type { WorkoutSession, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../services/db';

function createMockSession(dayNumber: number, dateCompleted: string): WorkoutSession {
  return {
    dayNumber,
    dateCompleted,
    startedAt: `${dateCompleted}T18:00:00.000Z`,
    finishedAt: `${dateCompleted}T18:35:00.000Z`,
    totalDurationSeconds: 2100,
    activeDurationSeconds: 1500,
    restDurationSeconds: 600,
    isCompleted: true,
    sessionType: 'evening',
    exercises: []
  };
}

describe('Completion-Based 30-Day Progression', () => {
  it('keeps Programme Day 6 pending when Day 5 was completed on Nov 7 and user returns on Nov 9 without working out', () => {
    // Nov 7: user completes Day 5
    const sessions = [
      createMockSession(1, '2026-11-03'),
      createMockSession(2, '2026-11-04'),
      createMockSession(3, '2026-11-05'),
      createMockSession(4, '2026-11-06'),
      createMockSession(5, '2026-11-07')
    ];

    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      nextPendingDay: 6
    };

    // Nov 9: opens app. It MUST still show Day 6, NOT jump to Day 8!
    const pendingDay = getCurrentPendingDay(sessions, settings);
    expect(pendingDay).toBe(6);
  });

  it('advances exactly one programme day upon completing a workout', () => {
    const nextDay = advanceProgramDay(5, 5);
    expect(nextDay).toBe(6);

    const nextDayAfter30 = advanceProgramDay(30, 30);
    expect(nextDayAfter30).toBe(30);
  });

  it('never skips incomplete workouts even if calendar date is far in the future', () => {
    // Brand new user, startDate was 2026-11-02, but today is 2026-12-15
    const sessions: WorkoutSession[] = [];
    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      nextPendingDay: 1
    };

    const pending = getCurrentPendingDay(sessions, settings);
    expect(pending).toBe(1); // Day 1 remains pending!
  });
});

describe('Streak Calculation (User Requirement 8 Specification)', () => {
  it('matches exact user specification: Nov 5 (1), Nov 6 (2), Nov 7 (3), Nov 8 missed (0), Nov 9 (1)', () => {
    // Step 1: Nov 5 - Completed - Streak 1
    const sessionsNov5 = [createMockSession(1, '2026-11-05')];
    const resNov5 = calculateStreak(sessionsNov5, '2026-11-05');
    expect(resNov5.currentStreak).toBe(1);
    expect(resNov5.bestStreak).toBe(1);

    // Step 2: Nov 6 - Completed - Streak 2
    const sessionsNov6 = [
      ...sessionsNov5,
      createMockSession(2, '2026-11-06')
    ];
    const resNov6 = calculateStreak(sessionsNov6, '2026-11-06');
    expect(resNov6.currentStreak).toBe(2);
    expect(resNov6.bestStreak).toBe(2);

    // Step 3: Nov 7 - Completed - Streak 3
    const sessionsNov7 = [
      ...sessionsNov6,
      createMockSession(3, '2026-11-07')
    ];
    const resNov7 = calculateStreak(sessionsNov7, '2026-11-07');
    expect(resNov7.currentStreak).toBe(3);
    expect(resNov7.bestStreak).toBe(3);

    // Step 4: Nov 8 - Missed! On Nov 9 morning before workout, streak resets to 0, best preserved as 3
    const resNov8Missed = calculateStreak(sessionsNov7, '2026-11-09');
    expect(resNov8Missed.currentStreak).toBe(0);
    expect(resNov8Missed.bestStreak).toBe(3);

    // Step 5: Nov 9 - Completed pending workout - Streak becomes 1
    const sessionsNov9 = [
      ...sessionsNov7,
      createMockSession(4, '2026-11-09')
    ];
    const resNov9 = calculateStreak(sessionsNov9, '2026-11-09', 3);
    expect(resNov9.currentStreak).toBe(1);
    expect(resNov9.bestStreak).toBe(3);
  });

  it('does not break streak across scheduled recovery days', () => {
    // Day 1 to 6 completed on consecutive days (Nov 1 to Nov 6)
    // Day 7 is recovery on Nov 7
    // Day 8 completed on Nov 8
    const sessions = [
      createMockSession(1, '2026-11-01'),
      createMockSession(2, '2026-11-02'),
      createMockSession(3, '2026-11-03'),
      createMockSession(4, '2026-11-04'),
      createMockSession(5, '2026-11-05'),
      createMockSession(6, '2026-11-06'),
      createMockSession(7, '2026-11-07'), // Day 7 is Recovery Day
      createMockSession(8, '2026-11-08')
    ];

    const res = calculateStreak(sessions, '2026-11-08');
    // 6 strength workouts + Day 8 = 7 streak (Day 7 recovery bridges without adding artificial +1)
    expect(res.currentStreak).toBe(7);
    expect(res.bestStreak).toBe(7);
  });

  it('does not count the same calendar date twice toward streak', () => {
    // 2 workouts completed on the same date (e.g. morning & evening)
    const sessions = [
      createMockSession(1, '2026-11-05'),
      createMockSession(2, '2026-11-05')
    ];

    const res = calculateStreak(sessions, '2026-11-05');
    expect(res.currentStreak).toBe(1);
  });
});

