import asyncio
import uuid
from datetime import date

from app.services.llm_scoring import LLMScoringService
from app.models.engineer import Engineer
from app.models.project import Project
from app.core.config import get_settings

async def main():
    service = LLMScoringService()

    engineer = Engineer(
        id=uuid.uuid4(),
        name="Alice",
        primary_skill="Python",
        secondary_skills="FastAPI, PostgreSQL",
        level="senior",
        years_of_experience=5,
        availability_percentage=100,
    )

    project = Project(
        id=uuid.uuid4(),
        name="AI System",
        description="Build backend system using Python and FastAPI",
        required_skills="Python, FastAPI",
        required_level="senior",
        headcount=2,
        status="active",
    )

    result = await service.score_engineer_project(engineer, project)

    print("score =", result.score)
    print("skill_match =", result.skill_match)
    print("experience_match =", result.experience_match)
    print("availability_match =", result.availability_match)
    print("explanation =", result.explanation)
    print("risk_notes =", result.risk_notes)
    print("llm_provider =", result.llm_provider)
    print("model_version =", result.model_version)
    settings = get_settings()
    print("LLM_PROVIDER =", settings.LLM_PROVIDER)
    print("LLM_MODEL =", settings.LLM_MODEL)
    print("GEMINI_API_KEY exists =", bool(settings.GEMINI_API_KEY))

asyncio.run(main())