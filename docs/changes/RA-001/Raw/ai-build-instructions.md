# ai-build-instructions.md

## AI Build Instructions — Source Base Generation

AI Smart Resource Allocation & Bench Prediction System

This document provides **structured instructions for an AI coding agent** (Claude Code, Cursor, Codex, etc.) to generate the **initial source base** of the system using the existing specification pack.

The AI must treat the following documents as **source-of-truth specifications**:

* `source-base-architecture.md`
* `domain-model.md`
* `api-contract.md`
* `ui-screen-spec.md`
* `source-base-repo-structure.md`
* `ac-source-base.md`
* `implementation-task-breakdown.md`
* `open-issues.md`

The AI **must not invent architecture decisions that contradict these documents**.

---

# 1. Objective

The objective is to generate a **working source base scaffold** that:

* matches the architecture specification
* satisfies all acceptance criteria in `ac-source-base.md`
* follows the repository structure
* implements stub APIs with correct HTTP status codes
* implements all UI pages including /engineers, /engineers/[id], and /login
* runs locally using Docker Compose

The output should be a **complete repository skeleton** ready for further development.

---

# 2. Implementation Constraints

The AI agent must follow these constraints:

### Architecture

Follow strictly:

```
Frontend → Next.js (App Router)
Backend  → Python FastAPI
Database → PostgreSQL (SQLAlchemy + Alembic)
Cache    → Redis
Auth     → JWT (stub in Phase 5)
```

### Repository Layout

The project must follow the monorepo structure defined in:

```
source-base-repo-structure.md
```

### API

All endpoints must match definitions in:

```
api-contract.md
```

This includes the `POST /api/v1/auth/login` endpoint and `GET /api/v1/dashboard/stats`.

### Domain Entities

All database models must match:

```
domain-model.md
```

All fields including `updated_at`, `status` on Allocation, `llm_provider` on MatchScore must be present.

### UI Routes

All UI routes must match:

```
ui-screen-spec.md
```

Including `/engineers`, `/engineers/[id]`, and `/login`.

---

# 3. Build Sequence

The AI must execute the implementation tasks in the **exact order defined in**:

```
implementation-task-breakdown.md
```

This ensures dependencies are respected.

---

# 4. Repository Generation Rules

## Rule 1 — Do Not Skip Steps

The AI must implement tasks sequentially.

Do not jump directly to generating full application code.

---

## Rule 2 — Stub Logic First

When functionality is complex (e.g., LLM scoring):

Implement **stub functions** returning mock values.

Example stub response:

```json
{
  "overall_score": 0.88,
  "skill_match_score": 0.92,
  "level_match_score": 0.85,
  "availability_score": 0.90,
  "recommended": true,
  "explanation": "Mock recommendation",
  "risk_notes": "None"
}
```

---

## Rule 3 — Thin Controllers

API routes must be thin.

All logic must exist in service layer modules.

Route handlers must only:

* parse request
* call service function
* return response

---

## Rule 4 — Use Dependency Injection

FastAPI dependencies must be used for:

* database session
* configuration settings
* current user (auth dependency)

---

## Rule 5 — Follow Naming Conventions

### Python

```
snake_case for variables, functions, files
PascalCase for classes
```

### TypeScript

```
camelCase for variables and functions
```

### React Components

```
PascalCase for component names and files
```

### API Routes

```
kebab-case for URL path segments
```

---

## Rule 6 — HTTP Status Codes

All endpoints must return the correct HTTP status code:

* `200 OK` — successful GET or action
* `201 Created` — successful resource creation
* `400 Bad Request` — validation or business rule failure
* `401 Unauthorized` — missing or invalid token
* `404 Not Found` — resource does not exist
* `413 Payload Too Large` — CSV upload exceeds size limit
* `422 Unprocessable Entity` — malformed request body

---

## Rule 7 — Error Response Format

All error responses must use the standardized format:

```json
{
  "error": {
    "code": "snake_case_error_code",
    "message": "Human-readable description"
  }
}
```

Do not use FastAPI default validation error format directly — wrap it in the standardized format.

---

# 5. Frontend Implementation Rules

The AI must:

* use **Next.js App Router**
* use **TypeScript** with strict mode
* use **TailwindCSS** for all styling
* install and use **shadcn/ui** components

---

## Layout

Application layout must include:

* Sidebar with all nav links
* Header with user info placeholder
* Main content area

---

## UI Pages

The AI must generate pages for all routes:

