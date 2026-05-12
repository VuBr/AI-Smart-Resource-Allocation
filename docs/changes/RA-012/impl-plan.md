# Implementation Plan — RA-012: Upload Project CSV (Real Implementation)

**Ticket:** RA-012
**Spec-pack:** `docs/changes/RA-012/spec-pack.md`
**Trạng thái:** APPROVED
**Ngày tạo:** 2026-04-18

---

## 1. Policy

### CSV Parsing Tool
**Quyết định:** Dùng **Pandas** (đã có trong stack, theo `coding-conventions.md §5`).

- `pd.read_csv(..., dtype=str, keep_default_na=False)` — đọc toàn bộ dưới dạng string, không convert tự động
- `keep_default_na=False` — giữ empty string `""` thay vì `NaN`, để phân biệt "bỏ trống" vs "không có cột"
- BOM handling: decode với `utf-8-sig` (Python tự strip BOM nếu có)

### Upsert Strategy
**Quyết định:** SELECT + conditional INSERT/UPDATE (không dùng raw SQL `ON CONFLICT`).

- Lý do: SQLite (test DB) không support `ON CONFLICT DO UPDATE` giống PostgreSQL
- Pattern: `upsert_by_name()` → SELECT by name → nếu tìm thấy thì UPDATE, không thì INSERT
- Mỗi row là một transaction độc lập → partial success được chấp nhận (spec NFR-5)

### Error Code Format
**Quyết định:** Giữ `PascalCase` theo pattern hiện có trong codebase (`FileTooLarge`, `InvalidCsv`, v.v.), không theo `snake_case` trong `coding-conventions.md §3`.

> **Ghi chú:** Đây là inconsistency đã tồn tại — không sửa trong scope RA-012.

### Optional Field Overwrite
**Quyết định (OI-3):** Field optional bỏ trống trong CSV → overwrite DB thành `null`.

---

## 2. Impact Analysis

### Files cần đọc (đã đọc — Phase 3)

| File | Ghi chú quan trọng |
|------|-------------------|
| `apps/api/app/services/csv_ingestion.py` | `parse_projects_csv()` là pure STUB — replace toàn bộ body |
| `apps/api/app/models/project.py` | 8 fields, `headcount` default 1, `status` default "planned" |
| `apps/api/app/schemas/project.py` | Chỉ có `ProjectListItem` và `ProjectResponse` — cần thêm `ProjectCsvRow` |
| `apps/api/app/repositories/project_repository.py` | Có `create()` — cần thêm `upsert_by_name()` |
| `apps/api/app/api/v1/routers/projects.py` | `upload_projects()` thiếu `db: Depends(get_db)` và thiếu 2 exception handler mới |
| `apps/api/app/schemas/common.py` | `ErrorDetail(code, message)` — dùng trực tiếp |
| `apps/api/app/core/logging.py` | `log_event(event, **kwargs)` — structured JSON |
| `apps/api/app/core/config.py` | `MAX_CSV_SIZE_MB = 10` |
| `apps/api/tests/conftest.py` | Fixture `client` dùng in-memory SQLite — dùng lại cho tests mới |
| `apps/api/tests/test_csv_ingestion.py` | 6 tests hiện tại (MIME + size) — giữ nguyên, thêm mới |
| `apps/web/features/upload/CsvColumnReference.tsx` | `projectColumns` **sai hoàn toàn** — cần rewrite |
| `apps/web/app/upload/page.tsx` | Banner Projects CSV có `project_id` — cần sửa |

### Files sẽ thay đổi

| File | Loại thay đổi | Mức độ |
|------|--------------|--------|
| `apps/api/app/schemas/project.py` | Thêm `ProjectCsvRow` Pydantic model | Thêm mới, không break |
| `apps/api/app/repositories/project_repository.py` | Thêm `upsert_by_name()` method | Thêm mới, không break |
| `apps/api/app/services/csv_ingestion.py` | Replace body `parse_projects_csv()`, thêm `db` param | Breaking change với router |
| `apps/api/app/api/v1/routers/projects.py` | Thêm `db: Depends(get_db)`, 2 exception handlers mới | Additive |
| `apps/web/features/upload/CsvColumnReference.tsx` | Rewrite `projectColumns` array | Additive (UI only) |
| `apps/web/app/upload/page.tsx` | Sửa banner Projects CSV column list | Additive (UI only) |
| `apps/api/tests/test_csv_ingestion.py` | Thêm tests mới, giữ tests cũ | Additive |

### Files KHÔNG thay đổi

| File | Lý do |
|------|-------|
| `apps/api/app/models/project.py` | Model đúng, không cần migration |
| `apps/api/app/services/csv_ingestion.py` `parse_engineers_csv()` | Ngoài scope |
| `apps/web/lib/services/projects.ts` | `uploadProjects()` đã đúng |
| `apps/web/features/upload/UploadZone.tsx` | Component đã hoàn chỉnh |
| Alembic migrations | Không thêm/bỏ column nào |

