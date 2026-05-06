"""
Integration tests cho auth endpoint.
Bảo vệ AC-5: POST /auth/login — mock JWT stub.
"""

import pytest


@pytest.mark.asyncio
async def test_login_valid_credentials_returns_200_with_token(client):
    """Bất kỳ email/password hợp lệ → 200 + access_token trong body."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "any@example.com", "password": "anypassword"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert isinstance(body["access_token"], str)
    assert len(body["access_token"]) > 0
    assert body["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_malformed_body_returns_422(client):
    """Body thiếu field bắt buộc → 422 Unprocessable Entity."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "only-email@example.com"},  # thiếu password
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_empty_body_returns_422(client):
    """Body rỗng → 422."""
    response = await client.post("/api/v1/auth/login", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_stub_accepts_any_valid_credentials(client):
    """Phase 5 stub: mọi credentials đều được chấp nhận — không có validation thật."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
