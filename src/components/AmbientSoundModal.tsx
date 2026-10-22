import React, { useState } from 'react';
import { X, Volume2, CloudRain, Waves, Radio, Brain, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AmbientSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateChange: () => void;
}

interface SoundItem {
  id: 'rain' | 'waves' | 'whitenoise' | 'binaural';
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const AmbientSoundModal: React.FC<AmbientSoundModalProps> = ({
  isOpen,
  onClose,
  onStateChange,
}) => {
  const [activeSounds, setActiveSounds] = useState<Record<string, { playing: boolean; volume: number }>>({
    rain: { playing: soundManager.isPlaying('rain'), volume: 0.5 },
    waves: { playing: soundManager.isPlaying('waves'), volume: 0.5 },
    whitenoise: { playing: soundManager.isPlaying('whitenoise'), volume: 0.4 },
    binaural: { playing: soundManager.isPlaying('binaural'), volume: 0.35 },
  });

  if (!isOpen) return null;

  const sounds: SoundItem[] = [
    {
      id: 'rain',
      name: 'هطول الأمطار الهادئ',
      description: 'قطرات مطر طبيعية تساعد على عزل الضوضاء المحيطة وتخفيف التوتر.',
      icon: <CloudRain className="w-5 h-5 text-sky-500" />,
    },
    {
      id: 'waves',
      name: 'أمواج البحر والشاطئ',
      description: 'حركة مد وجزر متناغمة تعزز حالة التدفق الذهني والاسترخاء.',
      icon: <Waves className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 'whitenoise',
      name: 'الضوضاء البيضاء النقية',
      description: 'ترددات متساوية تحجب الأصوات المفاجئة في الغرفة ومثالية للحفظ.',
      icon: <Radio className="w-5 h-5 text-indigo-500" />,
    },
    {
      id: 'binaural',
      name: 'نغمات 40Hz ثنائية الأذن (Binaural Focus)',
      description: 'موجات جاما مدروسة علمياً لتحفيز الذاكرة قصيرة المدى والاستيعاب السريع (يُفضل استخدام سماعات الرأس).',
      icon: <Brain className="w-5 h-5 text-violet-500" />,
    },
  ];

  const toggleSound = (id: 'rain' | 'waves' | 'whitenoise' | 'binaural') => {
    const current = activeSounds[id];
    if (current.playing) {
      soundManager.stopAmbient(id);
      setActiveSounds((prev) => ({
        ...prev,
        [id]: { ...prev[id], playing: false },
      }));
    } else {
      soundManager.startAmbient(id, current.volume);
      setActiveSounds((prev) => ({
        ...prev,
        [id]: { ...prev[id], playing: true },
      }));
    }
    onStateChange();
  };

  const handleVolumeChange = (id: 'rain' | 'waves' | 'whitenoise' | 'binaural', newVol: number) => {
    setActiveSounds((prev) => ({
      ...prev,
      [id]: { ...prev[id], volume: newVol },
    }));
    soundManager.setVolume(id, newVol);
  };

  const stopAll = () => {
    soundManager.stopAll();
    setActiveSounds({
      rain: { playing: false, volume: 0.5 },
      waves: { playing: false, volume: 0.5 },
      whitenoise: { playing: false, volume: 0.4 },
      binaural: { playing: false, volume: 0.35 },
    });
    onStateChange();
  };

  const hasAnyPlaying = Object.values(activeSounds).some((s) => s.playing);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6"
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                أصوات التركيز المحيطية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أصوات حقيقية تخلّق عبر Web Audio لتعزيز صفاء الذهن وتفادي التشتت
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

        <div className="space-y-4">
          {sounds.map((item) => {
            const state = activeSounds[item.id];
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  state.playing
                    ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSound(item.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      state.playing
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {state.playing ? 'إيقاف' : 'تشغيل'}
                  </button>
                </div>

                {state.playing && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      مستوى الصوت
                    </span>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={state.volume}
                      onChange={(e) => handleVolumeChange(item.id, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 tabular-nums w-8 text-left">
                      {Math.round(state.volume * 100)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={stopAll}
            disabled={!hasAnyPlaying}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              hasAnyPlaying
                ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            <VolumeX className="w-4 h-4" />
            <span>إيقاف جميع الأصوات</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
