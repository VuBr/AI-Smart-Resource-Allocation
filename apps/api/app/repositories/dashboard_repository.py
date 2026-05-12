from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.allocation import Allocation
from app.models.engineer import Engineer
from app.models.project import Project


class DashboardRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_total_engineers(self) -> int:
        result = await self.db.execute(select(func.count(Engineer.id)))
        return int(result.scalar_one() or 0)

    async def get_active_projects(self) -> int:
        result = await self.db.execute(
            select(func.count(Project.id)).where(Project.status == "active")
        )
        return int(result.scalar_one() or 0)

    async def get_allocated_engineers(self) -> int:
        result = await self.db.execute(
            select(func.count(distinct(Allocation.engineer_id))).where(
                Allocation.status == "active"
            )
        )
        return int(result.scalar_one() or 0)

    async def get_total_active_allocation_percentage(self) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Allocation.percentage), 0)).where(
                Allocation.status == "active"
            )
        )
        return int(result.scalar_one() or 0)

    async def get_partially_available_engineers(self) -> int:
        result = await self.db.execute(
            select(func.count(Engineer.id)).where(
                Engineer.availability_percentage > 0,
                Engineer.availability_percentage < 100,
                Engineer.bench_start_date.is_(None),
            )
        )
        return int(result.scalar_one() or 0)
