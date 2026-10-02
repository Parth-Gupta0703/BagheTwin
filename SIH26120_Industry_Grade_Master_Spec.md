# SIH26120 — BagheTwin / Well-to-Surface Digital Twin
## Industry-Grade Prototype Master Specification for Antigravity

## 0. EXECUTION MODE

Build this as a complete, working, demo-ready, engineering-oriented software prototype for Smart India Hackathon 2026 Problem Statement SIH26120.

Do not stop at a UI mockup. Implement the simulator, synthetic-data pipeline, ML layer, constrained optimizer, digital-twin state manager, API, database, dashboard, scenario lab, simulated telemetry, audit trail, testing, documentation, Docker setup and demo flow.

Work autonomously. Do not ask the user to choose between reasonable architecture options. Choose the safer, simpler, more maintainable default and continue.

Before coding, inspect the repository and identify what already exists. Preserve useful work, but refactor weak or misleading claims. Do not blindly copy public SIH implementations.

The final system must be honest about what is simulated. Never present synthetic values or simulator-derived ML metrics as real Oil India measurements or field validation.

Primary target:
- OIL India Limited
- Baghewala Field, Rajasthan
- Jodhpur Sandstone heavy-oil reservoir
- SIH PS 26120

---

# 1. SOURCE OF TRUTH / DOMAIN FACTS

Use the provided SIH problem statement as the primary scope source.

Documented PS facts include:
- Heavy crude approximately 17–19° API.
- Jodhpur Sandstone reservoir.
- Reservoir temperature approximately 46–48°C.
- High viscosity, high asphaltene content and low reservoir pressure.
- CSS and SRP are the two coupled operating systems in scope.
- CSS controls to model: steam volume, injection pressure, soak time and production cut-off.
- SRP controls to model: stroke length, SPM and VFD settings.
- Key risks/issues: rod floating, impact loading, rod failures, pump unsetting, lower pump efficiency, high energy use, high SOR and reduced oil recovery.
- Expected system: AI-enabled well-to-surface digital twin with monitoring, prediction and optimization.

Current OIL public Rajasthan-field information also states that Baghewala is producing heavy crude, that SRP is used for artificial lift, and CSS is used as the thermal EOR approach. The same OIL source currently describes Baghewala as having 56 wells drilled, with 34 in production, and gives a current viscosity range of 10,000–13,000 cP at 50°C. Treat this OIL-public information as contextual reference, not as a substitute for proprietary well-level data.

Do NOT hard-code unverified numbers from other student repositories such as:
- exact steam tonnage ranges,
- exact peak steam temperatures,
- exact viscosity at 180/260°C,
- exact rod loads,
- exact failure percentages,
- exact field well counts other than the cited OIL public source,
- exact production rates.

Any number not directly supported by the PS or a verified public source must be marked as one of:
- ASSUMPTION
- SYNTHETIC
- CONFIGURABLE

---

# 2. CORE PRODUCT CONCEPT

The product is a decision-support digital twin, not a PLC controller.

Conceptual loop:

CURRENT TELEMETRY / HISTORICAL DATA
        ↓
DATA QUALITY + UNIT NORMALIZATION
        ↓
DIGITAL TWIN STATE ESTIMATION
        ↓
COUPLED PHYSICS MODEL
        ├── Reservoir thermal state
        ├── Temperature-dependent viscosity
        ├── Reservoir inflow / mobility
        ├── Wellbore pressure/temperature
        └── SRP mechanics / pump performance
        ↓
ML SURROGATES + RISK MODELS
        ↓
CONSTRAINED MULTI-OBJECTIVE OPTIMIZATION
        ↓
SAFETY / APPLICABILITY / OOD CHECKS
        ↓
ENGINEER-FACING RECOMMENDATION
        ↓
HUMAN APPROVAL
        ↓
SIMULATED TWIN STATE UPDATE
        ↺

Do not describe an optimization as a field control command. The UI should call it a RECOMMENDATION / DECISION-SUPPORT ACTION.

---

# 3. ARCHITECTURE DECISION

Use a modular monolith rather than unnecessary microservices.

Stack:

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide
- React Three Fiber for an optional lightweight 3D well visualization
- Zod for client-side validation
- Vitest + Playwright for testing

Backend:
- Python 3.11+
- FastAPI
- Pydantic v2
- SQLAlchemy
- Alembic
- NumPy
- Pandas
- SciPy
- scikit-learn
- XGBoost only where it clearly helps
- joblib
- pytest
- optional Hypothesis for property tests

Database:
- PostgreSQL 16 for the main implementation
- SQLite fallback only for an ultra-light demo mode if needed

DevOps:
- Docker
- Docker Compose
- GitHub Actions
- .env.example

Do not add Java/Spring Boot unless there is already a strong project reason. For a hackathon prototype, one FastAPI backend is easier to validate and maintain.

