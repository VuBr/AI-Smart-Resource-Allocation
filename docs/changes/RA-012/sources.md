# RA-012 — Sources of Truth

**Established:** 2026-04-18
**Ticket:** RA-012 — Upload Project CSV (Backend + Frontend real implementation)

---

## Authoritative Documents

| # | Document | Role | Status |
|---|----------|------|--------|
| S-1 | `docs/changes/RA-012/Raw/summary.md` | Primary requirement input | Authoritative |
| S-2 | `docs/changes/RA-012/Raw/projects_25.csv` | Sample data (25 rows) | Authoritative — defines real-world CSV shape |
| S-3 | `apps/api/app/models/project.py` | DB model (SQLAlchemy) | Authoritative — defines accepted fields & constraints |
| S-4 | `apps/api/app/schemas/project.py` | Pydantic response schemas | Reference |
| S-5 | `apps/api/app/services/csv_ingestion.py` | Current stub implementation | Reference — to be replaced |
| S-6 | `apps/api/app/api/v1/routers/projects.py` | Existing upload endpoint | Reference — endpoint already wired |
| S-7 | `apps/api/app/repositories/project_repository.py` | Repository layer | Reference — `create()` exists, `upsert` needed |
| S-8 | `apps/web/app/upload/page.tsx` | Upload page (Next.js) | Reference — UI already exists |
| S-9 | `apps/web/features/upload/UploadZone.tsx` | Upload UI component | Reference — complete, no changes needed |
| S-10 | `apps/web/lib/services/projects.ts` | Frontend API client | Reference — `uploadProjects()` already wired |
| S-11 | `apps/api/tests/test_csv_ingestion.py` | Existing tests | Reference — covers stub only; must be extended |
| S-12 | `apps/api/app/core/config.py` | App config | Authoritative — `MAX_CSV_SIZE_MB = 10` |

---

## Conflicts & Resolutions

| ID | Conflict | Resolution |
|----|----------|-----------|
| C-1 | `upload/page.tsx` info banner lists `project_id` as a required column, but S-2 CSV and S-1 summary do NOT include `project_id` (id is auto-generated) | **Resolution (2026-04-18):** `project_id` must be removed from the UI column reference. The authoritative column list is from S-1/S-2: `name, description, required_skills, required_level, headcount, status, start_date, end_date`. |
| C-2 | Behavior when `name` duplicates an existing project was unspecified in S-1 | **Resolution (2026-04-18, user decision):** Duplicate `name` → **UPDATE** the existing record (upsert by name), do not insert a new row. |
| C-3 | `parse_projects_csv` in S-5 is a STUB (no parse, no DB write) | Not a conflict — this is the baseline to be replaced by RA-012. |
