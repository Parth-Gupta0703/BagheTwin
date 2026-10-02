"""
SIH26120 FastAPI REST & WebSocket Routing Module
Implements all versioned routes defined in Section 29 of the master specification.
Includes health check, fleet explorer, digital twin state, scenario lab,
surrogates, joint optimizer, audit trails, and live telemetry streaming.
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.orm import Session

logger = logging.getLogger("baghetwin")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

from app.core.database import get_db
from app.models.db_models import (
    Well, Telemetry, CSSCycle, FailureEvent, SimulationRun, SimulationPoint,
    Recommendation, AuditEvent, OptimizationRun, OptimizationCandidate, ModelRegistryItem
)
from app.schemas.api_schemas import (
    HealthResponse, SimulationRequest, ProductionPredictionRequest,
    RiskPredictionRequest, JointOptimizationRequest, AnomalyInjectionRequest,
    RecommendationActionRequest
)
from app.physics.engine import CoupledPhysicsSimulator, WellParameters, OperationalInputs
from app.ml.surrogates import ProductionSurrogate
from app.ml.risk_models import MLRiskAndAnomalyEngine
from app.optimizer.joint_optimizer import JointOptimizer
from app.twin.state_manager import twin_manager
from app.twin.anomaly_injector import AnomalyInjector
from app.twin.telemetry_streamer import streamer

router = APIRouter()

# Instantiate singletons for routing
simulator = CoupledPhysicsSimulator()
prod_surrogate = ProductionSurrogate()
risk_engine = MLRiskAndAnomalyEngine()
joint_optimizer = JointOptimizer()


# -------------------------------------------------------------
# 1. System Health & Status
# -------------------------------------------------------------
@router.get("/health", response_model=HealthResponse)
def get_health():
    """Verify backend status and simulation mode."""
    return HealthResponse()


# -------------------------------------------------------------
# 2. Fleet & Well Management
# -------------------------------------------------------------
@router.get("/wells")
def list_wells(db: Session = Depends(get_db)):
    """Retrieve all synthetic wells in the demonstration fleet."""
    wells = db.query(Well).all()
    result = []
    for w in wells:
        well_params = WellParameters(
            well_code=w.well_code,
            field=w.field,
            reservoir_name=w.reservoir_name,
            measured_depth_m=w.measured_depth_m,
            pump_depth_m=w.pump_depth_m,
            api_gravity=w.api_gravity,
            base_temperature_c=w.base_temperature_c,
            base_pressure_bar=w.base_pressure_bar,
            permeability_md=w.permeability_md,
            net_pay_m=w.net_pay_m,
            tubing_id_mm=w.tubing_id_mm,
            rod_diameter_mm=w.rod_diameter_mm,
            pump_bore_mm=w.pump_bore_mm,
            base_water_cut=w.base_water_cut
        )
        ops = OperationalInputs(
            stroke_in=w.stroke_in,
            spm=w.spm,
            vfd_hz=w.vfd_hz,
            steam_mass_tonnes=w.steam_mass_tonnes,
            injection_pressure_bar=w.injection_pressure_bar
        )
        twin_state = twin_manager.get_or_initialize_state(well_params, ops)

        result.append({
            "well_code": w.well_code,
            "name": w.name,
            "archetype": w.archetype,
            "status": w.status,
            "temperature_c": twin_state.temperature_c,
            "viscosity_cp": twin_state.viscosity_cp,
            "oil_rate_bopd": twin_state.oil_rate_bopd,
            "sor": twin_state.sor,
            "spm": twin_state.spm,
            "floating_margin_kn": twin_state.floating_margin_kn,
            "overall_risk_score": twin_state.overall_risk_score,
            "overall_risk_tier": twin_state.overall_risk_tier,
            "data_status": w.data_status
        })
    return result


@router.get("/wells/{well_code}")
def get_well_details(well_code: str, db: Session = Depends(get_db)):
    """Get static design and geological specifications of a well."""
    well = db.query(Well).filter(Well.well_code == well_code).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well '{well_code}' not found.")
    return well


@router.get("/wells/{well_code}/state")
def get_well_digital_twin_state(well_code: str, db: Session = Depends(get_db)):
    """Get full digital twin state vector and active alarms."""
    well = db.query(Well).filter(Well.well_code == well_code).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well '{well_code}' not found.")

    well_params = WellParameters(
        well_code=well.well_code,
        measured_depth_m=well.measured_depth_m,
        pump_depth_m=well.pump_depth_m,
        api_gravity=well.api_gravity,
        base_temperature_c=well.base_temperature_c,
        base_pressure_bar=well.base_pressure_bar,
        permeability_md=well.permeability_md,
        net_pay_m=well.net_pay_m,
        tubing_id_mm=well.tubing_id_mm,
        rod_diameter_mm=well.rod_diameter_mm,
        pump_bore_mm=well.pump_bore_mm,
        base_water_cut=well.base_water_cut
    )
    ops = OperationalInputs(
        stroke_in=well.stroke_in,
        spm=well.spm,
        vfd_hz=well.vfd_hz,
        steam_mass_tonnes=well.steam_mass_tonnes,
        injection_pressure_bar=well.injection_pressure_bar
    )
    return twin_manager.get_or_initialize_state(well_params, ops)


@router.get("/wells/{well_code}/history")
def get_well_telemetry_history(
    well_code: str,
    limit: int = Query(default=60, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Retrieve historical time-series telemetry records."""
    history = db.query(Telemetry)\
        .filter(Telemetry.well_code == well_code)\
        .order_by(Telemetry.timestamp.desc())\
        .limit(limit)\
        .all()
    return list(reversed(history))


