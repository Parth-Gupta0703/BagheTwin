# 07 — Sucker Rod Pump (SRP) & Rod-Floating Engine

## 1. Kinematics & Dynamic Loads
Adapted from API TR 11L concepts and extended for heavy-oil annular viscous shear:

1. **Kinematics:**
   Harmonic motion approximation for polished rod position $x(t)$, velocity $v(t)$, and Mills acceleration factor $\alpha$:
   $$\alpha = \frac{S \cdot N^2}{70,500}$$
   Where $S$ is stroke length (inches) and $N$ is strokes per minute (SPM).

2. **Annular Viscous Drag:**
   Couette shear between reciprocating rod string and tubing ID in heavy oil:
   $$F_{\text{drag}} = 2 \pi \cdot r_{\text{rod}} \cdot L \cdot \mu_{\text{eff}} \cdot \frac{v_{\text{max}}}{r_{\text{tubing}} - r_{\text{rod}}}$$

3. **Polished Rod Loads:**
   * **Upstroke (Peak Polished Rod Load - PPRL):**
     $$\text{PPRL} = W_{\text{rod, buoyant}} \cdot (1 + \alpha) + F_{\text{fluid}} + F_{\text{drag}} + F_{\text{surface}}$$
   * **Downstroke (Minimum Polished Rod Load - MPRL):**
     $$\text{MPRL} = \max\left(0, W_{\text{rod, buoyant}} \cdot (1 - \alpha) - F_{\text{drag}} - F_{\text{surface}}\right)$$

4. **Rod-Floating Margin & Carrier-Bar Separation:**
   Effective downward force:
   $$F_{\text{downward}} = W_{\text{rod, buoyant}} \cdot (1 - \alpha)$$
   Resisting drag:
   $$F_{\text{resisting}} = F_{\text{drag}} + F_{\text{surface}}$$
   $$\text{Floating Margin} = F_{\text{downward}} - F_{\text{resisting}}$$

   * **CRITICAL RISK:** $\text{Margin} \le 2.0\text{ kN}$ (Immediate carrier-bar separation and impact shock hazard)
   * **HIGH RISK:** $2.0 < \text{Margin} \le 4.0\text{ kN}$
   * **NORMAL:** $\text{Margin} > 7.5\text{ kN}$
