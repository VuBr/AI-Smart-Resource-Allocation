# Review Checklist — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** Draft 1.0 (Phase 2)
**Ngày tạo:** 2026-03-25
**Dùng cho:** Pre-implementation review và cuối mỗi milestone

---

## Hướng dẫn sử dụng

- Dùng checklist này **trước khi bắt đầu implement** (pre-impl) và **cuối mỗi milestone**
- Đánh dấu: `[x]` = Pass, `[ ]` = Fail/Chưa kiểm tra, `[N/A]` = Không áp dụng
- Mỗi `[ ]` còn lại phải có ghi chú lý do hoặc issue tracking

---

## A. Spec & Tài liệu

| # | Mục kiểm tra | Kết quả | Ghi chú |
|---|-------------|---------|---------|
| A-1 | `spec-pack.md` đã được approve (không còn BLOCKING open issues chưa giải quyết) | | OI-01, OI-14 đã DECIDED |
| A-2 | `sources.md` liệt kê đủ 13 tài liệu nguồn với precedence hierarchy | | |
| A-3 | `impl-plan.md` có đủ 10 milestones và phản ánh OI-01/OI-14 decisions | | |
| A-4 | `test-plan.md` có đủ test strategy (UT/IT/E2E/BB) | | |
| A-5 | `test-data.md` có seed spec đủ 5 engineers + 3 projects + 3 allocations | | |

---

## B. Architecture Compliance

| # | Mục kiểm tra | Kết quả | Ghi chú |
|---|-------------|---------|---------|
| B-1 | Tech stack đúng: Next.js + FastAPI + PostgreSQL + Redis (không thay thế) | | |
| B-2 | Monorepo structure: `apps/web/`, `apps/api/`, `packages/shared/` tồn tại | | |
| B-3 | Backend directory đúng: `api/v1/routers/`, `core/`, `db/`, `models/`, `schemas/`, `services/`, `repositories/`, `workers/` | | |
| B-4 | Frontend directory đúng: `app/`, `components/`, `features/`, `hooks/`, `lib/`, `types/` | | |
| B-5 | 4 Docker services tồn tại: web:3000, api:8000, postgres:5432, redis:6379 | | |
| B-6 | Health checks cho postgres và redis trong docker-compose | | |
| B-7 | `.env.example` có đủ tất cả 15 biến môi trường | | |

---

## C. API Coverage (AC-SB-9)

| # | Endpoint | Method | Expected Status | Kết quả |
|---|----------|--------|----------------|---------|
| C-1 | `/api/v1/auth/login` | POST | 200, 422 | |
| C-2 | `/api/v1/engineers/upload` | POST | 200, 413 | |
| C-3 | `/api/v1/engineers` | GET | 200 | |
| C-4 | `/api/v1/engineers/{id}` | GET | 200, 404 | |
| C-5 | `/api/v1/engineers/{id}/bench-forecast` | GET | 200, 404 | |
| C-6 | `/api/v1/projects/upload` | POST | 200, 413 | |
| C-7 | `/api/v1/projects` | GET | 200 | |
| C-8 | `/api/v1/projects/{id}` | GET | 200, 404 | |
| C-9 | `/api/v1/allocations/recommend` | POST | 200 | |
| C-10 | `/api/v1/allocations/recommendations/{project_id}` | GET | 200 | |
| C-11 | `/api/v1/allocations/confirm` | POST | 201, 400 | |
| C-12 | `/api/v1/allocations/active` | GET | 200 | |
| C-13 | `/api/v1/bench/forecast` | GET | 200 | |
| C-14 | `/api/v1/bench/alerts` | GET | 200 | |
| C-15 | `/api/v1/reports/shortage` | GET | 200 | |
| C-16 | `/api/v1/dashboard/stats` | GET | 200 | |
| C-17 | `/api/v1/health` | GET | 200 | |

---

## D. Frontend Route Coverage (AC-SB-4)