---

## 3. Implementation Steps

> **Nguyên tắc:** 1 step = nhỏ đủ để review độc lập. Chạy quality gates sau mỗi backend step.

---

### Step 1 — Thêm `ProjectCsvRow` vào `schemas/project.py`

**File:** `apps/api/app/schemas/project.py`

Thêm Pydantic model validate từng row CSV với các rules:
- `name`: `str`, non-empty sau strip, max 200 chars
- `description`: `str | None`, max 1000 chars, empty string → `None`
- `required_skills`: `str | None`, max 500 chars, empty → `None`
- `required_level`: `Literal["junior", "mid", "senior", "lead"] | None`, empty → `None`
- `headcount`: `int`, default `1`, must be > 0
- `status`: `Literal["planned", "active", "closed"]`, default `"planned"`
- `start_date`: `date | None`, format `YYYY-MM-DD`, empty → `None`
- `end_date`: `date | None`, format `YYYY-MM-DD`, empty → `None`; validator: nếu cả hai có giá trị thì `end_date >= start_date`

**Ghi chú kỹ thuật:**
- Input vào validator là `str` (từ Pandas `dtype=str`) — cần coerce trước khi validate
- Dùng `@model_validator(mode="before")` để convert `""` → `None` cho optional fields và apply `.strip()`
- `headcount`: `""` → default `1`; non-numeric → raise `ValueError`
- `start_date`/`end_date`: parse `date.fromisoformat()` trong validator

**Verification:** `ruff check` + `black --check` pass.

---

### Step 2 — Thêm `upsert_by_name()` vào `ProjectRepository`

**File:** `apps/api/app/repositories/project_repository.py`

```python
async def upsert_by_name(self, data: dict) -> tuple[Project, bool]:
    """
    Returns (project, inserted) where inserted=True nếu INSERT, False nếu UPDATE.
    """
```

Logic:
1. `SELECT projects WHERE name = data["name"]`
2. Nếu tìm thấy: update tất cả fields (trừ `id`, `created_at`) → `flush()` + `refresh()` → return `(project, False)`
3. Nếu không: tạo `Project(**data)` → `add()` + `commit()` + `refresh()` → return `(project, True)`

**Verification:** `ruff check` + `black --check` pass.

---

### Step 3 — Replace `parse_projects_csv()` trong `csv_ingestion.py`

**File:** `apps/api/app/services/csv_ingestion.py`

**Signature mới:**
```python
async def parse_projects_csv(self, file: UploadFile, db: AsyncSession) -> dict:
```

**Logic chi tiết:**

```
1. log_event("csv_import_started", entity_type="projects", filename=filename)
2. Validate MIME type → ValueError("invalid_mime_type") nếu sai  [giữ nguyên]
3. content = await file.read()
4. Validate size → OverflowError("file_too_large") nếu vượt    [giữ nguyên]
5. try: text = content.decode("utf-8-sig")
   except UnicodeDecodeError: raise ValueError("invalid_encoding")
6. df = pd.read_csv(io.StringIO(text), dtype=str, keep_default_na=False)
7. Validate header: "name" in [c.strip().lower() for c in df.columns]
   → raise ValueError("invalid_csv_header") nếu thiếu
8. Normalize column names: df.columns = [c.strip().lower() for c in df.columns]
9. inserted = updated = skipped = 0; errors = []
10. repo = ProjectRepository(db)
11. For i, row in enumerate(df.itertuples(), start=1):
    a. raw = {field: str(row[field]).strip() for field in EXPECTED_COLUMNS}
       (dùng getattr với default "" nếu column không có — handle missing optional cols)
    b. try: validated = ProjectCsvRow(**raw)
       except ValidationError as e: 
           errors.append(f"Row {i}: {format_error(e)}")
           skipped += 1
           continue
    c. (_, was_inserted) = await repo.upsert_by_name(validated.to_db_dict())
    d. if was_inserted: inserted += 1 else: updated += 1
12. log_event("csv_import_completed", inserted=inserted, updated=updated,
              skipped=skipped, errors=len(errors))
13. return {"inserted": inserted, "updated": updated, "skipped": skipped, "errors": errors}
```

**Helper constants:**
```python
EXPECTED_COLUMNS = ["name", "description", "required_skills", "required_level",
                    "headcount", "status", "start_date", "end_date"]
```

**`format_error(e: ValidationError) -> str`:** Extract field name + message từ Pydantic error → format `"{field} — {reason}"`.

**Import cần thêm:** `import io`, `import pandas as pd`, `from sqlalchemy.ext.asyncio import AsyncSession`, `from app.repositories.project_repository import ProjectRepository`, `from app.schemas.project import ProjectCsvRow`.

