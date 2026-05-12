# Code Review Checklist — RA-002: UI Refactor Login Page

**PR:** (điền khi tạo PR)
**Reviewer:** (điền khi review)
**Ngày review:** (điền khi review)
**Spec-pack:** `docs/changes/RA-002/spec-pack.md`
**Impl-plan:** `docs/changes/RA-002/impl-plan.md`

---

## Severity Legend

| Severity | Ý nghĩa |
|---------|---------|
| 🔴 **Blocker** | Không được merge nếu fail — security hole, business logic sai, build fail, AC không đạt |
| 🟡 **Major** | Nên fix trước merge — accessibility thiếu, style conflict rõ ràng, test coverage gap |
| 🟢 **Minor** | Nice-to-have — cosmetic, code style nhỏ, không block merge |

---

## §1. Specification & AC Coverage

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 1.1 | 🔴 Blocker | Chỉ đúng 4 files bị thay đổi: `login/page.tsx` (modify) + 3 files mới trong `components/auth/`? Không có file nào ngoài danh sách impl-plan §C/D? | — | ✅ / ❌ |
| 1.2 | 🔴 Blocker | `handleSubmit`, `login()`, `router.replace("/dashboard")` giữ nguyên logic từ As-Is? | AC-7 | ✅ / ❌ |
| 1.3 | 🔴 Blocker | `LoginPage` KHÔNG gọi `useAuthGuard()` — login page intentionally public? | AC-10 | ✅ / ❌ |
| 1.4 | 🟡 Major | 2-panel layout: outer `<div className="flex min-h-screen">` + `style={{ minWidth: "1280px" }}`? | AC-1 | ✅ / ❌ |
| 1.5 | 🟡 Major | Left panel ẩn mobile: `hidden lg:flex lg:w-[55%]` trên BrandPanel? | AC-2 | ✅ / ❌ |
| 1.6 | 🟡 Major | BrandPanel chứa đúng: logo, badge, heading, 3 stats, 3 features, footer? | AC-3 | ✅ / ❌ |
| 1.7 | 🟡 Major | LoginForm chứa đúng: email field (icon), password field (icon + toggle), remember me, "Forgot password?", submit? | AC-4 | ✅ / ❌ |
| 1.8 | 🟡 Major | Password toggle đúng: `type={showPassword ? "text" : "password"}`, eye/eye-off icon swap? | AC-5 | ✅ / ❌ |
| 1.9 | 🟡 Major | Submit button: `disabled={loading}`, spinner conditional, text conditional ("Signing in..." / "Sign in to ResourceAI")? | AC-6 | ✅ / ❌ |
| 1.10 | 🟡 Major | ErrorAlert chỉ render khi `error !== null`: `{error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}`? | AC-8 | ✅ / ❌ |
| 1.11 | 🟡 Major | Click X trên ErrorAlert gọi `onDismiss` → `setError(null)` → alert ẩn? | AC-9 | ✅ / ❌ |
| 1.12 | 🔴 Blocker | "Forgot password?" là `href="#"` (UI-only, OI-01 DECIDED) — không có routing/API call? | — | ✅ / ❌ |
| 1.13 | 🟢 Minor | "Keep me signed in" checkbox render với `defaultChecked` / controlled state, không có behavior thêm (OI-02)? | — | ✅ / ❌ |
| 1.14 | 🟡 Major | Error state border đỏ trên password field (từ HTML demo) KHÔNG được implement? | — | ✅ / ❌ |
| 1.15 | 🟢 Minor | Mobile logo (`lg:hidden`) có mặt trong right panel? | AC-2 | ✅ / ❌ |

---

## §2. Design & Dependencies

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 2.1 | 🔴 Blocker | `BrandPanel` không có state, không có props — pure presentational component? | AC-3 | ✅ / ❌ |
| 2.2 | 🔴 Blocker | Business state (`email`, `password`, `error`, `loading`) nằm ở `LoginPage` — không bị chia ra component con? | AC-6, AC-8 | ✅ / ❌ |
| 2.3 | 🟡 Major | `showPassword` và `rememberMe` là local state trong `LoginForm` (không lift lên `LoginPage`)? | AC-5 | ✅ / ❌ |
| 2.4 | 🟡 Major | Props interface `LoginFormProps` khai báo đầy đủ: `email`, `password`, `loading`, `onEmailChange`, `onPasswordChange`, `onSubmit`? | AC-4 | ✅ / ❌ |
| 2.5 | 🟡 Major | Props interface `ErrorAlertProps` khai báo đầy đủ: `message: string`, `onDismiss: () => void`? | AC-8, AC-9 | ✅ / ❌ |
| 2.6 | 🔴 Blocker | Không có component nào import `login()` trực tiếp — chỉ `LoginPage` gọi? | AC-7 | ✅ / ❌ |
| 2.7 | 🟡 Major | Không có thay đổi nào trong: `lib/services/auth.ts`, `hooks/useAuthGuard.ts`, `lib/api-client.ts`, `apps/api/`? | — | ✅ / ❌ |
| 2.8 | 🟢 Minor | STATS và FEATURES là file-level constants trong `BrandPanel` (không hardcode trực tiếp trong JSX)? | AC-3 | ✅ / ❌ |
| 2.9 | 🟢 Minor | `lucide-react` icons dùng đúng tên: `Eye`, `EyeOff`, `CheckCircle2` (đã verify tồn tại trong v1.7.0)? | AC-5 | ✅ / ❌ |

