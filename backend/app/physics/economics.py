"""
SIH26120 Operating Economics & Cost Engine
Computes gross revenue, steam generation cost, electrical power cost,
and risk-weighted failure maintenance expense.
Strictly labelled as DEMO / CONFIGURABLE ASSUMPTIONS; not Oil India commercial financials.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class EconomicsConfig(BaseModel):
    model_name: str = "Configurable Demo Economics Calculator"
    model_version: str = "1.0.0"
    oil_price_usd_per_bbl: float = Field(default=75.0, description="Demo crude price in USD/bbl")
    usd_to_inr: float = Field(default=83.5, description="Demo exchange rate INR/USD")
    steam_cost_inr_per_tonne: float = Field(default=2400.0, description="Cost of fuel/water treatment for steam per tonne")
    electricity_cost_inr_per_kwh: float = Field(default=7.50, description="Industrial electricity tariff in INR/kWh")
    workover_intervention_cost_inr: float = Field(default=450000.0, description="Estimated sucker rod parted string or pump replacement cost")
    currency_display: str = "INR"
    calibration_status: str = "DEMO / CONFIGURABLE ASSUMPTIONS (NOT OFFICIAL OIL FINANCIALS)"


class OperatingEconomicsEngine:
    """
    Computes economic balance of CSS and SRP operations.
    """
    def __init__(self, config: Optional[EconomicsConfig] = None):
        self.config = config or EconomicsConfig()

    def evaluate_daily_economics(
        self,
        oil_rate_bopd: float,
        daily_electric_kwh: float,
        overall_risk_score: float,
        daily_amortized_steam_cost_inr: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates daily operating contribution margin and risk cost.
        """
        oil_price_inr_bbl = self.config.oil_price_usd_per_bbl * self.config.usd_to_inr
        gross_revenue_inr_day = oil_rate_bopd * oil_price_inr_bbl

        power_cost_inr_day = daily_electric_kwh * self.config.electricity_cost_inr_per_kwh
        steam_cost_inr_day = daily_amortized_steam_cost_inr

        # Expected failure cost: risk probability * annualized frequency factor / 365
        # High mechanical risk implies higher statistical probability of unscheduled workover
        daily_failure_probability = (overall_risk_score ** 2) * 0.015  # Up to ~1.5% chance/day for critical risk
        risk_weighted_maintenance_inr_day = daily_failure_probability * self.config.workover_intervention_cost_inr

        total_operating_cost_inr_day = power_cost_inr_day + steam_cost_inr_day + risk_weighted_maintenance_inr_day
        net_daily_margin_inr = gross_revenue_inr_day - total_operating_cost_inr_day

        return {
            "oil_rate_bopd": round(oil_rate_bopd, 1),
            "oil_price_inr_bbl": round(oil_price_inr_bbl, 2),
            "gross_revenue_inr_day": round(gross_revenue_inr_day, 2),
            "power_cost_inr_day": round(power_cost_inr_day, 2),
            "steam_cost_inr_day": round(steam_cost_inr_day, 2),
            "risk_weighted_maintenance_inr_day": round(risk_weighted_maintenance_inr_day, 2),
            "total_operating_cost_inr_day": round(total_operating_cost_inr_day, 2),
            "net_daily_margin_inr": round(net_daily_margin_inr, 2),
            "currency": self.config.currency_display,
            "model_metadata": {
                "model_name": self.config.model_name,
                "model_version": self.config.model_version,
                "calibration_status": self.config.calibration_status,
                "disclaimer": "All economic metrics are synthetic demonstration approximations. Not validated Oil India commercial records."
            }
        }
