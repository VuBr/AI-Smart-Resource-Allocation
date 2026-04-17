# Test Plan — RA-002: UI Refactor Login Page

**Ticket:** RA-002
**Spec-pack:** `docs/changes/RA-002/spec-pack.md`
**Ngày tạo:** 2026-04-09

---

## 1. Phạm vi Test

| Tầng | Bao phủ | Công cụ | Ghi chú |
|------|---------|---------|---------|
| **Frontend Unit** | `ErrorAlert` (dismiss), `LoginForm` (toggle password) | Jest + RTL | Logic đủ đơn giản — optional |
| **E2E** | Tất cả 10 AC hành vi (AC-1 đến AC-10) | Playwright | Pre-condition: `npm run dev` hoặc `docker compose up` |
| **CI** | AC-11 (tsc), AC-12 (lint), AC-13 (build) | GitHub Actions | Tự động |

> **Backend tests:** Không cần — không có thay đổi backend.
> **Integration tests:** Không cần — không có API endpoint mới.

---

## 2. Môi trường Test

| Tầng | Setup |
|------|-------|
| Unit (Jest) | `cd apps/web && npm test` — không cần docker |
| E2E manual | `npm run dev` (FE) + `docker compose up api postgres redis` (BE) |
| E2E full stack | `docker compose up` → `http://localhost:3000` |
| CI | GitHub Actions — `frontend-typecheck`, `frontend-lint`, `frontend-build` |

---

## 3. Test Cases — AC Mapping

### AC-1: 2-panel layout trên desktop
- **Loại:** E2E
- **Pre-condition:** Viewport ≥ 1024px
- **Steps:** Vào `http://localhost:3000/login`
- **Expected:** Left panel hiển thị (chiếm ~55% width), right panel hiển thị
- **Test file:** `apps/web/e2e/login-ui.spec.ts`

### AC-2: Mobile — left panel ẩn
- **Loại:** E2E
- **Pre-condition:** Viewport < 1024px (ví dụ 375px width)
- **Steps:** Set viewport 375px, vào `/login`
- **Expected:** Left panel (`BrandPanel`) không visible, right panel visible
- **Test file:** `apps/web/e2e/login-ui.spec.ts`

### AC-3: Nội dung BrandPanel
- **Loại:** E2E
- **Steps:** Vào `/login` trên desktop
- **Expected:** Có text "ResourceAI", "AI-Powered Workforce Intelligence", "Intelligent Resource", "89%", "3×", "-40%", "AI-driven bench prediction..."

### AC-4: Right panel elements
- **Loại:** E2E
- **Steps:** Vào `/login`
- **Expected:** Có `input[type="email"]`, `input[type="password"]`, `input[type="checkbox"]`, link "Forgot password?", button "Sign in to ResourceAI"

### AC-5: Password toggle
- **Loại:** E2E + Unit
- **Steps:**
  1. Kiểm tra `input[type="password"]` (default ẩn)
  2. Click eye button
  3. Kiểm tra type → `text`
  4. Click lại
  5. Kiểm tra type → `password`

### AC-6: Loading state
- **Loại:** E2E
- **Steps:** Fill email + password → click submit
- **Expected:** Button disabled, spinner visible, text "Signing in..."
- **Note:** Mock JWT chậm hoặc intercept để observe loading state

### AC-7: Redirect sau login thành công
- **Loại:** E2E
- **Pre-condition:** BE running (mock JWT)
- **Steps:** Fill credentials → submit → wait
- **Expected:** `page.url()` chứa `/dashboard`

### AC-8: Error alert sau login thất bại
- **Loại:** E2E
- **Pre-condition:** Mock API trả về error (intercept request)
- **Steps:** Submit → receive error
- **Expected:** ErrorAlert visible với message lỗi; button enabled lại

### AC-9: Dismiss error alert
- **Loại:** E2E + Unit
- **Pre-condition:** ErrorAlert visible
- **Steps:** Click nút X
- **Expected:** ErrorAlert không còn visible

### AC-10: Login page accessible khi đã có token
- **Loại:** E2E
- **Steps:**
  1. Set `localStorage["access_token"] = "mock.jwt.token.phase5"`
  2. Vào `/login`
- **Expected:** Trang login render bình thường, không redirect

### AC-11, AC-12, AC-13: CI Gates
- **Loại:** CI (tự động)
- `tsc --noEmit`, `npm run lint`, `npm run build`

---

## 4. Unit Tests (Tùy chọn)

### UT-01: ErrorAlert — dismiss callback
```typescript
// File: apps/web/__tests__/ErrorAlert.test.tsx
test("click X gọi onDismiss", async () => {
  const onDismiss = jest.fn();
  render(<ErrorAlert message="Test error" onDismiss={onDismiss} />);
  await userEvent.click(screen.getByRole("button", { name: /dismiss/i }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});
```

### UT-02: LoginForm — password toggle
```typescript
// File: apps/web/__tests__/LoginForm.test.tsx
test("click eye button toggle password visibility", async () => {
  render(<LoginForm ... />);
  const input = screen.getByLabelText(/password/i);
  expect(input).toHaveAttribute("type", "password");
  await userEvent.click(screen.getByRole("button", { name: /toggle password/i }));
  expect(input).toHaveAttribute("type", "text");
});
```

---

## 5. Out of Scope

- Backend tests (không có thay đổi BE)
- Performance tests
- "Forgot password?" flow (UI-only, OI-01 DECIDED)
- "Keep me signed in" behavior (UI-only, OI-02 DECIDED)
- Real JWT auth (SD-1 chưa resolve)
