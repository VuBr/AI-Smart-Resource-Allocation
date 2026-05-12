# ui-screen-spec.md

## UI Screen Specification

AI Smart Resource Allocation & Bench Prediction System

This document defines the **screen-level specifications** for the frontend application.
Each screen describes its **purpose, main components, API dependencies, and expected behavior**.

Frontend is implemented using:

* Next.js App Router
* TypeScript
* TailwindCSS
* shadcn/ui

---

# 1. Application Layout

All authenticated pages share a common **Application Shell**.

## Layout Structure

```
Sidebar | Header
-------------------------
Main Content Area
```

## Sidebar Navigation

Navigation menu items:

* Dashboard → `/dashboard`
* Engineers → `/engineers`
* Upload Data → `/upload`
* Projects → `/projects`
* Allocation → `/allocation`
* Bench Forecast → `/bench-forecast`
* Reports → `/reports`

## Header

Contains:

* Application name / logo
* Current user name and role badge
* Logout button

## Global UI States

Each page must support:

### Loading State

Display skeleton loader or spinner while API call is in progress.

### Empty State

Display informative message when no data is available.

### Error State

Display error message with retry button when API call fails.

---

# 2. Dashboard Screen

## Route

```
/dashboard
```

## Purpose

Provides a **high-level overview** of resource utilization and project demand.

## Components

* KPI cards row
* Bench alerts panel
* Recent allocations table

## KPI Cards

| Card | Value Source |
| --- | --- |
| Total Engineers | `GET /api/v1/dashboard/stats` → `total_engineers` |
| Engineers on Bench | `GET /api/v1/dashboard/stats` → `engineers_on_bench` |
| Active Projects | `GET /api/v1/dashboard/stats` → `active_projects` |
| Allocation Rate % | `GET /api/v1/dashboard/stats` → `allocation_rate_percentage` |

## Bench Alert Panel

Displays engineers predicted to enter bench within the next 30 days.

Columns: Engineer Name, Bench Start Date, Days Until Bench, Risk Level

## Recent Allocations

Displays current active engineer–project assignments.

Columns: Engineer, Project, Allocation %, Start Date, End Date

## API Dependencies

```
GET /api/v1/dashboard/stats
GET /api/v1/bench/alerts
GET /api/v1/allocations/active
```

---

# 3. Engineers List Screen

## Route

```
/engineers
```

## Purpose

Displays all engineers and their current availability status.

## Components

* Engineer table
* Availability status badge
* "View Details" action link

## Table Columns

| Column | Description |
| --- | --- |
| Name | Engineer full name |
| Primary Skill | Main expertise |
| Level | junior / mid / senior |
| Availability % | Current availability percentage |
| Bench Start Date | Expected bench date (if applicable) |
| Location | Engineer location |
| Actions | "View Details" link to `/engineers/[id]` |

## API Dependencies

```
GET /api/v1/engineers
```

---

# 4. Engineer Detail Screen

## Route

```
/engineers/[id]
```

## Purpose

Displays detailed information about a specific engineer including bench forecast.

## Components

* Engineer info card (name, email, level, skills, location)
* Availability indicator
* Active allocations list
* Bench forecast panel

## Engineer Info Card

Displays all fields from the Engineer entity.

## Active Allocations

Lists current project assignments for this engineer.

Columns: Project Name, Allocation %, Start Date, End Date, Status

## Bench Forecast Panel

Shows current bench risk prediction.

Fields: Forecast Date, Risk Level badge, Probability, Recommendation

## API Dependencies

```
GET /api/v1/engineers/{id}
GET /api/v1/engineers/{id}/bench-forecast
```

---

# 5. Upload Data Screen

## Route

```
/upload
```

## Purpose

Allows managers to upload CSV files containing engineers and project requirements.

## Components

* Upload engineers CSV section
* Upload projects CSV section
* Import result summary panel

## Upload Section

Each upload section contains:

* File drop zone (accepts .csv only)
* File size limit indicator (max 10MB)
* Submit button
* Import result summary (shown after upload)

## Import Result Summary

```
Inserted: 10
Updated: 3
Skipped: 1
Errors: 0
```

If errors exist, display error list with row numbers and messages.

## Validation Feedback

* If non-CSV file is selected: show inline error "Only .csv files are accepted"
* If file exceeds 10MB: show inline error "File must not exceed 10MB"
* If CSV has missing required columns: display column name in error list

## API Dependencies

```
POST /api/v1/engineers/upload
POST /api/v1/projects/upload
```

## Role Visibility

Upload section is **hidden** for Viewer role.

---

# 6. Projects List Screen

## Route

```
/projects
```

## Purpose

Displays all projects and their staffing status.

## Components

* Project table
* Status filter (planned / active / closed)
* Status badges
* "View Details" action link

## Table Columns

| Column | Description |
| --- | --- |
| Project Name | Name of the project |
| Required Skills | Skill tags |
| Required Level | Minimum level badge |
| Allocation Slots | Number needed |
| Start Date | Project start |
| End Date | Project end |
| Status | planned / active / closed badge |
| Actions | "View Details" link to `/projects/[id]` |

