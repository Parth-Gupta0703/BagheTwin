import React from 'react';

interface WellGraphicProps {
  temperatureC: number;
  viscosityCp: number;
  floatingMarginKn: number;
  spm: number;
  fluidLevelM: number;
  isCritical: boolean;
}

export const WellGraphic: React.FC<WellGraphicProps> = ({
  temperatureC,
  viscosityCp,
  floatingMarginKn,
  spm,
  fluidLevelM,
  isCritical,
}) => {
  // Thermal intensity for reservoir halo: hotter = orange/red, cold = dark slate
  const isCold = temperatureC < 55;
  const haloColor = isCold ? '#94A3B8' : temperatureC > 100 ? '#F97316' : '#EAB308';

  return (
    <div className="w-full h-full min-h-[380px] bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-between relative overflow-hidden select-none">
      {/* Background Geological Depth Bands */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="h-[22%] border-b border-dashed border-slate-300 bg-amber-50/30" />
        <div className="h-[28%] border-b border-dashed border-slate-300 bg-slate-100/40" />
        <div className="h-[30%] border-b border-dashed border-slate-300 bg-stone-100/40" />
        <div className="h-[20%] bg-amber-100/30" />
      </div>

      {/* Depth Markers on Left */}
      <div className="absolute left-3 top-10 bottom-8 flex flex-col justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
        <span>0m (Surface)</span>
        <span>400m (Overburden)</span>
        <span>{fluidLevelM}m (Fluid Level)</span>
        <span>1,050m (Pump)</span>
        <span>1,240m (Reservoir)</span>
      </div>

      {/* Main SVG Schematic */}
      <svg
        viewBox="0 0 320 380"
        className="w-full h-full max-h-[360px] z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Steam/Thermal Halo */}
          <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={haloColor} stopOpacity="0.5" />
            <stop offset="60%" stopColor={haloColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={haloColor} stopOpacity="0" />
          </radialGradient>

          {/* Fluid Flow Dash Pattern */}
          <linearGradient id="fluidGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#123B5D" />
            <stop offset="100%" stopColor="#0E9F9A" />
          </linearGradient>
        </defs>

        {/* 1. SURFACE PUMPING JACK (SRP) */}
        <g id="surface-pumping-unit" transform="translate(110, 8)">
          {/* Base Stand */}
          <polygon points="30,42 45,15 55,15 70,42" fill="#334155" />
          <line x1="30" y1="42" x2="70" y2="42" stroke="#1E293B" strokeWidth="2.5" />

          {/* Walking Beam */}
          <line x1="20" y1="14" x2="85" y2="10" stroke="#0E9F9A" strokeWidth="4" strokeLinecap="round" />

          {/* Horsehead Curved Arc */}
          <path d="M 85,10 Q 94,18 92,30" fill="none" stroke="#0E9F9A" strokeWidth="4" />

          {/* Bridle wire going down to polished rod */}
          <line x1="92" y1="30" x2="92" y2="48" stroke="#64748B" strokeWidth="1.5" />
        </g>

        {/* 2. WELLHEAD & CASING */}
        <g id="wellhead" transform="translate(160, 48)">
          {/* Wellhead flange */}
          <rect x="34" y="0" width="16" height="8" fill="#475569" rx="1" />
          <rect x="30" y="8" width="24" height="6" fill="#334155" rx="1" />

          {/* Surface Casing (Outer Tube) */}
          <rect x="32" y="14" width="20" height="280" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Production Tubing (Inner) */}
          <rect x="37" y="14" width="10" height="260" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />

          {/* Sucker Rod String (Central Reciprocating Line) */}
          <line
            x1="42"
            y1="0"
            x2="42"
            y2="245"
            stroke={isCritical ? '#DC2626' : '#2563EB'}
            strokeWidth="2.5"
            strokeDasharray={isCritical ? '4 2' : 'none'}
          />

          {/* Downhole SRP Pump Barrel & Plunger */}
          <rect x="35" y="240" width="14" height="25" fill="#1E293B" rx="1.5" />
          <circle cx="42" cy="252" r="3" fill="#0E9F9A" />

          {/* Slotted Liner / Perforations */}
          <g stroke="#64748B" strokeWidth="1">
            <line x1="30" y1="272" x2="35" y2="272" />
            <line x1="49" y1="272" x2="54" y2="272" />
            <line x1="30" y1="280" x2="35" y2="280" />
            <line x1="49" y1="280" x2="54" y2="280" />
            <line x1="30" y1="288" x2="35" y2="288" />
            <line x1="49" y1="288" x2="54" y2="288" />
          </g>

          {/* Thermal Halo around Reservoir Zone */}
          <ellipse cx="42" cy="285" rx="55" ry="32" fill="url(#haloGrad)" />

          {/* Reservoir Perforations Oil Inflow Arrows */}
          <path d="M 15,285 Q 28,285 34,285" stroke="#D97706" strokeWidth="1.8" fill="none" markerEnd="url(#arrow)" />
          <path d="M 69,285 Q 56,285 50,285" stroke="#D97706" strokeWidth="1.8" fill="none" />
        </g>

        {/* 3. CALLOUT LABELS ON THE RIGHT */}
        <g id="callouts" transform="translate(230, 75)" className="text-[10px] font-sans">
          {/* Surface SRP */}
          <line x1="-28" y1="-15" x2="0" y2="-15" stroke="#CBD5E1" strokeWidth="1" />
          <text x="5" y="-12" fill="#172033" fontWeight="600">Surface Pumping Unit</text>
          <text x="5" y="-1" fill="#64748B">{spm.toFixed(1)} SPM</text>

          {/* Rod String Callout */}
          <line x1="-28" y1="80" x2="0" y2="80" stroke={isCritical ? '#DC2626' : '#CBD5E1'} strokeWidth="1" />
          <text x="5" y="83" fill={isCritical ? '#DC2626' : '#172033'} fontWeight="600">
            {isCritical ? 'High Rod Drag' : 'Rod String'}
          </text>
          <text x="5" y="94" fill="#64748B">
            Margin: {floatingMarginKn.toFixed(2)} kN
          </text>

          {/* Downhole Pump */}
          <line x1="-24" y1="215" x2="0" y2="215" stroke="#CBD5E1" strokeWidth="1" />
          <text x="5" y="218" fill="#172033" fontWeight="600">SRP Downhole Pump</text>
          <text x="5" y="229" fill="#64748B">Depth ~1,050m</text>

          {/* Reservoir / Thermal Zone */}
          <line x1="-24" y1="255" x2="0" y2="255" stroke="#CBD5E1" strokeWidth="1" />
          <text x="5" y="258" fill="#172033" fontWeight="600">Near-Wellbore Zone</text>
          <text x="5" y="269" fill={isCold ? '#D97706' : '#0E9F9A'}>
            {temperatureC.toFixed(1)}°C • {viscosityCp.toLocaleString()} cP
          </text>
        </g>
      </svg>

      {/* Bottom Summary Pill */}
      <div className="w-full bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs font-medium z-10">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Wellbore Dynamics Linked</span>
        </div>
        <div className="font-mono text-slate-500 text-[11px]">
          {isCold ? 'Thermal Depletion Detected' : 'Thermal Regime Stable'}
        </div>
      </div>
    </div>
  );
};
