# Review Checklist — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** v2.0 (Phase 4)
**Ngày tạo:** 2026-03-25
**Ngày cập nhật:** 2026-03-30
**Dùng cho:** Pre-implementation review và cuối mỗi milestone

---

## Hướng dẫn sử dụng

- Đánh dấu: `[x]` = Pass, `[ ]` = Fail/Chưa kiểm tra, `[N/A]` = Không áp dụng
- Mỗi `[ ]` còn lại **phải** có ghi chú lý do hoặc issue tracking
- Dùng checklist này **trước khi bắt đầu implement** (pre-impl) và **cuối mỗi milestone**

### Mức độ nghiêm trọng (Severity)

| Ký hiệu | Ý nghĩa |
|---------|---------|
| **Blocker** | Phải pass trước khi proceed sang milestone/phase tiếp theo |
| **Major** | Ảnh hưởng đến correctness/functionality — phải fix trước khi merge |
| **Minor** | Cải thiện chất lượng — có thể fix sau nếu có ghi chú |

---

## A. Spec & Tài liệu

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| A-1 | `spec-pack.md` đã được approve, không còn BLOCKING open issues | Blocker | Tất cả | | OI-01, OI-14 DECIDED; OI-02, OI-15, OI-16 NON-BLOCKING |
| A-2 | `sources.md` liệt kê đủ 13 tài liệu nguồn với precedence hierarchy | Major | — | | |
| A-3 | `impl-plan.md` v2.0 có đủ 10 milestones, phản ánh OI-01/OI-14/OI-15/OI-16 | Blocker | AC-1→AC-20 | | |
| A-4 | `test-plan.md` có đủ test strategy (UT/IT/E2E/BB) | Major | AC-20 | | |
| A-5 | `test-data.md` có seed spec: ≥5 engineers, ≥3 projects, ≥3 allocations | Major | AC-13 | | |
| A-6 | `blackbox-testcases.md` có đủ 26 TC (6 examples + 20 AC-based) | Major | AC-20 | | |
| A-7 | Pre-implementation checklist trong `impl-plan.md` đã check đủ (trừ env setup) | Blocker | — | | |

---

## B. Architecture Compliance

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| B-1 | Tech stack đúng: Next.js + FastAPI + PostgreSQL + Redis (không thay thế) | Blocker | AC-2, AC-3 | | |
| B-2 | Monorepo structure: `apps/web/`, `apps/api/`, `packages/shared/` tồn tại | Blocker | AC-2, AC-3 | | |
| B-3 | Backend directory đúng: `routers/`, `core/`, `db/`, `models/`, `schemas/`, `services/`, `repositories/`, `workers/` | Major | AC-2 | | |
| B-4 | Frontend directory đúng: `app/`, `components/`, `features/`, `hooks/`, `lib/`, `types/` | Major | AC-3 | | |
| B-5 | 4 Docker services tồn tại: web:3000, api:8000, postgres:5432, redis:6379 | Blocker | AC-1 | | |
| B-6 | Health checks cho postgres và redis trong docker-compose | Major | AC-1 | | |
| B-7 | `.env.example` có đủ 18 biến môi trường theo `system-overview.md` | Major | AC-1 | | |
| B-8 | `packages/shared/src/` có directory structure (contracts, types, constants) | Minor | — | | Placeholder là đủ cho Phase 5 |

---

## C. API Coverage

| # | Endpoint | Method | Status codes cần cover | Severity | AC liên quan | Kết quả |
|---|----------|--------|----------------------|----------|-------------|---------|
| C-1 | `/api/v1/auth/login` | POST | 200, 422 | Blocker | AC-5 | |
| C-2 | `/api/v1/engineers/upload` | POST | 200, 413, 422 | Blocker | AC-6 | |
| C-3 | `/api/v1/engineers` | GET | 200 | Major | AC-7 | |
| C-4 | `/api/v1/engineers/{id}` | GET | 200, 404 | Major | AC-8 | |
| C-5 | `/api/v1/engineers/{id}/bench-forecast` | GET | 200, 404 | Major | AC-14 | |
| C-6 | `/api/v1/projects/upload` | POST | 200, 413, 422 | Blocker | AC-9 | |
| C-7 | `/api/v1/projects` | GET | 200 | Major | — | |
| C-8 | `/api/v1/projects/{id}` | GET | 200, 404 | Major | — | |
| C-9 | `/api/v1/allocations/recommend` | POST | 200, 422 | Major | AC-11 | |
| C-10 | `/api/v1/allocations/recommendations/{project_id}` | GET | 200, 404 | Major | AC-11 | |
| C-11 | `/api/v1/allocations/confirm` | POST | 201, 400, 422 | Blocker | AC-11, AC-12 | |
| C-12 | `/api/v1/allocations/active` | GET | 200 | Major | AC-12 | |
| C-13 | `/api/v1/bench/forecast` | GET | 200 | Major | AC-13 | |
| C-14 | `/api/v1/bench/alerts` | GET | 200 | Blocker | AC-13 | |
| C-15 | `/api/v1/reports/shortage` | GET | 200 | Major | AC-15 | |
| C-16 | `/api/v1/dashboard/stats` | GET | 200 | Major | — | OI-15: mock data |
| C-17 | `/api/v1/health` | GET | 200 | Blocker | AC-1 | |

