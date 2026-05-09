import re
import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, field_validator, model_validator

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class EngineerCsvRow(BaseModel):
    """Validate một row CSV engineer. Input là dict với values là str (từ Pandas dtype=str)."""

    name: str
    email: str
    primary_skill: str
    level: Literal["junior", "mid", "senior", "lead"]
    secondary_skills: str | None = None
    years_of_experience: int = 0
    availability_percentage: int = 100
    bench_start_date: date | None = None

    @model_validator(mode="before")
    @classmethod
    def _coerce_and_strip(cls, values: dict) -> dict:
        out: dict = {}
        for key, val in values.items():
            out[key] = val.strip() if isinstance(val, str) else val

        for field in ("secondary_skills", "bench_start_date"):
            if out.get(field) == "":
                out[field] = None

        if out.get("years_of_experience") == "":
            out["years_of_experience"] = 0

        if out.get("availability_percentage") == "":
            out["availability_percentage"] = 100

        return out

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str) -> str:
        if not v:
            raise ValueError("name is required")
        if len(v) > 200:
            raise ValueError("name must not exceed 200 characters")
        return v

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        if not v:
            raise ValueError("email is required")
        if not _EMAIL_RE.match(v):
            raise ValueError("value is not a valid email address")
        return v

    @field_validator("primary_skill")
    @classmethod
    def _validate_primary_skill(cls, v: str) -> str:
        if not v:
            raise ValueError("primary_skill is required")
        if len(v) > 100:
            raise ValueError("primary_skill must not exceed 100 characters")
        return v

    @field_validator("secondary_skills")
    @classmethod
    def _validate_secondary_skills(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("secondary_skills must not exceed 500 characters")
        return v

    @field_validator("years_of_experience", mode="before")
    @classmethod
    def _validate_years(cls, v: object) -> int:
        try:
            parsed = int(str(v)) if not isinstance(v, int) else v
        except (ValueError, TypeError):
            raise ValueError("years_of_experience must be an integer")
        if parsed < 0:
            raise ValueError("years_of_experience must be >= 0")
        return parsed

    @field_validator("availability_percentage", mode="before")
    @classmethod
    def _validate_availability(cls, v: object) -> int:
        try:
            parsed = int(str(v)) if not isinstance(v, int) else v
        except (ValueError, TypeError):
            raise ValueError("availability_percentage must be an integer")
        if not (0 <= parsed <= 100):
            raise ValueError(f"availability_percentage must be between 0 and 100 (got: {parsed})")
        return parsed

    @field_validator("bench_start_date", mode="before")
    @classmethod
    def _parse_date(cls, v: object) -> date | None:
        if v is None or v == "":
            return None
        try:
            return date.fromisoformat(str(v))
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format")

    def to_db_dict(self) -> dict:
        return {
            "name": self.name,
            "email": self.email,
            "primary_skill": self.primary_skill,
            "level": self.level,
            "secondary_skills": self.secondary_skills,
            "years_of_experience": self.years_of_experience,
            "availability_percentage": self.availability_percentage,
            "bench_start_date": self.bench_start_date,
        }


class EngineerResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    primary_skill: str
    secondary_skills: str | None
    level: str
    years_of_experience: int
    availability_percentage: int
    bench_start_date: date | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EngineerListResponse(BaseModel):
    items: list[EngineerResponse]
    total: int


class EngineerCreateRequest(BaseModel):
    name: str
    email: str
    primary_skill: str
    level: Literal["junior", "mid", "senior", "lead"]
    secondary_skills: str | None = None
    years_of_experience: int = 0
    availability_percentage: int = 100
    bench_start_date: date | None = None

    @model_validator(mode="before")
    @classmethod
    def _coerce_and_strip_create(cls, values: dict) -> dict:
        return EngineerCsvRow._coerce_and_strip(values)

    @field_validator("name")
    @classmethod
    def _validate_name_create(cls, v: str) -> str:
        return EngineerCsvRow._validate_name(v)

    @field_validator("email")
    @classmethod
    def _validate_email_create(cls, v: str) -> str:
        return EngineerCsvRow._validate_email(v)

    @field_validator("primary_skill")
    @classmethod
    def _validate_primary_skill_create(cls, v: str) -> str:
        return EngineerCsvRow._validate_primary_skill(v)

    @field_validator("secondary_skills")
    @classmethod
    def _validate_secondary_skills_create(cls, v: str | None) -> str | None:
        return EngineerCsvRow._validate_secondary_skills(v)

    @field_validator("years_of_experience", mode="before")
    @classmethod
    def _validate_years_create(cls, v: object) -> int:
        return EngineerCsvRow._validate_years(v)

    @field_validator("availability_percentage", mode="before")
    @classmethod
    def _validate_availability_create(cls, v: object) -> int:
        return EngineerCsvRow._validate_availability(v)

    @field_validator("bench_start_date", mode="before")
    @classmethod
    def _parse_date_create(cls, v: object) -> date | None:
        return EngineerCsvRow._parse_date(v)

    def to_db_dict(self) -> dict:
        return {
            "name": self.name,
            "email": self.email,
            "primary_skill": self.primary_skill,
            "level": self.level,
            "secondary_skills": self.secondary_skills,
            "years_of_experience": self.years_of_experience,
            "availability_percentage": self.availability_percentage,
            "bench_start_date": self.bench_start_date,
        }
