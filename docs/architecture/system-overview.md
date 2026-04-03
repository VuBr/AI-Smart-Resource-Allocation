# Tổng quan Kiến trúc Hệ thống — AI Smart Resource Allocation

**Loại:** Living Document
**Nguồn gốc:** Trích từ `docs/changes/RA-001/Raw/source-base-architecture.md` (authority: HIGHEST)
**Cập nhật lần cuối:** Phase 9 — RA-001 (2026-04-03)

---

## 1. Phong cách Kiến trúc

Hệ thống theo mô hình **đa tầng (multi-layer)**:

| Tầng | Trách nhiệm |
|------|------------|
| Presentation Layer | Giao diện người dùng (Next.js) |
| Application Layer | Điều phối nghiệp vụ (FastAPI) |
| AI/ML Layer | LLM scoring và bench forecasting |
| Data Layer | Lưu trữ và cache (PostgreSQL + Redis) |

---

## 2. Tech Stack Chính thức

### Frontend
- **Next.js 15** (App Router)
- **Node.js ≥ 20.9.0** (required by Next.js 15 — Docker image: `node:20-alpine`)
- **TypeScript** (strict mode)
- **TailwindCSS**
- **shadcn/ui**
- **@tanstack/react-query**, **axios**

### Backend
- **Python** + **FastAPI**
- **Pydantic** / **pydantic-settings**
- **Pandas** (CSV processing)
- **SQLAlchemy** (async) + **Alembic** (migrations)
- **python-jose** (JWT), **passlib[bcrypt]**

### Data Layer
- **PostgreSQL** — nguồn sự thật duy nhất
- **Redis** — cache layer

### Infrastructure
- **Docker** + **Docker Compose**

### LLM
- OpenAI / Anthropic compatible API (stub trong Phase 5)

---

## 3. Runtime Architecture

```
Browser
   |
   v
Next.js Frontend   :3000
   |
   | REST API (Authorization: Bearer <JWT>)
   v
FastAPI Backend    :8000
   |
   +---> PostgreSQL  :5432
   +---> Redis        :6379
   +---> LLM Provider (external, stubbed)
```

---

## 4. Phân tách Trách nhiệm

### Frontend đảm nhận
- Render UI, routing, navigation
- Form input và UX-level validation
- API calls và render kết quả
- Quản lý UI state
- Client-side route guard (redirect về `/login` nếu không có token)
- Role-based UI visibility

### Frontend KHÔNG đảm nhận
- Allocation scoring
- Constraint evaluation
- Bench prediction
- CSV parsing
- Database operations
- KPI aggregate computation

### Backend đảm nhận
- CSV ingestion & validation (kể cả size limit)
- Skill normalization
- Engineer-project scoring
- Constraint processing
- LLM orchestration & caching
- Bench forecasting
- Shortage reporting
- Dashboard aggregate computation
- Persistence
- Authentication verification
- Structured JSON logging

---

## 5. API Architecture

**Base path:** `/api/v1`
**Auth:** `Authorization: Bearer <JWT>`
**Unauthenticated:** `401 Unauthorized`

| Router Group | Prefix |
|-------------|--------|
| auth | `/api/v1/auth` |
| engineers | `/api/v1/engineers` |
| projects | `/api/v1/projects` |
| allocations | `/api/v1/allocations` |
| bench | `/api/v1/bench` |
| reports | `/api/v1/reports` |
| dashboard | `/api/v1/dashboard` |
| health | `/api/v1/health` |

Chi tiết endpoint: xem `docs/changes/RA-001/Raw/api-contract.md`

---

## 6. Frontend Routes

```
/login           (public, không cần auth)
/dashboard
/engineers
/engineers/[id]
/upload
/projects
/projects/[id]
/allocation
/bench-forecast
/reports
```

Tất cả route trừ `/login` phải có client-side auth guard.

---

## 7. Core Backend Services

| Service | File | Trách nhiệm chính |
|---------|------|------------------|
| CSVIngestionService | `app/services/csv_ingestion.py` | Parse, validate MIME/size, upsert |
| LLMScoringService | `app/services/llm_scoring.py` | Score engineer-project, cache Redis, fallback |
| ConstraintEngine | `app/services/constraint_engine.py` | Hard/soft constraints, availability check |
| BenchPredictionEngine | `app/services/bench_prediction.py` | Bench forecast, alert threshold |
| AllocationRecommendationOrchestrator | `app/services/allocation_orchestrator.py` | Điều phối toàn bộ flow recommend |

