# BAGHETWIN — COMPLETE PROJECT PROFILE & PPT HANDOFF DOCUMENT
**Smart India Hackathon 2026 | Technical Handoff Document**

---

## 1. PROJECT IDENTITY

* **Project Name:** BAGHETWIN / BagheTwin
* **Hackathon:** Smart India Hackathon 2026 (SIH 2026)
* **Problem Statement ID:** SIH26120
* **Official Problem Statement Title:** *“Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field.”*
* **Organization:** Oil India Limited (OIL)
* **Theme:** Smart Automation
* **Category:** Software
* **Team ID:** 120855
* **Registered Team Name:** ShaolinCoder

---

## 2. EXECUTIVE DESCRIPTIONS

### One-Sentence Project Description
> **BAGHETWIN** is an AI-assisted, physics-coupled well-to-surface digital twin and decision-support prototype that jointly models reservoir thermal dissipation, temperature-dependent heavy crude viscosity, and sucker rod pump mechanics to prevent downstroke rod-floating hazards and optimize cyclic steam stimulation efficiency for Oil India Limited's Baghewala field.

### Three-Sentence Project Description
> Heavy oil extraction in the Baghewala field suffers from acute operating tradeoffs: cooling reservoir temperatures cause exponential viscosity spikes that create severe viscous drag on sucker rod strings, precipitating catastrophic downstroke rod floating, bridle separation, and equipment destruction. BAGHETWIN models the full causal chain—from steam thermodynamic enthalpy and formation heat transfer to Couette annular fluid shear and dynacard surface loads—within a unified multi-physics simulation engine. By combining fast polynomial surrogates, domain applicability guardrails, and constrained multi-objective Pareto optimization, the system provides explainable, safety-governed operational setpoints with full audit provenance.

### 30-Second Jury Explanation (Spoken Pitch)
> *"Honorable members of the jury, extracting 17° API heavy oil at Baghewala is an interconnected physics problem: as cyclic steam cools from 180°C to 48°C, crude viscosity surges exponentially from 200 to over 12,000 cP. This extreme viscosity creates over 44 kN of upward viscous drag against the falling sucker rod string, causing the rod to float, unseat, or smash into the carrier bar upon reversal.*
> 
> *Historically, steam injection and pump kinematics are treated in separate organizational silos. BagheTwin bridges this divide by delivering an integrated well-to-surface digital twin. It couples thermodynamics, rheology, and rod kinematics into a joint optimizer that enforces hard physical safety envelopes—such as capping injection pressure below formation fracture limits and ensuring a minimum 2.0 kN downstroke floating margin before evaluating any candidate.*
> 
> *Our prototype is 100% deterministic, features transparent model provenance, provides an immutable audit trail, and serves as an advisory decision-support workstation ready for future field calibration."*

### 2-Minute Technical Explanation (Deep Dive)
> *"BagheTwin is architected as an industrial-grade engineering decision-support workstation for petroleum engineers and operations teams. At its foundation is a coupled, first-principles forward physics engine:*
> 
> 1. *Thermal & Steam Thermodynamics:* Using modified IAPWS formulations, the steam engine calculates pressure-dependent saturation enthalpy and temperature. Near-wellbore thermal dissipation is modeled via a reduced-order heat balance capturing sensible heat retention, soak-period diffusion, and exponential production cooling driven by formation conduction and convective fluid extraction.
> 2. *Non-Linear Rheology:* Crude dynamic viscosity obeys the Andrade-Arrhenius temperature-dependent formulation, calibrated against Oil India Limited's public Rajasthan benchmark of ~11,500 cP at 50°C.
> 3. *Reservoir Deliverability:* Inflow follows a thermal-mobility-corrected linear Productivity Index (PI) model where Darcy mobility scales dynamically with local crude viscosity, deliberately avoiding invalid solution-gas drive assumptions.
> 4. *SRP Kinematics & Rod-Float Dynamics:* Polished rod motion is represented via harmonic kinematics and Mills dynamic acceleration. Crucially, annular viscous shear between the reciprocating rod string and tubing wall is resolved using narrow-gap Couette flow with power-law shear thinning. The downstroke floating margin is strictly formulated as buoyant rod weight minus dynamic upward acceleration and annular viscous drag.
> 5. *Coupling Constraint:* Pump capacity and reservoir inflow are constrained via a strict minimum deliverability barrier ($q_{\text{actual}} = \min(q_{\text{inflow}}, q_{\text{pump}}) \times \text{uptime}$), ensuring pump displacement never hallucinates unphysical oil out of a starved reservoir.
> 6. *Machine Learning & Safety Governance:* Fast polynomial ridge surrogates predict production rates and uncertainty intervals ($P_{10}/P_{50}/P_{90}$), supervised by an Out-Of-Domain (OOD) Applicability Guardrail that immediately redirects out-of-envelope states back to deterministic physics.
> 7. *Constrained Joint Optimization:* The multi-objective optimizer evaluates candidate operational vectors, applying hard rejection filters ($P_{\text{inj}} \le 100\text{ bar}$, Floating Margin $\ge 2.0\text{ kN}$, Rod Stress Ratio $\le 80\%$, Pump Fillage $\ge 50\%$) before Pareto frontier ranking, guaranteeing that no unsafe candidate is ever recommended."*

---

## 3. PROBLEM DEFINITION: THE BAGHEWALA CHALLENGE

### Field Reality vs. Physics Conflict
The Baghewala field (located in the Bikaner-Nagaur basin of Rajasthan, India) contains heavy, low-mobility crude oil reservoir deposits in the Jodhpur Sandstone. 

| Dimension | Nature of Data | Engineering Value / Behavior | Source Classification |
| :--- | :--- | :--- | :--- |
| **Crude API Gravity** | Physical Baseline | 17.0° – 19.0° API (Heavy crude) | **Official SIH PS Fact** |
| **Reservoir Formation** | Geological Host | Jodhpur Sandstone | **Official SIH PS Fact** |
| **Undisturbed Temp** | Geological Baseline | ~46.0°C – 48.0°C | **Official SIH PS Fact** |
| **Crude Viscosity** | Rheological Property | ~10,000 – 13,000 cP @ 50°C | **OIL Public Literature Reference** |
| **Field Development** | Operational Context | 56 wells drilled, 34 producing | **OIL Public Literature Reference** |
| **Thermal EOR** | Artificial Recovery | Cyclic Steam Stimulation (CSS) | **Official SIH PS Fact** |
| **Artificial Lift** | Mechanical Pumping | Sucker Rod Pump (SRP / Beam Pump) | **Official SIH PS Fact** |
| **Operating Data** | Software Input | Synthetic, reproducible fleet | **Synthetic Prototype Implementation** |

### The Causal Chain of Destruction
In heavy oil operations, CSS and SRP cannot be managed as isolated systems. They are bound by an uncompromising thermo-mechanical causal loop:

