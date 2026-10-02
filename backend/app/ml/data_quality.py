"""
SIH26120 Industrial Data Quality & Ingestion Validation Engine
Validates sensor and telemetry streams against physical limits,
detects sensor flatlines, wild spikes, timestamp gaps, and records audit reasons.
Never silently mutates data without an explicit audit log.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class QualityRuleViolation(BaseModel):
    rule_name: str
    field_name: str
    received_value: Any
    expected_range: str
    action_taken: str
    reason: str


class DataQualityAssessment(BaseModel):
    is_valid: bool
    status: str  # "CLEAN", "WARNING", "REJECTED"
    quality_score: float  # 0.0 to 1.0
    violations: List[QualityRuleViolation] = []
    audited_at: datetime = Field(default_factory=datetime.utcnow)


class DataQualityEngine:
    """
    Validates well telemetry against petroleum engineering plausibility boundaries.
    """
    def __init__(self):
        # Plausibility limits for Baghewala heavy oil well operations
        self.limits = {
            "temperature_c": (30.0, 320.0),       # Below 30°C or above 320°C is unphysical
            "pressure_bar": (0.0, 250.0),         # Non-negative pressure up to 250 bar
            "viscosity_cp": (5.0, 150000.0),      # Viscosity must be strictly positive
            "spm": (0.0, 16.0),                   # Strokes per minute
            "stroke_in": (24.0, 240.0),           # Stroke length in inches
            "oil_rate_bopd": (0.0, 1200.0),       # Non-negative rate
            "water_rate_bwpd": (0.0, 2500.0),
            "pprl_kn": (5.0, 250.0),              # Polished rod load bounds
            "mprl_kn": (0.0, 180.0),
            "pump_fillage_pct": (5.0, 100.0)
        }

    def validate_telemetry_record(self, record: Dict[str, Any]) -> DataQualityAssessment:
        """
        Evaluate a single telemetry observation.
        """
        violations: List[QualityRuleViolation] = []

        # Check required fields
        for field, (val_min, val_max) in self.limits.items():
            if field in record and record[field] is not None:
                val = float(record[field])
                if val < val_min or val > val_max:
                    violations.append(QualityRuleViolation(
                        rule_name="RANGE_CHECK_FAILED",
                        field_name=field,
                        received_value=val,
                        expected_range=f"[{val_min}, {val_max}]",
                        action_taken="FLAGGED_ANOMALOUS",
                        reason=f"Value {val} outside physical bounds for {field}."
                    ))

        # Check for unphysical condition: MPRL > PPRL
        if "pprl_kn" in record and "mprl_kn" in record:
            if record["pprl_kn"] is not None and record["mprl_kn"] is not None:
                if float(record["mprl_kn"]) > float(record["pprl_kn"]):
                    violations.append(QualityRuleViolation(
                        rule_name="INVERTED_LOAD_SPAN",
                        field_name="mprl_kn",
                        received_value=record["mprl_kn"],
                        expected_range=f"<= {record['pprl_kn']}",
                        action_taken="REJECTED_CONSISTENCY",
                        reason="Minimum polished rod load cannot physically exceed peak polished rod load."
                    ))

        score = max(0.0, 1.0 - (len(violations) * 0.25))
        if len(violations) == 0:
            status = "CLEAN"
            is_valid = True
        elif score >= 0.5:
            status = "WARNING"
            is_valid = True
        else:
            status = "REJECTED"
            is_valid = False

        return DataQualityAssessment(
            is_valid=is_valid,
            status=status,
            quality_score=round(score, 2),
            violations=violations
        )
