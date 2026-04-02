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
async def test_dashboard_stats_returns_mock_data(client):
    response = await client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    body = response.json()
    assert "total_engineers" in body
    assert "engineers_on_bench" in body
    assert "active_projects" in body
    assert "allocation_rate_percentage" in body


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
