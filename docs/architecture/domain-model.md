# Domain Model — AI Smart Resource Allocation

**Loại:** Living Document
**Nguồn gốc:** Trích từ `docs/changes/RA-001/Raw/domain-model.md` (authority: #2)
**Cập nhật lần cuối:** Phase 2 — RA-001 (2026-03-25)

---

## 1. Tổng quan Entities

```
Engineer  ──┐
            ├──── n Allocation ────┐
Project   ──┘                     │
                                  │
Engineer  ──── n MatchScore ────── Project
Engineer  ──── n BenchForecast

User (hệ thống xác thực)
```

---

## 2. Engineer

Đại diện cho một kỹ sư phần mềm có thể được phân bổ vào dự án.

| Field | Type | Constraints | Mô tả |
|-------|------|-------------|-------|
| id | UUID | PK, not null | Định danh duy nhất |
| name | string | not null, max 255 | Họ và tên |
| email | string | not null, unique, max 255 | Email liên hệ |
| primary_skill | string | not null, max 100 | Kỹ năng chính |
| secondary_skills | string[] | nullable | Kỹ năng phụ (free text) |
| level | enum | not null | `junior` / `mid` / `senior` |
| availability_percentage | int | not null, 0–100 | % thời gian hiện có |
| bench_start_date | date | nullable | Ngày dự kiến bắt đầu bench |
| location | string | nullable, max 100 | Vị trí địa lý |
| created_at | timestamp | not null, default now() | Thời điểm tạo |
| updated_at | timestamp | not null, default now() | Thời điểm cập nhật |

**Indexes:** `email` (unique), `primary_skill`

---

## 3. Project

Đại diện cho một dự án cần phân bổ kỹ sư.

| Field | Type | Constraints | Mô tả |
|-------|------|-------------|-------|
| id | UUID | PK, not null | Định danh dự án |
| name | string | not null, max 255 | Tên dự án |
| description | text | nullable | Mô tả (dùng cho LLM prompt) |
| required_skills | string[] | not null | Kỹ năng yêu cầu |
| required_level | enum | not null | `junior` / `mid` / `senior` |
| start_date | date | not null | Ngày bắt đầu |
| end_date | date | not null | Ngày kết thúc |
| allocation_slots | int | not null, min 1 | Số lượng kỹ sư cần |
| status | enum | not null, default `planned` | `planned` / `active` / `closed` |
| created_at | timestamp | not null, default now() | Thời điểm tạo |
| updated_at | timestamp | not null, default now() | Thời điểm cập nhật |

---

## 4. Allocation

Đại diện cho việc phân bổ một kỹ sư vào một dự án.

| Field | Type | Constraints | Mô tả |
|-------|------|-------------|-------|
| id | UUID | PK, not null | Định danh phân bổ |
| engineer_id | UUID | FK → engineers.id, not null | Kỹ sư được phân bổ |
| project_id | UUID | FK → projects.id, not null | Dự án đích |
| allocation_percentage | int | not null, 1–100 | % thời gian được phân bổ |
| start_date | date | not null | Ngày bắt đầu phân bổ |
| end_date | date | not null | Ngày kết thúc phân bổ |
| status | enum | not null, default `active` | `active` / `completed` / `cancelled` |
| created_at | timestamp | not null, default now() | Thời điểm tạo |

**Indexes:** `engineer_id`, `project_id`, `status`

---

## 5. MatchScore

Lưu kết quả chấm điểm AI giữa một kỹ sư và một dự án.

| Field | Type | Constraints | Mô tả |
|-------|------|-------------|-------|
| id | UUID | PK, not null | Định danh điểm số |
| engineer_id | UUID | FK → engineers.id, not null | Kỹ sư được chấm |
| project_id | UUID | FK → projects.id, not null | Dự án được chấm |
| skill_match_score | float | not null, 0.0–1.0 | Điểm tương thích kỹ năng |
| level_match_score | float | not null, 0.0–1.0 | Điểm tương thích cấp độ |
| availability_score | float | not null, 0.0–1.0 | Điểm sẵn sàng |
| overall_score | float | not null, 0.0–1.0 | Điểm tổng hợp |
| explanation | text | nullable | Giải thích từ LLM |
| risk_notes | text | nullable | Ghi chú rủi ro từ LLM |
| llm_provider | string | nullable, max 50 | Provider dùng (openai/anthropic) |
| model_version | string | nullable, max 100 | Model ID dùng để chấm |
| created_at | timestamp | not null, default now() | Thời điểm tạo |

**Indexes:** `engineer_id + project_id` (composite)

---

## 6. BenchForecast

Lưu dự báo rủi ro bench cho một kỹ sư.

| Field | Type | Constraints | Mô tả |
|-------|------|-------------|-------|
| id | UUID | PK, not null | Định danh dự báo |
| engineer_id | UUID | FK → engineers.id, not null | Kỹ sư được dự báo |
| forecast_date | date | not null | Ngày tạo dự báo |
| risk_level | enum | not null | `low` / `medium` / `high` |
| probability | float | not null, 0.0–1.0 | Xác suất bench |
| recommendation | text | nullable | Hành động đề xuất cho manager |
| created_at | timestamp | not null, default now() | Thời điểm tạo |

**Indexes:** `engineer_id`, `forecast_date`

---

## 7. User

Đại diện cho người dùng hệ thống.

| Field | Type | Constraints | Mô tả |
|-------|------|-------------|-------|
| id | UUID | PK, not null | Định danh người dùng |
| email | string | not null, unique, max 255 | Email đăng nhập |
| password_hash | string | not null | Mật khẩu đã hash |
| role | enum | not null | `admin` / `manager` / `viewer` |
| created_at | timestamp | not null, default now() | Thời điểm tạo |

---

## 8. Domain Constraints

| Constraint | Quy tắc |
|-----------|---------|
| Allocation cap | Tổng `allocation_percentage` các allocation active của một engineer ≤ 100 |
| Allocation date bounds | `start_date` và `end_date` của allocation phải nằm trong khoảng ngày của project |
| Score range | Tất cả score fields trong MatchScore phải trong [0.0, 1.0] |
| Availability range | `availability_percentage` phải trong [0, 100] |
| Bench forecast trigger | BenchForecast được tạo khi `bench_start_date` trong vòng `BENCH_ALERT_DAYS_THRESHOLD` ngày (default: **30 ngày** — OI-14 DECIDED) |
| Role values | User role phải là: `admin`, `manager`, hoặc `viewer` |
| Project level | `required_level` phải là: `junior`, `mid`, hoặc `senior` |
| Engineer level | `level` phải là: `junior`, `mid`, hoặc `senior` |

---

## 9. Future Model Extensions

Các entity có thể bổ sung trong phase sau:
- `Skill` — normalized skill taxonomy
- `AllocationHistory` — audit log thay đổi allocation
- `LLMPromptLog` — log prompt/response cho audit
- `ProjectDemandForecast` — dự báo nhu cầu staffing tương lai
- `Organization` — multi-tenant support
