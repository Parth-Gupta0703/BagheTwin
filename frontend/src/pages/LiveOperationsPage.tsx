import React, { useState, useEffect } from 'react';
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
  ReferenceLine,
} from 'recharts';
import {
  Radio,
  AlertTriangle,
  Zap,
  Flame,
  Droplets,
  Activity,
  CheckCircle2,
  Play,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { FLOATING_MARGIN_CRITICAL_KN, classifyFloatingMargin, getMarginColorClass } from '../services/safetyThresholds';

interface LiveOperationsPageProps {
  twinState: DigitalTwinState;
  onRefreshTwinState: () => void;
}

type SequenceStage = 'NORMAL' | 'DETERIORATION' | 'ANOMALY' | 'FAULT_DETECTED';

export const LiveOperationsPage: React.FC<LiveOperationsPageProps> = ({
  twinState,
  onRefreshTwinState,
}) => {
  const [stage, setStage] = useState<SequenceStage>('ANOMALY');
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [telemetryStream, setTelemetryStream] = useState<any[]>([]);
  const [injecting, setInjecting] = useState<boolean>(false);

  // Stage parameter definitions
  const stageParams = {
    NORMAL: {
      temp: 68.5,
      pressure: 26.2,
      oil: 62.0,
      load: 68.0,
      margin: 4.85,
      drag: 18.2,
      label: 'Normal Operating Baseline',
      statusTier: 'SAFE' as const,
      desc: 'Coupled thermal & kinematic dynamics are balanced. Floating margin is safely above threshold.',
      alerts: [],
    },
    DETERIORATION: {
      temp: 54.0,
      pressure: 24.1,
      oil: 46.5,
      load: 76.5,
      margin: 2.35,
      drag: 31.0,
      label: 'Thermal Front Cooling (Deterioration)',
      statusTier: 'WARNING' as const,
      desc: 'Heat dissipation is cooling near-wellbore zone. Viscosity is climbing, margin decreasing toward safety threshold.',
      alerts: [
        {
          id: 101,
          level: 'WARNING',
          title: 'Near-Wellbore Thermal Decay',
          time: 'Active',
          desc: 'Reservoir temperature decay rate -0.4°C/day. Fluid viscosity increasing.',
        },
      ],
    },
    ANOMALY: {
      temp: 49.0,
      pressure: 22.4,
      oil: 31.0,
      load: 84.5,
      margin: 1.35,
      drag: 44.6,
      label: 'Viscous Drag Anomaly (Critical)',
      statusTier: 'CRITICAL' as const,
      desc: `Viscosity spiked to 12,089 cP. Floating margin is 1.35 kN — critically below the ${FLOATING_MARGIN_CRITICAL_KN} kN threshold.`,
      alerts: [
        {
          id: 1,
          level: 'CRITICAL',
          title: 'Downstroke Rod-Floating Risk Active',
          time: 'Active',
          desc: `Floating margin below ${FLOATING_MARGIN_CRITICAL_KN} kN threshold (current: 1.35 kN). Carrier-bar separation hazard.`,
        },
        {
          id: 2,
          level: 'WARNING',
          title: 'Near-Wellbore Thermal Decay',
          time: 'Active',
          desc: 'Reservoir temperature at 49°C, triggering non-Newtonian viscosity rise.',
        },
      ],
    },
    FAULT_DETECTED: {
      temp: 47.8,
      pressure: 21.6,
      oil: 27.5,
      load: 89.0,
      margin: 1.10,
      drag: 48.2,
      label: 'Fault Detected — Automated Trigger',
      statusTier: 'CRITICAL' as const,
      desc: 'Emergency threshold violated. Diagnostic engine has triggered advisory intervention and queued optimization.',
      alerts: [
        {
          id: 201,
          level: 'CRITICAL',
          title: 'FAULT DETECTED: Downstroke Float Alarm Tripped',
          time: 'Triggered',
          desc: 'Kinematic safety envelope breached. Automated recommendation dispatched to Simulation.',
        },
        {
          id: 202,
          level: 'CRITICAL',
          title: 'Couette Drag Force Surge (> 45 kN)',
          time: 'Triggered',
          desc: 'Severe rod friction hindering gravity fall on downstroke.',
        },
      ],
    },
  };

  const currentProfile = stageParams[stage];

  // Auto-play demo progression loop
  useEffect(() => {
    if (!autoPlay) return;
    const stages: SequenceStage[] = ['NORMAL', 'DETERIORATION', 'ANOMALY', 'FAULT_DETECTED'];
    const interval = setInterval(() => {
      setStage((prev) => {
        const nextIdx = (stages.indexOf(prev) + 1) % stages.length;
        return stages[nextIdx];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  // Real-time 1.5 Hz streaming telemetry engine
  useEffect(() => {
    let fallbackInterval: any = null;
    let isSubscribed = true;

    fallbackInterval = setInterval(() => {
      if (!isSubscribed) return;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const noiseP = (Math.random() - 0.5) * 0.3;
      const noiseT = (Math.random() - 0.5) * 0.15;
      const noiseM = (Math.random() - 0.5) * 0.04;

      const newPoint = {
        time: timeStr,
        temperature_c: Number((currentProfile.temp + noiseT).toFixed(1)),
        pressure_bar: Number((currentProfile.pressure + noiseP * 0.2).toFixed(1)),
        oil_rate_bopd: Number((currentProfile.oil + noiseP * 0.8).toFixed(1)),
        rod_load_kn: Number((currentProfile.load + noiseP * 0.5).toFixed(1)),
        floating_margin_kn: Number((currentProfile.margin + noiseM).toFixed(2)),
      };

      setTelemetryStream((prev) => {
        const next = [...prev, newPoint];
        return next.length > 25 ? next.slice(next.length - 25) : next;
      });
    }, 1200);

    return () => {
      isSubscribed = false;
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [stage]);

  const latest = telemetryStream[telemetryStream.length - 1] || {
    temperature_c: currentProfile.temp,
    pressure_bar: currentProfile.pressure,
    oil_rate_bopd: currentProfile.oil,
    rod_load_kn: currentProfile.load,
    floating_margin_kn: currentProfile.margin,
  };

  const handleInjectAnomaly = async (type: string) => {
    setInjecting(true);
    try {
      await api.injectAnomaly(twinState.well_code, type);
      if (type === 'RESET_ANOMALY') {
        setStage('NORMAL');
      } else {
        setStage('ANOMALY');
      }
      onRefreshTwinState();
    } catch (e) {
      console.error(e);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8 font-sans">
      {/* Header Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-bold text-slate-900">
              Live SCADA Telemetry Stream
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
              {twinState.well_code}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Coupled Live 1.2 Hz</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
              Demo • Synthetic Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-parameter telemetry stream simulating thermal decay, viscous drag escalation, and fault tripping.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              autoPlay
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${autoPlay ? 'fill-current' : ''}`} />
            <span>{autoPlay ? 'Pause Auto Demo' : 'Auto-Play Sequence (24s)'}</span>
          </button>
          <button
            onClick={() => handleInjectAnomaly('RESET_ANOMALY')}
            disabled={injecting}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* 4-Stage Coherent Progression Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Telemetry Evolution Sequence (Jury Demo)</span>
          </span>
          <span className="text-xs font-medium text-slate-500">
            Active: <span className="font-bold text-slate-800">{currentProfile.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(
            [
              { key: 'NORMAL', label: '1. Normal State', sub: 'Baseline margin 4.8 kN' },
              { key: 'DETERIORATION', label: '2. Deterioration', sub: 'Thermal decay cooling' },
              { key: 'ANOMALY', label: '3. Anomaly', sub: 'Drag spike < 2.0 kN' },
              { key: 'FAULT_DETECTED', label: '4. Fault Detected', sub: 'Safety trip & alarm' },
            ] as const
          ).map((item) => {
            const isActive = stage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setAutoPlay(false);
                  setStage(item.key);
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive
                    ? item.key === 'NORMAL'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm ring-1 ring-emerald-300'
                      : item.key === 'DETERIORATION'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm ring-1 ring-amber-300'
                      : 'bg-red-50 border-red-400 text-red-900 shadow-sm ring-1 ring-red-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[11px] opacity-75 mt-0.5">{item.sub}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Sequence Stage:</span>
            <span>{currentProfile.desc}</span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
            Coupled SCADA Feed
          </span>
        </div>
      </div>

      {/* 5 Compact Telemetry Cards with Trend Direction */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Formation Temp */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Formation Temp</span>
            {stage === 'NORMAL' ? (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">{latest.temperature_c.toFixed(1)}°C</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {stage === 'NORMAL' ? 'Normal 68°C' : 'Cooling -0.4°C/day'}
          </div>
        </div>

        {/* Pump Intake (PIP) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Pump Intake (PIP)</span>
            <Minus className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 mt-1">{latest.pressure_bar.toFixed(1)} bar</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Subsurface sensor</div>
        </div>

        {/* Oil Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Oil Rate</span>
            {stage === 'NORMAL' ? (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-600" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">{latest.oil_rate_bopd.toFixed(1)} BOPD</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {stage === 'NORMAL' ? 'Optimal displacement' : 'Throttled by drag'}
          </div>
        </div>

        {/* Peak Rod Load (PPRL) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Peak Rod Load</span>
            {stage === 'NORMAL' ? (
              <Minus className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 mt-1">{latest.rod_load_kn.toFixed(1)} kN</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Polished rod load cell</div>
        </div>

        {/* Floating Margin with Single-Source Safety Threshold */}
        <div
          className={`border rounded-xl p-4 shadow-sm transition-all ${
            latest.floating_margin_kn < FLOATING_MARGIN_CRITICAL_KN
              ? 'bg-red-50/70 border-red-300'
              : latest.floating_margin_kn < 3.5
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-emerald-50/70 border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Floating Margin</span>
            {latest.floating_margin_kn < FLOATING_MARGIN_CRITICAL_KN ? (
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${getMarginColorClass(latest.floating_margin_kn)}`}
          >
            {latest.floating_margin_kn.toFixed(2)} kN
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-0.5">
            Floor: ≥ {FLOATING_MARGIN_CRITICAL_KN} kN
          </div>
        </div>
      </div>

      {/* Live Stream Charts with Safety Threshold ReferenceLine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-800">Downstroke Floating Margin Stream</h3>
            <span className="text-[11px] font-mono text-red-600 font-semibold">
              Safety Floor: {FLOATING_MARGIN_CRITICAL_KN} kN
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Real-time buffer versus carrier-bar separation threshold ({FLOATING_MARGIN_CRITICAL_KN} kN)
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryStream} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 6]} />
                <Tooltip />
                <ReferenceLine
                  y={FLOATING_MARGIN_CRITICAL_KN}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Threshold (${FLOATING_MARGIN_CRITICAL_KN} kN)`,
                    fill: '#DC2626',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="floating_margin_kn"
                  name="Margin (kN)"
                  stroke={latest.floating_margin_kn < FLOATING_MARGIN_CRITICAL_KN ? '#DC2626' : '#0D9488'}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-800">Production &amp; Load Stream</h3>
            <span className="text-[11px] font-mono text-blue-600 font-semibold">Surface Liquid Rate</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Polished rod load and surface liquid rate</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryStream} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="oil_rate_bopd"
                  name="Oil (BOPD)"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Operations Exceptions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Active Operations Exceptions</h3>
          <span className="text-xs font-mono text-slate-400">
            {currentProfile.alerts.length} exception(s) detected
          </span>
        </div>
        <div className="space-y-2">
          {currentProfile.alerts.length === 0 ? (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All multi-parameter sensors are operating within nominal specifications. Zero active exceptions.</span>
            </div>
          ) : (
            currentProfile.alerts.map((a: any) => (
              <div
                key={a.id}
                className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs ${
                  a.level === 'CRITICAL'
                    ? 'border-red-200 bg-red-50/50'
                    : 'border-amber-200 bg-amber-50/50'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    a.level === 'CRITICAL'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}
                >
                  {a.level}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{a.title}</div>
                  <div className="text-slate-600 mt-0.5">{a.desc}</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{a.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
