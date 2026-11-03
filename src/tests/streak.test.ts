import { describe, it, expect } from 'vitest';
import { WORKOUT_DAYS } from '../data/program';

function calculateStreaks(completedDays: number[], currentDay: number) {
  const completedDayNumbers = new Set(completedDays);
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
      // Scheduled recovery days do NOT break a streak!
      continue;
    } else if (d < currentDay) {
      tempStreak = 0;
      currentStreak = 0;
    }
  }

  return { currentStreak, bestStreak };
}

describe('Streak Calculation Algorithm', () => {
  it('returns 0 streak for brand new user with no completed workouts', () => {
    const result = calculateStreaks([], 1);
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(0);
  });

  it('increments streak with consecutive training days', () => {
    const result = calculateStreaks([1, 2, 3], 4);
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
  });

  it('does NOT break streak when scheduled recovery day (Day 7) occurs', () => {
    // Days 1-6 completed, Day 7 is recovery, Day 8 completed
    const result = calculateStreaks([1, 2, 3, 4, 5, 6, 8], 9);
    expect(result.currentStreak).toBe(7); // 6 days + Day 8
    expect(result.bestStreak).toBe(7);
  });

  it('resets streak if a non-recovery training day is missed', () => {
    // Completed Day 1, Day 2. Missed Day 3. Completed Day 4. Today is Day 5.
    const result = calculateStreaks([1, 2, 4], 5);
    expect(result.currentStreak).toBe(1); // Only Day 4 is the current streak
    expect(result.bestStreak).toBe(2); // Best was Days 1-2
  });

  it('does not count future unperformed days toward current streak', () => {
    const result = calculateStreaks([1, 2], 2);
    expect(result.currentStreak).toBe(2);
  });
});
