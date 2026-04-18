import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.repositories.engineer_repository import EngineerRepository
from app.schemas.bench_forecast import BenchForecastItem
from app.schemas.common import ErrorDetail, ErrorResponse
from app.schemas.engineer import EngineerResponse
from app.services.bench_prediction import BenchPredictionEngine
from app.services.csv_ingestion import CSVIngestionService

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_engineers(file: UploadFile, db: AsyncSession = Depends(get_db)) -> dict:
    service = CSVIngestionService()
    try:
        result = await service.parse_engineers_csv(file, db)
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
                        code="InvalidCsvHeader",
                        message="Missing required columns: name, email, primary_skill, level",
                    )
                ).model_dump(),
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="InvalidCsv", message="File must be a valid CSV")
            ).model_dump(),
        )


@router.get("", response_model=list[EngineerResponse])
async def list_engineers(db: AsyncSession = Depends(get_db)) -> list[EngineerResponse]:
    repo = EngineerRepository(db)
    engineers = await repo.get_all()
    return [EngineerResponse.model_validate(e) for e in engineers]


@router.get("/{engineer_id}", response_model=EngineerResponse)
async def get_engineer(
    engineer_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> EngineerResponse:
    repo = EngineerRepository(db)
    engineer = await repo.get_by_id(engineer_id)
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="EngineerNotFound", message=f"Engineer {engineer_id} not found"
                )
            ).model_dump(),
        )
    return EngineerResponse.model_validate(engineer)


@router.get("/{engineer_id}/bench-forecast", response_model=BenchForecastItem)
async def get_bench_forecast(
    engineer_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> BenchForecastItem:
    repo = EngineerRepository(db)
    engineer = await repo.get_by_id(engineer_id)
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="EngineerNotFound", message=f"Engineer {engineer_id} not found"
                )
            ).model_dump(),
        )
    engine = BenchPredictionEngine()
    forecast = await engine.predict_bench(engineer)
    return BenchForecastItem(**forecast)
