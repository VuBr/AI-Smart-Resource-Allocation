"""
Unit tests for LLMScoringService stub.
Bảo vệ AC-13: stub phải có đúng fields, llm_provider="stub", model_version="stub-v0".
"""
import uuid

import pytest

from app.services.llm_scoring import LLMScoringService


@pytest.mark.asyncio
async def test_stub_returns_required_fields():
    """Stub phải trả về tất cả fields theo schema: score, skill_match, experience_match, availability_match."""
    service = LLMScoringService()
    engineer_id = uuid.uuid4()
    project_id = uuid.uuid4()
    result = await service.score_engineer_project(engineer_id, project_id)

    required_fields = [
        "engineer_id",
        "project_id",
        "score",
        "skill_match",
        "experience_match",
        "availability_match",
        "llm_provider",
        "model_version",
    ]
    for field in required_fields:
        assert field in result, f"Missing field: {field}"


@pytest.mark.asyncio
async def test_stub_llm_provider_is_stub():
    """llm_provider phải là 'stub' (không phải openai, anthropic, v.v.)."""
    service = LLMScoringService()
    result = await service.score_engineer_project(uuid.uuid4(), uuid.uuid4())
    assert result["llm_provider"] == "stub"


@pytest.mark.asyncio
async def test_stub_model_version_is_stub_v0():
    """model_version phải là 'stub-v0' theo spec."""
    service = LLMScoringService()
    result = await service.score_engineer_project(uuid.uuid4(), uuid.uuid4())
    assert result["model_version"] == "stub-v0"


@pytest.mark.asyncio
async def test_stub_scores_are_floats_between_0_and_1():
    """score, skill_match, experience_match, availability_match phải là float trong [0, 1]."""
    service = LLMScoringService()
    result = await service.score_engineer_project(uuid.uuid4(), uuid.uuid4())
    for field in ("score", "skill_match", "experience_match", "availability_match"):
        value = result[field]
        assert isinstance(value, float), f"{field} phải là float"
        assert 0.0 <= value <= 1.0, f"{field}={value} ngoài range [0, 1]"


@pytest.mark.asyncio
async def test_stub_returns_correct_ids():
    """engineer_id và project_id trong result phải khớp với input."""
    service = LLMScoringService()
    engineer_id = uuid.uuid4()
    project_id = uuid.uuid4()
    result = await service.score_engineer_project(engineer_id, project_id)
    assert result["engineer_id"] == engineer_id
    assert result["project_id"] == project_id
