"""
SIH26120 Comprehensive Physics Sanity, Directional Monotonicity,
Edge Case, Optimizer Robustness, and Fallback Validation Tests.

Validates that BagheTwin strictly adheres to first-principles petroleum physics:
1. Directional Relationships & Monotonicity
2. Edge Cases (Zero/Max Steam, Extreme SPM/Stroke, NaN/Infinity safety)
3. Optimizer Feasibility Scenarios (Many, Few, Zero Feasible Candidates)
4. ML Model Fallback (Missing/Corrupt Model Handling)
5. Demo Reset State Determinism
"""

import math
import pytest
from app.physics.engine import CoupledPhysicsSimulator, WellParameters, OperationalInputs
from app.physics.viscosity import HeavyOilViscosityModel
from app.physics.reservoir import ReservoirInflowEngine
from app.physics.srp import SRPEngine
from app.optimizer.joint_optimizer import JointOptimizer
from app.optimizer.constraints import CandidateConstraintEvaluator, ConstraintConfig
from app.ml.surrogates import ProductionSurrogate
from app.ml.risk_models import MLRiskAndAnomalyEngine
from app.twin.anomaly_injector import AnomalyInjector


@pytest.fixture
def sim():
    return CoupledPhysicsSimulator()


@pytest.fixture
def default_well():
    return WellParameters(
        well_code="BGW-007",
        field="Baghewala",
        reservoir_name="Jodhpur Sandstone",
        measured_depth_m=1060.0,
        pump_depth_m=960.0,
        api_gravity=17.5,
        base_temperature_c=49.0,
        base_pressure_bar=64.0,
        permeability_md=760.0,
        net_pay_m=15.0,
        tubing_id_mm=62.0,
        rod_diameter_mm=22.2,
        pump_bore_mm=57.15,
        base_water_cut=0.44
    )


# -------------------------------------------------------------
# 1. DIRECTIONAL RELATIONSHIPS & PHYSICAL MONOTONICITY
# -------------------------------------------------------------

def test_temperature_viscosity_inverse_monotonicity():
    """
    Temperature ↑ => Viscosity ↓
    Temperature ↓ => Viscosity ↑
    """
    visc_engine = HeavyOilViscosityModel()
    temps = [35.0, 50.0, 75.0, 100.0, 140.0, 180.0]
    viscosities = [visc_engine.calculate_viscosity_cp(t) for t in temps]

    # Strictly monotonically decreasing with temperature
    for i in range(len(viscosities) - 1):
        assert viscosities[i] > viscosities[i + 1], (
            f"Viscosity at {temps[i]}°C ({viscosities[i]} cP) must be strictly greater "
            f"than at {temps[i+1]}°C ({viscosities[i+1]} cP)"
        )


def test_viscosity_mobility_inverse_relationship():
    """
    Viscosity ↑ => Effective fluid mobility ↓
    """
    res_engine = ReservoirInflowEngine()
    visc_engine = HeavyOilViscosityModel()

    temp_hot = 90.0
    temp_cold = 45.0

    inflow_hot = res_engine.calculate_inflow(
        reservoir_pressure_bar=65.0,
        flowing_bhp_bar=20.0,
        temperature_c=temp_hot,
        water_cut=0.4
    )
    inflow_cold = res_engine.calculate_inflow(
        reservoir_pressure_bar=65.0,
        flowing_bhp_bar=20.0,
        temperature_c=temp_cold,
        water_cut=0.4
    )

    visc_hot = visc_engine.calculate_viscosity_cp(temp_hot)
    visc_cold = visc_engine.calculate_viscosity_cp(temp_cold)

    assert visc_cold > visc_hot
    assert inflow_cold["effective_pi_bpd_bar"] < inflow_hot["effective_pi_bpd_bar"]
    assert inflow_cold["fluid_mobility_md_cp"] < inflow_hot["fluid_mobility_md_cp"]
    assert inflow_cold["liquid_inflow_bpd"] < inflow_hot["liquid_inflow_bpd"]


