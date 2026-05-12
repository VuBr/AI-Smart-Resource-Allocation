"""
Tests for CSVIngestionService.
- Stub-level tests (UT): MIME + size validation — dùng mock UploadFile, không cần DB
- Integration tests (IT): parse_projects_csv + parse_engineers_csv — dùng fixture `client` (in-memory SQLite)
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.csv_ingestion import CSVIngestionService

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

VALID_HEADER = (
    b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
)

ENGINEER_VALID_HEADER = (
    b"name,email,primary_skill,secondary_skills,level,"
    b"years_of_experience,availability_percentage,bench_start_date\n"
)


def _make_upload_file(content: bytes, content_type: str, filename: str = "test.csv"):
    """Tạo UploadFile mock. Dùng MagicMock vì UploadFile.content_type là read-only property."""
    mock_file = MagicMock()
    mock_file.filename = filename
    mock_file.content_type = content_type
    mock_file.read = AsyncMock(return_value=content)
    return mock_file


def _projects_upload(content: bytes, content_type: str = "text/csv"):
    return {"file": ("projects.csv", content, content_type)}


def _engineers_upload(content: bytes, content_type: str = "text/csv"):
    return {"file": ("engineers.csv", content, content_type)}


# ---------------------------------------------------------------------------
# Unit tests — MIME / size (không cần DB, giữ nguyên từ Phase 5)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_invalid_mime_type_raises_value_error():
    """File không phải CSV (application/json) → ValueError với message 'invalid_mime_type'."""
    service = CSVIngestionService()
    upload = _make_upload_file(b'{"key": "value"}', "application/json", "test.json")
    with pytest.raises(ValueError, match="invalid_mime_type"):
        await service.parse_engineers_csv(upload, db=None)  # type: ignore[arg-type]


@pytest.mark.asyncio
async def test_file_over_10mb_raises_overflow_error():
    """File vượt 10MB → OverflowError với message 'file_too_large'."""
    service = CSVIngestionService()
    big_content = b"x" * (10 * 1024 * 1024 + 1)
    upload = _make_upload_file(big_content, "text/csv")
    with pytest.raises(OverflowError, match="file_too_large"):
        await service.parse_engineers_csv(upload, db=None)  # type: ignore[arg-type]


@pytest.mark.asyncio
async def test_valid_csv_returns_result_dict(client):
    """CSV hợp lệ ≤10MB → trả về dict có đủ keys: inserted, updated, skipped, errors."""
    csv_content = b"name,email,primary_skill,level\nAlice,alice@example.com,Python,senior\n"
    response = await client.post(
        "/api/v1/engineers/upload",
        files=_engineers_upload(csv_content),
    )
    assert response.status_code == 200
    result = response.json()
    assert "inserted" in result
    assert "updated" in result
    assert "skipped" in result
    assert "errors" in result


@pytest.mark.asyncio
async def test_application_csv_mime_is_accepted(client):
    """'application/csv' MIME type cũng được chấp nhận (không chỉ text/csv)."""
    csv_content = b"name,email,primary_skill,level\nBob,bob@example.com,Go,mid\n"
    response = await client.post(
        "/api/v1/engineers/upload",
        files=_engineers_upload(csv_content, content_type="application/csv"),
    )
    assert response.status_code == 200
    assert "inserted" in response.json()


@pytest.mark.asyncio
async def test_invalid_mime_projects_raises_value_error():
    """parse_projects_csv cũng validate MIME → ValueError."""
    service = CSVIngestionService()
    upload = _make_upload_file(b"<html></html>", "text/html", "test.html")
    with pytest.raises(ValueError, match="invalid_mime_type"):
        await service.parse_projects_csv(upload, db=None)  # type: ignore[arg-type]


@pytest.mark.asyncio
async def test_projects_csv_over_10mb_raises_overflow():
    """parse_projects_csv: file >10MB → OverflowError."""
    service = CSVIngestionService()
    big_content = b"x" * (10 * 1024 * 1024 + 1)
    upload = _make_upload_file(big_content, "text/csv")
    with pytest.raises(OverflowError, match="file_too_large"):
        await service.parse_projects_csv(upload, db=None)  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# Integration tests — parse_projects_csv (dùng fixture `client` + in-memory SQLite)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_upload_projects_valid_25_rows_returns_inserted_25(client):
    """25 rows hợp lệ từ projects_25.csv → inserted=25, errors=[] (AC-3)."""
    import pathlib

    csv_path = (
        pathlib.Path(__file__).parent.parent.parent.parent
        / "docs/changes/RA-012/Raw/projects_25.csv"
    )
    content = csv_path.read_bytes()
    response = await client.post(
        "/api/v1/projects/upload",
        files={"file": ("projects_25.csv", content, "text/csv")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["inserted"] == 25
    assert body["updated"] == 0
    assert body["skipped"] == 0
    assert body["errors"] == []


@pytest.mark.asyncio
async def test_upload_projects_twice_returns_updated_25(client):
    """Upload cùng file 2 lần → lần 2: updated=25, inserted=0 (AC-4)."""
    import pathlib

    csv_path = (
        pathlib.Path(__file__).parent.parent.parent.parent
        / "docs/changes/RA-012/Raw/projects_25.csv"
    )
    content = csv_path.read_bytes()
    files = {"file": ("projects_25.csv", content, "text/csv")}
    await client.post("/api/v1/projects/upload", files=files)
    response = await client.post(
        "/api/v1/projects/upload",
        files={"file": ("projects_25.csv", content, "text/csv")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["inserted"] == 0
    assert body["updated"] == 25
    assert body["skipped"] == 0


@pytest.mark.asyncio
async def test_upload_projects_invalid_headcount_skips_row(client):
    """Row với headcount=0 → skipped=1, errors chứa 'headcount' (AC-5)."""
    content = VALID_HEADER + b"Bad Headcount,,,senior,0,planned,,\n"
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["skipped"] == 1
    assert body["inserted"] == 0
    assert len(body["errors"]) == 1
    assert "Row 1" in body["errors"][0]
    assert "headcount" in body["errors"][0]


@pytest.mark.asyncio
async def test_upload_projects_invalid_level_skips_row(client):
    """Row với required_level=expert → skipped=1, errors liệt kê allowed values (AC-6)."""
    content = VALID_HEADER + b"Bad Level Project,,,expert,2,planned,,\n"
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["skipped"] == 1
    assert "Row 1" in body["errors"][0]
    assert "required_level" in body["errors"][0]


@pytest.mark.asyncio
async def test_upload_projects_end_before_start_skips_row(client):
    """Row với end_date < start_date → skipped=1 (AC-7)."""
    content = VALID_HEADER + b"Date Error Project,,,,1,planned,2026-06-01,2026-01-01\n"
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["skipped"] == 1
    assert "Row 1" in body["errors"][0]
    assert "end_date" in body["errors"][0]


@pytest.mark.asyncio
async def test_upload_projects_empty_name_skips_row(client):
    """Row với name rỗng → skipped=1, errors chứa 'name' (AC-8)."""
    content = VALID_HEADER + b",,,,1,planned,,\n"
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["skipped"] == 1
    assert "Row 1" in body["errors"][0]
    assert "name" in body["errors"][0]


@pytest.mark.asyncio
async def test_upload_projects_missing_name_header_returns_400(client):
    """Header thiếu cột 'name' → 400 InvalidCsvHeader (AC-9)."""
    content = b"description,status\nSome project,active\n"
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "InvalidCsvHeader"


@pytest.mark.asyncio
async def test_upload_projects_mix_valid_invalid_rows(client):
    """20 valid rows + 3 invalid → skipped=3, errors.length=3 (AC-10)."""
    rows = [
        f"Project {i},desc,,senior,3,active,2026-01-01,2026-12-31\n".encode() for i in range(20)
    ]
    invalid = [
        b"Bad Headcount,,,senior,0,planned,,\n",
        b"Bad Level,,,expert,2,planned,,\n",
        b"Bad Date,,,,1,planned,2026-06-01,2026-01-01\n",
    ]
    content = VALID_HEADER + b"".join(rows) + b"".join(invalid)
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["inserted"] + body["updated"] == 20
    assert body["skipped"] == 3
    assert len(body["errors"]) == 3


@pytest.mark.asyncio
async def test_upload_projects_non_utf8_returns_400(client):
    """File Latin-1 (non-UTF-8) → 400 InvalidEncoding (AC-11)."""
    content = b"name\n\xe0\xe1\xe2"
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "InvalidEncoding"


@pytest.mark.asyncio
async def test_upload_projects_optional_fields_empty_saves_null(client):
    """Optional fields trống → DB lưu null (AC-13)."""
    content = VALID_HEADER + b"Minimal Project,,,,,,, \n"
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    assert response.json()["inserted"] == 1

    projects = await client.get("/api/v1/projects")
    project = next(p for p in projects.json() if p["name"] == "Minimal Project")
    assert project["description"] is None
    assert project["required_skills"] is None
    assert project["required_level"] is None
    assert project["headcount"] == 1
    assert project["status"] == "planned"
    assert project["start_date"] is None
    assert project["end_date"] is None


@pytest.mark.asyncio
async def test_upload_projects_empty_file_returns_200(client):
    """File rỗng (0 data rows) → 200, inserted=0 (OI-1)."""
    content = VALID_HEADER
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["inserted"] == 0
    assert body["updated"] == 0
    assert body["skipped"] == 0
    assert body["errors"] == []


@pytest.mark.asyncio
async def test_upload_projects_upsert_overwrites_optional_with_null(client):
    """Upsert: optional field cũ có giá trị, CSV row để trống → DB field → null (OI-3)."""
    # Insert với description
    first = VALID_HEADER + b"Test Project,Old description,,senior,3,active,2026-01-01,2026-12-31\n"
    await client.post("/api/v1/projects/upload", files=_projects_upload(first))

    # Upsert với description trống
    second = VALID_HEADER + b"Test Project,,,senior,3,active,2026-01-01,2026-12-31\n"
    response = await client.post("/api/v1/projects/upload", files=_projects_upload(second))
    assert response.status_code == 200
    assert response.json()["updated"] == 1

    projects = await client.get("/api/v1/projects")
    project = next(p for p in projects.json() if p["name"] == "Test Project")
    assert project["description"] is None


@pytest.mark.asyncio
async def test_upload_projects_exact_10mb_accepted(client):
    """File đúng 10MB → không bị reject (B-1)."""
    max_bytes = 10 * 1024 * 1024
    # Build CSV content đủ 10MB
    row = b"Project Boundary,desc,,senior,1,planned,,\n"
    padding = b"#" * (max_bytes - len(VALID_HEADER) - len(row))
    # Gắn padding vào dòng cuối (dạng comment — Pandas bỏ qua) không ảnh hưởng data
    content = VALID_HEADER + row + b"# " + padding[2:]
    assert len(content) == max_bytes
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_upload_projects_quoted_field_with_comma(client):
    """Quoted field chứa dấu phẩy được parse đúng (R-2)."""
    content = (
        VALID_HEADER
        + b'"Project A, Phase 2","A desc, with comma","Python,ML",senior,3,active,2026-01-01,2026-12-31\n'
    )
    response = await client.post(
        "/api/v1/projects/upload",
        files=_projects_upload(content),
    )
    assert response.status_code == 200
    assert response.json()["inserted"] == 1
