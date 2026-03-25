# 01-implementation-conventions.md — Quy tắc Implementation cho Scaffold

**Established:** Phase 2 — RA-001 (2026-03-25)
**Authority:** `.claude/CLAUDE.md`
**Áp dụng cho:** RA-001 Scaffold Phase và tất cả phase liên quan

---

## CẤM TUYỆT ĐỐI (không được đề xuất hoặc thực thi)

| Hành động bị cấm | Lý do |
|-----------------|-------|
| Thay đổi tech stack (Next.js, FastAPI, PostgreSQL, Redis) | Architecture đã được approved, thay đổi làm mất tính nhất quán |
| Gọi LLM API thật trong Phase 5 scaffold | Phase 5 chỉ dùng stub — real calls để lại cho Phase sau |
| Bỏ qua thứ tự task trong `implementation-task-breakdown.md` | Tasks có dependency chain — skip gây lỗi cascading |
| Merge mock JWT lên production/shared branch mà không có upgrade plan | Security debt không được kiểm soát |
| Đặt secrets, API keys, connection strings trong source code | Vi phạm `.claude/rules/00-safety.md` |
| Thêm endpoint/screen không có trong spec-pack.md | Nằm ngoài scope Phase 5 |
| Implement real LLM calls, real auth, pagination, rate limiting trong Phase 5 | Out of scope — xem spec-pack.md section Scope (Không làm) |
| Bỏ database migration (tạo table thủ công) | Alembic là bắt buộc per AC-10 |

---

## MOCK JWT — CẢNH BÁO BẮT BUỘC

**OI-01 DECIDED (2026-03-25):** Phase 5 scaffold dùng Mock JWT.

Quy tắc:
1. `POST /api/v1/auth/login` trả về **static mock token** cho mọi credentials hợp lệ
2. Token validation là **stub** — chỉ check format, không verify signature thật
3. Client-side route guard là **client-only** (không có server-side auth)
4. Tất cả mock auth code phải có comment: `# TODO: Replace with real JWT auth before production`
5. File `docs/changes/RA-001/impl-plan.md` phải có task tracking "Upgrade Mock JWT to Real Auth"

---

## BENCH ALERT THRESHOLD — CÁCH TÍNH CHÍNH THỨC

**OI-14 DECIDED (2026-03-25):**
- `BENCH_ALERT_DAYS_THRESHOLD = 30` (default, configurable qua env var)
- Trigger condition: **`bench_start_date - today <= 30 days`**
- Dùng trường `engineer.bench_start_date` (không phải `project.end_date`)
- Question 2 về trigger logic → không cần implement trong Phase 5

---

## THỨ TỰ THỰC HIỆN TASKS

Tasks PHẢI được thực hiện theo thứ tự dependency:

```
TASK-001 → TASK-002 → TASK-003
     ↓
TASK-004 → TASK-005 → TASK-006
     ↓
TASK-007 → ... → TASK-013  (Backend setup)
     ↓
TASK-014 → ... → TASK-017b (Database layer)
     ↓
TASK-018 → ... → TASK-023  (Service layer)
     ↓
TASK-024 → ... → TASK-060  (API endpoints)
     ↓
TASK-032 → TASK-033         (Redis — có thể song song với API endpoints)
     ↓
TASK-034 → ... → TASK-045  (Frontend)
     ↓
TASK-046 → ... → TASK-050  (Seed + Quality + CI)
     ↓
TASK-051 → TASK-052 → TASK-053  (Final validation)
```

**Validation sau mỗi milestone:** project phải build và app phải start được.

---

## STUB IMPLEMENTATION RULES

Khi implement stub services:
1. Return static/mock data với structure đúng theo schema trong `api-contract.md`
2. Record `llm_provider = "stub"` và `model_version = "stub-v0"` trong MatchScore
3. HTTP status codes phải chính xác (không được hardcode 200 cho mọi thứ)
4. CSV upload: validate MIME type và size limit thật sự (không stub validation này)
5. Bench forecast: apply 30-day threshold thật sự trong `BenchPredictionEngine.predict_bench()`

---

## DASHBOARD STATS ENDPOINT

`GET /api/v1/dashboard/stats` tồn tại trong architecture (authority: HIGHEST) nhưng không có trong `api-contract.md` Raw. Theo precedence rule:

- **Phải implement endpoint này** (architecture > api-contract)
- Mock response bắt buộc:
```json
{
  "total_engineers": 5,
  "engineers_on_bench": 1,
  "active_projects": 3,
  "allocation_rate_percentage": 80
}
```

---

## PACKAGES/SHARED — NOTE

`packages/shared/src/` (contracts, types, constants) có trong repo structure nhưng không có task tường minh trong `implementation-task-breakdown.md`. Xử lý:
- Tạo directory structure và placeholder files
- Không implement logic thật trong Phase 5
- Ghi như Open Concern trong `impl-plan.md`

---

## CODE QUALITY KHÔNG ĐƯỢC BỎ QUA

Các bước sau PHẢI được thực hiện trước khi Phase 5 được coi là complete:
1. `tsc --noEmit` — zero errors
2. `eslint .` — zero errors
3. `ruff check .` — zero errors
4. `pytest` — all pass
5. `docker compose up` — all health checks pass
