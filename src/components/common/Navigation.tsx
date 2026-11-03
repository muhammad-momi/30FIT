import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  BookOpen,
  TrendingUp,
  Award,
  Settings,
  Zap
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'calendar'
  | 'workout'
  | 'library'
  | 'progress'
  | 'assessments'
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentDay: number;
  overallProgress: number;
  isWorkoutActive: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  currentDay,
  overallProgress,
  isWorkoutActive
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: '30-Day Calendar', icon: CalendarDays },
    {
      id: 'workout',
      label: "Today's Workout",
      icon: Dumbbell,
      badge: isWorkoutActive ? 'ACTIVE' : `D${currentDay}`
    },
    { id: 'library', label: 'Exercise Library', icon: BookOpen },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR NAVIGATION (hidden on mobile, lg:flex) */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#111317] border-r border-white/5 h-screen sticky top-0 p-5 select-none z-30">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bef264] to-[#84cc16] flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.35)]">
            <Zap size={22} className="text-black fill-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white flex items-center">
              30<span className="text-[#a3e635]">FIT</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Build Discipline</p>
          </div>
        </div>

        {/* Challenge Day Status Pill */}
        <div className="mb-6 p-3 rounded-xl bg-[#16191f] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Current Pace</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>Day {String(currentDay).padStart(2, '0')}</span>
              <span className="text-white/30">/</span>
              <span className="text-white/60">30</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#a3e635] font-bold">{Math.round(overallProgress)}% Done</div>
            <div className="w-16 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[#a3e635] rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#a3e635] text-black font-semibold shadow-[0_0_15px_rgba(163,230,53,0.25)]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={isActive ? 'text-black' : 'text-white/50 group-hover:text-white transition'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-black/20 text-black'
                        : isWorkoutActive
                        ? 'bg-[#a3e635]/20 text-[#a3e635] animate-pulse border border-[#a3e635]/40'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/5 text-[11px] text-white/40 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            Local-First Mode
          </span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (hidden on desktop, lg:hidden) */}
      {/* ======================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0d0f12]/95 backdrop-blur-xl border-t border-white/10 z-40 px-2 py-1.5 safe-bottom">
        <div className="flex items-center justify-around">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'calendar', label: 'Calendar', icon: CalendarDays },
            {
              id: 'workout',
              label: 'Train',
              icon: Dumbbell,
              isSpecial: true,
              badge: isWorkoutActive ? '●' : undefined
            },
            { id: 'library', label: 'Library', icon: BookOpen },
            { id: 'progress', label: 'Stats', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            if (item.isSpecial) {
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as NavTab)}
                  className="flex flex-col items-center relative -top-3 focus:outline-none"
                  aria-label={item.label}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                      isActive || isWorkoutActive
                        ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.4)]'
                        : 'bg-[#1e232b] text-[#a3e635] border border-white/10'
                    }`}
                  >
                    <Icon size={22} className={isActive || isWorkoutActive ? 'text-black' : 'text-[#a3e635]'} />
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1 ${
                      isActive ? 'text-[#a3e635]' : 'text-white/60'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-all ${
                  isActive ? 'text-[#a3e635]' : 'text-white/50 hover:text-white'
                }`}
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon size={19} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#a3e635] animate-ping" />
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
