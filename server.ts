import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasAiKey: Boolean(apiKey) });
});

// 1. Generate Quiz from topic or notes
app.post('/api/gemini/quiz', async (req, res) => {
  const { topic, notes, count = 5, difficulty = 'medium' } = req.body;
  if (!topic && !notes) {
    return res.status(400).json({ error: 'يرجى تقديم موضوع أو ملاحظات لإنشاء الاختبار' });
  }

  if (!ai) {
    // Return high quality educational fallback questions if no API key is set
    return res.json({
      title: `اختبار تجريبي: ${topic || 'المذاكرة العامة'}`,
      questions: [
        {
          id: 'q1',
          question: `ما هو المفهوم الأساسي الأكثر أهمية في دراسة: ${topic || 'هذا الموضوع'}؟`,
          options: [
            'فهم المبادئ الأولية والتطبيق العملي',
            'الحفظ السطحي فقط دون استيعاب السياق',
            'تجاهل التدريب وحل التمارين',
            'تأجيل المذاكرة حتى ليلة الاختبار'
          ],
          correctAnswerIndex: 0,
          explanation: 'الفهم العميق للمبادئ الأولية وربطها بالتطبيقات العملية هو أساس التحصيل الدراسي المتميز والتذكر طويل الأمد.'
        },
        {
          id: 'q2',
          question: 'أي التقنيات التالية تساهم في تثبيت المعلومات في الذاكرة طويلة الأمد بفعالية؟',
          options: [
            'القراءة السريعة لمرة واحدة فقط',
            'التكرار المتباعد (Spaced Repetition) والاسترجاع الفعال',
            'المذاكرة لساعات طويلة بدون راحة',
            'الاعتماد فقط على التحديد بالألوان'
          ],
          correctAnswerIndex: 1,
          explanation: 'التكرار المتباعد واختبار النفس دورياً يرفع معدل الاستبقاء لأكثر من 80% مقارنة بالقراءة العادية.'
        },
        {
          id: 'q3',
          question: 'كيف يساعد تقسيم أوقات الدراسة عبر تقنية بومودورو في تحسين الإنتاجية؟',
          options: [
            'زيادة التشتت بسبب الاستراحات المتكررة',
            'الحفاظ على تدفق التركيز ومنع الإرهاق الذهني عبر فترات محددة 25/5 دقيقة',
            'إطالة وقت المذاكرة لـ 8 ساعات مستمرة',
            'تقليل عدد المواد التي يمكن مذاكرتها'
          ],
          correctAnswerIndex: 1,
          explanation: 'فترات التركيز المحددة تعطي الدماغ طاقة متجددة وتمنع التسويف والتعب.'
        }
      ]
    });
  }

  try {
    const prompt = `أنت خبير تربوي ومعد اختبارات متميز. قم بإنشاء اختبار اختيار من متعدد باللغة العربية حول:
الموضوع: ${topic || 'عام'}
الملاحظات/النص: ${notes || 'غير متوفر'}
عدد الأسئلة: ${count}
مستوى الصعوبة: ${difficulty}

يجب أن تكون الأسئلة دقيقة، تعليمية، ومباشرة. وفر شرحاً واضحاً وموجزاً لسبب صحة كل إجابة.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'عنوان الاختبار المناسب' },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING, description: 'نص السؤال' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '4 خيارات للإجابة'
                  },
                  correctAnswerIndex: { type: Type.INTEGER, description: 'رقم الإجابة الصحيحة من 0 إلى 3' },
                  explanation: { type: Type.STRING, description: 'شرح مبسط لسبب صحة الإجابة' }
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation']
              }
            }
          },
          required: ['title', 'questions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    // Ensure ids
    if (parsed.questions) {
      parsed.questions = parsed.questions.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `gen_q_${Date.now()}_${idx}`
      }));
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء توليد الاختبار الذكي' });
  }
});

// 2. Generate Flashcards from topic or lesson text
app.post('/api/gemini/flashcards', async (req, res) => {
  const { topic, content, count = 6 } = req.body;
  if (!topic && !content) {
    return res.status(400).json({ error: 'يرجى تقديم موضوع أو نص لإنشاء البطاقات' });
  }

  if (!ai) {
    return res.json({
      deckTitle: topic || 'بطاقات استذكار نموذجية',
      cards: [
        {
          front: `ما هو التعريف الأساسي لـ: ${topic || 'المصطلح الأساسي'}؟`,
          back: 'المفهوم الجوهري الذي يعبر عن الفكرة العامة، مع التركيز على الخصائص والأمثلة التطبيقية.',
          hint: 'تذكر الوظيفة الأساسية'
        },
        {
          front: 'ما هي أهم 3 عناصر أو ركائز لهذا الموضوع؟',
          back: '1. الفهم النظري\n2. التطبيق والتدريب العملي\n3. التكرار المتباعد والتقييم الذاتي',
          hint: 'مراحل الإتقان'
        },
        {
          front: 'كيف نميز بين المفهوم وتطبيقاته العملية في الاختبارات؟',
          back: 'من خلال البحث عن الكلمات المفتاحية وسياق السؤال وربط السبب بالنتيجة.',
          hint: 'تحليل الأسئلة'
        }
      ]
    });
  }

  try {
    const prompt = `أنت معلم خبير في تقنيات الاستذكار الفعال (Flashcards).
قم باستخراج أفضل بطاقات استذكار ذكية (سؤال/تعريف في الوجه الأمامي، وجواب مركز في الوجه الخلفي مع تلميح اختياري) باللغة العربية.
الموضوع: ${topic || ''}
النص/الدرس: ${content || ''}
العدد المطلوب: ${count} بطاقة.
اجعل الأسئلة دقيقة تركز على المفاهيم الجوهرية والتعاريف والقوانين أو الأمثلة المفصلية.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: 'السؤال أو المصطلح أو المفهوم (الوجه الأمامي)' },
                  back: { type: Type.STRING, description: 'الإجابة المركزة والشرح الدقيق (الوجه الخلفي)' },
                  hint: { type: Type.STRING, description: 'تلميح ذهني مختصر للمساعدة' }
                },
                required: ['front', 'back']
              }
            }
          },
          required: ['deckTitle', 'cards']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Flashcards generation error:', error);
    res.status(500).json({ error: error.message || 'فشل في إنشاء بطاقات الاستذكار' });
  }
});

