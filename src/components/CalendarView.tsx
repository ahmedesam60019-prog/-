import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckSquare, 
  Square, 
  Play, 
  Plus, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  Target,
  Sparkles,
  Download,
  X
} from 'lucide-react';
import { Task, Exam, Priority } from '../types';
import { IcsExportModal } from './IcsExportModal';
import { exportSingleExam, exportSingleTask } from '../utils/icsExport';

interface CalendarViewProps {
  tasks: Task[];
  exams: Exam[];
  onSaveTasks: (tasks: Task[]) => void;
  onSaveExams: (exams: Exam[]) => void;
  onStartPomodoroForTask: (taskId: string) => void;
  onGeneratePlanForExam: (exam: Exam) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  exams,
  onSaveTasks,
  onSaveExams,
  onStartPomodoroForTask,
  onGeneratePlanForExam,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [filterType, setFilterType] = useState<'all' | 'exams' | 'tasks'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [addCommitmentType, setAddCommitmentType] = useState<'task' | 'exam'>('task');

  // Form states for quick adding from calendar
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newPomodoros, setNewPomodoros] = useState(2);
  const [newTargetGrade, setNewTargetGrade] = useState('95%');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const weekDaysArabic = [
    'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Helper to format Date to YYYY-MM-DD
  const formatDateToYMD = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Build calendar matrix
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  interface CalendarDay {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }

  const calendarDays: CalendarDay[] = [];
  const todayYMD = today.toISOString().split('T')[0];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = formatDateToYMD(prevY, prevM, d);
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayYMD,
      isSelected: dateStr === selectedDateStr,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateToYMD(year, month, d);
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayYMD,
      isSelected: dateStr === selectedDateStr,
    });
  }

  // 3. Next month leading days to complete full grid of 35 or 42
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = formatDateToYMD(nextY, nextM, d);
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayYMD,
      isSelected: dateStr === selectedDateStr,
    });
  }

  // Map commitments by date
  const getCommitmentsForDate = (dateStr: string) => {
    const dayExams = exams.filter((e) => e.date === dateStr);
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    return { dayExams, dayTasks };
  };

  // Selected date commitments
  const { dayExams: selectedExams, dayTasks: selectedTasks } = getCommitmentsForDate(selectedDateStr);

  // Month Statistics
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTasks = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix));
  const monthExams = exams.filter((e) => e.date && e.date.startsWith(monthPrefix));
  const monthCompletedTasks = monthTasks.filter((t) => t.completed).length;
  const monthHoursScheduled = Math.round(
    (monthTasks.reduce((acc, t) => acc + t.estimatedPomodoros * 25, 0) / 60) * 10
  ) / 10;

  // Toggle task from calendar
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onSaveTasks(updated);
  };

  // Add commitment handler
  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (addCommitmentType === 'task') {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        title: newTitle.trim(),
        subject: newSubject.trim() || 'عام',
        priority: newPriority,
        estimatedPomodoros: Math.max(1, newPomodoros),
        completedPomodoros: 0,
        completed: false,
        dueDate: selectedDateStr,
        createdAt: new Date().toISOString(),
      };
      onSaveTasks([newTask, ...tasks]);
    } else {
      const colors = ['#059669', '#4f46e5', '#0284c7', '#d97706', '#e11d48'];
      const newExam: Exam = {
        id: `exam_${Date.now()}`,
        subject: newSubject.trim() || 'عام',
        title: newTitle.trim(),
        date: selectedDateStr,
        targetGrade: newTargetGrade.trim() || '95%',
        progressPercent: 20,
        color: colors[exams.length % colors.length],
      };
      onSaveExams([...exams, newExam]);
    }

    setNewTitle('');
    setNewSubject('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>التقويم الدراسي الشهري والمواعيد</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدول شهري موحد يجمع مواعيد الاختبارات والمهام الدراسية لتنظيم وقتك واستعدادك الأكاديمي
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filter options */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('exams')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'exams'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الاختبارات
            </button>
            <button
              onClick={() => setFilterType('tasks')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'tasks'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              المهام
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            title="تصدير جدول المذاكرة لتقويم Google و Outlook عبر ملف .ics"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">تصدير للتقويم (.ics)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة التزام</span>
          </button>
        </div>
      </div>

      {/* Monthly Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              اختبارات هذا الشهر
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {monthExams.length}
              </span>
              <span className="text-xs text-slate-500">اختبارات</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              المهام المجدولة
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {monthTasks.length}
              </span>
              <span className="text-xs text-slate-500">
                (أُنجز {monthCompletedTasks})
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              الوقت المقدر للشهر
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {monthHoursScheduled}
              </span>
              <span className="text-xs text-slate-500">ساعة مذاكرة</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              اليوم المحدد
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {selectedDateStr}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Calendar Section: Grid + Selected Day Agenda Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Calendar Grid (2 Cols on Desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Month Navigation Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {monthNamesArabic[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                اليوم
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                title="الشهر السابق"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                title="الشهر القادم"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDaysArabic.map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-1.5 text-xs font-bold ${
                  idx === 5 || idx === 6
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell) => {
              const { dayExams, dayTasks } = getCommitmentsForDate(cell.dateStr);
              const showExams = filterType !== 'tasks';
              const showTasks = filterType !== 'exams';
              const hasItems = (showExams && dayExams.length > 0) || (showTasks && dayTasks.length > 0);

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[82px] sm:min-h-[96px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                      : cell.isToday
                      ? 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900'
                      : cell.isCurrentMonth
                      ? 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      : 'border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-900/40 opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Top row: day number and today tag */}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono tabular-nums font-bold text-xs inline-flex items-center justify-center w-5 h-5 rounded-md ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white'
                          : cell.isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Tiny badges count indicator */}
                    {hasItems && (
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {(showExams ? dayExams.length : 0) + (showTasks ? dayTasks.length : 0)}
                      </span>
                    )}
                  </div>

                  {/* Day Content Badges */}
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {/* Exams */}
                    {showExams &&
                      dayExams.slice(0, 1).map((ex) => (
                        <div
                          key={ex.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60 truncate flex items-center gap-1"
                          title={`اختبار: ${ex.title}`}
                        >
                          <span className="shrink-0">🎓</span>
                          <span className="truncate">{ex.subject}</span>
                        </div>
                      ))}

                    {/* Tasks */}
                    {showTasks &&
                      dayTasks.slice(0, showExams && dayExams.length > 0 ? 1 : 2).map((tk) => (
                        <div
                          key={tk.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                            tk.completed
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          }`}
                          title={`مهمة: ${tk.title}`}
                        >
                          <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                          <span className="truncate">{tk.title}</span>
                        </div>
                      ))}

                    {/* More items overflow count */}
                    {((showExams ? dayExams.length : 0) + (showTasks ? dayTasks.length : 0)) > 2 && (
                      <div className="text-[9px] text-slate-400 text-center font-semibold">
                        + المزيد
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Day Agenda Inspector (1 Col on Desktop) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          
          <div className="space-y-4">
            {/* Agenda Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                  جدول المذاكرة والالتزامات
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedDateStr}
                </h3>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                title="إضافة التزام لهذا اليوم"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of commitments for selected day */}
            {selectedExams.length === 0 && selectedTasks.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  لا توجد مهام أو اختبارات مجدولة لهذا اليوم
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  إضافة مهمة لهذا اليوم
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                
                {/* Exams on this day */}
                {selectedExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                          اختبار: {exam.subject}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                        الهدف: {exam.targetGrade}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {exam.title}
                    </h4>

                    <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px]">
                      <span className="text-slate-500">
                        الجاهزية: {exam.progressPercent}%
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportSingleExam(exam)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                          title="تصدير هذا الاختبار كملف تقويم .ics"
                        >
                          <Download className="w-3 h-3 text-indigo-500" />
                          <span>تصدير (.ics)</span>
                        </button>
                        <button
                          onClick={() => onGeneratePlanForExam(exam)}
                          className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>خطة ذكية</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tasks on this day */}
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      task.completed
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                        >
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div>
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                            {task.subject}
                          </span>
                          <h4
                            className={`text-xs font-bold mt-0.5 leading-snug ${
                              task.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </h4>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                      <span>🍅 {task.completedPomodoros}/{task.estimatedPomodoros} جلسات</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => exportSingleTask(task)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded"
                          title="تصدير هذه المهمة إلى التقويم (.ics)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {!task.completed && (
                          <button
                            onClick={() => onStartPomodoroForTask(task.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>ابدأ</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* Quick Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة التزام ليوم {selectedDateStr}</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODAL: Add Commitment to Selected Day */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  إضافة التزام دراسي جديد
                </h3>
                <span className="text-[11px] text-slate-400">
                  التاريخ المحدد: {selectedDateStr}
                </span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type Switcher: Task or Exam */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setAddCommitmentType('task')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  addCommitmentType === 'task'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                مهمة مذاكرة
              </button>
              <button
                type="button"
                onClick={() => setAddCommitmentType('exam')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  addCommitmentType === 'exam'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                موعد اختبار
              </button>
            </div>

            <form onSubmit={handleAddCommitment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {addCommitmentType === 'task' ? 'عنوان المهمة' : 'عنوان ونطاق الاختبار'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    addCommitmentType === 'task'
                      ? 'مثال: مراجعة الفصل الثالث وحل 10 مسائل...'
                      : 'مثال: اختبار منتصف الفصل - الكيمياء العضوية...'
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المادة الدراسية
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الرياضيات، الأحياء، الفيزياء، اللغة الإنجليزية..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {addCommitmentType === 'task' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      درجة الأهمية
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as Priority)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="high">عالية جداً</option>
                      <option value="medium">متوسطة</option>
                      <option value="low">منخفضة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      جلسات بومودورو
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newPomodoros}
                      onChange={(e) => setNewPomodoros(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الدرجة المستهدفة
                  </label>
                  <input
                    type="text"
                    value={newTargetGrade}
                    onChange={(e) => setNewTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  حفظ الالتزام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export to Calendar Modal */}
      <IcsExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        tasks={tasks}
        exams={exams}
      />

    </div>
  );
};
