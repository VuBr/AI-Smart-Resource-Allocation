# Code Review Checklist — RA-013: Upload Engineers CSV

**PR:** *(fill in)*
**Reviewer:** *(fill in)*
**Ngày review:** *(fill in)*

**Severity legend:**
- 🔴 **Blocker** — phải fix trước merge
- 🟠 **Major** — nên fix; ảnh hưởng correctness hoặc security
- 🟡 **Minor** — đề xuất cải thiện; không block merge

---

## 1. Specification & Acceptance Criteria

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 1.1 | 🔴 | MIME validation: reject non-CSV → HTTP 400 `InvalidCsv` | AC-1 | ✅ / ❌ |
| 1.2 | 🔴 | Size validation: >10MB → HTTP 413 `FileTooLarge` | AC-2 | ✅ / ❌ |
| 1.3 | 🔴 | 300 valid rows → `inserted=300, updated=0, skipped=0, errors=[]` | AC-3 | ✅ / ❌ |
| 1.4 | 🔴 | Upload lại cùng file → `inserted=0, updated=300` (upsert by email) | AC-4 | ✅ / ❌ |
| 1.5 | 🔴 | `email` sai format → row skipped, error chứa "email" | AC-5 | ✅ / ❌ |
| 1.6 | 🔴 | `level` không thuộc `junior/mid/senior/lead` → row skipped | AC-6 | ✅ / ❌ |
| 1.7 | 🔴 | `availability_percentage > 100` → row skipped | AC-7 | ✅ / ❌ |
| 1.8 | 🔴 | `years_of_experience < 0` → row skipped | AC-8 | ✅ / ❌ |
| 1.9 | 🔴 | `name` rỗng → row skipped, error chứa "name" | AC-9 | ✅ / ❌ |
| 1.10 | 🔴 | `email` rỗng → row skipped, error chứa "email" | AC-10 | ✅ / ❌ |
| 1.11 | 🔴 | `primary_skill` rỗng → row skipped, error chứa "primary_skill" | AC-11 | ✅ / ❌ |
| 1.12 | 🔴 | Header thiếu required column → HTTP 400 `InvalidCsvHeader` | AC-12 | ✅ / ❌ |
| 1.13 | 🔴 | File non-UTF-8 → HTTP 400 `InvalidEncoding` | AC-13 | ✅ / ❌ |
| 1.14 | 🔴 | Mix valid/invalid rows → partial success | AC-14 | ✅ / ❌ |
| 1.15 | 🔴 | Duplicate email trong file → row sau bị skip, error "duplicate email in file" | AC-15 | ✅ / ❌ |
| 1.16 | 🔴 | Email trùng DB → UPDATE (không INSERT thêm) | AC-16 | ✅ / ❌ |
| 1.17 | 🔴 | Optional fields trống → DB lưu `null` / default đúng spec | AC-17 | ✅ / ❌ |
| 1.18 | 🟠 | `/upload` page hiển thị đúng engineerColumns (4 required + 4 optional) | AC-18 | ✅ / ❌ |

---

## 2. Design & Dependencies

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 2.1 | 🔴 | `parse_engineers_csv()` nhận `db: AsyncSession` param | — | ✅ / ❌ |
| 2.2 | 🔴 | Router `upload_engineers()` có `db: AsyncSession = Depends(get_db)` và truyền vào service | — | ✅ / ❌ |
| 2.3 | 🔴 | `EngineerCsvRow.to_db_dict()` trả về đúng 8 fields (không bao gồm `id`, `created_at`, `updated_at`) | AC-3 | ✅ / ❌ |
| 2.4 | 🔴 | `upsert_by_email()` SELECT by `email` → nếu found thì UPDATE all fields, không INSERT thêm | AC-4,16 | ✅ / ❌ |
| 2.5 | 🟠 | `upsert_by_email()` return `(engineer, bool)` — `True` = inserted, `False` = updated | AC-3,4 | ✅ / ❌ |
| 2.6 | 🟠 | `EngineerCsvRow` đặt trong `schemas/engineer.py` (không inline trong service hoặc router) | — | ✅ / ❌ |
| 2.7 | 🔴 | `seen_emails` set được track trong service loop — duplicate check TRƯỚC khi Pydantic validation | AC-15 | ✅ / ❌ |
| 2.8 | 🟠 | Mỗi row upsert trong transaction riêng — một row fail không rollback các rows trước | AC-14 | ✅ / ❌ |
| 2.9 | 🟡 | Không có circular import: `schemas` ← `services` ← `repositories` | — | ✅ / ❌ |