---

# 4. PHYSICS ENGINE — REQUIRED DESIGN

The physics engine is the engineering backbone. ML is a surrogate/accelerator, not the source of truth.

Implement modules:

backend/app/physics/
- units.py
- viscosity.py
- steam.py
- thermal.py
- reservoir.py
- wellbore.py
- srp.py
- dynacard.py
- risk.py
- economics.py
- engine.py

Every physics output must carry:
- value
- unit
- model name
- model version
- whether it is measured, simulated or derived

Use SI units internally wherever practical. Convert only at API/UI boundaries.

---

# 5. VISCOSITY MODEL

Use a temperature-dependent heavy-oil viscosity model.

Primary prototype form:

ln(mu) = A + B / T_K

or equivalent referenced form:

mu(T) = mu_ref * exp(B * (1/T_K - 1/T_ref_K))

Do not pretend the coefficients are Baghewala-calibrated unless a verified dataset/calibration is supplied.

Create configurable viscosity calibration parameters:
- A
- B
- reference temperature
- reference viscosity

The UI should expose the provenance:

MODEL:
Temperature-dependent viscosity
DATA SOURCE:
Synthetic / configurable
CALIBRATION:
Not field-calibrated

ASTM D341 is a legitimate petroleum viscosity-temperature reference. Use it as a documentation/reference framework, not as a claim that the demo model is ASTM-certified.

Important: distinguish dynamic viscosity (cP) from kinematic viscosity. Never silently mix units.

---

# 6. STEAM PROPERTY MODEL

Do not permanently hard-code one latent heat number.

Prefer a steam-property library such as CoolProp/IAPWS if available.

Inputs:
- steam mass
- pressure
- quality / dryness fraction
- injection duration
- optional steam temperature

Outputs:
- steam enthalpy
- estimated delivered thermal energy
- condensed-water equivalent
- steam energy per barrel

Fallback mode:
- use configurable steam property tables/constants,
- clearly identify fallback mode in metadata.

Never use a fixed 2.75 MJ/kg claim as a universal constant.

---

# 7. CSS MODULE

Represent CSS as:

INJECTION → SOAK → PRODUCTION → EVALUATE → NEXT CYCLE

Inputs:
- steam mass/volume
- steam rate
- injection pressure
- steam quality
- injection duration
- soak duration
- production duration / cut-off
- initial reservoir temperature
- initial reservoir pressure
- near-wellbore thermal parameters

Outputs:
- peak near-wellbore temperature
- thermal state curve
- temperature after 1/7/14/30/60/90 days
- viscosity curve
- expected oil rate
- SOR
- energy use
- cycle oil

Default thermal model:
A reduced-order heat balance with exponential cooling is acceptable for prototype mode.

Suggested structure:

C_eff * dT/dt = Q_steam - Q_loss - Q_production

During cooling, use a configurable reduced-order decay model:

T(t) = T_base + (T_peak - T_base) exp(-lambda t)

Make lambda a configurable function of thermal properties and produced-fluid rate.

Design the API so a more advanced thermal model can later replace this component without changing the rest of the system.

Optional advanced research mode:
- Marx-Langenheim-inspired reduced-order thermal response.

Do not label the prototype as a full reservoir simulator.

---

# 8. RESERVOIR INFLOW / MOBILITY

Use a transparent reduced-order inflow model.

At prototype level:

mobility = k / mu

and:

q_inflow ≈ J(T) * drawdown

Use a configurable productivity index formulation.

Do not blindly apply Vogel IPR merely because it is famous. Vogel is principally for specific solution-gas-drive oil reservoir conditions. For a heavy-oil synthetic prototype with no verified PVT/pressure regime, a temperature-adjusted PI model is easier to justify.

Allow an optional IPR strategy:
- linear PI
- configurable empirical IPR

Document why the default is linear PI.

The inflow module must not output physically impossible values.

Constraints:
- q >= 0
- drawdown >= 0
- pressure within limits
- viscosity > 0

---

# 9. WELLBORE MODEL

Build a reduced-order wellbore state module.

Inputs:
- reservoir pressure
- reservoir temperature
- oil/water rates
- tubing geometry
- pump depth
- fluid properties
- wellhead pressure

Outputs:
- bottomhole flowing pressure
- pump intake pressure
- fluid column / level estimate
- downhole temperature estimate
- effective viscosity at pump depth
- pressure-drop components

Keep the model transparent.

Use a configurable hydrostatic + friction structure.

If a friction regime changes, expose Reynolds number and selected regime in the diagnostic output.

Do not pretend this is a full multiphase transient simulator.

---

# 10. SRP MODEL

Inputs:
- stroke length
- SPM
- VFD frequency
- pump bore
- rod diameter
- rod string length / pump depth
- tubing ID
- fluid density
- viscosity
- fluid level
- pump fillage

