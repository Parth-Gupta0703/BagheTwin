"""
SIH26120 Heavy-Oil Viscosity Engine
Standardized Andrade/Arrhenius temperature-dependent viscosity model.
Reference: ASTM D341 framework / Andrade liquid viscosity relationship.
Calibrated to match OIL Rajasthan Baghewala public reference point (~10,000-13,000 cP @ 50°C).
Explicitly marked as Synthetic/Configurable; NOT certified field calibration.
"""

import math
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.physics.units import c_to_k, k_to_c, cp_to_pa_s, UnitValue


class ViscosityModelConfig(BaseModel):
    """Configurable parameters for heavy-oil viscosity temperature dependency."""
    model_name: str = "Andrade-Arrhenius Reduced-Order Heavy Oil Viscosity"
    model_version: str = "1.0.0"
    reference_temp_c: float = Field(default=50.0, description="Reference temperature in °C (OIL public data point)")
    reference_viscosity_cp: float = Field(default=11500.0, description="Viscosity at ref temp in cP (OIL public data point ~10k-13k cP)")
    b_coefficient_k: float = Field(default=5200.0, description="Temperature sensitivity / activation energy parameter B in Kelvin")
    min_viscosity_cp: float = Field(default=5.0, description="Physical floor for high-temperature steam boundary in cP")
    max_viscosity_cp: float = Field(default=100000.0, description="Physical ceiling for cold reservoir boundary in cP")
    calibration_status: str = "DEMO / NOT FIELD CALIBRATED"
    data_source: str = "Synthetic / Configurable (Calibrated to OIL Rajasthan public point ~11,500 cP @ 50°C)"


class HeavyOilViscosityModel:
    """
    Computes dynamic viscosity mu(T) in cP and Pa·s based on temperature:
    mu(T) = mu_ref * exp(B * (1/T_K - 1/T_ref_K))
    """
    def __init__(self, config: Optional[ViscosityModelConfig] = None):
        self.config = config or ViscosityModelConfig()
        self.t_ref_k = c_to_k(self.config.reference_temp_c)

    def calculate_viscosity_cp(self, temp_c: float) -> float:
        """
        Calculate dynamic viscosity in centipoise (cP) at temperature temp_c (°C).
        Guarantees viscosity > 0 and bounded within physical limits.
        """
        if temp_c < -273.15:
            raise ValueError(f"Temperature {temp_c}°C is below absolute zero.")

        t_k = c_to_k(temp_c)
        exponent = self.config.b_coefficient_k * (1.0 / t_k - 1.0 / self.t_ref_k)

        # Guard against math overflow/underflow
        exponent = max(-20.0, min(20.0, exponent))
        mu_cp = self.config.reference_viscosity_cp * math.exp(exponent)

        # Clamping within engineering boundaries
        mu_cp = max(self.config.min_viscosity_cp, min(self.config.max_viscosity_cp, mu_cp))
        return float(mu_cp)

    def calculate_viscosity(self, temp_c: float) -> UnitValue:
        """Calculate dynamic viscosity with complete unit and provenance wrapper."""
        mu_cp = self.calculate_viscosity_cp(temp_c)
        return UnitValue(
            value=round(mu_cp, 2),
            unit="cP",
            model_name=self.config.model_name,
            model_version=self.config.model_version,
            source_type="derived",
            description=f"Calculated at {temp_c:.1f}°C using Andrade model ({self.config.calibration_status})"
        )

    def calculate_kinematic_viscosity_cst(self, temp_c: float, api_gravity: float = 18.0) -> float:
        """
        Calculate kinematic viscosity in cSt (mm²/s) given API gravity:
        rho = 141.5 / (131.5 + API) * 1000 kg/m³
        nu_cSt = mu_cP / (rho_g_cm3)
        """
        specific_gravity = 141.5 / (131.5 + api_gravity)
        mu_cp = self.calculate_viscosity_cp(temp_c)
        return mu_cp / specific_gravity

    def get_temperature_curve(self, t_min_c: float = 30.0, t_max_c: float = 260.0, steps: int = 50) -> list[Dict[str, Any]]:
        """Generate a viscosity-temperature curve for UI visualization."""
        step_size = (t_max_c - t_min_c) / max(1, steps - 1)
        curve = []
        for i in range(steps):
            t_c = t_min_c + i * step_size
            mu = self.calculate_viscosity_cp(t_c)
            curve.append({
                "temperature_c": round(t_c, 1),
                "viscosity_cp": round(mu, 2),
                "viscosity_pa_s": round(cp_to_pa_s(mu), 5)
            })
        return curve

    def get_provenance_metadata(self) -> Dict[str, Any]:
        """Expose calibration and assumption metadata for UI Provenance screens."""
        return {
            "model_name": self.config.model_name,
            "model_version": self.config.model_version,
            "data_source": self.config.data_source,
            "calibration_status": self.config.calibration_status,
            "equation": "mu(T) = mu_ref * exp(B * (1/T_K - 1/T_ref_K))",
            "reference_temp_c": self.config.reference_temp_c,
            "reference_viscosity_cp": self.config.reference_viscosity_cp,
            "b_coefficient_k": self.config.b_coefficient_k,
            "disclaimer": "Synthetic engineering calibration based on public domain literature and OIL Rajasthan heavy oil reports. Not approved field PVT data."
        }
