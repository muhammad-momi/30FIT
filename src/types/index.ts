export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Glutes'
  | 'Calves'
  | 'Core'
  | 'Cardio'
  | 'Full Body'
  | 'Mobility';

export type Category = 'Upper Body' | 'Lower Body' | 'Core' | 'Full Body' | 'Cardio' | 'Stretching';

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  primaryMuscles: MuscleGroup[];
  supportingMuscles: MuscleGroup[];
  difficulty: Difficulty;
  isTimed: boolean;
  defaultSets: number;
  defaultRepsOrDuration: number; // reps or seconds
  unit: 'reps' | 'seconds';
  restRecommendation: number; // seconds
  instructions: {
    startingPosition: string;
    movement: string;
    breathing: string;
    commonMistakes: string[];
  };
  hasEquipmentAlternative?: boolean;
  equipmentAlternativeNotice?: string;
  alternativeExerciseId?: string;
}

export type WorkoutType =
  | 'Workout A'
  | 'Workout B'
  | 'Light cardio + core'
  | 'Conditioning'
  | 'Recovery'
  | 'Light full-body + assessment'
  | 'Light workout + assessment'
  | 'Final assessment';

export interface ScheduledExercise {
  exerciseId: string;
  sets: number;
  repsOrDuration: number;
  unit: 'reps' | 'seconds';
  restDuration: number; // seconds
  targetNote?: string;
  alternativeExerciseId?: string;
}

export interface WorkoutDay {
  dayNumber: number; // 1 to 30
  dateOffset: number; // days from challenge start (0 to 29)
  phase: 1 | 2 | 3;
  phaseName: string;
  title: string;
  workoutType: WorkoutType;
  isRecovery: boolean;
  isAssessment: boolean;
  assessmentDayNumber?: 1 | 10 | 20 | 30;
  description: string;
  warmupExercises: ScheduledExercise[];
  mainExercises: ScheduledExercise[];
  cooldownExercises: ScheduledExercise[];
  morningRoutine?: {
    title: string;
    durationMinutes: number;
    description: string;
    exercises: string[];
  };
}

export interface WorkoutSetRecord {
  setNumber: number;
  target: number;
  actual: number;
  completed: boolean;
  skipped: boolean;
}

export interface ExerciseSessionRecord {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSetRecord[];
  skipped: boolean;
}

export interface WorkoutSession {
  id?: number; // IndexedDB auto-increment
  dayNumber: number;
  dateCompleted: string; // ISO date string
  startedAt: string; // ISO string
  finishedAt: string; // ISO string
  totalDurationSeconds: number;
  activeDurationSeconds: number;
  restDurationSeconds: number;
  isCompleted: boolean;
  exercises: ExerciseSessionRecord[];
  sessionType: 'evening' | 'morning';
  notes?: string;
}

export interface ActiveWorkoutState {
  dayNumber: number;
  currentPhase: 'warmup' | 'main' | 'cooldown';
  currentExerciseIndex: number;
  currentSetIndex: number;
  records: {
    [exerciseId: string]: WorkoutSetRecord[];
  };
  startTime: number; // timestamp
  elapsedActiveSeconds: number;
  elapsedRestSeconds: number;
  isPaused: boolean;
  lastTickTimestamp: number;
  restTimer: {
    active: boolean;
    duration: number;
    targetTimestamp: number;
    remaining: number;
  } | null;
  exerciseTimer: {
    active: boolean;
    duration: number;
    targetTimestamp: number;
    remaining: number;
  } | null;
}

export interface AssessmentRecord {
  id?: number;
  dayNumber: 1 | 10 | 20 | 30;
  date: string;
  pushupsMax: number;
  squatsOneMin: number;
  plankMaxSeconds: number;
  legRaisesMax: number;
  jumpingJacksOneMin: number;
  notes?: string;
}

export interface UserSettings {
  id: string; // 'default'
  theme: 'dark' | 'light' | 'system';
  challengeStartDate: string; // YYYY-MM-DD
  defaultRestDuration: number; // seconds
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  wakeLockEnabled: boolean;
  reducedMotion: boolean;
  animationSpeed: number; // 0.5, 1, 1.5
  morningReminderEnabled: boolean;
  morningReminderTime: string; // '07:30'
  eveningReminderEnabled: boolean;
  eveningReminderTime: string; // '18:30'
  installedPwaPromptDismissed: boolean;
  completedMorningDays: number[]; // day numbers where morning routine was marked done
}
