# Phase Report — RA-002: UI Refactor Login Page

**Trạng thái:** IN PROGRESS (Phase 2 hoàn thành — chờ implementation Phase 3+)
**Ngày tạo:** 2026-04-09
**Tác giả:** Claude Code (AI assistant)
**Branch:** `apply_ui_from_html`

---

## Phase 0-B — Common Base (Hoàn thành 2026-04-09)

**Tóm tắt:** Xây dựng nền tảng tài liệu chung cho toàn repo.

| Deliverable | File | Trạng thái |
|------------|------|-----------|
| Architecture overview bổ sung | `docs/architecture/system-overview.md` | ✅ DONE |
| Key flows | `docs/architecture/key-flows.md` | ✅ DONE |
| Coding conventions bổ sung | `docs/standards/coding-conventions.md` | ✅ DONE |
| Testing standards | `docs/standards/testing.md` | ✅ DONE |
| Security standards | `docs/standards/security.md` | ✅ DONE |
| 6 templates | `docs/standards/templates/` | ✅ DONE |
| Rules 10-style | `.claude/rules/10-style.md` | ✅ DONE |
| Rules 20-architecture | `.claude/rules/20-architecture.md` | ✅ DONE |
| Rules 30-security | `.claude/rules/30-security.md` | ✅ DONE |
| Rules 40-testing | `.claude/rules/40-testing.md` | ✅ DONE |

---

## Phase 1 — Spec Pack (Hoàn thành 2026-04-09)

**Tóm tắt:** Tạo đặc tả đầy đủ cho login page refactor.

| Deliverable | File | Trạng thái |
|------------|------|-----------|
| Sources of truth | `docs/changes/RA-002/sources.md` | ✅ DONE |
| Spec pack (13 AC, 6 examples, 4 OI DECIDED) | `docs/changes/RA-002/spec-pack.md` | ✅ DONE |

**Conflicts resolved:**
- C-1: TailwindCSS (không dùng CSS modules)
- C-2: ESLint only (không dùng Prettier)
- C-3: Alpine.js → React hooks

**OI resolved:**
- OI-01: "Forgot password?" → UI-only
- OI-02: "Keep me signed in" → UI-only
- OI-03: `style` prop cho gradient → acceptable
- OI-04: Scope → chỉ login page

---

## Phase 2 — Ticket Context & Working Files (Hoàn thành 2026-04-09)

**Tóm tắt:** Phân tích context kỹ thuật, chuẩn bị đầy đủ working files.

| Deliverable | File | Trạng thái |
|------------|------|-----------|
| Cập nhật common base | `docs/standards/coding-conventions.md` | ✅ DONE |
| Implementation plan | `docs/changes/RA-002/impl-plan.md` | ✅ DONE |
| Review checklist | `docs/changes/RA-002/review-checklist.md` | ✅ DONE |
| Self-review | `docs/changes/RA-002/self-review.md` | ✅ DONE |
| Test plan | `docs/changes/RA-002/test-plan.md` | ✅ DONE |
| Test results | `docs/changes/RA-002/test-results.md` | ✅ DONE |
| Blackbox test cases (11 cases) | `docs/changes/RA-002/blackbox-testcases.md` | ✅ DONE |
| Test data | `docs/changes/RA-002/test-data.md` | ✅ DONE |
| Report | `docs/changes/RA-002/report.md` | ✅ DONE |

**Phát hiện quan trọng từ Phase 2:**
- `Button` và `Input` components từ `@base-ui/react` có style defaults conflict với login template → quyết định dùng native HTML elements
- Pattern này được bổ sung vào `coding-conventions.md §6` làm common base

---

## Phase 3 — Implementation (Chưa bắt đầu)

| Deliverable | File | Trạng thái |
|------------|------|-----------|
| BrandPanel component | `apps/web/components/auth/BrandPanel.tsx` | ⬜ TODO |
| ErrorAlert component | `apps/web/components/auth/ErrorAlert.tsx` | ⬜ TODO |
| LoginForm component | `apps/web/components/auth/LoginForm.tsx` | ⬜ TODO |
| Login page refactor | `apps/web/app/login/page.tsx` | ⬜ TODO |

---

## Phase 4–8 — Testing & Review (Chưa bắt đầu)

| Phase | Mô tả | Trạng thái |
|-------|-------|-----------|
| Phase 4 | Unit tests (nếu cần) | ⬜ TODO |
| Phase 5 | E2E test (11 BB cases) | ⬜ TODO |
| Phase 6 | Self-review (điền `self-review.md`) | ⬜ TODO |
| Phase 7 | Code review (điền `review-checklist.md`) | ⬜ TODO |
| Phase 8 | Test results (điền `test-results.md`) + PR | ⬜ TODO |

---

## Technical Debt & Open Issues

| Loại | Mô tả | Ưu tiên |
|------|-------|---------|
| **SD-1** | Mock JWT chưa resolve — không deploy ngoài localhost | CRITICAL |
| LLM scoring | `allocation_orchestrator` trả mock data — Phase 6+ | MEDIUM |

---

## Bàn giao sang Phase 3

- **Đọc trước:** `impl-plan.md §B` (files to read), `spec-pack.md §4` (Alpine→React mapping, Style→Tailwind mapping)
- **Convention quan trọng:** Dùng native `<button>/<input>/<label>` — KHÔNG dùng UI components
- **Thứ tự implement:** CP-1 ErrorAlert → CP-2 BrandPanel → CP-3 LoginForm → CP-4 LoginPage
- **Pitfall:** Error state trong HTML (border đỏ password field) là demo UI — không implement
- **Pitfall:** Kiểm tra tên icon `lucide-react` (Eye/EyeOff) trước khi import

---

## Update 2026-04-22 - Dashboard Stats API dung du lieu that

**Yeu cau:** Bo mock data cho `GET /api/v1/dashboard/stats` va tinh KPI tu du lieu that trong DB theo bo tai lieu `docs/changes/RA-001`.

### Pham vi da xu ly

| Hang muc | File | Ket qua |
|---------|------|---------|
| Tao repository KPI dashboard | `apps/api/app/repositories/dashboard_repository.py` | DONE |
| Chuyen router dashboard sang query DB that | `apps/api/app/api/v1/routers/dashboard.py` | DONE |
| Bo sung IT test cho KPI thuc te | `apps/api/tests/test_bench.py` | DONE |

### Logic KPI da ap dung

- `total_engineers`: dem tong so engineer trong bang `engineers`.
- `engineers_on_bench`: `total_engineers - so engineer co allocation active` (dua tren `allocations.status = "active"`).
- `active_projects`: dem so project co `status = "active"`.
- `allocation_rate_percentage`: `round(tong allocation % active / total_engineers)`, clamp trong [0, 100], tranh chia 0.

### Trang thai verification

- Da cap nhat test moi: `test_dashboard_stats_returns_real_aggregates`.
- Chua the run test tren moi truong hien tai vi terminal khong co lenh Python/Pytest kha dung (`pytest`, `python`, `py` deu khong chay duoc).
