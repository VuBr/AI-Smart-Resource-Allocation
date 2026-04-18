# RA-012 Spec Pack — Upload Project CSV (Real Implementation)

**Version:** 1.0
**Date:** 2026-04-18
**Status:** Ready for implementation (pending OI resolution — see Open Issues)
**Sources:** `docs/changes/RA-012/sources.md`

---

## 1. Background / Purpose

Phase 5 (scaffold) đã tạo stub cho `parse_projects_csv`: validate MIME type và file size, nhưng không parse, không validate fields, không ghi DB.

RA-012 thay thế stub đó bằng real implementation: parse CSV, validate từng row/field, upsert vào DB, trả kết quả chi tiết theo row. Frontend đã có UploadZone và API client — chỉ cần cập nhật UI column reference (conflict C-1).

---

## 2. Scope

### Làm

- Implement `parse_projects_csv()` trong `csv_ingestion.py`: parse, validate, upsert
- Thêm `upsert_by_name()` vào `ProjectRepository`
- Cập nhật column reference trong `upload/page.tsx` (bỏ `project_id`)
- Mở rộng `test_csv_ingestion.py` với test cases thực (parse + DB)
- Trả response `{ inserted, updated, skipped, errors }` với error detail theo row

### Không làm

- Không thay đổi API endpoint path hay method (`POST /api/v1/projects/upload`)
- Không thêm authentication mới (giữ mock JWT hiện tại — SD-1 vẫn open)
- Không import `id`, `created_at`, `updated_at` từ CSV
- Không upload engineer CSV (scope riêng)
- Không thêm async job / progress tracking
- Không hỗ trợ Excel `.xlsx`

---

## 3. Terminology

| Term | Định nghĩa |
|------|-----------|
| **Upsert** | Insert nếu `name` chưa tồn tại; Update nếu `name` đã tồn tại |
| **Row error** | Lỗi validation tại một row cụ thể; row đó bị skip, các row khác vẫn xử lý |
| **Fatal error** | Lỗi làm hỏng toàn bộ file (MIME sai, file quá lớn, header thiếu); dừng toàn bộ |
| **Skipped** | Row bị bỏ qua vì lỗi validation (không insert, không update) |
| **Header row** | Dòng đầu tiên của CSV — phải chứa đúng tên cột |
| **required_skills** | Chuỗi kỹ năng phân cách bằng dấu phẩy, ví dụ `"Python,ML,Data"` |

---

## 4. As-Is / To-Be

### As-Is

```
POST /api/v1/projects/upload
  → CSVIngestionService.parse_projects_csv()
      → Validate MIME (REAL)
      → Validate size (REAL)
      → return {"inserted": 0, "updated": 0, "skipped": 0, "errors": []}  ← STUB
```

DB không được ghi. Response luôn trả `inserted=0`.

### To-Be

```
POST /api/v1/projects/upload
  → CSVIngestionService.parse_projects_csv()
      → Validate MIME (giữ nguyên)
      → Validate size (giữ nguyên)
      → Decode UTF-8
      → Parse CSV header → validate required columns
      → For each data row:
          → Validate fields (required, type, enum, range, date)
          → If invalid → append to errors[], skip row
          → If valid → ProjectRepository.upsert_by_name()
              → name exists → UPDATE → updated++
              → name not exists → INSERT → inserted++
      → return {"inserted": N, "updated": M, "skipped": K, "errors": [...]}
```

---

## 5. Detailed Specification

### 5.1 CSV Format

**Header (required, exact match, case-insensitive):**

```
name,description,required_skills,required_level,headcount,status,start_date,end_date
```

**Field rules:**

