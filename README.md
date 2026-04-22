# 🛠️ Predictive Maintenance Assistant Pro (v2.0)

**Live Production URL:** [https://predictive-maintenance-pro.vercel.app](https://predictive-maintenance-pro.vercel.app)

An AI-powered industrial maintenance platform that converts raw sensor data into human-readable diagnostics and actionable preventive maintenance steps.

## 🔥 Quick Start (Local Development)

To get the project running in under 2 minutes:

### 1. Backend Setup
1.  Navigate to `/backend`
2.  Install dependencies: `pip install -r requirements.txt`
3.  **Crucial:** Open `.env` and replace `your_groq_api_key_here` with your [Groq API Key](https://console.groq.com/).
4.  Start the API: `python main.py`

### 2. Frontend Setup
1.  Navigate to `/frontend`
2.  Install dependencies: `npm install`
3.  Start the dashboard: `npm run dev`
4.  Open [http://localhost:3000](http://localhost:3000)

## 🚀 "Next-Level" Features (New in v2.0)
- **3D Digital Twin**: Real-time 3D machine visualization using React Three Fiber that reacts to machine health.
- **Real-Time Stream**: WebSocket-based telemetry for millisecond-latency streaming from industrial sensors.
- **Agent Command Center**: Conversational interface to interact directly with the AI agents for deeper reasoning.
- **Glassmorphic Industrial UI**: Premium "War Room" aesthetic with high-performance animations.
- **Self-Improving Feedback**: Closed-loop operator feedback system to refine AI diagnostics over time.

## 🧠 AI Pipeline
The system uses a **multi-agent orchestration** (Data Interpreter → Diagnostic Agent → Simplifier Agent) to provide high-fidelity diagnostics:
1.  **Data Interpreter**: Extracts statistical trends and identifies boundary-condition anomalies.
2.  **Diagnostic Agent**: Uses few-shot engineering reasoning to hypothesize failure modes and root causes.
3.  **Simplifier Agent**: Translates complex failure modes into plain, actionable language for floor operators.

---
*Built for productivity, engineered for reliability. Ready for the future of Industry 4.0.*

## 🌐 Deployment Guide (Supabase + Vercel)

### 1. Database (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** and run the contents of [`backend/supabase_schema.sql`](./backend/supabase_schema.sql).
3. Copy your **Transaction Connection String** (under Settings > Database).

### 2. Backend (Vercel or Render)
*Vercel is great for the API, but Render is recommended if you need WebSockets.*

**For Vercel:**
1. Set the following environment variables in your Vercel project:
   - `DATABASE_URL`: Your Supabase connection string (replace `postgres://` with `postgresql+asyncpg://`).
   - `GROQ_API_KEY`: Your Groq API key.
2. Deploy the `/backend` folder.

### 3. Frontend (Vercel)
1. Import the `/frontend` folder into a new Vercel project.
2. Set the Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL.
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
3. Deploy!
