# Implementation Plan — RA-013: Upload Engineers CSV (Real Implementation)

**Ticket:** RA-013
**Spec-pack:** `docs/changes/RA-013/spec-pack.md`
**Trạng thái:** DRAFT — chờ approve
**Ngày tạo:** 2026-04-18

---

## 1. Policy

### CSV Parsing Tool
**Quyết định:** Reuse **Pandas** (giống RA-012).
- `pd.read_csv(..., dtype=str, keep_default_na=False)`
- BOM handling: `decode("utf-8-sig")`

### Upsert Strategy
**Quyết định:** SELECT + conditional INSERT/UPDATE (giống RA-012).
- Upsert key: `email` (thay vì `name`)
- Mỗi row là một transaction độc lập → partial success

### Duplicate Email in File
**Quyết định (OI-2):** Track `seen_emails: set[str]` trong service. Row đầu tiên với mỗi email được process; các row sau bị skip và thêm error `"Row {N}: email — duplicate email in file, skipped"`.

### Error Code Format
**Quyết định:** Giữ `PascalCase` (giống RA-012) — `FileTooLarge`, `InvalidCsv`, `InvalidEncoding`, `InvalidCsvHeader`.

### Optional Field Overwrite
**Quyết định (OI-3):** Field optional bỏ trống → overwrite DB thành `null` / default.

### Email Validation
**Quyết định:** Dùng Pydantic `EmailStr` nếu `email-validator` package đã có; fallback sang regex validator nếu chưa. Kiểm tra trong Step 1 trước khi code.

---

## 2. Impact Analysis

### Files cần đọc

| File | Ghi chú quan trọng |
|------|-------------------|
| `apps/api/app/services/csv_ingestion.py` | `parse_engineers_csv()` là pure STUB — replace body |
| `apps/api/app/models/engineer.py` | 8 import-able fields; `email` unique index |
| `apps/api/app/schemas/engineer.py` | Hiện chỉ có `EngineerResponse` — thêm `EngineerCsvRow` |
| `apps/api/app/repositories/engineer_repository.py` | Có `create()` — thêm `upsert_by_email()` |
| `apps/api/app/api/v1/routers/engineers.py` | Stub router — thêm `db: Depends(get_db)`, exception branches |
| `apps/api/app/schemas/project.py` | Pattern reference cho `ProjectCsvRow` |
| `apps/api/app/repositories/project_repository.py` | Pattern reference cho `upsert_by_name()` |
| `apps/api/app/schemas/common.py` | `ErrorDetail(code, message)` — dùng trực tiếp |
| `apps/api/app/core/config.py` | `MAX_CSV_SIZE_MB` |
| `apps/api/tests/conftest.py` | Fixture `client` in-memory SQLite — reuse |
| `apps/api/tests/test_csv_ingestion.py` | 20 tests hiện tại — giữ nguyên, thêm mới |
| `apps/web/features/upload/CsvColumnReference.tsx` | `engineerColumns` **sai hoàn toàn** — rewrite |
| `apps/web/app/upload/page.tsx` | Banner Engineers CSV — cập nhật required columns |

### Files sẽ thay đổi

| File | Loại thay đổi | Mức độ |
|------|--------------|--------|
| `apps/api/app/schemas/engineer.py` | Thêm `EngineerCsvRow` Pydantic model | Thêm mới, không break |
| `apps/api/app/repositories/engineer_repository.py` | Thêm `upsert_by_email()` method | Thêm mới, không break |
| `apps/api/app/services/csv_ingestion.py` | Replace `parse_engineers_csv()` stub | Replace body, signature thay đổi (thêm `db`) |
| `apps/api/app/api/v1/routers/engineers.py` | Thêm `db: Depends(get_db)`, 3 exception branches | Breaking: signature `upload_engineers` thay đổi |
| `apps/web/features/upload/CsvColumnReference.tsx` | Rewrite `engineerColumns` array | Thay đổi data, không break component |
| `apps/web/app/upload/page.tsx` | Cập nhật banner Engineers CSV | Thay đổi JSX content |
| `apps/api/tests/test_csv_ingestion.py` | Thêm ~16 integration tests | Thêm mới, không break existing |

