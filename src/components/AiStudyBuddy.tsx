import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Calendar, 
  Bookmark, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Trash2, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Brain
} from 'lucide-react';
import { SavedNote, QuizQuestion, Exam } from '../types';

interface AiStudyBuddyProps {
  savedNotes: SavedNote[];
  onSaveNotes: (notes: SavedNote[]) => void;
  exams: Exam[];
  prefilledPlanExam?: Exam | null;
  onClearPrefilledExam?: () => void;
}

export const AiStudyBuddy: React.FC<AiStudyBuddyProps> = ({
  savedNotes,
  onSaveNotes,
  exams,
  prefilledPlanExam,
  onClearPrefilledExam,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'explain' | 'quiz' | 'plan' | 'notes'>(
    prefilledPlanExam ? 'plan' : 'explain'
  );

  // 1. EXPLAIN / SUMMARIZE STATE
  const [explainConcept, setExplainConcept] = useState('');
  const [explainMode, setExplainMode] = useState<'explain' | 'feynman' | 'summarize' | 'mnemonics'>('explain');
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explainResult, setExplainResult] = useState<{
    summary: string;
    keyPoints: string[];
    analogy?: string;
    mnemonic?: string;
    studyTip: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // 2. QUIZ GENERATOR STATE
  const [quizTopic, setQuizTopic] = useState('');
  const [quizNotes, setQuizNotes] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{
    title: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  // 3. STUDY PLANNER STATE
  const [planSubjects, setPlanSubjects] = useState<string>(
    prefilledPlanExam ? prefilledPlanExam.subject : 'الرياضيات، الأحياء، اللغة الإنجليزية'
  );
  const [planDays, setPlanDays] = useState<number>(7);
  const [planHours, setPlanHours] = useState<number>(3);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<{
    planTitle: string;
    dailyTargetHours: number;
    advice: string;
    days: {
      dayNumber: number;
      focusSubject: string;
      goal: string;
      estimatedPomodoros: number;
    }[];
  } | null>(null);

  // Handle Explain API Call
  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explainConcept.trim()) return;

    setExplainLoading(true);
    setExplainError(null);
    setExplainResult(null);

    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: explainConcept,
          mode: explainMode,
        }),
      });

      if (!res.ok) throw new Error('فشل في استلام الشرح من المساعد الذكي');
      const data = await res.json();
      setExplainResult(data);
    } catch (err: any) {
      setExplainError(err.message || 'حدث خطأ أثناء الشرح');
    } finally {
      setExplainLoading(false);
    }
  };

  // Save current explanation to Saved Notes
  const handleSaveToNotes = () => {
    if (!explainResult) return;
    const newNote: SavedNote = {
      id: `note_${Date.now()}`,
      title: explainConcept.trim(),
      subject: 'ملاحظات ذكية',
      summary: explainResult.summary,
      keyPoints: explainResult.keyPoints,
      analogy: explainResult.analogy,
      mnemonic: explainResult.mnemonic,
      studyTip: explainResult.studyTip,
      createdAt: new Date().toISOString(),
    };

    onSaveNotes([newNote, ...savedNotes]);
    alert('تم حفظ الملخص بنجاح في قسم "ملخصاتي المحفوظة"!');
  };

  // Handle Quiz API Call
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim() && !quizNotes.trim()) return;

    setQuizLoading(true);
    setQuizError(null);
    setActiveQuiz(null);
    setSelectedAnswers({});
    setCurrentQuizIndex(0);
    setQuizCompleted(false);

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizTopic,
          notes: quizNotes,
          count: 5,
          difficulty: quizDifficulty,
        }),
      });

      if (!res.ok) throw new Error('فشل في توليد أسئلة الاختبار');
      const data = await res.json();
      setActiveQuiz(data);
    } catch (err: any) {
      setQuizError(err.message || 'حدث خطأ أثناء توليد الاختبار');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (selectedAnswers[qIndex] !== undefined) return; // Answered already
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  // Handle Plan API Call
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanLoading(true);
    setPlanError(null);
    setPlanResult(null);

    try {
      const subjectsArray = planSubjects.split(/[،,]+/).map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjectsArray,
          daysUntilExam: planDays,
          hoursPerDay: planHours,
        }),
      });

      if (!res.ok) throw new Error('فشل في تصميم خطة المذاكرة');
      const data = await res.json();
      setPlanResult(data);
    } catch (err: any) {
      setPlanError(err.message || 'حدث خطأ أثناء تصميم الخطة');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    onSaveNotes(savedNotes.filter((n) => n.id !== noteId));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>المعلم الذكي ورفيق المذاكرة (AI Study Buddy)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            شرح المفاهيم المعقدة، توليد اختبارات تفاعلية، وتلخيص الدروس وفق أحدث الطرق التربوية
          </p>
        </div>

        {/* Subtabs Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('explain')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'explain'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            شرح وتلخيص
          </button>

          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            اختبار تفاعلي
          </button>

          <button
            onClick={() => setActiveSubTab('plan')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'plan'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            خطة مذاكرة
          </button>

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ملخصاتي ({savedNotes.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EXPLAIN & SUMMARIZE */}
      {activeSubTab === 'explain' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>ما هو المفهوم أو الدرس الذي تريد فهمه أو تلخيصه؟</span>
            </h2>

            <form onSubmit={handleExplain} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder="اكتب اسم المفهوم أو الصق جزءاً من الدرس... (مثال: نظرية الانفجار العظيم، قوانين نيوتن، الفرق بين have been و have gone، معادلة برنولي...)"
                value={explainConcept}
                onChange={(e) => setExplainConcept(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setExplainMode('explain')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      explainMode === 'explain' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    شرح عام مبسط
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplainMode('feynman')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      explainMode === 'feynman' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    تقنية فاينمان (بأبسط الكلمات)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplainMode('summarize')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      explainMode === 'summarize' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    تلخيص في نقاط
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplainMode('mnemonics')}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                      explainMode === 'mnemonics' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    حيلة ذاكرة وحفظ (Mnemonic)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={explainLoading || !explainConcept.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {explainLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>جاري الشرح والاستيعاب...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>اشرح لي الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Explain Result Card */}
          {explainResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  شرح ملخص لمفهوم: {explainConcept}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(explainResult.summary + '\n' + explainResult.keyPoints.join('\n'))}
                    className="p-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                    title="نسخ الشرح"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'تم النسخ' : 'نسخ'}</span>
                  </button>

                  <button
                    onClick={handleSaveToNotes}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>حفظ في ملخصاتي</span>
                  </button>
                </div>
              </div>

              {/* Summary Paragraph */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  الفكرة الجوهرية
                </h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
                  {explainResult.summary}
                </p>
              </div>

              {/* Key Points */}
              {explainResult.keyPoints && explainResult.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    أهم النقاط المفتاحية
                  </h3>
                  <div className="space-y-2">
                    {explainResult.keyPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analogy & Mnemonic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {explainResult.analogy && (
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>تشبيه يقرب الصورة</span>
                    </div>
                    <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                      {explainResult.analogy}
                    </p>
                  </div>
                )}

                {explainResult.mnemonic && (
                  <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                      <Brain className="w-4 h-4 text-teal-500" />
                      <span>طريقة ذكية للحفظ والتذكر</span>
                    </div>
                    <p className="text-xs text-teal-900/80 dark:text-teal-200/80 leading-relaxed font-semibold">
                      {explainResult.mnemonic}
                    </p>
                  </div>
                )}
              </div>

              {/* Study Tip */}
              {explainResult.studyTip && (
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                  <span className="font-bold shrink-0">نصيحة المذاكرة:</span>
                  <span>{explainResult.studyTip}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: INTERACTIVE QUIZ */}
      {activeSubTab === 'quiz' && (
        <div className="space-y-6">
          {!activeQuiz ? (
            /* Quiz Generator Form */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>أنشئ اختباراً فورياً لتقييم مستواك في أي موضوع</span>
              </h2>

              <form onSubmit={handleGenerateQuiz} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    موضوع الاختبار
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الخلية الحية، التفاضل والتكامل، الحرب العالمية الأولى، الكيمياء العضوية..."
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    أو الصق ملاحظات وملخص الدرس لإنشاء أسئلة مباشرة منها (اختياري)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="الصق نص الدرس هنا..."
                    value={quizNotes}
                    onChange={(e) => setQuizNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      مستوى الصعوبة:
                    </span>
                    <select
                      value={quizDifficulty}
                      onChange={(e) => setQuizDifficulty(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="easy">سهل (أساسيات ومفاهيم أولية)</option>
                      <option value="medium">متوسط (تطبيقي ونموذجي)</option>
                      <option value="hard">متقدم (تفكير نقدي وعالي التركيز)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={quizLoading || (!quizTopic.trim() && !quizNotes.trim())}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {quizLoading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>جاري صياغة الأسئلة...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>بدء الاختبار الفوري</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Interactive Quiz Runner */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {activeQuiz.title}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    السؤال {currentQuizIndex + 1} من {activeQuiz.questions.length}
                  </p>
                </div>

                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إنهاء الاختبار
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{
                    width: `${((currentQuizIndex + 1) / activeQuiz.questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Body */}
              {activeQuiz.questions[currentQuizIndex] && (
                <div className="space-y-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {activeQuiz.questions[currentQuizIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {activeQuiz.questions[currentQuizIndex].options.map((opt, optIdx) => {
                      const isAnswered = selectedAnswers[currentQuizIndex] !== undefined;
                      const isSelected = selectedAnswers[currentQuizIndex] === optIdx;
                      const isCorrect = optIdx === activeQuiz.questions[currentQuizIndex].correctAnswerIndex;

                      let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500';
                        } else if (isSelected) {
                          btnStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500';
                        } else {
                          btnStyle = 'border-slate-200 dark:border-slate-800 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectQuizAnswer(currentQuizIndex, optIdx)}
                          className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${btnStyle}`}
                        >
                          <span className="leading-relaxed">{opt}</span>
                          {isAnswered && (
                            <span className="shrink-0">
                              {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-900" />
                              ) : isSelected ? (
                                <XCircle className="w-5 h-5 text-rose-600 fill-rose-100 dark:fill-rose-900" />
                              ) : null}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Box (Revealed upon selecting answer) */}
                  {selectedAnswers[currentQuizIndex] !== undefined && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        {selectedAnswers[currentQuizIndex] === activeQuiz.questions[currentQuizIndex].correctAnswerIndex ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> إجابة صحيحة وممتازة!
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> إجابة خاطئة. الإجابة الصحيحة موضحة أدناه:
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeQuiz.questions[currentQuizIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Next / Finish Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {currentQuizIndex + 1 < activeQuiz.questions.length ? (
                      <button
                        disabled={selectedAnswers[currentQuizIndex] === undefined}
                        onClick={() => setCurrentQuizIndex(currentQuizIndex + 1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        <span>السؤال التالي</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        disabled={selectedAnswers[currentQuizIndex] === undefined}
                        onClick={() => setQuizCompleted(true)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>عرض النتيجة النهائية</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Results Summary Modal */}
              {quizCompleted && (
                <div className="text-center py-8 space-y-4">
                  {(() => {
                    const score = activeQuiz.questions.reduce((acc, q, idx) => {
                      return selectedAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc;
                    }, 0);
                    const percentage = Math.round((score / activeQuiz.questions.length) * 100);

                    return (
                      <>
                        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
                          {score}/{activeQuiz.questions.length}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          درجتك: {percentage}%
                        </h2>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          {percentage >= 80 ? 'مستوى استيعاب ممتاز جداً! واصل بهذا الأداء الرائع.' : (percentage >= 50 ? 'نتيجة جيدة، مراجعة سريعة للملاحظات والبطاقات ستضمن لك الدرجة الكاملة.' : 'راجع المفاهيم الأساسية وأعد الاختبار لترسيخ المعلومات.')}
                        </p>

                        <div className="flex items-center justify-center gap-3 pt-3">
                          <button
                            onClick={() => {
                              setSelectedAnswers({});
                              setCurrentQuizIndex(0);
                              setQuizCompleted(false);
                            }}
                            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl"
                          >
                            إعادة حل الاختبار
                          </button>
                          <button
                            onClick={() => setActiveQuiz(null)}
                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
                          >
                            اختبار موضوع آخر
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: STUDY PLANNER */}
      {activeSubTab === 'plan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>تصميم جدول مذاكرة ذكي ومتوازن بالذكاء الاصطناعي</span>
            </h2>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المواد المطلوب جدولتها (افصل بينها بفواصل)
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الرياضيات، الأحياء، الفيزياء، اللغة العربية..."
                  value={planSubjects}
                  onChange={(e) => setPlanSubjects(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    عدد الأيام المتاحة للمذاكرة
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={planDays}
                    onChange={(e) => setPlanDays(parseInt(e.target.value) || 7)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ساعات المذاكرة المتاحة يومياً
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={planHours}
                    onChange={(e) => setPlanHours(parseInt(e.target.value) || 3)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={planLoading || !planSubjects.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {planLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>جاري تخطيط الجدول...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>توليد الخطة الدراسية</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Plan Result */}
          {planResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs animate-in fade-in">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {planResult.planTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  نصيحة عامة: {planResult.advice}
                </p>
              </div>

              <div className="space-y-3">
                {planResult.days.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        يوم {day.dayNumber}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          المادة الرئيسية: {day.focusSubject}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                          {day.goal}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono">
                      <span>🍅 {day.estimatedPomodoros} جلسات بومودورو</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: SAVED NOTES */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4">
          {savedNotes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">لا توجد ملخصات محفوظة حتى الآن</p>
              <p className="text-xs text-slate-400 mt-1">استخدم تبويب "شرح وتلخيص" لتوليد وحفظ ملخصات الدروس هنا</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {note.subject}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="حذف الملخص"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {note.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {note.summary}
                    </p>

                    {note.keyPoints && note.keyPoints.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                        {note.keyPoints.slice(0, 2).map((pt, i) => (
                          <div key={i} className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>حُفظ بتاريخ {new Date(note.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
