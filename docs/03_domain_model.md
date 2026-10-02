# 03 — Domain Model & Petroleum Data Entities

## 1. Domain Entities
The BagheTwin domain is structured around primary petroleum assets, operational states, and decision-support records:

* **Well (`Well`):** Represents the physical wellbore configuration (measured depth, pump depth, casing ID, tubing ID, rod diameter, API gravity, base reservoir pressure, permeability).
* **Telemetry (`Telemetry`):** Daily or high-frequency observations (temperatures, flowing bottomhole pressure, surface pumping speed, polished rod loads, annular drag, fluid level, water cut).
* **CSS Cycle (`CSSCycle`):** Periodic cyclic steam stimulation operations (steam slug mass, injection pressure, steam quality, injection duration, soak duration, production cutoff days).
* **SRP Operations (`SRPOperation`):** Mechanical sucker rod pumping operational parameters (stroke length, strokes per minute, VFD frequency, volumetric efficiency).
* **Failure Event (`FailureEvent`):** Simulated anomalous occurrences (rod float, carrier bar separation, fluid pound, high-viscosity slug).
* **Optimization Run & Candidates (`OptimizationRun`, `OptimizationCandidate`):** Parameter space exploration records documenting evaluated, feasible, and rejected candidate permutations.
* **Recommendation (`Recommendation`):** Grounded decision-support advisory produced by the optimizer, requiring explicit human approval.
* **Audit Event (`AuditEvent`):** Immutable append-only log capturing all operator decisions, simulated approvals, and system state transitions.
* **Model Registry Item (`ModelRegistryItem`):** Machine learning and physics calibration metadata documenting model provenance, training datasets, and validation metrics.
