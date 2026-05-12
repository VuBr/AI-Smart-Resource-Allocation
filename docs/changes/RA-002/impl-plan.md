# Implementation Plan — RA-002: UI Refactor Login Page

**Ticket:** RA-002
**Spec-pack:** `docs/changes/RA-002/spec-pack.md`
**Sources:** `docs/changes/RA-002/sources.md`
**Trạng thái:** APPROVED
**Ngày tạo:** 2026-04-09 (Phase 2 draft)
**Cập nhật lần cuối:** 2026-04-09 (Phase 3 — đầy đủ)
**Branch:** `apply_ui_from_html`

---

## A. Policy (Chính sách Triển khai)

### A.1 Phương án Được Chọn: Phương án B — 3 Components Tách biệt

| Phương án | Mô tả | Quyết định |
|----------|-------|-----------|
| **A** | Monolithic — toàn bộ JSX trong `login/page.tsx` | ❌ Loại — vi phạm rule `20-architecture.md`: page chỉ orchestrate |
| **B** | 3 components tách biệt trong `components/auth/` | ✅ **Chọn** — đúng spec-pack §5.1, tuân thủ layer rule |
| **C** | Granular hơn — thêm `StatCard`, `FeatureItem`, `PasswordField`... | ❌ Loại — nằm ngoài spec, over-engineering |

**Lý do chọn B:**
- Khớp chính xác spec-pack §5.1 — không thêm không bớt
- Mỗi component có trách nhiệm rõ ràng: BrandPanel (brand), LoginForm (form logic), ErrorAlert (error UX)
- `LoginPage` chỉ orchestrate → đúng `20-architecture.md §Frontend Layer`
- Mỗi file nhỏ đủ để review độc lập

### A.2 Nguyên tắc Bất di bất dịch

1. **Không implement ngoài spec** — "Forgot password?", "Keep me signed in" là UI-only (OI-01, OI-02 DECIDED)
2. **Không dùng UI components** (`Button`, `Input`, `Label` từ `components/ui/`) — style conflict với login template (evidence: `coding-conventions.md §6`)
3. **Không modify auth logic** — `login()`, `handleSubmit()`, `router.replace()` giữ nguyên từ `login/page.tsx` hiện tại
4. **Không chạm** `apps/api/`, `lib/services/auth.ts`, `hooks/useAuthGuard.ts`
5. **Gradient phức tạp** → `style` prop (OI-03 DECIDED acceptable)

---

## B. Impact Analysis

### B.1 Files Trực tiếp Bị Thay đổi

| File | Loại thay đổi | Rủi ro |
|------|-------------|--------|
| `apps/web/app/login/page.tsx` | Modify — thay JSX, giữ nguyên logic | Thấp — logic không thay đổi |
| `apps/web/components/auth/BrandPanel.tsx` | Create mới | Thấp — không có dependency |
| `apps/web/components/auth/ErrorAlert.tsx` | Create mới | Thấp — không có dependency |
| `apps/web/components/auth/LoginForm.tsx` | Create mới | Thấp — chỉ nhận props từ LoginPage |

### B.2 Files Không Thay đổi (Xác nhận)

| File | Lý do an toàn |
|------|--------------|
| `apps/web/lib/services/auth.ts` | `login()` được gọi từ LoginPage, không bị modify |
| `apps/web/hooks/useAuthGuard.ts` | Login page không gọi guard — không touch |
| `apps/web/lib/api-client.ts` | Không liên quan |
| `apps/web/app/layout.tsx` | Root layout wrap LoginPage — không conflict (chỉ inject Geist font + Providers) |
| `apps/web/app/providers.tsx` | Chỉ QueryClientProvider — LoginPage không dùng react-query |
| `apps/web/components/ui/*` | Không dùng cho ticket này |
| `apps/web/types/index.ts` | `LoginResponse` được dùng bởi `auth.ts` — không thay đổi |
| `apps/web/lib/utils.ts` | `cn()` có sẵn nếu cần — không bắt buộc dùng |
| Toàn bộ `apps/api/` | Frontend-only change |
| `.github/workflows/ci.yml` | CI jobs không thay đổi |
| `playwright.config.ts` | Giữ nguyên — E2E test file mới sẽ dùng config này |
| `jest.config.js` | Giữ nguyên — unit test file mới sẽ dùng config này |
| `next.config.ts` | `output: "standalone"` không ảnh hưởng |