| # | Route | Render thành công | Auth guard | Ghi chú |
|---|-------|------------------|-----------|---------|
| D-1 | `/login` | | N/A (public) | |
| D-2 | `/dashboard` | | ✓ | |
| D-3 | `/engineers` | | ✓ | |
| D-4 | `/engineers/[id]` | | ✓ | |
| D-5 | `/upload` | | ✓ | |
| D-6 | `/projects` | | ✓ | |
| D-7 | `/projects/[id]` | | ✓ | |
| D-8 | `/allocation` | | ✓ | |
| D-9 | `/bench-forecast` | | ✓ | |
| D-10 | `/reports` | | ✓ | |

---

## E. Database (AC-SB-10, AC-SB-11)

| # | Mục kiểm tra | Kết quả | Ghi chú |
|---|-------------|---------|---------|
| E-1 | 6 tables tạo đúng: engineers, projects, allocations, match_scores, bench_forecasts, users | | |
| E-2 | Foreign keys đúng: allocations.engineer_id→engineers, allocations.project_id→projects, v.v. | | |
| E-3 | Indexes đúng theo domain-model.md | | |
| E-4 | Alembic migration chạy thành công (`alembic upgrade head`) | | |
| E-5 | Seed data: ≥5 engineers, ≥3 projects, ≥3 allocations | | |
| E-6 | Seed data có ít nhất 1 engineer với `bench_start_date` trong 30 ngày (test AC-13/bench alerts) | | |

---

## F. Security Gate (Mock JWT)

| # | Mục kiểm tra | Kết quả | Ghi chú |
|---|-------------|---------|---------|
| F-1 | Mock JWT stub có comment `# TODO: Replace with real JWT auth before production` | | |
| F-2 | Không có real auth logic bị implement nhầm | | |
| F-3 | Không có secrets hardcoded trong source code | | |
| F-4 | `.env` files không được commit (`.gitignore` có `.env*`) | | |
| F-5 | CSV validation (MIME type + size limit) là thật sự (không phải stub) | | |
| F-6 | Không có PII trong log messages | | |

---

## G. Code Quality (AC-SB-16, AC-SB-17)

| # | Command | Kết quả | Ghi chú |
|---|---------|---------|---------|
| G-1 | `tsc --noEmit` | | 0 errors |
| G-2 | `eslint .` | | 0 errors |
| G-3 | `prettier --check .` | | 0 differences |
| G-4 | `ruff check .` | | 0 errors |
| G-5 | `black --check .` | | 0 differences |
| G-6 | `pytest` | | All pass |
| G-7 | Python type hints đầy đủ trên tất cả service + router functions | | |

---

## H. CI Pipeline (AC-SB-18)

| # | Mục kiểm tra | Kết quả | Ghi chú |
|---|-------------|---------|---------|
| H-1 | `.github/workflows/ci.yml` tồn tại | | |
| H-2 | CI runs: lint (frontend + backend) | | |
| H-3 | CI runs: typecheck (tsc) | | |
| H-4 | CI runs: build (next build) | | |
| H-5 | CI runs: tests (pytest) | | |

---

## I. Open Issues & Risks

| # | Mục kiểm tra | Kết quả | Ghi chú |
|---|-------------|---------|---------|
| I-1 | OI-15 (Dashboard KPI): `GET /api/v1/dashboard/stats` được implement | | Architecture authority |
| I-2 | OI-02 (Object Storage): In-memory streaming OK cho scaffold | | Chỉ stub, không lưu file |
| I-3 | OI-16 (Pagination): Không implement pagination trong Phase 5 | | Out of scope |
| I-4 | Mock JWT upgrade plan được ghi trong `impl-plan.md` OC-2 | | |
| I-5 | `packages/shared/` có directory structure dù không có task tường minh | | |

---

## Tổng kết Pre-Implementation

| Section | Pass | Fail | N/A |
|---------|------|------|-----|
| A. Spec & Docs | | | |
| B. Architecture | | | |
| C. API Coverage | | | |
| D. Frontend Routes | | | |
| E. Database | | | |
| F. Security | | | |
| G. Code Quality | | | |
| H. CI Pipeline | | | |
| I. Open Issues | | | |

**Phán định:** [ ] Ready to implement / [ ] Cần giải quyết thêm

**Người review:** _______________
**Ngày review:** _______________
