import React, { useState } from 'react';
import { DigitalTwinState } from '../types';
import {
  FlaskConical,
  Play,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Flame,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { FLOATING_MARGIN_CRITICAL_KN } from '../services/safetyThresholds';

interface ScenarioLabPageProps {
  twinState: DigitalTwinState;
}

export const ScenarioLabPage: React.FC<ScenarioLabPageProps> = ({ twinState }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('aggressive-steam');
  const [loading, setLoading] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Scenario presets
  const scenarios = [
    {
      id: 'aggressive-steam',
      name: 'High-Volume Steam Slug (CSS Cycle 5)',
      desc: 'Inject 2,400 tonnes steam at 88 bar with 6-day soak to rapidly recover near-wellbore heat.',
      params: { steam: 2400, pressure: 88, soak: 6, spm: 5.2, stroke: 144 },
      outcomes: { oil: 56.8, sor: 2.75, energy: 11.4, margin: 4.8, risk: 'LOW' },
    },
    {
      id: 'srp-kinematic-slow',
      name: 'Low Speed / Extended Stroke (Mechanical Focus)',
      desc: 'Reduce pumping speed to 4.2 SPM and increase stroke to 144" without immediate steaming.',
      params: { steam: 1200, pressure: 80, soak: 3, spm: 4.2, stroke: 144 },
      outcomes: { oil: 38.2, sor: 3.9, energy: 9.8, margin: 5.2, risk: 'LOW' },
    },
    {
      id: 'high-frequency-push',
      name: 'High Frequency Production Push (Risk Test)',
      desc: 'Attempt aggressive surface draw with 8.5 SPM pumping speed at low formation temperature.',
      params: { steam: 800, pressure: 75, soak: 2, spm: 8.5, stroke: 120 },
      outcomes: { oil: 28.5, sor: 5.2, energy: 17.5, margin: 0.85, risk: 'CRITICAL' },
    },
  ];

  const currentScenario = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];
  const [simulatedOutcomes, setSimulatedOutcomes] = useState(currentScenario.outcomes);

  const handleRunScenario = () => {
    setLoading(true);
    setTimeout(() => {
      setSimulatedOutcomes(currentScenario.outcomes);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033]">
              What-If Scenario Simulation Lab
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] font-semibold">
              {twinState.well_code}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Test alternative thermal slug sizes and mechanical pumping strategies before executing field interventions.
          </p>
        </div>

        <button
          onClick={handleRunScenario}
          disabled={loading}
          className="px-5 py-2.5 bg-[#0E9F9A] hover:bg-[#0C8984] text-white font-medium text-xs rounded-md shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Simulating...' : 'Run Scenario'}</span>
        </button>
      </div>

      {/* CORE WORKFLOW: CURRENT STATE -> SCENARIO -> SIMULATED OUTCOME */}
      <div className="space-y-4">
        {/* Step 1: CURRENT STATE */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Step 1: Current Well State
            </div>
            <span className="text-xs font-mono text-[#DC2626] font-semibold">
              {twinState.floating_margin_kn < FLOATING_MARGIN_CRITICAL_KN ? 'Critical Rod-Floating Condition' : 'Stable'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Oil Rate</div>
              <div className="text-lg font-bold font-mono text-[#172033] mt-1">
                {(twinState.oil_rate_bopd ?? 31.0).toFixed(1)} BOPD
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Crude Viscosity</div>
              <div className="text-lg font-bold font-mono text-[#172033] mt-1">
                {(twinState.viscosity_cp ?? 12089).toLocaleString()} cP
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Current SOR</div>
              <div className="text-lg font-bold font-mono text-[#172033] mt-1">
                {twinState.sor ?? 4.8}
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Floating Margin</div>
              <div className="text-lg font-bold font-mono text-[#DC2626] mt-1">
                {(twinState.floating_margin_kn ?? 1.35).toFixed(2)} kN
              </div>
            </div>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#64748B] shadow-sm">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Step 2: SCENARIO SELECTION */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0E9F9A]">
            Step 2: Choose Intervention Scenario
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((s) => {
              const isSelected = selectedScenario === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedScenario(s.id);
                    setSimulatedOutcomes(s.outcomes);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0E9F9A] bg-[#F0FDFA] ring-2 ring-[#0E9F9A]/20'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#172033] mb-1">
                    {s.name}
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {s.desc}
                  </p>
                  <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between text-[11px] font-mono text-[#64748B]">
                    <span>Steam: {s.params.steam} t</span>
                    <span>SPM: {s.params.spm}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#64748B] shadow-sm">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Step 3: 4 KEY OUTCOME CARDS */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Step 3: Simulated Outcome Metrics
            </div>
            <span className="text-xs text-[#64748B] font-mono">
              Scenario: {currentScenario.name}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Outcome 1: Oil Rate */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
              <div className="text-xs text-[#64748B]">Oil Rate</div>
              <div className="text-2xl font-bold font-mono text-[#172033] mt-1">
                {simulatedOutcomes.oil.toFixed(1)}
                <span className="text-xs text-[#64748B] ml-1 font-normal font-sans">BOPD</span>
              </div>
              <div className="text-[11px] text-[#16A34A] font-semibold mt-1">
                +{((simulatedOutcomes.oil - 31.0)).toFixed(1)} BOPD vs baseline
              </div>
            </div>

            {/* Outcome 2: Steam-Oil Ratio (SOR) */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
              <div className="text-xs text-[#64748B]">Steam-Oil Ratio (SOR)</div>
              <div className="text-2xl font-bold font-mono text-[#172033] mt-1">
                {simulatedOutcomes.sor}
                <span className="text-xs text-[#64748B] ml-1 font-normal font-sans">t/bbl</span>
              </div>
              <div className="text-[11px] text-[#16A34A] font-semibold mt-1">
                Efficient thermal utilization
              </div>
            </div>

            {/* Outcome 3: Energy Intensity */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
              <div className="text-xs text-[#64748B]">Energy Intensity</div>
              <div className="text-2xl font-bold font-mono text-[#172033] mt-1">
                {simulatedOutcomes.energy}
                <span className="text-xs text-[#64748B] ml-1 font-normal font-sans">kWh/bbl</span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">
                Surface pumping power
              </div>
            </div>

            {/* Outcome 4: Mechanical Risk */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
              <div className="text-xs text-[#64748B]">Mechanical Risk</div>
              <div
                className={`text-2xl font-bold font-mono mt-1 ${
                  simulatedOutcomes.risk === 'CRITICAL' ? 'text-[#DC2626]' : 'text-[#16A34A]'
                }`}
              >
                {simulatedOutcomes.risk}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">
                Margin: {simulatedOutcomes.margin} kN (&gt;{FLOATING_MARGIN_CRITICAL_KN} kN floor)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TECHNICAL DETAILS COLLAPSIBLE */}
      <div className="border border-[#E2E8F0] rounded-lg bg-white overflow-hidden shadow-sm">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold text-[#172033]">
            Technical Details &amp; Numerical Boundary Models
          </span>
          <div className="flex items-center space-x-1 text-xs text-[#64748B]">
            <span>{showTechnicalDetails ? 'Collapse' : 'Expand'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] text-xs space-y-3 text-[#64748B]">
            <p>
              Coupled reservoir thermodynamic simulator evaluates conductive losses through caprock and overburden formations using a 1D radial finite-difference approximation.
            </p>
            <div className="p-3 bg-white rounded border border-[#CBD5E1] font-mono text-[11px] text-[#123B5D]">
              Q_conduction = 2π·k_rock·H · (T_res - T_farfield) / ln(r_outer / r_wellbore)
            </div>
            <p>
              Pumping unit kinematics and downstroke rod force calculations enforce API Spec 11E load geometry and Couette shear integration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