### B.3 Impact Analysis Chi tiết

| Dimension | Ảnh hưởng | Chi tiết |
|----------|----------|---------|
| **API** | Không | Không có endpoint mới; `POST /api/v1/auth/login` giữ nguyên |
| **DB** | Không | Không có schema change |
| **Settings/Env** | Không | Không có env var mới |
| **Logs** | Không | Không có `log_event` mới trong FE; BE auth log giữ nguyên |
| **Permissions** | Không | `/login` vẫn là public route |
| **CSS/Style** | Tailwind classes + 3 `style` props | `minWidth`, gradient background, text gradient — không có global CSS impact |
| **Font** | Không | `Geist` font load từ root `layout.tsx` — LoginPage kế thừa |
| **Bundle size** | Tối thiểu | Thêm `lucide-react` icons (Eye, EyeOff) — đã có trong package.json |
| **SEO** | Không | `metadata` trong `layout.tsx` không thay đổi |
| **CI pipeline** | Không | Các jobs hiện tại đủ bao phủ (tsc, lint, build) |
| **E2E tests** | Cần thêm | `apps/web/e2e/login-ui.spec.ts` (file mới, không sửa scaffold.spec.ts) |

### B.4 Dependency Graph

```
LoginPage (app/login/page.tsx)
  ├── import BrandPanel      ← apps/web/components/auth/BrandPanel.tsx
  │     └── lucide-react (CheckCircle2 hoặc inline SVG)
  ├── import ErrorAlert      ← apps/web/components/auth/ErrorAlert.tsx
  │     └── lucide-react (X)
  ├── import LoginForm       ← apps/web/components/auth/LoginForm.tsx
  │     └── lucide-react (Eye, EyeOff)
  ├── import { login }       ← apps/web/lib/services/auth.ts [KHÔNG THAY ĐỔI]
  └── useRouter              ← next/navigation [KHÔNG THAY ĐỔI]
```

---

## C. Code Hiện có Cần Đọc Trước khi Code

> Đọc theo thứ tự — đọc xong rồi mới bắt đầu step implementation.

| # | File | Mục đích đọc | Cần đọc? |
|---|------|-------------|---------|
| 1 | `docs/changes/RA-002/Raw/login.html` | Reference từng Tailwind class, SVG paths, text content | ✅ Bắt buộc |
| 2 | `docs/changes/RA-002/spec-pack.md §4` | Alpine→React mapping table, Style→Tailwind mapping table | ✅ Bắt buộc |
| 3 | `apps/web/app/login/page.tsx` | Confirm state names, handleSubmit signature để giữ nguyên | ✅ Bắt buộc |
| 4 | `apps/web/lib/services/auth.ts` | Confirm `login(email, password)` signature | ✅ Bắt buộc |
| 5 | `docs/standards/coding-conventions.md §6` | Native HTML vs UI components decision | ✅ Bắt buộc |
| 6 | `apps/web/lib/utils.ts` | `cn()` có sẵn nếu cần merge classes | 📌 Tham khảo |

---

## D. Implementation Steps

> Nguyên tắc: **1 step = nhỏ đủ để review độc lập**.
> Thứ tự bắt buộc: STEP-1 → STEP-2 → STEP-3 → STEP-4 (dependency order).
> Sau mỗi step: chạy `tsc --noEmit` để bắt lỗi sớm.

---

### STEP-1: Tạo `components/auth/ErrorAlert.tsx`

**File:** `apps/web/components/auth/ErrorAlert.tsx` (CREATE)
**AC liên quan:** AC-8, AC-9
**Phụ thuộc:** Không có — step độc lập

**Nội dung:**
- `"use client"` directive
- Interface: `{ message: string; onDismiss: () => void }`
- JSX: red border box, info icon (inline SVG từ login.html), title "Authentication failed", `{message}`, X button với `onClick={onDismiss}` + `aria-label="Dismiss error"`
- Toàn bộ style từ Tailwind classes của `login.html` lines 126–137

