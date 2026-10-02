# BAGHETWIN — PPT DESIGN & DEFENSE QUICK REFERENCE
**SIH 2026 | Problem Statement: SIH26120 | Team: ShaolinCoder (ID: 120855)**

---

## 1. ESSENTIAL PROJECT CARD (MEMORIZE THIS)

* **Problem Statement ID:** SIH26120
* **Official Title:** Digital Twin for Well-to-Surface Optimization of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Operations for Heavy Oil Wells of Baghewala Field
* **Organization:** Oil India Limited (OIL)
* **Theme / Category:** Smart Automation / Software
* **Focal Well in Demo:** **`BGW-007`** (Archetype: High Floating Risk / Cooling Cycle)
* **Positioning:** Advisory Engineering Decision Support (NOT Autonomous Control)
* **Data Nature:** Synthetic Demonstration Prototype (Calibrated to public OIL geological data: 17–19° API, 11,500 cP @ 50°C, Jodhpur Sandstone)

---

## 2. THE 10-SECOND ELEVATOR PITCH

> *"In the Baghewala field, as steam cools, heavy crude viscosity surges to over 12,000 cP, creating 44 kN of upward viscous drag that causes sucker rod strings to float and smash on reversal. **BagheTwin** is an integrated well-to-surface digital twin that couples steam thermodynamics, oil rheology, and pump kinematics. It enforces hard physical safety envelopes—such as capping injection pressure at 100 bar and maintaining a 2.0 kN rod-float margin—before Pareto ranking optimal operating setpoints."*

---

## 3. THE 8-STEP CAUSAL CHAIN (HERO CONCEPT)

