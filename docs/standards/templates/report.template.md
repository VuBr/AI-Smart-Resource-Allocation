# Phase Report — {{TICKET_ID}} Phase {{N}}: {{Tên Phase}}

> **Hướng dẫn:** Điền sau khi hoàn thành một phase. Đặt tại `docs/changes/{{TICKET_ID}}/report-phase{{N}}.md`.

**Ticket:** {{TICKET_ID}}
**Phase:** {{N}} — {{Tên Phase}}
**Ngày bắt đầu:** {{YYYY-MM-DD}}
**Ngày hoàn thành:** {{YYYY-MM-DD}}
**Tác giả:** {{tên / alias}}

---

## 1. Tóm tắt

{{Mô tả ngắn gọn (2-3 câu) phase này đã làm gì và kết quả chính.}}

**Ví dụ pre-filled (RA-002 Phase 1):**
> Phase 1 đã refactor trang login từ scaffold đơn giản sang 2-panel layout theo template HTML.
> Tách thành 3 components tái sử dụng: BrandPanel, LoginForm, ErrorAlert.
> Logic auth (handleSubmit, login(), router.replace) được giữ nguyên từ phase trước.

---

## 2. Deliverables Đã Hoàn thành

| # | Deliverable | File | Trạng thái |
|---|------------|------|-----------|
| 1 | {{Mô tả deliverable}} | `{{path/to/file}}` | ✅ DONE |
| 2 | {{Mô tả deliverable}} | `{{path/to/file}}` | ✅ DONE |
| N | {{...}} | `{{...}}` | ✅ / ❌ |

---

## 3. Checkpoints

| CP | Mô tả | Kết quả | Ghi chú |
|----|-------|---------|---------|
| CP-1 | {{mô tả}} | ✅ PASS / ❌ FAIL | |
| CP-2 | {{mô tả}} | ✅ PASS / ❌ FAIL | |
| CP-N | {{mô tả}} | ✅ PASS / ❌ FAIL | |

---

## 4. Quality Gates

| Gate | Command | Kết quả |
|------|---------|---------|
| Backend lint | `ruff check .` | ✅ 0 errors |
| Backend format | `black --check .` | ✅ 0 diffs |
| Backend tests | `pytest tests/ -q` | ✅ {{N}} passed |
| Frontend typecheck | `tsc --noEmit` | ✅ 0 errors |
| Frontend lint | `npm run lint` | ✅ 0 errors |
| Frontend build | `npm run build` | ✅ OK |

---

## 5. Các Quyết định Đưa ra trong Phase này

| OI# | Quyết định | Lý do |
|-----|-----------|-------|
| OI-{{N}} | {{Quyết định cụ thể}} | {{Lý do ngắn gọn}} |

---

## 6. Technical Debt & Open Issues Còn lại

| Loại | Mô tả | Ưu tiên |
|------|-------|---------|
| Security Debt | **SD-1: Mock JWT** — chưa resolve | CRITICAL |
| Tech Debt | {{Mô tả}} | HIGH / MEDIUM / LOW |
| Open Issue | {{OI# còn open}} | {{Ưu tiên}} |

---

## 7. Những gì Không Làm được / Lý do

> Ghi nhận những gì không hoàn thành và lý do. Để trống nếu hoàn thành đủ scope.

| Hạng mục | Lý do | Kế hoạch |
|---------|-------|---------|
| {{...}} | {{...}} | {{Chuyển sang OI / phase sau}} |

---

## 8. Bàn giao cho Phase Tiếp theo

> Những giả định, context, và cautions cần truyền sang phase sau.

- **Giả định:** {{...}}
- **Caution:** {{...}}
- **Open Issues cần resolve trước phase sau:** {{OI# list}}
- **Files quan trọng cần đọc lại:** `{{path}}` — {{lý do}}
