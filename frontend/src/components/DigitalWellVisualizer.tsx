import React from 'react';
import { DigitalTwinState } from '../types';

interface DigitalWellVisualizerProps {
  twinState: DigitalTwinState;
  onSelectNode?: (nodeId: string) => void;
  selectedNode?: string;
}

export const DigitalWellVisualizer: React.FC<DigitalWellVisualizerProps> = ({
  twinState,
  onSelectNode,
  selectedNode,
}) => {
  const tRes = twinState.thermal?.reservoir_temp_c ?? twinState.temperature_c ?? 58.4;
  const visc = twinState.thermal?.viscosity_cp ?? twinState.viscosity_cp ?? 7200;
  const floatMargin = twinState.srp?.downstroke_floating_margin_kn ?? twinState.floating_margin_kn ?? 1.48;
  const spm = twinState.srp?.spm ?? twinState.spm ?? 7.5;
  const stroke = twinState.srp?.stroke_length_m ?? (twinState.stroke_in ? (twinState.stroke_in * 0.0254) : 3.2);
  const viscousDrag = twinState.srp?.viscous_drag_force_kn ?? twinState.drag_force_kn ?? 3.82;
  const netOil = twinState.reservoir?.net_oil_rate_bopd ?? twinState.oil_rate_bopd ?? 48.2;
  const grossOil = twinState.reservoir?.gross_rate_bopd ?? (netOil / 0.76);
  const pumpFillage = twinState.srp?.pump_fillage ?? (twinState.pump_efficiency_pct / 100);
  const pRes = twinState.reservoir?.reservoir_pressure_bar ?? twinState.reservoir_pressure_bar ?? 36.5;
  const pip = twinState.wellbore?.pip_bar ?? twinState.pump_intake_pressure_bar ?? 24.2;
  const dfl = twinState.wellbore?.dynamic_fluid_level_m ?? twinState.fluid_level_depth_m ?? 685;

  // Thermal radius color scale (10% to 100%)
  const thermalPercent = Math.min(100, Math.max(15, ((tRes - 45) / (220 - 45)) * 100));
  const isMarginCritical = floatMargin < 2.0;

  return (
    <div className="relative w-full h-[540px] bg-[#0A0F14] border border-[#182330] rounded-sm overflow-hidden flex flex-col select-none cyan-glow-hero">
      {/* Visualizer Header Strip */}
      <div className="h-8 px-4 bg-[#101820] border-b border-[#182330] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-[#19E6D2] shadow-[0_0_8px_#19E6D2] animate-pulse" />
          <span className="text-[#E2E8F0] font-bold tracking-wider text-xs">
            DIGITAL TWIN: WELL-TO-SURFACE MULTI-PHYSICS SCHEMATIC
          </span>
          <span className="hidden sm:inline text-[10px] text-[#64748B]">
            [0 – 1,250m MD • JODHPUR SANDSTONE]
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <span>
            SPM: <strong className="text-[#19E6D2]">{spm.toFixed(1)}</strong>
          </span>
          <span>
            FLOAT MARGIN:{' '}
            <strong className={isMarginCritical ? 'text-[#FF4D5E]' : 'text-[#22C55E]'}>
              {floatMargin.toFixed(2)} kN {isMarginCritical ? '[CRITICAL]' : '[SAFE]'}
            </strong>
          </span>
        </div>
      </div>

      {/* Main SVG Engineering Graphic with Robust Non-Colliding Layout */}
      <div className="relative flex-1 w-full h-full p-2 flex items-center justify-center bg-[#06090D]">
        <svg
          viewBox="0 0 660 500"
          className="w-full h-full max-h-[500px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Multi-stage Thermal Gradient */}
            <radialGradient id="thermalHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4D5E" stopOpacity="0.75" />
              <stop offset="30%" stopColor="#FF8A00" stopOpacity="0.5" />
              <stop offset="65%" stopColor="#FFB020" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#091F2C" stopOpacity="0" />
            </radialGradient>

            {/* Geological Layer Gradients */}
            <linearGradient id="overburdenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1017" />
              <stop offset="100%" stopColor="#101822" />
            </linearGradient>

            <linearGradient id="sealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E1724" />
              <stop offset="100%" stopColor="#0A121D" />
            </linearGradient>

            <linearGradient id="reservoirGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#091F2C" />
              <stop offset="100%" stopColor="#061622" />
            </linearGradient>

            {/* Subsurface Lithology Pattern */}
            <pattern id="geologyPattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="24" y2="0" stroke="#182330" strokeWidth="0.8" opacity="0.6" />
              <circle cx="6" cy="12" r="0.8" fill="#334155" opacity="0.4" />
              <circle cx="18" cy="18" r="0.8" fill="#334155" opacity="0.4" />
            </pattern>
          </defs>

          {/* ======================================================== */}
          {/* 1. GEOLOGICAL STRATIGRAPHY BACKGROUND                    */}
          {/* ======================================================== */}
          {/* Layer 1: Overburden (0 - 800m) */}
          <rect x="40" y="55" width="580" height="200" fill="url(#overburdenGrad)" />
          <rect x="40" y="55" width="580" height="200" fill="url(#geologyPattern)" />
          <text x="52" y="72" fill="#64748B" fontSize="9" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">
            OVERBURDEN SHALE / SILTSTONE
          </text>
          <text x="52" y="85" fill="#475569" fontSize="8" fontFamily="monospace">
            Depth: 0 – 800m MD • Gradient: 2.8°C / 100m
          </text>

          {/* Layer 2: Regional Caprock Seal (800 - 1,100m) */}
          <rect x="40" y="255" width="580" height="95" fill="url(#sealGrad)" />
          <line x1="40" y1="255" x2="620" y2="255" stroke="#223244" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="52" y="272" fill="#94A3B8" fontSize="9" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">
            REGIONAL CAPROCK IMPERMEABLE SEAL
          </text>
          <text x="52" y="285" fill="#64748B" fontSize="8" fontFamily="monospace">
            Evaporite / Dense Shale Barrier @ ~900m MD
          </text>

          {/* Layer 3: Jodhpur Sandstone Heavy Crude Reservoir (1,100 - 1,250m) */}
          <rect x="40" y="350" width="580" height="135" fill="url(#reservoirGrad)" stroke="#182330" />
          <line x1="40" y1="350" x2="620" y2="350" stroke="#FFB020" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* Clean Reservoir Formation Banner (Top-Left of Reservoir Layer) */}
          <g transform="translate(52, 356)">
            <rect x="0" y="0" width="220" height="18" fill="#101820" stroke="#FFB020" strokeWidth="0.8" rx="2" opacity="0.9" />
            <text x="8" y="12" fill="#FFB020" fontSize="9" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.6">
              RESERVOIR — JODHPUR SANDSTONE (17° API)
            </text>
          </g>

          {/* ======================================================== */}
          {/* 2. DEPTH SCALE ON FAR LEFT (x: 40 to 120)                */}
          {/* ======================================================== */}
          <line x1="120" y1="50" x2="120" y2="475" stroke="#182330" strokeWidth="1.5" />
          {[
            { depth: '0m', y: 55, label: 'SURFACE' },
            { depth: '350m', y: 155, label: '9-5/8" SHOE' },
            { depth: '800m', y: 255, label: 'MID-WELL' },
            { depth: '1,180m', y: 380, label: 'PUMP SEAT' },
            { depth: '1,220m', y: 440, label: 'PERFORATIONS' },
          ].map((item, idx) => (
            <g key={idx}>
              <line x1="114" y1={item.y} x2="126" y2={item.y} stroke="#64748B" strokeWidth="1.2" />
              <text x="110" y={item.y + 3} fill="#94A3B8" fontSize="8" fontFamily="monospace" textAnchor="end">
                {item.depth}
              </text>
            </g>
          ))}

          {/* Ground Line */}
          <line x1="120" y1="55" x2="560" y2="55" stroke="#223244" strokeWidth="2.5" />

          {/* ======================================================== */}
          {/* 3. CENTRAL WELLBORE & DOWNHOLE SRP EQUIPMENT (x ≈ 330)   */}
          {/* ======================================================== */}
          {/* Surface SRP Pumping Unit (Horsehead + Beam) */}
          <g transform="translate(330, 55)" className="cursor-pointer" onClick={() => onSelectNode?.('surface')}>
            {/* Samson Post */}
            <line x1="-36" y1="0" x2="-20" y2="-36" stroke="#64748B" strokeWidth="2.5" />
            <line x1="-4" y1="0" x2="-20" y2="-36" stroke="#64748B" strokeWidth="2.5" />
            {/* Walking Beam */}
            <line x1="-50" y1="-30" x2="16" y2="-40" stroke="#19E6D2" strokeWidth="3.5" />
            {/* Horsehead Arc */}
            <path d="M 16 -40 Q 28 -25 28 -5" fill="none" stroke="#19E6D2" strokeWidth="3.5" />
            {/* Polished Rod */}
            <line x1="28" y1="-5" x2="28" y2="18" stroke="#FFFFFF" strokeWidth="2.5" className="animate-rod" />
            {/* Wellhead Tree */}
            <rect x="20" y="0" width="16" height="18" fill="#101820" stroke="#19E6D2" strokeWidth="1.5" />
            <line x1="36" y1="9" x2="65" y2="9" stroke="#19E6D2" strokeWidth="2" />
            <polygon points="63,6 71,9 63,12" fill="#19E6D2" />
          </g>

          {/* Casing Strings */}
          {/* Surface Casing (9-5/8" to 350m) */}
          <rect x="306" y="55" width="48" height="100" fill="none" stroke="#223244" strokeWidth="1.8" />
          {/* Production Casing (7" to 1,240m) */}
          <rect x="313" y="55" width="34" height="405" fill="#0A0F14" stroke="#182330" strokeWidth="1.6" />
          {/* Production Tubing (2-7/8" to 1,180m) */}
          <rect x="321" y="55" width="18" height="325" fill="#06090D" stroke="#223244" strokeWidth="1" />

          {/* Dynamic Fluid Column in Tubing Annulus */}
          <rect x="322" y="190" width="16" height="190" fill="#19E6D2" fillOpacity="0.12" />

          {/* Sucker Rod String (Central line inside tubing) */}
          <line
            x1="330"
            y1="60"
            x2="330"
            y2="380"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray={isMarginCritical ? '6 3' : 'none'}
          />

          {/* Annular Viscous Drag Shear Vectors in Tubing */}
          {[-1, 1].map((dir, idx) => (
            <g key={idx}>
              <line
                x1={330 + dir * 6}
                y1="195"
                x2={330 + dir * 6}
                y2="285"
                stroke="#FFB020"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <polygon
                points={`${330 + dir * 6},280 ${330 + dir * 3},273 ${330 + dir * 9},273`}
                fill="#FFB020"
              />
            </g>
          ))}

          {/* Subsurface Rod Pump at 1,180m */}
          <g transform="translate(317, 380)" className="cursor-pointer" onClick={() => onSelectNode?.('srp')}>
            <rect x="0" y="0" width="26" height="32" fill="#101820" stroke="#19E6D2" strokeWidth="2" rx="1" />
            <circle cx="13" cy="10" r="3.5" fill="#19E6D2" />
            <circle cx="13" cy="22" r="3.5" fill="#22C55E" />
          </g>

          {/* Perforations Zone at 1,220m (clean whiskers on casing) */}
          <g transform="translate(313, 430)">
            {[0, 7, 14, 21].map((perfY, idx) => (
              <g key={idx}>
                <line x1="-12" y1={perfY} x2="0" y2={perfY} stroke="#FF4D5E" strokeWidth="2" />
                <circle cx="-14" cy={perfY} r="2" fill="#FF8A00" />
                <line x1="34" y1={perfY} x2="46" y2={perfY} stroke="#FF4D5E" strokeWidth="2" />
                <circle cx="48" cy={perfY} r="2" fill="#FF8A00" />
              </g>
            ))}
          </g>

          {/* Thermal Steam Expansion Halo centered at Perfs (1,220m) */}
          <ellipse
            cx="330"
            cy="440"
            rx={Math.max(45, 110 * (thermalPercent / 80))}
            ry={Math.max(25, 42 * (thermalPercent / 80))}
            fill="url(#thermalHalo)"
          />
          <ellipse
            cx="330"
            cy="440"
            rx={Math.max(35, 85 * (thermalPercent / 80))}
            ry={Math.max(18, 30 * (thermalPercent / 80))}
            fill="none"
            stroke="#FF8A00"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Viscous Crude Inflow Curved Vectors into Perfs */}
          <path
            d="M 235 448 Q 285 442 308 438"
            fill="none"
            stroke="#19E6D2"
            strokeWidth="2"
            strokeDasharray="3 2"
          />
          <polygon points="308,438 299,435 301,442" fill="#19E6D2" />
          <path
            d="M 425 448 Q 375 442 352 438"
            fill="none"
            stroke="#19E6D2"
            strokeWidth="2"
            strokeDasharray="3 2"
          />
          <polygon points="352,438 359,442 361,435" fill="#19E6D2" />

          {/* ======================================================== */}
          {/* 4. ROBUST CALLOUT SYSTEM: LEFT ZONE (x: 145 to 290)      */}
          {/* Dedicated space for Mechanical Lift & Drag Diagnostics   */}
          {/* ======================================================== */}

          {/* Left Callout 1: Annular Viscous Drag Force */}
          <g transform="translate(145, 195)">
            {/* Leader line with jog to wellbore */}
            <polyline
              points="145,20 185,20 185,45 324,45"
              fill="none"
              stroke="#FFB020"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            <circle cx="324" cy="45" r="2.5" fill="#FFB020" />

            <rect x="0" y="0" width="145" height="42" fill="#0A0F14" stroke="#FFB020" strokeWidth="1" rx="2" />
            <text x="8" y="14" fill="#FFB020" fontSize="9" fontFamily="sans-serif" fontWeight="700">
              ANNULAR VISCOUS DRAG
            </text>
            <text x="8" y="26" fill="#E2E8F0" fontSize="10" fontFamily="monospace" fontWeight="700">
              F_drag: {viscousDrag.toFixed(2)} kN
            </text>
            <text x="8" y="37" fill="#94A3B8" fontSize="8" fontFamily="monospace">
              Couette @ {spm.toFixed(1)} SPM
            </text>
          </g>

          {/* Left Callout 2: Subsurface SRP Pump (@ 1,180m MD) */}
          <g
            transform="translate(145, 375)"
            className="cursor-pointer"
            onClick={() => onSelectNode?.('srp')}
          >
            {/* Horizontal leader line to pump barrel */}
            <line x1="145" y1="20" x2="317" y2="20" stroke="#19E6D2" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />
            <circle cx="317" cy="20" r="2.5" fill="#19E6D2" />

            <rect
              x="0"
              y="0"
              width="145"
              height="46"
              fill="#0A0F14"
              stroke={selectedNode === 'srp' ? '#19E6D2' : '#182330'}
              strokeWidth={selectedNode === 'srp' ? 1.5 : 1}
              rx="2"
            />
            <text x="8" y="14" fill="#19E6D2" fontSize="9" fontFamily="sans-serif" fontWeight="700">
              SRP PUMP @ 1,180m MD
            </text>
            <text x="8" y="27" fill="#E2E8F0" fontSize="10" fontFamily="monospace" fontWeight="700">
              Fillage: {(pumpFillage * 100).toFixed(0)}% • Stroke: {stroke.toFixed(1)}m
            </text>
            <text x="8" y="39" fill="#94A3B8" fontSize="8" fontFamily="monospace">
              PIP: {pip.toFixed(1)} bar • Eff: {(pumpFillage * 96).toFixed(0)}%
            </text>
          </g>

          {/* ======================================================== */}
          {/* 5. ROBUST CALLOUT SYSTEM: RIGHT ZONE (x: 465 to 640)     */}
          {/* Standardized width (175px), distinct vertical anchors   */}
          {/* ======================================================== */}

          {/* Callout 1: Surface Wellhead (0m) */}
          <g
            transform="translate(465, 48)"
            className="cursor-pointer"
            onClick={() => onSelectNode?.('surface')}
          >
            <polyline
              points="-1,18 -35,18 -60,18 -105,18"
              fill="none"
              stroke="#19E6D2"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            <circle cx="-105" cy="18" r="2.5" fill="#19E6D2" />

            <rect
              x="0"
              y="0"
              width="175"
              height="40"
              fill="#0A0F14"
              stroke={selectedNode === 'surface' ? '#19E6D2' : '#182330'}
              strokeWidth={selectedNode === 'surface' ? 1.5 : 1}
              rx="2"
            />
            <text x="10" y="15" fill="#19E6D2" fontSize="10" fontFamily="sans-serif" fontWeight="700">
              SURFACE WELLHEAD (0m)
            </text>
            <text x="10" y="30" fill="#94A3B8" fontSize="8.5" fontFamily="monospace">
              Q_oil: <strong className="text-[#22C55E]">{netOil.toFixed(1)} BOPD</strong> • BS&amp;W: 24%
            </text>
          </g>

          {/* Callout 2: Sucker Rod String (Mechanical Margin) */}
          <g
            transform="translate(465, 138)"
            className="cursor-pointer"
            onClick={() => onSelectNode?.('rod')}
          >
            <polyline
              points="-1,18 -45,18 -85,18 -135,22"
              fill="none"
              stroke={isMarginCritical ? '#FF4D5E' : '#22C55E'}
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            <circle cx="-135" cy="22" r="2.5" fill={isMarginCritical ? '#FF4D5E' : '#22C55E'} />

            <rect
              x="0"
              y="0"
              width="175"
              height="40"
              fill="#0A0F14"
              stroke={selectedNode === 'rod' ? '#19E6D2' : isMarginCritical ? '#FF4D5E' : '#182330'}
              strokeWidth={selectedNode === 'rod' ? 1.5 : 1}
              rx="2"
            />
            <text x="10" y="15" fill="#19E6D2" fontSize="10" fontFamily="sans-serif" fontWeight="700">
              SUCKER ROD STRING
            </text>
            <text
              x="10"
              y="30"
              fill={isMarginCritical ? '#FF4D5E' : '#22C55E'}
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="700"
            >
              MARGIN: {floatMargin.toFixed(2)} kN {isMarginCritical ? '[CRITICAL]' : '[SAFE]'}
            </text>
          </g>

          {/* Callout 3: Dynamic Fluid Level (Wellbore Hydraulics) */}
          <g
            transform="translate(465, 230)"
            className="cursor-pointer"
            onClick={() => onSelectNode?.('wellbore')}
          >
            <polyline
              points="-1,18 -45,18 -80,18 -126,20"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            <circle cx="-126" cy="20" r="2.5" fill="#3B82F6" />

            <rect
              x="0"
              y="0"
              width="175"
              height="40"
              fill="#0A0F14"
              stroke={selectedNode === 'wellbore' ? '#3B82F6' : '#182330'}
              strokeWidth={selectedNode === 'wellbore' ? 1.5 : 1}
              rx="2"
            />
            <text x="10" y="15" fill="#3B82F6" fontSize="10" fontFamily="sans-serif" fontWeight="700">
              DYNAMIC FLUID LEVEL
            </text>
            <text x="10" y="30" fill="#94A3B8" fontSize="8.5" fontFamily="monospace">
              DFL: <strong className="text-[#E2E8F0]">{dfl}m</strong> • PIP: {pip.toFixed(1)} bar
            </text>
          </g>

          {/* Callout 4: Thermal Stimulation / Steam Front Zone */}
          <g
            transform="translate(465, 335)"
            className="cursor-pointer"
            onClick={() => onSelectNode?.('thermal')}
          >
            {/* Leader line pointing smoothly to Steam Halo */}
            <polyline
              points="-1,18 -25,18 -55,45 -95,85"
              fill="none"
              stroke="#FF8A00"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            <circle cx="-95" cy="85" r="2.5" fill="#FF8A00" />

            <rect
              x="0"
              y="0"
              width="175"
              height="45"
              fill="#0A0F14"
              stroke={selectedNode === 'thermal' ? '#FF8A00' : '#182330'}
              strokeWidth={selectedNode === 'thermal' ? 1.5 : 1}
              rx="2"
            />
            <text x="10" y="14" fill="#FF8A00" fontSize="10" fontFamily="sans-serif" fontWeight="700">
              THERMAL STEAM FRONT
            </text>
            <text x="10" y="27" fill="#FFB020" fontSize="9" fontFamily="monospace" fontWeight="700">
              T_res: {tRes.toFixed(1)}°C • μ: {visc.toLocaleString()} cP
            </text>
            <text x="10" y="38" fill="#94A3B8" fontSize="8" fontFamily="monospace">
              Steam Radius: 14.8m • Heat: 2.12 GJ
            </text>
          </g>

          {/* Callout 5: Perforations & Reservoir Inflow */}
          <g
            transform="translate(465, 415)"
            className="cursor-pointer"
            onClick={() => onSelectNode?.('perfs')}
          >
            {/* Leader line pointing directly to Perforation zone */}
            <polyline
              points="-1,18 -35,18 -75,25 -105,25"
              fill="none"
              stroke="#FF4D5E"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            <circle cx="-105" cy="25" r="2.5" fill="#FF4D5E" />

            <rect
              x="0"
              y="0"
              width="175"
              height="48"
              fill="#0A0F14"
              stroke={selectedNode === 'perfs' ? '#FF4D5E' : '#182330'}
              strokeWidth={selectedNode === 'perfs' ? 1.5 : 1}
              rx="2"
            />
            <text x="10" y="14" fill="#FF4D5E" fontSize="10" fontFamily="sans-serif" fontWeight="700">
              PERFORATIONS &amp; INFLOW
            </text>
            <text x="10" y="27" fill="#E2E8F0" fontSize="9" fontFamily="monospace" fontWeight="700">
              1,210 – 1,230m MD
            </text>
            <text x="10" y="40" fill="#94A3B8" fontSize="8" fontFamily="monospace">
              Gross: <strong className="text-[#19E6D2]">{grossOil.toFixed(1)} BOPD</strong> • ΔP: {(pRes - pip).toFixed(1)} bar
            </text>
          </g>
        </svg>

        {/* Scanline atmospheric radar line */}
        <div className="scanline opacity-60" />
      </div>

      {/* Visualizer Legend Bar */}
      <div className="h-7 px-4 bg-[#101820] border-t border-[#182330] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A00]" />
            <span className="text-[#94A3B8]">STEAM ENTHALPY ZONE</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 bg-[#19E6D2]" />
            <span className="text-[#94A3B8]">CRUDE INFLOW VECTOR</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#091F2C] border border-[#223244]" />
            <span className="text-[#94A3B8]">JODHPUR SST</span>
          </span>
        </div>
        <div className="text-[10px]">
          ANDRADE-DARCY-MILLS CLOSED LOOP
        </div>
      </div>
    </div>
  );
};
