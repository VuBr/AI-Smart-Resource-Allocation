# Code Review Checklist — RA-012: Upload Project CSV

**PR:** *(fill in)*
**Reviewer:** *(fill in)*
**Ngày review:** *(fill in)*

**Severity legend:**
- 🔴 **Blocker** — phải fix trước merge; sai spec hoặc data corruption risk
- 🟠 **Major** — nên fix; ảnh hưởng correctness hoặc security nhưng không block ngay
- 🟡 **Minor** — đề xuất cải thiện; không block merge

---

## 1. Specification & Acceptance Criteria

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 1.1 | 🔴 | MIME validation: reject non-CSV → HTTP 400 `InvalidCsv` | AC-1 | ✅ / ❌ |
| 1.2 | 🔴 | Size validation: >10MB → HTTP 413 `FileTooLarge` | AC-2 | ✅ / ❌ |
| 1.3 | 🔴 | 25 valid rows → `inserted=25, updated=0, skipped=0, errors=[]` | AC-3 | ✅ / ❌ |
| 1.4 | 🔴 | Upload lại cùng file → `inserted=0, updated=25` (upsert by name) | AC-4 | ✅ / ❌ |
| 1.5 | 🔴 | `headcount=0` hoặc âm → row skipped, error chứa "headcount" | AC-5 | ✅ / ❌ |
| 1.6 | 🔴 | `required_level` không thuộc `junior/mid/senior/lead` → row skipped, error chứa field name | AC-6 | ✅ / ❌ |
| 1.7 | 🔴 | `end_date < start_date` → row skipped, error chứa "end_date" | AC-7 | ✅ / ❌ |
| 1.8 | 🔴 | `name` rỗng (sau strip) → row skipped, error chứa "name" | AC-8 | ✅ / ❌ |
| 1.9 | 🔴 | Header thiếu cột `name` → HTTP 400 `InvalidCsvHeader` (không process rows) | AC-9 | ✅ / ❌ |
| 1.10 | 🔴 | Mix valid/invalid rows → partial success; invalid rows skipped, valid rows upserted | AC-10 | ✅ / ❌ |
| 1.11 | 🔴 | File non-UTF-8 → HTTP 400 `InvalidEncoding` | AC-11 | ✅ / ❌ |
| 1.12 | 🟠 | `/upload` page hiển thị `name` (required), 7 cột optional; không có `project_id` | AC-12 | ✅ / ❌ |
| 1.13 | 🔴 | Optional fields trống trong CSV → DB lưu `null` (không phải empty string) | AC-13 | ✅ / ❌ |
| 1.14 | 🟠 | File rỗng (header only, 0 data rows) → HTTP 200, `inserted=0` | OI-1 | ✅ / ❌ |
| 1.15 | 🟠 | Optional field có giá trị cũ trong DB, CSV row để trống → DB field overwrite thành `null` | OI-3 | ✅ / ❌ |

---

## 2. Design & Dependencies

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 2.1 | 🔴 | `parse_projects_csv()` nhận `db: AsyncSession` param — không tạo session bên trong service | — | ✅ / ❌ |
| 2.2 | 🔴 | Router `upload_projects()` có `db: AsyncSession = Depends(get_db)` và truyền vào service | — | ✅ / ❌ |
| 2.3 | 🔴 | `ProjectCsvRow.to_db_dict()` trả về đúng 8 fields (không bao gồm `id`, `created_at`, `updated_at`) | AC-3,4 | ✅ / ❌ |
| 2.4 | 🔴 | `upsert_by_name()` SELECT by `name` → nếu found thì UPDATE all fields, không INSERT thêm | AC-4 | ✅ / ❌ |
| 2.5 | 🟠 | `upsert_by_name()` return `(project, bool)` — `True` = inserted, `False` = updated; counter đúng | AC-3,4 | ✅ / ❌ |
| 2.6 | 🟠 | `ProjectCsvRow` đặt trong `schemas/project.py` (không inline trong service hoặc router) | — | ✅ / ❌ |
| 2.7 | 🟡 | Không có circular import: `schemas` ← `services` ← `repositories` — đúng dependency direction | — | ✅ / ❌ |
| 2.8 | 🟠 | Mỗi row upsert trong transaction riêng — một row fail không rollback các rows trước | AC-10 | ✅ / ❌ |

---

