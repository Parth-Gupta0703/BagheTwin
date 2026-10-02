"""
SIH26120 SQLAlchemy Database Models
Implements complete database schema specified in Section 19 of the master spec:
wells, telemetry, css_cycles, srp_operations, failure_events, simulation_runs,
simulation_points, predictions, optimization_runs, optimization_candidates,
recommendations, audit_events, and model_registry.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Well(Base):
    __tablename__ = "wells"

    id = Column(Integer, primary_key=True, index=True)
    well_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    archetype = Column(String(100), nullable=False)
    field = Column(String(100), default="Baghewala")
    reservoir_name = Column(String(100), default="Jodhpur Sandstone")
    completion_type = Column(String(50), default="Perforated Cased Hole")
    measured_depth_m = Column(Float, default=1050.0)
    pump_depth_m = Column(Float, default=950.0)
    api_gravity = Column(Float, default=18.0)
    base_temperature_c = Column(Float, default=48.0)
    base_pressure_bar = Column(Float, default=65.0)
    permeability_md = Column(Float, default=850.0)
    net_pay_m = Column(Float, default=15.0)
    tubing_id_mm = Column(Float, default=62.0)
    rod_diameter_mm = Column(Float, default=22.2)
    pump_bore_mm = Column(Float, default=57.15)
    base_water_cut = Column(Float, default=0.45)
    current_days_since_steam = Column(Integer, default=30)
    # Current Set Points
    stroke_in = Column(Float, default=120.0)
    spm = Column(Float, default=5.5)
    vfd_hz = Column(Float, default=44.0)
    steam_mass_tonnes = Column(Float, default=1200.0)
    injection_pressure_bar = Column(Float, default=85.0)
    soak_duration_days = Column(Float, default=5.0)
    production_cutoff_days = Column(Float, default=75.0)
    status = Column(String(50), default="NORMAL")
    data_status = Column(String(50), default="SYNTHETIC / DEMO")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    well_code = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, default=datetime.utcnow)
    source_type = Column(String(50), default="SYNTHETIC")
    stage = Column(String(50), default="PRODUCTION")
    temperature_c = Column(Float)
    pressure_bar = Column(Float)
    reservoir_pressure_bar = Column(Float)
    flowing_bhp_bar = Column(Float)
    oil_rate_bopd = Column(Float)
    water_rate_bwpd = Column(Float)
    viscosity_cp = Column(Float)
    stroke_in = Column(Float)
    spm = Column(Float)
    vfd_hz = Column(Float)
    pprl_kn = Column(Float)
    mprl_kn = Column(Float)
    drag_force_kn = Column(Float)
    floating_margin_kn = Column(Float)
    pump_efficiency_pct = Column(Float)
    energy_kwh = Column(Float)
    sor = Column(Float)
    overall_risk_score = Column(Float)
    overall_risk_tier = Column(String(50))


class CSSCycle(Base):
    __tablename__ = "css_cycles"

    id = Column(Integer, primary_key=True, index=True)
    well_code = Column(String(50), index=True, nullable=False)
    cycle_number = Column(Integer, nullable=False)
    start_at = Column(DateTime, default=datetime.utcnow)
    injection_duration_days = Column(Float, default=10.0)
    soak_duration_days = Column(Float, default=5.0)
    production_duration_days = Column(Float, default=75.0)
    steam_mass_tonnes = Column(Float)
    injection_pressure_bar = Column(Float)
    steam_quality = Column(Float, default=0.80)
    source_type = Column(String(50), default="SYNTHETIC")


class SRPOperation(Base):
    __tablename__ = "srp_operations"

    id = Column(Integer, primary_key=True, index=True)
    well_code = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    stroke_in = Column(Float)
    spm = Column(Float)
    vfd_hz = Column(Float)
    pprl_kn = Column(Float)
    mprl_kn = Column(Float)
    energy_kwh = Column(Float)
    efficiency_pct = Column(Float)


class FailureEvent(Base):
    __tablename__ = "failure_events"

    id = Column(Integer, primary_key=True, index=True)
    well_code = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)  # "INFO", "WARNING", "CRITICAL"
    trigger_source = Column(String(100))
    simulated = Column(Boolean, default=True)
    description = Column(Text)


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(50), unique=True, index=True, nullable=False)
    well_code = Column(String(50), index=True, nullable=False)
    horizon_days = Column(Integer, default=30)
    seed = Column(Integer, default=42)
    simulator_version = Column(String(50), default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)


class SimulationPoint(Base):
    __tablename__ = "simulation_points"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(50), index=True, nullable=False)
    day_index = Column(Integer, nullable=False)
    timestamp = Column(DateTime)
    temperature_c = Column(Float)
    viscosity_cp = Column(Float)
    oil_rate_bopd = Column(Float)
    water_rate_bwpd = Column(Float)
    sor = Column(Float)
    energy_kwh = Column(Float)
    floating_margin_kn = Column(Float)
    overall_risk_score = Column(Float)


class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(String(50), unique=True, index=True, nullable=False)
    well_code = Column(String(50), index=True, nullable=False)
    model_id = Column(String(50))
    target = Column(String(100))
    point_prediction = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    applicability_status = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, index=True)
    optimization_id = Column(String(50), unique=True, index=True, nullable=False)
    well_code = Column(String(50), index=True, nullable=False)
    objective_config_json = Column(JSON)
    constraint_config_json = Column(JSON)
    candidates_evaluated = Column(Integer)
    candidates_feasible = Column(Integer)
    duration_ms = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class OptimizationCandidate(Base):
    __tablename__ = "optimization_candidates"

    id = Column(Integer, primary_key=True, index=True)
    optimization_id = Column(String(50), index=True, nullable=False)
    candidate_id = Column(String(50))
    stroke_in = Column(Float)
    spm = Column(Float)
    vfd_hz = Column(Float)
    steam_mass_tonnes = Column(Float)
    injection_pressure_bar = Column(Float)
    predicted_oil_bopd = Column(Float)
    predicted_sor = Column(Float)
    floating_margin_kn = Column(Float)
    predicted_risk = Column(Float)
    feasibility = Column(Boolean)
    objective_score = Column(Float)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(50), unique=True, index=True, nullable=False)
    optimization_id = Column(String(50), index=True, nullable=False)
    well_code = Column(String(50), index=True, nullable=False)
    current_state_json = Column(JSON)
    recommended_state_json = Column(JSON)
    rationale_json = Column(JSON)
    expected_deltas_json = Column(JSON)
    approval_status = Column(String(50), default="PENDING")  # "PENDING", "APPROVED", "REJECTED"
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    actor = Column(String(100), default="OPERATOR")
    role = Column(String(50), default="OPERATOR")
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=False)
    before_json = Column(JSON, nullable=True)
    after_json = Column(JSON, nullable=True)
    result = Column(String(50), default="SUCCESS")


class ModelRegistryItem(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(50), unique=True, index=True, nullable=False)
    version = Column(String(50), nullable=False)
    model_type = Column(String(100), nullable=False)
    artifact_path = Column(String(255))
    dataset_id = Column(String(100))
    metrics_json = Column(JSON)
    calibration_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
