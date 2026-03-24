# spec-pack.md — RA-001 Specification Pack

**Ticket:** RA-001
**Feature:** AI Smart Resource Allocation & Bench Prediction System — Scaffold Phase
**Version:** 1.1.0
**Date:** 2026-03-24
**Updated:** 2026-03-24 — OI-01 and OI-14 resolved by human sign-off
**Status:** READY FOR IMPLEMENTATION
**Sources:** `docs/changes/RA-001/sources.md` → `Raw/`

---

## 1. Background / Purpose

### 1.1 Problem Statement

Engineering managers currently allocate engineers to projects manually, relying on spreadsheets and personal knowledge. This process has the following problems:

- Skill matching is subjective and inconsistent
- Bench risk (engineers becoming idle) is detected too late
- No systematic way to identify skill shortages across a project portfolio
- Workforce utilization data is unavailable in real time

### 1.2 Purpose of RA-001

RA-001 establishes the **runnable scaffold** for a system that addresses the above problems. The scaffold is not yet a production system — it is the complete skeleton that:

- Defines the architecture, data model, and API contract for all future phases
- Runs locally end-to-end (frontend + backend + database + cache)
- Contains stub implementations wherever real logic requires decisions not yet made
- Provides a test-ready baseline with CI, linting, and type checking

### 1.3 Intended Outcome

After RA-001 is complete:
- All system components run via `docker compose up`
- All 10 UI routes render without errors
- All 23 API endpoints respond with correct HTTP status codes (stub data)
- Database schema is initialized and seeded
- The system is ready for Phase 2 feature implementation

---

## 2. Scope

### 2.1 In Scope

| Category | What is included |
|----------|-----------------|
| Infrastructure | Docker Compose setup for web, api, postgres, redis |
| Frontend | 10 UI routes (Next.js App Router, placeholder content) |
| Frontend | Global layout with sidebar navigation |
| Frontend | shadcn/ui component library configured |
| Backend | FastAPI application with 7 router groups |
| Backend | 23 stub API endpoints with correct HTTP status codes |
| Backend | CSV upload endpoints (multipart/form-data, 10MB limit) |
| Backend | Mock JWT authentication endpoint |
| Backend | LLMScoringService stub (no real LLM calls) |
| Backend | Redis client placeholder |
| Database | PostgreSQL schema via Alembic migrations (6 tables) |
| Database | Seed data (5 engineers, 3 projects, 3 allocations) |
| Logging | Structured JSON logging, 8 event categories |
| Quality | ESLint + Prettier (frontend), Black/Ruff (backend) |
| Quality | TypeScript strict mode, Python type hints |
| CI | GitHub Actions: lint + typecheck + build + tests |

### 2.2 Out of Scope

| Category | What is excluded | Future phase |
|----------|-----------------|-------------|
| Authentication | Real JWT with user verification | Phase 2+ |
| LLM calls | Real LLM provider API calls | Phase 3+ |
| Scoring logic | Real constraint engine, fallback scoring | Phase 3 |
| Bench prediction | Real BenchPredictionEngine logic | Phase 3 |
| Pagination/Filtering | All list endpoints return all records | Phase 2 |
| Object storage | CSV files processed in-memory only | Phase 3+ |
| Rate limiting | No endpoint rate limiting | Phase 4+ |
| Multi-organization | Single organization only | Out of scope |
| Internationalization | English only | Out of scope |
| Real-time notifications | No WebSocket/SSE | Phase 4+ |
| Advanced ML forecasting | No ML models | Phase 5+ |

---

## 3. Terminology

