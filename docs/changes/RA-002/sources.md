# Sources of Truth — RA-002: UI Refactor (Login Page)

**Ngày tạo:** 2026-04-09
**Phase:** 1 — Spec Pack
**Tác giả:** Claude Code (AI assistant)

---

## 1. Danh sách Nguồn Đặc tả

| # | Tài liệu | Vị trí | Authority Level | Ghi chú |
|---|---------|--------|----------------|---------|
| S-1 | HTML template login | `docs/changes/RA-002/Raw/login.html` | **HIGHEST** — nguồn thiết kế UI chính thức | Bao gồm layout, style, Alpine.js state |
| S-2 | Ticket summary | `docs/changes/RA-002/Raw/summary.md` | HIGH — mô tả mục tiêu và yêu cầu | Có một số thông tin thiếu (xem §3) |
| S-3 | Coding conventions | `docs/standards/coding-conventions.md` | HIGH — áp dụng cho mọi ticket | Ưu tiên hơn S-2 khi có mâu thuẫn |
| S-4 | System overview | `docs/architecture/system-overview.md` | HIGH — kiến trúc tổng thể | Tech stack, layer responsibilities |
| S-5 | Current login page | `apps/web/app/login/page.tsx` | MEDIUM — trạng thái hiện tại (As-Is) | Business logic cần giữ nguyên |
| S-6 | Style rules | `.claude/rules/10-style.md` | HIGH — naming, formatting | Ưu tiên hơn S-2 khi mâu thuẫn |
| S-7 | Architecture rules | `.claude/rules/20-architecture.md` | HIGH — layer responsibilities | Component structure |
| S-8 | Security rules | `.claude/rules/30-security.md` | HIGH — security policy | SD-1 mock JWT |

---

## 2. Mâu thuẫn Đã Phát hiện & Quyết định

| ID | Mâu thuẫn | Nguồn A | Nguồn B | Quyết định | Ngày |
|----|----------|---------|---------|-----------|------|
| **C-1** | "Tách style sang CSS module" | S-2 (summary.md) | S-3 (coding-conventions.md §8): project không dùng CSS modules — TailwindCSS only | **Dùng Tailwind utility classes. Inline `style` prop chỉ cho gradient phức tạp không express được bằng Tailwind.** | 2026-04-09 |
| **C-2** | "Tuân thủ ESLint/Prettier" | S-2 (summary.md) | S-3 (coding-conventions.md §8): "Không dùng Prettier — không có trong stack" | **Giữ ESLint, bỏ Prettier.** | 2026-04-09 |
| **C-3** | Alpine.js directives (`x-data`, `@click`, `x-show`) | S-1 (login.html) | S-4 (system-overview.md §2): Frontend là React/Next.js | **Chuyển toàn bộ Alpine.js directives sang React `useState` + `onClick` + conditional rendering.** | 2026-04-09 |

---

## 3. Thông tin Còn thiếu (Missing)

| Hạng mục | Mô tả | Ảnh hưởng |
|---------|-------|---------|
| **Wireframe / Figma mockup** | summary.md §"Basic design" ghi "nếu có" — chưa có | Medium: mobile layout (<1024px) không được xác nhận bởi designer |
| **Ghi chú họp** | summary.md §"Ghi chú họp" — không có | Low: quyết định C-1/C-2/C-3 đã được resolve trực tiếp |
| **PO/PM acceptance** | Scope (chỉ login page hay toàn bộ template?) chưa có sign-off | Medium: ghi là OI-04 trong spec-pack |
| **"Forgot password?" flow** | HTML có link "Forgot password?" nhưng không có spec | High: ghi là OI-01 — cần quyết định trước khi implement |
| **"Keep me signed in" behavior** | HTML có checkbox nhưng không có spec behavior | Medium: ghi là OI-02 |

---

## 4. Nguồn Authoritative cho Từng Quyết định

| Quyết định | Nguồn Authoritative |
|-----------|-------------------|
| Style approach (Tailwind vs CSS modules) | S-3 (`coding-conventions.md`) — override S-2 |
| Lint tool | S-3 (`coding-conventions.md §8`) — override S-2 |
| State management | S-4 (`system-overview.md`) — React hooks |
| Component file naming | S-6 (`.claude/rules/10-style.md`) |
| Layer structure | S-7 (`.claude/rules/20-architecture.md`) |
| Auth logic (giữ nguyên) | S-5 (`apps/web/app/login/page.tsx`) |
| Security (SD-1 mock JWT) | S-8 (`.claude/rules/30-security.md`) |
| UI/UX visual design | S-1 (`login.html`) — HIGHEST |
