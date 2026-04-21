"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  BarChart3, 
  Zap, 
  ChevronRight, 
  PlayCircle,
  CheckCircle2,
  Users,
  Globe,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <ShieldCheck size={28} className="text-brand-primary" />
            <span className="logo-text">PredictAI <span className="text-muted" style={{ fontWeight: 400 }}>Pro</span></span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Start Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content"
          >
            <div className="badge-pill">
              <Zap size={14} className="text-brand-primary" />
              <span>Version 2.0 Now Live</span>
            </div>
            <h1 className="hero-title">
              Predict Machine Failures <br />
              <span className="text-gradient">Before They Happen</span>
            </h1>
            <p className="hero-description">
              PredictAI uses a specialized 3-agent AI pipeline to convert raw industrial sensor data into 
              human-readable diagnostics and actionable maintenance steps.
            </p>
            <div className="hero-cta">
              <Link href="/login" className="btn btn-primary btn-lg">
                Access Dashboard <ChevronRight size={18} style={{ marginLeft: 8 }} />
              </Link>
              <button className="btn btn-secondary btn-lg">
                <PlayCircle size={18} style={{ marginRight: 8 }} /> View Video Demo
              </button>
            </div>
            <div className="hero-trust">
              <span className="trust-label">Trusted by industry leaders in</span>
              <div className="trust-icons">
                <span>Automotive</span>
                <span>Energy</span>
                <span>Manufacturing</span>
                <span>Aerospace</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-visual"
          >
            <div className="visual-mockup">
              <div className="mockup-header">
                <div className="header-dots">
                  <span /> <span /> <span />
                </div>
                <div className="header-title">Industrial Dashboard</div>
              </div>
              <div className="mockup-body">
                <div className="mockup-chart">
                  {/* Decorative chart elements */}
                  <div className="chart-bar" style={{ height: '40%' }} />
                  <div className="chart-bar" style={{ height: '60%' }} />
                  <div className="chart-bar" style={{ height: '80%' }} />
                  <div className="chart-bar" style={{ height: '50%' }} />
                  <div className="chart-bar highlight" style={{ height: '90%' }} />
                </div>
                <div className="mockup-stats">
                  <div className="stat-card">
                    <Activity size={14} />
                    <span>Health: 94%</span>
                  </div>
                  <div className="stat-card highlight">
                    <Zap size={14} />
                    <span>Risk: Low</span>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="floating-card c1 animate-float">
                <CheckCircle2 size={16} color="var(--risk-low)" />
                <span>AI Verified</span>
              </div>
              <div className="floating-card c2 animate-float-delayed">
                <Cpu size={16} color="var(--brand-primary)" />
                <span>Sensors Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-strip">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-value">99.2%</span>
            <span className="stat-label">Accuracy Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">30%</span>
            <span className="stat-label">Downtime Reduction</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">$2M+</span>
            <span className="stat-label">Customer Savings</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">500+</span>
            <span className="stat-label">Connected Assets</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Built for the <span className="text-gradient">Modern Factory</span></h2>
          <p className="section-subtitle">Comprehensive tools for maintenance teams to stay ahead of equipment wear.</p>
        </div>

        <div className="features-grid">
          {[
            {
              icon: <Cpu size={24} />,
              title: "3D Digital Twin",
              desc: "Real-time 3D machine visualization that reacts to health telemetry."
            },
            {
              icon: <Zap size={24} />,
              title: "What-If Simulator",
              desc: "Predict how environmental changes will impact machine reliability."
            },
            {
              icon: <Users size={24} />,
              title: "Agent Command Center",
              desc: "Talk to our specialized AI agents for deep-dive reasoning."
            },
            {
              icon: <Activity size={24} />,
              title: "Real-time Telemetry",
              desc: "Millisecond-latency streaming from industrial PLC and IoT gateways."
            },
            {
              icon: <BarChart3 size={24} />,
              title: "Fleet Analytics",
              desc: "Aggregated health metrics across all your facilities and machinery."
            },
            {
              icon: <Globe size={24} />,
              title: "Cloud Integration",
              desc: "Seamless connection with Azure IoT, AWS Greengrass, and MQTT."
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <h2 className="section-title">Simple <span className="text-gradient">Scalable Pricing</span></h2>
          <p className="section-subtitle">Choose the plan that fits your facility size and asset complexity.</p>
        </div>

        <div className="pricing-grid">
          {[
            {
              name: "Starter",
              price: "$499",
              duration: "per month",
              features: ["Up to 5 Machines", "Basic AI Diagnostics", "Email Alerts", "Mobile App Access"],
              isPopular: false
            },
            {
              name: "Enterprise",
              price: "$1,999",
              duration: "per month",
              features: ["Unlimited Machines", "3-Agent Orchestration", "What-If Simulation", "24/7 Dedicated Support", "API Access"],
              isPopular: true
            },
            {
              name: "Custom",
              price: "Contact Us",
              duration: "for custom setup",
              features: ["On-Premise Deployment", "Custom ML Models", "White-label Option", "Security Audit Support"],
              isPopular: false
            }
          ].map((plan, i) => (
            <div key={i} className={`glass-card pricing-card ${plan.isPopular ? 'popular' : ''}`}>
              {plan.isPopular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price-value">{plan.price}</span>
                <span className="price-duration">{plan.duration}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((f, j) => (
                  <li key={j}><CheckCircle2 size={16} /> {f}</li>
                ))}
              </ul>
              <button className={`btn ${plan.isPopular ? 'btn-primary' : 'btn-secondary'} w-full`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bottom-cta">
        <div className="cta-banner glass-card">
          <h2>Ready to eliminate unplanned downtime?</h2>
          <p>Join over 200 manufacturing plants using PredictAI to optimize their maintenance workflow.</p>
          <div className="cta-buttons">
            <Link href="/login" className="btn btn-primary btn-lg">Start Free Trial Now</Link>
            <button className="btn btn-ghost btn-lg">Contact Sales Representative</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-info">
            <div className="nav-logo">
              <ShieldCheck size={24} className="text-brand-primary" />
              <span className="logo-text">PredictAI</span>
            </div>
            <p>Intelligence for Industry 4.0. Built with security and reliability at its core.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Roadmap</a>
              <a href="#">Security</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="link-group">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Blog</a>
              <a href="#">Tutorials</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 PredictAI Systems Inc. All rights reserved.</p>
          <div className="bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>

      {/* Background blobs */}
      <div className="bg-blob b1" />
      <div className="bg-blob b2" />
      <div className="bg-blob b3" />
    </div>
  );
}
