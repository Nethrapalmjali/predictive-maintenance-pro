from ml.cost_estimator import MACHINE_COST_PROFILES, calculate_cost_estimate
from models.schemas import RiskLevel


def test_known_machine_returns_all_sections():
    result = calculate_cost_estimate(RiskLevel.HIGH, "CNC Machine")
    assert set(result) == {"scenario_if_ignored", "scenario_if_maintained", "financial_summary"}
    assert result["scenario_if_ignored"]["failure_probability"] == "70%"
    assert result["scenario_if_ignored"]["downtime_hours"] == MACHINE_COST_PROFILES["CNC Machine"]["mttr_emergency_hours"]


def test_unknown_machine_falls_back_to_default_profile():
    unknown = calculate_cost_estimate(RiskLevel.MEDIUM, "Totally Unknown Machine")
    default = calculate_cost_estimate(RiskLevel.MEDIUM, "default")
    assert unknown == default


def test_critical_risk_recommends_action():
    summary = calculate_cost_estimate(RiskLevel.CRITICAL, "Hydraulic Press")["financial_summary"]
    assert summary["recommendation"].startswith("Act now")


def test_low_risk_recommends_monitoring_and_zero_savings():
    summary = calculate_cost_estimate(RiskLevel.LOW, "Industrial Motor")["financial_summary"]
    assert summary["recommendation"].startswith("Monitor")
    assert summary["potential_savings"] == "₹0"


def test_currency_formatting_uses_thousands_separators():
    ignored = calculate_cost_estimate(RiskLevel.HIGH, "CNC Machine")["scenario_if_ignored"]
    # 8000/hr * 48h downtime
    assert ignored["downtime_cost"] == "₹384,000"
