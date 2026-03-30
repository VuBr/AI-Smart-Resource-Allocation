import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.engineer import Engineer


class EngineerRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self) -> list[Engineer]:
        result = await self.db.execute(select(Engineer))
        return list(result.scalars().all())

    async def get_by_id(self, engineer_id: uuid.UUID) -> Engineer | None:
        result = await self.db.execute(select(Engineer).where(Engineer.id == engineer_id))
        return result.scalar_one_or_none()

    async def create(self, engineer: Engineer) -> Engineer:
        self.db.add(engineer)
        await self.db.commit()
        await self.db.refresh(engineer)
        return engineer