**Verification:** `ruff check` + `black --check` + `pytest tests/test_csv_ingestion.py -q` (6 tests cũ phải pass).

---

### Step 4 — Cập nhật `upload_projects()` router

**File:** `apps/api/app/api/v1/routers/projects.py`

Thay đổi:
1. Thêm `db: AsyncSession = Depends(get_db)` vào params
2. Truyền `db` vào `service.parse_projects_csv(file, db)`
3. Thêm 2 except branch mới:

```python
except ValueError as e:
    msg = str(e)
    if msg == "invalid_encoding":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="InvalidEncoding", message="File must be UTF-8 encoded")
            ).model_dump(),
        )
    elif msg == "invalid_csv_header":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="InvalidCsvHeader", message="Missing required column: name")
            ).model_dump(),
        )
    else:  # invalid_mime_type
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="InvalidCsv", message="File must be a valid CSV")
            ).model_dump(),
        )
```

**Import cần thêm:** `from sqlalchemy.ext.asyncio import AsyncSession` (nếu chưa có).

**Verification:** `ruff check` + `black --check` pass.

---

### Step 5 — Rewrite `projectColumns` trong `CsvColumnReference.tsx`

**File:** `apps/web/features/upload/CsvColumnReference.tsx`

Thay toàn bộ `projectColumns` array:

```typescript
const projectColumns: ColumnRow[] = [
  { name: "name",             example: "e.g. AI Platform Modernization", required: true  },
  { name: "description",      example: "short project description",       required: false },
  { name: "required_skills",  example: "Python,ML,Data",                  required: false },
  { name: "required_level",   example: "junior / mid / senior / lead",    required: false },
  { name: "headcount",        example: "number e.g. 3 (default: 1)",      required: false },
  { name: "status",           example: "planned / active / closed",        required: false },
  { name: "start_date",       example: "YYYY-MM-DD",                      required: false },
  { name: "end_date",         example: "YYYY-MM-DD",                      required: false },
];
```

**Verification:** `tsc --noEmit` + `npm run lint` pass.

---

### Step 6 — Cập nhật banner trong `upload/page.tsx`

**File:** `apps/web/app/upload/page.tsx`

Thay phần "Projects CSV — required columns" trong info banner:

**Từ (As-Is):**
```
project_id, name, status, start_date, end_date, required_skills
```

**Sang (To-Be):** Liệt kê `name` (required) + 7 cột optional theo đúng thứ tự spec:
```
name (required), description, required_skills, required_level, headcount, status, start_date, end_date
```

**Verification:** `tsc --noEmit` + `npm run lint` + `npm run build` pass.

---

### Step 7 — Mở rộng `test_csv_ingestion.py`

**File:** `apps/api/tests/test_csv_ingestion.py`

Giữ nguyên 6 tests cũ. Thêm các tests mới dưới dạng integration tests (dùng fixture `client`):

**Tests mới cần viết (map đến AC):**

| Test function | AC | Mô tả |
|---|---|---|
| `test_upload_projects_valid_25_rows_returns_inserted_25` | AC-3 | `projects_25.csv` → inserted=25 |
| `test_upload_projects_twice_returns_updated_25` | AC-4 | Upload 2 lần → updated=25 |
| `test_upload_projects_invalid_headcount_skips_row` | AC-5 | headcount=0 → skipped=1, error có "headcount" |
| `test_upload_projects_invalid_level_skips_row` | AC-6 | required_level=expert → error liệt kê allowed values |
| `test_upload_projects_end_before_start_skips_row` | AC-7 | end_date < start_date → skipped=1 |
| `test_upload_projects_empty_name_skips_row` | AC-8 | name="" → skipped=1, error có "name" |
| `test_upload_projects_missing_name_header_returns_400` | AC-9 | header thiếu name → 400 InvalidCsvHeader |
| `test_upload_projects_mix_valid_invalid_rows` | AC-10 | 20 valid + 3 invalid → skipped=3, errors.length=3 |
| `test_upload_projects_non_utf8_returns_400` | AC-11 | Latin-1 bytes → 400 InvalidEncoding |
| `test_upload_projects_optional_fields_empty_saves_null` | AC-13 | optional trống → DB null |
| `test_upload_projects_empty_file_returns_200` | OI-1 | 0 data rows → 200, inserted=0 |
| `test_upload_projects_upsert_overwrites_optional_with_null` | OI-3 | description cũ → null sau upsert |
| `test_upload_projects_exact_10mb_accepted` | B-1 | 10MB → 200 |
| `test_upload_projects_quoted_field_with_comma` | R-2 | `"Python,ML"` → parsed correctly |

**Helper trong test file:**
```python
def make_csv_upload(content: bytes, content_type: str = "text/csv", filename: str = "test.csv"):
    return {"file": (filename, content, content_type)}

VALID_HEADER = b"name,description,required_skills,required_level,headcount,status,start_date,end_date\n"
```

