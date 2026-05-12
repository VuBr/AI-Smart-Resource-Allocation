# 01-implementation-conventions.md — Quy tắc Implementation Chung

**Established:** Phase 2 — RA-001 (2026-03-25)
**Cập nhật:** Phase 9 — RA-001 (2026-04-03) — xóa scaffold-specific rules đã obsolete sau Phase 5 complete
**Authority:** `.claude/CLAUDE.md`

---

## CẤM TUYỆT ĐỐI (áp dụng mọi phase)

| Hành động bị cấm | Lý do |
|-----------------|-------|
| Thay đổi tech stack (Next.js, FastAPI, PostgreSQL, Redis) | Architecture đã được approved; thay đổi làm mất tính nhất quán toàn hệ thống |
| Đặt secrets, API keys, connection strings trong source code | Vi phạm `.claude/rules/00-safety.md` |
| Thêm endpoint/screen không có trong spec-pack.md của ticket đang làm | Nằm ngoài scope; ambiguous → Open Issue |
| Bỏ database migration (tạo table thủ công) | Alembic là bắt buộc — schema phải versioned |
| Skip quality gates (lint, typecheck, tests) khi merge | Mọi merge phải green trên tất cả gates |

---

## MOCK JWT — CẢNH BÁO BẮT BUỘC (SD-1, còn open)

**OI-01 DECIDED (2026-03-25):** Phase 5 scaffold dùng Mock JWT.

> **⚠️ Security Debt SD-1 (Critical) — chưa resolve tính đến 2026-04-03.**
> Không deploy bất kỳ môi trường nào ngoài localhost khi chưa có real JWT implementation.

Quy tắc giữ cho đến khi SD-1 được resolve:

1. `POST /api/v1/auth/login` hiện trả về **static mock token** cho mọi credentials hợp lệ
2. Token validation là **stub** — chỉ check format, không verify signature thật
3. Client-side route guard là **client-only** (không có server-side auth)
4. Tất cả mock auth code **phải** có comment: `# TODO: Replace with real JWT auth before production`
5. Trước khi merge mock JWT lên bất kỳ shared branch nào: phải có upgrade plan được approve

---

## BENCH ALERT THRESHOLD — CÁCH TÍNH CHÍNH THỨC

**OI-14 DECIDED (2026-03-25):**
- `BENCH_ALERT_DAYS_THRESHOLD = 30` (default, configurable qua env var)
- Trigger condition: **`bench_start_date - today <= 30 days`** (inclusive)
- Dùng trường `engineer.bench_start_date` (không phải `project.end_date`)
- Giá trị 0 và âm (đang bench rồi) cũng trigger alert

---

## SCOPE DISCIPLINE

- Implement **chỉ** những gì có trong `docs/changes/{{TICKET}}/spec-pack.md` của ticket đang làm
- Ambiguous requirements → tạo Open Issue, **không guess**
- Không thêm "nice to have", refactors, hoặc improvements ngoài approved scope
- Khi hoàn thành một phase, spec của phase đó **không còn là constraint** cho phase tiếp theo — chỉ đọc spec của phase hiện tại

---

## PLAN-BEFORE-EDIT

- Luôn present Plan và nhận explicit approval trước khi modify bất kỳ file nào
- Exception duy nhất: `.claude/plans/` (internal planning files)
- Plan phải bao gồm: files cần đọc, files tạo/update, checkpoints, risks

---

## QUALITY GATES (bắt buộc pass trước merge)

| Gate | Command | Tiêu chí |
|------|---------|---------|
| Frontend typecheck | `tsc --noEmit` | 0 errors |
| Frontend lint | `eslint .` | 0 errors |
| Backend lint | `ruff check .` | 0 errors |
| Backend format | `black --check .` | 0 differences |
| Backend tests | `pytest` | All pass |
| Frontend build | `next build` | 0 errors |

> **Ghi chú:** Prettier **không** được install trong project (not in stack). Xem `docs/standards/coding-conventions.md §8`.

---

## PYTHON VERSION

Confirmed: **Python 3.11** (xác nhận từ Phase 5 execution). Không cần backward compat cho 3.9 hoặc 3.10.

- Dùng `T | None` thay vì `Optional[T]` là acceptable (Python 3.10+ syntax)
- `Optional[T]` vẫn valid — chỉ không cần ép buộc vì compat 3.9
- SQLAlchemy: dùng `sqlalchemy.Uuid` (generic) thay vì `postgresql.UUID` để SQLite compat trong tests

---

## NODE.JS VERSION

Confirmed: **Node.js ≥ 20.9.0** (Next.js 15 requirement — upgrade từ 18 lên 20 trong Phase 5, RT-02).
Docker image: `node:20-alpine`. Không dùng node:18 hoặc thấp hơn.
