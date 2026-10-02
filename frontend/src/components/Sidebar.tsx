import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Layers,
  Flame,
  Wrench,
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  GitCompare,
  Radio,
  History,
  FileCheck2,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'well-explorer', label: 'Well Explorer', icon: Compass },
    { id: 'digital-twin', label: 'Digital Twin', icon: Layers },
    { id: 'css-optimizer', label: 'CSS Optimizer', icon: Flame },
    { id: 'srp-optimizer', label: 'SRP Optimizer', icon: Wrench },
    { id: 'scenario-lab', label: 'Scenario Lab', icon: FlaskConical },
    { id: 'risk-reliability', label: 'Risk & Reliability', icon: AlertTriangle },
    { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
    { id: 'before-after', label: 'Before vs After', icon: GitCompare, badge: 'OPTIMIZE' },
    { id: 'live-ops', label: 'Live Operations', icon: Radio },
    { id: 'audit-trail', label: 'Audit Trail', icon: History },
    { id: 'provenance', label: 'Model & Data Provenance', icon: FileCheck2 },
  ];

  return (
    <aside className="w-60 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 select-none overflow-y-auto z-20">
      {/* Brand & Logo Header */}
      <div className="h-14 px-5 border-b border-[#E2E8F0] flex items-center space-x-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#123B5D] flex items-center justify-center text-white shadow-sm">
          <Layers className="w-4 h-4 text-[#0E9F9A]" />
        </div>
        <div>
          <div className="text-sm font-bold text-[#123B5D] tracking-tight">
            BagheTwin
          </div>
          <div className="text-[10px] text-[#64748B] font-medium tracking-wide uppercase">
            Heavy Oil Digital Twin
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors cursor-pointer text-xs font-medium ${
                isActive
                  ? 'bg-[#F0FDFA] text-[#0E9F9A] font-semibold border-l-3 border-[#0E9F9A]'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#0E9F9A]' : 'text-[#64748B]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0E9F9A]/10 text-[#0E9F9A] font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Sidebar: Demo Mode & System Status */}
      <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B] flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Mode:</span>
          </span>
          <span className="font-medium text-[#172033] bg-white px-2 py-0.5 rounded border border-[#E2E8F0] text-[10px]">
            Demo Simulation
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B]">System Status:</span>
          <span className="inline-flex items-center space-x-1 text-[#16A34A] font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span>Operational</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
