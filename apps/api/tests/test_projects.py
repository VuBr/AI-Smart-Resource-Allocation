import io

import pytest


@pytest.mark.asyncio
async def test_list_projects_returns_200(client):
    response = await client.get("/api/v1/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_project_not_found_returns_404(client):
    response = await client.get("/api/v1/projects/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "ProjectNotFound"


@pytest.mark.asyncio
async def test_upload_projects_valid_csv_returns_200(client):
    csv_content = b"name,description,status\nProject A,Test project,active\n"
    response = await client.post(
        "/api/v1/projects/upload",
        files={"file": ("projects.csv", io.BytesIO(csv_content), "text/csv")},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_upload_projects_oversized_returns_413(client):
    big_content = b"name,status\n" + b"a,active\n" * (11 * 1024 * 1024 // 9)
    response = await client.post(
        "/api/v1/projects/upload",
        files={"file": ("big.csv", io.BytesIO(big_content), "text/csv")},
    )
    assert response.status_code == 413


@pytest.mark.asyncio
async def test_create_project_returns_201(client):
    response = await client.post(
        "/api/v1/projects",
        json={
            "name": "Project Nebula",
            "description": "New platform migration",
            "required_skills": "React,Node.js",
            "required_level": "senior",
            "headcount": 3,
            "status": "planned",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Project Nebula"


@pytest.mark.asyncio
async def test_create_project_duplicate_name_returns_400(client):
    payload = {"name": "Project Atlas", "headcount": 2, "status": "active"}
    first = await client.post("/api/v1/projects", json=payload)
    assert first.status_code == 201

    second = await client.post("/api/v1/projects", json=payload)
    assert second.status_code == 400
    body = second.json()
    assert body["error"]["code"] == "ProjectNameExists"
