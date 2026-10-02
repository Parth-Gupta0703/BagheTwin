# 19 — Technical Limitations & Honest Disclosures

## 1. Physical Model Scope & Boundaries
1. **Reduced-Order Reservoir Formulation:**
   The reservoir thermal engine utilizes an effective heat capacitance balance with exponential convective-conductive decay. It is designed for fast decision support (< 50 ms) rather than replacing a 3D compositional reservoir simulator (such as CMG STARS).
2. **Simplified Multiphase Hydraulics:**
   Wellbore hydraulics approximate the continuous liquid column using Hagen-Poiseuille viscous friction and dynamic fluid level head. Full transient multiphase slugging dynamics are not modeled.
3. **Harmonic SRP Kinematics:**
   Sucker rod dynamics utilize harmonic kinematics with Mills acceleration and Couette annular shear rather than finite-difference wave equation solutions (such as Gibbs).
4. **Synthetic Data Dependency:**
   In the absence of proprietary well logs or SCADA telemetry from Oil India Limited, all historical records are synthetically generated from physical simulation.
5. **No Field Certification:**
   Neither ASTM compliance nor API certification is claimed.
