"use client";

import React from "react";
import { MaintenanceReport } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  TrendingUp,
  Shield,
  DollarSign,
  ChevronRight,
} from "lucide-react";

interface ReportCardProps {
  report: MaintenanceReport;
}

const RISK_COLORS = {
  Low: "var(--risk-low)",
  Medium: "var(--risk-medium)",
  High: "var(--risk-high)",
  Critical: "var(--risk-critical)",
};

const RISK_BG = {
  Low: "rgba(16, 185, 129, 0.08)",
  Medium: "rgba(245, 158, 11, 0.08)",
  High: "rgba(239, 68, 68, 0.08)",
  Critical: "rgba(220, 38, 38, 0.12)",
};

export default function ReportCard({ report }: ReportCardProps) {
  const { diagnostic, simplified_insight, interpreted_data, what_if_scenarios } = report;
  const risk = diagnostic.risk_level as keyof typeof RISK_COLORS;
  const riskColor = RISK_COLORS[risk];
  const riskBg = RISK_BG[risk];

  const confidenceColor =
    diagnostic.confidence_score >= 75
      ? "var(--risk-low)"
      : diagnostic.confidence_score >= 50
      ? "var(--risk-medium)"
      : "var(--risk-high)";

  return (
    <div className="animate-fadeInUp" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Simplified Insight Hero ── */}
      <div
        className="glass-card-elevated"
        style={{
          padding: "1.75rem",
          borderLeft: `4px solid ${riskColor}`,
          background: riskBg,
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ fontSize: "2.5rem", lineHeight: 1, flexShrink: 0 }}>
            {simplified_insight.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <span className={`badge badge-${risk.toLowerCase()}`}>{risk} Risk</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontWeight: 600 }}>
                {simplified_insight.urgency_tag}
              </span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem", lineHeight: 1.3 }}>
              {simplified_insight.headline}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              {simplified_insight.plain_english_summary}
            </p>
          </div>
        </div>

        {/* Confidence + Time to failure */}
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              AI Confidence
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.375rem" }}>
              <div style={{ width: 120, height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${diagnostic.confidence_score}%`, height: "100%", background: confidenceColor, borderRadius: 3, transition: "width 0.8s ease" }} />
              </div>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: confidenceColor }}>
                {diagnostic.confidence_score}%
              </span>
            </div>
          </div>
          {diagnostic.estimated_time_to_failure && (
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Est. Time to Failure
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.375rem", color: riskColor, fontWeight: 700 }}>
                <Clock size={14} />
                {diagnostic.estimated_time_to_failure}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Three-column grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>

        {/* What is Happening */}
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <div style={{ padding: "0.375rem", background: "rgba(6,182,212,0.15)", borderRadius: "0.5rem" }}>
              <Target size={16} color="var(--brand-accent)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>What's Happening</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.7 }}>
            {simplified_insight.what_is_happening}
          </p>
        </div>

        {/* Why it matters */}
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <div style={{ padding: "0.375rem", background: "rgba(245,158,11,0.15)", borderRadius: "0.5rem" }}>
              <AlertTriangle size={16} color="var(--risk-medium)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Why It Matters</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.7 }}>
            {simplified_insight.why_it_matters}
          </p>
        </div>

        {/* What to Do */}
        <div className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <div style={{ padding: "0.375rem", background: "rgba(16,185,129,0.15)", borderRadius: "0.5rem" }}>
              <Lightbulb size={16} color="var(--risk-low)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>What To Do</span>
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none", marginBottom: simplified_insight.next_steps?.length ? "1rem" : 0 }}>
            {simplified_insight.what_to_do.map((action, i) => (
              <li key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.6875rem", fontWeight: 800, color: "var(--risk-low)", marginTop: 1 }}>
                  {i + 1}
                </div>
                {action}
              </li>
            ))}
          </ul>
          
          {simplified_insight.next_steps?.length ? (
            <div style={{ padding: "0.75rem", background: "rgba(99,102,241,0.08)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "var(--brand-primary)", marginBottom: "0.5rem" }}>Immediate Next Steps</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                 {simplified_insight.next_steps.map((step, i) => (
                   <div key={i} style={{ fontSize: "0.8125rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <ChevronRight size={10} color="var(--brand-primary)" /> {step}
                   </div>
                 ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Technical Diagnostic ── */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Shield size={16} color="var(--brand-primary)" /> Technical Diagnostic
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Issue Summary</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{diagnostic.issue_summary}</p>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Root Cause</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{diagnostic.root_cause}</p>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Future Impact</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{diagnostic.future_impact}</p>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Affected Components</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {diagnostic.affected_components.map((c, i) => (
                <span key={i} style={{ padding: "0.25rem 0.625rem", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "var(--radius-full)", fontSize: "0.75rem", color: "var(--text-accent)", fontWeight: 600 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {diagnostic.technical_explanation && (
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Detailed Analysis</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic" }}>
              "{diagnostic.technical_explanation}"
            </p>
          </div>
        )}
      </div>

      {/* ── Recommended Actions ── */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle size={16} color="var(--risk-low)" /> Recommended Actions
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {diagnostic.recommended_actions.map((action, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.875rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "rgba(239,68,68,0.2)" : i === 1 ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 800, color: i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#10b981" }}>
                {i + 1}
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, flex: 1 }}>{action}</span>
              <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Cost Estimate ── */}
      {diagnostic.cost_estimate && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={16} color="var(--risk-medium)" /> Financial Impact Analysis
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <CostBox
              title="If Ignored"
              items={[
                ["Failure Probability", diagnostic.cost_estimate.scenario_if_ignored.failure_probability],
                ["Downtime", `${diagnostic.cost_estimate.scenario_if_ignored.downtime_hours}h`],
                ["Total Cost", diagnostic.cost_estimate.scenario_if_ignored.total_cost],
              ]}
              color="var(--risk-high)"
            />
            <CostBox
              title="If Maintained Now"
              items={[
                ["Downtime", `${diagnostic.cost_estimate.scenario_if_maintained.downtime_hours}h`],
                ["Repair Cost", diagnostic.cost_estimate.scenario_if_maintained.repair_cost],
                ["Total Cost", diagnostic.cost_estimate.scenario_if_maintained.total_cost],
              ]}
              color="var(--risk-low)"
            />
            <CostBox
              title="Savings Potential"
              items={[
                ["You Save", diagnostic.cost_estimate.financial_summary.potential_savings],
                ["ROI", diagnostic.cost_estimate.financial_summary.roi_of_maintenance],
                ["Verdict", "Act Now ✓"],
              ]}
              color="var(--brand-primary)"
            />
          </div>
        </div>
      )}

      {/* ── What-If Scenarios ── */}
      {what_if_scenarios && what_if_scenarios.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={16} color="var(--brand-accent)" /> What-If Scenarios
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {what_if_scenarios.map((scenario, i) => (
              <div key={i} style={{ padding: "1rem", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand-accent)" }}>{scenario.parameter}</span>
                  <span style={{ color: "var(--text-muted)" }}>changes by</span>
                  <span style={{ color: "var(--risk-medium)" }}>{scenario.change}</span>
                  <span style={{ marginLeft: "auto" }}>
                    <span className={`badge badge-${scenario.result.new_risk_level.toLowerCase()}`}>{scenario.result.new_risk_level}</span>
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {scenario.result.scenario_description}
                </p>
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--risk-medium)", fontWeight: 600 }}>
                  Failure probability: {scenario.result.probability_of_failure} →{" "}
                  <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                    {scenario.result.recommended_immediate_action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CostBox({ title, items, color }: { title: string; items: [string, string][]; color: string }) {
  return (
    <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", border: `1px solid ${color}30` }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color, marginBottom: "0.75rem" }}>
        {title}
      </div>
      {items.map(([label, val], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{label}</span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: i === items.length - 1 ? color : "var(--text-primary)" }}>{val}</span>
        </div>
      ))}
    </div>
  );
}
