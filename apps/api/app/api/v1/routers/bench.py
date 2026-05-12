from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.repositories.engineer_repository import EngineerRepository
from app.schemas.bench_forecast import BenchAlertItem, BenchForecastItem
from app.services.bench_prediction import BenchPredictionEngine

router = APIRouter()


@router.get("/forecast", response_model=list[BenchForecastItem])
async def get_bench_forecast(db: AsyncSession = Depends(get_db)) -> list[BenchForecastItem]:
    repo = EngineerRepository(db)
    engineers = await repo.get_all()
    engine = BenchPredictionEngine()
    forecasts = []
    for engineer in engineers:
        forecast = await engine.predict_bench(engineer)
        forecasts.append(BenchForecastItem(**forecast))
    return forecasts


@router.get("/alerts", response_model=list[BenchAlertItem])
async def get_bench_alerts(db: AsyncSession = Depends(get_db)) -> list[BenchAlertItem]:
    repo = EngineerRepository(db)
    engineers = await repo.get_all()
    engine = BenchPredictionEngine()
    alerts = await engine.get_alerts(engineers)
    return [BenchAlertItem(**a) for a in alerts]
