"""
API Routes — All REST endpoints for the Predictive Maintenance API.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from typing import List, Optional
import time
import csv
import io
import json
from datetime import datetime

from models.schemas import (
    AnalysisRequest, AnalysisResponse, MachineData,
    SensorReading, MaintenanceReport, WhatIfRequest,
    FeedbackRequest, SimulatedDataRequest
)
from agents.data_interpreter import data_interpreter
from agents.diagnostic_agent import diagnostic_agent
from agents.simplifier_agent import simplifier_agent
from ml.data_simulator import get_simulated_data, SCENARIO_MAP
from ml.cost_estimator import calculate_cost_estimate
from db.session import get_db
from models.db_models import MaintenanceReportDB, FeedbackDB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Depends

router = APIRouter()


# ---------------------------------------------------------------------------
# CORE ANALYSIS PIPELINE
# ---------------------------------------------------------------------------

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_machine(request: AnalysisRequest, db: AsyncSession = Depends(get_db)):
    """
    Main 3-agent pipeline:
    1. Data Interpreter → trends
    2. Diagnostic Agent → AI reasoning
    3. Simplifier Agent → plain language
    """
    start_time = time.time()
    try:
        machine = request.machine_data

        # === AGENT 1: Data Interpreter ===
        interpreted = data_interpreter.interpret(machine)
        structured_input = data_interpreter.get_structured_prompt_input(interpreted, machine)

        # === AGENT 2: Diagnostic Agent ===
        diagnostic = diagnostic_agent.diagnose(
            structured_input=structured_input,
            interpreted=interpreted,
            runtime_hours=machine.runtime_hours,
            last_maintenance_days=machine.last_maintenance_days
        )

        # === AGENT 3: Simplifier Agent ===
        simplified = simplifier_agent.simplify(diagnostic, machine.machine_name)

        # === Cost Estimation ===
        cost_estimate = None
        if request.include_cost_estimate:
            cost_estimate = calculate_cost_estimate(
                risk_level=diagnostic.risk_level,
                machine_type=machine.machine_type,
                runtime_hours=machine.runtime_hours
            )
        diagnostic.cost_estimate = cost_estimate

        # === What-If Scenarios ===
        what_if_results = []
        if request.include_what_if and interpreted.anomalies:
            # Auto-generate what-if for top 2 anomalous parameters
            for param in interpreted.anomalies[:2]:
                param_data = next(
                    (t for t in interpreted.trends if t.parameter == param), None
                )
                if param_data:
                    change = param_data.current_value * 0.10  # 10% increase
                    result = diagnostic_agent.generate_what_if(
                        base_context=structured_input,
                        parameter=param,
                        change_value=round(change, 2),
                        change_unit="+10%",
                        current_risk=diagnostic.risk_level.value
                    )
                    what_if_results.append({
                        "parameter": param,
                        "change": f"+10% ({round(change, 2)})",
                        "result": result
                    })

        report = MaintenanceReport(
            machine_id=machine.machine_id,
            machine_name=machine.machine_name,
            machine_type=machine.machine_type,
            analysis_timestamp=datetime.now().isoformat(),
            readings=machine.readings,
            interpreted_data=interpreted,
            diagnostic=diagnostic,
            simplified_insight=simplified,
            what_if_scenarios=what_if_results if what_if_results else None,
            historical_comparison=None
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        
        # Persistence
        db_report = MaintenanceReportDB(
            machine_id=report.machine_id,
            machine_name=report.machine_name,
            machine_type=report.machine_type,
            analysis_timestamp=report.analysis_timestamp,
            report_json=report.model_dump()
        )
        db.add(db_report)
        await db.commit()

        return AnalysisResponse(success=True, report=report, processing_time_ms=elapsed_ms)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# CSV UPLOAD
# ---------------------------------------------------------------------------

@router.post("/upload-csv", response_model=AnalysisResponse)
async def upload_csv(
    file: UploadFile = File(...),
    machine_id: str = "CSV-001",
    machine_name: str = "Uploaded Machine",
    machine_type: str = "Industrial Motor",
    runtime_hours: Optional[float] = None,
    last_maintenance_days: Optional[int] = None
):
    """Upload a CSV file and run the analysis pipeline."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    readings = []
    for row in reader:
        reading = SensorReading(
            timestamp=row.get("timestamp"),
            temperature=_safe_float(row.get("temperature")),
            vibration=_safe_float(row.get("vibration")),
            pressure=_safe_float(row.get("pressure")),
            rpm=_safe_float(row.get("rpm")),
            current=_safe_float(row.get("current")),
            voltage=_safe_float(row.get("voltage")),
            oil_level=_safe_float(row.get("oil_level")),
            humidity=_safe_float(row.get("humidity"))
        )
        readings.append(reading)

    if not readings:
        raise HTTPException(status_code=400, detail="No valid readings found in CSV")

    machine_data = MachineData(
        machine_id=machine_id,
        machine_name=machine_name,
        machine_type=machine_type,
        readings=readings,
        runtime_hours=runtime_hours,
        last_maintenance_days=last_maintenance_days
    )

    request = AnalysisRequest(machine_data=machine_data)
    return await analyze_machine(request)


# ---------------------------------------------------------------------------
# SIMULATED DATA
# ---------------------------------------------------------------------------

