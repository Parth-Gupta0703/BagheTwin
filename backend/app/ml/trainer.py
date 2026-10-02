"""
SIH26120 Model Training & Evaluation Pipeline
Uses high-performance NumPy & SciPy formulations for regression surrogates,
logistic risk classifiers, and Mahalanobis anomaly detection.
Immune to OS-level DLL/Application Control blocks and 100% transparent/explainable.
"""

from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path
from datetime import datetime
import json
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.spatial.distance import mahalanobis

from app.ml.dataset_generator import SyntheticDatasetGenerator


class PolynomialRidgeRegressor:
    """
    Second-order polynomial ridge regression surrogate with closed-form solution.
    """
    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha
        self.mean_ = None
        self.std_ = None
        self.weights_ = None

    def _expand_features(self, x: np.ndarray) -> np.ndarray:
        # Include bias (1), linear terms (x), and quadratic terms (x^2)
        quad = x ** 2
        return np.hstack([np.ones((x.shape[0], 1)), x, quad])

    def fit(self, x: np.ndarray, y: np.ndarray):
        self.mean_ = np.mean(x, axis=0)
        self.std_ = np.std(x, axis=0)
        self.std_[self.std_ == 0.0] = 1.0

        x_scaled = (x - self.mean_) / self.std_
        phi = self._expand_features(x_scaled)

        # Closed-form Ridge: w = (Phi^T Phi + alpha * I)^-1 Phi^T y
        reg_matrix = self.alpha * np.eye(phi.shape[1])
        reg_matrix[0, 0] = 0.0  # Do not regularize bias
        self.weights_ = np.linalg.pinv(phi.T @ phi + reg_matrix) @ phi.T @ y

    def predict(self, x: np.ndarray) -> np.ndarray:
        x_scaled = (x - self.mean_) / self.std_
        phi = self._expand_features(x_scaled)
        return np.maximum(0.0, phi @ self.weights_)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mean": self.mean_.tolist(),
            "std": self.std_.tolist(),
            "weights": self.weights_.tolist(),
            "alpha": self.alpha
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PolynomialRidgeRegressor":
        model = cls(alpha=data["alpha"])
        model.mean_ = np.array(data["mean"])
        model.std_ = np.array(data["std"])
        model.weights_ = np.array(data["weights"])
        return model


class LogisticRiskClassifier:
    """
    Regularized Logistic Regression classifier with Scipy optimization.
    """
    def __init__(self, reg_lambda: float = 0.1):
        self.reg_lambda = reg_lambda
        self.mean_ = None
        self.std_ = None
        self.weights_ = None
        self.bias_ = 0.0

    def fit(self, x: np.ndarray, y: np.ndarray):
        self.mean_ = np.mean(x, axis=0)
        self.std_ = np.std(x, axis=0)
        self.std_[self.std_ == 0.0] = 1.0

        x_scaled = (x - self.mean_) / self.std_
        n_features = x.shape[1]

        def loss_func(params):
            w = params[:n_features]
            b = params[n_features]
            logits = np.clip(x_scaled @ w + b, -20.0, 20.0)
            p = 1.0 / (1.0 + np.exp(-logits))
            # Negative log-likelihood + L2 regularization
            eps = 1e-12
            nll = -np.mean(y * np.log(p + eps) + (1.0 - y) * np.log(1.0 - p + eps))
            reg = 0.5 * self.reg_lambda * np.sum(w ** 2)
            return nll + reg

        initial_params = np.zeros(n_features + 1)
        res = minimize(loss_func, initial_params, method="BFGS")
        self.weights_ = res.x[:n_features]
        self.bias_ = float(res.x[n_features])

    def predict_proba(self, x: np.ndarray) -> np.ndarray:
        x_scaled = (x - self.mean_) / self.std_
        logits = np.clip(x_scaled @ self.weights_ + self.bias_, -20.0, 20.0)
        p1 = 1.0 / (1.0 + np.exp(-logits))
        return np.column_stack([1.0 - p1, p1])

    def predict(self, x: np.ndarray) -> np.ndarray:
        proba = self.predict_proba(x)[:, 1]
        return (proba >= 0.5).astype(int)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mean": self.mean_.tolist(),
            "std": self.std_.tolist(),
            "weights": self.weights_.tolist(),
            "bias": self.bias_,
            "reg_lambda": self.reg_lambda
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LogisticRiskClassifier":
        model = cls(reg_lambda=data["reg_lambda"])
        model.mean_ = np.array(data["mean"])
        model.std_ = np.array(data["std"])
        model.weights_ = np.array(data["weights"])
        model.bias_ = data["bias"]
        return model