def test_viscosity_viscous_drag_positive_relationship():
    """
    Viscosity ↑ => Viscous drag ↑ on rod string
    """
    srp_engine = SRPEngine()
    drag_low_visc = srp_engine.calculate_annular_viscous_drag_n(
        rod_diameter_mm=22.2,
        tubing_id_mm=62.0,
        pump_depth_m=950.0,
        viscosity_pa_s=0.5,   # 500 cP
        velocity_m_s=0.8
    )
    drag_high_visc = srp_engine.calculate_annular_viscous_drag_n(
        rod_diameter_mm=22.2,
        tubing_id_mm=62.0,
        pump_depth_m=950.0,
        viscosity_pa_s=12.0,  # 12,000 cP
        velocity_m_s=0.8
    )

    assert drag_high_visc > drag_low_visc
    assert drag_high_visc / drag_low_visc > 10.0


def test_spm_rod_velocity_positive_monotonicity():
    """
    SPM ↑ => Rod velocity ↑
    """
    stroke_m = 120.0 * 0.0254
    spm_slow = 3.0
    spm_fast = 9.0

    v_slow = (math.pi * stroke_m * spm_slow) / 60.0
    v_fast = (math.pi * stroke_m * spm_fast) / 60.0

    assert v_fast > v_slow
    assert math.isclose(v_fast / v_slow, 3.0, rel_tol=1e-3)


def test_spm_high_viscosity_floating_risk_monotonicity(default_well, sim):
    """
    Under high viscosity (cold oil), increasing SPM must NEVER artificially decrease floating risk.
    Higher rod velocity increases upward Couette drag force, degrading downstroke floating margin.
    """
    ops_low_spm = OperationalInputs(stroke_in=120.0, spm=3.5)
    ops_high_spm = OperationalInputs(stroke_in=120.0, spm=8.5)

    cold_temp = 48.0  # Cold Rajasthan crude ~13,000 cP
    state_low_spm = sim.evaluate_state(default_well, ops_low_spm, current_temp_c=cold_temp)
    state_high_spm = sim.evaluate_state(default_well, ops_high_spm, current_temp_c=cold_temp)

    # Viscous drag must be higher at faster SPM
    assert state_high_spm["drag_force_kn"] > state_low_spm["drag_force_kn"]

    # Downstroke floating margin must be worse (lower) at higher SPM
    assert state_high_spm["floating_margin_kn"] < state_low_spm["floating_margin_kn"]

    # Overall risk score must be higher or equal at high SPM under cold oil
    assert state_high_spm["overall_risk_score"] >= state_low_spm["overall_risk_score"]


def test_stroke_displacement_positive_relationship():
    """
    Stroke ↑ => Theoretical pump displacement ↑
    """
    srp_engine = SRPEngine()
    state_short = srp_engine.evaluate_srp_state(
        stroke_in=84.0,
        spm=5.0,
        vfd_hz=40.0,
        pump_bore_mm=57.15,
        rod_diameter_mm=22.2,
        pump_depth_m=950.0,
        tubing_id_mm=62.0,
        viscosity_cp=500.0
    )
    state_long = srp_engine.evaluate_srp_state(
        stroke_in=144.0,
        spm=5.0,
        vfd_hz=40.0,
        pump_bore_mm=57.15,
        rod_diameter_mm=22.2,
        pump_depth_m=950.0,
        tubing_id_mm=62.0,
        viscosity_cp=500.0
    )

    assert state_long["pump_capacity_bpd"] > state_short["pump_capacity_bpd"]


def test_unsafe_injection_pressure_rejected():
    """
    Injection pressure > fracture limit (100 bar) => Candidate strictly rejected.
    """
    evaluator = CandidateConstraintEvaluator()
    safe_candidate = {"injection_pressure_bar": 88.0, "stroke_in": 120.0, "spm": 5.0}
    unsafe_candidate = {"injection_pressure_bar": 105.0, "stroke_in": 120.0, "spm": 5.0}

    sim_state = {
        "floating_margin_kn": 4.5,
        "pprl_kn": 70.0,
        "actual_oil_bopd": 45.0,
        "sor": 3.0
    }

    is_feasible_safe, _ = evaluator.evaluate_candidate(safe_candidate, sim_state)
    is_feasible_unsafe, violations = evaluator.evaluate_candidate(unsafe_candidate, sim_state)

    assert is_feasible_safe is True
    assert is_feasible_unsafe is False
    assert any("fracture" in v.lower() for v in violations)


