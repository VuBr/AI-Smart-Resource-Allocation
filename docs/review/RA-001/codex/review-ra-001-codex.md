# Code Review Report - RA-001 (Codex)

## 1) Diff summary (<=5 dòng)
- Thay đổi rất lớn: `164 files changed`, chủ yếu là scaffold full-stack mới (API FastAPI + Web Next.js + Docker + docs).
- Backend có đủ 7 router groups, migration Alembic, seed script, service stubs, và test backend cơ bản.
- Frontend có đủ 10 routes yêu cầu, layout/sidebar/header, service client và auth hook client-side.
- Có CI workflow cho lint/typecheck/build/test, nhưng coverage test hiện mới tập trung backend happy path.
- Nhiều điểm lệch API contract/AC ở error format, field naming, input validation path, và security/perf guardrail.

## 2) Findings

- [Blocker] API contract lệch chuẩn ở error code/message và field `allocation_percentage`
  - Evidence:
    - `apps/api/app/api/v1/routers/engineers.py:27`
    - `apps/api/app/api/v1/routers/projects.py:25`
    - `apps/api/app/schemas/allocation.py:10`
    - `docs/changes/RA-001/Raw/api-contract.md:106`
    - `docs/changes/RA-001/Raw/api-contract.md:407`
    - `docs/changes/RA-001/Raw/api-contract.md:595`
  - Impact:
    - Client contract có thể fail (expect snake_case + `allocation_percentage`), AC-20/AC-12/AC-11 không đạt đúng đặc tả.
  - Recommended fix:
    - Chuẩn hóa toàn bộ error code/message theo snake_case contract; đổi request/response allocation sang `allocation_percentage` (hoặc map alias 2 chiều nếu cần compatibility).

- [Blocker] Không chuẩn hóa lỗi 422 cho body malformed (AC-19 yêu cầu standardized error)
  - Evidence:
    - `apps/api/app/main.py:48` chỉ handle `HTTPException`, không handle `RequestValidationError`.
    - `apps/api/app/api/v1/routers/auth.py:12` dùng Pydantic body nên malformed sẽ rơi vào default FastAPI format.
  - Impact:
    - Trả lỗi khác contract `{"error": {...}}`, vi phạm AC-19.
  - Recommended fix:
    - Thêm exception handler cho `RequestValidationError` để map về format chuẩn (`unprocessable_entity`/`validation_error` theo spec).

- [Major] `/allocations/recommend` có đường đi trả 500 do parse UUID thủ công
  - Evidence:
    - `apps/api/app/api/v1/routers/allocations.py:25`
    - `apps/api/app/api/v1/routers/allocations.py:27` (`uuid.UUID(...)` không được catch).
  - Impact:
    - Input xấu có thể ra 500 (vi phạm NFR-2 “không 500 cho stub endpoints”), tăng regression risk.
  - Recommended fix:
    - Dùng Pydantic request model với field UUID, trả 422/400 chuẩn hóa thay vì parse thủ công.

- [Major] Hardcoded secret/credential defaults trong code
  - Evidence:
    - `apps/api/app/core/config.py:8`
    - `apps/api/app/core/config.py:23`
    - `docker-compose.yml:41`
  - Impact:
    - Vi phạm NFR-8/security rule “No secrets hardcoded”, rủi ro lộ cấu hình nhạy cảm.
  - Recommended fix:
    - Bỏ default secret thực tế trong source, bắt buộc inject qua env; giữ placeholder trong `.env.example`.

- [Major] Upload CSV đọc toàn bộ file vào memory trước khi chặn size
  - Evidence:
    - `apps/api/app/services/csv_ingestion.py:25`
    - `apps/api/app/services/csv_ingestion.py:47`
  - Impact:
    - Memory spike/DoS risk với file lớn, trái tinh thần performance check (reject sớm).
  - Recommended fix:
    - Đọc stream theo chunk, dừng ngay khi vượt ngưỡng 10MB, không giữ toàn bộ content trong RAM.

- [Major] Auth guard chưa bao phủ toàn bộ non-login routes
  - Evidence:
    - `apps/web/app/page.tsx:3` route `/` vẫn public template; AC ghi “all other routes redirect to `/login` when no token”.
  - Impact:
    - Hành vi auth không nhất quán, lệch AC-19.
  - Recommended fix:
    - Redirect `/` về `/login` hoặc `/dashboard` có guard; đảm bảo mọi route trừ `/login` đều enforced.

- [Major] Thiếu coverage test cho các path quan trọng/edge cases
  - Evidence:
    - `apps/api/tests/test_engineers.py:6`
    - `apps/api/tests/test_projects.py:6`
    - `apps/api/tests/test_allocations.py:6`
    - `apps/api/tests/test_bench.py:4`
    - Chưa có test cho `/auth/login`, `/allocations/recommendations/{project_id}`, `/reports/shortage`, standardized 422/error shape, boundary đúng 10MB.
  - Impact:
    - Dễ lọt regression ở contract/status code/security boundary.
  - Recommended fix:
    - Bổ sung integration tests theo AC matrix và boundary tests bắt buộc.

## 3) AC chưa đạt / khác đặc tả
- AC-19: error malformed body chưa theo format chuẩn `{"error": ...}`.
- AC-12/AC-20: mã lỗi/thông điệp 413 chưa đúng contract (`file_too_large`, message chuẩn 10MB).
- AC-11: contract allocation đang dùng `percentage` thay vì `allocation_percentage`.
- AC-19 (frontend guard): route `/` chưa redirect khi không token (nếu áp dụng đúng câu “all other routes”).
- NFR-8 (security): còn hardcoded credential/secret defaults trong source.

## 4) Đề xuất test cases bổ sung
1. `POST /api/v1/auth/login` với body sai schema (`{email: 123}`) phải trả lỗi chuẩn `{"error":{...}}` và status đúng.
2. `POST /api/v1/allocations/recommend` với `project_id` invalid string phải không trả 500; phải trả 422/400 theo contract.
3. CSV boundary: file đúng **10,485,760 bytes** trả 200; file **10,485,761 bytes** trả 413 + `file_too_large` + message chuẩn.
4. `POST /api/v1/allocations/confirm` verify request/response field name đúng contract (`allocation_percentage`).
5. `GET /api/v1/allocations/recommendations/{project_id}` với project không tồn tại trả 404 + code chuẩn.
6. `GET /api/v1/reports/shortage` và `GET /api/v1/dashboard/stats` có test schema + status + content shape.
7. Frontend E2E: truy cập từng route protected khi chưa token đều redirect `/login` (bao gồm `/` nếu coi là protected).
8. Security test: scan config bảo đảm không còn default secret thực tế trong code runtime settings.

## Overall judgment
**Request changes**

Có nhiều lệch contract/AC ở error format, naming field, và input-validation path có thể trả 500.
Có rủi ro security/performance rõ (hardcoded defaults, đọc full file upload vào RAM).
Nên fix các điểm Blocker/Major trước khi approve để tránh regression contract ở phase sau.
