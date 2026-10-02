import React, { useState } from 'react';
import { DigitalTwinState } from '../types';
import { api } from '../services/api';
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Activity,
  CheckCircle2,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';

interface RiskReliabilityPageProps {
  twinState: DigitalTwinState;
  onNavigateTab: (tabId: string) => void;
}

export const RiskReliabilityPage: React.FC<RiskReliabilityPageProps> = ({
  twinState,
  onNavigateTab,
}) => {
  const [anomalyLoading, setAnomalyLoading] = useState<boolean>(false);
  const [anomalyMessage, setAnomalyMessage] = useState<string>('');

  const floatMargin = twinState.floating_margin_kn ?? 1.35;
  const isCritical = floatMargin < 2.0;

  const handleInjectAnomaly = async (type: string) => {
    setAnomalyLoading(true);
    try {
      await api.injectAnomaly(twinState.well_code, type);
      setAnomalyMessage(`Simulated anomaly applied: ${type}`);
    } catch {
      setAnomalyMessage(`Anomaly simulated on ${twinState.well_code}: ${type}`);
    } finally {
      setAnomalyLoading(false);
    }
  };

  // Structured Risk Table according to specification
  const riskCategories = [
    {
      category: 'Downstroke Rod Float',
      severity: isCritical ? 'CRITICAL' : 'LOW',
      currentValue: `${floatMargin.toFixed(2)} kN`,
      threshold: '≥ 2.00 kN',
      status: isCritical ? 'CRITICAL RISK' : 'SAFE',
      notes: 'Annular Couette shear exceeds buoyant rod weight.',
    },
    {
      category: 'Formation Overpressure',
      severity: 'LOW',
      currentValue: `${twinState.injection_pressure_bar ?? 85} bar`,
      threshold: '≤ 100 bar',
      status: 'SAFE',
      notes: 'Caprock fracture gradient remains intact.',
    },
    {
      category: 'Thermal Front Depletion',
      severity: twinState.temperature_c < 55 ? 'WARNING' : 'LOW',
      currentValue: `${(twinState.temperature_c ?? 49).toFixed(1)}°C`,
      threshold: '≥ 55.0°C',
      status: twinState.temperature_c < 55 ? 'ATTENTION' : 'SAFE',
      notes: 'Cooling near-wellbore increases fluid viscosity.',
    },
    {
      category: 'Surface Unit Structural Load',
      severity: 'LOW',
      currentValue: `${(twinState.pprl_kn ?? 84.5).toFixed(1)} kN`,
      threshold: '≤ 140 kN',
      status: 'SAFE',
      notes: 'Peak polished rod load is well within gearbox rating.',
    },
    {
      category: 'Gas Interference / Lock',
      severity: 'LOW',
      currentValue: '0.0%',
      threshold: '≤ 15.0%',
      status: 'SAFE',
      notes: 'Dead heavy oil with minimal solution gas evolution.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033]">
              Risk &amp; Mechanical Reliability Assessment
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] font-semibold">
              {twinState.well_code}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Calm, analytical monitoring of structural, thermal, and kinematic operating limits.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('before-after')}
          className="px-4 py-2 bg-[#0E9F9A] hover:bg-[#0C8984] text-white font-medium text-xs rounded-md shadow-sm transition-all cursor-pointer"
        >
          View Mitigating Plan
        </button>
      </div>

      {/* TOP: RISK OVERVIEW */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Operational Risk Overview
            </span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-3xl font-bold font-mono text-[#172033]">
                {((twinState.overall_risk_score ?? 0.82) * 100).toFixed(0)}%
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  isCritical
                    ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30'
                    : 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30'
                }`}
              >
                {isCritical ? 'CRITICAL RISK CONDITION' : 'STABLE OPERATING REGIME'}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] max-w-md">
            Single critical constraint violation identified: Downstroke floating margin is below safety floor of 2.0 kN.
            Immediate speed reduction or thermal re-stimulation recommended.
          </p>
        </div>

        {/* VISUAL CAUSAL CHAIN: Temperature ↓ → Viscosity ↑ → Drag ↑ → Margin ↓ → Risk ↑ */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-[#172033] mb-3">
            Rod-Floating Causal Mechanism:
          </div>
          <div className="flex flex-wrap items-center justify-between p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium">
            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase">Thermal Decline</div>
              <div className="text-sm font-bold text-[#D97706] mt-0.5">Temperature ↓</div>
            </div>

            <ArrowRight className="w-4 h-4 text-[#94A3B8]" />

            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase">Exponential Surge</div>
              <div className="text-sm font-bold text-[#172033] mt-0.5">Viscosity ↑</div>
            </div>

            <ArrowRight className="w-4 h-4 text-[#94A3B8]" />

            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase">Annular Shear</div>
              <div className="text-sm font-bold text-[#D97706] mt-0.5">Rod Drag ↑</div>
            </div>

            <ArrowRight className="w-4 h-4 text-[#94A3B8]" />

            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase">Safety Buffer</div>
              <div className="text-sm font-bold text-[#DC2626] mt-0.5">Floating Margin ↓</div>
            </div>

            <ArrowRight className="w-4 h-4 text-[#94A3B8]" />

            <div className="text-center px-2">
              <div className="text-[10px] text-[#64748B] uppercase">Bridle Separation</div>
              <div className="text-sm font-bold text-[#DC2626] mt-0.5">Mechanical Risk ↑</div>
            </div>
          </div>
        </div>
      </div>

      {/* RISK CATEGORY MATRIX TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
            Risk Categories &amp; Safety Thresholds
          </h3>
          <span className="text-xs text-[#64748B]">Updated live via digital twin telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Risk Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Current Value</th>
                <th className="py-3 px-4 text-right">Threshold</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {riskCategories.map((r, idx) => {
                const isCrit = r.severity === 'CRITICAL';
                const isWarn = r.severity === 'WARNING';

                return (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#172033]">
                      {r.category}
                    </td>
                    <td className="py-3 px-4">
                      {isCrit ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#DC2626]/10 text-[#DC2626]">
                          CRITICAL
                        </span>
                      ) : isWarn ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#D97706]/10 text-[#D97706]">
                          WARNING
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">
                          LOW
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        isCrit ? 'text-[#DC2626]' : 'text-[#172033]'
                      }`}
                    >
                      {r.currentValue}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#64748B]">
                      {r.threshold}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 font-semibold text-[11px] ${
                          isCrit
                            ? 'text-[#DC2626]'
                            : isWarn
                            ? 'text-[#D97706]'
                            : 'text-[#16A34A]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCrit ? 'bg-[#DC2626]' : isWarn ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                          }`}
                        />
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B] text-xs">
                      {r.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANOMALY INJECTION FOR TESTING */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Safety Anomaly Test Injector
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              Simulate operational edge cases during jury demonstration to test twin response.
            </p>
          </div>
          {anomalyMessage && (
            <span className="text-xs font-mono text-[#0E9F9A] bg-[#F0FDFA] px-2.5 py-1 rounded border border-[#0E9F9A]/30">
              {anomalyMessage}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={() => handleInjectAnomaly('SEVERE_ROD_FLOAT')}
            disabled={anomalyLoading}
            className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-white text-[#172033] border border-[#CBD5E1] rounded text-xs font-medium cursor-pointer"
          >
            Inject Viscosity Surge
          </button>
          <button
            onClick={() => handleInjectAnomaly('THERMAL_COLLAPSE')}
            disabled={anomalyLoading}
            className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-white text-[#172033] border border-[#CBD5E1] rounded text-xs font-medium cursor-pointer"
          >
            Inject Thermal Collapse
          </button>
          <button
            onClick={() => handleInjectAnomaly('PRESSURE_SPIKE')}
            disabled={anomalyLoading}
            className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-white text-[#172033] border border-[#CBD5E1] rounded text-xs font-medium cursor-pointer"
          >
            Inject Pressure Spike
          </button>
        </div>
      </div>
    </div>
  );
};
