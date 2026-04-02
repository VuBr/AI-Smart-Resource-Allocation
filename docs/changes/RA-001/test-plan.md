# Test Plan — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** 2.0 (Phase 6 — đầy đủ)
**Ngày tạo:** 2026-03-25
**Ngày cập nhật:** 2026-04-01

---

## 1. Phạm vi Test

Kế hoạch này áp dụng cho **Phase 5 Scaffold** — xác minh rằng hệ thống scaffold chạy đúng, các endpoint hoạt động đúng HTTP status codes, database schema đúng, và UI render không lỗi.

**Không thuộc phạm vi Phase 5:**
- Real LLM scoring accuracy
- Real auth security testing
- Performance load testing
- Pagination behavior
- Multi-org scenarios

---

## 2. Test Strategy

### 2.1 Test Pyramid

```
         [E2E]          ← Ít nhất, chi phí cao
        [IT]  [BB]      ← Trung bình
    [UT]  [UT]  [UT]    ← Nhiều nhất, chi phí thấp
```

| Layer | Type | Tool | Phạm vi |
|-------|------|------|---------|
| Unit Tests (UT) | White-box | pytest (backend) / Jest (frontend) | Services, utilities, individual functions |
| Integration Tests (IT) | White-box | pytest + httpx / TestClient | API endpoints + DB, auth flow |
| Black-box Tests (BB) | Black-box | Manual / httpx script | AC-based, từ góc nhìn user |
| E2E Tests (E2E) | Black-box | Playwright | Full stack startup, happy path + representative abnormal |

### 2.2 Test Coverage Target — AC Mapping đầy đủ

| AC | Mô tả ngắn | Test type bảo đảm nó | Priority |
|----|-----------|---------------------|---------|
| AC-1 | Docker Compose: 4 services healthy | E2E (Playwright) | P0 |
| AC-2 | Backend structure đúng | IT (FastAPI boot) | P0 |
| AC-3 | `GET /api/v1/health` → 200 | IT, BB | P0 |
| AC-4 | 10 frontend routes render | E2E | P1 |
| AC-5 | Auth login mock JWT | IT (auth endpoints) | P0 |
| AC-6 | Engineer CSV upload: validate + 413 | UT (CSVIngestionService) + IT | P0 |
| AC-7 | List engineers | IT | P1 |
| AC-8 | Engineer detail 200 / 404 | IT | P1 |
| AC-9 | Project CSV upload: validate + 413 | UT (CSVIngestionService) + IT | P0 |
| AC-10 | Alembic migration: 6 tables | IT (DB schema check) | P0 |
| AC-11 | Recommend + confirm (100% cap) | IT (allocations) | P0 |
| AC-12 | Active allocations list | IT | P1 |
| AC-13 | Bench alerts: 30-day threshold | UT (BenchPredictionEngine) + IT | P0 |
| AC-14 | Bench forecast per engineer | IT | P1 |
| AC-15 | Skill shortage report | IT | P1 |
| AC-16 | TypeScript: tsc + eslint | Quality gate | P0 |
| AC-17 | Python: ruff + black + type hints | Quality gate | P0 |
| AC-18 | CI pipeline | E2E (CI run) | P1 |
| AC-19 | Structured JSON logging: 8 events | IT (log output verify) | P0 |
| AC-20 | Test suite: UT + IT + E2E pass | All layers | P0 |

---

## 3. Pre-conditions (Điều kiện tiên quyết)

**Trước khi chạy bất kỳ test nào:**
1. `docker compose up` — tất cả 4 services ở trạng thái healthy
2. `alembic upgrade head` — database migration đã chạy
3. Seed script đã chạy — `apps/api/scripts/seed.py`
4. `.env` đã được tạo từ `.env.example` với test values

**Kiểm tra health:**
```bash
curl http://localhost:8000/api/v1/health
# Expected: {"status":"ok","version":"1.0.0"}

curl http://localhost:3000
# Expected: HTML page (login or dashboard)
```

---

## 4. Unit Tests (UT)

### 4.1 Backend (pytest)

