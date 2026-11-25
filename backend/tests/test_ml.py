from ml.anomaly_detection import AnomalyDetector
from ml.data_simulator import SCENARIO_MAP, get_simulated_data


def test_every_scenario_generates_requested_number_of_readings():
    for scenario in SCENARIO_MAP:
        readings = get_simulated_data(scenario, 12)
        assert len(readings) == 12
        assert "timestamp" in readings[0] and "temperature" in readings[0]


def test_unknown_scenario_falls_back_to_overheating():
    assert len(get_simulated_data("does_not_exist", 5)) == 5


def test_analyze_returns_expected_structure():
    result = AnomalyDetector().analyze(get_simulated_data("normal", 20))
    for key in ("parameters", "anomalies", "normal_parameters", "isolation_forest_score",
                "total_anomalies", "overall_severity"):
        assert key in result
    assert result["total_anomalies"] == len(result["anomalies"])
    assert result["overall_severity"] in {"normal", "warning", "critical"}


def test_critical_scenario_flags_anomalies():
    result = AnomalyDetector().analyze(get_simulated_data("critical", 20))
    assert result["total_anomalies"] > 0
    assert result["overall_severity"] in {"warning", "critical"}


def test_analyze_handles_empty_readings():
    result = AnomalyDetector().analyze([])
    assert result["parameters"] == {}
    assert result["overall_severity"] == "normal"


def test_low_side_parameters_raise_warning_before_critical():
    det = AnomalyDetector()
    # voltage normal 220-240, critical <= 200
    assert det._check_thresholds("voltage", [230])["severity"] == "normal"
    assert det._check_thresholds("voltage", [210])["severity"] == "warning"
    assert det._check_thresholds("voltage", [195])["severity"] == "critical"
    # oil_level normal >= 30, critical <= 15
    assert det._check_thresholds("oil_level", [50])["severity"] == "normal"
    assert det._check_thresholds("oil_level", [20])["severity"] == "warning"
    assert det._check_thresholds("oil_level", [10])["severity"] == "critical"
