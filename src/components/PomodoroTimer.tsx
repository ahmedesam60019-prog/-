import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings2, 
  CheckCircle2, 
  Target, 
  Coffee, 
  Sparkles,
  Volume2,
  Bell,
  BellRing,
  BellOff
} from 'lucide-react';
import { PomodoroMode, PomodoroSettings, Task } from '../types';
import { soundManager } from '../utils/audio';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  notifySessionEnd,
  sendDesktopNotification
} from '../utils/notifications';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  tasks: Task[];
  onCompletePomodoroSession: (mode: PomodoroMode, durationMinutes: number, taskId?: string) => void;
  selectedTaskId?: string;
  onSelectTask: (taskId?: string) => void;
  onOpenAmbientModal: () => void;
  todayCompletedCount: number;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  settings,
  onUpdateSettings,
  tasks,
  onCompletePomodoroSession,
  selectedTaskId,
  onSelectTask,
  onOpenAmbientModal,
  todayCompletedCount,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.focusTime * 60);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Settings form local state
  const [localFocusTime, setLocalFocusTime] = useState(settings.focusTime);
  const [localShortBreak, setLocalShortBreak] = useState(settings.shortBreakTime);
  const [localLongBreak, setLocalLongBreak] = useState(settings.longBreakTime);
  const [localSound, setLocalSound] = useState(settings.soundEnabled);
  const [localDesktopNotifications, setLocalDesktopNotifications] = useState(
    settings.desktopNotificationsEnabled ?? true
  );

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Total seconds for current mode
  const getTotalSecondsForMode = (m: PomodoroMode): number => {
    switch (m) {
      case 'focus':
        return settings.focusTime * 60;
      case 'shortBreak':
        return settings.shortBreakTime * 60;
      case 'longBreak':
        return settings.longBreakTime * 60;
    }
  };

  const totalSeconds = getTotalSecondsForMode(mode);

  // Update seconds when settings change and timer is paused
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(getTotalSecondsForMode(mode));
    }
  }, [settings, mode]);

  // Interval timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTaskId]);

  const handleSessionEnd = () => {
    setIsRunning(false);

    // Play chime sound if enabled
    if (settings.soundEnabled) {
      soundManager.playChime();
    }

    // Calculate next mode
    const nextMode =
      mode === 'focus'
        ? (todayCompletedCount + 1) % settings.longBreakInterval === 0
          ? 'longBreak'
          : 'shortBreak'
        : 'focus';

    // Dispatch desktop notification if enabled
    if (settings.desktopNotificationsEnabled) {
      notifySessionEnd(mode, nextMode, activeTask?.title);
    }

    const duration = mode === 'focus' ? settings.focusTime : (mode === 'shortBreak' ? settings.shortBreakTime : settings.longBreakTime);
    onCompletePomodoroSession(mode, duration, selectedTaskId);

    // Auto transition
    setMode(nextMode);
    setSecondsLeft(getTotalSecondsForMode(nextMode));
  };

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(getTotalSecondsForMode(newMode));
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(getTotalSecondsForMode(mode));
  };

  const skipTimer = () => {
    handleSessionEnd();
  };

  // Time format MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Keep browser tab title synchronized with timer progress
  useEffect(() => {
    if (isRunning) {
      const modeText = mode === 'focus' ? '🎯 تركيز' : '☕ استراحة';
      document.title = `(${formattedTime}) ${modeText} - ذاكرلي`;
    } else {
      document.title = 'ذاكرلي - منصة المذاكرة والتركيز الذكية';
    }

    return () => {
      document.title = 'ذاكرلي - منصة المذاكرة والتركيز الذكية';
    };
  }, [isRunning, formattedTime, mode]);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(getNotificationPermission());
    if (granted) {
      sendDesktopNotification({
        title: '🔔 تم تفعيل إشعارات ذاكرلي بنجاح!',
        body: 'ستتلقى تنبيهاً فورياً عند انتهاء جلسات التركيز والاستراحة حتى لو كنت تتصفح نافذة أخرى.',
      });
    }
  };

  const handleSendTestNotification = () => {
    setTestNotificationSent(true);
    sendDesktopNotification({
      title: '🔔 إشعار تجريبي من ذاكرلي',
      body: 'هذا نموذج للإشعار الذي سيظهر لك عند انتهاء وقت الجلسة أو الاستراحة.',
    });
    setTimeout(() => setTestNotificationSent(false), 2500);
  };

  // SVG progress circle calculation
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsLeft / totalSeconds) * circumference;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PomodoroSettings = {
      ...settings,
      focusTime: Math.max(1, localFocusTime),
      shortBreakTime: Math.max(1, localShortBreak),
      longBreakTime: Math.max(1, localLongBreak),
      soundEnabled: localSound,
      desktopNotificationsEnabled: localDesktopNotifications,
    };
    onUpdateSettings(updated);
    setShowSettingsModal(false);
    if (!isRunning) {
      if (mode === 'focus') setSecondsLeft(updated.focusTime * 60);
      else if (mode === 'shortBreak') setSecondsLeft(updated.shortBreakTime * 60);
      else setSecondsLeft(updated.longBreakTime * 60);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Mode Segmented Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => switchMode('focus')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>جلسة تركيز ({settings.focusTime} د)</span>
          </button>

          <button
            onClick={() => switchMode('shortBreak')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'shortBreak'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>استراحة قصيرة ({settings.shortBreakTime} د)</span>
          </button>

          <button
            onClick={() => switchMode('longBreak')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'longBreak'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>استراحة مطولة ({settings.longBreakTime} د)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenAmbientModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>أصوات هادئة</span>
          </button>

          <button
            onClick={handleRequestPermission}
            title={
              notificationPermission === 'granted'
                ? 'إشعارات سطح المكتب مفعّلة بنجاح ✓'
                : notificationPermission === 'denied'
                ? 'إشعارات المتصفح محظورة في إعدادات المتصفح'
                : 'انقر لتفعيل إشعارات سطح المكتب عند انتهاء الجلسات'
            }
            className={`p-2 rounded-xl transition-colors ${
              notificationPermission === 'granted'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                : notificationPermission === 'denied'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200/60 dark:border-rose-800/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : notificationPermission === 'denied' ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <BellRing className="w-4 h-4 text-indigo-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            title="تخصيص أوقات الجلسات والإشعارات"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Notification Prompt Strip if not yet configured */}
      {notificationPermission === 'default' && isNotificationSupported() && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              فعّل إشعارات سطح المكتب لتصلك تنبيهات انتهاء وقت الجلسة والاستراحة، حتى أثناء تصفحك لنافذة أو تطبيق آخر.
            </span>
          </div>
          <button
            onClick={handleRequestPermission}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs whitespace-nowrap self-end sm:self-auto"
          >
            تفعيل الإشعارات الآن
          </button>
        </div>
      )}

      {/* Main Focus Stage */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Subtle background glow depending on mode */}
        <div 
          className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors ${
            mode === 'focus' ? 'bg-indigo-500' : (mode === 'shortBreak' ? 'bg-teal-500' : 'bg-sky-500')
          }`} 
        />

        {/* Circular Progress Timer */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className={`transition-all duration-500 ease-linear ${
                mode === 'focus' 
                  ? 'text-indigo-600' 
                  : (mode === 'shortBreak' ? 'text-teal-500' : 'text-sky-500')
              }`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock & Subtitle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formattedTime}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
              {mode === 'focus' ? 'تركيز وانتباه عميق' : (mode === 'shortBreak' ? 'استراحة وتجديد نشاط' : 'استراحة مطولة مستحقة')}
            </span>
            
            {activeTask && (
              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 max-w-[220px]">
                <Target className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                  {activeTask.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            title="إعادة تعيين المؤقت"
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-3 text-white shadow-md transition-all transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700'
                : (mode === 'focus' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700')
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>ابدأ الآن</span>
              </>
            )}
          </button>

          <button
            onClick={skipTimer}
            title="تخطي الجلسة الحالية"
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all transform active:scale-95"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Task Linker & Selector Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 w-full max-w-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ربط الجلسة بمهمة دراسية:
            </span>
            <select
              value={selectedTaskId || ''}
              onChange={(e) => onSelectTask(e.target.value || undefined)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            >
              <option value="">بدون مهمة محددة (مذاكرة عامة)</option>
              {tasks.filter(t => !t.completed).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subject}: {t.title} ({t.completedPomodoros}/{t.estimatedPomodoros})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Daily Progress & Motivation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              جلسات اليوم المكتملة
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {todayCompletedCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                / هدف 6 جلسات
              </span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              إجمالي وقت التركيز اليوم
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {todayCompletedCount * settings.focusTime}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                دقيقة تركيز
              </span>
            </div>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
              الاستراحة الطويلة القادمة
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                بعد {Math.max(1, settings.longBreakInterval - (todayCompletedCount % settings.longBreakInterval))} جلسات
              </span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Coffee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5" dir="rtl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              إعدادات مؤقت المذاكرة
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  مدة جلسة التركيز (بالدقائق)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={localFocusTime}
                  onChange={(e) => setLocalFocusTime(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  مدة الاستراحة القصيرة (بالدقائق)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localShortBreak}
                  onChange={(e) => setLocalShortBreak(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  مدة الاستراحة الطويلة (بالدقائق)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={localLongBreak}
                  onChange={(e) => setLocalLongBreak(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  تنبيه صوتي هادئ عند انتهاء الجلسة
                </span>
                <input
                  type="checkbox"
                  checked={localSound}
                  onChange={(e) => setLocalSound(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {/* Desktop Notifications Toggle & Permission Tester */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      إشعارات سطح المكتب (Desktop Notifications)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      تنبيه فوري يظهر على الشاشة حتى لو كانت هذه الصفحة في الخلفية
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localDesktopNotifications}
                    onChange={(e) => setLocalDesktopNotifications(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">حالة إذن المتصفح:</span>
                    {notificationPermission === 'granted' ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ممنوح ✓
                      </span>
                    ) : notificationPermission === 'denied' ? (
                      <span className="font-bold text-rose-500">
                        محظور في المتصفح ❌
                      </span>
                    ) : (
                      <span className="font-bold text-amber-500">
                        يحتاج إذناً ⚠️
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {notificationPermission !== 'granted' ? (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                      >
                        طلب الإذن
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendTestNotification}
                        disabled={testNotificationSent}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {testNotificationSent ? 'تم الإرسال!' : 'تجربة إشعار'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
