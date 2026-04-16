"""
Simulated IoT Data Generator.
Creates realistic machine sensor data for demo and testing purposes.
"""
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any


def generate_timestamps(n: int, interval_minutes: int = 15) -> List[str]:
    """Generate n timestamps going back in time."""
    now = datetime.now()
    return [
        (now - timedelta(minutes=interval_minutes * (n - i - 1))).isoformat()
        for i in range(n)
    ]


def generate_normal_readings(n: int) -> List[Dict[str, Any]]:
    """Healthy machine — all parameters within safe range."""
    timestamps = generate_timestamps(n)
    readings = []
    for i, ts in enumerate(timestamps):
        readings.append({
            "timestamp": ts,
            "temperature": round(random.gauss(55, 2), 2),
            "vibration": round(random.gauss(1.2, 0.1), 2),
            "pressure": round(random.gauss(4.5, 0.2), 2),
            "rpm": round(random.gauss(2800, 50), 0),
            "current": round(random.gauss(8.5, 0.3), 2),
            "voltage": round(random.gauss(230, 2), 1),
            "oil_level": round(70 - i * 0.05, 1),
            "humidity": round(random.gauss(50, 3), 1)
        })
    return readings


def generate_overheating_readings(n: int) -> List[Dict[str, Any]]:
    """Machine with steadily rising temperature."""
    timestamps = generate_timestamps(n)
    readings = []
    for i, ts in enumerate(timestamps):
        progress = i / n
        readings.append({
            "timestamp": ts,
            "temperature": round(55 + progress * 45 + random.gauss(0, 1.5), 2),  # 55→100°C
            "vibration": round(1.2 + progress * 1.5 + random.gauss(0, 0.1), 2),  # Rising vibration
            "pressure": round(random.gauss(4.5, 0.2), 2),
            "rpm": round(random.gauss(2800, 50), 0),
            "current": round(8.5 + progress * 4 + random.gauss(0, 0.2), 2),  # Current rising with temp
            "voltage": round(random.gauss(230, 2), 1),
            "oil_level": round(70 - i * 0.3, 1),  # Oil level dropping (evaporation)
            "humidity": round(random.gauss(50, 3), 1)
        })
    return readings


def generate_bearing_wear_readings(n: int) -> List[Dict[str, Any]]:
    """Classic bearing wear pattern — vibration surge with RPM instability."""
    timestamps = generate_timestamps(n)
    readings = []
    for i, ts in enumerate(timestamps):
        progress = i / n
        # Bearing failure has exponential vibration growth in later stages
        vibration_base = 1.2 + (progress ** 2) * 5
        readings.append({
            "timestamp": ts,
            "temperature": round(55 + progress * 20 + random.gauss(0, 1), 2),
            "vibration": round(vibration_base + random.gauss(0, 0.3), 2),
            "pressure": round(4.5 - progress * 0.5 + random.gauss(0, 0.2), 2),
            "rpm": round(2800 - progress * 200 + random.gauss(0, 80), 0),  # RPM dropping
            "current": round(8.5 + progress * 3 + random.gauss(0, 0.3), 2),
            "voltage": round(random.gauss(230, 2), 1),
            "oil_level": round(70 - i * 0.5, 1),
            "humidity": round(random.gauss(50, 3), 1)
        })
    return readings


def generate_critical_readings(n: int) -> List[Dict[str, Any]]:
    """Multi-parameter failure — machine about to break down."""
    timestamps = generate_timestamps(n)
    readings = []
    for i, ts in enumerate(timestamps):
        progress = i / n
        # Random spikes simulating erratic behaviour
        spike = 1.0 + (random.random() > 0.8) * 2.5
        readings.append({
            "timestamp": ts,
            "temperature": round(88 + progress * 15 + random.gauss(0, 2) * spike, 2),
            "vibration": round(3.8 + progress * 2.5 + random.gauss(0, 0.5) * spike, 2),
            "pressure": round(7.2 + progress * 1.5 + random.gauss(0, 0.3), 2),
            "rpm": round(2200 - progress * 400 + random.gauss(0, 100), 0),
            "current": round(17 + progress * 5 + random.gauss(0, 0.5), 2),
            "voltage": round(215 - progress * 15 + random.gauss(0, 2), 1),
            "oil_level": round(max(5, 25 - i * 0.8), 1),
            "humidity": round(random.gauss(50, 3), 1)
        })
    return readings


def generate_pressure_fault_readings(n: int) -> List[Dict[str, Any]]:
    """Hydraulic pressure fault — pressure spikes and drops."""
    timestamps = generate_timestamps(n)
    readings = []
    for i, ts in enumerate(timestamps):
        progress = i / n
        # Pressure oscillating and trending up
        pressure = 4.5 + math.sin(i * 0.5) * 1.5 + progress * 3
        readings.append({
            "timestamp": ts,
            "temperature": round(55 + progress * 12 + random.gauss(0, 1), 2),
            "vibration": round(1.5 + progress * 0.8 + random.gauss(0, 0.2), 2),
            "pressure": round(pressure + random.gauss(0, 0.4), 2),
            "rpm": round(2800 + random.gauss(0, 100), 0),
            "current": round(8.5 + progress * 2 + random.gauss(0, 0.2), 2),
            "voltage": round(random.gauss(230, 2), 1),
            "oil_level": round(70 - i * 0.2, 1),
            "humidity": round(random.gauss(50, 3), 1)
        })
    return readings


def generate_sensor_drift_readings(n: int) -> List[Dict[str, Any]]:
    """Subtle sensor drift — slow uncalibrated rise in readings over time."""
    timestamps = generate_timestamps(n)
    readings = []
    for i, ts in enumerate(timestamps):
        progress = i / n
        readings.append({
            "timestamp": ts,
            "temperature": round(55 + progress * 5, 2), # Slow drift
            "vibration": round(1.2 + progress * 0.2, 2),
            "pressure": round(4.5 + progress * 0.4, 2),
            "rpm": round(2800 + random.gauss(0, 10), 0), # Very stable
            "current": round(8.5 + progress * 0.3, 2),
            "voltage": round(230 + progress * 2, 1),
            "oil_level": round(70, 1),
            "humidity": round(50, 1)
        })
    return readings


SCENARIO_MAP = {
    "normal": generate_normal_readings,
    "overheating": generate_overheating_readings,
    "bearing_wear": generate_bearing_wear_readings,
    "critical": generate_critical_readings,
    "pressure_fault": generate_pressure_fault_readings,
    "sensor_drift": generate_sensor_drift_readings
}


def get_simulated_data(scenario: str = "overheating", n: int = 20) -> List[Dict[str, Any]]:
    """Get simulated readings for a given scenario."""
    generator = SCENARIO_MAP.get(scenario, generate_overheating_readings)
    return generator(n)