### Files không thay đổi

| File | Lý do |
|------|-------|
| `apps/api/app/models/engineer.py` | Schema Engineer đã đúng |
| `apps/api/app/core/config.py` | `MAX_CSV_SIZE_MB` đã có |
| `apps/api/app/schemas/common.py` | Error schemas đã đủ |
| `apps/api/app/core/logging.py` | `log_event()` đã đủ |
| `apps/api/tests/conftest.py` | Fixture đã dùng được |

---

## 3. Implementation Steps

### Step 1 — Kiểm tra `email-validator` package

```bash
docker compose exec api pip show email-validator
```

- Nếu có → dùng `from pydantic import EmailStr` trong `EngineerCsvRow`
- Nếu không → dùng regex validator:
  ```python
  import re
  EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
  ```

---

### Step 2 — `EngineerCsvRow` trong `schemas/engineer.py`

Thêm sau các import hiện có:

```python
from pydantic import BaseModel, EmailStr, field_validator, model_validator
# hoặc nếu không có email-validator:
# from pydantic import BaseModel, field_validator, model_validator

class EngineerCsvRow(BaseModel):
    """Validate một row CSV engineer. Input là dict với values là str (từ Pandas dtype=str)."""

    name: str
    email: str                                           # validated bởi _validate_email
    primary_skill: str
    level: Literal["junior", "mid", "senior", "lead"]
    secondary_skills: str | None = None
    years_of_experience: int = 0
    availability_percentage: int = 100
    bench_start_date: date | None = None

    @model_validator(mode="before")
    @classmethod
    def _coerce_and_strip(cls, values: dict) -> dict:
        out: dict = {}
        for key, val in values.items():
            out[key] = val.strip() if isinstance(val, str) else val

        # Empty string → None cho optional string/date fields
        for field in ("secondary_skills", "bench_start_date"):
            if out.get(field) == "":
                out[field] = None

        # years_of_experience: empty → default 0
        if out.get("years_of_experience") == "":
            out["years_of_experience"] = 0

        # availability_percentage: empty → default 100
        if out.get("availability_percentage") == "":
            out["availability_percentage"] = 100

        return out

    @field_validator("name")
    @classmethod
    def _validate_name(cls, v: str) -> str:
        if not v:
            raise ValueError("name is required")
        if len(v) > 200:
            raise ValueError("name must not exceed 200 characters")
        return v

    @field_validator("email")
    @classmethod
    def _validate_email(cls, v: str) -> str:
        if not v:
            raise ValueError("email is required")
        # Dùng regex nếu không có EmailStr, hoặc thay bằng EmailStr annotation
        import re
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("value is not a valid email address")
        return v

    @field_validator("primary_skill")
    @classmethod
    def _validate_primary_skill(cls, v: str) -> str:
        if not v:
            raise ValueError("primary_skill is required")
        if len(v) > 100:
            raise ValueError("primary_skill must not exceed 100 characters")
        return v

    @field_validator("secondary_skills")
    @classmethod
    def _validate_secondary_skills(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("secondary_skills must not exceed 500 characters")
        return v

    @field_validator("years_of_experience", mode="before")
    @classmethod
    def _validate_years(cls, v: object) -> int:
        try:
            parsed = int(str(v)) if not isinstance(v, int) else v
        except (ValueError, TypeError):
            raise ValueError("years_of_experience must be an integer")
        if parsed < 0:
            raise ValueError("years_of_experience must be >= 0")
        return parsed

    @field_validator("availability_percentage", mode="before")
    @classmethod
    def _validate_availability(cls, v: object) -> int:
        try:
            parsed = int(str(v)) if not isinstance(v, int) else v
        except (ValueError, TypeError):
            raise ValueError("availability_percentage must be an integer")
        if not (0 <= parsed <= 100):
            raise ValueError(f"availability_percentage must be between 0 and 100 (got: {parsed})")
        return parsed

    @field_validator("bench_start_date", mode="before")
    @classmethod
    def _parse_date(cls, v: object) -> date | None:
        if v is None or v == "":
            return None
        try:
            return date.fromisoformat(str(v))
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format")

    def to_db_dict(self) -> dict:
        return {
            "name": self.name,
            "email": self.email,
            "primary_skill": self.primary_skill,
            "level": self.level,
            "secondary_skills": self.secondary_skills,
            "years_of_experience": self.years_of_experience,
            "availability_percentage": self.availability_percentage,
            "bench_start_date": self.bench_start_date,
        }
```