Outputs:
- polished rod position over a cycle
- rod velocity
- rod acceleration
- PPRL
- MPRL
- load span
- buoyant rod weight
- viscous drag
- floating margin
- rod stress proxy
- pump displacement
- pump efficiency
- estimated power
- energy per barrel

Use reduced-order mechanics based on harmonic kinematics and viscous drag.

API TR 11L / related API sucker-rod documents can be cited as engineering references. Do not claim API compliance. API itself notes that its TR 11L calculations apply to broad conventional systems under assumed conditions and that unusual conditions can deviate.

This is important for Baghewala heavy oil.

---

# 11. ROD FLOATING MODEL

Rod float is a critical feature and is supported by public literature/patent descriptions for rod-pumped heavy-oil systems.

Physical interpretation:

During downstroke:
- surface equipment moves downward;
- heavy/high-viscosity fluid produces drag opposing rod descent;
- if rod-string downward movement becomes insufficient, polished-rod load can approach zero and carrier-bar separation/slack can occur.

Implement a simplified floating-margin metric:

floating_margin = effective_downward_force - opposing_drag_force - dynamic_terms

and a risk probability / band:

LOW
MEDIUM
HIGH
CRITICAL

Do not claim that one simple threshold is universally valid. Make thresholds configurable and show the threshold source as DEMO / CONFIGURATION.

Also expose:
- drag force
- buoyant rod weight
- MPRL
- floating margin

---

# 12. DYNAMOMETER CARD

Implement a synthetic dynacard generator from the SRP state.

Generate:
- position x = normalized stroke
- polished rod load y
- upstroke/downstroke phases
- current operating point

Create a few clearly labelled synthetic failure patterns:
- NORMAL
- HIGH_DRAG / ROD_FLOAT
- PUMP_OFF
- FLUID_POUND (illustrative)
- VALVE_LEAKAGE (illustrative)

These are demonstration classes unless a real labelled dynacard dataset is supplied.

Do not claim field classification accuracy.

UI should show:
- live/current card
- baseline card
- difference overlay
- flagged condition
- reasons

---

# 13. PRODUCTION MODEL

Actual liquid/oil production should be constrained by both reservoir deliverability and pump capacity.

Conceptually:

actual_liquid_rate = min(reservoir_inflow, pump_capacity) * uptime_factor

oil_rate = liquid_rate * (1 - water_cut)

Make water cut configurable and synthetic by default.

Do not allow pump capacity to magically create reservoir inflow.

---

# 14. ENERGY MODEL

Calculate:
- mechanical/polished rod power proxy
- motor/drive efficiency
- energy per day
- energy per barrel
- steam thermal energy

Separate:
- electric/mechanical energy
- steam energy

Display both so the optimization does not hide one cost inside another.

---

# 15. SOR

Use a transparent definition.

SOR = steam injected / oil produced

Be explicit about whether steam is:
- mass based,
- volume based,
- cold-water-equivalent based.

Choose one display convention and document it.

---

# 16. DIGITAL TWIN STATE MODEL

Create a persistent state object per well.

State vector should include approximately:

x = [
  reservoir_temperature,
  reservoir_pressure,
  viscosity,
  inflow_rate,
  flowing_bhp,
  pump_intake_pressure,
  fluid_level,
  oil_rate,
  water_rate,
  pump_fillage,
  pprl,
  mprl,
  rod_load,
  drag_force,
  floating_margin,
  pump_efficiency,
  energy_rate,
  risk_scores
]

Inputs/u should include:

u = [
  steam_mass,
  injection_pressure,
  injection_duration,
  soak_duration,
  production_cutoff,
  stroke,
  spm,
  vfd
]

Create a clear state transition method:

next_state = f(current_state, inputs, dt)

Add measurement-update support so later a real telemetry adapter can be connected.

For the prototype, use simulated telemetry.

Optional advanced implementation:
- diagonal/extended Kalman filter for a small subset of state variables.

If implemented, show the difference between:
- Physics-predicted state
- Observed/simulated sensor state
- Fused twin state

---

# 17. DATA PROVENANCE

This is mandatory.

Every generated dataset must include metadata:

- dataset_id
- source_type = SYNTHETIC
- simulator_version
- model_config_version
- random_seed
- created_at
- parameter_manifest
- source references

Every ML model must include:
- model_id
- model_version
- training_dataset_id
- simulator_version
- feature_schema_version
- training date
- validation method
- metrics
- confidence tier

Every recommendation must include:
- recommendation_id
- well_id
- current_state_hash
- simulator_version
- model versions
- optimizer version
- candidate search size
- constraints evaluated
- selected objective weights
- generated_at
- approval status

---

# 18. SYNTHETIC DATA GENERATOR

Generate realistic variation, not random noise-only rows.

