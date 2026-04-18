import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, field_validator, model_validator


class ProjectCsvRow(BaseModel):
    """Validate một row CSV project. Input là dict với tất cả values là str (từ Pandas dtype=str)."""

    name: str
    description: str | None = None
    required_skills: str | None = None
    required_level: Literal["junior", "mid", "senior", "lead"] | None = None
    headcount: int = 1
    status: Literal["planned", "active", "closed"] = "planned"
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="before")
    @classmethod
    def _coerce_and_strip(cls, values: dict) -> dict:
        """Strip whitespace và convert empty string sang None / default cho từng field."""
        out: dict = {}
        for key, val in values.items():
            out[key] = val.strip() if isinstance(val, str) else val

        # Empty string → None cho optional string fields
        for field in ("description", "required_skills", "required_level", "start_date", "end_date"):
            if out.get(field) == "":
                out[field] = None

        # headcount: empty → default 1
        if out.get("headcount") == "":
            out["headcount"] = 1

        # status: empty → default "planned"
        if out.get("status") == "":
            out["status"] = "planned"

        return out

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str) -> str:
        if not v:
            raise ValueError("name is required")
        if len(v) > 200:
            raise ValueError("name must not exceed 200 characters")
        return v

    @field_validator("description")
    @classmethod
    def _validate_description(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 1000:
            raise ValueError("description must not exceed 1000 characters")
        return v

    @field_validator("required_skills")
    @classmethod
    def _validate_required_skills(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("required_skills must not exceed 500 characters")
        return v

    @field_validator("headcount", mode="before")
    @classmethod
    def _validate_headcount(cls, v: object) -> int:
        try:
            parsed = int(str(v)) if not isinstance(v, int) else v
        except (ValueError, TypeError):
            raise ValueError("headcount must be an integer")
        if parsed <= 0:
            raise ValueError("headcount must be > 0")
        return parsed

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def _parse_date(cls, v: object) -> date | None:
        if v is None or v == "":
            return None
        try:
            return date.fromisoformat(str(v))
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format")

    @model_validator(mode="after")
    def _validate_date_range(self) -> "ProjectCsvRow":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError(
                f"end_date must be >= start_date (end: {self.end_date}, start: {self.start_date})"
            )
        return self

    def to_db_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "required_skills": self.required_skills,
            "required_level": self.required_level,
            "headcount": self.headcount,
            "status": self.status,
            "start_date": self.start_date,
            "end_date": self.end_date,
        }


class ProjectListItem(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    required_skills: str | None
    required_level: str | None
    headcount: int
    status: str
    start_date: date | None
    end_date: date | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectResponse(ProjectListItem):
    updated_at: datetime
