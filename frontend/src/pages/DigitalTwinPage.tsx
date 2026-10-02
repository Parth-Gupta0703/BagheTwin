import React, { useState } from 'react';
import { DigitalTwinState, DynacardData } from '../types';
import { DynacardChart } from '../components/DynacardChart';
import {
  Flame,
  Thermometer,
  Droplets,
  Gauge,
  Zap,
  Activity,
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  ChevronRight,
  Sliders,
} from 'lucide-react';

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
  const [selectedChainIdx, setSelectedChainIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'dynacard' | 'engineering'>('overview');

  const tRes = twinState.thermal?.reservoir_temp_c ?? twinState.temperature_c ?? 49.5;
  const visc = twinState.thermal?.viscosity_cp ?? twinState.viscosity_cp ?? 12089;
  const oilRate = twinState.reservoir?.net_oil_rate_bopd ?? twinState.oil_rate_bopd ?? 31.0;
  const pprl = twinState.srp?.pprl_kn ?? twinState.pprl_kn ?? 84.5;
  const mprl = twinState.srp?.mprl_kn ?? twinState.mprl_kn ?? 12.3;
  const floatMargin = twinState.srp?.downstroke_floating_margin_kn ?? twinState.floating_margin_kn ?? 1.35;
  const viscousDrag = twinState.srp?.viscous_drag_force_kn ?? twinState.drag_force_kn ?? 44.6;
  const steamMass = twinState.steam_mass_tonnes ?? 1800;
  const injectionP = twinState.injection_pressure_bar ?? 85;

  const isCritical = floatMargin < 2.0;

  // The 8-step Hero Causal Chain as requested
  const causalChain = [
    {
      id: 'steam',
      name: 'STEAM',
      metric: `${steamMass} t @ ${injectionP} bar`,
      status: 'Injected',
      desc: 'Cyclic steam stimulation transfers thermal enthalpy to rock matrix and reservoir fluids.',
      formula: 'Q_steam = m_steam · (h_f + x · h_fg)',
      tag: 'Thermal Input',
    },
    {
      id: 'temperature',
      name: 'TEMPERATURE',
      metric: `${tRes.toFixed(1)}°C`,
      status: tRes < 55 ? 'Cooling' : 'Adequate',
      desc: 'Conductive heat dissipation into overburden cools the near-wellbore drainage cylinder.',
      formula: 'T(t) = T_initial + ΔT · exp(-λ·t)',
      tag: 'Heat Transfer',
    },
    {
      id: 'viscosity',
      name: 'VISCOSITY',
      metric: `${visc.toLocaleString()} cP`,
      status: visc > 10000 ? 'Extreme' : 'Nominal',
      desc: 'Heavy crude exhibits exponential thermal thinning governed by the Andrade-Arrhenius model.',
      formula: 'μ(T) = μ_ref · exp[B · (1/T - 1/T_ref)]',
      tag: 'Rheology',
    },
    {
      id: 'mobility',
      name: 'MOBILITY / INFLOW',
      metric: `${(850 / visc).toFixed(4)} mD/cP`,
      status: 'Impaired',
      desc: 'Permeability-to-viscosity ratio controls radial Darcy inflow rate into the slotted liner.',
      formula: 'q_inflow = J · (P_res - P_wf), where J ∝ k / μ',
      tag: 'Reservoir Deliverability',
    },
    {
      id: 'srp-load',
      name: 'SRP LOAD',
      metric: `${pprl.toFixed(1)} kN`,
      status: 'High Load',
      desc: 'Peak and minimum polished rod loads vary with mechanical acceleration and fluid weight.',
      formula: 'PPRL = W_buoyant + ΔP_valve + F_dynamic',
      tag: 'Surface Mechanics',
    },
    {
      id: 'rod-drag',
      name: 'ROD DRAG',
      metric: `${viscousDrag.toFixed(1)} kN`,
      status: 'Elevated',
      desc: 'Couette annular shear along the sucker rod string acts upward against downstroke motion.',
      formula: 'F_drag = π · d_rod · L · τ_wall(μ, v_down)',
      tag: 'Annular Fluid Shear',
    },
    {
      id: 'floating-risk',
      name: 'FLOATING RISK',
      metric: `${floatMargin.toFixed(2)} kN`,
      status: isCritical ? 'Critical Hazard' : 'Acceptable',
      desc: 'When downstroke drag exceeds buoyant rod string weight, polished rod separates from bridle.',
      formula: 'Margin = W_buoyant · (1 - α) - F_drag  [Floor: 2.0 kN]',
      tag: 'Safety Constraint',
    },
    {
      id: 'production',
      name: 'PRODUCTION',
      metric: `${oilRate.toFixed(1)} BOPD`,
      status: 'Restricted',
      desc: 'Final surface fluid deliverability after volumetric pump fillage and separation efficiency.',
      formula: 'Q_net = min(q_inflow, q_displacement) · (1 - WC)',
      tag: 'Surface Deliverability',
    },
  ];

  const selectedStep = causalChain[selectedChainIdx];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033]">
              Digital Twin: Coupled Causal Architecture
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] font-semibold">
              {twinState.well_code}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Deterministic forward physics model connecting cyclic steam thermodynamics to downhole rod kinematics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('css-optimizer')}
            className="px-3 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#123B5D] border border-[#CBD5E1] rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            Tune CSS Parameters
          </button>
          <button
            onClick={() => onNavigateTab('srp-optimizer')}
            className="px-3 py-1.5 bg-[#0E9F9A] hover:bg-[#0C8984] text-white rounded-md text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            Tune SRP Kinematics
          </button>
        </div>
      </div>

      {/* HERO VISUALIZATION: THE CAUSAL CHAIN */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E9F9A]">
              Hero Multi-Physics Chain
            </span>
            <h3 className="text-sm font-semibold text-[#172033]">
              Thermal Injection to Downhole Mechanical Risk Flow
            </h3>
          </div>
          <span className="text-xs text-[#64748B]">Click any step to inspect governing physics</span>
        </div>

        {/* 8-Step Grid / Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {causalChain.map((step, idx) => {
            const isSelected = selectedChainIdx === idx;
            const isRiskStep = step.id === 'floating-risk';

            return (
              <div
                key={step.id}
                onClick={() => setSelectedChainIdx(idx)}
                className={`relative p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between h-32 ${
                  isSelected
                    ? 'border-[#0E9F9A] bg-[#F0FDFA] ring-2 ring-[#0E9F9A]/20 shadow-sm'
                    : isRiskStep && isCritical
                    ? 'border-[#DC2626]/40 bg-[#DC2626]/5 hover:bg-[#DC2626]/10'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] mb-1">
                    <span>0{idx + 1}</span>
                    {idx < 7 && <ArrowRight className="w-3 h-3 text-[#94A3B8] hidden lg:block" />}
                  </div>
                  <div className="text-xs font-bold text-[#172033] leading-tight">
                    {step.name}
                  </div>
                </div>

                <div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      isRiskStep && isCritical
                        ? 'text-[#DC2626]'
                        : isSelected
                        ? 'text-[#0E9F9A]'
                        : 'text-[#172033]'
                    }`}
                  >
                    {step.metric}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 truncate">
                    {step.tag}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Step Governing Physics Deep Dive */}
        <div className="mt-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#0E9F9A]">
                Step 0{selectedChainIdx + 1} • {selectedStep.name}
              </span>
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-[#E2E8F0] text-[#172033]">
                {selectedStep.metric}
              </span>
            </div>
            <p className="text-xs text-[#64748B]">{selectedStep.desc}</p>
          </div>

          <div className="p-2.5 bg-white border border-[#CBD5E1] rounded font-mono text-xs text-[#123B5D] shrink-0">
            <span className="text-[10px] text-[#64748B] block font-sans font-medium">Governing Equation:</span>
            {selectedStep.formula}
          </div>
        </div>
      </div>

      {/* SECONDARY INFORMATION PANEL: Progressive Disclosure */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E2E8F0] px-5 bg-[#F8FAFC]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-[#0E9F9A] text-[#0E9F9A] font-semibold bg-white'
                : 'border-transparent text-[#64748B] hover:text-[#172033]'
            }`}
          >
            Subsystem Engineering Values
          </button>
          <button
            onClick={() => setActiveTab('dynacard')}
            className={`py-3 px-4 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'dynacard'
                ? 'border-[#0E9F9A] text-[#0E9F9A] font-semibold bg-white'
                : 'border-transparent text-[#64748B] hover:text-[#172033]'
            }`}
          >
            Surface Dynacard Analysis
          </button>
          <button
            onClick={() => setActiveTab('engineering')}
            className={`py-3 px-4 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'engineering'
                ? 'border-[#0E9F9A] text-[#0E9F9A] font-semibold bg-white'
                : 'border-transparent text-[#64748B] hover:text-[#172033]'
            }`}
          >
            Causal Physics Documentation
          </button>
        </div>

        {/* Tab 1: Subsystem Values */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Reservoir Domain */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#172033] mb-3">
                  <Droplets className="w-4 h-4 text-[#2563EB]" />
                  <span>Reservoir Domain</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Reservoir Pressure:</span>
                    <span className="font-mono font-bold text-[#172033]">{twinState.reservoir_pressure_bar ?? 65} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Flowing BHP:</span>
                    <span className="font-mono font-bold text-[#172033]">{twinState.flowing_bhp_bar ?? 18} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Formation Type:</span>
                    <span className="font-medium text-[#172033]">Jodhpur Sandstone</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Water Cut:</span>
                    <span className="font-mono font-bold text-[#172033]">38%</span>
                  </div>
                </div>
              </div>

              {/* Thermal Domain */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#172033] mb-3">
                  <Flame className="w-4 h-4 text-[#D97706]" />
                  <span>Thermal Domain</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Reservoir Temp:</span>
                    <span className="font-mono font-bold text-[#172033]">{tRes.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Crude Viscosity:</span>
                    <span className="font-mono font-bold text-[#172033]">{visc.toLocaleString()} cP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Steam Slug Size:</span>
                    <span className="font-mono font-bold text-[#172033]">{steamMass} t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Steam Oil Ratio (SOR):</span>
                    <span className="font-mono font-bold text-[#172033]">{twinState.sor ?? 4.8}</span>
                  </div>
                </div>
              </div>

              {/* Wellbore Hydraulics */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#172033] mb-3">
                  <Gauge className="w-4 h-4 text-[#0E9F9A]" />
                  <span>Wellbore Hydraulics</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Pump Intake Pressure:</span>
                    <span className="font-mono font-bold text-[#172033]">{twinState.pump_intake_pressure_bar ?? 22.4} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Fluid Level Depth:</span>
                    <span className="font-mono font-bold text-[#172033]">{twinState.fluid_level_depth_m ?? 820} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Tubing ID:</span>
                    <span className="font-mono font-bold text-[#172033]">2.875 in</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Well Depth:</span>
                    <span className="font-mono font-bold text-[#172033]">1,240 m</span>
                  </div>
                </div>
              </div>

              {/* SRP Mechanical */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#172033] mb-3">
                  <Zap className="w-4 h-4 text-[#2563EB]" />
                  <span>SRP Mechanical</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Pumping Speed:</span>
                    <span className="font-mono font-bold text-[#172033]">{twinState.spm ?? 6.8} SPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Stroke Length:</span>
                    <span className="font-mono font-bold text-[#172033]">{twinState.stroke_in ?? 120} in</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Peak Rod Load:</span>
                    <span className="font-mono font-bold text-[#172033]">{pprl.toFixed(1)} kN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Floating Margin:</span>
                    <span
                      className={`font-mono font-bold ${
                        isCritical ? 'text-[#DC2626]' : 'text-[#16A34A]'
                      }`}
                    >
                      {floatMargin.toFixed(2)} kN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dynacard */}
        {activeTab === 'dynacard' && (
          <div className="p-6">
            <DynacardChart dynacard={dynacard} />
          </div>
        )}

        {/* Tab 3: Detailed Physics Principles */}
        {activeTab === 'engineering' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
              <h4 className="font-bold text-[#172033] mb-1">
                Thermodynamic Coupling Narrative
              </h4>
              <p className="text-[#64748B] leading-relaxed">
                In Rajasthan heavy oil reservoirs (Baghewala field), crude viscosity is extremely sensitive to near-wellbore thermal decay.
                During CSS production cycles, heat conducts away into adjacent overburden formations, depressing formation temperature from ~200°C toward 48°C.
                Under the Andrade viscosity model, this temperature drop causes crude viscosity to multiply by two orders of magnitude (from ~150 cP to over 14,000 cP).
              </p>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
              <h4 className="font-bold text-[#172033] mb-1">
                Downstroke Rod-Floating Mechanics
              </h4>
              <p className="text-[#64748B] leading-relaxed">
                As the sucker rod string plunges downward during the pump downstroke, annular viscous shear resistance (Couette shear stress) acts upward on the polished rod and sucker rod sections.
                When this viscous drag force approaches the buoyant weight of the rod string, the net downward acceleration drops below the carrier-bar downward speed, resulting in rod float and wireline bridle unseating.
                BagheTwin enforces a strict safety constraint of <strong className="text-[#172033]">Margin ≥ 2.0 kN</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