---

## §3. Error Handling

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 3.1 | 🔴 Blocker | `handleSubmit` có `try/catch/finally` — `loading` luôn được reset về `false` dù thành công hay thất bại? | AC-6 | ✅ / ❌ |
| 3.2 | 🔴 Blocker | `catch` block set `error` state → ErrorAlert hiển thị, không để lỗi im lặng? | AC-8 | ✅ / ❌ |
| 3.3 | 🟡 Major | `setError(null)` được gọi ở đầu `handleSubmit` trước mỗi lần submit — xóa error cũ? | AC-8 | ✅ / ❌ |
| 3.4 | 🟡 Major | Email input có `required` attribute — HTML5 native validation ngăn submit khi trống? | AC-4 | ✅ / ❌ |
| 3.5 | 🟡 Major | Password input có `required` attribute? | AC-4 | ✅ / ❌ |
| 3.6 | 🟡 Major | Submit button `disabled={loading}` ngăn double submit trong khi request đang chạy? | AC-6 | ✅ / ❌ |

---

## §4. Security

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 4.1 | 🔴 Blocker | Không có credentials, token, hoặc secret hardcode trong bất kỳ file mới nào? | — | ✅ / ❌ |
| 4.2 | 🔴 Blocker | Login page KHÔNG hiển thị "Mock JWT — Phase 5 scaffold" hoặc bất kỳ thông tin internal nào trong UI? | — | ✅ / ❌ |
| 4.3 | 🟡 Major | Password input mặc định là `type="password"` (ẩn), chỉ show khi user chủ động click toggle? | AC-5 | ✅ / ❌ |
| 4.4 | 🟢 Minor | SD-1 TODO comments trong `apps/api/app/core/security.py` còn nguyên (không bị xóa trong diff)? | — | ✅ / N/A |
| 4.5 | 🟢 Minor | `localStorage` operations trong `auth.ts` không bị thay đổi (giữ nguyên `access_token` + `user_role`)? | — | ✅ / ❌ |

---

## §5. Performance

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 5.1 | 🟡 Major | `BrandPanel` không có `useEffect`, không có data fetching — render tĩnh hoàn toàn? | AC-3 | ✅ / ❌ |
| 5.2 | 🟢 Minor | Không có heavy import mới nào được thêm vào (chỉ `lucide-react` icons đã có trong bundle)? | — | ✅ / ❌ |
| 5.3 | 🟢 Minor | Không có `console.log` hay debug statement nào trong code mới? | — | ✅ / ❌ |

---

## §6. Compatibility

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 6.1 | 🔴 Blocker | `npm run build` (`next build`) thành công — không có build error? | AC-13 | ✅ / ❌ |
| 6.2 | 🟡 Major | Tailwind opacity modifier (`bg-indigo-400/10`, `bg-white/5`, `opacity-[0.03]`) render đúng trong browser (Tailwind v4.2.2)? | AC-1, AC-3 | ✅ / ❌ |
| 6.3 | 🟡 Major | `style={{ minWidth: "1280px" }}` chỉ áp dụng trên login page — không ảnh hưởng root layout hay routes khác? | AC-1 | ✅ / ❌ |
| 6.4 | 🟡 Major | Existing E2E test `e2e/scaffold.spec.ts` vẫn pass sau thay đổi (không regression trên login flow cũ)? | — | ✅ / ❌ |
| 6.5 | 🟢 Minor | `"use client"` directive đặt ở dòng đầu tiên (trước mọi import) trong từng file? | — | ✅ / ❌ |

---

## §7. Logs & Audit

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 7.1 | 🟢 Minor | Không có `console.log`, `console.error`, hay logging statement mới trong FE code? | — | ✅ / ❌ |
| 7.2 | 🟢 Minor | Login event logging vẫn xảy ra ở Backend (không bị block bởi FE changes) — `POST /api/v1/auth/login` vẫn được gọi đúng? | AC-7 | ✅ / N/A |

