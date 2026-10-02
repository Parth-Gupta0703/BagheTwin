"""
SIH26120 Controlled Anomaly & Hazard Injector
Enables safe synthetic injection of operational fault patterns:
1. TEMPERATURE_DROP: rapid convective thermal loss
2. HIGH_SPM_SURGE: surface speed escalation triggering rod float
3. VISCOSITY_SPIKE: sudden cold emulsion surge
4. PUMP_OFF_STARVATION: severe intake starvation & fluid pound
5. PRESSURE_ABNORMALITY: bottomhole pressure drop
"""

from typing import Dict, Any, Tuple
from datetime import datetime
from app.twin.state_manager import twin_manager, DigitalTwinState
from app.physics.engine import WellParameters, OperationalInputs


class AnomalyInjector:
    """
    Injects synthetic perturbations into the digital twin state for demo and drills.
    """
    VALID_ANOMALIES = [
        "TEMPERATURE_DROP",
        "HIGH_SPM_SURGE",
        "VISCOSITY_SPIKE",
        "PUMP_OFF_STARVATION",
        "PRESSURE_ABNORMALITY",
        "STEAM_BLOWTHROUGH",
        "GAS_LOCK",
        "VALVE_LEAK",
        "RESET_ANOMALY"
    ]

    @classmethod
    def inject(
        cls,
        well_params: WellParameters,
        anomaly_type: str
    ) -> Tuple[DigitalTwinState, Dict[str, Any]]:
        """
        Inject an anomaly into the well's digital twin state.
        """
        if anomaly_type not in cls.VALID_ANOMALIES:
            raise ValueError(f"Unknown anomaly type '{anomaly_type}'. Must be one of {cls.VALID_ANOMALIES}")

        current = twin_manager.get_or_initialize_state(well_params, OperationalInputs())

        event_desc = ""
        severity = "WARNING"

        if anomaly_type == "TEMPERATURE_DROP":
            # Temperature plummets by 16°C -> Viscosity skyrockets
            new_temp = max(well_params.base_temperature_c, current.temperature_c - 16.0)
            twin_manager.simulator.evaluate_state(well_params, OperationalInputs(), current_temp_c=new_temp)
            current.temperature_c = new_temp
            current.viscosity_cp = twin_manager.simulator.viscosity_engine.calculate_viscosity_cp(new_temp)
            current.floating_margin_kn = max(0.5, current.floating_margin_kn - 3.2)
            current.overall_risk_score = 0.88
            current.overall_risk_tier = "CRITICAL"
            current.active_alarms = [
                f"ANOMALY INJECTED: Sudden near-wellbore thermal drop to {new_temp:.1f}°C. Severe viscosity rise to {current.viscosity_cp:.0f} cP.",
                "CRITICAL: Rod floating hazard. Carrier-bar separation risk elevated."
            ]
            severity = "CRITICAL"
            event_desc = f"Simulated rapid thermal decline to {new_temp:.1f}°C."

        elif anomaly_type == "HIGH_SPM_SURGE":
            # SPM surged from 5.5 to 9.5 -> high inertial acceleration and viscous drag
            current.spm = 9.5
            current.floating_margin_kn = 1.1  # Critical float!
            current.pprl_kn = round(current.pprl_kn * 1.35, 1)
            current.overall_risk_score = 0.92
            current.overall_risk_tier = "CRITICAL"
            current.active_alarms = [
                "ANOMALY INJECTED: Surface SPM surged to 9.5. Dynamic load ratio exceeded.",
                "CRITICAL: Polished rod load dropped to near zero on downstroke (Margin: 1.1 kN). Rod float active."
            ]
            severity = "CRITICAL"
            event_desc = "Simulated unauthorized VFD frequency spike to 9.5 SPM."

        elif anomaly_type == "STEAM_BLOWTHROUGH":
            # Steam channel breakthrough: high temp spike, vapor lock in pump chamber
            current.temperature_c = min(180.0, current.temperature_c + 35.0)
            current.pump_intake_pressure_bar = round(current.pump_intake_pressure_bar * 1.6, 1)
            current.pump_efficiency_pct = 22.0  # Gas/steam vapor interference
            current.oil_rate_bopd = round(current.oil_rate_bopd * 0.25, 1)
            current.overall_risk_score = 0.94
            current.overall_risk_tier = "CRITICAL"
            current.active_alarms = [
                "ANOMALY INJECTED: High-temperature steam breakthrough detected in wellbore.",
                "CRITICAL: Steam vapor expansion in pump chamber. Severe pump efficiency collapse (22%)."
            ]
            severity = "CRITICAL"
            event_desc = "Simulated high-enthalpy steam blowthrough channeling into production zone."

        elif anomaly_type == "GAS_LOCK":
            # Free gas trapped between standing and traveling valves
            current.pump_efficiency_pct = 14.0
            current.oil_rate_bopd = round(max(2.0, current.oil_rate_bopd * 0.12), 1)
            current.overall_risk_score = 0.86
            current.overall_risk_tier = "CRITICAL"
            current.active_alarms = [
                "ANOMALY INJECTED: Sucker rod pump gas lock active.",
                "CRITICAL: Traveling valve not unseating due to gas compression. Liquid delivery halted."
            ]
            severity = "CRITICAL"
            event_desc = "Simulated severe pump gas lock preventing valve actuation."

        elif anomaly_type == "VALVE_LEAK":
            # Ball/seat erosion causing fluid slippage
            current.pump_efficiency_pct = 38.0
            current.oil_rate_bopd = round(current.oil_rate_bopd * 0.52, 1)
            current.overall_risk_score = 0.65
            current.overall_risk_tier = "HIGH"
            current.active_alarms = [
                "ANOMALY INJECTED: Valve slippage detected on traveling/standing ball-and-seat.",
                "WARNING: Fluid slippage rate elevated. Volumetric efficiency reduced."
            ]
            severity = "HIGH"
            event_desc = "Simulated downhole pump traveling valve ball-and-seat slippage."

        elif anomaly_type == "VISCOSITY_SPIKE":
            current.viscosity_cp = 24000.0
            current.drag_force_kn = round(current.drag_force_kn * 1.8, 1)
            current.floating_margin_kn = 1.4
            current.overall_risk_score = 0.85
            current.overall_risk_tier = "CRITICAL"
            current.active_alarms = [
                "ANOMALY INJECTED: High-viscosity emulsion slug detected (24,000 cP). Annular shear resistance increased."
            ]
            severity = "CRITICAL"
            event_desc = "Simulated high-viscosity emulsion slugging in wellbore."

        elif anomaly_type == "PUMP_OFF_STARVATION":
            current.pump_efficiency_pct = 35.0
            current.oil_rate_bopd = round(current.oil_rate_bopd * 0.4, 1)
            current.overall_risk_score = 0.75
            current.overall_risk_tier = "HIGH"
            current.active_alarms = [
                "ANOMALY INJECTED: Dynamic fluid level dropped below pump intake. Plunger hitting gas pocket (Fluid Pound)."
            ]
            severity = "HIGH"
            event_desc = "Simulated pump-off starvation and fluid pound event."

        elif anomaly_type == "PRESSURE_ABNORMALITY":
            current.flowing_bhp_bar = 8.5  # Heavy depletion
            current.oil_rate_bopd = round(current.oil_rate_bopd * 0.55, 1)
            current.overall_risk_score = 0.60
            current.overall_risk_tier = "MEDIUM"
            current.active_alarms = [
                "ANOMALY INJECTED: Bottomhole flowing pressure collapsed to 8.5 bar."
            ]
            severity = "WARNING"
            event_desc = "Simulated unexpected bottomhole drawdown collapse."

        elif anomaly_type == "RESET_ANOMALY":
            # Re-evaluate clean baseline state from physics simulator
            clean_ops = OperationalInputs(stroke_in=100.0, spm=4.8)
            sim_state = twin_manager.simulator.evaluate_state(well_params, clean_ops, current_temp_c=well_params.base_temperature_c)
            current.stroke_in = clean_ops.stroke_in
            current.spm = clean_ops.spm
            current.vfd_hz = clean_ops.vfd_hz
            current.temperature_c = sim_state["temperature_c"]
            current.viscosity_cp = sim_state["viscosity_cp"]
            current.oil_rate_bopd = sim_state["actual_oil_bopd"]
            current.water_rate_bwpd = sim_state["actual_water_bwpd"]
            current.pprl_kn = sim_state["pprl_kn"]
            current.mprl_kn = sim_state["mprl_kn"]
            current.drag_force_kn = sim_state["drag_force_kn"]
            current.floating_margin_kn = sim_state["floating_margin_kn"]
            current.pump_efficiency_pct = sim_state["pump_efficiency_pct"]
            current.overall_risk_score = sim_state["overall_risk_score"]
            current.overall_risk_tier = sim_state["overall_risk_tier"]
            current.active_alarms = []
            severity = "INFO"
            event_desc = f"Operational fault cleared. Physical baseline restored for {well_params.well_code}."

        current.updated_at = datetime.utcnow()

        event_record = {
            "well_code": well_params.well_code,
            "event_type": anomaly_type,
            "severity": severity,
            "trigger_source": "MANUAL_SYNTHETIC_INJECTION",
            "simulated": True,
            "description": event_desc,
            "timestamp": current.updated_at.isoformat()
        }

        return current, event_record
