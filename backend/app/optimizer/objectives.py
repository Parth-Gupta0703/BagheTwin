"""
SIH26120 Multi-Objective Optimization Formulation & Pareto Frontier
Scores candidates across:
1. Oil production (BOPD)
2. Steam-to-oil ratio (SOR)
3. Energy intensity (kWh/bbl)
4. Mechanical risk & floating margin
5. Net operating cash flow (INR/day)
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field


class ObjectiveWeights(BaseModel):
    weight_oil_production: float = 0.35
    weight_sor_reduction: float = 0.25
    weight_energy_reduction: float = 0.15
    weight_risk_mitigation: float = 0.25

    def normalize(self) -> "ObjectiveWeights":
        total = (
            self.weight_oil_production +
            self.weight_sor_reduction +
            self.weight_energy_reduction +
            self.weight_risk_mitigation
        )
        if total == 0:
            total = 1.0
        return ObjectiveWeights(
            weight_oil_production=self.weight_oil_production / total,
            weight_sor_reduction=self.weight_sor_reduction / total,
            weight_energy_reduction=self.weight_energy_reduction / total,
            weight_risk_mitigation=self.weight_risk_mitigation / total
        )


class CandidateScore:
    """
    Computes normalized multi-attribute objective utility score.
    """
    @staticmethod
    def calculate_score(
        state: Dict[str, Any],
        weights: ObjectiveWeights,
        baseline_state: Dict[str, Any]
    ) -> float:
        w = weights.normalize()

        # 1. Oil production utility (relative gain over baseline)
        b_oil = max(1.0, baseline_state.get("actual_oil_bopd", 30.0))
        oil_val = state.get("actual_oil_bopd", 30.0)
        u_oil = min(2.0, oil_val / b_oil)  # 1.0 at baseline, >1.0 if improved

        # 2. SOR utility (lower is better)
        sor_val = state.get("sor", 3.0)
        u_sor = max(0.0, min(2.0, 1.0 + (3.5 - sor_val) / 3.5))

        # 3. Energy utility (lower kWh/bbl is better)
        energy_bbl = state.get("energy_kwh_bbl", 15.0)
        u_energy = max(0.0, min(2.0, 1.0 + (18.0 - energy_bbl) / 18.0))

        # 4. Mechanical risk utility (higher floating margin and lower risk is better)
        risk_score = state.get("overall_risk_score", 0.5)
        u_risk = max(0.0, 1.0 - risk_score) * 2.0

        composite_score = (
            w.weight_oil_production * u_oil +
            w.weight_sor_reduction * u_sor +
            w.weight_energy_reduction * u_energy +
            w.weight_risk_mitigation * u_risk
        )
        return round(composite_score, 4)

    @staticmethod
    def identify_pareto_frontier(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify non-dominated solutions across [oil_bopd (max), sor (min), risk (min)].
        """
        if not candidates:
            return []

        pareto_front = []
        for i, cand_a in enumerate(candidates):
            dominated = False
            a_oil = cand_a["simulated_state"]["actual_oil_bopd"]
            a_sor = cand_a["simulated_state"]["sor"]
            a_risk = cand_a["simulated_state"]["overall_risk_score"]

            for j, cand_b in enumerate(candidates):
                if i == j:
                    continue
                b_oil = cand_b["simulated_state"]["actual_oil_bopd"]
                b_sor = cand_b["simulated_state"]["sor"]
                b_risk = cand_b["simulated_state"]["overall_risk_score"]

                # cand_b dominates cand_a if b is as good or better in all and strictly better in at least one
                if (b_oil >= a_oil and b_sor <= a_sor and b_risk <= a_risk) and (
                    b_oil > a_oil or b_sor < a_sor or b_risk < a_risk
                ):
                    dominated = True
                    break

            cand_a["is_pareto"] = not dominated
            if not dominated:
                pareto_front.append(cand_a)

        return pareto_front