class MahalanobisAnomalyDetector:
    """
    Robust statistical anomaly detector using empirical covariance and Mahalanobis distance.
    """
    def __init__(self, quantile_threshold: float = 0.95):
        self.quantile_threshold = quantile_threshold
        self.mean_ = None
        self.cov_inv_ = None
        self.threshold_ = None

    def fit(self, x: np.ndarray):
        self.mean_ = np.mean(x, axis=0)
        cov = np.cov(x, rowvar=False) + 1e-4 * np.eye(x.shape[1])
        self.cov_inv_ = np.linalg.pinv(cov)

        diff = x - self.mean_
        distances = np.sqrt(np.sum((diff @ self.cov_inv_) * diff, axis=1))
        self.threshold_ = float(np.quantile(distances, self.quantile_threshold))

    def compute_anomaly_score(self, x: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        diff = x - self.mean_
        distances = np.sqrt(np.sum((diff @ self.cov_inv_) * diff, axis=1))
        is_anomaly = (distances > self.threshold_).astype(bool)
        # Normalized score between 0 and 1
        scores = np.clip(distances / max(1e-3, self.threshold_ * 1.5), 0.0, 1.0)
        return is_anomaly, scores

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mean": self.mean_.tolist(),
            "cov_inv": self.cov_inv_.tolist(),
            "threshold": self.threshold_,
            "quantile_threshold": self.quantile_threshold
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MahalanobisAnomalyDetector":
        model = cls(quantile_threshold=data["quantile_threshold"])
        model.mean_ = np.array(data["mean"])
        model.cov_inv_ = np.array(data["cov_inv"])
        model.threshold_ = data["threshold"]
        return model


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: Optional[np.ndarray] = None) -> Dict[str, float]:
    """Calculate regression and classification evaluation metrics."""
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    ss_res = np.sum((y_true - y_pred) ** 2)
    r2 = float(1.0 - (ss_res / max(1e-6, ss_tot)))

    metrics = {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2, 4)}

    if y_prob is not None:
        y_bool = y_true.astype(bool)
        pred_bool = (y_prob >= 0.5).astype(bool)
        tp = np.sum(y_bool & pred_bool)
        fp = np.sum((~y_bool) & pred_bool)
        fn = np.sum(y_bool & (~pred_bool))

        precision = float(tp / max(1, tp + fp))
        recall = float(tp / max(1, tp + fn))
        f1 = float(2 * precision * recall / max(1e-6, precision + recall))
        metrics.update({"Precision": round(precision, 3), "Recall": round(recall, 3), "F1": round(f1, 3)})

    return metrics