---

## 3. Security

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 3.1 | 🔴 | Không có secret / credential trong diff | — | ✅ / ❌ |
| 3.2 | 🔴 | Không có PII (email, tên người dùng) trong bất kỳ `log_event()` call nào | — | ✅ / ❌ |
| 3.3 | 🔴 | CSV content không được log trực tiếp | — | ✅ / ❌ |
| 3.4 | 🔴 | Security Debt SD-1 (mock JWT) không bị xóa hoặc bypass | — | ✅ / ❌ |
| 3.5 | 🟠 | Input validation xảy ra ở Pydantic layer (`EngineerCsvRow`) trước khi ghi DB | AC-5–11 | ✅ / ❌ |
| 3.6 | 🟡 | `MAX_CSV_SIZE_MB` đọc từ `get_settings()` — không hardcode | AC-2 | ✅ / ❌ |

---

## 4. Validation Logic

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 4.1 | 🔴 | `email` format validated (regex hoặc EmailStr) — không chỉ check non-empty | AC-5 | ✅ / ❌ |
| 4.2 | 🔴 | `availability_percentage`: 0 và 100 đều được chấp nhận (boundary inclusive) | AC-7 | ✅ / ❌ |
| 4.3 | 🔴 | `years_of_experience = 0` được chấp nhận (boundary valid) | AC-8 | ✅ / ❌ |
| 4.4 | 🟠 | `years_of_experience` non-numeric string → row error, không crash | AC-8 | ✅ / ❌ |
| 4.5 | 🟠 | `availability_percentage` non-numeric string → row error, không crash | AC-7 | ✅ / ❌ |
| 4.6 | 🟠 | `bench_start_date` sai format → row error chứa "bench_start_date" | — | ✅ / ❌ |

---

## 5. Performance & Compatibility

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 5.1 | 🔴 | BOM (`\xef\xbb\xbf`) từ Excel được strip — `decode("utf-8-sig")` | — | ✅ / ❌ |
| 5.2 | 🔴 | Quoted fields chứa dấu phẩy (`"Django,FastAPI"`) được parse đúng | — | ✅ / ❌ |
| 5.3 | 🟠 | Column names được normalize (`.strip().lower()`) trước khi lookup | AC-12 | ✅ / ❌ |
| 5.4 | 🟠 | `upsert_by_email()` hoạt động với cả SQLite (test) lẫn PostgreSQL (prod) | — | ✅ / ❌ |
| 5.5 | 🟠 | Pandas đọc với `dtype=str, keep_default_na=False` | AC-3 | ✅ / ❌ |

---

## 6. Logs & Audit

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 6.1 | 🟠 | `log_event("csv_import_started", entity_type="engineers", filename=...)` | — | ✅ / ❌ |
| 6.2 | 🟠 | `log_event("csv_import_completed", inserted=..., updated=..., skipped=..., errors=...)` | — | ✅ / ❌ |
| 6.3 | 🟠 | `log_event("csv_import_failed", filename=..., error=...)` khi fatal error | — | ✅ / ❌ |
| 6.4 | 🟡 | Log fields không chứa giá trị từ CSV content (chỉ metadata) | — | ✅ / ❌ |

---

## 7. Error Handling

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 7.1 | 🔴 | Router map đúng: `OverflowError` → 413, `ValueError("invalid_mime_type")` → 400 `InvalidCsv` | AC-1,2 | ✅ / ❌ |
| 7.2 | 🔴 | `ValueError("invalid_encoding")` → 400 `InvalidEncoding` | AC-13 | ✅ / ❌ |
| 7.3 | 🔴 | `ValueError("invalid_csv_header")` → 400 `InvalidCsvHeader` | AC-12 | ✅ / ❌ |
| 7.4 | 🔴 | Error format: `{"error": {"code": "...", "message": "..."}}` | AC-1,2,12,13 | ✅ / ❌ |
| 7.5 | 🔴 | Row error format: `"Row {N}: {field} — {reason}"` | AC-5–11 | ✅ / ❌ |
| 7.6 | 🟠 | `ValidationError` từ `EngineerCsvRow` được bắt và format — không raise ra ngoài | AC-5–11 | ✅ / ❌ |
| 7.7 | 🟠 | `skipped` count = `len(errors)` | AC-14 | ✅ / ❌ |

