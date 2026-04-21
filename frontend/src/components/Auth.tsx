"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card auth-card"
      >
        <div className="auth-header">
           <div className="logo-icon">
             <ShieldCheck size={32} color="var(--brand-primary)" />
           </div>
           <h1 className="auth-title">PredictAI <span className="text-gradient">Pro</span></h1>
           <p className="auth-subtitle">
             {isSignUp ? "Create an account to start monitoring" : "Secure access to industrial diagnostics"}
           </p>
        </div>

        {error && (
          <div className="alert alert-danger animate-fadeIn">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg auth-submit"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <>
                <LogIn size={18} style={{ marginRight: 8 }} />
                {isSignUp ? "Create Account" : "Sign In to Dashboard"}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
          
          <div style={{ position: 'relative', textAlign: 'center', margin: '0.5rem 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-subtle)' }} />
            <span style={{ position: 'relative', background: 'var(--bg-elevated)', padding: '0 0.75rem', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Development</span>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              // Mock session for development
              const mockSession = { user: { email: 'operator@predictai.internal' } };
              localStorage.setItem('mock-session', JSON.stringify(mockSession));
              window.dispatchEvent(new CustomEvent('mock-login', { detail: mockSession }));
            }}
          >
            <Sparkles size={14} style={{ marginRight: 8 }} />
            Bypass Login (Guest Access)
          </button>
        </div>

        <div className="auth-features">
            <div className="feature-item">
                <Sparkles size={14} color="var(--brand-accent)" />
                <span>3-Agent Diagnostic Pipeline</span>
            </div>
            <div className="feature-item">
                <Sparkles size={14} color="var(--brand-accent)" />
                <span>Real-time IoT Telemetry</span>
            </div>
        </div>
      </motion.div>

      {/* Decorative Background Elements */}
      <div className="auth-bg-blob blob-1" />
      <div className="auth-bg-blob blob-2" />
    </div>
  );
}