---

### Step 3 — `upsert_by_email()` trong `engineer_repository.py`

Mirror của `upsert_by_name()` từ `project_repository.py`:

```python
async def upsert_by_email(self, data: dict) -> tuple[Engineer, bool]:
    """
    Insert nếu email chưa tồn tại, Update nếu đã tồn tại.
    Returns (engineer, inserted) — inserted=True nếu INSERT, False nếu UPDATE.
    Optional fields bỏ trống sẽ overwrite DB thành None.
    """
    result = await self.db.execute(select(Engineer).where(Engineer.email == data["email"]))
    existing = result.scalar_one_or_none()

    if existing is not None:
        for key, value in data.items():
            setattr(existing, key, value)
        await self.db.flush()
        await self.db.refresh(existing)
        await self.db.commit()
        return existing, False

    engineer = Engineer(**data)
    self.db.add(engineer)
    await self.db.commit()
    await self.db.refresh(engineer)
    return engineer, True
```

---

### Step 4 — `parse_engineers_csv()` trong `csv_ingestion.py`

Thêm imports cần thiết:

```python
from app.repositories.engineer_repository import EngineerRepository
from app.schemas.engineer import EngineerCsvRow
```

Thêm constant:

```python
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
```

Replace toàn bộ body `parse_engineers_csv()`:

```python
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

        # Duplicate email in file check (before Pydantic validation)
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
```

---

### Step 5 — Router `engineers.py`

Thêm import `AsyncSession` và `get_db`:

```python
from app.db.database import get_db
```

Replace `upload_engineers`:

```python
@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_engineers(file: UploadFile, db: AsyncSession = Depends(get_db)) -> dict:
    service = CSVIngestionService()
    try:
        result = await service.parse_engineers_csv(file, db)
        return result
    except OverflowError:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=ErrorResponse(
                error=ErrorDetail(code="FileTooLarge", message="File exceeds maximum allowed size")
            ).model_dump(),
        )
    except ValueError as e:
        msg = str(e)
        if msg == "invalid_encoding":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorResponse(
                    error=ErrorDetail(code="InvalidEncoding", message="File must be UTF-8 encoded")
                ).model_dump(),
            )
        if msg == "invalid_csv_header":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorResponse(
                    error=ErrorDetail(
                        code="InvalidCsvHeader",
                        message="Missing required columns: name, email, primary_skill, level",
                    )
                ).model_dump(),
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="InvalidCsv", message="File must be a valid CSV")
            ).model_dump(),
        )
```

---

### Step 6 — Frontend `CsvColumnReference.tsx`

Rewrite `engineerColumns`:

```typescript
const engineerColumns: ColumnRow[] = [
  { name: "name",                    example: "e.g. Nguyen Van A",              required: true  },
  { name: "email",                   example: "e.g. a@company.io",              required: true  },
  { name: "primary_skill",           example: "e.g. Python",                    required: true  },
  { name: "level",                   example: "junior / mid / senior / lead",   required: true  },
  { name: "secondary_skills",        example: 'e.g. "Django,FastAPI"',          required: false },
  { name: "years_of_experience",     example: "number e.g. 5 (default: 0)",     required: false },
  { name: "availability_percentage", example: "0–100 e.g. 80 (default: 100)",   required: false },
  { name: "bench_start_date",        example: "YYYY-MM-DD",                     required: false },
];
```

---

### Step 7 — Frontend `upload/page.tsx`

Cập nhật banner "Engineers CSV — required columns":

