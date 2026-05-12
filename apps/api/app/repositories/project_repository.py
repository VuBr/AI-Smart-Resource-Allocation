import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project


class ProjectRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self) -> list[Project]:
        result = await self.db.execute(select(Project))
        return list(result.scalars().all())

    async def get_by_id(self, project_id: uuid.UUID) -> Project | None:
        result = await self.db.execute(select(Project).where(Project.id == project_id))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Project | None:
        result = await self.db.execute(select(Project).where(Project.name == name))
        return result.scalar_one_or_none()

    async def create(self, project: Project) -> Project:
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def upsert_by_name(self, data: dict) -> tuple[Project, bool]:
        """
        Insert nếu name chưa tồn tại, Update nếu đã tồn tại.
        Returns (project, inserted) — inserted=True nếu INSERT, False nếu UPDATE.
        Optional fields bỏ trống sẽ overwrite DB thành None.
        """
        result = await self.db.execute(select(Project).where(Project.name == data["name"]))
        existing = result.scalar_one_or_none()

        if existing is not None:
            for key, value in data.items():
                setattr(existing, key, value)
            await self.db.flush()
            await self.db.refresh(existing)
            await self.db.commit()
            return existing, False

        project = Project(**data)
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project, True
