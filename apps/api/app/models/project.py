import uuid
from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    required_skills: Mapped[str | None] = mapped_column(String(500), nullable=True)
    required_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    headcount: Mapped[int] = mapped_column(default=1)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="planned"
    )  # planned/active/closed
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=lambda: datetime.now(UTC)
    )
