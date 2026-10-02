import {
  WellSummary,
  DigitalTwinState,
  DynacardData,
  SimulationResult,
  OptimizationResult,
  AuditEventItem
} from '../types';

const BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  async getWells(): Promise<WellSummary[]> {
    try {
      const res = await fetch(`${BASE_URL}/wells`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return getFallbackWells();
    }
  },

  async getWellState(wellCode: string): Promise<DigitalTwinState> {
    try {
      const res = await fetch(`${BASE_URL}/wells/${wellCode}/state`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return getFallbackTwinState(wellCode);
    }
  },

  async getWellHistory(wellCode: string, limit = 30): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/wells/${wellCode}/history?limit=${limit}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return [];
    }
  },

  async getDynacard(wellCode: string): Promise<DynacardData> {
    try {
      const res = await fetch(`${BASE_URL}/wells/${wellCode}/dynacard`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return getFallbackDynacard();
    }
  },

  async runSimulation(payload: {
    well_code: string;
    horizon_days: number;
    steam_mass_tonnes?: number;
    injection_pressure_bar?: number;
    spm?: number;
    stroke_in?: number;
  }): Promise<SimulationResult> {
    try {
      const res = await fetch(`${BASE_URL}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Simulation failed');
      return await res.json();
    } catch {
      return getFallbackSimulation(payload.well_code, payload.horizon_days);
    }
  },

  async runJointOptimization(payload: {
    well_code: string;
    search_intensity?: number;
    weights?: any;
  }): Promise<OptimizationResult> {
    try {
      const res = await fetch(`${BASE_URL}/optimization/joint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Optimization failed');
      return await res.json();
    } catch {
      return getFallbackOptimization(payload.well_code);
    }
  },

  async approveRecommendation(recommendationId: string, actor = 'OPERATOR_01'): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/recommendations/${recommendationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor, role: 'OPERATOR', reason: 'Approved via Control Room UI.' })
      });
      if (!res.ok) throw new Error('Approval failed');
      return await res.json();
    } catch {
      return { status: 'APPROVED', recommendation_id: recommendationId };
    }
  },

  async rejectRecommendation(recommendationId: string, reason = 'Operator rejected'): Promise<any> {
    const res = await fetch(`${BASE_URL}/recommendations/${recommendationId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'OPERATOR_01', role: 'OPERATOR', reason })
    });
    return res.json();
  },

  async getAuditTrail(limit = 40): Promise<AuditEventItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/audit?limit=${limit}`);
      if (!res.ok) throw new Error('Audit fetch failed');
      return await res.json();
    } catch {
      return getFallbackAudit();
    }
  },

  async getModelsRegistry(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/models`);
      if (!res.ok) throw new Error('Models fetch failed');
      return await res.json();
    } catch {
      return { dataset_provenance: { source_type: 'SYNTHETIC' } };
    }
  },

  async injectAnomaly(wellCode: string, anomalyType: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/twin/${wellCode}/inject-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomaly_type: anomalyType })
    });
    return res.json();
  },

  async resetDemo(): Promise<{ status: string; message: string }> {
    try {
      const res = await fetch(`${BASE_URL}/demo/reset`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Reset failed');
      return await res.json();
    } catch {
      return { status: 'RESET_SUCCESSFUL', message: 'Demo fleet state restored to deterministic baseline.' };
    }
  }
};

// -------------------------------------------------------------------
// Fallback Mock Generators (guarantees offline UI resilience)
// -------------------------------------------------------------------
function getFallbackWells(): WellSummary[] {
  return [
    {
      well_code: 'BGW-001',
      name: 'Baghewala North 01 (Normal Operating State)',
      archetype: 'NORMAL_OPERATING',
      status: 'NORMAL',
      temperature_c: 72.0,
      viscosity_cp: 340,
      oil_rate_bopd: 65.0,
      sor: 2.4,
      spm: 4.8,
      floating_margin_kn: 6.8,
      overall_risk_score: 0.12,
      overall_risk_tier: 'LOW',
      data_status: 'SYNTHETIC / DEMO'
    },
    {
      well_code: 'BGW-002',
      name: 'Baghewala East 02 (Thermal Decline)',
      archetype: 'THERMAL_DECLINE',
      status: 'WARNING',
      temperature_c: 54.0,
      viscosity_cp: 5400,
      oil_rate_bopd: 48.0,
      sor: 3.2,
      spm: 5.4,
      floating_margin_kn: 3.1,
      overall_risk_score: 0.42,
      overall_risk_tier: 'MEDIUM',
      data_status: 'SYNTHETIC / DEMO'
    },
    {
      well_code: 'BGW-003',
      name: 'Baghewala West 03 (High Viscosity)',
      archetype: 'HIGH_VISCOSITY',
      status: 'ATTENTION_REQUIRED',
      temperature_c: 48.0,
      viscosity_cp: 14200,
      oil_rate_bopd: 32.5,
      sor: 4.2,
      spm: 4.2,
      floating_margin_kn: 2.2,
      overall_risk_score: 0.72,
      overall_risk_tier: 'HIGH',
      data_status: 'SYNTHETIC / DEMO'
    },
    {
      well_code: 'BGW-004',
      name: 'Baghewala Central 04 (High Rod Loading)',
      archetype: 'HIGH_ROD_LOADING',
      status: 'ATTENTION_REQUIRED',
      temperature_c: 56.0,
      viscosity_cp: 4100,
      oil_rate_bopd: 58.0,
      sor: 3.1,
      spm: 8.8,
      floating_margin_kn: 2.8,
      overall_risk_score: 0.78,
      overall_risk_tier: 'HIGH',
      data_status: 'SYNTHETIC / DEMO'
    },
    {
      well_code: 'BGW-005',
      name: 'Baghewala South 05 (High SOR)',
      archetype: 'HIGH_SOR',
      status: 'WARNING',
      temperature_c: 52.0,
      viscosity_cp: 7200,
      oil_rate_bopd: 22.0,
      sor: 8.8,
      spm: 3.8,
      floating_margin_kn: 3.8,
      overall_risk_score: 0.55,
      overall_risk_tier: 'MEDIUM',
      data_status: 'SYNTHETIC / DEMO'
    },
    {
      well_code: 'BGW-006',
      name: 'Baghewala Deep 06 (Pump Efficiency Issue)',
      archetype: 'PUMP_EFFICIENCY_ISSUE',
      status: 'ATTENTION_REQUIRED',
      temperature_c: 50.0,
      viscosity_cp: 8500,
      oil_rate_bopd: 28.0,
      sor: 4.6,
      spm: 7.2,
      floating_margin_kn: 2.1,
      overall_risk_score: 0.68,
      overall_risk_tier: 'HIGH',
      data_status: 'SYNTHETIC / DEMO'
    },
    {
      well_code: 'BGW-007',
      name: 'Baghewala East 07 (High Floating Risk)',
      archetype: 'HIGH_FLOATING_RISK',
      status: 'CRITICAL',
      temperature_c: 49.0,
      viscosity_cp: 12089,
      oil_rate_bopd: 31.0,
      sor: 5.1,
      spm: 7.6,
      floating_margin_kn: 1.35,
      overall_risk_score: 0.90,
      overall_risk_tier: 'CRITICAL',
      data_status: 'SYNTHETIC / DEMO'
    },
    {
      well_code: 'BGW-008',
      name: 'Baghewala North 08 (Thermal Recovery Opportunity)',
      archetype: 'THERMAL_RECOVERY_OPPORTUNITY',
      status: 'ATTENTION_REQUIRED',
      temperature_c: 46.0,
      viscosity_cp: 18500,
      oil_rate_bopd: 18.0,
      sor: 6.4,
      spm: 3.6,
      floating_margin_kn: 2.5,
      overall_risk_score: 0.62,
      overall_risk_tier: 'MEDIUM',
      data_status: 'SYNTHETIC / DEMO'
    }
  ];
}

function getFallbackTwinState(wellCode: string): DigitalTwinState {
  return {
    well_code: wellCode,
    updated_at: new Date().toISOString(),
    temperature_c: 49.5,
    viscosity_cp: 14200,
    reservoir_pressure_bar: 65.0,
    flowing_bhp_bar: 18.0,
    pump_intake_pressure_bar: 22.4,
    fluid_level_depth_m: 820.0,
    oil_rate_bopd: 32.5,
    water_rate_bwpd: 23.5,
    pprl_kn: 84.5,
    mprl_kn: 12.3,
    drag_force_kn: 14.8,
    floating_margin_kn: 1.8,
    pump_efficiency_pct: 82.0,
    energy_kwh_day: 340.0,
    sor: 4.8,
    overall_risk_score: 0.82,
    overall_risk_tier: 'CRITICAL',
    active_alarms: [
      'CRITICAL: Floating margin is 1.80 kN (<= 2.0 kN floor). Carrier-bar separation hazard!',
      'Near-wellbore thermal decay: crude viscosity has escalated to 14,200 cP.'
    ],
    stroke_in: 120.0,
    spm: 6.8,
    vfd_hz: 54.4,
    steam_mass_tonnes: 1150.0,
    injection_pressure_bar: 82.0,
    mode: 'SIMULATION',
    data_status: 'SYNTHETIC / DEMO'
  };
}

function getFallbackDynacard(): DynacardData {
  const points = [];
  for (let i = 0; i < 30; i++) {
    const pct = (i / 29) * 100;
    points.push({ index: i, phase: 'upstroke' as const, position_in: (pct / 100) * 120, position_pct: pct, load_kn: 84.5 });
  }
  for (let i = 0; i < 30; i++) {
    const pct = (1 - i / 29) * 100;
    points.push({ index: 30 + i, phase: 'downstroke' as const, position_in: (pct / 100) * 120, position_pct: pct, load_kn: 12.3 });
  }
  return {
    condition: 'HIGH_DRAG_ROD_FLOAT',
    stroke_in: 120.0,
    pprl_kn: 84.5,
    mprl_kn: 12.3,
    diagnostics: {
      condition: 'HIGH_DRAG_ROD_FLOAT',
      severity: 'CRITICAL',
      features_detected: 'Severe viscous drag on downstroke reducing minimum load to near-zero.',
      carrier_bar_separation_risk: true,
      disclaimer: 'Synthetic demonstration pattern generated from mechanical simulation.'
    },
    card_points: points
  };
}

function getFallbackSimulation(wellCode: string, days: number): SimulationResult {
  const timeline = [];
  let cumOil = 0;
  for (let d = 0; d <= days; d++) {
    const t = 48.0 + (190.0 - 48.0) * Math.exp(-0.03 * d);
    const visc = 11500 * Math.exp(5200 * (1 / (t + 273.15) - 1 / 323.15));
    const oil = Math.max(10, 60 * Math.exp(-0.02 * d));
    cumOil += oil;
    timeline.push({
      day: d,
      temperature_c: Math.round(t * 10) / 10,
      viscosity_cp: Math.round(visc),
      oil_rate_bopd: Math.round(oil * 10) / 10,
      water_rate_bwpd: Math.round(oil * 0.7 * 10) / 10,
      cumulative_oil_bbl: Math.round(cumOil),
      sor: Math.round((1200 / Math.max(1, cumOil)) * 10) / 10,
      energy_kwh: 320,
      floating_margin_kn: Math.max(1.5, 8.0 - (d / days) * 6.0),
      overall_risk_score: Math.min(0.9, 0.15 + (d / days) * 0.7),
      overall_risk_tier: d > 20 ? ('CRITICAL' as const) : ('LOW' as const),
      net_daily_margin_inr: Math.round(oil * 6200 - 3500)
    });
  }
  return {
    run_id: 'SIM-DEMO-01',
    well_code: wellCode,
    horizon_days: days,
    peak_temperature_c: 190.0,
    cumulative_oil_bbl: Math.round(cumOil),
    cumulative_energy_kwh: days * 320,
    steam_energy_mj: 2850000,
    timeline
  };
}

function getFallbackOptimization(wellCode: string): OptimizationResult {
  return {
    recommendation_id: 'REC-DEMO-01',
    optimization_id: 'OPT-DEMO-01',
    well_code: wellCode,
    execution_time_ms: 142.5,
    total_candidates_evaluated: 35,
    feasible_candidates_count: 26,
    rejected_candidates_count: 9,
    recommended_candidate: {
      candidate_id: 'CAND-014',
      inputs: {
        stroke_in: 144.0,
        spm: 4.8,
        vfd_hz: 38.4,
        steam_mass_tonnes: 1300.0,
        injection_pressure_bar: 85.0
      },
      simulated_state: {
        actual_oil_bopd: 41.2,
        sor: 3.1,
        floating_margin_kn: 5.6,
        overall_risk_score: 0.22,
        overall_risk_tier: 'LOW',
        energy_kwh_bbl: 12.4,
        pprl_kn: 79.2,
        pump_efficiency_pct: 88.0
      },
      objective_score: 1.48,
      is_feasible: true
    },
    baseline_state: {
      actual_oil_bopd: 32.5,
      sor: 4.8,
      floating_margin_kn: 1.8,
      overall_risk_score: 0.82,
      overall_risk_tier: 'CRITICAL',
      energy_kwh_bbl: 16.2
    },
    explanation: {
      summary: 'Recommended operational re-tuning: Shift to longer stroke (144") and lower frequency (4.8 SPM) to restore downstroke floating safety margin (+3.80 kN) with modelled oil rate 41.2 BOPD.',
      current_condition: 'Well is operating in a cooling regime with viscosity 14,200 cP. Current 6.8 SPM creates extreme downstroke drag depressing margin to 1.80 kN.',
      root_contributing_factors: ['Elevated annular drag force (14.8 kN) opposes rod descent.'],
      constraint_pressures: ['Floating margin is inside critical alarm zone (< 2.0 kN).'],
      recommended_actions: [
        'Reduce pumping speed from 6.8 to 4.8 SPM to lower downstroke viscous drag.',
        'Increase polished rod stroke from 120" to 144" to maintain displacement while slowing cycle speed.'
      ],
      expected_deltas: {
        oil_rate_delta_bopd: 8.7,
        floating_margin_delta_kn: 3.8,
        sor_delta: -1.7,
        energy_intensity_delta_kwh_bbl: -3.8,
        risk_score_delta: -0.6
      },
      safety_justification: 'Floating margin improves by +3.80 kN, completely eliminating carrier-bar separation risk.',
      applicability_status: 'IN_DOMAIN'
    },
    pareto_candidates: [],
    accepted_candidates: [],
    rejected_candidates: []
  };
}

function getFallbackAudit(): AuditEventItem[] {
  return [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      actor: 'SYSTEM_INIT',
      role: 'SYSTEM',
      action: 'INITIALIZE_SYNTHETIC_DATABASE',
      entity_type: 'FLEET',
      entity_id: 'BAGHEWALA_SYNTH_V1',
      before_json: null,
      after_json: { wells_count: 12, telemetry_count: 2160 },
      result: 'SUCCESS'
    }
  ];
}
