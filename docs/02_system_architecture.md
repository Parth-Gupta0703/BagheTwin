# 02 — System Architecture & Data Flow

## 1. High-Level Architectural Diagram

```
+-------------------------------------------------------------------------------+
|                        REACT CONTROL ROOM FRONTEND                             |
|  - Command Center          - Well Explorer         - Vertical Digital Twin     |
|  - CSS Optimizer           - SRP Optimizer         - Scenario Sandbox (30-90d) |
|  - Risk & Reliability      - Forecasts & ML        - Before vs After           |
|  - Live Operations (1.5Hz) - Audit Trail           - Data & Model Provenance   |
+-------------------------------------------------------------------------------+
                                    ▲  │ (HTTP REST / WebSocket)
                                    │  ▼
+-------------------------------------------------------------------------------+
|                           FASTAPI MODULAR BACKEND                             |
|                                                                               |
|  [Ingestion & Data Quality Layer]                                             |
|  - Physical plausibility checks, range validation, spike filtering            |
|                                                                               |
|  [Coupled Petroleum Physics Simulator]                                        |
|  - Viscosity: Andrade-Arrhenius thermal thinning                              |
|  - Steam: IAPWS two-phase saturation enthalpy & delivered energy              |
|  - Thermal: Reduced-order CSS heat balance & exponential decay                |
|  - Inflow: Temperature-adjusted Darcy PI (Linear PI)                          |
|  - Wellbore: Dynamic fluid level & Hagen-Poiseuille laminar friction          |
|  - SRP: Mills acceleration, Couette viscous drag, downstroke floating margin  |
|                                                                               |
|  [Machine Learning & Uncertainty Estimation]                                  |
|  - Production surrogate: PolynomialRidgeRegressor (NumPy)                     |
|  - Rod-floating classifier: RegularizedLogisticClassifier (SciPy)             |
|  - Anomaly detection: Mahalanobis Distance / Covariance Envelope              |
|  - Domain Applicability Guardrail: IN_DOMAIN / NEAR_BOUNDARY / OUT_OF_DOMAIN   |
|                                                                               |
|  [Constrained Multi-Objective Optimizer]                                      |
|  - Hard safety filtering (rejects unsafe candidates prior to ranking)         |
|  - Pareto front identification & Knee-point selection                         |
|  - Grounded deterministic explainability engine                               |
|                                                                               |
|  [Digital Twin State Manager]                                                 |
|  - In-memory state vector x = f(x, u, dt)                                     |
|  - Live telemetry streamer & synthetic fault injection                        |
+-------------------------------------------------------------------------------+
                                    ▲  │
                                    │  ▼
+-------------------------------------------------------------------------------+
|                     PERSISTENCE & REPOSITORIES (SQLAlchemy)                   |
|  - PostgreSQL 16 (Production) / SQLite Fallback (Local Demo)                  |
|  - Tables: wells, telemetry, css_cycles, simulation_runs, recommendations,    |
|            audit_events, model_registry                                       |
+-------------------------------------------------------------------------------+
```

## 2. Design Decisions
1. **Modular Monolith:** A cohesive FastAPI backend rather than fragile microservices ensures single-process testability, lower latency, and zero distributed coordination overhead.
2. **Deterministic Physics First:** All core engineering decisions stem from physical equations. ML functions strictly as a fast surrogate accelerator and statistical risk classifier.
3. **Fail-Safe Constraint Architecture:** Unsafe candidates are discarded before objective evaluation, guaranteeing the system never proposes an operating point that violates fracture pressure or rod float limits.
