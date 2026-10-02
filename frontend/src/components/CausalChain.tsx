import React, { useState } from 'react';
import { DigitalTwinState } from '../types';
import { ArrowRight, Flame, Thermometer, Droplets, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface CausalChainProps {
  twinState: DigitalTwinState;
}

export const CausalChain: React.FC<CausalChainProps> = ({ twinState }) => {
  const [activeStep, setActiveStep] = useState<number>(2);

  const steps = [
    {
      idx: 0,
      title: '1. Steam Enthalpy',
      icon: Flame,
      summary: `${twinState.steam_mass_tonnes} t @ ${twinState.injection_pressure_bar} bar`,
      equation: 'Q_net = m_steam * (h_f + x*h_fg - h_ref)',
      details: 'Delivers saturated latent heat to near-wellbore cylinder, raising rock and fluid temperatures.'
    },
    {
      idx: 1,
      title: '2. Formation Temp',
      icon: Thermometer,
      summary: `${twinState.temperature_c.toFixed(1)} °C`,
      equation: 'T(t) = T_base + (T_peak - T_base) * exp(-lambda*t)',
      details: 'Thermal decay through conductive loss to overburden and convective fluid production.'
    },
    {
      idx: 2,
      title: '3. Oil Viscosity',
      icon: Droplets,
      summary: `${twinState.viscosity_cp.toFixed(0)} cP`,
      equation: 'ln(mu) = ln(mu_ref) + B*(1/T - 1/T_ref)',
      details: 'Andrade-Arrhenius thermal thinning. Temperature decline causes exponential viscosity escalation.'
    },
    {
      idx: 3,
      title: '4. Darcy Mobility',
      icon: TrendingUp,
      summary: `k/mu ~ ${(850 / twinState.viscosity_cp).toFixed(4)} mD/cP`,
      equation: 'Mobility = k / mu(T)',
      details: 'Enhanced mobility governs Darcy radial inflow across Jodhpur sandstone formation.'
    },
    {
      idx: 4,
      title: '5. SRP Lift Mechanics',
      icon: Zap,
      summary: `${twinState.stroke_in}" @ ${twinState.spm} SPM`,
      equation: 'PPRL / MPRL / F_drag = tau_wall * Area',
      details: 'Kinematics and Couette annular viscous shear opposing rod string downward descent.'
    },
    {
      idx: 5,
      title: '6. Production Deliverability',
      icon: Droplets,
      summary: `${twinState.oil_rate_bopd.toFixed(1)} BOPD`,
      equation: 'q_oil = min(q_inflow, q_pump) * (1 - WC)',
      details: 'Constrained by both reservoir deliverability and mechanical pumping volumetric capacity.'
    },
    {
      idx: 6,
      title: '7. Mechanical Risk',
      icon: AlertTriangle,
      summary: `Margin: ${twinState.floating_margin_kn.toFixed(2)} kN`,
      equation: 'Margin = W_buoyant*(1-alpha) - F_drag',
      details: 'Downstroke driving force minus opposing drag. If margin <= 2.0 kN, rod floating occurs.'
    }
  ];

  const current = steps[activeStep];

  return (
    <div className="bg-industrial-card border border-industrial-border rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-industrial-border/60 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            COUPLED CAUSAL MULTI-PHYSICS CHAIN
          </h3>
          <p className="text-xs text-industrial-muted">
            End-to-end forward coupling from thermodynamic steam injection to downhole mechanical risk.
          </p>
        </div>
        <span className="text-[10px] font-mono bg-industrial-panel px-2.5 py-1 rounded text-amber-400 border border-industrial-border">
          REDUCED-ORDER DETERMINISTIC COUPLING
        </span>
      </div>

      {/* Horizontal Chain Flow */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
        {steps.map((s, i) => {
          const isSelected = activeStep === s.idx;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.idx}>
              <button
                onClick={() => setActiveStep(s.idx)}
                className={`p-3 rounded-lg border text-left shrink-0 w-44 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-industrial-panel border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-industrial-bg/80 border-industrial-border/60 hover:bg-industrial-hover/60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1.5 rounded ${
                      isSelected ? 'bg-amber-500 text-black' : 'bg-industrial-card text-industrial-muted'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white truncate">{s.title}</span>
                </div>
                <div className="text-xs font-mono font-semibold text-amber-300 mt-2 truncate">
                  {s.summary}
                </div>
              </button>
              {i < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-industrial-muted shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Step Equation & Explanations */}
      <div className="mt-4 p-4 rounded-lg bg-industrial-panel border border-industrial-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
            STEP {current.idx + 1} PHYSICS FORMULATION:
          </div>
          <div className="text-sm font-bold text-white mt-0.5">{current.title}</div>
          <p className="text-xs text-slate-300 mt-1">{current.details}</p>
        </div>
        <div className="bg-industrial-bg px-4 py-2.5 rounded-lg border border-industrial-border/70 shrink-0">
          <div className="text-[10px] font-mono text-industrial-muted">GOVERNING EQUATION</div>
          <code className="text-xs font-mono font-semibold text-cyan-300">{current.equation}</code>
        </div>
      </div>
    </div>
  );
};
