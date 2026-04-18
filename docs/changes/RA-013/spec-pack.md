# RA-013 Spec Pack — Upload Engineers CSV (Real Implementation)

**Version:** 1.0
**Date:** 2026-04-18
**Status:** Ready for implementation
**Sources:** `docs/changes/RA-013/sources.md`

---

## 1. Background / Purpose

Phase 5 (scaffold) đã tạo stub cho `parse_engineers_csv`: validate MIME type và file size, nhưng không parse, không validate fields, không ghi DB.

RA-013 thay thế stub đó bằng real implementation, **reuse tối đa pattern từ RA-012 (Projects CSV)**:
- `EngineerCsvRow` Pydantic schema (mirror `ProjectCsvRow`)
- `upsert_by_email()` trong `EngineerRepository` (mirror `upsert_by_name()`)
- `parse_engineers_csv()` real implementation trong `csv_ingestion.py`
- Router update: thêm `db: Depends(get_db)` + exception branches đầy đủ
- Frontend: rewrite `engineerColumns` trong `CsvColumnReference.tsx` (conflict C-3)

---

## 2. Scope

### Làm

- Implement `parse_engineers_csv()` thật trong `csv_ingestion.py`
- Thêm `EngineerCsvRow` Pydantic model vào `schemas/engineer.py`
- Thêm `upsert_by_email()` vào `EngineerRepository`
- Cập nhật router `upload_engineers()`: inject `db`, thêm exception branches
- Rewrite `engineerColumns` trong `CsvColumnReference.tsx` (sửa conflict C-3)
- Cập nhật banner Engineers CSV trong `upload/page.tsx`
- Mở rộng `test_csv_ingestion.py` với 14+ integration tests

### Không làm

- Không thay đổi endpoint path (`POST /api/v1/engineers/upload`)
- Không thêm authentication mới (giữ mock JWT — SD-1 vẫn open)
- Không import `id`, `created_at`, `updated_at` từ CSV
- Không hỗ trợ Excel `.xlsx`
- Không thêm async job / progress tracking

---

## 3. Terminology

| Term | Định nghĩa |
|------|-----------|
| **Upsert** | Insert nếu `email` chưa tồn tại trong DB; Update nếu `email` đã tồn tại |
| **Row error** | Lỗi validation tại một row cụ thể; row đó bị skip, các row khác vẫn xử lý |
| **Fatal error** | Lỗi làm hỏng toàn bộ file (MIME sai, file quá lớn, encoding sai, header thiếu); dừng toàn bộ |
| **Skipped** | Row bị bỏ qua vì validation lỗi hoặc duplicate email trong file |
| **Upsert key** | `email` — unique identifier cho engineer (khác Projects dùng `name`) |
| **Duplicate in file** | Email xuất hiện nhiều hơn 1 lần trong cùng CSV → chỉ process row đầu tiên |

---

## 4. As-Is / To-Be

### As-Is

```
POST /api/v1/engineers/upload
  → CSVIngestionService.parse_engineers_csv(file)   ← không nhận db
      → Validate MIME (REAL)
      → Validate size (REAL)
      → return {"inserted": 0, "updated": 0, "skipped": 0, "errors": []}  ← STUB

Router: upload_engineers(file: UploadFile)           ← không inject db
        Chỉ bắt ValueError (→ InvalidCsv) và OverflowError
```

### To-Be

```
POST /api/v1/engineers/upload
  → CSVIngestionService.parse_engineers_csv(file, db)
      → Validate MIME (giữ nguyên)
      → Validate size (giữ nguyên)
      → Decode UTF-8-SIG
      → Parse CSV header → validate required columns (name, email, primary_skill, level)
      → Track seen_emails set (duplicate detection in file)
      → For each data row:
          → Validate fields (required, email format, enum, range, date)
          → If duplicate email in file → skip (errors.append)
          → If invalid → skip (errors.append)
          → If valid → EngineerRepository.upsert_by_email()
              → email exists → UPDATE → updated++
              → email not exists → INSERT → inserted++
      → return {"inserted": N, "updated": M, "skipped": K, "errors": [...]}

Router: upload_engineers(file: UploadFile, db: AsyncSession = Depends(get_db))
        Bắt đầy đủ: OverflowError, ValueError("invalid_encoding"),
        ValueError("invalid_csv_header"), ValueError khác
```

