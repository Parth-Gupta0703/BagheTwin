"""
SIH26120 Sucker Rod Pump (SRP) & Rod-Floating Mechanics Engine
Calculates polished rod kinematics, dynamic loads (PPRL, MPRL), viscous annular drag,
theoretical pump displacement, energy consumption, and downstroke rod-floating margin.
References API TR 11L concepts adapted for heavy-crude viscous drag and carrier-bar separation risks.
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.physics.units import (
    inch_to_m, mm_to_m, m_to_inch, n_to_kn, kn_to_n, kn_to_lbf,
    BBL_TO_M3, M3_TO_BBL, SECONDS_PER_DAY
)


class SRPConfig(BaseModel):
    model_name: str = "Reduced-Order Viscous SRP & Rod-Floating Engine"
    model_version: str = "1.0.0"
    steel_density_kg_m3: float = 7850.0
    steel_modulus_gpa: float = 210.0
    rod_tensile_yield_mpa: float = 650.0  # Grade D sucker rod proxy
    mechanical_efficiency: float = 0.88
    motor_efficiency: float = 0.85
    surface_friction_loss_kn: float = 1.2
    critical_floating_margin_kn: float = 1.5
    high_floating_margin_kn: float = 4.0
    medium_floating_margin_kn: float = 7.5
    calibration_status: str = "SYNTHETIC / API TR 11L REFERENCE ADAPTED"


class SRPEngine:
    """
    Simulates sucker rod string kinematics, pumping loads, and viscous drag in heavy oil.
    """
    def __init__(self, config: Optional[SRPConfig] = None):
        self.config = config or SRPConfig()

    def calculate_kinematics(self, stroke_in: float, spm: float, time_sec: float) -> tuple[float, float, float]:
        """
        Harmonic approximation of polished rod motion at crank angle theta:
        x(t) = (S/2) * (1 - cos(omega * t))
        v(t) = (S/2) * omega * sin(omega * t)
        a(t) = (S/2) * omega^2 * cos(omega * t)
        """
        stroke_m = inch_to_m(stroke_in)
        omega = (2.0 * math.pi * spm) / 60.0  # rad/s
        theta = omega * time_sec

        pos_m = 0.5 * stroke_m * (1.0 - math.cos(theta))
        vel_m_s = 0.5 * stroke_m * omega * math.sin(theta)
        acc_m_s2 = 0.5 * stroke_m * (omega ** 2) * math.cos(theta)
        return pos_m, vel_m_s, acc_m_s2

    def calculate_annular_viscous_drag_n(
        self,
        rod_diameter_mm: float,
        tubing_id_mm: float,
        pump_depth_m: float,
        viscosity_pa_s: float,
        velocity_m_s: float
    ) -> float:
        """
        Viscous shear force between moving cylindrical sucker rod and stationary tubing.
        Couette velocity profile in narrow annulus:
        tau = mu * (dv / dr) ~ mu * (v / delta_r)
        Area = pi * d_rod * L
        F_drag = tau * Area = pi * d_rod * L * mu * v / (r_tubing - r_rod)
        """
        r_rod_m = mm_to_m(rod_diameter_mm) / 2.0
        r_tubing_m = mm_to_m(tubing_id_mm) / 2.0
        annular_gap_m = max(0.002, r_tubing_m - r_rod_m)

        area_rod_m2 = math.pi * (2.0 * r_rod_m) * pump_depth_m
        shear_rate_s_inv = abs(velocity_m_s) / annular_gap_m

        # Heavy oil non-Newtonian slight shear-thinning proxy (Ostwald-de Waele power law n~0.9)
        effective_viscosity = viscosity_pa_s * ((max(1.0, shear_rate_s_inv) / 10.0) ** -0.1)

        f_drag_n = area_rod_m2 * effective_viscosity * (abs(velocity_m_s) / annular_gap_m)
        return float(f_drag_n)

    def evaluate_srp_state(
        self,
        stroke_in: float,
        spm: float,
        vfd_hz: float,
        pump_bore_mm: float,
        rod_diameter_mm: float,
        pump_depth_m: float,
        tubing_id_mm: float,
        viscosity_cp: float,
        fluid_density_kg_m3: float = 960.0,
        pump_fillage: float = 0.85,
        submergence_m: float = 120.0
    ) -> Dict[str, Any]:
        """
        Comprehensive SRP mechanics evaluation including rod-float risk analysis.
        """
        # Validate input boundaries
        stroke_in = max(24.0, min(240.0, stroke_in))
        spm = max(1.0, min(16.0, spm))
        pump_fillage = max(0.1, min(1.0, pump_fillage))

        stroke_m = inch_to_m(stroke_in)
        viscosity_pa_s = viscosity_cp * 0.001
        g = 9.80665

        # 1. Rod String & Plunger Geometries
        d_rod_m = mm_to_m(rod_diameter_mm)
        area_rod_m2 = math.pi * ((d_rod_m / 2.0) ** 2)
        rod_volume_m3 = area_rod_m2 * pump_depth_m
        rod_mass_air_kg = rod_volume_m3 * self.config.steel_density_kg_m3
        w_rod_air_n = rod_mass_air_kg * g

        # Buoyant factor for steel submerged in well fluid
        buoyant_factor = 1.0 - (fluid_density_kg_m3 / self.config.steel_density_kg_m3)
        w_rod_buoyant_n = w_rod_air_n * max(0.2, buoyant_factor)

        # Plunger Area and Fluid Load on Upstroke
        d_plunger_m = mm_to_m(pump_bore_mm)
        area_plunger_m2 = math.pi * ((d_plunger_m / 2.0) ** 2)
        net_fluid_lift_area_m2 = max(0.0001, area_plunger_m2 - area_rod_m2)

        # Fluid load F_fluid = net_area * rho * g * net_head
        # Net head is pump depth minus submergence
        net_head_m = max(10.0, pump_depth_m - submergence_m)
        f_fluid_n = net_fluid_lift_area_m2 * fluid_density_kg_m3 * g * net_head_m * pump_fillage

        # 2. Dynamic Acceleration (Mills Acceleration Factor alpha)
        # alpha = (S * N^2) / 70500 where S in inches, N in SPM
        acc_factor = (stroke_in * (spm ** 2)) / 70500.0

        # Maximum rod velocity during downstroke and upstroke (v_max = pi * S * SPM / 60)
        v_max_m_s = (math.pi * stroke_m * spm) / 60.0

        # 3. Viscous Drag Forces
        drag_force_n = self.calculate_annular_viscous_drag_n(
            rod_diameter_mm=rod_diameter_mm,
            tubing_id_mm=tubing_id_mm,
            pump_depth_m=pump_depth_m,
            viscosity_pa_s=viscosity_pa_s,
            velocity_m_s=v_max_m_s
        )

        # 4. Polished Rod Loads
        # Upstroke: PPRL = W_rod_buoyant * (1 + alpha) + F_fluid + F_viscous_drag_up + surface_loss
        f_surface_n = kn_to_n(self.config.surface_friction_loss_kn)
        pprl_n = (w_rod_buoyant_n * (1.0 + acc_factor)) + f_fluid_n + drag_force_n + f_surface_n
        pprl_kn = n_to_kn(pprl_n)

        # Downstroke: Traveling valve opens, fluid load is carried by standing valve/tubing.
        # MPRL = W_rod_buoyant * (1 - alpha) - F_viscous_drag_down - f_surface
        mprl_n = (w_rod_buoyant_n * (1.0 - acc_factor)) - drag_force_n - f_surface_n
        mprl_kn = n_to_kn(max(0.0, mprl_n))

        load_span_kn = pprl_kn - mprl_kn

        # 5. Sucker Rod Stress and Rod Buckling / Float Assessment
        rod_stress_mpa = (pprl_n / area_rod_m2) / 1.0e6
        rod_stress_ratio = rod_stress_mpa / self.config.rod_tensile_yield_mpa

        # DOWNSTROKE FLOATING MARGIN:
        # Effective downward force driving the rod string downwards:
        f_downward_n = w_rod_buoyant_n * (1.0 - acc_factor)
        # Opposing upward force resisting descent:
        f_opposing_n = drag_force_n + f_surface_n
        floating_margin_n = f_downward_n - f_opposing_n
        floating_margin_kn = n_to_kn(floating_margin_n)

        # Categorize rod floating risk
        if floating_margin_kn <= self.config.critical_floating_margin_kn:
            floating_risk = "CRITICAL"
            floating_risk_score = 0.95
        elif floating_margin_kn <= self.config.high_floating_margin_kn:
            floating_risk = "HIGH"
            floating_risk_score = 0.75
        elif floating_margin_kn <= self.config.medium_floating_margin_kn:
            floating_risk = "MEDIUM"
            floating_risk_score = 0.40
        else:
            floating_risk = "LOW"
            floating_risk_score = 0.10

        # 6. Displacement, Production Capacity & Power
        # Displacement V_disp in m3/s and bopd
        v_disp_m3_stroke = area_plunger_m2 * stroke_m
        q_disp_m3_day = v_disp_m3_stroke * spm * 1440.0
        q_disp_bpd = q_disp_m3_day * M3_TO_BBL

        # Volumetric pump efficiency accounting for slippage & fillage
        pump_efficiency_pct = round(pump_fillage * 95.0, 1)
        q_pump_capacity_bpd = q_disp_bpd * (pump_efficiency_pct / 100.0)

        # Polished rod power (kW)
        # Power = (Work per stroke * SPM) / 60
        # Work ~ 0.5 * (PPRL - MPRL) * stroke * shape_factor
        work_per_stroke_j = load_span_kn * 1000.0 * stroke_m * 0.78
        polished_rod_power_kw = (work_per_stroke_j * spm) / 60000.0
        total_electric_power_kw = polished_rod_power_kw / (self.config.mechanical_efficiency * self.config.motor_efficiency)

        energy_kwh_per_day = total_electric_power_kw * 24.0
        energy_kwh_per_bbl = energy_kwh_per_day / max(1.0, q_pump_capacity_bpd)

        return {
            "stroke_in": stroke_in,
            "spm": spm,
            "vfd_hz": vfd_hz,
            "pump_depth_m": pump_depth_m,
            "pump_bore_mm": pump_bore_mm,
            "rod_diameter_mm": rod_diameter_mm,
            "viscosity_cp": round(viscosity_cp, 1),
            "pprl_kn": round(pprl_kn, 2),
            "mprl_kn": round(mprl_kn, 2),
            "load_span_kn": round(load_span_kn, 2),
            "buoyant_rod_weight_kn": round(n_to_kn(w_rod_buoyant_n), 2),
            "fluid_load_kn": round(n_to_kn(f_fluid_n), 2),
            "viscous_drag_kn": round(n_to_kn(drag_force_n), 2),
            "floating_margin_kn": round(floating_margin_kn, 2),
            "floating_risk": floating_risk,
            "floating_risk_score": floating_risk_score,
            "rod_stress_mpa": round(rod_stress_mpa, 1),
            "rod_stress_ratio": round(rod_stress_ratio, 3),
            "max_rod_velocity_m_s": round(v_max_m_s, 3),
            "pump_displacement_bpd": round(q_disp_bpd, 1),
            "pump_capacity_bpd": round(q_pump_capacity_bpd, 1),
            "pump_fillage_pct": round(pump_fillage * 100.0, 1),
            "pump_efficiency_pct": pump_efficiency_pct,
            "polished_rod_power_kw": round(polished_rod_power_kw, 2),
            "motor_power_kw": round(total_electric_power_kw, 2),
            "energy_kwh_per_day": round(energy_kwh_per_day, 1),
            "energy_kwh_per_bbl": round(energy_kwh_per_bbl, 2),
            "model_metadata": {
                "model_name": self.config.model_name,
                "model_version": self.config.model_version,
                "calibration_status": self.config.calibration_status,
                "disclaimer": "Coupled viscous drag and Mills acceleration mechanics. Not field-certified dynamometer analysis."
            }
        }
