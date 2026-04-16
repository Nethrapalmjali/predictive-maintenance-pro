"""
ML Anomaly Detection Module
Uses Isolation Forest + Z-Score + Dynamic Thresholds for robust detection.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Tuple
import warnings
warnings.filterwarnings('ignore')


# Machine-specific threshold configuration
PARAMETER_THRESHOLDS = {
    "temperature": {
        "normal_range": (20, 75),
        "warning_range": (75, 90),
        "critical_threshold": 90,
        "unit": "°C",
        "description": "Operating Temperature"
    },
    "vibration": {
        "normal_range": (0, 2.5),
        "warning_range": (2.5, 4.5),
        "critical_threshold": 4.5,
        "unit": "mm/s",
        "description": "Vibration Level"
    },
    "pressure": {
        "normal_range": (1, 6),
        "warning_range": (6, 8),
        "critical_threshold": 8,
        "unit": "bar",
        "description": "System Pressure"
    },
    "rpm": {
        "normal_range": (800, 3500),
        "warning_range": (3500, 4000),
        "critical_threshold": 4000,
        "unit": "RPM",
        "description": "Rotation Speed"
    },
    "current": {
        "normal_range": (0, 15),
        "warning_range": (15, 20),
        "critical_threshold": 20,
        "unit": "A",
        "description": "Electrical Current"
    },
    "voltage": {
        "normal_range": (220, 240),
        "warning_range": (200, 220),
        "critical_threshold": 200,
        "unit": "V",
        "description": "Supply Voltage"
    },
    "oil_level": {
        "normal_range": (30, 100),
        "warning_range": (15, 30),
        "critical_threshold": 15,
        "unit": "%",
        "description": "Oil Level"
    },
    "humidity": {
        "normal_range": (30, 70),
        "warning_range": (70, 85),
        "critical_threshold": 85,
        "unit": "%",
        "description": "Humidity"
    }
}


class AnomalyDetector:
    """
    Multi-strategy anomaly detection combining:
    1. Static threshold rules
    2. Z-Score statistical analysis
    3. Isolation Forest ML model
    """

    def __init__(self, contamination: float = 0.1):
        self.contamination = contamination
        self.scaler = StandardScaler()
        self.iso_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )

    def _check_thresholds(self, param: str, values: List[float]) -> Dict[str, Any]:
        """Check if values breach predefined thresholds."""
        if param not in PARAMETER_THRESHOLDS:
            return {"breach": False, "severity": "unknown"}

        config = PARAMETER_THRESHOLDS[param]
        latest = values[-1] if values else 0
        normal_min, normal_max = config["normal_range"]
        warning_min, warning_max = config["warning_range"]
        critical = config["critical_threshold"]

        # Check direction of breach
        if "oil_level" in param or "voltage" in param:
            # Low-side breach (below threshold is bad)
            if latest <= critical:
                return {"breach": True, "severity": "critical", "direction": "low"}
            elif latest <= warning_min:
                return {"breach": True, "severity": "warning", "direction": "low"}
        else:
            # High-side breach (above threshold is bad)
            if latest >= critical:
                return {"breach": True, "severity": "critical", "direction": "high"}
            elif latest >= warning_min:
                return {"breach": True, "severity": "warning", "direction": "high"}

        return {"breach": False, "severity": "normal", "direction": "stable"}

    def _calculate_zscore(self, values: List[float]) -> Tuple[float, bool]:
        """Calculate Z-score to detect statistical outliers."""
        if len(values) < 3:
            return 0.0, False
        arr = np.array(values)
        mean = np.mean(arr)
        std = np.std(arr)
        if std == 0:
            return 0.0, False
        latest_zscore = abs((values[-1] - mean) / std)
        return round(latest_zscore, 2), latest_zscore > 2.5

    def _detect_trend(self, values: List[float]) -> Dict[str, Any]:
        """Detect trends using linear regression slope."""
        if len(values) < 3:
            return {"trend": "stable", "rate_of_change": 0, "confidence": 0}

        x = np.arange(len(values))
        y = np.array(values)
        slope = np.polyfit(x, y, 1)[0]

        rate_percent = abs(slope / (np.mean(y) + 1e-10)) * 100
        rate_of_change = round(slope, 3)

        if abs(slope) < 0.01 * np.mean(y):
            trend = "stable"
        elif slope > 0:
            trend = "increasing"
            if rate_percent > 5:
                trend = "rapidly_increasing"
        else:
            trend = "decreasing"
            if rate_percent > 5:
                trend = "rapidly_decreasing"

        return {
            "trend": trend,
            "rate_of_change": rate_of_change,
            "confidence": min(100, int(rate_percent * 10))
        }

    def _detect_spikes(self, values: List[float]) -> List[int]:
        """Detect sudden spikes in the data."""
        if len(values) < 3:
            return []
        spikes = []
        arr = np.array(values)
        rolling_std = np.std(arr)
        for i in range(1, len(values) - 1):
            if abs(values[i] - values[i-1]) > 2.5 * rolling_std:
                spikes.append(i)
        return spikes

    def run_isolation_forest(self, data_matrix: np.ndarray) -> float:
        """Run Isolation Forest on multi-parameter data."""
        if data_matrix.shape[0] < 5:
            return 0.5  # Not enough data

        scaled = self.scaler.fit_transform(data_matrix)
        self.iso_forest.fit(scaled)
        scores = self.iso_forest.decision_function(scaled)
        # Normalize to 0-1 (higher = more anomalous)
        normalized = 1 - (scores - scores.min()) / (scores.max() - scores.min() + 1e-10)
        return round(float(normalized[-1]), 3)

    def analyze(self, readings: List[Dict]) -> Dict[str, Any]:
        """
        Main analysis function. Returns comprehensive anomaly analysis.
        """
        results = {}
        param_values = {}
        anomalies_detected = []
        normal_params = []

        # Extract time series per parameter
        valid_params = ["temperature", "vibration", "pressure", "rpm", 
                       "current", "voltage", "oil_level", "humidity"]

        for param in valid_params:
            values = [r.get(param) for r in readings if r.get(param) is not None]
            if values:
                param_values[param] = values

        # Analyze each parameter
        for param, values in param_values.items():
            threshold_result = self._check_thresholds(param, values)
            zscore, is_outlier = self._calculate_zscore(values)
            trend_data = self._detect_trend(values)
            spikes = self._detect_spikes(values)

            config = PARAMETER_THRESHOLDS.get(param, {})
            results[param] = {
                "current_value": values[-1],
                "unit": config.get("unit", ""),
                "description": config.get("description", param),
                "threshold_breach": threshold_result["breach"],
                "severity": threshold_result["severity"],
                "direction": threshold_result.get("direction", "stable"),
                "zscore": zscore,
                "is_statistical_outlier": is_outlier,
                "trend": trend_data["trend"],
                "rate_of_change": trend_data["rate_of_change"],
                "spikes_detected": len(spikes) > 0,
                "spike_indices": spikes,
                "min_value": min(values),
                "max_value": max(values),
                "avg_value": round(np.mean(values), 2),
                "values": values
            }

            # Classify as anomaly or normal
            is_anomaly = (
                threshold_result["breach"] or
                is_outlier or
                "rapidly" in trend_data["trend"] or
                len(spikes) > 1
            )

            if is_anomaly:
                anomalies_detected.append(param)
            else:
                normal_params.append(param)

        # Isolation Forest on combined data
        matrix_data = []
        matrix_params = []
        for param, vals in param_values.items():
            if len(vals) >= 5:
                matrix_data.append(vals[-min(len(vals), 20):])
                matrix_params.append(param)

        isolation_score = 0.3
        if matrix_data:
            min_len = min(len(v) for v in matrix_data)
            if min_len >= 5:
                matrix = np.array([v[-min_len:] for v in matrix_data]).T
                isolation_score = self.run_isolation_forest(matrix)

        return {
            "parameters": results,
            "anomalies": anomalies_detected,
            "normal_parameters": normal_params,
            "isolation_forest_score": isolation_score,
            "total_anomalies": len(anomalies_detected),
            "overall_severity": self._calculate_overall_severity(results)
        }

    def _calculate_overall_severity(self, results: Dict) -> str:
        """Determine overall machine health severity."""
        severities = [r.get("severity", "normal") for r in results.values()]
        if "critical" in severities:
            return "critical"
        elif "warning" in severities:
            return "warning"
        return "normal"


# Singleton instance
detector = AnomalyDetector()
