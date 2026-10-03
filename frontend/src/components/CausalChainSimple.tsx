import React from 'react';
import { ArrowDown, Droplets, Thermometer, Wind, Gauge, ShieldCheck, TrendingUp } from 'lucide-react';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import { FLOATING_MARGIN_CRITICAL_KN } from '../services/safetyThresholds';

interface CausalChainSimpleProps {
  /** Highlight a specific step index (0-6) */
  highlightStep?: number;
  /** Callback when a step is clicked */
  onStepClick?: (step: number) => void;
  /** Show compact (horizontal) or expanded (vertical) */
  layout?: 'horizontal' | 'vertical';
}

const STEP_ICONS = [Droplets, Thermometer, Wind, TrendingUp, Gauge, ShieldCheck, TrendingUp];

export const CausalChainSimple: React.FC<CausalChainSimpleProps> = ({
  highlightStep,
  onStepClick,
  layout = 'vertical',
}) => {
  const { t } = useI18n();
  const { isEngineer } = useMode();

  const steps = [
    { label: t.causal.steam, detail: isEngineer ? 'CSS Injection' : undefined },
    { label: t.causal.heat, detail: isEngineer ? 'Thermal Energy Transfer' : undefined },
    { label: t.causal.lowerViscosity, detail: isEngineer ? 'Andrade/Arrhenius Model' : undefined },
    { label: t.causal.betterFlow, detail: isEngineer ? 'PI × ΔP' : undefined },
    { label: t.causal.lowerRodDrag, detail: isEngineer ? 'Couette Annular Model' : undefined },
    { label: t.causal.lowerFloatingRisk, detail: isEngineer ? `Margin > ${FLOATING_MARGIN_CRITICAL_KN} kN` : undefined },
    { label: t.causal.betterProduction, detail: isEngineer ? 'Net Oil Rate ↑' : undefined },
  ];

  if (layout === 'horizontal') {
    return (
      <div className="flex items-center gap-1 overflow-x-auto py-2">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i];
          const isHighlighted = highlightStep === i;
          return (
            <React.Fragment key={i}>
              <button
                onClick={() => onStepClick?.(i)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isHighlighted
                    ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isHighlighted ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <span className="text-slate-300 text-xs shrink-0">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const Icon = STEP_ICONS[i];
        const isHighlighted = highlightStep === i;
        return (
          <React.Fragment key={i}>
            <button
              onClick={() => onStepClick?.(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                isHighlighted
                  ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isHighlighted ? 'bg-teal-100' : 'bg-slate-100'
              }`}>
                <Icon className={`w-4 h-4 ${isHighlighted ? 'text-teal-600' : 'text-slate-500'}`} />
              </div>
              <div>
                <div className="text-sm font-medium">{step.label}</div>
                {step.detail && (
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{step.detail}</div>
                )}
              </div>
            </button>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
