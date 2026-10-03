import React, { useState } from 'react';
import { DigitalTwinState, DynacardData } from '../types';
import { DynacardChart } from '../components/DynacardChart';
import { WellGraphic } from '../components/WellGraphic';
import { StatusBadge } from '../components/StatusBadge';
import { InfoTooltip } from '../components/InfoTooltip';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import {
  Thermometer,
  Droplets,
  Zap,
  ShieldAlert,
  Sliders,
  Activity,
  ArrowRight,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { FLOATING_MARGIN_CRITICAL_KN, classifyFloatingMargin, getMarginColorClass, getMarginBgClass } from '../services/safetyThresholds';

interface DigitalTwinPageProps {
  twinState: DigitalTwinState;
  dynacard: DynacardData;
  onNavigateTab: (tabId: string) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({
  twinState,
  dynacard,
  onNavigateTab,
}) => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();
  const [activeTab, setActiveTab] = useState<'overview' | 'dynacard' | 'physics'>('overview');

  const tRes = twinState.thermal?.reservoir_temp_c ?? twinState.temperature_c ?? 49.5;
  const visc = twinState.thermal?.viscosity_cp ?? twinState.viscosity_cp ?? 12089;
  const oilRate = twinState.reservoir?.net_oil_rate_bopd ?? twinState.oil_rate_bopd ?? 31.0;
  const pprl = twinState.srp?.pprl_kn ?? twinState.pprl_kn ?? 84.5;
  const mprl = twinState.srp?.mprl_kn ?? twinState.mprl_kn ?? 12.3;
  const floatMargin = twinState.srp?.downstroke_floating_margin_kn ?? twinState.floating_margin_kn ?? 1.35;
  const viscousDrag = twinState.srp?.viscous_drag_force_kn ?? twinState.drag_force_kn ?? 44.6;
  const spm = twinState.srp?.spm ?? twinState.spm ?? 6.8;
  const strokeIn = twinState.stroke_in ?? 120;
  const fluidLevelM = twinState.wellbore?.dynamic_fluid_level_m ?? twinState.fluid_level_depth_m ?? 820;

  const marginTier = classifyFloatingMargin(floatMargin);
  const isCritical = marginTier === 'CRITICAL';

  // Narrative label
  const pipelineLabel = t.pipeline.explain;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8 font-sans">
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
              <Layers className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{pipelineLabel}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t.twin.title}</h2>
            <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              {twinState.well_code}
            </span>
            <StatusBadge tier={twinState.overall_risk_tier} size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.twin.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.rec.title}</span>
          </button>
          <button
            onClick={() => onNavigateTab('before-after')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>{t.sim.title}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Left Well Profile Graphic vs Right Live State Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: Well Profile Graphic (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.twin.wellProfile}
              </span>
              <span className="text-[11px] font-mono text-slate-400">0 – 1,240m MD</span>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <WellGraphic
                temperatureC={tRes}
                viscosityCp={visc}
                floatingMarginKn={floatMargin}
                spm={spm}
                fluidLevelM={fluidLevelM}
                isCritical={isCritical}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Live State KPI Dashboard (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800">{t.twin.liveState}</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Real-time coupled state</span>
            </div>

            {/* 4 Primary Operational Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Temperature */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Thermometer className="w-4 h-4 text-amber-500" />
                    <span>{t.wells.temperature}</span>
                  </div>
                  <InfoTooltip label={t.wells.temperature} description={t.tooltips.temperature} />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-slate-800">{tRes.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">{t.units.celsius}</span>
                </div>
                <div className="mt-1 text-[11px] text-amber-700 font-medium">
                  {tRes < 55 ? t.wellExplain.thermalDeclineDesc : 'Normal thermal regime'}
                </div>
              </div>

              {/* Viscosity */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>{isOperator ? t.operatorTerms.viscosity : t.wells.viscosity}</span>
                  </div>
                  <InfoTooltip label={t.wells.viscosity} description={t.tooltips.viscosity} />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-slate-800">{visc.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">{t.units.cp}</span>
                </div>
                <div className="mt-1 text-[11px] text-red-600 font-medium">
                  {visc > 10000 ? t.wellExplain.highViscosityDesc : 'Flowable heavy crude'}
                </div>
              </div>

              {/* Net Production */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Zap className="w-4 h-4 text-teal-600" />
                    <span>{t.wells.production}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-slate-800">{oilRate.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">{t.units.bopd}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">{spm} SPM • {strokeIn}" stroke</div>
              </div>

              {/* Mechanical Risk / Floating Margin — uses shared threshold */}
              <div className={`border rounded-xl p-4 transition-all ${getMarginBgClass(floatMargin)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <ShieldAlert className={`w-4 h-4 ${isCritical ? 'text-red-600' : 'text-emerald-600'}`} />
                    <span>{isOperator ? t.operatorTerms.floatingMargin : t.wells.floatingMargin}</span>
                  </div>
                  <InfoTooltip label={t.wells.floatingMargin} description={t.tooltips.floatingMargin} />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-2xl font-bold font-mono ${getMarginColorClass(floatMargin)}`}>
                    {floatMargin.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">{t.units.kn}</span>
                </div>
                <div className={`mt-1 text-[11px] font-medium ${isCritical ? 'text-red-700' : 'text-emerald-700'}`}>
                  {isCritical ? `! Below ${FLOATING_MARGIN_CRITICAL_KN} kN safety threshold` : '● Operating inside safe envelope'}
                </div>
              </div>
            </div>

            {/* Quick Operator Diagnostic Banner */}
            {isCritical && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5">
                <span className="font-bold text-amber-900 mt-0.5">⚠️</span>
                <div>
                  <span className="font-semibold">{t.wellExplain.rodFloatingDesc}</span>{' '}
                  <span className="text-amber-700">{t.wellExplain.rodFloatingWhy}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SEPARATED CAUSAL STORY: Current vs Intervention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CURRENT CONDITION */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">{t.causal.currentCondition}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: t.causal.tempDown, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', value: `${tRes.toFixed(0)}°C` },
              { label: t.causal.viscUp, color: 'text-red-700', bg: 'bg-red-50 border-red-200', value: `${visc.toLocaleString()} cP` },
              { label: t.causal.dragUp, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', value: `${viscousDrag.toFixed(1)} kN` },
              { label: t.causal.marginDown, color: 'text-red-700', bg: 'bg-red-50 border-red-200', value: `${floatMargin.toFixed(2)} kN` },
              { label: t.causal.riskUp, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className={`px-3 py-2 rounded-lg border text-xs font-semibold ${step.bg} ${step.color}`}>
                  <div>{step.label}</div>
                  {step.value && <div className="font-mono text-[11px] mt-0.5 font-bold">{step.value}</div>}
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* EXPECTED INTERVENTION EFFECT */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{t.causal.expectedIntervention}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: t.causal.steamInject, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
              { label: t.causal.tempUp, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: t.causal.viscDown, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: t.causal.dragDown, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: t.causal.marginUp, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: t.causal.improved, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className={`px-3 py-2 rounded-lg border text-xs font-semibold ${step.bg} ${step.color}`}>
                  {step.label}
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ENGINEER MODE: Deep Technical Exploration Panel */}
      {isEngineer && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center border-b border-slate-200 px-5 bg-slate-50">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === 'overview'
                  ? 'border-teal-600 text-teal-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Subsystem Values
            </button>
            <button
              onClick={() => setActiveTab('dynacard')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === 'dynacard'
                  ? 'border-teal-600 text-teal-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Surface Dynacard Analysis
            </button>
            <button
              onClick={() => setActiveTab('physics')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === 'physics'
                  ? 'border-teal-600 text-teal-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Governing Equations
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">PPRL (Peak Load)</div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1">{pprl.toFixed(1)} kN</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">MPRL (Min Load)</div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1">{mprl.toFixed(1)} kN</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Viscous Downstroke Drag</div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1">{viscousDrag.toFixed(1)} kN</div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Pump Intake Pressure (PIP)</div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1">
                    {twinState.pump_intake_pressure_bar ?? 22.4} bar
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dynacard' && (
              <div className="py-2">
                <DynacardChart dynacard={dynacard} />
              </div>
            )}

            {activeTab === 'physics' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">Viscosity: Andrade/Arrhenius Model</div>
                  <div className="font-mono text-teal-700 text-[11px] mb-2">
                    μ(T) = μ_ref · exp[B · (1/T_K - 1/T_ref_K)]
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Calibrated with Baghewala crude baseline: 11,500 cP at 50°C with sensitivity coefficient B = 5,200 K.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">Downstroke Floating Margin Constraint</div>
                  <div className="font-mono text-red-700 text-[11px] mb-2">
                    Margin = W_rod_buoyant · (1 - α) - F_drag - F_surface ≥ {FLOATING_MARGIN_CRITICAL_KN} kN
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Couette shear drag acts upward against downstroke rod plunge. Below {FLOATING_MARGIN_CRITICAL_KN} kN margin, carrier-bar separation occurs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
