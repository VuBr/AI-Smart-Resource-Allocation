import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import log_event
from app.db.database import get_db
from app.models.allocation import Allocation
from app.repositories.allocation_repository import AllocationRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.allocation import (
    AllocationActiveItem,
    AllocationConfirmRequest,
    AllocationConfirmResponse,
    RecommendationResponse,
)
from app.schemas.common import ErrorDetail, ErrorResponse
from app.services.allocation_orchestrator import AllocationRecommendationOrchestrator

router = APIRouter()


class RecommendationRequest(BaseModel):
    project_id: uuid.UUID


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_engineers(
    request: RecommendationRequest,
    db: AsyncSession = Depends(get_db),
) -> RecommendationResponse:
    repo = ProjectRepository(db)
    project = await repo.get_by_id(request.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="ProjectNotFound",
                    message=f"Project {request.project_id} not found",
                )
            ).model_dump(),
        )

    orchestrator = AllocationRecommendationOrchestrator()
    return await orchestrator.recommend_engineers(
        session=db,
        project_id=request.project_id,
    )


@router.get("/recommendations/{project_id}", response_model=RecommendationResponse)
async def get_recommendations(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> RecommendationResponse:
    repo = ProjectRepository(db)
    project = await repo.get_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="ProjectNotFound",
                    message=f"Project {project_id} not found",
                )
            ).model_dump(),
        )

    orchestrator = AllocationRecommendationOrchestrator()
    return await orchestrator.recommend_engineers(
        session=db,
        project_id=project_id,
    )


@router.post(
    "/confirm",
    response_model=AllocationConfirmResponse,
    status_code=status.HTTP_201_CREATED,
)
async def confirm_allocation(
    request: AllocationConfirmRequest,
    db: AsyncSession = Depends(get_db),
) -> AllocationConfirmResponse:
    alloc_repo = AllocationRepository(db)

    current_total = await alloc_repo.get_total_percentage(request.engineer_id)
    if current_total + request.percentage > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="AllocationCapExceeded",
                    message=f"Total allocation would exceed 100% (current: {current_total}%)",
                )
            ).model_dump(),
        )

    allocation = Allocation(
        engineer_id=request.engineer_id,
        project_id=request.project_id,
        percentage=request.percentage,
        start_date=request.start_date,
        end_date=request.end_date,
        status="active",
    )
    saved = await alloc_repo.create(allocation)

    log_event(
        "allocation_confirmed",
        engineer_id=str(request.engineer_id),
        project_id=str(request.project_id),
    )

    return AllocationConfirmResponse.model_validate(saved)


@router.get("/active", response_model=list[AllocationActiveItem])
async def get_active_allocations(
    db: AsyncSession = Depends(get_db),
) -> list[AllocationActiveItem]:
    repo = AllocationRepository(db)
    allocations = await repo.get_active()
    return [AllocationActiveItem.model_validate(a) for a in allocations]
