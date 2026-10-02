# 04 — Core Physics Engine Architecture

## 1. Physical Coupling Principles
BagheTwin models the physical causality of thermal EOR and artificial lift without shortcut heuristics:

1. **Viscosity-Temperature Dependency:**
   Heavy crude dynamic viscosity obeys the Andrade-Arrhenius relationship:
   $$\mu(T) = \mu_{\text{ref}} \cdot \exp\left(B \cdot \left(\frac{1}{T_K} - \frac{1}{T_{\text{ref}, K}}\right)\right)$$
   Calibrated using OIL's public reference value: $\mu_{\text{ref}} = 11,500\text{ cP}$ at $T_{\text{ref}} = 50^\circ\text{C}$ (323.15 K), with $B = 5,200\text{ K}$.

2. **Thermodynamic Steam Enthalpy (IAPWS Formulation):**
   Saturation temperature and latent heat of vaporization are calculated as continuous functions of injection pressure rather than a static single constant:
   $$T_{\text{sat}}(P) = 99.63 + 28.5 \cdot \ln(P) + 1.12 \cdot (\ln(P))^2$$
   $$h_{\text{mixture}} = h_f(P) + x \cdot h_{fg}(P)$$

3. **Reservoir Deliverability (Linear PI):**
   Inflow rate is driven by drawdown adjusted for near-wellbore Darcy mobility:
   $$J(T) = J_{\text{ref}} \cdot \left(\frac{\mu_{\text{ref}}}{\mu(T)}\right)^{0.65}$$
   $$q_{\text{inflow}} = J(T) \cdot (P_{\text{res}} - P_{wf})$$
   *Note:* Vogel IPR is deliberately not used because Baghewala heavy crude is under thermal drive without solution-gas breakout.

4. **Production Coupling Constraint:**
   $$q_{\text{actual}} = \min(q_{\text{inflow}}, q_{\text{pump\_capacity}}) \cdot \text{uptime}$$
   Pump capacity can never artificially extract more fluid than the reservoir formation delivers.
