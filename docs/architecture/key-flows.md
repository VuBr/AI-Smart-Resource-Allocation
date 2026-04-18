# Các Luồng Nghiệp Vụ Chính — AI Smart Resource Allocation

**Loại:** Living Document
**Nguồn gốc:** Phase 0-B (2026-04-09)
**Cập nhật lần cuối:** Phase 0-B (2026-04-09)

> Tài liệu này mô tả bộ khung các luồng chính. Chi tiết endpoint → `docs/architecture/system-overview.md §5`.
> Domain entities → `docs/architecture/domain-model.md`.

---

## Luồng 1 — Đăng nhập (Login)

**Actor:** Người dùng hệ thống (admin / manager / viewer)
**Pre-condition:** Hệ thống đang chạy, chưa có `access_token` trong `localStorage`

```
Browser                    Next.js (FE)             FastAPI (BE)          PostgreSQL
  │                            │                         │                     │
  │  GET /login                │                         │                     │
  │ ─────────────────────────► │                         │                     │
  │  render LoginPage          │                         │                     │
  │ ◄───────────────────────── │                         │                     │
  │                            │                         │                     │
  │  submit {email, password}  │                         │                     │
  │ ─────────────────────────► │                         │                     │
  │                            │  POST /api/v1/auth/login│                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │  SELECT users WHERE │
  │                            │                         │  email = ?          │
  │                            │                         │ ───────────────────►│
  │                            │                         │ ◄─────────────────── │
  │                            │  200 {access_token}     │                     │
  │                            │ ◄─────────────────────── │                     │
  │  localStorage.set(token)   │                         │                     │
  │  router.replace('/dashboard')                        │                     │
  │ ◄───────────────────────── │                         │                     │
```

**Kết quả:** Token lưu tại `localStorage["access_token"]`, mọi request sau tự động đính kèm `Authorization: Bearer <token>`.

**Xử lý lỗi:**
- Sai credentials → `401 Unauthorized` → hiện thông báo lỗi, không redirect
- Network error → hiện generic error

> **⚠️ Phase 5:** Auth là Mock JWT (SD-1 chưa resolve). Mọi credentials đều được chấp nhận.
> Evidence: `apps/api/app/core/security.py` line 13 — `return MOCK_TOKEN`.

---

## Luồng 2 — Import Engineer qua CSV

**Actor:** Manager / Admin
**Pre-condition:** Đã đăng nhập, có file CSV hợp lệ

```
Browser                    Next.js (FE)             FastAPI (BE)          PostgreSQL
  │                            │                         │                     │
  │  GET /upload               │                         │                     │
  │ ─────────────────────────► │ render UploadPage       │                     │
  │ ◄───────────────────────── │                         │                     │
  │                            │                         │                     │
  │  chọn file CSV             │                         │                     │
  │  submit FormData           │                         │                     │
  │ ─────────────────────────► │                         │                     │
  │                            │ POST /api/v1/engineers/ │                     │
  │                            │ upload (multipart)      │                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │ validate MIME type  │
  │                            │                         │ validate size ≤10MB │
  │                            │                         │ parse CSV (Pandas)  │
  │                            │                         │ validate schema     │
  │                            │                         │ (Pydantic)          │
  │                            │                         │ upsert by email     │
  │                            │                         │ ───────────────────►│
  │                            │                         │ ◄─────────────────── │
  │                            │  200 {inserted,         │                     │
  │                            │   updated,skipped,      │                     │
  │                            │   errors[]}             │                     │
  │                            │ ◄─────────────────────── │                     │
  │  hiện kết quả import       │                         │                     │
  │ ◄───────────────────────── │                         │                     │
```

**Kết quả:** Engineers được upsert vào DB. Response trả về count {inserted, updated, skipped, errors}.

**Xử lý lỗi:**
- File > 10MB → `413 Payload Too Large`
- MIME không phải `text/csv` → `400 Bad Request`
- Row không hợp lệ → đưa vào `errors[]`, không rollback toàn bộ

**Evidence:**
- Service: `apps/api/app/services/csv_ingestion.py`
- Router: `apps/api/app/api/v1/routers/engineers.py` — `POST /upload`

---

## Luồng 3 — Xem Danh sách Engineer & Bench Forecast

**Actor:** Manager / Viewer
**Pre-condition:** Đã đăng nhập, đã có engineers trong DB

