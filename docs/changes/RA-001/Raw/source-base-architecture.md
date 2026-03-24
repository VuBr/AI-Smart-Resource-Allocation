# source-base-architecture.md

## AI Smart Resource Allocation & Bench Prediction System

**Phase 1 – Architecture Specification**

---

# 1. Architecture Goals

The purpose of this architecture specification is to define a **clear and implementable source base structure** that can be used in later SDD phases to generate and implement the system without ambiguity.

This document defines:

* system architectural layers
* frontend and backend responsibilities
* integration boundaries
* runtime architecture
* service responsibilities
* repository structure
* API baseline
* data architecture
* security and logging baseline
* development environment
* scalability considerations

This architecture is intended to be **sufficiently concrete so that Phase 5 can generate the project source base without guessing system structure.**

---

# 2. Official Technology Decisions

## 2.1 Architecture Style

The system follows a **multi-layer architecture** consisting of:

1. **Presentation Layer** – user interface
2. **Application Layer** – orchestration and business logic
3. **AI/ML Layer** – LLM scoring and forecasting logic
4. **Data Layer** – storage and caching

---

## 2.2 Technology Stack

### Frontend

* Next.js (App Router)
* TypeScript
* TailwindCSS
* shadcn/ui

### Backend

* Python
* FastAPI
* Pydantic / pydantic-settings
* Pandas
* SQLAlchemy (async)
* Alembic (migrations)
* python-jose (JWT)

### Data Layer

* PostgreSQL
* Redis

### Infrastructure

* Docker
* Docker Compose

### LLM Integration

* OpenAI / Anthropic compatible API
* Async scoring pipeline
* Redis caching

---

# 3. System Responsibility Separation

## 3.1 Frontend Responsibilities

Frontend is responsible for:

* rendering UI
* routing and page navigation
* form input and validation (UX level)
* triggering API calls
* rendering results
* managing UI state
* role-based UI visibility
* client-side route guards (redirect to /login)

Frontend **does not perform core business logic** such as:

* allocation scoring
* constraint evaluation
* bench prediction
* CSV parsing
* database operations
* computing KPI aggregates

---

## 3.2 Backend Responsibilities

Backend FastAPI service handles all **core system logic** including:

* CSV ingestion and validation (including size limits)
* skill normalization
* engineer-project scoring
* constraint processing
* LLM orchestration
* Redis caching
* bench forecasting
* shortage reporting
* dashboard aggregate computation
* persistence
* authentication verification
* logging and monitoring

---

# 4. Runtime System Architecture

## 4.1 Deployment Model

```text
Browser
   |
   v
Next.js Frontend (port 3000)
   |
   | REST API calls
   v
FastAPI Backend (port 8000)
   |
   +--> PostgreSQL (port 5432)
   +--> Redis (port 6379)
   +--> LLM Provider (external)
```

---

## 4.2 Request Flow Example

Example: Allocation Recommendation

1. User selects project in frontend
2. Frontend calls `POST /api/v1/allocations/recommend`
3. Backend loads project requirements
4. Backend loads candidate engineers
5. Hard constraints applied (availability, dates)
6. Redis cache checked for existing scores
7. LLM scoring executed if cache miss
8. Soft constraints applied (location, preferences)
9. Results ranked by overall_score descending
10. Response returned to frontend

---

# 5. Frontend Architecture

## 5.1 Framework

Frontend is implemented using:

* **Next.js App Router**
* **TypeScript**
* **TailwindCSS**
* **shadcn/ui**

---

## 5.2 Route Structure

```text
/login
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

---

## 5.3 Frontend Project Structure

```text
apps/web/
  src/
    app/
      login/
      dashboard/
      engineers/
      engineers/[id]/
      upload/
      projects/
      projects/[id]/
      allocation/
      bench-forecast/
      reports/
      layout.tsx

    components/
    features/
      auth/
      dashboard/
      engineers/
      upload/
      projects/
      allocation/
      bench/
      reports/

    hooks/
    lib/
      api-client.ts
      services/
    types/
