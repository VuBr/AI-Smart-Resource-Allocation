# Phase Report — RA-013: Upload Engineers CSV (Real Implementation)

**Ticket:** RA-013
**Ngày bắt đầu:** *(fill in)*
**Ngày hoàn thành:** *(fill in)*
**Tác giả:** *(fill in)*

---

## 1. Tóm tắt

*(fill in — 2-3 câu mô tả những gì đã làm và kết quả chính)*

---

## 2. Deliverables Đã Hoàn thành

| # | Deliverable | File | Trạng thái |
|---|------------|------|-----------|
| 1 | Spec Pack | `docs/changes/RA-013/spec-pack.md` | ✅ DONE (Phase 1) |
| 2 | Sources | `docs/changes/RA-013/sources.md` | ✅ DONE (Phase 1) |
| 3 | Key Flows Luồng 2 update | `docs/architecture/key-flows.md` | ✅ DONE (Phase 2) |
| 4 | Impl Plan | `docs/changes/RA-013/impl-plan.md` | ✅ DONE (Phase 2) |
| 5 | `parse_engineers_csv()` real implementation | `apps/api/app/services/csv_ingestion.py` | ✅ / ❌ |
| 6 | `EngineerCsvRow` Pydantic schema | `apps/api/app/schemas/engineer.py` | ✅ / ❌ |
| 7 | `upsert_by_email()` repository method | `apps/api/app/repositories/engineer_repository.py` | ✅ / ❌ |
| 8 | Router cập nhật (`db` inject + exception branches) | `apps/api/app/api/v1/routers/engineers.py` | ✅ / ❌ |
| 9 | `engineerColumns` rewrite + banner update | `apps/web/features/upload/CsvColumnReference.tsx`, `apps/web/app/upload/page.tsx` | ✅ / ❌ |
| 10 | Extended tests (~16 tests) | `apps/api/tests/test_csv_ingestion.py` | ✅ / ❌ |

---

## 3. Checkpoints

| CP | Mô tả | Kết quả | Ghi chú |
|----|-------|---------|---------|
| CP-1 | `EngineerCsvRow` + `upsert_by_email()` | ✅ / ❌ | |
| CP-2 | `parse_engineers_csv()` real implementation | ✅ / ❌ | |
| CP-3 | Router wiring | ✅ / ❌ | |
| CP-4 | Frontend update | ✅ / ❌ | |
| CP-5 | Tests mở rộng | ✅ / ❌ | |
| CP-6 | Quality gates pass | ✅ / ❌ | |

---

## 4. Quality Gates

| Gate | Command | Kết quả |
|------|---------|---------|
| Backend lint | `ruff check .` | ✅ / ❌ |
| Backend format | `black --check .` | ✅ / ❌ |
| Backend tests | `pytest tests/ -q` | ✅ / ❌ |
| Frontend typecheck | `tsc --noEmit` | ✅ / ❌ |
| Frontend lint | `eslint .` | ✅ / ❌ |
| Frontend build | `next build` | ✅ / ❌ |

---

## 5. Các Quyết định Đưa ra

| OI# | Quyết định | Lý do |
|-----|-----------|-------|
| OI-1 | Response format = Projects: `inserted/updated/skipped/errors[]` | User decision (2026-04-18) |
| OI-2 | Duplicate email trong file → skip row sau | User decision (2026-04-18) |
| OI-3 | Email trùng DB → UPDATE (upsert by email) | User decision (2026-04-18) |

---

## 6. Technical Debt & Open Issues Còn lại

| Loại | Mô tả | Ưu tiên |
|------|-------|---------|
| Security Debt | **SD-1: Mock JWT** — chưa resolve | CRITICAL |

---

## 7. Những gì Không Làm được / Lý do

| Hạng mục | Lý do | Kế hoạch |
|---------|-------|---------|
| *(fill in nếu có)* | | |

---

## 8. Bàn giao cho Phase Tiếp theo

- **Caution:** `upsert_by_email()` không atomic — race condition có thể xảy ra ở high concurrency (acceptable cho use case hiện tại)
- **Files quan trọng:** `apps/api/app/services/csv_ingestion.py` — chứa cả `parse_engineers_csv()` và `parse_projects_csv()`
- **Frontend:** `engineerColumns` đã được sửa đúng schema — không còn `employee_id` hay `full_name`