```
CYCLIC STEAM INJECTION (Enthalpy Transfer: 600 - 2,200 t @ 50 - 100 bar)
                    │
                    ▼
FORMATION TEMPERATURE (Heats drainage zone to 180°C - 260°C, then cools exponentially)
                    │
                    ▼
CRUDE DYNAMIC VISCOSITY (Collapses from 12,000 cP to < 200 cP; surges back upon cooling)
                    │
                    ▼
DARCY MOBILITY & RESERVOIR INFLOW (Fluid mobility k/μ drops as formation cools)
                    │
                    ▼
WELLBORE FLUID REGIME & ANNULAR VISCOUS SHEAR (Couette drag along rod string)
                    │
                    ▼
SRP DOWNSTROKE DYNAMICS (Falling rod string opposed by upward viscous friction)
                    │
                    ▼
ROD-FLOATING SAFETY MARGIN (F_downward = W_buoyant(1 - α) - F_drag - F_friction)
                    │
                    ▼
CRITICAL MECHANICAL FAILURE (Carrier-bar separation, severe fluid pound, rod parting)
```

### Why Existing Isolated Approaches Fail
* **The Steam Silo:** Reservoir engineers size steam cycles based purely on heat transfer and thermal radius, completely ignoring how the subsequent thermal decay trajectory will physically overwhelm the surface pump installed in the wellbore.
* **The Pumping Silo:** Production operators notice fluid production dropping as the well cools, and instinctively increase pump speed (SPM) or stroke length to compensate. In heavy cold crude, higher stroke speed drastically increases Couette shear rates ($\tau = \mu \cdot \frac{v}{\Delta r}$), forcing downstroke drag higher than rod string buoyant weight. The rod floats in place, the polished rod clamp separates from the descending carrier bar, and on the subsequent upstroke, the walking beam smashes upward into the suspended clamp with destructive impact force.

---

## 4. SYSTEM ARCHITECTURE & CODEBASE REALITY

### Modular Monolith Design
BAGHETWIN is implemented as a high-performance modular monolith with clean separation between the user interface, API gateway, petroleum physics engine, machine learning models, optimization routines, and audit persistence.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND WORKSTATION (React 19 + TypeScript + Vite)            │
│  ┌───────────────────────┬────────────────────────┬───────────────────────────┐  │
│  │ 01 Command Center     │ 02 Well Explorer       │ 03 Digital Twin Causal    │  │
│  │ 04 CSS Optimizer      │ 05 SRP Optimizer       │ 06 Scenario Lab           │  │
│  │ 07 Risk & Reliability │ 08 Forecasts (30-180d) │ 09 Before vs After (Pareto)│ │
│  │ 10 Live Telemetry Ops │ 11 Audit Trail Logs    │ 12 Model Provenance       │  │
│  └───────────────────────┴────────────────────────┴───────────────────────────┘  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ REST JSON & WebSockets
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                       BACKEND API GATEWAY (FastAPI / Uvicorn)                    │
│   Endpoints: /wells, /state, /history, /dynacard, /simulation, /optimize, /audit  │
└───────┬────────────────────────────────┬─────────────────────────────────┬───────┘
        │                                │                                 │
┌───────▼──────────────────────┐ ┌───────▼───────────────────────┐ ┌───────▼───────┐
│     PETROLEUM PHYSICS        │ │    MACHINE LEARNING LAYER     │ │  PERSISTENCE  │
│ ├── HeavyOilViscosityModel   │ │ ├── PolynomialRidgeRegressor  │ │ ├── SQLite /  │
│ ├── SteamProperties (IAPWS)  │ │ ├── LogisticRiskClassifier    │ │ │   Postgres  │
│ ├── CSSThermalEngine         │ │ ├── MahalanobisAnomalyDetector│ │ ├── Audit Log │
│ ├── ReservoirInflowEngine    │ │ ├── ApplicabilityGuardrail    │ │ └── Synthetic │
│ ├── WellboreHydraulicsEngine │ │ └── Prediction Intervals      │ │     Telemetry │
│ ├── SRPEngine (API TR 11L)   │ └───────────────────────────────┘ └───────────────┘
│ ├── DynaCardGenerator        │                 │
│ └── OperatingEconomicsEngine │ ┌───────────────▼─────────────────────────────────┐
└──────────────┬───────────────┘ │      CONSTRAINED JOINT OPTIMIZER                │
               │                 │ ├── Hard Physical Constraints (Prior-to-Rank)   │
               └─────────────────► ├── Multi-Objective Scoring (Oil, SOR, Power)  │
                                 │ ├── Pareto Frontier Extraction                  │
                                 │ └── Deterministic Explainability Generator      │
                                 └─────────────────────────────────────────────────┘
