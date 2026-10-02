"""
SIH26120 BagheTwin Physics Units & Dimensional Conversions
Strict unit-safe conversion helpers and typed value wrappers.
Internal computations standardize on SI units (m, kg, s, K, Pa, N, J)
with explicit boundary conversion helpers for oilfield units (bopd, bar, psi, cP, kN, °C).
"""

from typing import Any, Dict, Literal
from pydantic import BaseModel, Field


class UnitValue(BaseModel):
    """
    Standard envelope for any physics, telemetry or ML metric.
    Carries dimensional value, engineering unit, model name, model version,
    and provenanced data tier (measured, simulated, derived, synthetic).
    """
    value: float
    unit: str
    model_name: str = "StandardUnits"
    model_version: str = "1.0.0"
    source_type: Literal["measured", "simulated", "derived", "synthetic", "assumption"] = "synthetic"
    description: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()


# ---------------------------------------------------------
# Temperature Conversions
# ---------------------------------------------------------
def c_to_k(t_c: float) -> float:
    """Celsius to Kelvin"""
    return t_c + 273.15


def k_to_c(t_k: float) -> float:
    """Kelvin to Celsius"""
    return t_k - 273.15


def c_to_f(t_c: float) -> float:
    """Celsius to Fahrenheit"""
    return (t_c * 9.0 / 5.0) + 32.0


def f_to_c(t_f: float) -> float:
    """Fahrenheit to Celsius"""
    return (t_f - 32.0) * 5.0 / 9.0


# ---------------------------------------------------------
# Pressure Conversions
# ---------------------------------------------------------
def bar_to_pa(p_bar: float) -> float:
    """Bar to Pascals"""
    return p_bar * 1.0e5


def pa_to_bar(p_pa: float) -> float:
    """Pascals to Bar"""
    return p_pa / 1.0e5


def psi_to_bar(p_psi: float) -> float:
    """PSI to Bar"""
    return p_psi * 0.0689475729


def bar_to_psi(p_bar: float) -> float:
    """Bar to PSI"""
    return p_bar / 0.0689475729


def pa_to_psi(p_pa: float) -> float:
    """Pascals to PSI"""
    return p_pa * 0.0001450377


# ---------------------------------------------------------
# Viscosity Conversions
# ---------------------------------------------------------
def cp_to_pa_s(mu_cp: float) -> float:
    """Centipoise (mPa·s) to Pa·s (kg/(m·s))"""
    return mu_cp * 0.001


def pa_s_to_cp(mu_pa_s: float) -> float:
    """Pa·s to Centipoise (cP)"""
    return mu_pa_s * 1000.0


# ---------------------------------------------------------
# Rate & Volume Conversions
# ---------------------------------------------------------
# 1 oil barrel (bbl) = 42 US gallons = 0.158987294928 m3
BBL_TO_M3 = 0.158987294928
M3_TO_BBL = 1.0 / BBL_TO_M3
SECONDS_PER_DAY = 86400.0


def bopd_to_m3_s(rate_bopd: float) -> float:
    """Barrels of oil per day (BOPD) to m3/s"""
    return (rate_bopd * BBL_TO_M3) / SECONDS_PER_DAY


def m3_s_to_bopd(rate_m3_s: float) -> float:
    """m3/s to BOPD"""
    return (rate_m3_s * SECONDS_PER_DAY) * M3_TO_BBL


def bopd_to_m3_day(rate_bopd: float) -> float:
    """BOPD to m3/day"""
    return rate_bopd * BBL_TO_M3


def m3_day_to_bopd(rate_m3_day: float) -> float:
    """m3/day to BOPD"""
    return rate_m3_day * M3_TO_BBL


# ---------------------------------------------------------
# Length & Diameter Conversions
# ---------------------------------------------------------
def m_to_ft(m: float) -> float:
    """Meters to Feet"""
    return m * 3.280839895


def ft_to_m(ft: float) -> float:
    """Feet to Meters"""
    return ft / 3.280839895


def inch_to_m(inch: float) -> float:
    """Inches to Meters"""
    return inch * 0.0254


def m_to_inch(m: float) -> float:
    """Meters to Inches"""
    return m / 0.0254


def mm_to_m(mm: float) -> float:
    """Millimeters to Meters"""
    return mm * 0.001


def m_to_mm(m: float) -> float:
    """Meters to Millimeters"""
    return m * 1000.0


# ---------------------------------------------------------
# Force Conversions
# ---------------------------------------------------------
def n_to_kn(n: float) -> float:
    """Newtons to Kilonewtons"""
    return n * 0.001


def kn_to_n(kn: float) -> float:
    """Kilonewtons to Newtons"""
    return kn * 1000.0


def kn_to_lbf(kn: float) -> float:
    """Kilonewtons to Pounds-force (lbf)"""
    return kn * 224.808943


def lbf_to_kn(lbf: float) -> float:
    """Pounds-force (lbf) to Kilonewtons"""
    return lbf / 224.808943


# ---------------------------------------------------------
# Mass & Energy Conversions
# ---------------------------------------------------------
def tonnes_to_kg(t: float) -> float:
    """Metric Tonnes to Kilograms"""
    return t * 1000.0


def kg_to_tonnes(kg: float) -> float:
    """Kilograms to Metric Tonnes"""
    return kg * 0.001


def mj_to_kwh(mj: float) -> float:
    """Megajoules to Kilowatt-hours (1 kWh = 3.6 MJ)"""
    return mj / 3.6


def kwh_to_mj(kwh: float) -> float:
    """Kilowatt-hours to Megajoules"""
    return kwh * 3.6


def j_to_kwh(joules: float) -> float:
    """Joules to Kilowatt-hours"""
    return joules / 3.6e6
