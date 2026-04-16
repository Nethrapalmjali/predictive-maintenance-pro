"use client";

import React, { useState } from "react";
import { Play, Cpu, Settings } from "lucide-react";

interface SimulatorPanelProps {
  onSimulate: (params: {
    scenario: string;
    machine_id: string;
    machine_name: string;
    machine_type: string;
    num_readings: number;
  }) => void;
  isLoading: boolean;
}

const SCENARIOS = [
  {
    id: "overheating",
    label: "🌡️ Overheating",
    description: "Rising temperature with correlated vibration and current draw increase",
    risk: "High",
    riskClass: "badge-high",
  },
  {
    id: "bearing_wear",
    label: "⚙️ Bearing Wear",
    description: "Classic bearing degradation — exponential vibration growth over time",
    risk: "High",
    riskClass: "badge-high",
  },
  {
    id: "critical",
    label: "🚨 Critical Failure",
    description: "Multi-parameter failure — machine on the verge of breakdown",
    risk: "Critical",
    riskClass: "badge-critical",
  },
  {
    id: "pressure_fault",
    label: "💧 Pressure Fault",
    description: "Hydraulic pressure oscillations building towards dangerous levels",
    risk: "Medium",
    riskClass: "badge-medium",
  },
  {
    id: "normal",
    label: "✅ Normal Operation",
    description: "Healthy machine — all parameters stable and within safe limits",
    risk: "Low",
    riskClass: "badge-low",
  },
];

const MACHINES = [
  { id: "MACH-001", name: "CNC Milling Machine", type: "CNC Machine" },
  { id: "MACH-002", name: "Hydraulic Press #3", type: "Hydraulic Press" },
  { id: "MACH-003", name: "Main Compressor", type: "Compressor" },
  { id: "MACH-004", name: "Drive Motor Unit A", type: "Industrial Motor" },
];

export default function SimulatorPanel({ onSimulate, isLoading }: SimulatorPanelProps) {
  const [selectedScenario, setSelectedScenario] = useState("overheating");
  const [selectedMachine, setSelectedMachine] = useState(MACHINES[0]);
  const [numReadings, setNumReadings] = useState(20);

  const handleRun = () => {
    onSimulate({
      scenario: selectedScenario,
      machine_id: selectedMachine.id,
      machine_name: selectedMachine.name,
      machine_type: selectedMachine.type,
      num_readings: numReadings,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Scenario selector */}
      <div>
        <div style={{ fontWeight: 700, marginBottom: "0.875rem", fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Cpu size={16} color="var(--brand-primary)" /> Select Failure Scenario
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              id={`scenario-${s.id}`}
              onClick={() => setSelectedScenario(s.id)}
              style={{
                padding: "1rem 1.125rem",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${selectedScenario === s.id ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                background: selectedScenario === s.id ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>{s.label}</span>
                <span className={`badge ${s.riskClass}`} style={{ fontSize: "0.65rem" }}>{s.risk}</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Machine + Settings */}
      <div className="glass-card" style={{ padding: "1.25rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Settings size={16} color="var(--text-secondary)" /> Simulation Settings
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="sim-machine">Machine</label>
            <select
              id="sim-machine"
              className="input"
              value={selectedMachine.id}
              onChange={(e) => {
                const m = MACHINES.find((m) => m.id === e.target.value);
                if (m) setSelectedMachine(m);
              }}
            >
              {MACHINES.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sim-readings">Number of Readings</label>
            <input
              id="sim-readings"
              className="input"
              type="number"
              min={10}
              max={50}
              value={numReadings}
              onChange={(e) => setNumReadings(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Run button */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          id="run-simulation-btn"
          className="btn btn-primary btn-lg"
          onClick={handleRun}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner" />
              Running AI Pipeline...
            </>
          ) : (
            <>
              <Play size={18} />
              Run Simulation
            </>
          )}
        </button>
        {!isLoading && (
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            3-agent analysis will take ~5–15s
          </div>
        )}
      </div>
    </div>
  );
}
