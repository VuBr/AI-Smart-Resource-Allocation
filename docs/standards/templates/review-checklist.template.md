# Code Review Checklist — {{TICKET_ID}}: {{Tên Tính Năng}}

> **Hướng dẫn cho reviewer:** Đặt file tại `docs/changes/{{TICKET_ID}}/review-checklist.md`.
> Điền ✅ / ❌ / N/A cho từng mục. Mọi ❌ phải được comment trên PR.

**PR:** {{PR URL hoặc number}}
**Reviewer:** {{tên / alias}}
**Ngày review:** {{YYYY-MM-DD}}

---

## 1. Scope & Correctness

| # | Câu hỏi | Kết quả |
|---|---------|---------|
| 1.1 | Code thực hiện đúng tất cả AC trong spec-pack? | ✅ / ❌ |
| 1.2 | Không có thay đổi ngoài scope được approve? | ✅ / ❌ |
| 1.3 | Open Issues chưa resolved không bị tự suy đoán? | ✅ / ❌ |
| 1.4 | Business rules đúng theo spec (allocation cap, bench threshold, v.v.)? | ✅ / ❌ / N/A |

---

## 2. Architecture & Layer Rules

| # | Câu hỏi | Kết quả |
|---|---------|---------|
| 2.1 | Router chỉ validate + gọi service (không có logic nghiệp vụ trong router)? | ✅ / ❌ / N/A |
| 2.2 | Service không gọi trực tiếp DB (phải qua repository)? | ✅ / ❌ / N/A |
| 2.3 | FE page không xử lý business logic (chỉ orchestrate UI + gọi service)? | ✅ / ❌ / N/A |
| 2.4 | Import direction đúng (FE không import từ api/, ngược lại)? | ✅ / ❌ |

---

## 3. Code Style & Conventions

| # | Câu hỏi | Kết quả |
|---|---------|---------|
| 3.1 | Naming tuân thủ `docs/standards/coding-conventions.md §1`? | ✅ / ❌ |
| 3.2 | BE public functions có type hints đầy đủ? | ✅ / ❌ / N/A |
| 3.3 | FE: "use client" ở đúng chỗ? | ✅ / ❌ / N/A |
| 3.4 | FE: dùng `@/*` alias thay relative path? | ✅ / ❌ / N/A |
| 3.5 | Không có `dict` thô làm request body (phải Pydantic)? | ✅ / ❌ / N/A |
| 3.6 | Error response dùng đúng format `{"error": {"code": ..., "message": ...}}`? | ✅ / ❌ / N/A |
| 3.7 | HTTP status codes đúng theo `coding-conventions.md §2`? | ✅ / ❌ / N/A |

---

## 4. Security

| # | Câu hỏi | Kết quả |
|---|---------|---------|
| 4.1 | Không có secret/credential nào trong diff? | ✅ / ❌ |
| 4.2 | Không có PII trong log statements mới? | ✅ / ❌ |
| 4.3 | SD-1 mock JWT comments giữ nguyên (không xóa TODO)? | ✅ / ❌ |
| 4.4 | Input mới được validate bằng Pydantic / TypeScript types? | ✅ / ❌ |
| 4.5 | CORS policy không bị thay đổi mà không có lý do? | ✅ / ❌ |

---

## 5. Tests

| # | Câu hỏi | Kết quả |
|---|---------|---------|
| 5.1 | Tests được viết cho business logic mới? | ✅ / ❌ / N/A |
| 5.2 | Tests KHÔNG mock DB (dùng in-memory SQLite)? | ✅ / ❌ / N/A |
| 5.3 | Test names theo convention `test_<scenario>_<condition>_<result>`? | ✅ / ❌ / N/A |
| 5.4 | E2E tests bao phủ happy path của mỗi AC? | ✅ / ❌ / SKIP |

---

## 6. Quality Gates (Phải pass trước merge)

| Gate | Kết quả |
|------|---------|
| `ruff check .` | ✅ / ❌ |
| `black --check .` | ✅ / ❌ |
| `pytest tests/ -q` | ✅ / ❌ |
| `tsc --noEmit` | ✅ / ❌ |
| `npm run lint` | ✅ / ❌ |
| `npm run build` | ✅ / ❌ |

---

## 7. Kết luận

**Số mục ❌:** {{N}}

**Comments trên PR:** {{đã comment / không cần}}

**Quyết định:**
- [ ] ✅ **APPROVE** — sẵn sàng merge
- [ ] 🔄 **REQUEST CHANGES** — cần fix {{N}} mục
- [ ] 💬 **COMMENT** — có câu hỏi, không block merge
