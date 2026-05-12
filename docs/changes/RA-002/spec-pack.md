# Spec Pack — RA-002: UI Refactor Login Page

**Trạng thái:** APPROVED (pending OI resolution — xem §9)
**Tác giả:** Claude Code (AI assistant)
**Ngày tạo:** 2026-04-09
**Cập nhật lần cuối:** 2026-04-09
**Branch:** `apply_ui_from_html`
**Sources of Truth:** `docs/changes/RA-002/sources.md`

---

## §1. Bối cảnh & Mục tiêu

Trang login hiện tại (`apps/web/app/login/page.tsx`) là scaffold đơn giản từ Phase 5 — một form căn giữa màn hình với style tối thiểu. Không phản ánh brand ResourceAI và không cung cấp trải nghiệm người dùng chuyên nghiệp.

**Mục tiêu RA-002:** Chuyển đổi thiết kế HTML có sẵn tại `docs/changes/RA-002/Raw/login.html` thành React/Next.js components, tích hợp vào `apps/web/app/login/page.tsx`, giữ nguyên toàn bộ business logic xác thực hiện có.

**Kết quả mong đợi:**
- Trang login mang đúng brand ResourceAI (2-panel layout, gradient, stats)
- Code tái sử dụng được (tách thành components nhỏ)
- Tuân thủ coding conventions của project (Tailwind, ESLint, TypeScript strict)

---

## §2. Phạm vi (Scope)

### Trong Scope
- Refactor `apps/web/app/login/page.tsx` theo thiết kế từ `login.html`
- Tạo component `BrandPanel` (left panel): logo, badge, heading, stats, features, footer
- Tạo component `LoginForm` (right panel form): email field, password field + toggle, remember me checkbox, submit button
- Tạo component `ErrorAlert` (dismissable error alert)
- Chuyển Alpine.js state (`showError`, `loading`, `showPwd`) sang React `useState`
- Chuyển inline styles sang Tailwind utility classes (trừ gradient phức tạp — dùng `style` prop)
- Giữ nguyên logic: `login()`, `handleSubmit()`, `router.replace("/dashboard")`
- Responsive: left panel ẩn trên mobile, hiện trên desktop (≥1024px)

### Ngoài Scope
- Thay đổi backend auth (`/api/v1/auth/login`) — không thuộc RA-002
- Implement "Forgot password?" functionality — chờ OI-01
- Implement "Keep me signed in" extended TTL logic — chờ OI-02
- Convert bất kỳ page nào khác ngoài `/login`
- Thay đổi `lib/services/auth.ts` hay `lib/api-client.ts`
- Resolve Security Debt SD-1 (Mock JWT) — open issue riêng

---

## §3. Thuật ngữ

| Thuật ngữ | Định nghĩa |
|----------|-----------|
| **Brand Panel** | Left panel (55% width trên desktop) — hiển thị brand, stats, features |
| **Form Panel** | Right panel — chứa form login |
| **Error Alert** | Banner đỏ dismissable hiện khi login thất bại |
| **Password Toggle** | Button hình mắt bên phải password field — toggle text/password |
| **Remember Me** | Checkbox "Keep me signed in" — chưa có backend behavior (xem OI-02) |
| **Alpine.js directive** | Cú pháp `x-data`, `@click`, `x-show`, `:type` trong HTML template — cần convert sang React |
| **Mock JWT (SD-1)** | Auth hiện tại là stub — mọi credentials đều được chấp nhận |
| **Gradient style prop** | Inline `style={{ background: "linear-gradient(...)" }}` dùng khi Tailwind không express được gradient 3-stop |

---

## §4. As-Is / To-Be

### As-Is — Trạng thái Hiện tại

```
/login (apps/web/app/login/page.tsx)
├── Single panel, căn giữa màn hình
├── Background: bg-gray-50
├── Card trắng, max-w-sm
├── Form: email input + password input (no toggle)
├── Error: plain text màu đỏ (không dismissable)
├── Button: "Sign In" (màu blue-600)
└── Footer: "Mock JWT — Phase 5 scaffold"

State: email, password, error, loading
Logic: login() → router.replace("/dashboard")
```

### To-Be — Trạng thái Sau RA-002

