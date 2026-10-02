You are the autonomous engineering agent for this SIH 2026 prototype.

I am providing you an attached specification file:
SIH26120_Industry_Grade_Master_Spec.md

Treat that file as the authoritative build specification for this project.

DO NOT merely create a frontend mockup.

Your job is to build the complete working system end-to-end:

1. Inspect the current repository and preserve useful existing work.
2. Implement the reduced-order petroleum physics engine.
3. Implement CSS → thermal state → viscosity → inflow coupling.
4. Implement wellbore state and SRP mechanics.
5. Implement viscous-drag / rod-floating risk logic.
6. Implement synthetic data generation with reproducible seeds.
7. Implement ML surrogate/risk models with honest synthetic-data labeling.
8. Implement out-of-domain/applicability checks and prediction intervals where practical.
9. Implement constrained multi-objective CSS + SRP optimization.
10. Implement FastAPI REST + WebSocket APIs.
11. Implement PostgreSQL schema/migrations and demo seeding.
12. Implement React control-room UI and all required pages.
13. Implement Digital Twin state management.
14. Implement Scenario Lab / 30-60-90 day simulations.
15. Implement synthetic live telemetry and anomaly injection.
16. Implement synthetic dynamometer cards.
17. Implement Before-vs-After recommendation comparison.
18. Implement operator approval + audit trail.
19. Implement data/model provenance screens.
20. Implement complete tests.
21. Implement Docker Compose and Windows local run scripts.
22. Implement documentation.
23. Run the application, run all tests, fix errors, then perform a final self-audit against the specification.

IMPORTANT ENGINEERING RULES

- Never claim synthetic values are real Oil India measurements.
- Never claim field validation unless actual approved field data are provided.
- Never claim API/ASTM certification or compliance.
- Never copy unexplained constants from other public SIH repositories.
- Treat public SIH repositories as architecture references only.
- Keep physics assumptions configurable and documented.
- Use unit-safe calculations.
- Separate physics model outputs from ML surrogate outputs.
- Reject unsafe optimization candidates before ranking.
- Detect out-of-domain inputs.
- Every recommendation must be explainable and auditable.
- No recommendation may directly control real field equipment.
- “Apply” must only apply to the simulated digital twin state.

SOURCE/PROVENANCE RULE

Use verified sources for public Baghewala facts. The SIH problem statement is the primary scope source. OIL’s public Rajasthan field information is a secondary field-context source. ASTM D341 and relevant API sucker-rod documentation may be used as engineering references. Document all assumptions separately from sourced facts.

REFERENCE IMPLEMENTATIONS TO STUDY, NOT COPY BLINDLY:
- viveky1621/sih26120-baghewala-digital-twin
- nishanth24vv/sih26120-baghewala-digital-twin
- maddy-bit/SIH26120-PetroTwin-AI
- Apaar-Gupta/SIH-2026

Do not reuse their reported metrics as ours.

IMPLEMENTATION PROCESS

Phase 1 — repository inspection + architecture
Phase 2 — physics engine + tests
Phase 3 — synthetic dataset generator
Phase 4 — ML + validation + applicability
Phase 5 — optimizer + constraints
Phase 6 — FastAPI + PostgreSQL
Phase 7 — React control room
Phase 8 — digital twin + live simulation
Phase 9 — audit/provenance/security
Phase 10 — full tests + Docker + demo validation

Do not stop after any phase. Continue until the entire system is working.

When reasonable implementation choices exist, decide yourself using the specification. Do not block progress with architecture questions.

Definition of done:
The complete system runs locally, the jury demo flow works from start to finish, unsafe recommendations are rejected, the audit trail is updated, and the UI clearly distinguishes synthetic/simulated data from field-validated data.
