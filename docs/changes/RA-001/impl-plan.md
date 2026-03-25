# Kế hoạch Implementation — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phase:** 5 Scaffold (= Phase 1 trong SDD workflow)
**Phiên bản:** Draft 1.0 (Phase 2)
**Ngày:** 2026-03-25

**Quyết định đã xác nhận:**
- OI-01: Mock JWT ✓
- OI-14: BENCH_ALERT_DAYS_THRESHOLD = 30, dùng `bench_start_date` ✓

---

## Tổng quan Milestones

| Milestone | Tasks | Mô tả | Dependency |
|-----------|-------|-------|-----------|
| M-01 | TASK-001–006 | Repository & Infrastructure | — |
| M-02 | TASK-007–013 | Backend Project Setup + Core Modules | M-01 |
| M-03 | TASK-014–017b | Database Layer | M-02 |
| M-04 | TASK-018–023 | Service Layer Stubs | M-03 |
| M-05 | TASK-024–031, TASK-054–060 | API Endpoints Backend | M-04 |
| M-06 | TASK-032–033 | Redis Integration | M-02 (có thể song song M-05) |
| M-07 | TASK-034–036 | Frontend Project Setup + Layout | M-01 |
| M-08 | TASK-037–045 | Frontend Pages + API Integration | M-07, M-05 |
| M-09 | TASK-046–050 | Data Seeding + Quality Setup + CI | M-05, M-08 |
| M-10 | TASK-051–053 | Final Validation (AC-1→AC-20) | M-09 |

**Validation gate:** Sau mỗi milestone, project phải build và app phải start thành công.

---

## M-01: Repository & Infrastructure

| Task | Mô tả | Deliverable | Ghi chú |
|------|-------|------------|---------|
| TASK-001 | Initialize Git Repository | `README.md`, `.gitignore` | — |
| TASK-002 | Create Core Directory Structure | `apps/`, `packages/`, `infra/`, `docs/`, `scripts/` | — |
| TASK-003 | Create Application Directories | `apps/web/`, `apps/api/` | — |
| TASK-004 | Create Docker Compose File | `docker-compose.yml` với 4 services + health checks | web:3000, api:8000, postgres:5432, redis:6379 |
| TASK-005 | Add Environment File Template | `.env.example` với tất cả 15 variables | Xem danh sách vars bên dưới |
| TASK-006 | Add Database Volume | Named volume trong docker-compose | Data persist qua restart |

**Biến môi trường bắt buộc trong `.env.example`:**
```
DATABASE_URL, REDIS_URL, OPENAI_API_KEY, LLM_MODEL, LLM_MAX_TOKENS,
LLM_TEMPERATURE, LLM_CONCURRENCY (default: 10), LLM_PROVIDER,
JWT_SECRET, JWT_ACCESS_EXPIRE_HOURS, JWT_REFRESH_EXPIRE_DAYS,
MAX_CSV_SIZE_MB (default: 10),
BENCH_ALERT_DAYS_THRESHOLD (default: 30),
SHORTAGE_SCORE_THRESHOLD
```

**Redis TTL values cần có trong config:**
```
LLM_CACHE_TTL=86400    (24h)
BENCH_CACHE_TTL=3600   (1h)
ENGINEER_CACHE_TTL=300 (5m)
PROJECT_CACHE_TTL=1800 (30m)
```

---

## M-02: Backend Project Setup + Core Modules

⚠️ **OI-01 Impact:** Security module phải là Mock JWT stub.

| Task | Mô tả | Deliverable | Ghi chú |
|------|-------|------------|---------|
| TASK-007 | Initialize Python Project | `apps/api/requirements.txt` | fastapi, uvicorn, pydantic, pydantic-settings, sqlalchemy, alembic, psycopg2-binary, redis, pandas, python-multipart, python-jose[cryptography], passlib[bcrypt] |
| TASK-008 | Create FastAPI App Entry | `apps/api/app/main.py` | CORS middleware, router registration, startup/shutdown events |
| TASK-009 | Create Health Endpoint | `GET /api/v1/health` → `{"status":"ok","version":"1.0.0"}` | HTTP 200 |
| TASK-010 | Add API Router Structure | `app/api/v1/routers/` với 7 file trống | auth.py, engineers.py, projects.py, allocations.py, bench.py, reports.py, dashboard.py |
| TASK-011 | Create Core Config Module | `app/core/config.py` | pydantic-settings đọc tất cả env vars |
| TASK-012 | Create Logging Module | `app/core/logging.py` | Structured JSON, levels: INFO/WARN/ERROR/DEBUG |
| TASK-013 | Create Security Module | `app/core/security.py` | `create_access_token()`, `decode_token()`, `get_current_user()` — **TẤT CẢ LÀ STUB** |

**Mock JWT implementation note:**
```python
# TODO: Replace with real JWT auth before production
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Scaffold stub: accept any token format, return mock user
    return User(id="mock-id", email="mock@example.com", role="admin")
```

