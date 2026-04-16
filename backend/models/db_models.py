from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class MaintenanceReportDB(Base):
    __tablename__ = "maintenance_reports"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, index=True)
    machine_name = Column(String)
    machine_type = Column(String)
    analysis_timestamp = Column(String)
    # Store full JSON payload for flexibility in demo
    report_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeedbackDB(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, index=True)
    machine_id = Column(String)
    feedback_type = Column(String)
    action_taken = Column(String)
    notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

class ChatSessionDB(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    machine_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatMessageDB(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String)  # user or assistant
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

