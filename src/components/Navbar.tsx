import React from 'react';
import { 
  Home,
  Timer, 
  Layers, 
  CheckSquare, 
  Calendar, 
  CalendarDays,
  Sparkles, 
  BarChart3, 
  Flame, 
  Sun, 
  Moon,
  Volume2
} from 'lucide-react';

export type TabType = 'home' | 'timer' | 'flashcards' | 'planner' | 'calendar' | 'exams' | 'ai' | 'analytics';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  streak: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenAmbientModal: () => void;
  isAmbientActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streak,
  darkMode,
  setDarkMode,
  onOpenAmbientModal,
  isAmbientActive,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-4 h-4" /> },
    { id: 'timer', label: 'مؤقت التركيز', icon: <Timer className="w-4 h-4" /> },
    { id: 'flashcards', label: 'بطاقات الاستذكار', icon: <Layers className="w-4 h-4" /> },
    { id: 'planner', label: 'جدول المهام', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'calendar', label: 'التقويم الشهري', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'exams', label: 'الاختبارات والمواعيد', icon: <Calendar className="w-4 h-4" /> },
    { id: 'ai', label: 'المعلم الذكي والملخصات', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'analytics', label: 'الإحصائيات', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-right group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
                <span className="font-bold text-lg font-mono">ذ</span>
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none block">
                  ذاكرلي
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none block mt-0.5">
                  منصة المذاكرة الذكية
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Utility & Primary Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Ambient Sound Controller */}
            <button
              onClick={onOpenAmbientModal}
              title="أصوات التركيز المحيطية (مطر، أمواج، ضوضاء بيضاء)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                isAmbientActive
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isAmbientActive ? 'animate-pulse text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">أصوات التركيز</span>
            </button>

            {/* Streak Counter */}
            <div 
              title={`استمرارية المذاكرة: ${streak} أيام متتالية`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="tabular-nums font-bold">{streak}</span>
              <span className="hidden sm:inline">أيام</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Subnav (Horizontal scrollable bar for smaller screens) */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
