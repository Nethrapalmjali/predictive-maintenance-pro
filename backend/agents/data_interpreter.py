"""
Data Interpreter Agent — Step 1 of the 3-agent pipeline.
Converts raw sensor readings into structured trend summaries.
"""
from typing import List, Dict, Any
from models.schemas import MachineData, InterpretedData, TrendData
from ml.anomaly_detection import detector, PARAMETER_THRESHOLDS
import numpy as np


TREND_DESCRIPTIONS = {
    "increasing": "gradually increasing",
    "rapidly_increasing": "rapidly increasing (concerning rate)",
    "decreasing": "gradually decreasing",
    "rapidly_decreasing": "rapidly decreasing (below normal)",
    "stable": "stable within normal range"
}

PARAMETER_CONTEXT = {
    "temperature": "machine operating temperature",
    "vibration": "mechanical vibration level",
    "pressure": "system hydraulic/pneumatic pressure",
    "rpm": "motor/spindle rotation speed",
    "current": "electrical current draw",
    "voltage": "supply voltage",
    "oil_level": "lubrication oil level",
    "humidity": "surrounding humidity level"
}


class DataInterpreterAgent:
    """
    Agent 1: Converts raw sensor data into structured, meaningful trends.
    Produces human-readable data summaries for the Diagnostic Agent.
    """

    def interpret(self, machine_data: MachineData) -> InterpretedData:
        """
        Main entry point. Parses readings and returns interpreted trends.
        """
        readings_dicts = [r.model_dump(exclude_none=True) for r in machine_data.readings]

        # Run ML analysis
        analysis = detector.analyze(readings_dicts)

        # Build trend objects
        trends: List[TrendData] = []
        for param, result in analysis["parameters"].items():
            config = PARAMETER_THRESHOLDS.get(param, {})
            trend = TrendData(
                parameter=param,
                trend=result["trend"],
                direction=result.get("direction", "stable"),
                rate_of_change=result["rate_of_change"],
                current_value=result["current_value"],
                threshold_breach=result["threshold_breach"],
                severity=result["severity"]
            )
            trends.append(trend)

        # Build natural language summary
        summary = self._build_summary(machine_data, analysis)

        return InterpretedData(
            machine_id=machine_data.machine_id,
            trends=trends,
            anomalies=analysis["anomalies"],
            normal_parameters=analysis["normal_parameters"],
            summary=summary,
            anomaly_score=analysis["isolation_forest_score"]
        )

    def _build_summary(self, machine_data: MachineData, analysis: Dict) -> str:
        """Create a rich textual summary of the machine's current state."""
        parts = []
        params = analysis["parameters"]

        for param in analysis["anomalies"]:
            if param not in params:
                continue
            result = params[param]
            ctx = PARAMETER_CONTEXT.get(param, param)
            config = PARAMETER_THRESHOLDS.get(param, {})
            unit = config.get("unit", "")
            trend_desc = TREND_DESCRIPTIONS.get(result["trend"], result["trend"])

            line = f"The {ctx} is {trend_desc}, currently at {result['current_value']}{unit}"
            if result["threshold_breach"]:
                line += f" (above safe threshold)"
            if result["spikes_detected"]:
                line += f". Sudden spikes were detected in the data"
            if result["is_statistical_outlier"]:
                line += f". Statistical outlier detected (Z-score: {result['zscore']})"
            parts.append(line + ".")

        # Add runtime context
        if machine_data.runtime_hours:
            parts.append(
                f"Machine has operated for {machine_data.runtime_hours} hours total."
            )
        if machine_data.last_maintenance_days:
            parts.append(
                f"Last maintenance was {machine_data.last_maintenance_days} days ago."
            )

        if not parts:
            parts.append("All parameters are within normal operating ranges.")

        return " ".join(parts)

    def get_structured_prompt_input(self, interpreted: InterpretedData, machine_data: MachineData) -> str:
        """
        Formats interpreted data into a structured prompt for the Diagnostic Agent.
        """
        lines = [
            f"Machine: {machine_data.machine_name} ({machine_data.machine_type})",
            f"Machine ID: {machine_data.machine_id}",
            f"Runtime Hours: {machine_data.runtime_hours or 'Unknown'}",
            f"Days Since Last Maintenance: {machine_data.last_maintenance_days or 'Unknown'}",
            "",
            "=== SENSOR DATA SUMMARY ===",
            interpreted.summary,
            "",
            "=== TREND ANALYSIS ===",
        ]

        for trend in interpreted.trends:
            config = PARAMETER_THRESHOLDS.get(trend.parameter, {})
            unit = config.get("unit", "")
            lines.append(
                f"- {trend.parameter.upper()}: {trend.current_value}{unit} | "
                f"Trend: {trend.trend} | "
                f"Threshold breach: {'YES' if trend.threshold_breach else 'NO'} | "
                f"Severity: {trend.severity}"
            )

        lines.extend([
            "",
            f"Anomaly Score (Isolation Forest): {interpreted.anomaly_score:.2f}/1.0",
            f"Parameters with anomalies: {', '.join(interpreted.anomalies) or 'None'}",
            f"Parameters normal: {', '.join(interpreted.normal_parameters) or 'None'}",
        ])

        return "\n".join(lines)


# Singleton
data_interpreter = DataInterpreterAgent()
