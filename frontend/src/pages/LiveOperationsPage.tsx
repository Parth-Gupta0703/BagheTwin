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
  Legend,
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
} from 'lucide-react';

interface LiveOperationsPageProps {
  twinState: DigitalTwinState;
  onRefreshTwinState: () => void;
}

export const LiveOperationsPage: React.FC<LiveOperationsPageProps> = ({
  twinState,
  onRefreshTwinState,
}) => {
  const [telemetryStream, setTelemetryStream] = useState<any[]>([]);
  const [injecting, setInjecting] = useState<boolean>(false);
  const [wsStatus, setWsStatus] = useState<'LIVE' | 'RECONNECTING' | 'OFFLINE'>('LIVE');
  const [activeAlerts, setActiveAlerts] = useState<any[]>([
    {
      id: 1,
      level: 'CRITICAL',
      title: 'Downstroke Rod-Floating Risk Active',
      time: '14:22:05',
      desc: 'Floating margin below 2.0 kN threshold (current: 1.35 kN). Annular Couette shear exceeds safety margin.',
    },
    {
      id: 2,
      level: 'WARNING',
      title: 'Near-Wellbore Thermal Decay',
      time: '14:21:40',
      desc: 'Reservoir temperature decay rate -0.4°C/day. Thermal radius nearing boundary.',
    },
  ]);

  useEffect(() => {
    let fallbackInterval: any = null;
    let isSubscribed = true;

    // Simulated 1.5 Hz streaming telemetry
    fallbackInterval = setInterval(() => {
      if (!isSubscribed) return;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const noiseP = (Math.random() - 0.5) * 0.4;
      const noiseT = (Math.random() - 0.5) * 0.2;

      const newPoint = {
        time: timeStr,
        temperature_c: Number(((twinState.thermal?.reservoir_temp_c ?? twinState.temperature_c ?? 49.5) + noiseT).toFixed(1)),
        pressure_bar: Number(((twinState.wellbore?.pip_bar ?? twinState.pump_intake_pressure_bar ?? 22.4) + noiseP * 0.2).toFixed(1)),
        oil_rate_bopd: Number(((twinState.reservoir?.net_oil_rate_bopd ?? twinState.oil_rate_bopd ?? 31.0) + noiseP).toFixed(1)),
        rod_load_kn: Number(((twinState.srp?.pprl_kn ?? twinState.pprl_kn ?? 84.5) + noiseP * 0.8).toFixed(1)),
        floating_margin_kn: Number(((twinState.srp?.downstroke_floating_margin_kn ?? twinState.floating_margin_kn ?? 1.35) + noiseP * 0.05).toFixed(2)),
      };

      setTelemetryStream((prev) => {
        const next = [...prev, newPoint];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });
    }, 1500);

    return () => {
      isSubscribed = false;
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [twinState.well_code]);

  const handleInjectAnomaly = async (type: string) => {
    setInjecting(true);
    try {
      const res = await api.injectAnomaly(twinState.well_code, type);
      if (type === 'RESET_ANOMALY') {
        setActiveAlerts([]);
      } else {
        setActiveAlerts((prev) => [
          {
            id: Date.now(),
            level: res.event?.severity || 'CRITICAL',
            title: `INJECTED FAULT: ${type.replace(/_/g, ' ')}`,
            time: new Date().toTimeString().split(' ')[0],
            desc: res.event?.description || 'Simulated abnormal telemetry divergence injected.',
          },
          ...prev,
        ]);
      }
      onRefreshTwinState();
    } catch (e) {
      console.error(e);
    } finally {
      setInjecting(false);
    }
  };

  const latest = telemetryStream[telemetryStream.length - 1] || {};
  const currentT = latest.temperature_c ?? twinState.temperature_c ?? 49.5;
  const currentP = latest.pressure_bar ?? twinState.pump_intake_pressure_bar ?? 22.4;
  const currentOil = latest.oil_rate_bopd ?? twinState.oil_rate_bopd ?? 31.0;
  const currentLoad = latest.rod_load_kn ?? twinState.pprl_kn ?? 84.5;
  const currentMargin = latest.floating_margin_kn ?? twinState.floating_margin_kn ?? 1.35;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Header Strip */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033]">
              Live SCADA Telemetry Stream
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] font-semibold">
              {twinState.well_code}
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              <span>Coupled Live 1.5 Hz</span>
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Streaming multi-parameter surface and downhole sensor arrays with anomaly fault detection.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleInjectAnomaly('SEVERE_ROD_FLOAT')}
            disabled={injecting}
            className="px-3 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#DC2626] border border-[#DC2626]/30 rounded text-xs font-semibold cursor-pointer"
          >
            Fault: Viscous Drag
          </button>
          <button
            onClick={() => handleInjectAnomaly('RESET_ANOMALY')}
            disabled={injecting}
            className="px-3 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1] rounded text-xs font-medium cursor-pointer"
          >
            Clear Injected Faults
          </button>
        </div>
      </div>

      {/* 5 Compact Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-sm">
          <div className="text-xs text-[#64748B]">Formation Temp</div>
          <div className="text-xl font-bold font-mono text-[#D97706] mt-1">{currentT.toFixed(1)}°C</div>
          <div className="text-[10px] text-[#64748B]">Near-wellbore probe</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-sm">
          <div className="text-xs text-[#64748B]">Pump Intake (PIP)</div>
          <div className="text-xl font-bold font-mono text-[#172033] mt-1">{currentP.toFixed(1)} bar</div>
          <div className="text-[10px] text-[#64748B]">Subsurface sensor</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-sm">
          <div className="text-xs text-[#64748B]">Oil Rate</div>
          <div className="text-xl font-bold font-mono text-[#2563EB] mt-1">{currentOil.toFixed(1)} BOPD</div>
          <div className="text-[10px] text-[#64748B]">Surface flowline</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-sm">
          <div className="text-xs text-[#64748B]">Peak Rod Load (PPRL)</div>
          <div className="text-xl font-bold font-mono text-[#172033] mt-1">{currentLoad.toFixed(1)} kN</div>
          <div className="text-[10px] text-[#64748B]">Load cell reading</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-sm">
          <div className="text-xs text-[#64748B]">Floating Margin</div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              currentMargin < 2.0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
            }`}
          >
            {currentMargin.toFixed(2)} kN
          </div>
          <div className="text-[10px] text-[#DC2626]">Safety floor: 2.0 kN</div>
        </div>
      </div>

      {/* Live Stream Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#172033] mb-1">Downstroke Floating Margin Stream</h3>
          <p className="text-xs text-[#64748B] mb-4">Real-time buffer versus carrier-bar separation threshold (2.0 kN)</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryStream} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 6]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="floating_margin_kn"
                  name="Margin (kN)"
                  stroke="#DC2626"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#172033] mb-1">Production &amp; Load Stream</h3>
          <p className="text-xs text-[#64748B] mb-4">Polished rod load and surface liquid rate</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryStream} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

      {/* Active Alerts List */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-[#172033]">Active Operations Exceptions</h3>
        <div className="space-y-2">
          {activeAlerts.map((a) => (
            <div
              key={a.id}
              className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-start space-x-3 text-xs"
            >
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  a.level === 'CRITICAL'
                    ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30'
                    : 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30'
                }`}
              >
                {a.level}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-[#172033]">{a.title}</div>
                <div className="text-[#64748B] mt-0.5">{a.desc}</div>
              </div>
              <span className="text-[11px] font-mono text-[#94A3B8]">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