---

## §8. Testing Coverage

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 8.1 | 🔴 Blocker | `tsc --noEmit` → 0 TypeScript errors? | AC-11 | ✅ / ❌ |
| 8.2 | 🔴 Blocker | `npm run lint` → 0 ESLint errors? | AC-12 | ✅ / ❌ |
| 8.3 | 🔴 Blocker | `npm run build` → 0 build errors? | AC-13 | ✅ / ❌ |
| 8.4 | 🟡 Major | Tất cả 13 AC trong spec-pack có thể verify bằng BB test cases trong `blackbox-testcases.md`? | AC-1–AC-13 | ✅ / ❌ |
| 8.5 | 🟢 Minor | Unit tests (nếu có) cho `ErrorAlert.dismiss` và `LoginForm.password-toggle` pass? | AC-5, AC-9 | ✅ / N/A |

---

## §9. Operations

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 9.1 | 🟡 Major | `docker compose up` → login page load thành công (không có 500 error, không có JS console error critical)? | AC-1 | ✅ / ❌ |
| 9.2 | 🟢 Minor | `next.config.ts` (`output: "standalone"`) không bị thay đổi — build artifact vẫn compatible với Docker image? | — | ✅ / ❌ |
| 9.3 | 🟢 Minor | Không có file `.env` hay secret file nào được commit? | — | ✅ / ❌ |

---

## §10. Code Style & Conventions

| # | Severity | Kiểm tra | AC# | Kết quả |
|---|---------|---------|-----|---------|
| 10.1 | 🔴 Blocker | **Không dùng** `Button`, `Input`, `Label` từ `components/ui/` — dùng native HTML `<button>`, `<input>`, `<label>`? | — | ✅ / ❌ |
| 10.2 | 🔴 Blocker | Không có file `.module.css` hay `.scss` được tạo — style chỉ qua Tailwind classes + `style` prop? | — | ✅ / ❌ |
| 10.3 | 🟡 Major | Import dùng `@/*` path alias — không có relative path `../../`? | — | ✅ / ❌ |
| 10.4 | 🟡 Major | File names đúng: `BrandPanel.tsx`, `ErrorAlert.tsx`, `LoginForm.tsx` (PascalCase.tsx)? | — | ✅ / ❌ |
| 10.5 | 🟡 Major | `htmlFor` trên tất cả `<label>` khớp với `id` của `<input>` tương ứng? | — | ✅ / ❌ |
| 10.6 | 🟡 Major | `aria-label` trên eye toggle button (`"Toggle password visibility"`) và dismiss button (`"Dismiss error"`)? | — | ✅ / ❌ |
| 10.7 | 🟡 Major | Không có `any` TypeScript type? | — | ✅ / ❌ |
| 10.8 | 🟢 Minor | Gradient constants đặt ở file-level (không inline trong JSX): `BRAND_GRADIENT`, `TEXT_GRADIENT`? | — | ✅ / ❌ |

---

## AC Mapping Table

> Mỗi AC được xác nhận bởi checklist item nào.

| AC# | Phát biểu | Checklist items xác nhận |
|-----|----------|-------------------------|
| AC-1 | 2-panel layout desktop | 1.4, 6.2, 6.3, 9.1 |
| AC-2 | Mobile: left panel ẩn | 1.5, 1.15 |
| AC-3 | BrandPanel content đúng | 1.6, 2.1, 2.8, 5.1 |
| AC-4 | Right panel elements | 1.7, 3.4, 3.5 |
| AC-5 | Password toggle | 1.8, 2.3, 4.3 |
| AC-6 | Loading state | 1.9, 2.2, 3.1, 3.6 |
| AC-7 | Redirect sau login thành công | 1.2, 2.6, 7.2 |
| AC-8 | ErrorAlert khi lỗi | 1.10, 2.2, 2.5, 3.2, 3.3 |
| AC-9 | Dismiss ErrorAlert | 1.11, 2.5 |
| AC-10 | Login page accessible khi có token | 1.3 |
| AC-11 | 0 TypeScript errors | 8.1 |
| AC-12 | 0 ESLint errors | 8.2 |
| AC-13 | 0 build errors | 6.1, 8.3 |

---

## Kết luận

**Tổng số Blocker ❌:** ___ / 14
**Tổng số Major ❌:** ___ / 22
**Tổng số Minor ❌:** ___ / 12

**Quyết định:**
- [ ] ✅ **APPROVE** — 0 Blocker ❌, Major ❌ ≤ 2 (có plan fix)
- [ ] 🔄 **REQUEST CHANGES** — còn ___ Blocker hoặc ___ Major chưa fix
- [ ] 💬 **COMMENT** — có câu hỏi, không block merge
