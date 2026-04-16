"use client";

import React from "react";
import { MaintenanceReport } from "@/lib/api";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface DashboardOverviewProps {
  reports: MaintenanceReport[];
  onSelectReport: (report: MaintenanceReport) => void;
  selectedId?: string;
}

const RISK_ORDER: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const RISK_COLORS: Record<string, string> = {
  Low: "var(--risk-low)",
  Medium: "var(--risk-medium)",
  High: "var(--risk-high)",
  Critical: "var(--risk-critical)",
};

export default function DashboardOverview({
  reports,
  onSelectReport,
  selectedId,
}: DashboardOverviewProps) {
  const sorted = [...reports].sort(
    (a, b) =>
      (RISK_ORDER[b.diagnostic.risk_level] || 0) -
      (RISK_ORDER[a.diagnostic.risk_level] || 0)
  );

  const criticalCount = reports.filter((r) => r.diagnostic.risk_level === "Critical").length;
  const highCount = reports.filter((r) => r.diagnostic.risk_level === "High").length;
  const medCount = reports.filter((r) => r.diagnostic.risk_level === "Medium").length;
  const lowCount = reports.filter((r) => r.diagnostic.risk_level === "Low").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stats */}
      <div className="stats-grid stagger">
        {[
          {
            label: "Total Analyses",
            value: reports.length,
            icon: <Activity size={28} />,
            color: "var(--brand-primary)",
          },
          {
            label: "Critical",
            value: criticalCount,
            icon: <AlertTriangle size={28} />,
            color: "var(--risk-critical)",
          },
          {
            label: "High Risk",
            value: highCount,
            icon: <AlertTriangle size={28} />,
            color: "var(--risk-high)",
          },
          {
            label: "Healthy",
            value: lowCount,
            icon: <CheckCircle size={28} />,
            color: "var(--risk-low)",
          },
        ].map((stat) => (
          <div key={stat.label} className="stat-card animate-fadeInUp">
            <div
              className="stat-icon"
              style={{ color: stat.color }}
            >
              {stat.icon}
            </div>
            <div
              className="stat-value"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Machine list */}
      {sorted.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <Activity
            size={48}
            style={{ margin: "0 auto 1rem", opacity: 0.25 }}
          />
          <div style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.375rem" }}>
            No analyses yet
          </div>
          <div style={{ fontSize: "0.875rem" }}>
            Run a simulation or upload a CSV to get started
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {sorted.map((report) => {
            const riskColor = RISK_COLORS[report.diagnostic.risk_level];
            const isSelected = report.machine_id === selectedId;

            return (
              <button
                key={`${report.machine_id}-${report.analysis_timestamp}`}
                id={`machine-card-${report.machine_id}`}
                onClick={() => onSelectReport(report)}
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isSelected ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                  background: isSelected
                    ? "rgba(99,102,241,0.1)"
                    : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                {/* Risk dot */}
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: riskColor,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${riskColor}60`,
                  }}
                />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {report.machine_name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {report.simplified_insight.headline}
                  </div>
                </div>

                {/* Right side */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "0.25rem",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className={`badge badge-${report.diagnostic.risk_level.toLowerCase()}`}
                  >
                    {report.diagnostic.risk_level}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Clock size={10} />
                    {new Date(report.analysis_timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--text-accent)",
                      fontWeight: 600,
                    }}
                  >
                    {report.diagnostic.confidence_score}% conf.
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
