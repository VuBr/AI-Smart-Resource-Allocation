import io

import pytest


@pytest.mark.asyncio
async def test_list_engineers_returns_200(client):
    response = await client.get("/api/v1/engineers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_engineer_not_found_returns_404(client):
    response = await client.get("/api/v1/engineers/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "EngineerNotFound"


@pytest.mark.asyncio
async def test_upload_valid_csv_returns_200(client):
    csv_content = b"name,email,primary_skill,level\nTest Engineer,test@example.com,Python,senior\n"
    response = await client.post(
        "/api/v1/engineers/upload",
        files={"file": ("engineers.csv", io.BytesIO(csv_content), "text/csv")},
    )
    assert response.status_code == 200
    body = response.json()
    assert "inserted" in body


@pytest.mark.asyncio
async def test_upload_oversized_csv_returns_413(client):
    # Create 11MB content to exceed 10MB limit
    big_content = b"name,email\n" + b"a,b@c.com\n" * (11 * 1024 * 1024 // 10)
    response = await client.post(
        "/api/v1/engineers/upload",
        files={"file": ("big.csv", io.BytesIO(big_content), "text/csv")},
    )
    assert response.status_code == 413


@pytest.mark.asyncio
async def test_upload_invalid_mime_returns_400(client):
    response = await client.post(
        "/api/v1/engineers/upload",
        files={"file": ("test.json", io.BytesIO(b'{"key": "value"}'), "application/json")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_engineer_returns_201(client):
    response = await client.post(
        "/api/v1/engineers",
        json={
            "name": "New Engineer",
            "email": "new.engineer@example.com",
            "primary_skill": "Python",
            "level": "senior",
            "secondary_skills": "FastAPI,SQL",
            "years_of_experience": 6,
            "availability_percentage": 80,
            "bench_start_date": None,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "New Engineer"
    assert body["email"] == "new.engineer@example.com"


@pytest.mark.asyncio
async def test_create_engineer_duplicate_email_returns_400(client):
    payload = {
        "name": "Dup Engineer",
        "email": "dup.engineer@example.com",
        "primary_skill": "Python",
        "level": "mid",
    }
    first = await client.post("/api/v1/engineers", json=payload)
    assert first.status_code == 201

    second = await client.post("/api/v1/engineers", json=payload)
    assert second.status_code == 400
    body = second.json()
    assert body["error"]["code"] == "EngineerEmailExists"