@router.get("/wells/{well_code}/dynacard")
def get_well_dynacard(well_code: str, db: Session = Depends(get_db)):
    """Generate surface dynamometer card for the current operating point."""
    well = db.query(Well).filter(Well.well_code == well_code).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well '{well_code}' not found.")

    well_params = WellParameters(
        well_code=well.well_code,
        measured_depth_m=well.measured_depth_m,
        pump_depth_m=well.pump_depth_m,
        api_gravity=well.api_gravity,
        base_temperature_c=well.base_temperature_c,
        base_pressure_bar=well.base_pressure_bar,
        permeability_md=well.permeability_md,
        net_pay_m=well.net_pay_m,
        tubing_id_mm=well.tubing_id_mm,
        rod_diameter_mm=well.rod_diameter_mm,
        pump_bore_mm=well.pump_bore_mm,
        base_water_cut=well.base_water_cut
    )
    ops = OperationalInputs(stroke_in=well.stroke_in, spm=well.spm)
    twin_state = twin_manager.get_or_initialize_state(well_params, ops)

    condition = "HIGH_DRAG_ROD_FLOAT" if twin_state.floating_margin_kn <= 2.0 else (
        "PUMP_OFF" if twin_state.pump_efficiency_pct < 55.0 else "NORMAL"
    )

    card = simulator.dynacard_engine.generate_card(
        stroke_in=twin_state.stroke_in,
        pprl_kn=twin_state.pprl_kn,
        mprl_kn=twin_state.mprl_kn,
        condition=condition,
        pump_fillage_pct=twin_state.pump_efficiency_pct,
        floating_margin_kn=twin_state.floating_margin_kn
    )
    return card


# -------------------------------------------------------------
# 3. Scenario Lab (30 / 60 / 90 Day Simulation Runs)
# -------------------------------------------------------------
@router.post("/simulation/run")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    """Execute forward physical horizon simulation for Scenario Lab."""
    logger.info(f"[REQUEST] POST /simulation/run well={req.well_code} horizon={req.horizon_days}d")
    well = db.query(Well).filter(Well.well_code == req.well_code).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well '{req.well_code}' not found.")

    well_params = WellParameters(
        well_code=well.well_code,
        measured_depth_m=well.measured_depth_m,
        pump_depth_m=well.pump_depth_m,
        api_gravity=well.api_gravity,
        base_temperature_c=well.base_temperature_c,
        base_pressure_bar=well.base_pressure_bar,
        permeability_md=well.permeability_md,
        net_pay_m=well.net_pay_m,
        tubing_id_mm=well.tubing_id_mm,
        rod_diameter_mm=well.rod_diameter_mm,
        pump_bore_mm=well.pump_bore_mm,
        base_water_cut=well.base_water_cut
    )

    ops = OperationalInputs(
        stroke_in=req.stroke_in if req.stroke_in is not None else well.stroke_in,
        spm=req.spm if req.spm is not None else well.spm,
        steam_mass_tonnes=req.steam_mass_tonnes if req.steam_mass_tonnes is not None else well.steam_mass_tonnes,
        injection_pressure_bar=req.injection_pressure_bar if req.injection_pressure_bar is not None else well.injection_pressure_bar,
        soak_duration_days=req.soak_duration_days if req.soak_duration_days is not None else well.soak_duration_days,
        production_cutoff_days=float(req.horizon_days)
    )

    res = simulator.simulate_horizon(well_params, ops, horizon_days=req.horizon_days)
    run_id = f"SIM-{uuid.uuid4().hex[:8].upper()}"

    # Persist simulation run
    sim_run = SimulationRun(
        run_id=run_id,
        well_code=req.well_code,
        horizon_days=req.horizon_days,
        seed=42,
        simulator_version="1.0.0"
    )
    db.add(sim_run)
    db.commit()

    logger.info(f"[SIMULATION] Horizon {req.horizon_days}d completed for well {req.well_code} (Run ID: {run_id})")
    return {"run_id": run_id, **res}


