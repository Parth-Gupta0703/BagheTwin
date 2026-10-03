import React, { useState } from 'react';
import { WellSummary } from '../types';
import { Search, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n';
import { useMode } from '../contexts/ModeContext';
import { StatusBadge, StatusDot } from '../components/StatusBadge';
import { WellCard } from '../components/WellCard';
import { getMarginColorClass } from '../services/safetyThresholds';

interface WellExplorerProps {
  wells: WellSummary[];
  selectedWellCode: string;
  onSelectWell: (code: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const WellExplorer: React.FC<WellExplorerProps> = ({
  wells,
  selectedWellCode,
  onSelectWell,
  onNavigateTab,
}) => {
  const { t } = useI18n();
  const { isOperator, isEngineer } = useMode();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredWells = wells.filter((w) => {
    const matchesSearch =
      w.well_code.toLowerCase().includes(search.toLowerCase()) ||
      w.name.toLowerCase().includes(search.toLowerCase());
    const matchesRisk =
      riskFilter === 'ALL' ||
      (riskFilter === 'CRITICAL' && w.overall_risk_tier === 'CRITICAL') ||
      (riskFilter === 'ATTENTION' && (w.overall_risk_tier === 'HIGH' || w.overall_risk_tier === 'MEDIUM')) ||
      (riskFilter === 'NORMAL' && w.overall_risk_tier === 'LOW');
    return matchesSearch && matchesRisk;
  });

  const handleSelectWell = (code: string) => {
    onSelectWell(code);
    onNavigateTab('digital-twin');
  };

  // Filter buttons
  const filters = [
    { id: 'ALL', label: t.wells.filterAll },
    { id: 'CRITICAL', label: t.wells.filterCritical },
    { id: 'ATTENTION', label: t.wells.filterAttention },
    { id: 'NORMAL', label: t.wells.filterNormal },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t.wells.title}</h2>
        <p className="text-sm text-slate-500 mt-1">{t.wells.subtitle}</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.wells.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setRiskFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-all ${
                riskFilter === f.id
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operator Mode: Card Grid */}
      {isOperator && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWells.map((w) => (
            <WellCard
              key={w.well_code}
              well={w}
              isSelected={w.well_code === selectedWellCode}
              onClick={() => handleSelectWell(w.well_code)}
            />
          ))}
        </div>
      )}

      {/* Engineer Mode: Full Table */}
      {isEngineer && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Well ID</th>
                  <th className="py-3 px-4">{t.wells.risk}</th>
                  <th className="py-3 px-4 text-right">{t.wells.temperature}</th>
                  <th className="py-3 px-4 text-right">{t.wells.viscosity}</th>
                  <th className="py-3 px-4 text-right">{t.wells.production}</th>
                  <th className="py-3 px-4 text-right">{t.wells.floatingMargin}</th>
                  <th className="py-3 px-4 text-right">{t.wells.srpSpeed}</th>
                  <th className="py-3 px-4 text-center">{t.actions.viewDetails}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWells.map((w) => {
                  const isSelected = w.well_code === selectedWellCode;
                  return (
                    <tr
                      key={w.well_code}
                      onClick={() => handleSelectWell(w.well_code)}
                      className={`transition-colors cursor-pointer hover:bg-slate-50 ${
                        isSelected ? 'bg-teal-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <StatusDot tier={w.overall_risk_tier} />
                          <span>{w.well_code}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge tier={w.overall_risk_tier} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {w.temperature_c.toFixed(1)}°C
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {w.viscosity_cp.toLocaleString()} cP
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        {w.oil_rate_bopd.toFixed(1)} BOPD
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-semibold ${getMarginColorClass(w.floating_margin_kn)}`}>
                          {w.floating_margin_kn.toFixed(1)} kN
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {w.spm} SPM
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectWell(w.well_code);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          <span>{t.actions.viewDetails}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredWells.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-500">{t.empty.noData}</p>
        </div>
      )}
    </div>
  );
};
