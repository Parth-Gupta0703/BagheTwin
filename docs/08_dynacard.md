# 08 — Dynamometer Card (Dynacard) Generation & Diagnostics

## 1. Dynacard Loop Synthesis
Surface polished rod load vs position dynamometer cards are synthesized from SRP kinematic states, rod elasticity, and valve timing.

### Diagnostic Archetypes
The system generates 5 clearly labeled demonstration patterns:
1. **NORMAL:** Healthy elastic load parallelogram with smooth valve transitions and complete fillage.
2. **HIGH_DRAG_ROD_FLOAT:** Downstroke load drops near zero due to severe viscous drag resisting descent; delayed pickup on upstroke.
3. **PUMP_OFF / UNDER_FILLAGE:** Low fluid level in wellbore causing delayed load pick-up until plunger compresses gas chamber.
4. **FLUID_POUND:** Sharp impact collapse when traveling valve slams into liquid surface mid-downstroke.
5. **VALVE_LEAKAGE:** Rounded corners indicating fluid slippage past ball and seat assemblies.

### Engineering Disclaimer
All dynamometer curves are synthetic patterns generated from numerical mechanical models for decision-support demonstration. They are not field-acquired dynamometer traces.
