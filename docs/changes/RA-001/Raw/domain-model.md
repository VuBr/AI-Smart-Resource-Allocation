# domain-model.md

## Domain Model — AI Smart Resource Allocation System

This document defines the **core domain entities and their relationships**.

---

# 1. Engineer

Represents a software engineer available for project allocation.

## Fields

| Field                   | Type      | Constraints                    | Description                       |
| ----------------------- | --------- | ------------------------------ | --------------------------------- |
| id                      | UUID      | PK, not null                   | unique identifier                 |
| name                    | string    | not null, max 255              | engineer full name                |
| email                   | string    | not null, unique, max 255      | contact email                     |
| primary_skill           | string    | not null, max 100              | main expertise area               |
| secondary_skills        | string[]  | nullable                       | additional skills (free text)     |
| level                   | enum      | not null                       | junior / mid / senior             |
| availability_percentage | int       | not null, 0–100                | current availability percentage   |
| bench_start_date        | date      | nullable                       | expected bench start date         |
| location                | string    | nullable, max 100              | engineer location                 |
| created_at              | timestamp | not null, default now()        | record creation time              |
| updated_at              | timestamp | not null, default now()        | last modification time            |

---

# 2. Project

Represents a project requiring engineers.

## Fields

| Field            | Type     | Constraints                    | Description               |
| ---------------- | -------- | ------------------------------ | ------------------------- |
| id               | UUID     | PK, not null                   | unique project ID         |
| name             | string   | not null, max 255              | project name              |
| description      | text     | nullable                       | project context for LLM   |
| required_skills  | string[] | not null                       | skill requirements        |
| required_level   | enum     | not null                       | minimum engineer level    |
| start_date       | date     | not null                       | project start date        |
| end_date         | date     | not null                       | project end date          |
| allocation_slots | int      | not null, min 1                | number of engineers needed|
| status           | enum     | not null, default 'planned'    | planned / active / closed |
| created_at       | timestamp| not null, default now()        | record creation time      |
| updated_at       | timestamp| not null, default now()        | last modification time    |

---

# 3. Allocation

Represents assignment of an engineer to a project.

## Fields

| Field                 | Type      | Constraints                          | Description                          |
| --------------------- | --------- | ------------------------------------ | ------------------------------------ |
| id                    | UUID      | PK, not null                         | unique allocation ID                 |
| engineer_id           | UUID      | FK → engineers.id, not null          | allocated engineer                   |
| project_id            | UUID      | FK → projects.id, not null           | target project                       |
| allocation_percentage | int       | not null, 1–100                      | percentage of time allocated         |
| start_date            | date      | not null                             | allocation start                     |
| end_date              | date      | not null                             | allocation end                       |
| status                | enum      | not null, default 'active'           | active / completed / cancelled       |
| created_at            | timestamp | not null, default now()              | record creation time                 |

---

# 4. MatchScore

Stores AI scoring results between an engineer and a project.

## Fields

| Field              | Type      | Constraints                     | Description                        |
| ------------------ | --------- | ------------------------------- | ---------------------------------- |
| id                 | UUID      | PK, not null                    | unique score ID                    |
| engineer_id        | UUID      | FK → engineers.id, not null     | scored engineer                    |
| project_id         | UUID      | FK → projects.id, not null      | scored project                     |
| skill_match_score  | float     | not null, 0.0–1.0               | skill alignment score              |
| level_match_score  | float     | not null, 0.0–1.0               | level compatibility score          |
| availability_score | float     | not null, 0.0–1.0               | availability fit score             |
| overall_score      | float     | not null, 0.0–1.0               | composite score                    |
| explanation        | text      | nullable                        | LLM-generated explanation          |
| risk_notes         | text      | nullable                        | LLM-generated risk notes           |
| llm_provider       | string    | nullable, max 50                | provider used (openai/anthropic)   |
| model_version      | string    | nullable, max 100               | model ID used for scoring          |
| created_at         | timestamp | not null, default now()         | record creation time               |

---

# 5. BenchForecast

Represents prediction of bench risk for an engineer.

## Fields

| Field          | Type      | Constraints                     | Description                       |
| -------------- | --------- | ------------------------------- | --------------------------------- |
| id             | UUID      | PK, not null                    | unique forecast ID                |
| engineer_id    | UUID      | FK → engineers.id, not null     | forecasted engineer               |
| forecast_date  | date      | not null                        | date forecast was generated for   |
| risk_level     | enum      | not null                        | low / medium / high               |
| probability    | float     | not null, 0.0–1.0               | estimated bench probability       |
| recommendation | text      | nullable                        | suggested action for manager      |
| created_at     | timestamp | not null, default now()         | record creation time              |

---

# 6. User

Represents a system user.

## Fields

| Field         | Type      | Constraints                     | Description                       |
| ------------- | --------- | ------------------------------- | --------------------------------- |
| id            | UUID      | PK, not null                    | unique user ID                    |
| email         | string    | not null, unique, max 255       | login email                       |
| password_hash | string    | not null                        | hashed password                   |
| role          | enum      | not null                        | admin / manager / viewer          |
| created_at    | timestamp | not null, default now()         | record creation time              |

---

# 7. Relationships

```
Engineer 1 --- n Allocation
Project  1 --- n Allocation

Engineer 1 --- n MatchScore
Project  1 --- n MatchScore

Engineer 1 --- n BenchForecast
```

---

# 8. Domain Constraints

| Constraint | Rule |
| --- | --- |
| Allocation cap | Sum of `allocation_percentage` across active allocations per engineer must not exceed 100 |
| Allocation date bounds | Allocation `start_date` and `end_date` must fall within project `start_date` and `end_date` |
| Score range | All score fields in MatchScore must be in range [0.0, 1.0] |
| Availability range | `availability_percentage` must be in range [0, 100] |
| Bench forecast trigger | BenchForecast is generated only when `bench_start_date` is within `BENCH_ALERT_DAYS_THRESHOLD` days (default: 30) |
| Role values | User role must be one of: admin, manager, viewer |
| Project level | `required_level` must be one of: junior, mid, senior |
| Engineer level | `level` must be one of: junior, mid, senior |

---

# 9. Indexes

| Table | Index |
| --- | --- |
| engineers | email (unique), primary_skill |
| allocations | engineer_id, project_id, status |
| match_scores | engineer_id + project_id (composite) |
| bench_forecasts | engineer_id, forecast_date |

---

# 10. Future Model Extensions

Potential entities:

* `Skill` — normalized skill taxonomy
* `AllocationHistory` — audit log of allocation changes
* `LLMPromptLog` — prompt/response logging for audit
* `ProjectDemandForecast` — future staffing demand prediction
* `Organization` — multi-tenant support
