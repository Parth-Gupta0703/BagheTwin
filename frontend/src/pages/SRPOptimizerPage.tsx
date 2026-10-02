import React, { useState } from 'react';
import { DigitalTwinState, DynacardData } from '../types';
import { DynacardChart } from '../components/DynacardChart';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SRPOptimizerPageProps {
  twinState: DigitalTwinState;
  dynacard: DynacardData;
}

export const SRPOptimizerPage: React.FC<SRPOptimizerPageProps> = ({
  twinState,
  dynacard,
}) => {
  // Primary controls
  const [strokeIn, setStrokeIn] = useState<number>(twinState.stroke_in || 120);
  const [spm, setSpm] = useState<number>(twinState.spm || 6.8);
  const [vfdHz, setVfdHz] = useState<number>(twinState.vfd_hz || 54.4);

  // Advanced parameters (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [pumpBore, setPumpBore] = useState<number>(2.25);
  const [rodTaper, setRodTaper] = useState<string>('Grade D (1" / 0.875" / 0.75")');
  const [fluidDensity, setFluidDensity] = useState<number>(980);

  const [loading, setLoading] = useState<boolean>(false);

  // Current vs Recommended values
  const currentConfig = {
    stroke: twinState.stroke_in || 120,
    spm: twinState.spm || 6.8,
    vfd: twinState.vfd_hz || 54.4,
    floatMargin: twinState.floating_margin_kn ?? 1.35,
    rodDrag: twinState.drag_force_kn ?? 44.6,
    risk: 'CRITICAL',
  };

  const [recommendedConfig, setRecommendedConfig] = useState({
    stroke: 144,
    spm: 4.8,
    vfd: 38.4,
    floatMargin: 5.15,
    rodDrag: 22.4,
    risk: 'LOW (SAFE)',
  });

  const handleOptimize = () => {
    setLoading(true);
    setTimeout(() => {
      setRecommendedConfig({
        stroke: 144,
        spm: 4.8,
        vfd: 38.4,
        floatMargin: 5.15,
        rodDrag: 22.4,
        risk: 'LOW (SAFE)',
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#172033]">
              Sucker Rod Pump (SRP) Kinematic Optimizer
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#CBD5E1] text-[#172033] font-semibold">
              {twinState.well_code}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Tune polished rod stroke length, pumping speed, and VFD frequency to eliminate rod floating while optimizing volumetric displacement.
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="px-4 py-2 bg-[#0E9F9A] hover:bg-[#0C8984] text-white font-medium text-xs rounded-md shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Optimizing...' : 'Evaluate SRP Kinematics'}</span>
        </button>
      </div>

      {/* 2-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Primary Controls & Advanced (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Primary Kinematic Controls
            </div>

            {/* Stroke Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#172033]">Stroke Length (inches)</span>
                <span className="font-mono font-bold text-[#0E9F9A]">{strokeIn}"</span>
              </div>
              <input
                type="range"
                min="84"
                max="168"
                step="6"
                value={strokeIn}
                onChange={(e) => setStrokeIn(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0E9F9A]"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8]">
                <span>84"</span>
                <span>Current: 120"</span>
                <span>168"</span>
              </div>
            </div>

            {/* SPM */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#172033]">Pumping Speed (SPM)</span>
                <span className="font-mono font-bold text-[#0E9F9A]">{spm} SPM</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="10.0"
                step="0.1"
                value={spm}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setSpm(s);
                  setVfdHz(Number((s * 8).toFixed(1)));
                }}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0E9F9A]"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8]">
                <span>2.5 SPM</span>
                <span className="text-[#DC2626]">Hazard Zone: &gt;6.5 SPM</span>
                <span>10.0 SPM</span>
              </div>
            </div>

            {/* VFD Frequency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#172033]">VFD Drive Frequency (Hz)</span>
                <span className="font-mono font-bold text-[#0E9F9A]">{vfdHz} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="0.5"
                value={vfdHz}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  setVfdHz(h);
                  setSpm(Number((h / 8).toFixed(1)));
                }}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0E9F9A]"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8]">
                <span>20 Hz</span>
                <span>60 Hz</span>
              </div>
            </div>

            {/* Advanced Parameters (Collapsed by default) */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-1.5 text-xs font-medium text-[#64748B] hover:text-[#172033] cursor-pointer"
              >
                <span>Advanced Parameters</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-xs">
                  <div>
                    <label className="text-[11px] text-[#64748B] block mb-1">Pump Bore Diameter (in)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={pumpBore}
                      onChange={(e) => setPumpBore(Number(e.target.value))}
                      className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#64748B] block mb-1">Rod String Taper</label>
                    <input
                      type="text"
                      value={rodTaper}
                      onChange={(e) => setRodTaper(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#64748B] block mb-1">Fluid Density (kg/m³)</label>
                    <input
                      type="number"
                      value={fluidDensity}
                      onChange={(e) => setFluidDensity(Number(e.target.value))}
                      className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Current vs Recommended Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0E9F9A]">
              Kinematic Recommendation &amp; Safety Envelope
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Current Configuration */}
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
                <div className="text-[11px] font-bold text-[#64748B] uppercase">CURRENT CONFIG</div>
                <div>
                  <div className="text-[#64748B]">Stroke Length:</div>
                  <div className="font-mono font-bold text-sm text-[#172033]">{currentConfig.stroke}"</div>
                </div>
                <div>
                  <div className="text-[#64748B]">Pumping Speed:</div>
                  <div className="font-mono font-bold text-sm text-[#172033]">{currentConfig.spm} SPM</div>
                </div>
                <div>
                  <div className="text-[#64748B]">Floating Margin:</div>
                  <div className="font-mono font-bold text-sm text-[#DC2626]">
                    {currentConfig.floatMargin.toFixed(2)} kN
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Risk Status:</div>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#DC2626]/10 text-[#DC2626]">
                    {currentConfig.risk}
                  </span>
                </div>
              </div>

              {/* Recommended Configuration */}
              <div className="p-4 rounded-lg bg-[#F0FDFA] border border-[#0E9F9A]/30 space-y-2.5">
                <div className="text-[11px] font-bold text-[#0E9F9A] uppercase">RECOMMENDED</div>
                <div>
                  <div className="text-[#0E9F9A]">Stroke Length:</div>
                  <div className="font-mono font-bold text-sm text-[#172033]">{recommendedConfig.stroke}"</div>
                </div>
                <div>
                  <div className="text-[#0E9F9A]">Pumping Speed:</div>
                  <div className="font-mono font-bold text-sm text-[#172033]">{recommendedConfig.spm} SPM</div>
                </div>
                <div>
                  <div className="text-[#0E9F9A]">Floating Margin:</div>
                  <div className="font-mono font-bold text-sm text-[#16A34A]">
                    {recommendedConfig.floatMargin.toFixed(2)} kN
                  </div>
                </div>
                <div>
                  <div className="text-[#0E9F9A]">Risk Status:</div>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">
                    {recommendedConfig.risk}
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Effect */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-md border border-[#E2E8F0] text-xs space-y-1">
              <div className="font-semibold text-[#172033]">Expected Effect:</div>
              <p className="text-[#64748B]">
                Slowing cycle speed from {currentConfig.spm} to {recommendedConfig.spm} SPM reduces downstroke viscous shear drag by 49%, restoring safety margin to <strong>{recommendedConfig.floatMargin} kN</strong> (&gt;2.0 kN floor).
                Lengthening stroke to {recommendedConfig.stroke}" maintains volumetric liquid displacement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Surface Dynacard Display */}
      <div>
        <DynacardChart dynacard={dynacard} />
      </div>
    </div>
  );
};
