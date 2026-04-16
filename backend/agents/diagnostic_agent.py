"""
Diagnostic Agent — Step 2 of the 3-agent pipeline.
Uses Groq AI to reason about anomalies and produce expert diagnostics.
"""
import json
import os
from groq import Groq
from typing import Dict, Any, Optional, List
from models.schemas import DiagnosticResult, RiskLevel, InterpretedData
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


DIAGNOSTIC_SYSTEM_PROMPT = """You are an expert industrial maintenance engineer with 20+ years of experience diagnosing equipment failures across manufacturing, power plants, and heavy machinery.

You analyze structured sensor data summaries and produce precise, actionable maintenance diagnostics.

Your analysis must be grounded in real engineering principles:
- Elevated temperature + high vibration + increased current draw = bearing failure signature
- Pressure drops + vibration spikes = cavitation or seal failure
- RPM fluctuations + high temperature = lubrication breakdown
- Stable sensors with isolated spikes = electrical interference or sensor fault

Always be specific, not generic. Reference the actual values and trends in your reasoning.
Return ONLY valid JSON matching the exact schema provided. No markdown, no explanation outside JSON."""


DIAGNOSTIC_SCHEMA = {
    "issue_summary": "string - Clear 1-2 sentence description of the problem",
    "root_cause": "string - Most likely technical root cause with engineering reasoning",
    "risk_level": "string - one of: Low, Medium, High, Critical",
    "future_impact": "string - What will happen if no action is taken (be specific with timeline)",
    "recommended_actions": ["string - action 1", "string - action 2", "string - action 3"],
    "confidence_score": "integer 0-100",
    "affected_components": ["string - component 1", "string - component 2"],
    "estimated_time_to_failure": "string - realistic time estimate e.g. '3-5 days', '2 weeks', or null",
    "technical_explanation": "string - Thorough engineering analysis of the sensor trends and their interactions"
}


class DiagnosticAgent:
    """
    Agent 2: AI-powered diagnostic reasoning using Groq.
    Produces structured engineering insights from interpreted sensor data.
    """

    def __init__(self):
        self.model = "llama-3.3-70b-versatile"

    def diagnose(
        self,
        structured_input: str,
        interpreted: InterpretedData,
        runtime_hours: Optional[float] = None,
        last_maintenance_days: Optional[int] = None
    ) -> DiagnosticResult:
        """Run AI diagnosis on structured sensor summary."""
        prompt = self._build_prompt(structured_input, interpreted)

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": DIAGNOSTIC_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=2048,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()

            data = json.loads(raw)
            return self._parse_response(data)

        except json.JSONDecodeError:
            return self._fallback_diagnosis(interpreted)
        except Exception as e:
            print(f"[DiagnosticAgent] Error: {e}")
            return self._fallback_diagnosis(interpreted)

    def _build_prompt(self, structured_input: str, interpreted: InterpretedData) -> str:
        return f"""{DIAGNOSTIC_SYSTEM_PROMPT}

=== MACHINE DATA ===
{structured_input}

=== YOUR TASK ===
Analyze this machine data like a senior maintenance engineer would. 

Based on the sensor trends, anomalies, and patterns:
1. Identify the most likely failure mode or issue
2. Determine root cause using engineering principles
3. Assign appropriate risk level
4. Predict future impact with specific timeline
5. Give 3 practical, prioritized maintenance actions
6. Rate your confidence based on data clarity

Return ONLY this JSON structure (no markdown, no explanation):
{json.dumps(DIAGNOSTIC_SCHEMA, indent=2)}

Be specific. Use actual parameter values in your reasoning. Think like an engineer, not a generic chatbot."""

    def _parse_response(self, data: Dict) -> DiagnosticResult:
        """Parse AI response into DiagnosticResult."""
        risk_map = {
            "low": RiskLevel.LOW,
            "medium": RiskLevel.MEDIUM,
            "high": RiskLevel.HIGH,
            "critical": RiskLevel.CRITICAL
        }
        risk = risk_map.get(str(data.get("risk_level", "medium")).lower(), RiskLevel.MEDIUM)

        return DiagnosticResult(
            issue_summary=data.get("issue_summary", "Anomaly detected in machine parameters"),
            root_cause=data.get("root_cause", "Unable to determine root cause"),
            risk_level=risk,
            future_impact=data.get("future_impact", "Continued operation may lead to equipment damage"),
            recommended_actions=data.get("recommended_actions", ["Schedule maintenance inspection"]),
            confidence_score=int(data.get("confidence_score", 50)),
            affected_components=data.get("affected_components", ["Unknown"]),
            estimated_time_to_failure=data.get("estimated_time_to_failure"),
            technical_explanation=data.get("technical_explanation")
        )

    def _fallback_diagnosis(self, interpreted: InterpretedData) -> DiagnosticResult:
        """Rule-based fallback when AI is unavailable."""
        severity_map = {
            "critical": RiskLevel.CRITICAL,
            "warning": RiskLevel.HIGH,
            "normal": RiskLevel.LOW
        }

        # Determine from anomalies
        if len(interpreted.anomalies) >= 3:
            risk = RiskLevel.CRITICAL
        elif len(interpreted.anomalies) >= 1:
            risk = RiskLevel.HIGH
        else:
            risk = RiskLevel.LOW

        return DiagnosticResult(
            issue_summary=f"Anomalies detected in: {', '.join(interpreted.anomalies) or 'None'}. {interpreted.summary[:200]}",
            root_cause="Multiple sensor anomalies detected. AI analysis temporarily unavailable — rule-based diagnosis applied.",
            risk_level=risk,
            future_impact="Continued anomalous readings may lead to component degradation. Immediate inspection recommended.",
            recommended_actions=[
                "Schedule immediate inspection of flagged parameters",
                "Check lubrication and cooling systems",
                "Review maintenance logs and compare with historical baselines"
            ],
            confidence_score=40,
            affected_components=interpreted.anomalies or ["Unknown"],
            estimated_time_to_failure=None
        )

    def generate_what_if(self, base_context: str, parameter: str, change_value: float, 
                         change_unit: str, current_risk: str) -> Dict[str, Any]:
        """Simulate what-if scenario for a parameter change."""
        prompt = f"""{DIAGNOSTIC_SYSTEM_PROMPT}

Current machine context:
{base_context}

WHAT-IF SCENARIO:
What happens if {parameter} increases by {change_value} {change_unit} from current value?
Current risk is already: {current_risk}

Return JSON with these fields:
{{
  "new_risk_level": "Low/Medium/High/Critical",
  "scenario_description": "string - what happens",
  "additional_failures": ["list of components at risk"],
  "probability_of_failure": "percentage as string",
  "recommended_immediate_action": "string"
}}

Return only valid JSON."""

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": DIAGNOSTIC_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()
            return json.loads(raw)
        except Exception:
            return {
                "new_risk_level": "High",
                "scenario_description": f"Increasing {parameter} by {change_value} {change_unit} would likely escalate current issues.",
                "additional_failures": ["Inspect all related components"],
                "probability_of_failure": "65%",
                "recommended_immediate_action": "Reduce load and schedule immediate inspection"
            }


# Singleton
diagnostic_agent = DiagnosticAgent()
