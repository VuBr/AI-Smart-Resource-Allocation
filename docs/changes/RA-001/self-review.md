# Self-Review — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** v2.0 (Phase 4)
**Ngày tạo:** 2026-03-25
**Ngày cập nhật:** 2026-03-30
**Hướng dẫn:** Điền vào sau khi hoàn thành mỗi milestone. Tổng kết ở §10–§13.

---

## Hướng dẫn điền

- `[x]` = Đã kiểm tra và pass
- `[ ]` = Chưa pass hoặc chưa kiểm tra
- `[N/A]` = Không áp dụng cho milestone này
- Ghi lệnh đã chạy và output trong sub-block "Lệnh đã chạy" của mỗi milestone
- Ghi mọi vấn đề phát sinh vào §12 (Known Risks) ngay khi phát hiện — không để đến cuối

---

## §1. Milestone M-01: Repository & Infrastructure

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 1.1 | `docker-compose.yml` có đủ 4 services (web:3000, api:8000, postgres:5432, redis:6379) | [ ] Pass / [ ] Fail | |
| 1.2 | Health checks cho postgres và redis tồn tại và pass | [ ] Pass / [ ] Fail | |
| 1.3 | `.env.example` có đủ 18 biến môi trường | [ ] Pass / [ ] Fail | |
| 1.4 | `.gitignore` có pattern `.env*` và các sensitive file | [ ] Pass / [ ] Fail | |
| 1.5 | `docker compose up` khởi động thành công, tất cả services healthy | [ ] Pass / [ ] Fail | |
| 1.6 | Monorepo root structure: `apps/`, `packages/`, `docker-compose.yml`, `.env.example` | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
# Thay thế bằng output thực tế
$ docker compose up --wait
# Expected: tất cả services "healthy"

$ docker compose ps
# Expected: 4 services Up

$ docker compose down
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §2. Milestone M-02: Backend Project Setup + Core Modules

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 2.1 | `GET /api/v1/health` trả về 200 `{"status":"ok"}` | [ ] Pass / [ ] Fail | |
| 2.2 | 7 router files tồn tại và đăng ký trong `main.py` | [ ] Pass / [ ] Fail | |
| 2.3 | Config module đọc được env vars qua `pydantic-settings` | [ ] Pass / [ ] Fail | |
| 2.4 | Logging module output structured JSON (không phải plain text) | [ ] Pass / [ ] Fail | |
| 2.5 | Security module là stub với comment `# TODO: Replace with real JWT auth before production` | [ ] Pass / [ ] Fail | |
| 2.6 | Backend directory structure đúng: `routers/`, `core/`, `db/`, `models/`, `schemas/`, `services/`, `repositories/`, `workers/` | [ ] Pass / [ ] Fail | |
| 2.7 | `requirements.txt` có đủ dependencies (fastapi, uvicorn, sqlalchemy, alembic, redis, pydantic-settings) | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ curl http://localhost:8000/api/v1/health
# Expected: {"status":"ok"}

$ python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
# Expected: postgresql://... (no error)

$ python -c "import logging; logging.getLogger().info('test')"
# Expected: JSON log output
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §3. Milestone M-03: Database Layer

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 3.1 | `alembic upgrade head` chạy thành công từ trạng thái fresh DB | [ ] Pass / [ ] Fail | |
| 3.2 | 6 tables tồn tại với đúng schema: engineers, projects, allocations, match_scores, bench_forecasts, users | [ ] Pass / [ ] Fail | |
| 3.3 | Foreign keys đúng (4 FK constraints) | [ ] Pass / [ ] Fail | |
| 3.4 | Indexes đúng theo `domain-model.md` (≥8 indexes) | [ ] Pass / [ ] Fail | |
| 3.5 | Pydantic schemas khớp cấu trúc trong `api-contract.md` | [ ] Pass / [ ] Fail | |
| 3.6 | Repository layer: async SQLAlchemy session đúng pattern | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ alembic upgrade head
# Expected: "INFO  [alembic.runtime.migration] Running upgrade ..."

$ psql $DATABASE_URL -c "\dt"
# Expected: 6 tables listed

