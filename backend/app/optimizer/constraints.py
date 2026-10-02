"""
SIH26120 Operating & Safety Constraint Engine
Centralizes physical safety limits for CSS and SRP operating candidates.
Strictly rejects unsafe operating points prior to Pareto objective ranking.
Records explicit rejection reasons for full explainability.
"""

from typing import Dict, Any, List, Tuple
from pydantic import BaseModel, Field


class ConstraintConfig(BaseModel):
    # CSS Constraints
    min_steam_mass_tonnes: float = 600.0
    max_steam_mass_tonnes: float = 2200.0
    min_injection_pressure_bar: float = 50.0
    max_injection_pressure_bar: float = 100.0  # Formation fracture safety ceiling
    min_soak_days: float = 3.0
    max_soak_days: float = 12.0
    min_production_days: float = 40.0
    max_production_days: float = 120.0

    # SRP Constraints
    min_stroke_in: float = 64.0
    max_stroke_in: float = 168.0
    min_spm: float = 2.0
    max_spm: float = 10.5
    min_vfd_hz: float = 20.0
    max_vfd_hz: float = 60.0

    # Mechanical Safety Constraints (HARD REJECTION BOUNDARIES)
    min_floating_margin_kn: float = 2.0     # Critical carrier-bar separation threshold
    max_rod_stress_ratio: float = 0.80      # Sucker rod tensile endurance limit
    min_pump_fillage_pct: float = 50.0      # Starvation / severe fluid pound limit
    max_sor: float = 7.0                    # Steam efficiency ceiling


class CandidateConstraintEvaluator:
    """
    Evaluates candidate setpoints against hard physical limits.
    """
    def __init__(self, config: Optional[ConstraintConfig] = None):
        self.config = config or ConstraintConfig()

    def evaluate_candidate(
        self,
        candidate_params: Dict[str, float],
        simulated_state: Dict[str, Any]
    ) -> Tuple[bool, List[str]]:
        """
        Check all constraints.
        Returns:
            is_feasible (bool): True if all constraints pass.
            reasons (List[str]): List of violation descriptions if rejected.
        """
        violations: List[str] = []

        # 1. Parameter Envelope Checks
        p_inj = candidate_params.get("injection_pressure_bar", 80.0)
        if p_inj > self.config.max_injection_pressure_bar:
            violations.append(f"Injection pressure ({p_inj:.1f} bar) exceeds reservoir fracture limit ({self.config.max_injection_pressure_bar} bar).")
        if p_inj < self.config.min_injection_pressure_bar:
            violations.append(f"Injection pressure ({p_inj:.1f} bar) below minimum formation injectivity ({self.config.min_injection_pressure_bar} bar).")

        spm = candidate_params.get("spm", 5.0)
        if spm > self.config.max_spm:
            violations.append(f"SPM ({spm:.1f}) exceeds mechanical surface unit ceiling ({self.config.max_spm}).")
        if spm < self.config.min_spm:
            violations.append(f"SPM ({spm:.1f}) below prime mover operational floor ({self.config.min_spm}).")

        stroke = candidate_params.get("stroke_in", 120.0)
        if stroke > self.config.max_stroke_in or stroke < self.config.min_stroke_in:
            violations.append(f"Stroke length ({stroke:.1f} in) outside allowable beam geometry [{self.config.min_stroke_in}, {self.config.max_stroke_in}].")

        # 2. Downhole Mechanical Safety (CRITICAL REJECTION RULES)
        floating_margin = simulated_state.get("floating_margin_kn", 5.0)
        if floating_margin < self.config.min_floating_margin_kn:
            violations.append(
                f"REJECTED: Floating margin ({floating_margin:.2f} kN) below safety floor ({self.config.min_floating_margin_kn} kN). Severe risk of rod floating & carrier bar separation."
            )

        rod_stress_ratio = simulated_state.get("risk_details", {}).get("rod_stress_risk", {}).get("stress_ratio", 0.5)
        if rod_stress_ratio > self.config.max_rod_stress_ratio:
            violations.append(
                f"REJECTED: Rod tensile stress ratio ({rod_stress_ratio*100:.1f}%) exceeds allowable endurance limit ({self.config.max_rod_stress_ratio*100:.1f}%)."
            )

        pump_fillage = simulated_state.get("pump_efficiency_pct", 85.0)
        if pump_fillage < self.config.min_pump_fillage_pct:
            violations.append(
                f"REJECTED: Pump fillage ({pump_fillage:.1f}%) below allowable minimum ({self.config.min_pump_fillage_pct}%). Severe pump-off fluid pound danger."
            )

        sor = simulated_state.get("sor", 3.0)
        if sor > self.config.max_sor:
            violations.append(
                f"REJECTED: Steam-to-Oil Ratio ({sor:.2f}) exceeds economic limit ({self.config.max_sor}). Thermal bypass waste."
            )

        is_feasible = (len(violations) == 0)
        return is_feasible, violations