Minimum demo dataset:
- 10–20 synthetic wells
- 180–365 days history per well
- daily baseline telemetry
- higher-frequency synthetic telemetry for live mode
- 3–6 CSS cycles per well
- SRP operation records
- simulated anomalies/events

Use scenario families:
1. healthy / thermally supported
2. cooling / rising viscosity
3. aggressive SPM
4. under-pumped
5. high steam / poor recovery
6. rod-float risk
7. pump-unsetting risk
8. abnormal pressure behavior
9. recovery after new CSS cycle
10. near-constraint operating point

Seed the RNG so results are reproducible.

Never fabricate an external source citation for the synthetic values.

---

# 19. DATA SCHEMA

PostgreSQL tables:

### wells
- id
- well_code
- field
- reservoir_name
- completion_type
- measured_depth_m
- pump_depth_m
- API_gravity
- base_temperature_C
- base_pressure_bar
- permeability_md
- net_pay_m
- tubing_id_mm
- rod_diameter_mm
- pump_bore_mm
- data_status
- created_at
- updated_at

### telemetry
- id
- well_id
- timestamp
- source_type
- temperature_C
- pressure_bar
- flowing_bhp_bar
- pump_intake_pressure_bar
- oil_rate_bopd
- water_rate_bwpd
- fluid_level_m
- viscosity_cP
- spm
- stroke_in
- vfd_hz
- motor_power_kW
- pprl_kN
- mprl_kN
- rod_load_kN
- pump_fillage_pct
- pump_efficiency_pct
- drag_force_kN
- floating_margin_kN
- energy_kwh

### css_cycles
- id
- well_id
- cycle_number
- start_at
- injection_duration_hr
- soak_duration_hr
- production_duration_days
- steam_mass_t
- injection_pressure_bar
- steam_quality
- peak_temperature_C
- cycle_oil_bbl
- cycle_energy_kwh
- sor
- model_version

### srp_operations
- id
- well_id
- timestamp
- stroke_in
- spm
- vfd_hz
- pump_fillage_pct
- pprl_kN
- mprl_kN
- rod_load_kN
- energy_kwh
- efficiency_pct

### failure_events
- id
- well_id
- timestamp
- event_type
- severity
- trigger_source
- simulated
- description

### simulation_runs
- id
- run_id
- well_id
- mode
- horizon_days
- seed
- simulator_version
- created_at

### simulation_points
- id
- run_id
- day_index
- timestamp
- temperature_C
- viscosity_cP
- oil_rate_bopd
- water_rate_bwpd
- sor
- energy_kwh
- rod_risk
- failure_risk

### predictions
- id
- prediction_id
- well_id
- model_id
- target
- point_prediction
- lower_bound
- upper_bound
- applicability_status
- created_at

### optimization_runs
- id
- optimization_id
- well_id
- objective_config_json
- constraint_config_json
- candidates_evaluated
- candidates_feasible
- duration_ms
- created_at

### optimization_candidates
- id
- optimization_id
- steam_mass_t
- injection_pressure_bar
- soak_hr
- production_cutoff_days
- stroke_in
- spm
- vfd_hz
- predicted_oil_bopd
- predicted_sor
- predicted_energy_kwh
- predicted_risk
- feasibility
- objective_score

### recommendations
- id
- recommendation_id
- optimization_id
- well_id
- current_state_json
- recommended_state_json
- rationale_json
- expected_deltas_json
- approval_status
- approved_by
- approved_at
- created_at

### audit_events
- id
- timestamp
- actor
- role
- action
- entity_type
- entity_id
- before_json
- after_json
- result

### model_registry
- id
- model_id
- version
- model_type
- artifact_path
- dataset_id
- metrics_json
- calibration_json
- feature_schema_version
- created_at

---

# 20. DATA QUALITY LAYER

Every ingestion pipeline must validate:
- missing values
- impossible ranges
- duplicate timestamps
- unit mismatches
- time ordering
- sensor flatlines
- spikes
- stale values
- inconsistent well identifiers

Implement rules like:
- temperature below physical demo floor → invalid
- viscosity <= 0 → invalid
- negative oil rate → invalid unless explicitly marked test/reversal
- SPM < 0 → invalid
- pressure < 0 → invalid
- stroke <= 0 → invalid

Do not silently “fix” data. Record the correction and reason.

---

# 21. MACHINE LEARNING STRATEGY

Do not train an ML model only to reproduce one equation and then call it field AI.

Use ML as:
- surrogate model
- residual correction model
- anomaly detector
- risk classifier

Recommended models:

1. Production surrogate:
GradientBoostingRegressor or XGBoost

2. Thermal prediction:
RandomForestRegressor / GradientBoostingRegressor

3. Rod-float risk:
RandomForestClassifier or calibrated gradient boosting