---

## 8. Data Architecture

### PostgreSQL — Source of Truth
6 tables: `engineers`, `projects`, `allocations`, `match_scores`, `bench_forecasts`, `users`
Chi tiết schema: xem `docs/architecture/domain-model.md`

### Redis Cache TTL

| Cache | Key Pattern | TTL |
|-------|------------|-----|
| LLM scoring | `score:{engineer_id}:{project_id}` | 24h |
| Bench forecast | — | 1h |
| Engineer list | — | 5m |
| Project requirements | — | 30m |

---

## 9. Security

- **Auth:** JWT access token, ký bằng `JWT_SECRET`
- **Roles:** admin / manager / viewer (embedded trong JWT payload)
- **Input validation:** Pydantic schemas (strict)
- **Logging:** No PII trong log messages
- **CSV limit:** `MAX_CSV_SIZE_MB` (default 10MB) → 413 nếu vượt
- **API keys:** Chỉ trong environment variables, không bao giờ trong code/docs

> **Phase 5 Note:** Authentication là Mock JWT (OI-01 — DECIDED).
> Không dùng real auth. Cần có upgrade plan trước khi deploy production.

---

## 10. Logging Strategy

**Format:** Structured JSON via `app/core/logging.py`

**Log levels:** `INFO`, `WARN`, `ERROR`, `DEBUG`

**Required events:**

| Event | Fields |
|-------|--------|
| `request_start` | method, path |
| `request_end` | method, path, status, latency_ms |
| `allocation_generated` | project_id, candidate_count |
| `allocation_confirmed` | engineer_id, project_id |
| `llm_score_computed` | engineer_id, project_id, provider |
| `csv_import_started` | filename, size |
| `csv_import_completed` | inserted, updated, skipped, errors |
| `csv_import_failed` | filename, error |

> **Tuyệt đối không log PII** (engineer email, user email).

---

## 11. Repository Structure

```
repo-root/
  apps/
    web/          ← Next.js frontend
    api/          ← FastAPI backend
  packages/
    shared/
      src/
        contracts/
        types/
        constants/
  infra/
    docker/
    terraform/
    scripts/
  docs/
    architecture/   ← file này
    changes/
    standards/
  scripts/
    setup.sh
    seed-data.sh
  docker-compose.yml
  README.md
```

Chi tiết: xem `docs/changes/RA-001/Raw/source-base-repo-structure.md`

---

## 12. Môi trường Local Development

| Service | Port (container) | Port (host / localhost) |
|---------|-----------------|------------------------|
| Next.js (web) | 3000 | 3000 |
| FastAPI (api) | 8000 | 8000 |
| PostgreSQL | 5432 | **5433** (mapped — 5432 thường bị chiếm trên host) |
| Redis | 6379 | 6379 |

Khởi động: `docker compose up`

> **Ghi chú kết nối PostgreSQL từ host:** dùng port **5433** (`psql -p 5433`).
> Trong container, các services vẫn communicate qua `postgres:5432` như bình thường.

---

## 13. Biến môi trường bắt buộc

```
DATABASE_URL
REDIS_URL
OPENAI_API_KEY
LLM_PROVIDER
LLM_MODEL
LLM_MAX_TOKENS
LLM_TEMPERATURE
LLM_CONCURRENCY          (default: 10)
JWT_SECRET
JWT_ACCESS_EXPIRE_HOURS
JWT_REFRESH_EXPIRE_DAYS
MAX_CSV_SIZE_MB           (default: 10)
BENCH_ALERT_DAYS_THRESHOLD (default: 30)
SHORTAGE_SCORE_THRESHOLD
```

---

## 14. Quality Baseline

| Hạng mục | Tool |
|---------|------|
| Frontend lint | ESLint + Prettier |
| Frontend type check | `tsc --noEmit` (strict mode) |
| Backend lint | Black + Ruff |
| Backend types | Python type hints trên tất cả public functions |
| Backend tests | pytest |
| Frontend tests | Jest (minimal) |
| CI | GitHub Actions |
| API docs | OpenAPI tại `/docs` |

---

## 15. Scalability Direction (Future Phases)

- Background job workers (Celery + Redis Queue)
- Distributed LLM scoring pipeline
- Independent scaling web/api containers
- Advanced ML forecasting models
- Multi-tenant organization support