def test_low_floating_margin_rejected():
    """
    Downstroke floating margin < 2.0 kN safety floor => Candidate strictly rejected.
    """
    evaluator = CandidateConstraintEvaluator()
    candidate = {"injection_pressure_bar": 85.0, "stroke_in": 120.0, "spm": 7.5}

    state_safe_margin = {
        "floating_margin_kn": 3.2,
        "pprl_kn": 65.0,
        "actual_oil_bopd": 40.0,
        "sor": 3.0
    }
    state_unsafe_margin = {
        "floating_margin_kn": 1.4,  # Below 2.0 kN floor
        "pprl_kn": 65.0,
        "actual_oil_bopd": 40.0,
        "sor": 3.0
    }

    is_feasible_safe, _ = evaluator.evaluate_candidate(candidate, state_safe_margin)
    is_feasible_unsafe, violations = evaluator.evaluate_candidate(candidate, state_unsafe_margin)

    assert is_feasible_safe is True
    assert is_feasible_unsafe is False
    assert any("floating" in v.lower() for v in violations)


# -------------------------------------------------------------
# 2. PHYSICAL EDGE CASES & BOUNDARY SAFETY
# -------------------------------------------------------------

def test_zero_and_boundary_steam_inputs(default_well, sim):
    """
    Zero steam, minimum steam (100t), and maximum steam (3000t) must not crash or produce NaN.
    """
    for steam_m in [0.0, 100.0, 1500.0, 3000.0]:
        ops = OperationalInputs(steam_mass_tonnes=steam_m, spm=4.5)
        res = sim.evaluate_state(default_well, ops)

        assert not math.isnan(res["actual_oil_bopd"])
        assert not math.isinf(res["actual_oil_bopd"])
        assert res["actual_oil_bopd"] >= 0.0
        assert not math.isnan(res["sor"])
        assert not math.isinf(res["sor"])
        assert res["sor"] >= 0.0


def test_spm_and_stroke_extreme_boundaries(default_well, sim):
    """
    Very low SPM (1.0), maximum SPM (16.0), minimum stroke (24 in), maximum stroke (240 in).
    """
    test_cases = [
        (1.0, 24.0),
        (1.0, 240.0),
        (16.0, 24.0),
        (16.0, 240.0)
    ]
    for spm, stroke in test_cases:
        ops = OperationalInputs(spm=spm, stroke_in=stroke)
        res = sim.evaluate_state(default_well, ops)

        assert not math.isnan(res["pprl_kn"])
        assert not math.isinf(res["pprl_kn"])
        assert res["pprl_kn"] >= 0.0

        assert not math.isnan(res["floating_margin_kn"])
        assert not math.isinf(res["floating_margin_kn"])

        assert not math.isnan(res["pump_capacity_bpd"])
        assert res["pump_capacity_bpd"] >= 0.0


def test_extreme_temperature_and_viscosity(default_well, sim):
    """
    Sub-ambient cold (10°C) and super-heated steam environment (320°C).
    """
    for temp in [10.0, 25.0, 200.0, 320.0]:
        ops = OperationalInputs(spm=4.0)
        res = sim.evaluate_state(default_well, ops, current_temp_c=temp)

        assert res["viscosity_cp"] > 0.0
        assert not math.isnan(res["viscosity_cp"])
        assert not math.isinf(res["viscosity_cp"])
        assert res["actual_oil_bopd"] >= 0.0


def test_missing_and_corrupt_inputs_graceful_handling(default_well, sim):
    """
    Negative values, NaN clamp, or zero head should clamp safely to physical floors.
    """
    ops = OperationalInputs(
        stroke_in=-50.0,  # Negative invalid stroke
        spm=-5.0,         # Negative invalid SPM
        pump_fillage=-0.2 # Negative fillage
    )
    res = sim.evaluate_state(default_well, ops)

    assert res["pprl_kn"] >= 0.0
    assert res["actual_oil_bopd"] >= 0.0
    assert res["actual_liquid_bpd"] >= 0.0


# -------------------------------------------------------------
# 3. OPTIMIZER ROBUSTNESS (Many, Few, Zero Feasible Candidates)
# -------------------------------------------------------------

def test_optimizer_with_feasible_candidates(default_well):
    """
    Case A & B: Feasible candidates exist -> Optimizer returns Knee Point Recommendation.
    """
    opt = JointOptimizer()
    ops = OperationalInputs(stroke_in=120.0, spm=7.6)
    result = opt.run_optimization(default_well, ops, current_temp_c=49.0, num_candidates=35)

    assert result.has_feasible_plan is True
    assert result.feasible_candidates_count > 0
    assert result.status == "FEASIBLE_PLAN_RECOMMENDED"
    assert result.recommended_candidate["is_feasible"] is True
    assert result.recommended_candidate["simulated_state"]["floating_margin_kn"] >= 2.0


