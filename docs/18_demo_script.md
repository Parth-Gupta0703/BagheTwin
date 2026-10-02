# 18 — 5-Minute Jury Demonstration Script

This deterministic script guarantees full alignment with Section 47 of the Master Specification:

### Minute 0:00 – 1:00: Command Center & Fleet Context
1. Point out the top status badges: `DIGITAL TWIN ONLINE`, `SIMULATION MODE`, `DATA STATUS: SYNTHETIC / DEMO`.
2. Highlight the 12 synthetic demonstration wells and select target well **BGW-001**.
3. **Say:** *"Judges, this is BagheTwin. Notice our status badges: the twin is in simulation mode on strictly synthetic data. We select well BGW-001—it is 68 days into production, reservoir temperature has decayed, viscosity is escalating, and downstroke rod-float risk is critical."*

### Minute 1:00 – 2:00: Digital Twin & Causal Chain
1. Open the **Digital Twin** view.
2. Follow the causal chain: Steam $\rightarrow$ Temperature (49.5°C) $\rightarrow$ Viscosity (14,200 cP) $\rightarrow$ Annular Drag (14.8 kN) $\rightarrow$ Floating Margin (1.80 kN).
3. Inspect the live surface dynamometer card, showing the collapse of downstroke load.
4. **Say:** *"Here in the Digital Twin, we see the complete physics coupling. Because downstroke drag exceeds allowable threshold, floating margin drops to 1.80 kN, risking carrier-bar separation."*

### Minute 2:00 – 3:00: Scenario Lab Forward Simulation
1. Open **Scenario Lab** and run a 30-day baseline simulation.
2. Show formation temperature dropping toward 47°C, viscosity escalating above 16,000 cP, and production decaying.
3. **Say:** *"In Scenario Lab, running a 30-day baseline simulation shows that without re-tuning, mechanical failure probability continues to climb."*

### Minute 3:00 – 4:00: Joint Multi-Objective Optimization
1. Navigate to **Before vs After** / Joint Optimization.
2. Point out that candidates violating the 100 bar fracture limit or 2.0 kN margin floor were **rejected prior to ranking**.
3. **Say:** *"Now we trigger joint CSS + SRP optimization. The optimizer evaluates candidate permutations. Notice that candidates violating the 100 bar fracture limit or the 2.0 kN floating margin floor are rejected prior to ranking."*

### Minute 4:00 – 5:00: Operator Approval & Audit Trail
1. Compare Current vs Recommended:
   * Oil: +8.7 BOPD
   * Floating Margin: +3.80 kN (restored to safe 5.60 kN)
   * SOR: -1.7 t/bbl
2. Click **"APPROVE SIMULATED RECOMMENDATION"**.
3. Switch to **Audit Trail** and demonstrate the immutable record with operator role and timestamp.
4. **Concluding Statement:** *"Today's demo is based on synthetic/simulated data. In deployment, the same interfaces can ingest approved OIL telemetry and field calibration data without altering the digital twin architecture."*