$ psql $DATABASE_URL -c "\d engineers"
# Verify columns and constraints
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §4. Milestone M-04: Service Layer Stubs

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 4.1 | `CSVIngestionService` validate MIME type thật sự (reject non-CSV) | [ ] Pass / [ ] Fail | |
| 4.2 | `CSVIngestionService` reject file > 10MB với HTTP 413 | [ ] Pass / [ ] Fail | |
| 4.3 | `LLMScoringService` trả về mock data với `llm_provider="stub"` và `model_version="stub-v0"` | [ ] Pass / [ ] Fail | |
| 4.4 | `BenchPredictionEngine.predict_bench()` apply 30-day threshold thật (`bench_start_date - today <= 30`) | [ ] Pass / [ ] Fail | |
| 4.5 | `AllocationRecommendationOrchestrator` trả về mock recommendation list đúng schema | [ ] Pass / [ ] Fail | |
| 4.6 | Tất cả service files có type hints đầy đủ | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ pytest tests/unit/test_csv_ingestion.py -v
# Expected: all pass

$ pytest tests/unit/test_bench_prediction.py -v
# Expected: all pass — test 30-day boundary
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §5. Milestone M-05: API Endpoints — Backend

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 5.1 | Tất cả 17 endpoints tồn tại và trả về đúng HTTP status codes | [ ] Pass / [ ] Fail | |
| 5.2 | `POST /auth/login` trả về mock token | [ ] Pass / [ ] Fail | |
| 5.3 | `POST /engineers/upload` reject > 10MB với 413 + error format đúng | [ ] Pass / [ ] Fail | |
| 5.4 | `GET /engineers/{id}` trả về 404 khi không tồn tại | [ ] Pass / [ ] Fail | |
| 5.5 | `POST /allocations/confirm` trả về 400 khi vượt 100% cap | [ ] Pass / [ ] Fail | |
| 5.6 | `GET /dashboard/stats` trả về 4 KPI fields (mock data) | [ ] Pass / [ ] Fail | |
| 5.7 | OpenAPI docs accessible tại `/docs` | [ ] Pass / [ ] Fail | |
| 5.8 | Error response format nhất quán: `{"error":{"code":"...","message":"..."}}` | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ pytest tests/integration/ -v
# Expected: all endpoints covered

$ curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
# Expected: {"access_token":"...","token_type":"bearer"}

$ curl http://localhost:8000/api/v1/engineers/nonexistent-id
# Expected: 404 {"error":{"code":"EngineerNotFound","message":"..."}}

$ curl http://localhost:8000/docs
# Expected: 200 HTML
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §6. Milestone M-06: Redis Integration

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 6.1 | Redis connection verified trên startup (log `cache_hit` hoặc `cache_miss` khi gọi API) | [ ] Pass / [ ] Fail | |
| 6.2 | `get_cache()` và `set_cache()` với TTL hoạt động | [ ] Pass / [ ] Fail | |
| 6.3 | TTL values đúng: LLM=24h, bench forecast=1h, engineer list=5m, project requirements=30m | [ ] Pass / [ ] Fail | |
| 6.4 | Redis connection error được handle gracefully (fallback to DB, không crash) | [ ] Pass / [ ] Fail | |
| 6.5 | Cache keys có format đúng (documented trong `coding-conventions.md`) | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ redis-cli ping
# Expected: PONG

$ curl http://localhost:8000/api/v1/engineers
# Gọi lần 2 — kiểm tra log có "cache_hit"

$ redis-cli keys "*"
# Verify cache keys tồn tại với TTL
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §7. Milestone M-07: Frontend Project Setup + Layout

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 7.1 | `tsconfig.json` có `"strict": true` | [ ] Pass / [ ] Fail | |
| 7.2 | TailwindCSS cài đặt thành công (class `bg-blue-500` render đúng) | [ ] Pass / [ ] Fail | |
| 7.3 | shadcn/ui cài đặt thành công (`Button`, `Card` import được) | [ ] Pass / [ ] Fail | |
| 7.4 | Global layout có Sidebar + Header + Main content area | [ ] Pass / [ ] Fail | |
| 7.5 | Sidebar có navigation links đến 7+ routes | [ ] Pass / [ ] Fail | |
| 7.6 | `QueryClientProvider` wrap toàn bộ app | [ ] Pass / [ ] Fail | |
| 7.7 | Frontend directory structure đúng: `app/`, `components/`, `features/`, `hooks/`, `lib/`, `types/` | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ cd apps/web && npm run build
# Expected: exit 0

