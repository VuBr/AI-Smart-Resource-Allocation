# spec-review-checklist.md

## Specification Review Checklist

AI Smart Resource Allocation & Bench Prediction System

This checklist is used to **review and validate the specification pack before implementation begins**.

The goal is to ensure that the project specification is **complete, consistent, and implementable**.

---

# 1. Architecture Review

Verify that the system architecture is clearly defined.

Checklist:

* [ ] Technology stack is defined (frontend, backend, data layer, infra, LLM)
* [ ] Frontend architecture is defined (App Router, routes, structure)
* [ ] Backend architecture is defined (FastAPI, modules, service layer)
* [ ] Database and cache architecture are defined (PostgreSQL, Redis, TTLs)
* [ ] Integration with LLM providers is described (with fallback strategy)
* [ ] Service boundaries are clear (frontend vs backend responsibilities)
* [ ] System runtime architecture is documented (ports, services, flow)
* [ ] CSV file size limit is specified (`MAX_CSV_SIZE_MB`)
* [ ] Bench alert threshold default is specified (`BENCH_ALERT_DAYS_THRESHOLD`)
* [ ] All environment variables are listed in .env.example

Reference document:

```
source-base-architecture.md
```

---

# 2. Domain Model Review

Verify that the domain model represents all core business entities.

Checklist:

* [ ] All core entities are defined (Engineer, Project, Allocation, MatchScore, BenchForecast, User)
* [ ] All entity attributes are clearly described with types and constraints
* [ ] `updated_at` field exists on Engineer
* [ ] `status` field exists on Allocation (active / completed / cancelled)
* [ ] `llm_provider` and `model_version` fields exist on MatchScore
* [ ] `created_at` field exists on BenchForecast
* [ ] `description` field exists on Project
* [ ] Relationships between entities are defined
* [ ] Domain constraints are documented (allocation cap, date bounds, score ranges)
* [ ] Database indexes are defined
* [ ] Entities support required API operations

Reference document:

```
domain-model.md
```

---

# 3. API Contract Review

Verify that backend APIs are well-defined.

Checklist:

* [ ] `POST /api/v1/auth/login` endpoint is defined with request and response schema
* [ ] All engineer endpoints are defined (upload, list, detail, bench-forecast)
* [ ] All project endpoints are defined (upload, list, detail)
* [ ] All allocation endpoints are defined (recommend, recommendations/{id}, confirm, active)
* [ ] All bench endpoints are defined (forecast, alerts)
* [ ] `GET /api/v1/reports/shortage` is defined
* [ ] `GET /api/v1/dashboard/stats` is defined
* [ ] `GET /api/v1/health` returns `{ status, version }` at `/api/v1/health` (not `/health`)
* [ ] All response schemas are defined (no endpoints with missing response structure)
* [ ] HTTP status codes are defined for all endpoints
* [ ] Error response format is defined and consistent
* [ ] Standard error codes are listed
* [ ] CSV upload 413 behavior is documented

Reference document:

```
api-contract.md
```

---

# 4. UI Screen Review

Verify that all application screens are defined.

Checklist:

* [ ] `/login` route is defined
* [ ] `/dashboard` route is defined with correct API dependencies (dashboard/stats, bench/alerts, allocations/active)
* [ ] `/engineers` route is defined (list screen)
* [ ] `/engineers/[id]` route is defined (detail screen)
* [ ] `/upload` route is defined
* [ ] `/projects` route is defined
* [ ] `/projects/[id]` route is defined
* [ ] `/allocation` route is defined
* [ ] `/bench-forecast` route is defined
* [ ] `/reports` route is defined
* [ ] Each screen has a defined purpose
* [ ] UI components are described per screen
* [ ] Screen-to-API dependencies are defined (and match api-contract.md)
* [ ] Role-based visibility is defined (including Confirm Allocation and View Engineers)
* [ ] Route summary table with auth requirements is present
* [ ] Loading, empty, and error states are defined globally

Reference document:

```
ui-screen-spec.md
```

---

# 5. Repository Structure Review

Verify that the repository layout is consistent with the architecture.

Checklist:

* [ ] Monorepo structure is defined
* [ ] Frontend application directory defined (`apps/web/`)
* [ ] Frontend includes `lib/services/` directory with all service files
* [ ] Backend application directory defined (`apps/api/`)
* [ ] Backend includes `auth.py` router
* [ ] Backend includes `dashboard.py` router
* [ ] Shared packages directory defined (`packages/shared/`)
* [ ] Infrastructure directory defined (`infra/docker/`, `infra/terraform/`, `infra/scripts/`)
* [ ] Documentation directory defined (`docs/architecture/`, `docs/changes/`, `docs/standards/`)
* [ ] Dependency boundaries are documented (7 rules)
* [ ] Repository structure matches architecture spec exactly

Reference document:

```
source-base-repo-structure.md
```

---

# 6. Acceptance Criteria Review

Verify that the acceptance criteria are testable.

Checklist:

