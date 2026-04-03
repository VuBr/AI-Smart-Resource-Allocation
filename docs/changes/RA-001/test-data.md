# Test Data — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** 2.0 (Phase 7 — mở rộng đầy đủ)
**Ngày tạo:** 2026-03-25
**Ngày cập nhật:** 2026-04-03

---

## Mục lục

1. [Seed Data (Precondition bắt buộc)](#1-seed-data)
2. [CSV Test Files](#2-csv-test-files)
3. [Test User Credentials](#3-test-user-credentials)
4. [Edge Case Input Data](#4-edge-case-input-data)
5. [Expected Results](#5-expected-results)
6. [Log Event Payloads Mẫu](#6-log-event-payloads)
7. [Permission / Role Data](#7-permission--role-data)
8. [Checklist Chuẩn bị Test Data](#8-checklist)

---

## 1. Seed Data (Precondition bắt buộc — AC-11) {#1-seed-data}

Seed script: `apps/api/scripts/seed.py`
**Ngày tham chiếu:** `today = 2026-04-03`

### 1.1 Engineers (5 records)

| ID Alias | UUID | name | email | primary_skill | secondary_skills | level | availability_% | bench_start_date | location |
|----------|------|------|-------|--------------|-----------------|-------|----------------|-----------------|---------|
| E001 | `11111111-1111-1111-1111-111111111111` | Nguyen Van An | vanan@example.com | Backend | ["Python","FastAPI"] | senior | 0 | **2026-05-03** (today+30) | Hanoi |
| E002 | `22222222-2222-2222-2222-222222222222` | Tran Thi Bich | thibich@example.com | Frontend | ["React","TypeScript"] | mid | 80 | null | Ho Chi Minh City |
| E003 | `33333333-3333-3333-3333-333333333333` | Le Van Cuong | vancuong@example.com | Fullstack | ["Python","React"] | senior | 50 | null | Hanoi |
| E004 | `44444444-4444-4444-4444-444444444444` | Pham Thi Dung | thidung@example.com | Backend | ["Java"] | junior | 0 | **2026-03-24** (today-10) | Da Nang |
| E005 | `55555555-5555-5555-5555-555555555555` | Hoang Van Em | vanem@example.com | Data | ["Python","SQL","Pandas"] | mid | 100 | null | Hanoi |

**Ghi chú quan trọng về bench alerts:**

| Engineer | bench_start_date | Ngày tính từ today (2026-04-03) | Xuất hiện trong /bench/alerts? |
|----------|-----------------|--------------------------------|-------------------------------|
| E001 | 2026-05-03 | +30 ngày (= threshold) | **YES** (BV-BENCH-1) |
| E004 | 2026-03-24 | -10 ngày (đã bench rồi) | **YES** (BV-BENCH-3) |
| E002 | null | N/A | NO |
| E003 | null | N/A | NO |
| E005 | null | N/A | NO |

**Seed code mẫu:**
```python
from datetime import date, timedelta

today = date.today()

engineers = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Nguyen Van An",
        "email": "vanan@example.com",
        "primary_skill": "Backend",
        "secondary_skills": ["Python", "FastAPI"],
        "level": "senior",
        "availability_percentage": 0,
        "bench_start_date": today + timedelta(days=30),
        "location": "Hanoi",
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Tran Thi Bich",
        "email": "thibich@example.com",
        "primary_skill": "Frontend",
        "secondary_skills": ["React", "TypeScript"],
        "level": "mid",
        "availability_percentage": 80,
        "bench_start_date": None,
        "location": "Ho Chi Minh City",
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "Le Van Cuong",
        "email": "vancuong@example.com",
        "primary_skill": "Fullstack",
        "secondary_skills": ["Python", "React"],
        "level": "senior",
        "availability_percentage": 50,
        "bench_start_date": None,
        "location": "Hanoi",
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "name": "Pham Thi Dung",
        "email": "thidung@example.com",
        "primary_skill": "Backend",
        "secondary_skills": ["Java"],
        "level": "junior",
        "availability_percentage": 0,
        "bench_start_date": today - timedelta(days=10),
        "location": "Da Nang",
    },
    {
        "id": "55555555-5555-5555-5555-555555555555",
        "name": "Hoang Van Em",
        "email": "vanem@example.com",
        "primary_skill": "Data",
        "secondary_skills": ["Python", "SQL", "Pandas"],
        "level": "mid",
        "availability_percentage": 100,
        "bench_start_date": None,
        "location": "Hanoi",
    },
]
```

---

### 1.2 Projects (3 records)

| ID Alias | UUID | name | required_skills | required_level | start_date | end_date | slots | status |
|----------|------|------|----------------|---------------|-----------|---------|-------|--------|
| P001 | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | Resource Tracker | ["Backend","Python"] | mid | 2026-04-03 | 2026-07-02 (+90d) | 2 | active |
| P002 | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | Analytics Dashboard | ["Data","Python","SQL"] | senior | 2026-05-03 (+30d) | 2026-10-01 (+180d) | 1 | planned |
| P003 | `cccccccc-cccc-cccc-cccc-cccccccccccc` | Legacy Migration | ["Backend","Java"] | senior | 2026-02-02 (-60d) | 2026-04-02 (-1d) | 1 | closed |

**Mục đích từng project:**
- **P001 (active):** Dùng cho allocation flow tests (BV-ALLOC-1, AC-13-NC-1)
- **P002 (planned):** Dùng để test bench prediction relevance
- **P003 (closed):** Dùng để test filter/status display; A003 là completed allocation

---

### 1.3 Allocations (3 records)

| ID Alias | UUID | engineer_id | project_id | allocation_% | start_date | end_date | status |
|----------|------|------------|-----------|-------------|-----------|---------|--------|
| A001 | `a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1` | E002 | P001 | 80 | 2026-04-03 | 2026-07-02 | active |
| A002 | `a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2` | E003 | P001 | 50 | 2026-04-03 | 2026-07-02 | active |
| A003 | `a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3` | E005 | P003 | 100 | 2026-02-02 | 2026-04-02 | completed |

**Ghi chú:**
- E002: 80% allocated → chỉ còn 20% free → test BV-ALLOC-2 (thêm 30% → 110% → 400)
- E003: 50% allocated → có thể nhận thêm tối đa 50%
- E005: completed allocation → free 100% → test BV-ALLOC-1

---

## 2. CSV Test Files {#2-csv-test-files}

### 2.1 Valid Engineers CSV — dùng cho AC-12-NC-1

**File:** `tests/fixtures/valid-engineers.csv`
**Size:** ~250 bytes

```csv
name,email,primary_skill,secondary_skills,level,availability_percentage,location
Test Engineer Alpha,alpha@test.com,Backend,"Python,FastAPI",senior,100,Hanoi
Test Engineer Beta,beta@test.com,Frontend,"React,TypeScript",mid,80,HCM
```

---

### 2.2 Valid Projects CSV — dùng cho AC-12-NC-2

**File:** `tests/fixtures/valid-projects.csv`
**Size:** ~200 bytes

```csv
name,description,required_skills,required_level,start_date,end_date,allocation_slots,status
Test Project Alpha,A test project,"Backend,Python",mid,2026-04-01,2026-12-31,2,planned
```

---

### 2.3 File chính xác 10MB — dùng cho AC-20-BV-1

**File:** `tests/fixtures/exactly-10mb.csv`
**Size:** 10,485,760 bytes chính xác

**Cách tạo (Python):**
```python
import os

target_size = 10 * 1024 * 1024  # = 10,485,760 bytes
header = b"name,email,primary_skill,level,availability_percentage\n"
row = b"Test Engineer,test@example.com,Backend,mid,100\n"

with open("tests/fixtures/exactly-10mb.csv", "wb") as f:
    f.write(header)
    written = len(header)
    while written + len(row) <= target_size:
        f.write(row)
        written += len(row)
    # Pad phần còn lại bằng space để đúng kích thước
    remaining = target_size - written
    if remaining > 0:
        f.write(b" " * remaining)

assert os.path.getsize("tests/fixtures/exactly-10mb.csv") == 10_485_760
```

> **Lưu ý:** File này không phải CSV hoàn toàn hợp lệ về nội dung, nhưng test chỉ kiểm tra size validation trước khi parse.

---

### 2.4 File 10MB + 1 byte — dùng cho AC-20-BV-2, AC-20-AB-1

**File:** `tests/fixtures/oversized-10mb-plus-1.csv`
**Size:** 10,485,761 bytes

**Cách tạo (Python):**
```python
target_size = 10 * 1024 * 1024 + 1  # = 10,485,761 bytes

with open("tests/fixtures/oversized-10mb-plus-1.csv", "wb") as f:
    f.write(b"name\n")
    written = 5
    f.write(b"x" * (target_size - written))

assert os.path.getsize("tests/fixtures/oversized-10mb-plus-1.csv") == 10_485_761
```

---

### 2.5 File 11MB — dùng cho AC-20-AB-1

**File:** `tests/fixtures/oversized-11mb.csv`
**Size:** 11,534,336 bytes (= 11MB)

**Cách tạo (Python):**
```python
target_size = 11 * 1024 * 1024  # = 11,534,336 bytes

with open("tests/fixtures/oversized-11mb.csv", "wb") as f:
    f.write(b"name\n" + b"x" * (target_size - 5))
```

---

### 2.6 File ~9.99MB — dùng cho AC-20-BV-3

**File:** `tests/fixtures/just-under-10mb.csv`
**Size:** 10,475,520 bytes (~9.99MB)

```python
target_size = 10 * 1024 * 1024 - 10240  # 10MB - 10KB = ~9.99MB

with open("tests/fixtures/just-under-10mb.csv", "wb") as f:
    f.write(b"name\n" + b"x" * (target_size - 5))
```

---

### 2.7 Non-CSV file (MIME type sai) — dùng cho AC-12-AB-2

**File:** `tests/fixtures/not-a-csv.txt`
**Content:** Bất kỳ text hợp lệ
**MIME type khi upload:** `text/plain`

```
This is not a CSV file.
It should be rejected by the upload endpoint.
```

---

## 3. Test User Credentials {#3-test-user-credentials}

Phase 5 dùng **Mock JWT** — bất kỳ credentials nào với format hợp lệ đều được chấp nhận.

### 3.1 Valid Credentials (expected: 200 + mock token)

| Email | Password | Ghi chú |
|-------|---------|---------|
| `admin@example.com` | `password123` | Simulated admin user |
| `manager@example.com` | `password123` | Simulated manager user |
| `viewer@example.com` | `password123` | Simulated viewer user |
| `any@valid.format.com` | `anything` | Mock accepts any valid format |
| `test@test.com` | `12345678` | Minimal valid credentials |

### 3.2 Malformed Credentials (expected: 422)

| Input | Lý do | Expected |
|-------|-------|---------|
| `{"email":"user@test.com"}` | Thiếu field `password` | 422 |
| `{}` | Thiếu cả hai fields | 422 |
| `"not-json-string"` | Không phải JSON object | 422 |
| Body rỗng | Không có body | 422 |
| `{"wrong_field":"value"}` | Fields sai tên | 422 |

### 3.3 Mock Token Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXIiLCJyb2xlIjoibWFuYWdlciJ9.MOCK_SIGNATURE",
  "token_type": "bearer",
  "role": "manager"
}
```

> **Lưu ý:** Đây là mock token. Trong Phase 5 scaffold, tất cả credentials đều trả về cùng token này (hoặc tương đương).

---

## 4. Edge Case Input Data {#4-edge-case-input-data}

### 4.1 Engineer với fields max-length

```json
{
  "name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "email": "maxlength@example.com",
  "primary_skill": "Backend",
  "secondary_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "level": "senior",
  "availability_percentage": 100,
  "location": "Hanoi"
}
```

> `name` = 255 ký tự 'A' (max theo domain model)

### 4.2 Bench Alert Boundary Cases (đầy đủ)

| Case ID | bench_start_date (relative to 2026-04-03) | bench_start_date (absolute) | Days delta | Xuất hiện trong /bench/alerts |
|---------|------------------------------------------|----------------------------|-----------|-------------------------------|
| BENCH-A | today - 10 (đã bench) | 2026-03-24 | -10 | **YES** (E004 seed) |
| BENCH-B | today + 0 (bench ngay hôm nay) | 2026-04-03 | 0 | **YES** |
| BENCH-C | today + 29 | 2026-05-02 | +29 | **YES** |
| BENCH-D | today + 30 (đúng ngưỡng) | 2026-05-03 | +30 | **YES** (E001 seed, BV-BENCH-1) |
| BENCH-E | today + 31 (ngoài ngưỡng) | 2026-05-04 | +31 | **NO** (BV-BENCH-2) |
| BENCH-F | today + 60 | 2026-06-02 | +60 | **NO** |
| BENCH-G | null | — | — | **NO** (E002, E003, E005 seed) |

### 4.3 Allocation Percentage Boundary Cases

| Case | engineer_id | Existing allocation | New allocation_% | Total | Expected |
|------|------------|--------------------|-----------------|----|---------|
| ALLOC-A | E005 | 0% | 100% | 100% | **201 Created** (BV-ALLOC-1) |
| ALLOC-B | E002 | 80% (A001) | 30% | 110% | **400** cap exceeded (BV-ALLOC-2) |
| ALLOC-C | E003 | 50% (A002) | 50% | 100% | **201 Created** (exact 100%) |
| ALLOC-D | E003 | 50% (A002) | 51% | 101% | **400** cap exceeded |
| ALLOC-E | E005 | 0% | 1% | 1% | **201 Created** (minimum, BV-ALLOC-3) |

### 4.4 Allocations/Confirm Request Body (valid)

```json
{
  "engineer_id": "55555555-5555-5555-5555-555555555555",
  "project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "allocation_percentage": 100,
  "start_date": "2026-04-03",
  "end_date": "2026-07-02"
}
```

### 4.5 Allocations/Confirm Request Body (invalid — cap exceeded)

```json
{
  "engineer_id": "22222222-2222-2222-2222-222222222222",
  "project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "allocation_percentage": 30,
  "start_date": "2026-04-03",
  "end_date": "2026-07-02"
}
```

> E002 đã có 80% (A001 active) → 80 + 30 = 110% → expected 400

---

## 5. Expected Results {#5-expected-results}

### 5.1 Expected Response — GET /api/v1/engineers (sau seed)

```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Nguyen Van An",
    "email": "vanan@example.com",
    "primary_skill": "Backend",
    "secondary_skills": ["Python", "FastAPI"],
    "level": "senior",
    "availability_percentage": 0,
    "bench_start_date": "2026-05-03",
    "location": "Hanoi"
  },
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "name": "Tran Thi Bich",
    "email": "thibich@example.com",
    "primary_skill": "Frontend",
    "secondary_skills": ["React", "TypeScript"],
    "level": "mid",
    "availability_percentage": 80,
    "bench_start_date": null,
    "location": "Ho Chi Minh City"
  }
  // ... E003, E004, E005
]
```

**Verification points:**
- `array.length >= 5`
- Mỗi object: `id` là UUID format (8-4-4-4-12 hex)
- `level` thuộc enum `["junior", "mid", "senior"]`
- `availability_percentage` trong [0, 100]

---

### 5.2 Expected Response — GET /api/v1/bench/alerts (sau seed)

```json
[
  {
    "engineer_id": "44444444-4444-4444-4444-444444444444",
    "engineer_name": "Pham Thi Dung",
    "bench_start_date": "2026-03-24",
    "days_until_bench": -10,
    "risk_level": "high"
  },
  {
    "engineer_id": "11111111-1111-1111-1111-111111111111",
    "engineer_name": "Nguyen Van An",
    "bench_start_date": "2026-05-03",
    "days_until_bench": 30,
    "risk_level": "medium"
  }
]
```

**Verification points:**
- Chứa E001 và E004
- KHÔNG chứa E002, E003, E005
- `days_until_bench` có thể âm (đã bench rồi)

---

### 5.3 Expected Response — GET /api/v1/dashboard/stats

```json
{
  "total_engineers": 5,
  "engineers_on_bench": 1,
  "active_projects": 3,
  "allocation_rate_percentage": 80
}
```

> **Ghi chú:** Phase 5 là stub — giá trị mock này được define trong `01-implementation-conventions.md`. Tester chỉ verify schema fields tồn tại và là numbers.

---

### 5.4 Expected Response — POST /api/v1/auth/login (success)

```json
{
  "access_token": "<non-empty-string>",
  "token_type": "bearer",
  "role": "<one-of: admin|manager|viewer>"
}
```

**Verification points:**
- `access_token` không được empty string
- `token_type` = `"bearer"` (lowercase)
- `role` là string hợp lệ

---

### 5.5 Expected Response — GET /api/v1/allocations/active (sau seed)

```json
[
  {
    "id": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    "engineer_id": "22222222-2222-2222-2222-222222222222",
    "engineer_name": "Tran Thi Bich",
    "project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "project_name": "Resource Tracker",
    "allocation_percentage": 80,
    "start_date": "2026-04-03",
    "end_date": "2026-07-02",
    "status": "active"
  },
  {
    "id": "a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2",
    "engineer_id": "33333333-3333-3333-3333-333333333333",
    "engineer_name": "Le Van Cuong",
    "project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "project_name": "Resource Tracker",
    "allocation_percentage": 50,
    "start_date": "2026-04-03",
    "end_date": "2026-07-02",
    "status": "active"
  }
]
```

**Verification points:**
- A003 (completed) KHÔNG xuất hiện trong `/allocations/active`
- `status` = `"active"` với mọi record

---

### 5.6 Expected Error Responses

| Scenario | HTTP | Body |
|----------|------|------|
| Missing auth token | 401 | `{"error":{"code":"unauthorized","message":"..."}}` |
| Invalid token format | 401 | `{"error":{"code":"unauthorized","message":"..."}}` |
| Engineer not found | 404 | `{"error":{"code":"not_found","message":"Engineer not found"}}` |
| Project not found | 404 | `{"error":{"code":"not_found","message":"Project not found"}}` |
| Allocation cap exceeded | 400 | `{"error":{"code":"allocation_cap_exceeded","message":"Engineer total allocation would exceed 100%"}}` |
| CSV file too large | 413 | `{"error":{"code":"file_too_large","message":"CSV file must not exceed 10MB"}}` |
| Invalid CSV format | 400 | `{"error":{"code":"invalid_csv","message":"..."}}` |
| Missing required field | 422 | FastAPI validation error format |

**Invariant:** Tất cả error responses PHẢI có structure `{"error":{"code":"<snake_case>","message":"<string>"}}`.

---

## 6. Log Event Payloads Mẫu {#6-log-event-payloads}

Backend phải emit structured JSON logs cho 8 event categories (AC-15).

### 6.1 request_start

```json
{
  "event": "request_start",
  "timestamp": "2026-04-03T10:00:00.123Z",
  "method": "GET",
  "path": "/api/v1/engineers",
  "request_id": "abc123"
}
```

### 6.2 request_end

```json
{
  "event": "request_end",
  "timestamp": "2026-04-03T10:00:00.456Z",
  "method": "GET",
  "path": "/api/v1/engineers",
  "status": 200,
  "latency_ms": 45,
  "request_id": "abc123"
}
```

### 6.3 csv_import_started

```json
{
  "event": "csv_import_started",
  "timestamp": "2026-04-03T10:01:00.000Z",
  "entity_type": "engineers",
  "file_size_bytes": 512,
  "request_id": "def456"
}
```

> **KHÔNG được chứa:** tên file, nội dung file, email trong file

### 6.4 csv_import_completed

```json
{
  "event": "csv_import_completed",
  "timestamp": "2026-04-03T10:01:00.050Z",
  "entity_type": "engineers",
  "inserted": 0,
  "updated": 0,
  "skipped": 0,
  "error_count": 0,
  "request_id": "def456"
}
```

### 6.5 csv_import_failed

```json
{
  "event": "csv_import_failed",
  "timestamp": "2026-04-03T10:01:00.010Z",
  "entity_type": "engineers",
  "reason": "file_too_large",
  "file_size_bytes": 11534336,
  "request_id": "ghi789"
}
```

### 6.6 allocation_confirmed

```json
{
  "event": "allocation_confirmed",
  "timestamp": "2026-04-03T10:02:00.000Z",
  "allocation_id": "uuid",
  "engineer_id": "uuid",
  "project_id": "uuid",
  "allocation_percentage": 100,
  "request_id": "jkl012"
}
```

> **KHÔNG được chứa:** tên engineer, email engineer

### 6.7 llm_score_computed

```json
{
  "event": "llm_score_computed",
  "timestamp": "2026-04-03T10:03:00.000Z",
  "engineer_id": "uuid",
  "project_id": "uuid",
  "overall_score": 0.85,
  "llm_provider": "stub",
  "model_version": "stub-v0",
  "latency_ms": 12,
  "request_id": "mno345"
}
```

### 6.8 error_event

```json
{
  "event": "error",
  "timestamp": "2026-04-03T10:04:00.000Z",
  "error_code": "not_found",
  "status": 404,
  "path": "/api/v1/engineers/00000000-0000-0000-0000-000000000000",
  "method": "GET",
  "request_id": "pqr678"
}
```

### Kiểm tra PII — Danh sách KHÔNG được có trong logs

Tester kiểm tra log output KHÔNG chứa bất kỳ string nào sau:
- `vanan@example.com`
- `thibich@example.com`
- `vancuong@example.com`
- `thidung@example.com`
- `vanem@example.com`
- `admin@example.com`
- `manager@example.com`
- Bất kỳ chuỗi có dạng `*@*.com` (email pattern)

---

## 7. Permission / Role Data {#7-permission--role-data}

Phase 5 Mock JWT không enforce permissions thật sự. Bảng này là **reference** cho Phase 2+ và để tester document current behavior.

### 7.1 Role Access Matrix

| Route/Endpoint | public | viewer | manager | admin | Phase 5 behavior |
|----------------|--------|--------|---------|-------|-----------------|
| `GET /health` | ✓ | ✓ | ✓ | ✓ | 200 (no auth needed) |
| `POST /auth/login` | ✓ | ✓ | ✓ | ✓ | 200 (mock accepts all) |
| `GET /engineers` | — | ✓ | ✓ | ✓ | 200 (any valid token) |
| `GET /engineers/{id}` | — | ✓ | ✓ | ✓ | 200 / 404 |
| `POST /engineers/upload` | — | — | ✓ | ✓ | 200 (mock, no role check) |
| `GET /projects` | — | ✓ | ✓ | ✓ | 200 |
| `POST /projects/upload` | — | — | ✓ | ✓ | 200 (mock, no role check) |
| `POST /allocations/recommend` | — | — | ✓ | ✓ | 200 (mock, no role check) |
| `POST /allocations/confirm` | — | — | ✓ | ✓ | 201 (mock, no role check) |
| `GET /allocations/active` | — | ✓ | ✓ | ✓ | 200 |
| `GET /bench/forecast` | — | — | ✓ | ✓ | 200 (mock, no role check) |
| `GET /bench/alerts` | — | — | ✓ | ✓ | 200 (mock, no role check) |
| `GET /reports/shortage` | — | — | ✓ | ✓ | 200 (mock, no role check) |
| `GET /dashboard/stats` | — | ✓ | ✓ | ✓ | 200 |

> **Ghi chú:** "Phase 5 behavior" = tất cả authenticated requests đều pass do Mock JWT. Role enforcement là TODO cho Phase 2+.

### 7.2 Frontend Route Access Matrix

| Route | Mô tả | Spec: Allowed Roles | Phase 5: Redirect khi không có token |
|-------|-------|---------------------|-------------------------------------|
| `/login` | Login page | Public | Không redirect |
| `/dashboard` | KPI overview | All roles | YES → `/login` |
| `/engineers` | Engineer list | All roles | YES → `/login` |
| `/engineers/[id]` | Engineer detail | All roles | YES → `/login` |
| `/upload` | CSV upload | Admin, Manager | YES → `/login` |
| `/projects` | Project list | All roles | YES → `/login` |
| `/projects/[id]` | Project detail | All roles | YES → `/login` |
| `/allocation` | Allocation mgmt | Manager, Admin | YES → `/login` |
| `/bench-forecast` | Bench risk list | Manager, Admin | YES → `/login` |
| `/reports` | Shortage reports | Manager, Admin | YES → `/login` |

---

## 8. Checklist Chuẩn bị Test Data {#8-checklist}

Thực hiện trước khi bắt đầu bất kỳ test session nào.

### 8.1 Precondition Data

| # | Hạng mục | Cách verify | Trạng thái |
|---|---------|------------|-----------|
| 1 | `docker compose up` — 4 services healthy | `docker compose ps` → all "healthy" | [ ] |
| 2 | `alembic upgrade head` đã chạy | `alembic current` → "head" | [ ] |
| 3 | Seed script đã chạy (`python apps/api/scripts/seed.py`) | `GET /api/v1/engineers` → 5 records | [ ] |
| 4 | E001 có `bench_start_date = today + 30` | `GET /api/v1/engineers/11111111-...` → bench_start_date = "2026-05-03" | [ ] |
| 5 | E004 có `bench_start_date = today - 10` | `GET /api/v1/engineers/44444444-...` → bench_start_date = "2026-03-24" | [ ] |
| 6 | 3 projects seed loaded | `GET /api/v1/projects` → 3 records | [ ] |
| 7 | 2 active allocations (A001, A002) | `GET /api/v1/allocations/active` → 2 records | [ ] |

### 8.2 CSV Test Files

| # | File | Size | Cách tạo | Trạng thái |
|---|------|------|---------|-----------|
| 8 | `valid-engineers.csv` | ~250 bytes | Manual/fixture | [ ] |
| 9 | `valid-projects.csv` | ~200 bytes | Manual/fixture | [ ] |
| 10 | `exactly-10mb.csv` | 10,485,760 bytes | Python script (Section 2.3) | [ ] |
| 11 | `oversized-10mb-plus-1.csv` | 10,485,761 bytes | Python script (Section 2.4) | [ ] |
| 12 | `oversized-11mb.csv` | 11,534,336 bytes | Python script (Section 2.5) | [ ] |
| 13 | `just-under-10mb.csv` | ~10,475,520 bytes | Python script (Section 2.6) | [ ] |
| 14 | `not-a-csv.txt` | Bất kỳ | Manual | [ ] |

### 8.3 Verification nhanh

```bash
# Verify seed data via API
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health
# Expected: 200

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/engineers | python3 -c "import sys,json; data=json.load(sys.stdin); print(f'Engineers: {len(data)}')"
# Expected: Engineers: 5

curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/bench/alerts | python3 -c "import sys,json; data=json.load(sys.stdin); print(f'Bench alerts: {len(data)}')"
# Expected: Bench alerts: 2 (E001 + E004)
```

---

*End of test-data.md — RA-001 v2.0*
