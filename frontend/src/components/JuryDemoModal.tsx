import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  Layers,
  Lightbulb,
  Shield,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../i18n';

interface JuryDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onSelectWell: (wellCode: string) => void;
  onResetDemo?: () => void;
}

export const JuryDemoModal: React.FC<JuryDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectWell,
  onResetDemo,
}) => {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: t.demo.step1,
      question: t.demo.step1q,
      shortTitle: '01 Fleet',
      tab: 'command-center',
      well: 'BGW-007',
      icon: Activity,
      color: 'teal',
      description:
        'The Command Center shows 12 monitored Rajasthan heavy oil wells. Fleet health is summarized: 9 Normal, 2 Need Attention, 1 Critical. The system immediately identifies BGW-007 as the priority.',
      speakerScript:
        '"BagheTwin continuously monitors our Rajasthan heavy oil fleet. Right now, 12 wells are tracked. The system identifies BGW-007 as the single critical well requiring immediate attention."',
      focusHighlight: '12 WELLS MONITORED • 1 CRITICAL (BGW-007) • 2 ATTENTION • 9 NORMAL',
      actionLabel: 'Identify Critical Well',
    },
    {
      step: 2,
      title: t.demo.step2,
      question: t.demo.step2q,
      shortTitle: '02 Priority',
      tab: 'well-explorer',
      well: 'BGW-007',
      icon: Search,
      color: 'red',
      description:
        'Well BGW-007 is flagged CRITICAL. Its floating margin is 1.35 kN — below the 2.0 kN safety threshold. Temperature has dropped to 49°C, causing crude viscosity to spike to 12,089 cP.',
      speakerScript:
        '"Well BGW-007 is the priority. Temperature has cooled to 49°C, causing viscosity to spike to over 12,000 cP. The floating safety margin is 1.35 kN — critically below the 2.0 kN threshold."',
      focusHighlight: 'BGW-007 • CRITICAL • MARGIN: 1.35 kN (< 2.0 kN THRESHOLD)',
      actionLabel: 'Understand Root Cause',
    },
    {
      step: 3,
      title: t.demo.step3,
      question: t.demo.step3q,
      shortTitle: '03 Explain',
      tab: 'digital-twin',
      well: 'BGW-007',
      icon: Layers,
      color: 'amber',
      description:
        'The Digital Twin shows the cause-effect chain: Steam heat dissipation → Temperature drops → Viscosity spikes → Rod drag increases → Floating margin falls below safety threshold.',
      speakerScript:
        '"The Digital Twin explains WHY this happened. Two separate chains show: (1) the CURRENT degradation — temperature decline is driving exponential viscosity increase and rod-float hazard; (2) the EXPECTED intervention — steam injection would reverse the chain."',
      focusHighlight: 'TEMP ↓ → VISCOSITY ↑ → DRAG ↑ → MARGIN ↓ → RISK ↑',
      actionLabel: 'View Recommendation',
    },
    {
      step: 4,
      title: t.demo.step4,
      question: t.demo.step4q,
      shortTitle: '04 Recommend',
      tab: 'recommendations',
      well: 'BGW-007',
      icon: Lightbulb,
      color: 'amber',
      description:
        'A safety-checked recommendation is generated: reduce SRP speed to 4.8 SPM, lengthen stroke to 144", and schedule CSS Cycle 5 thermal injection.',
      speakerScript:
        '"The system generates a clear recommendation: slower pump speed, longer stroke, and thermal re-stimulation. Each recommendation shows WHY it was chosen, the primary driver, safety constraint, and optimization objective."',
      focusHighlight: 'WHY: ROD FLOAT RISK • SAFETY: MARGIN ≥ 2.0 kN • OBJECTIVE: MAX OIL + SAFE',
      actionLabel: 'Validate Safety',
    },
    {
      step: 5,
      title: t.demo.step5,
      question: t.demo.step5q,
      shortTitle: '05 Validate',
      tab: 'css-optimizer',
      well: 'BGW-007',
      icon: Shield,
      color: 'emerald',
      description:
        'The CSS Optimizer sizes Cycle 5: 2,200 tonnes of steam at 85 bar. The system validates that injection pressure remains below the 100 bar caprock fracture limit.',
      speakerScript:
        '"Before execution, we validate the intervention is SAFE. Steam injection of 2,200 tonnes at 85 bar stays well below the 100 bar fracture gradient. Viscosity is predicted to collapse from 12,089 cP to 185 cP."',
      focusHighlight: '2,200t STEAM @ 85 BAR • PRESSURE: 85 < 100 BAR (SAFE) • VISCOSITY: 12,089 → 185 cP',
      actionLabel: 'Run Simulation',
    },
    {
      step: 6,
      title: t.demo.step6,
      question: t.demo.step6q,
      shortTitle: '06 Simulate',
      tab: 'before-after',
      well: 'BGW-007',
      icon: Play,
      color: 'blue',
      description:
        'Side-by-side comparison: Current vs Recommended. Floating margin improves from 1.35 kN to 5.15 kN. Oil production lifts from 31.0 to 55.2 BOPD. Risk drops from CRITICAL to LOW.',
      speakerScript:
        '"The simulation result is dramatic: floating margin jumps from 1.35 to 5.15 kN — well above the 2.0 kN threshold. Production lifts to 55.2 BOPD. Rod-float risk is eliminated."',
      focusHighlight: 'MARGIN: 1.35 → 5.15 kN (SAFE) • OIL: 31.0 → 55.2 BOPD • RISK: CRITICAL → LOW',
      actionLabel: 'Confirm Safer State',
    },
    {
      step: 7,
      title: t.demo.step7,
      question: t.demo.step7q,
      shortTitle: '07 Confirm',
      tab: 'audit-trail',
      well: 'BGW-007',
      icon: CheckCircle2,
      color: 'emerald',
      description:
        'The Audit Trail records operator approval, every parameter change, and provides an immutable compliance record for field governance.',
      speakerScript:
        '"Finally, the system records the entire decision pathway: from detection to recommendation to simulation to approval. Every decision is traceable, providing full transparency and accountability."',
      focusHighlight: 'IMMUTABLE AUDIT TRAIL • HUMAN-IN-THE-LOOP • DECISION SUPPORT ONLY',
      actionLabel: 'Complete Demo',
    },
  ];

  const current = steps[step - 1];
  const IconComponent = current.icon;

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    const target = steps[newStep - 1];
    onSelectWell(target.well);
    onNavigateTab(target.tab);
  };

  const handleNext = () => {
    if (step < steps.length) {
      handleStepChange(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      handleStepChange(step - 1);
    }
  };

  const colorMap: Record<string, { bg: string; text: string; border: string; active: string }> = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', active: 'bg-teal-600' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', active: 'bg-red-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', active: 'bg-amber-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', active: 'bg-emerald-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', active: 'bg-blue-600' },
  };

  const cc = colorMap[current.color] || colorMap.teal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${cc.bg} flex items-center justify-center`}>
              <IconComponent className={`w-4 h-4 ${cc.text}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {t.demo.quickTitle} — {step}/{steps.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {current.question}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors"
              title={showSpeakerNotes ? 'Hide presenter notes' : 'Show presenter notes'}
            >
              {showSpeakerNotes ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-2.5 flex items-center justify-between gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/50">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => handleStepChange(s.step)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                step === s.step
                  ? `${cc.active} text-white shadow-sm`
                  : step > s.step
                  ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {s.shortTitle}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <h4 className="text-base font-bold text-slate-800 mb-1">{current.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{current.description}</p>
          </div>

          {/* Focus Highlight */}
          <div className={`p-3 ${cc.bg} border ${cc.border} rounded-xl text-xs font-mono font-bold ${cc.text}`}>
            {current.focusHighlight}
          </div>

          {/* Speaker Notes */}
          {showSpeakerNotes && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Presenter Script
              </span>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                {current.speakerScript}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onResetDemo && (
              <button
                onClick={onResetDemo}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.actions.reset}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors disabled:opacity-30 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.actions.back}</span>
            </button>
            <button
              onClick={handleNext}
              className={`px-5 py-2 text-xs font-semibold ${cc.active} hover:opacity-90 text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95`}
            >
              <span>{step === steps.length ? t.actions.close : current.actionLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