```
Browser                    Next.js (FE)             FastAPI (BE)          PostgreSQL
  │                            │                         │                     │
  │  GET /engineers            │                         │                     │
  │ ─────────────────────────► │ useAuthGuard()          │                     │
  │                            │ (redirect → /login nếu  │                     │
  │                            │  không có token)        │                     │
  │                            │                         │                     │
  │                            │ useQuery(listEngineers) │                     │
  │                            │ GET /api/v1/engineers   │                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │  SELECT * FROM      │
  │                            │                         │  engineers          │
  │                            │                         │ ───────────────────►│
  │                            │  200 Engineer[]         │ ◄─────────────────── │
  │                            │ ◄─────────────────────── │                     │
  │  render bảng engineers     │                         │                     │
  │ ◄───────────────────────── │                         │                     │
  │                            │                         │                     │
  │  click "View" engineer     │                         │                     │
  │ ─────────────────────────► │ GET /engineers/[id]     │                     │
  │                            │ GET /api/v1/engineers/  │                     │
  │                            │ {id}/bench-forecast     │                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │ BenchPrediction     │
  │                            │                         │ Engine.predict_bench│
  │                            │                         │ (days until bench,  │
  │                            │                         │  risk level, alert) │
  │                            │  200 BenchForecastItem  │                     │
  │                            │ ◄─────────────────────── │                     │
  │  hiện forecast card        │                         │                     │
  │ ◄───────────────────────── │                         │                     │
```

**Logic Bench Prediction** (evidence: `apps/api/app/services/bench_prediction.py`):
```
days = bench_start_date - today
is_alert = days <= BENCH_ALERT_DAYS_THRESHOLD (default: 30)
risk_level:
  days <= 0   → HIGH  (probability 0.9)
  days <= 7   → HIGH  (probability 0.8)
  days <= 30  → MEDIUM (probability 0.6)
  days > 30   → LOW   (probability 0.2)
```

---

## Luồng 4 — Recommend & Confirm Allocation

**Actor:** Manager / Admin
**Pre-condition:** Đã có project + engineers trong DB

```
Browser                    Next.js (FE)             FastAPI (BE)          PostgreSQL / Redis
  │                            │                         │                     │
  │  GET /allocation           │                         │                     │
  │ ─────────────────────────► │ render AllocationPage   │                     │
  │  chọn project              │                         │                     │
  │                            │                         │                     │
  │  click "Recommend"         │                         │                     │
  │ ─────────────────────────► │ GET /api/v1/allocations/│                     │
  │                            │ recommendations/{id}    │                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │ AllocationRecommend │
  │                            │                         │ ationOrchestrator   │
  │                            │                         │ .recommend_engineers│
  │                            │                         │ (Phase 6+: LLM      │
  │                            │                         │ scoring + constraint│
  │                            │                         │ engine)             │
  │                            │  200 RecommendationRes  │                     │
  │                            │ ◄─────────────────────── │                     │
  │  hiện ranked list          │                         │                     │
  │  (score, skill_match,      │                         │                     │
  │   experience_match,        │                         │                     │
  │   availability_match)      │                         │                     │
  │ ◄───────────────────────── │                         │                     │
  │                            │                         │                     │
  │  click "Confirm"           │                         │                     │
  │ ─────────────────────────► │ POST /api/v1/allocations│                     │
  │                            │ /confirm                │                     │
  │                            │ {engineer_id,           │                     │
  │                            │  project_id,percentage} │                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │ check total% ≤ 100  │
  │                            │                         │ INSERT allocation   │
  │                            │                         │ ───────────────────►│
  │                            │                         │ log allocation_     │
  │                            │                         │ confirmed           │
  │                            │  201 AllocationConfirm  │                     │
  │                            │ ◄─────────────────────── │                     │
  │  hiện success              │                         │                     │
  │ ◄───────────────────────── │                         │                     │
```

**Business Rule Quan Trọng:**
- Tổng `allocation_percentage` của một engineer qua tất cả allocation active **≤ 100%**
- Vi phạm → `400 Bad Request` với code `AllocationCapExceeded`

> **⚠️ Phase 5:** Recommend trả về **mock data**. LLM scoring thực sẽ có từ Phase 6+.
> Evidence: `apps/api/app/services/allocation_orchestrator.py` line 12 — `"""STUB: Return mock recommendations"""`

---

## Luồng 5 — Dashboard Stats & Bench Alerts

**Actor:** Manager / Admin / Viewer
**Pre-condition:** Đã đăng nhập

```
Browser                    Next.js (FE)             FastAPI (BE)          PostgreSQL
  │                            │                         │                     │
  │  GET /dashboard            │                         │                     │
  │ ─────────────────────────► │ render DashboardPage    │                     │
  │                            │                         │                     │
  │                            │ [parallel queries]      │                     │
  │                            │ GET /api/v1/dashboard/  │                     │
  │                            │ stats                   │                     │
  │                            │ ───────────────────────►│ aggregate:          │
  │                            │                         │ total_engineers,    │
  │                            │                         │ bench_count,        │
  │                            │                         │ active_projects,    │
  │                            │                         │ allocation_rate     │
  │                            │  200 DashboardStats     │ ───────────────────►│
  │                            │ ◄─────────────────────── │ ◄─────────────────── │
  │                            │                         │                     │
  │                            │ GET /api/v1/bench/alerts│                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │ engineers WHERE     │
  │                            │                         │ bench_start_date    │
  │                            │                         │ - today ≤ 30 days   │
  │                            │                         │ ───────────────────►│
  │                            │  200 BenchAlertItem[]   │ ◄─────────────────── │
  │                            │ ◄─────────────────────── │                     │
  │  render stats cards +      │                         │                     │
  │  bench alert table         │                         │                     │
  │ ◄───────────────────────── │                         │                     │
```

