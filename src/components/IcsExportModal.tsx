import React, { useState } from 'react';
import { 
  Download, 
  Calendar, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  GraduationCap, 
  CheckSquare, 
  FileText 
} from 'lucide-react';
import { Task, Exam } from '../types';
import { exportStudyCommitments } from '../utils/icsExport';

interface IcsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  exams: Exam[];
}

export const IcsExportModal: React.FC<IcsExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  exams,
}) => {
  const [exportType, setExportType] = useState<'all' | 'exams' | 'tasks'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const validTasks = tasks.filter((t) => Boolean(t.dueDate));
  const validExams = exams.filter((e) => Boolean(e.date));

  const totalExamsCount = validExams.length;
  const totalTasksCount = validTasks.length;

  const handleExport = () => {
    exportStudyCommitments(validTasks, validExams, exportType);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                تصدير جدول المذاكرة لتقويمك (.ics)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                متوافق مع تقويم Google و Microsoft Outlook و Apple Calendar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Scope Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            اختر ما ترغب في تصديره:
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Option 1: All Commitments */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportType === 'all'
                  ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="exportScope"
                value="all"
                checked={exportType === 'all'}
                onChange={() => setExportType('all')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  جميع الالتزامات (الاختبارات والمهام المجدولة)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  يشمل {totalExamsCount} اختبار و {totalTasksCount} مهمة مذاكرة مع تنبيهات تلقائية
                </span>
              </div>
            </label>

            {/* Option 2: Exams Only */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportType === 'exams'
                  ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="exportScope"
                value="exams"
                checked={exportType === 'exams'}
                onChange={() => setExportType('exams')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    مواعيد الاختبارات فقط ({totalExamsCount} اختبار)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  تصدير تواريخ الاختبارات مع الأهداف الأكاديمية وتنبيه قبل الموعد بيوم
                </span>
              </div>
            </label>

            {/* Option 3: Tasks Only */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportType === 'tasks'
                  ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="exportScope"
                value="tasks"
                checked={exportType === 'tasks'}
                onChange={() => setExportType('tasks')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    مهام المذاكرة المجدولة فقط ({totalTasksCount} مهمة)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  تصدير المهام مع تواريخ استحقاقها وتقديرات جلسات بومودورو
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* How to Import Guide Accordion */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>كيف تستورد الملف إلى تقويمك؟</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-slate-700 dark:text-slate-300">تقويم Google:</strong> افتح calendar.google.com &gt; الإعدادات (⚙️) &gt; "استيراد وتصدير" &gt; اختر الملف الذي تم تنزيله.
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">Outlook:</strong> ملف &gt; "فتح وتصدير" &gt; "استيراد/تصدير" &gt; اختر "استيراد ملف iCalendar (.ics)".
            </li>
            <li>
              <strong className="text-slate-700 dark:text-slate-300">تقويم الهاتف (iPhone / Android):</strong> افتح ملف الـ .ics المحمل مباشرة ليتم نقله إلى تطبيق التقويم الأساسي.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={downloadSuccess}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all ${
              downloadSuccess
                ? 'bg-emerald-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>تم التنزيل بنجاح!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>تحميل ملف التقويم (.ics)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