**Verification:** `tsc --noEmit` → 0 errors

---

### STEP-2: Tạo `components/auth/BrandPanel.tsx`

**File:** `apps/web/components/auth/BrandPanel.tsx` (CREATE)
**AC liên quan:** AC-1, AC-2, AC-3
**Phụ thuộc:** Không có — step độc lập

**Nội dung:**
- Không có `"use client"` (pure presentational — nhưng có thể thêm để nhất quán)
- Props: không có
- Constants cấp file:
  ```typescript
  const BRAND_GRADIENT = "linear-gradient(145deg,#1e1b4b 0%,#312e81 40%,#4338ca 100%)"
  const TEXT_GRADIENT = "linear-gradient(135deg,#a5b4fc,#c084fc)"
  const STATS = [
    { value: "89%", label: "Forecast accuracy" },
    { value: "3×", label: "Faster allocation" },
    { value: "-40%", label: "Bench time reduced" },
  ]
  const FEATURES = [
    "AI-driven bench prediction with risk scoring",
    "Smart skill-matching across projects and teams",
    "Real-time shortage reports and workforce analytics",
  ]
  ```
- JSX sections theo login.html:
  1. Outer div: `className="relative hidden lg:flex lg:w-[55%] flex-col justify-between p-12 overflow-hidden"` + `style={{ background: BRAND_GRADIENT }}`
  2. Background decorations: 3 blur divs + grid overlay div (với `style` prop)
  3. Logo: icon SVG (từ login.html line 37–39) + text "ResourceAI" + "Enterprise Platform"
  4. Hero section: badge (dot + text), h1 với text gradient (`style={{ background: TEXT_GRADIENT }}`), subheading
  5. Stats: `{STATS.map(...)}` → cards
  6. Features: `{FEATURES.map(...)}` → items với checkmark SVG (inline từ login.html)
  7. Footer: copyright text

**Verification:** `tsc --noEmit` → 0 errors; visual check trên browser

---

### STEP-3: Tạo `components/auth/LoginForm.tsx`

**File:** `apps/web/components/auth/LoginForm.tsx` (CREATE)
**AC liên quan:** AC-4, AC-5, AC-6
**Phụ thuộc:** Không có — step độc lập

**Nội dung:**
- `"use client"` directive
- Interface props:
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
- Local state:
  ```typescript
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  ```
- JSX — dùng native HTML (không dùng UI components):
  1. `<form onSubmit={onSubmit}>` (handleSubmit từ LoginPage)
  2. Email field: `<label htmlFor="email">` + `<input id="email" type="email" value={email} onChange=...>` với icon SVG bên trái (pl-10)
  3. Password field: `<label htmlFor="password">` + "Forgot password?" link `href="#"` + `<input id="password" type={showPassword ? "text" : "password"} ...>` với icon SVG bên trái + `<button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">` với Eye/EyeOff icon (lucide-react)
  4. Remember me: `<input type="checkbox" checked={rememberMe} onChange=...>` + `<span>Keep me signed in</span>`
  5. Submit: `<button type="submit" disabled={loading}>` với spinner SVG conditional + text conditional

**Verification:** `tsc --noEmit` → 0 errors; toggle password hoạt động

---

### STEP-4: Cập nhật `app/login/page.tsx`

**File:** `apps/web/app/login/page.tsx` (MODIFY)
**AC liên quan:** AC-1, AC-7, AC-8, AC-9, AC-10
**Phụ thuộc:** STEP-1, STEP-2, STEP-3 phải hoàn thành trước

**Thay đổi:**
- Giữ nguyên toàn bộ: `"use client"`, `useState` imports, `useRouter`, state declarations (`email`, `password`, `error`, `loading`), `handleSubmit` function, `login()` import
- Thêm imports: `BrandPanel`, `ErrorAlert`, `LoginForm` từ `@/components/auth/`
- Thay JSX return:

