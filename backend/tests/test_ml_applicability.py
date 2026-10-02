"""
Tests for ML surrogates, prediction intervals, and OOD applicability guardrails.
"""

import pytest
from app.ml.applicability import ApplicabilityGuardrail
from app.ml.surrogates import ProductionSurrogate
from app.ml.risk_models import MLRiskAndAnomalyEngine


def test_applicability_guardrail_in_domain():
    guardrail = ApplicabilityGuardrail()
    features = {
        "temperature_c": 55.0,
        "viscosity_cp": 8000.0,
        "spm": 5.0,
        "stroke_in": 120.0
    }
    report = guardrail.assess_applicability(features)
    assert report.status == "IN_DOMAIN"
    assert report.is_applicable is True
    assert report.confidence_tier == "HIGH"


def test_applicability_guardrail_out_of_domain():
    guardrail = ApplicabilityGuardrail()
    features = {
        "temperature_c": 350.0,  # Exceeds hard_max (280°C)
        "spm": 25.0              # Exceeds hard_max (14.0)
    }
    report = guardrail.assess_applicability(features)
    assert report.status == "OUT_OF_DOMAIN"
    assert report.is_applicable is False
    assert report.confidence_tier == "LOW_PHYSICS_FALLBACK"
    assert len(report.envelope_violations) >= 2


def test_production_surrogate_prediction_intervals():
    surrogate = ProductionSurrogate()
    features = {
        "temperature_c": 60.0,
        "viscosity_cp": 5000.0,
        "stroke_in": 120.0,
        "spm": 5.0,
        "vfd_hz": 40.0,
        "flowing_bhp_bar": 18.0
    }
    pred = surrogate.predict(features)
    assert pred.point_prediction >= 0.0
    assert pred.lower_bound_p10 <= pred.point_prediction
    assert pred.upper_bound_p90 >= pred.point_prediction
    assert pred.unit == "BOPD"


def test_ml_risk_and_anomaly_evaluation():
    engine = MLRiskAndAnomalyEngine()
    # High drag, low floating margin
    assessment = engine.evaluate_risk(
        floating_margin_kn=1.2,
        viscosity_cp=16000.0,
        spm=8.5,
        pprl_kn=95.0,
        mprl_kn=8.0,
        temperature_c=46.0
    )
    assert assessment.predicted_risk_tier in ["HIGH", "CRITICAL"]
    assert assessment.risk_probability >= 0.50
    assert assessment.validation_status == "DEMO / NOT FIELD VALIDATED"
