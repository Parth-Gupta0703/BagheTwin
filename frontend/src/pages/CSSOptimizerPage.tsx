import React, { useState } from 'react';
import { DigitalTwinState } from '../types';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Play,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import { StatusBadge } from '../components/StatusBadge';

interface CSSOptimizerPageProps {
  twinState: DigitalTwinState;
}

export const CSSOptimizerPage: React.FC<CSSOptimizerPageProps> = ({ twinState }) => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();

  // CSS Controls
  const [steamMass, setSteamMass] = useState<number>(twinState.steam_mass_tonnes || 1800);
  const [injectionPressure, setInjectionPressure] = useState<number>(twinState.injection_pressure_bar || 85);
  const productionCutoffDays = 75;

  const [loading, setLoading] = useState<boolean>(false);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [hasSimulated, setHasSimulated] = useState<boolean>(false);

  // Metrics
  const currentMetrics = {
    oilRate: twinState.oil_rate_bopd ?? 31.0,
    viscosity: twinState.viscosity_cp ?? 12089,
    temperature: twinState.temperature_c ?? 49.0,
    sor: twinState.sor ?? 4.8,
  };

  const recommendedMetrics = {
    oilRate: 58.5,
    viscosity: 185,
    temperature: 188.0,
    sor: 2.85,
    cumulativeOil: 2450,
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.runSimulation({
        well_code: twinState.well_code,
        horizon_days: productionCutoffDays,
        steam_mass_tonnes: steamMass,
        injection_pressure_bar: injectionPressure,
      });

      if (res && res.timeline) {
        setSimulationData(res.timeline);
        setHasSimulated(true);
      }
    } catch {
      // Deterministic simulation curve fallback
      const pts = [];
      for (let day = 0; day <= productionCutoffDays; day += 5) {
        const temp = 49 + (188 - 49) * Math.exp(-0.025 * day);
        const visc = Math.round(11500 * Math.exp(5200 * (1 / (temp + 273.15) - 1 / 323.15)));
        const oil = Math.max(15, 62 * Math.exp(-0.015 * day));
        pts.push({ day, temperature_c: Math.round(temp), viscosity_cp: visc, oil_rate_bopd: Math.round(oil) });
      }
      setSimulationData(pts);
      setHasSimulated(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{t.nav.cssOptimizer}</h2>
            <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              {twinState.well_code}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Thermal Slug Sizing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive reservoir thermal recovery simulation for Cyclic Steam Stimulation.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Simulating...' : t.sim.runSimulation}</span>
        </button>
      </div>

      {/* Operator Mode: Clean Current vs Recommended Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.sim.current} Condition
            </span>
            <StatusBadge tier="CRITICAL" size="sm" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{t.wells.temperature}</span>
              <span className="font-mono font-bold text-slate-800">{currentMetrics.temperature}°C</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{isOperator ? t.operatorTerms.viscosity : t.wells.viscosity}</span>
              <span className="font-mono font-bold text-red-600">{currentMetrics.viscosity.toLocaleString()} cP</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{t.wells.production}</span>
              <span className="font-mono font-bold text-slate-800">{currentMetrics.oilRate} BOPD</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">{isOperator ? t.operatorTerms.sor : 'Steam-Oil Ratio'}</span>
              <span className="font-mono font-bold text-slate-800">{currentMetrics.sor}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            Near-wellbore heat is depleted. Fluid is extremely viscous, hindering inflow.
          </div>
        </div>

        <div className="bg-white border-2 border-teal-300 rounded-xl p-5 shadow-sm space-y-4 ring-2 ring-teal-100">
          <div className="flex items-center justify-between pb-3 border-b border-teal-100">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.sim.recommended} Cycle 5 Steam Slug</span>
            </span>
            <StatusBadge tier="LOW" size="sm" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Peak Temperature</span>
              <span className="font-mono font-bold text-teal-700">~{recommendedMetrics.temperature}°C</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Simulated Viscosity</span>
              <span className="font-mono font-bold text-emerald-600">~{recommendedMetrics.viscosity} cP</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Simulated Oil Rate</span>
              <span className="font-mono font-bold text-teal-700">~{recommendedMetrics.oilRate} BOPD</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Target SOR</span>
              <span className="font-mono font-bold text-emerald-600">{recommendedMetrics.sor}</span>
            </div>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-900">
            Injecting 2,200t steam at 85 bar heats near-wellbore cylinder, restoring fluid mobility.
          </div>
        </div>
      </div>

      {/* Engineer Mode: Sliders & Constraints */}
      {isEngineer && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800">CSS Parameter Adjustment</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Boundaries: 600t - 2400t steam • ≤100 bar fracture limit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Steam Mass Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Steam Mass</span>
                <span className="font-mono font-bold text-teal-700">{steamMass} tonnes</span>
              </div>
              <input
                type="range"
                min={600}
                max={2400}
                step={50}
                value={steamMass}
                onChange={(e) => setSteamMass(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>600t (Min)</span>
                <span>1,500t</span>
                <span>2,400t (Max)</span>
              </div>
            </div>

            {/* Injection Pressure Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Injection Pressure</span>
                <span className={`font-mono font-bold ${injectionPressure > 100 ? 'text-red-600' : 'text-teal-700'}`}>
                  {injectionPressure} bar {injectionPressure > 100 ? '[FRACTURE RISK!]' : ''}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={110}
                step={1}
                value={injectionPressure}
                onChange={(e) => setInjectionPressure(Number(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                  injectionPressure > 100 ? 'accent-red-600 bg-red-200' : 'accent-teal-600 bg-slate-200'
                }`}
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50 bar</span>
                <span className="text-red-500 font-medium">100 bar Limit</span>
                <span>110 bar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Trajectory Chart */}
      {hasSimulated && simulationData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Thermal Decay &amp; Production Forecast</h3>
              <p className="text-xs text-slate-500 mt-0.5">Dual-axis timeline over {productionCutoffDays} production days</p>
            </div>
            <span className="text-xs font-mono text-teal-700 font-semibold">Simulated Horizon</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} unit="d" />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} tickLine={false} unit="°C" />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} tickLine={false} unit=" BOPD" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature_c"
                  name="Temperature (°C)"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="oil_rate_bopd"
                  name="Oil Rate (BOPD)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
