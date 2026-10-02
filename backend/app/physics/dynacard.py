"""
SIH26120 Synthetic Dynamometer Card Generator
Generates surface polished rod load vs position dynamometer cards (dynacards)
based on SRP kinematics, elastic rod stretch, and fluid valve events.
Includes clearly labelled synthetic failure pattern archetypes:
NORMAL, HIGH_DRAG_ROD_FLOAT, PUMP_OFF, FLUID_POUND, VALVE_LEAKAGE.
Strictly labelled as demonstration cards; not certified field classification.
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class DynaCardConfig(BaseModel):
    model_name: str = "Synthetic Surface Dynacard Generator"
    model_version: str = "1.0.0"
    num_points_per_stroke: int = 60
    calibration_status: str = "SYNTHETIC DEMO ARCHETYPES / NOT FIELD MEASURED"


class DynaCardGenerator:
    """
    Generates realistic surface dynamometer cards from mechanical SRP state.
    """
    def __init__(self, config: Optional[DynaCardConfig] = None):
        self.config = config or DynaCardConfig()

    def generate_card(
        self,
        stroke_in: float,
        pprl_kn: float,
        mprl_kn: float,
        condition: str = "NORMAL",
        pump_fillage_pct: float = 85.0,
        floating_margin_kn: float = 5.0
    ) -> Dict[str, Any]:
        """
        Generate a closed loop of (position_in, load_kn) points representing one pumping stroke.
        Conditions:
        - 'NORMAL': Healthy elastic load parallelogram
        - 'HIGH_DRAG_ROD_FLOAT': Downstroke load approaches zero with severe drag and delayed pickup
        - 'PUMP_OFF': Starved pump intake with late load transfer on upstroke
        - 'FLUID_POUND': Traveling valve hits fluid mid-downstroke causing sharp load collapse
        - 'VALVE_LEAKAGE': Slippage rounding corners and reducing effective lifted volume
        """
        num_pts = self.config.num_points_per_stroke
        half_pts = num_pts // 2
        card_points: List[Dict[str, Any]] = []

        stroke_in = max(24.0, stroke_in)
        fillage = max(0.1, min(1.0, pump_fillage_pct / 100.0))

        # Baseline upstroke and downstroke nominal loads
        up_load_base = pprl_kn
        down_load_base = max(1.0, mprl_kn)

        # Build Upstroke (0 to stroke_in)
        for i in range(half_pts):
            fraction = i / float(half_pts - 1)  # 0.0 to 1.0
            pos = fraction * stroke_in

            # Dynamic elastic pick-up
            if condition == "NORMAL":
                # Gradual pickup over first 15% of stroke due to rod stretch
                if fraction < 0.15:
                    load = down_load_base + (up_load_base - down_load_base) * (fraction / 0.15)
                else:
                    # Slight harmonic wave modulation
                    wave = 0.04 * (up_load_base - down_load_base) * math.sin(fraction * math.pi * 3.0)
                    load = up_load_base + wave

            elif condition == "HIGH_DRAG_ROD_FLOAT":
                # Upstroke carries heavy fluid + extra viscous drag
                if fraction < 0.25:
                    load = down_load_base + (up_load_base * 1.08 - down_load_base) * (fraction / 0.25)
                else:
                    load = up_load_base * 1.08 + 0.02 * up_load_base * math.sin(fraction * math.pi)

            elif condition == "PUMP_OFF":
                # Fluid level is low, delayed load transfer until gas compresses
                effective_pickup = 1.0 - fillage
                if fraction < effective_pickup:
                    load = down_load_base + 0.15 * (up_load_base - down_load_base) * (fraction / max(0.01, effective_pickup))
                else:
                    frac_remaining = (fraction - effective_pickup) / max(0.01, 1.0 - effective_pickup)
                    load = down_load_base + 0.15 * (up_load_base - down_load_base) + (0.85 * (up_load_base - down_load_base)) * min(1.0, frac_remaining / 0.2)

            elif condition == "FLUID_POUND":
                if fraction < 0.18:
                    load = down_load_base + (up_load_base - down_load_base) * (fraction / 0.18)
                else:
                    load = up_load_base

            elif condition == "VALVE_LEAKAGE":
                # Rounded oval shape with leakage slippage
                load = down_load_base + (up_load_base - down_load_base) * (0.5 + 0.45 * math.sin((fraction - 0.5) * math.pi))

            else:
                load = up_load_base

            card_points.append({
                "index": i,
                "phase": "upstroke",
                "position_in": round(pos, 2),
                "position_pct": round(fraction * 100.0, 1),
                "load_kn": round(float(load), 2)
            })

        # Build Downstroke (stroke_in back to 0)
        for i in range(half_pts):
            fraction = 1.0 - (i / float(half_pts - 1))  # 1.0 down to 0.0
            pos = fraction * stroke_in

            if condition == "NORMAL":
                # Load drops quickly over first 15% of downstroke (fraction from 1.0 down to 0.85)
                if fraction > 0.85:
                    load = up_load_base - (up_load_base - down_load_base) * ((1.0 - fraction) / 0.15)
                else:
                    wave = 0.03 * (up_load_base - down_load_base) * math.sin((1.0 - fraction) * math.pi * 3.0)
                    load = down_load_base + wave

            elif condition == "HIGH_DRAG_ROD_FLOAT":
                # Severe downstroke viscous drag pushes upwards on rod string!
                # Load plummets towards zero or carrier bar separation limit
                if fraction > 0.80:
                    load = up_load_base - (up_load_base - max(0.5, down_load_base * 0.3)) * ((1.0 - fraction) / 0.20)
                else:
                    # Rod string floats / very low load
                    floating_dip = max(0.2, min(2.0, floating_margin_kn * 0.4))
                    load = floating_dip + 0.3 * math.sin((1.0 - fraction) * math.pi * 2.0)

            elif condition == "PUMP_OFF":
                # Early load drop because pump barrel was mostly unfilled gas
                if fraction > (fillage + 0.1):
                    load = down_load_base + 0.35 * (up_load_base - down_load_base)
                else:
                    load = down_load_base

            elif condition == "FLUID_POUND":
                # Plunger travels through gas chamber and then abruptly slams into liquid surface
                pound_point = fillage
                if fraction > pound_point:
                    load = up_load_base * 0.7  # floating in vapor
                elif fraction > (pound_point - 0.12):
                    # Sudden sharp compression spike / pound impact
                    slam_factor = 1.0 - ((fraction - (pound_point - 0.12)) / 0.12)
                    load = down_load_base * 0.4 + 12.0 * math.sin(slam_factor * math.pi)
                else:
                    load = down_load_base

            elif condition == "VALVE_LEAKAGE":
                load = down_load_base + (up_load_base - down_load_base) * (0.5 - 0.45 * math.sin((fraction - 0.5) * math.pi))

            else:
                load = down_load_base

            card_points.append({
                "index": half_pts + i,
                "phase": "downstroke",
                "position_in": round(pos, 2),
                "position_pct": round(fraction * 100.0, 1),
                "load_kn": round(float(load), 2)
            })

        # Generate baseline card for comparison overlay
        baseline_points = []
        if condition != "NORMAL":
            baseline_result = self.generate_card(
                stroke_in=stroke_in,
                pprl_kn=pprl_kn,
                mprl_kn=mprl_kn,
                condition="NORMAL",
                pump_fillage_pct=95.0,
                floating_margin_kn=8.0
            )
            baseline_points = baseline_result["card_points"]

        # Explain diagnostic flags
        diagnostics = {
            "condition": condition,
            "severity": "NORMAL" if condition == "NORMAL" else ("CRITICAL" if condition == "HIGH_DRAG_ROD_FLOAT" else "WARNING"),
            "features_detected": self._get_condition_description(condition, floating_margin_kn),
            "carrier_bar_separation_risk": condition == "HIGH_DRAG_ROD_FLOAT" or floating_margin_kn < 2.0,
            "disclaimer": "Synthetic demonstration pattern generated from mechanical simulation. Not field-acquired dynamometer trace."
        }

        return {
            "condition": condition,
            "stroke_in": stroke_in,
            "pprl_kn": round(pprl_kn, 2),
            "mprl_kn": round(mprl_kn, 2),
            "diagnostics": diagnostics,
            "card_points": card_points,
            "baseline_points": baseline_points,
            "model_metadata": {
                "model_name": self.config.model_name,
                "model_version": self.config.model_version,
                "calibration_status": self.config.calibration_status
            }
        }

    def _get_condition_description(self, condition: str, floating_margin_kn: float) -> str:
        if condition == "HIGH_DRAG_ROD_FLOAT":
            return f"Severe viscous drag on downstroke reducing minimum load to near-zero (Floating margin: {floating_margin_kn:.1f} kN). Carrier bar separation risk."
        elif condition == "PUMP_OFF":
            return "Pump barrel starved; fluid level below pump intake causing delayed load pickup and incomplete pump fillage."
        elif condition == "FLUID_POUND":
            return "Plunger slamming into liquid level mid-downstroke, generating destructive mechanical impact shocks."
        elif condition == "VALVE_LEAKAGE":
            return "Fluid slipping past travelling or standing valve balls/seats, causing rounded card corners and degraded volumetric efficiency."
        return "Normal operating envelope with healthy elastic load transfer."
