# Black-box Test Cases — RA-002: UI Refactor Login Page

**Ticket:** RA-002
**Ngày tạo:** 2026-04-09
**Công cụ:** Playwright E2E
**Pre-condition chung:** `npm run dev` hoặc `docker compose up` đang chạy, truy cập `http://localhost:3000`

---

## BB-01: Render 2-panel layout (desktop)

| Field | Value |
|-------|-------|
| **AC#** | AC-1, AC-3 |
| **Viewport** | 1280 × 800 (desktop) |
| **Pre-condition** | Chưa login, không có token |
| **Input** | Vào `http://localhost:3000/login` |
| **Expected** | Left panel hiển thị: chứa "ResourceAI", "89%", "3×", "-40%", "AI-driven bench prediction..." |
| **Expected** | Right panel hiển thị: chứa "Welcome back", email input, password input, submit button |
| **Not expected** | Error alert không visible (default state) |

---

## BB-02: Mobile — left panel ẩn

| Field | Value |
|-------|-------|
| **AC#** | AC-2 |
| **Viewport** | 375 × 812 (mobile) |
| **Input** | Vào `/login` |
| **Expected** | `BrandPanel` (left panel với gradient) không visible |
| **Expected** | Right panel visible, mobile logo hiển thị |
| **Expected** | Form đầy đủ: email, password, submit button |

---

## BB-03: Password toggle — hide/show

| Field | Value |
|-------|-------|
| **AC#** | AC-5 |
| **Viewport** | Desktop |
| **Input Step 1** | Quan sát password field mặc định |
| **Expected Step 1** | `input[type="password"]` — ký tự ẩn |
| **Input Step 2** | Click eye button |
| **Expected Step 2** | `input[type="text"]` — ký tự hiển thị |
| **Input Step 3** | Click eye button lần nữa |
| **Expected Step 3** | `input[type="password"]` — ký tự ẩn trở lại |

---

## BB-04: Submit — loading state

| Field | Value |
|-------|-------|
| **AC#** | AC-6 |
| **Input** | Nhập `test@example.com` / `anypassword` → click submit |
| **Expected (trong khi loading)** | Button disabled (không click được) |
| **Expected (trong khi loading)** | Spinner SVG visible |
| **Expected (trong khi loading)** | Button text: "Signing in..." |

---

## BB-05: Login thành công → redirect

| Field | Value |
|-------|-------|
| **AC#** | AC-7 |
| **Pre-condition** | BE running (mock JWT) |
| **Input** | `test@example.com` / `anypassword` → submit |
| **Expected** | Redirect: URL chứa `/dashboard` |
| **Expected** | `localStorage["access_token"]` được set |
| **Not expected** | ErrorAlert không xuất hiện |

---

## BB-06: Login thất bại → error alert

| Field | Value |
|-------|-------|
| **AC#** | AC-8 |
| **Pre-condition** | Intercept API hoặc BE DOWN |
| **Input** | Nhập credentials → submit |
| **Expected** | ErrorAlert xuất hiện với message lỗi |
| **Expected** | Message chứa "incorrect" hoặc tương đương |
| **Expected** | Submit button trở về enabled |
| **Not expected** | Redirect đến dashboard |

---

## BB-07: Dismiss error alert

| Field | Value |
|-------|-------|
| **AC#** | AC-9 |
| **Pre-condition** | ErrorAlert đang visible (sau BB-06) |
| **Input** | Click nút X trên ErrorAlert |
| **Expected** | ErrorAlert không còn visible |
| **Expected** | Form vẫn giữ nguyên email/password đã nhập |

---

## BB-08: Login page accessible khi đã có token

| Field | Value |
|-------|-------|
| **AC#** | AC-10 |
| **Pre-condition** | Set `localStorage["access_token"] = "mock.jwt.token.phase5"` |
| **Input** | Vào `/login` |
| **Expected** | Trang login render bình thường |
| **Not expected** | Redirect về `/dashboard` |

---

## BB-09: Email bỏ trống — HTML5 validation

| Field | Value |
|-------|-------|
| **AC#** | AC-4 (input required) |
| **Input** | Để trống email, nhập password, click submit |
| **Expected** | HTML5 native validation: browser hiện tooltip "Please fill in this field" |
| **Not expected** | API call được gửi |
| **Not expected** | ErrorAlert xuất hiện |

---

## BB-10: Double submit prevention

| Field | Value |
|-------|-------|
| **AC#** | AC-6 |
| **Input Step 1** | Fill email + password → click submit |
| **Expected Step 1** | Button disabled ngay lập tức |
| **Input Step 2** | Click button lần nữa (hoặc press Enter) khi đang loading |
| **Expected Step 2** | Chỉ 1 network request được gửi (verify qua network tab) |

---

## BB-11: Error message dài không vỡ layout

| Field | Value |
|-------|-------|
| **AC#** | AC-8 |
| **Input** | Mock error message 150+ ký tự |
| **Expected** | ErrorAlert render đúng, text wrap |
| **Expected** | Nút X vẫn hiển thị và click được |
| **Expected** | Layout không bị overflow horizontal |

---

## Bảng Tóm tắt Coverage

| BB# | AC# | Loại | Normal / Abnormal / Boundary |
|-----|-----|------|------------------------------|
| BB-01 | AC-1, AC-3 | E2E | Normal |
| BB-02 | AC-2 | E2E | Normal |
| BB-03 | AC-5 | E2E | Normal |
| BB-04 | AC-6 | E2E | Normal |
| BB-05 | AC-7 | E2E | Normal |
| BB-06 | AC-8 | E2E | Abnormal |
| BB-07 | AC-9 | E2E | Normal |
| BB-08 | AC-10 | E2E | Boundary |
| BB-09 | AC-4 | E2E | Boundary |
| BB-10 | AC-6 | E2E | Boundary |
| BB-11 | AC-8 | E2E | Boundary |