---

## 5. Detailed Specification

### 5.1 CSV Format

**Header (required, case-insensitive, whitespace-stripped):**

```
name,email,primary_skill,secondary_skills,level,years_of_experience,availability_percentage,bench_start_date
```

**Field rules:**

| Column | Required | Type | Validation Rules |
|--------|----------|------|-----------------|
| `name` | Yes | string | Non-empty, max 200 chars |
| `email` | Yes | string | Non-empty; valid email format; unique per file (first occurrence wins) |
| `primary_skill` | Yes | string | Non-empty, max 100 chars |
| `level` | Yes | enum | `junior` / `mid` / `senior` / `lead` |
| `secondary_skills` | No | string | Max 500 chars; empty cell → `null` |
| `years_of_experience` | No | integer | Default `0` nếu empty; must be >= 0 |
| `availability_percentage` | No | integer | Default `100` nếu empty; must be 0–100 (inclusive) |
| `bench_start_date` | No | date | Format `YYYY-MM-DD`; empty → `null` |

**Columns DB không nhận từ CSV:** `id`, `created_at`, `updated_at`

### 5.2 Upsert Logic

- **Lookup key:** `email` (exact match, case-sensitive)
- **Duplicate email trong cùng CSV:** chỉ process row đầu tiên; các row sau với email trùng bị skip và thêm vào `errors[]`
- **Email trùng trong DB:** UPDATE tất cả fields (kể cả optional → `null` nếu bỏ trống)
- **Fields updated on conflict:** tất cả 8 fields import-able; `id`, `created_at` không đổi; `updated_at` tự cập nhật

### 5.3 Error Format

Mỗi phần tử trong `errors[]` là string theo format:

```
"Row {row_number}: {field} — {reason}"
```

Ví dụ:
```
"Row 2: email — value is not a valid email address"
"Row 5: level — Input should be 'junior', 'mid', 'senior' or 'lead'"
"Row 8: availability_percentage — must be between 0 and 100 (got: 120)"
"Row 11: email — duplicate email in file, skipped"
```

`row_number` đếm từ 1 (không tính header row).

### 5.4 Response Schema

```json
{
  "inserted": 290,
  "updated": 5,
  "skipped": 5,
  "errors": [
    "Row 2: email — value is not a valid email address",
    "Row 11: email — duplicate email in file, skipped"
  ]
}
```

`skipped == len(errors)`.

### 5.5 File-level Fatal Errors

| Condition | HTTP Status | Error Code | Message |
|-----------|-------------|-----------|---------|
| MIME type không phải CSV | 400 | `InvalidCsv` | `"File must be a valid CSV"` |
| File > 10MB | 413 | `FileTooLarge` | `"File exceeds maximum allowed size"` |
| File không decode được UTF-8 | 400 | `InvalidEncoding` | `"File must be UTF-8 encoded"` |
| Header thiếu ít nhất một trong `name`, `email`, `primary_skill`, `level` | 400 | `InvalidCsvHeader` | `"Missing required columns: {list}"` |
| File rỗng (0 data rows) | 200 | — | `inserted=0, updated=0, skipped=0, errors=[]` |

### 5.6 Frontend — Column Reference Update

**`CsvColumnReference.tsx`** — rewrite `engineerColumns`:

**As-Is (sai):** `employee_id, full_name, email, level, skills, department, manager, joined_date, location`

**To-Be (đúng):**
| Column | Required |
|--------|----------|
| `name` | required |
| `email` | required |
| `primary_skill` | required |
| `level` | required |
| `secondary_skills` | optional |
| `years_of_experience` | optional |
| `availability_percentage` | optional |
| `bench_start_date` | optional |

**`upload/page.tsx`** — cập nhật banner "Engineers CSV — required columns" hiển thị đúng 4 required columns.

---

## 6. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | File tối đa 10MB (`MAX_CSV_SIZE_MB` từ config) |
| NFR-2 | Encode UTF-8 (strip BOM với `utf-8-sig`) |
| NFR-3 | Xử lý tối thiểu 500 rows không timeout (test với `engineers_300.csv`) |
| NFR-4 | Log `csv_import_started`, `csv_import_completed`, `csv_import_failed` (giống Projects) |
| NFR-5 | Partial success — row error không rollback các rows hợp lệ |

