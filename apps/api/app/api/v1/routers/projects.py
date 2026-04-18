import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.repositories.project_repository import ProjectRepository
from app.schemas.common import ErrorDetail, ErrorResponse
from app.schemas.project import ProjectListItem, ProjectResponse
from app.services.csv_ingestion import CSVIngestionService

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_projects(file: UploadFile, db: AsyncSession = Depends(get_db)) -> dict:
    service = CSVIngestionService()
    try:
        result = await service.parse_projects_csv(file, db)
        return result
    except OverflowError:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=ErrorResponse(
                error=ErrorDetail(code="FileTooLarge", message="File exceeds maximum allowed size")
            ).model_dump(),
        )
    except ValueError as e:
        msg = str(e)
        if msg == "invalid_encoding":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorResponse(
                    error=ErrorDetail(code="InvalidEncoding", message="File must be UTF-8 encoded")
                ).model_dump(),
            )
        if msg == "invalid_csv_header":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorResponse(
                    error=ErrorDetail(
                        code="InvalidCsvHeader", message="Missing required column: name"
                    )
                ).model_dump(),
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="InvalidCsv", message="File must be a valid CSV")
            ).model_dump(),
        )


@router.get("", response_model=list[ProjectListItem])
async def list_projects(db: AsyncSession = Depends(get_db)) -> list[ProjectListItem]:
    repo = ProjectRepository(db)
    projects = await repo.get_all()
    return [ProjectListItem.model_validate(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> ProjectResponse:
    repo = ProjectRepository(db)
    project = await repo.get_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(code="ProjectNotFound", message=f"Project {project_id} not found")
            ).model_dump(),
        )
    return ProjectResponse.model_validate(project)