## API Dependencies

```
GET /api/v1/projects
```

---

# 7. Project Detail Screen

## Route

```
/projects/[id]
```

## Purpose

Displays detailed information about a project and allows triggering allocation recommendations.

## Components

* Project overview card
* Skill requirements list
* Current allocations table
* "Generate Recommendations" button (Manager and Admin only)
* Recommendations panel (shown after generation)

## Project Overview Card

Displays: Name, Description, Required Skills, Required Level, Start Date, End Date, Allocation Slots, Status

## Recommendations Panel

Displayed after clicking "Generate Recommendations".

Shows recommendation cards sorted by `overall_score` descending.

Each card shows:

```
Engineer: John Doe
Skill Score: 0.95
Level Score: 0.88
Availability Score: 0.90
Overall Score: 0.91
Explanation: Strong Python background...
Risk Notes: Minor timezone overlap...
[Confirm Allocation] button
```

## API Dependencies

```
GET /api/v1/projects/{id}
POST /api/v1/allocations/recommend
GET /api/v1/allocations/recommendations/{project_id}
```

---

# 8. Allocation Screen

## Route

```
/allocation
```

## Purpose

Displays all active engineer–project allocations and allows confirming new allocations.

## Components

* Project selector dropdown
* Recommendation list (after project selected)
* Score breakdown per recommendation card
* Explanation panel
* Confirm allocation button

## Recommendation Card

```
Engineer: John Doe
Skill Score: 0.92
Level Score: 0.85
Availability Score: 0.90
Overall Score: 0.88
Risk Notes: Minor availability overlap
[Confirm Allocation]
```

## Confirm Flow

1. Manager clicks "Confirm Allocation" on a recommendation card.
2. Confirmation dialog shows: Engineer name, Project name, allocation percentage input.
3. On confirm, call `POST /api/v1/allocations/confirm`.
4. On success, show success toast and reload active allocations.

## API Dependencies

```
POST /api/v1/allocations/recommend
POST /api/v1/allocations/confirm
GET /api/v1/allocations/active
```

## Role Visibility

"Confirm Allocation" button is **hidden** for Viewer role.

---

# 9. Bench Forecast Screen

## Route

```
/bench-forecast
```

## Purpose

Displays engineers predicted to become bench soon.

## Components

* Forecast table
* Risk level filter (low / medium / high)
* Risk level badges (color coded: green / yellow / red)
* Recommendation text per row

## Table Columns

| Column | Description |
| --- | --- |
| Engineer Name | Name with link to `/engineers/[id]` |
| Forecast Date | Date prediction was made |
| Risk Level | low / medium / high badge |
| Probability | Percentage display |
| Recommendation | Suggested action text |

## API Dependencies

```
GET /api/v1/bench/forecast
```

---

# 10. Reports Screen

## Route

```
/reports
```

## Purpose

Displays reports about **skill shortages and workforce demand**.

## Components

* Skill shortage table
* Gap indicator (color coded: green if gap = 0, red if gap > 0)
* Export report button

## Shortage Table Columns

| Column | Description |
| --- | --- |
| Skill | Skill name |
| Required | Total engineers required across projects |
| Available | Engineers with this skill currently available |
| Gap | Required minus Available |

## Export

Export button downloads current shortage table as CSV.

## API Dependencies

```
GET /api/v1/reports/shortage
```

---

# 11. Login Screen

## Route

```
/login
```

## Purpose

Allows user authentication before accessing the application.

## Behavior

* Unauthenticated users are redirected to `/login`
* After successful login, redirect to `/dashboard`
* Error message shown for invalid credentials

## Components

* Email input field
* Password input field
* Login button
* Error message area

## API Dependencies

```
POST /api/v1/auth/login
```

---

# 12. Route Summary

| Route | Auth Required | Roles |
| --- | --- | --- |
| /login | No | — |
| /dashboard | Yes | admin, manager, viewer |
| /engineers | Yes | admin, manager, viewer |
| /engineers/[id] | Yes | admin, manager, viewer |
| /upload | Yes | admin, manager |
| /projects | Yes | admin, manager, viewer |
| /projects/[id] | Yes | admin, manager, viewer |
| /allocation | Yes | admin, manager, viewer |
| /bench-forecast | Yes | admin, manager, viewer |
| /reports | Yes | admin, manager, viewer |

---

# 13. Role Visibility Matrix

| Feature | Admin | Manager | Viewer |
| --- | --- | --- | --- |
| Upload CSV | ✓ | ✓ | ✗ |
| Generate Allocation | ✓ | ✓ | ✗ |
| Confirm Allocation | ✓ | ✓ | ✗ |
| View Engineers | ✓ | ✓ | ✓ |
| View Projects | ✓ | ✓ | ✓ |
| View Reports | ✓ | ✓ | ✓ |
| View Bench Forecast | ✓ | ✓ | ✓ |
| View Dashboard | ✓ | ✓ | ✓ |
