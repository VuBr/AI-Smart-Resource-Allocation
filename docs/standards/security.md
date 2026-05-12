# Security Standards — AI Smart Resource Allocation

**Loại:** Living Document
**Nguồn gốc:** Phase 0-B (2026-04-09) — trích từ `apps/api/app/core/security.py`, `app/main.py`, `app/core/config.py`, `app/core/logging.py`
**Cập nhật lần cuối:** Phase 0-B (2026-04-09)

> Rules ngắn gọn → xem `.claude/rules/30-security.md`

---

## ⚠️ Security Debt SD-1 (Critical — Chưa Resolve)

**Trạng thái:** OPEN tính đến 2026-04-09
**Mô tả:** Authentication hiện tại là **Mock JWT** — stub cho Phase 5 scaffold.

```python
# Evidence: apps/api/app/core/security.py lines 8–13
MOCK_TOKEN = "mock.jwt.token.phase5"  # stub only

def create_access_token(data: dict[str, Any]) -> str:
    # TODO: Replace with real JWT auth before production
    return MOCK_TOKEN  # ← mọi credentials đều nhận cùng 1 token
```

**Hệ quả:**
- Mọi user có bất kỳ credentials nào đều được chấp nhận
- Token không có chữ ký — không thể verify tính xác thực
- Role-based authorization chỉ là mock (`"role": "admin"` hardcoded)

**Quy tắc bắt buộc đến khi SD-1 được resolve:**
1. **Không deploy** lên bất kỳ môi trường nào ngoài `localhost`
2. Mọi mock auth code phải có comment: `# TODO: Replace with real JWT auth before production`
3. Trước khi merge mock JWT lên shared branch → phải có upgrade plan được approve

---

## 1. Authentication & Authorization

### 1.1 JWT (Target — sau khi resolve SD-1)

| Yếu tố | Quy định |
|--------|---------|
| Thuật toán ký | HS256 (dùng `JWT_SECRET` từ env) |
| Access token TTL | `JWT_ACCESS_EXPIRE_HOURS` (default: 24h) |
| Refresh token TTL | `JWT_REFRESH_EXPIRE_DAYS` (default: 30 ngày) |
| Payload | `{"sub": user_id, "role": "admin|manager|viewer"}` |
| Header | `Authorization: Bearer <token>` |
| Lỗi không có token | `401 Unauthorized` |
| Lỗi không đủ quyền | `403 Forbidden` |

### 1.2 Frontend Auth Guard

```typescript
// Evidence: apps/web/hooks/useAuthGuard.ts
// Pattern: Mọi page (trừ /login) phải gọi useAuthGuard()
export function useAuthGuard() {
  const router = useRouter();
  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);
}
```

**Quy tắc:**
- **Tất cả** authenticated routes phải import và gọi `useAuthGuard()` ở đầu component
- Token lưu tại `localStorage["access_token"]` — không dùng sessionStorage hay cookie
- `/login` là route duy nhất không cần auth guard

### 1.3 API Client — Tự động đính kèm Token

```typescript
// Evidence: apps/web/lib/api-client.ts lines 8–14
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

**Không được** hardcode token trong bất kỳ test hay config file nào.

---

## 2. Input Validation

### 2.1 Backend — Pydantic (bắt buộc)

- **Tất cả** request body phải được validate bởi Pydantic schema — không nhận `dict` thô
- **Tất cả** path/query params phải có type annotation rõ ràng (`uuid.UUID`, `int`, `str`)
- Validation lỗi tự động trả về `422 Unprocessable Entity`

```python
# Đúng: Pydantic schema typed
@router.post("/confirm", response_model=AllocationConfirmResponse)
async def confirm_allocation(request: AllocationConfirmRequest, ...):
    ...

# Sai: nhận dict thô — thiếu validation
@router.post("/recommend")
async def recommend_engineers(body: dict, ...):  # ← không nên dùng
    ...
