# open-issues.md

## Open Issues and Pending Decisions

This document tracks **unresolved and resolved architectural or implementation decisions**.

Issues are classified as:

* **UNRESOLVED** — must be decided before implementation proceeds
* **DECIDED** — decision has been made, recorded for reference
* **BLOCKING** — blocks Phase 5 implementation if unresolved
* **NON-BLOCKING** — can proceed with documented assumption

AI agents and developers **must not invent solutions for UNRESOLVED issues**.

---

# 1. Authentication Strategy

**Status: UNRESOLVED — BLOCKING**

**Question**

Should authentication be implemented fully in Phase 5?

Options:

A. Mock JWT authentication (stub only)
B. Full authentication system
C. External provider (Auth0 / Clerk)

**Impact:** The `/auth/login` endpoint and JWT middleware must be at minimum stubbed for Phase 5 to satisfy AC-SB-19. The full auth strategy must be decided before Phase 6.

**Assumption for scaffold:** Implement mock JWT — endpoint accepts any credentials and returns a static token. This unblocks frontend integration without committing to a full auth strategy.

---

# 2. Object Storage for CSV Files

**Status: UNRESOLVED — NON-BLOCKING**

Uploaded CSV files may require temporary storage.

Options:

A. Local disk storage
B. S3-compatible storage (MinIO)
C. Direct streaming to processing service

**Assumption for scaffold:** Files are processed in-memory (direct streaming). No storage layer is required for Phase 5 stub.

---

# 3. OpenAPI Type Generation

**Status: DECIDED — NON-BLOCKING**

**Decision:** Generate TypeScript types from OpenAPI spec using `openapi-typescript` or similar tooling.

**Rationale:** Reduces manual type maintenance and ensures frontend/backend type alignment.

**Action for Phase 5:** Types are manually defined for scaffold. Auto-generation configured in a later phase.

---

# 4. Bench Forecast Visualization

**Status: DECIDED — NON-BLOCKING**

**Decision:** Phase 5 implements table view first.

**Future:** Timeline chart or forecast graph may be added in later phases.

---

# 5. LLM Provider Choice

**Status: DECIDED — NON-BLOCKING**

**Decision:** Provider is configured via environment variable (`LLM_PROVIDER`).

Supported values:

* `openai`
* `anthropic`
* `azure_openai`

**Action for scaffold:** LLMScoringService is a stub. No real provider call occurs in Phase 5.

---

# 6. Fallback Scoring Strategy

**Status: DECIDED — NON-BLOCKING**

**Decision:** Rule-based scoring fallback when LLM fails.

Rules evaluate skill overlap percentage, level compatibility, and availability percentage.

**Action for scaffold:** Fallback logic is stubbed in Phase 5. Real rules implemented in a later phase.

---

# 7. Background Job Processing

**Status: DECIDED — NON-BLOCKING**

**Decision:** Phase 5 uses async execution within the API service (no queue).

**Future:** Celery / Redis Queue may be introduced when scoring volume grows.

---

# 8. Skill Taxonomy Management

**Status: DECIDED — NON-BLOCKING**

**Decision:** Phase 1 uses free text for skills. No normalization.

**Future:** Normalized skill dictionary or ontology-based skills in a later phase.

---

# 9. Observability Stack

**Status: DECIDED — NON-BLOCKING**

**Decision:** Structured JSON logging only in Phase 5.

**Future:** Prometheus + Grafana + OpenTelemetry in a later phase.

---

# 10. API Rate Limiting

**Status: DECIDED — NON-BLOCKING**

**Decision:** Not implemented in Phase 5.

**Future:** Endpoint-specific limits added when system goes to staging/production.

---

# 11. Testing Strategy

**Status: DECIDED — NON-BLOCKING**

**Decision:**

Frontend:

* Jest for unit tests (minimal in Phase 5)
* Playwright for E2E (future phase)

Backend:

* Pytest for all backend tests

**Action for scaffold:** Pytest runner configured. Minimal test stubs added for each service.

---

# 12. Multi-Organization Support

**Status: DECIDED — NON-BLOCKING**

**Decision:** Out of scope for Phase 1.

**Note:** Domain model should not add organization-scoping fields in Phase 5 to avoid premature complexity.

---

# 13. Internationalization

**Status: DECIDED — NON-BLOCKING**

**Decision:** Out of scope for Phase 1. UI uses English only.

---

# 14. Bench Alert Threshold Definition

**Status: UNRESOLVED — BLOCKING**

**Question**

What is the threshold for triggering a bench alert?

The architecture references `BENCH_ALERT_DAYS_THRESHOLD` as an environment variable but does not define:

* Default value
* Whether it applies to days until project end or days until expected bench start date
* Whether it is per-engineer or a global setting

**Impact:** BenchPredictionEngine cannot produce correct alerts without this definition.

**Assumption for scaffold:** Default value is `30` days. Alert triggers when `bench_start_date` is within 30 days from today. Configurable via env var.

---

# 15. Dashboard KPI Data Sources

**Status: UNRESOLVED — NON-BLOCKING**

**Question**

Which endpoints provide aggregate stats for Dashboard KPI cards?

* "Total Engineers" count
* "Active Projects" count
* "Allocation Rate %"

Currently no dedicated aggregate endpoint is defined in api-contract.md.

Options:

A. Add `GET /api/v1/dashboard/stats` endpoint
B. Compute from existing list endpoints on frontend (not preferred — business logic in frontend)
C. Add aggregate fields to existing responses

**Assumption for scaffold:** Add `GET /api/v1/dashboard/stats` stub endpoint returning mock aggregate counts. Full implementation in a later phase.

---

# 16. Pagination and Filtering for List Endpoints

**Status: UNRESOLVED — NON-BLOCKING**

**Question**

Should list endpoints (`GET /engineers`, `GET /projects`, `GET /bench/forecast`) support pagination and filtering in Phase 5?

Options:

A. No pagination in scaffold (return all records)
B. Cursor-based pagination
C. Offset-limit pagination

**Assumption for scaffold:** No pagination in Phase 5. Endpoints return all records. Pagination added in a later phase when dataset grows.

---

# Issue Priority Summary

| Issue | Status | Blocking | Assumption for Phase 5 |
| --- | --- | --- | --- |
| 1. Authentication Strategy | UNRESOLVED | YES | Mock JWT stub |
| 2. Object Storage | UNRESOLVED | NO | In-memory streaming |
| 3. OpenAPI Type Generation | DECIDED | NO | Manual types in scaffold |
| 4. Bench Forecast Visualization | DECIDED | NO | Table view |
| 5. LLM Provider Choice | DECIDED | NO | Env var config, stub only |
| 6. Fallback Scoring | DECIDED | NO | Stub in Phase 5 |
| 7. Background Jobs | DECIDED | NO | Async in-process |
| 8. Skill Taxonomy | DECIDED | NO | Free text |
| 9. Observability | DECIDED | NO | JSON logging only |
| 10. Rate Limiting | DECIDED | NO | Not in Phase 5 |
| 11. Testing Strategy | DECIDED | NO | Pytest + minimal Jest |
| 12. Multi-Org | DECIDED | NO | Out of scope |
| 13. i18n | DECIDED | NO | Out of scope |
| 14. Bench Alert Threshold | UNRESOLVED | YES | 30 days default |
| 15. Dashboard KPI Source | UNRESOLVED | NO | Stub stats endpoint |
| 16. Pagination | UNRESOLVED | NO | No pagination in Phase 5 |
