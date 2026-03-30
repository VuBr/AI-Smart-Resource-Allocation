import uuid
from datetime import date, datetime

from pydantic import BaseModel


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
