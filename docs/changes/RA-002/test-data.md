# Test Data — RA-002: UI Refactor Login Page

**Ticket:** RA-002
**Ngày tạo:** 2026-04-09

> Tất cả credentials dưới đây là test data — không có giá trị thật.
> Mock JWT chấp nhận mọi credentials (SD-1 chưa resolve).

---

## 1. Credentials Test

| Loại | Email | Password | Expected |
|------|-------|---------|---------|
| Happy path | `test@example.com` | `anypassword` | Login thành công → redirect dashboard |
| Happy path | `admin@company.com` | `test123` | Login thành công (mock JWT) |
| Simulate error | N/A — intercept API | N/A | Trả về network error → ErrorAlert |

> **Cách simulate login failure:** Dùng Playwright `page.route()` để intercept và trả về lỗi:
> ```typescript
> await page.route("**/api/v1/auth/login", route =>
>   route.fulfill({ status: 401, body: JSON.stringify({ error: { code: "Unauthorized", message: "Invalid credentials" } }) })
> );
> ```

---

## 2. Viewport Sizes

| Loại | Width | Height | Mục đích |
|------|-------|--------|---------|
| Desktop | 1280 | 800 | BB-01: 2-panel layout |
| Desktop (min) | 1024 | 768 | Breakpoint lg: |
| Mobile | 375 | 812 | BB-02: left panel ẩn |
| Mobile (nhỏ hơn) | 320 | 568 | BB-02: edge case |
| Tablet | 768 | 1024 | Kiểm tra responsive |

---

## 3. localStorage Test Values

| Key | Value | Mục đích |
|-----|-------|---------|
| `access_token` | `mock.jwt.token.phase5` | BB-08: simulate đã login |
| `access_token` | (không set) | Default — chưa login |
| `user_role` | `admin` | Đi kèm với access_token |

---

## 4. Error Messages

| Scenario | Message Expected |
|---------|----------------|
| Login thất bại (từ `handleSubmit` catch) | "The email or password you entered is incorrect. Please try again." |
| Network error | "The email or password you entered is incorrect. Please try again." |

---

## 5. Long Error Message (BB-11)

```
Error message dài (150+ ký tự):
"Authentication failed because the credentials you provided do not match any account in our system. Please double-check your email address and password, then try again."
```

---

## 6. BrandPanel Static Content

| Element | Giá trị | Verify |
|---------|---------|--------|
| Brand name | "ResourceAI" | Text match |
| Badge | "AI-Powered Workforce Intelligence" | Text match |
| Stat 1 | "89%" + "Forecast accuracy" | Text match |
| Stat 2 | "3×" + "Faster allocation" | Text match |
| Stat 3 | "-40%" + "Bench time reduced" | Text match |
| Feature 1 | "AI-driven bench prediction with risk scoring" | Text match |
| Feature 2 | "Smart skill-matching across projects and teams" | Text match |
| Feature 3 | "Real-time shortage reports and workforce analytics" | Text match |
| Footer | "© 2025 ResourceAI · Enterprise Edition · v2.4.0" | Text match |
