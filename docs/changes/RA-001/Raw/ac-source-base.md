# ac-source-base.md

## Acceptance Criteria — Source Base Scaffold (Phase 5)

This document defines the **Acceptance Criteria (AC)** required for Phase 5 to generate the initial **source base scaffold** of the AI Smart Resource Allocation & Bench Prediction System.

These criteria ensure the generated codebase is **structurally correct, runnable locally, and aligned with the architecture specification.**

---

# 1. Local Environment Setup

### AC-SB-1 — Docker Compose Startup

Running:

```
docker compose up
```

must successfully start the following services:

* web (Next.js)
* api (FastAPI)
* postgres
* redis

All services must reach a healthy state.

---

### AC-SB-2 — Application Access

After startup:

* frontend must be reachable at:

```
http://localhost:3000
```

* backend API must be reachable at:

```
http://localhost:8000
```

---

### AC-SB-3 — Backend Health Endpoint

Backend must expose:

```
GET /api/v1/health
```

Expected response `200 OK`:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

# 2. Frontend Application Scaffold

### AC-SB-4 — Route Structure Exists

The following routes must exist in the Next.js application:

```
/dashboard
/engineers
/engineers/[id]
/upload
/projects
/projects/[id]
/allocation
/bench-forecast
/reports
/login
```

Pages may contain placeholder content but must render successfully without runtime errors.

---

### AC-SB-5 — Application Layout

Frontend must include:

* global layout component
* sidebar navigation
* header with user info placeholder
* content container

Sidebar must include links to:

* Dashboard
* Engineers
* Upload Data
* Projects
* Allocation
* Bench Forecast
* Reports

---

### AC-SB-6 — UI Component System

The frontend must include:

* TailwindCSS configured
* shadcn/ui installed
* shared component directory at `components/`

Minimum required components:

```
Card
Table
Button
Modal / Dialog
Form inputs
Badge
Skeleton (loading state)
```

---

# 3. Backend API Scaffold

### AC-SB-7 — FastAPI Application Boot

FastAPI application must start successfully and expose:

```
/api/v1
```

API documentation must be available at:

```
/docs
```

---

### AC-SB-8 — Core API Routers Registered

The following router groups must exist and be registered:

```
auth
engineers
projects
allocations
bench
reports
dashboard
```

---

### AC-SB-9 — API Stub Endpoints

The following endpoints must exist and return stub responses with correct HTTP status codes:

#### Auth

```
POST /api/v1/auth/login          → 200 OK (mock token)
```

#### Engineers

```
POST /api/v1/engineers/upload    → 200 OK
GET  /api/v1/engineers           → 200 OK (list)
GET  /api/v1/engineers/{id}      → 200 OK (detail) or 404
GET  /api/v1/engineers/{id}/bench-forecast → 200 OK
```

#### Projects

```
POST /api/v1/projects/upload     → 200 OK
GET  /api/v1/projects            → 200 OK (list)
GET  /api/v1/projects/{id}       → 200 OK (detail) or 404
```

#### Allocations

```
POST /api/v1/allocations/recommend                      → 200 OK
GET  /api/v1/allocations/recommendations/{project_id}   → 200 OK
POST /api/v1/allocations/confirm                        → 201 Created
GET  /api/v1/allocations/active                         → 200 OK
```

#### Bench

```
GET /api/v1/bench/forecast       → 200 OK (list)
GET /api/v1/bench/alerts         → 200 OK (list)
```

#### Reports

```
GET /api/v1/reports/shortage     → 200 OK (list)
```

#### Dashboard

```
GET /api/v1/dashboard/stats      → 200 OK
```

All endpoints may return **mock data** in Phase 5.

---

# 4. Database Initialization

### AC-SB-10 — Database Schema Migration

Database must initialize all required tables:

```
engineers
projects
allocations
match_scores
bench_forecasts
users
```

Migration tool must be configured (Alembic).

All foreign key relationships must be defined in the migration.

---

### AC-SB-11 — Seed Data

Seed script must insert minimum:

* 5 example engineers (varied levels, skills, and availability)
* 3 example projects (varied status)
* 3 example allocation records

Frontend must be able to display these records from the API.

---

# 5. CSV Upload Scaffold

### AC-SB-12 — Upload Endpoint Behavior

CSV upload endpoints must:

* accept `multipart/form-data` with a `file` field
* return stub response:

```json
{
  "inserted": 0,
  "updated": 0,
  "skipped": 0,
  "errors": []
}
```

### AC-SB-20 — CSV File Size Limit

Upload endpoints must reject files exceeding 10MB with:

```
HTTP 413 Payload Too Large
```

```json
{
  "error": {
    "code": "file_too_large",
    "message": "CSV file must not exceed 10MB"
  }
}
```

---

# 6. LLM Integration Placeholder

### AC-SB-13 — LLM Service Stub

A service placeholder must exist at:

```
app/services/llm_scoring.py
```

Class: `LLMScoringService`

Method signature:

```python
async def score_engineer_project(engineer: Engineer, project: Project) -> MatchScore
```

Returns mock scoring response with static values.

---

# 7. Redis Integration

### AC-SB-14 — Redis Client

Redis client must be configured and connected.

Connection must be verified at startup.

Example placeholder operations:

* `set_cache(key, value, ttl)`
* `get_cache(key)`

Actual caching logic may be placeholder stubs.

---

# 8. Logging Baseline

### AC-SB-15 — Structured Logging

Backend must implement structured JSON logging.

Log categories must include:

* request start / end (method, path, status, latency)
* allocation events
* CSV ingestion events
* LLM scoring events (stubbed)
* error events

---

# 9. Code Quality

### AC-SB-16 — Lint and Format

Repository must include configured:

* ESLint (frontend)
* Prettier (frontend)
* Black or Ruff (backend)

Running lint commands must produce zero errors on the scaffold code.

---

### AC-SB-17 — Type Checking

Frontend must pass:

```
tsc --noEmit
```

with zero errors.

Backend must include type hints on all function signatures in service and router modules.

---

# 10. CI Baseline

### AC-SB-18 — CI Workflow

Repository must include CI pipeline (GitHub Actions or equivalent) executing:

* lint (frontend + backend)
* typecheck (frontend)
* build (frontend)
* tests (backend: pytest)

---

# 11. Authentication Stub

### AC-SB-19 — Auth Stub Endpoint

`POST /api/v1/auth/login` must:

* accept `{ "email": string, "password": string }` body
* return a static mock JWT token
* return `200 OK` for any credentials in scaffold phase
* return standardized error format if body is malformed

The `/login` route must render and be accessible without authentication.

All other routes must redirect to `/login` if no token is present in the frontend (client-side guard is sufficient for scaffold).

---

# 12. Completion Definition

Phase 5 scaffold is considered **complete** when:

* all services run locally via Docker Compose
* all routes render without runtime errors
* all API endpoints respond with correct HTTP status codes
* database migrations run and tables exist
* seed data is inserted and visible via API
* frontend and backend communicate
* CSV upload endpoints reject oversized files
* repository structure matches architecture spec
* no lint or type check errors
* CI pipeline runs successfully
