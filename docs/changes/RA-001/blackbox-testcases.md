# Black-box Test Cases — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** Draft 1.0 (Phase 2)
**Ngày:** 2026-03-25

---

## Hướng dẫn

- **BB** = Black-box (từ góc nhìn người dùng/tester, không biết implementation)
- **IT** = Integration Test (biết endpoint nhưng test qua HTTP)
- **E2E** = End-to-End (test qua browser/full stack)
- **Priority:** P0 = phải pass, P1 = quan trọng, P2 = nice to have

---

## Nhóm 1: Normal Cases (từ spec-pack Examples)

### NC-1 — CSV Upload Engineers (Normal)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | NC-1 |
| **Type** | BB/IT |
| **Priority** | P0 |
| **AC** | AC-12 |
| **Precondition** | API server running, valid CSV file ≤ 10MB |
| **Input** | `POST /api/v1/engineers/upload` với file CSV hợp lệ (< 10MB, MIME: text/csv) |
| **Expected Output** | HTTP 200, body: `{"inserted":0,"updated":0,"skipped":0,"errors":[]}` |
| **Test Steps** | 1. Chuẩn bị CSV file 5 engineers hợp lệ (1KB) <br> 2. POST multipart/form-data với field `file` <br> 3. Kiểm tra status = 200 <br> 4. Kiểm tra response body đúng structure |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### NC-2 — List Engineers (Normal)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | NC-2 |
| **Type** | BB/IT |
| **Priority** | P0 |
| **AC** | AC-11, AC-9 |
| **Precondition** | Seed script đã chạy |
| **Input** | `GET /api/v1/engineers` |
| **Expected Output** | HTTP 200, JSON array với ≥5 engineer objects, mỗi object có: `id`, `name`, `email`, `primary_skill`, `level`, `availability_percentage` |
| **Test Steps** | 1. GET /api/v1/engineers <br> 2. Kiểm tra status = 200 <br> 3. Kiểm tra response là array <br> 4. Kiểm tra array.length ≥ 5 <br> 5. Kiểm tra engineer object có đủ fields |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

## Nhóm 2: Abnormal Cases (từ spec-pack Examples)

### AB-1 — CSV Upload Quá Kích Thước

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AB-1 |
| **Type** | BB/IT |
| **Priority** | P0 |
| **AC** | AC-20 |
| **Precondition** | API server running |
| **Input** | `POST /api/v1/engineers/upload` với file > 10MB |
| **Expected Output** | HTTP 413, body: `{"error":{"code":"file_too_large","message":"CSV file must not exceed 10MB"}}` |
| **Test Steps** | 1. Chuẩn bị file 11MB (xem test-data.md cách tạo) <br> 2. POST multipart/form-data <br> 3. Kiểm tra status = 413 <br> 4. Kiểm tra response body có đúng `error.code = "file_too_large"` |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### AB-2 — Engineer Not Found

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AB-2 |
| **Type** | BB/IT |
| **Priority** | P0 |
| **AC** | AC-9 |
| **Precondition** | API server running |
| **Input** | `GET /api/v1/engineers/00000000-0000-0000-0000-000000000000` |
| **Expected Output** | HTTP 404 |
| **Test Steps** | 1. GET /api/v1/engineers/ + UUID không tồn tại <br> 2. Kiểm tra status = 404 |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

## Nhóm 3: Boundary Values (từ spec-pack Examples)

### BV-1 — CSV Đúng Giới hạn 10MB

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-1 |
| **Type** | BB/IT |
| **Priority** | P1 |
| **AC** | AC-20 |
| **Precondition** | API server running |
| **Input** | `POST /api/v1/engineers/upload` với file chính xác 10MB (10 * 1024 * 1024 bytes) |
| **Expected Output** | HTTP 200 (accepted, không bị reject) |
| **Test Steps** | 1. Tạo file chính xác 10MB (xem test-data.md) <br> 2. POST multipart/form-data <br> 3. Kiểm tra status = 200 (không phải 413) |
| **Ghi chú** | Boundary: 10MB = accepted; 10MB + 1 byte = rejected |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### BV-2 — Bench Alert Ngưỡng 30 Ngày

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-2 |
| **Type** | BB/IT |
| **Priority** | P1 |
| **AC** | AC-9 (bench/alerts) |
| **Precondition** | Seed data có engineer E004 với `bench_start_date = today + 30 days` |
| **Input** | `GET /api/v1/bench/alerts` |
| **Expected Output** | HTTP 200, response chứa engineer E004 trong danh sách alerts |
| **Test Steps** | 1. Verify seed: E004 có bench_start_date = today + 30 days <br> 2. GET /api/v1/bench/alerts <br> 3. Kiểm tra status = 200 <br> 4. Kiểm tra E004 xuất hiện trong response |
| **Ghi chú** | Ngưỡng = 30 ngày. Engineer với bench_start_date = today + 31 days KHÔNG xuất hiện |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### BV-3 — Bench Alert Ngoài Ngưỡng 30 Ngày

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-3 |
| **Type** | BB/IT |
| **Priority** | P1 |
| **AC** | AC-9 (bench/alerts) |
| **Precondition** | Seed data có engineer E001 với `bench_start_date = today + 31 days` |
| **Input** | `GET /api/v1/bench/alerts` |
| **Expected Output** | HTTP 200, response KHÔNG chứa E001 |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

## Nhóm 4: Test Cases cho từng AC

