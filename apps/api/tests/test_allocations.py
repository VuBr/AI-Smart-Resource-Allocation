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


# --- IT: GET /allocations/recommendations/{project_id} (C-10) ---


@pytest.mark.asyncio
async def test_get_recommendations_returns_200(client):
    """GET /recommendations/{project_id} với project_id tồn tại → 200."""
    # Tạo project trước
    import io

    csv_content = b"name,description,status\nTest Project,Desc,active\n"
    await client.post(
        "/api/v1/projects/upload",
        files={"file": ("projects.csv", io.BytesIO(csv_content), "text/csv")},
    )
    projects = (await client.get("/api/v1/projects")).json()

    if len(projects) > 0:
        project_id = projects[0]["id"]
        resp = await client.get(f"/api/v1/allocations/recommendations/{project_id}")
        assert resp.status_code == 200
        body = resp.json()
        assert "recommendations" in body
        assert isinstance(body["recommendations"], list)


@pytest.mark.asyncio
async def test_get_recommendations_invalid_project_returns_404(client):
    """GET /recommendations/{non_existent_id} → 404."""
    non_existent = "00000000-0000-0000-0000-000000000099"
    resp = await client.get(f"/api/v1/allocations/recommendations/{non_existent}")
    assert resp.status_code == 404
    body = resp.json()
    assert "error" in body
    assert body["error"]["code"] == "ProjectNotFound"


@pytest.mark.asyncio
async def test_update_allocation_returns_200(client):
    engineer_id = str(uuid.uuid4())
    project_id = str(uuid.uuid4())
    created = await client.post(
        "/api/v1/allocations/confirm",
        json={"engineer_id": engineer_id, "project_id": project_id, "percentage": 40},
    )
    assert created.status_code == 201
    allocation_id = created.json()["id"]

    updated = await client.patch(
        f"/api/v1/allocations/{allocation_id}",
        json={"percentage": 60},
    )
    assert updated.status_code == 200
    assert updated.json()["percentage"] == 60


@pytest.mark.asyncio
async def test_delete_allocation_returns_204(client):
    engineer_id = str(uuid.uuid4())
    project_id = str(uuid.uuid4())
    created = await client.post(
        "/api/v1/allocations/confirm",
        json={"engineer_id": engineer_id, "project_id": project_id, "percentage": 40},
    )
    assert created.status_code == 201
    allocation_id = created.json()["id"]

    deleted = await client.delete(f"/api/v1/allocations/{allocation_id}")
    assert deleted.status_code == 204
