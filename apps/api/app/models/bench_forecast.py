import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Index, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class BenchForecast(Base):
    __tablename__ = "bench_forecasts"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    engineer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("engineers.id", ondelete="CASCADE"), nullable=False
    )
    forecast_date: Mapped[date] = mapped_column(Date, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)  # low/medium/high
    probability: Mapped[float] = mapped_column(Float, default=0.0)  # 0.0 - 1.0
    days_until_bench: Mapped[int | None] = mapped_column(nullable=True)
    is_alert: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_bench_forecasts_engineer_id", "engineer_id"),
        Index("ix_bench_forecasts_forecast_date", "forecast_date"),
    )
