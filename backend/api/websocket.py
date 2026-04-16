"""
WebSocket Logic — Real-time sensor data streaming and diagnostic updates.
"""
import asyncio
import json
import random
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ml.data_simulator import SCENARIO_MAP

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/stream/{machine_id}")
async def websocket_endpoint(websocket: WebSocket, machine_id: str):
    await manager.connect(websocket)
    try:
        # Default scenario for streaming
        scenario = "normal"
        
        # In a real app, we might check the database for the current machine state
        # For simulation, we'll just stream data
        while True:
            # Generate a single point of data
            # We use the 'normal' generator but just take one point with current time
            now = datetime.now().isoformat()
            
            # Simple single-point generator for streaming
            data_point = {
                "machine_id": machine_id,
                "timestamp": now,
                "temperature": round(random.gauss(60 if scenario == "overheating" else 55, 2), 2),
                "vibration": round(random.gauss(1.5 if scenario == "bearing_wear" else 1.2, 0.1), 2),
                "pressure": round(random.gauss(4.5, 0.2), 2),
                "rpm": round(random.gauss(2800, 50), 0),
                "current": round(random.gauss(8.5, 0.3), 2),
                "voltage": round(random.gauss(230, 2), 1),
                "oil_level": round(random.uniform(60, 70), 1),
                "humidity": round(random.gauss(50, 3), 1)
            }
            
            # Occasionally trigger an anomaly for "Excitement"
            if random.random() > 0.95:
                data_point["temperature"] += 15
                data_point["is_anomaly"] = True
            else:
                data_point["is_anomaly"] = False

            await websocket.send_json({
                "type": "sensor_data",
                "data": data_point
            })
            
            # Wait for 1 second before next reading
            await asyncio.sleep(1)
            
            # Check for incoming messages (e.g. to change scenario)
            try:
                # Use wait_for to avoid blocking indefinitely
                raw_data = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                msg = json.loads(raw_data)
                if msg.get("type") == "change_scenario":
                    scenario = msg.get("scenario", "normal")
                    await websocket.send_json({"type": "info", "message": f"Scenario changed to {scenario}"})
            except (asyncio.TimeoutError, json.JSONDecodeError):
                pass

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(websocket)