---

## 7. Acceptance Criteria

**AC-1:** Upload file không phải CSV (MIME `text/html`, `application/json`) → HTTP 400, `code: "InvalidCsv"`.

**AC-2:** Upload file CSV vượt 10MB → HTTP 413, `code: "FileTooLarge"`.

**AC-3:** Upload CSV hợp lệ với 300 data rows (`engineers_300.csv`) → HTTP 200, `inserted = 300`, `updated = 0`, `skipped = 0`, `errors = []`, 300 rows tồn tại trong DB.

**AC-4:** Upload lại cùng file `engineers_300.csv` lần 2 → HTTP 200, `inserted = 0`, `updated = 300`, `skipped = 0`, `errors = []`.

**AC-5:** Upload CSV có 1 row với `email` sai format (ví dụ `"not-an-email"`) → row đó bị skip, `skipped = 1`, `errors` chứa message gồm row number và `"email"`.

**AC-6:** Upload CSV có 1 row với `level = "expert"` → row đó bị skip, `errors` chứa message liệt kê allowed values.

**AC-7:** Upload CSV có 1 row với `availability_percentage = 120` → row đó bị skip, `errors` chứa message về `availability_percentage`.

**AC-8:** Upload CSV có 1 row với `years_of_experience = -1` → row đó bị skip, `errors` chứa message về `years_of_experience`.

**AC-9:** Upload CSV có 1 row với `name` rỗng → row đó bị skip, `errors` chứa message về `name`.

**AC-10:** Upload CSV có 1 row với `email` rỗng → row đó bị skip, `errors` chứa message về `email`.

**AC-11:** Upload CSV có 1 row với `primary_skill` rỗng → row đó bị skip, `errors` chứa message về `primary_skill`.

**AC-12:** Upload CSV có header thiếu một trong `name`, `email`, `primary_skill`, `level` → HTTP 400, `code: "InvalidCsvHeader"`.

**AC-13:** Upload CSV không encode UTF-8 → HTTP 400, `code: "InvalidEncoding"`.

**AC-14:** Upload CSV với 20 rows hợp lệ và 3 rows lỗi → HTTP 200, `inserted + updated = 20`, `skipped = 3`, `errors.length = 3`.

**AC-15:** Upload CSV có 2 rows với cùng email → row đầu được insert/update, row sau bị skip với error `"duplicate email in file"`.

**AC-16:** Upload CSV có 1 row với email trùng DB (row đã insert ở AC-3) nhưng thay đổi fields khác → HTTP 200, `updated = 1`, DB phản ánh giá trị mới.

**AC-17:** `secondary_skills`, `years_of_experience`, `availability_percentage`, `bench_start_date` bỏ trống → DB lưu `null` / default đúng spec (null cho string/date; 0 cho years; 100 cho availability).

**AC-18:** Trang Upload (`/upload`) hiển thị đúng `engineerColumns`: `name`, `email`, `primary_skill`, `level` (required); `secondary_skills`, `years_of_experience`, `availability_percentage`, `bench_start_date` (optional).

---

## 8. Examples

### Normal Cases

**N-1: Upload 300 rows hợp lệ**

Expected: `{"inserted": 300, "updated": 0, "skipped": 0, "errors": []}`

---

**N-2: Optional fields bỏ trống**

Input:
```
name,email,primary_skill,secondary_skills,level,years_of_experience,availability_percentage,bench_start_date
Nguyen Van A,a@example.com,Python,,senior,,,
```

Expected: `inserted = 1`, DB: `secondary_skills=null, years_of_experience=0, availability_percentage=100, bench_start_date=null`.

---

**N-3: Upsert — update existing engineer**

Điều kiện: DB đã có engineer với `email="a@example.com"`, `years_of_experience=3`.

Upload CSV với cùng email nhưng `years_of_experience=5`.

Expected: `updated = 1`, DB: `years_of_experience=5`.

---

### Abnormal Cases

**A-1: Email invalid**

Input: `email = "not-an-email"`

