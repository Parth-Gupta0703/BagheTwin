# BagheTwin: Well-to-Surface Digital Twin

### Smart India Hackathon (SIH 2026) | Problem Statement: SIH26120
**Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field**

[![SIH 2026](https://img.shields.io/badge/SIH%202026-PS%20SIH26120-orange.svg?style=flat-square)](https://sih.gov.in)
[![Target Asset](https://img.shields.io/badge/Asset-Oil%20India%20Limited%20%7C%20Baghewala-darkgreen.svg?style=flat-square)](https://www.oil-india.com)
[![Pytest Status](https://img.shields.io/badge/pytest-29%20passed%20(100%25)-emerald.svg?style=flat-square)](backend/tests/)
[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite%20%2B%20TS%20%2B%20Tailwind-blue.svg?style=flat-square)](frontend/)
[![Backend](https://img.shields.io/badge/backend-FastAPI%20%2B%20NumPy%20%2B%20SciPy-indigo.svg?style=flat-square)](backend/)
[![Data Provenance](https://img.shields.io/badge/data%20provenance-100%25%20Coupled%20Physics%20(Synthetic)-amber.svg?style=flat-square)](BAGHETWIN_Dataset_Research_and_Analysis.pdf)
[![Team](https://img.shields.io/badge/team-ShaolinCoder%20%23120855-slate.svg?style=flat-square)]()

---

> [!IMPORTANT]
> **RESEARCH INTEGRITY & INDUSTRIAL APPLICABILITY NOTICE:**
> **BagheTwin** is an engineering decision-support workstation powered by coupled thermodynamic, reservoir, and mechanical multiphysics models. In strict accordance with petroleum engineering ethics, **all telemetry observations, dynacards, and production curves are synthetically generated from physics-coupled differential equations** calibrated against published literature on the Baghewala Field (Jodhpur Sandstone). No unauthorized SCADA data from Oil India Limited has been used, and no models perform autonomous field equipment actuation.

---

## 📑 Core Technical Documentation & Reports

| Deliverable | Description | Link |
|:------------|:------------|:-----|
| 📄 **Master Technical & Research Paper** | Comprehensive petroleum engineering deep-dive on heavy oil rheology, coupled equations, and mathematical derivations. | [docs/BAGHETWIN_Research_and_Technical_Background.md](docs/BAGHETWIN_Research_and_Technical_Background.md) |
| 📑 **Dataset Documentation & Analysis PDF** | 14-page industrial report detailing dataset provenance, moments, 24-feature dictionary, ML leakage audit, and integrity matrix. | [BAGHETWIN_Dataset_Research_and_Analysis.pdf](BAGHETWIN_Dataset_Research_and_Analysis.pdf) |
| 📊 **SIH Jury Quick Reference Guide** | Compact cheat sheet with formulas, benchmarks, failure modes, and jury defense Q&A. | [PPT_QUICK_REFERENCE.md](PPT_QUICK_REFERENCE.md) |
| 🎯 **SIH Presentation & Team Handoff** | Exhaustive technical handoff, 6-slide presentation script, slide-by-slide jury walkthrough, and literature grounding. | [PPT_TEAM_HANDOFF.md](PPT_TEAM_HANDOFF.md) |
| 📋 **Industry-Grade Master Specification** | Complete 20-phase architecture specification and data contract. | [SIH26120_Industry_Grade_Master_Spec.md](SIH26120_Industry_Grade_Master_Spec.md) |
| 📁 **20-Phase Specialized Architecture Docs** | Modular documentation chapters covering physics, dynacards, ML surrogates, security, and deployment. | [docs/](docs/) |

---

## 1. Problem & Reservoir Context

In the **Baghewala Heavy Oil Field** (Jodhpur Sandstone formation, Bikaner-Nagaur Basin, Rajasthan, ~900–1,150 m depth), Oil India Limited produces extra-heavy, asphaltic crude oil (**17.0–18.6° API**) with native dynamic viscosity exceeding **10,000–15,000 cP at 48°C**.

Thermal Enhanced Oil Recovery (EOR) and Artificial Lift operations are fundamentally coupled:
1. **Cyclic Steam Stimulation (CSS):** High-pressure steam slugs (600–2,200 tonnes @ 50–100 bar, quality $x \approx 0.80$) are periodically injected to heat the near-wellbore rock and fluid, collapsing crude viscosity via exponential Andrade-Arrhenius thermal thinning.
2. **Sucker Rod Pumping (SRP):** Reciprocating beam pumping units lift the mobilized bitumen to the surface.

### The Destructive Operational Dilemma
Historically, CSS steam scheduling and SRP mechanical lifting operate in isolated operational silos:
* **The Thermal Cooling Trap:** As the reservoir cools post-soak from ~185°C back toward native reservoir temperature (48°C), dynamic viscosity surges from <100 cP back over 6,000–12,000 cP.
* **Annular Couette Shear Drag:** The sucker rod string ($d_{\text{rod}} = 22.2\text{ mm}$) reciprocating inside narrow tubing ($D_{\text{tubing}} = 62\text{ mm}$) experiences extreme laminar shear drag ($F_{\text{drag}} > 30\text{ kN}$).
* **Downstroke Rod Floating:** When upward fluid drag opposes gravity, the net descending margin collapses below the **2.0 kN safety floor** into negative territory (down to **-11.07 kN**). The rods fail to descend as fast as the walking beam.
* **Carrier-Bar Separation & Buckling:** The surface carrier bar pulls away from the floating polished rod clamp on the downstroke, then slams violently into the lagging rod string on upstroke reversal—triggering severe compressive buckling, tubing wear, and catastrophic rod fatigue failure.

```
THERMAL INJECTION (CSS)       NEAR-WELLBORE COOLING         ANNULAR VISCOUS SHEAR         ROD FLOATING & IMPACT
[ Steam: 1,200 t @ 85 bar ] → [ 185°C → 65°C Cooling ]   → [ Viscosity: 6,000+ cP ]    → [ F_drag: 32 kN > W_rod ]
[ Enthalpy: 2,750 kJ/kg   ]   [ Heat Radius: 15-25m   ]     [ Couette Drag Escalates ]    [ Margin: -11.07 kN (Buckling) ]
```

**BagheTwin solves this challenge** by unifying reservoir thermodynamics and rod mechanics into a closed-loop, safety-constrained digital twin.

---

## 2. The 8-Step Multiphysics Causal Chain

BagheTwin tracks and displays the physical causal chain in real time:

```
[1. STEAM INJECTION]  ──► Enthalpy delivered (600–2,200 t @ 50–100 bar, quality 0.80)
         │
         ▼
[2. TEMPERATURE]      ──► Near-wellbore heats to 180°C–220°C, then decays: T(t) = T_base + ΔT·exp(-0.028·t)
         │
         ▼
[3. CRUDE VISCOSITY]  ──► Andrade exponential model: µ(T) = µ_ref · exp[B · (1/T - 1/T_ref)]
         │
         ▼
[4. RESERVOIR INFLOW] ──► Temperature-scaled Darcy PI: q_oil = PI_base · (µ_ref / µ(T)) · (P_res - P_wf) · (1 - WC)
         │
         ▼
[5. SRP KINEMATICS]   ──► Mills dynamic acceleration: α = (Stroke · SPM²) / 70500; PPRL & MPRL
         │
         ▼
[6. VISCOUS DRAG]     ──► Annular Couette shear: F_drag = π · d_rod · L · µ · v_max / (r_tubing - r_rod)
         │
         ▼
[7. FLOATING MARGIN]  ──► Net downward margin: Margin = W_buoyant · (1 - α) - (F_drag + F_surf) [≥ 2.0 kN]
         │
         ▼
[8. NET PRODUCTION]   ──► Delivery barrier: q_actual = min(q_inflow, q_pump_capacity) · uptime
```

---

## 3. High-Resolution Multiphysics Relationships

Below are key engineering relationships verified directly from the 2,160 daily telemetry records:

| Relationship | Formulation & Physical Law | Observed Range in BagheTwin | Correlation ($r$) |
|:-------------|:---------------------------|:----------------------------|:-----------------:|
| **Temperature vs. Viscosity** | Andrade Exponential Law: $\mu(T) = \mu_{\text{ref}} \cdot \exp\left[B \left(\frac{1}{T} - \frac{1}{T_{\text{ref}}}\right)\right]$ | $53.1\text{ cP}$ (hot) to $6,275.9\text{ cP}$ (cold) | $\mathbf{-0.833}$ |
| **Viscosity vs. Annular Drag** | Couette Laminar Shear: $F_{\text{drag}} \propto \mu \cdot \left(\frac{v}{\Delta r}\right) \cdot \text{Area}$ | $0.13\text{ kN}$ (nominal) to $32.10\text{ kN}$ (critical) | $\mathbf{+0.903}$ |
| **Drag vs. Floating Margin** | Downstroke Descent Equilibrium: $\text{Margin} = W_{\text{buoyant}} - F_{\text{drag}}$ | $+33.03\text{ kN}$ (safe) to $\mathbf{-11.07\text{ kN}}$ (carrier separation) | $\mathbf{-0.830}$ |
| **Viscosity vs. Floating Margin** | Direct coupling of thermodynamic cooling to lift hazard | Collapse of descending margin as fluid cools | $\mathbf{-0.726}$ |
| **Oil Rate vs. SOR** | Energy Efficiency: $\text{SOR} = \text{Steam Mass} / \text{Cumulative Oil}$ | $0.04\text{ t/bbl}$ (optimal) to $0.37\text{ t/bbl}$ (wasteful) | $\mathbf{-0.694}$ |

---

## 4. Hard Safety Rejection Envelopes

The joint optimizer strictly enforces **hard physical safety rejection filters prior to Pareto objective scoring**. Any candidate setpoint breaching allowable boundaries is discarded with explicit engineering explanations:

| Safety Constraint | Threshold Limit | Physical / Engineering Hazard | Optimizer Action |
|:------------------|:----------------|:------------------------------|:-----------------|
| **Max Injection Pressure** | $\le 100.0\text{ bar}$ | Hydraulic caprock fracturing; steam breakthrough | **Immediate Candidate Rejection** |
| **Min Downstroke Floating Margin** | $\ge 2.0\text{ kN}$ | Annular drag exceeds rod weight; carrier-bar separation | **Immediate Candidate Rejection** |
| **Max Sucker Rod Tensile Stress** | $\le 80.0\%$ Yield | High-cycle fatigue failure of API Grade D rod string | **Immediate Candidate Rejection** |
| **Min Volumetric Pump Fillage** | $\ge 50.0\%$ | Starvation; severe fluid pound damaging traveling valve | **Immediate Candidate Rejection** |
| **Max Allowable Steam-to-Oil Ratio** | $\le 7.0\text{ t/bbl}$ | Economic energy waste; thermal bypass channeling | **Immediate Candidate Rejection** |
| **Max Surface Pumping Speed** | $\le 10.5\text{ SPM}$ | Mechanical surface unit gearbox & acceleration limits | **Immediate Candidate Rejection** |

---

## 5. Synthetic Demonstration Fleet (12 Well Archetypes)

The embedded SQLite database ([`backend/baghetwin.db`](backend/baghetwin.db)) contains 12 distinct well configurations modeled over 180 continuous daily records ($N = 2,160$):

| Well Code | Name / Archetype | Temp (°C) | Viscosity (cP) | Oil (BOPD) | SPM | Float Margin (kN) | Risk Tier | Demo Role |
|:----------|:-----------------|:---------:|:--------------:|:----------:|:---:|:-----------------:|:---------:|:----------|
| **BGW-007** | **Baghewala East 07 (High Floating Risk)** | **49.0** | **12,089** | **31.0** | **7.6** | **1.35** | **CRITICAL** | **PRIMARY JURY DEMO WELL** |
| **BGW-001** | Baghewala North 01 (Normal Operating) | 72.0 | 1,450 | 78.5 | 4.8 | 8.40 | LOW | Reference healthy baseline |
| **BGW-002** | Baghewala East 02 (Thermal Decline) | 54.0 | 6,800 | 44.2 | 5.4 | 4.80 | WARNING | Mid-cycle cooling transition |
| **BGW-003** | Baghewala West 03 (High Viscosity) | 48.0 | 13,200 | 22.4 | 4.2 | 3.10 | ATTENTION | Cold reservoir boundary |
| **BGW-004** | Baghewala Central 04 (High Rod Loading) | 56.0 | 5,400 | 58.1 | 8.8 | 4.20 | ATTENTION | Tensile stress demonstration |
| **BGW-005** | Baghewala South 05 (High SOR) | 52.0 | 8,100 | 28.6 | 3.8 | 6.20 | WARNING | Thermal bypass / waste |
| **BGW-006** | Baghewala Deep 06 (Pump Efficiency Issue)| 50.0 | 10,200 | 24.5 | 7.2 | 3.40 | ATTENTION | Over-pumped / fluid pound |
| **BGW-008** | Baghewala North 08 (Thermal Opportunity) | 46.0 | 16,800 | 18.2 | 3.6 | 3.80 | ATTENTION | Post-soak CSS candidate |
| **BGW-009** | Baghewala South 09 (Under-Heated CSS) | 46.8 | 15,100 | 21.0 | 4.2 | 4.10 | WARNING | Insufficient steam mass |
| **BGW-010** | Baghewala West 10 (Fresh CSS Recovery) | 48.2 | 1,100 | 84.0 | 5.2 | 8.90 | LOW | Peak post-steam flush |
| **BGW-011** | Baghewala Central 11 (Near-Constraint) | 47.2 | 14,500 | 32.0 | 7.8 | 2.15 | WARNING | Near safety floor boundary |
| **BGW-012** | Baghewala South 12 (Water Cut Bypass) | 48.0 | 12,800 | 19.5 | 4.5 | 4.50 | WARNING | Steam condensate water cut |

### Benchmark Optimization Results (Primary Demo: Well BGW-007)
* **Oil Production Uplift:** 31.0 BOPD $\rightarrow$ **55.2 BOPD (+78.1%)**
* **Downstroke Floating Margin:** 1.35 kN *(Critical hazard)* $\rightarrow$ **5.15 kN *(Safe operational margin)***
* **Steam-to-Oil Ratio (SOR):** 4.80 t/bbl $\rightarrow$ **2.85 t/bbl (-40.6% thermal energy waste)**
* **Sucker Rod Stress:** 58.4% $\rightarrow$ **49.2% of API Grade D Yield**
* **Safety Audit:** **22 candidate setpoints rejected** before presenting optimal recommendation.

---

## 6. End-to-End System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                     REACT 19 CONTROL ROOM WORKSTATION (Vite + TypeScript)                 │
│  ├── 01 Command Center (Fleet Status & Alarms)    ├── 07 Risk & Reliability Matrix        │
│  ├── 02 Well Explorer (12 Archetypes)             ├── 08 30–180d Trajectory Forecasts     │
│  ├── 03 Digital Twin (8-Step Causal Chain)        ├── 09 Before vs After (Pareto Frontier)│
│  ├── 04 CSS Optimizer (Steam Sizing & Enthalpy)   ├── 10 Live Telemetry & Anomaly Drilling│
│  ├── 05 SRP Optimizer (Dynacards & Kinematics)    ├── 11 Immutable Audit Trail Log        │
│  └── 06 Scenario Lab (Forward Simulations)        └── 12 Model Provenance & Integrity    │
│  * Bilingual Control Room Support: English & Hindi (हिंदी) Toggle                         │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │ RESTful JSON / WebSocket Telemetry
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                              FASTAPI PYTHON BACKEND ENGINE                                │
│  ├── Ingestion & Data Quality: Physical plausibility, zero-imputation audit trail         │
│  ├── Coupled Multiphysics Engine:                                                         │
│  │   * Andrade Dynamic Viscosity: mu(T) = mu_ref * exp(B * (1/T - 1/T_ref))               │
│  │   * IAPWS Thermodynamic Steam Enthalpy & Saturation Formulations                       │
│  │   * Boberg-Lantz / Marx-Langenheim Reduced-Order CSS Thermal Decay                     │
│  │   * Darcy Inflow Deliverability: Temperature-scaled Productivity Index                 │
│  │   * Annular Couette Laminar Shear Drag with Ostwald-de Waele Power-Law proxy           │
│  │   * Sucker Rod Dynamics (API TR 11L): Mills acceleration, buoyant weight, float margin │
│  │   * Surface & Downhole Dynamometer Synthesis (60 pts/stroke; 5 card archetypes)        │
│  ├── Machine Learning & Governance Layer:                                                 │
│  │   * PolynomialRidgeRegressor: Closed-form surrogate (R² = 0.7691, MAE = 30.37 bopd)    │
│  │   * RegularizedLogisticClassifier: Rod-float risk detector (100% precision on holdout) │
│  │   * MahalanobisDistanceAnomalyDetector: Unsupervised telemetry outlier filter (95th %) │
│  │   * Out-of-Domain Guardrails (IN_DOMAIN vs OUT_OF_DOMAIN) with transparent fallback    │
│  └── Constrained Multi-Objective Optimizer:                                               │
│      * Prior-to-Ranking Safety Pre-Filters (P_inj <= 100 bar, Floating Margin >= 2.0 kN)  │
│      * Multi-Objective Scoring: Oil production, SOR efficiency, energy intensity          │
│      * Pareto Frontier Extraction & Knee-Point Selection                                  │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │ SQLAlchemy ORM
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                        PERSISTENCE: SQLite (Local) / PostgreSQL (Cloud)                   │
│  Tables: wells, telemetry, css_cycles, simulation_runs, recommendations, audit_events      │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Machine Learning Models & Evaluation

Models are trained via [`backend/app/ml/trainer.py`](backend/app/ml/trainer.py) using pure NumPy and SciPy (eliminating binary DLL dependency issues and providing 100% mathematical explainability):

```
+-----------------------------------+-----------------------------------+-----------------------------------+
|       Production Surrogate        |     Rod-Float Risk Classifier     |      Telemetry Anomaly Model      |
|     (Polynomial Ridge - NumPy)    |     (Logistic L2 Reg - SciPy)     |      (Mahalanobis Covariance)     |
+-----------------------------------+-----------------------------------+-----------------------------------+
| • Inputs: T, µ, Stroke, SPM, Hz   | • Inputs: Margin, µ, SPM, Loads   | • Multivariate 6D Risk Manifold   |
| • Target: Oil Production (BOPD)   | • Target: High Risk (Score ≥ 0.5) | • Target: Distance & Anomaly Flag |
| • R²: 0.7691                      | • Precision: 1.000 (100%)         | • Threshold: 95th Percentile      |
| • MAE: 30.37 BOPD                 | • Recall: 0.375                   | • Status: Active Surveillance     |
| • RMSE: 40.49 BOPD                | • F1 Score: 0.545                 |                                   |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

## 8. Installation & Quick Start

### Prerequisites
* **Python 3.11+**
* **Node.js 18+** & npm
* (Optional) **Docker & Docker Compose**

### Option A: Local Development Run (Fastest)

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
python scripts/seed_demo.py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend Swagger Docs will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend Control Room Workstation will be live at: [http://localhost:5173](http://localhost:5173)*

#### 3. One-Click Windows Automated Launchers
```powershell
.\run_demo.bat
# OR
.\run_demo.ps1
```

### Option B: Docker Compose
```bash
docker-compose up --build
```
*Frontend: [http://localhost:3000](http://localhost:3000) | Backend: [http://localhost:8000](http://localhost:8000)*

---

## 9. Automated Testing & Physics Sanity Suite

Verify that all thermodynamics, unit transformations, monotonicities, and safety constraints pass:
```bash
cd backend
python -m pytest tests/test_physics.py tests/test_physics_sanity.py tests/test_optimizer_constraints.py tests/test_ml_applicability.py -v
```
**Result:** `29 passed in 0.42s (100% pass rate)`.

---

## 10. Research & Engineering Literature Grounding

1. **Singh, R., & Kumar, A. (2018).** *Challenges and Opportunities in Exploitation of Heavy Oil Reservoirs of Baghewala Field, Rajasthan.* SPE Oil & Gas India Conference. [DOI: 10.2118/191823-MS](https://doi.org/10.2118/191823-MS).
2. **American Petroleum Institute (API). (2020).** *API TR 11L: Design Calculations for Sucker Rod Pumping Systems.* American Petroleum Institute.
3. **Marx, J. W., & Langenheim, R. H. (1959).** *Reservoir Heating by Hot Fluid Injection.* Transactions of the AIME, 216(01), 312–315. [DOI: 10.2118/1266-G](https://doi.org/10.2118/1266-G).
4. **Boberg, T. C., & Lantz, R. B. (1966).** *Calculation of the Production Rate of a Thermally Stimulated Well.* Journal of Petroleum Technology, 18(12), 1613–1623. [DOI: 10.2118/1578-PA](https://doi.org/10.2118/1578-PA).
5. **Andrade, E. N. Da C. (1930).** *The Viscosity of Liquids.* Nature, 125, 309–310. [DOI: 10.1038/125309b0](https://doi.org/10.1038/125309b0).
6. **Takacs, G. (2015).** *Sucker-Rod Pumping Manual.* Gulf Professional Publishing (Elsevier).

---

## 11. Team Credentials & Hackathon Metadata

* **Project Name:** BagheTwin
* **Team Name:** ShaolinCoder
* **Team ID:** 120855
* **Hackathon:** Smart India Hackathon 2026 (SIH 2026)
* **Problem Statement ID:** SIH26120
* **Problem Title:** Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field
* **Organization:** Oil India Limited (OIL)
* **Theme:** Smart Automation / EnergyTech
* **GitHub Repository:** [https://github.com/Parth-Gupta0703/BagheTwin](https://github.com/Parth-Gupta0703/BagheTwin)
