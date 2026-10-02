"""
SIH26120 API Request and Response Pydantic Schemas
Defines input validations, unit wrappers, and response formats across all REST endpoints.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.optimizer.objectives import ObjectiveWeights
from app.optimizer.constraints import ConstraintConfig


class HealthResponse(BaseModel):
    status: str = "ONLINE"
    service: str = "BagheTwin Decision Support Engine"
    version: str = "1.0.0"
    mode: str = "SIMULATION"
    data_status: str = "SYNTHETIC / DEMO"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SimulationRequest(BaseModel):
    well_code: str = "BGW-001"
    horizon_days: int = Field(default=30, ge=1, le=180)
    steam_mass_tonnes: Optional[float] = None
    injection_pressure_bar: Optional[float] = None
    soak_duration_days: Optional[float] = None
    stroke_in: Optional[float] = None
    spm: Optional[float] = None


class ProductionPredictionRequest(BaseModel):
    temperature_c: float = 55.0
    viscosity_cp: float = 8000.0
    stroke_in: float = 120.0
    spm: float = 5.5
    vfd_hz: float = 44.0
    flowing_bhp_bar: float = 18.0
    steam_mass_tonnes: float = 1200.0
    injection_pressure_bar: float = 85.0


class RiskPredictionRequest(BaseModel):
    floating_margin_kn: float = 2.5
    viscosity_cp: float = 12000.0
    spm: float = 6.5
    pprl_kn: float = 80.0
    mprl_kn: float = 12.0
    temperature_c: float = 48.0


class JointOptimizationRequest(BaseModel):
    well_code: str = "BGW-001"
    weights: Optional[ObjectiveWeights] = None
    custom_constraints: Optional[ConstraintConfig] = None
    search_intensity: int = 35


class AnomalyInjectionRequest(BaseModel):
    anomaly_type: str = Field(
        ...,
        description="One of: TEMPERATURE_DROP, HIGH_SPM_SURGE, VISCOSITY_SPIKE, PUMP_OFF_STARVATION, PRESSURE_ABNORMALITY"
    )


class RecommendationActionRequest(BaseModel):
    actor: str = "OPERATOR_01"
    role: str = "OPERATOR"
    reason: Optional[str] = "Approved following engineering review of floating margin restoration."
