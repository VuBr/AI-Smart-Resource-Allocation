"""
Seed script for RA-001 Phase 5 scaffold.
Creates 5 engineers, 3 projects, 3 allocations per test-data.md spec.
"""

import asyncio
import sys
from datetime import date, timedelta

sys.path.insert(0, "/app")

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.models.allocation import Allocation
from app.models.engineer import Engineer
from app.models.project import Project


async def seed() -> None:
    settings = get_settings()
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    today = date.today()

    async with session_factory() as db:
        # Check if already seeded
        from sqlalchemy import select

        result = await db.execute(select(Engineer).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping.")
            return

        # Engineers
        e1 = Engineer(
            name="Nguyen Van An",
            email="an.nguyen@example.com",
            primary_skill="Backend (Python)",
            secondary_skills="DevOps",
            level="senior",
            years_of_experience=5,
            availability_percentage=100,
            bench_start_date=today + timedelta(days=30),  # E001: alert in exactly 30 days
        )
        e2 = Engineer(
            name="Tran Thi Bich",
            email="bich.tran@example.com",
            primary_skill="Frontend (React)",
            secondary_skills="TypeScript",
            level="mid",
            years_of_experience=3,
            availability_percentage=20,
            bench_start_date=None,
        )
        e3 = Engineer(
            name="Le Minh Cuong",
            email="cuong.le@example.com",
            primary_skill="Fullstack (Node/React)",
            secondary_skills="PostgreSQL",
            level="senior",
            years_of_experience=7,
            availability_percentage=50,
            bench_start_date=None,
        )
        e4 = Engineer(
            name="Pham Duc Dung",
            email="dung.pham@example.com",
            primary_skill="Backend (Java)",
            secondary_skills=None,
            level="junior",
            years_of_experience=1,
            availability_percentage=100,
            bench_start_date=today - timedelta(days=10),  # E004: already on bench -10 days
        )
        e5 = Engineer(
            name="Hoang Thi Em",
            email="em.hoang@example.com",
            primary_skill="Data Engineering",
            secondary_skills="Python, Spark",
            level="mid",
            years_of_experience=4,
            availability_percentage=0,
            bench_start_date=None,
        )

        # Projects
        p1 = Project(
            name="AI Platform v2",
            description="Internal AI platform upgrade",
            required_skills="Backend (Python), ML",
            required_level="senior",
            headcount=2,
            status="active",
            start_date=today - timedelta(days=30),
            end_date=today + timedelta(days=90),
        )
        p2 = Project(
            name="Customer Portal",
            description="Customer-facing web portal",
            required_skills="Frontend (React), TypeScript",
            required_level="mid",
            headcount=2,
            status="planned",
            start_date=today + timedelta(days=14),
            end_date=today + timedelta(days=120),
        )
        p3 = Project(
            name="Legacy Migration",
            description="Migrate legacy Java services",
            required_skills="Backend (Java)",
            required_level="senior",
            headcount=1,
            status="closed",
            start_date=today - timedelta(days=180),
            end_date=today - timedelta(days=30),
        )

        db.add_all([e1, e2, e3, e4, e5, p1, p2, p3])
        await db.flush()

        # Allocations: E002 → P2 (80%), E003 → P1 (50%), E005 → P1 (100% — no capacity)
        a1 = Allocation(
            engineer_id=e2.id,
            project_id=p2.id,
            percentage=80,
            status="active",
            start_date=p2.start_date,
            end_date=p2.end_date,
        )
        a2 = Allocation(
            engineer_id=e3.id,
            project_id=p1.id,
            percentage=50,
            status="active",
            start_date=p1.start_date,
            end_date=p1.end_date,
        )
        a3 = Allocation(
            engineer_id=e5.id,
            project_id=p1.id,
            percentage=100,
            status="active",
            start_date=p1.start_date,
            end_date=p1.end_date,
        )

        db.add_all([a1, a2, a3])
        await db.commit()

    await engine.dispose()
    print(f"Seeded: 5 engineers, 3 projects, 3 allocations (date: {today})")
    print(f"  E001 bench_start_date = {today + timedelta(days=30)} (alert in 30 days)")
    print(f"  E004 bench_start_date = {today - timedelta(days=10)} (already on bench)")


if __name__ == "__main__":
    asyncio.run(seed())
