import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.allocation import Allocation


class AllocationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_active(self) -> list[Allocation]:
        result = await self.db.execute(select(Allocation).where(Allocation.status == "active"))
        return list(result.scalars().all())

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
