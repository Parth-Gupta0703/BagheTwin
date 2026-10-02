# 14 — Model Governance & Lifecycle Registry

## 1. Model Lifecycle States
Every surrogate, classifier, and physics component is registered with an unambiguous lifecycle status:
* `EXPERIMENTAL`: Under research / prototyping.
* `DEMO`: Trained on synthetic simulator data for hackathon demonstrations.
* `VALIDATED`: Calibrated against approved, laboratory-measured field data (NOT active in this demo).
* `RETIRED`: Deprecated model versions.

**Governance Rule:** All current machine learning models in this system are strictly marked as `DEMO`, preventing any false claims of field certification.

## 2. Model Registry Metadata Schema
Each model logged in `backend/artifacts/models/model_registry.json` includes:
* `model_id`: Globally unique model identifier (e.g. `MOD-SURR-PROD-01`).
* `version`: Semantic version string.
* `algorithm`: Exact algorithm name and implementation language (e.g., `PolynomialRidgeRegressor (NumPy)`).
* `dataset_id`: Identifier of the exact dataset used during training.
* `metrics`: Holdout evaluation metrics (MAE, RMSE, $R^2$, Precision, Recall, $F_1$, ROC-AUC).
* `validation_status`: `DEMO / NOT FIELD VALIDATED`.