@router.post("/simulate", response_model=AnalysisResponse)
async def simulate_analysis(req: SimulatedDataRequest):
    """Run analysis on simulated IoT data for demo purposes."""
    raw_readings = get_simulated_data(scenario=req.scenario, n=req.num_readings)
    readings = [SensorReading(**r) for r in raw_readings]

    machine_data = MachineData(
        machine_id=req.machine_id,
        machine_name=req.machine_name,
        machine_type=req.machine_type,
        readings=readings,
        runtime_hours=4850.5,
        last_maintenance_days=67
    )

    analysis_request = AnalysisRequest(machine_data=machine_data)
    return await analyze_machine(analysis_request)


@router.get("/scenarios")
async def list_scenarios():
    """List all available simulation scenarios."""
    return {
        "scenarios": list(SCENARIO_MAP.keys()),
        "descriptions": {
            "normal": "Healthy machine — all parameters stable",
            "overheating": "Rising temperature with correlated vibration and current increase",
            "bearing_wear": "Classic bearing degradation — exponential vibration growth",
            "critical": "Multi-parameter failure — machine near breakdown",
            "pressure_fault": "Hydraulic pressure oscillations and build-up"
        }
    }


# ---------------------------------------------------------------------------
# WHAT-IF SIMULATION (Manual)
# ---------------------------------------------------------------------------

@router.post("/what-if")
async def what_if_simulation(req: WhatIfRequest):
    """Run a custom what-if scenario for a specific parameter change."""
    result = diagnostic_agent.generate_what_if(
        base_context=f"Machine ID: {req.machine_id}, Current Risk: {req.current_risk}",
        parameter=req.parameter,
        change_value=req.change_value,
        change_unit=req.change_unit,
        current_risk=req.current_risk
    )
    return {"success": True, "what_if_result": result}


# ---------------------------------------------------------------------------
# FEEDBACK
# ---------------------------------------------------------------------------

@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    """Submit operator feedback on a diagnostic report."""
    db_feedback = FeedbackDB(
        report_id=req.report_id,
        machine_id=req.machine_id,
        feedback_type=req.feedback_type,
        action_taken=req.action_taken,
        notes=req.notes
    )
    db.add(db_feedback)
    await db.commit()
    return {
        "success": True,
        "message": "Feedback recorded. Thank you for improving the system!"
    }


@router.post("/chat")
async def agent_chat(req: dict, db: AsyncSession = Depends(get_db)):
    """Conversational endpoint for interacting with the Simplifier Agent with memory."""
    message = req.get("message", "")
    machine_id = req.get("machine_id", "GLOBAL")
    session_id = req.get("session_id", f"session-{machine_id}")
    
    # 1. Check or create session
    stmt = select(ChatSessionDB).where(ChatSessionDB.session_id == session_id)
    result = await db.execute(stmt)
    session = result.scalars().first()
    
    if not session:
        session = ChatSessionDB(session_id=session_id, machine_id=machine_id)
        db.add(session)
        await db.commit()
    
    # 2. Get history (last 10 messages)
    stmt = select(ChatMessageDB).where(ChatMessageDB.session_id == session_id).order_by(ChatMessageDB.timestamp.asc()).limit(10)
    result = await db.execute(stmt)
    history_objs = result.scalars().all()
    history = [{"role": m.role, "content": m.content} for m in history_objs]
    
    # 3. Call agent with history
    response = simplifier_agent.simplify_chat(message, machine_id, history=history)
    
    # 4. Save messages to DB
    user_msg = ChatMessageDB(session_id=session_id, role="user", content=message)
    asst_msg = ChatMessageDB(session_id=session_id, role="assistant", content=response)
    db.add(user_msg)
    db.add(asst_msg)
    await db.commit()
    
    return {
        "success": True,
        "response": response,
        "session_id": session_id
    }



@router.get("/feedback")
async def get_feedback(db: AsyncSession = Depends(get_db)):
    """Retrieve all submitted feedback (admin endpoint)."""
    result = await db.execute(select(FeedbackDB))
    feedback = result.scalars().all()
    return {"feedback": feedback, "total": len(feedback)}


# ---------------------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------------------

@router.get("/health")
async def health_check():
    """API health endpoint."""
    return {
        "status": "operational",
        "service": "Predictive Maintenance API",
        "version": "1.0.0",
        "agents": {
            "data_interpreter": "ready",
            "diagnostic_agent": "ready",
            "simplifier_agent": "ready"
        }
    }


@router.get("/sample-csv")
async def download_sample_csv():
    """Return a sample CSV structure."""
    from fastapi.responses import PlainTextResponse
    sample = """timestamp,temperature,vibration,pressure,rpm,current,voltage,oil_level,humidity
2024-01-01T10:00:00,58.2,1.4,4.8,2820,8.9,229,68,52
2024-01-01T10:15:00,61.5,1.6,4.9,2810,9.1,230,67,51
2024-01-01T10:30:00,68.3,2.1,5.2,2790,10.2,229,66,53
2024-01-01T10:45:00,74.8,2.8,5.8,2750,11.5,231,64,52
2024-01-01T11:00:00,82.1,3.5,6.3,2720,13.1,228,62,54"""
    return PlainTextResponse(content=sample, media_type="text/csv")


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def _safe_float(val) -> Optional[float]:
    try:
        return float(val) if val not in (None, "", "null", "N/A") else None
    except (ValueError, TypeError):
        return None
