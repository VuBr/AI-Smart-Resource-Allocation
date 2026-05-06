from collections import Counter, defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.allocation import Allocation
from app.models.engineer import Engineer
from app.models.project import Project

router = APIRouter()


@router.get("/shortage")
async def get_shortage_report(db: AsyncSession = Depends(get_db)) -> list[dict[str, int | str]]:
    def parse_skills(raw: str | None) -> list[str]:
        if not raw:
            return []
        return [skill.strip() for skill in raw.split(",") if skill and skill.strip()]

    required_by_skill: Counter[str] = Counter()
    projects_result = await db.execute(
        select(Project.required_skills, Project.headcount).where(Project.status.in_(("active", "planned")))
    )
    for required_skills, headcount in projects_result.all():
        skills = parse_skills(required_skills)
        if not skills:
            continue
        demand = max(int(headcount or 0), 0)
        for skill in skills:
            required_by_skill[skill] += demand

    if not required_by_skill:
        return []

    allocations_result = await db.execute(
        select(Allocation.engineer_id, func.coalesce(func.sum(Allocation.percentage), 0))
        .where(Allocation.status == "active")
        .group_by(Allocation.engineer_id)
    )
    allocated_percent_by_engineer = {engineer_id: int(total or 0) for engineer_id, total in allocations_result.all()}

    engineers_result = await db.execute(
        select(
            Engineer.id,
            Engineer.primary_skill,
            Engineer.secondary_skills,
            Engineer.availability_percentage,
        )
    )
    available_engineers_by_skill: dict[str, set[str]] = defaultdict(set)
    for engineer_id, primary_skill, secondary_skills, availability_percentage in engineers_result.all():
        base_availability = int(availability_percentage or 0)
        if base_availability <= 0:
            continue

        allocated_percent = allocated_percent_by_engineer.get(engineer_id, 0)
        if base_availability - allocated_percent <= 0:
            continue

        skill_set = set(parse_skills(secondary_skills))
        if primary_skill and primary_skill.strip():
            skill_set.add(primary_skill.strip())

        for skill in skill_set:
            available_engineers_by_skill[skill].add(str(engineer_id))

    response: list[dict[str, int | str]] = []
    for skill, required in required_by_skill.items():
        available = len(available_engineers_by_skill.get(skill, set()))
        gap = required - available
        if gap > 0:
            response.append(
                {
                    "skill": skill,
                    "required": required,
                    "available": available,
                    "gap": gap,
                }
            )

    response.sort(key=lambda item: (-int(item["gap"]), str(item["skill"]).lower()))
    return response