```

### Technology Stack Table (Strictly Verified in Current Code)

| Technology | Version / Spec | Purpose in Project | Implementation Location |
| :--- | :--- | :--- | :--- |
| **Python** | 3.11+ / 3.14 compatible | Core backend computation environment | `backend/` |
| **FastAPI** | >= 0.110.0 | High-speed REST API & WebSocket routing | `backend/app/main.py`, `app/api/v1/` |
| **Pydantic** | >= 2.6.0 | Strict schema definition & unit serialization | `backend/app/schemas/`, `app/physics/` |
| **NumPy** | >= 1.26.0 | Vectorized kinematics and grid calculations | `backend/app/physics/`, `app/optimizer/` |
| **Pandas** | >= 2.2.0 | Historical telemetry & fleet dataset generation | `backend/app/ml/dataset_generator.py` |
| **SciPy** | >= 1.12.0 | Mathematical transformations & optimization | `backend/app/ml/trainer.py` |
| **scikit-learn** | >= 1.4.0 | Evaluation metrics and preprocessing models | `backend/app/ml/` |
| **SQLAlchemy** | >= 2.0.0 | ORM database abstraction layer | `backend/app/models/db_models.py` |
| **SQLite** | Local file | Default zero-configuration database fallback | `backend/baghetwin.db` |
| **PostgreSQL** | 16-alpine (Compose) | Production-ready multi-user database | `docker-compose.yml` |
| **Docker** | Multi-stage | Containerization of frontend & backend | `Dockerfile`, `docker-compose.yml` |
| **React** | 19.2.8 | Declarative component UI framework | `frontend/src/` |
| **TypeScript** | ~6.0.2 / 5.x | Type-safe enterprise web development | `frontend/src/` |
| **Vite** | ^8.3.0 | Modern ESM frontend bundler and dev server | `frontend/vite.config.ts` |
| **Tailwind CSS** | ^4.3.3 | Industrial design system styling | `frontend/src/index.css` |
| **Recharts** | ^3.10.1 | Scientific charts, dynacards & timelines | `frontend/src/components/` |
| **Lucide React** | ^1.48.0 | Standardized industrial UI iconography | `frontend/src/` |

---

## 5. FIRST-PRINCIPLES PETROLEUM PHYSICS IMPLEMENTATION

The physics engine is completely deterministic, avoids arbitrary constants, and adheres strictly to known governing equations.

### 1. Heavy Oil Viscosity Engine (`app/physics/viscosity.py`)
* **Governing Equation:** Modified Andrade-Arrhenius exponential liquid formulation:
  $$\mu(T) = \mu_{\text{ref}} \cdot \exp\left(B \cdot \left(\frac{1}{T_K} - \frac{1}{T_{\text{ref}, K}}\right)\right)$$
* **Calibrated Reference:** $\mu_{\text{ref}} = 11,500\text{ cP}$ at $T_{\text{ref}} = 50.0^\circ\text{C}$ (323.15 K), with thermal sensitivity activation coefficient $B = 5,200\text{ K}$.
* **Physical Guardrails:** Dynamic viscosity is strictly bounded within $[5.0\text{ cP}, 100,000.0\text{ cP}]$ to prevent numerical underflow at peak steam temperatures ($>250^\circ\text{C}$) or math overflow at sub-zero conditions.

### 2. Thermodynamic Steam Engine (`app/physics/steam.py`)
* **Governing Equations:** Continuous formulations based on IAPWS industrial formulations:
  $$T_{\text{sat}}(P) = 99.63 + 28.5 \cdot \ln(P) + 1.12 \cdot (\ln(P))^2 \quad [^\circ\text{C for } P \text{ in bar}]$$
  $$h_f(P) = 419.0 + 85.0 \cdot \ln(P) \quad [\text{kJ/kg}]$$
  $$h_{fg}(P) = \max\left(100.0, 2257.0 - 180.0 \cdot \ln(P) - 8.5 \cdot P\right) \quad [\text{kJ/kg}]$$
* **Delivered Energy:** For steam quality $x \in [0, 1]$:
  $$h_{\text{mixture}} = h_f(P) + x \cdot h_{fg}(P)$$
  $$Q_{\text{delivered}} = m_{\text{steam}} \cdot \left(h_{\text{mixture}} - h_{\text{water}}(T_{\text{res}})\right) \quad [\text{MJ}]$$

### 3. CSS Near-Wellbore Thermal Engine (`app/physics/thermal.py`)
* **Cycle Stages:** Models the full life-cycle of a thermal cycle: `INJECTION -> SOAK -> PRODUCTION`.
* **Peak Heated Temperature:**
  $$T_{\text{peak}} = \min\left(T_{\text{sat}}(P_{\text{inj}}), \, T_{\text{base}} + \frac{Q_{\text{delivered}} \cdot \eta_{\text{thermal}}}{C_{\text{eff}}}\right)$$
  Where $\eta_{\text{thermal}} = 0.82$ (formation retention factor) and $C_{\text{eff}} = 18,000\text{ MJ/}^\circ\text{C}$ (effective near-wellbore rock thermal capacitance).
* **Soak Dissipation:** $T_{\text{post-soak}} = T_{\text{base}} + (T_{\text{peak}} - T_{\text{base}}) \cdot e^{-\lambda_{\text{soak}} \cdot t_{\text{soak}}}$ ($\lambda_{\text{soak}} = 0.025\text{ d}^{-1}$).
* **Exponential Production Cooling:**
  $$T(t) = T_{\text{base}} + (T_{\text{post-soak}} - T_{\text{base}}) \cdot \exp\left(-\left(\lambda_{\text{cond}} + \lambda_{\text{conv}} \cdot q_{\text{liquid}}\right) \cdot t\right)$$
  Where $\lambda_{\text{cond}} = 0.012\text{ d}^{-1}$ accounts for conductive heat bleed off into adjacent caprock/bedrock, and $\lambda_{\text{conv}} = 0.00015\text{ (BPD}\cdot\text{d})^{-1}$ accounts for sensible heat extracted by produced hot liquids.

### 4. Reservoir Deliverability & Inflow Engine (`app/physics/reservoir.py`)
* **Linear Productivity Index (PI) Formulation:**
  $$J(T) = J_{\text{ref}} \cdot \left(\frac{\mu_{\text{ref}}}{\mu(T)}\right)^{0.65}$$
  $$q_{\text{inflow}} = J(T) \cdot \max\left(0.0, P_{\text{res}} - P_{\text{wf}}\right) \quad [\text{Liquid BPD}]$$
* **Explicit Exclusion of Vogel IPR:** Vogel IPR is physically invalid here because Baghewala heavy crude has negligible solution-gas drive; inflow is strictly viscous-mobility limited.

### 5. Sucker Rod Pump (SRP) & Rod-Floating Engine (`app/physics/srp.py`)
* **Harmonic Kinematics & Dynamic Acceleration (Mills Factor):**
  $$\alpha = \frac{S \cdot N^2}{70,500} \quad [S \text{ in inches, } N \text{ in SPM}]$$
  $$v_{\text{max}} = \frac{\pi \cdot S_m \cdot N}{60} \quad [\text{m/s}]$$
* **Narrow Annular Couette Viscous Drag:**
  Annular gap $\Delta r = \frac{D_{\text{tubing}} - d_{\text{rod}}}{2}$. Shear rate $\dot{\gamma} = \frac{|v|}{\Delta r}$.
  Accounting for non-Newtonian heavy oil shear-thinning (Ostwald-de Waele power law proxy $n \approx 0.9$):
  $$\mu_{\text{eff}} = \mu_{\text{pump}} \cdot \left(\frac{\max(1.0, \dot{\gamma})}{10.0}\right)^{-0.1}$$
  $$F_{\text{drag}} = (\pi \cdot d_{\text{rod}} \cdot L_{\text{pump}}) \cdot \mu_{\text{eff}} \cdot \frac{v_{\text{max}}}{\Delta r} \quad [\text{N}]$$
* **Polished Rod Dynamic Loads:**
  $$\text{PPRL} = W_{\text{buoyant}} \cdot (1 + \alpha) + F_{\text{fluid}} + F_{\text{drag}} + F_{\text{surface}}$$
  $$\text{MPRL} = \max\left(0.0, \, W_{\text{buoyant}} \cdot (1 - \alpha) - F_{\text{drag}} - F_{\text{surface}}\right)$$
* **Downstroke Rod-Floating Margin (Governing Safety Metric):**
  $$F_{\text{downward}} = W_{\text{buoyant}} \cdot (1 - \alpha)$$
  $$F_{\text{opposing}} = F_{\text{drag}} + F_{\text{surface}}$$
  $$\text{Floating Margin} = F_{\text{downward}} - F_{\text{opposing}} \quad [\text{kN}]$$
  * **Critical Risk (Hard Rejection Floor):** $\le 2.0\text{ kN}$ (Immediate bridle separation / floating risk).
  * **High Risk:** $\le 4.0\text{ kN}$.
  * **Nominal Safe Operation:** $> 7.5\text{ kN}$.

### 6. Production Deliverability Constraint (`app/physics/engine.py`)
* **Strict Non-Hallucination Barrier:**
  $$q_{\text{actual\_liquid}} = \min(q_{\text{reservoir\_inflow}}, \, q_{\text{pump\_capacity}}) \cdot \text{uptime\_factor}$$
  $$q_{\text{oil\_bopd}} = q_{\text{actual\_liquid}} \cdot (1.0 - \text{Water Cut})$$
  *Engineering Guarantee:* Surface pump displacement can never artificially create fluid out of thin air if reservoir inflow cannot deliver it.

---

## 6. MACHINE LEARNING & UNCERTAINTY LAYER

The ML implementation in BAGHETWIN is designed with defensive governance: ML is used for speed, but physics is always the ground truth.

```
Incoming Operational Features [T, μ, Stroke, SPM, VFD, BHP]
                         │
                         ▼
        ┌───────────────────────────────────┐
        │   APPLICABILITY GUARDRAIL (OOD)   │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────┴─────────────────┐
  [IN_DOMAIN]                        [OUT_OF_DOMAIN]
        │                                  │
        ▼                                  ▼
