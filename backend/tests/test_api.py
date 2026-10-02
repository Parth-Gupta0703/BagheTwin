"""
API Integration Tests for FastAPI REST Endpoints
Tests complete API contracts, responses, simulation runs, joint optimization,
recommendation approvals, audit trail, and anomaly injection.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["data_status"] == "SYNTHETIC / DEMO"


def test_list_wells_endpoint():
    response = client.get("/api/v1/wells")
    assert response.status_code == 200
    wells = response.json()
    assert len(wells) >= 12
    codes = [w["well_code"] for w in wells]
    assert "BGW-001" in codes
    assert "BGW-002" in codes


def test_get_well_details_and_state():
    # Details
    resp_details = client.get("/api/v1/wells/BGW-001")
    assert resp_details.status_code == 200
    assert resp_details.json()["well_code"] == "BGW-001"

    # State
    resp_state = client.get("/api/v1/wells/BGW-001/state")
    assert resp_state.status_code == 200
    state = resp_state.json()
    assert state["temperature_c"] > 0
    assert state["viscosity_cp"] > 0
    assert "floating_margin_kn" in state
    assert "overall_risk_score" in state


def test_well_history_and_dynacard():
    # History
    resp_hist = client.get("/api/v1/wells/BGW-001/history?limit=10")
    assert resp_hist.status_code == 200
    history = resp_hist.json()
    assert len(history) > 0
    assert history[0]["source_type"] == "SYNTHETIC"

    # Dynacard
    resp_card = client.get("/api/v1/wells/BGW-001/dynacard")
    assert resp_card.status_code == 200
    card = resp_card.json()
    assert len(card["card_points"]) > 20
    assert "condition" in card


def test_simulation_run_endpoint():
    payload = {
        "well_code": "BGW-001",
        "horizon_days": 30
    }
    resp = client.post("/api/v1/simulation/run", json=payload)
    assert resp.status_code == 200
    sim = resp.json()
    assert "run_id" in sim
    assert len(sim["timeline"]) == 31
    assert sim["cumulative_oil_bbl"] > 0


def test_ml_predictions():
    # Production
    resp_prod = client.post("/api/v1/predictions/production", json={
        "temperature_c": 55.0,
        "viscosity_cp": 8000.0,
        "stroke_in": 120.0,
        "spm": 5.5,
        "vfd_hz": 44.0,
        "flowing_bhp_bar": 18.0
    })
    assert resp_prod.status_code == 200
    data_prod = resp_prod.json()
    assert data_prod["point_prediction"] >= 0
    assert data_prod["lower_bound_p10"] <= data_prod["point_prediction"]

    # Risk
    resp_risk = client.post("/api/v1/predictions/risk", json={
        "floating_margin_kn": 2.0,
        "viscosity_cp": 14000.0,
        "spm": 7.5,
        "pprl_kn": 85.0,
        "mprl_kn": 10.0,
        "temperature_c": 47.0
    })
    assert resp_risk.status_code == 200
    data_risk = resp_risk.json()
    assert "predicted_risk_tier" in data_risk


def test_joint_optimization_and_approval_flow():
    # 1. Trigger joint optimization
    opt_payload = {
        "well_code": "BGW-001",
        "search_intensity": 20
    }
    resp_opt = client.post("/api/v1/optimization/joint", json=opt_payload)
    assert resp_opt.status_code == 200
    opt_data = resp_opt.json()
    assert "recommendation_id" in opt_data
    rec_id = opt_data["recommendation_id"]
    assert opt_data["feasible_candidates_count"] > 0

    # 2. Approve recommendation
    approve_payload = {
        "actor": "TEST_ENGINEER",
        "role": "ENGINEER",
        "reason": "Test approval for continuous integration."
    }
    resp_app = client.post(f"/api/v1/recommendations/{rec_id}/approve", json=approve_payload)
    assert resp_app.status_code == 200
    app_data = resp_app.json()
    assert app_data["status"] == "APPROVED"

    # 3. Verify in audit trail
    resp_audit = client.get("/api/v1/audit?limit=5")
    assert resp_audit.status_code == 200
    events = resp_audit.json()
    actions = [e["action"] for e in events]
    assert "APPROVE_SIMULATED_RECOMMENDATION" in actions


def test_anomaly_injection():
    resp_anom = client.post("/api/v1/twin/BGW-001/inject-anomaly", json={
        "anomaly_type": "HIGH_SPM_SURGE"
    })
    assert resp_anom.status_code == 200
    data = resp_anom.json()
    assert data["status"] == "ANOMALY_ACTIVE"
    assert data["updated_twin_state"]["overall_risk_tier"] == "CRITICAL"


def test_demo_reset_endpoint():
    resp_reset = client.post("/api/v1/demo/reset")
    assert resp_reset.status_code == 200
    data = resp_reset.json()
    assert data["status"] == "RESET_SUCCESSFUL"

    # Verify audit event was logged
    resp_audit = client.get("/api/v1/audit?limit=5")
    assert resp_audit.status_code == 200
    events = resp_audit.json()
    actions = [e["action"] for e in events]
    assert "RESET_DEMO" in actions