```
/login (apps/web/app/login/page.tsx)
├── 2-panel layout (flex min-h-screen)
│
├── LEFT PANEL — BrandPanel component [lg:flex, hidden trên mobile]
│   ├── Background: gradient 145deg (#1e1b4b → #312e81 → #4338ca)
│   ├── Background decorations: 3 blur circles + grid overlay
│   ├── Logo: icon + "ResourceAI" + "Enterprise Platform"
│   ├── Badge: "AI-Powered Workforce Intelligence"
│   ├── Heading: "Intelligent Resource / Allocation at Scale" (text gradient)
│   ├── Subheading: mô tả ngắn
│   ├── Stats: 3 cards (89%, 3×, -40%)
│   ├── Features: 3 items với checkmark icon
│   └── Footer: "© 2025 ResourceAI · Enterprise Edition · v2.4.0"
│
└── RIGHT PANEL — Form area [flex-1]
    ├── Mobile logo [lg:hidden]
    ├── Heading: "Welcome back"
    ├── ErrorAlert component [conditional — chỉ hiện khi có lỗi]
    ├── LoginForm component
    │   ├── Email field: icon + input (controlled)
    │   ├── Password field: icon + input + eye toggle button
    │   ├── Remember me: checkbox (UI only)
    │   ├── Forgot password: link href="#" (UI only)
    │   └── Submit button: spinner khi loading
    └── Footer: "Protected by enterprise SSO · Privacy Policy"

State (page): email, password, error, loading
State (LoginForm local): showPassword, rememberMe
Logic: login() → router.replace("/dashboard") [giữ nguyên]
```

### Alpine.js → React Mapping

| Alpine.js | React Equivalent | Vị trí |
|----------|-----------------|--------|
| `x-data="{ showError: true, ... }"` | `const [error, setError] = useState<string\|null>(null)` | `LoginPage` |
| `x-data="{ loading: false, ... }"` | `const [loading, setLoading] = useState(false)` | `LoginPage` |
| `x-data="{ showPwd: false, ... }"` | `const [showPassword, setShowPassword] = useState(false)` | `LoginForm` |
| `x-show="showError"` | `{error && <ErrorAlert ... />}` | `LoginPage` JSX |
| `@click="showError=false"` | `onClick={() => setError(null)}` | `ErrorAlert` prop `onDismiss` |
| `@click="showPwd = !showPwd"` | `onClick={() => setShowPassword(!showPassword)}` | `LoginForm` |
| `:type="showPwd ? 'text' : 'password'"` | `type={showPassword ? "text" : "password"}` | `LoginForm` |
| `@submit.prevent="loading = true"` | `onSubmit={handleSubmit}` (preventDefault trong handler) | `LoginForm` |
| `:disabled="loading"` | `disabled={loading}` | submit button |
| `:class="loading && 'opacity-80 cursor-not-allowed'"` | `className="... disabled:opacity-80 disabled:cursor-not-allowed"` | submit button |
| `x-show="loading"` (spinner) | `{loading && <svg ... />}` | submit button |
| `x-text="loading ? 'Signing in...' : 'Sign in'"` | `{loading ? "Signing in..." : "Sign in to ResourceAI"}` | submit button |

### Inline Style → Tailwind Mapping

| HTML Inline Style | Tailwind / Quyết định |
|------------------|----------------------|
| `.brand-panel { background: linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%) }` | `style={{ background: "linear-gradient(145deg,...)" }}` — Tailwind không support 3-stop 145deg |
| `background: linear-gradient(135deg, #a5b4fc, #c084fc)` (text gradient) | `style={{ background: "linear-gradient(135deg,#a5b4fc,#c084fc)" }}` + className `text-transparent bg-clip-text` |
| `background-image: linear-gradient(...)` (grid overlay) | `style={{ backgroundImage: "...", backgroundSize: "40px 40px" }}` |
| `.feature-dot { width:6px; height:6px; border-radius:50%; background:rgba(165,180,252,0.6) }` | `className="w-1.5 h-1.5 rounded-full bg-indigo-300/60"` — Tailwind đủ |
| `body { min-width: 1280px }` | `style={{ minWidth: "1280px" }}` trên container div |

---

## §5. Đặc tả Chi tiết

### 5.1 Cấu trúc Component

```
apps/web/
├── app/login/
│   └── page.tsx              [MODIFY] — LoginPage (orchestrator)
└── components/auth/
    ├── BrandPanel.tsx         [CREATE] — Left panel, presentational, no state
    ├── LoginForm.tsx          [CREATE] — Form, local state: showPassword, rememberMe
    └── ErrorAlert.tsx         [CREATE] — Dismissable error, props: message, onDismiss
```

### 5.2 LoginPage (`app/login/page.tsx`)

**Directive:** `"use client"` (bắt buộc — dùng useState, useRouter)

**State:**
```typescript
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)
```