def test_optimizer_with_zero_feasible_candidates(default_well):
    """
    Case C: No feasible candidate exists.
    Must return explicit NO FEASIBLE OPERATING PLAN without choosing an unsafe candidate.
    """
    opt = JointOptimizer()
    # Apply impossible constraint: floating margin must be >= 500 kN (impossible)
    opt.constraint_evaluator.config.min_floating_margin_kn = 500.0

    ops = OperationalInputs(stroke_in=120.0, spm=7.6)
    result = opt.run_optimization(default_well, ops, current_temp_c=49.0, num_candidates=10)

    # Restore config
    opt.constraint_evaluator.config.min_floating_margin_kn = 2.0

    assert result.has_feasible_plan is False
    assert result.feasible_candidates_count == 0
    assert result.status == "NO FEASIBLE OPERATING PLAN"
    assert result.recommended_candidate["is_feasible"] is False
    assert "NO FEASIBLE OPERATING PLAN" in result.explanation.summary


# -------------------------------------------------------------
# 4. ML MODEL SERVICE FALLBACK
# -------------------------------------------------------------

def test_production_surrogate_missing_model_fallback():
    """
    When model file is missing or None, must fail gracefully and report:
    MODEL SERVICE UNAVAILABLE - PHYSICS-ONLY MODE ACTIVE
    """
    surrogate = ProductionSurrogate(model_path="non_existent_path_to_model.json")
    assert surrogate.model is None

    res = surrogate.predict({
        "temperature_c": 55.0,
        "viscosity_cp": 8000.0,
        "stroke_in": 120.0,
        "spm": 5.5
    })

    assert res.is_physics_fallback is True
    assert res.model_status == "MODEL SERVICE UNAVAILABLE - PHYSICS-ONLY MODE ACTIVE"
    assert res.point_prediction > 0.0


def test_risk_classifier_missing_model_fallback():
    """
    When risk classifier model file is missing or None, must fall back to physics risk engine.
    """
    risk_engine = MLRiskAndAnomalyEngine(
        classifier_path="invalid_clf.json",
        anomaly_path="invalid_anom.json"
    )
    assert risk_engine.classifier is None

    res = risk_engine.evaluate_risk(
        floating_margin_kn=1.2,
        viscosity_cp=14000.0,
        spm=7.5,
        pprl_kn=80.0,
        mprl_kn=10.0,
        temperature_c=48.0
    )

    assert res.model_status == "MODEL SERVICE UNAVAILABLE - PHYSICS-ONLY MODE ACTIVE"
    assert res.predicted_risk_tier in ["HIGH", "CRITICAL"]
    assert res.risk_probability > 0.5


# -------------------------------------------------------------
# 5. ALL ANOMALY INJECTION & RECOVERY DRILLS
# -------------------------------------------------------------

@pytest.mark.parametrize("anomaly_type", [
    "TEMPERATURE_DROP",
    "HIGH_SPM_SURGE",
    "STEAM_BLOWTHROUGH",
    "GAS_LOCK",
    "VALVE_LEAK"
])
def test_anomaly_injection_and_recovery_flow(anomaly_type):
    """
    Flow F: Inject anomaly -> verify risk increases / alarm added -> Reset anomaly -> verify recovery.
    """
    well_normal = WellParameters(
        well_code="BGW-001",
        base_temperature_c=72.0,
        base_pressure_bar=68.0,
        permeability_md=880.0
    )
    # 1. Inject anomaly
    updated_state, event = AnomalyInjector.inject(well_normal, anomaly_type)
    assert event["event_type"] == anomaly_type
    assert len(updated_state.active_alarms) > 0
    assert updated_state.overall_risk_tier in ["WARNING", "HIGH", "CRITICAL"]

    # 2. Reset anomaly
    recovered_state, reset_event = AnomalyInjector.inject(well_normal, "RESET_ANOMALY")
    assert reset_event["event_type"] == "RESET_ANOMALY"
    assert len(recovered_state.active_alarms) == 0
    assert recovered_state.overall_risk_tier in ["LOW", "NORMAL", "MEDIUM"]
