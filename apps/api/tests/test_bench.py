import io
import uuid

import pytest


@pytest.mark.asyncio
async def test_bench_forecast_returns_200(client):
    response = await client.get("/api/v1/bench/forecast")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_bench_alerts_returns_200(client):
    response = await client.get("/api/v1/bench/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_health_returns_ok(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"


@pytest.mark.asyncio
async def test_dashboard_stats_returns_kpi_fields(client):
    response = await client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    body = response.json()
    assert "total_engineers" in body
    assert "engineers_on_bench" in body
    assert "active_projects" in body
    assert "allocation_rate_percentage" in body


@pytest.mark.asyncio
async def test_dashboard_stats_returns_real_aggregates(client):
    engineers_csv = (
        b"name,email,primary_skill,level,availability_percentage\n"
        b"Engineer A,a@example.com,Python,senior,100\n"
        b"Engineer B,b@example.com,React,mid,100\n"
    )
    projects_csv = (
        b"name,description,status\n"
        b"Project Active,Core project,active\n"
        b"Project Planned,Future project,planned\n"
    )

    upload_engineers = await client.post(
        "/api/v1/engineers/upload",
        files={"file": ("engineers.csv", io.BytesIO(engineers_csv), "text/csv")},
    )
    assert upload_engineers.status_code == 200

    upload_projects = await client.post(
        "/api/v1/projects/upload",
        files={"file": ("projects.csv", io.BytesIO(projects_csv), "text/csv")},
    )
    assert upload_projects.status_code == 200

    engineers = (await client.get("/api/v1/engineers")).json()
    projects = (await client.get("/api/v1/projects")).json()

    engineer_a_id = next(e["id"] for e in engineers if e["name"] == "Engineer A")
    active_project_id = next(p["id"] for p in projects if p["name"] == "Project Active")

    confirm = await client.post(
        "/api/v1/allocations/confirm",
        json={
            "engineer_id": engineer_a_id,
            "project_id": active_project_id,
            "percentage": 50,
        },
    )
    assert confirm.status_code == 201

    stats_response = await client.get("/api/v1/dashboard/stats")
    assert stats_response.status_code == 200
    stats = stats_response.json()

    assert stats["total_engineers"] == 2
    assert stats["engineers_on_bench"] == 1
    assert stats["active_projects"] == 1
    assert stats["allocation_rate_percentage"] == 25


# --- IT: GET /engineers/{id}/bench-forecast (C-5) ---

@pytest.mark.asyncio
async def test_bench_forecast_for_valid_engineer_returns_200(client):
    """Tạo engineer rồi lấy bench-forecast → 200 với đúng fields."""
    # Tạo engineer trước
    import io
    csv_content = b"name,email,primary_skill,level\nForecast Engineer,forecast@example.com,Python,senior\n"
    upload_resp = await client.post(
        "/api/v1/engineers/upload",
        files={"file": ("engineers.csv", io.BytesIO(csv_content), "text/csv")},
    )
    assert upload_resp.status_code == 200

    # Lấy danh sách để tìm engineer vừa tạo
    list_resp = await client.get("/api/v1/engineers")
    engineers = list_resp.json()

    if len(engineers) > 0:
        engineer_id = engineers[0]["id"]
        resp = await client.get(f"/api/v1/engineers/{engineer_id}/bench-forecast")
        assert resp.status_code == 200
        body = resp.json()
        assert "risk_level" in body
        assert "is_alert" in body


@pytest.mark.asyncio
async def test_bench_forecast_for_invalid_engineer_returns_404(client):
    """engineer_id không tồn tại → 404."""
    non_existent = "00000000-0000-0000-0000-000000000099"
    response = await client.get(f"/api/v1/engineers/{non_existent}/bench-forecast")
    assert response.status_code == 404
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "EngineerNotFound"
