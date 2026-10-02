import React from 'react';
import { WellSummary } from '../types';
import { ChevronDown, Sparkles, RotateCcw, Activity } from 'lucide-react';

interface HeaderProps {
  wells: WellSummary[];
  selectedWellCode: string;
  setSelectedWellCode: (code: string) => void;
  onLaunchJuryDemo: () => void;
  onResetDemo?: () => void;
  currentTabTitle?: string;
  isStreaming?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wells,
  selectedWellCode,
  setSelectedWellCode,
  onLaunchJuryDemo,
  onResetDemo,
  currentTabTitle = 'Command Center',
  isStreaming = true,
}) => {
  const selectedWell = wells.find((w) => w.well_code === selectedWellCode);

  return (
    <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between select-none z-30 sticky top-0 shrink-0 shadow-sm">
      {/* LEFT GROUP: Breadcrumb & Current View */}
      <div className="flex items-center space-x-4">
        {/* Breadcrumb / Title */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-[#64748B] font-medium">BagheTwin</span>
          <span className="text-[#CBD5E1]">/</span>
          <h1 className="text-base font-semibold text-[#172033] tracking-tight m-0">
            {currentTabTitle}
          </h1>
        </div>

        <div className="h-4 w-px bg-[#E2E8F0]" />

        {/* Selected Well Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Well:
          </span>
          <div className="relative inline-block">
            <select
              value={selectedWellCode}
              onChange={(e) => setSelectedWellCode(e.target.value)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] font-mono text-xs font-semibold px-2.5 py-1 pr-6 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[#0E9F9A] focus:border-[#0E9F9A] cursor-pointer hover:bg-white transition-colors"
            >
              {wells.map((w) => (
                <option key={w.well_code} value={w.well_code}>
                  {w.well_code} {w.status === 'CRITICAL' ? '● CRITICAL' : `(${w.status})`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-1.5 top-2 pointer-events-none" />
          </div>
          {selectedWell && selectedWell.overall_risk_tier === 'CRITICAL' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20">
              Needs Immediate Attention
            </span>
          )}
        </div>
      </div>

      {/* CENTER GROUP: Clean System Status Indicator */}
      <div className="hidden lg:flex items-center space-x-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-full text-xs">
        <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-[#0E9F9A]' : 'bg-[#DC2626]'}`} />
        <span className="text-[#172033] font-medium">Digital Twin Live</span>
        <span className="text-[#64748B] text-[11px] font-mono">1.5 Hz Coupled</span>
      </div>

      {/* RIGHT GROUP: Synthetic Data Badge & Actions */}
      <div className="flex items-center space-x-3">
        {/* Subtle Synthetic Badge */}
        <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[11px] font-medium text-[#64748B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          <span>DEMO • SYNTHETIC DATA</span>
        </div>

        {onResetDemo && (
          <button
            onClick={onResetDemo}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0] rounded-md text-xs font-medium transition-colors cursor-pointer"
            title="Reset demonstration state to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset State</span>
          </button>
        )}

        <button
          onClick={onLaunchJuryDemo}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E9F9A] hover:bg-[#0C8984] text-white font-medium text-xs rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Jury Demo</span>
        </button>
      </div>
    </header>
  );
};