$ tsc --noEmit
# Expected: 0 errors

$ eslint .
# Expected: 0 errors
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §8. Milestone M-08: Frontend Pages + API Integration

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 8.1 | 10 routes render không có runtime error trong browser console | [ ] Pass / [ ] Fail | |
| 8.2 | `/login` accessible mà không cần auth | [ ] Pass / [ ] Fail | |
| 8.3 | Auth guard redirect unauthenticated user về `/login` khi truy cập protected routes | [ ] Pass / [ ] Fail | |
| 8.4 | API client inject Bearer token tự động trong header | [ ] Pass / [ ] Fail | |
| 8.5 | 7 service modules tồn tại (auth, engineers, projects, allocations, bench, reports, dashboard) | [ ] Pass / [ ] Fail | |
| 8.6 | Shared components tồn tại: Card, Table, Button, Badge, Skeleton, Modal, Form | [ ] Pass / [ ] Fail | |
| 8.7 | Loading states (skeleton) hiển thị trong khi fetch data | [ ] Pass / [ ] Fail | |
| 8.8 | Error states hiển thị khi API call thất bại | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ tsc --noEmit
# Expected: 0 errors

$ eslint .
# Expected: 0 errors

# Manual: Open http://localhost:3000
# Manual: Try accessing /dashboard without login → should redirect to /login
# Manual: Login → navigate all 10 routes → no console errors
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §9. Milestone M-09: Data Seeding + Quality + CI

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 9.1 | Seed script chạy thành công: 5 engineers, 3 projects, 3 allocations inserted | [ ] Pass / [ ] Fail | |
| 9.2 | Seed có ≥1 engineer với `bench_start_date` trong 30 ngày | [ ] Pass / [ ] Fail | |
| 9.3 | `tsc --noEmit` zero errors | [ ] Pass / [ ] Fail | |
| 9.4 | `eslint .` zero errors | [ ] Pass / [ ] Fail | |
| 9.5 | `ruff check .` zero errors | [ ] Pass / [ ] Fail | |
| 9.6 | `black --check .` zero differences | [ ] Pass / [ ] Fail | |
| 9.7 | `pytest` all pass | [ ] Pass / [ ] Fail | |
| 9.8 | `.github/workflows/ci.yml` tồn tại, valid YAML, và có đủ 6 jobs | [ ] Pass / [ ] Fail | |
| 9.9 | Request logging middleware log đúng events với structured JSON | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ python scripts/seed_data.py
# Expected: "Seeded 5 engineers, 3 projects, 3 allocations"

$ tsc --noEmit
# Expected: 0 errors

$ eslint .
# Expected: 0 errors

$ ruff check .
# Expected: All checks passed!

$ black --check .
# Expected: All done! ✨

$ pytest --tb=short -q
# Expected: all passed

$ python -m yaml tools ci.yml  # hoặc yamllint
# Expected: valid
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §10. Milestone M-10: Final Validation

**Ngày hoàn thành:** _______________
**Người thực hiện:** _______________
**Reviewer:** _______________

### Checklist

| # | Hạng mục | Kết quả | Findings |
|---|---------|---------|---------|
| 10.1 | `docker compose up` — tất cả 4 services "healthy" | [ ] Pass / [ ] Fail | |
| 10.2 | Frontend accessible tại `http://localhost:3000` | [ ] Pass / [ ] Fail | |
| 10.3 | Backend accessible tại `http://localhost:8000/api/v1/health` → 200 | [ ] Pass / [ ] Fail | |
| 10.4 | AC-1 đến AC-20 tất cả pass theo `review-checklist.md` | [ ] Pass / [ ] Fail | |
| 10.5 | `test-results.md` đã được điền đầy đủ | [ ] Pass / [ ] Fail | |
| 10.6 | `report.md` đã được điền (scope, decisions, issues, limitations) | [ ] Pass / [ ] Fail | |

### Lệnh đã chạy

```bash
$ docker compose down -v && docker compose up --wait
# Fresh start từ đầu — Expected: all healthy

$ curl http://localhost:8000/api/v1/health
# Expected: {"status":"ok"}

$ curl http://localhost:3000
# Expected: 200 HTML

$ pytest --tb=short -q
# Expected: all passed — ghi output vào §11
```