Mỗi test phải bảo vệ **AC và boundary**, không copy implementation.

| Test file | Test cases | AC bảo vệ |
|-----------|-----------|-----------|
| `tests/test_bench_prediction.py` | bench_start_date=None → is_alert=False; today+31 → no alert; today+30 → alert (boundary); today+7 → high risk; today-1 → already benched | AC-13 (Blocker) |
| `tests/test_csv_ingestion.py` | MIME không hợp lệ → ValueError; size >10MB → OverflowError; valid CSV ≤10MB → result có đủ keys | AC-6, AC-9 |
| `tests/test_llm_scoring.py` | Stub có đủ fields: score, skill_match, experience_match, availability_match; `llm_provider="stub"`, `model_version="stub-v0"` | AC-13 (LLM stub) |
| `tests/test_security.py` | `create_access_token()` trả về non-empty string; `decode_token()` valid token → có key "sub"; `decode_token("")` → ValueError | AC-5 |

### 4.2 Frontend (Jest)

| Test file | Test cases | AC bảo vệ |
|-----------|-----------|-----------|
| `__tests__/api-client.test.ts` | Bearer token được inject vào Authorization header khi token tồn tại; không inject khi không có token | AC-5 |
| `__tests__/auth-guard.test.ts` | `useAuthGuard` redirect về `/login` khi không có token; không redirect khi có token | AC-5 |

---

## 5. Integration Tests (IT)

### Backend API Tests (pytest + httpx/TestClient + SQLite in-memory)

**Auth:**
```
POST /api/v1/auth/login
  - valid body {email, password} → 200, token trong body
  - malformed body (thiếu field) → 422
```

**Engineers:**
```
GET  /api/v1/engineers → 200, list
GET  /api/v1/engineers/{valid_id} → 200
GET  /api/v1/engineers/{invalid_id} → 404, error.code="EngineerNotFound"
POST /api/v1/engineers/upload (valid CSV ≤10MB) → 200, {inserted,updated,skipped,errors}
POST /api/v1/engineers/upload (>10MB file) → 413
POST /api/v1/engineers/upload (non-CSV file) → 400
GET  /api/v1/engineers/{valid_id}/bench-forecast → 200
GET  /api/v1/engineers/{invalid_id}/bench-forecast → 404
```

**Projects:**
```
GET  /api/v1/projects → 200, list
GET  /api/v1/projects/{valid_id} → 200
GET  /api/v1/projects/{invalid_id} → 404, error.code="ProjectNotFound"
POST /api/v1/projects/upload (valid CSV) → 200
POST /api/v1/projects/upload (>10MB) → 413
```

**Allocations:**
```
POST /api/v1/allocations/recommend → 200, {recommendations: list}
GET  /api/v1/allocations/recommendations/{project_id} → 200
GET  /api/v1/allocations/recommendations/{invalid_id} → 404
POST /api/v1/allocations/confirm → 201
POST /api/v1/allocations/confirm (vượt 100%) → 400, error.code="AllocationCapExceeded"
GET  /api/v1/allocations/active → 200
```

**Bench:**
```
GET /api/v1/bench/forecast → 200, list
GET /api/v1/bench/alerts → 200, list
```

**Reports:**
```
GET /api/v1/reports/shortage → 200, list (có fields: skill, required, available, gap)
```

**Health & Dashboard:**
```
GET /api/v1/health → 200, {status:"ok"}
GET /api/v1/dashboard/stats → 200, {total_engineers, engineers_on_bench, active_projects, allocation_rate_percentage}
```

---

## 6. Black-box Tests (BB)

Xem chi tiết trong `docs/changes/RA-001/blackbox-testcases.md`.

**Tóm tắt:**
- 6 TCs từ spec-pack Examples (NC-1/2, AB-1/2, BV-1/2)
- 20 TCs ánh xạ AC-1 → AC-20

---

## 7. E2E Tests (Playwright)

**Nguyên tắc:** Tối thiểu số lượng, tối đa giá trị — chỉ main user flows + representative abnormal cases.

