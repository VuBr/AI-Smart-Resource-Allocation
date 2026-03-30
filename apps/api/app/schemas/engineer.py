import uuid
from datetime import date, datetime

from pydantic import BaseModel


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