### TC-AC1 — Docker Compose Startup

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC1 |
| **AC** | AC-1 |
| **Type** | E2E |
| **Priority** | P0 |
| **Input** | `docker compose up` |
| **Expected** | Tất cả 4 services (web, api, postgres, redis) đạt healthy state |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC2 — Application Access

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC2 |
| **AC** | AC-2 |
| **Type** | E2E |
| **Priority** | P0 |
| **Input** | `curl http://localhost:3000` và `curl http://localhost:8000` |
| **Expected** | 3000: HTML response (200); 8000: API root hoặc health |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC3 — Health Endpoint

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC3 |
| **AC** | AC-3 |
| **Type** | IT, BB |
| **Priority** | P0 |
| **Input** | `GET http://localhost:8000/api/v1/health` |
| **Expected** | `200 OK`, body: `{"status":"ok","version":"1.0.0"}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC4 — Frontend Route Structure

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC4 |
| **AC** | AC-4 |
| **Type** | BB |
| **Priority** | P1 |
| **Input** | Truy cập từng route: `/login`, `/dashboard`, `/engineers`, v.v. (sau khi login) |
| **Expected** | Mỗi route render không có 500 error hoặc blank page |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC5 — Layout Components

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC5 |
| **AC** | AC-5 |
| **Type** | E2E |
| **Priority** | P1 |
| **Input** | Truy cập `/dashboard` (sau login) |
| **Expected** | Sidebar với 7 links, Header, Main content area |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC7 — FastAPI Boot + OpenAPI

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC7 |
| **AC** | AC-7 |
| **Type** | IT |
| **Priority** | P0 |
| **Input** | `GET http://localhost:8000/docs` |
| **Expected** | 200, Swagger UI page |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC9 — Auth Login Stub

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC9a |
| **AC** | AC-9, AC-19 |
| **Type** | IT, BB |
| **Priority** | P0 |
| **Input** | `POST /api/v1/auth/login` body: `{"email":"any@test.com","password":"any123"}` |
| **Expected** | 200, response có JWT token field |
| **Kết quả** | [ ] Pass / [ ] Fail |

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC9b |
| **AC** | AC-19 |
| **Type** | IT |
| **Priority** | P0 |
| **Input** | `POST /api/v1/auth/login` body: `"not-json"` |
| **Expected** | 422 Unprocessable Entity |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC10 — Database Schema

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC10 |
| **AC** | AC-10 |
| **Type** | IT |
| **Priority** | P0 |
| **Input** | Query `information_schema.tables` trong PostgreSQL |
| **Expected** | Tables: engineers, projects, allocations, match_scores, bench_forecasts, users — tất cả tồn tại |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC11 — Seed Data Visible

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC11 |
| **AC** | AC-11 |
| **Type** | IT, BB |
| **Priority** | P1 |
| **Input** | `GET /api/v1/engineers` và `GET /api/v1/projects` (sau seed) |
| **Expected** | engineers.length ≥ 5, projects.length ≥ 3 |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC12 — CSV Upload Response Format

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC12 |
| **AC** | AC-12 |
| **Type** | IT, BB |
| **Priority** | P0 |
| **Input** | `POST /api/v1/engineers/upload` valid CSV |
| **Expected** | 200, body chính xác: `{"inserted":0,"updated":0,"skipped":0,"errors":[]}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC13 — LLM Service Stub Exists

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC13 |
| **AC** | AC-13 |
| **Type** | UT |
| **Priority** | P1 |
| **Input** | Gọi `LLMScoringService.score_engineer_project(mock_engineer, mock_project)` trong pytest |
| **Expected** | Trả về MatchScore với `llm_provider="stub"`, scores trong [0.0, 1.0] |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC14 — Redis Connection

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC14 |
| **AC** | AC-14 |
| **Type** | IT |
| **Priority** | P1 |
| **Input** | API startup log hoặc `GET /api/v1/health` sau redis startup |
| **Expected** | Redis connection verified (no error in startup log) |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC19 — Auth Guard (Frontend)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC19 |
| **AC** | AC-19 |
| **Type** | BB, E2E |
| **Priority** | P0 |
| **Input** | Xóa token trong browser, truy cập `http://localhost:3000/dashboard` |
| **Expected** | Redirect về `http://localhost:3000/login` |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

### TC-AC20 — CSV Exact Boundary (10MB + 1 byte)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | TC-AC20 |
| **AC** | AC-20 |
| **Type** | IT, BB |
| **Priority** | P0 |
| **Input** | `POST /api/v1/engineers/upload` với file 10MB + 1 byte |
| **Expected** | 413, `{"error":{"code":"file_too_large","message":"CSV file must not exceed 10MB"}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

## Tổng kết TC Coverage

| AC | TC(s) | Type | Priority |
|----|-------|------|---------|
| AC-1 | TC-AC1 | E2E | P0 |
| AC-2 | TC-AC2 | E2E | P0 |
| AC-3 | TC-AC3 | IT/BB | P0 |
| AC-4 | TC-AC4 | BB | P1 |
| AC-5 | TC-AC5 | E2E | P1 |
| AC-6 | (visual check) | Manual | P2 |
| AC-7 | TC-AC7 | IT | P0 |
| AC-8 | (đọc registered routes) | IT | P0 |
| AC-9 | NC-2, AB-2, TC-AC9a/b + C-1 đến C-17 | IT/BB | P0 |
| AC-10 | TC-AC10 | IT | P0 |
| AC-11 | NC-2, TC-AC11 | IT/BB | P1 |
| AC-12 | NC-1, TC-AC12 | IT/BB | P0 |
| AC-13 | TC-AC13 | UT | P1 |
| AC-14 | TC-AC14 | IT | P1 |
| AC-15 | (log inspection) | IT | P1 |
| AC-16 | (quality gate) | CI | P0 |
| AC-17 | (quality gate) | CI | P0 |
| AC-18 | (CI run) | E2E | P1 |
| AC-19 | TC-AC9a/b, TC-AC19 | IT/BB/E2E | P0 |
| AC-20 | AB-1, BV-1, TC-AC20 | IT/BB | P0 |
