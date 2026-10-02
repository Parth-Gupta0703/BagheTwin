# 12 — Petroleum Engineering Data Dictionary

| Variable Name | Symbol | Standard Unit | Oilfield Display Unit | Description | Classification |
|---|---|---|---|---|---|
| `temperature_c` | $T$ | K | °C | Formation / fluid temperature | Simulated State |
| `viscosity_cp` | $\mu$ | $\text{Pa}\cdot\text{s}$ | cP ($\text{mPa}\cdot\text{s}$) | Dynamic liquid viscosity | Derived State |
| `reservoir_pressure_bar` | $P_{\text{res}}$ | Pa | bar / psi | Static reservoir formation pressure | Static Assumption |
| `flowing_bhp_bar` | $P_{wf}$ | Pa | bar / psi | Bottomhole flowing pressure | Simulated State |
| `pump_intake_pressure_bar` | PIP | Pa | bar / psi | Pressure at pump suction intake | Simulated State |
| `fluid_level_depth_m` | $H_{\text{fluid}}$ | m | m / ft | Annular fluid level from surface | Derived State |
| `oil_rate_bopd` | $q_{\text{oil}}$ | $\text{m}^3/\text{s}$ | BOPD | Net oil production rate | Simulated State |
| `water_rate_bwpd` | $q_{\text{water}}$ | $\text{m}^3/\text{s}$ | BWPD | Produced water rate | Simulated State |
| `stroke_in` | $S$ | m | inches | Polished rod stroke length | Control Input |
| `spm` | $N$ | Hz | strokes/min (SPM) | Surface pumping frequency | Control Input |
| `vfd_hz` | $f$ | Hz | Hz | Variable frequency drive speed | Control Input |
| `pprl_kn` | PPRL | N | kN / lbf | Peak Polished Rod Load | Simulated Dynamic |
| `mprl_kn` | MPRL | N | kN / lbf | Minimum Polished Rod Load | Simulated Dynamic |
| `drag_force_kn` | $F_{\text{drag}}$ | N | kN | Annular Couette viscous shear force | Derived Physics |
| `floating_margin_kn` | Margin | N | kN | Downstroke rod-floating safety margin | Safety Metric |
| `steam_mass_tonnes` | $m_{\text{steam}}$ | kg | metric tonnes | Injected steam slug mass | Control Input |
| `injection_pressure_bar` | $P_{\text{inj}}$ | Pa | bar / psi | Wellhead steam injection pressure | Control Input |
| `sor` | SOR | dimensionless | t/bbl (or CWE $\text{m}^3/\text{m}^3$) | Steam-to-Oil Ratio | Efficiency Metric |
