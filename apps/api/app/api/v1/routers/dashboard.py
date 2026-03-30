from fastapi import APIRouter

from app.schemas.dashboard import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats() -> DashboardStats:
    # OI-15 DECIDED: Mock data for Phase 5
    return DashboardStats(
        total_engineers=5,
        engineers_on_bench=1,
        active_projects=3,
        allocation_rate_percentage=80,
    )
