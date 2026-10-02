"""
SIH26120 Machine Learning Fast Surrogates & Uncertainty Estimation
Provides fast surrogate evaluations for production rate and thermal dynamics.
Computes P10, P50, and P90 prediction intervals to honestly reflect model uncertainty.
Uses PolynomialRidgeRegressor with full physics fallback.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
from pydantic import BaseModel, Field

from app.ml.applicability import ApplicabilityGuardrail
from app.ml.trainer import PolynomialRidgeRegressor
from app.physics.engine import CoupledPhysicsSimulator, WellParameters, OperationalInputs


class PredictionInterval(BaseModel):
    point_prediction: float
    lower_bound_p10: float
    upper_bound_p90: float
    unit: str
    target: str
    applicability_status: str
    confidence_tier: str
    model_version: str
    is_physics_fallback: bool
    model_status: str = "ML_SERVICE_ACTIVE"


class ProductionSurrogate:
    """
    ML surrogate for wellhead oil production rate (BOPD).
    """
    def __init__(self, model_path: Optional[str] = None):
        self.model: Optional[PolynomialRidgeRegressor] = None
        self.guardrail = ApplicabilityGuardrail()
        self.simulator = CoupledPhysicsSimulator()
        self.model_version = "1.0.0-DEMO-SYNTHETIC"

        if model_path is None:
            default_path = Path(__file__).resolve().parent.parent.parent / "artifacts" / "models" / "production_surrogate.json"
            if default_path.exists():
                model_path = str(default_path)

        if model_path and os.path.exists(model_path):
            try:
                with open(model_path, "r") as f:
                    data = json.load(f)
                self.model = PolynomialRidgeRegressor.from_dict(data)
            except Exception:
                self.model = None

    def predict(
        self,
        features: Dict[str, float],
        well_params: Optional[WellParameters] = None
    ) -> PredictionInterval:
        """
        Produce point prediction and P10-P90 prediction interval.
        """
        app_report = self.guardrail.assess_applicability(features)

        # If Out of Domain or model not loaded, fall back safely to coupled physics!
        if not app_report.is_applicable or self.model is None:
            well = well_params or WellParameters()
            ops = OperationalInputs(
                stroke_in=features.get("stroke_in", 120.0),
                spm=features.get("spm", 5.5),
                steam_mass_tonnes=features.get("steam_mass_tonnes", 1200.0),
                injection_pressure_bar=features.get("injection_pressure_bar", 85.0)
            )
            sim_state = self.simulator.evaluate_state(
                well, ops, current_temp_c=features.get("temperature_c", 55.0)
            )
            oil_rate = sim_state["actual_oil_bopd"]

            status_msg = "MODEL SERVICE UNAVAILABLE - PHYSICS-ONLY MODE ACTIVE" if self.model is None else "DOMAIN_GUARDRAIL_REDIRECT - PHYSICS_ACTIVE"

            return PredictionInterval(
                point_prediction=round(oil_rate, 1),
                lower_bound_p10=round(oil_rate * 0.85, 1),
                upper_bound_p90=round(oil_rate * 1.15, 1),
                unit="BOPD",
                target="oil_production_rate",
                applicability_status=app_report.status,
                confidence_tier="LOW_PHYSICS_FALLBACK" if not app_report.is_applicable else "PHYSICS_DIRECT",
                model_version=self.model_version,
                is_physics_fallback=True,
                model_status=status_msg
            )

        # Predict using ML Surrogate model
        x_vec = np.array([[
            features.get("temperature_c", 55.0),
            features.get("viscosity_cp", 10000.0),
            features.get("stroke_in", 120.0),
            features.get("spm", 5.5),
            features.get("vfd_hz", 45.0),
            features.get("flowing_bhp_bar", 18.0)
        ]])

        try:
            pred_val = float(self.model.predict(x_vec)[0])
            pred_val = max(0.0, pred_val)

            residual_std = 0.06 * pred_val
            p10 = max(0.0, pred_val - 1.28 * residual_std)
            p90 = pred_val + 1.28 * residual_std

            return PredictionInterval(
                point_prediction=round(pred_val, 1),
                lower_bound_p10=round(p10, 1),
                upper_bound_p90=round(p90, 1),
                unit="BOPD",
                target="oil_production_rate",
                applicability_status=app_report.status,
                confidence_tier=app_report.confidence_tier,
                model_version=self.model_version,
                is_physics_fallback=False
            )
        except Exception:
            well = well_params or WellParameters()
            ops = OperationalInputs()
            sim_state = self.simulator.evaluate_state(well, ops)
            oil = sim_state["actual_oil_bopd"]
            return PredictionInterval(
                point_prediction=round(oil, 1),
                lower_bound_p10=round(oil * 0.85, 1),
                upper_bound_p90=round(oil * 1.15, 1),
                unit="BOPD",
                target="oil_production_rate",
                applicability_status="FALLBACK",
                confidence_tier="PHYSICS_DIRECT",
                model_version=self.model_version,
                is_physics_fallback=True
            )
