"""
Integration tests cho reports endpoint.
Bảo vệ AC-15: GET /reports/shortage.
"""

import pytest


@pytest.mark.asyncio
async def test_shortage_report_returns_200(client):
    """GET /reports/shortage -> 200."""
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
    assert response.status_code == 200

    body = response.json()
    for item in body:
        assert "skill" in item, "Thiếu field 'skill'"
        assert "required" in item, "Thiếu field 'required'"
        assert "available" in item, "Thiếu field 'available'"
        assert "gap" in item, "Thiếu field 'gap'"
        assert isinstance(item["skill"], str), "'skill' phải là string"
        assert isinstance(item["required"], int), "'required' phải là int"
        assert isinstance(item["available"], int), "'available' phải là int"
        assert isinstance(item["gap"], int), "'gap' phải là int"
        assert item["gap"] > 0, "API chỉ nên trả về các skill có gap > 0"
