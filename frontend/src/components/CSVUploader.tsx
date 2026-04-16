"use client";

import React, { useState, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, Download } from "lucide-react";

interface CSVUploaderProps {
  onUpload: (file: File, meta: Record<string, string>) => void;
  isLoading: boolean;
}

export default function CSVUploader({ onUpload, isLoading }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [meta, setMeta] = useState({
    machine_id: "CSV-001",
    machine_name: "Uploaded Machine",
    machine_type: "Industrial Motor",
    runtime_hours: "",
    last_maintenance_days: "",
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) setFile(dropped);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = () => {
    if (!file) return;
    onUpload(file, meta as Record<string, string>);
  };

  const downloadSample = () => {
    const url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1") + "/sample-csv";
    window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Dropzone */}
      <div
        className={`dropzone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("csv-file-input")?.click()}
        id="csv-dropzone"
      >
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleFileInput}
        />
        {file ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <FileText size={28} color="var(--brand-primary)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{file.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                style={{ marginLeft: "0.5rem" }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="badge badge-low" style={{ margin: "0 auto" }}>Ready to analyze</div>
          </div>
        ) : (
          <div>
            <Upload size={36} color="var(--brand-primary)" style={{ margin: "0 auto 1rem", opacity: 0.7 }} />
            <div style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.375rem" }}>
              Drop your CSV file here
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
              or click to browse — supports sensor data CSV files
            </div>
            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); downloadSample(); }}>
              <Download size={14} /> Download Sample CSV
            </button>
          </div>
        )}
      </div>

      {/* Expected columns info */}
      <div className="alert alert-info" style={{ fontSize: "0.8125rem" }}>
        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Expected columns:</strong>{" "}
          <span className="mono" style={{ fontSize: "0.75rem" }}>
            timestamp, temperature, vibration, pressure, rpm, current, voltage, oil_level, humidity
          </span>
          <br />All columns are optional — use whichever your machine provides.
        </div>
      </div>

      {/* Machine metadata */}
      <div className="glass-card" style={{ padding: "1.25rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.9375rem" }}>
          Machine Information
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem" }}>
          {[
            { key: "machine_id", label: "Machine ID", placeholder: "CSV-001" },
            { key: "machine_name", label: "Machine Name", placeholder: "My Machine" },
          ].map((f) => (
            <div key={f.key} className="form-group">
              <label className="form-label" htmlFor={`meta-${f.key}`}>{f.label}</label>
              <input
                id={`meta-${f.key}`}
                className="input"
                placeholder={f.placeholder}
                value={(meta as any)[f.key]}
                onChange={(e) => setMeta((m) => ({ ...m, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label" htmlFor="meta-machine-type">Machine Type</label>
            <select
              id="meta-machine-type"
              className="input"
              value={meta.machine_type}
              onChange={(e) => setMeta((m) => ({ ...m, machine_type: e.target.value }))}
            >
              {["Industrial Motor", "CNC Machine", "Hydraulic Press", "Compressor", "Pump", "Conveyor"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="meta-runtime">Runtime Hours</label>
            <input
              id="meta-runtime"
              className="input"
              type="number"
              placeholder="e.g. 4850"
              value={meta.runtime_hours}
              onChange={(e) => setMeta((m) => ({ ...m, runtime_hours: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="meta-maintenance">Days Since Last Maintenance</label>
            <input
              id="meta-maintenance"
              className="input"
              type="number"
              placeholder="e.g. 45"
              value={meta.last_maintenance_days}
              onChange={(e) => setMeta((m) => ({ ...m, last_maintenance_days: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={handleSubmit}
        disabled={!file || isLoading}
        id="upload-analyze-btn"
        style={{ alignSelf: "flex-start" }}
      >
        {isLoading ? (
          <>
            <div className="spinner" />
            Analyzing with AI Pipeline...
          </>
        ) : (
          <>
            <Upload size={18} />
            Analyze CSV
          </>
        )}
      </button>
    </div>
  );
}
