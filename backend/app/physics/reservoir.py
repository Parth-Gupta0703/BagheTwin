"""
SIH26120 Reservoir Inflow & Fluid Mobility Engine
Calculates fluid mobility (k/mu) and wellbore deliverability (IPR) under varying thermal states.
Uses temperature-adjusted productivity index (PI) coupled to the heavy-oil viscosity model.
Linear PI is the transparent engineering default for thermal heavy oil rather than Vogel.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.physics.units import bar_to_psi, psi_to_bar, bopd_to_m3_day, m3_day_to_bopd
from app.physics.viscosity import HeavyOilViscosityModel


class ReservoirModelConfig(BaseModel):
    model_name: str = "Thermal Mobility & Temperature-Adjusted PI Engine"
    model_version: str = "1.0.0"
    base_productivity_index_bopd_bar: float = Field(
        default=2.5,
        description="Reference liquid productivity index J_ref in bopd/bar at reference viscosity"
    )
    reference_viscosity_cp: float = Field(
        default=11500.0,
        description="Viscosity at which J_ref is calibrated"
    )
    permeability_md: float = Field(default=850.0, description="Estimated Jodhpur sandstone permeability in mD")
    net_pay_m: float = Field(default=15.0, description="Net pay thickness in meters")
    drainage_radius_m: float = Field(default=150.0, description="Estimated well drainage radius")
    wellbore_radius_m: float = Field(default=0.108, description="Wellbore radius (~8.5 inch hole = 0.108m)")
    skin_factor: float = Field(default=2.0, description="Near-wellbore mechanical skin factor")
    default_water_cut: float = Field(default=0.45, description="Synthetic base water cut (0.0 to 1.0)")
    calibration_status: str = "SYNTHETIC / TRANSPARENT REDUCED-ORDER"


class ReservoirInflowEngine:
    """
    Computes fluid inflow rate from Jodhpur sandstone reservoir into wellbore.
    """
    def __init__(
        self,
        config: Optional[ReservoirModelConfig] = None,
        viscosity_engine: Optional[HeavyOilViscosityModel] = None
    ):
        self.config = config or ReservoirModelConfig()
        self.viscosity_engine = viscosity_engine or HeavyOilViscosityModel()

    def calculate_effective_pi(self, viscosity_cp: float) -> float:
        """
        Compute effective productivity index J(T) scaled by mobility ratio:
        J(T) = J_ref * (mu_ref / mu(T))
        Viscosity reduction directly enhances near-wellbore Darcy mobility k/mu.
        """
        mu = max(1.0, viscosity_cp)
        # Bounded scaling to reflect that thermal zone is near-wellbore, not infinite reservoir
        # Radial composite model proxy: effective mobility increases significantly near wellbore
        mobility_ratio = (self.config.reference_viscosity_cp / mu) ** 0.65
        effective_pi = self.config.base_productivity_index_bopd_bar * mobility_ratio
        return float(effective_pi)

    def calculate_inflow(
        self,
        reservoir_pressure_bar: float,
        flowing_bhp_bar: float,
        temperature_c: float,
        water_cut: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculate liquid, oil, and water inflow rates based on thermal state and bottomhole drawdown.
        """
        wc = self.config.default_water_cut if water_cut is None else max(0.0, min(0.99, water_cut))

        # Physical drawdown constraint: Flowing BHP cannot exceed reservoir pressure for inflow
        drawdown_bar = max(0.0, reservoir_pressure_bar - flowing_bhp_bar)

        # Calculate current dynamic viscosity
        viscosity_cp = self.viscosity_engine.calculate_viscosity_cp(temperature_c)
        effective_pi = self.calculate_effective_pi(viscosity_cp)

        # Inflow liquid rate
        q_liquid_bpd = effective_pi * drawdown_bar
        q_oil_bpd = q_liquid_bpd * (1.0 - wc)
        q_water_bpd = q_liquid_bpd * wc

        # Fluid mobility proxy k / mu (mD / cP)
        fluid_mobility_md_cp = self.config.permeability_md / viscosity_cp

        return {
            "reservoir_pressure_bar": round(reservoir_pressure_bar, 2),
            "flowing_bhp_bar": round(flowing_bhp_bar, 2),
            "drawdown_bar": round(drawdown_bar, 2),
            "temperature_c": round(temperature_c, 2),
            "viscosity_cp": round(viscosity_cp, 1),
            "effective_pi_bpd_bar": round(effective_pi, 3),
            "fluid_mobility_md_cp": round(fluid_mobility_md_cp, 5),
            "water_cut": round(wc, 3),
            "liquid_inflow_bpd": round(q_liquid_bpd, 2),
            "oil_inflow_bopd": round(q_oil_bpd, 2),
            "water_inflow_bwpd": round(q_water_bpd, 2),
            "ipr_type": "LINEAR_PI_TEMPERATURE_SCALED",
            "model_metadata": {
                "model_name": self.config.model_name,
                "model_version": self.config.model_version,
                "calibration_status": self.config.calibration_status,
                "rationale": "Vogel IPR is not used because Baghewala is a thermal heavy oil reservoir where viscosity reduction dominates mobility rather than solution-gas evolution."
            }
        }

    def generate_ipr_curve(
        self,
        reservoir_pressure_bar: float,
        temperature_c: float,
        points: int = 20
    ) -> list[Dict[str, Any]]:
        """Generate IPR curve points (Flowing BHP vs Liquid Rate) for plotting."""
        curve = []
        p_step = reservoir_pressure_bar / max(1, points - 1)
        for i in range(points):
            p_wf = i * p_step
            res = self.calculate_inflow(reservoir_pressure_bar, p_wf, temperature_c)
            curve.append({
                "flowing_bhp_bar": round(p_wf, 2),
                "liquid_rate_bpd": round(res["liquid_inflow_bpd"], 2),
                "oil_rate_bopd": round(res["oil_inflow_bopd"], 2)
            })
        return curve
