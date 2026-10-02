# BagheTwin: Well-to-Surface Digital Twin (SIH 2026 | PS SIH26120)

[![Tests Status](https://img.shields.io/badge/pytest-29%20passed%20(100%25)-emerald.svg)](backend/tests/)
[![Frontend Build](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite%20%2B%20TS-blue.svg)](frontend/)
[![Architecture](https://img.shields.io/badge/architecture-FastAPI%20%7C%20Multi--Physics%20%7C%20Constrained%20Optimizer-indigo.svg)]()
[![Data Provenance](https://img.shields.io/badge/data%20provenance-SYNTHETIC%20%2F%20DEMO-amber.svg)]()
[![Team](https://img.shields.io/badge/team-ShaolinCoder%20%23120855-slate.svg)]()

> **"This is an engineering decision-support prototype using synthetic/simulated data calibrated against public Oil India Limited geological parameters. It is an advisory decision-support workstation and does not perform autonomous equipment control."**

BagheTwin is an industrial-grade engineering decision-support prototype developed for **Oil India Limited (Baghewala Field, Bikaner-Nagaur Basin, Rajasthan)** for Smart India Hackathon 2026 Problem Statement **SIH26120**. It couples Cyclic Steam Stimulation (CSS) near-wellbore thermal dynamics and temperature-dependent heavy crude rheology with Sucker Rod Pump (SRP) mechanics, dynacard diagnostics, machine learning surrogates, applicability guardrails, and constrained multi-objective Pareto optimization.

---

## 1. Problem & Reservoir Context

In the **Baghewala Heavy Oil Field** (Jodhpur Sandstone formation, ~900–1,150 m depth), Oil India Limited produces extra-heavy crude oil (**17.0–19.0° API**) exhibiting extreme dynamic viscosity (**10,000–13,000 cP at 50°C**).

Thermal EOR and artificial lift operations are physically coupled:
1. **Cyclic Steam Stimulation (CSS):** High-enthalpy steam slugs (600–2,200 t @ 50–100 bar, $x \approx 0.80$) are injected into the near-wellbore formation to heat the rock and bitumen, reducing crude viscosity via exponential Andrade-Arrhenius thermal thinning.
2. **Sucker Rod Pumping (SRP):** Reciprocating beam pumps lift fluid to the surface.

### The Causal Chain of Hazards
* **Thermal Cooling & Viscosity Surge:** As the formation cools post-soak from ~180°C down toward native temperature (~48°C), crude dynamic viscosity surges from <200 cP back over 12,000 cP.
* **Annular Viscous Drag:** Sucker rods reciprocating within tubing experience massive Couette annular shear ($F_{\text{drag}} > 40\text{ kN}$).
* **Downstroke Rod Floating:** When upward viscous drag opposes descending rod weight, the effective downstroke floating margin collapses below 2.0 kN. Sucker rods float, delaying plunger descent.
* **Carrier-Bar Separation & Impact Shock:** The walking beam carrier bar pulls away from the floating polished rod clamp on the downstroke, and smashes into the lagging rod string on the upstroke reversal, precipitating rod buckling, severe fatigue, and catastrophic parted rods.
* **Decoupled Operations Silos:** Sizing steam cycles without accounting for SRP downstroke drag limits, or increasing pump speed (SPM) on cold crude, accelerates equipment destruction.

---

## 2. System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                       REACT 19 CONTROL ROOM WORKSTATION (Vite + TypeScript)               │
│  ├── 01 Command Center (Fleet Grid & KPIs)     ├── 07 Risk & Reliability Matrix           │
│  ├── 02 Well Explorer (12 Archetypes)          ├── 08 Forecasts & Trajectories (30-180d)  │
│  ├── 03 Digital Twin (8-Step Causal Chain)     ├── 09 Before vs After (Pareto Frontier)   │
│  ├── 04 CSS Optimizer (Steam Sizing & Enthalpy)├── 10 Live Telemetry & Anomaly Drilling   │
│  ├── 05 SRP Optimizer (Dynacard & Kinematics)  ├── 11 Immutable Audit Trail Log           │
│  └── 06 Scenario Lab (Forward Simulations)     └── 12 Model & Data Provenance Table       │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │ HTTP REST JSON / WebSockets
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                               FASTAPI PYTHON BACKEND ENGINE                               │
│  ├── Ingestion & Data Quality: Bound validation, unit scaling, and noise pre-filtering    │
│  ├── Coupled Multi-Physics Engine:                                                        │
│  │   * Andrade-Arrhenius Viscosity: mu(T) = mu_ref * exp(B * (1/T - 1/T_ref))             │
│  │   * IAPWS Formulation Thermodynamic Steam Enthalpy & Saturation Curves                 │
│  │   * Reduced-Order CSS Thermal Decay: Sensible heat balance + exponential cooling       │
│  │   * Darcy Inflow Deliverability: Temperature-dependent Linear Productivity Index (PI)  │
│  │   * Annular Couette Viscous Shear with Non-Newtonian shear-thinning proxy              │
│  │   * SRP Dynamics (API TR 11L): Mills acceleration, buoyant weight, & floating margin  │
│  │   * Production Coupling Barrier: q_actual = min(q_inflow, q_pump) * uptime             │
│  │   * Surface Dynamometer Card Synthesis (60 pts/stroke across 5 failure archetypes)     │
│  ├── Machine Learning & Governance Layer:                                                 │
│  │   * Fast Polynomial Ridge Surrogates with P10/P50/P90 epistemic uncertainty intervals  │
│  │   * Logistic Rod-Floating Risk Classifier & Mahalanobis Anomaly Detector               │
│  │   * Domain Applicability Guardrails (IN_DOMAIN vs OUT_OF_DOMAIN)                       │
│  │   * Fail-Safe Fallback: Direct transparent redirect to deterministic forward physics   │
│  └── Constrained Multi-Objective Optimizer:                                               │
│      * Prior-to-Ranking Safety Pre-Filters (P_inj <= 100 bar, Floating Margin >= 2.0 kN) │
│      * Multi-Objective Scoring: Oil production, SOR efficiency, power intensity           │
│      * Pareto Frontier Extraction & Knee-Point Selection                                  │
│      * Fail-Safe Default: "NO FEASIBLE OPERATING PLAN" if constraints breached            │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │ SQLAlchemy ORM
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                           PERSISTENCE: SQLite (Local) / PostgreSQL                        │
│  Tables: wells, telemetry, css_cycles, simulation_runs, recommendations, audit_events      │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The 8-Step Causal Chain

BagheTwin explicitly maps and visualizes the causal flow from surface thermal injection to downhole mechanical risk:

```
[1. STEAM]        Enthalpy delivered: 600 - 2,200 t @ 50 - 100 bar, x = 0.80
     │
     ▼
[2. TEMPERATURE]  Near-wellbore heats to 180°C - 260°C, then cools exponentially
     │
     ▼
[3. VISCOSITY]    Andrade-Arrhenius model: collapses to <200 cP, surges to >12,000 cP
     │
     ▼
[4. MOBILITY]     Darcy inflow scales with viscosity: q_inflow = J(T) · (P_res - P_wf)
     │
     ▼
[5. SRP LOAD]     Harmonic kinematics & Mills acceleration factor: PPRL & MPRL
     │
     ▼
[6. ROD DRAG]     Narrow annular Couette shear along rod string: F_drag ∝ μ · v / Δr
     │
     ▼
[7. FLOATING]     Margin = W_buoyant(1 - α) - F_drag  [CRITICAL SAFETY FLOOR: 2.0 kN]
     │
     ▼
[8. PRODUCTION]   Delivery constraint: q_net = min(q_inflow, q_pump) · (1 - WC)
```

---

## 4. Hard Safety Rejection Envelopes

The optimizer enforces hard physical safety envelopes **prior to Pareto ranking**. Unsafe candidates are discarded immediately:

| Safety Constraint | Threshold Limit | Physical / Engineering Hazard | Action upon Breach |
| :--- | :--- | :--- | :--- |
| **Max Injection Pressure** | $\le 100.0\text{ bar}$ | Hydraulic fracturing of caprock; steam breakthrough | **Immediate Candidate Rejection** |
| **Min Floating Margin** | $\ge 2.0\text{ kN}$ | Annular drag exceeds rod weight; carrier-bar separation | **Immediate Candidate Rejection** |
| **Max Rod Tensile Stress** | $\le 80.0\%$ Yield | High-cycle fatigue parting of Grade D sucker rod string | **Immediate Candidate Rejection** |
| **Min Pump Fillage** | $\ge 50.0\%$ | Starvation; severe fluid pound damaging traveling valve | **Immediate Candidate Rejection** |
| **Max Allowable SOR** | $\le 7.0\text{ t/bbl}$ | Economic energy waste; thermal bypass channeling | **Immediate Candidate Rejection** |
| **Max Surface Speed** | $\le 10.5\text{ SPM}$ | Surface mechanical beam unit gearbox acceleration limits | **Immediate Candidate Rejection** |

---

## 5. Synthetic Demonstration Fleet (12 Well Archetypes)

The platform provides a deterministic 12-well fleet generated with reproducible seed 42:

| Well Code | Name / Archetype | Temp (°C) | Viscosity (cP) | Oil (BOPD) | SPM | Margin (kN) | Risk Tier | Demo Focus |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **BGW-007** | **Baghewala East 07 (High Floating Risk)** | **49.0** | **12,089** | **31.0** | **7.6** | **1.35** | **CRITICAL** | **PRIMARY JURY DEMO WELL** |
| **BGW-001** | Baghewala North 01 (Normal Operating) | 72.0 | 1,450 | 78.5 | 4.8 | 8.40 | LOW | Reference healthy baseline |
| **BGW-002** | Baghewala East 02 (Thermal Decline) | 54.0 | 6,800 | 44.2 | 5.4 | 4.80 | WARNING | Mid-cycle cooling transition |
| **BGW-003** | Baghewala West 03 (High Viscosity) | 48.0 | 13,200 | 22.4 | 4.2 | 3.10 | ATTENTION | Cold reservoir boundary |
| **BGW-004** | Baghewala Central 04 (High Rod Loading) | 56.0 | 5,400 | 58.1 | 8.8 | 4.20 | ATTENTION | Tensile stress demonstration |
| **BGW-005** | Baghewala South 05 (High SOR) | 52.0 | 8,100 | 28.6 | 3.8 | 6.20 | WARNING | Thermal bypass / waste |
| **BGW-006** | Baghewala Deep 06 (Pump Efficiency Issue) | 50.0 | 10,200 | 24.5 | 7.2 | 3.40 | ATTENTION | Over-pumped / fluid pound |
| **BGW-008** | Baghewala North 08 (Thermal Opportunity) | 46.0 | 16,800 | 18.2 | 3.6 | 3.80 | ATTENTION | Post-soak CSS candidate |
| **BGW-009** | Baghewala South 09 (Under-Heated CSS) | 46.8 | 15,100 | 21.0 | 4.2 | 4.10 | WARNING | Insufficient steam mass |
| **BGW-010** | Baghewala West 10 (Fresh CSS Recovery) | 48.2 | 1,100 | 84.0 | 5.2 | 8.90 | LOW | Peak post-steam flush |
| **BGW-011** | Baghewala Central 11 (Near-Constraint) | 47.2 | 14,500 | 32.0 | 7.8 | 2.15 | WARNING | Near safety floor boundary |
| **BGW-012** | Baghewala South 12 (Water Cut Bypass) | 48.0 | 12,800 | 19.5 | 4.5 | 4.50 | WARNING | Channeling / high water cut |

### Primary Benchmark Results (Well BGW-007)
* **Oil Production:** 31.0 BOPD $\rightarrow$ **55.2 BOPD (+78% uplift)**
* **Downstroke Floating Margin:** 1.35 kN *(Critical)* $\rightarrow$ **5.15 kN *(Safe, hazard eliminated)***
* **Steam-to-Oil Ratio (SOR):** 4.80 t/bbl $\rightarrow$ **2.85 t/bbl (-40% steam waste)**
* **Sucker Rod Stress:** 58.4% $\rightarrow$ **49.2% Yield**
* **Safety Verification:** **22 candidates rejected** for constraint breaches before recommendation.

---

## 6. Installation & Quick Start

### Prerequisites
* **Python 3.11+**
* **Node.js 18+** & npm
* (Optional) **Docker & Docker Compose**

### Option A: Local Development Run (Fastest)

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python scripts/seed_demo.py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend API Docs will be available at: http://localhost:8000/docs*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend Control Room Workstation will be live at: http://localhost:5173*

#### 3. Automated Scripts (Windows)
```powershell
.\run_demo.bat
# OR
.\run_demo.ps1
```

### Option B: Docker Compose
```bash
docker-compose up --build
```
*Frontend: http://localhost:3000 | Backend API: http://localhost:8000*

---

## 7. Automated Test Suite

Verify all physics laws, unit transformations, monotonicity, and optimizer safety:
```bash
cd backend
python -m pytest tests/test_physics.py tests/test_physics_sanity.py tests/test_optimizer_constraints.py -v
```
All physics sanity assertions pass with 100% deterministic reproducibility.

---

## 8. SIH 2026 Presentation Resources

The repository includes ready-to-use team handoff documentation:
* **[PPT_TEAM_HANDOFF.md](PPT_TEAM_HANDOFF.md):** Complete 20-phase exhaustive technical reference, screenshot directory, peer-reviewed literature, and exact 6-slide presentation script.
* **[PPT_QUICK_REFERENCE.md](PPT_QUICK_REFERENCE.md):** Concise quick-reference guide with cheat sheets, formulas, benchmark values, and jury Q&A defense answers.

---

## 9. Research & Engineering Literature Grounding

1. **Singh, R., & Kumar, A. (2018).** *Challenges and Opportunities in Exploitation of Heavy Oil Reservoirs of Baghewala Field, Rajasthan.* SPE Oil & Gas India Conference. [DOI: 10.2118/191823-MS](https://doi.org/10.2118/191823-MS).
2. **American Petroleum Institute (API). (2020).** *API TR 11L: Design Calculations for Sucker Rod Pumping Systems.* American Petroleum Institute.
3. **Marx, J. W., & Langenheim, R. H. (1959).** *Reservoir Heating by Hot Fluid Injection.* Transactions of the AIME, 216(01), 312–315. [DOI: 10.2118/1266-G](https://doi.org/10.2118/1266-G).
4. **Boberg, T. C., & Lantz, R. B. (1966).** *Calculation of the Production Rate of a Thermally Stimulated Well.* Journal of Petroleum Technology, 18(12), 1613–1623. [DOI: 10.2118/1578-PA](https://doi.org/10.2118/1578-PA).
5. **Andrade, E. N. Da C. (1930).** *The Viscosity of Liquids.* Nature, 125, 309–310. [DOI: 10.1038/125309b0](https://doi.org/10.1038/125309b0).
6. **Takacs, G. (2015).** *Sucker-Rod Pumping Manual.* Gulf Professional Publishing (Elsevier).

---

## 10. Team Credentials

* **Team Name:** ShaolinCoder
* **Team ID:** 120855
* **Hackathon:** Smart India Hackathon 2026 (SIH 2026)
* **Problem Statement:** SIH26120
* **Organization:** Oil India Limited (OIL)
* **Theme:** Smart Automation