| Term | Definition |
|------|-----------|
| **Scaffold** | The initial runnable skeleton of the system with stub implementations — not yet production-ready |
| **Stub** | A function or endpoint that returns mock/static data without real business logic |
| **Engineer** | A software engineer who can be allocated to projects. Identified by UUID. |
| **Project** | A work engagement that requires engineers with specific skills for a defined period |
| **Allocation** | An assignment of an Engineer to a Project for a percentage of their time |
| **Bench** | The state of an engineer who has no current project allocation (idle) |
| **Bench Alert** | A notification that an engineer is predicted to become benched within `BENCH_ALERT_DAYS_THRESHOLD` days |
| **BenchForecast** | A prediction record for an engineer's bench risk at a specific date |
| **MatchScore** | The AI-generated compatibility score between an Engineer and a Project |
| **LLMScoringService** | The service responsible for calling an LLM to compute MatchScores |
| **ConstraintEngine** | The service that applies hard and soft constraints to filter/rank allocation candidates |
| **BenchPredictionEngine** | The service that computes BenchForecasts based on allocation end dates |
| **CSVIngestionService** | The service that parses, validates, and upserts engineer/project data from CSV files |
| **overall_score** | Composite score (0.0–1.0) combining skill_match, level_match, and availability scores |
| **Role** | User permission level: `admin`, `manager`, or `viewer` |
| **Mock JWT** | A stub auth token accepted for any credentials — used in scaffold only |
| **BENCH_ALERT_DAYS_THRESHOLD** | Environment variable; default 30. Alert fires when `bench_start_date` is within this many days |
| **Phase 5 / Phase 1** | Both terms appear in Raw/ documents and refer to the same deliverable: this scaffold |

---

## 4. As-Is / To-Be

### 4.1 As-Is (Current State)

- No system exists
- Engineer allocation is managed manually (spreadsheets, email)
- Bench risk is identified reactively (after engineer becomes idle)
- No skill shortage visibility
- Repository is empty (0 commits)

### 4.2 To-Be (After RA-001)

| Dimension | State after RA-001 |
|-----------|-------------------|
| Repository | Monorepo with `apps/web/`, `apps/api/`, `packages/shared/`, `infra/` |
| Local environment | `docker compose up` starts all 4 services (web, api, postgres, redis) |
| Frontend | 10 routes accessible at `localhost:3000`, global layout with sidebar |
| Backend | FastAPI at `localhost:8000`, `/docs` available, 23 stub endpoints responding |
| Database | 6 tables initialized, seed data loaded (5 engineers, 3 projects, 3 allocations) |
| Auth | Mock JWT: any credentials → static token (scaffold only) |
| LLM | LLMScoringService exists as stub (no real calls) |
| Data ingestion | CSV upload endpoints accept files up to 10MB, return stub response |
| Logging | All 8 event categories logged in structured JSON |
| Code quality | Zero lint errors, zero TypeScript errors |
| CI | Pipeline passes: lint + typecheck + build + pytest |

---

## 5. Detailed Specification

### 5.1 Domain Model

**Entities and key fields:**

#### Engineer
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| name | string | not null, max 255 |
| email | string | unique, not null |
| primary_skill | string | not null |
| secondary_skills | string[] | nullable |
| level | enum | junior / mid / senior |
| availability_percentage | int | 0–100 |
| bench_start_date | date | nullable |

#### Project
| Field | Type | Constraint |
|-------|------|-----------|
| id | UUID | PK |
| name | string | not null |
| required_skills | string[] | not null |
| required_level | enum | junior / mid / senior |
| start_date / end_date | date | both required |
| allocation_slots | int | min 1 |
| status | enum | planned / active / closed |

#### Allocation
| Field | Type | Constraint |
|-------|------|-----------|
| engineer_id | UUID | FK → engineers |
| project_id | UUID | FK → projects |
| allocation_percentage | int | 1–100 |
| status | enum | active / completed / cancelled |

**Domain Constraints:**
- Sum of `allocation_percentage` for active allocations per engineer ≤ 100
- Allocation dates must fall within project dates
- All MatchScore fields: range [0.0, 1.0]
- BenchForecast triggered when `bench_start_date` within `BENCH_ALERT_DAYS_THRESHOLD` days (default: 30)

*Full schema: `Raw/domain-model.md`*

---

### 5.2 API Contract Summary

Base URL: `/api/v1`
Authentication: `Authorization: Bearer <JWT>` (stub in scaffold)