```

---

## 5.4 Frontend Design Principles

* Pages orchestrate UI only
* Business logic lives in backend
* Features organized by domain
* Shared components reused across pages
* API types aligned with api-contract.md
* Client-side auth guard on all authenticated routes

---

# 6. Backend Architecture

## 6.1 Backend Framework

Backend is implemented as an **independent Python service** using **FastAPI**.

Benefits:

* async support for LLM requests
* automatic OpenAPI docs at `/docs`
* tight integration with Pydantic
* high performance for IO-heavy workloads

---

## 6.2 Backend Directory Structure

```text
apps/api/
  app/
    api/
      v1/
        routers/
          auth.py
          engineers.py
          projects.py
          allocations.py
          bench.py
          reports.py
          dashboard.py

    core/
      config.py
      security.py
      logging.py
      redis.py

    db/
      database.py

    models/
      engineer.py
      project.py
      allocation.py
      match_score.py
      bench_forecast.py
      user.py

    schemas/
      engineer.py
      project.py
      allocation.py
      bench_forecast.py
      match_score.py
      auth.py
      dashboard.py

    repositories/

    services/
      csv_ingestion.py
      llm_scoring.py
      constraint_engine.py
      bench_prediction.py
      allocation_orchestrator.py

    workers/

    main.py

  alembic/
  tests/
  requirements.txt
```

---

# 7. Core Backend Services

## CSVIngestionService

Responsibilities:

* parse CSV files
* validate MIME type
* enforce file size limit (max 10MB)
* validate schema (required columns)
* normalize fields
* upsert engineers and projects
* return import summary

---

## LLMScoringService

Responsibilities:

* construct prompts
* call LLM provider
* parse structured JSON output
* cache results in Redis
* record `llm_provider` and `model_version` on MatchScore
* apply rule-based fallback on LLM failure

---

## ConstraintEngine

Responsibilities:

* apply hard constraints (availability cap, date bounds)
* apply soft constraints (location, preferences)
* validate engineer availability
* enforce allocation rules (sum ≤ 100%)

---

## BenchPredictionEngine

Responsibilities:

* calculate bench forecast using `bench_start_date` and `BENCH_ALERT_DAYS_THRESHOLD`
* classify bench risk (low / medium / high)
* generate alert conditions

---

## AllocationRecommendationOrchestrator

Responsibilities:

* retrieve candidate engineers
* apply constraints
* perform scoring (LLM or fallback)
* combine score dimensions into `overall_score`
* rank recommendations
* persist match scores
* generate shortage warnings

---

# 8. Frontend–Backend Boundary

## Backend Owns

* allocation scoring
* LLM orchestration
* bench forecast
* CSV ingestion
* data validation
* persistence
* authorization enforcement
* KPI aggregate computation

## Frontend Owns

* page rendering
* navigation
* user input
* data visualization
* UI state
* client-side route guards

Frontend **must not recompute backend business logic.**

---

# 9. Data Architecture

## 9.1 Primary Data Store

PostgreSQL is the **source of truth** for:

* engineers
* projects
* allocations
* match_scores
* bench_forecasts
* users

---

## 9.2 Cache Layer

Redis is used for:

* LLM scoring cache (key: `score:{engineer_id}:{project_id}`)
* project requirement cache
* engineer availability cache
* bench forecast cache

---

## 9.3 Cache TTL Strategy

| Cache Type           | TTL |
| -------------------- | --- |
| LLM scoring          | 24h |
| Bench forecast       | 1h  |
| Engineer list        | 5m  |
| Project requirements | 30m |

---

# 10. API Architecture

## 10.1 Base API

```
/api/v1
```

Authentication:

```
Authorization: Bearer <JWT>
```

Unauthenticated: `401 Unauthorized`

---

## 10.2 Core API Endpoints

### Auth

```
POST /api/v1/auth/login
```

### Engineers

```
POST /api/v1/engineers/upload
GET  /api/v1/engineers
GET  /api/v1/engineers/{id}
GET  /api/v1/engineers/{id}/bench-forecast
```

### Projects

```
POST /api/v1/projects/upload
GET  /api/v1/projects
GET  /api/v1/projects/{id}
```

### Allocations

```
POST /api/v1/allocations/recommend
GET  /api/v1/allocations/recommendations/{project_id}
POST /api/v1/allocations/confirm
GET  /api/v1/allocations/active
```

### Bench

```
GET /api/v1/bench/forecast
GET /api/v1/bench/alerts
```

### Reports

```
GET /api/v1/reports/shortage
```

### Dashboard

```
GET /api/v1/dashboard/stats
```

### Health

```
GET /api/v1/health
```

Full schema and status codes defined in:

```
api-contract.md
```

---

# 11. LLM Integration Architecture

LLM is used for:

* skill matching
* level compatibility
* availability assessment
* risk explanation
* recommendation reasoning

Expected LLM response schema:

```json
{
  "skill_match_score": 0.92,
  "level_match_score": 0.85,
  "availability_score": 0.90,
  "overall_score": 0.88,
  "explanation": "...",
  "risk_notes": "...",
  "recommended": true
}
```

---

## 11.1 LLM Execution Strategy

* Async batch calls
* Concurrency limit: `LLM_CONCURRENCY` (default 10)
* Exponential retry with backoff
* Redis cache to avoid redundant calls
* Rule-based fallback when LLM unavailable

---

# 12. CSV Ingestion Architecture

Accepted files:

* engineers.csv
* projects.csv

Processing pipeline:

1. upload file
2. validate MIME type (must be text/csv)
3. validate file size (reject > `MAX_CSV_SIZE_MB`, return 413)
4. parse using Pandas
5. validate with Pydantic schemas
6. normalize fields
7. upsert database
8. return import summary

---

# 13. Security Architecture

## Authentication

JWT access tokens. Token signed with `JWT_SECRET`.

## Authorization Roles

* Admin
* Manager
* Viewer

Role is embedded in JWT payload.

---

## Security Rules

* strict input validation (Pydantic schemas)
* sanitized prompts (no raw user input in LLM prompts)
* no PII in logs
* rate limiting (future phase)
* CSV size limit: `MAX_CSV_SIZE_MB` (default 10MB)
* API keys stored in environment variables only

---

# 14. Logging Strategy

Structured JSON logging via `app/core/logging.py`.

Log levels:

```
INFO
WARN
ERROR
DEBUG
```

Required log events:

* `request_start` — method, path
* `request_end` — method, path, status, latency_ms
* `allocation_generated` — project_id, candidate_count
* `allocation_confirmed` — engineer_id, project_id
* `llm_score_computed` — engineer_id, project_id, provider
* `csv_import_started` — filename, size
* `csv_import_completed` — inserted, updated, skipped, errors
* `csv_import_failed` — filename, error

No PII (engineer email, user email) in log messages.

---

# 15. Repository Structure

```text
repo-root/
  apps/
    web/
    api/

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
    architecture/
    changes/
    standards/

  scripts/
    setup.sh
    seed-data.sh

  docker-compose.yml
  README.md
