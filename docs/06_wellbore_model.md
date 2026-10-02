# 06 — Wellbore Hydraulics & State Engine

## 1. Governing Wellbore Physics
The wellbore model estimates dynamic fluid levels, flowing bottomhole pressure (FBHP), pump intake pressure (PIP), and annular friction losses:

1. **Fluid Density Formulation:**
   $$\rho_{\text{mix}} = \rho_{\text{oil}} \cdot (1 - \text{WC}) + \rho_{\text{water}} \cdot \text{WC}$$
   Where $\rho_{\text{oil}} = \frac{141.5}{131.5 + \text{API}} \cdot 1000\text{ kg/m}^3$.

2. **Hagen-Poiseuille Viscous Friction in Tubing:**
   Fluid flow in heavy oil is predominantly in the deep laminar regime ($Re < 2,100$):
   $$Re = \frac{\rho_{\text{mix}} \cdot v \cdot D_{\text{tubing}}}{\mu}$$
   Darcy friction factor: $f = \frac{64}{Re}$.
   $$\Delta P_{\text{friction}} = f \cdot \frac{L}{D} \cdot \frac{\rho v^2}{2} = \frac{32 \cdot \mu \cdot v \cdot L}{D^2}$$

3. **Dynamic Fluid Level & Pump Intake Pressure (PIP):**
   Fluid column height supported by reservoir flowing pressure:
   $$H_{\text{fluid}} = \frac{P_{wf} - P_{\text{casing}}}{\rho_{\text{mix}} \cdot g}$$
   $$\text{Fluid Level Depth} = \text{Total Depth} - H_{\text{fluid}}$$
   Pump Intake Pressure (PIP) is determined by effective submergence of the insert pump below the dynamic fluid level.
