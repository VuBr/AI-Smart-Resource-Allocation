# source-base-repo-structure.md

## Repository Structure Specification

This document defines the **official repository structure** for the project source base.

The repository follows a **monorepo layout** to keep frontend, backend, and shared contracts synchronized.

---

# 1. Root Repository Structure

```
repo-root/
  apps/
  packages/
  infra/
  docs/
  scripts/
  docker-compose.yml
  README.md
  .env.example
  .gitignore
```

---

# 2. Applications Directory

Contains runnable applications.

```
apps/
  web/
  api/
```

---

# 3. Frontend Application

```
apps/web/
  src/
    app/
      login/
        page.tsx
      dashboard/
        page.tsx
      engineers/
        page.tsx
        [id]/
          page.tsx
      upload/
        page.tsx
      projects/
        page.tsx
        [id]/
          page.tsx
      allocation/
        page.tsx
      bench-forecast/
        page.tsx
      reports/
        page.tsx
      layout.tsx

    components/
      ui/         (shadcn components)
      layout/
        Sidebar.tsx
        Header.tsx
        AppShell.tsx

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
        auth.ts
        engineers.ts
        projects.ts
        allocations.ts
        bench.ts
        reports.ts
        dashboard.ts
    types/

  public/
  tests/
  package.json
  tsconfig.json
  next.config.ts
  .eslintrc.json
  .prettierrc
```

### Key Directories

| Directory | Purpose |
| --- | --- |
| app | Next.js App Router route structure |
| components | shared UI components |
| components/ui | shadcn/ui components |
| features | domain feature modules |
| hooks | custom React hooks |
| lib | utility functions and API clients |
| lib/services | API service call modules |
| types | shared TypeScript types |

---

# 4. Backend Application

```
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
        __init__.py

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
      __init__.py

    schemas/
      engineer.py
      project.py
      allocation.py
      bench_forecast.py
      match_score.py
      auth.py
      dashboard.py
      common.py

    repositories/
      engineer_repository.py
      project_repository.py
      allocation_repository.py

    services/
      csv_ingestion.py
      llm_scoring.py
      constraint_engine.py
      bench_prediction.py
      allocation_orchestrator.py

    workers/

    main.py

  alembic/
    versions/
    env.py
  tests/
    test_engineers.py
    test_projects.py
    test_allocations.py
    test_bench.py
  requirements.txt
  pyproject.toml
  Dockerfile
```

### Key Directories

| Directory | Purpose |
| --- | --- |
| api/v1/routers | HTTP route definitions |
| services | business logic |
| schemas | Pydantic request/response validation |
| repositories | database query functions |
| models | SQLAlchemy ORM models |
| core | configuration, security, logging, cache |
| db | database engine and session |
| workers | background job stubs |
| alembic | database migrations |

---

# 5. Shared Packages

```
packages/shared/
  src/
    contracts/
    constants/
    types/
  package.json
  tsconfig.json
```

Purpose:

* API contract type definitions (future: auto-generated from OpenAPI)
* shared constants (role names, status enums)
* shared TypeScript types

---

# 6. Infrastructure

```
infra/
  docker/
    web.Dockerfile
    api.Dockerfile
  terraform/
  scripts/
    init-db.sh
```

Examples:

* custom Docker images
* Terraform config (future)
* database initialization scripts

---

# 7. Documentation

```
docs/
  architecture/
  changes/
  standards/
```

| Directory | Purpose |
| --- | --- |
| architecture | architecture decision records |
| changes | changelog entries |
| standards | coding and API standards |

---

# 8. Scripts

```
scripts/
  setup.sh
  seed-data.sh
```

Used for:

* local environment setup
* database seeding
* automation tasks

---

# 9. Docker Compose

```
docker-compose.yml
```

Defines local development services:

* web (Next.js, port 3000)
* api (FastAPI, port 8000)
* postgres (PostgreSQL, port 5432)
* redis (Redis, port 6379)

All services must have health checks defined.

---

# 10. Repository Rules

### Rule 1

Frontend must not import backend code directly.

### Rule 2

Shared contracts and types live in `packages/shared/`.

### Rule 3

Backend business logic must exist in `services/`. Routers are thin and delegate to services.

### Rule 4

API routes must remain thin and delegate logic to services.

### Rule 5

All environment configuration must be centralized in `app/core/config.py` (backend) and `lib/config.ts` (frontend).

### Rule 6

Database queries must be isolated in `repositories/`. Services must not write raw SQL or ORM queries directly.

### Rule 7

All new routes must be registered in `main.py`.

---

# 11. Future Extensions

Possible additions:

```
apps/worker/          (background job service)
packages/ai-prompts/  (LLM prompt templates)
packages/data-models/ (shared data contracts)
```
