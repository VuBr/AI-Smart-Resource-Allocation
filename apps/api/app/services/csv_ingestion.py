from fastapi import UploadFile

from app.core.config import get_settings
from app.core.logging import log_event


class CSVIngestionService:
    async def parse_engineers_csv(self, file: UploadFile) -> dict:
        """
        Parse and validate engineer CSV upload.
        Validation (MIME type + size) is REAL.
        DB insert is STUB for Phase 5.
        """
        settings = get_settings()
        filename = file.filename or "unknown"
        log_event("csv_import_started", filename=filename)

        # REAL: validate MIME type
        content_type = file.content_type or ""
        if content_type not in ("text/csv", "application/csv", "application/vnd.ms-excel"):
            log_event("csv_import_failed", filename=filename, error="invalid_mime_type")
            raise ValueError("invalid_mime_type")

        # REAL: validate size <= MAX_CSV_SIZE_MB
        content = await file.read()
        max_bytes = settings.MAX_CSV_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            log_event("csv_import_failed", filename=filename, error="file_too_large")
            raise OverflowError("file_too_large")

        # STUB: parse and insert
        result = {"inserted": 0, "updated": 0, "skipped": 0, "errors": []}
        log_event("csv_import_completed", filename=filename, **result)
        return result

    async def parse_projects_csv(self, file: UploadFile) -> dict:
        """Same validation pattern as parse_engineers_csv."""
        settings = get_settings()
        filename = file.filename or "unknown"
        log_event("csv_import_started", filename=filename)

        content_type = file.content_type or ""
        if content_type not in ("text/csv", "application/csv", "application/vnd.ms-excel"):
            log_event("csv_import_failed", filename=filename, error="invalid_mime_type")
            raise ValueError("invalid_mime_type")

        content = await file.read()
        max_bytes = settings.MAX_CSV_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            log_event("csv_import_failed", filename=filename, error="file_too_large")
            raise OverflowError("file_too_large")

        result = {"inserted": 0, "updated": 0, "skipped": 0, "errors": []}
        log_event("csv_import_completed", filename=filename, **result)
        return result
