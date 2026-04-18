# Phase Report — RA-012: Upload Project CSV (Real Implementation)

> Điền sau khi hoàn thành implementation. Đặt tại `docs/changes/RA-012/report.md`.

**Ticket:** RA-012
**Ngày bắt đầu:** 2026-04-18
**Ngày hoàn thành:** 2026-04-18
**Tác giả:** Claude (AI-assisted, reviewed by h_vu)

---

## 1. Tóm tắt

RA-012 thay thế stub `parse_projects_csv()` bằng implementation thật dùng Pandas: validate MIME/size/encoding/header, parse từng row qua Pydantic `ProjectCsvRow`, upsert vào DB theo tên project. Tất cả 13 AC được implement và verified qua 20 integration tests (64 tests tổng cộng pass). Frontend cũng được cập nhật đúng column reference cho Projects CSV.

---

## 2. Deliverables Đã Hoàn thành

| # | Deliverable | File | Trạng thái |
|---|------------|------|-----------|
| 1 | Spec Pack | `docs/changes/RA-012/spec-pack.md` | ✅ DONE (Phase 1) |
| 2 | Sources | `docs/changes/RA-012/sources.md` | ✅ DONE (Phase 1) |
| 3 | Key Flows Luồng 6 | `docs/architecture/key-flows.md` | ✅ DONE (Phase 2) |
| 4 | Impl Plan | `docs/changes/RA-012/impl-plan.md` | ✅ DONE (Phase 2) |
| 5 | `parse_projects_csv()` real implementation | `apps/api/app/services/csv_ingestion.py` | ✅ DONE (Phase 5) |
| 6 | `ProjectCsvRow` Pydantic schema | `apps/api/app/schemas/project.py` | ✅ DONE (Phase 5) |
| 7 | `upsert_by_name()` repository method | `apps/api/app/repositories/project_repository.py` | ✅ DONE (Phase 5) |
| 8 | Router cập nhật (`db` inject) | `apps/api/app/api/v1/routers/projects.py` | ✅ DONE (Phase 5) |
| 9 | Column reference update | `apps/web/features/upload/CsvColumnReference.tsx`, `apps/web/app/upload/page.tsx` | ✅ DONE (Phase 5) |
| 10 | Extended tests | `apps/api/tests/test_csv_ingestion.py` | ✅ DONE (Phase 5) — 14 new tests |

---

## 3. Checkpoints

| CP | Mô tả | Kết quả | Ghi chú |
|----|-------|---------|---------|
| CP-1 | `parse_projects_csv()` + `ProjectCsvRow` | ✅ | Pandas + UTF-8-SIG + Pydantic v2 validators |
| CP-2 | `upsert_by_name()` | ✅ | SELECT + conditional INSERT/UPDATE, SQLite-compatible |
| CP-3 | Column reference update (AC-12) | ✅ | Full rewrite — old array had wrong columns |
| CP-4 | Tests mở rộng | ✅ | 14 integration tests, 20 total in file |
| CP-5 | Quality gates pass | ✅ | 64 passed; ruff/black/tsc/eslint clean |

---

## 4. Quality Gates

| Gate | Command | Kết quả |
|------|---------|---------|
| Backend lint | `ruff check apps/api` | ✅ 0 errors |
| Backend format | `black --check apps/api` | ✅ 5 files unchanged |
| Backend tests | `pytest tests/ -q` | ✅ 64 passed, 4 warnings in 1.04s |
| Frontend typecheck | `tsc --noEmit` (RA-012 files) | ✅ 0 errors (2 pre-existing errors không liên quan) |
| Frontend lint | `eslint` (RA-012 files) | ✅ 0 errors |
| Frontend build | `next build` | ⏭ SKIP — web container không khả dụng |

---

## 5. Các Quyết định Đưa ra

| OI# | Quyết định | Lý do |
|-----|-----------|-------|
| OI-3 | Optional field trống → overwrite DB thành `null` | User decision (2026-04-18) |
| OI-1 | File rỗng → HTTP 200, `inserted=0, updated=0, skipped=0, errors=[]` | User decision (2026-04-18) |
| OI-2 | `.strip()` từng field value khi parse — không normalize thêm | User decision (2026-04-18) |

---

## 6. Technical Debt & Open Issues Còn lại

| Loại | Mô tả | Ưu tiên |
|------|-------|---------|
| Security Debt | **SD-1: Mock JWT** — chưa resolve | CRITICAL |
| *(không còn OI nào open)* | — | — |

---

## 7. Những gì Không Làm được / Lý do

| Hạng mục | Lý do | Kế hoạch |
|---------|-------|---------|
| `next build` verify | Web container không chạy trong môi trường thực thi | Verify thủ công khi khởi động web container |
| Inline `projects_25.csv` trong test | Ngoài scope RA-012 | Cân nhắc trong ticket tiếp theo để CI independence |

## 8. Known Risks

| Risk | Mức độ | Quyết định |
|------|--------|-----------|
| Race condition: 2 requests upload cùng project name đồng thời có thể tạo 2 rows | Low — không có concurrent upload trong use case hiện tại | Accepted, ghi nhận |
| Pre-existing TypeScript errors (`engineers/[id]`, `projects/[id]`) | N/A — không phải RA-012 | Không fix trong scope này |
| Test path `projects_25.csv` phụ thuộc vào file ngoài container | Low | Phải copy thủ công khi chạy CI |

---

## 9. Bàn giao cho Phase Tiếp theo

- **Giả định:** `parse_engineers_csv()` chưa được implement thật (vẫn là stub) — nằm ngoài scope RA-012
- **Caution:** `upsert_by_name()` dùng SELECT + conditional INSERT/UPDATE — không phải atomic upsert; race condition có thể xảy ra ở high concurrency (không critical cho use case hiện tại)
- **Open Issues cần resolve:** OI-1, OI-2 (nếu chưa resolve)
- **Files quan trọng:** `apps/api/app/services/csv_ingestion.py` — đây là file có thay đổi lớn nhất; đọc kỹ nếu engineer upload cần implement sau
