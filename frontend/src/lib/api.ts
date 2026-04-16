/**
 * API client for the Predictive Maintenance backend.
 */
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});


export interface SensorReading {
  timestamp?: string;
  temperature?: number;
  vibration?: number;
  pressure?: number;
  rpm?: number;
  current?: number;
  voltage?: number;
  oil_level?: number;
  humidity?: number;
}

export interface MachineData {
  machine_id: string;
  machine_name: string;
  machine_type: string;
  readings: SensorReading[];
  runtime_hours?: number;
  last_maintenance_days?: number;
}

export interface TrendData {
  parameter: string;
  trend: string;
  direction: string;
  rate_of_change: number;
  current_value: number;
  threshold_breach: boolean;
  severity: string;
}

export interface InterpretedData {
  machine_id: string;
  trends: TrendData[];
  anomalies: string[];
  normal_parameters: string[];
  summary: string;
  anomaly_score: number;
}

export interface DiagnosticResult {
  issue_summary: string;
  root_cause: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  future_impact: string;
  recommended_actions: string[];
  confidence_score: number;
  affected_components: string[];
  technical_explanation?: string;
  estimated_time_to_failure?: string;
  cost_estimate?: CostEstimate;
}

export interface CostEstimate {
  scenario_if_ignored: {
    failure_probability: string;
    downtime_hours: number;
    downtime_cost: string;
    repair_cost: string;
    spare_parts_cost: string;
    total_cost: string;
  };
  scenario_if_maintained: {
    downtime_hours: number;
    downtime_cost: string;
    repair_cost: string;
    total_cost: string;
  };
  financial_summary: {
    expected_risk_exposure: string;
    cost_of_action_now: string;
    potential_savings: string;
    roi_of_maintenance: string;
    recommendation: string;
  };
}

export interface SimplifiedInsight {
  headline: string;
  plain_english_summary: string;
  what_is_happening: string;
  why_it_matters: string;
  what_to_do: string[];
  next_steps?: string[];
  urgency_tag: string;
  icon: string;
}

export interface WhatIfScenario {
  parameter: string;
  change: string;
  result: {
    new_risk_level: string;
    scenario_description: string;
    additional_failures: string[];
    probability_of_failure: string;
    recommended_immediate_action: string;
  };
}

export interface MaintenanceReport {
  machine_id: string;
  machine_name: string;
  machine_type: string;
  analysis_timestamp: string;
  readings: SensorReading[];
  interpreted_data: InterpretedData;
  diagnostic: DiagnosticResult;
  simplified_insight: SimplifiedInsight;
  what_if_scenarios?: WhatIfScenario[];
}

export interface AnalysisResponse {
  success: boolean;
  report?: MaintenanceReport;
  error?: string;
  processing_time_ms?: number;
}

export interface SimulateRequest {
  machine_id?: string;
  machine_name?: string;
  machine_type?: string;
  scenario: string;
  num_readings?: number;
}

// ─── API Methods ────────────────────────────────────────────────────────────

export async function analyzeMachine(
  machineData: MachineData
): Promise<AnalysisResponse> {
  const { data } = await apiClient.post<AnalysisResponse>("/analyze", {
    machine_data: machineData,
    include_what_if: true,
    include_cost_estimate: true,
  });
  return data;
}

export async function simulateAnalysis(
  req: SimulateRequest
): Promise<AnalysisResponse> {
  const { data } = await apiClient.post<AnalysisResponse>("/simulate", req);
  return data;
}

export async function uploadCSV(
  file: File,
  meta: {
    machine_id?: string;
    machine_name?: string;
    machine_type?: string;
    runtime_hours?: number;
    last_maintenance_days?: number;
  }
): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);
  const params = new URLSearchParams();
  if (meta.machine_id) params.append("machine_id", meta.machine_id);
  if (meta.machine_name) params.append("machine_name", meta.machine_name);
  if (meta.machine_type) params.append("machine_type", meta.machine_type);
  if (meta.runtime_hours)
    params.append("runtime_hours", meta.runtime_hours.toString());
  if (meta.last_maintenance_days)
    params.append(
      "last_maintenance_days",
      meta.last_maintenance_days.toString()
    );

  const { data } = await apiClient.post<AnalysisResponse>(
    `/upload-csv?${params.toString()}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function getScenarios(): Promise<{
  scenarios: string[];
  descriptions: Record<string, string>;
}> {
  const { data } = await apiClient.get("/scenarios");
  return data;
}

export async function submitFeedback(payload: {
  report_id: string;
  machine_id: string;
  action_taken: string;
  feedback_type: string;
  notes?: string;
}) {
  const { data } = await apiClient.post("/feedback", payload);
  return data;
}

export async function healthCheck() {
  const { data } = await apiClient.get("/health");
  return data;
}

export async function runWhatIf(req: {
  machine_id: string;
  parameter: string;
  change_value: number;
  change_unit: string;
  current_risk: string;
}): Promise<any> {
  const { data } = await apiClient.post("/what-if", req);
  return data;
}

/**
 * Get the WebSocket URL for real-time telemetry
 */
export function getWebSocketUrl(machineId: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname === "localhost" ? "localhost:8000" : window.location.host;
  return `${protocol}//${host}/ws/stream/${machineId}`;
}

export default apiClient;