```
[1. STEAM]        Enthalpy delivered: 600 - 2,200 t @ 50 - 100 bar
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

## 4. HARD SAFETY LIMITS (THE OPTIMIZER'S REJECTION ENVELOPE)

Every candidate point is checked against these thresholds **BEFORE** ranking. Unsafe candidates are discarded immediately.

1. **Max Injection Pressure:** $\le 100.0\text{ bar}$ *(Prevents reservoir caprock fracturing & steam breakthrough)*
2. **Min Floating Margin:** $\ge 2.0\text{ kN}$ *(Prevents carrier-bar separation & destructive mechanical impact)*
3. **Max Rod Tensile Stress:** $\le 80.0\%$ Yield *(Prevents high-cycle rod-string fatigue parting)*
4. **Min Pump Fillage:** $\ge 50.0\%$ *(Prevents pump starvation and severe fluid pound)*
5. **Max Allowable SOR:** $\le 7.0\text{ t/bbl}$ *(Prevents thermal channeling and economic energy waste)*

---

## 5. PRIMARY DEMO WELL BENCHMARK (BGW-007)

Use these verified numbers from `BeforeAfterPage.tsx` when explaining the optimization result:

| Operating Metric | Baseline (Distressed) | Optimized Recommendation | Delta / Business Value |
| :--- | :---: | :---: | :---: |
| **Oil Production Rate** | 31.0 BOPD | **55.2 BOPD** | **+24.2 BOPD (+78% uplift)** |
| **Downstroke Floating Margin** | 1.35 kN *(Critical Hazard)* | **5.15 kN *(Safe)* ** | **+3.80 kN (Hazard Eliminated)** |
| **Steam-to-Oil Ratio (SOR)** | 4.80 t/bbl | **2.85 t/bbl** | **-1.95 t/bbl (-40% Steam Waste)** |
| **Crude Viscosity at Intake** | 12,089 cP | **185 cP** | Thermal stimulation recovery |
| **Sucker Rod Tensile Stress** | 58.4% Yield | **49.2% Yield** | Mechanical fatigue mitigated |
| **Pumping Speed / Stroke** | 7.6 SPM @ 120" | **4.8 SPM @ 144"** | Slower speed reduces Couette drag |
| **Steam Sizing** | Cycle 4 (Depleted) | **2,200 t @ 85 bar** | Enforces $P_{\text{inj}} < 100\text{ bar}$ limit |
| **Candidate Filtering Result** | — | **22 Candidates Rejected** | Proven prior-to-ranking safety |

---

## 6. EXACT SLIDE-BY-SLIDE CONTENT OUTLINE (6 SLIDES MAX)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ SLIDE 1: TITLE SLIDE                                                          │
│ • Title: BAGHETWIN — Well-to-Surface Digital Twin for CSS & SRP Operations    │
│ • Problem Statement: SIH26120 | Organization: Oil India Limited (OIL)         │
│ • Theme: Smart Automation | Category: Software | Team: ShaolinCoder (120855)   │
│ • Visual: Industrial theme, OIL/SIH logos, "Engineering Decision Support" tag │
├───────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 2: PROPOSED SOLUTION                                                    │
│ • Problem: Cooling heavy crude (17° API) viscosity hits 12,000 cP -> 44 kN drag│
│   causes rod floating, carrier-bar separation, and well downtime.             │
│ • Solution: Coupled digital twin connecting steam enthalpy to rod kinematics. │
│ • Diagram: The 8-Step Causal Chain (Steam -> Temp -> Visc -> Drag -> Margin). │
│ • Visual: Screenshot of DigitalTwinPage.tsx causal flow.                      │
├───────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 3: TECHNICAL APPROACH                                                   │
│ • Physics: Andrade viscosity (11.5k cP), IAPWS steam, Couette annular drag.   │
│ • Machine Learning: Fast polynomial surrogates + OOD Applicability Guardrail. │
│ • Optimization: Constrained Pareto search; hard prior-to-ranking filtering.   │
│ • Software: React 19 + TypeScript + FastAPI + SQLAlchemy + SQLite/Postgres.   │
│ • Visual: Screenshot of BeforeAfterPage.tsx with 22 rejected candidates.      │
├───────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 4: FEASIBILITY & VIABILITY                                              │
│ • Codebase Health: 29 verified passing tests; zero unhandled physical bounds. │
│ • Risk Mitigations: Grounded explainability narratives, OOD physics fallback. │
│ • 4-Phase Roadmap:                                                            │
│   Phase 1: Synthetic Prototype (Complete)                                     │
│   Phase 2: Lab PVT Calibration on Baghewala samples (M1-3)                    │
│   Phase 3: Retrospective Shadow Mode Backtesting (M4-6)                       │
│   Phase 4: 3-Well Live OPC-UA Field Pilot Workstation (M7-12)                 │
├───────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 5: IMPACT & BENEFITS                                                    │
│ • Mechanical Safety: Guarantees Margin >= 2.0 kN; halts carrier-bar smashing. │
│ • Production Uplift: Demonstrated potential +24.2 BOPD on cooling well BGW-007.│
│ • ESG & Energy: Reduces SOR from 4.8 to 2.85 t/bbl; lowers boiler fuel usage. │
│ • Governance: Full cryptographic audit trail; human-in-the-loop authorization.│
│ • Visual: Before vs After KPI delta cards.                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 6: RESEARCH & REFERENCES                                                │
│ • Singh & Kumar (SPE 2018): Heavy Oil Exploitation in Baghewala, Rajasthan.   │
│ • API TR 11L (2020): Design Calculations for Sucker Rod Pumping Systems.      │
│ • Marx & Langenheim (1959): Reservoir Heating by Hot Fluid Injection.        │
│ • Boberg & Lantz (1966): Calculation of Production from Stimulated Wells.     │
│ • Andrade (Nature 1930): The Viscosity of Liquids.                            │
│ • Takacs (2015): Sucker-Rod Pumping Manual (Viscous Drag & Rod Floating).     │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. KEY DEFENSE ANSWERS (CHEAT SHEET)

* **Q: "Is this tested on live Oil India SCADA?"**  
  *A:* "No. To maintain scientific integrity, this prototype runs on deterministic physics simulations calibrated to Oil India's published Rajasthan geological baselines. It is engineered with standard ingestion interfaces ready for field pilot telemetry."
* **Q: "Can the AI execute setpoints on the physical wellhead?"**  
  *A:* "No. It is an advisory decision-support system. Operator approval only updates the Digital Twin simulation state and logs the action in the audit trail. Petroleum engineers always maintain final operational authority."
* **Q: "What if the ML model sees strange data?"**  
  *A:* "Our Applicability Guardrail detects Out-Of-Domain inputs in real time and automatically redirects the computation to first-principles forward physics calculations."
* **Q: "Why don't you use Vogel's IPR for reservoir inflow?"**  
  *A:* "Vogel's equation assumes solution-gas drive. Baghewala heavy crude has negligible dissolved gas breakout; flow is strictly viscous-mobility limited, making a temperature-corrected linear PI model physically accurate."

---

## 8. DESIGN GUIDELINES FOR THE PPT TEAM

* **Theme:** Clean, modern EnergyTech industrial aesthetic.
* **Canvas Background:** `#F5F7FA` (Crisp light industrial canvas — avoids projector washout).
* **Primary Headings:** `#123B5D` (Authoritative deep navy).
* **Highlight / Action:** `#2563EB` (Cobalt blue) and `#0E9F9A` (Teal).
* **Warning / Danger:** `#DC2626` (Strictly reserved for safety limit breaches: Margin < 2.0 kN).
* **Rule:** Max 3 to 4 concise bullet points per slide. Let diagrams and screenshots do the teaching.