// 3. Explain, Summarize or create Mnemonics
app.post('/api/gemini/explain', async (req, res) => {
  const { concept, mode = 'explain', detailLevel = 'balanced' } = req.body;
  if (!concept) {
    return res.status(400).json({ error: 'يرجى إدخال المفهوم أو السؤال' });
  }

  if (!ai) {
    return res.json({
      summary: `شرح ملخص لمفهوم: "${concept}"`,
      keyPoints: [
        'الفكرة الأساسية: بناء فهم متدرج من البسيط إلى المعقد',
        'العلاقات والروابط: ربط المعلومة بما تم تعلمه سابقاً',
        'التطبيق العملي: حل تدريبات فورية لترسيخ الفكرة'
      ],
      analogy: 'تخيل المفهوم مثل بناء جدار صلب؛ كل معلومة هي قالب يعتمد على ما قبله.',
      mnemonic: 'احفظ الكلمات المفتاحية بالترتيب: فهم -> تلخيص -> استرجاع',
      studyTip: 'قم بتدريس هذا المفهوم لشخص آخر بأسلوبك لتتأكد من إتقانك له (تقنية فاينمان).'
    });
  }

  try {
    let modeInstruction = 'اشرح المفهوم بأسلوب المعلم الماهر مع أمثلة واقعية وتبسيط واضح.';
    if (mode === 'summarize') {
      modeInstruction = 'لخص النص أو المفهوم في نقاط محددة وسريعة الاستيعاب، مستخرجاً أهم الحقائق والأفكار الأساسية.';
    } else if (mode === 'feynman') {
      modeInstruction = 'اشرح المفهوم وفق تقنية فاينمان (كما لو كنت تشرحه لطالب في العاشرة من عمره) باستخدام تشبيه ذكي وتجنب المصطلحات المعقدة.';
    } else if (mode === 'mnemonics') {
      modeInstruction = 'أنشئ جملة أو طريقة تذكر ذكية (Mnemonic) واختصارات مبتكرة لسهولة تذكر هذا الدرس في الامتحان.';
    }

    const prompt = `أنت مساعد مذاكرة ذكي للطلاب. باللغة العربية الفصحى السلسة والمحفزة:
المفهوم/النص المطلوب: ${concept}
النمط المطلوب: ${modeInstruction}
مستوى التفصيل: ${detailLevel}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'الملخص الشامل أو الشرح الرئيسي' },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'النقاط الجوهرية (3 إلى 5 نقاط)'
            },
            analogy: { type: Type.STRING, description: 'تشبيه توضيحي واقعي يقرب الصورة' },
            mnemonic: { type: Type.STRING, description: 'حيلة ذاكرة أو اختصار ذكي للحفظ' },
            studyTip: { type: Type.STRING, description: 'نصيحة ذهبية لطريقة المذاكرة والمراجعة' }
          },
          required: ['summary', 'keyPoints', 'studyTip']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Explain error:', error);
    res.status(500).json({ error: error.message || 'فشل في شرح المفهوم' });
  }
});

// 4. Study Schedule Planner with AI
app.post('/api/gemini/plan', async (req, res) => {
  const { subjects, daysUntilExam, hoursPerDay = 3 } = req.body;

  if (!ai) {
    const defaultSubjects = subjects && subjects.length > 0 ? subjects : ['الرياضيات', 'العلوم', 'اللغة الإنجليزية'];
    return res.json({
      planTitle: `خطة مذاكرة مقترحة لـ ${daysUntilExam || 7} أيام`,
      dailyTargetHours: hoursPerDay,
      advice: 'قسّم اليوم إلى جلسات بومودورو مدتها 25 دقيقة، وابدأ بالمواد الأكثر تطلباً للتركيز في الصباح.',
      days: Array.from({ length: Math.min(daysUntilExam || 5, 7) }).map((_, i) => ({
        dayNumber: i + 1,
        focusSubject: defaultSubjects[i % defaultSubjects.length],
        goal: `مراجعة الوحدة ${i + 1} وحل تمارين تطبيقية وبطاقات استذكار`,
        estimatedPomodoros: Math.max(2, Math.round(hoursPerDay * 2))
      }))
    });
  }

  try {
    const prompt = `أنت مستشار تنظيم وقت ومذاكرة للطلاب. صمم خطة مذاكرة ذكية ومتوازنة:
المواد: ${JSON.stringify(subjects || ['المواد الدراسية'])}
الأيام المتبقية: ${daysUntilExam} يوم
ساعات المذاكرة المتاحة يومياً: ${hoursPerDay} ساعة

وزّع المذاكرة بأسلوب متوازن مع مراجعات دورية وفترات استراحة بومودورو.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            dailyTargetHours: { type: Type.NUMBER },
            advice: { type: Type.STRING, description: 'نصيحة توجيهية هامة لتنفيذ الخطة' },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  focusSubject: { type: Type.STRING },
                  goal: { type: Type.STRING, description: 'الهدف المحدد لهذا اليوم' },
                  estimatedPomodoros: { type: Type.INTEGER, description: 'عدد جلسات بومودورو (كل جلسة 25 دقيقة)' }
                },
                required: ['dayNumber', 'focusSubject', 'goal', 'estimatedPomodoros']
              }
            }
          },
          required: ['planTitle', 'dailyTargetHours', 'advice', 'days']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Plan error:', error);
    res.status(500).json({ error: error.message || 'فشل في إنشاء خطة المذاكرة' });
  }
});

// Setup Vite or Static hosting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study App Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