class ModelTrainer:
    """
    Trains, evaluates, and writes ML artifacts to disk.
    """
    def __init__(self, artifacts_dir: Optional[str] = None):
        if artifacts_dir:
            self.artifacts_dir = Path(artifacts_dir)
        else:
            self.artifacts_dir = Path(__file__).resolve().parent.parent.parent / "artifacts" / "models"
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)

    def train_all_models(self) -> Dict[str, Any]:
        gen = SyntheticDatasetGenerator(random_seed=42)
        wells_df, telemetry_df, _ = gen.generate_full_historical_telemetry(days_history=180)

        # 1. Train Production Surrogate
        prod_features = ["temperature_c", "viscosity_cp", "stroke_in", "spm", "vfd_hz", "flowing_bhp_bar"]
        x_prod = telemetry_df[prod_features].values
        y_prod = telemetry_df["oil_rate_bopd"].values

        # Split 75/25
        n_samples = len(x_prod)
        indices = np.arange(n_samples)
        np.random.seed(42)
        np.random.shuffle(indices)
        split_idx = int(0.75 * n_samples)

        train_idx, test_idx = indices[:split_idx], indices[split_idx:]
        x_p_train, x_p_test = x_prod[train_idx], x_prod[test_idx]
        y_p_train, y_p_test = y_prod[train_idx], y_prod[test_idx]

        prod_model = PolynomialRidgeRegressor(alpha=2.0)
        prod_model.fit(x_p_train, y_p_train)
        y_p_pred = prod_model.predict(x_p_test)
        prod_metrics = compute_metrics(y_p_test, y_p_pred)

        prod_model_path = self.artifacts_dir / "production_surrogate.json"
        with open(prod_model_path, "w") as f:
            json.dump(prod_model.to_dict(), f, indent=2)

        # 2. Train Rod-Float Risk Classifier
        risk_features = ["floating_margin_kn", "viscosity_cp", "spm", "pprl_kn", "mprl_kn", "temperature_c"]
        x_risk = telemetry_df[risk_features].values
        y_risk = (telemetry_df["overall_risk_score"].values >= 0.50).astype(float)

        x_r_train, x_r_test = x_risk[train_idx], x_risk[test_idx]
        y_r_train, y_r_test = y_risk[train_idx], y_risk[test_idx]

        risk_clf = LogisticRiskClassifier(reg_lambda=0.05)
        risk_clf.fit(x_r_train, y_r_train)
        y_r_prob = risk_clf.predict_proba(x_r_test)[:, 1]
        y_r_pred = risk_clf.predict(x_r_test)
        risk_metrics = compute_metrics(y_r_test, y_r_pred, y_r_prob)

        risk_model_path = self.artifacts_dir / "rod_float_risk_classifier.json"
        with open(risk_model_path, "w") as f:
            json.dump(risk_clf.to_dict(), f, indent=2)

        # 3. Train Anomaly Detector
        anomaly_model = MahalanobisAnomalyDetector(quantile_threshold=0.95)
        anomaly_model.fit(x_risk)

        anomaly_model_path = self.artifacts_dir / "telemetry_anomaly_detector.json"
        with open(anomaly_model_path, "w") as f:
            json.dump(anomaly_model.to_dict(), f, indent=2)

        registry_data = {
            "dataset_provenance": {
                "dataset_id": "SYNTH_FLEET_BGW_180D_V1",
                "source_type": "SYNTHETIC",
                "random_seed": 42,
                "wells_count": len(wells_df),
                "records_count": len(telemetry_df),
                "created_at": datetime.utcnow().isoformat(),
                "disclaimer": "Synthetic training dataset generated using coupled physics simulation. NOT Oil India field measurements."
            },
            "models": {
                "production_surrogate": {
                    "model_id": "MOD-SURR-PROD-01",
                    "algorithm": "PolynomialRidgeRegressor (NumPy)",
                    "version": "1.0.0",
                    "status": "DEMO",
                    "artifact_path": str(prod_model_path),
                    "features": prod_features,
                    "metrics": prod_metrics,
                    "validation_strategy": "25% Holdout on Synthetic Trajectories",
                    "validation_status": "DEMO / NOT FIELD VALIDATED"
                },
                "rod_float_risk_classifier": {
                    "model_id": "MOD-CLF-RODFLOAT-01",
                    "algorithm": "RegularizedLogisticClassifier (SciPy)",
                    "version": "1.0.0",
                    "status": "DEMO",
                    "artifact_path": str(risk_model_path),
                    "features": risk_features,
                    "metrics": risk_metrics,
                    "validation_strategy": "25% Holdout on Synthetic Trajectories",
                    "validation_status": "DEMO / NOT FIELD VALIDATED"
                },
                "anomaly_detector": {
                    "model_id": "MOD-ANOM-MAHALANOBIS-01",
                    "algorithm": "MahalanobisDistanceAnomalyDetector",
                    "version": "1.0.0",
                    "status": "DEMO",
                    "artifact_path": str(anomaly_model_path),
                    "quantile_threshold": 0.95,
                    "validation_status": "DEMO / NOT FIELD VALIDATED"
                }
            }
        }

        with open(self.artifacts_dir / "model_registry.json", "w") as f:
            json.dump(registry_data, f, indent=2)

        return registry_data


if __name__ == "__main__":
    trainer = ModelTrainer()
    res = trainer.train_all_models()
    print("Models trained successfully!")
    print(json.dumps(res, indent=2))
