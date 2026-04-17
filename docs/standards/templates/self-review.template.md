# Self-Review — {{TICKET_ID}}: {{Tên Tính Năng}}

> **Hướng dẫn:** Hoàn thành trước khi tạo PR. Đặt tại `docs/changes/{{TICKET_ID}}/self-review.md`.
> Mọi mục ❌ phải được giải quyết hoặc ghi nhận là accepted risk.

**Ticket:** {{TICKET_ID}}
**Reviewer (self):** {{tên / alias}}
**Ngày review:** {{YYYY-MM-DD}}
**Commit / Branch:** {{branch name hoặc commit hash}}

---

## 1. Scope — Đúng Phạm vi?

| Câu hỏi | Kết quả |
|---------|---------|
| Tất cả AC trong spec-pack đã được implement? | ✅ / ❌ |
| Không có file nào bị thay đổi ngoài danh sách trong impl-plan? | ✅ / ❌ |
| Không có "nice to have" nào được thêm vào? | ✅ / ❌ |
| Mọi Open Issue (OI) hoặc đã được decide hoặc vẫn là OI (không tự suy đoán)? | ✅ / ❌ |

---

## 2. Quality Gates

| Gate | Command | Kết quả |
|------|---------|---------|
| Backend lint | `ruff check .` | ✅ 0 errors / ❌ {{N errors}} |
| Backend format | `black --check .` | ✅ 0 diffs / ❌ {{N diffs}} |
| Backend tests | `pytest tests/ -q` | ✅ All pass / ❌ {{N failed}} |
| Frontend typecheck | `tsc --noEmit` | ✅ 0 errors / ❌ {{N errors}} |
| Frontend lint | `npm run lint` | ✅ 0 errors / ❌ {{N errors}} |
| Frontend build | `npm run build` | ✅ OK / ❌ {{error}} |

---

## 3. Code Quality

| Câu hỏi | Kết quả | Ghi chú |
|---------|---------|---------|
| Naming conventions tuân thủ `docs/standards/coding-conventions.md`? | ✅ / ❌ | |
| Tất cả BE public functions có type hints? | ✅ / ❌ / N/A | |
| Không có `dict` thô nhận từ request (phải dùng Pydantic)? | ✅ / ❌ / N/A | |
| "use client" được thêm đúng chỗ (FE components có state/effect)? | ✅ / ❌ / N/A | |
| Import dùng `@/*` alias thay vì relative path? | ✅ / ❌ / N/A | |
| Không có magic numbers / hardcoded configs (dùng env vars)? | ✅ / ❌ | |

---

## 4. Security

| Câu hỏi | Kết quả |
|---------|---------|
| Không có secret/key/token nào trong diff? | ✅ / ❌ |
| Không có PII trong log statements mới? | ✅ / ❌ |
| Security Debt SD-1 không bị xóa hay bypass? | ✅ / ❌ |
| Endpoint mới có auth check nếu yêu cầu? | ✅ / ❌ / N/A |
| CORS policy không bị nới lỏng? | ✅ / ❌ / N/A |

---

## 5. Tests

| Câu hỏi | Kết quả | Ghi chú |
|---------|---------|---------|
| Có test cho logic nghiệp vụ mới (nếu có)? | ✅ / ❌ / N/A | |
| Test dùng in-memory SQLite (không mock repository)? | ✅ / ❌ / N/A | |
| Test names tuân thủ convention? | ✅ / ❌ / N/A | |
| E2E tests pass với `docker compose up`? | ✅ / ❌ / SKIP | |

---

## 6. Documentation

| Câu hỏi | Kết quả |
|---------|---------|
| `docs/changes/{{TICKET_ID}}/` có đủ deliverables? | ✅ / ❌ |
| Impl-plan CPs đã được cập nhật trạng thái? | ✅ / ❌ |
| Living docs (`system-overview.md`, v.v.) được update nếu kiến trúc thay đổi? | ✅ / ❌ / N/A |

---

## 7. Tóm tắt

**Tổng số mục ❌:** {{N}}

**Accepted risks (nếu có):**
- {{Mục ❌ được chấp nhận và lý do}}

**Sẵn sàng tạo PR:** ✅ CÓ / ❌ CHƯA (còn {{N}} mục cần fix)