### E2E-001: Full Stack Startup (AC-1, AC-2, AC-3)
**Pre-condition:** `docker compose up`
1. `curl http://localhost:8000/api/v1/health` → 200, `{"status":"ok","version":"1.0.0"}`
2. Truy cập `http://localhost:3000` → load HTML thành công
3. Playwright: `page.goto('http://localhost:3000')` → không có JS error

### E2E-002: Auth + Dashboard Flow (AC-4, AC-5)
**Normal path:**
1. Truy cập `http://localhost:3000/dashboard` trực tiếp
2. Redirect tự động về `/login` (auth guard)
3. Form login render — có email + password input + submit button
4. Nhập bất kỳ email/password → submit
5. Redirect về `/dashboard`
6. KPI cards hiển thị (selector: `[data-testid="kpi-card"]` hoặc text matching)

**Abnormal:** Truy cập `/engineers` khi chưa login → redirect về `/login`

### E2E-003: CSV Upload Flow (AC-6, AC-9)
1. Login → truy cập `/upload`
2. Upload valid CSV file ≤10MB
3. Kiểm tra success message hiển thị
4. Upload file >10MB → error message "File exceeds maximum"

### E2E-004: Engineer List (AC-7, AC-11)
1. Login → truy cập `/engineers`
2. Bảng engineer render (không lỗi)
3. Truy cập `/allocation` → page render

**File:** `apps/web/e2e/scaffold.spec.ts`

---

## 8. Test Environment

| Component | Giá trị |
|-----------|--------|
| OS | Windows 10 / Linux (via Docker) |
| Docker Compose version | ≥ 2.0 |
| Node.js | ≥ 18.x |
| Python | 3.11+ |
| PostgreSQL | 15 (via Docker) |
| Redis | 7 (via Docker) |
| BE Test database | SQLite in-memory (pytest) |
| FE Test runner | Jest + jsdom |
| E2E runner | Playwright (Chromium) |

**Test data:** Xem `docs/changes/RA-001/test-data.md`

---

## 9. Tiêu chí Pass/Fail

**Phase 5 Scaffold PASS khi:**
- Tất cả P0 test cases pass
- Tất cả P1 test cases pass
- `tsc --noEmit` zero errors
- `eslint .` zero errors
- `pytest` all pass
- `npm test` all pass (FE UT)
- `docker compose up` all healthy

**Phase 5 Scaffold FAIL nếu:**
- Bất kỳ P0 test case nào fail
- `docker compose up` không healthy
- Database migration fail
- `tsc --noEmit` có errors

---

## 10. Self-check: Góc nhìn test còn thiếu (đối chiếu review-checklist)

| Checklist item | Test bảo đảm | Ghi chú |
|---------------|-------------|---------|
| N-1: UT cho CSVIngestionService | `test_csv_ingestion.py` | MIME, size, valid parse |
| N-2: UT cho BenchPredictionEngine (Blocker) | `test_bench_prediction.py` | 5 boundary cases |
| N-3: UT cho AllocationRecommendationOrchestrator | `test_allocations.py` (IT) | Stub → IT đủ cho Phase 5 |
| N-4: IT tất cả 17 endpoints | Tất cả test_*.py | Đủ sau Phase 6 |
| N-5: IT error paths (404, 400, 413) | test_engineers, test_projects, test_allocations | |
| N-6: E2E docker compose healthy (Blocker) | E2E-001 | Cần docker running |
| N-7: BB TCs NC-1/2, AB-1/2, BV-1/2 | blackbox-testcases.md | Manual execution |
| N-8: next build thành công | Quality gate | `npm run build` |
| N-9: test fixtures dùng seed data | conftest.py SQLite | Seed trong individual tests |
| N-10: pytest output trong test-results.md | Bước 6 | Sau khi chạy |
| F-1: Mock JWT comment | test_security.py (check token format) | Comment checked in code review |
| M-1: Error format `{error:{code,message}}` | test_engineers 404, test_allocations 400 | |
| L-1: Structured JSON logging | IT log capture | Logging tests qua log output |