---

## M-03: Database Layer

| Task | Mô tả | Deliverable | Ghi chú |
|------|-------|------------|---------|
| TASK-014 | Create Database Connection Module | `app/db/database.py` | SQLAlchemy async engine + session factory |
| TASK-015 | Create ORM Models | `app/models/` (6 files) | engineer.py, project.py, allocation.py, match_score.py, bench_forecast.py, user.py |
| TASK-016 | Create Migration Setup | `alembic/` directory | `alembic init alembic`, configure env.py với DATABASE_URL |
| TASK-017 | Create Initial Migration | Alembic migration file | Tạo 6 tables với đầy đủ FK + indexes |
| TASK-017b | Create Pydantic Schemas | `app/schemas/` (7 files) | engineer.py, project.py, allocation.py, bench_forecast.py, match_score.py, auth.py, dashboard.py |

**Tables phải tạo:** `engineers`, `projects`, `allocations`, `match_scores`, `bench_forecasts`, `users`

**Indexes bắt buộc:**
- `engineers`: `email` (unique), `primary_skill`
- `allocations`: `engineer_id`, `project_id`, `status`
- `match_scores`: composite (`engineer_id`, `project_id`)
- `bench_forecasts`: `engineer_id`, `forecast_date`

---

## M-04: Service Layer — Stubs

⚠️ **OI-14 Impact:** `BenchPredictionEngine` phải apply 30-day threshold thật sự.

| Task | Mô tả | Deliverable | Stub behavior |
|------|-------|------------|--------------|
| TASK-018 | Create Services Directory | `app/services/` | — |
| TASK-019 | CSVIngestionService | `app/services/csv_ingestion.py` | Validate MIME + size (thật). Parse = mock. Return `{inserted:0, updated:0, skipped:0, errors:[]}` |
| TASK-020 | LLMScoringService | `app/services/llm_scoring.py` | Return static scores. `llm_provider="stub"`, `model_version="stub-v0"` |
| TASK-021 | ConstraintEngine | `app/services/constraint_engine.py` | `apply_hard_constraints()` + `apply_soft_constraints()` — return input list unchanged |
| TASK-022 | BenchPredictionEngine | `app/services/bench_prediction.py` | **Thật sự** check `bench_start_date - today <= BENCH_ALERT_DAYS_THRESHOLD`. Return `BenchForecast` mock |
| TASK-023 | AllocationRecommendationOrchestrator | `app/services/allocation_orchestrator.py` | `recommend_engineers(project_id)` — return mock list |

---

## M-05: API Endpoints — Backend

| Task | Endpoint | Method | Status Codes | Ghi chú |
|------|----------|--------|-------------|---------|
| TASK-054 | `/api/v1/auth/login` | POST | 200, 422 | Mock token, accept any valid-format credentials |
| TASK-024 | `/api/v1/engineers/upload` | POST | 200, 413 | Validate size limit thật, stub response |
| TASK-025 | `/api/v1/engineers` | GET | 200 | Trả về seed engineers list |
| TASK-055 | `/api/v1/engineers/{id}` | GET | 200, 404 | Detail hoặc 404 |
| TASK-030 | `/api/v1/engineers/{id}/bench-forecast` | GET | 200, 404 | Mock forecast |
| TASK-026 | `/api/v1/projects/upload` | POST | 200, 413 | Validate size limit |
| TASK-027 | `/api/v1/projects` | GET | 200 | Trả về seed projects |
| TASK-056 | `/api/v1/projects/{id}` | GET | 200, 404 | Detail hoặc 404 |
| TASK-028 | `/api/v1/allocations/recommend` | POST | 200 | Gọi orchestrator stub |
| TASK-057 | `/api/v1/allocations/recommendations/{project_id}` | GET | 200 | Mock recommendations |
| TASK-029 | `/api/v1/allocations/confirm` | POST | 201, 400 | 400 nếu allocation cap exceeded |
| TASK-058 | `/api/v1/allocations/active` | GET | 200 | Mock active list |
| TASK-030b | `/api/v1/bench/forecast` | GET | 200 | Mock forecast list |
| TASK-059 | `/api/v1/bench/alerts` | GET | 200 | Engineers trong 30-day threshold |
| TASK-031 | `/api/v1/reports/shortage` | GET | 200 | Mock shortage list |
| TASK-060 | `/api/v1/dashboard/stats` | GET | 200 | `{total_engineers,engineers_on_bench,active_projects,allocation_rate_percentage}` |

> **Note:** `GET /api/v1/dashboard/stats` không có trong `api-contract.md` Raw nhưng bắt buộc theo architecture authority. Xem `.claude/rules/01-implementation-conventions.md`.

---

## M-06: Redis Integration

