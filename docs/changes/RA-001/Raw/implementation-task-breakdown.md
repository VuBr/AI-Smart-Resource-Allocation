# implementation-task-breakdown.md

## Phase 5 Implementation Task Breakdown

AI Smart Resource Allocation & Bench Prediction System

This document defines the **implementation task breakdown** for Phase 5 of the SDD workflow.

The goal of Phase 5 is to **generate and implement a runnable source base scaffold** aligned with the architecture and specification documents.

Tasks are intentionally **small, atomic, and sequential**, enabling AI agents or developers to execute them reliably.

---

# 1. Implementation Goals

Phase 5 must produce a repository that:

* runs locally using Docker Compose
* contains frontend and backend applications
* exposes stub APIs with correct HTTP status codes
* includes database schema with all tables and foreign keys
* includes seed data
* supports all UI pages including /engineers and /login
* supports CSV upload with size limit validation
* supports allocation recommendation mock flow
* includes auth stub endpoint

---

# 2. Task Execution Principles

### Small Tasks

Each task should be implementable in **one isolated code change**.

### Dependency Order

Tasks must follow the **dependency chain** defined below.

### Validation

After each task group:

* project must still build
* application must still start

---

# 3. Repository Initialization

## TASK-001 — Initialize Git Repository

Create repository structure.

```
repo-root/
```

Add:

* README.md
* .gitignore
* LICENSE (optional)

---

## TASK-002 — Create Core Directory Structure

Create directories:

```
apps/
packages/
infra/
docs/
scripts/
```

---

## TASK-003 — Create Application Directories

```
apps/web
apps/api
```

---

# 4. Infrastructure Setup

## TASK-004 — Create Docker Compose File

Add services:

* web
* api
* postgres
* redis

Define ports:

```
3000 → web
8000 → api
5432 → postgres
6379 → redis
```

Add health checks for postgres and redis services.

---

## TASK-005 — Add Environment File Template

Create:

```
.env.example
```

Include all required variables:

```
DATABASE_URL
REDIS_URL
OPENAI_API_KEY
LLM_MODEL
LLM_MAX_TOKENS
LLM_TEMPERATURE
LLM_CONCURRENCY
LLM_PROVIDER
JWT_SECRET
JWT_ACCESS_EXPIRE_HOURS
JWT_REFRESH_EXPIRE_DAYS
MAX_CSV_SIZE_MB
BENCH_ALERT_DAYS_THRESHOLD
SHORTAGE_SCORE_THRESHOLD
```

---

## TASK-006 — Add Database Volume

Ensure PostgreSQL data persists across container restarts via named Docker volume.

---

# 5. Backend Project Setup

## TASK-007 — Initialize Python Project

Inside:

```
apps/api
```

Create:

```
requirements.txt
```

Include dependencies:

* fastapi
* uvicorn
* pydantic
* pydantic-settings
* sqlalchemy
* alembic
* psycopg2-binary
* redis
* pandas
* python-multipart
* python-jose[cryptography]
* passlib[bcrypt]

---

## TASK-008 — Create FastAPI App Entry

Create:

```
apps/api/app/main.py
```

Initialize FastAPI application with:

* CORS middleware
* router registration
* startup/shutdown events

---

## TASK-009 — Create Health Endpoint

Add route:

```
GET /api/v1/health
```

Return:

```json
{ "status": "ok", "version": "1.0.0" }
```

HTTP status: 200

---

## TASK-010 — Add API Router Structure

Create directories:

```
app/api/v1/routers/
```

Add empty router files:

```
auth.py
engineers.py
projects.py
allocations.py
bench.py
reports.py
dashboard.py
```

Register all routers in main.py.

---

# 6. Backend Core Modules

## TASK-011 — Create Core Configuration Module

Create:

```
app/core/config.py
```

Load all environment variables using pydantic-settings.

---

## TASK-012 — Create Logging Module

Create:

```
app/core/logging.py
```

Implement structured JSON logging with levels: INFO, WARN, ERROR, DEBUG.

---

## TASK-013 — Create Security Module

Create:

```
app/core/security.py
```

Add functions:

* `create_access_token(data: dict) -> str`
* `decode_token(token: str) -> dict`
* `get_current_user(token: str) -> User` (stub)

---

# 7. Database Layer

## TASK-014 — Create Database Connection Module

Create:

```
app/db/database.py
```

Initialize SQLAlchemy async engine and session factory.

---

## TASK-015 — Create ORM Models

Create models for all entities in:

```
app/models/
```

Models:

```
engineer.py   → Engineer
project.py    → Project
allocation.py → Allocation
match_score.py → MatchScore
bench_forecast.py → BenchForecast
user.py       → User
```

All foreign keys and indexes defined per domain-model.md.

---

## TASK-016 — Create Migration Setup

Configure Alembic:

```
alembic init alembic
```

Configure `alembic.ini` and `alembic/env.py` to use project database URL.

---

## TASK-017 — Create Initial Migration

