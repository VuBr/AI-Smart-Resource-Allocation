import io

import pandas as pd
from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import log_event
from app.repositories.engineer_repository import EngineerRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.engineer import EngineerCsvRow
from app.schemas.project import ProjectCsvRow

_ENGINEER_COLUMNS = [
    "name",
    "email",
    "primary_skill",
    "secondary_skills",
    "level",
    "years_of_experience",
    "availability_percentage",
    "bench_start_date",
]

_ENGINEER_REQUIRED_COLUMNS = {"name", "email", "primary_skill", "level"}

_PROJECT_COLUMNS = [
    "name",
    "description",
    "required_skills",
    "required_level",
    "headcount",
    "status",
    "start_date",
    "end_date",
]


class CSVIngestionService:
    async def parse_engineers_csv(self, file: UploadFile, db: AsyncSession) -> dict:
        """Parse, validate và upsert engineers từ CSV upload."""
        settings = get_settings()
        filename = file.filename or "unknown"
        log_event("csv_import_started", entity_type="engineers", filename=filename)

        content_type = file.content_type or ""
        if content_type not in ("text/csv", "application/csv", "application/vnd.ms-excel"):
            log_event("csv_import_failed", filename=filename, error="invalid_mime_type")
            raise ValueError("invalid_mime_type")

        content = await file.read()
        max_bytes = settings.MAX_CSV_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            log_event("csv_import_failed", filename=filename, error="file_too_large")
            raise OverflowError("file_too_large")

        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            log_event("csv_import_failed", filename=filename, error="invalid_encoding")
            raise ValueError("invalid_encoding")

        df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
        normalized_cols = [c.strip().lower() for c in df.columns]

        missing = _ENGINEER_REQUIRED_COLUMNS - set(normalized_cols)
        if missing:
            log_event("csv_import_failed", filename=filename, error="invalid_csv_header")
            raise ValueError("invalid_csv_header")

        df.columns = pd.Index(normalized_cols)

        inserted = updated = skipped = 0
        errors: list[str] = []
        seen_emails: set[str] = set()
        repo = EngineerRepository(db)

        for i, row in enumerate(df.itertuples(index=False), start=1):
            raw = {
                col: getattr(row, col, "") if col in normalized_cols else ""
                for col in _ENGINEER_COLUMNS
            }

            email_raw = raw.get("email", "").strip()
            if email_raw and email_raw in seen_emails:
                errors.append(f"Row {i}: email — duplicate email in file, skipped")
                skipped += 1
                continue

            try:
                validated = EngineerCsvRow(**raw)
            except ValidationError as exc:
                error_parts = []
                for err in exc.errors():
                    field = err["loc"][-1] if err["loc"] else "unknown"
                    error_parts.append(f"{field} — {err['msg']}")
                errors.append(f"Row {i}: {'; '.join(error_parts)}")
                skipped += 1
                continue

            seen_emails.add(validated.email)
            _, was_inserted = await repo.upsert_by_email(validated.to_db_dict())
            if was_inserted:
                inserted += 1
            else:
                updated += 1

        log_event(
            "csv_import_completed",
            filename=filename,
            inserted=inserted,
            updated=updated,
            skipped=skipped,
            errors=len(errors),
        )
        return {"inserted": inserted, "updated": updated, "skipped": skipped, "errors": errors}

    async def parse_projects_csv(self, file: UploadFile, db: AsyncSession) -> dict:
        """Parse, validate và upsert projects từ CSV upload."""
        settings = get_settings()
        filename = file.filename or "unknown"
        log_event("csv_import_started", entity_type="projects", filename=filename)

        content_type = file.content_type or ""
        if content_type not in ("text/csv", "application/csv", "application/vnd.ms-excel"):
            log_event("csv_import_failed", filename=filename, error="invalid_mime_type")
            raise ValueError("invalid_mime_type")

        content = await file.read()
        max_bytes = settings.MAX_CSV_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            log_event("csv_import_failed", filename=filename, error="file_too_large")
            raise OverflowError("file_too_large")

        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            log_event("csv_import_failed", filename=filename, error="invalid_encoding")
            raise ValueError("invalid_encoding")

        df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
        normalized_cols = [c.strip().lower() for c in df.columns]

        if "name" not in normalized_cols:
            log_event("csv_import_failed", filename=filename, error="invalid_csv_header")
            raise ValueError("invalid_csv_header")

        df.columns = pd.Index(normalized_cols)

        inserted = updated = skipped = 0
        errors: list[str] = []
        repo = ProjectRepository(db)

        for i, row in enumerate(df.itertuples(index=False), start=1):
            raw = {
                col: getattr(row, col, "") if col in normalized_cols else ""
                for col in _PROJECT_COLUMNS
            }
            try:
                validated = ProjectCsvRow(**raw)
            except ValidationError as exc:
                error_parts = []
                for err in exc.errors():
                    field = err["loc"][-1] if err["loc"] else "unknown"
                    error_parts.append(f"{field} — {err['msg']}")
                errors.append(f"Row {i}: {'; '.join(error_parts)}")
                skipped += 1
                continue

            _, was_inserted = await repo.upsert_by_name(validated.to_db_dict())
            if was_inserted:
                inserted += 1
            else:
                updated += 1

        log_event(
            "csv_import_completed",
            filename=filename,
            inserted=inserted,
            updated=updated,
            skipped=skipped,
            errors=len(errors),
        )
        return {"inserted": inserted, "updated": updated, "skipped": skipped, "errors": errors}
