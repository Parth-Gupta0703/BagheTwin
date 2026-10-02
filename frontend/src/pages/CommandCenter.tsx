import React, { useState } from 'react';
import { WellSummary, DigitalTwinState } from '../types';
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface CommandCenterProps {
  wells: WellSummary[];
  selectedWellCode: string;
  onSelectWell: (code: string) => void;
  onNavigateTab: (tabId: string) => void;
  onLaunchJuryDemo: () => void;
  twinState?: DigitalTwinState | null;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  wells,
  selectedWellCode,
  onSelectWell,
  onNavigateTab,
  onLaunchJuryDemo,
  twinState,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // If user selected another well, use that, but highlight BGW-007 if selected or by default
  const activeWell = wells.find((w) => w.well_code === selectedWellCode) || wells[0];
  const isBGW007 = activeWell?.well_code === 'BGW-007';

  // Calculate fleet numbers dynamically
  const totalWells = wells.length > 0 ? wells.length : 12;
  const criticalWells = wells.filter((w) => w.overall_risk_tier === 'CRITICAL').length || 1;
  const attentionWells = wells.filter(
    (w) => w.overall_risk_tier === 'HIGH' || w.overall_risk_tier === 'MEDIUM'
  ).length || 6;
  const healthyWells = wells.filter((w) => w.overall_risk_tier === 'LOW').length || 5;

  // Key values for priority well card (prefer BGW-007 values or twinState)
  const priorityTemp = isBGW007 ? 49 : (twinState?.temperature_c ?? activeWell?.temperature_c ?? 49);
  const priorityVisc = isBGW007 ? 12089 : (twinState?.viscosity_cp ?? activeWell?.viscosity_cp ?? 12089);
  const priorityDrag = isBGW007 ? 44.6 : (twinState?.drag_force_kn ?? 44.6);
  const priorityMargin = isBGW007 ? 1.35 : (twinState?.floating_margin_kn ?? activeWell?.floating_margin_kn ?? 1.35);

  // Trend chart data (14 days)
  const productionTrendData = [
    { day: 'Day -14', oil: 62.5 },
    { day: 'Day -12', oil: 59.2 },
    { day: 'Day -10', oil: 54.8 },
    { day: 'Day -8', oil: 48.3 },
    { day: 'Day -6', oil: 42.0 },
    { day: 'Day -4', oil: 36.4 },
    { day: 'Day -2', oil: 33.1 },
    { day: 'Live', oil: isBGW007 ? 31.0 : (twinState?.oil_rate_bopd ?? 31.0) },
  ];

  const riskTrendData = [
    { day: 'Day -14', margin: 4.8, drag: 18.2 },
    { day: 'Day -12', margin: 4.1, drag: 22.5 },
    { day: 'Day -10', margin: 3.5, drag: 28.0 },
    { day: 'Day -8', margin: 2.9, drag: 33.4 },
    { day: 'Day -6', margin: 2.3, drag: 38.2 },
    { day: 'Day -4', margin: 1.85, drag: 41.5 },
    { day: 'Day -2', margin: 1.5, drag: 43.8 },
    { day: 'Live', margin: priorityMargin, drag: priorityDrag },
  ];

  // Recent system events (clean 4 events)
  const recentEvents = [
    {
      id: 1,
      well: 'BGW-007',
      severity: 'CRITICAL',
      title: 'Rod-Floating Limit Breached',
      detail: 'Floating margin dropped to 1.35 kN (<2.0 kN safety threshold). High carrier-bar separation risk.',
      time: '12m ago',
    },
    {
      id: 2,
      well: 'BGW-007',
      severity: 'WARNING',
      title: 'Thermal Decline & Viscosity Surge',
      detail: 'Near-wellbore cooling to 49°C caused heavy crude viscosity to escalate to 12,089 cP.',
      time: '45m ago',
    },
    {
      id: 3,
      well: 'SYSTEM',
      severity: 'INFO',
      title: 'Optimization Recommendation Ready',
      detail: 'Joint CSS+SRP plan generated: Shift SPM to 4.8 and initiate Cycle 5 steam slug.',
      time: '1h ago',
    },
    {
      id: 4,
      well: 'BGW-001',
      severity: 'HEALTHY',
      title: 'CSS Cycle Completed',
      detail: 'Baseline operational envelope verified with stable SOR at 2.4.',
      time: '3h ago',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* 1. FLEET SUMMARY (Above the fold - 4 compact KPI cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Fleet Operational Overview
          </h2>
          <span className="text-xs text-[#64748B]">Rajasthan Heavy Oil Field • Synthetic Demo Roster</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Wells */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-[#64748B] mb-1">Total Wells</div>
            <div className="text-2xl font-bold text-[#172033] font-mono">{totalWells}</div>
            <div className="text-[11px] text-[#64748B] mt-1 flex items-center space-x-1">
              <span>Monitored Real-time</span>
            </div>
          </div>

          {/* Healthy Wells */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-[#64748B] mb-1 flex items-center justify-between">
              <span>Healthy</span>
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            </div>
            <div className="text-2xl font-bold text-[#16A34A] font-mono">{healthyWells}</div>
            <div className="text-[11px] text-[#64748B] mt-1">Normal operating envelope</div>
          </div>

          {/* Attention Required */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-[#64748B] mb-1 flex items-center justify-between">
              <span>Attention Required</span>
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            </div>
            <div className="text-2xl font-bold text-[#D97706] font-mono">{attentionWells}</div>
            <div className="text-[11px] text-[#64748B] mt-1">Thermal or mechanical watch</div>
          </div>

          {/* Critical Risk */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
            <div className="text-xs font-medium text-[#64748B] mb-1 flex items-center justify-between">
              <span>Critical Risk</span>
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            </div>
            <div className="text-2xl font-bold text-[#DC2626] font-mono">{criticalWells}</div>
            <div className="text-[11px] text-[#DC2626] font-medium mt-1">Action required immediately</div>
          </div>
        </div>
      </div>

      {/* 2. PRIORITY WELL CARD (Highlight BGW-007) */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#DC2626]/10 flex items-center justify-center text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-[#172033] font-mono">
                  {isBGW007 ? 'BGW-007' : activeWell.well_code}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30">
                  Critical
                </span>
                <span className="text-xs text-[#64748B]">Primary Synthetic Jury Demo Well</span>
              </div>
              <p className="text-sm font-medium text-[#DC2626] mt-1">
                High rod-floating risk caused by elevated viscosity and downstroke drag.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigateTab('digital-twin')}
              className="px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#123B5D] border border-[#CBD5E1] rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Layers className="w-4 h-4 text-[#0E9F9A]" />
              <span>View Digital Twin</span>
            </button>
            <button
              onClick={() => onNavigateTab('before-after')}
              className="px-4 py-2 bg-[#0E9F9A] hover:bg-[#0C8984] text-white rounded-md text-xs font-medium shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Optimization</span>
            </button>
          </div>
        </div>

        {/* 4 Important Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {/* Temperature */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3.5">
            <div className="text-xs text-[#64748B] font-medium">Temperature</div>
            <div className="text-2xl font-bold text-[#172033] font-mono mt-1">
              {priorityTemp}
              <span className="text-xs text-[#64748B] ml-1 font-normal font-sans">°C</span>
            </div>
            <div className="text-[11px] text-[#D97706] mt-0.5">Depleted thermal front</div>
          </div>

          {/* Viscosity */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3.5">
            <div className="text-xs text-[#64748B] font-medium">Viscosity</div>
            <div className="text-2xl font-bold text-[#172033] font-mono mt-1">
              {priorityVisc.toLocaleString()}
              <span className="text-xs text-[#64748B] ml-1 font-normal font-sans">cP</span>
            </div>
            <div className="text-[11px] text-[#DC2626] mt-0.5">Extreme viscous resistance</div>
          </div>

          {/* Rod Drag */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3.5">
            <div className="text-xs text-[#64748B] font-medium">Rod Drag</div>
            <div className="text-2xl font-bold text-[#172033] font-mono mt-1">
              {priorityDrag}
              <span className="text-xs text-[#64748B] ml-1 font-normal font-sans">kN</span>
            </div>
            <div className="text-[11px] text-[#DC2626] mt-0.5">Opposes rod descent</div>
          </div>

          {/* Floating Margin */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3.5">
            <div className="text-xs text-[#64748B] font-medium">Floating Margin</div>
            <div className="text-2xl font-bold text-[#DC2626] font-mono mt-1">
              &lt; 2.0
              <span className="text-xs text-[#DC2626] ml-1 font-normal font-sans">
                ({priorityMargin} kN)
              </span>
            </div>
            <div className="text-[11px] text-[#DC2626] font-medium mt-0.5">Below 2.0 kN safety floor</div>
          </div>
        </div>
      </div>

      {/* 3. TWO CLEAN CHARTS (Production Trend & Risk Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trend */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#172033]">Production Trend</h3>
              <p className="text-xs text-[#64748B]">Daily net oil rate (BOPD) over last 14 days</p>
            </div>
            <span className="text-xs font-mono text-[#0E9F9A] font-semibold">
              Current: {isBGW007 ? '31.0' : (twinState?.oil_rate_bopd ?? 31.0)} BOPD
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[20, 70]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="oil"
                  name="Oil Rate (BOPD)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Trend */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#172033]">Mechanical Risk Trajectory</h3>
              <p className="text-xs text-[#64748B]">Floating margin (kN) vs safety threshold (2.0 kN)</p>
            </div>
            <span className="text-xs font-mono text-[#DC2626] font-semibold">
              Margin: {priorityMargin} kN
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 6]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="margin"
                  name="Floating Margin (kN)"
                  stroke="#DC2626"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#DC2626' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. RECENT SYSTEM EVENTS (3-5 important events) */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#172033]">Recent System Events</h3>
            <p className="text-xs text-[#64748B]">Prioritized operational exceptions &amp; model events</p>
          </div>
          <button
            onClick={() => onNavigateTab('audit-trail')}
            className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium flex items-center space-x-1 cursor-pointer"
          >
            <span>View Full Audit Log</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {recentEvents.map((evt) => (
            <div key={evt.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <span
                  className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    evt.severity === 'CRITICAL'
                      ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20'
                      : evt.severity === 'WARNING'
                      ? 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20'
                      : evt.severity === 'HEALTHY'
                      ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                      : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20'
                  }`}
                >
                  {evt.severity}
                </span>
                <div>
                  <div className="text-xs font-semibold text-[#172033] flex items-center space-x-2">
                    <span>{evt.title}</span>
                    <span className="text-[11px] font-mono text-[#64748B]">[{evt.well}]</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">{evt.detail}</p>
                </div>
              </div>
              <span className="text-[11px] text-[#94A3B8] shrink-0 font-mono">{evt.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PROGRESSIVE DISCLOSURE: Detailed Engineering Parameters (Expandable) */}
      <div className="border border-[#E2E8F0] rounded-lg bg-white overflow-hidden shadow-sm">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#172033]">
              Engineering Telemetry &amp; Wellbore Data ({activeWell.well_code})
            </span>
            <span className="text-xs text-[#64748B] font-mono">
              [PPRL, Dynamic Fluid Level, SPM, PIP]
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-[#64748B]">
            <span>{showTechnicalDetails ? 'Collapse' : 'Expand Details'}</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Peak Rod Load (PPRL)</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.pprl_kn ?? 84.5} kN
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Minimum Rod Load (MPRL)</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.mprl_kn ?? 12.3} kN
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Pump Intake Pressure (PIP)</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.pump_intake_pressure_bar ?? 22.4} bar
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Dynamic Fluid Level (DFL)</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.fluid_level_depth_m ?? 820} m
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Pumping Speed (SPM)</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.spm ?? 6.8} SPM
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Stroke Length</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.stroke_in ?? 120} in
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Pump Efficiency</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.pump_efficiency_pct ?? 82}%
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-[#E2E8F0]">
              <div className="text-[#64748B]">Daily Power Consumption</div>
              <div className="text-base font-bold font-mono text-[#172033] mt-1">
                {twinState?.energy_kwh_day ?? 340} kWh/d
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
