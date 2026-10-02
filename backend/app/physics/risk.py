"""
SIH26120 Physical Risk & Equipment Failure Assessment Engine
Evaluates coupled risks across:
1. Rod-floating & carrier-bar separation
2. Rod string fatigue / tensile stress ratio
3. Pump starvation (pump-off) & fluid pound
4. Thermal cooling & rapid viscosity escalation
5. Steam-to-oil ratio (SOR) energy inefficiency
Exposes transparent sub-scores and physical threshold triggers.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class RiskModelConfig(BaseModel):
    model_name: str = "Deterministic Multi-Hazard Physics Risk Engine"
    model_version: str = "1.0.0"
    rod_floating_margin_critical_kn: float = 1.5
    rod_floating_margin_high_kn: float = 4.0
    rod_stress_ratio_alarm: float = 0.80
    pump_fillage_alarm_pct: float = 65.0
    viscosity_escalation_cp: float = 18000.0
    sor_high_alarm: float = 6.0
    calibration_status: str = "SYNTHETIC / RULE-BASED SAFETY ENVELOPE"


class PhysicalRiskEngine:
    """
    Computes transparent multi-criteria risk scores for well operations.
    """
    def __init__(self, config: Optional[RiskModelConfig] = None):
        self.config = config or RiskModelConfig()

    def evaluate_risks(
        self,
        floating_margin_kn: float,
        rod_stress_ratio: float,
        pump_fillage_pct: float,
        viscosity_cp: float,
        sor: float,
        submergence_m: float
    ) -> Dict[str, Any]:
        """
        Evaluate individual hazard channels and produce a consolidated risk profile.
        """
        hazard_details: List[str] = []

        # 1. Rod floating hazard
        if floating_margin_kn <= self.config.rod_floating_margin_critical_kn:
            float_score = 0.95
            float_tier = "CRITICAL"
            hazard_details.append(f"Critical rod floating margin ({floating_margin_kn:.1f} kN <= {self.config.rod_floating_margin_critical_kn} kN); carrier-bar separation imminent.")
        elif floating_margin_kn <= self.config.rod_floating_margin_high_kn:
            float_score = 0.70
            float_tier = "HIGH"
            hazard_details.append(f"Low rod floating margin ({floating_margin_kn:.1f} kN); downward descent severely retarded by viscous drag.")
        elif floating_margin_kn <= 7.0:
            float_score = 0.35
            float_tier = "MEDIUM"
        else:
            float_score = 0.08
            float_tier = "LOW"

        # 2. Sucker rod stress hazard
        if rod_stress_ratio >= 0.90:
            stress_score = 0.90
            stress_tier = "CRITICAL"
            hazard_details.append(f"Rod tensile stress near material yield ({rod_stress_ratio*100:.1f}%).")
        elif rod_stress_ratio >= self.config.rod_stress_ratio_alarm:
            stress_score = 0.65
            stress_tier = "HIGH"
            hazard_details.append(f"High rod load stress ratio ({rod_stress_ratio*100:.1f}%).")
        elif rod_stress_ratio >= 0.60:
            stress_score = 0.30
            stress_tier = "MEDIUM"
        else:
            stress_score = 0.10
            stress_tier = "LOW"

        # 3. Pump starvation hazard
        if pump_fillage_pct < 45.0 or submergence_m < 20.0:
            starvation_score = 0.85
            starvation_tier = "HIGH"
            hazard_details.append(f"Severe pump starvation (Fillage: {pump_fillage_pct:.1f}%, Submergence: {submergence_m:.1f}m); fluid pound risk.")
        elif pump_fillage_pct < self.config.pump_fillage_alarm_pct:
            starvation_score = 0.50
            starvation_tier = "MEDIUM"
            hazard_details.append(f"Sub-optimal pump fillage ({pump_fillage_pct:.1f}%).")
        else:
            starvation_score = 0.10
            starvation_tier = "LOW"

        # 4. Viscosity / thermal cooling hazard
        if viscosity_cp >= self.config.viscosity_escalation_cp:
            thermal_score = 0.80
            thermal_tier = "HIGH"
            hazard_details.append(f"Near-wellbore cooling has escalated crude viscosity to {viscosity_cp:.0f} cP.")
        elif viscosity_cp >= 12000.0:
            thermal_score = 0.45
            thermal_tier = "MEDIUM"
        else:
            thermal_score = 0.12
            thermal_tier = "LOW"

        # 5. Energy efficiency (SOR) hazard
        if sor >= 8.0:
            energy_score = 0.80
            energy_tier = "HIGH"
            hazard_details.append(f"Excessive Steam-to-Oil Ratio ({sor:.2f} t/bbl); severe thermal efficiency loss.")
        elif sor >= self.config.sor_high_alarm:
            energy_score = 0.45
            energy_tier = "MEDIUM"
        else:
            energy_score = 0.10
            energy_tier = "LOW"

        # Composite overall risk (weighted maximum emphasizing acute mechanical failure)
        overall_score = max(
            float_score * 0.95,
            stress_score * 0.90,
            starvation_score * 0.70,
            (float_score * 0.35 + stress_score * 0.25 + starvation_score * 0.15 + thermal_score * 0.15 + energy_score * 0.10)
        )
        overall_score = round(min(1.0, max(0.0, overall_score)), 2)

        if overall_score >= 0.75:
            overall_tier = "CRITICAL"
        elif overall_score >= 0.50:
            overall_tier = "HIGH"
        elif overall_score >= 0.25:
            overall_tier = "MEDIUM"
        else:
            overall_tier = "LOW"

        if not hazard_details:
            hazard_details.append("Well operating stably within normal engineering envelope.")

        return {
            "overall_risk_score": overall_score,
            "overall_risk_tier": overall_tier,
            "rod_float_risk": {
                "score": round(float_score, 2),
                "tier": float_tier,
                "margin_kn": round(floating_margin_kn, 2)
            },
            "rod_stress_risk": {
                "score": round(stress_score, 2),
                "tier": stress_tier,
                "stress_ratio": round(rod_stress_ratio, 3)
            },
            "pump_starvation_risk": {
                "score": round(starvation_score, 2),
                "tier": starvation_tier,
                "fillage_pct": round(pump_fillage_pct, 1)
            },
            "thermal_viscosity_risk": {
                "score": round(thermal_score, 2),
                "tier": thermal_tier,
                "viscosity_cp": round(viscosity_cp, 1)
            },
            "sor_energy_risk": {
                "score": round(energy_score, 2),
                "tier": energy_tier,
                "sor": round(sor, 2)
            },
            "active_alarms": hazard_details,
            "model_metadata": {
                "model_name": self.config.model_name,
                "model_version": self.config.model_version,
                "calibration_status": self.config.calibration_status
            }
        }