┌───────────────────────┐        ┌────────────────────────┐
│ ML SURROGATE INFERENCE│        │ AUTOMATIC DIRECT REDIRECT│
│ Polynomial Ridge Reg. │        │ COUPLED FORWARD PHYSICS│
│ P10 - P50 - P90 Bands │        │ DETERMINISTIC FALLBACK │
└───────────────────────┘        └────────────────────────┘
```

### 1. Supervised Models in Codebase

| Model Name | Type / Architecture | Input Features | Target Output | Status in Codebase |
| :--- | :--- | :--- | :--- | :--- |
| **Production Surrogate** | Polynomial Ridge Regressor (Degree 2) | Temperature, Viscosity, Stroke, SPM, VFD, BHP | Oil Production (BOPD) + $P_{10}/P_{90}$ Intervals | **Fully Implemented** (`app/ml/surrogates.py`) |
| **Rod Float Classifier** | Logistic Risk Classifier | Margin, Viscosity, SPM, PPRL, MPRL, Temp | Floating Probability + Risk Tier (LOW to CRITICAL) | **Fully Implemented** (`app/ml/risk_models.py`) |
| **Telemetry Anomaly Detector** | Mahalanobis Distance Metric | Multi-variate sensor vector | Anomaly Flag + Statistical Outlier Score | **Fully Implemented** (`app/ml/risk_models.py`) |
| **Domain Applicability Guard** | Bounded Parameter Envelope | All feature inputs | Status (`IN_DOMAIN` vs `OUT_OF_DOMAIN`) | **Fully Implemented** (`app/ml/applicability.py`) |

### 2. Honest Fallback Architecture
If ML model weights (`.json` artifacts) are missing, corrupt, or if an input breaches domain boundaries:
* The system **never crashes**.
* The system **never outputs ungrounded numbers**.
* It logs an `OUT_OF_DOMAIN` event, sets the flag `is_physics_fallback = True`, and seamlessly executes the forward `CoupledPhysicsSimulator`.

---

## 7. CONSTRAINED JOINT OPTIMIZATION ENGINE

### Multi-Objective Objective Function
The optimizer simultaneously evaluates cyclic steam setpoints and sucker rod pump kinematics to maximize production while preventing mechanical self-destruction.

$$\text{Maximize } \text{Score} = w_{\text{oil}} \cdot U(\Delta \text{Oil}) + w_{\text{sor}} \cdot U(-\Delta \text{SOR}) + w_{\text{margin}} \cdot U(\text{Margin}) + w_{\text{energy}} \cdot U(-\Delta \text{kWh/bbl})$$

*Default Objective Weights:*
* Oil Production ($w_{\text{oil}}$): **0.35**
* Steam-to-Oil Ratio ($w_{\text{sor}}$): **0.25**
* Rod-Floating Margin ($w_{\text{margin}}$): **0.25**
* Energy Intensity ($w_{\text{energy}}$): **0.15**

### Hard Physical Rejection Envelopes (Evaluated PRIOR to Ranking)

| Safety Constraint | Threshold Limit | Physical / Engineering Hazard | Action upon Breach |
| :--- | :--- | :--- | :--- |
| **Max Injection Pressure** | $\le 100.0\text{ bar}$ | Hydraulic fracturing of caprock; steam breakthrough | **Immediate Candidate Rejection** |
| **Min Floating Margin** | $\ge 2.0\text{ kN}$ | Annular drag exceeds rod weight; carrier-bar separation | **Immediate Candidate Rejection** |
| **Max Rod Tensile Stress** | $\le 80.0\%$ Yield | High-cycle fatigue parting of Grade D sucker rod string | **Immediate Candidate Rejection** |
| **Min Pump Fillage** | $\ge 50.0\%$ | Starvation; severe fluid pound damaging traveling valve | **Immediate Candidate Rejection** |
| **Max Allowable SOR** | $\le 7.0\text{ t/bbl}$ | Economic energy waste; thermal bypass channeling | **Immediate Candidate Rejection** |
| **Max Surface Speed** | $\le 10.5\text{ SPM}$ | Surface mechanical beam unit gearbox acceleration limits | **Immediate Candidate Rejection** |

### Fail-Safe Handling: Zero-Feasible Candidate Fallback
If an operator tests an extreme scenario where 100% of candidate operational points breach safety limits, BAGHETWIN:
1. Refuses to pick an unsafe "least-bad" candidate.
2. Formally emits the status: `NO FEASIBLE OPERATING PLAN`.
3. Issues a detailed engineering explanation listing the exact constraints violated.
4. Leaves the active well setpoints untouched.

---

## 8. COMPLETE SYNTHETIC DEMO FLEET

The synthetic fleet consists of 12 distinct, deterministic well archetypes generated via `backend/app/ml/dataset_generator.py` (Random Seed 42).

| Well Code | Well Name / Archetype | Temp (°C) | Viscosity (cP) | Oil (BOPD) | SPM | Margin (kN) | Risk Tier | Demo Purpose |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **BGW-007** | **Baghewala East 07 (High Floating Risk)** | **49.0** | **12,089** | **31.0** | **7.6** | **1.35** | **CRITICAL** | **PRIMARY JURY DEMO WELL** (Severe rod-floating breach) |
| **BGW-001** | Baghewala North 01 (Normal Base State) | 72.0 | 1,450 | 78.5 | 4.8 | 8.40 | LOW | Reference healthy baseline well |
| **BGW-002** | Baghewala East 02 (Thermal Decline) | 54.0 | 6,800 | 44.2 | 5.4 | 4.80 | WARNING | Mid-cycle cooling transition |
| **BGW-003** | Baghewala West 03 (High Viscosity) | 48.0 | 13,200 | 22.4 | 4.2 | 3.10 | ATTENTION | Cold reservoir boundary |
| **BGW-004** | Baghewala Central 04 (High Rod Loading) | 56.0 | 5,400 | 58.1 | 8.8 | 4.20 | ATTENTION | High tensile stress demonstration |
| **BGW-005** | Baghewala South 05 (High SOR / Energy Waste) | 52.0 | 8,100 | 28.6 | 3.8 | 6.20 | WARNING | Steam bypass / economic waste |
| **BGW-006** | Baghewala Deep 06 (Pump Efficiency Issue) | 50.0 | 10,200 | 24.5 | 7.2 | 3.40 | ATTENTION | Over-pumped / fluid pound |
| **BGW-008** | Baghewala North 08 (Thermal Opportunity) | 46.0 | 16,800 | 18.2 | 3.6 | 3.80 | ATTENTION | Prime candidate for new CSS cycle |
| **BGW-009** | Baghewala South 09 (Under-Heated CSS) | 46.8 | 15,100 | 21.0 | 4.2 | 4.10 | WARNING | Insufficient steam tonnage |
| **BGW-010** | Baghewala West 10 (Fresh CSS Recovery) | 48.2 | 1,100 | 84.0 | 5.2 | 8.90 | LOW | Peak post-steam production flush |
| **BGW-011** | Baghewala Central 11 (Near-Constraint) | 47.2 | 14,500 | 32.0 | 7.8 | 2.15 | WARNING | Operating on the razor's edge of safety |
| **BGW-012** | Baghewala South 12 (Water Cut Bypass) | 48.0 | 12,800 | 19.5 | 4.5 | 4.50 | WARNING | Channeling / high water cut (58%) |

---

## 9. RECOMMENDED JURY DEMO WALKTHROUGH (8 STAGES)

The application includes an interactive, built-in **"Jury Demo Mode"** accessible from the global top header. Follow this exact flow:

```
STAGE 1: Fleet Surveillance (Command Center)
   │
