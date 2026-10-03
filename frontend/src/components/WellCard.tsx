import React from 'react';
import { useI18n } from '../i18n';
import { StatusBadge, StatusDot } from './StatusBadge';
import { ArrowRight } from 'lucide-react';
import type { WellSummary } from '../types';
import { useMode } from '../contexts/ModeContext';

interface WellCardProps {
  well: WellSummary;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const WellCard: React.FC<WellCardProps> = ({
  well,
  isSelected = false,
  onClick,
  compact = false,
}) => {
  const { t } = useI18n();
  const { isOperator } = useMode();

  const getOperatorRiskLabel = (tier: string): string => {
    const normalized = tier.toUpperCase();
    if (normalized === 'CRITICAL') return t.wellExplain.rodFloatingRisk;
    if (normalized === 'HIGH') return t.wellExplain.highRodLoading;
    if (normalized === 'MEDIUM') return t.wellExplain.thermalDecline;
    return '';
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all cursor-pointer text-left ${
          isSelected
            ? 'bg-teal-50 border-teal-300 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <StatusDot tier={well.overall_risk_tier} size={10} />
          <span className="font-mono text-sm font-semibold text-slate-800">{well.well_code}</span>
        </div>
        <StatusBadge tier={well.overall_risk_tier} size="sm" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-teal-50 border-teal-300 shadow-md ring-1 ring-teal-200'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-base font-bold text-slate-800">{well.well_code}</span>
            <StatusBadge tier={well.overall_risk_tier} size="sm" />
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Operator: show simple explanation */}
        {isOperator && well.overall_risk_tier !== 'LOW' && (
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            {getOperatorRiskLabel(well.overall_risk_tier)}
          </p>
        )}

        {/* Key metrics — limited in operator mode */}
        <div className={`grid ${isOperator ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">{t.wells.temperature}</div>
            <div className="text-sm font-semibold text-slate-800 font-mono mt-0.5">
              {well.temperature_c}{t.units.celsius}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isOperator ? t.operatorTerms.viscosity : t.wells.viscosity}
            </div>
            <div className="text-sm font-semibold text-slate-800 font-mono mt-0.5">
              {well.viscosity_cp.toLocaleString()} {t.units.cp}
            </div>
          </div>
          {!isOperator && (
            <div>
              <div className="text-[11px] text-slate-500 font-medium">{t.wells.production}</div>
              <div className="text-sm font-semibold text-slate-800 font-mono mt-0.5">
                {well.oil_rate_bopd} {t.units.bopd}
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
