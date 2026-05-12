# Black-box Review Checklist — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** 1.0 (Phase 7)
**Ngày tạo:** 2026-04-03
**Mục đích:** Biến các góc nhìn dễ bị bỏ sót thành checklist có thể đánh dấu trước khi release

---

## Cách sử dụng

- Dùng checklist này **sau khi** chạy `blackbox-testcases.md` để bắt những lỗi bị miss
- Mỗi item là một "góc nhìn" (perspective), không phải một test case cụ thể
- Ký hiệu: `[ ]` = chưa verify, `[x]` = pass, `[!]` = fail/concern

**Phân tầng ưu tiên:**
- **[P0]** — Phải pass trước khi merge scaffold
- **[P1]** — Nên pass; document lý do nếu skip
- **[P2]** — Nice to have; có thể để Phase 2+

---

## A. Boundary Conditions (Giá trị biên)

> Các điều kiện ở ranh giới thường bị test bỏ sót vì test hạnh phúc chạy qua và test lỗi dùng giá trị "rõ ràng sai".

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| A-1 | **CSV size = 10MB chính xác** | File đúng 10,485,760 bytes phải được CHẤP NHẬN (200), không phải 413. Kiểm tra rõ điều kiện là `> 10MB`, không phải `>= 10MB`. | P0 | [ ] |
| A-2 | **CSV size = 10MB + 1 byte** | File 10,485,761 bytes phải bị TỪ CHỐI (413). Ranh giới chính xác tại byte thứ 10,485,761. | P0 | [ ] |
| A-3 | **Bench threshold = 30 ngày (inclusive)** | Engineer với `bench_start_date - today = 30` phải XUẤT HIỆN trong `/bench/alerts`. | P1 | [ ] |
| A-4 | **Bench threshold = 31 ngày (exclusive)** | Engineer với `bench_start_date - today = 31` phải KHÔNG xuất hiện trong `/bench/alerts`. | P1 | [ ] |
| A-5 | **bench_start_date trong quá khứ** | Engineer đã bench (bench_start_date < today) phải XUẤT HIỆN trong alerts (ngày âm = already benched). | P1 | [ ] |
| A-6 | **bench_start_date = null** | Engineer không có `bench_start_date` phải KHÔNG xuất hiện trong bench alerts. | P1 | [ ] |
| A-7 | **Allocation tổng = 100% (exact)** | Tổng allocation = 100% phải được CHẤP NHẬN (201). Điều kiện từ chối là `> 100%`, không phải `>= 100%`. | P1 | [ ] |
| A-8 | **Allocation tổng = 101%** | Tổng = 101% phải bị TỪ CHỐI (400, `allocation_cap_exceeded`). | P0 | [ ] |
| A-9 | **Allocation = 1% (minimum)** | Allocation_percentage = 1 phải hợp lệ. Không có constraint minimum > 1. | P2 | [ ] |
| A-10 | **UUID all-zeros** | `GET /engineers/00000000-0000-0000-0000-000000000000` phải trả về 404, không phải 500. | P0 | [ ] |
| A-11 | **BENCH_ALERT_DAYS_THRESHOLD env var** | Nếu thay đổi env var thành 15, threshold phải thay đổi tương ứng (không hardcode 30). | P2 | [ ] |

---

## B. Permission / Role (Phân quyền)

> Kiểm tra rằng routes được bảo vệ đúng cách — không nhiều hơn, không ít hơn.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| B-1 | **`/login` không redirect** | Route `/login` phải accessible mà KHÔNG có token; không redirect về chính nó (loop). | P0 | [ ] |
| B-2 | **Tất cả 9 protected routes redirect** | Mỗi route (dashboard, engineers, upload, projects, allocation, bench-forecast, reports, engineers/[id], projects/[id]) phải redirect về `/login` khi không có token. | P0 | [ ] |
| B-3 | **Không bypass bằng old/expired token** | Token cũ (ký sai) phải bị từ chối (401), không cho qua. Phase 5 mock có thể chỉ check format. | P1 | [ ] |
| B-4 | **Upload endpoint require auth** | `POST /engineers/upload` không có Authorization header phải trả về 401, không phải 200. | P0 | [ ] |
| B-5 | **`/bench/alerts` require auth** | Không có token → 401. | P0 | [ ] |
| B-6 | **Role không được enforce trong Phase 5 (document)** | Xác nhận và document: viewer token có thể access `/upload` trong Phase 5 (Phase 2 sẽ fix). | P2 | [ ] |
| B-7 | **Auth endpoint không require auth** | `POST /auth/login` phải trả về 200 mà không cần Authorization header. | P0 | [ ] |

