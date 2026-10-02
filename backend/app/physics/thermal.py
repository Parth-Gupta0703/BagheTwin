"""
SIH26120 CSS Near-Wellbore Thermal Engine
Reduced-order energy balance with exponential formation cooling.
Models cyclic steam stimulation stages:
INJECTION -> SOAK -> PRODUCTION
Calculates peak near-wellbore temperature and thermal decay curve over 30/60/90/180 days.
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.physics.steam import SteamProperties
from app.physics.viscosity import HeavyOilViscosityModel


class ThermalModelConfig(BaseModel):
    model_name: str = "Reduced-Order CSS Heat Balance & Exponential Cooling"
    model_version: str = "1.0.0"
    base_reservoir_temp_c: float = Field(default=48.0, description="Undisturbed Jodhpur sandstone reservoir temp in °C (~46-48°C)")
    effective_heat_capacity_mj_c: float = Field(default=18000.0, description="Effective near-wellbore thermal capacitance C_eff in MJ/°C")
    thermal_efficiency_factor: float = Field(default=0.82, description="Fraction of delivered steam energy retained near wellbore during injection")
    conductive_loss_rate_per_day: float = Field(default=0.012, description="Base formation conduction decay constant lambda_cond (1/day)")
    convective_loss_rate_per_bopd: float = Field(default=0.00015, description="Additional cooling rate proportional to fluid production rate")
    soak_loss_rate_per_day: float = Field(default=0.025, description="Thermal equilibration decay rate during soak period")
    calibration_status: str = "SYNTHETIC / REDUCED-ORDER HEURISTIC"


class CSSThermalEngine:
    """
    Simulates thermal response of cyclic steam injection into heavy oil reservoir.
    """
    def __init__(
        self,
        thermal_config: Optional[ThermalModelConfig] = None,
        steam_engine: Optional[SteamProperties] = None,
        viscosity_engine: Optional[HeavyOilViscosityModel] = None
    ):
        self.config = thermal_config or ThermalModelConfig()
        self.steam_engine = steam_engine or SteamProperties()
        self.viscosity_engine = viscosity_engine or HeavyOilViscosityModel()

    def simulate_css_cycle(
        self,
        steam_mass_tonnes: float,
        injection_pressure_bar: float,
        steam_quality: float,
        injection_duration_days: float,
        soak_duration_days: float,
        production_duration_days: float,
        expected_avg_liquid_rate_bpd: float = 120.0
    ) -> Dict[str, Any]:
        """
        Simulate a full CSS cycle:
        1. Injection phase: Steam enthalpy delivered -> temperature increases up to T_sat or energy cap.
        2. Soak phase: Well shut in, temperature equilibrates / slight conductive loss.
        3. Production phase: Well on production, cooling via conductive loss + convective fluid extraction.
        """
        # Validate inputs
        steam_mass_tonnes = max(0.0, steam_mass_tonnes)
        injection_pressure_bar = max(5.0, injection_pressure_bar)
        steam_quality = max(0.0, min(1.0, steam_quality))
        soak_duration_days = max(0.1, soak_duration_days)
        production_duration_days = max(1.0, production_duration_days)

        # 1. Injection energetics
        steam_energy = self.steam_engine.evaluate_injection_energy(
            steam_mass_tonnes=steam_mass_tonnes,
            pressure_bar=injection_pressure_bar,
            quality=steam_quality,
            reservoir_temp_c=self.config.base_reservoir_temp_c
        )
        total_energy_mj = steam_energy["total_delivered_energy_mj"]
        t_sat_c = steam_energy["saturation_temperature_c"]

        # Net temperature rise in heated near-wellbore cylinder
        retained_energy_mj = total_energy_mj * self.config.thermal_efficiency_factor
        delta_t_theoretical = retained_energy_mj / max(1.0, self.config.effective_heat_capacity_mj_c)

        # Peak temperature cannot exceed steam saturation temperature at injection pressure
        t_peak_c = min(t_sat_c, self.config.base_reservoir_temp_c + delta_t_theoretical)

        # 2. Soak period cooling
        # During soak, heat diffuses slightly into adjacent cooler rock
        lambda_soak = self.config.soak_loss_rate_per_day
        delta_t_soak = (t_peak_c - self.config.base_reservoir_temp_c) * math.exp(-lambda_soak * soak_duration_days)
        t_post_soak_c = self.config.base_reservoir_temp_c + delta_t_soak

        # 3. Production period decay rate
        lambda_prod = self.config.conductive_loss_rate_per_day + (
            self.config.convective_loss_rate_per_bopd * expected_avg_liquid_rate_bpd
        )

        # Generate thermal and viscosity time series
        timeline: List[Dict[str, Any]] = []
        milestones = [1, 7, 14, 30, 60, 90, 180]
        milestone_temps: Dict[str, float] = {}
        milestone_viscosities: Dict[str, float] = {}

        total_days = int(math.ceil(production_duration_days))
        for day in range(total_days + 1):
            if day == 0:
                t_day_c = t_post_soak_c
            else:
                t_day_c = self.config.base_reservoir_temp_c + (t_post_soak_c - self.config.base_reservoir_temp_c) * math.exp(-lambda_prod * day)

            t_day_c = max(self.config.base_reservoir_temp_c, t_day_c)
            mu_day_cp = self.viscosity_engine.calculate_viscosity_cp(t_day_c)

            point = {
                "day": day,
                "temperature_c": round(t_day_c, 2),
                "viscosity_cp": round(mu_day_cp, 1),
                "viscosity_pa_s": round(mu_day_cp * 0.001, 4)
            }
            timeline.append(point)

            if day in milestones:
                milestone_temps[f"day_{day}"] = round(t_day_c, 2)
                milestone_viscosities[f"day_{day}"] = round(mu_day_cp, 1)

        return {
            "steam_energy_mj": round(total_energy_mj, 2),
            "steam_energy_kwh": steam_energy["total_delivered_energy_kwh"],
            "saturation_temperature_c": round(t_sat_c, 2),
            "peak_temperature_c": round(t_peak_c, 2),
            "post_soak_temperature_c": round(t_post_soak_c, 2),
            "base_reservoir_temp_c": self.config.base_reservoir_temp_c,
            "injection_duration_days": injection_duration_days,
            "soak_duration_days": soak_duration_days,
            "production_duration_days": production_duration_days,
            "production_cooling_lambda_per_day": round(lambda_prod, 5),
            "milestone_temperatures": milestone_temps,
            "milestone_viscosities": milestone_viscosities,
            "timeline": timeline,
            "model_metadata": {
                "model_name": self.config.model_name,
                "model_version": self.config.model_version,
                "calibration_status": self.config.calibration_status,
                "disclaimer": "Reduced-order heat balance with exponential cooling. Not a 3D reservoir simulator."
            }
        }
