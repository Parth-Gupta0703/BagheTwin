import React, { useState } from 'react';
import { WellSummary, DigitalTwinState } from '../types';
import {
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowDown,
  Play,
  Eye,
  Lightbulb,
  Activity,
  Layers,
  Search,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import { StatusBadge, StatusDot } from '../components/StatusBadge';
import { FLOATING_MARGIN_CRITICAL_KN, classifyFloatingMargin } from '../services/safetyThresholds';

interface CommandCenterProps {
  wells: WellSummary[];
  selectedWellCode: string;
  onSelectWell: (code: string) => void;
  onNavigateTab: (tabId: string) => void;
  onLaunchJuryDemo: () => void;
  twinState?: DigitalTwinState | null;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  wells,
  selectedWellCode,
  onSelectWell,
  onNavigateTab,
  onLaunchJuryDemo,
  twinState,
}) => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Fleet counts
  const totalWells = wells.length > 0 ? wells.length : 12;
  const criticalWells = wells.filter((w) => w.overall_risk_tier === 'CRITICAL');
  const attentionWells = wells.filter(
    (w) => w.overall_risk_tier === 'HIGH' || w.overall_risk_tier === 'MEDIUM'
  );
  const normalWells = wells.filter((w) => w.overall_risk_tier === 'LOW');

  // Priority well (most critical)
  const priorityWell =
    criticalWells.length > 0 ? criticalWells[0] : wells.find((w) => w.well_code === 'BGW-007') || wells[0];
  const isBGW007 = priorityWell?.well_code === 'BGW-007';

  const priorityTemp = isBGW007 ? 49 : (twinState?.temperature_c ?? priorityWell?.temperature_c ?? 49);
  const priorityVisc = isBGW007 ? 12089 : (twinState?.viscosity_cp ?? priorityWell?.viscosity_cp ?? 12089);
  const priorityDrag = isBGW007 ? 44.6 : (twinState?.drag_force_kn ?? 44.6);
  const priorityMargin = isBGW007 ? 1.35 : (twinState?.floating_margin_kn ?? priorityWell?.floating_margin_kn ?? 1.35);

  // Trend data for charts
  const riskTrendData = [
    { day: '-14d', margin: 4.8 },
    { day: '-12d', margin: 4.1 },
    { day: '-10d', margin: 3.5 },
    { day: '-8d', margin: 2.9 },
    { day: '-6d', margin: 2.3 },
    { day: '-4d', margin: 1.85 },
    { day: '-2d', margin: 1.5 },
    { day: 'Now', margin: priorityMargin },
  ];

  const productionTrendData = [
    { day: '-14d', oil: 62.5 },
    { day: '-12d', oil: 59.2 },
    { day: '-10d', oil: 54.8 },
    { day: '-8d', oil: 48.3 },
    { day: '-6d', oil: 42.0 },
    { day: '-4d', oil: 36.4 },
    { day: '-2d', oil: 33.1 },
    { day: 'Now', oil: isBGW007 ? 31.0 : (twinState?.oil_rate_bopd ?? 31.0) },
  ];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-8">
      {/* ═══════════════ COMPACT IDENTITY + VALUE PROP ═══════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{t.appName}</h1>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              {t.appSubtitle}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">{t.appValueProp}</p>
        </div>
        <button
          onClick={onLaunchJuryDemo}
          className="flex items-center gap-2 px-4 py-2 bg-[#123B5D] hover:bg-[#0F3050] text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5" />
          {t.home.quickDemo}
        </button>
      </div>

      {/* ═══════════════ FLEET HEALTH STRIP ═══════════════ */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.home.fleetSummary}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{t.fleet.rajasthanField} • {t.fleet.syntheticDemo}</span>
        </div>
        <div className="px-5 py-4 flex items-center gap-6">
          {/* Total */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 font-mono tabular-nums">{totalWells}</span>
            <span className="text-xs text-slate-500 font-medium">{t.home.wellsMonitored}</span>
          </div>

          <div className="w-px h-10 bg-slate-200" />

          {/* Status breakdown */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-lg font-bold text-red-700 font-mono">{criticalWells.length}</span>
              <span className="text-[11px] font-semibold text-red-600">{t.home.criticalCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-lg font-bold text-amber-700 font-mono">{attentionWells.length}</span>
              <span className="text-[11px] font-semibold text-amber-600">{t.home.attentionCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-lg font-bold text-emerald-700 font-mono">{normalWells.length}</span>
              <span className="text-[11px] font-semibold text-emerald-600">{t.home.normalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ PRIORITY WELL HERO ═══════════════ */}
      {priorityWell && (
        <div className="bg-white border-2 border-red-200 rounded-xl shadow-sm overflow-hidden">
          {/* Priority header strip */}
          <div className="bg-gradient-to-r from-red-50 to-red-50/60 px-6 py-3 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">{t.home.priorityWell}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-red-800">{priorityWell.well_code}</span>
              <StatusBadge tier="CRITICAL" size="sm" />
            </div>
          </div>

          <div className="p-6">
            {/* Two column layout: Left = story, Right = metrics + chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: What / Why / Do story (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                {/* WHAT */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t.explain.whatHappened}
                  </div>
                  <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                    {t.wellExplain.rodFloatingDesc}
                  </p>
                </div>

                <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-300" /></div>

                {/* WHY */}
                <div className="bg-amber-50/70 rounded-lg p-4 border border-amber-100">
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">
                    {t.explain.why}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {t.wellExplain.rodFloatingWhy}
                  </p>
                </div>

                <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-slate-300" /></div>

                {/* WHAT TO DO */}
                <div className="bg-teal-50/70 rounded-lg p-4 border border-teal-100">
                  <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1.5">
                    {t.explain.whatToDo}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {t.wellExplain.rodFloatingAction}
                  </p>
                </div>

                {/* PRIMARY ACTIONS */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      onSelectWell(priorityWell.well_code);
                      onNavigateTab('recommendations');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {t.actions.viewRecommendation}
                  </button>
                  <button
                    onClick={() => {
                      onSelectWell(priorityWell.well_code);
                      onNavigateTab('digital-twin');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    {t.home.openDigitalTwin}
                  </button>
                </div>
              </div>

              {/* RIGHT: Key metrics + mini trend (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 font-medium uppercase">{t.wells.temperature}</div>
                    <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
                      {priorityTemp}<span className="text-xs text-slate-400 ml-0.5 font-normal">{t.units.celsius}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 font-medium uppercase">
                      {isOperator ? t.operatorTerms.viscosity : t.wells.viscosity}
                    </div>
                    <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
                      {priorityVisc.toLocaleString()}<span className="text-xs text-slate-400 ml-0.5 font-normal">{t.units.cp}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 font-medium uppercase">
                      {isOperator ? t.operatorTerms.dragForce : t.wells.rodDrag}
                    </div>
                    <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
                      {priorityDrag}<span className="text-xs text-slate-400 ml-0.5 font-normal">{t.units.kn}</span>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-[10px] text-red-600 font-medium uppercase">
                      {isOperator ? t.operatorTerms.floatingMargin : t.wells.floatingMargin}
                    </div>
                    <div className="text-lg font-bold text-red-700 font-mono mt-0.5">
                      {priorityMargin}<span className="text-xs text-red-400 ml-0.5 font-normal">{t.units.kn}</span>
                    </div>
                    <div className="text-[10px] text-red-500 mt-0.5">{'< '}{FLOATING_MARGIN_CRITICAL_KN} kN threshold</div>
                  </div>
                </div>

                {/* Mini trend chart */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isOperator ? t.operatorTerms.floatingMargin : t.wells.floatingMargin} — 14d
                    </span>
                    <span className="text-[10px] font-mono text-red-600 font-semibold">{priorityMargin} kN</span>
                  </div>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} domain={[0, 6]} />
                        <Tooltip />
                        <ReferenceLine y={FLOATING_MARGIN_CRITICAL_KN} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '2.0 kN', position: 'right', fontSize: 9, fill: '#DC2626' }} />
                        <Line type="monotone" dataKey="margin" name="Margin (kN)" stroke="#DC2626" strokeWidth={2} dot={{ r: 2, fill: '#DC2626' }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ NARRATIVE PIPELINE STRIP ═══════════════ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: t.pipeline.detect, desc: t.pipeline.detectDesc, tab: 'command-center', icon: Search, active: true },
            { label: t.pipeline.explain, desc: t.pipeline.explainDesc, tab: 'digital-twin', icon: Layers },
            { label: t.pipeline.recommend, desc: t.pipeline.recommendDesc, tab: 'recommendations', icon: Lightbulb },
            { label: t.pipeline.simulate, desc: t.pipeline.simulateDesc, tab: 'before-after', icon: Play },
            { label: t.pipeline.optimize, desc: t.pipeline.optimizeDesc, tab: 'srp-optimizer', icon: Zap },
          ].map((stage, i, arr) => (
            <React.Fragment key={stage.label}>
              <button
                onClick={() => onNavigateTab(stage.tab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                  stage.active
                    ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <stage.icon className={`w-3.5 h-3.5 ${stage.active ? 'text-teal-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="font-semibold">{stage.label}</div>
                </div>
              </button>
              {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══════════════ WELL STATUS GRID ═══════════════ */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t.home.wellStatus}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{t.fleet.rajasthanField} • {t.fleet.syntheticDemo}</p>
          </div>
          <button
            onClick={() => onNavigateTab('well-explorer')}
            className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            {t.home.viewAll}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {wells.map((well) => (
            <button
              key={well.well_code}
              onClick={() => {
                onSelectWell(well.well_code);
                onNavigateTab('well-explorer');
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                well.well_code === selectedWellCode
                  ? 'bg-teal-50 border-teal-300'
                  : well.overall_risk_tier === 'CRITICAL'
                  ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <StatusDot tier={well.overall_risk_tier} size={8} />
                <span className="font-mono text-xs font-semibold text-slate-800">{well.well_code}</span>
              </div>
              <StatusBadge tier={well.overall_risk_tier} size="sm" showIcon={false} />
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════ ENGINEER: PRODUCTION + RISK TREND CHARTS ═══════════════ */}
      {isEngineer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Production Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{t.wells.production} Trend</h3>
                <p className="text-[11px] text-slate-500">Daily net oil rate — 14 days</p>
              </div>
              <span className="text-xs font-mono text-teal-600 font-semibold">
                {isBGW007 ? '31.0' : (twinState?.oil_rate_bopd ?? 31.0)} BOPD
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[20, 70]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="oil" name="Oil Rate (BOPD)" stroke="#2563EB" strokeWidth={2} dot={{ r: 2, fill: '#2563EB' }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Trend — with reference line */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {isOperator ? t.operatorTerms.floatingMargin : 'Floating Margin'} Trend
                </h3>
                <p className="text-[11px] text-slate-500">Safety threshold: {FLOATING_MARGIN_CRITICAL_KN} kN</p>
              </div>
              <span className="text-xs font-mono text-red-600 font-semibold">{priorityMargin} kN</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 6]} />
                  <Tooltip />
                  <ReferenceLine y={FLOATING_MARGIN_CRITICAL_KN} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `${FLOATING_MARGIN_CRITICAL_KN} kN`, position: 'right', fontSize: 10, fill: '#DC2626' }} />
                  <Line type="monotone" dataKey="margin" name="Floating Margin (kN)" stroke="#DC2626" strokeWidth={2} dot={{ r: 2, fill: '#DC2626' }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ENGINEERING TELEMETRY (Expandable) ═══════════════ */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {t.explain.technicalDetails}
            </span>
            {isOperator && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {t.mode.engineer}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>{showTechnicalDetails ? t.explain.hideEngineering : t.explain.showEngineering}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'PPRL', value: `${twinState?.pprl_kn ?? 84.5} kN` },
              { label: 'MPRL', value: `${twinState?.mprl_kn ?? 12.3} kN` },
              { label: 'PIP', value: `${twinState?.pump_intake_pressure_bar ?? 22.4} bar` },
              { label: 'Fluid Level', value: `${twinState?.fluid_level_depth_m ?? 820} m` },
              { label: 'SPM', value: `${twinState?.spm ?? 6.8}` },
              { label: 'Stroke', value: `${twinState?.stroke_in ?? 120} in` },
              { label: 'Pump Eff.', value: `${twinState?.pump_efficiency_pct ?? 82}%` },
              { label: 'Energy', value: `${twinState?.energy_kwh_day ?? 340} kWh/d` },
            ].map((item) => (
              <div key={item.label} className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-slate-500">{item.label}</div>
                <div className="text-sm font-bold font-mono text-slate-800 mt-1">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
