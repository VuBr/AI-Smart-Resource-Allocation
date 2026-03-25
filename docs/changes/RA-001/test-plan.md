# Test Plan — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** Draft 1.0 (Phase 2)
**Ngày:** 2026-03-25

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
| E2E Tests (E2E) | Black-box | Docker Compose + manual | Full stack startup, happy path |

### 2.2 Test Coverage Target

| AC | Type | Priority |
|----|------|---------|
| AC-1 (Docker startup) | E2E | P0 |
| AC-2 (App access) | E2E | P0 |
| AC-3 (Health endpoint) | IT, BB | P0 |
| AC-4 (Route structure) | E2E, BB | P1 |
| AC-5 (Layout) | E2E | P1 |
| AC-6 (UI components) | UT | P2 |
| AC-7 (FastAPI boot) | IT | P0 |
| AC-8 (Routers registered) | IT | P0 |
| AC-9 (API stubs) | IT, BB | P0 |
| AC-10 (DB schema) | IT | P0 |
| AC-11 (Seed data) | IT, BB | P1 |
| AC-12 (CSV upload behavior) | IT, BB | P0 |
| AC-13 (LLM stub) | UT | P1 |
| AC-14 (Redis client) | IT | P1 |
| AC-15 (Structured logging) | IT | P1 |
| AC-16 (Lint/Format) | Quality gate | P0 |
| AC-17 (Type checking) | Quality gate | P0 |
| AC-18 (CI workflow) | E2E (CI run) | P1 |
| AC-19 (Auth stub) | IT, BB | P0 |
| AC-20 (CSV file size limit) | IT, BB | P0 |

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

### Backend (pytest)

| Test file | Test cases |
|-----------|-----------|
| `tests/test_csv_ingestion.py` | MIME type validation, size limit (413), valid file parse |
| `tests/test_bench_prediction.py` | 30-day threshold logic: bench trong 30 ngày → forecast; bench > 30 ngày → no alert |
| `tests/test_constraint_engine.py` | Hard constraint: allocation > 100% bị reject |
| `tests/test_llm_scoring.py` | Mock score có fields đúng, `llm_provider="stub"` |
| `tests/test_security.py` | `create_access_token()` trả về string; `decode_token()` không crash với valid format |

### Frontend (Jest)

| Test file | Test cases |
|-----------|-----------|
| `__tests__/api-client.test.ts` | Bearer token được inject vào headers |
| `__tests__/auth-guard.test.ts` | Redirect về `/login` khi không có token |

---

## 5. Integration Tests (IT)

### Backend API Tests (pytest + httpx/TestClient)

**Auth:**
```
POST /api/v1/auth/login
  - valid body → 200, trả về token
  - malformed body → 422
```

**Engineers:**
```
GET  /api/v1/engineers → 200, list có ≥5 records (sau seed)
GET  /api/v1/engineers/{valid_id} → 200
GET  /api/v1/engineers/{invalid_id} → 404
POST /api/v1/engineers/upload (valid CSV ≤10MB) → 200, {inserted,updated,skipped,errors}
POST /api/v1/engineers/upload (>10MB file) → 413
POST /api/v1/engineers/upload (non-CSV file) → 400 hoặc 422
```

**Projects:**
```
GET  /api/v1/projects → 200, list có ≥3 records (sau seed)
GET  /api/v1/projects/{valid_id} → 200
GET  /api/v1/projects/{invalid_id} → 404
POST /api/v1/projects/upload (valid CSV) → 200
POST /api/v1/projects/upload (>10MB) → 413
```

**Allocations:**
```
POST /api/v1/allocations/recommend → 200, list
GET  /api/v1/allocations/recommendations/{project_id} → 200
POST /api/v1/allocations/confirm → 201
GET  /api/v1/allocations/active → 200
```

**Bench:**
```
GET /api/v1/bench/forecast → 200, list
GET /api/v1/bench/alerts → 200, list (chứa engineers trong 30 ngày)
```

**Database:**
```
Sau alembic upgrade head: 6 tables tồn tại
Sau seed: engineers count ≥5, projects count ≥3
```

---

## 6. Black-box Tests (BB)

Xem chi tiết trong `docs/changes/RA-001/blackbox-testcases.md`.

**Tóm tắt:**
- 6 TCs từ spec-pack Examples (NC-1/2, AB-1/2, BV-1/2)
- 20 TCs ánh xạ AC-1 → AC-20

---

## 7. E2E Tests

**E2E-001: Full Stack Startup**
1. `docker compose up`
2. Chờ healthy state
3. `curl http://localhost:8000/api/v1/health` → 200
4. Truy cập `http://localhost:3000` → load trang

**E2E-002: Auth + Dashboard Flow**
1. Truy cập `http://localhost:3000/dashboard`
2. Redirect về `/login` (auth guard)
3. Nhập email/password bất kỳ → submit
4. Redirect về `/dashboard`
5. Kiểm tra KPI cards hiển thị

**E2E-003: CSV Upload Flow**
1. Truy cập `/upload`
2. Upload valid CSV file
3. Kiểm tra success message

**E2E-004: Engineer List**
1. Truy cập `/engineers`
2. Kiểm tra bảng có ≥5 rows

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
| Test database | DB trong Docker container |

**Test data:** Xem `docs/changes/RA-001/test-data.md`

---

## 9. Tiêu chí Pass/Fail

**Phase 5 Scaffold PASS khi:**
- Tất cả P0 test cases pass
- Tất cả P1 test cases pass
- `tsc --noEmit` zero errors
- `eslint .` zero errors
- `pytest` all pass
- `docker compose up` all healthy

**Phase 5 Scaffold FAIL nếu:**
- Bất kỳ P0 test case nào fail
- `docker compose up` không healthy
- Database migration fail
- `tsc --noEmit` có errors
