/**
 * BagheTwin — Single Source of Truth for Safety Thresholds
 *
 * Every page, component, and chart MUST use these constants
 * for consistent status classification and display logic.
 *
 * DO NOT hardcode threshold values elsewhere in the codebase.
 */

// ───────────────── Floating Margin ─────────────────
/** Below this value (kN), the rod is in CRITICAL danger of carrier-bar separation. */
export const FLOATING_MARGIN_CRITICAL_KN = 2.0;

/** Below this value but above CRITICAL, the well needs attention. */
export const FLOATING_MARGIN_WARNING_KN = 3.5;

/** Classify floating margin into a risk tier */
export function classifyFloatingMargin(marginKn: number): 'CRITICAL' | 'WARNING' | 'SAFE' {
  if (marginKn < FLOATING_MARGIN_CRITICAL_KN) return 'CRITICAL';
  if (marginKn < FLOATING_MARGIN_WARNING_KN) return 'WARNING';
  return 'SAFE';
}

/** Get the CSS color class for floating margin display */
export function getMarginColorClass(marginKn: number): string {
  const tier = classifyFloatingMargin(marginKn);
  if (tier === 'CRITICAL') return 'text-red-700';
  if (tier === 'WARNING') return 'text-amber-700';
  return 'text-emerald-700';
}

/** Get background color class for floating margin cards */
export function getMarginBgClass(marginKn: number): string {
  const tier = classifyFloatingMargin(marginKn);
  if (tier === 'CRITICAL') return 'bg-red-50 border-red-200';
  if (tier === 'WARNING') return 'bg-amber-50 border-amber-200';
  return 'bg-emerald-50 border-emerald-200';
}

/** Get a human-readable status label */
export function getMarginStatusLabel(marginKn: number, t?: any): string {
  const tier = classifyFloatingMargin(marginKn);
  if (tier === 'CRITICAL') return `Below ${FLOATING_MARGIN_CRITICAL_KN} kN safety threshold`;
  if (tier === 'WARNING') return `Approaching ${FLOATING_MARGIN_CRITICAL_KN} kN safety threshold`;
  return 'Operating inside safe envelope';
}

// ───────────────── Temperature ─────────────────
export const TEMPERATURE_WARNING_C = 55.0;

export function classifyTemperature(tempC: number): 'WARNING' | 'NORMAL' {
  return tempC < TEMPERATURE_WARNING_C ? 'WARNING' : 'NORMAL';
}

// ───────────────── Injection Pressure ─────────────────
export const INJECTION_PRESSURE_MAX_BAR = 100.0;

export function classifyPressure(pressureBar: number): 'CRITICAL' | 'SAFE' {
  return pressureBar > INJECTION_PRESSURE_MAX_BAR ? 'CRITICAL' : 'SAFE';
}

// ───────────────── Overall Risk ─────────────────
export function classifyOverallRisk(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (riskScore >= 0.8) return 'CRITICAL';
  if (riskScore >= 0.55) return 'HIGH';
  if (riskScore >= 0.3) return 'MEDIUM';
  return 'LOW';
}

/** Chart reference line value for floating margin charts */
export const FLOATING_MARGIN_REFERENCE_LINE_KN = FLOATING_MARGIN_CRITICAL_KN;

/** Narrative pipeline stage labels */
export const PIPELINE_STAGES = {
  DETECT: 'Detect',
  EXPLAIN: 'Explain',
  RECOMMEND: 'Recommend',
  SIMULATE: 'Simulate',
  OPTIMIZE: 'Optimize',
} as const;