4. Equipment risk:
GradientBoosting / XGBoost classifier

5. Anomaly detection:
IsolationForest

6. Optional uncertainty:
Quantile regressors or ensemble prediction intervals

The training metadata must clearly state:

FIELD VALIDATION STATUS:
NOT VALIDATED

because training data are synthetic unless actual field data are provided.

---

# 22. ML VALIDATION

Synthetic-data validation:
- temporal holdout
- well holdout
- scenario holdout

This matters because a model trained on synthetic data should be tested on unseen synthetic operating regimes, not random rows only.

Required metrics:

Regression:
- MAE
- RMSE
- R²
- MAPE only when denominator safely supports it

Classification:
- precision
- recall
- F1
- ROC-AUC
- PR-AUC where classes are imbalanced
- confusion matrix

Also report:
- train/test split
- data source
- simulator version
- seed

Never show synthetic fit metrics on the UI as “field accuracy”.

---

# 23. OOD / APPLICABILITY GUARDRAIL

Industry-grade means the model must know when it is outside its trained domain.

Implement a simple applicability layer:

- Compare incoming features to training min/max/envelope.
- Detect obvious out-of-range values.
- Optionally use Mahalanobis distance or IsolationForest on the feature space.

Return:
- IN_DOMAIN
- NEAR_BOUNDARY
- OUT_OF_DOMAIN

If OUT_OF_DOMAIN:
- do not present the model recommendation as high confidence;
- allow physics-only simulation;
- show a warning.

---

# 24. UNCERTAINTY

Every forecast should support:
- point prediction
- lower bound
- upper bound
- confidence/applicability tier

Suggested display:

Production forecast:
368 BOPD
P10–P90: 330–401 BOPD
Applicability: IN DOMAIN

Do not call P10/P90 “confidence interval” unless the model actually estimates that uncertainty. Use “prediction interval” if appropriate.

---

# 25. OPTIMIZATION ENGINE

Use a multi-objective constrained optimizer.

Decision variables:

CSS:
- steam mass
- injection pressure
- soak duration
- production cut-off

SRP:
- stroke
- SPM
- VFD frequency

Objectives:
- maximize oil production
- minimize SOR
- minimize energy
- minimize mechanical risk
- optionally minimize expected maintenance cost

Use hard safety constraints.

Recommended implementation:
- generate feasible candidates using Latin Hypercube / smart grid / NSGA-II
- evaluate every candidate with physics + ML surrogate
- reject unsafe candidates before ranking
- generate Pareto front
- choose a recommended point using configurable weights / knee point

Do not optimize through unsafe regions and merely penalize them after the fact.

---

# 26. CONSTRAINT ENGINE

Centralize all safety/operating constraints in one config file.

Example:

constraints:
  injection_pressure:
    min: configurable
    max: configurable
  spm:
    min: configurable
    max: configurable
  stroke:
    min: configurable
    max: configurable
  vfd:
    min: configurable
    max: configurable
  rod_stress_ratio:
    max: configurable
  floating_risk:
    max: configurable
  pump_fillage:
    min: configurable

Every optimization response should contain:
- accepted candidates
- rejected candidates
- rejection reasons

This is crucial for explainability.

---

# 27. RECOMMENDATION EXPLAINABILITY

Never output only:
“Reduce SPM.”

Return structured reasoning:

1. Current condition
2. Main contributing factors
3. Constraint pressure
4. Recommended action
5. Expected effects
6. Uncertainty/applicability

Example:

Current thermal state is cooling.
Estimated viscosity is increasing.
The incremental production benefit from increasing SPM is small.
Predicted downstroke drag is approaching the floating threshold.
Recommendation: reduce SPM within the approved envelope.
Expected effect: lower dynamic loading with limited production loss.
Applicability: IN DOMAIN.

This text must be generated from model outputs/rules, not free-form hallucination.

---

# 28. ECONOMICS

Optional but strongly recommended.

Use configurable demo assumptions for:
- oil price
- steam cost
- electricity cost
- maintenance/failure cost

Calculate:
- gross incremental oil value
- steam cost
- energy cost
- expected maintenance cost
- net daily contribution

Clearly label all monetary assumptions as DEMO / CONFIGURABLE.

Do not present demo economics as Oil India commercial economics.

---

# 29. API CONTRACT

Use versioned REST routes:

GET  /api/v1/health
GET  /api/v1/wells
GET  /api/v1/wells/{well_id}
GET  /api/v1/wells/{well_id}/state
GET  /api/v1/wells/{well_id}/history
POST /api/v1/simulation/run
GET  /api/v1/simulation/{run_id}
POST /api/v1/predictions/production
POST /api/v1/predictions/risk
POST /api/v1/optimization/joint
GET  /api/v1/optimization/{optimization_id}
POST /api/v1/recommendations/{recommendation_id}/approve
POST /api/v1/recommendations/{recommendation_id}/reject
GET  /api/v1/audit
GET  /api/v1/models
GET  /api/v1/wells/{well_id}/dynacard