---

## D. Frontend Route Coverage

| # | Route | Render thành công | Auth guard | Severity | AC liên quan | Kết quả |
|---|-------|------------------|-----------|----------|-------------|---------|
| D-1 | `/login` | | N/A (public) | Blocker | AC-4, AC-5 | |
| D-2 | `/dashboard` | | ✓ | Major | AC-4 | |
| D-3 | `/engineers` | | ✓ | Major | AC-4, AC-7 | |
| D-4 | `/engineers/[id]` | | ✓ | Major | AC-4, AC-8 | |
| D-5 | `/upload` | | ✓ | Major | AC-4, AC-6, AC-9 | |
| D-6 | `/projects` | | ✓ | Major | AC-4 | |
| D-7 | `/projects/[id]` | | ✓ | Major | AC-4 | |
| D-8 | `/allocation` | | ✓ | Major | AC-4, AC-11 | |
| D-9 | `/bench-forecast` | | ✓ | Major | AC-4, AC-13 | |
| D-10 | `/reports` | | ✓ | Major | AC-4, AC-15 | |

---

## E. Database

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| E-1 | 6 tables tạo đúng: engineers, projects, allocations, match_scores, bench_forecasts, users | Blocker | AC-10 | | |
| E-2 | Foreign keys đúng: allocations→engineers, allocations→projects, match_scores→(engineer,project), bench_forecasts→engineer | Blocker | AC-10 | | |
| E-3 | Indexes đúng theo `domain-model.md` (≥8 indexes) | Major | AC-10 | | |
| E-4 | `alembic upgrade head` chạy thành công từ trạng thái fresh DB | Blocker | AC-10 | | |
| E-5 | Seed data: ≥5 engineers, ≥3 projects, ≥3 allocations | Major | AC-13 | | |
| E-6 | Seed có ≥1 engineer với `bench_start_date` trong 30 ngày tính từ ngày chạy | Blocker | AC-13 | | Cần để test bench alerts |
| E-7 | Allocation constraint: tổng percentage cho 1 engineer ≤ 100% được enforce | Major | AC-11 | | |

---

## F. Security Gate (Mock JWT)

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| F-1 | Mock JWT stub có comment `# TODO: Replace with real JWT auth before production` trên tất cả auth code | Blocker | AC-5 | | Bắt buộc theo `01-implementation-conventions.md` |
| F-2 | `POST /auth/login` trả về static mock token cho mọi credentials hợp lệ | Blocker | AC-5 | | |
| F-3 | Token validation chỉ check format — không verify signature thật | Major | AC-5 | | Đúng ý định của mock |
| F-4 | Client-side route guard là client-only (không có server-side auth) | Major | AC-5 | | |
| F-5 | Không có secrets hardcoded trong source code | Blocker | — | | |
| F-6 | `.env` files không được commit (`.gitignore` có pattern `.env*`) | Blocker | — | | |
| F-7 | CSV validation (MIME type + size limit 10MB) là logic thật — không phải stub | Blocker | AC-6, AC-9 | | Xem `01-implementation-conventions.md` §Stub Rules |
| F-8 | Không có PII trong log messages | Major | AC-19 | | |
| F-9 | Mock JWT upgrade plan có trong `impl-plan.md` OC-2 với timeline | Major | — | | Security debt SD-1 |

---

## G. Code Quality