```tsx
return (
  <div className="flex min-h-screen" style={{ minWidth: "1280px" }}>
    <BrandPanel />

    {/* Right panel */}
    <div className="flex flex-1 flex-col justify-center bg-slate-50 px-8 py-12 sm:px-16 lg:px-20">
      <div className="mx-auto w-full max-w-sm">

        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-x-3 lg:hidden">
          {/* SVG icon + "ResourceAI" text — từ login.html lines 112–116 */}
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to your ResourceAI account to continue.</p>
        </div>

        {/* ErrorAlert — conditional */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* LoginForm */}
        <LoginForm
          email={email}
          password={password}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />

        {/* Footer */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-400">
            Protected by enterprise SSO ·{" "}
            <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  </div>
)
```

**Lưu ý:** Xóa dòng cũ `<p className="...text-gray-400">Mock JWT — Phase 5 scaffold</p>` (AC-7 security check trong review-checklist §7.3)

**Verification:** `tsc --noEmit` → 0 errors; `npm run dev` → mở browser kiểm tra

---

### STEP-5: Quality Gates

**Thứ tự chạy bắt buộc:**

```bash
# Từ apps/web/
npx tsc --noEmit        # AC-11: 0 TypeScript errors
npm run lint            # AC-12: 0 ESLint errors
npm run build           # AC-13: 0 build errors
```

**Verification:** Tất cả 3 commands → exit code 0

---

### STEP-6: E2E Verification Manual

**Pre-condition:** `npm run dev` đang chạy (hoặc `docker compose up`)

**Chạy theo thứ tự blackbox cases:**
```
BB-01 → BB-02 → BB-03 → BB-04 → BB-05 → BB-06 → BB-07 → BB-08 → BB-09 → BB-10 → BB-11
```
Chi tiết: `docs/changes/RA-002/blackbox-testcases.md`

---

## E. Rollback Plan

> Ticket này chỉ thêm files mới + thay đổi 1 file. Rollback đơn giản.

### Rollback Toàn bộ

```bash
# Restore login/page.tsx về version cũ
git checkout apps/web/app/login/page.tsx

# Xóa 3 component files mới
git clean -f apps/web/components/auth/
# HOẶC xóa thủ công từng file nếu không muốn dùng git clean:
# rm apps/web/components/auth/BrandPanel.tsx
# rm apps/web/components/auth/ErrorAlert.tsx
# rm apps/web/components/auth/LoginForm.tsx
```

### Rollback Từng Step

| Step | Rollback |
|------|---------|
| STEP-1 (ErrorAlert) | Xóa `components/auth/ErrorAlert.tsx` |
| STEP-2 (BrandPanel) | Xóa `components/auth/BrandPanel.tsx` |
| STEP-3 (LoginForm) | Xóa `components/auth/LoginForm.tsx` |
| STEP-4 (LoginPage) | `git checkout apps/web/app/login/page.tsx` |

**Lưu ý:** Nếu chưa commit, dùng `git checkout`. Nếu đã commit, dùng `git revert <commit-hash>` (không dùng `git reset --hard` — forbidden theo `00-safety.md`).

---

## F. Verification Procedure

> Chạy theo thứ tự sau khi hoàn thành toàn bộ STEP-1 đến STEP-4.

### F.1 Automated Checks (bắt buộc)

```bash
cd apps/web

# 1. TypeScript
npx tsc --noEmit
# Expected: (no output, exit 0)

# 2. Lint
npm run lint
# Expected: (no output hoặc "No issues found", exit 0)

# 3. Build
npm run build
# Expected: "✓ Compiled successfully", exit 0
```

### F.2 Manual Browser Check

```bash
# Start dev server
npm run dev
# Mở http://localhost:3000/login
```

| Kiểm tra | Expected |
|---------|---------|
| Desktop 1280px: Left panel visible | ✅ Gradient purple |
| Mobile 375px (DevTools): Left panel ẩn | ✅ Chỉ form |
| Password field: click eye icon | ✅ Toggle text/password |
| Submit: click button | ✅ Spinner + "Signing in..." |
| Submit thành công (mock JWT) | ✅ Redirect /dashboard |
| Submit thất bại (network off) | ✅ ErrorAlert hiện |
| Click X trên ErrorAlert | ✅ Alert ẩn |