Generate migration that creates all tables:

```
engineers
projects
allocations
match_scores
bench_forecasts
users
```

With all foreign key constraints and indexes defined in domain-model.md.

---

# 8. Backend Schema Layer

## TASK-017b — Create Pydantic Schemas

Create request/response schemas in:

```
app/schemas/
```

Files:

```
engineer.py
project.py
allocation.py
bench_forecast.py
match_score.py
auth.py
dashboard.py
```

Schemas must match api-contract.md response structures.

---

# 9. Backend Service Layer

## TASK-018 — Create Services Directory

```
app/services/
```

---

## TASK-019 — Implement CSVIngestionService Skeleton

Create:

```
app/services/csv_ingestion.py
```

Functions:

```python
async def parse_engineers_csv(file) -> dict
async def parse_projects_csv(file) -> dict
```

Return mock result. Validate MIME type and file size (reject > MAX_CSV_SIZE_MB).

---

## TASK-020 — Implement LLMScoringService Stub

Create:

```
app/services/llm_scoring.py
```

Class: `LLMScoringService`

```python
async def score_engineer_project(engineer: Engineer, project: Project) -> MatchScore
```

Return static mock scoring result. Record `llm_provider` and `model_version` as stubs.

---

## TASK-021 — Implement ConstraintEngine Stub

Create:

```
app/services/constraint_engine.py
```

Functions:

```python
def apply_hard_constraints(engineers, project) -> list
def apply_soft_constraints(engineers, project) -> list
```

---

## TASK-022 — Implement BenchPredictionEngine Stub

Create:

```
app/services/bench_prediction.py
```

Function:

```python
async def predict_bench(engineer: Engineer) -> BenchForecast
```

Return mock forecast. Apply `BENCH_ALERT_DAYS_THRESHOLD` from config (default 30 days).

---

## TASK-023 — Implement AllocationRecommendationOrchestrator

Create:

```
app/services/allocation_orchestrator.py
```

Function:

```python
async def recommend_engineers(project_id: UUID) -> dict
```

Return mock recommendations list.

---

# 10. API Endpoint Implementation

## TASK-024 — Implement Engineers Upload Endpoint

```
POST /api/v1/engineers/upload
```

Accept CSV file. Validate size limit (reject > 10MB with 413). Return stub summary.

---

## TASK-025 — Implement Engineers List Endpoint

```
GET /api/v1/engineers
```

Return mock engineers list matching schema from api-contract.md.

---

## TASK-055 — Implement Engineer Detail Endpoint

```
GET /api/v1/engineers/{id}
```

Return mock engineer detail or 404 if not found.

---

## TASK-026 — Implement Projects Upload Endpoint

```
POST /api/v1/projects/upload
```

Accept CSV file. Validate size limit. Return stub summary.

---

## TASK-027 — Implement Projects List Endpoint

```
GET /api/v1/projects
```

Return mock projects list.

---

## TASK-056 — Implement Project Detail Endpoint

```
GET /api/v1/projects/{id}
```

Return mock project detail or 404 if not found.

---

## TASK-028 — Implement Allocation Recommendation Endpoint

```
POST /api/v1/allocations/recommend
```

Call orchestrator stub. Return recommendations with full score breakdown.

---

## TASK-057 — Implement Get Recommendations Endpoint

```
GET /api/v1/allocations/recommendations/{project_id}
```

Return stored recommendations for a project (mock list).

---

## TASK-029 — Implement Allocation Confirm Endpoint

```
POST /api/v1/allocations/confirm
```

Validate request. Return 201 Created with allocation record. Return 400 if allocation cap would be exceeded.

---

## TASK-058 — Implement Active Allocations Endpoint

```
GET /api/v1/allocations/active
```

Return mock active allocations list.

---

## TASK-030 — Implement Bench Forecast Endpoints

```
GET /api/v1/bench/forecast
GET /api/v1/engineers/{id}/bench-forecast
```

Return mock forecast list and individual engineer forecast.

---

## TASK-059 — Implement Bench Alerts Endpoint

```
GET /api/v1/bench/alerts
```

Return engineers within `BENCH_ALERT_DAYS_THRESHOLD` days of bench (mock data).

---

## TASK-031 — Implement Shortage Report Endpoint

```
GET /api/v1/reports/shortage
```

Return mock shortage list.

---

## TASK-060 — Implement Dashboard Stats Endpoint

```
GET /api/v1/dashboard/stats
```

Return mock aggregate stats:

```json
{
  "total_engineers": 5,
  "engineers_on_bench": 1,
  "active_projects": 3,
  "allocation_rate_percentage": 80
}
```

---

## TASK-054 — Implement Auth Login Endpoint

```
POST /api/v1/auth/login
```

Accept `{ "email": string, "password": string }`.

Return mock JWT token with role field. Return 200 for any valid-format credentials in scaffold phase.

Return 422 for malformed request body.

---

# 11. Redis Integration

