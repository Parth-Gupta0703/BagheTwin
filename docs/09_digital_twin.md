# 09 — Digital Twin State Manager & Telemetry Streamer

## 1. Digital Twin State Vector
Each well maintains a persistent, continuous state vector:
$$\mathbf{x} = \begin{bmatrix} T_{\text{wellbore}} \\ \mu_{\text{crude}} \\ P_{\text{res}} \\ P_{wf} \\ \text{PIP} \\ H_{\text{fluid}} \\ q_{\text{oil}} \\ q_{\text{water}} \\ \text{PPRL} \\ \text{MPRL} \\ F_{\text{drag}} \\ \text{Margin}_{\text{float}} \\ \eta_{\text{pump}} \\ E_{\text{power}} \\ \text{SOR} \\ \text{Risk}_{\text{composite}} \end{bmatrix}, \quad \mathbf{u} = \begin{bmatrix} m_{\text{steam}} \\ P_{\text{inj}} \\ t_{\text{soak}} \\ t_{\text{cutoff}} \\ S \\ N_{\text{SPM}} \\ f_{\text{VFD}} \end{bmatrix}$$

State transition function:
$$\mathbf{x}_{t + \Delta t} = f(\mathbf{x}_t, \mathbf{u}_t, \Delta t)$$

## 2. Telemetry Streaming & Anomaly Injection
* **Simulated Streamer:** Broadcasts live simulated telemetry packets over WebSocket at ~1.5 Hz.
* **Controlled Anomaly Injection:** Allows operators to trigger synthetic operational faults (formation cooling, SPM surge, viscosity slug, pump-off, drawdown collapse) to test automated alarm triggers and decision workflows.
