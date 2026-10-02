"""
SIH26120 Wellbore Hydraulics & State Engine
Calculates bottomhole flowing pressure (FBHP), pump intake pressure (PIP),
dynamic fluid level, hydrostatic gradient, and viscous tubing friction.
Monitors Reynolds number and detects laminar vs turbulent flow regimes.
"""

import math
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.physics.units import (
    bar_to_pa, pa_to_bar, mm_to_m, bopd_to_m3_s, UnitValue
)
from app.physics.viscosity import HeavyOilViscosityModel


class WellboreConfig(BaseModel):
    model_name: str = "Reduced-Order Hydrostatic + Hagen-Poiseuille Wellbore Engine"
    model_version: str = "1.0.0"
    gravity_m_s2: float = 9.80665
    casing_id_mm: float = 152.4   # 6-inch casing ID
    tubing_id_mm: float = 62.0    # 2-7/8 inch tubing ID (~62 mm)
    tubing_od_mm: float = 73.0    # 2-7/8 inch tubing OD (~73 mm)
    wellhead_backpressure_bar: float = 3.5
    geothermal_gradient_c_per_m: float = 0.025
    surface_ambient_temp_c: float = 32.0  # Rajasthan desert ambient surface temp
    calibration_status: str = "SYNTHETIC / TRANSPARENT REDUCED-ORDER"


class WellboreHydraulicsEngine:
    """
    Computes fluid pressures, temperatures, and viscous friction losses in the wellbore.
    """
    def __init__(
        self,
        config: Optional[WellboreConfig] = None,
        viscosity_engine: Optional[HeavyOilViscosityModel] = None
    ):
        self.config = config or WellboreConfig()
        self.viscosity_engine = viscosity_engine or HeavyOilViscosityModel()

    def calculate_mixture_density_kg_m3(
        self,
        api_gravity: float = 18.0,
        water_cut: float = 0.45
    ) -> float:
        """
        Calculate composite fluid density in kg/m3.
        Specific gravity of oil = 141.5 / (131.5 + API)
        Density of water = 1020 kg/m3 (produced water / brine)
        """
        sg_oil = 141.5 / (131.5 + api_gravity)
        rho_oil = sg_oil * 1000.0
        rho_water = 1020.0
        wc = max(0.0, min(1.0, water_cut))
        return (rho_oil * (1.0 - wc)) + (rho_water * wc)

    def calculate_wellbore_state(
        self,
        total_depth_m: float,
        pump_depth_m: float,
        liquid_rate_bpd: float,
        bottomhole_temp_c: float,
        flowing_bhp_bar: float,
        api_gravity: float = 18.0,
        water_cut: float = 0.45,
        casing_head_pressure_bar: float = 1.5
    ) -> Dict[str, Any]:
        """
        Compute dynamic fluid level, pump intake pressure (PIP), and friction losses.
        """
        rho_mix = self.calculate_mixture_density_kg_m3(api_gravity, water_cut)
        g = self.config.gravity_m_s2

        # 1. Temperature profile: linear thermal transition between bottomhole and surface
        temp_at_pump_c = bottomhole_temp_c - (
            (bottomhole_temp_c - self.config.surface_ambient_temp_c) *
            (max(0.0, total_depth_m - pump_depth_m) / max(1.0, total_depth_m))
        )
        viscosity_at_pump_cp = self.viscosity_engine.calculate_viscosity_cp(temp_at_pump_c)
        viscosity_at_pump_pa_s = viscosity_at_pump_cp * 0.001

        # 2. Fluid velocities & viscous friction in tubing
        d_tubing_m = mm_to_m(self.config.tubing_id_mm)
        area_tubing_m2 = math.pi * ((d_tubing_m / 2.0) ** 2)

        q_m3_s = bopd_to_m3_s(max(0.1, liquid_rate_bpd))
        velocity_m_s = q_m3_s / area_tubing_m2

        # Reynolds number Re = rho * v * D / mu
        reynolds = (rho_mix * velocity_m_s * d_tubing_m) / max(1e-6, viscosity_at_pump_pa_s)

        # Flow regime and Darcy friction factor
        if reynolds < 2100.0:
            regime = "LAMINAR"
            # Hagen-Poiseuille: f = 64 / Re
            f = 64.0 / max(0.1, reynolds)
        elif reynolds < 4000.0:
            regime = "TRANSITIONAL"
            f = 0.035
        else:
            regime = "TURBULENT"
            # Blasius formula approximation
            f = 0.3164 / (reynolds ** 0.25)

        # Frictional pressure drop in tubing (Pa)
        # dp_fric = f * (L / D) * (rho * v^2 / 2)
        tubing_length_m = pump_depth_m
        dp_fric_pa = f * (tubing_length_m / d_tubing_m) * (0.5 * rho_mix * (velocity_m_s ** 2))
        dp_fric_bar = pa_to_bar(dp_fric_pa)

        # 3. Dynamic fluid level in annulus
        # Hydrostatic head available above datum
        p_wf_pa = bar_to_pa(flowing_bhp_bar)
        p_casing_pa = bar_to_pa(casing_head_pressure_bar)
        effective_head_pa = max(0.0, p_wf_pa - p_casing_pa)
        fluid_column_height_m = effective_head_pa / (rho_mix * g)

        # Fluid level depth measured from surface
        fluid_level_depth_m = max(0.0, total_depth_m - fluid_column_height_m)

        # 4. Pump intake pressure (PIP)
        # Submergence of pump below dynamic fluid level:
        # submergence = pump_depth_m - fluid_level_depth_m
        # If fluid column extends above pump depth, PIP is positive hydrostatic + casing pressure
        if fluid_column_height_m >= (total_depth_m - pump_depth_m):
            submergence_m = fluid_column_height_m - (total_depth_m - pump_depth_m)
            p_intake_pa = p_casing_pa + (rho_mix * g * submergence_m)
        else:
            # Under-pumped / fluid level below pump intake (pump pumped-off condition)
            submergence_m = 0.0
            p_intake_pa = p_casing_pa * 0.5  # severely starved

        p_intake_bar = pa_to_bar(p_intake_pa)

        return {
            "total_depth_m": total_depth_m,
            "pump_depth_m": pump_depth_m,
            "bottomhole_temp_c": round(bottomhole_temp_c, 1),
            "temp_at_pump_c": round(temp_at_pump_c, 1),
            "viscosity_at_pump_cp": round(viscosity_at_pump_cp, 1),
            "mixture_density_kg_m3": round(rho_mix, 2),
            "flowing_bhp_bar": round(flowing_bhp_bar, 2),
            "pump_intake_pressure_bar": round(p_intake_bar, 2),
            "fluid_level_depth_m": round(fluid_level_depth_m, 2),
            "submergence_m": round(submergence_m, 2),
            "tubing_velocity_m_s": round(velocity_m_s, 3),
            "reynolds_number": round(reynolds, 2),
            "flow_regime": regime,
            "friction_factor": round(f, 4),
            "tubing_friction_loss_bar": round(dp_fric_bar, 2),
            "model_metadata": {
                "model_name": self.config.model_name,
                "model_version": self.config.model_version,
                "calibration_status": self.config.calibration_status,
                "disclaimer": "Coupled hydrostatic head and Hagen-Poiseuille viscous friction. Not multiphase transient."
            }
        }