| # | Command | Target | Severity | AC liên quan | Kết quả | Ghi chú |
|---|---------|--------|----------|-------------|---------|---------|
| G-1 | `tsc --noEmit` | 0 errors | Blocker | AC-16 | | |
| G-2 | `eslint .` | 0 errors | Major | AC-16 | | |
| G-3 | `prettier --check .` | 0 differences | Minor | AC-16 | | |
| G-4 | `ruff check .` | 0 errors | Blocker | AC-17 | | |
| G-5 | `black --check .` | 0 differences | Minor | AC-17 | | |
| G-6 | `pytest` | All pass | Blocker | AC-20 | | |
| G-7 | Python type hints đầy đủ trên tất cả service + router functions | Major | AC-17 | | |
| G-8 | `tsconfig.json` có `"strict": true` | Major | AC-16 | | Phải set từ M-07 |

---

## H. CI Pipeline

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| H-1 | `.github/workflows/ci.yml` tồn tại và valid YAML | Blocker | AC-18 | | |
| H-2 | CI job: lint frontend (`eslint .`, `prettier --check`) | Major | AC-18 | | |
| H-3 | CI job: lint backend (`ruff check .`, `black --check`) | Major | AC-18 | | |
| H-4 | CI job: typecheck (`tsc --noEmit`) | Major | AC-18 | | |
| H-5 | CI job: build frontend (`next build`) | Major | AC-18 | | |
| H-6 | CI job: test backend (`pytest`) | Major | AC-18 | | |
| H-7 | CI chạy thành công trên push to develop và main | Major | AC-18 | | |

---

## I. Open Issues & Risks

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| I-1 | OI-15 (Dashboard KPI): `GET /api/v1/dashboard/stats` được implement với mock data | Minor | — | | OC-3 trong impl-plan |
| I-2 | OI-02 (Object Storage): CSV in-memory — không lưu file ra disk | Minor | AC-6, AC-9 | | |
| I-3 | OI-16 (Pagination): Không implement pagination trong Phase 5 | Minor | AC-7 | | Out of scope |
| I-4 | Mock JWT upgrade plan có trong `impl-plan.md` OC-2 | Major | — | | Cần trước khi production |
| I-5 | `packages/shared/` có directory structure (placeholder) | Minor | — | | OC-1 |
| I-6 | Không có real LLM calls — tất cả dùng stub | Minor | — | | Đúng scope Phase 5 |

---

## J. Performance

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| J-1 | API response time < 500ms cho các endpoint không có LLM (health, list engineers, list projects) | Major | — | | Measure với `pytest-benchmark` hoặc manual |
| J-2 | CSV upload: file 10MB được xử lý trong vòng 5 giây | Major | AC-6, AC-9 | | |
| J-3 | Redis cache được sử dụng cho LLM results (TTL 24h) | Major | — | | Key format: `llm:{engineer_id}:{project_id}` |
| J-4 | Redis cache được sử dụng cho bench forecast (TTL 1h) | Major | AC-13, AC-14 | | |
| J-5 | Redis cache được sử dụng cho engineer list (TTL 5m) | Minor | AC-7 | | |
| J-6 | Redis cache được sử dụng cho project requirements (TTL 30m) | Minor | — | | |
| J-7 | Cache miss không gây lỗi — fallback về DB query | Major | — | | |
| J-8 | File upload reject > 10MB trước khi đọc toàn bộ content (streaming check) | Major | AC-6, AC-9 | | |

---

## K. Compatibility

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| K-1 | Docker Engine ≥ 24.0 compatible | Major | AC-1 | | Kiểm tra `docker --version` |
| K-2 | Docker Compose v2 syntax (không dùng v1 `docker-compose`) | Major | AC-1 | | |
| K-3 | Node.js 18 LTS (không dùng 16 hoặc 20) | Blocker | AC-3, AC-16 | | |
| K-4 | Python 3.11 (không dùng 3.9 hoặc 3.12+) | Blocker | AC-2, AC-17 | | |
| K-5 | Frontend accessible trên Chrome, Firefox, Edge (latest stable) | Minor | AC-4 | | Manual test |
| K-6 | API prefix `/api/v1/` nhất quán trên tất cả 17 endpoints | Major | — | | No versioning break |
| K-7 | CORS configured cho `http://localhost:3000` | Major | — | | |

---