```

---

# 16. Local Development Environment

Required services:

* web (Next.js on port 3000)
* api (FastAPI on port 8000)
* postgres (PostgreSQL on port 5432)
* redis (Redis on port 6379)

---

## Environment Variables

```
DATABASE_URL
REDIS_URL
OPENAI_API_KEY
LLM_PROVIDER
LLM_MODEL
LLM_MAX_TOKENS
LLM_TEMPERATURE
LLM_CONCURRENCY
JWT_SECRET
JWT_ACCESS_EXPIRE_HOURS
JWT_REFRESH_EXPIRE_DAYS
MAX_CSV_SIZE_MB
BENCH_ALERT_DAYS_THRESHOLD
SHORTAGE_SCORE_THRESHOLD
```

---

# 17. Quality Baseline

Source base must include:

* ESLint + Prettier (frontend)
* Black + Ruff (backend)
* TypeScript strict mode (frontend)
* Python type hints on all public functions
* pytest test runner (backend)
* Jest test runner (frontend, minimal)
* CI pipeline (GitHub Actions)
* OpenAPI docs auto-generated at `/docs`

---

# 18. Scalability Direction

Future scaling options include:

* background job workers (Celery + Redis Queue)
* distributed scoring pipeline
* queue-based LLM processing
* independent scaling of web and API containers
* advanced ML forecasting models
* multi-tenant organization support

---

# 19. Architecture Completion Criteria

Architecture is considered complete when:

1. Frontend stack is finalized.
2. Backend stack is finalized.
3. LLM boundary is defined.
4. All API endpoints are defined with auth endpoint included.
5. Data storage and caching are defined.
6. Repo structure is defined and consistent with source-base-repo-structure.md.
7. Service responsibilities are defined.
8. CSV size limit is specified.
9. Bench alert threshold default is specified.

---

# 20. Open Issues

See:

```
open-issues.md
```

Unresolved items classified as BLOCKING or NON-BLOCKING.
