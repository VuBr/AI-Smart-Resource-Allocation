# Spec Pack — {{TICKET_ID}}: {{Tên Tính Năng}}

> **Hướng dẫn:** Điền vào tất cả `{{...}}`. Xóa phần này trước khi commit.
> Đặt file tại `docs/changes/{{TICKET_ID}}/spec-pack.md`.
> Không bắt đầu implementation cho đến khi file này được approve.

**Trạng thái:** DRAFT | IN REVIEW | APPROVED
**Tác giả:** {{tên hoặc alias}}
**Ngày tạo:** {{YYYY-MM-DD}}
**Cập nhật lần cuối:** {{YYYY-MM-DD}}
**Branch:** {{tên branch}}

---

## 1. Bối cảnh & Mục tiêu

{{Mô tả ngắn gọn tại sao tính năng này cần làm. Tránh mô tả "cái gì" — tập trung vào "tại sao".}}

**Ví dụ pre-filled (RA-002):**
> Trang login hiện tại (`apps/web/app/login/page.tsx`) chỉ là scaffold đơn giản từ Phase 5.
> RA-002 sẽ replace UI bằng template đã được thiết kế (`template/login.html`)
> để cải thiện trải nghiệm người dùng và thể hiện brand ResourceAI đúng cách.

---

## 2. Acceptance Criteria (AC)

> Mỗi AC phải testable — có thể viết E2E test từ AC này.

| AC# | Mô tả | Loại test |
|-----|-------|----------|
| AC-1 | {{Trang /login hiển thị 2-panel layout trên desktop ≥1024px}} | E2E |
| AC-2 | {{Left panel hiển thị brand, stats, feature list}} | E2E |
| AC-3 | {{Form login gồm email, password với toggle visibility, remember me}} | E2E |
| AC-4 | {{Login thành công → redirect về /dashboard}} | E2E |
| AC-5 | {{Login thất bại → hiện error alert có thể dismiss}} | E2E |
| AC-N | {{...}} | {{UT/IT/E2E}} |

---

## 3. Phạm vi (Scope)

### Trong scope
- {{Danh sách tính năng/thay đổi cụ thể}}
- Ví dụ: Refactor `apps/web/app/login/page.tsx` theo template HTML
- Ví dụ: Tách thành components `BrandPanel`, `LoginForm`, `ErrorAlert`

### Ngoài scope (Out of Scope)
- {{Những gì KHÔNG làm trong ticket này}}
- Ví dụ: Không implement real JWT (SD-1 vẫn open)
- Ví dụ: Không thay đổi backend auth endpoints

---

## 4. Thiết kế Kỹ thuật (Technical Design)

### 4.1 Files tạo mới
| File | Mục đích |
|------|---------|
| `{{path/to/NewComponent.tsx}}` | {{mục đích}} |

### 4.2 Files thay đổi
| File | Thay đổi |
|------|---------|
| `{{path/to/existing.tsx}}` | {{mô tả thay đổi}} |

### 4.3 Không thay đổi
| File | Lý do giữ nguyên |
|------|----------------|
| `{{path/to/file.py}}` | {{lý do}} |

### 4.4 Phụ thuộc & Ràng buộc
- {{Liệt kê dependencies (packages, services, other tickets)}}
- Ví dụ: Phụ thuộc vào `lucide-react` đã có trong `package.json`
- Ví dụ: Phụ thuộc vào UI components `Button`, `Input`, `Label` trong `components/ui/`

---

## 5. Open Issues (OI)

> Điểm mơ hồ phải được tách thành OI — không tự suy đoán.

| OI# | Mô tả | Trạng thái | Quyết định |
|-----|-------|-----------|-----------|
| OI-01 | {{Điểm chưa rõ}} | OPEN / DECIDED | {{Quyết định nếu DECIDED}} |

---

## 6. Security Checklist

- [ ] Không có secret/PII trong code mới
- [ ] Không bypass SD-1 (mock JWT) mà không có upgrade plan
- [ ] Input validation đủ (Pydantic cho BE, type-safe cho FE)
- [ ] Không mở rộng CORS policy

---

## 7. Definition of Done

- [ ] Tất cả AC pass (E2E hoặc UT/IT tương ứng)
- [ ] Tất cả quality gates pass (`ruff`, `black`, `pytest`, `tsc`, `eslint`, `next build`)
- [ ] Self-review hoàn thành (xem `docs/standards/templates/self-review.template.md`)
- [ ] Impl plan có checkpoints được đánh dấu hoàn thành
- [ ] Không có regression trên các routes hiện có