## L. Logs & Audit

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| L-1 | Logging output là structured JSON (không phải plain text) | Blocker | AC-19 | | `{"timestamp","level","event","..."}` |
| L-2 | Event `csv_upload_started` được log khi nhận request upload | Major | AC-19 | | |
| L-3 | Event `csv_upload_completed` được log khi parse thành công | Major | AC-19 | | |
| L-4 | Event `allocation_recommended` được log khi tạo recommendation | Major | AC-19 | | |
| L-5 | Event `allocation_confirmed` được log khi confirm allocation | Major | AC-19 | | |
| L-6 | Event `bench_forecast_generated` được log | Major | AC-19 | | |
| L-7 | Event `auth_login_attempt` được log (thành công và thất bại) | Major | AC-19 | | |
| L-8 | Event `llm_scoring_invoked` được log | Major | AC-19 | | |
| L-9 | Event `cache_hit` / `cache_miss` được log ở debug level | Minor | AC-19 | | |
| L-10 | Không có PII trong log: không log email, tên thật, thông tin cá nhân | Blocker | AC-19 | | |
| L-11 | Log level configurable qua env var `LOG_LEVEL` | Minor | — | | |
| L-12 | Request middleware log method + path + status code + duration | Major | AC-19 | | |

---

## M. Error Handling

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| M-1 | Error response format nhất quán: `{"error":{"code":"...","message":"..."}}` | Blocker | — | | Xem `coding-conventions.md` |
| M-2 | 404 được trả về khi engineer/{id} không tồn tại | Blocker | AC-8 | | |
| M-3 | 404 được trả về khi project/{id} không tồn tại | Major | — | | |
| M-4 | 413 được trả về khi CSV > 10MB | Blocker | AC-6, AC-9 | | |
| M-5 | 400 được trả về khi confirm allocation vi phạm 100% cap | Blocker | AC-11 | | |
| M-6 | 422 được trả về khi request body không hợp lệ (Pydantic validation error) | Major | — | | |
| M-7 | 500 không expose stack trace trong production response | Major | — | | Chỉ log stack trace, không trả về client |
| M-8 | CSV parse error (wrong columns, bad encoding) trả về 400 với error message rõ ràng | Major | AC-6, AC-9 | | |
| M-9 | Database connection error được handle gracefully (không crash app) | Major | — | | |
| M-10 | Redis connection error được handle gracefully (fallback to DB) | Major | — | | |
| M-11 | Error code strings là PascalCase: `EngineerNotFound`, `FileTooLarge`, `AllocationCapExceeded` | Minor | — | | |

---

## N. Testing Coverage

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| N-1 | Unit tests tồn tại cho `CSVIngestionService` (validate MIME, size, parse) | Major | AC-6, AC-9, AC-20 | | |
| N-2 | Unit tests tồn tại cho `BenchPredictionEngine` (30-day threshold logic) | Blocker | AC-13, AC-20 | | Core business logic |
| N-3 | Unit tests tồn tại cho `AllocationRecommendationOrchestrator` | Major | AC-11, AC-20 | | |
| N-4 | Integration tests cover tất cả 17 API endpoints (happy path) | Major | AC-20 | | Dùng `pytest + httpx` |
| N-5 | Integration tests cover các error paths chính (404, 400, 413) | Major | AC-20 | | |
| N-6 | E2E test: `docker compose up` → tất cả services healthy | Blocker | AC-1, AC-20 | | |
| N-7 | Blackbox TCs từ `blackbox-testcases.md`: NC-1/2, AB-1/2, BV-1/2 được execute | Major | AC-20 | | |
| N-8 | Frontend: `next build` thành công (không có build error) | Major | AC-3 | | |
| N-9 | Test fixtures sử dụng seed data từ `test-data.md` | Minor | — | | Consistency |
| N-10 | `pytest --tb=short -q` output được ghi trong `test-results.md` | Minor | AC-20 | | |

---

## O. Operations