### F.3 E2E Tests (nếu có file `e2e/login-ui.spec.ts`)

```bash
# Pre-condition: docker compose up hoặc npm run dev + backend chạy
npx playwright test e2e/login-ui.spec.ts
```

### F.4 Existing E2E Smoke Test (đảm bảo không regression)

```bash
# Chạy lại E2E suite cũ để verify không có regression
npx playwright test e2e/scaffold.spec.ts
```

---

## G. AC Mapping Table

> Mỗi AC được đáp ứng ở đâu (file + component/function).

| AC# | Phát biểu ngắn | File/Component | Mechanism |
|-----|---------------|---------------|-----------|
| **AC-1** | 2-panel layout desktop | `login/page.tsx` | `<div className="flex min-h-screen">` + `<BrandPanel />` |
| **AC-2** | Mobile: left panel ẩn | `BrandPanel.tsx` | `className="hidden lg:flex lg:w-[55%]..."` |
| **AC-3** | BrandPanel content đúng | `BrandPanel.tsx` | Constants STATS, FEATURES + JSX |
| **AC-4** | Right panel elements | `LoginForm.tsx` | Email input, password input, checkbox, "Forgot password?", submit button |
| **AC-5** | Password toggle | `LoginForm.tsx` | `useState(showPassword)` + `type={showPassword ? "text" : "password"}` + eye button |
| **AC-6** | Loading state | `LoginForm.tsx` | `disabled={loading}` + spinner conditional + text conditional |
| **AC-7** | Redirect sau login | `login/page.tsx` → `handleSubmit` → `login()` → `router.replace("/dashboard")` | Giữ nguyên từ As-Is |
| **AC-8** | ErrorAlert khi lỗi | `login/page.tsx` → `catch` → `setError(msg)` + `{error && <ErrorAlert .../>}` | `ErrorAlert.tsx` |
| **AC-9** | Dismiss ErrorAlert | `ErrorAlert.tsx` | `onDismiss={() => setError(null)}` prop → `onClick={onDismiss}` |
| **AC-10** | Login accessible khi có token | `login/page.tsx` | Không có `useAuthGuard()` — intentional |
| **AC-11** | 0 TypeScript errors | Tất cả 4 files | `tsc --noEmit` (CI: `frontend-typecheck`) |
| **AC-12** | 0 ESLint errors | Tất cả 4 files | `npm run lint` (CI: `frontend-lint`) |
| **AC-13** | Build thành công | Toàn bộ project | `npm run build` (CI: `frontend-build`) |

---

## H. Checklist Trước khi Bắt đầu Implementation

### H.1 Thông tin Đã Đủ ✅

- [x] Spec-pack đã APPROVED, tất cả OI DECIDED
- [x] Phương án triển khai đã chốt (Phương án B)
- [x] Native HTML vs UI components — đã quyết định
- [x] Gradient approach — đã quyết định (style prop)
- [x] File structure rõ ràng: 3 files mới + 1 file modify
- [x] Thứ tự implementation rõ ràng: STEP-1 → STEP-4
- [x] Rollback plan có sẵn
- [x] CI verification commands sẵn

### H.2 Cần Xác nhận Trước khi Code

- [ ] **Confirm `lucide-react` icon names:** `Eye`, `EyeOff` — tên đúng trong version hiện tại? Kiểm tra: `node_modules/lucide-react/dist/esm/icons/` hoặc import test
- [ ] **Confirm Tailwind v4 opacity modifier:** `bg-indigo-400/10`, `bg-white/5`, `opacity-[0.03]` — chạy `npm run build` sau STEP-2 để verify
- [ ] **Confirm `CheckCircle2` icon:** BrandPanel dùng checkmark icon — tên đúng trong lucide-react? Alternative: dùng inline SVG từ `login.html` để tránh rủi ro

### H.3 Không Cần Quyết định Thêm

- "Forgot password?" → UI-only `href="#"` (OI-01 DECIDED)
- "Keep me signed in" → UI-only (OI-02 DECIDED)
- `style` prop cho gradient → acceptable (OI-03 DECIDED)
- Scope → chỉ login page (OI-04 DECIDED)
