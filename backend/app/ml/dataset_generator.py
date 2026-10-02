"""
SIH26120 Synthetic Well & Telemetry Dataset Generator
Generates realistic multi-well historical time-series datasets based on the coupled physics engine.
Uses reproducible random seeds. All outputs are strictly labelled as SYNTHETIC / DEMO.
"""

import math
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from app.physics.engine import CoupledPhysicsSimulator, WellParameters, OperationalInputs


class SyntheticDatasetGenerator:
    """
    Generates structured synthetic fleets, CSS cycles, and daily operational history.
    """
    def __init__(self, random_seed: int = 42):
        self.random_seed = random_seed
        self.simulator = CoupledPhysicsSimulator()
        random.seed(random_seed)
        np.random.seed(random_seed)

    def get_fleet_well_archetypes(self) -> List[Dict[str, Any]]:
        """
        Define 12 distinct demo well configurations with characteristic operating archetypes.
        """
        return [
            {
                "well_code": "BGW-001",
                "name": "Baghewala North 01 (Normal Operating State)",
                "archetype": "NORMAL_OPERATING",
                "measured_depth_m": 1050.0,
                "pump_depth_m": 950.0,
                "api_gravity": 18.2,
                "base_temperature_c": 72.0,
                "base_pressure_bar": 68.0,
                "permeability_md": 880.0,
                "net_pay_m": 16.0,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.40,
                # Operational setpoints
                "current_days_since_steam": 16,
                "stroke_in": 100.0,
                "spm": 4.8,
                "steam_mass_tonnes": 1250.0,
                "injection_pressure_bar": 85.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 80.0,
                "status": "NORMAL"
            },
            {
                "well_code": "BGW-002",
                "name": "Baghewala East 02 (Thermal Decline)",
                "archetype": "THERMAL_DECLINE",
                "measured_depth_m": 1020.0,
                "pump_depth_m": 920.0,
                "api_gravity": 18.0,
                "base_temperature_c": 54.0,
                "base_pressure_bar": 66.0,
                "permeability_md": 850.0,
                "net_pay_m": 15.5,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.42,
                "current_days_since_steam": 55,
                "stroke_in": 110.0,
                "spm": 5.4,
                "steam_mass_tonnes": 1150.0,
                "injection_pressure_bar": 84.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 75.0,
                "status": "WARNING"
            },
            {
                "well_code": "BGW-003",
                "name": "Baghewala West 03 (High Viscosity)",
                "archetype": "HIGH_VISCOSITY",
                "measured_depth_m": 1100.0,
                "pump_depth_m": 1000.0,
                "api_gravity": 17.5,
                "base_temperature_c": 48.0,
                "base_pressure_bar": 64.0,
                "permeability_md": 760.0,
                "net_pay_m": 14.0,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.45,
                "current_days_since_steam": 78,
                "stroke_in": 90.0,
                "spm": 4.2,
                "steam_mass_tonnes": 1000.0,
                "injection_pressure_bar": 80.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 70.0,
                "status": "ATTENTION_REQUIRED"
            },
            {
                "well_code": "BGW-004",
                "name": "Baghewala Central 04 (High Rod Loading)",
                "archetype": "HIGH_ROD_LOADING",
                "measured_depth_m": 1080.0,
                "pump_depth_m": 980.0,
                "api_gravity": 18.0,
                "base_temperature_c": 56.0,
                "base_pressure_bar": 70.0,
                "permeability_md": 890.0,
                "net_pay_m": 16.5,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 63.5,  # Larger bore increases fluid head load
                "base_water_cut": 0.44,
                "current_days_since_steam": 30,
                "stroke_in": 144.0,
                "spm": 8.8,  # High speed & stroke produces high peak polished rod load
                "steam_mass_tonnes": 1200.0,
                "injection_pressure_bar": 85.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 75.0,
                "status": "ATTENTION_REQUIRED"
            },
            {
                "well_code": "BGW-005",
                "name": "Baghewala South 05 (High SOR)",
                "archetype": "HIGH_SOR",
                "measured_depth_m": 1080.0,
                "pump_depth_m": 980.0,
                "api_gravity": 17.0,
                "base_temperature_c": 52.0,
                "base_pressure_bar": 60.0,
                "permeability_md": 480.0,  # Tight zone
                "net_pay_m": 11.5,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 50.8,
                "base_water_cut": 0.58,
                "current_days_since_steam": 22,
                "stroke_in": 96.0,
                "spm": 3.8,
                "steam_mass_tonnes": 1950.0,  # Excessive steam injection relative to oil yield
                "injection_pressure_bar": 95.0,
                "soak_duration_days": 7.0,
                "production_cutoff_days": 85.0,
                "status": "WARNING"
            },
            {
                "well_code": "BGW-006",
                "name": "Baghewala Deep 06 (Pump Efficiency Issue)",
                "archetype": "PUMP_EFFICIENCY_ISSUE",
                "measured_depth_m": 1150.0,
                "pump_depth_m": 1050.0,
                "api_gravity": 17.6,
                "base_temperature_c": 50.0,
                "base_pressure_bar": 62.0,
                "permeability_md": 620.0,
                "net_pay_m": 13.0,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.46,
                "current_days_since_steam": 42,
                "stroke_in": 120.0,
                "spm": 7.2,  # Over-pumped vs reservoir deliverability -> severe fluid pound / low fillage
                "steam_mass_tonnes": 1100.0,
                "injection_pressure_bar": 82.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 70.0,
                "status": "ATTENTION_REQUIRED"
            },
            {
                "well_code": "BGW-007",
                "name": "Baghewala East 07 (High Floating Risk)",
                "archetype": "HIGH_FLOATING_RISK",
                "measured_depth_m": 1060.0,
                "pump_depth_m": 960.0,
                "api_gravity": 17.5,
                "base_temperature_c": 49.0,  # Thermal decline
                "base_pressure_bar": 64.0,
                "permeability_md": 760.0,
                "net_pay_m": 15.0,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.44,
                "current_days_since_steam": 72,  # Late cooling cycle -> high viscosity & high Couette drag
                "stroke_in": 120.0,
                "spm": 7.6,  # Aggressive speed while cold -> collapses downstroke margin < 2.0 kN
                "steam_mass_tonnes": 1180.0,
                "injection_pressure_bar": 84.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 75.0,
                "status": "CRITICAL"
            },
            {
                "well_code": "BGW-008",
                "name": "Baghewala North 08 (Thermal Recovery Opportunity)",
                "archetype": "THERMAL_RECOVERY_OPPORTUNITY",
                "measured_depth_m": 1030.0,
                "pump_depth_m": 930.0,
                "api_gravity": 18.1,
                "base_temperature_c": 46.0,  # Depleted heat -> ripe for re-steaming
                "base_pressure_bar": 61.0,
                "permeability_md": 840.0,
                "net_pay_m": 16.0,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.48,
                "current_days_since_steam": 92,  # Cycle finished, massive potential recovery delta with CSS
                "stroke_in": 84.0,
                "spm": 3.6,
                "steam_mass_tonnes": 950.0,
                "injection_pressure_bar": 80.0,
                "soak_duration_days": 4.0,
                "production_cutoff_days": 65.0,
                "status": "ATTENTION_REQUIRED"
            },
            {
                "well_code": "BGW-009",
                "name": "Baghewala South 09 (Low Steam Scenario)",
                "archetype": "LOW_STEAM_UNDER_HEATED",
                "measured_depth_m": 1040.0,
                "pump_depth_m": 940.0,
                "api_gravity": 17.2,
                "base_temperature_c": 46.8,
                "base_pressure_bar": 61.0,
                "permeability_md": 790.0,
                "net_pay_m": 14.0,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.46,
                "current_days_since_steam": 25,
                "stroke_in": 96.0,
                "spm": 4.2,
                "steam_mass_tonnes": 700.0,  # Under-steamed
                "injection_pressure_bar": 72.0,
                "soak_duration_days": 4.0,
                "production_cutoff_days": 60.0,
                "status": "WARNING"
            },
            {
                "well_code": "BGW-010",
                "name": "Baghewala West 10 (Fresh CSS Recovery)",
                "archetype": "NEW_CSS_CYCLE_RECOVERY",
                "measured_depth_m": 1010.0,
                "pump_depth_m": 910.0,
                "api_gravity": 18.6,
                "base_temperature_c": 48.2,
                "base_pressure_bar": 75.0,
                "permeability_md": 980.0,
                "net_pay_m": 19.0,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.35,
                "current_days_since_steam": 5,  # Peak thermal window
                "stroke_in": 120.0,
                "spm": 5.2,
                "steam_mass_tonnes": 1400.0,
                "injection_pressure_bar": 88.0,
                "soak_duration_days": 6.0,
                "production_cutoff_days": 85.0,
                "status": "NORMAL"
            },
            {
                "well_code": "BGW-011",
                "name": "Baghewala Central 11 (Near-Constraint Boundary)",
                "archetype": "NEAR_CONSTRAINT_BOUNDARY",
                "measured_depth_m": 1070.0,
                "pump_depth_m": 970.0,
                "api_gravity": 17.4,
                "base_temperature_c": 47.2,
                "base_pressure_bar": 66.0,
                "permeability_md": 840.0,
                "net_pay_m": 15.5,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.43,
                "current_days_since_steam": 40,
                "stroke_in": 138.0,
                "spm": 7.8,  # Operating near allowable mechanical stress limit
                "steam_mass_tonnes": 1220.0,
                "injection_pressure_bar": 85.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 75.0,
                "status": "WARNING"
            },
            {
                "well_code": "BGW-012",
                "name": "Baghewala South 12 (Thermal Bypass / Water Cut)",
                "archetype": "HIGH_WATER_CUT_BYPASS",
                "measured_depth_m": 1090.0,
                "pump_depth_m": 990.0,
                "api_gravity": 17.1,
                "base_temperature_c": 46.5,
                "base_pressure_bar": 59.0,
                "permeability_md": 710.0,
                "net_pay_m": 13.5,
                "tubing_id_mm": 62.0,
                "rod_diameter_mm": 22.2,
                "pump_bore_mm": 57.15,
                "base_water_cut": 0.68,  # High water cut
                "current_days_since_steam": 50,
                "stroke_in": 108.0,
                "spm": 5.0,
                "steam_mass_tonnes": 1150.0,
                "injection_pressure_bar": 82.0,
                "soak_duration_days": 5.0,
                "production_cutoff_days": 70.0,
                "status": "WARNING"
            }
        ]

    def generate_full_historical_telemetry(
        self,
        days_history: int = 180,
        start_date: Optional[datetime] = None
    ) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Generate complete historical data:
        - wells_df: static well configurations
        - telemetry_df: daily time-series telemetry records
        - css_cycles_df: historical CSS cycles
        """
        if start_date is None:
            # Anchor so current demo date falls at the end of the history
            start_date = datetime(2026, 3, 1)

        fleet = self.get_fleet_well_archetypes()
        wells_records = []
        telemetry_records = []
        css_records = []

        cycle_duration = 75  # ~75 days per CSS cycle

        for well_cfg in fleet:
            well_params = WellParameters(
                well_code=well_cfg["well_code"],
                field="Baghewala",
                reservoir_name="Jodhpur Sandstone",
                measured_depth_m=well_cfg["measured_depth_m"],
                pump_depth_m=well_cfg["pump_depth_m"],
                api_gravity=well_cfg["api_gravity"],
                base_temperature_c=well_cfg["base_temperature_c"],
                base_pressure_bar=well_cfg["base_pressure_bar"],
                permeability_md=well_cfg["permeability_md"],
                net_pay_m=well_cfg["net_pay_m"],
                tubing_id_mm=well_cfg["tubing_id_mm"],
                rod_diameter_mm=well_cfg["rod_diameter_mm"],
                pump_bore_mm=well_cfg["pump_bore_mm"],
                base_water_cut=well_cfg["base_water_cut"]
            )

            wells_records.append({
                "well_code": well_cfg["well_code"],
                "name": well_cfg["name"],
                "archetype": well_cfg["archetype"],
                "field": "Baghewala",
                "reservoir_name": "Jodhpur Sandstone",
                "measured_depth_m": well_cfg["measured_depth_m"],
                "pump_depth_m": well_cfg["pump_depth_m"],
                "api_gravity": well_cfg["api_gravity"],
                "base_temperature_c": well_cfg["base_temperature_c"],
                "base_pressure_bar": well_cfg["base_pressure_bar"],
                "permeability_md": well_cfg["permeability_md"],
                "net_pay_m": well_cfg["net_pay_m"],
                "tubing_id_mm": well_cfg["tubing_id_mm"],
                "rod_diameter_mm": well_cfg["rod_diameter_mm"],
                "pump_bore_mm": well_cfg["pump_bore_mm"],
                "base_water_cut": well_cfg["base_water_cut"],
                "status": well_cfg["status"],
                "data_status": "SYNTHETIC / DEMO"
            })

            # Generate multiple CSS cycles across historical horizon
            num_cycles = max(2, int(math.ceil(days_history / cycle_duration)))
            cycle_start_day = 0

            for c_idx in range(num_cycles):
                c_start_dt = start_date + timedelta(days=cycle_start_day)
                css_records.append({
                    "well_code": well_cfg["well_code"],
                    "cycle_number": c_idx + 1,
                    "start_at": c_start_dt.isoformat(),
                    "steam_mass_tonnes": well_cfg["steam_mass_tonnes"],
                    "injection_pressure_bar": well_cfg["injection_pressure_bar"],
                    "steam_quality": 0.80,
                    "injection_duration_days": 10.0,
                    "soak_duration_days": well_cfg["soak_duration_days"],
                    "production_duration_days": well_cfg["production_cutoff_days"],
                    "source_type": "SYNTHETIC"
                })
                cycle_start_day += cycle_duration

            # Simulate daily telemetry
            # Align the last day of simulation to current_days_since_steam for that well archetype
            offset_days = (days_history - well_cfg["current_days_since_steam"]) % cycle_duration

            for d in range(days_history):
                dt = start_date + timedelta(days=d)
                day_in_cycle = (d + offset_days) % cycle_duration

                # Thermal decay curve within current cycle
                # Steam injection (day 0-10) -> soak (day 10-15) -> production (day 15+)
                if day_in_cycle < 10:
                    stage = "INJECTION"
                    t_c = well_cfg["base_temperature_c"] + (210.0 - well_cfg["base_temperature_c"]) * ((day_in_cycle + 1) / 10.0)
                    fillage = 0.90
                elif day_in_cycle < 15:
                    stage = "SOAK"
                    t_c = 210.0 * math.exp(-0.02 * (day_in_cycle - 10))
                    fillage = 0.90
                else:
                    stage = "PRODUCTION"
                    prod_day = day_in_cycle - 15
                    t_c = well_cfg["base_temperature_c"] + (185.0 - well_cfg["base_temperature_c"]) * math.exp(-0.028 * prod_day)
                    fillage = 0.85

                # Small realistic sensor noise (~0.5%)
                noise = np.random.normal(0.0, 0.005)
                t_c = max(well_cfg["base_temperature_c"], t_c * (1.0 + noise))

                ops = OperationalInputs(
                    stroke_in=well_cfg["stroke_in"],
                    spm=well_cfg["spm"],
                    vfd_hz=well_cfg["spm"] * 8.0,
                    pump_fillage=fillage,
                    steam_mass_tonnes=well_cfg["steam_mass_tonnes"],
                    injection_pressure_bar=well_cfg["injection_pressure_bar"]
                )

                state = self.simulator.evaluate_state(well_params, ops, current_temp_c=t_c)

                telemetry_records.append({
                    "well_code": well_cfg["well_code"],
                    "timestamp": dt.isoformat(),
                    "source_type": "SYNTHETIC",
                    "stage": stage,
                    "temperature_c": state["temperature_c"],
                    "viscosity_cp": state["viscosity_cp"],
                    "reservoir_pressure_bar": state["reservoir_pressure_bar"],
                    "flowing_bhp_bar": state["flowing_bhp_bar"],
                    "oil_rate_bopd": state["actual_oil_bopd"],
                    "water_rate_bwpd": state["actual_water_bwpd"],
                    "stroke_in": ops.stroke_in,
                    "spm": ops.spm,
                    "vfd_hz": ops.vfd_hz,
                    "pprl_kn": state["pprl_kn"],
                    "mprl_kn": state["mprl_kn"],
                    "drag_force_kn": state["drag_force_kn"],
                    "floating_margin_kn": state["floating_margin_kn"],
                    "pump_efficiency_pct": state["pump_efficiency_pct"],
                    "energy_kwh": state["energy_kwh_day"],
                    "sor": state["sor"],
                    "overall_risk_score": state["overall_risk_score"],
                    "overall_risk_tier": state["overall_risk_tier"]
                })

        wells_df = pd.DataFrame(wells_records)
        telemetry_df = pd.DataFrame(telemetry_records)
        css_cycles_df = pd.DataFrame(css_records)

        return wells_df, telemetry_df, css_cycles_df
