# Test Data — RA-001

**Ticket:** RA-001 — AI Smart Resource Allocation & Bench Prediction System
**Phiên bản:** Draft 1.0 (Phase 2)
**Ngày:** 2026-03-25

---

## 1. Seed Data (Bắt buộc — AC-11)

Seed script: `apps/api/scripts/seed.py`

### 1.1 Engineers (5 records)

| ID | name | email | primary_skill | secondary_skills | level | availability_percentage | bench_start_date | location |
|----|------|-------|--------------|-----------------|-------|------------------------|-----------------|---------|
| E001 | Nguyen Van An | vanan@example.com | Backend | ["Python","FastAPI"] | senior | 0 | **today + 30 days** | Hanoi |
| E002 | Tran Thi Bich | thibich@example.com | Frontend | ["React","TypeScript"] | mid | 80 | null | Ho Chi Minh City |
| E003 | Le Van Cuong | vancuong@example.com | Fullstack | ["Python","React"] | senior | 50 | null | Hanoi |
| E004 | Pham Thi Dung | thidung@example.com | Backend | ["Java"] | junior | 0 | **today - 10 days** | Da Nang |
| E005 | Hoang Van Em | vanem@example.com | Data | ["Python","SQL","Pandas"] | mid | 100 | null | Hanoi |

**Ghi chú quan trọng:**
- **E001**: `bench_start_date = today + 30 days` → phải xuất hiện trong `/bench/alerts` (boundary test BV-2)
- **E004**: `bench_start_date = today - 10 days` → đang trên bench, phải xuất hiện trong `/bench/alerts`
- **E002, E003, E005**: không có bench alert
- Đa dạng: 2 senior, 2 mid, 1 junior; 3 backend, 1 frontend, 1 fullstack, 1 data

**Seed code example:**
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
    # ... E002, E003, E004, E005
]
```

---

### 1.2 Projects (3 records)

| ID | name | required_skills | required_level | start_date | end_date | allocation_slots | status |
|----|------|----------------|---------------|-----------|---------|-----------------|--------|
| P001 | Resource Tracker | ["Backend","Python"] | mid | today | today + 90d | 2 | active |
| P002 | Analytics Dashboard | ["Data","Python","SQL"] | senior | today + 30d | today + 180d | 1 | planned |
| P003 | Legacy Migration | ["Backend","Java"] | senior | today - 60d | today - 1d | 1 | closed |

**Ghi chú:**
- P001 (active): dùng để test allocation flow
- P002 (planned): dùng để test bench prediction relevance
- P003 (closed): test filter/status display

---

### 1.3 Allocations (3 records)

| ID | engineer_id | project_id | allocation_percentage | start_date | end_date | status |
|----|------------|-----------|----------------------|-----------|---------|--------|
| A001 | E002 | P001 | 80 | today | today + 90d | active |
| A002 | E003 | P001 | 50 | today | today + 90d | active |
| A003 | E005 | P003 | 100 | today - 60d | today - 1d | completed |

**Ghi chú:**
- E002 có 80% allocation → availability_percentage = 80 (khớp)
- E003 có 50% allocation → availability_percentage = 50 (khớp)
- E005 hoàn thành project P003

---

## 2. CSV Test Files

### 2.1 Valid Engineers CSV (dùng cho NC-1, AC-12)

**File:** `test-data/valid-engineers.csv` (tạo khi chạy tests)
**Size:** ~ 500 bytes
**Content:**
```csv
name,email,primary_skill,secondary_skills,level,availability_percentage,location
Test Engineer 1,test1@example.com,Backend,"Python,FastAPI",senior,100,Hanoi
Test Engineer 2,test2@example.com,Frontend,"React,TypeScript",mid,80,HCM
```

---

### 2.2 Valid Projects CSV

**File:** `test-data/valid-projects.csv`
**Size:** ~ 300 bytes
**Content:**
```csv
name,description,required_skills,required_level,start_date,end_date,allocation_slots,status
Test Project,A test project,"Backend,Python",mid,2026-04-01,2026-12-31,2,planned
```

---

### 2.3 Large CSV File — Exactly 10MB (dùng cho BV-1)

**Cách tạo:**

**Python:**
```python
import os

