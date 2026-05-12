# Black-box Test Cases — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** 2.0 (Phase 7 — đầy đủ theo từng AC)
**Ngày tạo:** 2026-03-25
**Ngày cập nhật:** 2026-04-03
**Tác giả:** Phase 7 expansion

---

## Quy ước

| Ký hiệu | Nghĩa |
|---------|-------|
| **BB** | Black-box — tester không biết implementation |
| **IT** | Integration Test — biết endpoint, test qua HTTP |
| **E2E** | End-to-End — test qua browser/full stack |
| **P0** | Phải pass — block go-live |
| **P1** | Quan trọng — nên pass trước khi merge |
| **P2** | Nice to have — có thể để sau |

**TC-ID format:** `AC-{n}-{loại}-{m}`
- `NC` = Normal Case, `AB` = Abnormal Case, `BV` = Boundary Value
- Ví dụ: `AC-1-NC-1`, `AC-20-BV-2`

---

## Mục lục

| Chapter | AC | Mô tả ngắn |
|---------|-----|-----------|
| [Ch.1](#ch1) | AC-1 | Docker Compose startup |
| [Ch.2](#ch2) | AC-2 | Application access |
| [Ch.3](#ch3) | AC-3 | Health endpoint |
| [Ch.4](#ch4) | AC-4 | Frontend route structure |
| [Ch.5](#ch5) | AC-5 | Global layout + sidebar |
| [Ch.6](#ch6) | AC-6 | UI component system |
| [Ch.7](#ch7) | AC-7 | FastAPI boot + OpenAPI |
| [Ch.8](#ch8) | AC-8 | Router groups |
| [Ch.9](#ch9) | AC-9 | Stub endpoints |
| [Ch.10](#ch10) | AC-10 | Database schema |
| [Ch.11](#ch11) | AC-11 | Seed data |
| [Ch.12](#ch12) | AC-12 | CSV upload stub response |
| [Ch.13](#ch13) | AC-13 | LLM stub service |
| [Ch.14](#ch14) | AC-14 | Redis client |
| [Ch.15](#ch15) | AC-15 | Structured logging |
| [Ch.16](#ch16) | AC-16 | Lint / format |
| [Ch.17](#ch17) | AC-17 | Type checking |
| [Ch.18](#ch18) | AC-18 | CI pipeline |
| [Ch.19](#ch19) | AC-19 | Authentication |
| [Ch.20](#ch20) | AC-20 | CSV 10MB rejection |
| [Traceability](#traceability) | | Bảng ánh xạ AC ↔ TC |

---

<a name="ch1"></a>
## Chapter 1: AC-1 — Docker Compose Startup

> **AC-1:** Running `docker compose up` successfully starts web, api, postgres, and redis services, all reaching a healthy state.

### Normal Cases

#### AC-1-NC-1 — Khởi động đầy đủ 4 services

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-1-NC-1 |
| **Priority** | P0 |
| **Type** | E2E |
| **Precondition** | Docker Engine đang chạy; ports 3000, 8000, 5432, 6379 chưa bị chiếm |
| **Input** | `docker compose up` |
| **Expected** | Tất cả 4 services (web, api, postgres, redis) đạt trạng thái `healthy` trong health check |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-1-NC-2 — Khởi động lại sau `docker compose down`

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-1-NC-2 |
| **Priority** | P1 |
| **Type** | E2E |
| **Precondition** | Đã chạy `docker compose up` thành công một lần trước |
| **Input** | `docker compose down` → chờ terminate → `docker compose up` |
| **Expected** | Services khởi động lại thành công, đạt healthy; không còn orphan containers |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-1-AB-1 — Port 8000 đã bị chiếm

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-1-AB-1 |
| **Priority** | P1 |
| **Type** | E2E |
| **Precondition** | Một process khác đang lắng nghe trên port 8000 |
| **Input** | `docker compose up` |
| **Expected** | Service `api` không start được; error message rõ ràng về port conflict; các services khác (postgres, redis) vẫn cố khởi động |
| **Ghi chú** | Tester xác minh bằng cách kiểm tra container status và logs |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-1-AB-2 — Thiếu file `.env` / biến môi trường bắt buộc

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-1-AB-2 |
| **Priority** | P2 |
| **Type** | E2E |
| **Precondition** | File `.env` bị xóa hoặc thiếu biến `DATABASE_URL` |
| **Input** | `docker compose up` |
| **Expected** | Service `api` hoặc `postgres` fail với thông báo lỗi cấu hình; không crash silently |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch2"></a>
## Chapter 2: AC-2 — Application Access

> **AC-2:** Frontend reachable at `http://localhost:3000`; backend API reachable at `http://localhost:8000`.

### Normal Cases

#### AC-2-NC-1 — Frontend trả về HTML

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-2-NC-1 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | `docker compose up` tất cả services healthy |
| **Input** | `GET http://localhost:3000` |
| **Expected** | HTTP 200; Content-Type: text/html; body chứa HTML hợp lệ (không blank, không connection refused) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-2-NC-2 — Backend API phản hồi

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-2-NC-2 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | `docker compose up` tất cả services healthy |
| **Input** | `GET http://localhost:8000/api/v1/health` |
| **Expected** | HTTP 200; JSON response hợp lệ |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-2-AB-1 — Truy cập trước khi services healthy

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-2-AB-1 |
| **Priority** | P2 |
| **Type** | E2E |
| **Precondition** | Services vừa bắt đầu khởi động, chưa healthy |
| **Input** | `GET http://localhost:3000` trong vòng 5 giây sau `docker compose up` |
| **Expected** | Connection refused hoặc 502/503 — không phải partial HTML gây lỗi JS |
| **Ghi chú** | Kiểm tra hành vi graceful khi chưa sẵn sàng |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch3"></a>
## Chapter 3: AC-3 — Health Endpoint

> **AC-3:** `GET /api/v1/health` returns `200 OK` with `{"status": "ok", "version": "1.0.0"}`.

### Normal Cases

#### AC-3-NC-1 — Health endpoint trả về đúng body

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-3-NC-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | `GET /api/v1/health` (không cần Authorization header) |
| **Expected** | HTTP 200; body: `{"status": "ok", "version": "1.0.0"}`; Content-Type: application/json |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-3-NC-2 — Health endpoint không yêu cầu authentication

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-3-NC-2 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `GET /api/v1/health` không có header `Authorization` |
| **Expected** | HTTP 200 (không phải 401) — đây là public endpoint |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-3-AB-1 — Sai path

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-3-AB-1 |
| **Priority** | P1 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `GET /api/v1/healthz` hoặc `GET /health` |
| **Expected** | HTTP 404 (không phải 200 hoặc 500) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-3-AB-2 — Method không hỗ trợ

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-3-AB-2 |
| **Priority** | P2 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `POST /api/v1/health` với body bất kỳ |
| **Expected** | HTTP 405 Method Not Allowed |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch4"></a>
## Chapter 4: AC-4 — Frontend Route Structure

> **AC-4:** All 10 routes exist and render without runtime errors.
> Routes: `/login`, `/dashboard`, `/engineers`, `/engineers/[id]`, `/upload`, `/projects`, `/projects/[id]`, `/allocation`, `/bench-forecast`, `/reports`

### Normal Cases

#### AC-4-NC-1 — `/login` render khi chưa đăng nhập

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-4-NC-1 |
| **Priority** | P0 |
| **Type** | BB / E2E |
| **Precondition** | Frontend đang chạy; không có token trong browser |
| **Input** | Truy cập `http://localhost:3000/login` |
| **Expected** | HTTP 200; trang hiển thị form login (email + password input + submit button); không có JS runtime error |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-4-NC-2 — Tất cả 9 protected routes render sau khi đăng nhập

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-4-NC-2 |
| **Priority** | P1 |
| **Type** | E2E |
| **Precondition** | Đã login thành công; có token trong browser |
| **Input** | Lần lượt truy cập: `/dashboard`, `/engineers`, `/engineers/11111111-1111-1111-1111-111111111111`, `/upload`, `/projects`, `/projects/P001-uuid`, `/allocation`, `/bench-forecast`, `/reports` |
| **Expected** | Mỗi route trả về HTTP 200; page render không có blank screen và không có console error "Unhandled runtime error" |
| **Kết quả** | [ ] Pass / [ ] Fail (ghi chú route nào fail) |

### Abnormal Cases

#### AC-4-AB-1 — Truy cập protected route khi chưa đăng nhập bị redirect

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-4-AB-1 |
| **Priority** | P0 |
| **Type** | BB / E2E |
| **Precondition** | Không có token trong browser (clear localStorage/cookies) |
| **Input** | Truy cập trực tiếp `http://localhost:3000/dashboard` |
| **Expected** | Browser redirect về `/login`; không hiển thị nội dung dashboard |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-4-AB-2 — Truy cập `/engineers/[id]` với ID không tồn tại

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-4-AB-2 |
| **Priority** | P1 |
| **Type** | BB / E2E |
| **Precondition** | Đã login |
| **Input** | Truy cập `/engineers/00000000-0000-0000-0000-000000000000` |
| **Expected** | Trang hiển thị error state (404 message hoặc "Engineer not found") — không crash toàn bộ app |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-4-AB-3 — Route không tồn tại

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-4-AB-3 |
| **Priority** | P2 |
| **Type** | BB |
| **Precondition** | Đã login |
| **Input** | Truy cập `/nonexistent-page` |
| **Expected** | HTTP 404 hoặc custom "Page not found" page — không hiển thị blank page |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch5"></a>
## Chapter 5: AC-5 — Global Layout + Sidebar

> **AC-5:** Global layout with sidebar navigation (7 links) and header with user info placeholder.

### Normal Cases

#### AC-5-NC-1 — Sidebar có đủ 7 navigation links

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-5-NC-1 |
| **Priority** | P1 |
| **Type** | BB / E2E |
| **Precondition** | Đã login; đang ở `/dashboard` |
| **Input** | Quan sát sidebar layout |
| **Expected** | Sidebar chứa đúng 7 links: Dashboard, Engineers, Upload Data, Projects, Allocation, Bench Forecast, Reports |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-5-NC-2 — Sidebar links dẫn đến đúng route

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-5-NC-2 |
| **Priority** | P1 |
| **Type** | BB / E2E |
| **Precondition** | Đã login |
| **Input** | Click lần lượt từng link trong sidebar |
| **Expected** | Mỗi link dẫn đến đúng route tương ứng (URL thay đổi, page render); không có broken link (404) |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-5-AB-1 — Header hiển thị user placeholder khi chưa có user thật

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-5-AB-1 |
| **Priority** | P2 |
| **Type** | BB / E2E |
| **Precondition** | Đã login bằng mock credentials |
| **Input** | Quan sát header |
| **Expected** | Header hiển thị một placeholder (avatar, tên, hoặc email giả) — không bị empty hoặc crash |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch6"></a>
## Chapter 6: AC-6 — UI Component System

> **AC-6:** TailwindCSS configured, shadcn/ui installed. Components exist: Card, Table, Button, Modal/Dialog, Form inputs, Badge, Skeleton.

### Normal Cases

#### AC-6-NC-1 — Các components cốt lõi render được

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-6-NC-1 |
| **Priority** | P1 |
| **Type** | BB / E2E |
| **Precondition** | Đã login; truy cập các trang sử dụng components |
| **Input** | Quan sát `/engineers` (Table, Badge), `/dashboard` (Card), `/upload` (Form inputs, Button) |
| **Expected** | Các components hiển thị đúng (không placeholder trắng, không error); TailwindCSS styles áp dụng (không unstyled HTML thuần) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-6-NC-2 — Skeleton loading state hiển thị

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-6-NC-2 |
| **Priority** | P2 |
| **Type** | BB / E2E |
| **Precondition** | Tốc độ mạng chậm hoặc API delay |
| **Input** | Truy cập trang có data fetching (ví dụ `/engineers`) |
| **Expected** | Trong lúc chờ API response, Skeleton component hiển thị thay vì blank hoặc layout shift đột ngột |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-6-AB-1 — Modal/Dialog đóng đúng cách

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-6-AB-1 |
| **Priority** | P2 |
| **Type** | BB / E2E |
| **Precondition** | Đã login; có trang sử dụng Modal/Dialog |
| **Input** | Mở modal → nhấn ESC hoặc click outside |
| **Expected** | Modal đóng, không có orphan overlay ở lại; background page có thể tương tác được |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch7"></a>
## Chapter 7: AC-7 — FastAPI Boot + OpenAPI

> **AC-7:** FastAPI application starts and exposes `/api/v1`; API documentation available at `/docs`.

### Normal Cases

#### AC-7-NC-1 — Swagger UI accessible tại `/docs`

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-7-NC-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | `GET http://localhost:8000/docs` |
| **Expected** | HTTP 200; Content-Type: text/html; page chứa Swagger UI (có text "Swagger UI" hoặc "OpenAPI") |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-7-NC-2 — OpenAPI schema JSON available

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-7-NC-2 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | `GET http://localhost:8000/openapi.json` |
| **Expected** | HTTP 200; JSON với fields `openapi`, `info`, `paths`; paths chứa `/api/v1/health` và ít nhất 10 endpoints khác |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-7-AB-1 — Endpoint không tồn tại trả về 404 (không phải 500)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-7-AB-1 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `GET /api/v1/nonexistent-route` |
| **Expected** | HTTP 404; không phải HTTP 500 |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch8"></a>
## Chapter 8: AC-8 — Router Groups Registered

> **AC-8:** Router groups registered: `auth`, `engineers`, `projects`, `allocations`, `bench`, `reports`, `dashboard`.

### Normal Cases

#### AC-8-NC-1 — Tất cả 7 router groups có ít nhất một endpoint phản hồi

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-8-NC-1 |
| **Priority** | P0 |
| **Type** | IT |
| **Precondition** | API server đang chạy; có mock token |
| **Input** | Gọi đại diện mỗi router group:<br>- auth: `POST /api/v1/auth/login`<br>- engineers: `GET /api/v1/engineers`<br>- projects: `GET /api/v1/projects`<br>- allocations: `GET /api/v1/allocations/active`<br>- bench: `GET /api/v1/bench/forecast`<br>- reports: `GET /api/v1/reports/shortage`<br>- dashboard: `GET /api/v1/dashboard/stats` |
| **Expected** | Mỗi endpoint trả về HTTP 2xx (không phải 404 "route not found") |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-8-NC-2 — OpenAPI schema liệt kê đủ 7 prefix

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-8-NC-2 |
| **Priority** | P1 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `GET /openapi.json` → parse `paths` keys |
| **Expected** | `paths` chứa paths với prefix: `/api/v1/auth/`, `/api/v1/engineers/`, `/api/v1/projects/`, `/api/v1/allocations/`, `/api/v1/bench/`, `/api/v1/reports/`, `/api/v1/dashboard/` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-8-AB-1 — Request đến router đúng nhưng sub-path không tồn tại

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-8-AB-1 |
| **Priority** | P1 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `GET /api/v1/engineers/batch/delete` (path không có trong spec) |
| **Expected** | HTTP 404 (không phải 500); lỗi từ FastAPI route matching, không phải application crash |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch9"></a>
## Chapter 9: AC-9 — Stub Endpoints Response

> **AC-9:** All 17 stub endpoints return specified HTTP status codes.

*Ghi chú: AC-19 (auth) và AC-20 (CSV 413) có chapter riêng. Chapter này tập trung vào các endpoints còn lại.*

### Normal Cases

#### AC-9-NC-1 — List endpoints trả về 200 + JSON array

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-9-NC-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server + seed data; mock token trong header |
| **Input** | Lần lượt gọi: `GET /engineers`, `GET /projects`, `GET /allocations/active`, `GET /bench/forecast`, `GET /bench/alerts`, `GET /reports/shortage` |
| **Expected** | Mỗi endpoint: HTTP 200; body là JSON array (`[...]`); mảng có thể empty `[]` nhưng phải là array hợp lệ |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-9-NC-2 — Dashboard stats trả về 200 + đúng fields

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-9-NC-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token |
| **Input** | `GET /api/v1/dashboard/stats` |
| **Expected** | HTTP 200; body có đủ 4 fields: `total_engineers` (number), `engineers_on_bench` (number), `active_projects` (number), `allocation_rate_percentage` (number) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-9-NC-3 — Bench forecast per engineer trả về 200

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-9-NC-3 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | Seed data đã load; mock token; E001 ID = `11111111-1111-1111-1111-111111111111` |
| **Input** | `GET /api/v1/engineers/11111111-1111-1111-1111-111111111111/bench-forecast` |
| **Expected** | HTTP 200; body có fields: `engineer_id`, `forecast_date`, `risk_level`, `probability`, `recommendation` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-9-AB-1 — Gọi endpoint cần auth mà không có token → 401

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-9-AB-1 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `GET /api/v1/engineers` không có header `Authorization` |
| **Expected** | HTTP 401; body: `{"error":{"code":"unauthorized","message":"..."}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-9-AB-2 — Engineer detail với ID không tồn tại → 404

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-9-AB-2 (= AB-2 cũ) |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token |
| **Input** | `GET /api/v1/engineers/00000000-0000-0000-0000-000000000000` |
| **Expected** | HTTP 404; body: `{"error":{"code":"not_found","message":"Engineer not found"}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-9-AB-3 — Project detail với ID không tồn tại → 404

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-9-AB-3 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token |
| **Input** | `GET /api/v1/projects/00000000-0000-0000-0000-000000000000` |
| **Expected** | HTTP 404; body: `{"error":{"code":"not_found","message":"Project not found"}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch10"></a>
## Chapter 10: AC-10 — Database Schema Migration

> **AC-10:** 6 tables initialized via Alembic: `engineers`, `projects`, `allocations`, `match_scores`, `bench_forecasts`, `users`. All FK relationships defined.

### Normal Cases

#### AC-10-NC-1 — Tất cả 6 tables tồn tại sau migration

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-10-NC-1 |
| **Priority** | P0 |
| **Type** | IT |
| **Precondition** | PostgreSQL đang chạy; `alembic upgrade head` đã chạy |
| **Input** | Query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'` |
| **Expected** | Result chứa đủ 6 tables: `engineers`, `projects`, `allocations`, `match_scores`, `bench_forecasts`, `users` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-10-NC-2 — Foreign key relationships tồn tại

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-10-NC-2 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | Migration đã chạy |
| **Input** | Query `information_schema.referential_constraints` hoặc qua alembic check |
| **Expected** | `allocations.engineer_id` → `engineers.id`; `allocations.project_id` → `projects.id`; FK constraints tồn tại (không chỉ column) |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-10-AB-1 — Chạy migration hai lần không gây lỗi (idempotent)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-10-AB-1 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | Migration đã chạy thành công một lần |
| **Input** | `alembic upgrade head` lần thứ hai |
| **Expected** | Command thành công (exit code 0); output báo "Already at head" hoặc tương đương; không có lỗi "table already exists" |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch11"></a>
## Chapter 11: AC-11 — Seed Data

> **AC-11:** Seed script inserts ≥5 engineers, ≥3 projects, ≥3 allocations. Records visible via API.

### Normal Cases

#### AC-11-NC-1 — Engineers seed visible qua API

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-11-NC-1 (= NC-2 cũ) |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | Seed script đã chạy; mock token |
| **Input** | `GET /api/v1/engineers` |
| **Expected** | HTTP 200; array.length ≥ 5; mỗi object có: `id` (UUID format), `name`, `email`, `primary_skill`, `level` (junior/mid/senior), `availability_percentage` (0–100) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-11-NC-2 — Projects seed visible qua API

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-11-NC-2 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | Seed script đã chạy; mock token |
| **Input** | `GET /api/v1/projects` |
| **Expected** | HTTP 200; array.length ≥ 3; có ít nhất 1 project với `status: "active"` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-11-NC-3 — Active allocations seed visible qua API

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-11-NC-3 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | Seed script đã chạy; mock token |
| **Input** | `GET /api/v1/allocations/active` |
| **Expected** | HTTP 200; array chứa ít nhất 1 allocation với `status: "active"` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-11-AB-1 — Chạy seed script hai lần không gây duplicate key error

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-11-AB-1 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | Seed script đã chạy một lần |
| **Input** | Chạy seed script lần thứ hai |
| **Expected** | Script không crash; dữ liệu không bị duplicate (UPSERT hoặc skip-if-exists) |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch12"></a>
## Chapter 12: AC-12 — CSV Upload Stub Response

> **AC-12:** CSV upload endpoints accept multipart/form-data with `file` field, return stub: `{"inserted":0,"updated":0,"skipped":0,"errors":[]}`.

### Normal Cases

#### AC-12-NC-1 — Upload engineers CSV hợp lệ → stub response (= NC-1 cũ)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-12-NC-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file CSV hợp lệ ≤ 10MB |
| **Input** | `POST /api/v1/engineers/upload` multipart/form-data, field `file` = valid CSV |
| **Expected** | HTTP 200; body chính xác: `{"inserted":0,"updated":0,"skipped":0,"errors":[]}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-12-NC-2 — Upload projects CSV hợp lệ → stub response

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-12-NC-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file CSV hợp lệ ≤ 10MB |
| **Input** | `POST /api/v1/projects/upload` multipart/form-data, field `file` = valid CSV |
| **Expected** | HTTP 200; body chính xác: `{"inserted":0,"updated":0,"skipped":0,"errors":[]}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-12-AB-1 — Upload không có field `file` → 400 hoặc 422

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-12-AB-1 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | API server đang chạy; mock token |
| **Input** | `POST /api/v1/engineers/upload` multipart/form-data không có field `file` |
| **Expected** | HTTP 400 hoặc 422 (không phải 200 hoặc 500) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-12-AB-2 — Upload file không phải CSV (MIME type sai) → 400

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-12-AB-2 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | API server đang chạy; mock token |
| **Input** | `POST /api/v1/engineers/upload` với file `.txt` hoặc `.pdf` (MIME: text/plain hoặc application/pdf) |
| **Expected** | HTTP 400; body có `error.code` = `"invalid_csv"` hoặc tương đương |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-12-AB-3 — Upload không có Authorization header → 401

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-12-AB-3 |
| **Priority** | P0 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `POST /api/v1/engineers/upload` không có Authorization header |
| **Expected** | HTTP 401; `{"error":{"code":"unauthorized","message":"..."}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Góc nhìn Logging

#### AC-12-LOG-1 — Log events được phát ra khi upload

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-12-LOG-1 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | API server đang chạy; log output được capture |
| **Input** | `POST /api/v1/engineers/upload` với valid CSV |
| **Expected** | Log chứa event `csv_import_started` VÀ `csv_import_completed` (hoặc tương đương) ở dạng JSON; không có email/tên engineer trong log |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch13"></a>
## Chapter 13: AC-13 — LLM Stub Service

> **AC-13:** `LLMScoringService` with `score_engineer_project()` returns mock MatchScore with `llm_provider="stub"`, `model_version="stub-v0"`.

### Normal Cases

#### AC-13-NC-1 — Recommend endpoint trả về recommendations với scores hợp lệ

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-13-NC-1 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; seed data loaded; mock token; P001 project UUID biết trước |
| **Input** | `POST /api/v1/allocations/recommend` body: `{"project_id": "P001-uuid"}` |
| **Expected** | HTTP 200; body có `recommendations` (array); mỗi item có `overall_score` trong [0.0, 1.0]; có `skill_match_score`, `level_match_score`, `availability_score` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-13-NC-2 — Scores trong khoảng hợp lệ [0.0, 1.0]

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-13-NC-2 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | Như AC-13-NC-1 |
| **Input** | `POST /api/v1/allocations/recommend` body hợp lệ |
| **Expected** | Tất cả score values: `0.0 ≤ score ≤ 1.0`; không có giá trị âm hoặc > 1 |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-13-AB-1 — Recommend cho project không tồn tại → 404

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-13-AB-1 |
| **Priority** | P1 |
| **Type** | BB |
| **Precondition** | API server đang chạy; mock token |
| **Input** | `POST /api/v1/allocations/recommend` body: `{"project_id": "00000000-0000-0000-0000-000000000000"}` |
| **Expected** | HTTP 404; `{"error":{"code":"not_found","message":"Project not found"}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Boundary Values

#### AC-13-BV-1 — Scores không bao giờ vượt 1.0 hoặc dưới 0.0

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-13-BV-1 |
| **Priority** | P1 |
| **Type** | BB |
| **Precondition** | Gọi recommend với nhiều projects và engineers khác nhau |
| **Input** | Gọi `POST /allocations/recommend` cho P001, P002 |
| **Expected** | Không có `overall_score` = 1.1 hay -0.1; boundary [0.0, 1.0] được tôn trọng |
| **Ghi chú** | Stub implementation: giá trị có thể static như 0.85 — điều đó vẫn pass boundary |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Góc nhìn Logging

#### AC-13-LOG-1 — LLM scoring event được log

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-13-LOG-1 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | API server với log capture |
| **Input** | `POST /api/v1/allocations/recommend` |
| **Expected** | Log chứa event `llm_score_computed` (hoặc tương đương) ở dạng JSON |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch14"></a>
## Chapter 14: AC-14 — Redis Client

> **AC-14:** Redis client configured, connected, verified at startup. Placeholder ops `set_cache` and `get_cache` exist.

### Normal Cases

#### AC-14-NC-1 — API startup không có Redis connection error

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-14-NC-1 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | Redis container đang chạy (docker compose up) |
| **Input** | Kiểm tra API startup log |
| **Expected** | Log chứa message xác nhận Redis connected (ví dụ: "Redis connection established"); không có "Connection refused" error trong startup log |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-14-AB-1 — Redis down: API vẫn start (graceful degradation)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-14-AB-1 |
| **Priority** | P2 |
| **Type** | IT |
| **Precondition** | Redis container bị stop (`docker stop <redis-container>`) |
| **Input** | Restart API service; kiểm tra startup log; gọi `GET /api/v1/health` |
| **Expected** | API vẫn start (có thể với warning trong log về Redis); `GET /health` vẫn trả về 200 (scaffold không bắt buộc Redis availability) |
| **Ghi chú** | Behavior này tùy thuộc implementation — ghi nhận kết quả thực tế |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch15"></a>
## Chapter 15: AC-15 — Structured Logging

> **AC-15:** Backend emits structured JSON logs for: request start/end, allocation events, CSV ingestion events, LLM scoring events, error events. No PII in log output.

### Normal Cases

#### AC-15-NC-1 — Request start/end được log

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-15-NC-1 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | API server đang chạy với log output redirect |
| **Input** | Gọi bất kỳ endpoint: `GET /api/v1/health` |
| **Expected** | Log chứa JSON entry với fields: `event` (hoặc `type`), `method`, `path`, `status`, `latency` (hoặc `duration`); format là JSON (parseable) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-15-NC-2 — Allocation event được log

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-15-NC-2 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | Seed data loaded; mock token |
| **Input** | `POST /api/v1/allocations/confirm` với valid body |
| **Expected** | Log chứa entry với `event` liên quan đến allocation (ví dụ: `allocation_confirmed`) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-15-NC-3 — Error event được log khi xảy ra lỗi

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-15-NC-3 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | API server đang chạy; log capture |
| **Input** | Gọi endpoint gây lỗi: `GET /api/v1/engineers/00000000-0000-0000-0000-000000000000` |
| **Expected** | Log chứa entry với event/level = error; chứa path và status code; không chứa stack trace với sensitive data |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-15-AB-1 — Không có PII trong log output

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-15-AB-1 |
| **Priority** | P0 |
| **Type** | IT |
| **Precondition** | API server đang chạy; log output captured trong 5 phút |
| **Input** | Thực hiện: login với `admin@example.com`, GET /engineers, POST /engineers/upload với CSV chứa email |
| **Expected** | Log KHÔNG chứa email cụ thể (`admin@example.com`, `vanan@example.com`, v.v.); log có thể chứa user_id (UUID) thay vì email |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch16"></a>
## Chapter 16: AC-16 — Lint / Format

> **AC-16:** ESLint (frontend) and Black/Ruff (backend) configured; zero errors on scaffold code.
> *Ghi chú: Đây là quality gate verification, không phải black-box test truyền thống.*

### Normal Cases

#### AC-16-NC-1 — ESLint frontend zero errors

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-16-NC-1 |
| **Priority** | P0 |
| **Type** | CI (Quality Gate) |
| **Input** | `cd apps/web && npx eslint .` |
| **Expected** | Exit code 0; output: "0 errors" hoặc không có output lỗi |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-16-NC-2 — Ruff backend zero errors

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-16-NC-2 |
| **Priority** | P0 |
| **Type** | CI (Quality Gate) |
| **Input** | `cd apps/api && ruff check .` |
| **Expected** | Exit code 0; "All checks passed" hoặc no output |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch17"></a>
## Chapter 17: AC-17 — Type Checking

> **AC-17:** `tsc --noEmit` passes zero errors. Python type hints on all public function signatures.
> *Ghi chú: Quality gate verification.*

### Normal Cases

#### AC-17-NC-1 — TypeScript strict mode zero errors

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-17-NC-1 |
| **Priority** | P0 |
| **Type** | CI (Quality Gate) |
| **Input** | `cd apps/web && npx tsc --noEmit` |
| **Expected** | Exit code 0; không có output về type errors |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-17-NC-2 — Python service functions có type hints

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-17-NC-2 |
| **Priority** | P1 |
| **Type** | CI / Code Review |
| **Input** | Review `app/services/llm_scoring.py`, `app/routers/engineers.py`, v.v. |
| **Expected** | Tất cả public function parameters và return types có annotations; không có bare `def func(x)` mà không có type |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch18"></a>
## Chapter 18: AC-18 — CI Pipeline

> **AC-18:** CI pipeline (GitHub Actions) executes lint + typecheck + build + pytest without failures.
> *Ghi chú: Verification qua CI run, không phải black-box test truyền thống.*

### Normal Cases

#### AC-18-NC-1 — CI pipeline green trên branch chính

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-18-NC-1 |
| **Priority** | P1 |
| **Type** | CI (E2E) |
| **Input** | Push commit lên branch → trigger GitHub Actions |
| **Expected** | Tất cả jobs (lint, typecheck, build, pytest) green; không có failed steps |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-18-NC-2 — pytest backend pass

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-18-NC-2 |
| **Priority** | P0 |
| **Type** | CI |
| **Input** | `cd apps/api && pytest` |
| **Expected** | Exit code 0; "X passed, 0 failed, 0 errors" |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-18-AB-1 — CI fail khi có lint error được giới thiệu

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-18-AB-1 |
| **Priority** | P2 |
| **Type** | CI |
| **Input** | Tạo một lint error có chủ đích (ví dụ: unused import trong Python) → push → chờ CI |
| **Expected** | CI pipeline FAIL ở lint step; không skip qua lint |
| **Ghi chú** | Test này xác minh CI thực sự enforce quality gate |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="ch19"></a>
## Chapter 19: AC-19 — Authentication

> **AC-19:** `POST /auth/login` → static mock JWT for any credentials. `/login` public. All other routes redirect when no token. Malformed body → error format.

### Normal Cases

#### AC-19-NC-1 — Login với credentials bất kỳ → 200 + mock token

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-NC-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | `POST /api/v1/auth/login` body: `{"email":"any@test.com","password":"anypassword"}` |
| **Expected** | HTTP 200; body có `access_token` (non-empty string), `token_type: "bearer"`, `role` (string) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-19-NC-2 — Token nhận được có thể dùng để gọi protected endpoints

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-NC-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | 1. Login → nhận `access_token`; 2. `GET /api/v1/engineers` với `Authorization: Bearer <token>` |
| **Expected** | Bước 2 trả về HTTP 200 (không phải 401) |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-19-NC-3 — `/login` route accessible khi không có token

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-NC-3 |
| **Priority** | P0 |
| **Type** | BB / E2E |
| **Precondition** | Frontend đang chạy; không có token |
| **Input** | Truy cập `http://localhost:3000/login` trực tiếp |
| **Expected** | HTTP 200; form login hiển thị — KHÔNG redirect đi nơi khác |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-19-AB-1 — Login body thiếu field `password` → 422

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-AB-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | `POST /api/v1/auth/login` body: `{"email":"user@test.com"}` |
| **Expected** | HTTP 422 Unprocessable Entity; body có thông tin field validation error |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-19-AB-2 — Login body không phải JSON → 422

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-AB-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | `POST /api/v1/auth/login` với Content-Type: text/plain, body: `"not json"` |
| **Expected** | HTTP 422 hoặc 400; KHÔNG phải 200 |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-19-AB-3 — Gọi protected endpoint với token sai format → 401

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-AB-3 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy |
| **Input** | `GET /api/v1/engineers` với `Authorization: Bearer INVALID_TOKEN_XYZ` |
| **Expected** | HTTP 401; `{"error":{"code":"unauthorized","message":"..."}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-19-AB-4 — Login body empty JSON object → 422

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-AB-4 |
| **Priority** | P1 |
| **Type** | BB |
| **Precondition** | API server đang chạy |
| **Input** | `POST /api/v1/auth/login` body: `{}` |
| **Expected** | HTTP 422; không phải 200 |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Boundary Values

#### AC-19-BV-1 — Chỉ `/login` là route public; tất cả routes khác require token

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-BV-1 |
| **Priority** | P0 |
| **Type** | BB / E2E |
| **Precondition** | Không có token trong browser |
| **Input** | Truy cập từng route: `/dashboard`, `/engineers`, `/upload`, `/projects`, `/allocation`, `/bench-forecast`, `/reports` |
| **Expected** | Tất cả 7 routes redirect về `/login`; chỉ `/login` là accessible |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-19-BV-2 — Login submit → redirect về `/dashboard` (không về route khác)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-BV-2 |
| **Priority** | P1 |
| **Type** | BB / E2E |
| **Precondition** | Không có token; đang ở `/login` |
| **Input** | Nhập email + password bất kỳ → submit |
| **Expected** | Redirect về `/dashboard`; URL = `http://localhost:3000/dashboard` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Góc nhìn Permission

#### AC-19-PERM-1 — `/upload` chỉ accessible với role manager/admin

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-19-PERM-1 |
| **Priority** | P2 |
| **Type** | BB |
| **Precondition** | Phase 5 Mock JWT — không có real role enforcement; ghi nhận hành vi thực tế |
| **Input** | Login với viewer credentials (nếu có) → truy cập `/upload` |
| **Expected** | Phase 5: có thể accessible (mock không enforce role); ghi nhận để Phase 2+ enforce |
| **Ghi chú** | Đây là test để document current state; không fail nếu không enforce trong Phase 5 |
| **Kết quả** | [ ] Pass / [ ] Fail / [ ] Documented |

---

<a name="ch20"></a>
## Chapter 20: AC-20 — CSV 10MB File Size Rejection

> **AC-20:** CSV upload rejects files > 10MB with HTTP 413 and `{"error":{"code":"file_too_large","message":"CSV file must not exceed 10MB"}}`.

### Normal Cases

#### AC-20-NC-1 — File nhỏ (<< 10MB) được chấp nhận

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-NC-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file 500KB |
| **Input** | `POST /api/v1/engineers/upload` với file 500KB |
| **Expected** | HTTP 200; stub response `{"inserted":0,...}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-20-NC-2 — Projects upload cũng chấp nhận file nhỏ

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-NC-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file 300KB |
| **Input** | `POST /api/v1/projects/upload` với file 300KB |
| **Expected** | HTTP 200; stub response |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Abnormal Cases

#### AC-20-AB-1 — Engineers upload file 11MB → 413 (= AB-1 cũ)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-AB-1 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file 11MB (10MB + 1,048,576 bytes) |
| **Input** | `POST /api/v1/engineers/upload` với file 11MB |
| **Expected** | HTTP 413; body: `{"error":{"code":"file_too_large","message":"CSV file must not exceed 10MB"}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-20-AB-2 — Projects upload file > 10MB → 413

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-AB-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file 15MB |
| **Input** | `POST /api/v1/projects/upload` với file 15MB |
| **Expected** | HTTP 413; cùng error body như AB-1 |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Boundary Values

#### AC-20-BV-1 — File đúng 10MB được chấp nhận (= BV-1 cũ)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-BV-1 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file đúng 10,485,760 bytes (= 10 × 1024 × 1024) |
| **Input** | `POST /api/v1/engineers/upload` với file chính xác 10MB |
| **Expected** | HTTP 200 (KHÔNG phải 413); file ở đúng limit được chấp nhận |
| **Boundary rule** | `size > 10MB` → reject; `size = 10MB` → accept |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-20-BV-2 — File 10MB + 1 byte bị từ chối (= TC-AC20 cũ)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-BV-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file 10,485,761 bytes (10MB + 1) |
| **Input** | `POST /api/v1/engineers/upload` với file 10MB + 1 byte |
| **Expected** | HTTP 413; body đúng format |
| **Boundary rule** | Ranh giới chính xác: 10,485,760 = accept; 10,485,761 = reject |
| **Kết quả** | [ ] Pass / [ ] Fail |

#### AC-20-BV-3 — File 9.99MB (< 10MB) được chấp nhận

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-BV-3 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **Precondition** | API server đang chạy; mock token; file 10,475,520 bytes (~9.99MB) |
| **Input** | `POST /api/v1/engineers/upload` với file ~9.99MB |
| **Expected** | HTTP 200; không phải 413 |
| **Kết quả** | [ ] Pass / [ ] Fail |

### Góc nhìn Logging

#### AC-20-LOG-1 — 413 response được log với event `csv_import_failed`

| Field | Giá trị |
|-------|--------|
| **TC-ID** | AC-20-LOG-1 |
| **Priority** | P1 |
| **Type** | IT |
| **Precondition** | API server với log capture |
| **Input** | `POST /api/v1/engineers/upload` với file > 10MB |
| **Expected** | Log chứa entry với event `csv_import_failed` (hoặc error event) và status 413; không có file content trong log |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

## Bench Alert Boundary Tests (từ spec-pack BV-2/BV-3)

### BV-BENCH-1 — Engineer với bench_start_date = today + 30 days → CÓ alert

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-BENCH-1 (= BV-2 cũ) |
| **Priority** | P1 |
| **Type** | BB / IT |
| **AC** | AC-9 (bench/alerts) |
| **Precondition** | E001 có `bench_start_date = 2026-05-03` (today + 30); `BENCH_ALERT_DAYS_THRESHOLD = 30` |
| **Input** | `GET /api/v1/bench/alerts` |
| **Expected** | HTTP 200; response chứa E001 (`id = 11111111-1111-1111-1111-111111111111`) |
| **Boundary rule** | `bench_start_date - today ≤ 30` → alert fires |
| **Kết quả** | [ ] Pass / [ ] Fail |

### BV-BENCH-2 — Engineer với bench_start_date = today + 31 days → KHÔNG có alert

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-BENCH-2 (= BV-3 cũ) |
| **Priority** | P1 |
| **Type** | BB / IT |
| **AC** | AC-9 (bench/alerts) |
| **Precondition** | Có engineer với `bench_start_date = 2026-05-04` (today + 31) |
| **Input** | `GET /api/v1/bench/alerts` |
| **Expected** | HTTP 200; response KHÔNG chứa engineer này |
| **Boundary rule** | `bench_start_date - today = 31` → no alert |
| **Kết quả** | [ ] Pass / [ ] Fail |

### BV-BENCH-3 — Engineer đang bench (bench_start_date quá khứ) → CÓ alert

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-BENCH-3 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **AC** | AC-9 (bench/alerts) |
| **Precondition** | E004 có `bench_start_date = today - 10` (đã bench rồi) |
| **Input** | `GET /api/v1/bench/alerts` |
| **Expected** | HTTP 200; E004 xuất hiện trong danh sách (đang bench = cần alert) |
| **Kết quả** | [ ] Pass / [ ] Fail |

### BV-BENCH-4 — Engineer với bench_start_date = null → KHÔNG có alert

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-BENCH-4 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **AC** | AC-9 (bench/alerts) |
| **Precondition** | E002, E003, E005 có `bench_start_date = null` |
| **Input** | `GET /api/v1/bench/alerts` |
| **Expected** | E002, E003, E005 KHÔNG xuất hiện trong alerts |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

## Allocation Boundary Tests

### BV-ALLOC-1 — Tổng allocation = 100% được chấp nhận

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-ALLOC-1 |
| **Priority** | P1 |
| **Type** | BB / IT |
| **AC** | AC-9 (allocations/confirm) |
| **Precondition** | E005 available 100%; không có allocation active nào |
| **Input** | `POST /api/v1/allocations/confirm` body: `{"engineer_id": "E005-uuid", "project_id": "P001-uuid", "allocation_percentage": 100, ...}` |
| **Expected** | HTTP 201; allocation tạo thành công |
| **Kết quả** | [ ] Pass / [ ] Fail |

### BV-ALLOC-2 — Tổng allocation > 100% bị từ chối

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-ALLOC-2 |
| **Priority** | P0 |
| **Type** | BB / IT |
| **AC** | AC-9 (allocations/confirm) |
| **Precondition** | E002 đã có 80% allocation (A001 active) |
| **Input** | `POST /api/v1/allocations/confirm` body với `engineer_id = E002`, `allocation_percentage = 30` (80+30=110%) |
| **Expected** | HTTP 400; `{"error":{"code":"allocation_cap_exceeded","message":"Engineer total allocation would exceed 100%"}}` |
| **Kết quả** | [ ] Pass / [ ] Fail |

### BV-ALLOC-3 — Allocation = 1% được chấp nhận (minimum)

| Field | Giá trị |
|-------|--------|
| **TC-ID** | BV-ALLOC-3 |
| **Priority** | P2 |
| **Type** | BB / IT |
| **AC** | AC-9 (allocations/confirm) |
| **Precondition** | Engineer có sẵn |
| **Input** | `POST /api/v1/allocations/confirm` với `allocation_percentage = 1` |
| **Expected** | HTTP 201 (minimum valid) |
| **Kết quả** | [ ] Pass / [ ] Fail |

---

<a name="traceability"></a>
## Bảng Traceability: AC ↔ Black-box Test Cases

| AC | Mô tả ngắn | Normal Cases | Abnormal Cases | Boundary/Special | Priority Max |
|----|-----------|-------------|----------------|-----------------|-------------|
| AC-1 | Docker startup | AC-1-NC-1, AC-1-NC-2 | AC-1-AB-1, AC-1-AB-2 | — | P0 |
| AC-2 | App access | AC-2-NC-1, AC-2-NC-2 | AC-2-AB-1 | — | P0 |
| AC-3 | Health endpoint | AC-3-NC-1, AC-3-NC-2 | AC-3-AB-1, AC-3-AB-2 | — | P0 |
| AC-4 | Frontend routes | AC-4-NC-1, AC-4-NC-2 | AC-4-AB-1, AC-4-AB-2, AC-4-AB-3 | — | P0 |
| AC-5 | Layout + sidebar | AC-5-NC-1, AC-5-NC-2 | AC-5-AB-1 | — | P1 |
| AC-6 | UI components | AC-6-NC-1, AC-6-NC-2 | AC-6-AB-1 | — | P1 |
| AC-7 | FastAPI boot | AC-7-NC-1, AC-7-NC-2 | AC-7-AB-1 | — | P0 |
| AC-8 | Router groups | AC-8-NC-1, AC-8-NC-2 | AC-8-AB-1 | — | P0 |
| AC-9 | Stub endpoints | AC-9-NC-1, AC-9-NC-2, AC-9-NC-3 | AC-9-AB-1, AC-9-AB-2, AC-9-AB-3 | BV-BENCH-1~4, BV-ALLOC-1~3 | P0 |
| AC-10 | DB schema | AC-10-NC-1, AC-10-NC-2 | AC-10-AB-1 | — | P0 |
| AC-11 | Seed data | AC-11-NC-1, AC-11-NC-2, AC-11-NC-3 | AC-11-AB-1 | — | P1 |
| AC-12 | CSV upload stub | AC-12-NC-1, AC-12-NC-2 | AC-12-AB-1, AC-12-AB-2, AC-12-AB-3 | AC-12-LOG-1 | P0 |
| AC-13 | LLM stub | AC-13-NC-1, AC-13-NC-2 | AC-13-AB-1 | AC-13-BV-1, AC-13-LOG-1 | P1 |
| AC-14 | Redis client | AC-14-NC-1 | AC-14-AB-1 | — | P1 |
| AC-15 | Structured logging | AC-15-NC-1, AC-15-NC-2, AC-15-NC-3 | AC-15-AB-1 | — | P0 (NFR-9) |
| AC-16 | Lint/format | AC-16-NC-1, AC-16-NC-2 | — | — | P0 |
| AC-17 | Type checking | AC-17-NC-1, AC-17-NC-2 | — | — | P0 |
| AC-18 | CI pipeline | AC-18-NC-1, AC-18-NC-2 | AC-18-AB-1 | — | P1 |
| AC-19 | Authentication | AC-19-NC-1, AC-19-NC-2, AC-19-NC-3 | AC-19-AB-1~4 | AC-19-BV-1, AC-19-BV-2, AC-19-PERM-1 | P0 |
| AC-20 | CSV 10MB limit | AC-20-NC-1, AC-20-NC-2 | AC-20-AB-1, AC-20-AB-2 | AC-20-BV-1, AC-20-BV-2, AC-20-BV-3, AC-20-LOG-1 | P0 |

---

## Tổng kết số lượng TCs

| Priority | Số lượng |
|----------|---------|
| P0 | 33 |
| P1 | 31 |
| P2 | 12 |
| **Total** | **76** |

---

*End of blackbox-testcases.md — RA-001 v2.0*
