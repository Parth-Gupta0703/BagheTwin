"""
Tests for Joint Multi-Objective Optimizer and Safety Constraint Enforcement.
"""

import pytest
from app.physics.engine import WellParameters, OperationalInputs
from app.optimizer.constraints import CandidateConstraintEvaluator
from app.optimizer.joint_optimizer import JointOptimizer
from app.optimizer.objectives import ObjectiveWeights


def test_constraint_evaluator_rejects_unsafe_pressure():
    evaluator = CandidateConstraintEvaluator()
    candidate = {"injection_pressure_bar": 125.0, "spm": 5.0, "stroke_in": 120.0}
    sim_state = {"floating_margin_kn": 6.0, "sor": 3.0}
    is_feasible, violations = evaluator.evaluate_candidate(candidate, sim_state)
    assert is_feasible is False
    assert any("fracture limit" in v for v in violations)


def test_constraint_evaluator_rejects_rod_floating_hazard():
    evaluator = CandidateConstraintEvaluator()
    candidate = {"injection_pressure_bar": 80.0, "spm": 9.5, "stroke_in": 120.0}
    sim_state = {"floating_margin_kn": 1.2, "sor": 3.0}  # Below 2.0 kN floor!
    is_feasible, violations = evaluator.evaluate_candidate(candidate, sim_state)
    assert is_feasible is False
    assert any("Floating margin" in v and "REJECTED" in v for v in violations)


def test_joint_optimizer_end_to_end():
    optimizer = JointOptimizer()
    well = WellParameters(well_code="BGW-001")
    ops = OperationalInputs(stroke_in=120.0, spm=6.8)

    res = optimizer.run_optimization(
        well_params=well,
        current_ops=ops,
        current_temp_c=50.0,
        num_candidates=25
    )

    assert res.total_candidates_evaluated > 0
    assert res.rejected_candidates_count > 0  # Rejections observed for unsafe tests
    assert res.feasible_candidates_count > 0
    assert res.recommended_candidate["is_feasible"] is True
    # Explanation checks
    assert len(res.explanation.recommended_actions) > 0
    assert "oil_rate_delta_bopd" in res.explanation.expected_deltas
    assert res.explanation.applicability_status == "IN_DOMAIN"
