export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WellSummary {
  well_code: string;
  name: string;
  archetype: string;
  status: string;
  temperature_c: number;
  viscosity_cp: number;
  oil_rate_bopd: number;
  sor: number;
  spm: number;
  floating_margin_kn: number;
  overall_risk_score: number;
  overall_risk_tier: RiskTier;
  data_status: string;
}

export interface DigitalTwinState {
  well_code: string;
  updated_at: string;
  temperature_c: number;
  viscosity_cp: number;
  reservoir_pressure_bar: number;
  flowing_bhp_bar: number;
  pump_intake_pressure_bar: number;
  fluid_level_depth_m: number;
  oil_rate_bopd: number;
  water_rate_bwpd: number;
  pprl_kn: number;
  mprl_kn: number;
  drag_force_kn: number;
  floating_margin_kn: number;
  pump_efficiency_pct: number;
  energy_kwh_day: number;
  sor: number;
  overall_risk_score: number;
  overall_risk_tier: RiskTier;
  active_alarms: string[];
  stroke_in: number;
  spm: number;
  vfd_hz: number;
  steam_mass_tonnes: number;
  injection_pressure_bar: number;
  mode: string;
  data_status: string;

  // Optional grouped subsystem wrappers
  thermal?: {
    reservoir_temp_c: number;
    viscosity_cp: number;
  };
  reservoir?: {
    net_oil_rate_bopd: number;
    gross_rate_bopd: number;
    reservoir_pressure_bar: number;
  };
  wellbore?: {
    pip_bar: number;
    dynamic_fluid_level_m: number;
  };
  srp?: {
    spm: number;
    stroke_length_m: number;
    pprl_kn: number;
    mprl_kn: number;
    downstroke_floating_margin_kn: number;
    pump_fillage: number;
    viscous_drag_force_kn: number;
  };
}

export interface DynacardPoint {
  index: number;
  phase: 'upstroke' | 'downstroke';
  position_in: number;
  position_pct: number;
  load_kn: number;
}

export interface DynacardData {
  condition: string;
  stroke_in: number;
  pprl_kn: number;
  mprl_kn: number;
  diagnostics: {
    condition: string;
    severity: string;
    features_detected: string;
    carrier_bar_separation_risk: boolean;
    disclaimer: string;
  };
  card_points: DynacardPoint[];
  baseline_points?: DynacardPoint[];
}

export interface SimulationPoint {
  day: number;
  temperature_c: number;
  viscosity_cp: number;
  oil_rate_bopd: number;
  water_rate_bwpd: number;
  cumulative_oil_bbl: number;
  sor: number;
  energy_kwh: number;
  floating_margin_kn: number;
  overall_risk_score: number;
  overall_risk_tier: RiskTier;
  net_daily_margin_inr: number;
}

export interface SimulationResult {
  run_id: string;
  well_code: string;
  horizon_days: number;
  peak_temperature_c: number;
  cumulative_oil_bbl: number;
  cumulative_energy_kwh: number;
  steam_energy_mj: number;
  timeline: SimulationPoint[];
}

export interface RecommendationExplanation {
  summary: string;
  current_condition?: string;
  root_contributing_factors?: string[];
  constraint_pressures?: string[];
  recommended_actions?: string[];
  rejected_count?: number;
  rejection_reasons?: string[];
  expected_deltas?: {
    oil_rate_delta_bopd?: number;
    floating_margin_delta_kn?: number;
    sor_delta?: number;
    energy_intensity_delta_kwh_bbl?: number;
    risk_score_delta?: number;
  };
  safety_justification?: string;
  applicability_status?: string;
}

export interface OptimizationResult {
  recommendation_id: string;
  optimization_id?: string;
  well_code: string;
  has_feasible_plan?: boolean;
  status?: string;
  execution_time_ms?: number;
  total_candidates_evaluated?: number;
  feasible_candidates_count?: number;
  rejected_candidates_count?: number;
  recommended_candidate: {
    candidate_id?: string;
    id?: string;
    inputs: Record<string, number>;
    simulated_state: Record<string, any>;
    objective_score?: number;
    is_feasible?: boolean;
    is_pareto_optimal?: boolean;
    safety_passed?: boolean;
  };
  baseline_state: Record<string, any>;
  explanation: RecommendationExplanation;
  pareto_candidates?: any[];
  accepted_candidates?: any[];
  rejected_candidates?: any[];
}

export interface AuditEventItem {
  id: number;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity?: string;
  entity_type?: string;
  entity_id?: string;
  diff_json?: any;
  before_json?: any;
  after_json?: any;
  result?: string;
  status?: string;
}
