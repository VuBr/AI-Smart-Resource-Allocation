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

    async def get_by_id(self, allocation_id: uuid.UUID) -> Allocation | None:
        return await self.db.get(Allocation, allocation_id)

    async def update(
        self,
        allocation: Allocation,
        *,
        percentage: int,
        start_date,
        end_date,
    ) -> Allocation:
        allocation.percentage = percentage
        allocation.start_date = start_date
        allocation.end_date = end_date
        await self.db.commit()
        await self.db.refresh(allocation)
        return allocation

    async def delete(self, allocation: Allocation) -> None:
        await self.db.delete(allocation)
        await self.db.commit()

    async def get_total_percentage(self, engineer_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Allocation.percentage), 0)).where(
                Allocation.engineer_id == engineer_id,
                Allocation.status == "active",
            )
        )
        total = result.scalar_one()
        return int(total)

    async def get_total_percentage_excluding_allocation(
        self,
        engineer_id: uuid.UUID,
        allocation_id: uuid.UUID,
    ) -> int:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Allocation.percentage), 0)).where(
                Allocation.engineer_id == engineer_id,
                Allocation.status == "active",
                Allocation.id != allocation_id,
            )
        )
        total = result.scalar_one()
        return int(total)
