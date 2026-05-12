# api-contract.md

## API Contract Specification

Base URL:

```
/api/v1
```

Authentication:

```
Authorization: Bearer <JWT>
```

All authenticated endpoints return `401 Unauthorized` when the token is missing or invalid.

---

# 0. Auth API

## Login

```
POST /api/v1/auth/login
```

No authentication required.

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response `200 OK`:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "role": "manager"
}
```

Response `401 Unauthorized`:

```json
{
  "error": {
    "code": "invalid_credentials",
    "message": "Invalid email or password"
  }
}
```

**Note (Phase 5):** Stub implementation — accepts any credentials and returns a static mock token.

---

# 1. Engineers API

## Upload Engineers

```
POST /api/v1/engineers/upload
```

Request: `multipart/form-data`

```
file: engineers.csv
```

Response `200 OK`:

```json
{
  "inserted": 10,
  "updated": 2,
  "skipped": 1,
  "errors": []
}
```

Response `400 Bad Request` (invalid file):

```json
{
  "error": {
    "code": "invalid_csv",
    "message": "Missing required column: primary_skill"
  }
}
```

Response `413 Payload Too Large` (file exceeds 10MB):

```json
{
  "error": {
    "code": "file_too_large",
    "message": "CSV file must not exceed 10MB"
  }
}
```

---

## List Engineers

```
GET /api/v1/engineers
```

Response `200 OK`:

```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "primary_skill": "Python",
    "secondary_skills": ["FastAPI", "PostgreSQL"],
    "level": "senior",
    "availability_percentage": 50,
    "bench_start_date": null,
    "location": "Hanoi"
  }
]
```

---

## Engineer Detail

```
GET /api/v1/engineers/{id}
```

Response `200 OK`:

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "primary_skill": "Python",
  "secondary_skills": ["FastAPI", "PostgreSQL"],
  "level": "senior",
  "availability_percentage": 50,
  "bench_start_date": null,
  "location": "Hanoi",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

Response `404 Not Found`:

```json
{
  "error": {
    "code": "not_found",
    "message": "Engineer not found"
  }
}
```

---

## Engineer Bench Forecast

```
GET /api/v1/engineers/{id}/bench-forecast
```

Response `200 OK`:

```json
{
  "engineer_id": "uuid",
  "forecast_date": "2026-04-10",
  "risk_level": "medium",
  "probability": 0.65,
  "recommendation": "Consider assigning to Project Alpha"
}
```

Response `404 Not Found`:

```json
{
  "error": {
    "code": "not_found",
    "message": "Engineer not found"
  }
}
```

---

# 2. Projects API

## Upload Projects

```
POST /api/v1/projects/upload
```

Request: `multipart/form-data`

```
file: projects.csv
```

Response `200 OK`:

```json
{
  "inserted": 5,
  "updated": 1,
  "skipped": 0,
  "errors": []
}
```

Response `400 Bad Request`:

```json
{
  "error": {
    "code": "invalid_csv",
    "message": "Missing required column: required_skills"
  }
}
```

---

## List Projects

```
GET /api/v1/projects
```

Response `200 OK`:

```json
[
  {
    "id": "uuid",
    "name": "Project Alpha",
    "required_skills": ["Python", "FastAPI"],
    "required_level": "mid",
    "start_date": "2026-04-01",
    "end_date": "2026-09-30",
    "allocation_slots": 2,
    "status": "planned"
  }
]
```

---

## Project Detail

```
GET /api/v1/projects/{id}
```

Response `200 OK`:

```json
{
  "id": "uuid",
  "name": "Project Alpha",
  "description": "Migration of legacy system to microservices",
  "required_skills": ["Python", "FastAPI"],
  "required_level": "mid",
  "start_date": "2026-04-01",
  "end_date": "2026-09-30",
  "allocation_slots": 2,
  "status": "planned",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

Response `404 Not Found`:

```json
{
  "error": {
    "code": "not_found",
    "message": "Project not found"
  }
}
```

---

# 3. Allocation API

## Generate Recommendation

```
POST /api/v1/allocations/recommend
```

Request:

```json
{
  "project_id": "uuid"
}
```

Response `200 OK`:

```json
{
  "project_id": "uuid",
  "recommendations": [
    {
      "engineer_id": "uuid",
      "engineer_name": "John Doe",
      "overall_score": 0.91,
      "skill_match_score": 0.95,
      "level_match_score": 0.88,
      "availability_score": 0.90,
      "recommended": true,
      "explanation": "Strong Python background and available immediately.",
      "risk_notes": "Minor timezone overlap with team in Singapore."
    }
  ]
}
```

Response `404 Not Found` (project not found):

```json
{
  "error": {
    "code": "not_found",
    "message": "Project not found"
  }
}
```

---

## Get Recommendations for Project

```
GET /api/v1/allocations/recommendations/{project_id}
```

Response `200 OK`:

```json
{
  "project_id": "uuid",
  "recommendations": [
    {
      "engineer_id": "uuid",
      "engineer_name": "John Doe",
      "overall_score": 0.91,
      "recommended": true,
      "explanation": "...",
      "risk_notes": "..."
    }
  ]
}
```

Response `404 Not Found`:

```json
{
  "error": {
    "code": "not_found",
    "message": "Project not found"
  }
}
```

---

## Confirm Allocation

```
POST /api/v1/allocations/confirm
```

Request:

```json
{
  "engineer_id": "uuid",
  "project_id": "uuid",
  "allocation_percentage": 100,
  "start_date": "2026-04-01",
  "end_date": "2026-09-30"
}
```

Response `201 Created`:

```json
{
  "id": "uuid",
  "engineer_id": "uuid",
  "project_id": "uuid",
  "allocation_percentage": 100,
  "start_date": "2026-04-01",
  "end_date": "2026-09-30",
  "status": "active",
  "created_at": "2026-03-17T00:00:00Z"
}
```

Response `400 Bad Request` (allocation cap exceeded):

```json
{
  "error": {
    "code": "allocation_cap_exceeded",
    "message": "Engineer total allocation would exceed 100%"
  }
}
```

---

## Active Allocations

```
GET /api/v1/allocations/active
```

Response `200 OK`:

```json
[
  {
    "id": "uuid",
    "engineer_id": "uuid",
    "engineer_name": "John Doe",
    "project_id": "uuid",
    "project_name": "Project Alpha",
    "allocation_percentage": 100,
    "start_date": "2026-04-01",
    "end_date": "2026-09-30",
    "status": "active"
  }
]
```

---

# 4. Bench Forecast API

## List Bench Forecasts

```
GET /api/v1/bench/forecast
```

Response `200 OK`:

```json
[
  {
    "engineer_id": "uuid",
    "engineer_name": "Jane Smith",
    "risk_level": "high",
    "probability": 0.82,
    "forecast_date": "2026-05-01",
    "recommendation": "Prioritize for Project Beta allocation"
  }
]
```

---

## Bench Alerts

```
GET /api/v1/bench/alerts
```

Returns engineers predicted to enter bench within the alert threshold window (default: 30 days).

Response `200 OK`:

```json
[
  {
    "engineer_id": "uuid",
    "engineer_name": "Jane Smith",
    "bench_start_date": "2026-04-15",
    "days_until_bench": 12,
    "risk_level": "high"
  }
]
```

---

# 5. Reports API

## Shortage Report

```
GET /api/v1/reports/shortage
```

Response `200 OK`:

```json
[
  {
    "skill": "Python",
    "required": 10,
    "available": 4,
    "gap": 6
  },
  {
    "skill": "React",
    "required": 5,
    "available": 5,
    "gap": 0
  }
]
```

---

# 6. Dashboard API

## Dashboard Stats

```
GET /api/v1/dashboard/stats
```

Response `200 OK`:

```json
{
  "total_engineers": 42,
  "engineers_on_bench": 5,
  "active_projects": 8,
  "allocation_rate_percentage": 88
}
```

**Note (Phase 5):** Returns mock static values.

---

# 7. Health Check

```
GET /api/v1/health
```

No authentication required.

Response `200 OK`:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

# 8. Error Response Format

All APIs must return standardized error responses.

Format:

```json
{
  "error": {
    "code": "error_code_snake_case",
    "message": "Human-readable description"
  }
}
```

## Standard Error Codes

| HTTP Status | Code | Description |
| --- | --- | --- |
| 400 | `validation_error` | Request body or params failed validation |
| 400 | `invalid_csv` | CSV file structure is invalid |
| 400 | `allocation_cap_exceeded` | Allocation would exceed 100% |
| 401 | `unauthorized` | Missing or invalid JWT token |
| 403 | `forbidden` | Authenticated but insufficient role |
| 404 | `not_found` | Resource does not exist |
| 413 | `file_too_large` | Uploaded file exceeds size limit |
| 422 | `unprocessable_entity` | Semantically invalid request |
| 500 | `internal_error` | Unexpected server error |

---

# 9. HTTP Status Code Summary

| Method | Success | Created | Not Found | Validation Error |
| --- | --- | --- | --- | --- |
| GET | 200 | — | 404 | — |
| POST (create) | — | 201 | — | 400/422 |
| POST (action) | 200 | — | 404 | 400 |
| POST (upload) | 200 | — | — | 400/413 |
