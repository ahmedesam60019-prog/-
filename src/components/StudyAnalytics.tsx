import React from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Brain, 
  Lightbulb, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { StudySessionLog, Task, Deck } from '../types';

interface StudyAnalyticsProps {
  sessions: StudySessionLog[];
  tasks: Task[];
  decks: Deck[];
  streak: number;
  onResetData: () => void;
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({
  sessions,
  tasks,
  decks,
  streak,
  onResetData,
}) => {
  const totalFocusMinutes = sessions
    .filter((s) => s.mode === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;
  const totalCompletedSessions = sessions.filter((s) => s.mode === 'focus').length;

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const masteredCards = decks.reduce(
    (acc, d) => acc + d.cards.filter((c) => c.masteryLevel === 'mastered').length,
    0
  );
  const totalReviews = decks.reduce(
    (acc, d) => acc + d.cards.reduce((sum, c) => sum + c.reviewCount, 0),
    0
  );

  const completedTasks = tasks.filter((t) => t.completed).length;

  // Group focus time by subject
  const subjectTimeMap: Record<string, number> = {};
  sessions
    .filter((s) => s.mode === 'focus')
    .forEach((s) => {
      const sub = s.subject || 'مذاكرة عامة';
      subjectTimeMap[sub] = (subjectTimeMap[sub] || 0) + s.durationMinutes;
    });

  const subjectEntries = Object.entries(subjectTimeMap).sort((a, b) => b[1] - a[1]);
  const maxSubjectMinutes = Math.max(...Object.values(subjectTimeMap), 1);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>لوحة الإحصائيات والإنجاز الأكاديمي</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تابع تقدمك وساعات تركيزك لتعزيز الاستمرارية وبناء عادات دراسية راسخة
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('هل أنت متأكد من رغبتك في استعادة البيانات الافتراضية للتطبيق؟')) {
              onResetData();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط البيانات النموذجية</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">ساعات التركيز الكلية</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalFocusHours}
          </div>
          <span className="text-[11px] text-slate-500 block">
            تعادل {totalFocusMinutes} دقيقة عمل فعلي
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">جلسات بومودورو</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalCompletedSessions}
          </div>
          <span className="text-[11px] text-slate-500 block">
            جلسة تركيز تم إتمامها
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">مراجعات البطاقات</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalReviews}
          </div>
          <span className="text-[11px] text-slate-500 block">
            أتقنت منها {masteredCards} من {totalCards} بطاقة
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">استمرارية المذاكرة</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {streak} أيام
          </div>
          <span className="text-[11px] text-slate-500 block">
            شعلة إنجاز مستمرة بدون انقطاع
          </span>
        </div>
      </div>

      {/* Two-Column Analytics: Subject Breakdown + Scientific Study Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>توزيع وقت المذاكرة حسب المواد</span>
          </h2>

          {subjectEntries.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">لا توجد جلسات مسجلة بعد</p>
          ) : (
            <div className="space-y-4">
              {subjectEntries.map(([subject, minutes]) => {
                const percent = Math.round((minutes / maxSubjectMinutes) * 100);
                return (
                  <div key={subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {subject}
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {minutes} دقيقة ({Math.round((minutes / totalFocusMinutes) * 100)}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scientific Study Principles */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>نصائح علمية مثبتة لزيادة كفاءة الحفظ والفهم</span>
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>الاسترجاع الفعّال (Active Recall)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                اختبار نفسك بالبطاقات والأسئلة يرسخ المعلومات بنسبة 300% أكثر من مجرد إعادة قراءة الكتاب أو تحديد السطور بالألوان.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-teal-500" />
                <span>منحنى النسيان والتكرار المتباعد</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                مراجعة المعلومة بعد يوم، ثم 3 أيام، ثم أسبوع يكسر منحنى النسيان الطبيعي وينقلها بشكل دائم للذاكرة بعيدة المدى.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                <span>النوم وتثبيت الذاكرة</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                يقوم الدماغ أثناء النوم العميق بنقل الروابط العصبية الجديدة وترتيبها؛ السهر ليلة الامتحان يقلل كفاءة الاسترجاع بنسبة 40%.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