WebSocket:
/ws/v1/telemetry/{well_id}

FastAPI supports WebSockets, and the project should use them for simulated live telemetry. Keep the live source explicitly marked as SIMULATED.

---

# 30. SECURITY

Even though this is a demo, follow production-oriented basics:

- no secrets in source code
- .env.example
- strict CORS allowlist in production
- Pydantic input validation
- max request sizes
- rate limiting where appropriate
- structured authentication boundary
- role model:
  - VIEWER
  - ENGINEER
  - OPERATOR
  - ADMIN

Only ENGINEER/OPERATOR may approve a simulated recommendation.

Never allow a browser action to directly control a real device.

Explicitly separate:
- recommendation
- approval
- simulated application

---

# 31. AUDIT TRAIL

Every recommendation action must log:
- who
- role
- timestamp
- well
- current state
- recommended state
- constraints
- objective weights
- model versions
- simulator version
- approval/rejection
- result

The UI should show an Audit Trail page.

---

# 32. FRONTEND INFORMATION ARCHITECTURE

Create these pages:

1. Command Center
2. Well Explorer
3. Digital Twin
4. CSS Optimizer
5. SRP Optimizer
6. Scenario Lab
7. Risk & Reliability
8. Forecasts
9. Before vs After
10. Live Operations
11. Audit Trail
12. Model & Data Provenance

Use one coherent industrial-control-room visual language.

Avoid generic SaaS styling.

---

# 33. COMMAND CENTER

Top banner:
BAGHETWIN — WELL-TO-SURFACE DIGITAL TWIN

Status badges:
- DIGITAL TWIN ONLINE
- SIMULATION MODE
- DATA STATUS: SYNTHETIC / DEMO

Fleet cards:
- Active wells
- Wells requiring attention
- High rod-float risk
- High energy intensity
- Current field oil rate (synthetic demo)

Never make synthetic field aggregates look like official OIL numbers.

---

# 34. WELL EXPLORER

For each synthetic well show:
- thermal state
- viscosity
- oil rate
- SOR
- SRP state
- pump efficiency
- rod-float risk
- failure risk

Filters:
- risk level
- thermal stage
- CSS stage
- SRP status

---

# 35. DIGITAL TWIN PAGE

This is the signature page.

Show a lightweight 3D or schematic vertical well:

SURFACE
↓
WELLHEAD
↓
TUBING / ROD STRING
↓
SRP
↓
NEAR-WELLBORE REGION
↓
RESERVOIR

Clickable nodes:
- Reservoir
- Thermal
- Wellbore
- SRP
- Surface

Each node shows current state and model outputs.

Add a causal chain visualization:

Steam → Temperature → Viscosity → Mobility → Inflow → SRP → Production → Risk

---

# 36. CSS OPTIMIZER PAGE

Controls:
- steam mass
- injection pressure
- injection duration
- soak duration
- production cut-off

Buttons:
- Simulate
- Optimize
- Reset

Output:
- predicted oil
- SOR
- thermal curve
- viscosity curve
- energy
- recommended plan
- constraints passed/failed

---

# 37. SRP OPTIMIZER PAGE

Controls:
- stroke
- SPM
- VFD

Show:
- PPRL
- MPRL
- rod load
- drag
- floating margin
- pump efficiency
- energy per barrel
- dynacard

Include a small “Why?” panel.

---

# 38. SCENARIO LAB

Mandatory demo feature.

Allow user to alter inputs and run a 30/60/90-day simulation.

Preset scenarios:
- BASELINE
- AGGRESSIVE PUMPING
- LOW STEAM
- HIGH STEAM
- COOLING WELL
- ROD-FLOAT RISK
- OPTIMIZED

Show side-by-side charts:
- temperature
- viscosity
- production
- SOR
- energy
- rod risk

Scenario runs must not mutate the baseline well state unless the user explicitly applies a simulated recommendation.

---

# 39. BEFORE VS AFTER

This is a required page and should also appear immediately after optimization.

Columns:
CURRENT
RECOMMENDED
DELTA

Metrics:
- oil rate
- cycle oil
- SOR
- energy
- rod risk
- failure risk
- pump efficiency

Use truthful language:
“Modelled change” / “Predicted change” / “Synthetic scenario”.

Do not write “guaranteed improvement”.

---

# 40. LIVE OPERATIONS

Simulated telemetry stream through WebSocket.

Show:
- timestamp
- temperature
- pressure
- oil rate
- SPM
- stroke
- rod load
- pump fillage
- risk

Add controlled anomaly injection:
- temperature drop
- high SPM
- viscosity spike
- pump efficiency drop
- pressure abnormality