```
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

Each page must include:

* loading state (skeleton)
* empty state message
* error state with retry

---

## Auth Guard

The frontend must redirect unauthenticated users to `/login`.

Implementation: client-side check for token in localStorage or cookie.

The `/login` page must be accessible without auth.

---

# 6. Backend Implementation Rules

Backend must be implemented using:

```
FastAPI (async)
```

Directory structure must follow:

```
apps/api/app/
```

All modules must exist:

```
services/
repositories/
schemas/
models/
api/v1/routers/
core/
db/
```

---

## API Routing

Routes must be grouped by domain:

```
auth
engineers
projects
allocations
bench
reports
dashboard
```

All router files must be registered in `main.py`.

---

# 7. LLM Integration Rule

LLM functionality must be implemented as **service layer stubs**.

Do not integrate real LLM APIs in the scaffold phase.

Class: `LLMScoringService`

Method must record `llm_provider` and `model_version` as stub values.

---

# 8. Database Setup Rules

Database tables must match `domain-model.md`.

Tables include:

```
engineers
projects
allocations
match_scores
bench_forecasts
users
```

Foreign keys must be defined.

Indexes must be defined per domain-model.md Section 9.

Migration tool: Alembic.

---

# 9. Redis Usage

Redis must be used for:

* scoring cache
* engineer availability cache
* forecast cache

Redis connection must be verified at application startup.

Actual caching logic may be minimal in scaffold stage but the connection must succeed.

---

# 10. CSV Upload Handling

Upload endpoints must:

* accept `multipart/form-data` with `file` field
* validate MIME type
* reject files larger than `MAX_CSV_SIZE_MB` with HTTP 413
* parse using Pandas (stub — no real upsert in Phase 5)
* return import summary with correct structure

---

# 11. Environment Configuration

The repository must include:

```
.env.example
```

Variables required:

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

Backend must load all variables via `app/core/config.py` using pydantic-settings.

---

# 12. Logging Rules

Backend must implement structured JSON logging.

Log events must include:

* request start and end (with latency)
* error events
* allocation events
* CSV ingestion events

No PII in log output.

---

# 13. Local Development Environment

The generated repository must support:

```
docker compose up
```

Required services:

```
web
api
postgres
redis
```

All services must have health checks.

---

# 14. Code Quality Requirements

### Frontend

```
ESLint (configured)
Prettier (configured)
TypeScript strict mode
tsc --noEmit must pass with zero errors
```

### Backend

```
Black (configured in pyproject.toml)
Ruff (configured in pyproject.toml)
Python type hints on all public functions
```

---

# 15. CI Pipeline

The repository must include CI workflow at:

```
.github/workflows/ci.yml
```

Pipeline must run:

```
lint (ESLint + Ruff)
typecheck (tsc --noEmit)
build (next build)
tests (pytest)
```

---

# 16. Validation Checklist

Before considering the build complete, the AI must verify:

### Application Startup

```
docker compose up
```

All services must start and health checks must pass.

---

### Frontend

Routes load successfully:

```
/login
/dashboard
/engineers
/projects
/allocation
```

tsc --noEmit passes.

---

### Backend

All endpoints respond with expected status codes:

```
GET  /api/v1/health          → 200
POST /api/v1/auth/login      → 200
GET  /api/v1/engineers       → 200
GET  /api/v1/dashboard/stats → 200
GET  /api/v1/bench/alerts    → 200
```

---

### Database

All tables exist. Migrations run successfully. Seed data visible via API.

---

### Redis

Connection is successful on startup.

---

# 17. Deliverable

The final output must be a repository with the structure:

```
repo-root/
  apps/
    web/
    api/
  packages/
    shared/
  infra/
    docker/
    terraform/
    scripts/
  docs/
    architecture/
    changes/
    standards/
  scripts/
  docker-compose.yml
  .env.example
  README.md
```

---

# 18. Forbidden Actions

The AI must **NOT**:

* invent new architecture patterns not in the spec
* change the tech stack
* remove required API endpoints
* skip the database schema
* skip environment configuration
* implement features not defined in spec
* omit the /login, /engineers, or /engineers/[id] routes
* omit the `POST /api/v1/auth/login` endpoint
* omit the `GET /api/v1/dashboard/stats` endpoint
* omit the `GET /api/v1/bench/alerts` endpoint
* omit the `GET /api/v1/allocations/recommendations/{project_id}` endpoint
* implement real LLM calls in Phase 5

---

# 19. Completion Criteria

The build is considered complete when:

1. repository compiles without errors
2. services start with Docker Compose
3. all frontend routes render
4. all API endpoints exist with correct status codes
5. database schema exists with all tables and foreign keys
6. Redis connects successfully
7. CSV upload rejects files over 10MB
8. auth stub endpoint works
9. seed data populated
10. lint and typecheck pass
11. repository matches specification pack structure

---

# 20. Future Phases

Later phases will implement:

* real LLM scoring
* constraint engine logic
* bench forecast algorithm
* allocation optimization
* production authentication
* observability stack (Prometheus + Grafana)
* pagination and filtering
* OpenAPI type generation for frontend

These features are **not required in the scaffold phase**.
