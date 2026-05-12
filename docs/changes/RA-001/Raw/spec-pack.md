# spec-pack.md

## Central Specification Document

AI Smart Resource Allocation & Bench Prediction System

This document acts as the **central specification summary** for the project.
It consolidates the key information from the specification pack and provides a **single high-level entry point** for stakeholders, developers, and AI coding agents.

The detailed specifications are distributed across the documents listed in `spec-index.md`.
This file provides the **executive overview, scope, and core acceptance criteria** required before implementation begins.

---

# 1. Project Overview

The **AI Smart Resource Allocation & Bench Prediction System** is designed to assist engineering managers in:

* allocating engineers to projects efficiently
* predicting potential bench risk
* identifying skill shortages early
* improving workforce utilization

The system uses **structured data and AI-assisted scoring** to recommend suitable engineer-project matches.

---

# 2. Goals

The system aims to:

1. Automate engineer-project matching.
2. Provide explainable allocation recommendations.
3. Detect potential bench risk early.
4. Provide workforce planning insights.

---

# 3. Scope

## In Scope

The following capabilities are included in the first implementation phase:

* engineer data ingestion via CSV
* project requirements ingestion via CSV
* engineer list and detail views
* engineer-project recommendation generation
* bench forecast reporting
* shortage reports
* basic role-based UI access
* dashboard overview

---

## Out of Scope (Phase 1)

The following capabilities are **not implemented in the scaffold phase**:

* full production authentication system
* advanced machine learning forecasting
* enterprise workforce analytics
* multi-organization support
* real-time notifications
* internationalization

These features may be implemented in later phases.

---

# 4. System Architecture Summary

## Technology Stack

Frontend

* Next.js
* TypeScript
* TailwindCSS
* shadcn/ui

Backend

* Python
* FastAPI

Data Layer

* PostgreSQL
* Redis

Infrastructure

* Docker
* Docker Compose

LLM Integration

* OpenAI / Anthropic compatible API

---

## High-Level Architecture

```
Browser
   ↓
Next.js Frontend
   ↓
FastAPI Backend
   ↓
PostgreSQL + Redis
   ↓
LLM Provider
```

Frontend is responsible for **presentation and interaction**,
while backend services implement **all business logic and AI orchestration**.

---

# 5. Core Domain Entities

The system is built around the following primary entities:

Engineer
Project
Allocation
MatchScore
BenchForecast
User

Full definitions and relationships are described in:

```
domain-model.md
```

---

# 6. API Overview

All backend APIs follow the base path:

```
/api/v1
```

Main API groups include:

Auth
Engineers
Projects
Allocations
Bench Forecast
Reports

Full API contract definitions are available in:

```
api-contract.md
```

---

# 7. UI Screens

The frontend application contains the following primary routes:

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

Each screen has defined components, API dependencies, and behaviors.

Full UI specifications are documented in:

```
ui-screen-spec.md
```

---

# 8. Repository Structure

The project uses a **monorepo architecture**:

```
repo-root/
  apps/
    web/        (Next.js frontend)
    api/        (FastAPI backend)
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
```

Detailed repository rules are defined in:

```
source-base-repo-structure.md
```

---

# 9. Acceptance Criteria

The scaffold phase must satisfy the following minimum conditions:

* Docker Compose runs all services
* Frontend is accessible locally
* Backend health endpoint exists at `/api/v1/health`
* UI routes render without errors (including /engineers and /login)
* API endpoints exist with stub responses
* Auth stub endpoint exists
* Database schema is initialized
* Redis connection works
* Code passes lint and type checks

The complete criteria list is defined in:

```
ac-source-base.md
```

---

# 10. Implementation Plan

Implementation must follow the structured task plan defined in:

```
implementation-task-breakdown.md
```

Tasks are intentionally small and sequential to support **AI-assisted development workflows**.

---

# 11. AI Build Instructions

AI agents responsible for generating the codebase must follow:

```
ai-build-instructions.md
```

This document defines:

* generation constraints
* naming conventions
* architecture enforcement
* build validation steps

---

# 12. Open Issues

Unresolved design questions are tracked in:

```
open-issues.md
```

Issues are classified as **BLOCKING** or **NON-BLOCKING** for Phase 5.

AI agents and developers **must not invent solutions** for UNRESOLVED issues.

---

# 13. Traceability

Feature-to-implementation traceability is maintained in:

```
traceability-matrix.md
```

---

# 14. Specification Document Map

```
spec-index.md
 ├─ spec-pack.md
 ├─ source-base-architecture.md
 ├─ domain-model.md
 ├─ api-contract.md
 ├─ ui-screen-spec.md
 ├─ source-base-repo-structure.md
 ├─ ac-source-base.md
 ├─ implementation-task-breakdown.md
 ├─ ai-build-instructions.md
 ├─ open-issues.md
 ├─ traceability-matrix.md
 └─ spec-review-checklist.md
```

---

# 15. Phase 1 Completion Criteria

Phase 1 of the SDD process is considered complete when:

* architecture is defined
* domain entities are defined (with all required fields)
* API contract is defined (with response schemas and status codes)
* UI screens are defined (including engineer screens)
* repository structure is defined
* acceptance criteria are written
* implementation tasks are defined (all endpoints and pages covered)
* AI build instructions exist
* open issues are documented and classified
* traceability matrix is complete

Only after these conditions are met should the project proceed to **implementation phases**.

---

# 16. Next Steps After Phase 1

Once this specification pack is finalized:

1. Conduct specification review using spec-review-checklist.md.
2. Resolve critical BLOCKING open issues.
3. Validate traceability matrix completeness.
4. Begin Phase 3 implementation planning.
5. Execute Phase 5 scaffold implementation.

The project must remain **spec-driven**, meaning architecture and requirements are updated in the specification before modifying code.
