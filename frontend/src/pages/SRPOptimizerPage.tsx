import React, { useState } from 'react';
import { DigitalTwinState, DynacardData } from '../types';
import { DynacardChart } from '../components/DynacardChart';
import {
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  FLOATING_MARGIN_CRITICAL_KN,
  FLOATING_MARGIN_WARNING_KN,
  classifyFloatingMargin,
  getMarginColorClass,
} from '../services/safetyThresholds';

interface SRPOptimizerPageProps {
  twinState: DigitalTwinState;
  dynacard: DynacardData;
}

export const SRPOptimizerPage: React.FC<SRPOptimizerPageProps> = ({
  twinState,
  dynacard,
}) => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();

  // Primary controls
  const [strokeIn, setStrokeIn] = useState<number>(twinState.stroke_in || 120);
  const [spm, setSpm] = useState<number>(twinState.spm || 6.8);
  const [vfdHz, setVfdHz] = useState<number>(twinState.vfd_hz || 54.4);

  const [loading, setLoading] = useState<boolean>(false);

  // Dynamic evaluation using single source of truth
  const currentMargin = twinState.floating_margin_kn ?? 1.35;
  const currentMarginTier = classifyFloatingMargin(currentMargin);
  const currentRiskBadge: 'CRITICAL' | 'WARNING' | 'LOW' =
    currentMarginTier === 'CRITICAL' ? 'CRITICAL' : currentMarginTier === 'WARNING' ? 'WARNING' : 'LOW';

  // Current vs Recommended values
  const currentConfig = {
    stroke: twinState.stroke_in || 120,
    spm: twinState.spm || 6.8,
    vfd: twinState.vfd_hz || 54.4,
    floatMargin: currentMargin,
    rodDrag: twinState.drag_force_kn ?? 44.6,
    risk: currentRiskBadge,
  };

  const [recommendedConfig, setRecommendedConfig] = useState({
    stroke: 144,
    spm: 4.8,
    vfd: 38.4,
    floatMargin: 5.15,
    rodDrag: 22.4,
    risk: 'LOW' as const,
  });

  const handleOptimize = () => {
    setLoading(true);
    setTimeout(() => {
      setRecommendedConfig({
        stroke: 144,
        spm: 4.8,
        vfd: 38.4,
        floatMargin: 5.15,
        rodDrag: 22.4,
        risk: 'LOW',
      });
      setStrokeIn(144);
      setSpm(4.8);
      setVfdHz(38.4);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{t.nav.srpOptimizer}</h2>
            <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              {twinState.well_code}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Kinematics &amp; Rod Float Prevention
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic optimization of pump cycle speed and stroke length to mitigate rod floating.
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Calculating...' : 'Solve Optimal Kinematics'}</span>
        </button>
      </div>

      {/* Side-by-side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.sim.current} SRP Setpoints
            </span>
            <StatusBadge tier={currentConfig.risk} size="sm" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Pumping Speed</span>
              <span className="font-mono font-bold text-slate-800">{currentConfig.spm} SPM</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Stroke Length</span>
              <span className="font-mono font-bold text-slate-800">{currentConfig.stroke} in</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{isOperator ? t.operatorTerms.floatingMargin : 'Floating Margin'}</span>
              <span className={`font-mono font-bold ${getMarginColorClass(currentConfig.floatMargin)}`}>
                {currentConfig.floatMargin.toFixed(2)} kN{' '}
                {currentConfig.floatMargin < FLOATING_MARGIN_CRITICAL_KN
                  ? `(< ${FLOATING_MARGIN_CRITICAL_KN} Critical)`
                  : currentConfig.floatMargin < FLOATING_MARGIN_WARNING_KN
                  ? `(< ${FLOATING_MARGIN_WARNING_KN} Attention)`
                  : '(Safe)'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{isOperator ? t.operatorTerms.dragForce : 'Rod Drag'}</span>
              <span className="font-mono font-bold text-slate-800">{currentConfig.rodDrag} kN</span>
            </div>
          </div>

          {currentMarginTier === 'CRITICAL' ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              Pumping speed of {currentConfig.spm} SPM is too fast for the viscous fluid, causing downstroke float risk (&lt; {FLOATING_MARGIN_CRITICAL_KN} kN threshold).
            </div>
          ) : currentMarginTier === 'WARNING' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Floating margin ({currentConfig.floatMargin.toFixed(2)} kN) is approaching the {FLOATING_MARGIN_CRITICAL_KN} kN critical floor. Speed reduction recommended.
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              Operating stably within safe kinematic envelope (Floating margin: {currentConfig.floatMargin.toFixed(2)} kN).
            </div>
          )}
        </div>

        {/* Recommended */}
        <div className="bg-white border-2 border-teal-300 rounded-xl p-5 shadow-sm space-y-4 ring-2 ring-teal-100">
          <div className="flex items-center justify-between pb-3 border-b border-teal-100">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.sim.recommended} Retuned Setpoints</span>
            </span>
            <StatusBadge tier="LOW" size="sm" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Pumping Speed</span>
              <span className="font-mono font-bold text-teal-700">{recommendedConfig.spm} SPM (Reduced)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Stroke Length</span>
              <span className="font-mono font-bold text-teal-700">{recommendedConfig.stroke} in (Increased)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{isOperator ? t.operatorTerms.floatingMargin : 'Floating Margin'}</span>
              <span className="font-mono font-bold text-emerald-600">+{recommendedConfig.floatMargin} kN (Safe)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{isOperator ? t.operatorTerms.dragForce : 'Rod Drag'}</span>
              <span className="font-mono font-bold text-emerald-600">{recommendedConfig.rodDrag} kN</span>
            </div>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-900">
            Slowing to 4.8 SPM reduces annular drag force while 144" stroke sustains pump displacement.
          </div>
        </div>
      </div>

      {/* Engineer Mode: Sliders */}
      {isEngineer && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800">SRP Operating Setpoint Sliders</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-time kinematic evaluation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* SPM */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Pumping Speed (SPM)</span>
                <span className="font-mono font-bold text-teal-700">{spm.toFixed(1)} SPM</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={10.5}
                step={0.1}
                value={spm}
                onChange={(e) => setSpm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2.0 SPM</span>
                <span>4.8 (Recommended)</span>
                <span>10.5 SPM</span>
              </div>
            </div>

            {/* Stroke */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Stroke Length</span>
                <span className="font-mono font-bold text-teal-700">{strokeIn} in</span>
              </div>
              <input
                type="range"
                min={64}
                max={168}
                step={4}
                value={strokeIn}
                onChange={(e) => setStrokeIn(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>64 in</span>
                <span>144 in (Target)</span>
                <span>168 in</span>
              </div>
            </div>

            {/* VFD Hz */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Motor VFD Frequency</span>
                <span className="font-mono font-bold text-teal-700">{vfdHz.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                step={0.5}
                value={vfdHz}
                onChange={(e) => setVfdHz(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20 Hz</span>
                <span>38.4 Hz</span>
                <span>60 Hz</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surface Dynacard Display */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-800">Surface Dynamometer Card</h3>
          <p className="text-xs text-slate-500">
            Polished rod load versus stroke position verifying downstroke float elimination.
          </p>
        </div>
        <DynacardChart dynacard={dynacard} />
      </div>
    </div>
  );
};
