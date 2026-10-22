import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Target, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  Download,
  X
} from 'lucide-react';
import { Exam } from '../types';
import { exportStudyCommitments, exportSingleExam } from '../utils/icsExport';

interface ExamCountdownProps {
  exams: Exam[];
  onSaveExams: (exams: Exam[]) => void;
  onGeneratePlanForExam: (exam: Exam) => void;
}

export const ExamCountdown: React.FC<ExamCountdownProps> = ({
  exams,
  onSaveExams,
  onGeneratePlanForExam,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newGrade, setNewGrade] = useState('95%');

  const handleDelete = (id: string) => {
    onSaveExams(exams.filter((e) => e.id !== id));
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    const updated = exams.map((e) =>
      e.id === id ? { ...e, progressPercent: Math.max(0, Math.min(100, progress)) } : e
    );
    onSaveExams(updated);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDate) return;

    const colors = ['#059669', '#4f46e5', '#0284c7', '#d97706', '#e11d48'];
    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      subject: newSubject.trim(),
      title: newTitle.trim() || `اختبار ${newSubject.trim()}`,
      date: newDate,
      targetGrade: newGrade.trim() || '95%',
      progressPercent: 30,
      color: colors[exams.length % colors.length],
    };

    onSaveExams([...exams, newExam]);
    setNewSubject('');
    setNewTitle('');
    setNewDate('');
    setShowAddModal(false);
  };

  // Helper to calculate days and hours remaining
  const getRemainingTime = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, isPast: false };
  };

  // Sort exams by date ascending
  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>العد التنازلي للاختبارات والمواعيد الهامة</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تابع الأيام المتبقية لكل مادة وحدد مستوى جاهزيتك للخطة الدراسية
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {exams.length > 0 && (
            <button
              onClick={() => exportStudyCommitments([], exams, 'exams')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="تصدير جميع مواعيد الاختبارات كملف .ics للتقويم"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>تصدير للتقويم (.ics)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موعد اختبار</span>
          </button>
        </div>
      </div>

      {/* Exams Grid */}
      {sortedExams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            لم تسجل أي اختبارات قادمة بعد
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            سجل تواريخ اختباراتك القادمة ليقوم التطبيق بمساعدتك في إدارة الوقت وجدولة المراجعة التراكمية.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
          >
            إضافة أول اختبار
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedExams.map((exam) => {
            const time = getRemainingTime(exam.date);
            const isUrgent = !time.isPast && time.days <= 3;

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs relative overflow-hidden"
              >
                {/* Urgent indicator bar */}
                {isUrgent && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500" />
                )}

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        {exam.subject}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {exam.title}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>التاريخ: {exam.date}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="حذف الاختبار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Countdown Big Display */}
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        الوقت المتبقي حتى الامتحان
                      </span>
                      {time.isPast ? (
                        <span className="text-sm font-bold text-slate-400">
                          انتهى موعد هذا الاختبار
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                            {time.days}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            يوم
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                            {time.hours}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            ساعة
                          </span>
                        </div>
                      )}
                    </div>

                    {isUrgent && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>اقترب الموعد!</span>
                      </div>
                    )}
                  </div>

                  {/* Syllabus Progress Slider */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        مستوى إتمام المقرر والمراجعة:
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {exam.progressPercent}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={exam.progressPercent}
                      onChange={(e) => handleUpdateProgress(exam.id, parseInt(e.target.value) || 0)}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>الدرجة المستهدفة: {exam.targetGrade || '95%'}</span>
                      <span>
                        {exam.progressPercent >= 80 ? 'جاهزية ممتازة 👍' : (exam.progressPercent >= 50 ? 'تقدم جيد 📈' : 'يحتاج تكثيف المذاكرة ⏳')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Plan study with AI & Export .ics */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onGeneratePlanForExam(exam)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>خطة مذاكرة ذكية</span>
                  </button>

                  <button
                    onClick={() => exportSingleExam(exam)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors"
                    title="تصدير هذا الاختبار كملف تقويم .ics"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add Exam */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                إضافة موعد اختبار جديد
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المادة الدراسية
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الرياضيات، الأحياء، الفيزياء..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان أو نطاق الاختبار
                </label>
                <input
                  type="text"
                  placeholder="مثال: اختبار منتصف الفصل - الوحدة الأولى والثانية"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ الاختبار
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الدرجة أو النسبة المستهدفة
                </label>
                <input
                  type="text"
                  placeholder="مثال: 100% أو A+ أو 95 درجة"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
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
                  حفظ موعد الاختبار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
