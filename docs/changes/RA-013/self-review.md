# Self-Review — RA-013: Upload Engineers CSV

**Ticket:** RA-013
**Reviewer (self):** Claude (Phase 5)
**Ngày review:** *(fill in before PR)*
**Branch:** develop
**Commit:** *(fill in before PR)*

---

## 1. Scope

- [ ] Tất cả 18 AC trong spec-pack đã được implement
- [ ] Không có file nào bị thay đổi ngoài danh sách trong `impl-plan.md §2`
- [ ] Không có "nice to have" nào được thêm vào ngoài scope
- [ ] OI-1, OI-2, OI-3 đều đã được resolve và implement đúng quyết định

**Files đã thay đổi (đối chiếu với impl-plan):**

| File | Thay đổi | Đúng scope? |
|------|---------|------------|
| `apps/api/app/schemas/engineer.py` | Thêm `EngineerCsvRow` | [ ] ✅ / ❌ |
| `apps/api/app/repositories/engineer_repository.py` | Thêm `upsert_by_email()` | [ ] ✅ / ❌ |
| `apps/api/app/services/csv_ingestion.py` | Replace `parse_engineers_csv()` stub | [ ] ✅ / ❌ |
| `apps/api/app/api/v1/routers/engineers.py` | Thêm `db: Depends(get_db)`, 3 except branches | [ ] ✅ / ❌ |
| `apps/web/features/upload/CsvColumnReference.tsx` | Rewrite `engineerColumns` | [ ] ✅ / ❌ |
| `apps/web/app/upload/page.tsx` | Cập nhật banner Engineers CSV | [ ] ✅ / ❌ |
| `apps/api/tests/test_csv_ingestion.py` | Thêm ~16 integration tests | [ ] ✅ / ❌ |

---

## 2. Quality Gates

### 2.1 Backend

- [ ] `ruff check .` — 0 errors

```
(fill in)
```

- [ ] `black --check .` — 0 differences

```
(fill in)
```

- [ ] `pytest tests/ -q` — all passed

```
(fill in)
```

### 2.2 Frontend

- [ ] `tsc --noEmit` — 0 errors trên files RA-013

```
(fill in)
```

- [ ] `eslint features/upload/CsvColumnReference.tsx app/upload/page.tsx` — 0 errors

```
(fill in)
```

- [ ] `next build` — *(verify khi web container khả dụng)*

---

## 3. Spec & AC Verification

### 3.1 Fatal Errors (HTTP response)

- [ ] **AC-1:** MIME `text/html` → HTTP 400, `code: "InvalidCsv"`
- [ ] **AC-2:** File >10MB → HTTP 413, `code: "FileTooLarge"`
- [ ] **AC-12:** Header thiếu required column → HTTP 400, `code: "InvalidCsvHeader"`
- [ ] **AC-13:** File non-UTF-8 → HTTP 400, `code: "InvalidEncoding"`

### 3.2 Row-level Validation

- [ ] **AC-5:** `email` sai format → `skipped=1`, error chứa `"email"`
- [ ] **AC-6:** `level = "expert"` → `skipped=1`, error liệt kê allowed values
- [ ] **AC-7:** `availability_percentage = 120` → `skipped=1`, error chứa `"availability_percentage"`
- [ ] **AC-8:** `years_of_experience = -1` → `skipped=1`, error chứa `"years_of_experience"`
- [ ] **AC-9:** `name` rỗng → `skipped=1`, error chứa `"name"`
- [ ] **AC-10:** `email` rỗng → `skipped=1`, error chứa `"email"`
- [ ] **AC-11:** `primary_skill` rỗng → `skipped=1`, error chứa `"primary_skill"`
- [ ] **AC-15:** Duplicate email trong file → row sau bị skip, error `"duplicate email in file"`

### 3.3 Upsert Logic

- [ ] **AC-3:** 300 valid rows, DB empty → `inserted=300, updated=0, skipped=0, errors=[]`
- [ ] **AC-4:** Upload lại cùng file → `inserted=0, updated=300`
- [ ] **AC-16:** Email trùng DB với fields khác → `updated=1`, DB phản ánh giá trị mới

### 3.4 DB Correctness

- [ ] **AC-17:** `secondary_skills`, `bench_start_date` trống → `null` trong DB
- [ ] **AC-17:** `years_of_experience` trống → `0` trong DB
- [ ] **AC-17:** `availability_percentage` trống → `100` trong DB

