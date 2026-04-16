"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, Command } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

import axios from "axios";

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your Industrial Maintenance Simplifier Agent. I can help you understand the diagnostic reports and technical data in plain language. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    
    setIsTyping(true);
    
    try {
        const response = await axios.post("/api/v1/chat", { 
            message: userMsg,
            machine_id: "CNC-Milling-Alpha",
            session_id: sessionId 
        });
        
        if (response.data.success) {
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: response.data.response
            }]);
            if (response.data.session_id) {
                setSessionId(response.data.session_id);
            }
        }
    } catch (err) {
        console.error("Chat error:", err);
        setMessages(prev => [...prev, { 
            role: "assistant", 
            content: "I'm having a little trouble connecting to the brain right now. Please try again in a moment."
        }]);
    } finally {
        setIsTyping(false);
    }
  };


  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)", overflow: "hidden" }}>
      <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-subtle)", background: "rgba(99,102,241,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 32, height: 32, background: "var(--grad-brand)", borderRadius: "8px", display: "flex", alignItems: "center", justifyItems: "center", padding: "6px" }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.9375rem" }}>Agent Command Center</div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", fontWeight: 600 }}>Simplifier & Diagnostic Copilot</div>
          </div>
        </div>
        <div style={{ padding: "0.375rem 0.75rem", background: "rgba(16,185,129,0.1)", borderRadius: "100px", fontSize: "0.6875rem", color: "var(--risk-low)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.375rem" }}>
           <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--risk-low)" }} />
           Online
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
                display: "flex", 
                gap: "1rem", 
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                flexDirection: msg.role === "user" ? "row-reverse" : "row"
            }}
          >
            <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: "50%", 
                background: msg.role === "user" ? "var(--bg-elevated)" : "var(--grad-brand)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "0.25rem"
            }}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div style={{ 
                padding: "0.875rem 1.125rem", 
                borderRadius: msg.role === "user" ? "18px 2px 18px 18px" : "2px 18px 18px 18px",
                background: msg.role === "user" ? "var(--brand-primary)" : "var(--bg-surface)",
                border: msg.role === "user" ? "none" : "1px solid var(--border-subtle)",
                fontSize: "0.9375rem",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                lineHeight: 1.5,
                boxShadow: "var(--shadow-sm)"
            }}>
                {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", gap: "1rem", alignSelf: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={16} />
            </div>
            <div className="skeleton" style={{ padding: "0.875rem 1.125rem", borderRadius: "2px 18px 18px 18px", width: "100px", height: "40px" }} />
          </div>
        )}
      </div>

      <div style={{ padding: "1.25rem", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
        <div style={{ position: "relative" }}>
            <input 
                type="text" 
                className="input" 
                placeholder="Ask about machine health or diagnostic details..." 
                style={{ paddingRight: "3rem", borderRadius: "100px" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button 
                onClick={handleSend}
                style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "var(--brand-primary)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
                <Send size={16} />
            </button>
        </div>
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
           {['Explain vibration trends', 'Last oil change?', 'Risk of failure?'].map(txt => (
             <button key={txt} onClick={() => setInput(txt)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                <Command size={10} style={{ marginRight: 4 }} /> {txt}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}
