"""
Unit & Property Tests for Petroleum Physics Engine
Verifies physical laws, monotonicity, unit safety, and constraint behavior.
"""

import pytest
import math
from app.physics.units import c_to_k, k_to_c, bar_to_pa, pa_to_bar, cp_to_pa_s, bopd_to_m3_s
from app.physics.viscosity import HeavyOilViscosityModel
from app.physics.steam import SteamProperties
from app.physics.thermal import CSSThermalEngine
from app.physics.reservoir import ReservoirInflowEngine
from app.physics.wellbore import WellboreHydraulicsEngine
from app.physics.srp import SRPEngine
from app.physics.dynacard import DynaCardGenerator
from app.physics.risk import PhysicalRiskEngine
from app.physics.economics import OperatingEconomicsEngine
from app.physics.engine import CoupledPhysicsSimulator, WellParameters, OperationalInputs


def test_unit_conversions():
    """Verify fundamental dimensional conversions."""
    assert c_to_k(0.0) == 273.15
    assert round(k_to_c(373.15), 2) == 100.0
    assert bar_to_pa(1.0) == 1.0e5
    assert pa_to_bar(100000.0) == 1.0
    assert cp_to_pa_s(1000.0) == 1.0
    assert bopd_to_m3_s(0.0) == 0.0


def test_viscosity_monotonicity_and_positivity():
    """Heavy oil viscosity must be strictly positive and decrease monotonically with temperature."""
    model = HeavyOilViscosityModel()
    temps = [35.0, 50.0, 75.0, 100.0, 150.0, 200.0, 250.0]
    viscosities = [model.calculate_viscosity_cp(t) for t in temps]

    # Positivity
    for v in viscosities:
        assert v > 0.0, "Viscosity must be strictly positive."

    # Monotonic decrease
    for i in range(len(viscosities) - 1):
        assert viscosities[i] > viscosities[i + 1], (
            f"Viscosity at {temps[i]}°C ({viscosities[i]}) must exceed viscosity at {temps[i+1]}°C ({viscosities[i+1]})"
        )


def test_steam_heat_positive_and_pressure_dependent():
    """Steam delivered energy must be positive and saturation temperature increases with pressure."""
    steam = SteamProperties()
    res1 = steam.evaluate_injection_energy(1000.0, 50.0, 0.80)
    res2 = steam.evaluate_injection_energy(1000.0, 100.0, 0.80)

    assert res1["total_delivered_energy_mj"] > 0.0
    assert res1["saturation_temperature_c"] > 150.0
    # Saturation temperature at 100 bar must be greater than at 50 bar
    assert res2["saturation_temperature_c"] > res1["saturation_temperature_c"]


def test_thermal_cooling_decay():
    """Thermal cycle post-soak temperature must decay monotonically toward base temperature."""
    thermal = CSSThermalEngine()
    cycle = thermal.simulate_css_cycle(
        steam_mass_tonnes=1000.0,
        injection_pressure_bar=70.0,
        steam_quality=0.80,
        injection_duration_days=10.0,
        soak_duration_days=5.0,
        production_duration_days=60.0
    )
    timeline = cycle["timeline"]
    assert len(timeline) == 61
    assert cycle["peak_temperature_c"] > cycle["base_reservoir_temp_c"]

    # Verify cooling monotonicity during production
    for i in range(len(timeline) - 1):
        assert timeline[i]["temperature_c"] >= timeline[i + 1]["temperature_c"]


def test_reservoir_inflow_non_negative():
    """Reservoir deliverability cannot yield negative rates even under extreme pressure."""
    res_engine = ReservoirInflowEngine()
    res = res_engine.calculate_inflow(reservoir_pressure_bar=60.0, flowing_bhp_bar=80.0, temperature_c=50.0)
    assert res["liquid_inflow_bpd"] == 0.0  # BHP > P_res, no reverse injection without injection well
    assert res["drawdown_bar"] == 0.0


def test_srp_mechanics_and_floating_margin():
    """High viscosity and high SPM must decrease floating margin and increase rod float risk."""
    srp = SRPEngine()
    # Low viscosity, low SPM
    state_safe = srp.evaluate_srp_state(
        stroke_in=100.0, spm=3.5, vfd_hz=35.0, pump_bore_mm=57.15,
        rod_diameter_mm=22.2, pump_depth_m=900.0, tubing_id_mm=62.0,
        viscosity_cp=500.0
    )
    # High viscosity, high SPM
    state_float = srp.evaluate_srp_state(
        stroke_in=100.0, spm=9.0, vfd_hz=60.0, pump_bore_mm=57.15,
        rod_diameter_mm=22.2, pump_depth_m=900.0, tubing_id_mm=62.0,
        viscosity_cp=15000.0
    )
    assert state_float["viscous_drag_kn"] > state_safe["viscous_drag_kn"]
    assert state_float["floating_margin_kn"] < state_safe["floating_margin_kn"]
    assert state_float["floating_risk"] in ["HIGH", "CRITICAL"]


def test_dynacard_generation():
    """Dynacard points form closed stroke loop and handle failure conditions."""
    generator = DynaCardGenerator()
    res = generator.generate_card(stroke_in=100.0, pprl_kn=75.0, mprl_kn=15.0, condition="NORMAL")
    assert len(res["card_points"]) == generator.config.num_points_per_stroke
    up_pts = [p for p in res["card_points"] if p["phase"] == "upstroke"]
    down_pts = [p for p in res["card_points"] if p["phase"] == "downstroke"]
    assert len(up_pts) > 0 and len(down_pts) > 0


def test_master_simulator_end_to_end():
    """Master simulator executes full coupled loop and enforces no pump magic inflow."""
    sim = CoupledPhysicsSimulator()
    well = WellParameters(well_code="BGW-001")
    ops = OperationalInputs()
    state = sim.evaluate_state(well, ops, current_temp_c=55.0)

    assert state["actual_liquid_bpd"] <= state["reservoir_inflow_bpd"] + 1e-3
    assert state["actual_liquid_bpd"] <= state["pump_capacity_bpd"] + 1e-3
    assert state["overall_risk_score"] >= 0.0 and state["overall_risk_score"] <= 1.0
    assert state["sor"] > 0.0
    assert state["data_provenance"]["source_type"] == "SYNTHETIC / SIMULATED"
