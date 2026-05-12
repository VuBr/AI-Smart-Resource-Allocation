# spec-index.md

## Specification Index

AI Smart Resource Allocation & Bench Prediction System

This document acts as the **entry point for the entire specification pack**.

All AI agents, developers, and automation systems must begin by reading this file to understand:

* the structure of the specification pack
* the correct reading order
* which documents define architecture vs implementation
* where unresolved issues are recorded

This file ensures that **the specification is interpreted consistently** and prevents AI agents from missing critical documents.

---

# 1. Purpose of the Spec Index

The Spec Index provides:

* a **single source of navigation** for the specification pack
* the **recommended reading order**
* a mapping between **design documents and implementation tasks**

This file must be the **first document read by any AI coding agent**.

---

# 2. Specification Pack Structure

The specification pack contains the following documents:

```
spec-pack.md
source-base-architecture.md
domain-model.md
api-contract.md
ui-screen-spec.md
source-base-repo-structure.md
ac-source-base.md
implementation-task-breakdown.md
open-issues.md
ai-build-instructions.md
traceability-matrix.md
spec-review-checklist.md
```

Each document defines a **specific dimension of the system**.

---

# 3. Recommended Reading Order

AI agents must read the specification pack in the following order:

### Step 1 — System Architecture

```
source-base-architecture.md
```

Defines:

* overall architecture
* technology stack
* system boundaries
* service responsibilities

---

### Step 2 — Domain Model

```
domain-model.md
```

Defines:

* entities
* relationships
* constraints
* core business data structures

---

### Step 3 — API Contract

```
api-contract.md
```

Defines:

* REST endpoints
* request and response schemas
* HTTP status codes
* error format
* API behavior

---

### Step 4 — UI Specification

```
ui-screen-spec.md
```

Defines:

* application routes
* page layouts
* component expectations
* API dependencies per screen

---

### Step 5 — Repository Structure

```
source-base-repo-structure.md
```

Defines:

* monorepo layout
* project directories
* dependency boundaries

---

### Step 6 — Acceptance Criteria

```
ac-source-base.md
```

Defines:

* the exact conditions required for the scaffold to be considered complete

---

### Step 7 — Implementation Plan

```
implementation-task-breakdown.md
```

Defines:

* sequential implementation tasks
* dependency ordering
* task granularity

---

### Step 8 — Build Instructions

```
ai-build-instructions.md
```

Defines:

* how an AI agent must interpret and execute the specification

---

### Step 9 — Open Issues

```
open-issues.md
```

Defines:

* unresolved design questions
* decided questions with resolution
* blocking vs non-blocking classification

AI agents must **not invent solutions for unresolved issues**.

---

### Step 10 — Traceability Matrix

```
traceability-matrix.md
```

Defines:

* mapping from feature → AC → API → UI → task
* coverage validation checklist

---

### Step 11 — Spec Review Checklist

```
spec-review-checklist.md
```

Defines:

* pre-implementation review checklist
* sign-off criteria

---

# 4. Specification Hierarchy

If conflicts exist between documents, the following precedence applies:

```
1. source-base-architecture.md
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
```

Higher documents override lower ones.

---

# 5. Implementation Workflow

The implementation process should follow this sequence:

```
1. Read spec-index.md
2. Understand architecture
3. Review domain model
4. Review API contract
5. Review UI specification
6. Understand repository structure
7. Review acceptance criteria
8. Execute implementation tasks
9. Follow AI build instructions
10. Resolve open issues separately
11. Validate traceability matrix
```

---

# 6. Specification Update Rules

When the system evolves:

* architecture changes must update **source-base-architecture.md**
* new entities must update **domain-model.md**
* new APIs must update **api-contract.md**
* new UI screens must update **ui-screen-spec.md**
* repository changes must update **source-base-repo-structure.md**
* acceptance criteria must update **ac-source-base.md**
* new features must update **traceability-matrix.md**

The **spec-index.md must also be updated** to reflect any added documents.

---

# 7. Usage by AI Coding Agents

AI agents must follow these rules:

1. Read all documents before generating code.
2. Follow the implementation tasks sequentially.
3. Do not invent architecture decisions.
4. Do not implement features outside the specification.
5. Use stub implementations where required.
6. Do not invent solutions for issues marked **UNRESOLVED** in open-issues.md.

---

# 8. Validation Checklist

Before starting implementation, confirm:

* architecture is defined
* domain entities are defined
* API endpoints are defined (with response schemas and status codes)
* UI screens are defined (including /engineers routes)
* repository structure is defined
* acceptance criteria exist
* implementation tasks exist
* AI build instructions exist
* traceability matrix is complete
* open blocking issues are resolved

If any are missing, implementation must **not begin**.

---

# 9. Complete Specification Map

```
spec-index.md
 ├── spec-pack.md
 ├── source-base-architecture.md
 ├── domain-model.md
 ├── api-contract.md
 ├── ui-screen-spec.md
 ├── source-base-repo-structure.md
 ├── ac-source-base.md
 ├── implementation-task-breakdown.md
 ├── ai-build-instructions.md
 ├── open-issues.md
 ├── traceability-matrix.md
 └── spec-review-checklist.md
```

This represents the **complete specification pack for Phase 1–5 of the SDD workflow**.

---

# 10. Final Note

The specification pack must always remain **consistent and synchronized** with the implementation.

Any change to architecture, domain model, or API contracts must first update the relevant specification document before code changes occur.

This ensures the project remains **spec-driven rather than code-driven**.