target_size = 10 * 1024 * 1024  # 10MB exactly
header = "name,email,primary_skill,level,availability_percentage\n"
row = "Test Engineer,test@example.com,Backend,mid,100\n"

with open("test-data/exactly-10mb.csv", "w") as f:
    f.write(header)
    written = len(header.encode('utf-8'))
    while written < target_size:
        remaining = target_size - written
        if len(row.encode('utf-8')) <= remaining:
            f.write(row)
            written += len(row.encode('utf-8'))
        else:
            # pad với spaces để đúng kích thước
            f.write(" " * remaining)
            break
```

**Bash:**
```bash
# Tạo file padding đúng 10MB
dd if=/dev/zero bs=1 count=$((10*1024*1024)) | tr '\0' 'x' > test-data/exactly-10mb.csv
```

> **Lưu ý:** File này không phải CSV hợp lệ về nội dung, nhưng test chỉ kiểm tra size validation, không phải nội dung.

---

### 2.4 Large CSV File — 10MB + 1 byte (dùng cho AB-1, TC-AC20)

**Cách tạo:**

**Python:**
```python
target_size = 10 * 1024 * 1024 + 1  # 10MB + 1 byte

with open("test-data/oversized.csv", "w") as f:
    f.write("name\n")
    written = len("name\n".encode('utf-8'))
    pad = "x" * (target_size - written)
    f.write(pad)
```

---

### 2.5 Non-CSV File (dùng test MIME validation)

**File:** `test-data/test.txt` với content bất kỳ và MIME type `text/plain`

**Expected khi upload:** HTTP 400 hoặc 422 (không phải 200)

---

## 3. Test User Credentials (Mock JWT)

Vì Phase 5 dùng Mock JWT, bất kỳ credentials nào với format hợp lệ đều pass:

| Email | Password | Expected Response |
|-------|---------|-----------------|
| `admin@example.com` | `password123` | 200, mock token |
| `user@test.com` | `anypassword` | 200, mock token |
| `any@valid.format.com` | `anything` | 200, mock token |

**Malformed (expected 422):**
- Body là empty string `""`
- Body là `{"wrong_field": "value"}` (thiếu email/password)
- Body không phải JSON

---

## 4. Edge Case Data

### 4.1 Engineer với tất cả fields tối đa

```json
{
  "name": "A".repeat(255),
  "email": "maxlength_email_address_for_testing@example.com",
  "primary_skill": "B".repeat(100),
  "secondary_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "level": "senior",
  "availability_percentage": 100,
  "location": "C".repeat(100)
}
```

### 4.2 Engineer bench alert boundary cases

| Case | bench_start_date | Expected in /bench/alerts |
|------|-----------------|--------------------------|
| Đang bench (quá khứ) | today - 10 days | YES (E004) |
| Đúng ngưỡng | today + 30 days | YES (E001) |
| Ngoài ngưỡng 1 ngày | today + 31 days | NO |
| null | null | NO |

### 4.3 Allocation boundary

| Case | Allocation % | Expected |
|------|-------------|---------|
| Tổng = 100% | 60% + 40% | OK (201) |
| Tổng > 100% | 60% + 50% | 400 (allocation cap exceeded) |
| = 1% | 1% | OK (minimum) |
| = 100% đơn | 100% | OK |

---

## 5. Checklist Chuẩn bị Test Data

| # | Hạng mục | Trạng thái |
|---|---------|-----------|
| 1 | Seed script tạo đủ 5 engineers | [ ] |
| 2 | E001 có bench_start_date = today + 30 | [ ] |
| 3 | E004 có bench_start_date = today - 10 | [ ] |
| 4 | Seed script tạo đủ 3 projects (active/planned/closed) | [ ] |
| 5 | Seed script tạo đủ 3 allocations | [ ] |
| 6 | `valid-engineers.csv` (< 10MB) sẵn sàng | [ ] |
| 7 | `exactly-10mb.csv` (= 10MB) sẵn sàng | [ ] |
| 8 | `oversized.csv` (> 10MB) sẵn sàng | [ ] |
| 9 | Test user credentials đã verify với mock JWT | [ ] |
