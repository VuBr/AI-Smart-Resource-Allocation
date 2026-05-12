# Sources — RA-013: Upload Engineers CSV (Real Implementation)

**Version:** 1.0
**Date:** 2026-04-18
**Status:** Final

---

## Authoritative Sources

| # | Source | Path | Vai trò |
|---|--------|------|---------|
| S-1 | RA-013 Summary | `docs/changes/RA-013/Raw/summary.md` | Primary requirement source |
| S-2 | RA-012 Spec Pack | `docs/changes/RA-012/spec-pack.md` | Pattern reference — reuse tối đa |
| S-3 | RA-012 Impl Plan | `docs/changes/RA-012/impl-plan.md` | Implementation pattern reference |
| S-4 | Engineer model | `apps/api/app/models/engineer.py` | DB schema authoritative |
| S-5 | ProjectCsvRow schema | `apps/api/app/schemas/project.py` | Pydantic pattern reference |
| S-6 | csv_ingestion.py | `apps/api/app/services/csv_ingestion.py` | parse_engineers_csv stub + parse_projects_csv real impl |
| S-7 | engineers.py router | `apps/api/app/api/v1/routers/engineers.py` | Existing router stub |
| S-8 | project_repository.py | `apps/api/app/repositories/project_repository.py` | upsert pattern reference |
| S-9 | ProjectCsvRow validator | `apps/api/app/schemas/project.py` | _coerce_and_strip, field_validator patterns |
| S-10 | engineers_300.csv | `docs/changes/RA-013/Raw/engineers_300.csv` | Test data |
| S-11 | CsvColumnReference.tsx | `apps/web/features/upload/CsvColumnReference.tsx` | Frontend reference — engineerColumns đã có |
| S-12 | upload/page.tsx | `apps/web/app/upload/page.tsx` | Frontend banner reference |

---

## Conflicts & Resolutions

### C-1: Response format trong summary khác Projects

**Summary gốc đề xuất:** `total_rows / inserted_rows / failed_rows / errors[{row, field, error}]`

**Projects dùng:** `inserted / updated / skipped / errors["Row N: field — reason"]`

**Resolution (2026-04-18, user decision):** Dùng format giống Projects — `inserted / updated / skipped / errors[]`. Summary đã được cập nhật.

---

### C-2: Duplicate email behavior — trong file vs DB

**Summary gốc:** không rõ duplicate email trong cùng file xử lý thế nào.

**Resolution (2026-04-18, user decision):**
- Duplicate email trong cùng file → skip row sau, chỉ process row đầu tiên
- Email trùng trong DB → UPDATE (upsert by email, giống Projects upsert by name)

---

### C-3: engineerColumns trong CsvColumnReference.tsx hiện tại

**Hiện tại:** `engineerColumns` dùng `employee_id, full_name, email, level, skills, department` — **sai so với schema Engineer thực tế**.

**Schema thực tế (S-4):** `name, email, primary_skill, secondary_skills, level, years_of_experience, availability_percentage, bench_start_date`

**Resolution:** Rewrite `engineerColumns` trong `CsvColumnReference.tsx` đúng với schema Engineer (giống cách RA-012 rewrite `projectColumns`).