| Task | Mô tả | Deliverable | Ghi chú |
|------|-------|------------|---------|
| TASK-032 | Add Redis Client Module | `app/core/redis.py` | Initialize connection, verify on startup |
| TASK-033 | Add Cache Helper | `get_cache(key)`, `set_cache(key, value, ttl)` | Dùng TTL từ config |

**TTL mapping:**
- LLM scoring: `LLM_CACHE_TTL` (24h)
- Bench forecast: `BENCH_CACHE_TTL` (1h)
- Engineer list: `ENGINEER_CACHE_TTL` (5m)
- Project requirements: `PROJECT_CACHE_TTL` (30m)

---

## M-07: Frontend Project Setup + Layout

⚠️ **TypeScript strict mode phải được setup ngay từ đây.** Không thêm sau.

| Task | Mô tả | Deliverable | Ghi chú |
|------|-------|------------|---------|
| TASK-034 | Initialize Next.js Project | `apps/web/` | TypeScript + App Router |
| TASK-035 | Install UI Dependencies | `package.json` | TailwindCSS, shadcn/ui, axios, @tanstack/react-query |
| TASK-036 | Create App Layout | `app/layout.tsx` | Sidebar + Header + Main + QueryClientProvider |

**tsconfig.json phải có:**
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

## M-08: Frontend Pages + API Integration

⚠️ **OI-01 Impact:** `/login` page phải implement auth guard.

| Task | Route | Mô tả | Ghi chú |
|------|-------|-------|---------|
| TASK-062 | `/login` | Email/password form, call auth API, store token, redirect | Auth guard setup cho tất cả routes |
| TASK-037 | `/dashboard` | KPI cards, bench alert panel, recent allocations | Call `GET /dashboard/stats` |
| TASK-038 | `/upload` | CSV upload forms (engineers + projects) | Show import result |
| TASK-039 | `/engineers` | Engineer table + availability badges | Call `GET /engineers` |
| TASK-061 | `/engineers/[id]` | Engineer info, allocations, bench forecast | Call `GET /engineers/{id}` |
| TASK-039b | `/projects` | Project table + status badges | Call `GET /projects` |
| TASK-040 | `/projects/[id]` | Project info + recommendations | Call `POST /allocations/recommend` |
| TASK-041 | `/allocation` | Project selector, recommendation cards, confirm flow | Call `POST /allocations/confirm` |
| TASK-042 | `/bench-forecast` | Forecast table + risk badges | Call `GET /bench/forecast` |
| TASK-043 | `/reports` | Shortage table + export button | Call `GET /reports/shortage` |
| TASK-044 | API Client | `lib/api-client.ts` | Axios + Bearer token injection |
| TASK-045 | API Service Modules | `lib/services/` (7 files) | auth, engineers, projects, allocations, bench, reports, dashboard |

**Shared components bắt buộc:** `Card`, `Table`, `Button`, `Modal/Dialog`, `Form inputs`, `Badge`, `Skeleton`

---

## M-09: Data Seeding + Quality Setup + CI

| Task | Mô tả | Deliverable | Ghi chú |
|------|-------|------------|---------|
| TASK-046 | Create Seed Script | `apps/api/scripts/seed.py` hoặc `scripts/seed-data.sh` | 5 engineers, 3 projects, 3 allocations |
| TASK-047 | Add Request Logging Middleware | Middleware trong `main.py` | Log request_start/request_end |
| TASK-048 | Add Lint Configuration | `.eslintrc.json`, `.prettierrc`, `pyproject.toml` | ESLint + Prettier + Ruff |
| TASK-049 | Add Type Checking | `tsconfig.json` (strict confirm), Python type hints audit | `tsc --noEmit` phải pass |
| TASK-050 | Create CI Workflow | `.github/workflows/ci.yml` | lint + typecheck + build + pytest |

**Seed data spec:** xem `docs/changes/RA-001/test-data.md`

---

## M-10: Final Validation

| Task | Kiểm tra | Tiêu chí |
|------|---------|---------|
| TASK-051 | `docker compose up` | Tất cả 4 services healthy |
| TASK-052 | Verify Frontend Routes | 10 routes render không có runtime error |
| TASK-053 | Verify API Endpoints | Tất cả 16 endpoints đúng HTTP status code |
| AC-Check | AC-1 → AC-20 | Xem `docs/changes/RA-001/test-results.md` |

---

## Open Concerns (cần theo dõi)

| # | Concern | Mức độ | Action |
|---|---------|--------|--------|
| OC-1 | `packages/shared/` không có task tường minh | Minor | Tạo directory + placeholder trong TASK-002/003 |
| OC-2 | Mock JWT security debt | **Major** | Phải có upgrade plan trước Phase phát triển tiếp theo |
| OC-3 | `GET /api/v1/dashboard/stats` không có trong api-contract.md Raw | Minor | Đã resolved bằng architecture authority |
| OC-4 | Bench alert trigger dùng `bench_start_date` (OI-14 Q2 deferred) | Minor | Ghi rõ trong code comment |