STAGE 2: Focal Well Isolation (Well Explorer -> Select BGW-007)
   │
STAGE 3: Causal Multi-Physics Inspection (Digital Twin 8-step Causal Chain)
   │
STAGE 4: Mechanical Diagnosis (SRP Dynacard -> Floating Margin Breach: 1.35 kN)
   │
STAGE 5: Thermal Sizing (CSS Optimizer -> Cycle 5 Sizing @ 85 bar)
   │
STAGE 6: Joint Optimization & Pareto Recommendation (Before vs After Page)
   │
STAGE 7: Risk & Reliability Defense (Risk Matrix & Telemetry Anomaly Test)
   │
STAGE 8: Governance & Audit Trail (Immutable Log & Model Provenance)
```

### Stage-by-Stage Script & Action Table

| Step | Page / Tab | UI Action | What the Jury Sees | Exact Speaker Script to Deliver |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Command Center** | Click **"Jury Demo Walkthrough"** button in header | Fleet matrix of 12 synthetic wells. Red badge on BGW-007. System status banner: *Simulation Mode*. | *"Honorable Jury, welcome to BagheTwin. Notice our global governance header: the system operates strictly in Simulation Mode on synthetic demonstration data. We monitor a 12-well heavy crude fleet in the Baghewala Jodhpur Sandstone formation."* |
| **02** | **Well Explorer** | Click on well **`BGW-007`** card | Comprehensive specs: 1,060 m depth, 17.5° API, critical status flag, active mechanical warnings. | *"We select our primary demonstration well: BGW-007. BGW-007 is in a late thermal cooling phase, flagged as CRITICAL. Notice its high pumping speed against cold, highly viscous crude."* |
| **03** | **Digital Twin** | Navigate to **Digital Twin** tab | The 8-Step Causal Chain: `STEAM -> TEMP -> VISCOSITY -> MOBILITY -> LOAD -> DRAG -> FLOATING -> PROD`. | *"In our Digital Twin workspace, our 8-stage causal chain reveals the multi-physics coupling: Heat has decayed to 49.0°C. Crude viscosity has surged to 12,089 cP, causing 44.6 kN downstroke drag opposing rod string descent."* |
| **04** | **SRP Optimizer** | Navigate to **SRP Optimizer** tab | Surface dynamometer card displaying severe downstroke drag collapse and delayed traveling valve load pickup. | *"The surface dynamometer card confirms carrier-bar separation risk: downstroke viscous shear prevents the sucker rod string from falling at pump stroke speed. The floating margin is 1.35 kN—violating our 2.0 kN safety floor."* |
| **05** | **CSS Optimizer** | Navigate to **CSS Optimizer** tab | Thermal decay projection and pressure injection boundary ($P_{\text{inj}} < 100\text{ bar}$). | *"In the CSS Optimizer, sizing Cycle 5 to 2,200 tonnes @ 85 bar collapses crude viscosity from 12,089 cP to 185 cP without violating the 100 bar geomechanical fracture boundary."* |
| **06** | **Before vs After** | Navigate to **Before vs After** tab | Side-by-side comparison table of 7 core metrics. Rejection counter: 22 candidates rejected. | *"The Joint Optimizer evaluates Pareto candidates: 22 candidates are automatically rejected due to safety violations, leaving the optimal recommendation: slow SPM to 4.8, stroke 144", and size Cycle 5 steam. Production rises +24.2 BOPD and floating margin is restored to 5.15 kN."* |
| **07** | **Risk & Reliability** | Navigate to **Risk & Reliability** tab | Categorized risk matrix. Run live anomaly injection (`TEMPERATURE_DROP`). | *"Our Risk & Reliability matrix tracks all safety boundaries. Red is strictly reserved for critical violations, giving control room operators clear signal without alarm fatigue."* |
| **08** | **Audit & Provenance** | Navigate to **Audit Trail** tab | Cryptographic log entry recording the operator's approval. Model Provenance table showing equations. | *"Every recommendation and operator action is cryptographically logged in our immutable Audit Trail. All physics models and synthetic benchmark data sources are fully documented for jury verification."* |

---

## 10. UI & SCREENSHOT INVENTORY FOR THE PPT

The team designing the presentation slides should capture screenshots of these specific views:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SCREENSHOT 1: COMMAND CENTER (Global Overview)                         │
│ Location: CommandCenter.tsx                                            │
│ What to capture: 12-well fleet grid, KPI cards, Simulation Mode badge  │
│ PPT Callout: "Real-time fleet situational awareness & health tiers"    │
├────────────────────────────────────────────────────────────────────────┤
│ SCREENSHOT 2: DIGITAL TWIN CAUSAL FLOW (Core Intellectual Asset)       │
│ Location: DigitalTwinPage.tsx                                          │
│ What to capture: The 8-block hero causal flow showing equations & tags │
│ PPT Callout: "Coupled multi-physics causal chain from steam to rod drag"│
├────────────────────────────────────────────────────────────────────────┤
│ SCREENSHOT 3: SURFACE DYNAMOMETER CARD (Dynacard Diagnostics)          │
│ Location: DynacardChart.tsx inside SRPOptimizerPage.tsx                │
│ What to capture: The load vs position dynacard showing downstroke drag │
│ PPT Callout: "Diagnostic surface dynacard showing rod-floating hazard" │
├────────────────────────────────────────────────────────────────────────┤
│ SCREENSHOT 4: BEFORE VS AFTER COMPARISON (The ROI Proof)               │
│ Location: BeforeAfterPage.tsx                                          │
│ What to capture: The 7-metric comparison table & candidate rejection log│
│ PPT Callout: "Pareto-optimal setpoints: +24.2 BOPD, Margin +3.80 kN"   │
├────────────────────────────────────────────────────────────────────────┤
│ SCREENSHOT 5: IMMUTABLE AUDIT TRAIL (Enterprise Governance)            │
│ Location: AuditTrailPage.tsx                                           │
│ What to capture: The structured change table with timestamps & roles   │
│ PPT Callout: "Human-in-the-loop authorization & immutable audit trail" │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 11. WHAT IS UNIQUE / DIFFERENTIATED IN BAGHETWIN

To maintain academic and professional credibility, **never use hyperbolic marketing claims** like *"world's first"*, *"revolutionary proprietary AI"*, or *"replaces petroleum engineers"*. Instead, articulate differentiation through **sound engineering systems design**:

1. **Closed-Loop Multi-Physics Coupling:** Existing tools model reservoir thermal decay (e.g., thermal simulators) or rod pumping mechanics (e.g., wave-equation SRP simulators) independently. BagheTwin connects them causally through an Andrade-Couette viscosity-drag bridge.
2. **Prior-to-Ranking Safety Constraint Filtering:** Machine learning and optimization algorithms frequently recommend unsafe operating extremes (e.g., excessively high injection pressure or over-pumping). BagheTwin implements deterministic physical safety envelopes that reject hazardous candidates *before* multi-objective Pareto ranking.
3. **Transparent Out-Of-Domain Guardrails:** Unlike opaque black-box AI systems, BagheTwin checks all incoming operational telemetry against training bounding boxes. Out-of-envelope scenarios trigger immediate, graceful fallback to first-principles physics.
4. **Human-in-the-Loop Operational Governance:** Recommendations are purely advisory. Operational setpoints cannot touch physical equipment without explicit engineer sign-off, which is permanently logged in a tamper-evident audit record.
5. **Radical Honesty & Scientific Integrity:** Every screen, model card, and API response explicitly declares whether data is synthetic or derived, preventing confusion between prototype exploration and certified field calibration.

---

## 12. LIMITATIONS & FUTURE VALIDATION ROADMAP

### Current Prototype Limitations (Transparently Disclosed)
* **Synthetic Telemetry:** Data is generated via deterministic numerical simulations, not tapped from live Oil India Limited SCADA historians.
* **Reduced-Order Thermal Mechanics:** Uses a lumped-parameter formation heat balance with exponential cooling rather than a 3D discretized finite-difference reservoir simulation grid.
* **Harmonic Kinematic SRP Proxy:** Annular Couette drag and Mills acceleration represent reduced-order lumped kinematics rather than a full continuous Gibbs-type hyperbolic wave equation PDE solver.
* **Advisory Only:** No direct automated actuation of wellhead chokes, steam boilers, or VFD prime movers.

### Validation & Deployment Roadmap

```
PHASE 1: SYNTHETIC PROTOTYPE (COMPLETED)
Coupled physics engine, ML surrogates, constrained joint optimizer, and UI workstation.
                    │
                    ▼
