# Test Plan — {{TICKET_ID}}: {{Tên Tính Năng}}

> **Hướng dẫn:** Đặt file tại `docs/changes/{{TICKET_ID}}/test-plan.md`.
> Viết test plan trước hoặc song song với implementation.
> Mỗi AC trong spec-pack phải có ít nhất 1 test case.

**Ticket:** {{TICKET_ID}}
**Spec-pack:** `docs/changes/{{TICKET_ID}}/spec-pack.md`
**Ngày tạo:** {{YYYY-MM-DD}}

---

## 1. Phạm vi Test

| Tầng | Bao phủ | Công cụ |
|------|---------|---------|
| Backend Unit | {{Mô tả — ví dụ: BenchPredictionEngine.predict_bench()}} | pytest |
| Backend Integration | {{Mô tả — ví dụ: POST /api/v1/engineers/upload}} | pytest + httpx |
| Frontend Unit | {{Mô tả — ví dụ: LoginForm submit handler}} | Jest + RTL |
| E2E | {{Mô tả — ví dụ: Login flow, CSV upload flow}} | Playwright |

---

## 2. Test Cases — Backend

### 2.1 Unit Tests (Service Layer)

| TC# | Function | Input | Expected Output | AC# |
|-----|---------|-------|----------------|-----|
| UT-BE-01 | `{{BenchPredictionEngine.predict_bench}}` | `bench_start_date = today - 5` | `risk_level = "high"`, `is_alert = True` | AC-3 |
| UT-BE-02 | `{{BenchPredictionEngine.predict_bench}}` | `bench_start_date = None` | `risk_level = "low"`, `is_alert = False` | AC-3 |
| UT-BE-N | `{{function}}` | `{{input}}` | `{{expected}}` | {{AC#}} |

### 2.2 Integration Tests (Endpoint → DB)

| TC# | Endpoint | Method | Input | Status Code | Response | AC# |
|-----|---------|--------|-------|------------|---------|-----|
| IT-BE-01 | `/api/v1/engineers` | GET | — | 200 | `[]` (empty list) | AC-1 |
| IT-BE-02 | `/api/v1/engineers/upload` | POST | valid CSV | 200 | `{"inserted": 1, ...}` | AC-2 |
| IT-BE-03 | `/api/v1/engineers/upload` | POST | file > 10MB | 413 | `{"error": {"code": "FileTooLarge"}}` | AC-2 |
| IT-BE-04 | `/api/v1/allocations/confirm` | POST | total% > 100 | 400 | `{"error": {"code": "AllocationCapExceeded"}}` | AC-N |
| IT-BE-N | `{{endpoint}}` | `{{method}}` | `{{input}}` | `{{code}}` | `{{response}}` | `{{AC#}}` |

---

## 3. Test Cases — Frontend

### 3.1 Unit Tests

| TC# | Component / Hook | Scenario | Expected | AC# |
|-----|-----------------|---------|---------|-----|
| UT-FE-01 | `{{LoginForm}}` | Submit với email + password → gọi `onSubmit` | `onSubmit` được gọi 1 lần | AC-4 |
| UT-FE-02 | `{{ErrorAlert}}` | Click X → gọi `onDismiss` | `onDismiss` được gọi | AC-5 |
| UT-FE-N | `{{component}}` | `{{scenario}}` | `{{expected}}` | `{{AC#}}` |

### 3.2 E2E Tests

| TC# | Flow | Pre-condition | Steps | Expected | AC# |
|-----|------|-------------|-------|---------|-----|
| E2E-01 | Login flow | Stack running, chưa login | 1. Vào /login<br>2. Điền credentials<br>3. Submit | Redirect về /dashboard | AC-4 |
| E2E-02 | Error display | Stack running, chưa login | 1. Submit credentials sai<br>2. Xem error | Error alert hiển thị, có nút X | AC-5 |
| E2E-03 | Auth redirect | Stack running, chưa login | Vào /dashboard | Redirect về /login | AC-1 |
| E2E-N | `{{flow}}` | `{{pre-condition}}` | `{{steps}}` | `{{expected}}` | `{{AC#}}` |

---

## 4. Test Data

| Loại data | Giá trị | Mục đích |
|----------|---------|---------|
| Email hợp lệ | `test@example.com` | Login, CSV test |
| CSV hợp lệ | `name,email,primary_skill,level\nTest,test@t.com,Python,senior` | Upload test |
| CSV > 10MB | Binary blob 11MB | Size limit test |
| UUID không tồn tại | `00000000-0000-0000-0000-000000000099` | 404 test |
| Allocation > 100% | `percentage = 101` (sau khi đã có 1 allocation 100%) | Cap test |

---

## 5. Môi trường Test

| Tầng | Môi trường | Setup |
|------|-----------|-------|
| Backend UT/IT | In-memory SQLite | `conftest.py` fixture tự tạo schema |
| E2E | Docker Compose | `docker compose up` → chờ healthy |
| CI | GitHub Actions | `backend-test` job chạy pytest; E2E chưa có CI job |

---

## 6. Out of Scope (Không test trong ticket này)

- {{Danh sách những gì không test}}
- Ví dụ: LLM scoring (Phase 6+ — mock endpoint)
- Ví dụ: Real JWT authentication (SD-1 chưa resolve)
- Ví dụ: Performance / load tests