```tsx
<p className="font-bold text-blue-800 mb-1">Engineers CSV — required columns:</p>
<p>
  <code className="font-mono bg-blue-100 rounded px-1">name</code>,{" "}
  <code className="font-mono bg-blue-100 rounded px-1">email</code>,{" "}
  <code className="font-mono bg-blue-100 rounded px-1">primary_skill</code>,{" "}
  <code className="font-mono bg-blue-100 rounded px-1">level</code>
</p>
```

---

### Step 8 — Tests trong `test_csv_ingestion.py`

Thêm constant và helper:

```python
ENGINEER_VALID_HEADER = (
    b"name,email,primary_skill,secondary_skills,level,"
    b"years_of_experience,availability_percentage,bench_start_date\n"
)

def _engineers_upload(content: bytes, content_type: str = "text/csv"):
    return {"file": ("engineers.csv", content, content_type)}
```

**Tests cần thêm (~16 tests):**

| Test | AC | Type |
|------|-----|------|
| `test_upload_engineers_valid_300_rows_returns_inserted_300` | AC-3 | IT (dùng `engineers_300.csv`) |
| `test_upload_engineers_twice_returns_updated_300` | AC-4 | IT |
| `test_upload_engineers_invalid_email_skips_row` | AC-5 | IT |
| `test_upload_engineers_invalid_level_skips_row` | AC-6 | IT |
| `test_upload_engineers_availability_over_100_skips_row` | AC-7 | IT |
| `test_upload_engineers_negative_experience_skips_row` | AC-8 | IT |
| `test_upload_engineers_empty_name_skips_row` | AC-9 | IT |
| `test_upload_engineers_empty_email_skips_row` | AC-10 | IT |
| `test_upload_engineers_empty_primary_skill_skips_row` | AC-11 | IT |
| `test_upload_engineers_missing_required_header_returns_400` | AC-12 | IT |
| `test_upload_engineers_non_utf8_returns_400` | AC-13 | UT |
| `test_upload_engineers_mix_valid_invalid_rows` | AC-14 | IT |
| `test_upload_engineers_duplicate_email_in_file_skips_second` | AC-15 | IT |
| `test_upload_engineers_email_in_db_updates_engineer` | AC-16 | IT |
| `test_upload_engineers_optional_fields_empty_saves_defaults` | AC-17 | IT |
| `test_upload_engineers_exact_10mb_accepted` | B-1 | IT |

---

## 4. Checkpoints

| CP | Mô tả | Done? |
|----|-------|-------|
| CP-1 | `EngineerCsvRow` + `upsert_by_email()` | [ ] |
| CP-2 | `parse_engineers_csv()` real implementation | [ ] |
| CP-3 | Router wiring (`db` inject + exception branches) | [ ] |
| CP-4 | Frontend `engineerColumns` rewrite + banner update | [ ] |
| CP-5 | Tests mở rộng (16 tests) — tất cả pass | [ ] |
| CP-6 | Quality gates: ruff + black + pytest + tsc + eslint | [ ] |

---

## 5. AC Mapping

| AC | Steps thực hiện |
|----|----------------|
| AC-1 | Step 4 (MIME check giữ nguyên) |
| AC-2 | Step 4 (size check giữ nguyên) |
| AC-3 | Step 2, 3, 4, 8 |
| AC-4 | Step 3, 4, 8 |
| AC-5 | Step 2 (_validate_email), Step 8 |
| AC-6 | Step 2 (Literal level), Step 8 |
| AC-7 | Step 2 (_validate_availability), Step 8 |
| AC-8 | Step 2 (_validate_years), Step 8 |
| AC-9 | Step 2 (_validate_name), Step 8 |
| AC-10 | Step 2 (_validate_email), Step 8 |
| AC-11 | Step 2 (_validate_primary_skill), Step 8 |
| AC-12 | Step 4 (header check), Step 5, Step 8 |
| AC-13 | Step 4 (encoding check), Step 5, Step 8 |
| AC-14 | Step 4 (partial success), Step 8 |
| AC-15 | Step 4 (seen_emails), Step 8 |
| AC-16 | Step 3 (upsert_by_email UPDATE), Step 8 |
| AC-17 | Step 2 (_coerce_and_strip defaults), Step 8 |
| AC-18 | Step 6, Step 7 |