| Group | Method | Path | Status (scaffold) |
|-------|--------|------|-------------------|
| Health | GET | `/health` | 200 |
| Auth | POST | `/auth/login` | 200 (mock token) |
| Engineers | POST | `/engineers/upload` | 200 |
| Engineers | GET | `/engineers` | 200 (list) |
| Engineers | GET | `/engineers/{id}` | 200 / 404 |
| Engineers | GET | `/engineers/{id}/bench-forecast` | 200 |
| Projects | POST | `/projects/upload` | 200 |
| Projects | GET | `/projects` | 200 (list) |
| Projects | GET | `/projects/{id}` | 200 / 404 |
| Allocations | POST | `/allocations/recommend` | 200 |
| Allocations | GET | `/allocations/recommendations/{project_id}` | 200 |
| Allocations | POST | `/allocations/confirm` | 201 |
| Allocations | GET | `/allocations/active` | 200 |
| Bench | GET | `/bench/forecast` | 200 |
| Bench | GET | `/bench/alerts` | 200 |
| Reports | GET | `/reports/shortage` | 200 |
| Dashboard | GET | `/dashboard/stats` | 200 |

All endpoints may return mock data in scaffold phase.

Error format (all errors):
```json
{
  "error": {
    "code": "<error_code>",
    "message": "<human_readable_message>"
  }
}
```

*Full schema with request/response bodies: `Raw/api-contract.md`*

---

### 5.3 UI Screens

| Route | Purpose | Required components | Role access |
|-------|---------|---------------------|-------------|
| `/login` | Authentication | Email + password form | Public |
| `/dashboard` | KPI overview | Stats cards, active allocations, bench alerts | All roles |
| `/engineers` | Engineer list | Table with filters | All roles |
| `/engineers/[id]` | Engineer detail + bench forecast | Detail card, forecast table | All roles |
| `/upload` | CSV data upload | File input, upload status | Admin, Manager |
| `/projects` | Project list | Table | All roles |
| `/projects/[id]` | Project detail + recommendations | Detail card, recommendations table | All roles |
| `/allocation` | Allocation management | Recommendation list, confirm action | Manager, Admin |
| `/bench-forecast` | Bench risk list | Table with risk levels | Manager, Admin |
| `/reports` | Shortage reports | Table | Manager, Admin |

Client-side route guard: all routes except `/login` redirect to `/login` if no token present.

*Full screen spec with component details: `Raw/ui-screen-spec.md`*

---

### 5.4 Repository Structure

```
repo-root/
  apps/
    web/                    ← Next.js frontend
    api/                    ← FastAPI backend
  packages/
    shared/src/
      contracts/
      types/
      constants/
  infra/
    docker/
  docs/
  docker-compose.yml
  README.md
```

*Full structure: `Raw/source-base-repo-structure.md`*

---

## 6. Non-Functional Requirements

| # | Category | Requirement |
|---|----------|-------------|
| NFR-1 | Availability | All 4 services must reach healthy state via `docker compose up` |
| NFR-2 | Response codes | All stub endpoints must return correct HTTP status codes (not 500) |
| NFR-3 | File size limit | CSV upload must reject files > 10MB with HTTP 413 |
| NFR-4 | Logging | 8 log event categories must be emitted in structured JSON, no PII |
| NFR-5 | Code quality | Zero lint errors (ESLint + Black/Ruff); zero TypeScript errors (`tsc --noEmit`) |
| NFR-6 | Type safety | Python type hints on all public function signatures in services and routers |
| NFR-7 | CI | GitHub Actions pipeline must complete without failures |
| NFR-8 | Security | No secrets hardcoded; all sensitive config via environment variables only |
| NFR-9 | Security | No PII (engineer email, user email) in log output |
| NFR-10 | Caching | Redis TTLs: LLM scores 24h, bench forecast 1h, engineer list 5m, project requirements 30m |

---

## 7. Acceptance Criteria

All AC must be verifiable independently.

### Infrastructure

**AC-1** (= AC-SB-1) — Running `docker compose up` successfully starts web, api, postgres, and redis services, all reaching a healthy state.

**AC-2** (= AC-SB-2) — After startup, the frontend is reachable at `http://localhost:3000` and the backend API is reachable at `http://localhost:8000`.

**AC-3** (= AC-SB-3) — `GET /api/v1/health` returns `200 OK` with body `{"status": "ok", "version": "1.0.0"}`.

### Frontend

**AC-4** (= AC-SB-4) — All 10 routes exist in the Next.js application (`/dashboard`, `/engineers`, `/engineers/[id]`, `/upload`, `/projects`, `/projects/[id]`, `/allocation`, `/bench-forecast`, `/reports`, `/login`) and render without runtime errors.

