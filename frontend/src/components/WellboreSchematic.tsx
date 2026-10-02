import React, { useState } from 'react';
import { DigitalTwinState } from '../types';
import { Flame, Zap, Droplets, AlertTriangle, ShieldCheck } from 'lucide-react';

interface WellboreSchematicProps {
  twinState: DigitalTwinState;
}

export const WellboreSchematic: React.FC<WellboreSchematicProps> = ({ twinState }) => {
  const [selectedNode, setSelectedNode] = useState<string>('rod-string');

  const nodes = [
    {
      id: 'surface',
      name: 'Surface Equipment',
      depth: '0 m',
      icon: Zap,
      vars: [
        { label: 'SPM', value: `${twinState.spm} strokes/min` },
        { label: 'Stroke Length', value: `${twinState.stroke_in} in` },
        { label: 'VFD Frequency', value: `${twinState.vfd_hz} Hz` },
        { label: 'PPRL', value: `${twinState.pprl_kn} kN` },
        { label: 'MPRL', value: `${twinState.mprl_kn} kN` }
      ]
    },
    {
      id: 'wellhead',
      name: 'Wellhead & Stuffing Box',
      depth: '0 - 15 m',
      icon: Droplets,
      vars: [
        { label: 'Tubing Pressure', value: '3.5 bar' },
        { label: 'Casing Head Pressure', value: '1.5 bar' },
        { label: 'Daily Liquid Rate', value: `${(twinState.oil_rate_bopd + twinState.water_rate_bwpd).toFixed(1)} bpd` },
        { label: 'Oil Rate', value: `${twinState.oil_rate_bopd} BOPD` }
      ]
    },
    {
      id: 'rod-string',
      name: 'Tubing & Sucker Rod String',
      depth: `0 - ${twinState.fluid_level_depth_m.toFixed(0)} m`,
      icon: AlertTriangle,
      status: twinState.floating_margin_kn <= 2.0 ? 'CRITICAL' : 'NORMAL',
      vars: [
        { label: 'Dynamic Fluid Level', value: `${twinState.fluid_level_depth_m.toFixed(1)} m depth` },
        { label: 'Annular Drag Force', value: `${twinState.drag_force_kn} kN` },
        {
          label: 'Downstroke Floating Margin',
          value: `${twinState.floating_margin_kn} kN`,
          highlight: twinState.floating_margin_kn <= 2.0
        },
        { label: 'Effective Rod Stress', value: '185.4 MPa (62% yield)' },
        { label: 'Hazard Flag', value: twinState.floating_margin_kn <= 2.0 ? 'CARRIER-BAR SEPARATION RISK' : 'LOW RISK' }
      ]
    },
    {
      id: 'srp-pump',
      name: 'Downhole Sucker Rod Pump',
      depth: '950 m (Pump Intake)',
      icon: Zap,
      vars: [
        { label: 'Pump Intake Pressure (PIP)', value: `${twinState.pump_intake_pressure_bar} bar` },
        { label: 'Volumetric Pump Efficiency', value: `${twinState.pump_efficiency_pct}%` },
        { label: 'Pump Bore', value: '57.15 mm (2-1/4")' },
        { label: 'Effective Submergence', value: '130.0 m' }
      ]
    },
    {
      id: 'near-wellbore',
      name: 'Near-Wellbore Thermal Zone',
      depth: '950 - 1050 m',
      icon: Flame,
      vars: [
        { label: 'Near-Wellbore Temp', value: `${twinState.temperature_c} °C` },
        { label: 'Crude Dynamic Viscosity', value: `${twinState.viscosity_cp.toFixed(0)} cP` },
        { label: 'Steam Injected (Cycle)', value: `${twinState.steam_mass_tonnes} tonnes` },
        { label: 'Cumulative SOR', value: `${twinState.sor} t/bbl` }
      ]
    },
    {
      id: 'reservoir',
      name: 'Jodhpur Sandstone Reservoir',
      depth: '1050 m (Datum)',
      icon: Droplets,
      vars: [
        { label: 'Base Reservoir Pressure', value: `${twinState.reservoir_pressure_bar} bar` },
        { label: 'Flowing BHP (P_wf)', value: `${twinState.flowing_bhp_bar} bar` },
        { label: 'Drawdown (Delta P)', value: `${(twinState.reservoir_pressure_bar - twinState.flowing_bhp_bar).toFixed(1)} bar` },
        { label: 'API Gravity', value: '17.5° API (Heavy Oil)' },
        { label: 'Permeability', value: '820 mD' }
      ]
    }
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode) || nodes[2];

  return (
    <div className="bg-industrial-card border border-industrial-border rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-industrial-border/70 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
            <span>VERTICAL WELLBORE DIGITAL TWIN SCHEMATIC</span>
            <span className="text-[10px] font-mono bg-industrial-panel text-industrial-muted px-2 py-0.5 rounded border border-industrial-border">
              SURFACE TO RESERVOIR
            </span>
          </h3>
          <p className="text-xs text-industrial-muted">
            Interactive multi-depth state estimator. Click any depth node to inspect physical states.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {twinState.floating_margin_kn <= 2.0 && (
            <div className="flex items-center space-x-1.5 bg-red-950/70 border border-red-500/50 text-red-300 text-xs px-2.5 py-1 rounded font-mono animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ROD FLOAT RISK ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Vertical Well Column Visualization */}
        <div className="lg:col-span-5 bg-industrial-bg rounded-lg p-4 border border-industrial-border/60 flex flex-col items-center">
          <div className="w-full space-y-2 max-w-sm">
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isCritical = node.status === 'CRITICAL';
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-industrial-panel border-amber-500/80 shadow-md shadow-amber-500/10'
                      : isCritical
                      ? 'bg-red-950/30 border-red-500/40 hover:bg-red-950/50'
                      : 'bg-industrial-card/60 border-industrial-border/60 hover:bg-industrial-hover/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-md ${
                        isSelected
                          ? 'bg-amber-500 text-black'
                          : isCritical
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-industrial-panel text-industrial-muted'
                      }`}
                    >
                      <node.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{node.name}</div>
                      <div className="text-[10px] font-mono text-industrial-muted">{node.depth}</div>
                    </div>
                  </div>
                  {isCritical && (
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-industrial-border/50 text-[11px] text-industrial-muted text-center">
            Click nodes above to inspect physics state vector
          </div>
        </div>

        {/* Right Column: Node Details & Diagnostics */}
        <div className="lg:col-span-7 bg-industrial-panel rounded-lg p-5 border border-industrial-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-industrial-border/60">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                  NODE TELEMETRY & PHYSICAL VARIABLES
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{activeNodeData.name}</h4>
              </div>
              <span className="text-xs font-mono bg-industrial-bg px-2.5 py-1 rounded text-industrial-muted border border-industrial-border">
                {activeNodeData.depth}
              </span>
            </div>

            {/* Variable Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {activeNodeData.vars.map((v, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    (v as any).highlight
                      ? 'bg-red-950/40 border-red-500/50'
                      : 'bg-industrial-bg/70 border-industrial-border/50'
                  }`}
                >
                  <div className="text-[11px] text-industrial-muted">{v.label}</div>
                  <div
                    className={`text-sm font-mono font-bold mt-1 ${
                      (v as any).highlight ? 'text-red-400 font-extrabold' : 'text-white'
                    }`}
                  >
                    {v.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Context Note */}
            {activeNodeData.id === 'rod-string' && twinState.floating_margin_kn <= 2.0 && (
              <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-200 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Physical Risk Diagnosis: Viscous Downstroke Drag</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Due to cooling formation temperature ({twinState.temperature_c}°C) and elevated viscosity
                  ({twinState.viscosity_cp.toFixed(0)} cP), Couette shear drag opposing downstroke descent
                  reaches {twinState.drag_force_kn} kN. Sucker rod descent slows, reducing load on carrier bar
                  to {twinState.floating_margin_kn} kN.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-industrial-border/60 flex items-center justify-between text-[11px] text-industrial-muted font-mono">
            <span>MODEL: COUPLED HYDROSTATIC + VISCOUS MECHANICS</span>
            <span>STATUS: SIMULATION ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
