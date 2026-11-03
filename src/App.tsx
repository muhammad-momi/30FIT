import React, { useState, useEffect, useCallback } from 'react';
import type { NavTab } from './components/common/Navigation';
import { Navigation } from './components/common/Navigation';
import { DashboardView } from './features/dashboard/DashboardView';
import { CalendarView } from './features/calendar/CalendarView';
import { WorkoutView } from './features/workout/WorkoutView';
import { LibraryView } from './features/exercise-library/LibraryView';
import { ProgressView } from './features/progress/ProgressView';
import { AssessmentsView } from './features/assessments/AssessmentsView';
import { SettingsView } from './features/settings/SettingsView';
import { getUserSettings, db, DEFAULT_SETTINGS, updateUserSettings } from './services/db';
import { getCurrentChallengeDay, WORKOUT_DAYS } from './data/program';
import type { UserSettings, WorkoutSession } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load database state
  const loadAppData = useCallback(async () => {
    try {
      const userSettings = await getUserSettings();
      setSettings(userSettings);

      const allSessions = await db.sessions.toArray();
      setSessions(allSessions);

      const day = getCurrentChallengeDay(userSettings.challengeStartDate);
      setActiveWorkoutDay(day);
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  const currentChallengeDay = getCurrentChallengeDay(settings.challengeStartDate);

  // Compute overall progress
  const completedEveningSessions = sessions.filter(s => s.isCompleted && s.sessionType === 'evening');
  const completedDayNumbers = new Set(completedEveningSessions.map(s => s.dayNumber));
  const trainingDaysCount = WORKOUT_DAYS.filter(d => !d.isRecovery).length;
  const overallProgress = Math.round((completedDayNumbers.size / trainingDaysCount) * 100);

  // Launch Workout
  const handleStartWorkout = (dayNumber: number) => {
    setActiveWorkoutDay(dayNumber);
    setIsWorkoutActive(true);
    setCurrentTab('workout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Finish Workout Session
  const handleFinishWorkout = async (_session: WorkoutSession) => {
    setIsWorkoutActive(false);
    await loadAppData();
    setCurrentTab('progress');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exit Workout
  const handleExitWorkout = () => {
    setIsWorkoutActive(false);
    setCurrentTab('dashboard');
  };

  // Morning routine toggle
  const handleToggleMorningDay = async (dayNumber: number) => {
    const currentCompleted = settings.completedMorningDays || [];
    let updated: number[];
    if (currentCompleted.includes(dayNumber)) {
      updated = currentCompleted.filter(d => d !== dayNumber);
    } else {
      updated = [...currentCompleted, dayNumber];
    }
    const newSettings = await updateUserSettings({ completedMorningDays: updated });
    setSettings(newSettings);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#a3e635] animate-spin flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.4)]" />
          <span className="text-xs font-bold tracking-widest text-white/50 uppercase">Loading 30FIT...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col lg:flex-row antialiased">
      {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'workout' && !isWorkoutActive) {
            handleStartWorkout(currentChallengeDay);
          } else {
            setCurrentTab(tab);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentDay={currentChallengeDay}
        overallProgress={overallProgress}
        isWorkoutActive={isWorkoutActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-screen px-4 sm:px-6 lg:px-8 pt-4 pb-28 lg:pb-8 max-w-7xl mx-auto">
        {currentTab === 'dashboard' && (
          <DashboardView
            currentDay={currentChallengeDay}
            settings={settings}
            sessions={sessions}
            onStartWorkout={handleStartWorkout}
            onNavigate={(tab) => {
              if (tab === 'workout') {
                handleStartWorkout(currentChallengeDay);
              } else {
                setCurrentTab(tab);
              }
            }}
            onToggleMorningDay={handleToggleMorningDay}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            currentDay={currentChallengeDay}
            settings={settings}
            sessions={sessions}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {currentTab === 'workout' && (
          <WorkoutView
            dayNumber={activeWorkoutDay}
            settings={settings}
            onFinishWorkout={handleFinishWorkout}
            onExit={handleExitWorkout}
          />
        )}

        {currentTab === 'library' && <LibraryView />}

        {currentTab === 'progress' && (
          <ProgressView
            sessions={sessions}
            settings={settings}
            currentDay={currentChallengeDay}
            onRefreshSessions={loadAppData}
          />
        )}

        {currentTab === 'assessments' && (
          <AssessmentsView
            currentDay={currentChallengeDay}
            settings={settings}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            sessions={sessions}
            onRefreshData={loadAppData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
