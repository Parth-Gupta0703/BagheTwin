# 10 — Machine Learning Surrogates & Applicability Guardrails

## 1. Machine Learning Role & Architecture
ML models are used as surrogate accelerators and statistical risk classifiers, never as a black-box replacement for petroleum physics:

1. **Production Rate Surrogate:**
   * **Algorithm:** Second-order regularized polynomial ridge regression (`PolynomialRidgeRegressor`) in pure NumPy.
   * **Holdout Validation:** 25% holdout on synthetic multi-well history.
   * **Metrics:** $R^2 = 0.7691$, $\text{MAE} = 30.37\text{ BOPD}$, $\text{RMSE} = 40.49\text{ BOPD}$.
   * **Prediction Intervals:** Outputs point prediction with explicit P10 and P90 uncertainty bounds.

2. **Rod-Floating Classifier:**
   * **Algorithm:** Regularized logistic regression (`LogisticRiskClassifier`) in SciPy.
   * **Metrics:** $\text{Precision} = 1.000$, $\text{Recall} = 0.375$, $F_1 = 0.545$.

3. **Anomaly Detection:**
   * **Algorithm:** Mahalanobis distance / empirical covariance envelope (`MahalanobisAnomalyDetector`).
   * **Contamination/Quantile:** 0.95.

4. **Domain Applicability Guardrail:**
   Incoming operational setpoints are checked against the synthetic training envelope.
   * `IN_DOMAIN`: Features within verified envelope $\rightarrow$ High confidence surrogate prediction.
   * `NEAR_BOUNDARY`: Features within 10% of limits $\rightarrow$ Moderate confidence flag.
   * `OUT_OF_DOMAIN`: Features exceed boundaries $\rightarrow$ System automatically disables ungrounded ML extrapolation and defaults to reduced-order physics simulation with an explicit operator warning.