| Column | Required | Type | Validation Rules |
|--------|----------|------|-----------------|
| `name` | Yes | string | Non-empty, max 200 chars |
| `description` | No | string | Max 1000 chars; empty cell → `null` |
| `required_skills` | No | string | Max 500 chars; empty cell → `null` |
| `required_level` | No | enum | `junior` / `mid` / `senior` / `lead` hoặc empty → `null` |
| `headcount` | No | integer | Default `1` nếu empty; must be > 0 |
| `status` | No | enum | `planned` / `active` / `closed`; default `planned` nếu empty |
| `start_date` | No | date | Format `YYYY-MM-DD`; empty → `null` |
| `end_date` | No | date | Format `YYYY-MM-DD`; empty → `null`; nếu cả hai có giá trị: `end_date >= start_date` |

### 5.2 Upsert Logic

- **Lookup key:** `name` (exact match, case-sensitive)
- **Duplicate name in same CSV:** xử lý theo thứ tự xuất hiện — row đầu tiên upsert, row sau cũng upsert (tức là có thể update chính row vừa insert trong cùng một batch)
- **Fields updated on conflict:** tất cả fields trừ `id`, `created_at`; `updated_at` tự cập nhật

### 5.3 Error Format

Mỗi phần tử trong `errors[]` là một string theo format:

```
"Row {row_number}: {field} — {reason}"
```

Ví dụ:
```
"Row 3: headcount — must be > 0 (got: -1)"
"Row 7: end_date — must be >= start_date (2026-01-01 < 2026-06-01)"
"Row 12: required_level — invalid value 'expert'; allowed: junior, mid, senior, lead"
```

`row_number` đếm từ 1 (không tính header).

### 5.4 Response Schema

```json
{
  "inserted": 18,
  "updated": 5,
  "skipped": 2,
  "errors": [
    "Row 3: headcount — must be > 0 (got: 0)",
    "Row 9: required_level — invalid value 'expert'; allowed: junior, mid, senior, lead"
  ]
}
```

`skipped = errors.length` (mỗi row error tương ứng 1 row bị skip).

### 5.5 File-level Fatal Errors (hiện đã implement, giữ nguyên)

| Condition | HTTP Status | Error Code |
|-----------|-------------|-----------|
| MIME type không phải CSV | 400 | `InvalidCsv` |
| File > 10MB | 413 | `FileTooLarge` |

**Thêm mới — fatal error trả 400:**

| Condition | HTTP Status | Error Code | Message |
|-----------|-------------|-----------|---------|
| File không decode được UTF-8 | 400 | `InvalidEncoding` | `"File must be UTF-8 encoded"` |
| Header row thiếu cột `name` | 400 | `InvalidCsvHeader` | `"Missing required column: name"` |
| File rỗng (0 data rows) | 200 | — | `inserted=0, updated=0, skipped=0, errors=[]` |

### 5.6 Frontend — Column Reference Update

Trong `apps/web/app/upload/page.tsx`, phần "Projects CSV — required columns" cần cập nhật:

**Từ (As-Is):** `project_id, name, status, start_date, end_date, required_skills`

**Sang (To-Be):** `name` *(required)*, `description, required_skills, required_level, headcount, status, start_date, end_date` *(optional)*

---

## 6. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | File tối đa 10MB (`MAX_CSV_SIZE_MB` từ config) |
| NFR-2 | Encode UTF-8 (không hỗ trợ UTF-16 hay Latin-1) |
| NFR-3 | Xử lý tối thiểu 500 rows mà không timeout (FastAPI default timeout) |
| NFR-4 | Log `csv_import_started`, `csv_import_completed` (đã có); thêm log khi có row errors |
| NFR-5 | Không có transaction rollback toàn bộ khi có row error — partial success được chấp nhận |

---

## 7. Acceptance Criteria

**AC-1:** Upload file không phải CSV (MIME `text/html`, `application/json`, ...) → HTTP 400, `code: "InvalidCsv"`.

**AC-2:** Upload file CSV vượt 10MB → HTTP 413, `code: "FileTooLarge"`.

**AC-3:** Upload CSV có header hợp lệ và 25 data rows hợp lệ (file `projects_25.csv`) → HTTP 200, `inserted = 25`, `updated = 0`, `skipped = 0`, `errors = []`, và 25 rows tồn tại trong DB.

