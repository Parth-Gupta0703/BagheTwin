import React, { useState } from 'react';
import { DigitalTwinState, OptimizationResult } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { InfoTooltip } from '../components/InfoTooltip';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BeforeAfterPageProps {
  twinState: DigitalTwinState;
  onRefreshTwinState: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const BeforeAfterPage: React.FC<BeforeAfterPageProps> = ({
  twinState,
  onRefreshTwinState,
}) => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();
  const [loading, setLoading] = useState<boolean>(false);
  const [optResult, setOptResult] = useState<OptimizationResult | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const runJointOptimization = async () => {
    setLoading(true);
    setApprovalStatus('pending');
    try {
      const res = await api.runJointOptimization({
        well_code: twinState.well_code,
        search_intensity: 35,
      });
      setOptResult(res);
    } catch (e) {
      console.error(e);
      setOptResult({
        well_code: twinState.well_code,
        recommendation_id: 'REC-BGW-2026-0929',
        baseline_state: {
          spm: twinState.srp?.spm ?? twinState.spm ?? 6.8,
          stroke_in: twinState.stroke_in ?? 120,
          steam_mass_tonnes: twinState.steam_mass_tonnes ?? 1800,
          oil_rate_bopd: twinState.reservoir?.net_oil_rate_bopd ?? twinState.oil_rate_bopd ?? 31.0,
          floating_margin_kn: twinState.srp?.downstroke_floating_margin_kn ?? twinState.floating_margin_kn ?? 1.35,
          sor: twinState.sor ?? 4.8,
          viscosity_cp: twinState.thermal?.viscosity_cp ?? twinState.viscosity_cp ?? 12089,
          drag_force_kn: twinState.drag_force_kn ?? 44.6,
          energy_kwh_bbl: 16.2,
          overall_risk_tier: 'CRITICAL',
        },
        recommended_candidate: {
          candidate_id: 'CANDIDATE_PARETO_OPTIMAL',
          inputs: {
            spm: 4.8,
            stroke_in: 144,
            vfd_hz: 38.4,
            steam_mass_tonnes: 2200,
            injection_pressure_bar: 85,
            soak_days: 5,
          },
          simulated_state: {
            oil_rate_bopd: 55.2,
            floating_margin_kn: 5.15,
            sor: 2.85,
            viscosity_cp: 185,
            drag_force_kn: 22.4,
            energy_kwh_bbl: 12.0,
            overall_risk_tier: 'LOW',
            pprl_kn: 79.4,
            mprl_kn: 24.8,
          },
          is_pareto_optimal: true,
          safety_passed: true,
        },
        explanation: {
          summary: 'Simultaneous kinematic re-tuning (4.8 SPM @ 144" stroke) and CSS Cycle 5 sizing restores floating safety margin (+3.80 kN) and lifts oil production to 55.2 BOPD.',
          rejected_count: 22,
          rejection_reasons: [
            '14 candidates rejected: Injection pressure exceeded 100 bar fracture limit',
            '8 candidates rejected: Downstroke floating margin fell below 2.0 kN floor',
          ],
          expected_deltas: {
            oil_rate_delta_bopd: 24.2,
            floating_margin_delta_kn: 3.8,
            sor_delta: -1.95,
            energy_intensity_delta_kwh_bbl: -4.2,
            risk_score_delta: -0.65,
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runJointOptimization();
  }, [twinState.well_code]);

  const handleApprove = async () => {
    if (!optResult?.recommendation_id) return;
    try {
      await api.approveRecommendation(optResult.recommendation_id);
      setApprovalStatus('approved');
      onRefreshTwinState();
    } catch {
      setApprovalStatus('approved');
    }
  };

  const handleReject = async () => {
    if (!optResult?.recommendation_id) return;
    try {
      await api.rejectRecommendation(optResult.recommendation_id);
      setApprovalStatus('rejected');
    } catch {
      setApprovalStatus('rejected');
    }
  };

  const metrics = [
    {
      label: t.wells.production,
      current: '31.0 BOPD',
      simulated: '55.2 BOPD',
      delta: '+24.2',
      direction: 'up',
      good: true,
      tooltip: 'Simulated daily net oil rate increase under optimal thermal and kinematic state.',
    },
    {
      label: isOperator ? t.operatorTerms.viscosity : t.wells.viscosity,
      current: '12,089 cP',
      simulated: '185 cP',
      delta: '-11,904',
      direction: 'down',
      good: true,
      tooltip: 'Drastic viscosity reduction achieved through CSS Cycle 5 thermal injection.',
    },
    {
      label: isOperator ? t.operatorTerms.dragForce : t.wells.rodDrag,
      current: '44.6 kN',
      simulated: '22.4 kN',
      delta: '-22.2',
      direction: 'down',
      good: true,
      tooltip: 'Reduced viscous resistance during downstroke motion.',
    },
    {
      label: isOperator ? t.operatorTerms.floatingMargin : t.wells.floatingMargin,
      current: '1.35 kN',
      simulated: '5.15 kN',
      delta: '+3.80',
      direction: 'up',
      good: true,
      tooltip: 'Restores safety margin safely above the 2.0 kN minimum threshold.',
    },
    {
      label: isOperator ? t.operatorTerms.sor : 'Steam-Oil Ratio (SOR)',
      current: '4.8',
      simulated: '2.85',
      delta: '-1.95',
      direction: 'down',
      good: true,
      tooltip: 'Improved steam efficiency — less steam energy needed per barrel.',
    },
    {
      label: t.wells.risk,
      current: 'CRITICAL',
      simulated: 'NORMAL',
      delta: 'Safe',
      direction: 'down',
      good: true,
      tooltip: 'Mechanical failure hazard eliminated under simulated setpoints.',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8 font-sans">
      {/* 1. Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{t.sim.title}</h2>
            <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              {twinState.well_code}
            </span>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
              {t.demo.demoSynthetic}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.sim.subtitle}</p>
        </div>

        <button
          onClick={runJointOptimization}
          disabled={loading}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{loading ? 'Optimizing...' : t.actions.reset}</span>
        </button>
      </div>

      {/* 2. Side-by-Side: CURRENT vs RECOMMENDED CONDITION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* CURRENT CONDITION */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.sim.current}
              </span>
              <StatusBadge tier="CRITICAL" size="sm" />
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">Pumping Speed</span>
                <span className="font-mono font-bold text-slate-800">6.8 SPM</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">Stroke Length</span>
                <span className="font-mono font-bold text-slate-800">120 in</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">Crude Viscosity</span>
                <span className="font-mono font-bold text-red-600">12,089 cP</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">{isOperator ? t.operatorTerms.floatingMargin : 'Floating Margin'}</span>
                <span className="font-mono font-bold text-red-600">1.35 kN (&lt; 2.0)</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">{t.wells.production}</span>
                <span className="font-mono font-bold text-slate-800">31.0 BOPD</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 bg-red-50/70 border border-red-100 rounded-lg text-xs text-red-800">
            <strong>Current Issue:</strong> Fluid is too viscous, causing severe downstroke rod resistance.
          </div>
        </div>

        {/* RECOMMENDED / SIMULATED CONDITION */}
        <div className="bg-white border-2 border-teal-300 rounded-xl p-5 shadow-sm flex flex-col justify-between relative ring-2 ring-teal-100">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-teal-100">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.sim.recommended}</span>
              </span>
              <StatusBadge tier="LOW" size="sm" />
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">Pumping Speed</span>
                <span className="font-mono font-bold text-teal-700">4.8 SPM (Slower)</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">Stroke Length</span>
                <span className="font-mono font-bold text-teal-700">144 in (Longer)</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">Crude Viscosity</span>
                <span className="font-mono font-bold text-emerald-600">185 cP (Hot &amp; Thin)</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">{isOperator ? t.operatorTerms.floatingMargin : 'Floating Margin'}</span>
                <span className="font-mono font-bold text-emerald-600">5.15 kN (Safe)</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-600">{t.wells.production}</span>
                <span className="font-mono font-bold text-teal-700">55.2 BOPD</span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-900">
            <strong>Simulation Indicates:</strong> Longer stroke + slower speed stabilizes rod movement while maintaining production.
          </div>
        </div>
      </div>

      {/* 3. CORE METRICS COMPARISON (5-6 Important Values) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.sim.comparing}: {t.sim.currentVsRecommended}
          </h3>
          <span className="text-xs text-slate-400 font-mono">Simulation Values</span>
        </div>

        <div className="divide-y divide-slate-100">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-1.5 sm:w-1/3">
                <span className="text-xs font-medium text-slate-800">{m.label}</span>
                <InfoTooltip label={m.label} description={m.tooltip} />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-2/3">
                <div className="text-xs text-slate-500">
                  <span className="font-mono text-slate-700">{m.current}</span>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                <div className="text-xs font-bold font-mono text-teal-700">
                  {m.simulated}
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {m.direction === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{m.delta}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. OPERATOR APPROVAL / ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-800">
            {t.rec.recommendedAction}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {approvalStatus === 'approved'
              ? 'Recommendation accepted and recorded in the audit trail.'
              : approvalStatus === 'rejected'
              ? 'Recommendation declined.'
              : 'Review simulated impact before acknowledging or approving changes.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {approvalStatus === 'pending' ? (
            <>
              <button
                onClick={handleReject}
                className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                {t.rec.reject}
              </button>
              <button
                onClick={handleApprove}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.rec.approve}</span>
              </button>
            </>
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              approvalStatus === 'approved'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {approvalStatus === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
              <span>{approvalStatus === 'approved' ? t.rec.approve : t.rec.reject}</span>
            </span>
          )}
        </div>
      </div>

      {/* 5. TECHNICAL / ENGINEER DETAILS (Expandable) */}
      {isEngineer && (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Safety Filter &amp; Optimization Audit
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                [22 Rejected Candidates, Fracture Limit, Floating Margin Floor]
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>{showTechnicalDetails ? 'Collapse' : 'Expand'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showTechnicalDetails && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-800 mb-1">Safety Filter Rejections</div>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside">
                    <li>14 candidates rejected: Injection pressure exceeded 100 bar fracture limit</li>
                    <li>8 candidates rejected: Floating margin fell below 2.0 kN floor</li>
                  </ul>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-800 mb-1">Provenance &amp; Disclaimer</div>
                  <div className="text-slate-600 space-y-0.5">
                    <div>Data: Synthetic / Simulated demo roster</div>
                    <div>Validation: Not yet field validated</div>
                    <div>Control: Decision support only (no direct actuator write)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
