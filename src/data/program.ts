import type { WorkoutDay, ScheduledExercise } from '../types';

export const STANDARD_WARMUP: ScheduledExercise[] = [
  { exerciseId: 'arm-circles', sets: 1, repsOrDuration: 30, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'shoulder-rotations', sets: 1, repsOrDuration: 30, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'hip-circles', sets: 1, repsOrDuration: 30, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'marching-in-place', sets: 1, repsOrDuration: 60, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'leg-swings', sets: 1, repsOrDuration: 30, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'squats', sets: 1, repsOrDuration: 10, unit: 'reps', restDuration: 15, targetNote: 'Gentle warm-up squats' }
];

export const STANDARD_COOLDOWN: ScheduledExercise[] = [
  { exerciseId: 'chest-stretch', sets: 1, repsOrDuration: 40, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'shoulder-stretch', sets: 1, repsOrDuration: 40, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'quadriceps-stretch', sets: 1, repsOrDuration: 40, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'hamstring-stretch', sets: 1, repsOrDuration: 40, unit: 'seconds', restDuration: 10 },
  { exerciseId: 'gentle-back-stretch', sets: 1, repsOrDuration: 45, unit: 'seconds', restDuration: 10 }
];

export const WORKOUT_DAYS: WorkoutDay[] = [
  // ==========================================
  // PHASE 1 — FOUNDATION & ENDURANCE (Days 1–10)
  // ==========================================
  {
    dayNumber: 1,
    dateOffset: 0,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Phase 1 Launch: Full Body A',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: true,
    assessmentDayNumber: 1,
    description: 'Establish your baseline fitness metrics and kick off Phase 1 with foundational full-body activation.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'squats', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 60 },
      { exerciseId: 'plank', sets: 3, repsOrDuration: 30, unit: 'seconds', restDuration: 60, targetNote: '30-45 sec hold' },
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'reverse-lunges', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60, targetNote: '10 each leg' },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'calf-raises', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'superman-hold', sets: 2, repsOrDuration: 20, unit: 'seconds', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Awakening & Walk',
      durationMinutes: 15,
      description: 'Gentle mobility flow followed by a 10-minute brisk morning walk.',
      exercises: ['Marching in place', 'Arm circles', 'Gentle mobility', '10 min walk']
    }
  },
  {
    dayNumber: 2,
    dateOffset: 1,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Upper Body, Core & Legs B',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'Target chest width, shoulder endurance, and core rotation.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'wide-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'squats', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 2, repsOrDuration: 8, unit: 'reps', restDuration: 60 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'side-plank', sets: 2, repsOrDuration: 20, unit: 'seconds', restDuration: 45, targetNote: '20 sec each side' }
    ],
    morningRoutine: {
      title: 'Light Core & Walk',
      durationMinutes: 15,
      description: 'Morning movement and fresh air to elevate metabolism.',
      exercises: ['Hip circles', 'Shoulder rotations', '10 min brisk walk']
    }
  },
  {
    dayNumber: 3,
    dateOffset: 2,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Light Cardio & Core Control',
    workoutType: 'Light cardio + core',
    isRecovery: false,
    isAssessment: false,
    description: 'Active recovery day focused on aerobic base and anterior pelvic stability.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'marching-in-place', sets: 3, repsOrDuration: 60, unit: 'seconds', restDuration: 30, targetNote: 'Simulating brisk walk rhythm' },
      { exerciseId: 'dead-bugs', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 45, targetNote: '10 each side' },
      { exerciseId: 'bird-dogs', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 45, targetNote: '10 each side' },
      { exerciseId: 'hip-circles', sets: 2, repsOrDuration: 30, unit: 'seconds', restDuration: 15, targetNote: 'Gentle mobility flow' }
    ],
    morningRoutine: {
      title: 'Aerobic Walk',
      durationMinutes: 20,
      description: '15-20 min brisk walking outdoors or on treadmill.',
      exercises: ['15-20 min outdoor walk']
    }
  },
  {
    dayNumber: 4,
    dateOffset: 3,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Full Body A — Consistency',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'Consolidate the push-up and squat pattern with cleaner form and shorter rest.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'squats', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 60 },
      { exerciseId: 'plank', sets: 3, repsOrDuration: 35, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'reverse-lunges', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'calf-raises', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'superman-hold', sets: 2, repsOrDuration: 20, unit: 'seconds', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Mobility',
      durationMinutes: 15,
      description: 'Wake up shoulders and hips.',
      exercises: ['Arm circles', 'Hip circles', '10 min walk']
    }
  },
  {
    dayNumber: 5,
    dateOffset: 4,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Upper Body & Core B',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'Challenging chest angles, pike shoulder stability, and side core resilience.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'wide-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'squats', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 2, repsOrDuration: 8, unit: 'reps', restDuration: 60 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'side-plank', sets: 2, repsOrDuration: 20, unit: 'seconds', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Light Core & Walk',
      durationMinutes: 15,
      description: '10 min walk and easy stretches.',
      exercises: ['10 min walk', 'Gentle back stretch']
    }
  },
  {
    dayNumber: 6,
    dateOffset: 5,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'High-Energy Conditioning',
    workoutType: 'Conditioning',
    isRecovery: false,
    isAssessment: false,
    description: 'Elevate your heart rate and burn calories with full-throttle bodyweight conditioning.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'high-knees', sets: 3, repsOrDuration: 30, unit: 'seconds', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'dead-bugs', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Easy Walk',
      durationMinutes: 15,
      description: 'Low intensity steady state stroll.',
      exercises: ['15 min relaxed walk']
    }
  },
  {
    dayNumber: 7,
    dateOffset: 6,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Phase 1 Active Recovery',
    workoutType: 'Recovery',
    isRecovery: true,
    isAssessment: false,
    description: 'Rest and replenish. Allow connective tissues and muscles to repair. Keep movement light and comfortable.',
    warmupExercises: [],
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [],
    morningRoutine: {
      title: 'Recovery Walk & Stretches',
      durationMinutes: 20,
      description: 'Comfortable walking and gentle mobility only.',
      exercises: ['Comfortable walking', 'Hamstring stretch', 'Gentle back stretch']
    }
  },
  {
    dayNumber: 8,
    dateOffset: 7,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Full Body A — Intensity',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'Return refreshed from recovery day with crisp reps and solid tempo.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'squats', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 60 },
      { exerciseId: 'plank', sets: 3, repsOrDuration: 40, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'reverse-lunges', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'calf-raises', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'superman-hold', sets: 2, repsOrDuration: 20, unit: 'seconds', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Awakening',
      durationMinutes: 15,
      description: 'Gentle mobility and brisk walk.',
      exercises: ['Arm circles', 'Hip circles', '10 min walk']
    }
  },
  {
    dayNumber: 9,
    dateOffset: 8,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Upper Body & Core B — Mastery',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'Final full Workout B of Phase 1. Hone control and prepare for Day 10 assessment.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'wide-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'squats', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 2, repsOrDuration: 8, unit: 'reps', restDuration: 60 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'side-plank', sets: 2, repsOrDuration: 20, unit: 'seconds', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Stride',
      durationMinutes: 15,
      description: '10 min walk and deep breathing.',
      exercises: ['10 min walk', 'Shoulder rotations']
    }
  },
  {
    dayNumber: 10,
    dateOffset: 9,
    phase: 1,
    phaseName: 'Foundation & Endurance',
    title: 'Phase 1 Assessment & Light Full-Body',
    workoutType: 'Light full-body + assessment',
    isRecovery: false,
    isAssessment: true,
    assessmentDayNumber: 10,
    description: 'Evaluate your 10-day foundation improvements: test Push-ups, Squats, Plank, Leg Raises, and Jumping Jacks.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'squats', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 45, targetNote: 'Light primer' },
      { exerciseId: 'push-ups', sets: 2, repsOrDuration: 8, unit: 'reps', restDuration: 45, targetNote: 'Light primer' },
      { exerciseId: 'glute-bridges', sets: 2, repsOrDuration: 12, unit: 'reps', restDuration: 45 },
      { exerciseId: 'dead-bugs', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Pre-Assessment Focus Walk',
      durationMinutes: 15,
      description: 'Calm morning walk to prepare mentally.',
      exercises: ['15 min walk', 'Calf stretches']
    }
  },

  // ==========================================
  // PHASE 2 — STRENGTH DEVELOPMENT (Days 11–20)
  // ==========================================
  {
    dayNumber: 11,
    dateOffset: 10,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Phase 2 Kickoff: Push, Legs & Core A',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'Level up pushing strength with Diamond and Decline push-ups, paired with deep lunges and hollow body holds.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'diamond-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'decline-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, alternativeExerciseId: 'push-ups' },
      { exerciseId: 'lunges', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 60, targetNote: '12 each leg' },
      { exerciseId: 'hollow-body-hold', sets: 4, repsOrDuration: 30, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'calf-raises', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'reverse-snow-angels', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Awakening & Walk',
      durationMinutes: 15,
      description: 'Morning brisk walk and hip openers.',
      exercises: ['Hip circles', '10 min brisk walk']
    }
  },
  {
    dayNumber: 12,
    dateOffset: 11,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Full Body Strength B',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'Target anterior and posterior chain balance with superman raises and rapid mountain climbers.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'diamond-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'decline-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, alternativeExerciseId: 'push-ups' },
      { exerciseId: 'lunges', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 60, targetNote: '12 each leg' },
      { exerciseId: 'hollow-body-hold', sets: 4, repsOrDuration: 30, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'superman-raises', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Gentle Mobility',
      durationMinutes: 15,
      description: 'Wake up core and hamstrings.',
      exercises: ['Arm circles', 'Hamstring stretch', '10 min walk']
    }
  },
  {
    dayNumber: 13,
    dateOffset: 12,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Phase 2 Conditioning',
    workoutType: 'Conditioning',
    isRecovery: false,
    isAssessment: false,
    description: 'High cadence interval training to strip body fat and expand lung capacity.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'high-knees', sets: 3, repsOrDuration: 30, unit: 'seconds', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'dead-bugs', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Easy Walk',
      durationMinutes: 15,
      description: 'Steady 15 min walk.',
      exercises: ['15 min walk']
    }
  },
  {
    dayNumber: 14,
    dateOffset: 13,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Phase 2 Midpoint Recovery',
    workoutType: 'Recovery',
    isRecovery: true,
    isAssessment: false,
    description: 'Midpoint rest day. Relax your central nervous system, hydrate, and stretch.',
    warmupExercises: [],
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [],
    morningRoutine: {
      title: 'Recovery Walk & Flow',
      durationMinutes: 20,
      description: 'Comfortable walking and gentle mobility only.',
      exercises: ['Light walk', 'Gentle back stretch']
    }
  },
  {
    dayNumber: 15,
    dateOffset: 14,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Push, Legs & Core A',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'Diamond push-ups depth and pike shoulder elevation.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'diamond-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'decline-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, alternativeExerciseId: 'push-ups' },
      { exerciseId: 'lunges', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 60, targetNote: '12 each leg' },
      { exerciseId: 'hollow-body-hold', sets: 4, repsOrDuration: 30, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'calf-raises', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'reverse-snow-angels', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Stride',
      durationMinutes: 15,
      description: '10 min walk and shoulder mobility.',
      exercises: ['Shoulder rotations', '10 min walk']
    }
  },
  {
    dayNumber: 16,
    dateOffset: 15,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Full Body Strength B',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'High volume glute bridges and explosive mountain climbers.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'diamond-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'decline-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, alternativeExerciseId: 'push-ups' },
      { exerciseId: 'lunges', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 60, targetNote: '12 each leg' },
      { exerciseId: 'hollow-body-hold', sets: 4, repsOrDuration: 30, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'superman-raises', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Mobility',
      durationMinutes: 15,
      description: '10 min brisk walk.',
      exercises: ['10 min walk', 'Hip circles']
    }
  },
  {
    dayNumber: 17,
    dateOffset: 16,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Conditioning Engine',
    workoutType: 'Conditioning',
    isRecovery: false,
    isAssessment: false,
    description: 'Sustain cadence through high knees and mountain climbers.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'high-knees', sets: 3, repsOrDuration: 30, unit: 'seconds', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'dead-bugs', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Easy Walk',
      durationMinutes: 15,
      description: '15 min outdoor walk.',
      exercises: ['15 min walk']
    }
  },
  {
    dayNumber: 18,
    dateOffset: 17,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Push, Legs & Core A — Apex',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'Drive high muscular recruitment across all upper body pushing sets.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'diamond-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'decline-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, alternativeExerciseId: 'push-ups' },
      { exerciseId: 'lunges', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 60, targetNote: '12 each leg' },
      { exerciseId: 'hollow-body-hold', sets: 4, repsOrDuration: 30, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'calf-raises', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'reverse-snow-angels', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Awakening',
      durationMinutes: 15,
      description: 'Gentle mobility and walk.',
      exercises: ['Arm circles', '10 min walk']
    }
  },
  {
    dayNumber: 19,
    dateOffset: 18,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Full Body Strength B — Final Prep',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'Clean reps, full range of motion, solid hollow body holds.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'diamond-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'decline-push-ups', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, alternativeExerciseId: 'push-ups' },
      { exerciseId: 'lunges', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 60, targetNote: '12 each leg' },
      { exerciseId: 'hollow-body-hold', sets: 4, repsOrDuration: 30, unit: 'seconds', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'superman-raises', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Stride & Mobilize',
      durationMinutes: 15,
      description: '10 min walk.',
      exercises: ['10 min walk', 'Gentle back stretch']
    }
  },
  {
    dayNumber: 20,
    dateOffset: 19,
    phase: 2,
    phaseName: 'Strength Development',
    title: 'Phase 2 Assessment & Light Workout',
    workoutType: 'Light workout + assessment',
    isRecovery: false,
    isAssessment: true,
    assessmentDayNumber: 20,
    description: 'Day 20 Milestone: Record your updated assessment numbers and measure gains against Day 1 and Day 10.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'squats', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 45, targetNote: 'Light primer' },
      { exerciseId: 'push-ups', sets: 2, repsOrDuration: 8, unit: 'reps', restDuration: 45, targetNote: 'Light primer' },
      { exerciseId: 'dead-bugs', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Mental Preparation Walk',
      durationMinutes: 15,
      description: 'Calm morning walk.',
      exercises: ['15 min walk']
    }
  },

  // ==========================================
  // PHASE 3 — ADVANCED BODYWEIGHT STRENGTH (Days 21–30)
  // ==========================================
  {
    dayNumber: 21,
    dateOffset: 20,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Phase 3 Transition Recovery',
    workoutType: 'Recovery',
    isRecovery: true,
    isAssessment: false,
    description: 'Recharge completely before entering the advanced phase with single-leg squats, archer push-ups, and towel rows.',
    warmupExercises: [],
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [],
    morningRoutine: {
      title: 'Restorative Walk & Stretches',
      durationMinutes: 20,
      description: 'Comfortable walking and gentle mobility only.',
      exercises: ['Comfortable walk', 'Hamstring stretch', 'Chest stretch']
    }
  },
  {
    dayNumber: 22,
    dateOffset: 21,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Advanced Strength A',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'Master Archer push-ups, Bulgarian split squats, and safe self-resisted towel rows.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'archer-push-ups', sets: 3, repsOrDuration: 6, unit: 'reps', restDuration: 90, targetNote: '6 total reps (3 each side, adjustable)' },
      { exerciseId: 'bulgarian-split-squats', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, targetNote: '10 each leg', alternativeExerciseId: 'floor-split-squats' },
      { exerciseId: 'towel-rows', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60, alternativeExerciseId: 'prone-w-raises' },
      { exerciseId: 'leg-raises', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'plank', sets: 3, repsOrDuration: 45, unit: 'seconds', restDuration: 60 }
    ],
    morningRoutine: {
      title: 'Morning Awakening & Walk',
      durationMinutes: 15,
      description: 'Hip mobility and walk.',
      exercises: ['Hip circles', '10 min walk']
    }
  },
  {
    dayNumber: 23,
    dateOffset: 22,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Advanced Strength & Endurance B',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'Combine unilateral leg power and archer push-ups with diamond push-ups and reverse snow angels.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'archer-push-ups', sets: 3, repsOrDuration: 6, unit: 'reps', restDuration: 90, targetNote: '6 total reps (3 each side)' },
      { exerciseId: 'bulgarian-split-squats', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, targetNote: '10 each leg', alternativeExerciseId: 'floor-split-squats' },
      { exerciseId: 'towel-rows', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60, alternativeExerciseId: 'prone-w-raises' },
      { exerciseId: 'leg-raises', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'diamond-push-ups', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'reverse-snow-angels', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Morning Stride',
      durationMinutes: 15,
      description: '10 min brisk walk.',
      exercises: ['10 min walk', 'Shoulder rotations']
    }
  },
  {
    dayNumber: 24,
    dateOffset: 23,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Advanced Conditioning',
    workoutType: 'Conditioning',
    isRecovery: false,
    isAssessment: false,
    description: 'Relentless conditioning circuit to maintain high output under fatigue.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'high-knees', sets: 3, repsOrDuration: 30, unit: 'seconds', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'dead-bugs', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Easy Walk',
      durationMinutes: 15,
      description: '15 min walk.',
      exercises: ['15 min walk']
    }
  },
  {
    dayNumber: 25,
    dateOffset: 24,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Advanced Strength A — Pure Control',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'Precision on archer push-ups and deep Bulgarian split squats.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'archer-push-ups', sets: 3, repsOrDuration: 6, unit: 'reps', restDuration: 90, targetNote: '6 total reps (3 each side)' },
      { exerciseId: 'bulgarian-split-squats', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, targetNote: '10 each leg', alternativeExerciseId: 'floor-split-squats' },
      { exerciseId: 'towel-rows', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60, alternativeExerciseId: 'prone-w-raises' },
      { exerciseId: 'leg-raises', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'plank', sets: 3, repsOrDuration: 45, unit: 'seconds', restDuration: 60 }
    ],
    morningRoutine: {
      title: 'Morning Awakening',
      durationMinutes: 15,
      description: 'Arm circles and 10 min walk.',
      exercises: ['Arm circles', '10 min walk']
    }
  },
  {
    dayNumber: 26,
    dateOffset: 25,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Advanced Strength & Endurance B',
    workoutType: 'Workout B',
    isRecovery: false,
    isAssessment: false,
    description: 'Total body endurance and posterior chain stamina.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'archer-push-ups', sets: 3, repsOrDuration: 6, unit: 'reps', restDuration: 90, targetNote: '6 total reps' },
      { exerciseId: 'bulgarian-split-squats', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, targetNote: '10 each leg', alternativeExerciseId: 'floor-split-squats' },
      { exerciseId: 'towel-rows', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60, alternativeExerciseId: 'prone-w-raises' },
      { exerciseId: 'leg-raises', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'diamond-push-ups', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'reverse-snow-angels', sets: 3, repsOrDuration: 15, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Stride & Mobilize',
      durationMinutes: 15,
      description: '10 min walk.',
      exercises: ['10 min walk', 'Gentle back stretch']
    }
  },
  {
    dayNumber: 27,
    dateOffset: 26,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Final Conditioning Circuit',
    workoutType: 'Conditioning',
    isRecovery: false,
    isAssessment: false,
    description: 'Your final cardiovascular conditioning session of the 30-day program. Leave everything on the floor.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'jumping-jacks', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, repsOrDuration: 30, unit: 'reps', restDuration: 45 },
      { exerciseId: 'high-knees', sets: 3, repsOrDuration: 30, unit: 'seconds', restDuration: 45 },
      { exerciseId: 'bicycle-crunches', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'dead-bugs', sets: 3, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Easy Walk',
      durationMinutes: 15,
      description: '15 min walk.',
      exercises: ['15 min walk']
    }
  },
  {
    dayNumber: 28,
    dateOffset: 27,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Final Pre-Assessment Recovery',
    workoutType: 'Recovery',
    isRecovery: true,
    isAssessment: false,
    description: 'Vital recovery day. Replenish glycogen and restore joint mobility before the final two days.',
    warmupExercises: [],
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [],
    morningRoutine: {
      title: 'Comfortable Walk & Mobility',
      durationMinutes: 20,
      description: 'Comfortable walking and gentle mobility only.',
      exercises: ['Light walk', 'Hamstring stretch']
    }
  },
  {
    dayNumber: 29,
    dateOffset: 28,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Advanced Strength A — The Final Workout',
    workoutType: 'Workout A',
    isRecovery: false,
    isAssessment: false,
    description: 'The crowning bodyweight strength workout of the 30-day transformation.',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'archer-push-ups', sets: 3, repsOrDuration: 6, unit: 'reps', restDuration: 90, targetNote: '6 total reps' },
      { exerciseId: 'bulgarian-split-squats', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60, targetNote: '10 each leg', alternativeExerciseId: 'floor-split-squats' },
      { exerciseId: 'towel-rows', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60, alternativeExerciseId: 'prone-w-raises' },
      { exerciseId: 'leg-raises', sets: 3, repsOrDuration: 10, unit: 'reps', restDuration: 60 },
      { exerciseId: 'pike-push-ups', sets: 3, repsOrDuration: 8, unit: 'reps', restDuration: 60 },
      { exerciseId: 'glute-bridges', sets: 3, repsOrDuration: 20, unit: 'reps', restDuration: 45 },
      { exerciseId: 'plank', sets: 3, repsOrDuration: 45, unit: 'seconds', restDuration: 60 }
    ],
    morningRoutine: {
      title: 'Morning Awakening',
      durationMinutes: 15,
      description: '10 min walk and deep breathing.',
      exercises: ['10 min walk', 'Shoulder rotations']
    }
  },
  {
    dayNumber: 30,
    dateOffset: 29,
    phase: 3,
    phaseName: 'Advanced Bodyweight Strength',
    title: 'Day 30: Final Transformation Assessment',
    workoutType: 'Final assessment',
    isRecovery: false,
    isAssessment: true,
    assessmentDayNumber: 30,
    description: 'The ultimate milestone. Test your max Push-ups, Squats in 1 min, Plank hold, Leg raises, and Jumping Jacks. Compare directly to Day 1, 10, and 20!',
    warmupExercises: STANDARD_WARMUP,
    cooldownExercises: STANDARD_COOLDOWN,
    mainExercises: [
      { exerciseId: 'squats', sets: 2, repsOrDuration: 10, unit: 'reps', restDuration: 45, targetNote: 'Primer set' },
      { exerciseId: 'push-ups', sets: 2, repsOrDuration: 8, unit: 'reps', restDuration: 45, targetNote: 'Primer set' },
      { exerciseId: 'glute-bridges', sets: 2, repsOrDuration: 12, unit: 'reps', restDuration: 45 }
    ],
    morningRoutine: {
      title: 'Victory Walk',
      durationMinutes: 15,
      description: 'Reflect on 30 days of commitment and discipline.',
      exercises: ['15 min walk']
    }
  }
];

// Helper to compute local calendar date for a given day
export function getDateForDay(startDateStr: string, dayNumber: number): Date {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + (dayNumber - 1));
  return date;
}

export function formatDatePretty(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Calculate current challenge day from start date (1 to 30, or clamped)
export function getCurrentChallengeDay(startDateStr: string): number {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  start.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1; // Not started yet, on day 1
  if (diffDays >= 30) return 30; // Finished, clamp to day 30
  return diffDays + 1; // 1 to 30
}