**Kết quả:** Dashboard hiển thị tổng quan nhân sự + danh sách engineers cần chú ý (bench trong 30 ngày tới).

---

## Luồng 6 — Import Project qua CSV (RA-012)

**Actor:** Manager / Admin
**Pre-condition:** Đã đăng nhập, có file CSV hợp lệ (UTF-8, ≤ 10MB, header đúng)

```
Browser                    Next.js (FE)             FastAPI (BE)          PostgreSQL
  │                            │                         │                     │
  │  GET /upload               │                         │                     │
  │ ─────────────────────────► │ render UploadPage       │                     │
  │ ◄───────────────────────── │                         │                     │
  │                            │                         │                     │
  │  chọn file CSV             │                         │                     │
  │  submit FormData           │                         │                     │
  │ ─────────────────────────► │                         │                     │
  │                            │ POST /api/v1/projects/  │                     │
  │                            │ upload (multipart)      │                     │
  │                            │ ───────────────────────►│                     │
  │                            │                         │ validate MIME type  │
  │                            │                         │ validate size ≤10MB │
  │                            │                         │ decode UTF-8        │
  │                            │                         │ validate header     │
  │                            │                         │ (must have "name")  │
  │                            │                         │ parse rows          │
  │                            │                         │ validate each row   │
  │                            │                         │ upsert by name      │
  │                            │                         │ ───────────────────►│
  │                            │                         │ ◄─────────────────── │
  │                            │  200 {inserted,         │                     │
  │                            │   updated,skipped,      │                     │
  │                            │   errors[]}             │                     │
  │                            │ ◄─────────────────────── │                     │
  │  hiện kết quả import       │                         │                     │
  │ ◄───────────────────────── │                         │                     │
```

**Kết quả:** Projects được upsert vào DB. Response trả về `{inserted, updated, skipped, errors}`.

**Upsert key:** `name` (exact match, case-sensitive). Duplicate name → UPDATE, không INSERT thêm.

**Xử lý lỗi:**
- File > 10MB → `413 Payload Too Large`, `code: "FileTooLarge"`
- MIME không phải CSV → `400 Bad Request`, `code: "InvalidCsv"`
- File không decode được UTF-8 → `400 Bad Request`, `code: "InvalidEncoding"`
- Header thiếu cột `name` → `400 Bad Request`, `code: "InvalidCsvHeader"`
- Row không hợp lệ → đưa vào `errors[]` với format `"Row {N}: {field} — {reason}"`, không rollback toàn bộ

**Field rules tóm tắt:**

| Column | Required | Default | Constraint |
|--------|----------|---------|-----------|
| `name` | Yes | — | max 200 chars |
| `description` | No | null | max 1000 chars |
| `required_skills` | No | null | max 500 chars |
| `required_level` | No | null | junior/mid/senior/lead |
| `headcount` | No | 1 | > 0 |
| `status` | No | planned | planned/active/closed |
| `start_date` | No | null | YYYY-MM-DD |
| `end_date` | No | null | YYYY-MM-DD, ≥ start_date |

> **Lưu ý upsert optional fields:** Nếu field optional bỏ trống trong CSV → overwrite DB thành `null` (không giữ giá trị cũ).

**Evidence:**
- Service: `apps/api/app/services/csv_ingestion.py` — `parse_projects_csv()` (RA-012 replaces stub)
- Router: `apps/api/app/api/v1/routers/projects.py` — `POST /api/v1/projects/upload`
- Repository: `apps/api/app/repositories/project_repository.py` — `upsert_by_name()` (RA-012 adds)
- Frontend: `apps/web/app/upload/page.tsx`, `apps/web/features/upload/UploadZone.tsx`

---

## Tóm tắt Cross-Cutting Concerns

| Concern | Cơ chế | Evidence |
|---------|--------|---------|
| **Authentication** | `localStorage["access_token"]` → Axios interceptor → `Authorization: Bearer` header | `apps/web/lib/api-client.ts` |
| **Route Guard** | `useAuthGuard()` hook — redirect về `/login` nếu không có token | `apps/web/hooks/useAuthGuard.ts` |
| **Error Format** | `{"error": {"code": "...", "message": "..."}}` thống nhất cho mọi endpoint | `apps/api/app/schemas/common.py` |
| **Logging** | Structured JSON, không có PII, `log_event()` | `apps/api/app/core/logging.py` |
| **Allocation Cap** | Kiểm tra tổng percentage ≤ 100% trước khi confirm | `apps/api/app/api/v1/routers/allocations.py` |
| **Bench Alert** | Threshold 30 ngày, configurable qua `BENCH_ALERT_DAYS_THRESHOLD` | `apps/api/app/services/bench_prediction.py` |
