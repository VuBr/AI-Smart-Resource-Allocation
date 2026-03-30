import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class AllocationConfirmRequest(BaseModel):
    engineer_id: uuid.UUID
    project_id: uuid.UUID
    percentage: int = Field(ge=1, le=100)
    start_date: date | None = None
    end_date: date | None = None


class AllocationConfirmResponse(BaseModel):
    id: uuid.UUID
    engineer_id: uuid.UUID
    project_id: uuid.UUID
    percentage: int
    status: str
    start_date: date | None
    end_date: date | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AllocationActiveItem(BaseModel):
    id: uuid.UUID
    engineer_id: uuid.UUID
    project_id: uuid.UUID
    percentage: int
    status: str
    start_date: date | None
    end_date: date | None

    model_config = {"from_attributes": True}


class RecommendationItem(BaseModel):
    engineer_id: uuid.UUID
    engineer_name: str
    score: float
    skill_match: float
    experience_match: float
    availability_match: float
    availability_percentage: int


class RecommendationResponse(BaseModel):
    project_id: uuid.UUID
    recommendations: list[RecommendationItem]