PHASE 2: HISTORICAL WELL DATA CALIBRATION (MONTHS 1 - 3)
Ingest historical Baghewala well intervention records and calibrate Andrade B coefficients using laboratory PVT reports.
                    │
                    ▼
PHASE 3: SHADOW MODE BACKTESTING (MONTHS 4 - 6)
Deploy parallel to control room; compare optimizer recommendations against actual field engineer decisions retrospectively.
                    │
                    ▼
PHASE 4: FIELD PILOT ADVISORY WORKSTATION (MONTHS 7 - 12)
Connect live OPC-UA/MQTT telemetry feeds for a 3-well test pad; provide real-time advisory recommendations for engineer review.
```

---

## 13. AUDITED RESEARCH & LITERATURE REFERENCES

1. **Singh, R., & Kumar, A. (2018).** *“Challenges and Opportunities in Exploitation of Heavy Oil Reservoirs of Baghewala Field, Rajasthan.”* SPE Oil & Gas India Conference and Exhibition. Society of Petroleum Engineers. [DOI: 10.2118/191823-MS](https://doi.org/10.2118/191823-MS).  
   *Relevance:* Establishes Baghewala Jodhpur Sandstone reservoir properties, 17–19° API heavy oil, and high downhole viscosity challenges.
2. **American Petroleum Institute (API). (2020).** *API TR 11L: Design Calculations for Sucker Rod Pumping Systems (Conventional Units).* API Technical Report.  
   *Relevance:* Forms the foundational standard for sucker rod pumping kinematics, Mills acceleration factor, and dynamic polished rod loads.
3. **Marx, J. W., & Langenheim, R. H. (1959).** *“Reservoir Heating by Hot Fluid Injection.”* Transactions of the AIME, 216(01), 312–315. [DOI: 10.2118/1266-G](https://doi.org/10.2118/1266-G).  
   *Relevance:* Foundational analytical formulation for thermal radius expansion and formation heat losses during steam injection.
4. **Boberg, T. C., & Lantz, R. B. (1966).** *“Calculation of the Production Rate of a Thermally Stimulated Well.”* Journal of Petroleum Technology, 18(12), 1613–1623. [DOI: 10.2118/1578-PA](https://doi.org/10.2118/1578-PA).  
   *Relevance:* Classical petroleum literature basis for post-steam soak and cyclic production cooling curves in CSS wells.
5. **Andrade, E. N. Da C. (1930).** *“The Viscosity of Liquids.”* Nature, 125, 309–310. [DOI: 10.1038/125309b0](https://doi.org/10.1038/125309b0).  
   *Relevance:* Fundamental exponential temperature-dependent formulation for dynamic liquid viscosity under varying thermal regimes.
6. **Takacs, G. (2015).** *Sucker-Rod Pumping Manual.* Gulf Professional Publishing (Elsevier). ISBN: 978-0128003466.  
   *Relevance:* Primary reference for downstroke viscous rod drag calculations, rod-floating criteria, and surface dynamometer card interpretation.

---

## 14. CLAIMS AUDIT TABLE: WHAT IS SAFE VS. UNSAFE TO SAY

| Term / Claim | Status | Why It Is Dangerous | Safe Alternative Wording to Use in PPT |
| :--- | :---: | :--- | :--- |
| **"Field Validated on OIL Wells"** | ❌ **UNSAFE** | Untrue. No proprietary field data was provided. | *"Designed around public OIL Baghewala geological parameters; ready for field calibration."* |
| **"Autonomous Wellhead Control"** | ❌ **UNSAFE** | Dangerous engineering practice; not implemented. | *"Human-in-the-loop decision-support system with engineering authorization."* |
| **"Real-Time SCADA Integration"** | ❌ **UNSAFE** | Current streaming uses synthetic WebSocket telemetry. | *"Simulated real-time streaming architecture with standard OPC-UA/MQTT ingestion interfaces."* |
| **"First-of-its-Kind Novel Invention"** | ❌ **UNSAFE** | Over-claiming; prior literature exists on thermal & SRP. | *"Integrated well-to-surface digital twin coupling thermal thermodynamics and SRP kinematics."* |
| **"Increased Field Production by 35%"** | ❌ **UNSAFE** | Fabricated metric; prototype has not operated in field. | *"Synthetic scenario simulations demonstrate potential uplift of +24.2 BOPD on demo well BGW-007."* |
| **"100% Accurate AI Models"** | ❌ **UNSAFE** | Statistically impossible and scientifically invalid. | *"Bounded fast polynomial surrogates with P10/P90 prediction intervals and physics fallback."* |
| **"Full Downhole Wave Equation PDE"** | ❌ **UNSAFE** | Implementation uses harmonic kinematics + Couette shear. | *"Reduced-order Couette viscous annular shear model adapted from API TR 11L concepts."* |
| **"Decision-Support Prototype"** | ✅ **SAFE** | Accurately describes what was built and tested. | *"Advisory engineering workstation for optimization and mechanical risk prevention."* |

---

## 15. THE EXACT 6-SLIDE SIH 2026 PRESENTATION BLUEPRINT

> **STRICT CONSTRAINT:** The SIH presentation must have **EXACTLY 6 SLIDES** (including the Title Slide).

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 1: Title Slide (Official Problem Context & Team Credentials)    │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 2: Proposed Solution (Problem, Solution & Causal Architecture)   │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 3: Technical Approach (Multi-Physics, ML & Constrained Optimizer)│
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 4: Feasibility & Viability (Architecture, Risks & Roadmap)      │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 5: Impact & Benefits (Operations, Economics & ESG Efficiency)    │
├────────────────────────────────────────────────────────────────────────┤
│ SLIDE 6: Research & References (Literature Grounding & Standards)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### SLIDE 1: TITLE SLIDE
* **Slide Title:** **BAGHETWIN — Digital Twin for Well-to-Surface Optimization**
* **Subtitle:** Advisory Decision Support for Coupled CSS & SRP Operations in Heavy Oil Wells
* **Official Problem Statement ID:** **SIH26120**
* **Official PS Title:** *“Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field.”*
* **Organization:** **Oil India Limited (OIL)**
* **Theme:** **Smart Automation** | **Category:** **Software**
* **Team ID:** **120855** | **Team Name:** **ShaolinCoder**
* **Visual Elements:**
  * Clean industrial light background (`#F5F7FA`) with Navy (`#123B5D`) and Deep Teal (`#0E9F9A`) accents.
  * Official logos: Smart India Hackathon 2026 & Oil India Limited.
  * Prototype Status Badge: `ENGINEERING PROTOTYPE • SIMULATION MODE • FULLY DETERMINISTIC`.

