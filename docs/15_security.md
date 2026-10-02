# 15 — Security Architecture & Role-Based Access

## 1. Safety Boundary: No Direct Actuation
BagheTwin is an **advisory decision-support system**, not an automated supervisory control and data acquisition (SCADA) or PLC loop:
* The system never issues physical actuation commands to variable frequency drives, pumps, or steam generators.
* "Approve" actions strictly apply recommended setpoints to the **simulated Digital Twin state**.
* An immutable audit log records the approving operator, timestamp, and parameter diffs.

## 2. Role-Based Access Control (RBAC)
The API supports four distinct user roles:
1. `VIEWER`: Read-only access to Command Center, Well Explorer, and Digital Twin states.
2. `ENGINEER`: Can run Scenario Lab simulations, ML forecasts, and multi-objective optimizations.
3. `OPERATOR`: Authorized to approve or reject simulated optimization recommendations.
4. `ADMIN`: System configuration, data seeding, and model retraining authorization.

## 3. Input Validation & Hardening
* All REST endpoints enforce Pydantic v2 schema constraints and physical boundaries.
* CORS allowlists are enforced in production environments.
* SQLite injection is prevented via SQLAlchemy parameterized queries.
