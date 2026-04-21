"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { InterpretedData, TrendData } from "@/lib/api";

interface SensorChartsProps {
  interpretedData: InterpretedData;
  rawReadings: Record<string, number | string | undefined>[];
}

const PARAM_CONFIG: Record<
  string,
  { color: string; label: string; unit: string; danger?: number; warning?: number }
> = {
  temperature: { color: "#f97316", label: "Temperature", unit: "°C", warning: 75, danger: 90 },
  vibration: { color: "#8b5cf6", label: "Vibration", unit: "mm/s", warning: 2.5, danger: 4.5 },
  pressure: { color: "#06b6d4", label: "Pressure", unit: "bar", warning: 6, danger: 8 },
  rpm: { color: "#10b981", label: "RPM", unit: "rpm", warning: 3500, danger: 4000 },
  current: { color: "#f59e0b", label: "Current", unit: "A", warning: 15, danger: 20 },
  voltage: { color: "#6366f1", label: "Voltage", unit: "V" },
  oil_level: { color: "#ec4899", label: "Oil Level", unit: "%" },
  humidity: { color: "#64748b", label: "Humidity", unit: "%" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(12, 18, 33, 0.9)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        padding: "0.75rem 1rem",
        fontSize: "0.8125rem",
        backdropFilter: "blur(8px)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: "0.5rem", fontSize: "0.75rem" }}>
        Sample #{label}
      </div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: "2px", background: entry.color, flexShrink: 0 }} />
          <span style={{ color: "var(--text-secondary)" }}>{entry.name}:</span>
          <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>
            {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function SingleParamChart({
  param,
  readings,
  trend,
  index,
}: {
  param: string;
  readings: Record<string, any>[];
  trend: TrendData;
  index: number;
}) {
  const config = PARAM_CONFIG[param];
  if (!config) return null;

  const data = readings
    .map((r, i) => ({
      index: i + 1,
      value: r[param] as number | undefined,
    }))
    .filter((d) => d.value !== undefined && d.value !== null);

  if (data.length === 0) return null;

  const isAnomalous = trend.threshold_breach || trend.trend.includes("rapidly");
  const gradientId = `gradient-${param}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: isAnomalous ? "1px solid rgba(239, 68, 68, 0.4)" : undefined,
        boxShadow: isAnomalous ? "0 0 15px rgba(239, 68, 68, 0.1)" : undefined,
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem 0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
            {config.label}
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, marginTop: 4, fontStyle: "italic", fontFamily: "Space Grotesk" }}>
            <span style={{ color: isAnomalous ? "var(--risk-high)" : "white" }}>
              {trend.current_value.toFixed(1)}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 2, fontStyle: "normal" }}>
              {config.unit}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span
            className={`badge badge-${trend.severity === "critical" ? "critical" : trend.severity === "warning" ? "high" : "low"}`}
            style={{ fontSize: "0.625rem" }}
          >
            {trend.severity}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="index"
            hide
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          {config.warning && (
            <ReferenceLine
              y={config.warning}
              stroke="var(--risk-medium)"
              strokeDasharray="3 3"
              strokeWidth={1}
              strokeOpacity={0.4}
            />
          )}
          {config.danger && (
            <ReferenceLine
              y={config.danger}
              stroke="var(--risk-high)"
              strokeDasharray="3 3"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            animationDuration={1500}
            activeDot={{ r: 5, fill: "white", stroke: config.color, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div style={{ padding: "0.5rem 1.25rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>
             {trend.trend.replace(/_/g, " ")}
          </span>
          {isAnomalous && (
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--risk-high)" }} 
              />
          )}
      </div>
    </motion.div>
  );
}

export default function SensorCharts({ interpretedData, rawReadings }: SensorChartsProps) {
  const trendMap = useMemo(() => {
    const m: Record<string, TrendData> = {};
    interpretedData.trends.forEach((t) => (m[t.parameter] = t));
    return m;
  }, [interpretedData.trends]);

  const sortedParams = useMemo(() => {
    return interpretedData.trends
      .sort((a, b) => {
        const aScore = a.threshold_breach ? 2 : a.trend.includes("rapidly") ? 1 : 0;
        const bScore = b.threshold_breach ? 2 : b.trend.includes("rapidly") ? 1 : 0;
        return bScore - aScore;
      })
      .map((t) => t.parameter);
  }, [interpretedData.trends]);

  if (sortedParams.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center", opacity: 0.6 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No sensor data trends available for this analysis.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {sortedParams.map((param, i) => (
        <SingleParamChart
          key={param}
          param={param}
          readings={rawReadings}
          trend={trendMap[param]}
          index={i}
        />
      ))}
    </div>
  );
}