**AC-5** (= AC-SB-5) — Frontend includes a global layout with sidebar navigation containing links to: Dashboard, Engineers, Upload Data, Projects, Allocation, Bench Forecast, Reports; and a header with user info placeholder.

**AC-6** (= AC-SB-6) — TailwindCSS is configured, shadcn/ui is installed, and the following components exist: Card, Table, Button, Modal/Dialog, Form inputs, Badge, Skeleton.

### Backend

**AC-7** (= AC-SB-7) — FastAPI application starts and exposes `/api/v1`; API documentation is available at `/docs`.

**AC-8** (= AC-SB-8) — The following router groups are registered: `auth`, `engineers`, `projects`, `allocations`, `bench`, `reports`, `dashboard`.

**AC-9** (= AC-SB-9) — All 17 stub endpoints listed in Section 5.2 exist and return the specified HTTP status codes. Endpoints may return mock data.

### Database

**AC-10** (= AC-SB-10) — Database initializes all 6 tables (`engineers`, `projects`, `allocations`, `match_scores`, `bench_forecasts`, `users`) via Alembic migrations. All foreign key relationships are defined.

**AC-11** (= AC-SB-11) — Seed script inserts at minimum: 5 engineers (varied levels, skills, availability), 3 projects (varied status), 3 allocation records. Records are visible via the API.

### CSV Upload

**AC-12** (= AC-SB-12) — CSV upload endpoints accept `multipart/form-data` with a `file` field and return the stub response: `{"inserted": 0, "updated": 0, "skipped": 0, "errors": []}`.

**AC-20** (= AC-SB-20) — CSV upload endpoints reject files exceeding 10MB with `HTTP 413` and body `{"error": {"code": "file_too_large", "message": "CSV file must not exceed 10MB"}}`.

### Services

**AC-13** (= AC-SB-13) — `LLMScoringService` exists at `app/services/llm_scoring.py` with class `LLMScoringService` implementing `async def score_engineer_project(engineer: Engineer, project: Project) -> MatchScore` returning mock static values.

**AC-14** (= AC-SB-14) — Redis client is configured, connected, and connection is verified at startup. Placeholder operations `set_cache(key, value, ttl)` and `get_cache(key)` exist.

### Logging

**AC-15** (= AC-SB-15) — Backend emits structured JSON logs for: request start/end (method, path, status, latency), allocation events, CSV ingestion events, LLM scoring events (stubbed), and error events. No PII in log output.

### Code Quality

**AC-16** (= AC-SB-16) — ESLint (frontend) and Black/Ruff (backend) are configured; running lint commands produces zero errors on scaffold code.

**AC-17** (= AC-SB-17) — `tsc --noEmit` passes with zero errors. All Python service and router functions have type hints.

### CI

**AC-18** (= AC-SB-18) — CI pipeline (GitHub Actions or equivalent) executes lint (frontend + backend), typecheck (frontend), build (frontend), and tests (backend: pytest) without failures.

### Authentication

**AC-19** (= AC-SB-19) — `POST /api/v1/auth/login` accepts `{"email": string, "password": string}`, returns a static mock JWT token with `200 OK` for any credentials, returns standardized error format for malformed body. The `/login` route renders without authentication. All other routes redirect to `/login` when no token is present (client-side guard).

---

## 8. Examples

### Normal Cases

**NC-1: Engineer CSV upload — successful stub response**

```
Request:
  POST /api/v1/engineers/upload
  Content-Type: multipart/form-data
  Body: file=engineers.csv (valid CSV, 500KB)

Expected response:
  HTTP 200 OK
  {
    "inserted": 0,
    "updated": 0,
    "skipped": 0,
    "errors": []
  }
```

**NC-2: List engineers — seed data visible**

```
Request:
  GET /api/v1/engineers
  Authorization: Bearer <any_mock_token>

Expected response:
  HTTP 200 OK
  [
    {
      "id": "<uuid>",
      "name": "Alice Chen",
      "email": "alice@example.com",
      "primary_skill": "Python",
      "level": "senior",
      "availability_percentage": 100,
      ...
    },
    ... (≥5 records from seed data)
  ]
```

---

### Abnormal Cases

**AB-1: CSV upload exceeds 10MB file size limit**