### 3.5 Frontend

- [ ] **AC-18:** `engineerColumns` có `name`, `email`, `primary_skill`, `level` (required); 4 cột optional — không có `employee_id`
- [ ] **AC-18:** Banner Engineers CSV hiển thị 4 required columns đúng

---

## 4. Implementation Details

### 4.1 CSV Parsing

- [ ] Decode với `"utf-8-sig"` (tự strip BOM)
- [ ] `pd.read_csv(..., dtype=str, keep_default_na=False)`
- [ ] Column names normalize: `.strip().lower()`
- [ ] `.strip()` trên từng cell — `EngineerCsvRow._coerce_and_strip`

### 4.2 `EngineerCsvRow` Validators

- [ ] `""` → `None` cho optional string/date fields
- [ ] `years_of_experience=""` → default `0`
- [ ] `availability_percentage=""` → default `100`
- [ ] Email format validated (regex hoặc EmailStr)
- [ ] `availability_percentage` range: 0–100 inclusive
- [ ] `years_of_experience` >= 0

### 4.3 `upsert_by_email()`

- [ ] SELECT `WHERE email = data["email"]`
- [ ] Found → `setattr` tất cả fields → `flush()` → `refresh()` → `commit()`
- [ ] Not found → `Engineer(**data)` → `add()` → `commit()` → `refresh()`
- [ ] Return `(engineer, True)` nếu INSERT, `(engineer, False)` nếu UPDATE

### 4.4 Router Wiring

- [ ] `upload_engineers(file: UploadFile, db: AsyncSession = Depends(get_db))`
- [ ] `service.parse_engineers_csv(file, db)`
- [ ] `ValueError("invalid_encoding")` → 400 `InvalidEncoding`
- [ ] `ValueError("invalid_csv_header")` → 400 `InvalidCsvHeader`
- [ ] Các `ValueError` khác → 400 `InvalidCsv`
- [ ] `OverflowError` → 413 `FileTooLarge`

---

## 5. Security

- [ ] Không có secret / credential trong diff
- [ ] Không có PII trong `log_event()` calls mới
- [ ] CSV content không được log
- [ ] SD-1 mock JWT comments không bị xóa
- [ ] `MAX_CSV_SIZE_MB` đọc từ `get_settings()`

---

## 6. Commands đã chạy & Kết quả thực tế

### Run cuối (pre-PR)

| Command | Output tóm tắt | Pass? |
|---------|---------------|-------|
| `ruff check` (RA-013 files) | *(fill in)* | [ ] |
| `black --check` (RA-013 files) | *(fill in)* | [ ] |
| `pytest tests/ -q` | *(fill in)* | [ ] |
| `tsc --noEmit` (RA-013 files) | *(fill in)* | [ ] |
| `eslint` (RA-013 files) | *(fill in)* | [ ] |
| `next build` | *(fill in or SKIP)* | [ ] |

**pytest breakdown:**
```
(fill in — list test names + PASSED/FAILED)
```

---

## 7. Known Risks & Issues còn lại

### 7.1 Race Condition — (evaluate)

**Mô tả:** `upsert_by_email()` dùng SELECT + conditional INSERT/UPDATE — không atomic.

**Đánh giá:** *(fill in — acceptable or not?)*

**Severity:** Low. **Action:** *(fill in)*

---

### 7.2 Pre-existing TypeScript errors — not RA-013

**Mô tả:** `tsc --noEmit` báo lỗi ở `engineers/[id]/page.tsx` và `projects/[id]/page.tsx`. Tồn tại trước RA-013.

**Severity:** N/A. **Action:** Không fix trong scope RA-013.

---

### 7.3 `next build` chưa verify

**Mô tả:** Web container không chạy → không verify `next build`.

**Severity:** Low. **Action:** Verify manually khi khởi động web container.

---

### 7.4 Test path `engineers_300.csv` phụ thuộc vào vị trí file ngoài container

**Mô tả:** 2 tests dùng `pathlib.Path` để đọc CSV từ `docs/changes/RA-013/Raw/engineers_300.csv`. File phải được copy vào container thủ công.

**Severity:** Low. **Action:** Copy file vào container trước khi chạy test.

---

## 8. Tóm tắt

**Tổng mục ❌:** *(fill in)*

**Accepted risks:** *(fill in)*

**Sẵn sàng tạo PR:** [ ] ✅ CÓ / [ ] ❌ CHƯA — còn *(N)* items cần fix