## TASK-032 — Add Redis Client Module

Create:

```
app/core/redis.py
```

Initialize Redis connection. Verify connection on startup.

---

## TASK-033 — Add Cache Helper

Implement functions:

```python
async def get_cache(key: str) -> Optional[str]
async def set_cache(key: str, value: str, ttl: int) -> None
```

---

# 12. Frontend Project Setup

## TASK-034 — Initialize Next.js Project

Inside:

```
apps/web
```

Create Next.js application using TypeScript and App Router.

---

## TASK-035 — Install UI Dependencies

Install:

* TailwindCSS
* shadcn/ui
* axios
* @tanstack/react-query

---

## TASK-036 — Create App Layout

Add global layout at:

```
app/layout.tsx
```

Include:

* Sidebar component
* Header component
* Main content area
* QueryClientProvider wrapper

---

# 13. Frontend Page Implementation

## TASK-037 — Implement Dashboard Page

Route: `/dashboard`

Display KPI cards (stub data), bench alert panel, recent allocations table.

---

## TASK-038 — Implement Upload Page

Route: `/upload`

Add CSV upload forms for engineers and projects. Display import result summary.

---

## TASK-039 — Implement Engineers List Page

Route: `/engineers`

Display engineer table with availability badges and "View Details" links.

---

## TASK-061 — Implement Engineer Detail Page

Route: `/engineers/[id]`

Display engineer info card, active allocations, bench forecast panel.

---

## TASK-039b — Implement Projects List Page

Route: `/projects`

Display project table with status badges.

---

## TASK-040 — Implement Project Detail Page

Route: `/projects/[id]`

Display project info, generate recommendations button, recommendations panel.

---

## TASK-041 — Implement Allocation Page

Route: `/allocation`

Show project selector, recommendation cards, confirm allocation flow.

---

## TASK-042 — Implement Bench Forecast Page

Route: `/bench-forecast`

Display forecast table with risk badges and filter.

---

## TASK-043 — Implement Reports Page

Route: `/reports`

Display shortage table with gap indicators, export button.

---

## TASK-062 — Implement Login Page

Route: `/login`

Display email/password form. Call auth login API. Store token. Redirect to `/dashboard` on success.

Add client-side route guard: redirect unauthenticated users to `/login`.

---

# 14. Frontend API Integration

## TASK-044 — Create API Client

Create:

```
lib/api-client.ts
```

Implement Axios instance with base URL and Authorization header injection.

---

## TASK-045 — Create API Service Modules

Create service files:

```
lib/services/auth.ts
lib/services/engineers.ts
lib/services/projects.ts
lib/services/allocations.ts
lib/services/bench.ts
lib/services/reports.ts
lib/services/dashboard.ts
```

---

# 15. Data Seeding

## TASK-046 — Create Seed Script

Create:

```
scripts/seed-data.sh
```

Or Python seed file:

```
apps/api/scripts/seed.py
```

Insert minimum:

* 5 engineers (varied: 2 senior, 2 mid, 1 junior; varied skills and availability)
* 3 projects (1 planned, 1 active, 1 closed)
* 3 allocation records

---

# 16. Logging and Monitoring

## TASK-047 — Add Request Logging Middleware

Log per request:

* method and path
* response status code
* request latency (ms)

---

# 17. Quality Setup

## TASK-048 — Add Lint Configuration

Frontend:

```
.eslintrc.json
.prettierrc
```

Backend:

```
pyproject.toml (Black + Ruff config)
```

---

## TASK-049 — Add Type Checking

Frontend:

```
tsconfig.json (strict: true)
```

Verify `tsc --noEmit` passes with zero errors.

Backend: ensure all service and router functions have complete type hints.

---

# 18. CI Pipeline

## TASK-050 — Create CI Workflow

Create GitHub Actions workflow at:

```
.github/workflows/ci.yml
```

Pipeline must run:

* lint (frontend ESLint + backend Ruff)
* typecheck (frontend tsc)
* build (frontend next build)
* tests (backend: pytest)

---

# 19. Final Validation

## TASK-051 — Verify Local Startup

Ensure:

```
docker compose up
```

successfully starts all services and all health checks pass.

---

## TASK-052 — Verify Frontend Routes

All pages render without runtime errors:

```
/login, /dashboard, /engineers, /engineers/[id],
/upload, /projects, /projects/[id],
/allocation, /bench-forecast, /reports
```

---

## TASK-053 — Verify API Endpoints

All endpoints respond with expected HTTP status codes as per ac-source-base.md AC-SB-9.

---

# 20. Phase 5 Completion Definition

Phase 5 implementation is complete when:

* all tasks above are finished
* system runs locally via Docker Compose
* all UI pages render
* all API endpoints exist with correct status codes
* database migrations run and tables exist
* seed data populated and visible
* CSV upload rejects files over 10MB
* docker environment works
* lint and typecheck pass
* CI pipeline runs successfully
* repository structure matches architecture spec
