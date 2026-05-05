import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.allocation import Allocation
from app.models.engineer import Engineer
from app.models.project import Project


class AllocationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_active(self) -> list[dict]:
        result = await self.db.execute(
            select(
                Allocation.id,
                Allocation.engineer_id,
                Engineer.name.label("engineer_name"),
                Allocation.project_id,
                Project.name.label("project_name"),
                Allocation.percentage,
                Allocation.status,
                Allocation.start_date,
                Allocation.end_date,
            )
            .join(Engineer, Engineer.id == Allocation.engineer_id)
            .join(Project, Project.id == Allocation.project_id)
            .where(Allocation.status == "active")
        )
        return [dict(row._mapping) for row in result.all()]

    async def create(self, allocation: Allocation) -> Allocation:
        self.db.add(allocation)
        await self.db.commit()
        await self.db.refresh(allocation)
        return allocation

    async def get_total_percentage(self, engineer_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Allocation.percentage), 0)).where(
                Allocation.engineer_id == engineer_id,
                Allocation.status == "active",
            )
        )
        total = result.scalar_one()
        return int(total)
