"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Activity, Zap, Thermometer, TrendingUp, AlertTriangle } from "lucide-react";

const mockHistoricalData = [
  { time: "08:00", temperature: 45, vibration: 1.2, anomaly: 0.1 },
  { time: "10:00", temperature: 48, vibration: 1.3, anomaly: 0.15 },
  { time: "12:00", temperature: 55, vibration: 1.8, anomaly: 0.3 },
  { time: "14:00", temperature: 72, vibration: 3.2, anomaly: 0.8 },
  { time: "16:00", temperature: 68, vibration: 2.5, anomaly: 0.6 },
  { time: "18:00", temperature: 62, vibration: 2.1, anomaly: 0.4 },
  { time: "20:00", temperature: 58, vibration: 1.9, anomaly: 0.3 },
];

export default function AnalyticsDashboard() {
  return (
    <div className="animate-fadeIn">
      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <MetricCard title="System Uptime" value="99.8%" icon={<Zap size={20} />} trend="+0.2%" />
        <MetricCard title="Avg. Temperature" value="62.4°C" icon={<Thermometer size={20} />} trend="+4.1%" isWarning />
        <MetricCard title="Prediction Accuracy" value="94.2%" icon={<TrendingUp size={20} />} trend="+1.5%" />
        <MetricCard title="Active Anomalies" value="3" icon={<AlertTriangle size={20} />} trend="Stable" isCritical />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Main Health Trend */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
           <h3 style={{ fontSize: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
             <Activity size={18} color="var(--brand-primary)" /> Historical Health & Vibration Correlation
           </h3>
           <div style={{ height: 350, width: "100%" }}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={mockHistoricalData}>
                 <defs>
                   <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--risk-high)" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="var(--risk-high)" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                    contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}
                    itemStyle={{ fontSize: "0.8125rem" }}
                 />
                 <Legend verticalAlign="top" height={36}/>
                 <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="var(--risk-high)" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} />
                 <Area type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="var(--brand-primary)" fillOpacity={1} fill="url(#colorVib)" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Anomaly Distribution */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
           <h3 style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>Failure Mode Distribution</h3>
           <div style={{ height: 350, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={[
                     { name: "Bearing", count: 45 },
                     { name: "Thermal", count: 32 },
                     { name: "Pressure", count: 12 },
                     { name: "Electrical", count: 11 },
                 ]} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={80} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}
                        cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    />
                    <Bar dataKey="count" fill="var(--brand-secondary)" radius={[0, 4, 4, 0]} barSize={24} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px" }}>
              <p>Top Failure Mode: <strong>Bearing Fatigue</strong></p>
              <p style={{ marginTop: "0.5rem" }}>AI Suggestion: Increase lubrication cycle frequency for CNC-Alpha units.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, isWarning = false, isCritical = false }: any) {
  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{ width: 40, height: 40, background: isCritical ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: isCritical ? "var(--risk-high)" : "var(--brand-primary)" }}>
             {icon}
          </div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: trend.startsWith("+") ? "var(--risk-low)" : "var(--text-muted)" }}>{trend}</div>
       </div>
       <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
       <div style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.25rem", color: isWarning ? "var(--risk-medium)" : isCritical ? "var(--risk-high)" : "var(--text-primary)" }}>{value}</div>
    </div>
  );
}
