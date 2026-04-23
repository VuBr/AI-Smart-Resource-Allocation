import uuid
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import log_event
from app.models.allocation import Allocation
from app.models.bench_forecast import BenchForecast
from app.models.engineer import Engineer
from app.models.match_score import MatchScore
from app.models.project import Project
from app.schemas.allocation import RecommendationItem, RecommendationResponse
from app.services.llm_scoring import LLMScoringService


class AllocationRecommendationOrchestrator:
    def __init__(self) -> None:
        self.scoring_service = LLMScoringService()

    async def recommend_engineers(
        self,
        session: AsyncSession,
        project_id: uuid.UUID,
    ) -> RecommendationResponse:
        project = await self._get_project(session, project_id)
        if project is None:
            raise ValueError("Project not found")

        engineers = await self._get_engineers(session)
        active_allocations = await self._get_active_allocations(session)
        bench_forecasts = await self._get_latest_bench_forecasts(session)
        print("LOADED ORCHESTRATOR FILE:", __file__)
        allocations_by_engineer: dict[uuid.UUID, list[Allocation]] = defaultdict(list)
        for allocation in active_allocations:
            allocations_by_engineer[allocation.engineer_id].append(allocation)

        recommendations: list[RecommendationItem] = []
        match_scores_to_save: list[MatchScore] = []

        rule_results = []

        for engineer in engineers:
            rule_result = self.scoring_service._compute_rule_based_score(
                engineer=engineer,
                project=project,
                active_allocations=allocations_by_engineer.get(engineer.id, []),
                bench_forecast=bench_forecasts.get(engineer.id),
            )

            rule_results.append((engineer, rule_result))


        # STEP 2 — sort theo rule score
        rule_results.sort(key=lambda x: x[1].score, reverse=True)

        # STEP 3 — chọn TOP N (ví dụ 5)
        TOP_N = 5
        top_candidates = rule_results[:TOP_N]


        # STEP 4 — chỉ TOP N mới gọi LLM
        recommendations: list[RecommendationItem] = []
        match_scores_to_save: list[MatchScore] = []

        for engineer, _ in top_candidates:
            score_result = await self.scoring_service.score_engineer_project(
                engineer=engineer,
                project=project,
                active_allocations=allocations_by_engineer.get(engineer.id, []),
                bench_forecast=bench_forecasts.get(engineer.id),
            )

            match_scores_to_save.append(score_result)

            recommendations.append(
                RecommendationItem(
                    engineer_id=engineer.id,
                    engineer_name=engineer.name,
                    score=score_result.score,
                    skill_match=score_result.skill_match,
                    experience_match=score_result.experience_match,
                    availability_match=score_result.availability_match,
                    availability_percentage=engineer.availability_percentage,
                )
            )


        # STEP 5 — sort lại theo score cuối (LLM + rule)
        recommendations.sort(key=lambda item: item.score, reverse=True)

        # if match_scores_to_save:
        #     session.add_all(match_scores_to_save)
        #     await session.commit()

        log_event(
            "allocation_generated",
            project_id=str(project_id),
            candidate_count=len(recommendations),
        )
        print("ORCHESTRATOR METHOD CALLED")
        return RecommendationResponse(
            project_id=project_id,
            recommendations=recommendations,
        )

    async def _get_project(
        self,
        session: AsyncSession,
        project_id: uuid.UUID,
    ) -> Project | None:
        result = await session.execute(
            select(Project).where(Project.id == project_id)
        )
        return result.scalar_one_or_none()

    async def _get_engineers(
        self,
        session: AsyncSession,
    ) -> list[Engineer]:
        result = await session.execute(select(Engineer))
        return list(result.scalars().all())

    async def _get_active_allocations(
        self,
        session: AsyncSession,
    ) -> list[Allocation]:
        result = await session.execute(
            select(Allocation).where(Allocation.status == "active")
        )
        return list(result.scalars().all())

    async def _get_latest_bench_forecasts(
        self,
        session: AsyncSession,
    ) -> dict[uuid.UUID, BenchForecast]:
        result = await session.execute(select(BenchForecast))
        forecasts = list(result.scalars().all())

        latest_by_engineer: dict[uuid.UUID, BenchForecast] = {}
        for forecast in forecasts:
            existing = latest_by_engineer.get(forecast.engineer_id)
            if existing is None or forecast.forecast_date > existing.forecast_date:
                latest_by_engineer[forecast.engineer_id] = forecast

        return latest_by_engineer