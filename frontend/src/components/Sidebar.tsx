"use client";

import React from "react";
import {
  LayoutDashboard,
  Activity,
  Upload,
  Play,
  MessageSquare,
  Settings,
  Cpu,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string;
  onSignOut?: () => void;
}

const navItems = [
  {
    section: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", icon: Activity },
    ],
  },
  {
    section: "Analysis",
    items: [
      { id: "simulate", label: "Run Simulation", icon: Play },
      { id: "upload", label: "Upload CSV", icon: Upload },
      { id: "live", label: "Live Monitor", icon: Activity },
    ],
  },
  {
    section: "Tools",
    items: [
      { id: "whatif", label: "What-If Simulator", icon: Zap },
      { id: "chat", label: "Agent Command Center", icon: MessageSquare },
      { id: "feedback", label: "Feedback", icon: Settings },
    ],
  },
];

export default function Sidebar({ 
  currentPage, 
  onNavigate, 
  isOpen, 
  onClose,
  userEmail,
  onSignOut
}: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`} id="main-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--grad-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
            }}
          >
            <Cpu size={18} color="white" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "1.0625rem",
                letterSpacing: "-0.02em",
              }}
            >
              <span className="text-gradient">PredictAI</span>
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Maintenance Assistant
            </div>
          </div>
          <button 
            className="btn btn-ghost btn-sm mobile-only" 
            onClick={onClose}
            style={{ marginLeft: "auto", display: "none" }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => onNavigate(item.id)}
                  id={`nav-${item.id}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Session */}
      {userEmail && (
        <div style={{ padding: "0.75rem", margin: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={14} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</div>
              <div style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>Industrial Operator</div>
            </div>
          </div>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={onSignOut}
            style={{ width: "100%", justifyContent: "center", textTransform: "none", fontSize: "0.6875rem", padding: "0.375rem" }}
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
          3-Agent AI Pipeline
        </div>
        <div style={{ marginBottom: 12 }}>Data Interpreter → Diagnostic → Simplifier</div>
        
        <div style={{ padding: "0.5rem", background: "rgba(16,185,129,0.05)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
           <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--risk-low)", boxShadow: "0 0 8px var(--risk-low)" }} />
           <span style={{ color: "var(--risk-low)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.625rem" }}>System Health: Optimal</span>
        </div>
      </div>
    </aside>
    </>
  );
}
