"""
SIH26120 Out-Of-Domain (OOD) & Model Applicability Guardrail
Monitors incoming candidate operating parameters against the training envelope.
Returns IN_DOMAIN, NEAR_BOUNDARY, or OUT_OF_DOMAIN status.
Prevents ungrounded ML extrapolation and flags when physics fallback is required.
"""

from typing import Dict, Any, List, Optional
import numpy as np
from pydantic import BaseModel, Field


class DomainEnvelope(BaseModel):
    feature_name: str
    train_min: float
    train_max: float
    hard_min: float
    hard_max: float


class ApplicabilityReport(BaseModel):
    status: str  # "IN_DOMAIN", "NEAR_BOUNDARY", "OUT_OF_DOMAIN"
    confidence_tier: str  # "HIGH", "MODERATE", "LOW_PHYSICS_FALLBACK"
    is_applicable: bool
    warning_flags: List[str] = []
    envelope_violations: List[Dict[str, Any]] = []


class ApplicabilityGuardrail:
    """
    Evaluates whether input parameters lie within the verified training feature distribution.
    """
    def __init__(self):
        # Established training domain envelopes for Baghewala synthetic surrogate models
        self.envelopes: Dict[str, DomainEnvelope] = {
            "temperature_c": DomainEnvelope(
                feature_name="temperature_c",
                train_min=45.0, train_max=220.0,
                hard_min=30.0, hard_max=280.0
            ),
            "viscosity_cp": DomainEnvelope(
                feature_name="viscosity_cp",
                train_min=15.0, train_max=35000.0,
                hard_min=5.0, hard_max=100000.0
            ),
            "spm": DomainEnvelope(
                feature_name="spm",
                train_min=2.5, train_max=11.0,
                hard_min=1.0, hard_max=14.0
            ),
            "stroke_in": DomainEnvelope(
                feature_name="stroke_in",
                train_min=64.0, train_max=168.0,
                hard_min=48.0, hard_max=216.0
            ),
            "steam_mass_tonnes": DomainEnvelope(
                feature_name="steam_mass_tonnes",
                train_min=600.0, train_max=2000.0,
                hard_min=200.0, hard_max=3000.0
            ),
            "injection_pressure_bar": DomainEnvelope(
                feature_name="injection_pressure_bar",
                train_min=60.0, train_max=110.0,
                hard_min=30.0, hard_max=140.0
            )
        }

    def assess_applicability(self, features: Dict[str, float]) -> ApplicabilityReport:
        """
        Assess if operational setpoint is within surrogate domain.
        """
        violations = []
        warnings = []
        out_of_bounds = False
        near_boundary = False

        for feat_name, envelope in self.envelopes.items():
            if feat_name in features and features[feat_name] is not None:
                val = float(features[feat_name])

                # Check hard physical boundary
                if val < envelope.hard_min or val > envelope.hard_max:
                    out_of_bounds = True
                    violations.append({
                        "feature": feat_name,
                        "value": val,
                        "envelope": f"[{envelope.train_min}, {envelope.train_max}]",
                        "severity": "OUT_OF_DOMAIN",
                        "reason": f"{feat_name} exceeds model training bounds ({val:.1f})."
                    })
                    warnings.append(f"CRITICAL: {feat_name} ({val:.1f}) is OUT OF DOMAIN.")

                # Check soft training envelope margin (~10% boundary buffer)
                elif val < envelope.train_min or val > envelope.train_max:
                    near_boundary = True
                    violations.append({
                        "feature": feat_name,
                        "value": val,
                        "envelope": f"[{envelope.train_min}, {envelope.train_max}]",
                        "severity": "NEAR_BOUNDARY",
                        "reason": f"{feat_name} is near boundary of synthetic training domain."
                    })
                    warnings.append(f"WARNING: {feat_name} ({val:.1f}) operates in extrapolation buffer.")

        if out_of_bounds:
            status = "OUT_OF_DOMAIN"
            conf = "LOW_PHYSICS_FALLBACK"
            is_app = False
        elif near_boundary:
            status = "NEAR_BOUNDARY"
            conf = "MODERATE"
            is_app = True
        else:
            status = "IN_DOMAIN"
            conf = "HIGH"
            is_app = True

        return ApplicabilityReport(
            status=status,
            confidence_tier=conf,
            is_applicable=is_app,
            warning_flags=warnings,
            envelope_violations=violations
        )
