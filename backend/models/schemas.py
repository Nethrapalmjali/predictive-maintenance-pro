"""
Pydantic schemas for the Predictive Maintenance API.
Defines all request/response models for type safety.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class SensorReading(BaseModel):
    timestamp: Optional[str] = None
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    vibration: Optional[float] = Field(None, description="Vibration in mm/s")
    pressure: Optional[float] = Field(None, description="Pressure in bar")
    rpm: Optional[float] = Field(None, description="Rotations per minute")
    current: Optional[float] = Field(None, description="Electrical current in Amperes")
    voltage: Optional[float] = Field(None, description="Voltage in Volts")
    oil_level: Optional[float] = Field(None, description="Oil level percentage")
    humidity: Optional[float] = Field(None, description="Humidity percentage")


class MachineData(BaseModel):
    machine_id: str = Field(..., description="Unique machine identifier")
    machine_name: str = Field(..., description="Human-readable machine name")
    machine_type: str = Field(default="Industrial Motor", description="Type of machine")
    readings: List[SensorReading] = Field(..., description="Time series sensor readings")
    runtime_hours: Optional[float] = Field(None, description="Total runtime hours")
    last_maintenance_days: Optional[int] = Field(None, description="Days since last maintenance")


class WhatIfRequest(BaseModel):
    machine_id: str
    parameter: str
    change_value: float
    change_unit: str
    current_risk: str


class TrendData(BaseModel):
    parameter: str
    trend: str  # "increasing", "decreasing", "stable", "spike"
    direction: str
    rate_of_change: float
    current_value: float
    threshold_breach: bool
    severity: str


class InterpretedData(BaseModel):
    machine_id: str
    trends: List[TrendData]
    anomalies: List[str]
    normal_parameters: List[str]
    summary: str
    anomaly_score: float


class DiagnosticResult(BaseModel):
    issue_summary: str
    root_cause: str
    risk_level: RiskLevel
    future_impact: str
    recommended_actions: List[str]
    confidence_score: int
    affected_components: List[str]
    estimated_time_to_failure: Optional[str] = None
    cost_estimate: Optional[Dict[str, Any]] = None
    technical_explanation: Optional[str] = Field(None, description="Detailed engineering explanation")


class SimplifiedInsight(BaseModel):
    headline: str
    plain_english_summary: str
    what_is_happening: str
    why_it_matters: str
    what_to_do: List[str]
    urgency_tag: str
    icon: str
    next_steps: Optional[List[str]] = Field(default_factory=list, description="Immediate clear next steps")


class MaintenanceReport(BaseModel):
    machine_id: str
    machine_name: str
    machine_type: str
    analysis_timestamp: str
    readings: List[SensorReading]
    interpreted_data: InterpretedData
    diagnostic: DiagnosticResult
    simplified_insight: SimplifiedInsight
    what_if_scenarios: Optional[List[Dict[str, Any]]] = None
    historical_comparison: Optional[Dict[str, Any]] = None


class AnalysisRequest(BaseModel):
    machine_data: MachineData
    include_what_if: bool = True
    include_cost_estimate: bool = True


class AnalysisResponse(BaseModel):
    success: bool
    report: Optional[MaintenanceReport] = None
    error: Optional[str] = None
    processing_time_ms: Optional[float] = None


class FeedbackRequest(BaseModel):
    report_id: str
    machine_id: str
    action_taken: str
    feedback_type: str  # "correct", "incorrect", "partial"
    notes: Optional[str] = None


class SimulatedDataRequest(BaseModel):
    machine_id: str = "MACH-001"
    machine_name: str = "CNC Milling Machine"
    machine_type: str = "CNC Machine"
    scenario: str = "overheating"  # "overheating", "bearing_wear", "normal", "critical"
    num_readings: int = 20