---

### SLIDE 2: PROPOSED SOLUTION (Idea / Solution / Prototype)
* **Slide Header:** **Proposed Solution: Coupled Well-to-Surface Decision Support**
* **Core Takeaway:** Overcoming the thermo-mechanical disconnect between cyclic steam heating and sucker rod pumping.
* **3 Key Bullets:**
  1. **The Baghewala Bottleneck:** As steam-stimulated heavy crude (17° API) cools from 180°C to 48°C, viscosity surges exponentially from 200 cP to >12,000 cP. The resulting Couette annular drag opposes falling sucker rods, causing devastating downstroke rod floating and carrier-bar impact.
  2. **The Integrated Digital Twin:** BAGHETWIN breaks operational silos by coupling steam thermodynamics, Andrade rheology, Darcy reservoir inflow, and API TR 11L rod kinematics into a unified causal simulation loop.
  3. **Safety-First Operational Optimization:** Rather than unconstrained ML extrapolation, our optimizer enforces hard physical safety envelopes (100 bar fracture limit, 2.0 kN rod-float floor) before ranking Pareto setpoints.
* **Recommended Diagram (Center):**
  ```
  STEAM ENTHALPY ──> FORMATION TEMP ──> CRUDE VISCOSITY ──> DARCY INFLOW
          ▲                                                     │
          │               [COUPLING LOOP]                       ▼
  SAFETY ENVELOPE <── FLOATING MARGIN <── ANNULAR DRAG <── SRP KINEMATICS
  ```
* **Recommended Screenshot:** The **8-Step Causal Chain** from `DigitalTwinPage.tsx`.
* **Speaker Script (Under 45s):**
  *"Judges, in heavy oil fields like Baghewala, reservoir cooling creates an acute mechanical crisis: extreme viscosity creates over 44 kN of upward drag against the falling pump rod, causing it to float and smash on reversal. BagheTwin solves this by connecting steam injection sizing directly to downhole pump kinematics, ensuring operations remain within strict physical safety envelopes."*

---

### SLIDE 3: TECHNICAL APPROACH (Architecture & Engineering)
* **Slide Header:** **Technical Approach: Multi-Physics, Guarded ML & Optimization**
* **Core Takeaway:** Deterministic engineering first principles combined with fast ML surrogates and strict governance.
* **4 Structured Columns / Cards:**
  1. **Coupled Physics Core:**
     * *Viscosity:* Andrade-Arrhenius model ($\mu_{\text{ref}} = 11,500\text{ cP} @ 50^\circ\text{C}$).
     * *Thermodynamics:* Pressure-dependent saturation steam enthalpy (IAPWS).
     * *Kinematics & Drag:* Couette annular shear + Mills dynamic acceleration.
     * *Coupling Barrier:* Actual production strictly capped by reservoir inflow.
  2. **Guarded Machine Learning:**
     * *Fast Surrogates:* Polynomial ridge regressor with $P_{10}/P_{50}/P_{90}$ prediction intervals.
     * *Domain Guardrails:* Real-time OOD detection automatically redirects out-of-envelope states to physics.
     * *Anomaly Detection:* Unsupervised Mahalanobis distance tracking telemetry drift.
  3. **Constrained Joint Optimizer:**
     * *Prior-to-Ranking Filtering:* Automatically discards candidates exceeding 100 bar or falling below 2.0 kN margin.
     * *Multi-Objective Pareto Search:* Jointly balances Oil recovery, SOR efficiency, and power intensity.
     * *Fail-Safe Default:* Rejects all proposals if no safe solution exists.
  4. **Enterprise System Design:**
     * *Architecture:* React 19 + TypeScript frontend with FastAPI backend and SQLAlchemy ORM.
     * *Governance:* Human-in-the-loop authorization with cryptographic audit logging.
* **Recommended Screenshot:** **Before vs After Optimization Table** (`BeforeAfterPage.tsx`) highlighting the 22 rejected candidates and the Pareto-optimal recommendation.
* **Speaker Script:**
  *"Our architecture is built on first principles. We do not use ungrounded neural networks to guess production. Fast ML surrogates provide instantaneous responsiveness, but are strictly bounded by an Applicability Guardrail that falls back to deterministic physics whenever operating boundaries are exceeded."*

---

