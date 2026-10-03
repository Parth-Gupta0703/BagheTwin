import React, { useState } from 'react';
import {
  Home,
  Droplets,
  Lightbulb,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  Wrench,
  AlertTriangle,
  TrendingUp,
  FlaskConical,
  Radio,
  FileCheck2,
  Cpu,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { t } = useI18n();
  const { isEngineer } = useMode();
  const [moreOpen, setMoreOpen] = useState(false);

  // Primary navigation — always visible
  const primaryNav = [
    { id: 'command-center', label: t.nav.home, icon: Home },
    { id: 'well-explorer', label: t.nav.wells, icon: Droplets },
    { id: 'recommendations', label: t.nav.recommendations, icon: Lightbulb },
    { id: 'before-after', label: t.nav.simulate, icon: Play },
    { id: 'audit-trail', label: t.nav.history, icon: Clock },
  ];

  // "More" items — advanced/engineer sections
  const moreNav = [
    { id: 'digital-twin', label: t.nav.digitalTwin, icon: Layers },
    { id: 'css-optimizer', label: t.nav.cssOptimizer, icon: Flame },
    { id: 'srp-optimizer', label: t.nav.srpOptimizer, icon: Wrench },
    { id: 'risk-reliability', label: t.nav.riskReliability, icon: AlertTriangle },
    { id: 'forecasts', label: t.nav.forecasts, icon: TrendingUp },
    { id: 'scenario-lab', label: t.nav.scenarioLab, icon: FlaskConical },
    { id: 'live-ops', label: t.nav.liveOperations, icon: Radio },
    { id: 'provenance', label: t.nav.provenance, icon: FileCheck2 },
  ];

  // Auto-expand "More" if current tab is in the more section
  const isMoreTabActive = moreNav.some((item) => item.id === currentTab);
  const showMore = moreOpen || isMoreTabActive;

  const renderNavItem = (item: { id: string; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setCurrentTab(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer text-[13px] font-medium ${
          isActive
            ? 'bg-teal-50 text-teal-700 font-semibold border-l-[3px] border-teal-500'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
        }`}
      >
        <Icon
          className={`w-[18px] h-[18px] shrink-0 ${
            isActive ? 'text-teal-600' : 'text-slate-400'
          }`}
        />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none overflow-y-auto z-20">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-slate-200 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#123B5D] flex items-center justify-center shadow-sm">
          <Layers className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-[#123B5D] tracking-tight">BagheTwin</div>
          <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
            {t.appSubtitle}
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="p-3 space-y-0.5 flex-1">
        {primaryNav.map(renderNavItem)}

        {/* More Section */}
        <div className="pt-3 mt-3 border-t border-slate-100">
          <button
            onClick={() => setMoreOpen(!showMore)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <span>{t.nav.more}</span>
            {showMore ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showMore && (
            <div className="space-y-0.5 mt-1">
              {moreNav.map(renderNavItem)}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom: Mode & System Status */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>{isEngineer ? t.mode.engineer : t.mode.operator}</span>
          </span>
          <span className="font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
            {t.demo.demoSynthetic}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">System:</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Operational</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