---

## C. Error Format Consistency (Định dạng lỗi nhất quán)

> Tất cả error responses phải tuân theo cùng một schema `{"error":{"code":"...","message":"..."}}`.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| C-1 | **401 Unauthorized dùng đúng format** | `{"error":{"code":"unauthorized","message":"..."}}` — không phải FastAPI default `{"detail":"..."}` | P0 | [ ] |
| C-2 | **404 Not Found dùng đúng format** | `{"error":{"code":"not_found","message":"..."}}` cho engineer và project | P0 | [ ] |
| C-3 | **413 dùng đúng code** | `error.code = "file_too_large"` — không phải `"payload_too_large"` hay `"file_size_exceeded"` | P0 | [ ] |
| C-4 | **400 Allocation cap dùng đúng code** | `error.code = "allocation_cap_exceeded"` — chính xác theo api-contract.md | P0 | [ ] |
| C-5 | **422 từ validation phân biệt với 400** | FastAPI validation error (missing field) trả về 422, không phải 400 | P1 | [ ] |
| C-6 | **500 không bao giờ lộ ra ngoài trong scaffold** | Không có endpoint nào trả về 500 trong normal và abnormal test cases. Nếu có 500 → đây là bug. | P0 | [ ] |
| C-7 | **error.code dùng snake_case** | Code phải là snake_case (`not_found`, `file_too_large`) không phải camelCase hay SCREAMING_SNAKE | P1 | [ ] |
| C-8 | **error.message là human-readable** | `message` phải là chuỗi mô tả cho user, không phải debug info hay stack trace | P1 | [ ] |

---

## D. Logging / Audit (Ghi log)

> Kiểm tra rằng đúng events được ghi, đúng format, và không có thông tin nhạy cảm.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| D-1 | **Log format là JSON** | Mỗi log entry phải parseable bằng `json.loads()`; không phải plain text | P1 | [ ] |
| D-2 | **request_start được emit** | Mỗi HTTP request phải có `event: "request_start"` trong log | P1 | [ ] |
| D-3 | **request_end chứa status và latency** | `request_end` phải có `status` (HTTP code) và `latency_ms` (hoặc tương đương) | P1 | [ ] |
| D-4 | **csv_import_started được emit khi upload** | Upload endpoint phải log `csv_import_started` trước khi xử lý | P1 | [ ] |
| D-5 | **csv_import_failed được emit khi 413** | Khi file quá lớn bị reject, phải có log entry với event `csv_import_failed` | P1 | [ ] |
| D-6 | **llm_score_computed được emit khi recommend** | Gọi `/allocations/recommend` phải log scoring event | P1 | [ ] |
| D-7 | **Không có email trong log** | Kiểm tra toàn bộ log output trong 1 test session: KHÔNG có pattern `*@*.com` | P0 | [ ] |
| D-8 | **Không có tên engineer trong log** | Tên "Nguyen Van An", "Tran Thi Bich", v.v. không được xuất hiện trong log | P0 | [ ] |
| D-9 | **Không có nội dung file CSV trong log** | Dữ liệu rows trong file upload không được log ra | P0 | [ ] |
| D-10 | **8 event categories đủ** | Xác nhận đủ: request_start, request_end, csv_import_started, csv_import_completed, csv_import_failed, allocation_confirmed, llm_score_computed, error | P1 | [ ] |
| D-11 | **request_id xuất hiện nhất quán** | Nếu request_id được implement, phải xuất hiện trong cả request_start và request_end của cùng một request | P2 | [ ] |

---

## E. HTTP Status Codes (Mã trạng thái HTTP)

> Kiểm tra các mã status "dễ nhầm" — 201 vs 200, 413 vs 400, 422 vs 400.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| E-1 | **`POST /allocations/confirm` trả về 201** | Tạo allocation mới phải trả về 201 (Created), không phải 200 | P0 | [ ] |
| E-2 | **CSV upload 10MB+1 trả về 413** | Phải là 413 (Payload Too Large), không phải 400 (Bad Request) | P0 | [ ] |
| E-3 | **MIME type sai trả về 400** | File không phải CSV → 400 (không phải 413 hay 422) | P1 | [ ] |
| E-4 | **Missing body field trả về 422** | Thiếu field bắt buộc trong JSON body → 422 (FastAPI validation), không phải 400 | P1 | [ ] |
| E-5 | **List endpoints trả về 200** | `GET /engineers`, `GET /projects`, v.v. phải là 200 — ngay cả khi list empty | P0 | [ ] |
| E-6 | **Health endpoint trả về 200** | `GET /health` không có auth phải là 200, không phải 401 | P0 | [ ] |
| E-7 | **Wrong method trả về 405** | `POST /api/v1/health` phải là 405 (Method Not Allowed), không phải 404 | P2 | [ ] |

