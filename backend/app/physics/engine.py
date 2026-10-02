"""
SIH26120 Master Petroleum Physics Simulator
Integrates Viscosity, Steam, Thermal, Reservoir Inflow, Wellbore Hydraulics,
SRP Mechanics, Production Deliverability Constraints, and Risk Assessment.
Enforces that pump capacity never creates reservoir inflow out of nowhere.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.physics.viscosity import HeavyOilViscosityModel
from app.physics.steam import SteamProperties
from app.physics.thermal import CSSThermalEngine
from app.physics.reservoir import ReservoirInflowEngine
from app.physics.wellbore import WellboreHydraulicsEngine
from app.physics.srp import SRPEngine
from app.physics.dynacard import DynaCardGenerator
from app.physics.risk import PhysicalRiskEngine
from app.physics.economics import OperatingEconomicsEngine


class WellParameters(BaseModel):
    """Static and geological wellbore characteristics."""
    well_code: str = "BGW-001"
    field: str = "Baghewala"
    reservoir_name: str = "Jodhpur Sandstone"
    measured_depth_m: float = 1050.0
    pump_depth_m: float = 950.0
    api_gravity: float = 18.0
    base_temperature_c: float = 48.0
    base_pressure_bar: float = 65.0
    permeability_md: float = 850.0
    net_pay_m: float = 15.0
    tubing_id_mm: float = 62.0
    rod_diameter_mm: float = 22.2  # 7/8 inch sucker rod
    pump_bore_mm: float = 57.15    # 2-1/4 inch insert pump
    base_water_cut: float = 0.45


class OperationalInputs(BaseModel):
    """Dynamic control set points (CSS and SRP)."""
    # CSS Set Points
    steam_mass_tonnes: float = 1200.0
    injection_pressure_bar: float = 85.0
    steam_quality: float = 0.80
    injection_duration_days: float = 12.0
    soak_duration_days: float = 5.0
    production_cutoff_days: float = 75.0
    # SRP Set Points
    stroke_in: float = 120.0
    spm: float = 5.5
    vfd_hz: float = 48.0
    pump_fillage: float = 0.85
    flowing_bhp_bar: float = 18.0
    uptime_factor: float = 0.96


class CoupledPhysicsSimulator:
    """
    Unified end-to-end physics simulator for heavy oil CSS + SRP well system.
    """
    def __init__(self):
        self.viscosity_engine = HeavyOilViscosityModel()
        self.steam_engine = SteamProperties()
        self.thermal_engine = CSSThermalEngine(
            viscosity_engine=self.viscosity_engine,
            steam_engine=self.steam_engine
        )
        self.reservoir_engine = ReservoirInflowEngine(viscosity_engine=self.viscosity_engine)
        self.wellbore_engine = WellboreHydraulicsEngine(viscosity_engine=self.viscosity_engine)
        self.srp_engine = SRPEngine()
        self.dynacard_engine = DynaCardGenerator()
        self.risk_engine = PhysicalRiskEngine()
        self.economics_engine = OperatingEconomicsEngine()

    def evaluate_state(
        self,
        well: WellParameters,
        ops: OperationalInputs,
        current_temp_c: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Evaluate full coupled instantaneous state of the well.
        """
        # 1. Thermal State
        temp_c = current_temp_c if current_temp_c is not None else well.base_temperature_c
        viscosity_cp = self.viscosity_engine.calculate_viscosity_cp(temp_c)

        # 2. Reservoir Deliverability
        inflow = self.reservoir_engine.calculate_inflow(
            reservoir_pressure_bar=well.base_pressure_bar,
            flowing_bhp_bar=ops.flowing_bhp_bar,
            temperature_c=temp_c,
            water_cut=well.base_water_cut
        )
        q_reservoir_liquid_bpd = inflow["liquid_inflow_bpd"]

        # 3. Wellbore Hydraulics
        wellbore = self.wellbore_engine.calculate_wellbore_state(
            total_depth_m=well.measured_depth_m,
            pump_depth_m=well.pump_depth_m,
            liquid_rate_bpd=q_reservoir_liquid_bpd,
            bottomhole_temp_c=temp_c,
            flowing_bhp_bar=ops.flowing_bhp_bar,
            api_gravity=well.api_gravity,
            water_cut=well.base_water_cut
        )
        submergence_m = wellbore["submergence_m"]
        viscosity_at_pump_cp = wellbore["viscosity_at_pump_cp"]

        # 4. Sucker Rod Pump Mechanics
        srp = self.srp_engine.evaluate_srp_state(
            stroke_in=ops.stroke_in,
            spm=ops.spm,
            vfd_hz=ops.vfd_hz,
            pump_bore_mm=well.pump_bore_mm,
            rod_diameter_mm=well.rod_diameter_mm,
            pump_depth_m=well.pump_depth_m,
            tubing_id_mm=well.tubing_id_mm,
            viscosity_cp=viscosity_at_pump_cp,
            fluid_density_kg_m3=wellbore["mixture_density_kg_m3"],
            pump_fillage=ops.pump_fillage,
            submergence_m=submergence_m
        )
        q_pump_capacity_bpd = srp["pump_capacity_bpd"]

        # 5. Production Coupling Constraint:
        # actual_liquid = min(reservoir_inflow, pump_capacity) * uptime
        actual_liquid_bpd = min(q_reservoir_liquid_bpd, q_pump_capacity_bpd) * ops.uptime_factor
        actual_oil_bopd = actual_liquid_bpd * (1.0 - well.base_water_cut)
        actual_water_bwpd = actual_liquid_bpd * well.base_water_cut

        # Steam-to-oil ratio (SOR) calculation
        # Amortized over cycle or daily
        steam_daily_equiv_t = ops.steam_mass_tonnes / max(1.0, ops.production_cutoff_days)
        sor = steam_daily_equiv_t / max(0.1, actual_oil_bopd)

        # 6. Physical Risk Assessment
        risk = self.risk_engine.evaluate_risks(
            floating_margin_kn=srp["floating_margin_kn"],
            rod_stress_ratio=srp["rod_stress_ratio"],
            pump_fillage_pct=srp["pump_fillage_pct"],
            viscosity_cp=viscosity_cp,
            sor=sor,
            submergence_m=submergence_m
        )

        # 7. Operating Economics
        daily_steam_cost = steam_daily_equiv_t * 2400.0  # ₹2400/t demo
        econ = self.economics_engine.evaluate_daily_economics(
            oil_rate_bopd=actual_oil_bopd,
            daily_electric_kwh=srp["energy_kwh_per_day"],
            overall_risk_score=risk["overall_risk_score"],
            daily_amortized_steam_cost_inr=daily_steam_cost
        )

        # 8. Dynamometer Card
        condition = "HIGH_DRAG_ROD_FLOAT" if srp["floating_margin_kn"] <= 2.0 else (
            "PUMP_OFF" if ops.pump_fillage < 0.55 else "NORMAL"
        )
        dynacard = self.dynacard_engine.generate_card(
            stroke_in=ops.stroke_in,
            pprl_kn=srp["pprl_kn"],
            mprl_kn=srp["mprl_kn"],
            condition=condition,
            pump_fillage_pct=srp["pump_fillage_pct"],
            floating_margin_kn=srp["floating_margin_kn"]
        )

        return {
            "well_code": well.well_code,
            "temperature_c": round(temp_c, 1),
            "viscosity_cp": round(viscosity_cp, 1),
            "reservoir_pressure_bar": round(well.base_pressure_bar, 1),
            "flowing_bhp_bar": round(ops.flowing_bhp_bar, 1),
            "drawdown_bar": round(inflow["drawdown_bar"], 1),
            "reservoir_inflow_bpd": round(q_reservoir_liquid_bpd, 1),
            "pump_capacity_bpd": round(q_pump_capacity_bpd, 1),
            "actual_liquid_bpd": round(actual_liquid_bpd, 1),
            "actual_oil_bopd": round(actual_oil_bopd, 1),
            "actual_water_bwpd": round(actual_water_bwpd, 1),
            "sor": round(sor, 2),
            "pprl_kn": srp["pprl_kn"],
            "mprl_kn": srp["mprl_kn"],
            "load_span_kn": srp["load_span_kn"],
            "drag_force_kn": srp["viscous_drag_kn"],
            "floating_margin_kn": srp["floating_margin_kn"],
            "pump_efficiency_pct": srp["pump_efficiency_pct"],
            "energy_kwh_day": srp["energy_kwh_per_day"],
            "energy_kwh_bbl": round(srp["energy_kwh_per_day"] / max(0.1, actual_oil_bopd), 2),
            "overall_risk_score": risk["overall_risk_score"],
            "overall_risk_tier": risk["overall_risk_tier"],
            "risk_details": risk,
            "economics": econ,
            "dynacard": dynacard,
            "wellbore_details": wellbore,
            "data_provenance": {
                "source_type": "SYNTHETIC / SIMULATED",
                "simulator_version": "1.0.0",
                "calibration_status": "DEMO / NOT FIELD VALIDATED",
                "disclaimer": "Coupled physics engine outputs. Synthetic demo data."
            }
        }

    def simulate_horizon(
        self,
        well: WellParameters,
        ops: OperationalInputs,
        horizon_days: int = 30
    ) -> Dict[str, Any]:
        """
        Simulate multi-day trajectory (30/60/90 days) for Scenario Lab.
        Follows CSS thermal decay and coupled daily production/risk evolution.
        """
        # Run CSS thermal cycle
        css_cycle = self.thermal_engine.simulate_css_cycle(
            steam_mass_tonnes=ops.steam_mass_tonnes,
            injection_pressure_bar=ops.injection_pressure_bar,
            steam_quality=ops.steam_quality,
            injection_duration_days=ops.injection_duration_days,
            soak_duration_days=ops.soak_duration_days,
            production_duration_days=float(horizon_days)
        )

        daily_points: List[Dict[str, Any]] = []
        cumulative_oil_bbl = 0.0
        cumulative_energy_kwh = 0.0

        for pt in css_cycle["timeline"]:
            day = pt["day"]
            temp_c = pt["temperature_c"]
            state = self.evaluate_state(well, ops, current_temp_c=temp_c)

            oil_day = state["actual_oil_bopd"]
            cumulative_oil_bbl += oil_day
            cumulative_energy_kwh += state["energy_kwh_day"]

            daily_points.append({
                "day": day,
                "temperature_c": temp_c,
                "viscosity_cp": state["viscosity_cp"],
                "oil_rate_bopd": oil_day,
                "water_rate_bwpd": state["actual_water_bwpd"],
                "cumulative_oil_bbl": round(cumulative_oil_bbl, 1),
                "sor": state["sor"],
                "energy_kwh": state["energy_kwh_day"],
                "floating_margin_kn": state["floating_margin_kn"],
                "rod_risk_score": state["risk_details"]["rod_float_risk"]["score"],
                "overall_risk_score": state["overall_risk_score"],
                "overall_risk_tier": state["overall_risk_tier"],
                "net_daily_margin_inr": state["economics"]["net_daily_margin_inr"]
            })

        return {
            "well_code": well.well_code,
            "horizon_days": horizon_days,
            "peak_temperature_c": css_cycle["peak_temperature_c"],
            "cumulative_oil_bbl": round(cumulative_oil_bbl, 1),
            "cumulative_energy_kwh": round(cumulative_energy_kwh, 1),
            "steam_energy_mj": css_cycle["steam_energy_mj"],
            "timeline": daily_points,
            "css_cycle_details": css_cycle,
            "data_provenance": {
                "source_type": "SYNTHETIC / SIMULATED",
                "simulator_version": "1.0.0",
                "calibration_status": "DEMO / NOT FIELD VALIDATED"
            }
        }