**Verification:** `pytest tests/test_csv_ingestion.py -v` — tất cả pass.

---

### Step 8 — Full Quality Gates

```bash
# Backend (từ apps/api/)
ruff check .
black --check .
pytest tests/ -q

# Frontend (từ apps/web/)
npx tsc --noEmit
npx eslint .
npx next build
```

---

## 4. Risks & Mitigation

| Risk | Khả năng | Mitigation |
|------|---------|-----------|
| Pandas đọc `headcount` là float (`1.0`) thay vì int khi parse với `dtype=str` + `keep_default_na=False` — không xảy ra vì `dtype=str` | Thấp | `dtype=str` đảm bảo tất cả là string; Pydantic validator tự coerce |
| `upsert_by_name()` race condition khi 2 request upload cùng lúc cùng tên project | Thấp | Không handle trong scope — ghi chú trong report.md |
| Pandas version conflict (nếu version cũ không support một số param) | Rất thấp | Pandas đã dùng trong stack (bench_prediction.py) |
| `CsvColumnReference.tsx` rewrite có thể ảnh hưởng visual layout nếu số columns thay đổi | Thấp | Inspect UI sau Step 5 |
| `test_csv_ingestion.py` tests cũ dùng mock `UploadFile` — sau khi thêm `db` param vào service, mock tests cũ vẫn chạy vì chúng test `parse_engineers_csv()` không phải `parse_projects_csv()` | — | Không ảnh hưởng |

---

## 5. Rollback Plan

Tất cả thay đổi là **additive** (thêm method, thêm schema, replace stub) — không có migration DB, không xóa code cũ.

Rollback = revert commit trên branch. Không cần thao tác DB.

---

## 6. Verification Procedure (sau khi hoàn thành)

```
1. pytest apps/api/tests/ -q          → Tất cả pass (bao gồm 6 tests cũ + 14 tests mới)
2. ruff check apps/api/               → 0 errors
3. black --check apps/api/            → 0 differences
4. tsc --noEmit (từ apps/web/)        → 0 errors
5. eslint . (từ apps/web/)            → 0 errors
6. next build (từ apps/web/)          → 0 errors
7. Manual: POST projects_25.csv → inserted=25
8. Manual: POST lại → updated=25
9. Manual: /upload page → Projects columns đúng, không có project_id
```

---

## 7. AC Mapping Table

| AC | Được đáp ứng tại | Test |
|----|-----------------|------|
| AC-1 (MIME invalid → 400) | `csv_ingestion.py` MIME check → router `ValueError` handler | UT (test cũ `test_invalid_mime_projects_raises_value_error`) |
| AC-2 (>10MB → 413) | `csv_ingestion.py` size check → router `OverflowError` handler | UT (test cũ `test_projects_csv_over_10mb_raises_overflow`) |
| AC-3 (25 valid rows → inserted=25) | `parse_projects_csv()` → `upsert_by_name()` INSERT path | IT `test_upload_projects_valid_25_rows_returns_inserted_25` |
| AC-4 (upload lại → updated=25) | `upsert_by_name()` UPDATE path (name found) | IT `test_upload_projects_twice_returns_updated_25` |
| AC-5 (headcount=0 → skipped) | `ProjectCsvRow` validator: `headcount > 0` | IT `test_upload_projects_invalid_headcount_skips_row` |
| AC-6 (level=expert → skipped) | `ProjectCsvRow` `Literal[...]` validator | IT `test_upload_projects_invalid_level_skips_row` |
| AC-7 (end < start → skipped) | `ProjectCsvRow` `@model_validator` cross-field check | IT `test_upload_projects_end_before_start_skips_row` |
| AC-8 (name empty → skipped) | `ProjectCsvRow` validator: `name` non-empty | IT `test_upload_projects_empty_name_skips_row` |
| AC-9 (no name header → 400) | `parse_projects_csv()` header check → `ValueError("invalid_csv_header")` → router | IT `test_upload_projects_missing_name_header_returns_400` |
| AC-10 (mix valid/invalid) | Loop row-by-row, collect errors độc lập | IT `test_upload_projects_mix_valid_invalid_rows` |
| AC-11 (non-UTF8 → 400) | `content.decode("utf-8-sig")` → `UnicodeDecodeError` → `ValueError("invalid_encoding")` → router | IT `test_upload_projects_non_utf8_returns_400` |
| AC-12 (UI column list đúng) | `CsvColumnReference.tsx` rewrite + `upload/page.tsx` banner | E2E / manual BB-12 |
| AC-13 (optional empty → null) | `ProjectCsvRow` model: empty string → `None`; `upsert_by_name()` overwrite | IT `test_upload_projects_optional_fields_empty_saves_null` |
