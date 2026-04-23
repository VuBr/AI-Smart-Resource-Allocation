from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)) -> DashboardStats:
    repo = DashboardRepository(db)
    total_engineers = await repo.get_total_engineers()
    allocated_engineers = await repo.get_allocated_engineers()
    active_projects = await repo.get_active_projects()
    total_active_allocation = await repo.get_total_active_allocation_percentage()

    engineers_on_bench = max(total_engineers - allocated_engineers, 0)
    allocation_rate_percentage = (
        round(total_active_allocation / total_engineers) if total_engineers > 0 else 0
    )
    allocation_rate_percentage = int(min(max(allocation_rate_percentage, 0), 100))

    return DashboardStats(
        total_engineers=total_engineers,
        engineers_on_bench=engineers_on_bench,
        active_projects=active_projects,
        allocation_rate_percentage=allocation_rate_percentage,
    )