### SLIDE 4: FEASIBILITY & VIABILITY (Implementation & Roadmap)
* **Slide Header:** **Feasibility, Robustness & Deployment Roadmap**
* **Core Takeaway:** A production-ready modular codebase designed for friction-free transition from prototype to field pilot.
* **3 Core Sections:**
  1. **Current Codebase Verification:**
     * Fully functioning, deterministic prototype verified across 12 synthetic well archetypes.
     * Comprehensive test suite: 29 passing unit, monotonicity, edge-case, and optimizer constraint tests.
     * Complete Docker containerization supporting both PostgreSQL and zero-config SQLite.
  2. **Operational Challenges & Built-in Mitigations:**
     * *Challenge:* Opaque black-box AI recommendations causing operator distrust.  
       *Mitigation:* Natural-language engineering explainability showing exact physical deltas and constraint margins.
     * *Challenge:* Extreme telemetry noise and sensor drift.  
       *Mitigation:* Pre-simulation data quality validation, rate-of-change clamping, and Mahalanobis anomaly detection.
     * *Challenge:* Equipment damage from automated actuation.  
       *Mitigation:* Strict human-in-the-loop governance; no direct write-back to physical PLCs without engineer sign-off.
  3. **Four-Stage Field Validation Roadmap:**
     * `Phase 1 (Done):` Fully coupled synthetic multi-physics digital twin & control room workstation.
     * `Phase 2 (M1-3):` Laboratory PVT calibration of Andrade coefficients on Baghewala crude samples.
     * `Phase 3 (M4-6):` Retrospective shadow-mode backtesting against historical field intervention logs.
     * `Phase 4 (M7-12):` Live OPC-UA/MQTT telemetry integration on a 3-well pilot test pad.
* **Visual Element:** Clean 4-step horizontal process timeline diagram illustrating Phases 1 through 4.

---

### SLIDE 5: IMPACT & BENEFITS (Value Proposition)
* **Slide Header:** **Operational, Economic & Resource Impact**
* **Core Takeaway:** Transforming heavy oil operations from reactive crisis management to proactive advisory optimization.
* **4 Impact Dimensions:**
  1. **Mechanical Integrity & Uptime:**
     * Eliminates downstroke rod-floating hazards by enforcing a mandatory $\ge 2.0\text{ kN}$ safety margin.
     * Prevents carrier-bar separation, surface bridle damage, and premature rod-string parting.
     * Reduces expensive workover rig interventions and downhole pump replacement cycles.
  2. **Production Optimization:**
     * Identifies optimal thermal-kinematic balance; demonstrated potential uplift of **+24.2 BOPD** on cooling well BGW-007.
     * Prevents over-pumping reservoir formations, eliminating traveling valve damage from fluid pound.
  3. **Thermal & Energy Efficiency (ESG):**
     * Optimizes Steam-to-Oil Ratio (SOR), demonstrated potential reduction from **4.8 to 2.85 t/bbl**.
     * Reduces natural gas / fuel consumption in steam generation boilers, directly curbing field carbon intensity.
     * Lowers pumping electrical power intensity (kWh/bbl) via synchronized stroke and VFD frequency optimization.
  4. **Operator Decision Support:**
     * Eliminates operational silos between thermal reservoir engineers and production pumping specialists.
     * Transparent audit logs provide immutable provenance for regulatory compliance and operational review.
* **Recommended Visual / Callout Box:**
  ```
  BGW-007 DEMONSTRATION DELTAS (SYNTHETIC BENCHMARK):
  • Oil Production:  31.0  ──>  55.2 BOPD  (+78% uplift)
  • Floating Margin:  1.35  ──>  5.15 kN    (Safety Restored)
  • Steam-Oil Ratio:  4.80  ──>  2.85 t/bbl  (-40% steam waste)
  • Rod Stress:      58.4% ──>  49.2%      (Fatigue Mitigated)
  ```

---

### SLIDE 6: RESEARCH & REFERENCES (Scientific Grounding)
* **Slide Header:** **Research Foundations & Engineering Standards**
* **Core Takeaway:** Grounded in peer-reviewed petroleum literature and recognized industry standards.
* **Curated Reference List:**
  1. **Singh & Kumar (SPE 2018):** *Challenges in Heavy Oil Reservoirs of Baghewala Field, Rajasthan.* Society of Petroleum Engineers (SPE-191823-MS).  
     *(Validates Jodhpur Sandstone geological parameters, 17–19° API gravity, and downhole viscosity).*
  2. **API Technical Report 11L (2020):** *Design Calculations for Sucker Rod Pumping Systems.* American Petroleum Institute.  
     *(Governs dynamic polished rod kinematics, Mills acceleration factor, and peak/minimum loads).*
  3. **Marx & Langenheim (AIME 1959):** *Reservoir Heating by Hot Fluid Injection.* Trans. AIME, 216(01).  
     *(Foundational thermodynamic basis for steam enthalpy delivery and thermal radius expansion).*
  4. **Boberg & Lantz (SPE / JPT 1966):** *Calculation of the Production Rate of a Thermally Stimulated Well.* JPT, 18(12).  
     *(Governing formulation for conductive and convective post-steam cooling curves).*
  5. **Andrade (Nature 1930):** *The Viscosity of Liquids.* Nature, 125, 309–310.  
     *(Classical exponential formulation modeling temperature-dependent dynamic liquid viscosity).*
  6. **Takacs (Elsevier 2015):** *Sucker-Rod Pumping Manual.* Gulf Professional Publishing.  
     *(Engineering reference for annular Couette viscous drag calculations and rod-floating criteria).*
* **Closing Governance Statement:**
  > *"BagheTwin is an engineering decision-support prototype built to demonstrate the power of coupled multi-physics modeling. It is designed for future calibration against proprietary Oil India Limited field telemetry and does not perform unverified autonomous physical actuation."*

---

## 16. PPT DESIGN & PRESENTATION BEST PRACTICES

### Color Palette (Modern EnergyTech Industrial Palette)
* **Canvas Background:** `#F5F7FA` (Clean, professional light industrial canvas)
* **Card & Panel Background:** `#FFFFFF` (Pure crisp white)
* **Primary Deep Navy:** `#123B5D` (Authoritative primary headings & titles)
* **Action Blue:** `#2563EB` (Primary interactions, links, and focus highlights)
* **Energy Teal:** `#0E9F9A` (Engineering metrics, success tags, and thermal indicators)
* **Slate Gray:** `#64748B` (Secondary descriptions, axis labels, and captions)
* **Critical Warning Red:** `#DC2626` (Reserved **strictly** for safety constraint breaches: Margin < 2 kN)
* **Warning Amber:** `#D97706` (Moderate caution indicators: Margin 2.0 – 4.0 kN)

### Typography & Layout Rules
* **Typography:** Modern, clean sans-serif (Inter, Roboto, or Outfit). Avoid default PowerPoint fonts like Calibri or Times New Roman.
* **No Paragraph Walls:** Maximum 3 to 4 concise bullet points per slide. Let diagrams, charts, and tables carry the technical weight.
* **Light-First Aesthetics:** Juries view presentations in well-lit conference halls. Dark-themed slides often wash out on projectors and appear cluttered. Use a crisp, high-contrast light design with dark navy containers.
* **Visual Anchor:** Every slide must feature a dominant visual anchor (an architecture diagram, a comparison table, an 8-block causal flow, or an application screenshot).
