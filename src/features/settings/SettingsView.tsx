import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Vibrate,
  Calendar,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Bell,
  ShieldCheck,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import type { UserSettings, WorkoutSession, AssessmentRecord } from '../../types';
import { updateUserSettings, db, DEFAULT_SETTINGS } from '../../services/db';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  sessions: WorkoutSession[];
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  sessions,
  onRefreshData
}) => {
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Backup Import State
  const [importPreview, setImportPreview] = useState<{
    sessionsCount: number;
    assessmentsCount: number;
    settingsFound: boolean;
    data: {
      settings: UserSettings;
      sessions: WorkoutSession[];
      assessments: AssessmentRecord[];
    };
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleUpdate = async (partial: Partial<UserSettings>) => {
    const updated = await updateUserSettings(partial);
    onUpdateSettings(updated);
    showToast('Preferences updated');
  };

  // Notification Permission Request (only when explicitly enabled)
  const handleToggleReminder = async (type: 'morning' | 'evening', enabled: boolean) => {
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast('Notification permission was denied');
          return;
        }
      }
    }
    if (type === 'morning') {
      handleUpdate({ morningReminderEnabled: enabled });
    } else {
      handleUpdate({ eveningReminderEnabled: enabled });
    }
  };

  // EXPORT JSON BACKUP
  const handleExportJson = async () => {
    try {
      const allSessions = await db.sessions.toArray();
      const allAssessments = await db.assessments.toArray();
      const currentSettings = settings;

      const exportPayload = {
        app: '30FIT',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        settings: currentSettings,
        sessions: allSessions,
        assessments: allAssessments
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `30FIT-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast(`Backup exported as ${filename}`);
    } catch (err) {
      console.error('Failed to export backup:', err);
      showToast('Error exporting backup file');
    }
  };

  // EXPORT CSV
  const handleExportCsv = async () => {
    try {
      const allSessions = await db.sessions.toArray();
      if (allSessions.length === 0) {
        showToast('No workout records available to export.');
        return;
      }

      const headers = ['SessionID', 'DayNumber', 'DateCompleted', 'TotalDurationSeconds', 'ActiveDurationSeconds', 'IsCompleted', 'ExerciseCount'];
      const rows = allSessions.map(s => [
        s.id,
        s.dayNumber,
        s.dateCompleted,
        s.totalDurationSeconds,
        s.activeDurationSeconds,
        s.isCompleted,
        s.exercises?.length || 0
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const downloadAnchor = document.createElement('a');
      const filename = `30FIT-workout-history-${new Date().toISOString().split('T')[0]}.csv`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Workout history exported as CSV');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      showToast('Error exporting CSV');
    }
  };

  // IMPORT JSON BACKUP (File Picker)
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || parsed.app !== '30FIT' || !parsed.sessions || !parsed.settings) {
          throw new Error('Invalid 30FIT backup structure. Please provide a verified 30FIT JSON export.');
        }

        setImportPreview({
          sessionsCount: parsed.sessions?.length || 0,
          assessmentsCount: parsed.assessments?.length || 0,
          settingsFound: !!parsed.settings,
          data: parsed
        });
      } catch (err: unknown) {
        setImportError((err as Error).message || 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  // CONFIRM IMPORT
  const handleConfirmImport = async () => {
    if (!importPreview) return;
    try {
      // Clear and restore tables
      await db.sessions.clear();
      await db.assessments.clear();

      if (importPreview.data.sessions.length > 0) {
        // Strip auto-increment ids to avoid key collision
        const cleanSessions = importPreview.data.sessions.map(sess => {
          const s = { ...sess };
          delete s.id;
          return s as WorkoutSession;
        });
        await db.sessions.bulkAdd(cleanSessions);
      }

      if (importPreview.data.assessments?.length > 0) {
        const cleanAssessments = importPreview.data.assessments.map(ass => {
          const a = { ...ass };
          delete a.id;
          return a as AssessmentRecord;
        });
        await db.assessments.bulkAdd(cleanAssessments);
      }

      if (importPreview.data.settings) {
        await db.settings.put(importPreview.data.settings);
        onUpdateSettings(importPreview.data.settings);
      }

      setImportPreview(null);
      onRefreshData();
      showToast('Backup restored successfully!');
    } catch (err) {
      console.error('Failed to restore backup:', err);
      setImportError('Failed to write data into database.');
    }
  };

  // RESET CHALLENGE / CLEAR DATA
  const handleClearAllData = async () => {
    const confirm = window.confirm(
      'WARNING: This will permanently delete all your local workout history, assessments, and reset your progress. Are you sure you want to proceed?'
    );
    if (!confirm) return;

    try {
      await db.sessions.clear();
      await db.assessments.clear();
      await db.settings.put(DEFAULT_SETTINGS);
      onUpdateSettings(DEFAULT_SETTINGS);
      onRefreshData();
      showToast('All data cleared and challenge reset');
    } catch (err) {
      console.error('Failed to clear database:', err);
      showToast('Error resetting database');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 lg:pb-12 animate-fadeIn select-none">
      {/* Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon size={26} className="text-[#a3e635]" />
            <span>APPLICATION SETTINGS</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Configure training parameters, challenge start dates, timers, backups, and privacy.
          </p>
        </div>

        {saveToast && (
          <div className="px-3 py-1.5 rounded-xl bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 text-xs font-bold animate-fadeIn">
            {saveToast}
          </div>
        )}
      </div>

      {/* 1. CHALLENGE TIMING & DATE CONFIG */}
      <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#a3e635]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Challenge Timing</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-white/80">Challenge Start Date</label>
            <input
              type="date"
              value={settings.challengeStartDate}
              onChange={e => handleUpdate({ challengeStartDate: e.target.value })}
              className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#a3e635]"
            />
            <p className="text-[11px] text-white/40">
              Default is Monday, 2 Nov 2026. Adjust to any date to align the 30-day challenge with your actual schedule.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Active Program</span>
            <div className="text-sm font-bold text-white">30-Day Bodyweight Transformation</div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              3 Phases • 10 Days each • 26 Training sessions + 4 Scheduled active recovery days.
            </p>
          </div>
        </div>
      </div>

      {/* 2. WORKOUT PREFERENCES */}
      <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workout Engine Preferences</h3>

        <div className="space-y-3.5 text-xs">
          {/* Default Rest Timer Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white/5">
            <div>
              <span className="font-semibold text-white">Default Rest Timer Duration</span>
              <p className="text-[11px] text-white/50">Auto-countdown timer between sets</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[30, 45, 60, 90, 120].map(secs => (
                <button
                  key={secs}
                  onClick={() => handleUpdate({ defaultRestDuration: secs })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    settings.defaultRestDuration === secs
                      ? 'bg-[#a3e635] text-black'
                      : 'bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
          </div>

          {/* Sound Notification Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? <Volume2 size={16} className="text-[#a3e635]" /> : <VolumeX size={16} className="text-white/40" />}
              <div>
                <span className="font-semibold text-white">Synthesizer Sound Effects</span>
                <p className="text-[11px] text-white/50">Local Web Audio API tones for countdowns and completion</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={e => handleUpdate({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#a3e635] cursor-pointer"
            />
          </div>

          {/* Voice Coach Announcements Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div className="flex items-center gap-2.5">
              <Volume2 size={16} className={settings.voiceEnabled ? 'text-[#a3e635]' : 'text-white/40'} />
              <div>
                <span className="font-semibold text-white">Voice Coach Announcements</span>
                <p className="text-[11px] text-white/50">Hands-free voice cues for exercise start, rest countdowns, and completion (offline speech synthesis)</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceEnabled ?? true}
              onChange={e => handleUpdate({ voiceEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#a3e635] cursor-pointer"
            />
          </div>

          {/* Repetition Pace Multiplier Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white/5">
            <div>
              <span className="font-semibold text-white">Exercise Repetition Pacing</span>
              <p className="text-[11px] text-white/50">Adjusts countdown timer pace for rep exercises without changing target repetitions</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Fast (0.8x)', val: 0.8 },
                { label: 'Normal (1.0x)', val: 1.0 },
                { label: 'Relaxed (1.25x)', val: 1.25 },
                { label: 'Slow (1.5x)', val: 1.5 }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => handleUpdate({ repPaceMultiplier: opt.val })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    (settings.repPaceMultiplier || 1.0) === opt.val
                      ? 'bg-[#a3e635] text-black font-bold'
                      : 'bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div className="flex items-center gap-2.5">
              <Vibrate size={16} className="text-[#a3e635]" />
              <div>
                <span className="font-semibold text-white">Haptic Vibration Feedback</span>
                <p className="text-[11px] text-white/50">Vibrate on mobile devices when timer expires</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={e => handleUpdate({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#a3e635] cursor-pointer"
            />
          </div>

          {/* Screen Wake Lock Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div className="flex items-center gap-2.5">
              <Smartphone size={16} className="text-[#a3e635]" />
              <div>
                <span className="font-semibold text-white">Keep Screen Awake During Workout</span>
                <p className="text-[11px] text-white/50">Prevents phone or laptop display from sleeping</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.wakeLockEnabled}
              onChange={e => handleUpdate({ wakeLockEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#a3e635] cursor-pointer"
            />
          </div>

          {/* Animation Speed Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white/5">
            <div>
              <span className="font-semibold text-white">Exercise Demonstration Speed</span>
              <p className="text-[11px] text-white/50">Playback speed multiplier for all 38 movement animations</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0.5, 1, 1.5].map(spd => (
                <button
                  key={spd}
                  onClick={() => handleUpdate({ animationSpeed: spd })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    settings.animationSpeed === spd
                      ? 'bg-[#a3e635] text-black font-bold'
                      : 'bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. WORKOUT REMINDERS */}
      <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#a3e635]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workout Reminders</h3>
        </div>

        <div className="space-y-3 text-xs">
          {/* Morning reminder */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div>
              <span className="font-semibold text-white">Morning Awakening Reminder</span>
              <p className="text-[11px] text-white/50">Daily notification for light morning mobility and walk</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.morningReminderTime || '07:30'}
                onChange={e => handleUpdate({ morningReminderTime: e.target.value })}
                className="bg-[#0d0f12] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-xs"
              />
              <input
                type="checkbox"
                checked={settings.morningReminderEnabled}
                onChange={e => handleToggleReminder('morning', e.target.checked)}
                className="w-4 h-4 accent-[#a3e635] cursor-pointer"
              />
            </div>
          </div>

          {/* Evening reminder */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div>
              <span className="font-semibold text-white">Evening Main Training Reminder</span>
              <p className="text-[11px] text-white/50">Daily notification for programmed strength or conditioning workout</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.eveningReminderTime || '18:30'}
                onChange={e => handleUpdate({ eveningReminderTime: e.target.value })}
                className="bg-[#0d0f12] border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-xs"
              />
              <input
                type="checkbox"
                checked={settings.eveningReminderEnabled}
                onChange={e => handleToggleReminder('evening', e.target.checked)}
                className="w-4 h-4 accent-[#a3e635] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. LOCAL BACKUP & RESTORE (CRITICAL LOCAL-FIRST REQUIREMENT) */}
      <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Data Management & Local Backups
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Your records are stored securely in your browser's IndexedDB ({sessions.length} sessions stored). Export to preserve or transfer between devices.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/20 px-2.5 py-1 rounded-xl">
            {sessions.length} Saved
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#a3e635]/15 hover:bg-[#a3e635]/25 border border-[#a3e635]/30 text-[#a3e635] text-xs font-bold transition shadow-sm"
          >
            <Download size={16} />
            <span>Export JSON Backup</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 hover:text-white text-xs font-bold transition"
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV History</span>
          </button>

          {/* Import JSON File Input */}
          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/80 hover:text-white text-xs font-bold transition cursor-pointer">
            <Upload size={16} />
            <span>Import JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {importError && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
            {importError}
          </div>
        )}

        {/* Import Preview Modal */}
        {importPreview && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Valid 30FIT Backup Detected
              </span>
              <button
                onClick={() => setImportPreview(null)}
                className="text-white/40 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-black/40">
                <span className="text-white/40 block">Workouts</span>
                <span className="text-white font-bold">{importPreview.sessionsCount} sessions</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40">
                <span className="text-white/40 block">Assessments</span>
                <span className="text-white font-bold">{importPreview.assessmentsCount} tests</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40">
                <span className="text-white/40 block">Preferences</span>
                <span className="text-white font-bold">Included</span>
              </div>
            </div>
            <button
              onClick={handleConfirmImport}
              className="w-full py-2.5 rounded-xl bg-[#22c55e] text-black font-black text-xs hover:bg-[#16a34a] transition"
            >
              Restore Complete Challenge Data
            </button>
          </div>
        )}

        {/* Clear Data & Reset */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white/80">Reset Challenge & Wipe Storage</span>
            <p className="text-[11px] text-white/40">Permanently deletes local sessions and resets to Day 1</p>
          </div>
          <button
            onClick={handleClearAllData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition"
          >
            <Trash2 size={14} />
            <span>Reset Challenge</span>
          </button>
        </div>
      </div>

      {/* 4. PRIVACY & SECURITY STATEMENT */}
      <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#a3e635]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Privacy & Zero-Tracking Guarantee</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-white/70 leading-relaxed">
          <p>
            <strong>100% Local-First Architecture: </strong> 30FIT contains zero accounts, zero registrations, zero analytics, zero cookies, zero third-party tracking, and zero cloud databases.
          </p>
          <p>
            All workout records, assessment benchmarks, timers, and animations execute locally on your device hardware. No workout metrics ever leave your browser or computer.
          </p>
        </div>
      </div>

      {/* 5. ABOUT */}
      <div className="p-5 rounded-3xl bg-[#16191f] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-white/50">
        <div>
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            30<span className="text-[#a3e635]">FIT</span> — 30-Day Bodyweight Challenge
          </span>
          <p className="text-[11px] text-white/40 mt-0.5">Build Strength. Build Discipline. Offline-First PWA.</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-white/60">Version 1.0.0</span>
          <p className="text-[10px] text-white/40 mt-0.5">Standalone Web Application</p>
        </div>
      </div>
    </div>
  );
};
