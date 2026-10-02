# 01 — Problem Statement Analysis: SIH 2026 PS 26120

## 1. Context & Operational Background
Problem Statement SIH26120 addresses the operational challenges encountered by **Oil India Limited (OIL)** in the **Baghewala Field, Rajasthan Basin**. 

Key verified geological and production facts:
* **Reservoir:** Jodhpur Sandstone formation.
* **Hydrocarbon Characteristics:** Extra-heavy crude oil with approximately **17–19° API gravity** and extreme dynamic viscosity (**10,000–13,000 cP at 50°C** according to OIL public disclosures).
* **Reservoir Energy:** Low natural formation pressure, requiring artificial lift and thermal stimulation from inception.
* **Coupled Production Method:**
  1. **Cyclic Steam Stimulation (CSS):** High-pressure steam injection to heat the near-wellbore formation and thermally thin the crude.
  2. **Sucker Rod Pumping (SRP):** Mechanical artificial lift to hoist the viscous crude oil to the surface.

---

## 2. Core Engineering Bottlenecks & Operational Hazards
The physical interaction between thermal stimulation and mechanical pumping produces acute failure modes:

1. **Downstroke Rod Floating & Carrier-Bar Separation:**
   As the near-wellbore formation cools, crude viscosity rises exponentially. During the downstroke, extreme annular viscous shear opposes rod string descent. If downstroke drag exceeds buoyant rod weight, the rod string slows down, loads on the polished rod plummet near zero, and the carrier bar separates from the polished rod clamp.
2. **Impact Shock Loading & Rod Fatigue:**
   When the walking beam reverses direction on upstroke, the carrier bar slams back into the lagging rod string clamp with destructive impact force, causing premature fatigue parting of sucker rods.
3. **Pump Starvation & Fluid Pound:**
   Under-pumping or premature thermal breakthrough starves the pump intake, causing the traveling valve to pound into fluid mid-stroke.
4. **Thermal Inefficiency & High Steam-to-Oil Ratio (SOR):**
   Unoptimized steam slug sizing causes rapid thermal bypass without yielding commensurate oil recovery.

---

## 3. Digital Twin Solution Scope
BagheTwin provides an **industry-grade decision support system** coupling:
* Reduced-order petroleum physics (Andrade viscosity, IAPWS steam thermodynamics, Darcy thermal inflow, Hagen-Poiseuille wellbore friction, and API TR 11L sucker-rod mechanics).
* Machine learning surrogates with explicit P10/P90 prediction intervals.
* Constrained multi-objective optimization that **rejects unsafe candidates prior to ranking**.
* Human-in-the-loop operator authorization and immutable audit logging.
* Pure digital twin state simulation with zero direct physical actuation of field equipment.
