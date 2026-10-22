import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  RotateCw, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Play, 
  Trash2, 
  Edit3, 
  Lightbulb, 
  CheckCircle2,
  X
} from 'lucide-react';
import { Deck, Flashcard } from '../types';

interface FlashcardManagerProps {
  decks: Deck[];
  onSaveDecks: (decks: Deck[]) => void;
  onCardReviewed: () => void;
}

export const FlashcardManager: React.FC<FlashcardManagerProps> = ({
  decks,
  onSaveDecks,
  onCardReviewed,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(decks[0]?.id || null);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Modals
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // New deck form
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');

  // New manual card form
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardHint, setNewCardHint] = useState('');

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const activeDeck = decks.find((d) => d.id === selectedDeckId);

  // Start study session
  const startStudying = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setIsStudyMode(true);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRateCard = (rating: 'hard' | 'medium' | 'easy') => {
    if (!activeDeck) return;
    const currentCard = activeDeck.cards[currentCardIndex];
    if (!currentCard) return;

    let nextMastery = currentCard.masteryLevel;
    if (rating === 'easy') nextMastery = 'mastered';
    else if (rating === 'medium') nextMastery = 'learning';
    else nextMastery = 'new';

    const updatedCards = [...activeDeck.cards];
    updatedCards[currentCardIndex] = {
      ...currentCard,
      masteryLevel: nextMastery,
      reviewCount: currentCard.reviewCount + 1,
      lastReviewed: new Date().toISOString(),
    };

    const updatedDecks = decks.map((d) =>
      d.id === activeDeck.id ? { ...d, cards: updatedCards } : d
    );
    onSaveDecks(updatedDecks);
    onCardReviewed();

    // Advance to next card
    if (currentCardIndex + 1 < activeDeck.cards.length) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // Completed all cards in deck
      setCurrentCardIndex(activeDeck.cards.length);
    }
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;

    const colors = ['#4f46e5', '#059669', '#0284c7', '#d97706', '#8b5cf6'];
    const randomColor = colors[decks.length % colors.length];

    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      title: newDeckTitle.trim(),
      subject: newDeckSubject.trim() || 'عام',
      description: newDeckDesc.trim(),
      color: randomColor,
      createdAt: new Date().toISOString(),
      cards: [],
    };

    const updated = [newDeck, ...decks];
    onSaveDecks(updated);
    setSelectedDeckId(newDeck.id);
    setNewDeckTitle('');
    setNewDeckSubject('');
    setNewDeckDesc('');
    setShowNewDeckModal(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeck || !newCardFront.trim() || !newCardBack.trim()) return;

    const newCard: Flashcard = {
      id: `c_${Date.now()}`,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      hint: newCardHint.trim() || undefined,
      masteryLevel: 'new',
      reviewCount: 0,
    };

    const updatedDecks = decks.map((d) =>
      d.id === activeDeck.id ? { ...d, cards: [...d.cards, newCard] } : d
    );

    onSaveDecks(updatedDecks);
    setNewCardFront('');
    setNewCardBack('');
    setNewCardHint('');
    setShowNewCardModal(false);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!activeDeck) return;
    const updatedCards = activeDeck.cards.filter((c) => c.id !== cardId);
    const updatedDecks = decks.map((d) =>
      d.id === activeDeck.id ? { ...d, cards: updatedCards } : d
    );
    onSaveDecks(updatedDecks);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (decks.length <= 1) {
      alert('لا يمكن حذف جميع المجموعات، يجب الاحتفاظ بمجموعة واحدة على الأقل.');
      return;
    }
    const updated = decks.filter((d) => d.id !== deckId);
    onSaveDecks(updated);
    setSelectedDeckId(updated[0]?.id || null);
  };

  // AI Flashcards Generator API
  const handleGenerateAiCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() && !aiContent.trim()) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          content: aiContent,
          count: aiCount,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء البطاقات بواسطة الذكاء الاصطناعي');
      }

      const data = await response.json();
      const generatedCards: Flashcard[] = (data.cards || []).map((c: any, idx: number) => ({
        id: `ai_c_${Date.now()}_${idx}`,
        front: c.front,
        back: c.back,
        hint: c.hint,
        masteryLevel: 'new',
        reviewCount: 0,
      }));

      // Add to current active deck or create new deck
      if (activeDeck) {
        const updatedDecks = decks.map((d) =>
          d.id === activeDeck.id ? { ...d, cards: [...d.cards, ...generatedCards] } : d
        );
        onSaveDecks(updatedDecks);
      } else {
        const newDeck: Deck = {
          id: `deck_ai_${Date.now()}`,
          title: data.deckTitle || aiTopic || 'مجموعة ذكية',
          subject: aiTopic || 'مادة عامة',
          description: 'مجموعة مولدة بالذكاء الاصطناعي',
          color: '#4f46e5',
          createdAt: new Date().toISOString(),
          cards: generatedCards,
        };
        onSaveDecks([newDeck, ...decks]);
        setSelectedDeckId(newDeck.id);
      }

      setShowAiModal(false);
      setAiTopic('');
      setAiContent('');
    } catch (err: any) {
      setAiError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>بطاقات الاستذكار الفعّال (Flashcards)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            استرجع المعلومات بتكنيك التكرار المتباعد (Spaced Repetition) لتثبيتها في الذاكرة طويلة المدى
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>توليد بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => setShowNewDeckModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>مجموعة جديدة</span>
          </button>
        </div>
      </div>

      {/* Main Content: Split into Deck Selector + Study Area */}
      {isStudyMode && activeDeck ? (
        /* STUDY MODE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsStudyMode(false)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لإدارة البطاقات</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {activeDeck.title}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                {Math.min(currentCardIndex + 1, activeDeck.cards.length)} / {activeDeck.cards.length}
              </span>
            </div>
          </div>

          {currentCardIndex < activeDeck.cards.length ? (
            /* ACTIVE CARD FLIP VIEW */
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{
                    width: `${((currentCardIndex + 1) / activeDeck.cards.length) * 100}%`,
                  }}
                />
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={handleFlip}
                className="w-full max-w-xl min-h-[300px] sm:min-h-[340px] p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/70 shadow-sm cursor-pointer flex flex-col justify-between select-none relative group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 transform active:scale-[0.99]"
              >
                {/* Header label */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {isFlipped ? 'الإجابة والشرح (الوجه الخلفي)' : 'السؤال / المفهوم (الوجه الأمامي)'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>انقر للقلب</span>
                  </div>
                </div>

                {/* Card Main Text */}
                <div className="my-auto py-4 text-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                    {isFlipped
                      ? activeDeck.cards[currentCardIndex].back
                      : activeDeck.cards[currentCardIndex].front}
                  </p>

                  {/* Hint section */}
                  {!isFlipped && activeDeck.cards[currentCardIndex].hint && (
                    <div className="mt-4">
                      {showHint ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>تلميح: {activeDeck.cards[currentCardIndex].hint}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-500 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>عرض التلميح الذهني</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="text-center text-[11px] text-slate-400">
                  {isFlipped ? 'قيّم مدى استيعابك لاحتساب موعد المراجعة القادم' : 'فكر في الإجابة أولاً ثم انقر للكشف'}
                </div>
              </div>

              {/* Spaced Repetition Feedback Buttons (Shown when flipped) */}
              {isFlipped ? (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full max-w-xl">
                  <button
                    onClick={() => handleRateCard('hard')}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-all flex flex-col items-center"
                  >
                    <span>صعب جداً</span>
                    <span className="text-[10px] opacity-75 font-normal">مراجعة غداً</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('medium')}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 transition-all flex flex-col items-center"
                  >
                    <span>متوسط</span>
                    <span className="text-[10px] opacity-75 font-normal">بعد 3 أيام</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('easy')}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 transition-all flex flex-col items-center"
                  >
                    <span>سهل ومتقن</span>
                    <span className="text-[10px] opacity-75 font-normal">بعد 5 أيام</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleFlip}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  إظهار الإجابة (قلب البطاقة)
                </button>
              )}
            </div>
          ) : (
            /* COMPLETED SUMMARY SCREEN */
            <div className="text-center py-12 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                أحسنت! أتممت مراجعة جميع بطاقات المجموعة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                تم تحديث مواعيد المراجعة بناءً على إجاباتك. الاستمرارية اليومية هي سر التفوق الدراسي!
              </p>
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => startStudying(activeDeck.id)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  إعادة مراجعة المجموعة
                </button>
                <button
                  onClick={() => setIsStudyMode(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  العودة للمجموعات
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* DECKS & CARD MANAGEMENT VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Deck List Sidebar */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              مجموعات البطاقات ({decks.length})
            </h2>

            {decks.map((deck) => {
              const isSelected = deck.id === selectedDeckId;
              const masteredCount = deck.cards.filter((c) => c.masteryLevel === 'mastered').length;
              const masteryPercent = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;

              return (
                <div
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                        {deck.subject}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {deck.title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startStudying(deck.id);
                      }}
                      disabled={deck.cards.length === 0}
                      className={`p-2 rounded-xl transition-colors shrink-0 ${
                        deck.cards.length === 0
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                      }`}
                      title="ابدأ جلسة الاستذكار"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {deck.description || 'بدون وصف'}
                  </p>

                  {/* Progress and card count */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="tabular-nums font-semibold">
                      {deck.cards.length} بطاقة
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      إتقان {masteryPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Deck Detail & Card Listing */}
          <div className="lg:col-span-2 space-y-4">
            {activeDeck ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                
                {/* Active Deck Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {activeDeck.subject}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeDeck.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeDeck.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startStudying(activeDeck.id)}
                      disabled={activeDeck.cards.length === 0}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors ${
                        activeDeck.cards.length === 0
                          ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-xs'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>بدء المراجعة</span>
                    </button>

                    <button
                      onClick={() => setShowNewCardModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة بطاقة</span>
                    </button>

                    <button
                      onClick={() => handleDeleteDeck(activeDeck.id)}
                      title="حذف هذه المجموعة"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                {activeDeck.cards.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      هذه المجموعة لا تحتوي على بطاقات بعد
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      أضف بطاقة يدوياً أو استخدم الذكاء الاصطناعي لتوليد بطاقات فورية من الدرس
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setShowNewCardModal(true)}
                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                      >
                        إضافة بطاقة
                      </button>
                      <button
                        onClick={() => setShowAiModal(true)}
                        className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
                      >
                        توليد بالذكاء الاصطناعي
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeDeck.cards.map((card, idx) => (
                      <div
                        key={card.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-mono text-[11px]">#{idx + 1}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                card.masteryLevel === 'mastered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : (card.masteryLevel === 'learning'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300')
                              }`}
                            >
                              {card.masteryLevel === 'mastered' ? 'متقن' : (card.masteryLevel === 'learning' ? 'قيد التعلم' : 'جديد')}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                            {card.front}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {card.back}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-400">
                          <span>روجعت {card.reviewCount} مرات</span>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="حذف البطاقة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">اختر مجموعة من القائمة لاستعراض بطاقاتها</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: Create New Deck */}
      {showNewDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                إنشاء مجموعة بطاقات جديدة
              </h3>
              <button onClick={() => setShowNewDeckModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeck} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المجموعة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الأحياء - الوراثة الجزيئية"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  المادة الدراسية
                </label>
                <input
                  type="text"
                  placeholder="مثال: الأحياء، اللغة الإنجليزية، الرياضيات..."
                  value={newDeckSubject}
                  onChange={(e) => setNewDeckSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  وصف مختصر للمجموعة
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات حول محتوى هذه المجموعة ومحاورها..."
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewDeckModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  إنشاء المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Manual Card */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                إضافة بطاقة استذكار جديدة
              </h3>
              <button onClick={() => setShowNewCardModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الوجه الأمامي (السؤال أو المصطلح)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="اكتب السؤال أو المصطلح الذي تريد استرجاعه..."
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الوجه الخلفي (الإجابة والشرح الواضح)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="اكتب الإجابة النموذجية أو الشرح الدقيق..."
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  تلميح اختياري للمساعدة
                </label>
                <input
                  type="text"
                  placeholder="كلمة مفتاحية أو إشارة تقرب الإجابة لذهنك..."
                  value={newCardHint}
                  onChange={(e) => setNewCardHint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  إضافة البطاقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI Flashcards Generator */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  توليد بطاقات استذكار بالذكاء الاصطناعي
                </h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {aiError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                {aiError}
              </div>
            )}

            <form onSubmit={handleGenerateAiCards} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  موضوع الدرس أو المادة
                </label>
                <input
                  type="text"
                  placeholder="مثال: قوانين الحركة لنيوتن، أزمنة الماضي في الإنجليزية، التفاعلات الكيميائية..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نص الدرس أو فقرة من كتابك (اختياري)
                </label>
                <textarea
                  rows={4}
                  placeholder="الصق نص المحاضرة أو الدرس هنا لاستخراج أهم النقاط بدقة متناهية..."
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  عدد البطاقات المطلوبة:
                </span>
                <div className="flex items-center gap-2">
                  {[3, 5, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAiCount(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        aiCount === num
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {num} بطاقات
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  disabled={aiLoading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={aiLoading || (!aiTopic.trim() && !aiContent.trim())}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري استخراج البطاقات...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>توليد وإضافة للمجموعة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