# -------------------------------------------------------------
# 4. ML Predictions & Uncertainty Bounds
# -------------------------------------------------------------
@router.post("/predictions/production")
def predict_production(req: ProductionPredictionRequest):
    """Evaluate ML surrogate prediction with P10/P90 prediction intervals."""
    logger.info(f"[REQUEST] POST /predictions/production temp={req.temperature_c} spm={req.spm}")
    feats = req.model_dump()
    res = prod_surrogate.predict(feats)
    logger.info(f"[MODEL PREDICTION] Production surrogate predicted {res.point_prediction} BOPD [{res.lower_bound_p10}-{res.upper_bound_p90}] status={res.model_status}")
    return res


@router.post("/predictions/risk")
def predict_risk(req: RiskPredictionRequest):
    """Classify rod-floating probability and detect anomalies."""
    logger.info(f"[REQUEST] POST /predictions/risk float_margin={req.floating_margin_kn}kN visc={req.viscosity_cp}cP")
    res = risk_engine.evaluate_risk(
        floating_margin_kn=req.floating_margin_kn,
        viscosity_cp=req.viscosity_cp,
        spm=req.spm,
        pprl_kn=req.pprl_kn,
        mprl_kn=req.mprl_kn,
        temperature_c=req.temperature_c
    )
    logger.info(f"[MODEL PREDICTION] Risk classified as {res.predicted_risk_tier} (prob={res.risk_probability}, anomaly={res.is_anomaly})")
    return res


# -------------------------------------------------------------
# 5. Joint Constrained Optimization
# -------------------------------------------------------------
@router.post("/optimization/joint")
def optimize_joint_well(req: JointOptimizationRequest, db: Session = Depends(get_db)):
    """Simultaneously optimize CSS steam and SRP pumping parameters."""
    logger.info(f"[REQUEST] POST /optimization/joint well={req.well_code} search_intensity={req.search_intensity}")
    well = db.query(Well).filter(Well.well_code == req.well_code).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well '{req.well_code}' not found.")

    well_params = WellParameters(
        well_code=well.well_code,
        measured_depth_m=well.measured_depth_m,
        pump_depth_m=well.pump_depth_m,
        api_gravity=well.api_gravity,
        base_temperature_c=well.base_temperature_c,
        base_pressure_bar=well.base_pressure_bar,
        permeability_md=well.permeability_md,
        net_pay_m=well.net_pay_m,
        tubing_id_mm=well.tubing_id_mm,
        rod_diameter_mm=well.rod_diameter_mm,
        pump_bore_mm=well.pump_bore_mm,
        base_water_cut=well.base_water_cut
    )

    ops = OperationalInputs(
        stroke_in=well.stroke_in,
        spm=well.spm,
        vfd_hz=well.vfd_hz,
        steam_mass_tonnes=well.steam_mass_tonnes,
        injection_pressure_bar=well.injection_pressure_bar
    )

    twin_state = twin_manager.get_or_initialize_state(well_params, ops)

    opt_result = joint_optimizer.run_optimization(
        well_params=well_params,
        current_ops=ops,
        current_temp_c=twin_state.temperature_c,
        weights=req.weights,
        num_candidates=req.search_intensity
    )

    logger.info(f"[OPTIMIZATION] Run {opt_result.optimization_id} for well {req.well_code}: {opt_result.total_candidates_evaluated} evaluated, {opt_result.feasible_candidates_count} feasible, {opt_result.rejected_candidates_count} rejected in {opt_result.execution_time_ms}ms")
    logger.info(f"[CONSTRAINT REJECTION] Successfully filtered {opt_result.rejected_candidates_count} unsafe candidates violating safety constraints")

    # Persist recommendation
    rec_id = f"REC-{uuid.uuid4().hex[:8].upper()}"
    recommendation = Recommendation(
        recommendation_id=rec_id,
        optimization_id=opt_result.optimization_id,
        well_code=req.well_code,
        current_state_json=opt_result.baseline_state,
        recommended_state_json=opt_result.recommended_candidate,
        rationale_json=opt_result.explanation.model_dump(),
        expected_deltas_json=opt_result.explanation.expected_deltas,
        approval_status="PENDING"
    )
    db.add(recommendation)

    # Persist optimization run audit
    opt_run = OptimizationRun(
        optimization_id=opt_result.optimization_id,
        well_code=req.well_code,
        objective_config_json=req.weights.model_dump() if req.weights else {},
        candidates_evaluated=opt_result.total_candidates_evaluated,
        candidates_feasible=opt_result.feasible_candidates_count,
        duration_ms=opt_result.execution_time_ms
    )
    db.add(opt_run)
    db.commit()

    logger.info(f"[RECOMMENDATION] Created recommendation {rec_id} (Status: {opt_result.status})")
    return {
        "recommendation_id": rec_id,
        **opt_result.model_dump()
    }


