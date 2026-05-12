# Testing Standards — AI Smart Resource Allocation

**Loại:** Living Document
**Nguồn gốc:** Phase 0-B (2026-04-09) — trích từ `apps/api/tests/`, `apps/web/__tests__/`, `apps/web/e2e/`, `apps/api/pyproject.toml`
**Cập nhật lần cuối:** Phase 0-B (2026-04-09)

> Rules ngắn gọn → xem `.claude/rules/40-testing.md`

---

## 1. Phân tầng Test

| Tầng | Tool | Vị trí | Phạm vi |
|------|------|--------|---------|
| **Backend Unit** | pytest + pytest-asyncio | `apps/api/tests/test_<module>.py` | Một service/function |
| **Backend Integration** | pytest + httpx AsyncClient | `apps/api/tests/test_<router>.py` | Endpoint → DB (in-memory SQLite) |
| **Frontend Unit** | Jest + React Testing Library | `apps/web/__tests__/<Component>.test.ts(x)` | Component, hook, utility |
| **E2E** | Playwright (Chromium) | `apps/web/e2e/<flow>.spec.ts` | Full stack — docker compose up |

**Nguyên tắc phân tầng:**
- **Backend tests:** Ưu tiên Integration (endpoint → DB) hơn pure unit; không cần mock repository nếu có in-memory SQLite
- **Frontend unit:** Chỉ viết khi component có logic phức tạp (tính toán, transform, conditional render)
- **E2E:** Bao phủ happy path của từng AC (acceptance criteria) trong spec-pack

---

## 2. Backend Testing — Pattern & Conventions

### 2.1 Fixture (conftest.py)

```python
# Evidence: apps/api/tests/conftest.py

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    await engine.dispose()
```

**Quy tắc bắt buộc:**
- Test DB phải là **in-memory SQLite** (`sqlite+aiosqlite:///:memory:`) — không dùng PostgreSQL thật hoặc mock repository
- Dùng `app.dependency_overrides[get_db]` để override DB session cho test
- Mỗi test fixture phải `clear()` overrides sau khi xong để tránh leak

### 2.2 Test Naming

```python
# Pattern: test_<endpoint_or_scenario>_<condition>_<expected_result>
async def test_list_engineers_returns_200(client): ...
async def test_get_engineer_not_found_returns_404(client): ...
async def test_upload_oversized_csv_returns_413(client): ...
async def test_upload_invalid_mime_returns_400(client): ...
```

### 2.3 Assertion Pattern

```python
# Luôn assert status code TRƯỚC
assert response.status_code == 200

# Assert error format theo chuẩn
body = response.json()
assert "error" in body
assert body["error"]["code"] == "EngineerNotFound"  # snake_case code

# Assert success format
body = response.json()
assert "inserted" in body
assert isinstance(body["inserted"], int)
```

### 2.4 Async Config

```toml
# Evidence: apps/api/pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"   # Không cần @pytest.mark.asyncio trên từng test
testpaths = ["tests"]
```

Mặc dù `asyncio_mode = "auto"`, vẫn có thể thêm `@pytest.mark.asyncio` để rõ ràng — không bị conflict.

---

## 3. Frontend Unit Testing — Pattern & Conventions

### 3.1 Tool Stack

```json
// Evidence: apps/web/package.json devDependencies
"jest": "^29.7.0",
"jest-environment-jsdom": "^29.7.0",
"@testing-library/react": "^16.3.2",
"@testing-library/user-event": "^14.6.1",
"@testing-library/jest-dom": "^6.9.1",
"ts-jest": "^29.4.9"
```

### 3.2 File Naming

| Đối tượng test | Tên file |
|---------------|---------|
| Component `EngineerCard` | `EngineerCard.test.tsx` |
| Hook `useAuthGuard` | `useAuthGuard.test.ts` |
| Utility `api-client` | `api-client.test.ts` |
| Service `engineers` | `engineers.test.ts` |

### 3.3 Test Scope — Khi nào viết FE unit test

**Viết unit test khi:**
- Custom hook có logic phức tạp (side effects, conditional redirect)
- Utility function thuần (data transform, format, validate)
- Component có conditional render dựa trên state/props

**Không cần viết unit test khi:**
- Component chỉ render props trực tiếp (simple presentational)
- API service functions (đã có E2E bao phủ)
- Page components (bao phủ bởi E2E)

### 3.4 Ví dụ Pattern

```typescript
// Evidence: apps/web/__tests__/api-client.test.ts pattern
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("hiển thị error message khi login thất bại", async () => {
  // Arrange
  render(<LoginPage />);

  // Act
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  // Assert
  expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
});
```

---

## 4. E2E Testing — Pattern & Conventions

### 4.1 Pre-condition

```bash
# E2E tests yêu cầu toàn bộ stack đang chạy
docker compose up
# Chờ tất cả services healthy, rồi chạy:
npx playwright test
```

### 4.2 Cấu trúc test file

```typescript
// Evidence: apps/web/e2e/scaffold.spec.ts

// Mỗi nhóm AC trong một test.describe
test.describe("E2E-001: Full Stack Startup", () => {
  test("API health endpoint trả về 200 và status=ok", async ({ request }) => { ... });
  test("Frontend load thành công trên port 3000", async ({ page }) => { ... });
});

// Auth-required tests dùng beforeEach để login
test.describe("E2E-003: CSV Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  test("upload valid CSV → không có error message", async ({ page }) => { ... });
});
```

### 4.3 E2E Naming Convention

```
E2E-{number}: {Feature Description}
test: "{action} → {expected result}"
```

**Ví dụ:**
```typescript
test("truy cập /dashboard khi chưa login → redirect về /login", ...)
test("login với bất kỳ credentials → redirect về /dashboard", ...)
test("upload valid CSV → không có error message", ...)
```

### 4.4 Playwright Config

```typescript
// Evidence: apps/web/playwright.config.ts
// Browser: Chromium only (mặc định)
// baseURL: http://localhost:3000
// timeout: 10000ms cho waitForURL
```

---

## 5. Mocking Policy

| Tình huống | Chính sách | Lý do |
|-----------|-----------|-------|
| Database (BE tests) | **KHÔNG mock** — dùng in-memory SQLite | Tránh drift giữa mock và schema thật |
| Repository layer | **KHÔNG mock** — test qua HTTP endpoint → real DB | Integration test phải dùng real flow |
| External LLM API | Mock/Stub là **bắt buộc** — không gọi thật trong CI | Tránh chi phí và flakiness |
| Redis cache | OK để skip trong test — TTL cache không critical | Có thể test without Redis |
| Auth middleware | Dùng `dependency_overrides` — không bypass bằng token hardcode | Giữ auth flow realistic |

**Evidence cho "không mock DB":**
- `apps/api/tests/conftest.py` dùng `sqlite+aiosqlite:///:memory:` — real SQL, real schema
- Tránh rủi ro như incident Q1 (mock passed, production migration failed)

---

## 6. Quality Gates liên quan đến Test

| Gate | Command | CI Job |
|------|---------|--------|
| Backend tests | `pytest tests/ -q` | `backend-test` |
| Frontend unit tests | `npm test -- --passWithNoTests` | (chưa có CI job riêng) |
| E2E tests | `npx playwright test` | Chạy manual (chưa trong CI) |

> **Ghi chú:** E2E chưa được tích hợp vào CI pipeline (chạy manual với `docker compose up`).
> Xem `.github/workflows/ci.yml` để biết cấu trúc CI hiện tại.
