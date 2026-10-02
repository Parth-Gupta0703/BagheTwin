"""
SIH26120 Live Telemetry WebSocket Streamer
Generates realistic high-frequency telemetry packets for the Live Operations room.
Strictly labelled as SIMULATED LIVE TELEMETRY.
"""

import asyncio
import json
import random
from typing import Dict, Any, List
from datetime import datetime
from fastapi import WebSocket

from app.twin.state_manager import twin_manager
from app.physics.engine import WellParameters, OperationalInputs


class TelemetryStreamer:
    """
    Manages active WebSocket client connections and streams live synthetic telemetry.
    """
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, well_code: str, websocket: WebSocket):
        await websocket.accept()
        if well_code not in self.active_connections:
            self.active_connections[well_code] = []
        self.active_connections[well_code].append(websocket)

    def disconnect(self, well_code: str, websocket: WebSocket):
        if well_code in self.active_connections:
            if websocket in self.active_connections[well_code]:
                self.active_connections[well_code].remove(websocket)

    async def broadcast_telemetry(self, well_code: str, packet: Dict[str, Any]):
        if well_code in self.active_connections:
            for connection in list(self.active_connections[well_code]):
                try:
                    await connection.send_json(packet)
                except Exception:
                    self.disconnect(well_code, connection)

    def generate_live_tick(self, well_params: WellParameters) -> Dict[str, Any]:
        """
        Generate a single real-time simulated telemetry observation with micro-variations.
        """
        current_state = twin_manager.get_or_initialize_state(well_params, OperationalInputs())

        # Micro dynamic noise (0.2%)
        noise_p = random.uniform(-0.003, 0.003)
        noise_t = random.uniform(-0.002, 0.002)

        p_wf = round(current_state.flowing_bhp_bar * (1.0 + noise_p), 2)
        temp_c = round(current_state.temperature_c * (1.0 + noise_t), 1)

        return {
            "well_code": well_params.well_code,
            "timestamp": datetime.utcnow().isoformat(),
            "source_type": "SIMULATED_LIVE_TELEMETRY",
            "temperature_c": temp_c,
            "viscosity_cp": current_state.viscosity_cp,
            "flowing_bhp_bar": p_wf,
            "pump_intake_pressure_bar": current_state.pump_intake_pressure_bar,
            "oil_rate_bopd": round(current_state.oil_rate_bopd * (1.0 + noise_p), 1),
            "water_rate_bwpd": current_state.water_rate_bwpd,
            "stroke_in": current_state.stroke_in,
            "spm": current_state.spm,
            "vfd_hz": current_state.vfd_hz,
            "pprl_kn": current_state.pprl_kn,
            "mprl_kn": current_state.mprl_kn,
            "drag_force_kn": current_state.drag_force_kn,
            "floating_margin_kn": current_state.floating_margin_kn,
            "pump_efficiency_pct": current_state.pump_efficiency_pct,
            "energy_kwh": round(current_state.energy_kwh_day / 24.0, 2),  # kW average
            "overall_risk_score": current_state.overall_risk_score,
            "overall_risk_tier": current_state.overall_risk_tier,
            "active_alarms": current_state.active_alarms,
            "disclaimer": "Simulated live telemetry stream for demonstration. Not field SCADA."
        }


streamer = TelemetryStreamer()
