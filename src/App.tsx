import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  TabType 
} from './components/Navbar';
import { LandingHome } from './components/LandingHome';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FlashcardManager } from './components/FlashcardManager';
import { StudyPlanner } from './components/StudyPlanner';
import { CalendarView } from './components/CalendarView';
import { ExamCountdown } from './components/ExamCountdown';
import { AiStudyBuddy } from './components/AiStudyBuddy';
import { StudyAnalytics } from './components/StudyAnalytics';
import { AmbientSoundModal } from './components/AmbientSoundModal';
import { 
  StorageService, 
  defaultSettings, 
  initialDecks, 
  initialTasks, 
  initialExams, 
  initialNotes, 
  initialSessions 
} from './utils/storage';
import { soundManager } from './utils/audio';
import { 
  Deck, 
  Task, 
  Exam, 
  StudySessionLog, 
  SavedNote, 
  PomodoroSettings, 
  PomodoroMode 
} from './types';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('zakirly_dark_theme');
    return saved !== null ? saved === 'true' : false;
  });

  // Active navigation tab - defaults to home page
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Application Data States
  const [decks, setDecks] = useState<Deck[]>(StorageService.getDecks);
  const [tasks, setTasks] = useState<Task[]>(StorageService.getTasks);
  const [exams, setExams] = useState<Exam[]>(StorageService.getExams);
  const [sessions, setSessions] = useState<StudySessionLog[]>(StorageService.getSessions);
  const [notes, setNotes] = useState<SavedNote[]>(StorageService.getNotes);
  const [settings, setSettings] = useState<PomodoroSettings>(StorageService.getSettings);
  const [streak, setStreak] = useState<number>(StorageService.getStreak);

  // Active task selection for timer
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Prefilled exam for AI Planner
  const [prefilledPlanExam, setPrefilledPlanExam] = useState<Exam | null>(null);

  // Ambient sound modal state
  const [isAmbientModalOpen, setIsAmbientModalOpen] = useState(false);
  const [hasAmbientActive, setHasAmbientActive] = useState(false);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('zakirly_dark_theme', String(darkMode));
  }, [darkMode]);

  // Check ambient sounds status
  const checkAmbientState = () => {
    const active = ['rain', 'waves', 'whitenoise', 'binaural'].some((id) =>
      soundManager.isPlaying(id)
    );
    setHasAmbientActive(active);
  };

  // Sync state saves
  const handleSaveDecks = (newDecks: Deck[]) => {
    setDecks(newDecks);
    StorageService.saveDecks(newDecks);
  };

  const handleSaveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  const handleSaveExams = (newExams: Exam[]) => {
    setExams(newExams);
    StorageService.saveExams(newExams);
  };

  const handleSaveNotes = (newNotes: SavedNote[]) => {
    setNotes(newNotes);
    StorageService.saveNotes(newNotes);
  };

  const handleUpdateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // When a Pomodoro session completes
  const handleCompletePomodoroSession = (
    mode: PomodoroMode,
    durationMinutes: number,
    taskId?: string
  ) => {
    // 1. Log session
    const newSession: StudySessionLog = {
      id: `s_${Date.now()}`,
      timestamp: new Date().toISOString(),
      durationMinutes,
      mode,
      subject: taskId ? tasks.find((t) => t.id === taskId)?.subject : undefined,
      taskId,
    };
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    StorageService.saveSessions(updatedSessions);

    // 2. If focus mode, increment streak and task completed count
    if (mode === 'focus') {
      const newStreak = StorageService.incrementStreak();
      setStreak(newStreak);

      if (taskId) {
        const updatedTasks = tasks.map((t) => {
          if (t.id === taskId) {
            const nextCompleted = t.completedPomodoros + 1;
            return {
              ...t,
              completedPomodoros: nextCompleted,
              completed: nextCompleted >= t.estimatedPomodoros ? true : t.completed,
            };
          }
          return t;
        });
        handleSaveTasks(updatedTasks);
      }
    }
  };

  // Navigate to timer with task
  const handleStartPomodoroForTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab('timer');
  };

  // Navigate to AI planner with exam
  const handleGeneratePlanForExam = (exam: Exam) => {
    setPrefilledPlanExam(exam);
    setActiveTab('ai');
  };

  // Reset to initial starter data
  const handleResetData = () => {
    setDecks(initialDecks);
    setTasks(initialTasks);
    setExams(initialExams);
    setNotes(initialNotes);
    setSessions(initialSessions);
    setSettings(defaultSettings);
    setStreak(4);

    StorageService.saveDecks(initialDecks);
    StorageService.saveTasks(initialTasks);
    StorageService.saveExams(initialExams);
    StorageService.saveNotes(initialNotes);
    StorageService.saveSessions(initialSessions);
    StorageService.saveSettings(defaultSettings);
    localStorage.removeItem('zakirly_streak_v1');
  };

  // Calculate today's completed focus sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletedCount = sessions.filter(
    (s) => s.mode === 'focus' && s.timestamp.startsWith(todayStr)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={streak}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAmbientModal={() => setIsAmbientModalOpen(true)}
        isAmbientActive={hasAmbientActive}
      />

      {/* Main Viewport Content */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'home' ? 'max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}`}>
        {activeTab === 'home' && (
          <LandingHome
            onNavigateTab={setActiveTab}
            tasks={tasks}
            exams={exams}
            decks={decks}
            sessions={sessions}
            streak={streak}
            todayCompletedCount={todayCompletedCount}
          />
        )}

        {activeTab === 'timer' && (
          <PomodoroTimer
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            tasks={tasks}
            onCompletePomodoroSession={handleCompletePomodoroSession}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onOpenAmbientModal={() => setIsAmbientModalOpen(true)}
            todayCompletedCount={todayCompletedCount}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardManager
            decks={decks}
            onSaveDecks={handleSaveDecks}
            onCardReviewed={() => {}}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            tasks={tasks}
            onSaveTasks={handleSaveTasks}
            onStartPomodoroForTask={handleStartPomodoroForTask}
            onNavigateToCalendar={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            exams={exams}
            onSaveTasks={handleSaveTasks}
            onSaveExams={handleSaveExams}
            onStartPomodoroForTask={handleStartPomodoroForTask}
            onGeneratePlanForExam={handleGeneratePlanForExam}
          />
        )}

        {activeTab === 'exams' && (
          <ExamCountdown
            exams={exams}
            onSaveExams={handleSaveExams}
            onGeneratePlanForExam={handleGeneratePlanForExam}
          />
        )}

        {activeTab === 'ai' && (
          <AiStudyBuddy
            savedNotes={notes}
            onSaveNotes={handleSaveNotes}
            exams={exams}
            prefilledPlanExam={prefilledPlanExam}
            onClearPrefilledExam={() => setPrefilledPlanExam(null)}
          />
        )}

        {activeTab === 'analytics' && (
          <StudyAnalytics
            sessions={sessions}
            tasks={tasks}
            decks={decks}
            streak={streak}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Ambient Sound Controller Modal */}
      <AmbientSoundModal
        isOpen={isAmbientModalOpen}
        onClose={() => setIsAmbientModalOpen(false)}
        onStateChange={checkAmbientState}
      />

      {/* Rich Web Application Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 py-10 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
            {/* Brand column */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  ذ
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  ذاكرلي <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mr-1">Zakirly</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                منصة المذاكرة العربية المتكاملة المصممة لمساعدة الطلاب على التفوق والتركيز العميق عبر دمج أحدث تقنيات العلوم المعرفية والذكاء الاصطناعي.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>بياناتك محفوظة محلياً بنسبة 100%</span>
              </div>
            </div>

            {/* Column: Study Tools */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                أدوات المذاكرة
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('timer')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    مؤقت بومودورو وأصوات التركيز
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('flashcards')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    بطاقات التكرار المتباعد (Spaced Repetition)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('planner')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    مخطط المهام والأهداف اليومية
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('calendar')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    التقويم الشهري ومواعيد الاختبارات
                  </button>
                </li>
              </ul>
            </div>

            {/* Column: Smart AI & Features */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                الذكاء الاصطناعي والتكامل
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('ai')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    مختبر الأسئلة الذكية (Quiz Generator)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('ai')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    شرح فاينمان وتلخيص الدروس
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('calendar')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    تصدير التقويم بتنسيق iCalendar (.ics)
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsAmbientModalOpen(true)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    استوديو الأصوات المحيطية (40Hz & ضوضاء بيضاء)
                  </button>
                </li>
              </ul>
            </div>

            {/* Column: Science & Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                العلوم المعرفية والإعدادات
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                مبني على أبحاث منحنى النسيان لإبينغهاوس، تقنية بومودورو لفرانشيسكو سيريلو، وتأثير الاسترجاع النشط.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  لوحة الإحصائيات
                </button>
                <button
                  onClick={handleResetData}
                  className="px-2.5 py-1 text-xs rounded border border-rose-200 text-rose-600 dark:border-rose-900/60 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="استعادة نماذج البيانات الأولية"
                >
                  إعادة ضبط النماذج
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              جميع الحقوق محفوظة © {new Date().getFullYear()} منصة ذاكرلي التعليمية (Zakirly).
            </div>
            <div className="flex items-center gap-4">
              <span>تنبيهات سطح المكتب مدعومة</span>
              <span>•</span>
              <span>تعمل دون اتصال بالإنترنت (Offline First)</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
