import uuid
from datetime import date

from pydantic import BaseModel


class BenchForecastItem(BaseModel):
    engineer_id: uuid.UUID
    engineer_name: str
    forecast_date: date
    risk_level: str  # low/medium/high
    probability: float
    days_until_bench: int | None
    is_alert: bool


class BenchAlertItem(BaseModel):
    engineer_id: uuid.UUID
    engineer_name: str
    bench_start_date: date
    days_until_bench: int
    risk_level: str
