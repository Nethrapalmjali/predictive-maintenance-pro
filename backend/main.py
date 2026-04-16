"""
FastAPI Main Application
Predictive Maintenance Assistant — Backend API
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api.routes import router
from api.websocket import router as ws_router

load_dotenv()

app = FastAPI(
    title="Predictive Maintenance Assistant API",
    description=(
        "AI-powered industrial maintenance assistant that converts raw machine sensor data "
        "into clear, actionable diagnostics using a 3-agent pipeline: "
        "Data Interpreter → Diagnostic Agent → Simplifier Agent."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1")
app.include_router(ws_router)

@app.on_event("startup")
async def startup_event():
    from db.session import init_db
    await init_db()


@app.get("/")
async def root():
    return {
        "service": "Predictive Maintenance Assistant",
        "status": "running",
        "docs": "/docs",
        "api_base": "/api/v1"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
