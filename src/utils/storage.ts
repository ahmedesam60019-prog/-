import { Deck, Task, Exam, StudySessionLog, SavedNote, PomodoroSettings } from '../types';

const STORAGE_KEYS = {
  DECKS: 'zakirly_decks_v1',
  TASKS: 'zakirly_tasks_v1',
  EXAMS: 'zakirly_exams_v1',
  SESSIONS: 'zakirly_sessions_v1',
  NOTES: 'zakirly_notes_v1',
  SETTINGS: 'zakirly_settings_v1',
  THEME: 'zakirly_theme_v1',
  STREAK: 'zakirly_streak_v1',
};

export const defaultSettings: PomodoroSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  desktopNotificationsEnabled: true,
};

export const initialDecks: Deck[] = [
  {
    id: 'deck-1',
    title: 'الأحياء - علم الخلية والوراثة',
    description: 'المفاهيم الجوهرية للخلية، العضيات، الانقسام الميتوزي والميوزي، وبناء البروتين.',
    subject: 'الأحياء',
    color: '#059669', // emerald
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c1',
        front: 'ما هي وظيفة الميتوكوندريا الأساسية في الخلية؟',
        back: 'تعتبر مصانع إنتاج الطاقة في الخلية؛ حيث تقوم بتوليد جزيئات أدينوسين ثلاثي الفوسفات (ATP) عبر التنفس الخلوي الهوائي.',
        hint: 'مصنع الطاقة الرئيسي للخلية',
        masteryLevel: 'mastered',
        reviewCount: 3,
        lastReviewed: new Date().toISOString(),
      },
      {
        id: 'c2',
        front: 'ما الفرق الجوهري بين الانقسام الميتوزي والانقسام الميوزي؟',
        back: 'الانقسام الميتوزي: ينتج خليتين متطابقتين للنمو وتعويض الأنسجة التالفة (2n).\nالانقسام الميوزي: ينتج 4 خلايا أحادية المجموعة (1n) لتكوين الأمشاج الجنسية وتنوع الصفات.',
        hint: 'عدد الخلايا الناتجة والمجموعة الصبغية',
        masteryLevel: 'learning',
        reviewCount: 1,
        lastReviewed: new Date().toISOString(),
      },
      {
        id: 'c3',
        front: 'ما هو دور الحمض النووي الريبوزي الرسول (mRNA)؟',
        back: 'ينقل التعليمات والشفرة الوراثية المنسوخة من جينات DNA في النواة إلى الريبوسومات في السيتوبلازم لترجمتها إلى سلاسل بروتينية.',
        hint: 'حامل الرسالة الوراثية',
        masteryLevel: 'new',
        reviewCount: 0,
      },
      {
        id: 'c4',
        front: 'ما هي قاعدة تشارجاف لتكامل القواعد النيتروجينية في الـ DNA؟',
        back: 'قاعدة الأدينين (A) ترتبط برابطتين هيدروجينيتين مع الثايمين (T)، وقاعدة الجوانين (G) ترتبط بثلاث روابط مع السيتوزين (C).',
        hint: 'A مع T ، و G مع C',
        masteryLevel: 'learning',
        reviewCount: 2,
        lastReviewed: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'deck-2',
    title: 'اللغة الإنجليزية - أهم المفردات والقواعد',
    description: 'أهم الكلمات الشائعة، الأفعال المركبة (Phrasal Verbs)، وقواعد الأزمنة الأساسية.',
    subject: 'اللغة الإنجليزية',
    color: '#4f46e5', // indigo
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c201',
        front: 'ما هو الفرق الدقيق بين "Affect" و "Effect"؟',
        back: '"Affect" عادة ما تكون فعلاً (Verb) بمعنى يؤثر على:\n"Lack of sleep affects your focus."\n\n"Effect" عادة ما تكون اسماً (Noun) بمعنى نتيجة أو أثر:\n"The effect of music on study is positive."',
        hint: 'A = Action (فعل) / E = End result (اسم)',
        masteryLevel: 'mastered',
        reviewCount: 4,
      },
      {
        id: 'c202',
        front: 'متى نستخدم زمن المضارع التام (Present Perfect)؟',
        back: 'نستخدمه لحدث وقع في الماضي وله أثر مباشر في الحاضر، أو للتجارب الشخصية دون تحديد وقت معين (I have lived here for 5 years / She has lost her keys).',
        hint: 'حدث ماضٍ وله صلة بالحاضر',
        masteryLevel: 'learning',
        reviewCount: 2,
      },
      {
        id: 'c203',
        front: 'ما معنى الفعل المركب: "Call it a day"؟',
        back: 'يعني التوقف عن العمل أو الدراسة لهذا اليوم للاكتفاء بما أُنجز:\n"We have finished all three chapters, let\'s call it a day!"',
        hint: 'إنهاء جلسة العمل',
        masteryLevel: 'new',
        reviewCount: 0,
      },
    ],
  },
  {
    id: 'deck-3',
    title: 'الرياضيات - قواعد التفاضل وحساب المثلثات',
    description: 'قوانين الاشتقاق الأساسية، المتطابقات المثلثية، وشروط الاتصال والنهايات.',
    subject: 'الرياضيات',
    color: '#0284c7', // sky
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c301',
        front: 'ما هي مشتقة الدالة الأسية: f(x) = x^n ؟',
        back: "f'(x) = n · x^(n - 1)\n\nمثال: مشتقة x³ هي 3x²، ومشتقة 5x⁴ هي 20x³.",
        hint: 'اضرب في الأس واطرح منه واحداً',
        masteryLevel: 'mastered',
        reviewCount: 3,
      },
      {
        id: 'c302',
        front: 'ما هي متطابقة فيثاغورس المثلثية الأساسية؟',
        back: 'sin²(θ) + cos²(θ) = 1\n\nومنها يستنتج:\n1 + tan²(θ) = sec²(θ)\n1 + cot²(θ) = csc²(θ)',
        hint: 'مجموع مربعي الجيب وجيب التمام',
        masteryLevel: 'learning',
        reviewCount: 1,
      },
      {
        id: 'c303',
        front: 'ما هي مشتقة حاصل ضرب دالتين [u(x) · v(x)]؟',
        back: "(u · v)' = u' · v + u · v'\n(مشتقة الأولى × الثانية) + (الأولى × مشتقة الثانية)",
        hint: 'قاعدة الضرب في التفاضل',
        masteryLevel: 'new',
        reviewCount: 0,
      },
    ],
  },
  {
    id: 'deck-4',
    title: 'الكيمياء - الجدول الدوري والروابط الكيميائية',
    description: 'مفاهيم التكافؤ، السالبية الكهربية، الأحماض والقواعد، ونظريات الترابط.',
    subject: 'الكيمياء',
    color: '#d97706', // amber
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c401',
        front: 'ما الفرق بين الرابطة الأيونية والرابطة التساهمية؟',
        back: 'الأيونية: تنشأ نتيجة انتقال إلكترون بالكامل من فلز إلى لافلز مكوّنة تجاذباً كهربياً بين أيونات متعاكسة الشحنة (مثل NaCl).\nالتساهمية: تنشأ بمشاركة الإلكترونات بين ذرات اللافلزات (مثل H₂O).',
        hint: 'انتقال كامل مقابل مشاركة',
        masteryLevel: 'learning',
        reviewCount: 2,
      },
      {
        id: 'c402',
        front: 'كيف يتدرج نصف القطر الذري عبر الجدول الدوري؟',
        back: '- يقل نصف القطر الذري في الدورة الواحدة من اليسار إلى اليمين (بسبب زيادة الشحنة النووية الفعالة).\n- ويزداد في المجموعة الواحدة من الأعلى إلى الأسفل (بسبب إضافة مستويات طاقة جديدة).',
        hint: 'يسار ليمين يقل، فوق لتحت يزيد',
        masteryLevel: 'new',
        reviewCount: 0,
      },
    ],
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'حل تدريبات بنك الأسئلة للوحدة الثانية في الأحياء',
    subject: 'الأحياء',
    priority: 'high',
    estimatedPomodoros: 3,
    completedPomodoros: 2,
    completed: false,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'مراجعة 20 بطاقة استذكار في قواعد اللغة الإنجليزية',
    subject: 'اللغة الإنجليزية',
    priority: 'medium',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    completed: true,
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'تلخيص قوانين الاشتقاق وحل 5 مسائل نموذجية',
    subject: 'الرياضيات',
    priority: 'high',
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    completed: false,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'قراءة ملخص الروابط الكيميائية والجدول الدوري',
    subject: 'الكيمياء',
    priority: 'low',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    completed: false,
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