---

## F. Data Structure / Contract (Cấu trúc dữ liệu)

> Kiểm tra rằng response schema khớp với api-contract.md — đặc biệt quan trọng vì Phase 5 dùng stub.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| F-1 | **Engineer object có đủ required fields** | `id`, `name`, `email`, `primary_skill`, `level`, `availability_percentage` phải luôn có | P0 | [ ] |
| F-2 | **UUID format đúng** | Tất cả `id` fields phải có format UUID (8-4-4-4-12 hex), không phải integer hay random string | P1 | [ ] |
| F-3 | **level enum đúng giá trị** | `level` chỉ có thể là `"junior"`, `"mid"`, `"senior"` — không phải `"Junior"` (case-sensitive) | P1 | [ ] |
| F-4 | **status enum đúng giá trị** | Allocation `status`: `"active"`, `"completed"`, `"cancelled"`; Project `status`: `"planned"`, `"active"`, `"closed"` | P1 | [ ] |
| F-5 | **Scores trong [0.0, 1.0]** | `overall_score`, `skill_match_score`, v.v. phải là float trong [0.0, 1.0] — không phải [0, 100] | P1 | [ ] |
| F-6 | **CSV upload stub response có đủ 4 fields** | Phải có chính xác: `inserted`, `updated`, `skipped`, `errors` (array) | P0 | [ ] |
| F-7 | **dashboard/stats có đủ 4 fields** | `total_engineers`, `engineers_on_bench`, `active_projects`, `allocation_rate_percentage` | P0 | [ ] |
| F-8 | **bench/alerts có đúng fields** | Mỗi item phải có: `engineer_id`, `engineer_name`, `bench_start_date`, `days_until_bench`, `risk_level` | P1 | [ ] |
| F-9 | **health endpoint body chính xác** | Body phải là `{"status":"ok","version":"1.0.0"}` — đúng từng từ | P0 | [ ] |
| F-10 | **Dates là ISO 8601 string** | Tất cả date fields phải là string `"YYYY-MM-DD"`, không phải timestamp integer | P1 | [ ] |
| F-11 | **secondary_skills là array** | Phải là JSON array `["Python","FastAPI"]`, không phải string `"Python,FastAPI"` | P1 | [ ] |

---

## G. Stub Contract (Hợp đồng stub — Phase 5 specific)

> Stub phải trả về data có cùng cấu trúc với implementation thật sự về sau. Nếu stub trả về "dummy shape", Phase 3 sẽ break.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| G-1 | **LLM stub response có đủ score components** | `recommendations[].skill_match_score`, `level_match_score`, `availability_score`, `overall_score` đều phải có | P1 | [ ] |
| G-2 | **LLM stub ghi đúng provider** | `llm_provider = "stub"` và `model_version = "stub-v0"` (nếu exposed trong log hoặc response) | P1 | [ ] |
| G-3 | **CSV stub response là stub — không phải data thật** | `/engineers/upload` stub trả về `inserted:0` — không phải actual insert count | P0 | [ ] |
| G-4 | **Auth stub không verify signature** | Mock JWT không cần signature verification — bất kỳ token format hợp lệ nào đều pass | P0 | [ ] |
| G-5 | **Bench forecast stub trả về đúng schema** | `engineer_id`, `forecast_date`, `risk_level`, `probability`, `recommendation` đều phải có | P1 | [ ] |
| G-6 | **Stub code có TODO comment** | Kiểm tra (code review): tất cả mock auth code có comment `# TODO: Replace with real JWT auth before production` | P1 | [ ] |

---

## H. Compatibility / Input Validation (Tương thích đầu vào)

