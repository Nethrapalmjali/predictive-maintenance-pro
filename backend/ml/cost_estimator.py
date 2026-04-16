"""
Cost Estimation Engine.
Calculates potential downtime costs and maintenance ROI.
"""
from typing import Dict, Any, Optional
from models.schemas import RiskLevel


# Industry average cost benchmarks (in INR)
MACHINE_COST_PROFILES = {
    "CNC Machine": {
        "hourly_production_value": 8000,
        "emergency_repair_multiplier": 3.5,
        "planned_repair_cost": 15000,
        "spare_parts_cost": 25000,
        "mttr_emergency_hours": 48,  # Mean Time to Repair (emergency)
        "mttr_planned_hours": 8,
    },
    "Industrial Motor": {
        "hourly_production_value": 5000,
        "emergency_repair_multiplier": 4.0,
        "planned_repair_cost": 8000,
        "spare_parts_cost": 12000,
        "mttr_emergency_hours": 24,
        "mttr_planned_hours": 4,
    },
    "Hydraulic Press": {
        "hourly_production_value": 12000,
        "emergency_repair_multiplier": 3.0,
        "planned_repair_cost": 20000,
        "spare_parts_cost": 35000,
        "mttr_emergency_hours": 72,
        "mttr_planned_hours": 16,
    },
    "Compressor": {
        "hourly_production_value": 6000,
        "emergency_repair_multiplier": 3.5,
        "planned_repair_cost": 12000,
        "spare_parts_cost": 18000,
        "mttr_emergency_hours": 36,
        "mttr_planned_hours": 6,
    },
    "default": {
        "hourly_production_value": 6000,
        "emergency_repair_multiplier": 3.5,
        "planned_repair_cost": 10000,
        "spare_parts_cost": 15000,
        "mttr_emergency_hours": 36,
        "mttr_planned_hours": 8,
    }
}

RISK_PROBABILITY = {
    RiskLevel.LOW: 0.05,
    RiskLevel.MEDIUM: 0.30,
    RiskLevel.HIGH: 0.70,
    RiskLevel.CRITICAL: 0.95
}


def calculate_cost_estimate(
    risk_level: RiskLevel,
    machine_type: str,
    runtime_hours: Optional[float] = None
) -> Dict[str, Any]:
    """Calculate financial impact of ignoring vs. addressing the issue."""
    profile = MACHINE_COST_PROFILES.get(machine_type, MACHINE_COST_PROFILES["default"])
    failure_probability = RISK_PROBABILITY.get(risk_level, 0.5)

    # Emergency failure costs
    emergency_downtime_cost = (
        profile["hourly_production_value"] * profile["mttr_emergency_hours"]
    )
    emergency_repair_cost = profile["planned_repair_cost"] * profile["emergency_repair_multiplier"]
    spare_parts = profile["spare_parts_cost"]
    total_emergency_cost = emergency_downtime_cost + emergency_repair_cost + spare_parts

    # Planned maintenance costs (much cheaper)
    planned_downtime_cost = profile["hourly_production_value"] * profile["mttr_planned_hours"]
    planned_repair_cost = profile["planned_repair_cost"]
    total_planned_cost = planned_downtime_cost + planned_repair_cost

    # Expected cost risk (probability-weighted)
    expected_risk_cost = total_emergency_cost * failure_probability

    # Savings from acting now
    potential_savings = expected_risk_cost - total_planned_cost

    # Format numbers
    def fmt(n): return f"₹{n:,.0f}"

    return {
        "scenario_if_ignored": {
            "failure_probability": f"{int(failure_probability * 100)}%",
            "downtime_hours": profile["mttr_emergency_hours"],
            "downtime_cost": fmt(emergency_downtime_cost),
            "repair_cost": fmt(emergency_repair_cost),
            "spare_parts_cost": fmt(spare_parts),
            "total_cost": fmt(total_emergency_cost),
        },
        "scenario_if_maintained": {
            "downtime_hours": profile["mttr_planned_hours"],
            "downtime_cost": fmt(planned_downtime_cost),
            "repair_cost": fmt(planned_repair_cost),
            "total_cost": fmt(total_planned_cost),
        },
        "financial_summary": {
            "expected_risk_exposure": fmt(expected_risk_cost),
            "cost_of_action_now": fmt(total_planned_cost),
            "potential_savings": fmt(max(0, potential_savings)),
            "roi_of_maintenance": f"{int(potential_savings / total_planned_cost * 100)}%" if total_planned_cost > 0 else "N/A",
            "recommendation": (
                "Act now — significant savings possible" if potential_savings > 0
                else "Monitor — cost of action outweighs risk at current levels"
            )
        }
    }
