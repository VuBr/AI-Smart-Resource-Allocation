import uuid

from app.core.logging import log_event


class LLMScoringService:
    async def score_engineer_project(
        self,
        engineer_id: uuid.UUID,
        project_id: uuid.UUID,
    ) -> dict:
        """
        STUB: Returns static mock scores.
        Real LLM calls are out of scope for Phase 5.
        """
        result = {
            "engineer_id": engineer_id,
            "project_id": project_id,
            "score": 0.75,
            "skill_match": 0.80,
            "experience_match": 0.70,
            "availability_match": 0.75,
            "llm_provider": "stub",
            "model_version": "stub-v0",
        }
        log_event(
            "llm_score_computed",
            engineer_id=str(engineer_id),
            project_id=str(project_id),
            provider="stub",
        )
        return result
