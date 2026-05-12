import uuid
from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, Index, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Engineer(Base):
    __tablename__ = "engineers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    primary_skill: Mapped[str] = mapped_column(String(100), nullable=False)
    secondary_skills: Mapped[str | None] = mapped_column(String(500), nullable=True)
    level: Mapped[str] = mapped_column(String(50), nullable=False)  # junior/mid/senior/lead
    years_of_experience: Mapped[int] = mapped_column(default=0)
    availability_percentage: Mapped[int] = mapped_column(default=100)
    bench_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=lambda: datetime.now(UTC)
    )

    __table_args__ = (
        Index("ix_engineers_email", "email", unique=True),
        Index("ix_engineers_primary_skill", "primary_skill"),
    )