```
Request:
  POST /api/v1/engineers/upload
  Content-Type: multipart/form-data
  Body: file=large_file.csv (11MB)

Expected response:
  HTTP 413 Payload Too Large
  {
    "error": {
      "code": "file_too_large",
      "message": "CSV file must not exceed 10MB"
    }
  }
```

**AB-2: Engineer detail — non-existent ID**

```
Request:
  GET /api/v1/engineers/00000000-0000-0000-0000-000000000000
  Authorization: Bearer <any_mock_token>

Expected response:
  HTTP 404 Not Found
  {
    "error": {
      "code": "not_found",
      "message": "Engineer not found"
    }
  }
```

---

### Boundary Cases

**BV-1: CSV upload at exactly 10MB — accepted**

```
Request:
  POST /api/v1/engineers/upload
  Content-Type: multipart/form-data
  Body: file=exactly_10mb.csv (10,485,760 bytes = exactly 10MB)

Expected response:
  HTTP 200 OK    ← NOT 413; file at limit is accepted
  {
    "inserted": 0,
    "updated": 0,
    "skipped": 0,
    "errors": []
  }

Boundary rule: Reject ONLY if file size > 10MB. Size = 10MB is accepted.
```

**BV-2: Bench alert at exactly BENCH_ALERT_DAYS_THRESHOLD = 30 days**

```
Context:
  Today = 2026-04-24
  Engineer.bench_start_date = 2026-05-24  (exactly 30 days from today)
  BENCH_ALERT_DAYS_THRESHOLD = 30

Expected behavior:
  BenchForecast IS generated (alert fires)
  GET /api/v1/bench/alerts → includes this engineer

Boundary rule: "within 30 days" means bench_start_date - today ≤ 30 days (inclusive).
  If bench_start_date - today = 31 → no alert
  If bench_start_date - today = 30 → alert fires ← this case
  If bench_start_date - today = 0 → alert fires
```

---

## 9. Open Issues

Issues that are UNRESOLVED must be decided by a human before implementation proceeds for the affected components.

### OI-01 — Authentication Strategy `[DECIDED]`

| Field | Value |
|-------|-------|
| Status | **DECIDED** — 2026-03-24 |
| Blocking | Resolved |
| Decision | **Option A: Mock JWT only** — Any credentials are accepted; a static token is returned. No user DB lookup, no token verification. The `/login` page must work and allow entering the system. |
| Rationale | Scaffold phase only; real auth is out of scope and will be addressed in a later phase. |
| Constraint | Login UI must render and accept input; on submit, call `POST /auth/login` and receive mock token → redirect to `/dashboard`. |
| Deferred | Full auth strategy (Option B or C) is deferred to Phase 2+. |

---

### OI-14 — Bench Alert Threshold Definition `[DECIDED]`

| Field | Value |
|-------|-------|
| Status | **DECIDED** — 2026-03-24 |
| Blocking | Resolved |
| Decision Q1 | **`BENCH_ALERT_DAYS_THRESHOLD = 30` is confirmed.** Default value is 30 days, configurable via env var. |
| Decision Q2 | **Not needed for scaffold.** Trigger condition logic is deferred; `BenchPredictionEngine` is a stub in Phase 5 and does not need to implement real alert triggering. |
| Constraint | Seed data may include an engineer with `bench_start_date` within 30 days to demonstrate the data structure. No real alert logic is required. |

---

### OI-15 — Dashboard KPI Data Source `[NON-BLOCKING]`

| Field | Value |
|-------|-------|
| Status | UNRESOLVED |
| Blocking | NO — can proceed with stub endpoint |
| Question | Which endpoint provides "Total Engineers", "Active Projects", "Allocation Rate %"? |
| Scaffold assumption | `GET /api/v1/dashboard/stats` returns stub mock counts |
| **Decision needed** | Confirm stub approach OK; define real response schema for Phase 2 |

---

### OI-02 — Object Storage for CSV Files `[NON-BLOCKING]`

| Field | Value |
|-------|-------|
| Status | UNRESOLVED |
| Blocking | NO |
| Scaffold assumption | In-memory streaming; no storage layer needed in Phase 5 |
| **Decision needed** | None urgent; address in Phase 3 when real ingestion logic is built |

---

