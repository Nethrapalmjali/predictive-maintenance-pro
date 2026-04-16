"use client";

import React, { useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Activity, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { getWebSocketUrl } from "@/lib/api";

interface TelemetryPoint {
    time: string;
    temp: number;
    vib: number;
    is_anomaly: boolean;
}

export default function LiveFeed() {
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = getWebSocketUrl("LIVE-DEMO-01");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
        setIsConnected(true);
        console.log("WS Connected");
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "sensor_data") {
            const point = msg.data;
            setData(prev => {
                const newData = [...prev, {
                    time: new Date(point.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
                    temp: point.temperature,
                    vib: point.vibration,
                    is_anomaly: point.is_anomaly
                }];
                return newData.slice(-40); // Keep last 40 points for smoother chart
            });
        } else if (msg.type === "info") {
            setLastMessage(msg.message);
        }
    };

    ws.onclose = () => {
        setIsConnected(false);
        console.log("WS Disconnected");
    };

    return () => {
        ws.close();
    };
  }, []);

  const latest = data[data.length - 1];
  const isAnomalous = latest?.is_anomaly;

  return (
    <div className="glass-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <motion.div 
               animate={isConnected ? { scale: [1, 1.2, 1] } : {}} 
               transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Activity size={18} color={isConnected ? "var(--brand-accent)" : "var(--text-muted)"} />
            </motion.div>
            <span style={{ fontWeight: 800, fontSize: "0.9375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Real-Time Telemetry
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: "0.5rem" }}>
             {isConnected ? (
                <><Wifi size={12} color="var(--risk-low)" /> Connected · Stream: LIVE-DEMO-01</>
             ) : (
                <><WifiOff size={12} color="var(--risk-high)" /> Disconnected</>
             )}
          </div>
        </div>
        
        <AnimatePresence>
            {isAnomalous && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="badge badge-high" 
                    style={{ fontSize: "0.6875rem", gap: "0.25rem" }}
                >
                    <AlertTriangle size={12} /> Anomaly Detected
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className={`glass-card ${latest?.temp > 80 ? 'anomalous' : ''}`} style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", position: "relative" }}>
          <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Temperature</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, fontFamily: "Space Grotesk", margin: "0.25rem 0" }}>
             {latest ? latest.temp.toFixed(1) : "--"} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>°C</span>
          </div>
          <div style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fill="url(#gradTemp)" 
                    isAnimationActive={false} 
                  />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`glass-card ${latest?.vib > 3 ? 'anomalous' : ''}`} style={{ padding: "1rem", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vibration</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, fontFamily: "Space Grotesk", margin: "0.25rem 0" }}>
             {latest ? latest.vib.toFixed(2) : "--"} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>mm/s²</span>
          </div>
          <div style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="vib" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fill="url(#gradVib)" 
                    isAnimationActive={false} 
                  />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
         <button 
            className="btn btn-secondary btn-sm" 
            style={{ flex: 1 }}
            onClick={() => wsRef.current?.send(JSON.stringify({ type: "change_scenario", scenario: "normal" }))}
         >
            Normal
         </button>
         <button 
            className="btn btn-secondary btn-sm" 
            style={{ flex: 1 }}
            onClick={() => wsRef.current?.send(JSON.stringify({ type: "change_scenario", scenario: "overheating" }))}
         >
            Overheat
         </button>
         <button 
            className="btn btn-secondary btn-sm" 
            style={{ flex: 1 }}
            onClick={() => wsRef.current?.send(JSON.stringify({ type: "change_scenario", scenario: "bearing_wear" }))}
         >
            Bearing
         </button>
      </div>

      {/* Grid Pattern BG */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0.05, pointerEvents: "none", backgroundImage: "radial-gradient(circle, var(--text-muted) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
    </div>
  );
}
