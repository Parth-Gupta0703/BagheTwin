"""
SIH26120 Digital Twin State Engine
Manages persistent state vectors, executes state transitions f(x, u, dt),
and fuses physics model predictions with observed telemetry.
"""

from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.physics.engine import CoupledPhysicsSimulator, WellParameters, OperationalInputs


class DigitalTwinState(BaseModel):
    well_code: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # State Vector Components
    temperature_c: float
    viscosity_cp: float
    reservoir_pressure_bar: float
    flowing_bhp_bar: float
    pump_intake_pressure_bar: float
    fluid_level_depth_m: float
    oil_rate_bopd: float
    water_rate_bwpd: float
    pprl_kn: float
    mprl_kn: float
    drag_force_kn: float
    floating_margin_kn: float
    pump_efficiency_pct: float
    energy_kwh_day: float
    sor: float
    overall_risk_score: float
    overall_risk_tier: str
    active_alarms: list[str] = []
    # Current Active Setpoints
    stroke_in: float
    spm: float
    vfd_hz: float
    steam_mass_tonnes: float
    injection_pressure_bar: float
    # Provenance
    mode: str = "SIMULATION"
    data_status: str = "SYNTHETIC / DEMO"


class DigitalTwinManager:
    """
    Manages in-memory live twin states and handles state transitions.
    """
    def __init__(self):
        self.simulator = CoupledPhysicsSimulator()
        self._states: Dict[str, DigitalTwinState] = {}

    def get_or_initialize_state(
        self,
        well_params: WellParameters,
        ops: OperationalInputs,
        current_temp_c: Optional[float] = None
    ) -> DigitalTwinState:
        well_code = well_params.well_code
        if well_code not in self._states:
            temp = current_temp_c if current_temp_c is not None else well_params.base_temperature_c
            sim_state = self.simulator.evaluate_state(well_params, ops, current_temp_c=temp)

            self._states[well_code] = DigitalTwinState(
                well_code=well_code,
                temperature_c=sim_state["temperature_c"],
                viscosity_cp=sim_state["viscosity_cp"],
                reservoir_pressure_bar=sim_state["reservoir_pressure_bar"],
                flowing_bhp_bar=sim_state["flowing_bhp_bar"],
                pump_intake_pressure_bar=sim_state["wellbore_details"]["pump_intake_pressure_bar"],
                fluid_level_depth_m=sim_state["wellbore_details"]["fluid_level_depth_m"],
                oil_rate_bopd=sim_state["actual_oil_bopd"],
                water_rate_bwpd=sim_state["actual_water_bwpd"],
                pprl_kn=sim_state["pprl_kn"],
                mprl_kn=sim_state["mprl_kn"],
                drag_force_kn=sim_state["drag_force_kn"],
                floating_margin_kn=sim_state["floating_margin_kn"],
                pump_efficiency_pct=sim_state["pump_efficiency_pct"],
                energy_kwh_day=sim_state["energy_kwh_day"],
                sor=sim_state["sor"],
                overall_risk_score=sim_state["overall_risk_score"],
                overall_risk_tier=sim_state["overall_risk_tier"],
                active_alarms=sim_state["risk_details"]["active_alarms"],
                stroke_in=ops.stroke_in,
                spm=ops.spm,
                vfd_hz=ops.vfd_hz,
                steam_mass_tonnes=ops.steam_mass_tonnes,
                injection_pressure_bar=ops.injection_pressure_bar
            )
        return self._states[well_code]

    def apply_simulated_recommendation(
        self,
        well_params: WellParameters,
        recommended_ops: Dict[str, float]
    ) -> DigitalTwinState:
        """
        Updates the simulated twin state with newly approved operational setpoints.
        Does NOT touch real hardware. Pure digital twin simulation update.
        """
        current_state = self.get_or_initialize_state(well_params, OperationalInputs())

        new_ops = OperationalInputs(
            stroke_in=recommended_ops.get("stroke_in", current_state.stroke_in),
            spm=recommended_ops.get("spm", current_state.spm),
            vfd_hz=recommended_ops.get("vfd_hz", current_state.vfd_hz),
            steam_mass_tonnes=recommended_ops.get("steam_mass_tonnes", current_state.steam_mass_tonnes),
            injection_pressure_bar=recommended_ops.get("injection_pressure_bar", current_state.injection_pressure_bar)
        )

        new_sim = self.simulator.evaluate_state(well_params, new_ops, current_temp_c=current_state.temperature_c)

        updated_twin = DigitalTwinState(
            well_code=well_params.well_code,
            updated_at=datetime.utcnow(),
            temperature_c=new_sim["temperature_c"],
            viscosity_cp=new_sim["viscosity_cp"],
            reservoir_pressure_bar=new_sim["reservoir_pressure_bar"],
            flowing_bhp_bar=new_sim["flowing_bhp_bar"],
            pump_intake_pressure_bar=new_sim["wellbore_details"]["pump_intake_pressure_bar"],
            fluid_level_depth_m=new_sim["wellbore_details"]["fluid_level_depth_m"],
            oil_rate_bopd=new_sim["actual_oil_bopd"],
            water_rate_bwpd=new_sim["actual_water_bwpd"],
            pprl_kn=new_sim["pprl_kn"],
            mprl_kn=new_sim["mprl_kn"],
            drag_force_kn=new_sim["drag_force_kn"],
            floating_margin_kn=new_sim["floating_margin_kn"],
            pump_efficiency_pct=new_sim["pump_efficiency_pct"],
            energy_kwh_day=new_sim["energy_kwh_day"],
            sor=new_sim["sor"],
            overall_risk_score=new_sim["overall_risk_score"],
            overall_risk_tier=new_sim["overall_risk_tier"],
            active_alarms=new_sim["risk_details"]["active_alarms"],
            stroke_in=new_ops.stroke_in,
            spm=new_ops.spm,
            vfd_hz=new_ops.vfd_hz,
            steam_mass_tonnes=new_ops.steam_mass_tonnes,
            injection_pressure_bar=new_ops.injection_pressure_bar
        )

        self._states[well_params.well_code] = updated_twin
        return updated_twin


twin_manager = DigitalTwinManager()
