# Coding Conventions — AI Smart Resource Allocation

**Loại:** Living Document
**Nguồn gốc:** Trích từ `docs/changes/RA-001/Raw/ai-build-instructions.md` + `source-base-architecture.md`
**Cập nhật lần cuối:** Phase 2 — RA-001 (2026-03-25)

---

## 1. Naming Conventions

| Ngữ cảnh | Convention | Ví dụ |
|----------|-----------|-------|
| Python variables/functions | `snake_case` | `engineer_id`, `get_active_allocations()` |
| Python classes | `PascalCase` | `LLMScoringService`, `BenchPredictionEngine` |
| Python modules/files | `snake_case` | `csv_ingestion.py`, `bench_prediction.py` |
| TypeScript variables/functions | `camelCase` | `engineerId`, `getActiveAllocations()` |
| TypeScript React components | `PascalCase` | `EngineerCard`, `AllocationTable` |
| TypeScript files (components) | `PascalCase.tsx` | `EngineerCard.tsx` |
| TypeScript files (non-component) | `kebab-case.ts` | `api-client.ts`, `use-engineers.ts` |
| URL paths | `kebab-case` | `/bench-forecast`, `/engineers/[id]` |
| Database tables | `snake_case` (plural) | `engineers`, `match_scores`, `bench_forecasts` |
| Environment variables | `UPPER_SNAKE_CASE` | `BENCH_ALERT_DAYS_THRESHOLD`, `JWT_SECRET` |

---

## 2. HTTP Status Codes

| Tình huống | Status Code |
|-----------|------------|
| GET thành công (trả về data) | `200 OK` |
| POST tạo resource thành công | `201 Created` |
| Validation error (sai schema/field) | `400 Bad Request` |
| Không có token / token invalid | `401 Unauthorized` |
| Không đủ quyền | `403 Forbidden` |
| Resource không tìm thấy | `404 Not Found` |
| File quá lớn (CSV > 10MB) | `413 Payload Too Large` |
| Malformed request body | `422 Unprocessable Entity` |

---

## 3. Error Response Format

Tất cả error response phải theo format thống nhất:

```json
{
  "error": {
    "code": "snake_case_error_code",
    "message": "Human readable message in English"
  }
}
```

**Ví dụ:**
```json
{
  "error": {
    "code": "file_too_large",
    "message": "CSV file must not exceed 10MB"
  }
}
```

```json
{
  "error": {
    "code": "allocation_cap_exceeded",
    "message": "Engineer total allocation would exceed 100%"
  }
}
```

---

## 4. Logging Events & Format

**Format:** Structured JSON — KHÔNG dùng plain text logs.

**Tuyệt đối không log PII** (engineer email, user email, tên người dùng).

### Required Log Events

| Event key | Khi nào | Fields bắt buộc |
|-----------|---------|----------------|
| `request_start` | Đầu mỗi request | `method`, `path` |
| `request_end` | Cuối mỗi request | `method`, `path`, `status`, `latency_ms` |
| `allocation_generated` | Sau khi tạo recommendations | `project_id`, `candidate_count` |
| `allocation_confirmed` | Sau khi confirm allocation | `engineer_id`, `project_id` |
| `llm_score_computed` | Sau mỗi LLM scoring | `engineer_id`, `project_id`, `provider` |
| `csv_import_started` | Khi bắt đầu xử lý CSV | `filename`, `size` |
| `csv_import_completed` | Sau khi import thành công | `inserted`, `updated`, `skipped`, `errors` |
| `csv_import_failed` | Khi import thất bại | `filename`, `error` |

---

## 5. Backend Code Conventions

### Kiến trúc
- **Thin controllers:** Router chỉ validate input và gọi service. Logic nghiệp vụ ở service layer.
- **Dependency injection:** Dùng FastAPI `Depends()` cho database session, config, auth.
- **Async:** Tất cả endpoint handler và service method phải là `async def`.

### Type Hints
- **Bắt buộc** trên tất cả `public function signatures` trong service và router modules.
- Dùng `Optional[T]` thay vì `T | None` để tương thích Python 3.9+.

### Service Layer Pattern
```python
# Đúng: service method có type hints đầy đủ
async def predict_bench(engineer: Engineer) -> BenchForecast:
    ...

# Sai: thiếu type hints
async def predict_bench(engineer):
    ...
```

### CSV Processing
- Validate MIME type trước (phải là `text/csv`)
- Reject file > `MAX_CSV_SIZE_MB` với 413
- Dùng Pandas để parse
- Validate schema bằng Pydantic sau khi parse

---

## 6. Frontend Code Conventions

### Next.js App Router
- Tất cả pages trong `app/` directory
- Layout components trong `app/layout.tsx` (root) và `app/[route]/layout.tsx` (nested nếu cần)
- Route handlers theo `app/api/` nếu cần (không dùng pages router)

### Component Structure
- Pages: chỉ orchestrate UI, không có business logic
- Features: tổ chức theo domain (`features/engineers/`, `features/allocation/`, v.v.)
- Shared components: `components/` (Card, Table, Button, Badge, Modal, Form, Skeleton)

### API Integration
- Dùng Axios instance trong `lib/api-client.ts` — inject `Authorization: Bearer <token>` tự động
- Service modules trong `lib/services/` — một file per domain
- Dùng `@tanstack/react-query` cho data fetching

### Auth Guard
- Tất cả authenticated routes phải check token ở client-side
- Redirect về `/login` nếu không có token
- `/login` phải accessible mà không cần auth

---

## 7. Test Conventions

| Loại | Tool | Vị trí |
|------|------|--------|
| Backend Unit Tests | pytest | `apps/api/tests/` |
| Backend Integration Tests | pytest + httpx | `apps/api/tests/` |
| Frontend Unit Tests | Jest | `apps/web/__tests__/` hoặc cạnh component |
| E2E Tests | Docker Compose + manual/script | Per milestone |

**Naming:**
- Backend: `test_<function_or_scenario>.py`
- Frontend: `<Component>.test.tsx` hoặc `<Component>.spec.tsx`

---

## 8. Quality Gates (Bắt buộc pass trước khi merge)

| Gate | Command | Tiêu chí |
|------|---------|---------|
| Frontend lint | `eslint .` | 0 errors |
| Frontend format | `prettier --check .` | 0 differences |
| Frontend type check | `tsc --noEmit` | 0 errors |
| Backend lint | `ruff check .` | 0 errors |
| Backend format | `black --check .` | 0 differences |
| Backend type check | mypy hoặc type hints đầy đủ | Không thiếu type hint |
| Backend tests | `pytest` | All pass |

---

## 9. Environment Variables

- **Không bao giờ** hardcode secrets trong source code
- Tất cả config phải đọc từ environment variables qua `pydantic-settings` (backend) hoặc `process.env` (frontend)
- Có `.env.example` với tất cả keys nhưng không có giá trị thật
- Production secrets quản lý qua Secret Manager, không phải `.env` files
