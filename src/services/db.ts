import Dexie, { type Table } from 'dexie';
import type { WorkoutSession, AssessmentRecord, UserSettings, ActiveWorkoutState, SavedWorkoutState } from '../types';

export class FitDatabase extends Dexie {
  sessions!: Table<WorkoutSession, number>;
  assessments!: Table<AssessmentRecord, number>;
  settings!: Table<UserSettings, string>;
  activeWorkout!: Table<{ id: string; state: SavedWorkoutState | ActiveWorkoutState }, string>;

  constructor() {
    super('ThirtyFitDB');
    this.version(1).stores({
      sessions: '++id, dayNumber, dateCompleted, isCompleted, sessionType',
      assessments: '++id, dayNumber, date',
      settings: 'id',
      activeWorkout: 'id'
    });

    // Version 2: Add progression fields to settings
    this.version(2).stores({
      sessions: '++id, dayNumber, dateCompleted, isCompleted, sessionType',
      assessments: '++id, dayNumber, date',
      settings: 'id',
      activeWorkout: 'id'
    }).upgrade(trans => {
      return trans.table('settings').toCollection().modify((setting: any) => {
        if (setting.nextPendingDay === undefined) setting.nextPendingDay = 1;
        if (setting.currentStreak === undefined) setting.currentStreak = 0;
        if (setting.bestStreak === undefined) setting.bestStreak = 0;
        if (setting.missedDays === undefined) setting.missedDays = [];
        if (setting.lastProcessedDate === undefined) setting.lastProcessedDate = '';
      });
    });
  }
}

export const db = new FitDatabase();

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'default',
  theme: 'dark',
  challengeStartDate: '2026-11-02',
  defaultRestDuration: 60,
  soundEnabled: true,
  voiceEnabled: true,
  vibrationEnabled: true,
  wakeLockEnabled: true,
  reducedMotion: false,
  animationSpeed: 1,
  repPaceMultiplier: 1.0,
  morningReminderEnabled: false,
  morningReminderTime: '07:30',
  eveningReminderEnabled: false,
  eveningReminderTime: '18:30',
  installedPwaPromptDismissed: false,
  completedMorningDays: [],
  // New progression fields
  nextPendingDay: 1,
  currentStreak: 0,
  bestStreak: 0,
  missedDays: [],
  lastProcessedDate: ''
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
