"""
Integration tests cho reports endpoint.
Bảo vệ AC-15: GET /reports/shortage.
"""
import pytest


@pytest.mark.asyncio
async def test_shortage_report_returns_200(client):
    """GET /reports/shortage → 200."""
    response = await client.get("/api/v1/reports/shortage")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_shortage_report_returns_list(client):
    """Response phải là list (không phải dict hay string)."""
    response = await client.get("/api/v1/reports/shortage")
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)


@pytest.mark.asyncio
async def test_shortage_report_items_have_required_fields(client):
    """Mỗi item trong list phải có: skill, required, available, gap."""
    response = await client.get("/api/v1/reports/shortage")
    body = response.json()
    assert len(body) > 0, "Shortage report phải có ít nhất 1 item"
    for item in body:
        assert "skill" in item, "Thiếu field 'skill'"
        assert "required" in item, "Thiếu field 'required'"
        assert "available" in item, "Thiếu field 'available'"
        assert "gap" in item, "Thiếu field 'gap'"