| # | Mục kiểm tra | Severity | AC liên quan | Kết quả | Ghi chú |
|---|-------------|----------|-------------|---------|---------|
| O-1 | `docker compose up` khởi động thành công lần đầu từ trạng thái fresh | Blocker | AC-1 | | |
| O-2 | `docker compose up` khởi động thành công sau khi `docker compose down` | Major | AC-1 | | |
| O-3 | Runbook chạy migrations được ghi trong `impl-plan.md` §6 | Major | AC-10 | | `alembic upgrade head` |
| O-4 | Runbook seed data được ghi (command và expected output) | Major | — | | |
| O-5 | Rollback plan tồn tại cho mỗi milestone trong `impl-plan.md` §5 | Major | — | | |
| O-6 | `.env.example` đủ để developer clone và chạy project mà không cần hướng dẫn thêm | Major | — | | |
| O-7 | `BENCH_ALERT_DAYS_THRESHOLD` configurable qua env var (không hardcode 30) | Major | AC-13 | | |
| O-8 | Redis TTL values configurable qua env var hoặc config module | Minor | — | | |
| O-9 | Port conflicts được document (3000, 8000, 5432, 6379) | Minor | AC-1 | | |

---

## Tổng kết Pre-Implementation

| Section | Blocker Pass | Blocker Fail | Major Pass | Major Fail | Minor Pass | Minor Fail | N/A |
|---------|-------------|-------------|-----------|-----------|-----------|-----------|-----|
| A. Spec & Docs | | | | | | | |
| B. Architecture | | | | | | | |
| C. API Coverage | | | | | | | |
| D. Frontend Routes | | | | | | | |
| E. Database | | | | | | | |
| F. Security | | | | | | | |
| G. Code Quality | | | | | | | |
| H. CI Pipeline | | | | | | | |
| I. Open Issues | | | | | | | |
| J. Performance | | | | | | | |
| K. Compatibility | | | | | | | |
| L. Logs & Audit | | | | | | | |
| M. Error Handling | | | | | | | |
| N. Testing | | | | | | | |
| O. Operations | | | | | | | |
| **TỔNG** | | | | | | | |

**Phán định:** [ ] Ready to implement / [ ] Cần giải quyết trước khi implement

**Người review:** _______________
**Ngày review:** _______________

---

## AC Mapping Table

Bảng ánh xạ từng Acceptance Criteria đến các mục kiểm tra cụ thể trong checklist.

| AC | Mô tả ngắn | Sections/Items kiểm tra | Severity nếu vi phạm |
|----|-----------|------------------------|---------------------|
| AC-1 | Docker Compose: 4 services + health checks | B-5, B-6, B-7, C-17, K-1, K-2, N-6, O-1, O-2 | Blocker |
| AC-2 | Backend project structure đúng theo spec | B-1, B-2, B-3 | Blocker |
| AC-3 | Frontend project structure đúng theo spec | B-1, B-2, B-4, G-8, K-3, N-8 | Major |
| AC-4 | 10 frontend routes tồn tại và render được | D-1→D-10 | Major |
| AC-5 | Auth login với mock JWT | C-1, F-1, F-2, F-3, F-4 | Blocker |
| AC-6 | Engineer CSV upload: validate + parse + reject >10MB | C-2, F-7, J-2, J-8, M-4, M-8, N-1 | Blocker |
| AC-7 | List engineers: trả về tất cả (no pagination) | C-3, I-3, J-5 | Major |
| AC-8 | Engineer detail: trả về 200 hoặc 404 | C-4, M-2 | Major |
| AC-9 | Project CSV upload: validate + parse + reject >10MB | C-6, F-7, J-2, J-8, M-4, M-8, N-1 | Blocker |
| AC-10 | Alembic migration: 6 tables + FKs + indexes | E-1, E-2, E-3, E-4, O-3 | Blocker |
| AC-11 | Recommend + confirm allocation (100% cap check) | C-9, C-10, C-11, E-7, M-5, N-3 | Blocker |
| AC-12 | Active allocations list | C-12 | Major |
| AC-13 | Bench alerts: 30-day threshold, dùng `bench_start_date` | C-14, E-6, J-4, N-2, O-7 | Blocker |
| AC-14 | Bench forecast per engineer | C-5, J-4 | Major |
| AC-15 | Skill shortage report | C-15 | Major |
| AC-16 | TypeScript: `tsc --noEmit` + `eslint` zero errors | G-1, G-2, G-3, G-8, K-3 | Blocker |
| AC-17 | Python: `ruff check` + `black` zero errors + type hints | G-4, G-5, G-7, K-4 | Blocker |
| AC-18 | CI pipeline: lint + typecheck + build + test | H-1→H-7 | Major |
| AC-19 | Structured JSON logging: 8 events + no PII | F-8, L-1→L-12 | Blocker |
| AC-20 | Test suite: UT + IT + E2E pass | G-6, N-1→N-10 | Blocker |