When triggered:
- create anomaly event
- show alert
- update risk
- generate recommendation

Label page clearly:
SIMULATED LIVE TELEMETRY

---

# 41. MODEL & DATA PROVENANCE PAGE

Show:

DATA
- source = synthetic
- simulator version
- seed
- number of wells
- date generated

MODELS
- name
- algorithm
- version
- train/test strategy
- metrics
- applicability

PHYSICS
- model name
- equations used
- parameter source
- calibration state

This page is a major part of the “industry-grade” feel.

---

# 42. MODEL GOVERNANCE

Add a model registry concept.

Each model has:
- owner
- version
- status
- dataset
- metrics
- approval status
- calibration state

Model states:
- EXPERIMENTAL
- DEMO
- VALIDATED
- RETIRED

All current synthetic models must be DEMO or EXPERIMENTAL, never VALIDATED.

---

# 43. TESTING

Backend unit tests:
- viscosity monotonicity
- viscosity positive
- steam heat positive
- cooling monotonicity after steam phase
- inflow non-negative
- pump capacity non-negative
- drag non-negative
- floating margin behavior
- impossible inputs rejected
- constraints reject unsafe candidates
- objective ranking deterministic for fixed seed

Simulation property tests:
- increasing temperature should not increase viscosity in the configured heavy-oil model
- removing steam should not increase simulated thermal energy
- an unsafe candidate must never be returned as approved

API tests:
- all endpoints
- invalid body
- unknown well
- optimization response schema
- audit writes
- WebSocket connect/disconnect

Frontend tests:
- navigation
- scenario controls
- chart rendering
- recommendation approval UI
- error states

End-to-end test:
Select well → run simulation → optimize → inspect recommendation → approve simulation → verify state change → verify audit trail.

---

# 44. CI/CD

Create GitHub Actions workflow:

- Python lint
- Python tests
- TypeScript typecheck
- Frontend tests
- Frontend build
- Docker build

No CI step may rely on external proprietary Oil India data.

---

# 45. OBSERVABILITY

Backend:
- structured logs
- request ID
- latency
- optimization duration
- simulation duration
- model inference duration

Endpoints:
- /health
- /ready

Log warnings for:
- OOD model input
- constraint violation
- failed optimization
- missing data
- suspicious sensor values

---

# 46. DEMO DATA / WELL SCENARIOS

Create 10–15 synthetic wells.

Use codes such as:
BGW-001 … BGW-015

Make each distinct through configuration, not random cosmetic numbers.

Recommended demo wells:

BGW-001
- cooling state
- high viscosity
- rod-float risk
- ideal for main demo

BGW-002
- thermally healthy
- normal pumping

BGW-003
- aggressive SPM
- high mechanical risk

BGW-004
- under-pumped
- low pump efficiency

BGW-005
- high SOR
- inefficient CSS

BGW-006
- pressure abnormality

BGW-007
- pump-unsetting scenario

BGW-008
- healthy optimized control

BGW-009
- low steam scenario

BGW-010
- recovery after CSS cycle

All numbers are synthetic.

---

# 47. MAIN 5-MINUTE JURY DEMO

Build a “JURY DEMO” button in the navbar.

It should open a deterministic, guided flow.

Minute 0–1:
Command Center → select BGW-001

Say:
“This is our synthetic demonstration well. The twin is showing its current thermal, reservoir and SRP state.”

Minute 1–2:
Digital Twin

Show:
Temperature ↓
Viscosity ↑
Drag ↑
Rod-float risk ↑
Production pressure

Minute 2–3:
Scenario Lab

Run baseline 30-day simulation.

Show:
Temperature vs time
Viscosity vs time
Oil production vs time
Risk vs time

Minute 3–4:
Joint Optimization

Generate Pareto candidates.
Show rejected unsafe candidates.
Show recommended candidate.

Minute 4–5:
Before vs After

Show modelled change in:
- production
- SOR
- energy
- rod risk

Then click:
APPROVE SIMULATED RECOMMENDATION

Show:
- twin state updated
- audit event created

End with:
“Today’s demo is based on synthetic/simulated data. In deployment, the same interfaces can ingest approved OIL telemetry and field calibration data.”

---

# 48. DO NOT DO THESE THINGS

Do not:
- call synthetic data “real field data”
- call synthetic ML metrics “field accuracy”
- claim API certification
- claim ASTM certification
- claim Oil India validation
- claim operational autonomy
- pretend the prototype is a full reservoir simulator
- use unexplained numbers copied from another repository
- make the optimizer issue real control commands
- let an LLM invent engineering recommendations
- use a chatbot as the main “AI” feature
- add needless microservices
- spend most effort on a landing page

---

# 49. OPTIONAL AI COPILOT

Only add after core physics/ML/optimizer/UI works.

