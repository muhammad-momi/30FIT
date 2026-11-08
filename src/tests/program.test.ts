import { describe, it, expect } from 'vitest';
import { WORKOUT_DAYS, getDateForDay } from '../data/program';
import { EXERCISES } from '../data/exercises';
import { ASSESSMENT_FIELDS, ASSESSMENT_DAYS } from '../data/assessments';

describe('30-Day Workout Programme Verification', () => {
  it('contains exactly 30 days ordered sequentially from 1 to 30', () => {
    expect(WORKOUT_DAYS).toHaveLength(30);
    WORKOUT_DAYS.forEach((day, index) => {
      expect(day.dayNumber).toBe(index + 1);
      expect(day.dateOffset).toBe(index);
    });
  });

  it('divides into exactly three 10-day phases', () => {
    const phase1 = WORKOUT_DAYS.filter(d => d.phase === 1);
    const phase2 = WORKOUT_DAYS.filter(d => d.phase === 2);
    const phase3 = WORKOUT_DAYS.filter(d => d.phase === 3);

    expect(phase1).toHaveLength(10);
    expect(phase2).toHaveLength(10);
    expect(phase3).toHaveLength(10);

    phase1.forEach(d => expect(d.dayNumber).toBeLessThanOrEqual(10));
    phase2.forEach(d => {
      expect(d.dayNumber).toBeGreaterThan(10);
      expect(d.dayNumber).toBeLessThanOrEqual(20);
    });
    phase3.forEach(d => expect(d.dayNumber).toBeGreaterThan(20));
  });

  it('correctly schedules recovery days on Day 7, 14, 21, and 28', () => {
    const recoveryDays = WORKOUT_DAYS.filter(d => d.isRecovery);
    expect(recoveryDays.map(d => d.dayNumber)).toEqual([7, 14, 21, 28]);

    recoveryDays.forEach(day => {
      expect(day.mainExercises).toHaveLength(0);
      expect(day.workoutType).toBe('Recovery');
    });
  });

  it('identifies milestone assessment days on Day 1, 10, 20, and 30', () => {
    const assessmentDays = WORKOUT_DAYS.filter(d => d.isAssessment);
    expect(assessmentDays.map(d => d.dayNumber)).toEqual([1, 10, 20, 30]);
    expect(ASSESSMENT_DAYS.map(d => d.dayNumber)).toEqual([1, 10, 20, 30]);
  });

  it('all scheduled exercise IDs resolve to valid exercises in the library', () => {
    WORKOUT_DAYS.forEach(day => {
      const allScheduled = [
        ...day.warmupExercises,
        ...day.mainExercises,
        ...day.cooldownExercises
      ];

      allScheduled.forEach(sched => {
        expect(EXERCISES[sched.exerciseId]).toBeDefined();
        expect(sched.sets).toBeGreaterThan(0);
        expect(sched.repsOrDuration).toBeGreaterThan(0);
        if (sched.alternativeExerciseId) {
          expect(EXERCISES[sched.alternativeExerciseId]).toBeDefined();
        }
      });
    });
  });

  it('verifies required no-equipment alternative linkages', () => {
    const declinePushup = EXERCISES['decline-push-ups'];
    expect(declinePushup.hasEquipmentAlternative).toBe(true);
    expect(declinePushup.alternativeExerciseId).toBe('push-ups');

    const bulgarianSplitSquat = EXERCISES['bulgarian-split-squats'];
    expect(bulgarianSplitSquat.hasEquipmentAlternative).toBe(true);
    expect(bulgarianSplitSquat.alternativeExerciseId).toBe('floor-split-squats');

    const towelRow = EXERCISES['towel-rows'];
    expect(towelRow.hasEquipmentAlternative).toBe(true);
    expect(towelRow.alternativeExerciseId).toBe('prone-w-raises');
  });

  it('verifies Phase 3 specific targets: Archer Push-ups 6 reps, Bulgarian Split Squats 10 reps', () => {
    const day22 = WORKOUT_DAYS.find(d => d.dayNumber === 22)!;
    const archer = day22.mainExercises.find(e => e.exerciseId === 'archer-push-ups');
    const bulgarian = day22.mainExercises.find(e => e.exerciseId === 'bulgarian-split-squats');
    const towel = day22.mainExercises.find(e => e.exerciseId === 'towel-rows');

    expect(archer).toBeDefined();
    expect(archer!.repsOrDuration).toBe(6);
    expect(bulgarian).toBeDefined();
    expect(bulgarian!.repsOrDuration).toBe(10);
    expect(towel).toBeDefined();
    expect(towel!.repsOrDuration).toBe(8);
  });

  it('verifies date calculations starting Mon, 2 Nov 2026 to Tue, 1 Dec 2026', () => {
    const startDate = '2026-11-02';
    const day1Date = getDateForDay(startDate, 1);
    expect(day1Date.getFullYear()).toBe(2026);
    expect(day1Date.getMonth()).toBe(10); // November (0-indexed)
    expect(day1Date.getDate()).toBe(2);

    const day30Date = getDateForDay(startDate, 30);
    expect(day30Date.getFullYear()).toBe(2026);
    expect(day30Date.getMonth()).toBe(11); // December (0-indexed)
    expect(day30Date.getDate()).toBe(1);
  });

  it('verifies all 5 standard assessment test disciplines', () => {
    expect(ASSESSMENT_FIELDS).toHaveLength(5);
    const keys = ASSESSMENT_FIELDS.map(f => f.key);
    expect(keys).toContain('pushupsMax');
    expect(keys).toContain('squatsOneMin');
    expect(keys).toContain('plankMaxSeconds');
    expect(keys).toContain('legRaisesMax');
    expect(keys).toContain('jumpingJacksOneMin');
  });
});