**AC-4:** Upload lại cùng file `projects_25.csv` lần 2 → HTTP 200, `inserted = 0`, `updated = 25`, `skipped = 0`, `errors = []`.

**AC-5:** Upload CSV có 1 row với `headcount = 0` → row đó bị skip, `skipped = 1`, `errors` chứa đúng 1 message bao gồm row number và field name.

**AC-6:** Upload CSV có 1 row với `required_level = "expert"` → row đó bị skip, `errors` chứa message nêu rõ giá trị không hợp lệ và danh sách giá trị cho phép.

**AC-7:** Upload CSV có 1 row với `end_date = "2026-01-01"` và `start_date = "2026-06-01"` (end < start) → row đó bị skip, `errors` chứa message nêu rõ vi phạm constraint.

**AC-8:** Upload CSV có 1 row với `name` rỗng → row đó bị skip, `errors` chứa message nêu rõ `name` là required.

**AC-9:** Upload CSV có header thiếu cột `name` → HTTP 400, `code: "InvalidCsvHeader"`.

**AC-10:** Upload CSV với 20 rows hợp lệ và 3 rows có lỗi → HTTP 200, `inserted + updated = 20`, `skipped = 3`, `errors.length = 3`.

**AC-11:** Upload CSV không encode UTF-8 (ví dụ Latin-1 với ký tự đặc biệt) → HTTP 400, `code: "InvalidEncoding"`.

**AC-12:** Trang Upload (`/upload`) hiển thị đúng column list cho Projects CSV: không có `project_id`, có `name` là required, các cột còn lại là optional.

**AC-13:** `description` rỗng hoặc không có trong CSV → DB lưu `null` (không phải empty string).

---

## 8. Examples

### Normal Cases

**N-1: Upload 25 rows hợp lệ (file projects_25.csv)**

Input: file `projects_25.csv` với 25 rows, tất cả đều hợp lệ.

```
name,description,required_skills,required_level,headcount,status,start_date,end_date
AI Platform Modernization,Upgrade internal AI platform,"Python,ML,Data",senior,3,active,2026-04-01,2026-10-31
...
```

Expected response:
```json
{"inserted": 25, "updated": 0, "skipped": 0, "errors": []}
```

DB: 25 rows mới trong bảng `projects`.

---

**N-2: Upload row với optional fields bỏ trống**

