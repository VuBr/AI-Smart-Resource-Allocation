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