export const initialExams: Exam[] = [
  {
    id: 'exam-1',
    subject: 'الأحياء',
    title: 'اختبار منتصف الفصل - علم الخلية والوراثة',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    targetGrade: '98%',
    progressPercent: 75,
    color: '#059669',
  },
  {
    id: 'exam-2',
    subject: 'اللغة الإنجليزية',
    title: 'الاختبار الشهري الشامل في المفردات والقواعد',
    date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
    targetGrade: '100%',
    progressPercent: 60,
    color: '#4f46e5',
  },
  {
    id: 'exam-3',
    subject: 'الرياضيات',
    title: 'اختبار التفاضل والتكامل وحساب المثلثات',
    date: new Date(Date.now() + 86400000 * 13).toISOString().split('T')[0],
    targetGrade: '95%',
    progressPercent: 40,
    color: '#0284c7',
  },
];

export const initialNotes: SavedNote[] = [
  {
    id: 'note-1',
    title: 'تقنية فاينمان للمذاكرة السريعة وترسيخ الفهم',
    subject: 'مهارات المذاكرة',
    summary: 'طريقة ثورية ابتكرها عالم الفيزياء ريتشارد فاينمان تضمن فهم أي موضوع معقد بنسبة 100% عبر تبسيطه وشرحه لطفل صغير.',
    keyPoints: [
      'اختر المفهوم الذي ترغب في تعلمه واكتب عنوانه أعلى صفحة بيضاء.',
      'اشرح المفهوم بكلماتك البسيطة الخاصة كما لو كنت تشرحه لشخص لا يعرف شيئاً عن الموضوع.',
      'حدد الفجوات وأي نقطة تعثرت في شرحها بسلاسة، ثم ارجع للمصدر الأصلي وأعد قراءتها.',
      'استخدم تشبيهات وأمثلة من الحياة اليومية لتقريب الصورة.'
    ],
    analogy: 'مثل بناء بيت من المكعبات؛ إذا كان هناك مكعب ضعيف بالأسفل سينهار المبنى، فاكتشاف الفجوات يثبت الأساس.',
    mnemonic: 'الخطوات الأربع: اختيار -> تبسيط -> اكتشاف الفجوة -> مراجعة وتكرار.',
    studyTip: 'سجل صوتك وأنت تشرح الدرس لنفسك لمدة 3 دقائق واستمع له للتأكد من خلوه من التعقيد الزائد.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'قانون حفظ الطاقة ونظرية الشغل',
    subject: 'الفيزياء',
    summary: 'الطاقة لا تفنى ولا تستحدث من العدم، بل تتحول من شكل إلى آخر داخل النظام المغلق.',
    keyPoints: [
      'الطاقة الميكانيكية = طاقة الحركة (KE) + طاقة الوضع (PE).',
      'عند أعلى نقطة تكون طاقة الوضع قصوى وطاقة الحركة صفر.',
      'أثناء السقوط الحر تتحول طاقة الوضع تدريجياً إلى طاقة حركة مع بقاء المجموع ثابتاً.'
    ],
    analogy: 'تخيل أن لديك 100 ريال؛ يمكن أن تصرفها في صورة نقود ورقية أو معدنية، لكن مجموع ما تملكه يظل 100 ريال.',
    studyTip: 'ارسم بندول الساعة أو قطار الملاهي لتتبع تحولات الطاقة بين القمة والقاع بصرياً.',
    createdAt: new Date().toISOString(),
  }
];