### OI-16 — Pagination for List Endpoints `[NON-BLOCKING]`

| Field | Value |
|-------|-------|
| Status | UNRESOLVED |
| Blocking | NO |
| Scaffold assumption | No pagination; endpoints return all records |
| **Decision needed** | None urgent; address when dataset grows or in Phase 2 |

---

## 10. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| R-1 | Mock JWT scaffold merged to main without Phase 2 upgrade plan → security debt | Medium | High | Document Mock JWT as temporary in codebase comments; create Phase 2 auth ticket before merging scaffold |
| R-2 | Stub endpoints returning mock data mask real contract violations when real logic is added | Medium | Medium | Design stub responses to match final response schema (not dummy shapes); add contract tests in Phase 2 |
| R-3 | Seed data not diverse enough → boundary tests miss edge cases | Low | Medium | Ensure seed includes: engineer at 0% availability, engineer at 100%, project with no matching skills, bench_start_date within 30 days |
| R-4 | `BENCH_ALERT_DAYS_THRESHOLD` default (30 days) incorrect → incorrect alerts in Phase 3 | Low | High | Flag as BLOCKING issue; do not implement real alert logic until OI-14 confirmed |
| R-5 | CI pipeline passes on scaffold but fails after real implementation due to missing test coverage | Medium | Medium | Add test stubs for each service even in scaffold phase (AC-18) |
| R-6 | `dashboard/stats` endpoint not in api-contract.md → implementation diverges from spec | Low | Low | Addressed in sources.md (C-1); stub endpoint added per architecture doc authority |

---

## 11. Traceability Table

Maps each AC to: affected Screen / API endpoint / DB table / Log event / Required role / Test type.

**Test type legend:**
- **UT** — Unit Test (isolated service/function)
- **IT** — Integration Test (component + DB or component + external)
- **E2E** — End-to-End Test (browser → API → DB)
- **BB** — Black Box Test (external interface only, no internals knowledge)
- **CI** — Verified by CI pipeline run (not a test per se)

| AC | Description | Screen | API Endpoint | DB Table(s) | Log Event | Min Role | Test Type |
|----|-------------|--------|-------------|-------------|-----------|----------|-----------|
| AC-1 | Docker Compose startup | — | — | all | — | — | IT / E2E |
| AC-2 | Application access | all | — | — | — | — | E2E |
| AC-3 | Health endpoint | — | GET /health | — | — | — | IT / BB |
| AC-4 | Route structure | all 10 routes | — | — | — | Public | E2E |
| AC-5 | Layout + sidebar | all routes | — | — | — | Public | E2E |
| AC-6 | UI component system | all routes | — | — | — | Public | UT / E2E |
| AC-7 | FastAPI boot | — | GET /docs | — | — | — | IT |
| AC-8 | Core routers registered | — | all | — | — | — | IT |
| AC-9 | Stub endpoints respond | all feature screens | all 17 endpoints | — | — | viewer+ | IT / BB |
| AC-10 | DB schema migration | — | — | engineers, projects, allocations, match_scores, bench_forecasts, users | — | — | IT |
| AC-11 | Seed data visible | /engineers, /projects, /allocation | GET /engineers, GET /projects, GET /allocations/active | engineers, projects, allocations | — | viewer+ | IT / E2E |
| AC-12 | Upload stub response | /upload | POST /engineers/upload, POST /projects/upload | — | csv_import_started, csv_import_completed | manager+ | IT / BB |
| AC-13 | LLM stub exists | — | POST /allocations/recommend | match_scores | llm_score_computed | manager+ | UT |
| AC-14 | Redis client | — | — | — | — | — | IT |
| AC-15 | Structured logging | — | all | — | 8 event categories | — | IT / BB |
| AC-16 | Lint/format clean | — | — | — | — | — | CI |
| AC-17 | Type checking | — | — | — | — | — | CI |
| AC-18 | CI pipeline | — | — | — | — | — | CI |
| AC-19 | Auth stub | /login, all routes | POST /auth/login | users | — | Public | IT / E2E |
| AC-20 | CSV 10MB rejection | /upload | POST /engineers/upload, POST /projects/upload | — | csv_import_failed | manager+ | IT / BB |

---

*End of spec-pack.md — RA-001 v1.0.0*
