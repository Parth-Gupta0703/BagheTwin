import React from 'react';
import { WellSummary } from '../types';
import { ChevronDown, Sparkles, RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';

interface HeaderProps {
  wells: WellSummary[];
  selectedWellCode: string;
  setSelectedWellCode: (code: string) => void;
  onLaunchJuryDemo: () => void;
  onResetDemo?: () => void;
  currentTabTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  wells,
  selectedWellCode,
  setSelectedWellCode,
  onLaunchJuryDemo,
  onResetDemo,
  currentTabTitle = 'Home',
}) => {
  const { locale, setLocale, t } = useI18n();
  const { mode, setMode } = useMode();
  const selectedWell = wells.find((w) => w.well_code === selectedWellCode);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between select-none z-30 sticky top-0 shrink-0 shadow-sm">
      {/* LEFT: Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 font-medium">BagheTwin</span>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-semibold text-slate-800 tracking-tight m-0">
            {currentTabTitle}
          </h1>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Well Selector */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Well:
          </span>
          <div className="relative">
            <select
              value={selectedWellCode}
              onChange={(e) => setSelectedWellCode(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-mono text-xs font-semibold px-2.5 py-1 pr-6 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 cursor-pointer hover:bg-white transition-colors"
            >
              {wells.map((w) => (
                <option key={w.well_code} value={w.well_code}>
                  {w.well_code} {w.overall_risk_tier === 'CRITICAL' ? '● CRITICAL' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 top-2 pointer-events-none" />
          </div>
          {selectedWell && selectedWell.overall_risk_tier === 'CRITICAL' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
              {t.status.critical}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-2">
        {/* Mode Toggle */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            onClick={() => setMode('operator')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === 'operator'
                ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.mode.operator}
          </button>
          <button
            onClick={() => setMode('engineer')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === 'engineer'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.mode.engineer}
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            onClick={() => setLocale('en')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              locale === 'en'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLocale('hi')}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              locale === 'hi'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Synthetic Badge */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{t.demo.demoSynthetic}</span>
        </div>

        {/* Reset */}
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors cursor-pointer"
            title={t.actions.reset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.actions.reset}</span>
          </button>
        )}

        {/* Guided Demo CTA */}
        <button
          onClick={onLaunchJuryDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.demo.startDemo}</span>
        </button>
      </div>
    </header>
  );
};
