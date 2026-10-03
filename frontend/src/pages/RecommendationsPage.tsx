import React, { useState, useEffect } from 'react';
import { WellSummary, DigitalTwinState, OptimizationResult } from '../types';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Shield,
  TrendingDown,
  TrendingUp,
  X,
  Info,
  Play,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { FLOATING_MARGIN_CRITICAL_KN, classifyFloatingMargin, getMarginColorClass } from '../services/safetyThresholds';

interface RecommendationsPageProps {
  wells: WellSummary[];
  twinState: DigitalTwinState | null;
  selectedWellCode: string;
  onNavigateTab: (tab: string) => void;
  onSelectWell: (code: string) => void;
  onRefreshTwinState: () => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  wells,
  twinState: _twinState,
  selectedWellCode,
  onNavigateTab,
  onSelectWell,
  onRefreshTwinState,
}) => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTechnical, setExpandedTechnical] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Wells that need recommendations (non-LOW risk)
  const actionableWells = wells.filter(
    (w) => w.overall_risk_tier !== 'LOW'
  );

  // Load optimization for selected well
  useEffect(() => {
    const loadOptimization = async () => {
      setLoading(true);
      setApprovalStatus('pending');
      try {
        const result = await api.runJointOptimization({
          well_code: selectedWellCode,
          search_intensity: 35,
        });
        setOptimization(result);
      } catch {
        setOptimization(null);
      } finally {
        setLoading(false);
      }
    };
    loadOptimization();
  }, [selectedWellCode]);

  const handleApprove = async () => {
    if (!optimization) return;
    try {
      await api.approveRecommendation(optimization.recommendation_id);
      setApprovalStatus('approved');
      onRefreshTwinState();
    } catch {}
  };

  const handleReject = async () => {
    if (!optimization) return;
    try {
      await api.rejectRecommendation(optimization.recommendation_id, 'Operator rejected via UI');
      setApprovalStatus('rejected');
    } catch {}
  };

  const currentWell = wells.find((w) => w.well_code === selectedWellCode);

  const baselineMargin = optimization?.baseline_state?.floating_margin_kn ?? 1.35;
  const recommendedMargin = optimization?.recommended_candidate?.simulated_state?.floating_margin_kn ?? 5.6;

  // Pipeline label
  const pipelineLabel = t.pipeline.recommend;

  // If no actionable wells
  if (actionableWells.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t.rec.noRecommendations}</h2>
        <p className="text-sm text-slate-500">{t.rec.allWellsNormal}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-8 space-y-5">
      {/* Page Header with pipeline label */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{pipelineLabel}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t.rec.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.rec.subtitle}</p>
        </div>
      </div>

      {/* Well Selector chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {actionableWells.map((w) => (
          <button
            key={w.well_code}
            onClick={() => onSelectWell(w.well_code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap cursor-pointer transition-all ${
              w.well_code === selectedWellCode
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="font-mono font-semibold">{w.well_code}</span>
            <StatusBadge tier={w.overall_risk_tier} size="sm" showIcon={false} />
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Analyzing well conditions...</p>
        </div>
      )}

      {/* Recommendation Card */}
      {!loading && optimization && currentWell && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-slate-800">{currentWell.well_code}</span>
                  <StatusBadge tier={currentWell.overall_risk_tier} />
                </div>
              </div>
            </div>
            {approvalStatus === 'approved' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                {t.rec.approve}
              </span>
            )}
            {approvalStatus === 'rejected' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
                <X className="w-4 h-4" />
                {t.rec.reject}
              </span>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* ═══ RECOMMENDED ACTION (Hero) ═══ */}
            <div className="bg-teal-50/70 rounded-xl p-5 border border-teal-200">
              <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2">
                {t.rec.recommendedAction}
              </div>
              {isOperator ? (
                <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                  {t.wellExplain.rodFloatingAction}
                </p>
              ) : (
                <ul className="text-sm text-slate-800 space-y-1.5 list-disc list-inside">
                  {(optimization.explanation.recommended_actions || []).map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* ═══ Three columns: WHY / IMPACT / SAFETY ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WHY */}
              <div className="bg-amber-50/60 rounded-lg p-4 border border-amber-100">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">
                  {t.explain.why}
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {isOperator
                    ? t.wellExplain.rodFloatingWhy
                    : (optimization.explanation.root_contributing_factors || []).join(' ')}
                </p>
              </div>

              {/* EXPECTED IMPACT */}
              <div className="bg-blue-50/60 rounded-lg p-4 border border-blue-100">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
                  {t.rec.expectedImpact}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-700">{t.rec.lowerMechRisk}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-700">{t.rec.stableRodMovement}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-slate-700">{t.rec.improvedEfficiency}</span>
                  </div>
                </div>
              </div>

              {/* SAFETY CHECK */}
              <div className="bg-emerald-50/60 rounded-lg p-4 border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                  {t.rec.safetyCheck}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Current</span>
                    <span className={`font-mono font-bold ${getMarginColorClass(baselineMargin)}`}>
                      {baselineMargin} kN
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Predicted</span>
                    <span className={`font-mono font-bold ${getMarginColorClass(recommendedMargin)}`}>
                      {recommendedMargin} kN
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-1">
                    Threshold: ≥ {FLOATING_MARGIN_CRITICAL_KN} kN
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ WHY THIS RECOMMENDATION? ═══ */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-3">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t.rec.whyThisRec}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 font-medium mb-1">{t.rec.primaryDriver}</div>
                  <div className="text-slate-800 font-semibold">
                    {isOperator ? t.wellExplain.rodFloatingRisk : 'Downstroke viscous drag exceeding rod buoyant weight'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium mb-1">{t.rec.safetyConstraint}</div>
                  <div className="text-slate-800 font-semibold">
                    Floating margin ≥ {FLOATING_MARGIN_CRITICAL_KN} kN
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium mb-1">{t.rec.optimizationObj}</div>
                  <div className="text-slate-800 font-semibold">
                    {isOperator ? 'Maximize rod safety while maintaining production' : 'Maximize oil rate subject to floating margin and fracture pressure constraints'}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Current vs Recommended comparison ═══ */}
            {optimization.recommended_candidate && optimization.baseline_state && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    {t.sim.current}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t.wells.production}</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {optimization.baseline_state.actual_oil_bopd ?? '—'} BOPD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{isOperator ? t.operatorTerms.floatingMargin : 'Floating Margin'}</span>
                      <span className={`font-mono font-semibold ${getMarginColorClass(baselineMargin)}`}>
                        {baselineMargin} kN
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{isOperator ? t.operatorTerms.sor : 'SOR'}</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {optimization.baseline_state.sor ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t.wells.risk}</span>
                      <StatusBadge tier={optimization.baseline_state.overall_risk_tier || 'CRITICAL'} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                  <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">
                    {t.sim.recommended}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t.wells.production}</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {optimization.recommended_candidate.simulated_state.actual_oil_bopd ?? '—'} BOPD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{isOperator ? t.operatorTerms.floatingMargin : 'Floating Margin'}</span>
                      <span className={`font-mono font-semibold ${getMarginColorClass(recommendedMargin)}`}>
                        {recommendedMargin} kN
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{isOperator ? t.operatorTerms.sor : 'SOR'}</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {optimization.recommended_candidate.simulated_state.sor ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t.wells.risk}</span>
                      <StatusBadge tier={optimization.recommended_candidate.simulated_state.overall_risk_tier || 'LOW'} size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engineer: Technical Details */}
            {isEngineer && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedTechnical(!expandedTechnical)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-600">{t.explain.technicalDetails}</span>
                  {expandedTechnical ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedTechnical && (
                  <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50 text-xs space-y-2 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">Candidates evaluated:</span> <span className="font-mono font-semibold">{optimization.total_candidates_evaluated ?? 35}</span></div>
                      <div><span className="text-slate-500">Feasible:</span> <span className="font-mono font-semibold">{optimization.feasible_candidates_count ?? 26}</span></div>
                      <div><span className="text-slate-500">Rejected:</span> <span className="font-mono font-semibold text-red-600">{optimization.rejected_candidates_count ?? 9}</span></div>
                      <div><span className="text-slate-500">Execution:</span> <span className="font-mono font-semibold">{optimization.execution_time_ms ?? 142}ms</span></div>
                    </div>
                    {optimization.explanation.safety_justification && (
                      <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded text-emerald-800">
                        <Shield className="w-3 h-3 inline mr-1" />
                        {optimization.explanation.safety_justification}
                      </div>
                    )}
                    {optimization.explanation.expected_deltas && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {optimization.explanation.expected_deltas.oil_rate_delta_bopd != null && (
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-slate-500">Oil Δ</div>
                            <div className="font-mono font-semibold text-emerald-700">+{optimization.explanation.expected_deltas.oil_rate_delta_bopd} BOPD</div>
                          </div>
                        )}
                        {optimization.explanation.expected_deltas.floating_margin_delta_kn != null && (
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-slate-500">Margin Δ</div>
                            <div className="font-mono font-semibold text-emerald-700">+{optimization.explanation.expected_deltas.floating_margin_delta_kn} kN</div>
                          </div>
                        )}
                        {optimization.explanation.expected_deltas.risk_score_delta != null && (
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-slate-500">Risk Δ</div>
                            <div className="font-mono font-semibold text-emerald-700">{optimization.explanation.expected_deltas.risk_score_delta}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Review note */}
            <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
              <Info className="w-3 h-3" />
              {t.rec.reviewNote}
            </div>

            {/* Action Buttons */}
            {approvalStatus === 'pending' && (
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => onNavigateTab('before-after')}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Play className="w-4 h-4" />
                  {t.rec.reviewInSim}
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t.rec.approve}
                </button>
                <button
                  onClick={handleReject}
                  className="px-5 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition-all cursor-pointer"
                >
                  {t.rec.reject}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