> Kiểm tra rằng API xử lý đúng các variations của input format.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| H-1 | **multipart/form-data field name phải là `file`** | `POST /engineers/upload` với field name khác (ví dụ `csv`, `data`) phải bị từ chối | P0 | [ ] |
| H-2 | **Content-Type: application/json bắt buộc cho JSON endpoints** | `POST /auth/login` không có `Content-Type: application/json` header có thể bị từ chối | P1 | [ ] |
| H-3 | **UUID path param phải hợp lệ** | `GET /engineers/not-a-uuid` (không phải UUID format) → 422 hoặc 404 (không phải 500) | P1 | [ ] |
| H-4 | **Empty string không phải UUID** | `GET /engineers/` (trailing slash) → 404 hoặc 307 redirect | P2 | [ ] |
| H-5 | **MIME type validation** | `.txt` file với MIME `text/plain` phải bị từ chối (400) khi upload vào CSV endpoint | P0 | [ ] |

---

## I. Client-side Auth Guard (Frontend)

> Kiểm tra logic redirect phía client — không phụ thuộc backend.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| I-1 | **localStorage/cookie clear → redirect** | Sau khi manually xóa token trong browser DevTools, reload trang protected → phải redirect về `/login` | P0 | [ ] |
| I-2 | **Login thành công → redirect về dashboard** | Submit form với credentials bất kỳ → redirect về `/dashboard` (không về `/login`) | P0 | [ ] |
| I-3 | **Token persist sau page refresh** | Sau khi login, F5 refresh `/dashboard` → KHÔNG redirect về login (token vẫn còn trong storage) | P1 | [ ] |
| I-4 | **Không có redirect loop** | Clear token → truy cập `/login` → KHÔNG redirect thêm; truy cập `/dashboard` → redirect về `/login` → KHÔNG redirect lại `/dashboard` | P0 | [ ] |
| I-5 | **Direct URL access sau login** | Sau khi login, truy cập URL protected trực tiếp trong address bar → render đúng trang (không redirect) | P1 | [ ] |

---

## J. Performance Degradation (Hiệu năng — giới hạn với scaffold)

> Phase 5 không có performance requirements, nhưng cần verify không có obvious bottlenecks.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| J-1 | **API response < 2 giây cho stub endpoints** | Các stub endpoints không có heavy logic → response phải nhanh (< 2s) trong môi trường local | P2 | [ ] |
| J-2 | **docker compose up healthy trong < 60 giây** | Tất cả 4 services phải reach healthy state trong vòng 1 phút | P2 | [ ] |
| J-3 | **Frontend page load < 5 giây** | Trang đầu tiên (login) phải load trong < 5s trên localhost | P2 | [ ] |

---

## K. Operational Concerns (Vận hành)

> Các điểm kiểm tra từ góc nhìn người vận hành hệ thống.

| # | Item | Mô tả chi tiết | Priority | Kết quả |
|---|------|----------------|----------|---------|
| K-1 | **Không có secrets trong response body** | API response không chứa database password, JWT secret key, API keys | P0 | [ ] |
| K-2 | **Không có secrets trong log output** | Log không chứa DATABASE_URL đầy đủ (với password), JWT_SECRET | P0 | [ ] |
| K-3 | **Database migration idempotent** | Chạy `alembic upgrade head` 2 lần không gây lỗi | P1 | [ ] |
| K-4 | **Seed script không duplicate** | Chạy seed script 2 lần không gây duplicate key error | P1 | [ ] |
| K-5 | **Services có health check endpoint** | `GET /api/v1/health` hoạt động cho Docker health check | P0 | [ ] |
| K-6 | **Error messages không lộ internal paths** | 500 error (nếu có) không hiển thị file path hệ thống, class names, SQL query | P1 | [ ] |

---

## Tổng kết Checklist

| Category | Tổng items | P0 | P1 | P2 |
|----------|-----------|----|----|-----|
| A. Boundary Conditions | 11 | 4 | 5 | 2 |
| B. Permission / Role | 7 | 5 | 1 | 1 |
| C. Error Format Consistency | 8 | 5 | 3 | 0 |
| D. Logging / Audit | 11 | 4 | 6 | 1 |
| E. HTTP Status Codes | 7 | 5 | 1 | 1 |
| F. Data Structure / Contract | 11 | 4 | 7 | 0 |
| G. Stub Contract | 6 | 3 | 3 | 0 |
| H. Compatibility / Input | 5 | 2 | 2 | 1 |
| I. Client-side Auth Guard | 5 | 3 | 2 | 0 |
| J. Performance Degradation | 3 | 0 | 0 | 3 |
| K. Operational Concerns | 6 | 4 | 2 | 0 |
| **TOTAL** | **80** | **39** | **32** | **9** |

---

## Sign-off

| Role | Tên | Ngày | Ký |
|------|-----|------|-----|
| Tester | | | |
| Reviewer | | | |

---

*End of blackbox-review-checklist.md — RA-001 v1.0*