**Kết quả:** [ ] All pass / [ ] Có lỗi (ghi vào §12)

---

## §11. Commands Run & Results (Quality Gates)

Điền sau khi hoàn thành tất cả milestones. Ghi output của lần chạy cuối cùng (final state).

| # | Command | Ngày chạy | Kết quả | Error count / Notes |
|---|---------|-----------|---------|-------------------|
| 11.1 | `tsc --noEmit` | | [ ] Pass / [ ] Fail | errors: |
| 11.2 | `eslint .` | | [ ] Pass / [ ] Fail | errors: |
| 11.3 | `prettier --check .` | | [ ] Pass / [ ] Fail | differences: |
| 11.4 | `ruff check .` | | [ ] Pass / [ ] Fail | errors: |
| 11.5 | `black --check .` | | [ ] Pass / [ ] Fail | differences: |
| 11.6 | `pytest --tb=short -q` | | [ ] Pass / [ ] Fail | passed: / failed: / errors: |
| 11.7 | `next build` | | [ ] Pass / [ ] Fail | warnings: |
| 11.8 | `docker compose up --wait` | | [ ] Pass / [ ] Fail | unhealthy: |
| 11.9 | `alembic upgrade head` | | [ ] Pass / [ ] Fail | |
| 11.10 | `python scripts/seed_data.py` | | [ ] Pass / [ ] Fail | |

### Output chi tiết (paste output quan trọng)

```
# pytest output:
(paste here)

# tsc output:
(paste here)

# docker compose ps output:
(paste here)
```

---

## §12. Known Risks & Unresolved Issues

Ghi lại mọi vấn đề phát sinh nhưng chưa được fix trong Phase 5. Cập nhật liên tục trong quá trình implement.

| ID | Mô tả vấn đề | Severity | Milestone phát hiện | Trạng thái | Action required |
|----|-------------|----------|-------------------|-----------|----------------|
| R-001 | (placeholder — điền khi phát sinh) | | | Open | |

**Hướng dẫn:** Mọi issue có Severity = Blocker phải được resolve trước khi Phase 5 được coi là Complete. Issues Major có thể chuyển sang Phase tiếp theo nếu có ghi chú rõ ràng.

---

## §13. Security Debt Tracker

Theo dõi các security debt đã được quyết định chấp nhận trong Phase 5 và cần resolve trước production.

| ID | Mô tả | Severity | Được quyết định tại | Deadline resolve | Owner | Trạng thái |
|----|-------|----------|--------------------|-----------------|----|-----------|
| SD-1 | Mock JWT: static token, no signature verification, client-only guard | **Critical** | OI-01 (2026-03-25) | Trước khi deploy production | TBD | Open — cần upgrade plan |
| SD-2 | LLM stub: không có real scoring logic | High | Scope Phase 5 | Phase 6+ | TBD | Open — by design |
| SD-3 | CSV in-memory: không có virus scan, không có storage audit trail | Medium | OI-02 (2026-03-30) | Phase 6+ | TBD | Open |

**Ghi chú SD-1:** Trước khi merge mock JWT lên production/shared branch, phải có upgrade plan được approve. Tham khảo `impl-plan.md` §7 OC-2.

---

## §14. Tổng kết Phase 5

**Ngày hoàn thành:** _______________

**Tổng số milestones hoàn thành:** ___ / 10

**Tổng số AC pass:** ___ / 20 (xem `test-results.md`)

**Blocking issues chưa resolve:**
```
(Liệt kê các Blocker từ §12 chưa được đóng)
```

**Security debt còn mở:**
- [ ] SD-1 Mock JWT — upgrade plan tồn tại: [ ] Có / [ ] Chưa
- [ ] SD-2 LLM stub — accepted for Phase 6
- [ ] SD-3 CSV in-memory — accepted for Phase 6

**Phán định Phase 5:** [ ] Complete / [ ] Incomplete

**Lý do (nếu Incomplete):**
```
(Ghi rõ lý do và điều kiện để chuyển sang Complete)
```

**Người phê duyệt:** _______________
**Ngày phê duyệt:** _______________
