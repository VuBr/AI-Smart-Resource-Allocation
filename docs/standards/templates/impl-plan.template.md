# Implementation Plan — {{TICKET_ID}}: {{Tên Tính Năng}}

> **Hướng dẫn:** Điền vào tất cả `{{...}}`. Xóa phần này trước khi commit.
> Đặt file tại `docs/changes/{{TICKET_ID}}/impl-plan.md`.
> Plan này phải được approve trước khi bắt đầu code.

**Ticket:** {{TICKET_ID}}
**Spec-pack:** `docs/changes/{{TICKET_ID}}/spec-pack.md`
**Trạng thái:** DRAFT | APPROVED | IN PROGRESS | DONE
**Ngày tạo:** {{YYYY-MM-DD}}

---

## 1. Files cần Đọc (Input)

> Đọc xong mới bắt đầu code để tránh tạo conflict.

| File | Mục đích đọc |
|------|-------------|
| `{{apps/api/app/services/bench_prediction.py}}` | Hiểu business logic hiện tại |
| `{{apps/web/app/login/page.tsx}}` | Hiểu entry point cần thay đổi |
| `{{apps/web/components/ui/button.tsx}}` | Hiểu API của component tái sử dụng |
| `{{docs/standards/coding-conventions.md}}` | Đảm bảo tuân thủ conventions |

---

## 2. Files sẽ Tạo mới

| File | Nội dung chính | CP liên quan |
|------|---------------|-------------|
| `{{apps/web/components/auth/BrandPanel.tsx}}` | Left panel: logo, stats, features | CP-1 |
| `{{apps/web/components/auth/LoginForm.tsx}}` | Form email/password/submit | CP-2 |
| `{{apps/web/components/auth/ErrorAlert.tsx}}` | Dismissable error | CP-2 |

---

## 3. Files sẽ Thay đổi

| File | Thay đổi | CP liên quan |
|------|---------|-------------|
| `{{apps/web/app/login/page.tsx}}` | Giữ logic, thay JSX thành 2-panel layout | CP-3 |

---

## 4. Checkpoints

| CP | Mô tả | Tiêu chí hoàn thành | Trạng thái |
|----|-------|-------------------|-----------|
| **CP-1** | {{Tạo BrandPanel component}} | {{Component render đúng trên desktop}} | ⬜ TODO |
| **CP-2** | {{Tạo LoginForm + ErrorAlert}} | {{Form submit gọi đúng handler}} | ⬜ TODO |
| **CP-3** | {{Cập nhật login/page.tsx}} | {{2-panel layout, logic auth giữ nguyên}} | ⬜ TODO |
| **CP-4** | {{Quality gates pass}} | {{tsc + eslint + next build = 0 errors}} | ⬜ TODO |
| **CP-5** | {{E2E tests pass}} | {{Tất cả AC trong spec-pack = PASS}} | ⬜ TODO |

> Cập nhật trạng thái: ⬜ TODO → 🔄 IN PROGRESS → ✅ DONE | ❌ BLOCKED

---

## 5. Rủi ro & Giảm thiểu

| Rủi ro | Khả năng | Giảm thiểu |
|--------|---------|-----------|
| {{Tailwind class conflicts với shadcn/ui}} | Trung bình | Dùng `cn()` utility merge classes |
| {{TypeScript strict errors trên props mới}} | Thấp | Khai báo interface đầy đủ trước khi code |
| {{Regression trên auth guard}} | Thấp | Chạy E2E suite sau khi thay đổi login page |

---

## 6. Thứ tự Thực hiện

```
1. Đọc input files (§1)
2. Tạo files mới theo thứ tự CP (§4)
3. Thay đổi files hiện có (§3)
4. Chạy quality gates: ruff → black → pytest → tsc → eslint → next build
5. Viết / update tests nếu cần
6. Chạy E2E (docker compose up trước)
7. Cập nhật trạng thái các CP
8. Hoàn thành self-review
```

---

## 7. Lưu ý Quan trọng

- {{Ghi bất kỳ cạm bẫy kỹ thuật nào phát hiện khi đọc code}}
- Ví dụ: `system-overview.md §14` xác nhận **không dùng Prettier** — format qua ESLint
- Ví dụ: Security Debt SD-1 vẫn open — không thay đổi auth logic backend
- Ví dụ: `BENCH_ALERT_DAYS_THRESHOLD` đọc từ env — không hardcode 30 trong code mới