export const initialSessions: StudySessionLog[] = [
  {
    id: 's1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    durationMinutes: 25,
    mode: 'focus',
    subject: 'الأحياء',
  },
  {
    id: 's2',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    durationMinutes: 25,
    mode: 'focus',
    subject: 'الأحياء',
  },
  {
    id: 's3',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    durationMinutes: 25,
    mode: 'focus',
    subject: 'اللغة الإنجليزية',
  },
  {
    id: 's4',
    timestamp: new Date().toISOString(),
    durationMinutes: 25,
    mode: 'focus',
    subject: 'الرياضيات',
  },
];

// Helper functions for reading & writing to localStorage
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  getDecks: (): Deck[] => loadFromStorage(STORAGE_KEYS.DECKS, initialDecks),
  saveDecks: (decks: Deck[]) => saveToStorage(STORAGE_KEYS.DECKS, decks),

  getTasks: (): Task[] => loadFromStorage(STORAGE_KEYS.TASKS, initialTasks),
  saveTasks: (tasks: Task[]) => saveToStorage(STORAGE_KEYS.TASKS, tasks),

  getExams: (): Exam[] => loadFromStorage(STORAGE_KEYS.EXAMS, initialExams),
  saveExams: (exams: Exam[]) => saveToStorage(STORAGE_KEYS.EXAMS, exams),

  getSessions: (): StudySessionLog[] => loadFromStorage(STORAGE_KEYS.SESSIONS, initialSessions),
  saveSessions: (sessions: StudySessionLog[]) => saveToStorage(STORAGE_KEYS.SESSIONS, sessions),

  getNotes: (): SavedNote[] => loadFromStorage(STORAGE_KEYS.NOTES, initialNotes),
  saveNotes: (notes: SavedNote[]) => saveToStorage(STORAGE_KEYS.NOTES, notes),

  getSettings: (): PomodoroSettings => loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings),
  saveSettings: (settings: PomodoroSettings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings),

  getStreak: (): number => {
    const streakData = loadFromStorage<{ count: number; lastDate: string }>(STORAGE_KEYS.STREAK, {
      count: 4,
      lastDate: new Date().toISOString().split('T')[0],
    });
    return streakData.count;
  },
  incrementStreak: () => {
    const today = new Date().toISOString().split('T')[0];
    const streakData = loadFromStorage<{ count: number; lastDate: string }>(STORAGE_KEYS.STREAK, {
      count: 4,
      lastDate: '',
    });
    if (streakData.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newCount = streakData.lastDate === yesterday ? streakData.count + 1 : 1;
      saveToStorage(STORAGE_KEYS.STREAK, { count: newCount, lastDate: today });
      return newCount;
    }
    return streakData.count;
  },
};