## 3. Security

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 3.1 | 🔴 | Không có secret / credential trong diff | — | ✅ / ❌ |
| 3.2 | 🔴 | Không có PII (email, tên người dùng) trong bất kỳ `log_event()` call nào | — | ✅ / ❌ |
| 3.3 | 🔴 | CSV content không được log trực tiếp (tránh leak data từ file upload) | — | ✅ / ❌ |
| 3.4 | 🔴 | Security Debt SD-1 (mock JWT) không bị xóa hoặc bypass trong endpoint upload | — | ✅ / ❌ |
| 3.5 | 🟠 | Input validation xảy ra ở Pydantic layer (`ProjectCsvRow`) trước khi ghi DB | AC-5–8 | ✅ / ❌ |
| 3.6 | 🟡 | `MAX_CSV_SIZE_MB` đọc từ `get_settings()` — không hardcode `10` trong code | AC-2 | ✅ / ❌ |

---

## 4. Performance

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 4.1 | 🟠 | Pandas đọc với `dtype=str, keep_default_na=False` — không tự-convert type gây side effect | AC-3 | ✅ / ❌ |
| 4.2 | 🟠 | File content được đọc một lần (`await file.read()`) — không đọc nhiều lần | — | ✅ / ❌ |
| 4.3 | 🟡 | Mỗi row là một DB round-trip (SELECT + INSERT/UPDATE) — acceptable cho ≤500 rows per spec NFR-3 | — | ✅ / N/A |
| 4.4 | 🟡 | Không có N+1 query nào ngoài loop upsert đã biết | — | ✅ / ❌ |

---

## 5. Compatibility

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 5.1 | 🔴 | BOM (`\xef\xbb\xbf`) từ Excel được strip — dùng `decode("utf-8-sig")` | — | ✅ / ❌ |
| 5.2 | 🔴 | Quoted fields chứa dấu phẩy (`"Python,ML"`) được parse đúng bởi Pandas | — | ✅ / ❌ |
| 5.3 | 🟠 | Column names được normalize (`.strip().lower()`) trước khi lookup — tránh lỗi whitespace | AC-9 | ✅ / ❌ |
| 5.4 | 🟠 | `upsert_by_name()` hoạt động với cả SQLite (test) lẫn PostgreSQL (production) — không dùng DB-specific syntax | — | ✅ / ❌ |
| 5.5 | 🟡 | MIME type `application/vnd.ms-excel` cũng được chấp nhận (cùng với `text/csv`, `application/csv`) | AC-1 | ✅ / ❌ |

---

## 6. Logs & Audit

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 6.1 | 🟠 | `log_event("csv_import_started", entity_type="projects", filename=...)` được gọi đầu function | — | ✅ / ❌ |
| 6.2 | 🟠 | `log_event("csv_import_completed", inserted=..., updated=..., skipped=..., errors=...)` khi thành công | — | ✅ / ❌ |
| 6.3 | 🟠 | `log_event("csv_import_failed", filename=..., error=...)` khi có fatal error (MIME, size, encoding, header) | — | ✅ / ❌ |
| 6.4 | 🟡 | Log fields không chứa giá trị từ CSV content (chỉ metadata như filename, count) | — | ✅ / ❌ |

---

## 7. Error Handling

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 7.1 | 🔴 | Router map đúng exception type → HTTP status: `OverflowError` → 413, `ValueError("invalid_mime_type")` → 400 `InvalidCsv` | AC-1,2 | ✅ / ❌ |
| 7.2 | 🔴 | `ValueError("invalid_encoding")` → 400 `InvalidEncoding` (không bị catch sai vào `InvalidCsv`) | AC-11 | ✅ / ❌ |
| 7.3 | 🔴 | `ValueError("invalid_csv_header")` → 400 `InvalidCsvHeader` | AC-9 | ✅ / ❌ |
| 7.4 | 🔴 | Error format đúng: `{"error": {"code": "...", "message": "..."}}` cho tất cả fatal errors | AC-1,2,9,11 | ✅ / ❌ |
| 7.5 | 🔴 | Row error format: `"Row {N}: {field} — {reason}"` (N đếm từ 1, không tính header row) | AC-5–8 | ✅ / ❌ |
| 7.6 | 🟠 | `ValidationError` từ `ProjectCsvRow` được bắt và format thành string — không raise ra ngoài | AC-5–8 | ✅ / ❌ |
| 7.7 | 🟠 | `skipped` count bằng đúng `len(errors)` — mỗi error tương ứng đúng 1 row bị skip | AC-10 | ✅ / ❌ |
| 7.8 | 🟡 | `headcount` non-numeric string (`"abc"`) được bắt gracefully thành row error, không crash service | AC-5 | ✅ / ❌ |

