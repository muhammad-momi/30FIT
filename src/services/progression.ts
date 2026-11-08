import type { WorkoutSession, UserSettings } from '../types';
import { WORKOUT_DAYS } from '../data/program';

/**
 * Parses YYYY-MM-DD string into an integer day number (UTC midnight)
 * for timezone-safe calendar day difference calculations.
 */
export function dateStringToDays(dateStr: string): number {
  const parts = dateStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1] - 1;
  const d = parts[2];
  return Math.floor(Date.UTC(y, m, d) / (1000 * 60 * 60 * 24));
}

/**
 * Formats a Date object into a YYYY-MM-DD string in local time.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the set of completed evening day numbers.
 */
export function getCompletedDayNumbers(sessions: WorkoutSession[]): Set<number> {
  const completed = sessions.filter(s => s.isCompleted && s.sessionType === 'evening');
  return new Set(completed.map(s => s.dayNumber));
}

/**
 * Checks whether a particular programme day is completed.
 */
export function isDayCompleted(dayNumber: number, sessions: WorkoutSession[]): boolean {
  return sessions.some(s => s.dayNumber === dayNumber && s.isCompleted && s.sessionType === 'evening');
}

/**
 * COMPLETION-BASED 30-DAY PROGRESSION
 * The programme day advances ONLY when the current workout is completed.
 * It NEVER advances due to calendar date changes.
 * Keeps the incomplete workout pending.
 */
export function getCurrentPendingDay(
  sessions: WorkoutSession[],
  settings?: UserSettings
): number {
  const completedDays = getCompletedDayNumbers(sessions);

  // If settings has nextPendingDay explicitly saved
  let pending = settings?.nextPendingDay || 1;

  // Ensure pending is at least 1 and at most 30
  if (pending < 1) pending = 1;
  if (pending > 30) pending = 30;

  // If the saved pending day is already completed, advance to the next uncompleted day
  while (pending < 30 && completedDays.has(pending)) {
    pending++;
  }

  return pending;
}

/**
 * Calculates the next programme day after completing a workout.
 * Advances exactly one programme day.
 */
export function advanceProgramDay(
  completedDayNumber: number,
  currentPendingDay: number = completedDayNumber
): number {
  const next = Math.max(currentPendingDay, completedDayNumber + 1);
  return Math.min(30, next);
}

/**
 * STREAK LOGIC
 * - Based on workout consistency across calendar days.
 * - Consecutive completed days increase streak.
 * - Missing a workout day resets the current streak to zero (preserves best streak).
 * - Preserves best streak.
 * - Multiple workouts on the same calendar date count as one day.
 * - Scheduled recovery days (Days 7, 14, 21, 28) do not break a streak,
 *   and do not artificially increase the streak count.
 * - Morning routines are ignored (evening sessions only).
 */
export function calculateStreak(
  sessions: WorkoutSession[],
  referenceDateStr?: string,
  savedBestStreak: number = 0
): { currentStreak: number; bestStreak: number } {
  const todayStr = referenceDateStr || formatLocalDate();
  const todayDays = dateStringToDays(todayStr);

  const completedSessions = sessions.filter(
    s => s.isCompleted && s.sessionType === 'evening' && Boolean(s.dateCompleted)
  );

  if (completedSessions.length === 0) {
    return { currentStreak: 0, bestStreak: savedBestStreak };
  }

  // Map each unique completion date to its session records
  const dateMap = new Map<string, WorkoutSession[]>();
  completedSessions.forEach(s => {
    const list = dateMap.get(s.dateCompleted) || [];
    list.push(s);
    dateMap.set(s.dateCompleted, list);
  });

  // Unique completion dates sorted in ascending order
  const sortedDates = Array.from(dateMap.keys()).sort();

  // Helper to check if a session on that date was a scheduled recovery day
  const isDateOnlyRecovery = (dateStr: string): boolean => {
    const sessList = dateMap.get(dateStr) || [];
    return sessList.every(s => {
      const day = WORKOUT_DAYS.find(w => w.dayNumber === s.dayNumber);
      return day?.isRecovery === true;
    });
  };

  let maxStreak = savedBestStreak;
  let activeStreak = 0;
  let lastWorkoutDayNum: number | null = null;

  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i];
    const dayNum = dateStringToDays(dateStr);
    const isRecovery = isDateOnlyRecovery(dateStr);

    if (lastWorkoutDayNum === null) {
      if (!isRecovery) {
        activeStreak = 1;
        lastWorkoutDayNum = dayNum;
      } else {
        // Recovery day alone doesn't start or increment streak
        lastWorkoutDayNum = dayNum;
      }
    } else {
      const diff = dayNum - lastWorkoutDayNum;

      if (diff === 0) {
        // Same calendar day, do not count twice
        continue;
      } else if (diff === 1) {
        // Consecutive calendar day
        if (!isRecovery) {
          activeStreak++;
          lastWorkoutDayNum = dayNum;
        } else {
          // Recovery day bridge: preserves streak, updates lastWorkoutDayNum
          lastWorkoutDayNum = dayNum;
        }
      } else if (diff === 2 && isRecovery) {
        // Gap of 2 bridged by recovery
        lastWorkoutDayNum = dayNum;
      } else {
        // Gap > 1 without recovery: missed workout day!
        if (!isRecovery) {
          activeStreak = 1;
          lastWorkoutDayNum = dayNum;
        } else {
          activeStreak = 0;
          lastWorkoutDayNum = dayNum;
        }
      }
    }

    if (activeStreak > maxStreak) {
      maxStreak = activeStreak;
    }
  }

  // Determine current streak as of today
  let currentStreak = activeStreak;

  if (lastWorkoutDayNum !== null) {
    const gapFromLast = todayDays - lastWorkoutDayNum;

    if (gapFromLast === 0) {
      // Completed workout today: streak is current activeStreak
      currentStreak = activeStreak;
    } else if (gapFromLast === 1) {
      // Completed workout yesterday: today is in progress, streak still alive
      currentStreak = activeStreak;
    } else {
      // Gap >= 2: user missed at least one full day!
      // Current streak resets to 0, best streak preserved
      currentStreak = 0;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(maxStreak, savedBestStreak)
  };
}

