import Dexie, { type Table } from 'dexie';
import type { WorkoutSession, AssessmentRecord, UserSettings, ActiveWorkoutState } from '../types';

export class FitDatabase extends Dexie {
  sessions!: Table<WorkoutSession, number>;
  assessments!: Table<AssessmentRecord, number>;
  settings!: Table<UserSettings, string>;
  activeWorkout!: Table<{ id: string; state: ActiveWorkoutState }, string>;

  constructor() {
    super('ThirtyFitDB');
    this.version(1).stores({
      sessions: '++id, dayNumber, dateCompleted, isCompleted, sessionType',
      assessments: '++id, dayNumber, date',
      settings: 'id',
      activeWorkout: 'id'
    });
  }
}

export const db = new FitDatabase();

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'default',
  theme: 'dark',
  challengeStartDate: '2026-11-02', // Monday, 2 Nov 2026 default
  defaultRestDuration: 60,
  soundEnabled: true,
  vibrationEnabled: true,
  wakeLockEnabled: true,
  reducedMotion: false,
  animationSpeed: 1,
  morningReminderEnabled: false,
  morningReminderTime: '07:30',
  eveningReminderEnabled: false,
  eveningReminderTime: '18:30',
  installedPwaPromptDismissed: false,
  completedMorningDays: []
};

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const existing = await db.settings.get('default');
    if (existing) {
      return { ...DEFAULT_SETTINGS, ...existing };
    }
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.error('Failed to load settings from IndexedDB:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateUserSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getUserSettings();
  const updated = { ...current, ...partial };
  await db.settings.put(updated);
  return updated;
}
