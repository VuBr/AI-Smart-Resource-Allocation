# Test Plan — RA-012: Upload Project CSV (Real Implementation)

**Ticket:** RA-012
**Spec-pack:** `docs/changes/RA-012/spec-pack.md`
**Ngày tạo:** 2026-04-18

---

## 1. Phạm vi Test

| Tầng | Bao phủ | Công cụ |
|------|---------|---------|
| Backend Unit | `ProjectCsvRow` Pydantic validation logic (field rules, enum, date constraint) | pytest |
| Backend Integration | `POST /api/v1/projects/upload` → in-memory SQLite (upsert, row errors, fatal errors) | pytest + httpx AsyncClient |
| Frontend Unit | Không cần — `UploadZone` là presentational, không có logic mới | N/A |
| E2E / Black-box | Upload `projects_25.csv` qua UI → kết quả hiển thị đúng | Playwright / manual |

---

## 2. Test Cases — Backend

### 2.1 Unit Tests — `ProjectCsvRow` Validation

| TC# | Input | Expected | AC# |
|-----|-------|---------|-----|
| UT-BE-01 | `required_level = "expert"` | ValidationError: invalid enum | AC-6 |
| UT-BE-02 | `headcount = 0` | ValidationError: must be > 0 | AC-6 (headcount variant) / AC-5 |
| UT-BE-03 | `headcount = -5` | ValidationError: must be > 0 | AC-5 |
| UT-BE-04 | `end_date = "2026-01-01"`, `start_date = "2026-06-01"` | ValidationError: end < start | AC-7 |
| UT-BE-05 | `name = ""` (empty string) | ValidationError: name required | AC-8 |
| UT-BE-06 | `name` = 200 chars | Valid (no error) | B-3 |
| UT-BE-07 | `name` = 201 chars | ValidationError: max 200 | B-4 |
| UT-BE-08 | `description = ""` → None | `description = null` | AC-13 |
| UT-BE-09 | `headcount = ""` → default | `headcount = 1` | N-2 |
| UT-BE-10 | `status = ""` → default | `status = "planned"` | N-2 |
| UT-BE-11 | `required_level = "senior"` | Valid | AC-3 |
| UT-BE-12 | `start_date = "invalid-date"` | ValidationError: invalid date format | — |

### 2.2 Integration Tests — Endpoint → DB

| TC# | Input | Status | Response | AC# |
|-----|-------|--------|---------|-----|
| IT-BE-01 | MIME `application/json` | 400 | `code: "InvalidCsv"` | AC-1 |
| IT-BE-02 | File > 10MB | 413 | `code: "FileTooLarge"` | AC-2 |
| IT-BE-03 | `projects_25.csv` (25 valid rows, DB empty) | 200 | `inserted=25, updated=0, skipped=0, errors=[]` | AC-3 |
| IT-BE-04 | `projects_25.csv` lần 2 (25 rows đã có trong DB) | 200 | `inserted=0, updated=25, skipped=0, errors=[]` | AC-4 |
| IT-BE-05 | CSV 1 row: `headcount=0` | 200 | `skipped=1, errors` có "Row 1: headcount" | AC-5 |
| IT-BE-06 | CSV 1 row: `required_level=expert` | 200 | `skipped=1, errors` có "Row 1: required_level" + allowed values | AC-6 |
| IT-BE-07 | CSV 1 row: `end_date < start_date` | 200 | `skipped=1, errors` có "Row 1: end_date" | AC-7 |
| IT-BE-08 | CSV 1 row: `name=""` | 200 | `skipped=1, errors` có "Row 1: name" | AC-8 |
| IT-BE-09 | CSV không có cột `name` trong header | 400 | `code: "InvalidCsvHeader"` | AC-9 |
| IT-BE-10 | CSV 20 rows hợp lệ + 3 rows lỗi | 200 | `inserted+updated=20, skipped=3, errors.length=3` | AC-10 |
| IT-BE-11 | File Latin-1 (non-UTF-8) | 400 | `code: "InvalidEncoding"` | AC-11 |
| IT-BE-12 | CSV 1 row optional fields trống | 200 | DB: `description=null, required_skills=null, required_level=null, headcount=1, status="planned"` | AC-13 |
| IT-BE-13 | File đúng 10MB | 200 | Không reject (inserted/updated/skipped bình thường) | B-1 |
| IT-BE-14 | File 10MB + 1 byte | 413 | `code: "FileTooLarge"` | B-2 |
| IT-BE-15 | Upsert: 1 row, name đã có, field khác thay đổi | 200 | `inserted=0, updated=1`; DB có giá trị mới | AC-4 |
| IT-BE-16 | Upsert: optional field cũ có giá trị, CSV row để trống | 200 | DB field → `null` (overwrite) | OI-3 resolved |

---

## 3. Test Cases — Frontend

### 3.1 Unit Tests

Không cần — `UploadZone` là presentational component, không có logic mới sau RA-012.

### 3.2 E2E Tests

| TC# | Flow | Pre-condition | Steps | Expected | AC# |
|-----|------|-------------|-------|---------|-----|
| E2E-01 | Upload projects_25.csv | Stack running, đã login | 1. Vào /upload<br>2. Chọn projects_25.csv vào Projects zone<br>3. Click "Upload Projects CSV"<br>4. Xem kết quả | `inserted=25, updated=0, errors=[]` hiển thị | AC-3 |
| E2E-02 | Column reference đúng | Stack running, đã login | 1. Vào /upload<br>2. Xem Projects CSV column list | Không có `project_id`; có `name` (required) | AC-12 |
| E2E-03 | Upload file sai MIME | Stack running, đã login | 1. Upload file .json vào Projects zone | Error message hiển thị | AC-1 |

---

## 4. Test Data

| Loại data | File / Giá trị | Mục đích |
|----------|---------------|---------|
| CSV 25 rows hợp lệ | `docs/changes/RA-012/Raw/projects_25.csv` | AC-3, AC-4, E2E-01 |
| CSV 1 row: headcount=0 | Inline trong test | AC-5 |
| CSV 1 row: required_level=expert | Inline trong test | AC-6 |
| CSV 1 row: end_date < start_date | Inline trong test | AC-7 |
| CSV thiếu header `name` | Inline trong test | AC-9 |
| CSV 20 valid + 3 invalid rows | Inline trong test | AC-10 |
| File Latin-1 | Binary trong test (b"\xe0\xe1\xe2") | AC-11 |
| File 10MB + 1 byte | `b"x" * (10*1024*1024+1)` | B-2 |
| File đúng 10MB | `b"name\n" + b"A\n" * N` đủ 10MB | B-1 |

> **Lưu ý:** CSV inline trong test dùng `io.StringIO` hoặc `BytesIO` — không cần file thật trên disk.

---

## 5. Môi trường Test

| Tầng | Môi trường | Setup |
|------|-----------|-------|
| Backend UT/IT | In-memory SQLite | `conftest.py` fixture tự tạo schema từ SQLAlchemy models |
| E2E | Docker Compose | `docker compose up` → chờ healthy → `npx playwright test` |
| CI | GitHub Actions `backend-test` job | Chạy pytest tự động |

---

## 6. Out of Scope

- Engineer CSV upload (ticket riêng)
- Real JWT authentication (SD-1 chưa resolve)
- Performance / load tests (NFR-3 chỉ yêu cầu 500 rows không timeout — kiểm tra manual)
- Redis cache invalidation sau upsert
- Frontend unit test cho UploadZone (không có logic mới)