**Logic giữ nguyên:**
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError(null)
  try {
    await login(email, password)
    router.replace("/dashboard")
  } catch {
    setError("The email or password you entered is incorrect. Please try again.")
  } finally {
    setLoading(false)
  }
}
```

**JSX structure:**
```
<div className="flex min-h-screen" style={{ minWidth: "1280px" }}>
  <BrandPanel />
  <div className="flex flex-1 flex-col justify-center bg-slate-50 ...">
    {/* Mobile logo — lg:hidden */}
    {/* Heading */}
    {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
    <LoginForm
      email={email} password={password} loading={loading}
      onEmailChange={setEmail} onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
    {/* Footer */}
  </div>
</div>
```

### 5.3 BrandPanel (`components/auth/BrandPanel.tsx`)

**Directive:** `"use client"` không cần — không có state hay event handlers (Server Component OK, nhưng trong `app/login/page.tsx` là Client nên inherit)

**Props:** Không có (purely presentational)

**Nội dung theo login.html:**
- Gradient background qua `style` prop
- 3 blur circle decorations + grid overlay qua `style` prop
- Logo: SVG icon + text "ResourceAI" + "Enterprise Platform"
- Badge: dot + "AI-Powered Workforce Intelligence"
- Heading 2-line với text gradient
- Subheading text
- 3 stat cards: `{value: "89%", label: "Forecast accuracy"}`, `{value: "3×", label: "Faster allocation"}`, `{value: "-40%", label: "Bench time reduced"}`
- 3 feature items với checkmark SVG: bench prediction, skill-matching, shortage reports
- Footer copyright

**Data constants (file-level, không phải props):**
```typescript
const STATS = [{value: "89%", label: "Forecast accuracy"}, ...]
const FEATURES = ["AI-driven bench prediction...", ...]
```

### 5.4 LoginForm (`components/auth/LoginForm.tsx`)

**Directive:** `"use client"` (bắt buộc — useState)

**Props:**
```typescript
interface LoginFormProps {
  email: string
  password: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}
```

**Local state:**
```typescript
const [showPassword, setShowPassword] = useState(false)
const [rememberMe, setRememberMe] = useState(true)  // default checked per HTML
```

**Reuse existing UI components:** `Input`, `Label`, `Button` từ `components/ui/`

**Elements:**
- Email: `<Label>` + `<Input type="email">` với email icon bên trái
- Password: `<Label>` + row "Forgot password?" + `<Input>` với lock icon + eye toggle button
- Remember me: `<input type="checkbox">` + label text
- Submit: `<Button>` với spinner conditional + text conditional

### 5.5 ErrorAlert (`components/auth/ErrorAlert.tsx`)

**Directive:** `"use client"` (bắt buộc — onClick)

**Props:**
```typescript
interface ErrorAlertProps {
  message: string
  onDismiss: () => void
}
```

**Nội dung:** Red bordered box với icon lỗi, title "Authentication failed", `message` prop, nút X gọi `onDismiss`

**Lưu ý:** HTML demo có error border đỏ trên password field — đây là UI demo state trong HTML, **không** implement trong To-Be. Chỉ có ErrorAlert banner.

---

## §6. Non-Functional Requirements

| NFR | Yêu cầu | Nguồn |
|-----|---------|-------|
| **Responsive** | Mobile (<1024px): left panel ẩn (`hidden lg:flex`), hiện mobile logo | `login.html` — `lg:hidden`, `lg:flex` classes |
| **TypeScript** | Strict mode — tất cả props phải có interface đầy đủ | `tsconfig.json` — `"strict": true` |
| **Lint** | 0 ESLint errors (`npm run lint`) | `coding-conventions.md §8` |
| **Type check** | 0 TypeScript errors (`tsc --noEmit`) | CI job `frontend-typecheck` |
| **Build** | `next build` không có errors | CI job `frontend-build` |
| **No Prettier** | Không format bằng Prettier | `coding-conventions.md §8` |
| **No CSS Modules** | Không tạo `.module.css` | Decision C-1 |
| **Accessibility** | `htmlFor` trên labels, `aria-label` trên icon buttons, semantic HTML | Best practice |
| **Performance** | Không import heavy lib mới — chỉ dùng `lucide-react` đã có | `package.json` |

---

## §7. Acceptance Criteria

> Tất cả AC phải pass trước khi merge.

| AC# | Phát biểu | Loại test |
|-----|----------|----------|
| **AC-1** | Truy cập `/login` trên desktop (≥1024px) → trang hiển thị 2-panel layout: left panel chiếm ~55% width, right panel chiếm phần còn lại | E2E |
| **AC-2** | Trên mobile (<1024px) → left panel (`BrandPanel`) không hiển thị; right panel hiển thị đầy đủ với mobile logo | E2E |
| **AC-3** | Left panel hiển thị đúng: logo ResourceAI, badge "AI-Powered Workforce Intelligence", heading "Intelligent Resource / Allocation at Scale", 3 stat cards (89%, 3×, -40%), 3 feature items, footer copyright | E2E |
| **AC-4** | Right panel hiển thị: email field (có icon), password field (có icon + eye button), checkbox "Keep me signed in", link "Forgot password?", button "Sign in to ResourceAI" | E2E |
| **AC-5** | Click eye button trên password field → input type chuyển từ `password` sang `text`; click lần nữa → trở về `password` | E2E |
| **AC-6** | Submit form với bất kỳ credentials → button chuyển sang trạng thái loading: disabled, hiện spinner, text "Signing in..." | E2E |
| **AC-7** | Submit form thành công (mock JWT) → redirect về `/dashboard` (giữ nguyên behavior hiện tại) | E2E |
| **AC-8** | Submit form thất bại (network error / API error) → hiển thị `ErrorAlert` với message lỗi; button trở về trạng thái bình thường | E2E |
| **AC-9** | Click nút X trên `ErrorAlert` → alert biến mất | E2E |
| **AC-10** | Truy cập `/login` khi đã có token → **không** redirect về dashboard (login page vẫn hiển thị bình thường — không có redirect guard trên login page) | E2E |
| **AC-11** | `tsc --noEmit` → 0 TypeScript errors | CI |
| **AC-12** | `npm run lint` → 0 ESLint errors | CI |
| **AC-13** | `npm run build` → build thành công, 0 errors | CI |

---

## §8. Examples

### Normal Cases

**NC-1: Login thành công**
```
Pre-condition: docker compose up, tất cả services healthy
Actor: Người dùng nhập credentials hợp lệ

Steps:
  1. Vào http://localhost:3000/login
  2. Nhập email: "admin@company.com"
  3. Nhập password: "anypassword" (mock JWT chấp nhận tất cả)
  4. Click "Sign in to ResourceAI"

Expected:
  - Button disabled ngay lập tức, hiện spinner + "Signing in..."
  - Sau khi API trả về: redirect về /dashboard
  - Không có ErrorAlert
```

**NC-2: Toggle password visibility**
```
Pre-condition: Đang ở trang /login
Actor: Người dùng

Steps:
  1. Nhìn vào password field — type="password" (ký tự ẩn)
  2. Click icon mắt (eye button) bên phải password field
  3. Nhìn lại password field

Expected:
  - Password field type chuyển sang "text" — ký tự hiện rõ
  - Icon mắt thay đổi (eye → eye-off hoặc ngược lại)

Steps tiếp:
  4. Click icon mắt lần nữa

Expected:
  - Password field type trở về "password"
```

### Abnormal Cases

**AB-1: Login thất bại (network error)**
```
Pre-condition: API server DOWN hoặc trả về error
Actor: Người dùng

Steps:
  1. Vào /login
  2. Nhập email + password
  3. Click submit

Expected:
  - Button disabled trong khi loading
  - Sau khi nhận error: button trở lại enabled
  - ErrorAlert hiển thị với message: "The email or password you entered is incorrect. Please try again."
  - Không có redirect
```

**AB-2: Dismiss error alert rồi thử lại**
```
Pre-condition: ErrorAlert đang hiển thị (sau login thất bại)
Actor: Người dùng

Steps:
  1. Click nút X trên ErrorAlert

Expected:
  - ErrorAlert biến mất
  - Form vẫn giữ nguyên email/password đã nhập

Steps tiếp:
  2. Sửa password
  3. Submit lại

Expected:
  - Form submit bình thường (không có alert cũ)
```

### Boundary Values

**BV-1: Email field bỏ trống**
```
Pre-condition: Đang ở /login
Steps:
  1. Để trống email field
  2. Điền password
  3. Click submit

Expected:
  - HTML5 native validation ngăn submit: "Please fill in this field" (hoặc tương đương)
  - Không gọi API
  - Không hiện ErrorAlert
```

**BV-2: Loading state — double submit**
```
Pre-condition: Đang trong trạng thái loading (đã click submit)
Steps:
  1. Click submit lần 1 → button disabled, loading = true
  2. Thử click button lần nữa (hoặc nhấn Enter)

Expected:
  - Button disabled → không thể click lần 2
  - Chỉ có 1 API call được gửi đi
  - Không có race condition
```

**BV-3: Error message dài**
```
Pre-condition: API trả về error message rất dài (>200 ký tự)
Steps:
  1. Mock API trả về error message 300 ký tự

Expected:
  - ErrorAlert vẫn render đúng (không overflow layout)
  - Text wrap trong box
  - Nút X vẫn hiển thị và click được
```

---

## §9. Open Issues

> Tất cả OI là câu hỏi cần con người quyết định. Không implement nếu chưa có DECIDED.

| OI# | Câu hỏi | Ưu tiên | Trạng thái | Ảnh hưởng nếu chưa quyết định |
|-----|---------|---------|-----------|-------------------------------|
| **OI-01** | "Forgot password?" link → có implement chức năng reset password không? | 🔴 HIGH | **DECIDED 2026-04-09** | **UI-only** — giữ `href="#"`, không có flow thực |
| **OI-02** | "Keep me signed in" checkbox → behavior khi checked? | 🟡 MEDIUM | **DECIDED 2026-04-09** | **UI-only** — checkbox render, không có behavior khác |
| **OI-03** | Inline `style` prop cho gradient — acceptable không? | 🟡 MEDIUM | **DECIDED 2026-04-09** | **Acceptable** — dùng `style` prop cho gradient phức tạp |
| **OI-04** | Scope RA-002 — chỉ login page hay toàn bộ `template/`? | 🟡 MEDIUM | **DECIDED 2026-04-09** | **Chỉ login page** — `apps/web/app/login/page.tsx` |

---

## §10. Risks

| Risk | Khả năng | Tác động | Giảm thiểu |
|------|---------|---------|-----------|
| TypeScript strict errors từ props mới | Thấp | Medium | Khai báo interface đầy đủ trước khi code |
| Regression auth guard (`useAuthGuard`) | Thấp | High | Chạy E2E suite sau thay đổi — không đụng đến hook |
| Mobile layout không đúng ý designer | Medium | Low | OI-04 còn open — chấp nhận rủi ro, dùng `lg:hidden` từ HTML |
| `next build` fail do Tailwind v4 class mới | Thấp | Medium | Test `npm run build` sau mỗi component |

---

## §11. Traceability Table

| AC# | Component / File | API | DB | Log | Permission | Test Type |
|-----|-----------------|-----|-----|-----|-----------|----------|
| AC-1 | `LoginPage` layout JSX | — | — | — | Public | E2E |
| AC-2 | `BrandPanel` `lg:hidden` class | — | — | — | Public | E2E |
| AC-3 | `BrandPanel.tsx` nội dung | — | — | — | Public | E2E |
| AC-4 | `LoginForm.tsx` elements | — | — | — | Public | E2E |
| AC-5 | `LoginForm` `showPassword` state + eye button | — | — | — | Public | E2E / UT |
| AC-6 | `LoginPage.handleSubmit` → `loading=true` | — | — | — | Public | E2E |
| AC-7 | `login()` → `router.replace("/dashboard")` | `POST /api/v1/auth/login` | `users` | — | Public | E2E |
| AC-8 | `catch` block → `setError(msg)` | `POST /api/v1/auth/login` (fail) | — | — | Public | E2E |
| AC-9 | `ErrorAlert` `onDismiss` → `setError(null)` | — | — | — | Public | E2E / UT |
| AC-10 | `LoginPage` (không có redirect guard) | — | — | — | Public | E2E |
| AC-11 | Tất cả `.tsx` files mới | — | — | — | — | CI (tsc) |
| AC-12 | Tất cả `.tsx` files mới | — | — | — | — | CI (eslint) |
| AC-13 | Toàn bộ project build | — | — | — | — | CI (build) |

---

## Phán định: Sẵn sàng Implementation?

> ✅ **SẴN SÀNG** — tất cả 4 OI đã được resolve (2026-04-09):
>
> - OI-01 DECIDED: "Forgot password?" → UI-only, `href="#"`
> - OI-02 DECIDED: "Keep me signed in" → UI-only, không có behavior
> - OI-03 DECIDED: `style` prop cho gradient → acceptable
> - OI-04 DECIDED: Scope → chỉ login page
>
> Không còn điểm mơ hồ. Có thể bắt đầu Phase 2 (Implementation Plan).

---

## Các Quyết định OI đã Chốt

| OI# | Quyết định | Ngày |
|-----|-----------|------|
| OI-01 | "Forgot password?" → **UI-only**, `href="#"` | 2026-04-09 |
| OI-02 | "Keep me signed in" → **UI-only**, không có behavior | 2026-04-09 |
| OI-03 | `style` prop cho gradient → **acceptable** | 2026-04-09 |
| OI-04 | Scope → **chỉ login page** | 2026-04-09 |
