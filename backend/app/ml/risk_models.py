"""
SIH26120 Machine Learning Risk Classifier & Anomaly Detector
Classifies rod-floating probability and detects live operational anomalies.
Uses LogisticRiskClassifier and MahalanobisAnomalyDetector.
Explicitly carries metadata: DEMO / NOT FIELD VALIDATED.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
from pydantic import BaseModel, Field

from app.physics.risk import PhysicalRiskEngine
from app.ml.trainer import LogisticRiskClassifier, MahalanobisAnomalyDetector


class MLRiskAssessment(BaseModel):
    predicted_risk_tier: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    risk_probability: float  # 0.0 to 1.0
    is_anomaly: bool
    anomaly_score: float
    contributing_features: List[Dict[str, Any]] = []
    model_version: str = "1.0.0-DEMO-SYNTHETIC"
    validation_status: str = "DEMO / NOT FIELD VALIDATED"
    model_status: str = "ML_SERVICE_ACTIVE"


class MLRiskAndAnomalyEngine:
    """
    ML risk classification and statistical anomaly detection.
    """
    def __init__(
        self,
        classifier_path: Optional[str] = None,
        anomaly_path: Optional[str] = None
    ):
        self.classifier: Optional[LogisticRiskClassifier] = None
        self.anomaly_detector: Optional[MahalanobisAnomalyDetector] = None
        self.physics_risk_engine = PhysicalRiskEngine()

        models_dir = Path(__file__).resolve().parent.parent.parent / "artifacts" / "models"

        if classifier_path is None:
            default_clf = models_dir / "rod_float_risk_classifier.json"
            if default_clf.exists():
                classifier_path = str(default_clf)

        if anomaly_path is None:
            default_anom = models_dir / "telemetry_anomaly_detector.json"
            if default_anom.exists():
                anomaly_path = str(default_anom)

        if classifier_path and os.path.exists(classifier_path):
            try:
                with open(classifier_path, "r") as f:
                    self.classifier = LogisticRiskClassifier.from_dict(json.load(f))
            except Exception:
                self.classifier = None

        if anomaly_path and os.path.exists(anomaly_path):
            try:
                with open(anomaly_path, "r") as f:
                    self.anomaly_detector = MahalanobisAnomalyDetector.from_dict(json.load(f))
            except Exception:
                self.anomaly_detector = None

    def evaluate_risk(
        self,
        floating_margin_kn: float,
        viscosity_cp: float,
        spm: float,
        pprl_kn: float,
        mprl_kn: float,
        temperature_c: float
    ) -> MLRiskAssessment:
        """
        Evaluate risk using trained ML classifier or deterministic physics rules.
        """
        features_vec = np.array([[
            floating_margin_kn,
            viscosity_cp,
            spm,
            pprl_kn,
            mprl_kn,
            temperature_c
        ]])

        # 1. Unsupervised Anomaly Detection
        is_anomaly = False
        anomaly_score = 0.0
        if self.anomaly_detector is not None:
            try:
                anom_flags, scores = self.anomaly_detector.compute_anomaly_score(features_vec)
                is_anomaly = bool(anom_flags[0])
                anomaly_score = float(scores[0])
            except Exception:
                is_anomaly = False

        # 2. Risk Classification
        if self.classifier is not None:
            try:
                prob = float(self.classifier.predict_proba(features_vec)[0, 1])
                if prob >= 0.70:
                    tier = "CRITICAL"
                elif prob >= 0.45:
                    tier = "HIGH"
                elif prob >= 0.20:
                    tier = "MEDIUM"
                else:
                    tier = "LOW"
            except Exception:
                prob = 0.15
                tier = "LOW"
        else:
            phys_res = self.physics_risk_engine.evaluate_risks(
                floating_margin_kn=floating_margin_kn,
                rod_stress_ratio=0.5,
                pump_fillage_pct=85.0,
                viscosity_cp=viscosity_cp,
                sor=3.0,
                submergence_m=100.0
            )
            prob = phys_res["rod_float_risk"]["score"]
            tier = phys_res["rod_float_risk"]["tier"]

        contributors = []
        if floating_margin_kn < 3.0:
            contributors.append({"feature": "floating_margin_kn", "impact": "Dominant downstroke drag opposing rod weight"})
        if viscosity_cp > 12000.0:
            contributors.append({"feature": "viscosity_cp", "impact": "High viscosity causes severe Couette shear drag"})
        if spm > 7.0:
            contributors.append({"feature": "spm", "impact": "Elevated pumping frequency amplifies inertial and drag terms"})

        status_msg = "ML_SERVICE_ACTIVE" if self.classifier is not None else "MODEL SERVICE UNAVAILABLE - PHYSICS-ONLY MODE ACTIVE"

        return MLRiskAssessment(
            predicted_risk_tier=tier,
            risk_probability=round(prob, 2),
            is_anomaly=is_anomaly,
            anomaly_score=round(anomaly_score, 3),
            contributing_features=contributors,
            model_status=status_msg
        )
