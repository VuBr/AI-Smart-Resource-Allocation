# Maintenance Log — AI Smart Resource Allocation

Ghi lại các lần kiểm tra định kỳ và cập nhật rules / architecture / standards.

---

## 2026-04-03 — Phase 9 Inspection (RA-001)

**Trigger:** Hoàn thành Phase 5–8 của RA-001; kiểm tra trước khi bắt đầu phase tiếp theo.
**Người thực hiện:** Claude Code (automated)
**Reviewer:** —

### Phạm vi kiểm tra

| File | Kết quả |
|------|---------|
| `.claude/CLAUDE.md` | ✅ OK — không thay đổi |
| `.claude/rules/00-safety.md` | ✅ OK — không thay đổi |
| `.claude/rules/01-implementation-conventions.md` | ⚠️ Outdated → đã cập nhật |
| `docs/architecture/system-overview.md` | ⚠️ 2 lỗi nhỏ → đã sửa |
| `docs/architecture/domain-model.md` | ✅ OK — không thay đổi |
| `docs/standards/coding-conventions.md` | ⚠️ 4 lỗi → đã sửa |

### Findings và thay đổi đã thực hiện

#### F-01 / F-02 / F-03 — `01-implementation-conventions.md` rewrite
- **Vấn đề:** Toàn bộ file là Phase 5-specific (task order TASK-001→TASK-060, stub rules, dashboard mock hardcode). Phase 5 đã complete (20/20 AC). Nếu giữ nguyên, AI sẽ tiếp tục skip LLM calls và enforce Phase 5 task order trong Phase 3+.
- **Thay đổi:** Xóa ~60% content phase-specific. Giữ lại: Mock JWT warning (SD-1 chưa resolve), bench threshold rule (OI-14), scope discipline, plan-before-edit, quality gates. Bổ sung: Python 3.11 version note, Node.js 20 note.

#### F-04 — `system-overview.md §12` port note
- **Vấn đề:** PostgreSQL port ghi là 5432. Thực tế host port là 5433 (RT-01 — port 5432 bị chiếm).
- **Thay đổi:** Cập nhật bảng ports thành 2 cột (container / host), thêm ghi chú kết nối từ host.

#### F-05 — `system-overview.md §2` Node.js version
- **Vấn đề:** Node.js version không được ghi. Đã upgrade từ 18 → 20 (RT-02) vì Next.js 15 yêu cầu ≥20.9.0.
- **Thay đổi:** Thêm "Node.js ≥ 20.9.0" vào Frontend tech stack.

#### F-06 — `coding-conventions.md §8` Prettier
- **Vấn đề:** Quality Gates ghi `prettier --check .` nhưng Prettier không có trong project (self-review §11.3: "Not in stack").
- **Thay đổi:** Xóa Prettier khỏi Quality Gates. Thêm `next build` gate (đã verify pass). Xóa mypy (không trong stack).

#### F-07 — `coding-conventions.md §7` E2E tool
- **Vấn đề:** E2E tool ghi "Docker Compose + manual/script". Phase 6 đã add Playwright.
- **Thay đổi:** Cập nhật thành "Playwright (Chromium)", location `apps/web/e2e/`.

#### F-08 — `coding-conventions.md §5` Python compat
- **Vấn đề:** Ghi "dùng `Optional[T]` thay vì `T | None` để tương thích Python 3.9+". Python confirmed là 3.11.
- **Thay đổi:** Cập nhật — cả hai syntax đều acceptable, không ép buộc.

#### F-09 — `coding-conventions.md §4` log field có PII risk
- **Vấn đề:** `csv_import_started` ghi field `filename` — có thể chứa PII path hoặc người dùng thật. Thực tế impl (test-data.md §6.3) dùng `entity_type, file_size_bytes`.
- **Thay đổi:** Sửa fields thành `entity_type`, `file_size_bytes`.

### Files không thay đổi và lý do

| File | Lý do không thay đổi |
|------|---------------------|
| `CLAUDE.md` | Vẫn chính xác và đầy đủ |
| `00-safety.md` | Vẫn chính xác, không có tech-specific info |
| `domain-model.md` | Schema khớp với migration `25da2f2f3ac7` (6 tables, 5 FK, 9 indexes) |

### Security Debt còn open

| ID | Mô tả | Deadline |
|----|-------|---------|
| SD-1 | Mock JWT chưa upgrade | Trước khi deploy bất kỳ môi trường nào ngoài localhost |
| SD-2 | LLM stub | Phase 3+ |
| SD-3 | CSV in-memory, không có virus scan | Phase 3+ |

---

*Lần kiểm tra tiếp theo: trước khi bắt đầu Phase 2 spec hoặc sau khi merge develop → main.*
