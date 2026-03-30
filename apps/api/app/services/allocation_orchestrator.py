import uuid

from app.core.logging import log_event
from app.schemas.allocation import RecommendationItem, RecommendationResponse


class AllocationRecommendationOrchestrator:
    async def recommend_engineers(self, project_id: uuid.UUID) -> RecommendationResponse:
        """
        STUB: Return mock recommendations with correct schema.
        Real LLM scoring and constraint engine integration is Phase 6+.
        """
        mock_recommendations = [
            RecommendationItem(
                engineer_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                engineer_name="Mock Engineer A",
                score=0.85,
                skill_match=0.90,
                experience_match=0.80,
                availability_match=0.85,
                availability_percentage=100,
            ),
            RecommendationItem(
                engineer_id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
                engineer_name="Mock Engineer B",
                score=0.72,
                skill_match=0.75,
                experience_match=0.70,
                availability_match=0.70,
                availability_percentage=50,
            ),
        ]
        log_event(
            "allocation_generated",
            project_id=str(project_id),
            candidate_count=len(mock_recommendations),
        )
        return RecommendationResponse(
            project_id=project_id,
            recommendations=mock_recommendations,
        )
