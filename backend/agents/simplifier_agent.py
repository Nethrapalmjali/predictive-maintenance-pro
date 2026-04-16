"""
Simplifier Agent — Step 3 of the 3-agent pipeline.
Converts technical diagnostic output into ultra-plain language for operators.
"""
import json
import os
from groq import Groq
from models.schemas import DiagnosticResult, SimplifiedInsight, RiskLevel
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

RISK_ICONS = {
    RiskLevel.LOW: "✅",
    RiskLevel.MEDIUM: "⚠️",
    RiskLevel.HIGH: "🔴",
    RiskLevel.CRITICAL: "🚨"
}

URGENCY_TAGS = {
    RiskLevel.LOW: "Monitor — No Immediate Action",
    RiskLevel.MEDIUM: "Schedule Maintenance Soon",
    RiskLevel.HIGH: "Take Action Within 24 Hours",
    RiskLevel.CRITICAL: "STOP MACHINE — Immediate Action Required"
}

SIMPLIFIER_SYSTEM_PROMPT = """You are a maintenance communication specialist who translates complex engineering reports into crystal-clear language that any factory worker or plant operator can understand — no technical background required.

Your writing style:
- Use everyday words, no jargon
- Short, punchy sentences
- Like you're talking to someone on the factory floor
- Be direct and reassuring, not scary
- Focus on what they need to DO, not the technical details

Return ONLY valid JSON. No markdown."""


class SimplifierAgent:
    """
    Agent 3: Translates technical diagnostics into plain operator-friendly language.
    Final step in the 3-agent pipeline.
    """

    def __init__(self):
        self.model = "llama-3.3-70b-versatile"

    def simplify(self, diagnostic: DiagnosticResult, machine_name: str) -> SimplifiedInsight:
        """Convert technical diagnostic to simple operator-facing insight."""
        prompt = self._build_prompt(diagnostic, machine_name)

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SIMPLIFIER_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content.strip()

            data = json.loads(raw)
            return SimplifiedInsight(
                headline=data.get("headline", f"{machine_name} needs attention"),
                plain_english_summary=data.get("plain_english_summary", diagnostic.issue_summary),
                what_is_happening=data.get("what_is_happening", diagnostic.issue_summary),
                why_it_matters=data.get("why_it_matters", diagnostic.future_impact),
                what_to_do=data.get("what_to_do", diagnostic.recommended_actions),
                urgency_tag=URGENCY_TAGS.get(diagnostic.risk_level, "Review Required"),
                icon=RISK_ICONS.get(diagnostic.risk_level, "⚠️"),
                next_steps=data.get("next_steps", [diagnostic.recommended_actions[0]] if diagnostic.recommended_actions else [])
            )

        except Exception as e:
            print(f"[SimplifierAgent] Error: {e}")
            return self._fallback_simplify(diagnostic, machine_name)

    def _build_prompt(self, diagnostic: DiagnosticResult, machine_name: str) -> str:
        return f"""{SIMPLIFIER_SYSTEM_PROMPT}

=== TECHNICAL DIAGNOSTIC REPORT ===
Machine: {machine_name}
Issue: {diagnostic.issue_summary}
Root Cause: {diagnostic.root_cause}
Risk Level: {diagnostic.risk_level.value}
Future Impact: {diagnostic.future_impact}
Recommended Actions: {json.dumps(diagnostic.recommended_actions)}
Time to Failure: {diagnostic.estimated_time_to_failure or 'Not determined'}

=== YOUR TASK ===
Translate this into simple language for a factory floor operator. Return this JSON:
{{
  "headline": "One catchy sentence headline (max 10 words) that captures the main issue",
  "plain_english_summary": "2-3 sentences explaining what's wrong in simple terms",
  "what_is_happening": "1 sentence: what the machine is doing wrong right now",
  "why_it_matters": "1 sentence: what could go wrong if ignored",
  "what_to_do": ["Action 1 in plain words", "Action 2 in plain words", "Action 3 in plain words"],
  "next_steps": ["Specific first step", "Specific second step"]
}}

Use simple vocabulary. Imagine explaining this to someone who has never used a computer."""

    def _fallback_simplify(self, diagnostic: DiagnosticResult, machine_name: str) -> SimplifiedInsight:
        """Simple rule-based fallback for simplification."""
        risk_headlines = {
            RiskLevel.LOW: f"{machine_name} is running fine — minor check needed",
            RiskLevel.MEDIUM: f"{machine_name} needs attention soon",
            RiskLevel.HIGH: f"{machine_name} has a serious problem — act today",
            RiskLevel.CRITICAL: f"STOP! {machine_name} may break down very soon"
        }

        return SimplifiedInsight(
            headline=risk_headlines.get(diagnostic.risk_level, f"{machine_name} needs review"),
            plain_english_summary=f"The machine has been flagged with {len(diagnostic.affected_components)} issues that need your attention.",
            what_is_happening=diagnostic.issue_summary[:200],
            why_it_matters=diagnostic.future_impact[:200],
            what_to_do=diagnostic.recommended_actions[:3],
            urgency_tag=URGENCY_TAGS.get(diagnostic.risk_level, "Review Required"),
            icon=RISK_ICONS.get(diagnostic.risk_level, "⚠️"),
            next_steps=[diagnostic.recommended_actions[0]] if diagnostic.recommended_actions else []
        )

    def simplify_chat(self, message: str, machine_id: str, history: list = None) -> str:
        """Handle conversational queries about machine state with history."""
        history_str = ""
        if history:
            history_str = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in history])
            history_str = f"\n=== CONVERSATION HISTORY ===\n{history_str}\n"

        prompt = f"""You are the Simplifier Agent. An operator is asking you a question about machine {machine_id}.
        {history_str}
        Operator Question: "{message}"
        
        Keep your answer helpful, concise, and in plain language. Use the context of industrial maintenance.
        If they ask about failure risk, emphasize early detection.
        If they ask for technical details, provide a simplified explanation.
        """
        
        try:
            messages = [{"role": "system", "content": SIMPLIFIER_SYSTEM_PROMPT}]
            if history:
                for m in history:
                    messages.append({"role": m["role"], "content": m["content"]})
            messages.append({"role": "user", "content": prompt})

            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=512
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"I'm sorry, I'm having trouble processing that right now. In general, machine {machine_id} should be monitored for vibration and temperature stable trends."



# Singleton
simplifier_agent = SimplifierAgent()
