import React, { useState } from 'react';
import { WellSummary } from '../types';
import { Search, Filter, ArrowRight, Layers } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredWells = wells.filter((w) => {
    const matchesSearch =
      w.well_code.toLowerCase().includes(search.toLowerCase()) ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.archetype.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || w.overall_risk_tier === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleSelectWell = (code: string) => {
    onSelectWell(code);
    onNavigateTab('digital-twin');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Header and Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#172033]">Fleet Well Explorer</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Operational status and physical parameters across all 12 Rajasthan heavy oil demonstration wells.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search well..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] pl-8 pr-3 py-1.5 text-xs text-[#172033] placeholder-[#94A3B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E9F9A] focus:border-[#0E9F9A] w-48 font-mono"
            />
          </div>

          {/* Risk Filter */}
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-[#CBD5E1] px-2.5 py-1.5 rounded-md text-xs font-medium text-[#172033]">
            <Filter className="w-3 h-3 text-[#64748B]" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-[#172033] focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">Attention Required</option>
              <option value="LOW">Healthy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: Clean, exactly the 6 columns requested */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Well ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Temperature</th>
                <th className="py-3 px-4 text-right">Viscosity</th>
                <th className="py-3 px-4 text-right">Production</th>
                <th className="py-3 px-4 text-center">SRP Risk</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredWells.map((w) => {
                const isSelected = w.well_code === selectedWellCode;
                const isCritical = w.overall_risk_tier === 'CRITICAL';
                const isAttention = w.overall_risk_tier === 'HIGH' || w.overall_risk_tier === 'MEDIUM';

                return (
                  <tr
                    key={w.well_code}
                    onClick={() => handleSelectWell(w.well_code)}
                    className={`transition-colors cursor-pointer hover:bg-[#F8FAFC] ${
                      isSelected ? 'bg-[#F0FDFA]' : ''
                    }`}
                  >
                    {/* Well ID */}
                    <td className="py-3 px-4 font-mono font-bold text-[#172033]">
                      <div className="flex items-center space-x-2">
                        <span>{w.well_code}</span>
                        {isSelected && (
                          <span className="text-[10px] font-sans font-medium text-[#0E9F9A] bg-[#0E9F9A]/10 px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 font-medium">
                      {isCritical ? (
                        <span className="inline-flex items-center space-x-1.5 text-[#DC2626] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                          <span>Critical</span>
                        </span>
                      ) : isAttention ? (
                        <span className="inline-flex items-center space-x-1.5 text-[#D97706] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                          <span>Attention</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 text-[#16A34A] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                          <span>Healthy</span>
                        </span>
                      )}
                    </td>

                    {/* Temperature */}
                    <td className="py-3 px-4 text-right font-mono text-[#172033]">
                      {w.temperature_c.toFixed(1)}°C
                    </td>

                    {/* Viscosity */}
                    <td className="py-3 px-4 text-right font-mono text-[#172033]">
                      {w.viscosity_cp.toLocaleString()} cP
                    </td>

                    {/* Production */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#172033]">
                      {w.oil_rate_bopd.toFixed(1)} BOPD
                    </td>

                    {/* SRP Risk */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          w.floating_margin_kn < 2.0
                            ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20'
                            : w.floating_margin_kn < 3.0
                            ? 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20'
                            : 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                        }`}
                      >
                        {w.floating_margin_kn < 2.0 ? 'Float Hazard' : `${w.floating_margin_kn.toFixed(1)} kN`}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectWell(w.well_code);
                        }}
                        className="inline-flex items-center space-x-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer"
                      >
                        <span>View Twin</span>
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
    </div>
  );
};
