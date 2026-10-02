# 16 — Verification & Testing Strategy

## 1. Test Automation Hierarchy
The test suite consists of 23 automated backend tests and complete TypeScript typecheck / Vite bundle verification:

### 1. Physics Property Tests (`backend/tests/test_physics.py`)
* Unit conversion correctness (K, °C, bar, Pa, cP, BOPD, m³/s).
* Monotonicity of heavy-oil viscosity with temperature ($dT > 0 \implies d\mu < 0$).
* Strict positivity of viscosity ($\mu > 0$).
* Monotonic cooling decay during production phase.
* Non-negativity of reservoir inflow rates under extreme bottomhole backpressure.
* Coupled SRP kinematics: downstroke viscous drag and rod-floating margin reduction.
* Dynacard closed-loop stroke verification.
* Master simulator coupling constraint: actual liquid rate never exceeds reservoir inflow or pump capacity.

### 2. Machine Learning & Applicability Tests (`backend/tests/test_ml_applicability.py`)
* In-domain vs. out-of-domain feature envelope classification.
* Quantile prediction intervals (P10, P50, P90).
* Anomaly detection and risk tiering.

### 3. Optimizer & Constraint Tests (`backend/tests/test_optimizer_constraints.py`)
* Rejection of candidates violating fracture pressure ceiling.
* Rejection of candidates violating the 2.0 kN rod-floating safety floor.
* Deterministic Pareto frontier ranking and structured explainability output.

### 4. API & Integration Tests (`backend/tests/test_api.py`)
* Full endpoint contract validation across `/wells`, `/state`, `/history`, `/simulation/run`, `/optimization/joint`, `/recommendations/approve`, and `/twin/inject-anomaly`.
* Automated audit log generation on approval.

## 2. Test Execution Command
```bash
python scripts/run_tests.py
```
Outputs automated test report across both pytest and frontend builds.
