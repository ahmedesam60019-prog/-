import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Play, 
  Trash2, 
  Calendar, 
  CalendarDays,
  Clock, 
  AlertCircle, 
  Filter, 
  CheckCircle2,
  Download,
  X
} from 'lucide-react';
import { Task, Priority } from '../types';
import { exportStudyCommitments, exportSingleTask } from '../utils/icsExport';

interface StudyPlannerProps {
  tasks: Task[];
  onSaveTasks: (tasks: Task[]) => void;
  onStartPomodoroForTask: (taskId: string) => void;
  onNavigateToCalendar?: () => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  tasks,
  onSaveTasks,
  onStartPomodoroForTask,
  onNavigateToCalendar,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newPomodoros, setNewPomodoros] = useState(2);
  const [newDueDate, setNewDueDate] = useState('');

  // Extract unique subjects
  const subjects = Array.from(new Set(tasks.map((t) => t.subject))).filter(Boolean);

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onSaveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    onSaveTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject.trim() || 'عام',
      priority: newPriority,
      estimatedPomodoros: Math.max(1, newPomodoros),
      completedPomodoros: 0,
      completed: false,
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewSubject('');
    setNewPriority('medium');
    setNewPomodoros(2);
    setNewDueDate('');
    setShowAddModal(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterSubject !== 'all' && t.subject !== filterSubject) return false;
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const totalEstimatedHours = Math.round((tasks.filter(t => !t.completed).reduce((acc, t) => acc + (t.estimatedPomodoros * 25), 0) / 60) * 10) / 10;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>جدول المهام والمذاكرة اليومية</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            خطط لمهامك وقسمها إلى فترات تركيز بومودورو لتحقيق أقصى إنجاز ممكن
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onNavigateToCalendar && (
            <button
              onClick={onNavigateToCalendar}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              <span>التقويم الشهري</span>
            </button>
          )}

          {tasks.some(t => Boolean(t.dueDate)) && (
            <button
              onClick={() => exportStudyCommitments(tasks, [], 'tasks')}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="تصدير جميع المهام المجدولة كملف .ics للتقويم"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">تصدير (.ics)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              نسبة إنجاز المهام
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-500">
                ({completedCount} من {tasks.length})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              الوقت المقدر للمهام المتبقية
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {totalEstimatedHours}
              </span>
              <span className="text-xs text-slate-500">ساعة مذاكرة</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              المهام ذات الأولوية العالية
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                {tasks.filter((t) => !t.completed && t.priority === 'high').length}
              </span>
              <span className="text-xs text-slate-500">مهام حرجة</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Task Listing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الكل ({tasks.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterStatus === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              قيد التنفيذ ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              المكتملة ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع المواد</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-slate-500">لا توجد مهام تطابق هذا التصنيف</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  task.completed
                    ? 'border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {task.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.priority === 'high' ? 'أولوية عالية' : (task.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة')}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-semibold mt-0.5 ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>موعد التسليم: {task.dueDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Pomodoro sessions count */}
                  <div 
                    title={`تم إنجاز ${task.completedPomodoros} من أصل ${task.estimatedPomodoros} جلسات بومودورو`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono tabular-nums"
                  >
                    <span>🍅</span>
                    <span>{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                  </div>

                  {!task.completed && (
                    <button
                      onClick={() => onStartPomodoroForTask(task.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                      title="بدء مؤقت التركيز لهذه المهمة"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>مذاكرة</span>
                    </button>
                  )}

                  {task.dueDate && (
                    <button
                      onClick={() => exportSingleTask(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg"
                      title="تصدير هذه المهمة كملف تقويم .ics"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                    title="حذف المهمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                إضافة مهمة مذاكرة جديدة
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المهمة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حل 10 مسائل تفاضل، حفظ صفحتين من المعجم..."
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
                  placeholder="مثال: الرياضيات، الأحياء، الفيزياء..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

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
                    <option value="high">عالية جداً (ضروري)</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة (مراجعة خفيفة)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    جلسات بومودورو المتوقعة
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ الإنجاز المستهدف
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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
                  حفظ المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