Expected: `skipped=1`, `errors=["Row 1: email — value is not a valid email address"]`

---

**A-2: Duplicate email trong file**

Input: 2 rows với cùng email `"a@example.com"`.

Expected: `inserted=1, skipped=1`, `errors=["Row 2: email — duplicate email in file, skipped"]`

---

**A-3: level invalid**

Input: `level = "expert"`

Expected: `skipped=1`, `errors` chứa `"level"` và allowed values.

---

**A-4: availability_percentage = 120**

Expected: `skipped=1`, `errors` chứa `"availability_percentage"`.

---

### Boundary Values

**B-1: File đúng 10MB** → HTTP 200.

**B-2: `years_of_experience = 0`** (minimum valid) → inserted = 1.

**B-3: `availability_percentage = 0`** (minimum valid) → inserted = 1.

**B-4: `availability_percentage = 100`** (maximum valid) → inserted = 1.

**B-5: `bench_start_date` sai format (`"01-01-2026"`)** → row skipped, error về `bench_start_date`.

---

## 9. Open Issues

| ID | Quyết định |
|----|-----------|
| ~~OI-1~~ | **DECIDED (2026-04-18):** Response format = Projects `inserted/updated/skipped/errors[]`. |
| ~~OI-2~~ | **DECIDED (2026-04-18):** Duplicate email trong file → skip row sau (không reject cả file). |
| ~~OI-3~~ | **DECIDED (2026-04-18):** Email trùng DB → UPDATE (upsert by email). |

---

## 10. Risks

| ID | Risk | Mitigation |
|----|------|-----------|
| R-1 | CSV từ Excel có BOM | Strip BOM với `decode("utf-8-sig")` — giống Projects |
| R-2 | `secondary_skills` chứa dấu phẩy trong quoted field | Pandas xử lý đúng — test với quoted field |
| R-3 | Email case sensitivity — `"A@Example.com"` vs `"a@example.com"` | Không normalize case (exact match) — consistent với DB unique index |
| R-4 | Pydantic EmailStr requires `email-validator` package | Dùng regex validator thay vì `EmailStr` nếu package chưa install — kiểm tra trong Phase 3 |

---

## 11. Traceability Table

| AC | Endpoint | DB Operation | Log Event | Test Type |
|----|----------|--------------|-----------|-----------|
| AC-1 | `POST /api/v1/engineers/upload` | None | `csv_import_failed` | UT |
| AC-2 | `POST /api/v1/engineers/upload` | None | `csv_import_failed` | UT |
| AC-3 | `POST /api/v1/engineers/upload` | `INSERT engineers` ×300 | `csv_import_completed` | IT |
| AC-4 | `POST /api/v1/engineers/upload` | `UPDATE engineers` ×300 | `csv_import_completed` | IT |
| AC-5 | `POST /api/v1/engineers/upload` | None (row skipped) | — | IT |
| AC-6 | `POST /api/v1/engineers/upload` | None (row skipped) | — | IT |
| AC-7 | `POST /api/v1/engineers/upload` | None (row skipped) | — | IT |
| AC-8 | `POST /api/v1/engineers/upload` | None (row skipped) | — | IT |
| AC-9 | `POST /api/v1/engineers/upload` | None (row skipped) | — | IT |
| AC-10 | `POST /api/v1/engineers/upload` | None (row skipped) | — | IT |
| AC-11 | `POST /api/v1/engineers/upload` | None (row skipped) | — | IT |
| AC-12 | `POST /api/v1/engineers/upload` | None | `csv_import_failed` | IT |
| AC-13 | `POST /api/v1/engineers/upload` | None | `csv_import_failed` | UT |
| AC-14 | `POST /api/v1/engineers/upload` | `INSERT/UPDATE` ×20 | `csv_import_completed` | IT |
| AC-15 | `POST /api/v1/engineers/upload` | `INSERT` ×1 (skip ×1) | — | IT |
| AC-16 | `POST /api/v1/engineers/upload` | `UPDATE engineers` ×1 | — | IT |
| AC-17 | `POST /api/v1/engineers/upload` | `INSERT engineers` (null/default fields) | — | IT |
| AC-18 | `/upload` page (frontend) | None | None | BB |