---

## 8. Testing

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 8.1 | 🔴 | Integration tests dùng in-memory SQLite (`conftest.py` fixture) — không mock repository | — | ✅ / ❌ |
| 8.2 | 🔴 | Có test cho INSERT path và UPDATE path của `upsert_by_email()` | AC-3,4 | ✅ / ❌ |
| 8.3 | 🔴 | Có test cho `InvalidEncoding` (non-UTF-8 bytes) | AC-13 | ✅ / ❌ |
| 8.4 | 🔴 | Có test cho `InvalidCsvHeader` (thiếu required column) | AC-12 | ✅ / ❌ |
| 8.5 | 🔴 | Có test cho duplicate email trong file | AC-15 | ✅ / ❌ |
| 8.6 | 🟠 | Có test verify optional fields → null/default trong DB | AC-17 | ✅ / ❌ |
| 8.7 | 🟠 | Có test email trùng DB → UPDATE | AC-16 | ✅ / ❌ |
| 8.8 | 🟠 | Có test quoted field với dấu phẩy (`"Django,FastAPI"`) | — | ✅ / ❌ |
| 8.9 | 🟠 | 20 tests cũ (Projects + MIME/size) vẫn pass — không regression | — | ✅ / ❌ |
| 8.10 | 🟡 | Test names theo convention `test_<scenario>_<condition>_<result>` | — | ✅ / ❌ |
| 8.11 | 🟡 | Test cho file đúng 10MB không bị reject (boundary B-1) | B-1 | ✅ / ❌ |

---

## 9. Operations

| # | Severity | Check | AC# | Kết quả |
|---|---------|-------|-----|---------|
| 9.1 | 🟠 | Không có DB migration mới — model `engineers` không thay đổi schema | — | ✅ / ❌ |
| 9.2 | 🟠 | Rollback = revert git commit; không cần thao tác DB | — | ✅ / ❌ |
| 9.3 | 🟡 | Race condition (2 requests cùng upload cùng email) được ghi nhận trong report.md | — | ✅ / N/A |

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
| AC-3 | 1.3, 2.3, 2.5, 5.5, 8.2 |
| AC-4 | 1.4, 2.4, 2.5, 8.2 |
| AC-5 | 1.5, 4.1, 7.5, 8.1 |
| AC-6 | 1.6, 3.5, 7.5 |
| AC-7 | 1.7, 4.2, 4.5, 7.5 |
| AC-8 | 1.8, 4.3, 4.4, 7.5 |
| AC-9 | 1.9, 3.5, 7.5 |
| AC-10 | 1.10, 4.1, 7.5 |
| AC-11 | 1.11, 3.5, 7.5 |
| AC-12 | 1.12, 5.3, 7.3, 7.4, 8.4 |
| AC-13 | 1.13, 5.1, 7.2, 7.4, 8.3 |
| AC-14 | 1.14, 2.8, 7.7 |
| AC-15 | 1.15, 2.7, 7.5, 8.5 |
| AC-16 | 1.16, 2.4, 8.7 |
| AC-17 | 1.17, 8.6 |
| AC-18 | 1.18 |

---

## 12. Kết luận

**Blocker (🔴) tổng:** *(fill in — phải = 0 trước merge)*

**Major (🟠) tổng ❌:** *(fill in)*

**Minor (🟡) tổng ❌:** *(fill in)*

**Quyết định:**
- [ ] ✅ **APPROVE** — tất cả Blocker = ✅, Major ≤ 2 với accepted risk rõ ràng
- [ ] 🔄 **REQUEST CHANGES** — còn *(N)* Blocker hoặc Major chưa resolve
- [ ] 💬 **COMMENT** — chỉ có Minor, không block merge
