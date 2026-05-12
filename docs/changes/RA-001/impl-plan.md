# Kế hoạch Implementation — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phase:** 5 Scaffold (= SDD Phase 1)
**Phiên bản:** 2.0 (Phase 3 — đầy đủ)
**Ngày:** 2026-03-25
**Trạng thái:** READY FOR IMPLEMENTATION

**Quyết định đã xác nhận:**
- OI-01: Mock JWT ✓ (2026-03-25)
- OI-14: BENCH_ALERT_DAYS_THRESHOLD = 30, dùng `bench_start_date` ✓ (2026-03-25)
- OI-15: `GET /dashboard/stats` trả về mock data ✓ (2026-03-25)
- OI-02: Object storage → in-memory (không lưu file) ✓ (2026-03-25)
- OI-16: Không có pagination trong Phase 5 ✓ (2026-03-25)

---

## Mục lục

1. [Implementation Policy](#1-implementation-policy)
2. [Impact Analysis](#2-impact-analysis)
3. [Milestones Overview](#3-milestones-overview)
4. [Implementation Steps chi tiết](#4-implementation-steps-chi-tiết)
5. [Risks & Rollback](#5-risks--rollback)
6. [Verification Procedure](#6-verification-procedure)
7. [Open Concerns](#7-open-concerns)
8. [AC Mapping Table](#8-ac-mapping-table)

---

## 1. Implementation Policy

### 1.1 So sánh phương án triển khai

#### Phương án A: Monorepo từ đầu (scaffold thủ công) ← **CHỌN**

- Tạo toàn bộ structure từ đầu theo `source-base-repo-structure.md`
- Không dùng boilerplate template bên ngoài
- Kiểm soát hoàn toàn cấu trúc, không có dependency ẩn

**Ưu điểm:**
- Đúng 100% theo spec (structure, naming, dependencies)
- Không có file thừa từ template
- Dễ review từng step nhỏ

**Nhược điểm:**
- Tốn thời gian hơn boilerplate
- Cần setup thủ công nhiều config files

#### Phương án B: Dùng boilerplate/starter template

- `create-next-app`, `fastapi-template`, v.v.
- Customize lại sau khi init

**Ưu điểm:** Nhanh hơn ở bước đầu

**Nhược điểm:**
- Template thường có file thừa, naming không khớp spec
- Khó kiểm soát dependency versions
- Tăng risk diverge từ `source-base-repo-structure.md`

**Lý do chọn Phương án A:** Scaffold phase là nền tảng cho tất cả phase sau. Sai lệch structure ở đây sẽ tốn chi phí fix lớn hơn. Spec đã định nghĩa rõ từng file và thư mục.

---

### 1.2 Chính sách Implementation

| Quy tắc | Nội dung |
|---------|---------|
| **Scope** | Chỉ implement những gì có trong spec-pack.md Section 2.1. Bất cứ thứ gì ngoài scope → tạo Open Issue. |
| **Step size** | 1 step = tối đa 1 file tạo mới hoặc 1 file sửa. Mỗi step phải reviewable độc lập. |
| **Build gate** | Sau mỗi milestone: project phải build thành công và app phải start được. |
| **Stub policy** | Service logic là stub. CSV validation (MIME + size) là thật. 30-day threshold logic là thật. |
| **Mock JWT** | Tất cả auth code phải có comment `# TODO: Replace with real JWT auth before production`. |
| **Rollback** | Mỗi milestone là 1 branch checkpoint. Nếu milestone fail → revert về commit đầu milestone. |
| **No secret** | Không hardcode secret nào. Tất cả qua `.env` / `pydantic-settings`. |

---

## 2. Impact Analysis

### 2.1 Phạm vi thay đổi

Repository hiện tại rỗng (0 files, 0 commits). Toàn bộ là **net-new creation** — không có code hiện có bị ảnh hưởng.

**Code hiện có cần đọc trước khi implement:**
- Không có (repo rỗng)
- Các tài liệu spec đã đọc: `spec-pack.md`, `api-contract.md`, `source-base-repo-structure.md`, `domain-model.md`, `source-base-architecture.md`

---

### 2.2 Files/Directories sẽ tạo

#### Root level (7 files)

| File | Mục đích |
|------|---------|
| `README.md` | Giới thiệu project + quick start |
| `.gitignore` | Exclude: `.env`, `__pycache__`, `.next`, `node_modules`, v.v. |
| `.env.example` | Template 15 env vars |
| `docker-compose.yml` | 4 services + health checks |
| `infra/docker/web.Dockerfile` | Next.js container |
| `infra/docker/api.Dockerfile` | FastAPI container |
| `infra/docker/init-db.sh` | DB init script |

#### Backend (apps/api/) — 38 files

| Nhóm | Files |
|------|-------|
| Entry | `main.py`, `requirements.txt`, `pyproject.toml`, `Dockerfile` |
| Core | `core/config.py`, `core/security.py`, `core/logging.py`, `core/redis.py` |
| DB | `db/database.py` |
| Models (6) | `models/engineer.py`, `project.py`, `allocation.py`, `match_score.py`, `bench_forecast.py`, `user.py`, `__init__.py` |
| Schemas (8) | `schemas/engineer.py`, `project.py`, `allocation.py`, `bench_forecast.py`, `match_score.py`, `auth.py`, `dashboard.py`, `common.py` |
| Repositories (3) | `repositories/engineer_repository.py`, `project_repository.py`, `allocation_repository.py` |
| Services (5) | `services/csv_ingestion.py`, `llm_scoring.py`, `constraint_engine.py`, `bench_prediction.py`, `allocation_orchestrator.py` |
| Routers (7) | `api/v1/routers/auth.py`, `engineers.py`, `projects.py`, `allocations.py`, `bench.py`, `reports.py`, `dashboard.py`, `__init__.py` |
| Workers | `workers/` (empty placeholder) |
| Migrations | `alembic/env.py`, `alembic/versions/<hash>_initial.py` |
| Tests (4) | `tests/test_engineers.py`, `test_projects.py`, `test_allocations.py`, `test_bench.py` |
| Seed | `scripts/seed.py` |

#### Frontend (apps/web/) — 35 files

| Nhóm | Files |
|------|-------|
| Config | `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc.json`, `.prettierrc` |
| App routes (10) | `app/login/page.tsx`, `dashboard/page.tsx`, `engineers/page.tsx`, `engineers/[id]/page.tsx`, `upload/page.tsx`, `projects/page.tsx`, `projects/[id]/page.tsx`, `allocation/page.tsx`, `bench-forecast/page.tsx`, `reports/page.tsx` |
| Layout | `app/layout.tsx` |
| Components | `components/layout/Sidebar.tsx`, `Header.tsx`, `AppShell.tsx` |
| shadcn/ui | `components/ui/` (Card, Table, Button, Dialog, Badge, Skeleton, Form) |
| Features | `features/auth/`, `dashboard/`, `engineers/`, `upload/`, `projects/`, `allocation/`, `bench/`, `reports/` |
| API client | `lib/api-client.ts` |
| Services (7) | `lib/services/auth.ts`, `engineers.ts`, `projects.ts`, `allocations.ts`, `bench.ts`, `reports.ts`, `dashboard.ts` |
| Types | `types/index.ts` |

#### Shared (packages/shared/) — 4 files

| File | Mục đích |
|------|---------|
| `src/contracts/` | API contract types (placeholder) |
| `src/constants/index.ts` | Role values, status enums |
| `src/types/index.ts` | Shared TypeScript types |
| `package.json`, `tsconfig.json` | Package config |

#### CI (.github/) — 1 file

| File | Nội dung |
|------|---------|
| `.github/workflows/ci.yml` | lint + typecheck + build + pytest |

---

### 2.3 API Surface

| Endpoint | Method | Status codes mới |
|---------|--------|-----------------|
| `/api/v1/health` | GET | 200 |
| `/api/v1/auth/login` | POST | 200, 422 |
| `/api/v1/engineers/upload` | POST | 200, 400, 413 |
| `/api/v1/engineers` | GET | 200 |
| `/api/v1/engineers/{id}` | GET | 200, 404 |
| `/api/v1/engineers/{id}/bench-forecast` | GET | 200, 404 |
| `/api/v1/projects/upload` | POST | 200, 400, 413 |
| `/api/v1/projects` | GET | 200 |
| `/api/v1/projects/{id}` | GET | 200, 404 |
| `/api/v1/allocations/recommend` | POST | 200, 404 |
| `/api/v1/allocations/recommendations/{project_id}` | GET | 200, 404 |
| `/api/v1/allocations/confirm` | POST | 201, 400 |
| `/api/v1/allocations/active` | GET | 200 |
| `/api/v1/bench/forecast` | GET | 200 |
| `/api/v1/bench/alerts` | GET | 200 |
| `/api/v1/reports/shortage` | GET | 200 |
| `/api/v1/dashboard/stats` | GET | 200 |

**Tổng: 17 endpoints** (spec-pack Section 5.2 + health)

---

### 2.4 Database

| Thay đổi | Chi tiết |
|---------|---------|
| Tables mới (6) | `engineers`, `projects`, `allocations`, `match_scores`, `bench_forecasts`, `users` |
| FK constraints (4) | `allocations.engineer_id→engineers`, `allocations.project_id→projects`, `match_scores.engineer_id→engineers`, `match_scores.project_id→projects`, `bench_forecasts.engineer_id→engineers` |
| Indexes (8) | engineers: email(unique), primary_skill; allocations: engineer_id, project_id, status; match_scores: composite(engineer_id, project_id); bench_forecasts: engineer_id, forecast_date |
| Seed data | 5 engineers, 3 projects, 3 allocations |
| Migration tool | Alembic (mới hoàn toàn) |

---

### 2.5 Configuration / Environment

| Variable | Default | Dùng cho |
|---------|---------|---------|
| `DATABASE_URL` | — | SQLAlchemy async engine |
| `REDIS_URL` | — | Redis client |
| `OPENAI_API_KEY` | — | LLM (stub, chưa dùng thật) |
| `LLM_PROVIDER` | — | LLMScoringService config |
| `LLM_MODEL` | — | LLMScoringService config |
| `LLM_MAX_TOKENS` | — | LLMScoringService config |
| `LLM_TEMPERATURE` | — | LLMScoringService config |
| `LLM_CONCURRENCY` | 10 | Max concurrent LLM calls |
| `JWT_SECRET` | — | Token signing (stub) |
| `JWT_ACCESS_EXPIRE_HOURS` | — | Token expiry config |
| `JWT_REFRESH_EXPIRE_DAYS` | — | Refresh token (future) |
| `MAX_CSV_SIZE_MB` | 10 | CSV upload size limit |
| `BENCH_ALERT_DAYS_THRESHOLD` | 30 | Bench alert trigger |
| `SHORTAGE_SCORE_THRESHOLD` | — | Reports logic (future) |
| `LLM_CACHE_TTL` | 86400 | Redis TTL 24h |
| `BENCH_CACHE_TTL` | 3600 | Redis TTL 1h |
| `ENGINEER_CACHE_TTL` | 300 | Redis TTL 5m |
| `PROJECT_CACHE_TTL` | 1800 | Redis TTL 30m |

---

### 2.6 Logging Events (mới)

| Event | Khi nào | Fields |
|-------|---------|--------|
| `request_start` | Đầu request | method, path |
| `request_end` | Cuối request | method, path, status, latency_ms |
| `allocation_generated` | Sau recommend | project_id, candidate_count |
| `allocation_confirmed` | Sau confirm | engineer_id, project_id |
| `llm_score_computed` | Sau scoring (stub) | engineer_id, project_id, provider |
| `csv_import_started` | Khi nhận file | filename, size |
| `csv_import_completed` | Sau parse | inserted, updated, skipped, errors |
| `csv_import_failed` | Lỗi import | filename, error |

**Không log PII** (email, tên người dùng).

---

### 2.7 Network Ports

| Port | Service | Ghi chú |
|------|---------|---------|
| 3000 | Next.js web | Expose ra localhost |
| 8000 | FastAPI api | Expose ra localhost |
| 5432 | PostgreSQL | Internal only (không expose production) |
| 6379 | Redis | Internal only |

---

### 2.8 Permissions (Docker)

- Docker Compose cần quyền đọc `.env` file
- Container `api` cần kết nối tới `postgres:5432` và `redis:6379`
- Container `web` cần kết nối tới `api:8000`
- CI cần quyền pull Docker images

---

## 3. Milestones Overview

| Milestone | Tasks | Mô tả | Dependency | Validation Gate |
|-----------|-------|-------|-----------|----------------|
| M-01 | S-01–S-10 | Repository & Infrastructure | — | `docker compose up` healthy |
| M-02 | S-11–S-22 | Backend Core (App + Config + Security + Logging) | M-01 | `GET /health` → 200 |
| M-03 | S-23–S-35 | Database Layer (Models + Migration + Schemas) | M-02 | `alembic upgrade head` OK |
| M-04 | S-36–S-43 | Service Layer Stubs | M-03 | Import không crash |
| M-05 | S-44–S-60 | API Endpoints + Repository Layer | M-04 | Tất cả 17 endpoints → đúng status |
| M-06 | S-61–S-63 | Redis Integration | M-02 | Startup log "Redis connected" |
| M-07 | S-64–S-73 | Frontend Setup + Layout | M-01 | `next build` pass |
| M-08 | S-74–S-93 | Frontend Pages + API Integration | M-07, M-05 | 10 routes render |
| M-09 | S-94–S-101 | Seeding + Quality + CI | M-05, M-08 | lint/tsc/pytest pass |
| M-10 | S-102–S-104 | Final Validation | M-09 | AC-1→AC-20 tất cả pass |

---

## 4. Implementation Steps chi tiết

> **Quy ước:** Mỗi step (S-xxx) = 1 đơn vị review. Tối đa 1 file tạo mới hoặc 1 nhóm config nhỏ.

---

### M-01: Repository & Infrastructure

**S-01** — Tạo `.gitignore`
```
node_modules/, .next/, __pycache__/, *.pyc, .env, .env.local,
*.pem, *.key, dist/, build/, .pytest_cache/, .mypy_cache/
```

**S-02** — Tạo `README.md`
Nội dung: project overview, prerequisites, `docker compose up`, URL list (3000/8000), seed command.

**S-03** — Tạo cấu trúc thư mục gốc
```
apps/  packages/  infra/  scripts/  .github/workflows/
```

**S-04** — Tạo `apps/web/` và `apps/api/` (empty, chỉ mkdir)

**S-05** — Tạo `packages/shared/src/{contracts,constants,types}/` + `package.json` + `tsconfig.json`

**S-06** — Tạo `infra/docker/api.Dockerfile`
FastAPI image: `python:3.11-slim`, copy `requirements.txt`, `pip install`, `uvicorn` entrypoint.

**S-07** — Tạo `infra/docker/web.Dockerfile`
Next.js image: `node:18-alpine`, multi-stage build, production `next start`.

**S-08** — Tạo `.env.example`
18 biến (xem Section 2.5), giá trị đều là placeholder (không giá trị thật).

**S-09** — Tạo `docker-compose.yml`
4 services: web, api, postgres:15, redis:7. Ports: 3000, 8000, 5432, 6379. Health checks cho postgres (`pg_isready`) và redis (`redis-cli ping`). Named volume cho postgres data.

**S-10** — Kiểm tra gate M-01
```bash
docker compose up --build
# Expected: 4 services healthy
docker compose down
```

---

### M-02: Backend Core

**S-11** — Tạo `apps/api/requirements.txt`
```
fastapi, uvicorn[standard], pydantic, pydantic-settings,
sqlalchemy[asyncio], alembic, asyncpg, psycopg2-binary,
redis, pandas, python-multipart, python-jose[cryptography],
passlib[bcrypt], httpx (dev)
```

**S-12** — Tạo `apps/api/pyproject.toml`
Black + Ruff config. Python 3.11+.

**S-13** — Tạo `apps/api/app/core/config.py`
`pydantic-settings` class `Settings` đọc tất cả 18 env vars. Singleton `get_settings()`.

**S-14** — Tạo `apps/api/app/core/logging.py`
Structured JSON logger. `log_event(event: str, **kwargs)`. No PII policy enforced.

**S-15** — Tạo `apps/api/app/core/security.py`
```python
# TODO: Replace with real JWT auth before production
def create_access_token(data: dict) -> str: ...  # stub: return static token
def decode_token(token: str) -> dict: ...         # stub: return mock payload
def get_current_user(...) -> User: ...            # stub: return mock User
```

**S-16** — Tạo `apps/api/app/db/database.py`
SQLAlchemy async engine + `AsyncSessionLocal` + `get_db()` dependency.

**S-17** — Tạo `apps/api/app/api/v1/routers/__init__.py` + 7 router files trống
`auth.py`, `engineers.py`, `projects.py`, `allocations.py`, `bench.py`, `reports.py`, `dashboard.py` — mỗi file chỉ có `router = APIRouter()`.

**S-18** — Tạo `apps/api/app/main.py`
FastAPI app init. CORS middleware. Include 7 routers với prefix `/api/v1`. Startup event: log "app started", verify Redis. Shutdown event: log "app stopped".

**S-19** — Thêm `GET /api/v1/health` vào `main.py` hoặc router riêng
Response: `{"status": "ok", "version": "1.0.0"}` — HTTP 200. No auth required.

**S-20** — Tạo `apps/api/tests/` (empty `conftest.py`)
pytest fixture: test client (`httpx.AsyncClient`), test DB session.

**S-21** — Kiểm tra gate M-02 (health check)
```bash
docker compose up api
curl http://localhost:8000/api/v1/health
# Expected: {"status":"ok","version":"1.0.0"}
curl http://localhost:8000/docs
# Expected: 200 Swagger UI
```

---

### M-03: Database Layer

**S-22** — Tạo `apps/api/app/models/engineer.py`
SQLAlchemy model `Engineer` với tất cả fields từ domain-model.md. UUID PK, indexes: email(unique), primary_skill.

**S-23** — Tạo `apps/api/app/models/project.py`
Model `Project`, enum: `planned/active/closed`.

**S-24** — Tạo `apps/api/app/models/allocation.py`
Model `Allocation`. FK: engineer_id, project_id. Indexes: engineer_id, project_id, status.

**S-25** — Tạo `apps/api/app/models/match_score.py`
Model `MatchScore`. FK: engineer_id, project_id. Composite index.

**S-26** — Tạo `apps/api/app/models/bench_forecast.py`
Model `BenchForecast`. FK: engineer_id. Indexes: engineer_id, forecast_date.

**S-27** — Tạo `apps/api/app/models/user.py` + `models/__init__.py`
Model `User`. email unique.

**S-28** — Alembic init và config
```bash
cd apps/api && alembic init alembic
```
Cập nhật `alembic/env.py`: import tất cả models, dùng `DATABASE_URL` từ config.

**S-29** — Tạo initial migration
```bash
alembic revision --autogenerate -m "initial_schema"
```
Verify migration file: 6 tables, FK constraints, indexes đúng domain-model.md.

**S-30** — Tạo `apps/api/app/schemas/common.py`
`ErrorDetail`, `ErrorResponse` — dùng chung cho tất cả error responses.

**S-31** — Tạo `apps/api/app/schemas/engineer.py`
`EngineerResponse`, `EngineerListResponse`. Fields khớp api-contract.md.

**S-32** — Tạo `apps/api/app/schemas/project.py`
`ProjectResponse`, `ProjectListItem`.

**S-33** — Tạo `apps/api/app/schemas/allocation.py`
`AllocationConfirmRequest`, `AllocationConfirmResponse`, `AllocationActiveItem`, `RecommendationResponse`.

**S-34** — Tạo `apps/api/app/schemas/bench_forecast.py`
`BenchForecastItem`, `BenchAlertItem`.

**S-35** — Tạo `apps/api/app/schemas/auth.py`
`LoginRequest`, `LoginResponse`. Tạo `schemas/dashboard.py`: `DashboardStats`.

**S-36** — Kiểm tra gate M-03
```bash
alembic upgrade head
# Expected: No errors, 6 tables created
psql $DATABASE_URL -c "\dt"
# Expected: engineers, projects, allocations, match_scores, bench_forecasts, users
```

---

### M-04: Service Layer — Stubs

**S-37** — Tạo `apps/api/app/repositories/engineer_repository.py`
Functions: `get_all() -> list[Engineer]`, `get_by_id(id) -> Engineer | None`. Thin, chỉ query DB.

**S-38** — Tạo `apps/api/app/repositories/project_repository.py`
Functions: `get_all() -> list[Project]`, `get_by_id(id) -> Project | None`.

**S-39** — Tạo `apps/api/app/repositories/allocation_repository.py`
Functions: `get_active() -> list[Allocation]`, `create(data) -> Allocation`, `get_total_percentage(engineer_id) -> int`.

**S-40** — Tạo `apps/api/app/services/csv_ingestion.py`
```python
class CSVIngestionService:
    async def parse_engineers_csv(file: UploadFile) -> dict:
        # THẬT: validate MIME (text/csv), validate size <= MAX_CSV_SIZE_MB
        # STUB: return {"inserted":0,"updated":0,"skipped":0,"errors":[]}
    async def parse_projects_csv(file: UploadFile) -> dict:
        # same pattern
```

**S-41** — Tạo `apps/api/app/services/llm_scoring.py`
```python
class LLMScoringService:
    async def score_engineer_project(engineer, project) -> MatchScore:
        # STUB: return static scores, llm_provider="stub", model_version="stub-v0"
        # Log event: llm_score_computed
```

**S-42** — Tạo `apps/api/app/services/constraint_engine.py`
```python
class ConstraintEngine:
    def apply_hard_constraints(engineers, project) -> list: return engineers
    def apply_soft_constraints(engineers, project) -> list: return engineers
```

**S-43** — Tạo `apps/api/app/services/bench_prediction.py`
```python
class BenchPredictionEngine:
    async def predict_bench(engineer: Engineer) -> BenchForecast:
        # THẬT: check bench_start_date - today <= BENCH_ALERT_DAYS_THRESHOLD
        # Return BenchForecast mock với risk_level đúng
    async def get_alerts() -> list[Engineer]:
        # Return engineers có bench_start_date trong 30 ngày
```

**S-44** — Tạo `apps/api/app/services/allocation_orchestrator.py`
```python
class AllocationRecommendationOrchestrator:
    async def recommend_engineers(project_id: UUID) -> dict:
        # STUB: return mock recommendations list với schema đúng api-contract.md
```

---

### M-05: API Endpoints + Repositories

**S-45** — `routers/auth.py`: POST `/auth/login`
Request: `LoginRequest`. Response 200: `LoginResponse` (mock token, role="admin"). Response 422: auto (Pydantic). Log: không log PII.

**S-46** — `routers/engineers.py`: POST `/engineers/upload`
Gọi `CSVIngestionService.parse_engineers_csv()`. Response 200: stub body. Response 413: `file_too_large`. Response 400: `invalid_csv`. Log: `csv_import_started`, `csv_import_completed/failed`.

**S-47** — `routers/engineers.py`: GET `/engineers`
Gọi `engineer_repository.get_all()`. Response 200: list `EngineerResponse`.

**S-48** — `routers/engineers.py`: GET `/engineers/{id}`
Gọi `engineer_repository.get_by_id(id)`. Response 200: `EngineerResponse`. Response 404: `not_found`.

**S-49** — `routers/engineers.py`: GET `/engineers/{id}/bench-forecast`
Gọi `BenchPredictionEngine.predict_bench()`. Response 200: `BenchForecastItem`. Response 404 nếu engineer không tồn tại.

**S-50** — `routers/projects.py`: POST `/projects/upload`
Gọi `CSVIngestionService.parse_projects_csv()`. Same pattern như S-46.

**S-51** — `routers/projects.py`: GET `/projects`
Gọi `project_repository.get_all()`. Response 200: list `ProjectListItem`.

**S-52** — `routers/projects.py`: GET `/projects/{id}`
Gọi `project_repository.get_by_id(id)`. Response 200/404.

**S-53** — `routers/allocations.py`: POST `/allocations/recommend`
Request: `{"project_id": uuid}`. Gọi `AllocationRecommendationOrchestrator.recommend_engineers()`. Log: `allocation_generated`.

**S-54** — `routers/allocations.py`: GET `/allocations/recommendations/{project_id}`
Response 200: mock recommendations. Response 404 nếu project không tồn tại.

**S-55** — `routers/allocations.py`: POST `/allocations/confirm`
Request: `AllocationConfirmRequest`. Check allocation cap (gọi `allocation_repository.get_total_percentage()`). Response 201 hoặc 400 `allocation_cap_exceeded`. Log: `allocation_confirmed`.

**S-56** — `routers/allocations.py`: GET `/allocations/active`
Gọi `allocation_repository.get_active()`. Response 200: list `AllocationActiveItem`.

**S-57** — `routers/bench.py`: GET `/bench/forecast`
Gọi mock forecast list. Response 200: list `BenchForecastItem`.

**S-58** — `routers/bench.py`: GET `/bench/alerts`
Gọi `BenchPredictionEngine.get_alerts()`. Response 200: list `BenchAlertItem`.

**S-59** — `routers/reports.py`: GET `/reports/shortage`
Response 200: mock shortage list (schema: `[{skill, required, available, gap}]`).

**S-60** — `routers/dashboard.py`: GET `/dashboard/stats`
Response 200: mock `DashboardStats` (`{total_engineers, engineers_on_bench, active_projects, allocation_rate_percentage}`).

**S-61** — Thêm request logging middleware vào `main.py`
Log `request_start` (method, path) và `request_end` (method, path, status, latency_ms) cho mọi request.

**S-62** — Kiểm tra gate M-05
```bash
# Test từng endpoint, ví dụ:
curl http://localhost:8000/api/v1/engineers           # 200
curl http://localhost:8000/api/v1/engineers/bad-uuid  # 404
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"x"}'             # 200 mock token
```

---

### M-06: Redis Integration

**S-63** — Tạo `apps/api/app/core/redis.py`
```python
async def get_redis() -> Redis: ...
async def set_cache(key: str, value: str, ttl: int) -> None: ...
async def get_cache(key: str) -> Optional[str]: ...
```
Verify connection trong startup event của `main.py`. Log "Redis connected" hoặc error.

---

### M-07: Frontend Setup + Layout

**S-64** — Init Next.js project
```bash
cd apps/web
npx create-next-app@latest . --typescript --app --tailwind --no-src-dir
```
Rename `src/` nếu create-next-app tạo — hoặc dùng `--src-dir` theo repo structure.

**S-65** — Install dependencies
```bash
npm install @tanstack/react-query axios
npx shadcn-ui@latest init
```

**S-66** — Cài shadcn/ui components
```bash
npx shadcn-ui@latest add card table button dialog badge skeleton form input label
```

**S-67** — Tạo `tsconfig.json` với `"strict": true` (verify sau init)

**S-68** — Tạo `.eslintrc.json` và `.prettierrc`

**S-69** — Tạo `app/layout.tsx`
`QueryClientProvider` wrap, import `AppShell`.

**S-70** — Tạo `components/layout/Sidebar.tsx`
Nav links: Dashboard, Engineers, Upload Data, Projects, Allocation, Bench Forecast, Reports. Client component.

**S-71** — Tạo `components/layout/Header.tsx`
User info placeholder, logo/title.

**S-72** — Tạo `components/layout/AppShell.tsx`
Sidebar + Header + `{children}` layout wrapper.

**S-73** — Tạo `types/index.ts`
TypeScript types: `Engineer`, `Project`, `Allocation`, `BenchForecast`, `MatchScore`, `User`, `DashboardStats`, response types.

**S-73b** — Gate M-07
```bash
cd apps/web && npm run build
# Expected: build pass với zero TypeScript errors
tsc --noEmit
```

---

### M-08: Frontend Pages + API Integration

**S-74** — Tạo `lib/api-client.ts`
Axios instance: `baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`. Interceptor: inject `Authorization: Bearer <token>` từ localStorage.

**S-75** — Tạo `lib/services/auth.ts`
`login(email, password)` → `POST /api/v1/auth/login` → lưu token.

**S-76** — Tạo `lib/services/engineers.ts`
`listEngineers()`, `getEngineer(id)`, `uploadEngineers(file)`, `getBenchForecast(id)`.

**S-77** — Tạo `lib/services/projects.ts`
`listProjects()`, `getProject(id)`, `uploadProjects(file)`.

**S-78** — Tạo `lib/services/allocations.ts`
`recommend(projectId)`, `getRecommendations(projectId)`, `confirm(data)`, `getActive()`.

**S-79** — Tạo `lib/services/bench.ts`
`getForecast()`, `getAlerts()`.

**S-80** — Tạo `lib/services/reports.ts`
`getShortage()`.

**S-81** — Tạo `lib/services/dashboard.ts`
`getStats()`.

**S-82** — Tạo `app/login/page.tsx`
Form: email + password + submit. Gọi `auth.login()`. Lưu token → redirect `/dashboard`. No auth guard (public). Loading + error state.

**S-83** — Auth guard middleware hoặc HOC
Client-side: check token trong localStorage. Nếu không có → redirect `/login`. Áp dụng cho tất cả routes trừ `/login`.

**S-84** — Tạo `app/dashboard/page.tsx`
KPI cards (gọi `getStats()`). Bench alert panel. Recent allocations table. Skeleton loading state.

**S-85** — Tạo `app/engineers/page.tsx`
Table: name, skill, level, availability badge, "View Details" link. Gọi `listEngineers()`.

**S-86** — Tạo `app/engineers/[id]/page.tsx`
Engineer info card. Active allocations. Bench forecast panel. Gọi `getEngineer(id)` + `getBenchForecast(id)`.

**S-87** — Tạo `app/upload/page.tsx`
2 upload forms: Engineers CSV + Projects CSV. Show import result `{inserted, updated, skipped, errors}`.

**S-88** — Tạo `app/projects/page.tsx`
Table: name, skills, level, status badge. Gọi `listProjects()`.

**S-89** — Tạo `app/projects/[id]/page.tsx`
Project info. "Generate Recommendations" button → gọi `recommend()`. Recommendations panel.

**S-90** — Tạo `app/allocation/page.tsx`
Project selector. Recommendation cards với score breakdown. "Confirm" button → gọi `confirm()`.

**S-91** — Tạo `app/bench-forecast/page.tsx`
Table: engineer name, risk level badge, probability, forecast date. Gọi `getForecast()`.

**S-92** — Tạo `app/reports/page.tsx`
Shortage table: skill, required, available, gap. Export button (placeholder). Gọi `getShortage()`.

**S-93** — Gate M-08
```bash
# Start all services
docker compose up
# Verify: truy cập http://localhost:3000/login, login, navigate qua các routes
# Expected: 10 routes render không có runtime error
```

---

### M-09: Data Seeding + Quality + CI

**S-94** — Tạo `apps/api/scripts/seed.py`
Insert 5 engineers, 3 projects, 3 allocations. E001: `bench_start_date = today + 30 days`. E004: `bench_start_date = today - 10 days`. Xem `test-data.md` cho spec đầy đủ.

**S-95** — Tạo test file `tests/test_engineers.py`
Test: `GET /engineers` → 200; `GET /engineers/{valid_id}` → 200; `GET /engineers/{invalid}` → 404; `POST /upload` valid → 200; `POST /upload` >10MB → 413.

**S-96** — Tạo `tests/test_projects.py`
Test: `GET /projects` → 200; `GET /projects/{id}` → 200/404; `POST /upload` → 200/413.

**S-97** — Tạo `tests/test_allocations.py`
Test: `POST /recommend` → 200; `POST /confirm` → 201; `POST /confirm` over-cap → 400; `GET /active` → 200.

**S-98** — Tạo `tests/test_bench.py`
Test: `GET /bench/forecast` → 200; `GET /bench/alerts` → 200; E001 (bench trong 30 ngày) xuất hiện trong alerts.

**S-99** — Verify lint
```bash
# Backend
cd apps/api && ruff check . && black --check .
# Frontend
cd apps/web && npm run lint
```
Fix mọi issue trước khi tiếp tục.

**S-100** — Verify type checking
```bash
cd apps/web && tsc --noEmit
# Expected: 0 errors
# Backend: check tất cả service/router functions có type hints
```

**S-101** — Tạo `.github/workflows/ci.yml`
```yaml
jobs:
  backend:
    - ruff check
    - black --check
    - pytest
  frontend:
    - eslint
    - prettier --check
    - tsc --noEmit
    - next build
```

---

### M-10: Final Validation

**S-102** — Full Docker Compose startup
```bash
docker compose up --build
# Wait for all healthy
docker compose ps
# Expected: web (healthy), api (healthy), postgres (healthy), redis (healthy)
```

**S-103** — Run seed script
```bash
docker compose exec api python scripts/seed.py
# Then verify:
curl http://localhost:8000/api/v1/engineers | jq '. | length'
# Expected: >= 5
```

**S-104** — AC verification sweep
Chạy toàn bộ AC-1 đến AC-20 theo `blackbox-testcases.md` và điền vào `test-results.md`.

---

## 5. Risks & Rollback

### Risks

| # | Risk | Khả năng | Tác động | Giảm thiểu |
|---|------|---------|---------|-----------|
| R-1 | Mock JWT merge vào main không có upgrade plan → security debt | Trung bình | Cao | Code comment bắt buộc `TODO`; tạo ticket Phase 2 auth ngay |
| R-2 | Stub response schema sai → contract violation khi implement thật | Trung bình | Trung bình | Schemas định nghĩa từ `api-contract.md` trước, test verify shape |
| R-3 | Seed data không đa dạng → miss edge cases | Thấp | Trung bình | E001 bench=30 ngày, E004 bench=-10 ngày, 3 trạng thái project |
| R-4 | `dashboard/stats` không có trong `api-contract.md` Raw | Thấp | Thấp | Giải quyết bằng architecture authority; ghi rõ OC-3 |
| R-5 | TypeScript strict sau khi thêm nhiều pages → breaking errors | Trung bình | Trung bình | Setup strict từ S-67, verify sau mỗi page |
| R-6 | `packages/shared/` không có task tường minh → quên tạo | Thấp | Thấp | S-05 tạo placeholder; OC-1 tracked |
| R-7 | Docker health check chờ quá lâu → CI timeout | Thấp | Trung bình | Set `healthcheck: interval 10s, timeout 5s, retries 5` |
| R-8 | Alembic migration conflict khi thêm column sau | Thấp | Trung bình | Initial migration chứa tất cả columns ngay từ đầu |

### Rollback Procedure

| Tình huống | Hành động |
|-----------|---------|
| M-01 fail (docker không chạy) | Sửa `docker-compose.yml`, không cần revert code |
| M-02 fail (app không start) | `git revert` đến commit cuối M-01 |
| M-03 fail (migration fail) | `alembic downgrade base` + fix model/migration + retry |
| M-04–M-05 fail (endpoint sai) | Revert router file cụ thể; không ảnh hưởng milestone khác |
| M-07–M-08 fail (frontend error) | Revert page file cụ thể; không ảnh hưởng backend |
| Toàn bộ fail | `git checkout <commit-đầu-milestone>` + investigate |

**Lưu ý:** Sau mỗi milestone pass validation gate, tạo git commit để có checkpoint rõ ràng.

---

## 6. Verification Procedure

### Sau M-01

```bash
docker compose up --build
docker compose ps  # 4 services healthy
docker compose down
```

### Sau M-02

```bash
docker compose up api postgres
curl http://localhost:8000/api/v1/health
# {"status":"ok","version":"1.0.0"}
curl http://localhost:8000/docs
# 200 HTML
```

### Sau M-03

```bash
docker compose exec api alembic upgrade head
docker compose exec postgres psql -U postgres -d app -c "\dt"
# Expected: 6 tables listed
```

### Sau M-05

```bash
# Auth
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"x"}'
# 200 + access_token

# Engineers
curl http://localhost:8000/api/v1/engineers              # 200 list
curl http://localhost:8000/api/v1/engineers/nonexistent  # 404

# CSV size limit
dd if=/dev/urandom bs=1M count=11 | curl -X POST \
  http://localhost:8000/api/v1/engineers/upload -F "file=@-;filename=test.csv"
# 413 file_too_large

# Dashboard
curl http://localhost:8000/api/v1/dashboard/stats
# {"total_engineers":...,"engineers_on_bench":...,...}
```

### Sau M-06

```bash
docker compose logs api | grep "Redis connected"
# Expected: log entry present
```

### Sau M-07

```bash
cd apps/web && npm run build && tsc --noEmit
# 0 errors
```

### Sau M-09

```bash
# Backend tests
docker compose exec api pytest -v
# All pass

# Linting
cd apps/api && ruff check . && black --check .
cd apps/web && npm run lint && npx prettier --check .

# Frontend type check
cd apps/web && tsc --noEmit
```

### Sau M-10 (Final)

Chạy toàn bộ checklist trong `review-checklist.md` sections A–I.
Điền kết quả vào `test-results.md`.

---

## 7. Open Concerns

| # | Concern | Mức độ | Action |
|---|---------|--------|--------|
| OC-1 | `packages/shared/` không có task tường minh trong Raw spec | Minor | S-05 tạo placeholder; không implement logic |
| OC-2 | Mock JWT security debt — phải replace trước production | **Major** | Code comment bắt buộc; tạo ticket Phase 2 auth |
| OC-3 | `GET /dashboard/stats` không có trong `api-contract.md` Raw | Minor | Resolved bằng architecture authority (Section 2.3) |
| OC-4 | Bench alert trigger dùng `bench_start_date` | Minor | Ghi rõ trong code comment; OI-14 Q2 deferred |
| OC-5 | `packages/shared/` không được import bởi apps/web hay apps/api trong Phase 5 | Minor | Tạo placeholder nhưng không wire vào apps |

---

## 8. AC Mapping Table

Mỗi AC được đáp ứng ở đâu trong implementation.

| AC | Mô tả ngắn | Milestone | Steps | File(s) chính | Test type |
|----|-----------|----------|-------|--------------|-----------|
| AC-1 | Docker Compose startup 4 services | M-01 | S-09 | `docker-compose.yml` | IT/E2E |
| AC-2 | Frontend :3000, Backend :8000 | M-01, M-07 | S-09, S-64 | `docker-compose.yml`, `next.config.ts` | E2E |
| AC-3 | GET /health → 200 | M-02 | S-19 | `main.py` (hoặc health router) | IT/BB |
| AC-4 | 10 routes tồn tại và render | M-08 | S-82–S-92 | `app/*/page.tsx` (10 files) | E2E/BB |
| AC-5 | Global layout: sidebar (7 links) + header | M-07 | S-69–S-72 | `layout.tsx`, `Sidebar.tsx`, `Header.tsx` | E2E |
| AC-6 | TailwindCSS + shadcn/ui + 7 components | M-07 | S-65–S-66 | `components/ui/` | UT/E2E |
| AC-7 | FastAPI boot + /docs | M-02 | S-18 | `main.py` | IT |
| AC-8 | 7 router groups registered | M-02, M-05 | S-17–S-18, S-45–S-60 | `main.py`, `routers/*.py` | IT |
| AC-9 | 17 endpoints đúng status codes | M-05 | S-45–S-60 | `routers/*.py` | IT/BB |
| AC-10 | 6 tables + FK + indexes | M-03 | S-22–S-29 | `models/*.py`, `alembic/versions/*` | IT |
| AC-11 | Seed data visible via API | M-09 | S-94 | `scripts/seed.py` | IT/E2E |
| AC-12 | Upload endpoint stub response | M-05 | S-46, S-50 | `routers/engineers.py`, `routers/projects.py`, `services/csv_ingestion.py` | IT/BB |
| AC-13 | LLMScoringService stub | M-04 | S-41 | `services/llm_scoring.py` | UT |
| AC-14 | Redis client + verify startup | M-06 | S-63 | `core/redis.py`, `main.py` | IT |
| AC-15 | Structured logging 8 events | M-02, M-05 | S-14, S-61 | `core/logging.py`, middleware | IT/BB |
| AC-16 | Lint/format zero errors | M-09 | S-99 | `.eslintrc.json`, `pyproject.toml` | CI |
| AC-17 | tsc zero errors + Python type hints | M-07, M-09 | S-67, S-100 | `tsconfig.json`, tất cả `*.py` services/routers | CI |
| AC-18 | CI pipeline passes | M-09 | S-101 | `.github/workflows/ci.yml` | CI |
| AC-19 | Auth stub: mock JWT + route guard | M-02, M-08 | S-15, S-45, S-82–S-83 | `core/security.py`, `routers/auth.py`, `app/login/page.tsx`, auth guard | IT/E2E |
| AC-20 | CSV > 10MB → 413 + error body | M-04, M-05 | S-40, S-46, S-50 | `services/csv_ingestion.py`, `routers/*.py` | IT/BB |

---

## Checklist trước khi bắt đầu Implementation

### Xác nhận bắt buộc (phải có trước khi code)

- [x] OI-01 (Auth strategy): Mock JWT ← DECIDED
- [x] OI-14 (Bench threshold): 30 ngày, dùng `bench_start_date` ← DECIDED
- [x] `spec-pack.md` status: READY FOR IMPLEMENTATION
- [x] Repository rỗng (không có code hiện có bị ảnh hưởng)

### Đã xác nhận thêm (2026-03-25)

- [x] OI-15: `GET /dashboard/stats` trả về mock data — DECIDED
- [x] OI-02: Object storage → in-memory handling tạm thời (không lưu file) — DECIDED
- [x] OI-16: Không có pagination trong Phase 5 — DECIDED
- [ ] Team confirm: Docker + Node.js 18 + Python 3.11 đã cài sẵn trong môi trường develop

### Môi trường cần chuẩn bị trước khi bắt đầu

- [ ] Docker Desktop (hoặc Docker Engine) đang chạy
- [ ] Git repository initialized (`git init` hoặc clone)
- [ ] `.env` file tạo từ `.env.example` với values cho local dev
- [ ] PostgreSQL và Redis accessible (qua Docker)
