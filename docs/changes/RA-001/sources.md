# sources.md — Source of Truth Registry

**Ticket:** RA-001
**System:** AI Smart Resource Allocation & Bench Prediction System
**Created:** 2026-03-24
**Location of input documents:** `docs/changes/RA-001/Raw/`

---

## 1. Source Documents

All 13 input documents are located under `Raw/`. They form the **authoritative specification pack** for RA-001.

| # | File | Purpose | Authority Level |
|---|------|---------|----------------|
| 1 | `Raw/spec-index.md` | Entry point; reading order; document hierarchy; usage rules for AI agents | Navigation (not authoritative for content) |
| 2 | `Raw/source-base-architecture.md` | Technology stack, system layers, service responsibilities, runtime model, security, logging, env vars | **HIGHEST — overrides all others** |
| 3 | `Raw/domain-model.md` | 6 core entities, fields, constraints, relationships, indexes | **HIGH** |
| 4 | `Raw/api-contract.md` | 23 REST endpoints, request/response schemas, HTTP status codes, error format | **HIGH** |
| 5 | `Raw/ui-screen-spec.md` | 10 UI routes, layout, components, API dependencies, role-based visibility | HIGH |
| 6 | `Raw/source-base-repo-structure.md` | Monorepo directory layout, dependency rules | HIGH |
| 7 | `Raw/ac-source-base.md` | 20 Acceptance Criteria (AC-SB-1..AC-SB-20), completion definition | HIGH |
| 8 | `Raw/implementation-task-breakdown.md` | 62 sequential tasks (TASK-001..TASK-062) | MEDIUM (implementation guide, not spec) |
| 9 | `Raw/ai-build-instructions.md` | AI agent rules, naming conventions, validation checklist | MEDIUM (process, not spec) |
| 10 | `Raw/open-issues.md` | 16 issues (UNRESOLVED/DECIDED, BLOCKING/NON-BLOCKING) | MEDIUM |
| 11 | `Raw/traceability-matrix.md` | Feature → AC → API → UI → Task mapping | LOW (derived, not authoritative) |
| 12 | `Raw/spec-review-checklist.md` | Pre-implementation review checklist, sign-off criteria | LOW (process) |
| 13 | `Raw/spec-pack.md` | Executive summary; high-level overview | LOW (summary of higher docs) |

---

## 2. Precedence Hierarchy

When documents conflict, the following order applies (highest = wins):

```
1. source-base-architecture.md      ← WINS
2. domain-model.md
3. api-contract.md
4. ui-screen-spec.md
5. source-base-repo-structure.md
6. ac-source-base.md
7. implementation-task-breakdown.md
8. ai-build-instructions.md
9. open-issues.md
10. traceability-matrix.md
11. spec-review-checklist.md
12. spec-pack.md (Raw)              ← LOWEST
```

*Source: `Raw/spec-index.md` Section 4*

---

## 3. Conflicts and Gaps Found

### CONFLICT C-1: `dashboard/stats` endpoint missing from api-contract.md

| Field | Detail |
|-------|--------|
| Documents | `api-contract.md` vs `open-issues.md` (Issue 15) |
| Description | `api-contract.md` does not define `GET /api/v1/dashboard/stats`, but `source-base-architecture.md` Section 10.2 lists it as a core endpoint. `open-issues.md` Issue 15 treats it as unresolved. |
| Resolution | `source-base-architecture.md` is authoritative → endpoint must exist. `open-issues.md` Issue 15 assumption (stub response) is adopted. |
| Status | RESOLVED via precedence rule |

---

### GAP G-1: `BENCH_ALERT_DAYS_THRESHOLD` default undefined in architecture doc

| Field | Detail |
|-------|--------|
| Documents | `source-base-architecture.md` Section 16 lists env var; `domain-model.md` Section 8 mentions 30-day default in passing |
| Description | `source-base-architecture.md` lists `BENCH_ALERT_DAYS_THRESHOLD` as an env var but does not define its default. `open-issues.md` Issue 14 (BLOCKING) defines default as 30 days for scaffold. |
| Resolution | Adopt `open-issues.md` Issue 14 assumption: **default = 30 days**, triggering on `bench_start_date` within 30 days from today. Pending human confirmation. |
| Status | OPEN — see spec-pack.md Open Issues |

---

### GAP G-2: Phase naming inconsistency

| Field | Detail |
|-------|--------|
| Documents | `source-base-architecture.md`, `ac-source-base.md` |
| Description | `source-base-architecture.md` is titled "Phase 1 – Architecture Specification", but `ac-source-base.md` is titled "Phase 5". Both refer to the same scaffold implementation. |
| Resolution | Both refer to the same deliverable: the initial runnable scaffold. In this SDD spec-pack, we use **"RA-001 Scaffold Phase"** to avoid confusion. |
| Status | RESOLVED (naming only) |

---

### GAP G-3: Bench alert triggering logic not defined precisely

| Field | Detail |
|-------|--------|
| Documents | `domain-model.md` Section 8, `open-issues.md` Issue 14 |
| Description | Whether alert fires on `bench_start_date - today ≤ 30` OR on `project.end_date - today ≤ 30` is ambiguous. domain-model.md says "bench_start_date is within BENCH_ALERT_DAYS_THRESHOLD days" which implies the former. |
| Resolution | `domain-model.md` is higher authority than `open-issues.md` → use `bench_start_date`. Needs human confirmation per Open Issue OI-14. |
| Status | OPEN — see spec-pack.md Open Issues |

---

## 4. Authoritative Output

The SDD Spec Pack for RA-001 is:

| File | Role |
|------|------|
| `docs/changes/RA-001/sources.md` | This file — source registry |
| `docs/changes/RA-001/spec-pack.md` | **Single Source of Truth for implementation** |

All implementation decisions must be traced back to `spec-pack.md`.
If `spec-pack.md` conflicts with any `Raw/` document, **spec-pack.md governs** (it is the synthesized, SDD-reviewed version).
If spec-pack.md needs to be updated, update it with a change note and date.