---

## 8. Testing

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 8.1 | 🔴 | Integration tests dùng in-memory SQLite (`conftest.py` fixture) — không mock repository | — | ✅ / ❌ |
| 8.2 | 🔴 | Có test cho cả INSERT path và UPDATE path của `upsert_by_name()` | AC-3,4 | ✅ / ❌ |
| 8.3 | 🔴 | Có test cho `InvalidEncoding` (non-UTF-8 bytes) | AC-11 | ✅ / ❌ |
| 8.4 | 🔴 | Có test cho `InvalidCsvHeader` (thiếu cột `name`) | AC-9 | ✅ / ❌ |
| 8.5 | 🟠 | Có test verify `description=null` trong DB khi optional field trống | AC-13 | ✅ / ❌ |
| 8.6 | 🟠 | Có test upsert overwrite `null` (OI-3) | OI-3 | ✅ / ❌ |
| 8.7 | 🟠 | Có test file rỗng → 200 (OI-1) | OI-1 | ✅ / ❌ |
| 8.8 | 🟠 | Có test quoted field với dấu phẩy | R-2 | ✅ / ❌ |
| 8.9 | 🟠 | 6 tests cũ (MIME + size) vẫn pass — không regression | — | ✅ / ❌ |
| 8.10 | 🟠 | Test names theo convention `test_<scenario>_<condition>_<result>` | — | ✅ / ❌ |
| 8.11 | 🟡 | Test cho file đúng 10MB không bị reject (boundary B-1) | B-1 | ✅ / ❌ |

---

## 9. Operations

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 9.1 | 🟠 | Không có DB migration mới — model `projects` không thay đổi schema | — | ✅ / ❌ |
| 9.2 | 🟠 | Rollback = revert git commit; không cần thao tác DB | — | ✅ / ❌ |
| 9.3 | 🟡 | Race condition (2 requests cùng upload cùng tên project) được ghi nhận trong report.md | — | ✅ / N/A |
| 9.4 | 🟡 | `test_projects.py::test_upload_projects_valid_csv_returns_200` (pre-existing) vẫn pass với implementation mới | — | ✅ / ❌ |

---

## 10. Quality Gates (Phải pass trước merge)

| Gate | Command | Kết quả |
|------|---------|---------|
| Backend lint | `ruff check .` | ✅ / ❌ |
| Backend format | `black --check .` | ✅ / ❌ |
| Backend tests | `pytest tests/ -q` | ✅ / ❌ |
| Frontend typecheck | `tsc --noEmit` | ✅ / ❌ |
| Frontend lint | `eslint .` | ✅ / ❌ |
| Frontend build | `next build` | ✅ / ❌ |

---

## 11. AC Mapping Summary

| AC | Check items xác nhận |
|----|---------------------|
| AC-1 | 1.1, 7.1, 7.4 |
| AC-2 | 1.2, 7.1, 3.6 |
| AC-3 | 1.3, 2.3, 2.5, 4.1, 8.2 |
| AC-4 | 1.4, 2.4, 2.5, 8.2 |
| AC-5 | 1.5, 3.5, 7.5, 7.8, 8.1 |
| AC-6 | 1.6, 3.5, 7.5 |
| AC-7 | 1.7, 3.5, 7.5 |
| AC-8 | 1.8, 3.5, 7.5 |
| AC-9 | 1.9, 5.3, 7.3, 7.4, 8.4 |
| AC-10 | 1.10, 2.8, 7.7 |
| AC-11 | 1.11, 5.1, 7.2, 7.4, 8.3 |
| AC-12 | 1.12 |
| AC-13 | 1.13, 8.5 |
| OI-1 | 1.14, 8.7 |
| OI-3 | 1.15, 8.6 |

---

## 12. Kết luận

**Blocker (🔴) tổng:** *(fill in — phải = 0 trước merge)*

**Major (🟠) tổng ❌:** *(fill in)*

**Minor (🟡) tổng ❌:** *(fill in)*

**Quyết định:**
- [ ] ✅ **APPROVE** — tất cả Blocker = ✅, Major ≤ 2 với accepted risk rõ ràng
- [ ] 🔄 **REQUEST CHANGES** — còn *(N)* Blocker hoặc Major chưa resolve
- [ ] 💬 **COMMENT** — chỉ có Minor, không block merge