Input:
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
Minimal Project,,,,,,, 
```

Expected: `inserted = 1`, DB row có `description=null, required_skills=null, required_level=null, headcount=1, status="planned", start_date=null, end_date=null`.

---

**N-3: Upsert — update existing project**

Điều kiện: DB đã có project tên `"AI Platform Modernization"` với `headcount=3`.

Input CSV:
```
name,...,headcount,...
AI Platform Modernization,...,5,...
```

Expected: `updated = 1`, DB row `headcount = 5`.

---

### Abnormal Cases

**A-1: Row với `required_level` không hợp lệ**

Input row: `name=ProjectX, required_level=expert`

Expected: row bị skip.
```json
{
  "skipped": 1,
  "errors": ["Row 1: required_level — invalid value 'expert'; allowed: junior, mid, senior, lead"]
}
```

---

**A-2: Row với `end_date < start_date`**

Input row: `start_date=2026-06-01, end_date=2026-01-01`

Expected: row bị skip.
```json
{
  "errors": ["Row 1: end_date — must be >= start_date (end: 2026-01-01, start: 2026-06-01)"]
}
```

---

**A-3: File không phải CSV**

Input: file `.json` với MIME `application/json`

Expected: HTTP 400
```json
{"error": {"code": "InvalidCsv", "message": "File must be a valid CSV"}}
```

---

**A-4: Header thiếu cột `name`**

Input CSV:
```
description,status
Some project,active
```

Expected: HTTP 400
```json
{"error": {"code": "InvalidCsvHeader", "message": "Missing required column: name"}}
```

---

### Boundary Values

**B-1: File đúng 10MB (max size)**

Input: CSV file có kích thước bằng đúng `MAX_CSV_SIZE_MB * 1024 * 1024` bytes.

Expected: HTTP 200 (không bị reject).

---

**B-2: File 10MB + 1 byte (over limit)**

Input: CSV file có kích thước `MAX_CSV_SIZE_MB * 1024 * 1024 + 1` bytes.

Expected: HTTP 413, `code: "FileTooLarge"`.

---

**B-3: `name` đúng 200 ký tự (max length)**

Input: `name` = chuỗi 200 ký tự.

Expected: inserted = 1 (chấp nhận).

---

**B-4: `name` 201 ký tự (over max)**

Input: `name` = chuỗi 201 ký tự.

Expected: row bị skip, `errors` chứa message về `name` vượt 200 ký tự.

---

**B-5: `headcount = 1` (minimum valid)**

Input: `headcount = 1`

Expected: inserted = 1.

---

**B-6: `headcount = 0` (below minimum)**

Input: `headcount = 0`

Expected: row bị skip, error nêu rõ `headcount must be > 0`.

---

## 9. Open Issues

| ID | Question | Priority | Impact nếu không resolve |
|----|----------|----------|--------------------------|
| ~~OI-1~~ | ~~File rỗng (header + 0 data rows) — 200 hay 400?~~ | ~~Low~~ | **DECIDED (2026-04-18):** File rỗng → HTTP 200, `inserted=0, updated=0, skipped=0, errors=[]`. |
| ~~OI-2~~ | ~~`required_skills` normalize whitespace?~~ | ~~Low~~ | **DECIDED (2026-04-18):** Áp dụng `.strip()` trên từng field value khi parse — 1 dòng, không có logic phức tạp hơn. |
| ~~OI-3~~ | ~~Khi upsert, nếu field optional trong CSV bỏ trống, có overwrite giá trị cũ trong DB thành `null` không?~~ | ~~Medium~~ | **DECIDED (2026-04-18):** Field optional bỏ trống trong CSV → overwrite DB thành `null`. |

---

## 10. Risks

| ID | Risk | Mitigation |
|----|------|-----------|
| R-1 | CSV từ Excel có thể có BOM (Byte Order Mark) ở đầu file | Strip BOM khi decode UTF-8 |
| R-2 | `name` chứa dấu phẩy trong quoted field — csv module Python xử lý đúng nhưng cần test | Test với quoted field |
| R-3 | Partial success (một số rows insert, một số skip) có thể gây nhầm lẫn cho user | Response trả rõ `inserted + updated + skipped = total data rows` |

---

## 11. Traceability Table

| AC | Screen / Endpoint | DB Operation | Log Event | Test Type |
|----|-------------------|--------------|-----------|-----------|
| AC-1 | `POST /api/v1/projects/upload` | None | `csv_import_failed` | UT |
| AC-2 | `POST /api/v1/projects/upload` | None | `csv_import_failed` | UT |
| AC-3 | `POST /api/v1/projects/upload` | `INSERT projects` ×25 | `csv_import_completed` | IT |
| AC-4 | `POST /api/v1/projects/upload` | `UPDATE projects` ×25 | `csv_import_completed` | IT |
| AC-5 | `POST /api/v1/projects/upload` | None (row skipped) | — | UT |
| AC-6 | `POST /api/v1/projects/upload` | None (row skipped) | — | UT |
| AC-7 | `POST /api/v1/projects/upload` | None (row skipped) | — | UT |
| AC-8 | `POST /api/v1/projects/upload` | None (row skipped) | — | UT |
| AC-9 | `POST /api/v1/projects/upload` | None | — | UT |
| AC-10 | `POST /api/v1/projects/upload` | `INSERT/UPDATE` ×20 | `csv_import_completed` | IT |
| AC-11 | `POST /api/v1/projects/upload` | None | `csv_import_failed` | UT |
| AC-12 | `/upload` page (frontend) | None | None | E2E / BB |
| AC-13 | `POST /api/v1/projects/upload` | `INSERT projects` (null fields) | — | IT |
