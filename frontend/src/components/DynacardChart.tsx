import React from 'react';
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
import { DynacardData } from '../types';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface DynacardChartProps {
  dynacard: DynacardData;
}

export const DynacardChart: React.FC<DynacardChartProps> = ({ dynacard }) => {
  const isHighDrag = dynacard.condition === 'HIGH_DRAG_ROD_FLOAT';

  // Format data for Recharts: map card points
  const chartData = dynacard.card_points.map((p, idx) => ({
    position_in: p.position_in,
    load_kn: p.load_kn,
    phase: p.phase,
    baseline_load: dynacard.baseline_points?.[idx]?.load_kn ?? null,
  }));

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-[#172033] tracking-wide">
              Surface Dynamometer Card (Dynacard)
            </h3>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                isHighDrag
                  ? 'bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626]'
                  : 'bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A]'
              }`}
            >
              {dynacard.condition.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Polished rod load (kN) vs stroke position (in) over one full pumping stroke.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div>
            <span className="text-[#64748B]">PPRL: </span>
            <span className="text-[#172033] font-bold">{dynacard.pprl_kn} kN</span>
          </div>
          <div>
            <span className="text-[#64748B]">MPRL: </span>
            <span className="text-[#172033] font-bold">{dynacard.mprl_kn} kN</span>
          </div>
          <div>
            <span className="text-[#64748B]">Stroke: </span>
            <span className="text-[#172033] font-bold">{dynacard.stroke_in}"</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="position_in"
              stroke="#94A3B8"
              label={{ value: 'Stroke Position (inches)', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <YAxis
              stroke="#94A3B8"
              label={{ value: 'Rod Load (kN)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }}
              tick={{ fontSize: 11, fill: '#64748B' }}
              domain={[0, 110]}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="load_kn"
              name="Active Card Load (kN)"
              stroke={isHighDrag ? '#DC2626' : '#0E9F9A'}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            {dynacard.baseline_points && (
              <Line
                type="monotone"
                dataKey="baseline_load"
                name="Baseline Ideal Card"
                stroke="#94A3B8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Diagnostic Callout */}
      <div
        className={`mt-4 p-3 rounded-md flex items-start space-x-3 text-xs ${
          isHighDrag
            ? 'bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626]'
            : 'bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A]'
        }`}
      >
        {isHighDrag ? (
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
        )}
        <div>
          <div className="font-semibold">
            {isHighDrag ? 'Severe Rod Floating Hazard' : 'Card Healthy • Standard Valve Action'}
          </div>
          <p className="text-[#64748B] text-[11px] mt-0.5">
            {dynacard.diagnostics?.features_detected ||
              'Annular viscous drag decreases minimum polished rod load toward zero on the downstroke.'}
          </p>
        </div>
      </div>
    </div>
  );
};
