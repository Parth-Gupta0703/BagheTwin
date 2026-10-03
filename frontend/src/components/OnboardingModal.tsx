import React, { useState } from 'react';
import { useI18n } from '../i18n';
import {
  Compass,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartDemo,
}) => {
  const { t } = useI18n();
  const [screen, setScreen] = useState<number>(0);

  if (!isOpen) return null;

  const screens = [
    {
      icon: Compass,
      iconBg: 'bg-blue-100 text-blue-600',
      title: t.onboarding.screen1Title,
      desc: t.onboarding.screen1Desc,
      tag: '01 / 03',
    },
    {
      icon: Lightbulb,
      iconBg: 'bg-amber-100 text-amber-600',
      title: t.onboarding.screen2Title,
      desc: t.onboarding.screen2Desc,
      tag: '02 / 03',
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-teal-100 text-teal-600',
      title: t.onboarding.screen3Title,
      desc: t.onboarding.screen3Desc,
      tag: '03 / 03',
    },
  ];

  const current = screens[screen];
  const Icon = current.icon;

  const handleNext = () => {
    if (screen < screens.length - 1) {
      setScreen(screen + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        {/* Skip button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md transition-colors cursor-pointer"
        >
          {t.actions.skip}
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center pt-4 pb-2">
          {/* Step Tag */}
          <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider mb-4">
            {current.tag}
          </span>

          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${current.iconBg} shadow-sm`}>
            <Icon className="w-8 h-8" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
            {current.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-6">
            {current.desc}
          </p>

          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {screens.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setScreen(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  screen === idx ? 'w-6 bg-teal-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="w-full flex gap-3">
            {screen === screens.length - 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.actions.start}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onStartDemo();
                  }}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <span>{t.home.quickDemo}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <span>{t.actions.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