If added:
- all answers must be grounded in structured tool outputs
- provide tools such as:
  get_well_state
  simulate
  compare_scenarios
  get_risk
  optimize
  explain_recommendation
  get_provenance

No direct arbitrary database access by the LLM.

No ability to issue physical commands.

All copilot answers must include a “Data / Model basis” reference.

---

# 50. REFERENCE IMPLEMENTATIONS TO STUDY — NOT TO COPY AS TRUTH

Useful public examples currently exist for this SIH PS.

1. viveky1621/sih26120-baghewala-digital-twin
   - simple synthetic coupled twin
   - good baseline architecture

2. nishanth24vv/sih26120-baghewala-digital-twin
   - larger React/FastAPI implementation
   - good ideas for digital-twin flow, risk UI, audit trail and testing

3. maddy-bit/SIH26120-PetroTwin-AI
   - useful architecture ideas for physics + ML + optimization + provenance
   - inspect, but verify all physics values independently

4. Apaar-Gupta/SIH-2026
   - useful compact working architecture for synthetic physics + ML

These are references only.
Do not copy their unsupported field claims.
Do not reuse their reported ML metrics.
Rebuild the project using verified source provenance and clearly separated assumptions.

---

# 51. PROJECT DOCUMENTATION TO GENERATE

Generate:

README.md

/docs/
01_problem_statement.md
02_system_architecture.md
03_domain_model.md
04_physics_model.md
05_css_model.md
06_wellbore_model.md
07_srp_model.md
08_dynacard.md
09_digital_twin.md
10_ml_model.md
11_optimization.md
12_data_dictionary.md
13_data_provenance.md
14_model_governance.md
15_security.md
16_testing.md
17_deployment.md
18_demo_script.md
19_limitations.md
20_jury_defense.md

README must contain:
- problem
- solution
- architecture diagram
- setup
- environment variables
- demo instructions
- data disclaimer
- model disclaimer
- API overview
- tests
- limitations

---

# 52. DEPLOYMENT

Support both:

A. Local demo
- docker compose up --build

B. No-Docker local mode
- backend venv
- frontend npm
- postgres optional / SQLite fallback only

Provide scripts:
- run_demo.ps1
- run_demo.bat
- scripts/seed_demo.py
- scripts/train_models.py
- scripts/run_tests.py

Add `/docs` Swagger for the API.

---

# 53. ACCEPTANCE CRITERIA

The system is not finished until all of these are true:

[ ] Backend starts successfully
[ ] Frontend starts successfully
[ ] Database migrates successfully
[ ] Demo data seeds successfully
[ ] Synthetic dataset generator works
[ ] Models train successfully
[ ] Physics simulation runs
[ ] 30/60/90-day scenario runs work
[ ] CSS optimization works
[ ] SRP optimization works
[ ] Joint optimization works
[ ] Unsafe candidates are rejected
[ ] Recommendation explanation works
[ ] Simulated telemetry WebSocket works
[ ] Anomaly injection works
[ ] Dynacard renders
[ ] Before/After page works
[ ] Audit trail works
[ ] Provenance page works
[ ] API tests pass
[ ] Frontend tests pass
[ ] E2E demo passes
[ ] Docker compose works
[ ] README is complete
[ ] No unsupported field claims remain
[ ] All synthetic values are labelled

---

# 54. FINAL SELF-AUDIT BEFORE PRESENTING

Before declaring the project complete, inspect the codebase and answer internally:

1. Which values are official/publicly sourced?
2. Which values are assumptions?
3. Which values are generated?
4. Which models are physics-based?
5. Which models are ML surrogates?
6. What does the optimizer constrain?
7. Can it ever recommend an unsafe point?
8. What happens if the input is outside the training domain?
9. Can the model explain its recommendation?
10. Can every result be traced to a simulator/model version?
11. Is human approval required before applying a simulated recommendation?
12. Is there any wording that implies field validation when none exists?
13. Can the complete system run without proprietary Oil India data?
14. Can a real-data adapter be plugged in later without rebuilding the application?

Fix any “no” answer before finishing.

---

# 55. DEFINITION OF “INDUSTRY-GRADE PROTOTYPE” FOR THIS PROJECT

Industry-grade prototype does NOT mean commercial field deployment.

It means:

- traceable data provenance
- explicit physical assumptions
- unit-safe engineering calculations
- modular model architecture
- safety constraints
- uncertainty/applicability awareness
- explainable optimization
- auditability
- repeatability
- test coverage
- deployment reproducibility
- clean API contracts
- realistic operator workflow
- honest limitations
- easy future calibration using approved field data

The final presentation should communicate:

“Today this is a scientifically transparent decision-support prototype built on synthetic/simulated data. The architecture is deliberately designed so approved field telemetry and calibration data can replace the demo data layer without replacing the entire system.”

That statement is the core credibility message.
