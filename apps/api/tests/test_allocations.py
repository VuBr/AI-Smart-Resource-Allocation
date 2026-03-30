import uuid

import pytest


@pytest.mark.asyncio
async def test_recommend_returns_200(client):
    project_id = str(uuid.uuid4())
    response = await client.post(
        "/api/v1/allocations/recommend",
        json={"project_id": project_id},
    )
    assert response.status_code == 200
    body = response.json()
    assert "recommendations" in body
    assert isinstance(body["recommendations"], list)


@pytest.mark.asyncio
async def test_get_active_allocations_returns_200(client):
    response = await client.get("/api/v1/allocations/active")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_confirm_allocation_over_cap_returns_400(client):
    # Create an engineer with 80% allocation already via direct DB would be needed
    # For scaffold: test that 400 format is correct with a synthetic scenario
    # Use a UUID that won't exist — 404 from project doesn't apply here
    # Actually test the flow: first confirm at 100%, then try to add more
    engineer_id = str(uuid.uuid4())
    project_id = str(uuid.uuid4())

    # First allocation: 100%
    r1 = await client.post(
        "/api/v1/allocations/confirm",
        json={"engineer_id": engineer_id, "project_id": project_id, "percentage": 100},
    )
    assert r1.status_code == 201

    # Second allocation: would exceed 100%
    r2 = await client.post(
        "/api/v1/allocations/confirm",
        json={"engineer_id": engineer_id, "project_id": str(uuid.uuid4()), "percentage": 1},
    )
    assert r2.status_code == 400
    body = r2.json()
    assert "error" in body
    assert body["error"]["code"] == "AllocationCapExceeded"


@pytest.mark.asyncio
async def test_confirm_allocation_valid_returns_201(client):
    engineer_id = str(uuid.uuid4())
    project_id = str(uuid.uuid4())
    response = await client.post(
        "/api/v1/allocations/confirm",
        json={"engineer_id": engineer_id, "project_id": project_id, "percentage": 50},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["percentage"] == 50
