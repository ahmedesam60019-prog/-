import React from 'react';
import { 
  Play, 
  ArrowLeft, 
  CheckCircle2, 
  Timer, 
  Layers, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  Brain, 
  Flame, 
  CheckSquare, 
  Clock, 
  ShieldCheck, 
  Download, 
  Volume2, 
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { TabType } from './Navbar';
import { Task, Exam, Deck, StudySessionLog } from '../types';

interface LandingHomeProps {
  onNavigateTab: (tab: TabType) => void;
  tasks: Task[];
  exams: Exam[];
  decks: Deck[];
  sessions: StudySessionLog[];
  streak: number;
  todayCompletedCount: number;
}

export const LandingHome: React.FC<LandingHomeProps> = ({
  onNavigateTab,
  tasks,
  exams,
  decks,
  sessions,
  streak,
  todayCompletedCount,
}) => {
  // Nearest upcoming exam
  const sortedExams = [...exams]
    .filter((e) => new Date(e.date).getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nearestExam = sortedExams[0];

  // Highest priority pending task
  const pendingTasks = tasks.filter((t) => !t.completed);
  const priorityTask = pendingTasks.find((t) => t.priority === 'high') || pendingTasks[0];

  // Total flashcards count
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);

  // Total focus minutes
  const totalFocusMinutes = sessions
    .filter((s) => s.mode === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 lg:p-16 shadow-xs">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Right Column (Text & Value Proposition) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Editorial kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>منصة المذاكرة والتركيز المبنية على أسس علمية</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.2] text-balance">
              ضاعف تركيزك واستيعابك الدراسي بأدوات ذكية ومنهجية مثبتة
            </h1>

            {/* Subtitle */}
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl text-pretty">
              تطبيق ويب متكامل يجمع بين تقنية بومودورو وأصوات التركيز المحيطية، بطاقات الاستذكار بالتكرار المتباعد، جدول المهام والتقويم الشهري، مع مساعد ذكاء اصطناعي لشرح وتلخيص الدروس وصناعة الاختبارات التفاعلية فوراً.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('timer')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>ابدأ جلسة تركيز فورية</span>
              </button>

              <button
                onClick={() => onNavigateTab('calendar')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>استعراض التقويم والمهام</span>
              </button>
            </div>

            {/* Trust and Key Capabilities Strip */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% حفظ محلي خاص</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>أصوات طبيعية وموجات 40Hz</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>تصدير .ics للتقويم</span>
              </div>
            </div>

          </div>

          {/* Left Column (High-Fidelity Visual Workspace Showcase) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl group">
              <img
                src="/src/assets/images/hero_study_desk_1792702198513.jpg"
                alt="مكتب مذاكرة هادئ ومريح للعين"
                className="w-full h-[320px] sm:h-[380px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Floating Overlay Badge: Active Study State */}
              <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-sm">
                    25:00
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      جلسة تركيز ذهني عميق
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      مصحوبة بأصوات المطر ونغمات 40Hz
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('timer')}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shrink-0"
                >
                  انضم للجلسة
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. TODAY'S QUICK DASHBOARD STRIP */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>نظرة سريعة على حالتك الدراسية اليوم</span>
          </h2>
          <span className="text-xs text-slate-500">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Today's Pomodoro Progress */}
          <div 
            onClick={() => onNavigateTab('timer')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">جلسات اليوم المكتملة</span>
              <Timer className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                {todayCompletedCount}
              </span>
              <span className="text-xs text-slate-500">/ 6 جلسات</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (todayCompletedCount / 6) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Study Streak */}
          <div 
            onClick={() => onNavigateTab('analytics')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">شعلة الاستمرارية</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                {streak}
              </span>
              <span className="text-xs text-slate-500">أيام متتالية</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
              عادات دراسية ممتازة ومستمرة 🔥
            </span>
          </div>

          {/* Card 3: Priority Task */}
          <div 
            onClick={() => onNavigateTab('planner')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">المهمة ذات الأولوية</span>
              <CheckSquare className="w-4 h-4 text-teal-500" />
            </div>
            {priorityTask ? (
              <>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {priorityTask.title}
                </h3>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block font-semibold">
                  {priorityTask.subject} · {priorityTask.estimatedPomodoros} جلسات
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">جميع المهام مكتملة! 👍</span>
            )}
          </div>

          {/* Card 4: Upcoming Exam */}
          <div 
            onClick={() => onNavigateTab('exams')}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">أقرب اختبار قادم</span>
              <GraduationCap className="w-4 h-4 text-rose-500" />
            </div>
            {nearestExam ? (
              <>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {nearestExam.title}
                </h3>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 block font-bold font-mono">
                  {nearestExam.date} (جاهزية {nearestExam.progressPercent}%)
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">لا توجد اختبارات مسجلة</span>
            )}
          </div>

        </div>
      </section>

      {/* 3. PLATFORM CORE CAPABILITIES (BENTO GRID) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            كل ما تحتاجه للتميز الأكاديمي في مكان واحد
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            أدوات متخصصة صُممت بدقة لتساعدك على تنظيم جدولك، التغلب على التشتت، وتثبيت المعلومات بالذاكرة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Bento Card 1: Focus Timer & Ambient Sounds */}
          <div 
            onClick={() => onNavigateTab('timer')}
            className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Timer className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                01. مؤقت بومودورو وأصوات التركيز المحيطية
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                قسّم جلسات المذاكرة إلى فترات 25 دقيقة مع استراحات منتظمة. استمع لأصوات المطر، أمواج البحر، الضوضاء البيضاء، وترددات 40Hz ثنائية الأذن المحفزة للتركيز، مع إشعارات سطح المكتب لتنبيهك فور انتهاء الوقت حتى لو كانت النافذة في الخلفية.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              <span>فتح مؤقت التركيز</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Bento Card 2: Spaced Repetition Flashcards */}
          <div 
            onClick={() => onNavigateTab('flashcards')}
            className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                02. بطاقات الاستذكار الفعالة
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                بطاقات ثلاثية الأبعاد تفاعلية مدعومة بنظام التكرار المتباعد (Spaced Repetition) لحفظ القوانين والمفردات مع إمكانية التوليد التلقائي بالذكاء الاصطناعي من أي نص.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <span>استعراض {totalCards} بطاقة</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Bento Card 3: Study Tasks & Monthly Calendar */}
          <div 
            onClick={() => onNavigateTab('calendar')}
            className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                03. جدول المهام والتقويم الشهري
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                جدول شهري موحد يجمع مواعيد الاختبارات والمهام الدراسية، مع إمكانية تصديرها فوراً كملف قياسي (.ics) لتقويم Google و Outlook لتلقي التنبيهات على هاتفك.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-bold">
              <span>عرض التقويم الشهري</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Bento Card 4: AI Study Buddy & Quizzes */}
          <div 
            onClick={() => onNavigateTab('ai')}
            className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                04. المعلم الذكي والاختبارات التفاعلية (AI Study Buddy)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                اطلب شرح أي درس بتقنية فاينمان السلسة أو تلخيصه في نقاط وحيل حفظ ذكية (Mnemonics). كما يمكنك إنشاء اختبارات اختيار من متعدد تفاعلية فورية تحلها داخل التطبيق مع تصحيح لحظي وشرح تفصيلي للإجابات.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
              <span>توليد اختبار أو شرح مفهوم الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE COGNITIVE SCIENCE SECTION */}
      <section className="bg-slate-100/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl text-right space-y-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            علم الأعصاب والذاكرة
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            لماذا تضمن "ذاكرلي" تفوقك الدراسي؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            الفرق بين المذاكرة المرهقة والتحصيل السريع يكمن في تطبيق الاستراتيجيات الإدراكية المثبتة علمياً:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              الاسترجاع النشط (Active Recall)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              إلزام الدماغ بتذكر الإجابة عبر البطاقات والاختبارات يعزز التشابكات العصبية بنسبة 300% مقارنة بالقراءة العادية.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              التكرار المتباعد (Spaced Repetition)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              مراجعة المعلومة قبل نسيانها مباشرة (1 يوم، 3 أيام، أسبوع) يكسر منحنى النسيان وينقلها للذاكرة طويلة الأمد.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              تقنية فاينمان (The Feynman Technique)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              تبسيط المفهوم وشرحه بلغة مبسطة كأنك تشرحه لطفل يكشف فوراً فجوات الفهم ويجعل المعقد بديهياً.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              الإيقاع فوق اليومي (Ultradian Rhythm)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              طاقة الدماغ تعمل في قمم تركيز تستمر من 20 إلى 30 دقيقة تليها فترة راحة؛ وهو المبدأ المباشر لتقنية بومودورو.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-balance">
          جاهز لتنظيم وقتك والبدء في مذاكرة ذكية وممتعة؟
        </h2>
        <p className="text-sm text-indigo-100 max-w-xl mx-auto leading-relaxed">
          اختر الأداة المناسبة لك الآن وابدأ على الفور؛ جميع بياناتك محفوظة محلياً على جهازك لتستمر من حيث توقفت.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('timer')}
            className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
          >
            بدء مؤقت التركيز
          </button>
          <button
            onClick={() => onNavigateTab('ai')}
            className="px-6 py-3 rounded-xl bg-indigo-700 dark:bg-indigo-800 text-white font-bold text-sm hover:bg-indigo-800 transition-colors border border-indigo-400/30"
          >
            توليد اختبار أو ملخص بالذكاء الاصطناعي
          </button>
        </div>
      </section>

    </div>
  );
};
