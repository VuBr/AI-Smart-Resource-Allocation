# Test Results — RA-012: Upload Project CSV

> Điền sau khi chạy tests. Mỗi test run tạo một entry mới.

**Ticket:** RA-012
**Spec-pack:** `docs/changes/RA-012/spec-pack.md`

---

## Run #1

**Ngày:** *(fill in)*
**Branch / Commit:** *(fill in)*
**Người chạy:** *(fill in)*

### Backend Tests

```
pytest apps/api/tests/ -q

# Paste output here
```

**Kết quả:** ✅ All pass / ❌ *(N)* failed

**Failed tests (nếu có):**
| Test | Reason |
|------|--------|
| *(fill in)* | *(fill in)* |

---

### Quality Gates

| Gate | Command | Output | Kết quả |
|------|---------|--------|---------|
| Backend lint | `ruff check apps/api` | | ✅ / ❌ |
| Backend format | `black --check apps/api` | | ✅ / ❌ |
| Backend tests | `pytest apps/api/tests/ -q` | | ✅ / ❌ |
| Frontend typecheck | `tsc --noEmit` | | ✅ / ❌ |
| Frontend lint | `npm run lint` | | ✅ / ❌ |
| Frontend build | `npm run build` | | ✅ / ❌ |

---

### E2E / Manual Tests

| BB# | Mô tả | Kết quả | Ghi chú |
|-----|-------|---------|---------|
| BB-01 | Upload non-CSV → 400 InvalidCsv | ✅ / ❌ / SKIP | |
| BB-02 | Upload > 10MB → 413 FileTooLarge | ✅ / ❌ / SKIP | |
| BB-03 | Upload 25 rows → inserted=25 | ✅ / ❌ / SKIP | |
| BB-04 | Upload lại → updated=25 | ✅ / ❌ / SKIP | |
| BB-05 | headcount=0 → skipped=1 | ✅ / ❌ / SKIP | |
| BB-06 | required_level=expert → skipped=1 | ✅ / ❌ / SKIP | |
| BB-07 | end_date < start_date → skipped=1 | ✅ / ❌ / SKIP | |
| BB-08 | name rỗng → skipped=1 | ✅ / ❌ / SKIP | |
| BB-09 | Header thiếu name → 400 | ✅ / ❌ / SKIP | |
| BB-10 | 20 valid + 3 invalid → skipped=3 | ✅ / ❌ / SKIP | |
| BB-11 | Latin-1 file → 400 InvalidEncoding | ✅ / ❌ / SKIP | |
| BB-12 | Column list đúng trên /upload | ✅ / ❌ / SKIP | |
| BB-13 | Optional fields trống → null | ✅ / ❌ / SKIP | |
| BB-14 | File đúng 10MB → 200 | ✅ / ❌ / SKIP | |
| BB-15 | Upsert update fields | ✅ / ❌ / SKIP | |
| BB-16 | Upsert overwrite với null | ✅ / ❌ / SKIP | |

---

### Tóm tắt Run #1

**Backend tests:** *(N passed, N failed)*
**Quality gates:** *(all pass / N failed)*
**E2E/Manual:** *(N pass, N fail, N skip)*

**Vấn đề phát sinh:** *(ghi nếu có)*

**Hành động tiếp theo:** *(fix / re-run / merge)*