* [ ] Acceptance criteria are numbered (AC-SB-1 through AC-SB-20)
* [ ] AC-SB-4 includes `/engineers`, `/engineers/[id]`, and `/login` routes
* [ ] AC-SB-8 includes `auth` and `dashboard` router groups
* [ ] AC-SB-9 includes all endpoints (auth, engineers detail, allocations/recommendations/{id}, active, bench/alerts, dashboard/stats)
* [ ] AC-SB-19 defines auth stub behavior
* [ ] AC-SB-20 defines CSV file size limit enforcement (413)
* [ ] Each AC is measurable and has a clear completion condition
* [ ] ACs align with system requirements
* [ ] Completion definition is present

Reference document:

```
ac-source-base.md
```

---

# 7. Implementation Task Review

Verify that the implementation plan is complete.

Checklist:

* [ ] Tasks are sequential
* [ ] Tasks are atomic
* [ ] TASK-054 exists for `POST /api/v1/auth/login`
* [ ] TASK-055 exists for `GET /api/v1/engineers/{id}`
* [ ] TASK-056 exists for `GET /api/v1/projects/{id}`
* [ ] TASK-057 exists for `GET /api/v1/allocations/recommendations/{project_id}`
* [ ] TASK-058 exists for `GET /api/v1/allocations/active`
* [ ] TASK-059 exists for `GET /api/v1/bench/alerts`
* [ ] TASK-060 exists for `GET /api/v1/dashboard/stats`
* [ ] TASK-061 exists for `/engineers/[id]` page
* [ ] TASK-062 exists for `/login` page
* [ ] TASK-005 includes all LLM and bench env vars
* [ ] Seed data task (TASK-046) inserts minimum 5 engineers, 3 projects, 3 allocations

Reference document:

```
implementation-task-breakdown.md
```

---

# 8. AI Build Instructions Review

Verify that AI agents have clear build instructions.

Checklist:

* [ ] AI build process defined
* [ ] Implementation rules defined (7 rules)
* [ ] HTTP status code rules defined
* [ ] Error response format rule defined
* [ ] Naming conventions defined
* [ ] Architecture constraints enforced
* [ ] Forbidden actions list is complete
* [ ] Auth guard implementation specified
* [ ] All environment variables listed

Reference document:

```
ai-build-instructions.md
```

---

# 9. Open Issues Review

Verify unresolved design questions are documented.

Checklist:

* [ ] All issues are documented
* [ ] Each issue is classified as UNRESOLVED or DECIDED
* [ ] Each issue is classified as BLOCKING or NON-BLOCKING
* [ ] BLOCKING issues have Phase 5 assumptions documented
* [ ] Issue #1 (Authentication) has scaffold assumption (mock JWT)
* [ ] Issue #14 (Bench Alert Threshold) has default value (30 days)
* [ ] Issue #15 (Dashboard KPI) has scaffold assumption (stub stats endpoint)
* [ ] Issue priority summary table is present

Reference document:

```
open-issues.md
```

---

# 10. Traceability Matrix Review

Verify feature-to-implementation mapping is complete.

Checklist:

* [ ] Login / Authentication feature is in the matrix
* [ ] List Engineers feature is in the matrix
* [ ] View Engineer Detail feature is in the matrix
* [ ] View Bench Alerts feature is in the matrix with correct AC (AC-SB-9)
* [ ] Dashboard KPI Stats feature is in the matrix
* [ ] Get Stored Recommendations feature is in the matrix
* [ ] Active Allocations feature is in the matrix
* [ ] All AC mappings use the correct AC identifier
* [ ] AC coverage summary maps all ACs
* [ ] All API endpoints referenced in at least one row

Reference document:

```
traceability-matrix.md
```

---

# 11. Cross-Document Consistency Check

Verify that documents do not contradict each other.

Checklist:

* [ ] Health endpoint path is consistent: `GET /api/v1/health` (not `GET /health`)
* [ ] `GET /allocations/recommendations/{project_id}` exists in both architecture and api-contract
* [ ] `POST /auth/login` exists in both api-contract and ui-screen-spec dependencies
* [ ] `GET /bench/alerts` exists in both api-contract and ui-screen-spec dashboard dependencies
* [ ] `GET /dashboard/stats` exists in both api-contract and ui-screen-spec dashboard dependencies
* [ ] Repository structure in architecture matches source-base-repo-structure.md
* [ ] All environment variables in architecture match .env.example template in TASK-005
* [ ] All routes in ui-screen-spec appear in AC-SB-4
* [ ] All routes in ui-screen-spec appear in implementation tasks

---

# 12. Specification Completeness Check

Before moving to implementation, confirm all documents present and complete:

* [ ] spec-index.md (updated with all 12 documents)
* [ ] spec-pack.md
* [ ] source-base-architecture.md
* [ ] domain-model.md
* [ ] api-contract.md
* [ ] ui-screen-spec.md
* [ ] source-base-repo-structure.md
* [ ] ac-source-base.md
* [ ] implementation-task-breakdown.md
* [ ] ai-build-instructions.md
* [ ] open-issues.md
* [ ] traceability-matrix.md
* [ ] spec-review-checklist.md

---

# 13. Review Sign-Off

Reviewer: _____________________

Date: _____________________

Status:

```
Approved
Approved with changes
Rejected
```

Notes:

_____________________
