# 05 — Cyclic Steam Stimulation (CSS) Engine

## 1. Thermodynamic Cycle Stages
CSS operations are modeled in three sequential physical phases:

### Phase 1: Steam Injection
Steam mass $m_{\text{steam}}$ at pressure $P_{\text{inj}}$ and quality $x$ is injected into the Jodhpur sandstone formation over duration $t_{\text{inj}}$. 
* Effective heat retained: $Q_{\text{retained}} = Q_{\text{delivered}} \cdot \eta_{\text{thermal}}$
* Theoretical sandface temperature rise:
  $$\Delta T = \frac{Q_{\text{retained}}}{C_{\text{eff}}}$$
* Peak temperature bounded by steam saturation temperature:
  $$T_{\text{peak}} = \min(T_{\text{sat}}(P_{\text{inj}}), T_{\text{base}} + \Delta T)$$

### Phase 2: Soak Period
Well is shut in to allow heat redistribution into the near-wellbore rock matrix:
$$T_{\text{post\_soak}} = T_{\text{base}} + (T_{\text{peak}} - T_{\text{base}}) \cdot \exp(-\lambda_{\text{soak}} \cdot t_{\text{soak}})$$

### Phase 3: Production & Cooling Decay
Well is put on artificial lift. Formation cools via conductive loss to bounding formations and convective heat extraction via produced fluids:
$$\lambda_{\text{prod}} = \lambda_{\text{cond}} + \lambda_{\text{conv}} \cdot q_{\text{fluid}}$$
$$T(t) = T_{\text{base}} + (T_{\text{post\_soak}} - T_{\text{base}}) \cdot \exp(-\lambda_{\text{prod}} \cdot t)$$
Viscosity $\mu(t)$ is continuously coupled via the Andrade engine.