```

### 2.2 CSV Upload — Validation Đặc biệt

```python
# Evidence: apps/api/app/api/v1/routers/engineers.py + services/csv_ingestion.py
# Thứ tự validate:
# 1. MIME type phải là text/csv → 400 nếu không
# 2. Size ≤ MAX_CSV_SIZE_MB (default 10MB) → 413 nếu vượt
# 3. Schema hợp lệ (Pydantic sau parse) → 400 nếu sai
```

### 2.3 Frontend — Không Xử lý Logic Nghiệp Vụ

```
Frontend chỉ làm UX-level validation (required fields, email format).
Validation business logic (allocation cap, date bounds) ở Backend.
Evidence: docs/architecture/system-overview.md §4 — "Frontend KHÔNG đảm nhận..."
```

---

## 3. Secrets & Configuration

### 3.1 Quy tắc Tuyệt đối

| Cấm | Được phép |
|-----|----------|
| Hardcode secret trong source code | Đọc từ env var |
| Commit `.env` file | Commit `.env.example` với placeholder |
| Paste secret trong docs/ | Dùng `${ENV_VAR_NAME}` làm placeholder |
| Default secret trong production code | Default chỉ dùng cho local dev |

```python
# Evidence: apps/api/app/core/config.py line 23
JWT_SECRET: str = "change-me-before-production"
# ↑ Default này PHẢI được override trong production qua environment variable
```

### 3.2 Pattern Đúng — pydantic-settings (Backend)

```python
# Evidence: apps/api/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    DATABASE_URL: str = "postgresql+asyncpg://..."  # default cho local only
    JWT_SECRET: str = "change-me-before-production"  # PHẢI override
```

### 3.3 Pattern Đúng — process.env (Frontend)

```typescript
// Dùng NEXT_PUBLIC_ prefix cho client-side vars
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

**Variables có prefix `NEXT_PUBLIC_` sẽ được bundle vào client JS — không đặt secrets ở đây.**

---

## 4. CORS Policy

```python
# Evidence: apps/api/app/main.py lines 29–35
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Chỉ cho phép FE local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Quy tắc:**
- `allow_origins` phải là whitelist cụ thể — **không dùng `["*"]` trong production**
- Khi deploy: thay bằng domain thật từ environment variable `ALLOWED_ORIGINS`
- Không mở thêm origin mà không có security review

---

## 5. Logging & PII

### 5.1 Quy tắc Tuyệt đối: Không Log PII

```python
# Evidence: apps/api/app/core/logging.py line 37
def log_event(event: str, **kwargs: object) -> None:
    """Log a structured event. Never pass PII (email, name, personal info)."""
```

**PII bị cấm tuyệt đối trong logs:**
- Email địa chỉ (engineer email, user email)
- Họ tên người dùng
- Số điện thoại, địa chỉ
- Bất kỳ thông tin cá nhân nhận dạng được

**Được phép log:**
- UUIDs (engineer_id, project_id) — không phải thông tin cá nhân
- Event names, HTTP method/path/status
- Latency, counts, sizes

### 5.2 Log Format

```python
# Đúng: Structured JSON với UUID
log_event("allocation_confirmed", engineer_id=str(request.engineer_id), ...)

# Sai: Log email (PII)
log_event("allocation_confirmed", engineer_email="john@company.com")  # ❌
```

---

## 6. API Security Headers

Các header bảo mật sẽ được bổ sung khi deploy production (nằm ngoài scope Phase 5):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`

> Ghi nhận là **Open Issue** cho phase sau — không implement ngay.

---

## 7. Checklist Security trước khi Merge

- [ ] Không có secret/token/password nào trong diff
- [ ] Không có PII trong log statements mới
- [ ] Request body mới dùng Pydantic schema (không dùng `dict`)
- [ ] Endpoint mới có auth check (nếu yêu cầu auth)
- [ ] CORS không bị nới lỏng
- [ ] Không có `# TODO: Replace` nào bị xóa mà chưa implement thật
