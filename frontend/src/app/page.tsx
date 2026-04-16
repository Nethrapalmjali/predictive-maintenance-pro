"use client";

import React, { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardOverview from "@/components/DashboardOverview";
import SimulatorPanel from "@/components/SimulatorPanel";
import CSVUploader from "@/components/CSVUploader";
import ReportCard from "@/components/ReportCard";
import SensorCharts from "@/components/SensorCharts";
import LiveFeed from "@/components/LiveFeed";
import Machine3DView from "@/components/Machine3DView";
import AgentChat from "@/components/AgentChat";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import {
  MaintenanceReport,
  simulateAnalysis,
  uploadCSV,
  submitFeedback,
  runWhatIf,
} from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  BarChart2,
  FileText,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

type Page = "dashboard" | "simulate" | "upload" | "live" | "whatif" | "feedback" | "chat" | "analytics";

// Pipeline step indicator
const PIPELINE_STEPS = [
  { label: "Data Interpreter", desc: "Trend extraction" },
  { label: "Diagnostic Agent", desc: "AI reasoning" },
  { label: "Simplifier Agent", desc: "Plain language" },
];

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MaintenanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<"insights" | "charts">("insights");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [liveData, setLiveData] = useState<MaintenanceReport | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customWhatIf, setCustomWhatIf] = useState<{
    parameter: string;
    value: string;
    unit: string;
    result: any;
    isLoading: boolean;
  }>({
    parameter: "temperature",
    value: "",
    unit: "°C",
    result: null,
    isLoading: false,
  });

  const runPipeline = useCallback(async (fetchFn: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    setActiveStep(0);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setActiveStep(1);
      await new Promise((r) => setTimeout(r, 600));
      setActiveStep(2);
      const response = await fetchFn();
      setActiveStep(3);
      await new Promise((r) => setTimeout(r, 400));

      if (response.success && response.report) {
        const report = response.report as MaintenanceReport;
        setReports((prev) => {
          const filtered = prev.filter((r) => r.machine_id !== report.machine_id);
          return [report, ...filtered];
        });
        setSelectedReport(report);
        setCurrentPage("dashboard");
      } else {
        setError(response.error || "Analysis failed. Please try again.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "Failed to connect to the backend. Make sure the API is running on port 8000."
      );
    } finally {
      setIsLoading(false);
      setActiveStep(-1);
    }
  }, []);

  const handleSimulate = useCallback(
    (params: Parameters<typeof simulateAnalysis>[0]) => {
      runPipeline(() => simulateAnalysis(params));
    },
    [runPipeline]
  );

  const handleCSVUpload = useCallback(
    (file: File, meta: Record<string, string>) => {
      runPipeline(() =>
        uploadCSV(file, {
          machine_id: meta.machine_id,
          machine_name: meta.machine_name,
          machine_type: meta.machine_type,
          runtime_hours: meta.runtime_hours ? Number(meta.runtime_hours) : undefined,
          last_maintenance_days: meta.last_maintenance_days
            ? Number(meta.last_maintenance_days)
            : undefined,
        })
      );
    },
    [runPipeline]
  );

  const handleFeedback = useCallback(
    async (type: string) => {
      if (!selectedReport) return;
      await submitFeedback({
        report_id: `${selectedReport.machine_id}-${selectedReport.analysis_timestamp}`,
        machine_id: selectedReport.machine_id,
        action_taken: type,
        feedback_type: type,
      });
      setFeedbackSubmitted(true);
    },
    [selectedReport]
  );

  const handleCustomWhatIf = useCallback(async () => {
    if (!selectedReport) return;
    setCustomWhatIf((prev) => ({ ...prev, isLoading: true, result: null }));
    try {
      const response = await runWhatIf({
        machine_id: selectedReport.machine_id,
        parameter: customWhatIf.parameter,
        change_value: Number(customWhatIf.value) || 0,
        change_unit: customWhatIf.unit,
        current_risk: selectedReport.diagnostic.risk_level,
      });
      if (response.success) {
        setCustomWhatIf((prev) => ({ ...prev, result: response.what_if_result }));
      }
    } catch (err: any) {
      console.error("What-if failed", err);
    } finally {
      setCustomWhatIf((prev) => ({ ...prev, isLoading: false }));
    }
  }, [selectedReport, customWhatIf]);

  // Initial simulation on mount
  React.useEffect(() => {
    handleSimulate({
      scenario: "normal",
      machine_id: "MACH-001",
      machine_name: "CNC Milling Machine",
      machine_type: "CNC Machine",
      num_readings: 20
    });
  }, []);

  // Live monitor simulation
  React.useEffect(() => {
    let interval: any;
    if (isLiveActive) {
      // Simulate fetching live data every 10 seconds
      interval = setInterval(async () => {
        try {
          const response = await simulateAnalysis({
            scenario: "normal", // Live monitor usually shows normal until failure
            machine_id: "LIVE-01",
            machine_name: "Live Machine",
            machine_type: "Industrial Motor",
            num_readings: 20
          });
          if (response.success) {
            setLiveData(response.report || null);
          }
        } catch (e) {
          console.error("Live fetch failed", e);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const rawReadings = selectedReport?.readings || [];

  return (
    <div className="app-layout">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={(p) => { setCurrentPage(p as Page); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="main-content">
        <div className="mobile-header">
            <h1 style={{ fontSize: "1rem", fontWeight: 800 }}>PredictAI</h1>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsSidebarOpen(true)}>
                <CheckCircle size={14} /> Menu
            </button>
        </div>

        {/* ── Pipeline progress bar (when loading) ── */}
        {isLoading && (
          <div className="pipeline-loader">
            <div className="spinner" style={{ flexShrink: 0 }} />
            <div className="pipeline-steps" style={{ margin: 0 }}>
              {PIPELINE_STEPS.map((step, i) => (
                <div key={i} className="pipeline-step">
                  <div
                    className={`step-bubble ${
                      activeStep === i
                        ? "active"
                        : activeStep > i
                        ? "done"
                        : ""
                    }`}
                  >
                    {activeStep > i ? (
                      <CheckCircle size={13} />
                    ) : activeStep === i ? (
                      <div className="spinner" style={{ width: 13, height: 13, borderWidth: 1.5 }} />
                    ) : null}
                    {step.label}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="step-connector">
                      <ChevronRight size={12} color="var(--text-muted)" style={{ margin: "0 auto" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="alert alert-danger animate-fadeIn" style={{ marginBottom: "1.25rem" }}>
            <XCircle size={16} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <strong>Analysis Error:</strong> {error}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setError(null)} style={{ padding: "0.25rem" }}>
              <XCircle size={14} />
            </button>
          </div>
        )}

        {/* ═══════════════ PAGES ═══════════════ */}

        {/* Dashboard */}
        {currentPage === "dashboard" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                Machine Health <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="page-subtitle">
                Real-time AI-powered diagnostics for your industrial equipment
              </p>
            </div>

            <div className={selectedReport ? "dashboard-layout" : ""}>
              {/* Left: machine list */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>Monitored Machines</h2>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage("simulate")}
                  >
                    + Add Analysis
                  </button>
                </div>
                <DashboardOverview
                  reports={reports}
                  onSelectReport={(r) => { setSelectedReport(r); setActiveTab("insights"); setFeedbackSubmitted(false); }}
                  selectedId={selectedReport?.machine_id}
                />
              </div>

              {/* Right: selected report details */}
              {selectedReport && (
                <div className="animate-slideInRight">
                  {/* Report header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <div>
                      <h2 style={{ fontSize: "1.125rem", fontWeight: 800 }}>{selectedReport.machine_name}</h2>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>
                        {selectedReport.machine_id} · {selectedReport.machine_type} ·{" "}
                        {new Date(selectedReport.analysis_timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => runPipeline(() =>
                          simulateAnalysis({
                            scenario: "overheating",
                            machine_id: selectedReport.machine_id,
                            machine_name: selectedReport.machine_name,
                            machine_type: selectedReport.machine_type,
                          })
                        )}
                        title="Re-analyze"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="tab-list" style={{ marginBottom: "1.25rem" }}>
                    <button
                      className={`tab-item ${activeTab === "insights" ? "active" : ""}`}
                      onClick={() => setActiveTab("insights")}
                      id="tab-insights"
                    >
                      <FileText size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                      AI Insights
                    </button>
                    <button
                      className={`tab-item ${activeTab === "charts" ? "active" : ""}`}
                      onClick={() => setActiveTab("charts")}
                      id="tab-charts"
                    >
                      <BarChart2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                      Sensor Charts
                    </button>
                  </div>

                  {activeTab === "insights" && (
                    <>
                      <ReportCard report={selectedReport} />
                      {/* Feedback */}
                      {!feedbackSubmitted ? (
                        <div
                          className="glass-card"
                          style={{ padding: "1.25rem", marginTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Was this diagnosis helpful?</div>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: 2 }}>
                              Your feedback helps improve the AI system
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleFeedback("correct")} id="feedback-correct">
                              <CheckCircle size={14} color="var(--risk-low)" /> Accurate
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleFeedback("partial")} id="feedback-partial">
                              <AlertTriangle size={14} color="var(--risk-medium)" /> Partially
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleFeedback("incorrect")} id="feedback-incorrect">
                              <XCircle size={14} /> Incorrect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-success animate-fadeIn" style={{ marginTop: "1.25rem" }}>
                          <CheckCircle size={16} />
                          Thank you! Your feedback has been recorded.
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "charts" && (
                    <SensorCharts
                      interpretedData={selectedReport.interpreted_data}
                      rawReadings={rawReadings as any}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Simulate */}
        {currentPage === "simulate" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                Run <span className="text-gradient">Simulation</span>
              </h1>
              <p className="page-subtitle">
                Simulate real machine failure scenarios and watch the 3-agent AI pipeline analyze them
              </p>
            </div>
            <SimulatorPanel onSimulate={handleSimulate} isLoading={isLoading} />
          </div>
        )}

        {/* Upload */}
        {currentPage === "upload" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                Upload <span className="text-gradient">CSV Data</span>
              </h1>
              <p className="page-subtitle">
                Upload your machine's sensor data in CSV format for AI-powered analysis
              </p>
            </div>
            <CSVUploader onUpload={handleCSVUpload} isLoading={isLoading} />
          </div>
        )}

        {/* Live Monitor */}
        {currentPage === "live" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                Live <span className="text-gradient">Monitor</span>
              </h1>
              <p className="page-subtitle">
                Real-time streaming sensor data and continuous anomaly detection
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.5rem" }}>
                  <Machine3DView isAnomaly={liveData?.interpreted_data?.anomalies?.length ? liveData.interpreted_data.anomalies.length > 0 : false} />
                  <LiveFeed />
                </div>
                {liveData && (
                    <div className="animate-fadeIn">
                        <div className="page-header" style={{ marginBottom: "1rem" }}>
                            <h2 style={{ fontSize: "1.125rem" }}>Last Auto-Diagnostic: {liveData.machine_name}</h2>
                        </div>
                        <SensorCharts 
                            interpretedData={liveData.interpreted_data}
                            rawReadings={liveData.readings as any}
                        />
                    </div>
                )}
              </div>

              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Activity size={16} color="var(--brand-primary)" /> Stream Control
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <button 
                    className={`btn ${isLiveActive ? "btn-danger" : "btn-primary"}`} 
                    onClick={() => setIsLiveActive(!isLiveActive)}
                    style={{ width: "100%" }}
                  >
                    {isLiveActive ? "Stop Monitioring" : "Start Live Stream"}
                  </button>
                  <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", fontSize: "0.8125rem" }}>
                    <div style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Connection Status</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isLiveActive ? "var(--risk-low)" : "var(--text-muted)", fontWeight: 700 }}>
                       <div style={{ width: 8, height: 8, borderRadius: "50%", background: isLiveActive ? "var(--risk-low)" : "var(--text-muted)" }} />
                       {isLiveActive ? "Syncing..." : "Disconnected"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What-If */}
        {currentPage === "whatif" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                What-If <span className="text-gradient">Simulator</span>
              </h1>
              <p className="page-subtitle">
                Explore how specific parameter changes might affect machine risk levels
              </p>
            </div>

            <div className="whatif-layout">
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Active Analysis Results</h2>
                  {selectedReport?.what_if_scenarios ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {selectedReport.what_if_scenarios.map((s, i) => (
                        <div key={i} className="glass-card-elevated animate-fadeInUp" style={{ padding: "1.5rem", animationDelay: `${i * 100}ms` }}>
                          <div style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ color: "var(--brand-accent)", textTransform: "uppercase" }}>{s.parameter}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 400 }}>increases by</span>
                            <span style={{ color: "var(--risk-medium)" }}>{s.change}</span>
                            <span className={`badge badge-${s.result.new_risk_level.toLowerCase()}`} style={{ marginLeft: "auto" }}>
                              → {s.result.new_risk_level}
                            </span>
                          </div>
                          <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "0.875rem", lineHeight: 1.6 }}>{s.result.scenario_description}</p>
                          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8125rem", background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                            <div>
                              <span style={{ color: "var(--text-muted)" }}>Prob. of Failure: </span>
                              <strong style={{ color: "var(--risk-high)" }}>{s.result.probability_of_failure}</strong>
                            </div>
                            <div>
                              <span style={{ color: "var(--text-muted)" }}>Action: </span>
                              <span style={{ color: "var(--text-secondary)" }}>{s.result.recommended_immediate_action}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center", opacity: 0.6 }}>
                      <AlertTriangle size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                      <p>Run a simulation on the dashboard first to generate AI-suggested scenarios.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar form for custom what-if */}
              <div className="glass-card" style={{ padding: "1.5rem", position: "sticky", top: "2rem" }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TrendingUp size={16} color="var(--brand-primary)" /> Custom Analysis
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Parameter</label>
                    <select 
                        className="input" 
                        value={customWhatIf.parameter}
                        onChange={(e) => setCustomWhatIf(prev => ({ ...prev, parameter: e.target.value }))}
                    >
                      <option value="temperature">Temperature</option>
                      <option value="vibration">Vibration</option>
                      <option value="pressure">Pressure</option>
                      <option value="rpm">RPM</option>
                      <option value="current">Current</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Increase Value</label>
                    <input 
                        type="number" 
                        className="input" 
                        placeholder="e.g. 15" 
                        value={customWhatIf.value}
                        onChange={(e) => setCustomWhatIf(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input 
                        type="text" 
                        className="input" 
                        placeholder="e.g. °C or %" 
                        value={customWhatIf.unit}
                        onChange={(e) => setCustomWhatIf(prev => ({ ...prev, unit: e.target.value }))}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: "0.5rem" }}
                    onClick={handleCustomWhatIf}
                    disabled={customWhatIf.isLoading || !selectedReport}
                  >
                    {customWhatIf.isLoading ? <div className="spinner" /> : "Predict Impact"}
                  </button>
                  
                  {customWhatIf.result && (
                    <div className="animate-fadeIn" style={{ marginTop: "1rem", padding: "1rem", background: "rgba(99,102,241,0.05)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.8125rem" }}>Prediction</span>
                            <span className={`badge badge-${customWhatIf.result.new_risk_level.toLowerCase()}`}>{customWhatIf.result.new_risk_level}</span>
                         </div>
                         <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                            {customWhatIf.result.scenario_description}
                         </p>
                    </div>
                  )}

                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
                    Uses the Diagnostic Agent to reason about causal effects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Page */}
        {currentPage === "analytics" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                Industrial <span className="text-gradient">Analytics</span>
              </h1>
              <p className="page-subtitle">
                Long-term health trends, failure distribution, and AI-driven efficiency metrics
              </p>
            </div>
            <AnalyticsDashboard />
          </div>
        )}

        {/* Chat page */}
        {currentPage === "chat" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                Agent <span className="text-gradient">Command Center</span>
              </h1>
              <p className="page-subtitle">
                Interact with the 3-agent pipeline for detailed diagnostic reasoning
              </p>
            </div>
            <AgentChat />
          </div>
        )}

        {/* Feedback page */}
        {currentPage === "feedback" && (
          <div>
            <div className="page-header">
              <h1 className="page-title">
                Operator <span className="text-gradient">Feedback</span>
              </h1>
              <p className="page-subtitle">
                Help the AI improve by telling us when diagnoses are right or wrong
              </p>
            </div>
            <div className="alert alert-info" style={{ marginBottom: "1.5rem" }}>
              <Activity size={16} />
              Feedback is stored and used to improve diagnostic accuracy over time.
            </div>
            {selectedReport ? (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Current Report: {selectedReport.machine_name}</div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem" }}>{selectedReport.diagnostic.issue_summary}</p>
                {!feedbackSubmitted ? (
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button className="btn btn-secondary" onClick={() => { handleFeedback("correct"); setCurrentPage("dashboard"); }} id="fb-correct">
                      <CheckCircle size={16} color="var(--risk-low)" /> Diagnosis is Correct
                    </button>
                    <button className="btn btn-secondary" onClick={() => { handleFeedback("partial"); setCurrentPage("dashboard"); }} id="fb-partial">
                      <AlertTriangle size={16} color="var(--risk-medium)" /> Partially Correct
                    </button>
                    <button className="btn btn-danger" onClick={() => { handleFeedback("incorrect"); setCurrentPage("dashboard"); }} id="fb-incorrect">
                      <XCircle size={16} /> Incorrect
                    </button>
                  </div>
                ) : (
                  <div className="alert alert-success">
                    <CheckCircle size={16} /> Feedback submitted — thank you!
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-warning">
                <AlertTriangle size={16} /> No report selected. Run a simulation first.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