# -------------------------------------------------------------
# 6. Recommendation Approval & Audit Trail
# -------------------------------------------------------------
@router.post("/recommendations/{recommendation_id}/approve")
def approve_recommendation(
    recommendation_id: str,
    action: RecommendationActionRequest,
    db: Session = Depends(get_db)
):
    """
    Approve simulated recommendation.
    Applies recommended setpoints strictly to the digital twin state.
    Records operator audit trail event.
    """
    logger.info(f"[REQUEST] POST /recommendations/{recommendation_id}/approve actor={action.actor}")
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    well = db.query(Well).filter(Well.well_code == rec.well_code).first()
    if not well:
        raise HTTPException(status_code=404, detail="Associated well not found.")

    well_params = WellParameters(
        well_code=well.well_code,
        measured_depth_m=well.measured_depth_m,
        pump_depth_m=well.pump_depth_m,
        api_gravity=well.api_gravity,
        base_temperature_c=well.base_temperature_c,
        base_pressure_bar=well.base_pressure_bar,
        permeability_md=well.permeability_md,
        net_pay_m=well.net_pay_m,
        tubing_id_mm=well.tubing_id_mm,
        rod_diameter_mm=well.rod_diameter_mm,
        pump_bore_mm=well.pump_bore_mm,
        base_water_cut=well.base_water_cut
    )

    rec_inputs = rec.recommended_state_json.get("inputs", {})

    # Apply to in-memory digital twin
    updated_twin = twin_manager.apply_simulated_recommendation(well_params, rec_inputs)

    # Update database well setpoints
    before_state = {
        "stroke_in": well.stroke_in,
        "spm": well.spm,
        "steam_mass_tonnes": well.steam_mass_tonnes
    }
    well.stroke_in = updated_twin.stroke_in
    well.spm = updated_twin.spm
    well.vfd_hz = updated_twin.vfd_hz
    well.steam_mass_tonnes = updated_twin.steam_mass_tonnes
    well.status = "NORMAL"

    rec.approval_status = "APPROVED"
    rec.approved_by = f"{action.actor} ({action.role})"
    rec.approved_at = datetime.utcnow()

    # Create immutable audit log
    audit = AuditEvent(
        actor=action.actor,
        role=action.role,
        action="APPROVE_SIMULATED_RECOMMENDATION",
        entity_type="RECOMMENDATION",
        entity_id=recommendation_id,
        before_json=before_state,
        after_json=rec_inputs,
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()

    logger.info(f"[APPROVAL] Approved {recommendation_id} for well {rec.well_code} by {action.actor}")
    logger.info(f"[TWIN UPDATE] Virtual twin state updated for well {rec.well_code}: stroke={updated_twin.stroke_in}in, spm={updated_twin.spm}, float_margin={updated_twin.floating_margin_kn}kN")

    return {
        "status": "APPROVED",
        "recommendation_id": recommendation_id,
        "well_code": rec.well_code,
        "updated_twin_state": updated_twin.model_dump(),
        "audit_event_id": audit.id,
        "disclaimer": "Simulated recommendation applied to Digital Twin state. No physical field equipment altered."
    }


@router.post("/recommendations/{recommendation_id}/reject")
def reject_recommendation(
    recommendation_id: str,
    action: RecommendationActionRequest,
    db: Session = Depends(get_db)
):
    """Reject recommendation with operator reason."""
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    rec.approval_status = "REJECTED"
    rec.approved_by = f"{action.actor} ({action.role})"
    rec.approved_at = datetime.utcnow()

    audit = AuditEvent(
        actor=action.actor,
        role=action.role,
        action="REJECT_SIMULATED_RECOMMENDATION",
        entity_type="RECOMMENDATION",
        entity_id=recommendation_id,
        before_json={"status": "PENDING"},
        after_json={"status": "REJECTED", "reason": action.reason},
        result="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {"status": "REJECTED", "recommendation_id": recommendation_id}


@router.get("/audit")
def list_audit_trail(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve full chronological audit trail."""
    events = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(limit).all()
    return events


# -------------------------------------------------------------
# 7. Model & Data Provenance Registry
# -------------------------------------------------------------
@router.get("/models")
def get_model_registry(db: Session = Depends(get_db)):
    """Retrieve complete metadata for datasets, ML models, and physics components."""
    models_file = prod_surrogate.guardrail.envelopes
    registry_path = prod_surrogate.simulator.viscosity_engine.config

    # Read model_registry.json if exists
    import os
    reg_path = "backend/artifacts/models/model_registry.json"
    if os.path.exists(reg_path):
        with open(reg_path, "r") as f:
            registry_data = json.load(f)
    else:
        registry_data = {
            "dataset_provenance": {
                "source_type": "SYNTHETIC",
                "random_seed": 42,
                "disclaimer": "Synthetic training dataset generated using coupled physics simulation."
            },
            "models": {}
        }

    # Add Physics Models Provenance
    registry_data["physics_modules"] = {
        "viscosity": simulator.viscosity_engine.get_provenance_metadata(),
        "steam": simulator.steam_engine.config.model_dump(),
        "thermal": simulator.thermal_engine.config.model_dump(),
        "reservoir": simulator.reservoir_engine.config.model_dump(),
        "wellbore": simulator.wellbore_engine.config.model_dump(),
        "srp": simulator.srp_engine.config.model_dump(),
        "risk": simulator.risk_engine.config.model_dump(),
        "economics": simulator.economics_engine.config.model_dump()
    }
    return registry_data


# -------------------------------------------------------------
# 8. Anomaly Injection
# -------------------------------------------------------------
@router.post("/twin/{well_code}/inject-anomaly")
def inject_well_anomaly(
    well_code: str,
    req: AnomalyInjectionRequest,
    db: Session = Depends(get_db)
):
    """Trigger synthetic operational anomaly for live monitoring simulation."""
    logger.info(f"[REQUEST] POST /twin/{well_code}/inject-anomaly type={req.anomaly_type}")
    well = db.query(Well).filter(Well.well_code == well_code).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well '{well_code}' not found.")

    well_params = WellParameters(
        well_code=well.well_code,
        measured_depth_m=well.measured_depth_m,
        pump_depth_m=well.pump_depth_m,
        api_gravity=well.api_gravity,
        base_temperature_c=well.base_temperature_c,
        base_pressure_bar=well.base_pressure_bar,
        permeability_md=well.permeability_md,
        net_pay_m=well.net_pay_m,
        tubing_id_mm=well.tubing_id_mm,
        rod_diameter_mm=well.rod_diameter_mm,
        pump_bore_mm=well.pump_bore_mm,
        base_water_cut=well.base_water_cut
    )

    try:
        updated_state, event_data = AnomalyInjector.inject(well_params, req.anomaly_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Persist FailureEvent
    failure = FailureEvent(
        well_code=well_code,
        event_type=event_data["event_type"],
        severity=event_data["severity"],
        trigger_source=event_data["trigger_source"],
        simulated=True,
        description=event_data["description"]
    )
    db.add(failure)

    # Persist Audit Event
    audit = AuditEvent(
        actor="DEMO_OPERATOR",
        role="ENGINEER",
        action="INJECT_SYNTHETIC_ANOMALY",
        entity_type="WELL",
        entity_id=well_code,
        before_json={"status": "NORMAL"},
        after_json={"anomaly_type": req.anomaly_type, "severity": event_data["severity"]},
        result="TRIGGERED"
    )
    db.add(audit)
    db.commit()

    logger.info(f"[ANOMALY] Injected {req.anomaly_type} into well {well_code} (Severity: {event_data['severity']})")

    return {
        "status": "ANOMALY_ACTIVE",
        "well_code": well_code,
        "event": event_data,
        "updated_twin_state": updated_state.model_dump()
    }


# -------------------------------------------------------------
# 8b. Demo Reset Endpoint
# -------------------------------------------------------------
@router.post("/demo/reset")
def reset_demo_fleet(db: Session = Depends(get_db)):
    """
    RESET DEMO:
    Returns the entire application to the deterministic initial demo state:
    - Resets all Digital Twin in-memory states to initial values
    - Resets all database wells to original setpoints and statuses
    - Clears recommendations, optimization runs, failure events, and simulation runs
    - Appends a RESET_DEMO audit log event
    Does NOT delete source/generated datasets (CSS cycles, historical telemetry).
    """
    logger.info("[REQUEST] POST /demo/reset")
    logger.info("[DEMO RESET] Resetting all twin states, temporary records, and well setpoints to deterministic baseline")

    # 1. Reset in-memory digital twin states
    twin_manager._states.clear()

    # 2. Reset database well setpoints to archetypes
    from app.ml.dataset_generator import SyntheticDatasetGenerator
    gen = SyntheticDatasetGenerator(random_seed=42)
    archetypes = {w["well_code"]: w for w in gen.get_fleet_well_archetypes()}

    wells = db.query(Well).all()
    for w in wells:
        arch = archetypes.get(w.well_code)
        if arch:
            w.name = arch["name"]
            w.archetype = arch["archetype"]
            w.status = arch["status"]
            w.stroke_in = arch["stroke_in"]
            w.spm = arch["spm"]
            w.vfd_hz = round(arch["spm"] * 8.0, 1)
            w.steam_mass_tonnes = arch["steam_mass_tonnes"]
            w.injection_pressure_bar = arch["injection_pressure_bar"]
            w.base_temperature_c = arch["base_temperature_c"]
            w.base_pressure_bar = arch["base_pressure_bar"]

    # 3. Clean volatile demo runs and recommendations
    db.query(Recommendation).delete()
    db.query(OptimizationCandidate).delete()
    db.query(OptimizationRun).delete()
    db.query(FailureEvent).delete()
    db.query(SimulationPoint).delete()
    db.query(SimulationRun).delete()

    # 4. Log audit event
    reset_audit = AuditEvent(
        actor="DEMO_OPERATOR",
        role="ENGINEER",
        action="RESET_DEMO",
        entity_type="SYSTEM",
        entity_id="BAGHETWIN_DEMO_FLEET",
        before_json={"status": "MODIFIED_RUNTIME_STATE"},
        after_json={"status": "DETERMINISTIC_BASELINE_RESTORED"},
        result="SUCCESS"
    )
    db.add(reset_audit)
    db.commit()

    logger.info("[DEMO RESET] Fleet states, active anomalies, recommendations, and audit logs reset to deterministic baseline")
    return {
        "status": "RESET_SUCCESSFUL",
        "message": "Demo fleet returned to initial deterministic state."
    }


# -------------------------------------------------------------
# 9. Simulated Live Telemetry WebSocket
# -------------------------------------------------------------
@router.websocket("/ws/telemetry/{well_code}")
async def websocket_telemetry_endpoint(websocket: WebSocket, well_code: str):
    """
    Streams simulated live sensor telemetry packets at ~1.5 Hz.
    """
    await streamer.connect(well_code, websocket)
    try:
        # Retrieve or construct well parameter mock
        well_params = WellParameters(well_code=well_code)
        while True:
            packet = streamer.generate_live_tick(well_params)
            await websocket.send_json(packet)
            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        streamer.disconnect(well_code, websocket)
    except Exception:
        streamer.disconnect(well_code, websocket)
