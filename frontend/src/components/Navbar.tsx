import React from 'react';
import {
  Activity,
  Layers,
  Flame,
  Zap,
  Clock,
  ShieldAlert,
  TrendingUp,
  GitCompare,
  Radio,
  FileText,
  Info,
  PlayCircle
} from 'lucide-react';
import { WellSummary } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  wells: WellSummary[];
  selectedWellCode: string;
  setSelectedWellCode: (code: string) => void;
  onLaunchJuryDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  wells,
  selectedWellCode,
  setSelectedWellCode,
  onLaunchJuryDemo
}) => {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: Activity },
    { id: 'well-explorer', label: 'Well Explorer', icon: Layers },
    { id: 'digital-twin', label: 'Digital Twin', icon: Layers },
    { id: 'css-optimizer', label: 'CSS Optimizer', icon: Flame },
    { id: 'srp-optimizer', label: 'SRP Optimizer', icon: Zap },
    { id: 'scenario-lab', label: 'Scenario Lab', icon: Clock },
    { id: 'risk-reliability', label: 'Risk & Safety', icon: ShieldAlert },
    { id: 'forecasts', label: 'Forecasts & ML', icon: TrendingUp },
    { id: 'before-after', label: 'Before vs After', icon: GitCompare },
    { id: 'live-ops', label: 'Live Operations', icon: Radio },
    { id: 'audit-trail', label: 'Audit Trail', icon: FileText },
    { id: 'provenance', label: 'Data & Model Basis', icon: Info },
  ];

  return (
    <header className="border-b border-industrial-border bg-industrial-card/95 backdrop-blur sticky top-0 z-50">
      {/* Top Banner and System Status */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-industrial-border/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-amber-500/20">
            BT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-white text-base">
                BAGHETWIN
              </span>
              <span className="text-xs text-industrial-muted uppercase font-mono tracking-widest">
                | WELL-TO-SURFACE DIGITAL TWIN
              </span>
            </div>
            <p className="text-[11px] text-industrial-muted">
              OIL Rajasthan • Baghewala Heavy Oil Jodhpur Sandstone • SIH26120
            </p>
          </div>
        </div>

        {/* Global Compliance & Status Badges */}
        <div className="flex items-center space-x-3">
          {/* Well Selector */}
          <div className="flex items-center space-x-2 bg-industrial-bg px-3 py-1.5 rounded-md border border-industrial-border">
            <span className="text-xs text-industrial-muted font-mono">ACTIVE WELL:</span>
            <select
              value={selectedWellCode}
              onChange={(e) => setSelectedWellCode(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              {wells.map((w) => (
                <option key={w.well_code} value={w.well_code} className="bg-industrial-panel text-white">
                  {w.well_code} ({w.name.split('(')[0].trim()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TWIN ONLINE</span>
          </div>

          <div className="bg-blue-950/60 border border-blue-500/40 text-blue-300 px-2.5 py-1 rounded text-xs font-mono font-medium">
            SIMULATION MODE
          </div>

          <div className="bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded text-xs font-mono font-medium">
            DATA: SYNTHETIC / DEMO
          </div>

          {/* JURY DEMO BUTTON */}
          <button
            onClick={onLaunchJuryDemo}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-3.5 py-1.5 rounded-md text-xs shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-black fill-black/20" />
            <span>JURY DEMO (5 MIN)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="px-6 flex space-x-1 overflow-x-auto py-1.5 text-xs font-medium no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-industrial-panel text-white border border-industrial-border font-semibold shadow-sm'
                  : 'text-industrial-muted hover:text-white hover:bg-industrial-hover/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-industrial-muted'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
