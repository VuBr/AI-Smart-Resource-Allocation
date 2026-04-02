"""
Unit tests for CSVIngestionService.
Bảo vệ AC-6, AC-9: MIME type validation và size limit là REAL logic.
"""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.csv_ingestion import CSVIngestionService


def _make_upload_file(content: bytes, content_type: str, filename: str = "test.csv"):
    """Tạo UploadFile mock. Dùng MagicMock vì UploadFile.content_type là read-only property."""
    mock_file = MagicMock()
    mock_file.filename = filename
    mock_file.content_type = content_type
    mock_file.read = AsyncMock(return_value=content)
    return mock_file


@pytest.mark.asyncio
async def test_invalid_mime_type_raises_value_error():
    """File không phải CSV (application/json) → ValueError với message 'invalid_mime_type'."""
    service = CSVIngestionService()
    upload = _make_upload_file(b'{"key": "value"}', "application/json", "test.json")
    with pytest.raises(ValueError, match="invalid_mime_type"):
        await service.parse_engineers_csv(upload)


@pytest.mark.asyncio
async def test_file_over_10mb_raises_overflow_error():
    """File vượt 10MB → OverflowError với message 'file_too_large'."""
    service = CSVIngestionService()
    big_content = b"x" * (10 * 1024 * 1024 + 1)  # 10MB + 1 byte
    upload = _make_upload_file(big_content, "text/csv")
    with pytest.raises(OverflowError, match="file_too_large"):
        await service.parse_engineers_csv(upload)


@pytest.mark.asyncio
async def test_valid_csv_returns_result_dict():
    """CSV hợp lệ ≤10MB → trả về dict có đủ keys: inserted, updated, skipped, errors."""
    service = CSVIngestionService()
    csv_content = b"name,email,primary_skill,level\nAlice,alice@example.com,Python,senior\n"
    upload = _make_upload_file(csv_content, "text/csv")
    result = await service.parse_engineers_csv(upload)
    assert "inserted" in result
    assert "updated" in result
    assert "skipped" in result
    assert "errors" in result


@pytest.mark.asyncio
async def test_application_csv_mime_is_accepted():
    """'application/csv' MIME type cũng được chấp nhận (không chỉ text/csv)."""
    service = CSVIngestionService()
    csv_content = b"name,email\nBob,bob@example.com\n"
    upload = _make_upload_file(csv_content, "application/csv")
    result = await service.parse_engineers_csv(upload)
    assert "inserted" in result


@pytest.mark.asyncio
async def test_invalid_mime_projects_raises_value_error():
    """parse_projects_csv cũng validate MIME → ValueError."""
    service = CSVIngestionService()
    upload = _make_upload_file(b"<html></html>", "text/html", "test.html")
    with pytest.raises(ValueError, match="invalid_mime_type"):
        await service.parse_projects_csv(upload)


@pytest.mark.asyncio
async def test_projects_csv_over_10mb_raises_overflow():
    """parse_projects_csv: file >10MB → OverflowError."""
    service = CSVIngestionService()
    big_content = b"x" * (10 * 1024 * 1024 + 1)
    upload = _make_upload_file(big_content, "text/csv")
    with pytest.raises(OverflowError, match="file_too_large"):
        await service.parse_projects_csv(upload)
