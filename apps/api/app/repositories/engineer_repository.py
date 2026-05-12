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

    async def get_by_email(self, email: str) -> Engineer | None:
        result = await self.db.execute(select(Engineer).where(Engineer.email == email))
        return result.scalar_one_or_none()

    async def create(self, engineer: Engineer) -> Engineer:
        self.db.add(engineer)
        await self.db.commit()
        await self.db.refresh(engineer)
        return engineer

    async def upsert_by_email(self, data: dict) -> tuple[Engineer, bool]:
        """
        Insert nếu email chưa tồn tại, Update nếu đã tồn tại.
        Returns (engineer, inserted) — inserted=True nếu INSERT, False nếu UPDATE.
        Optional fields bỏ trống sẽ overwrite DB thành None.
        """
        result = await self.db.execute(select(Engineer).where(Engineer.email == data["email"]))
        existing = result.scalar_one_or_none()

        if existing is not None:
            for key, value in data.items():
                setattr(existing, key, value)
            await self.db.flush()
            await self.db.refresh(existing)
            await self.db.commit()
            return existing, False

        engineer = Engineer(**data)
        self.db.add(engineer)
        await self.db.commit()
        await self.db.refresh(engineer)
        return engineer, True
