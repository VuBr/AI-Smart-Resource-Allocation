# Black-Box Test Cases — RA-012: Upload Project CSV

> Test cases từ góc nhìn người dùng / tester bên ngoài.
> Không biết implementation — chỉ biết input/output theo spec-pack.
> Dùng cho manual testing hoặc E2E test script.

**Ticket:** RA-012
**Spec-pack:** `docs/changes/RA-012/spec-pack.md`
**Ngày tạo:** 2026-04-18

---

## Endpoint: `POST /api/v1/projects/upload`

### BB-01: Upload file không phải CSV (AC-1)

**Input:**
- File: `test.json` với nội dung `{"name": "Project A"}`
- Content-Type: `application/json`

**Expected:**
- HTTP 400
- Body: `{"error": {"code": "InvalidCsv", "message": "File must be a valid CSV"}}`

---

### BB-02: Upload file CSV vượt 10MB (AC-2)

**Input:**
- File: CSV binary, kích thước = 10MB + 1 byte
- Content-Type: `text/csv`

**Expected:**
- HTTP 413
- Body: `{"error": {"code": "FileTooLarge", "message": "File exceeds maximum allowed size"}}`

---

### BB-03: Upload 25 rows hợp lệ — lần 1 (AC-3)

**Input:** File `docs/changes/RA-012/Raw/projects_25.csv`

**Pre-condition:** DB không có row nào trong bảng `projects`.

**Expected:**
- HTTP 200
- Body: `{"inserted": 25, "updated": 0, "skipped": 0, "errors": []}`
- DB: 25 rows trong `projects`

---

### BB-04: Upload 25 rows hợp lệ — lần 2 (AC-4)

**Input:** File `docs/changes/RA-012/Raw/projects_25.csv` (cùng file)

**Pre-condition:** DB đã có 25 rows từ BB-03.

**Expected:**
- HTTP 200
- Body: `{"inserted": 0, "updated": 25, "skipped": 0, "errors": []}`
- DB: vẫn 25 rows (không tăng thêm)

---

### BB-05: Row có headcount = 0 (AC-5)

**Input CSV:**
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
Valid Project,desc,,senior,3,active,2026-01-01,2026-12-31
Bad Headcount Project,,,junior,0,planned,,
```

**Expected:**
- HTTP 200
- `inserted=1, skipped=1`
- `errors` chứa string bao gồm `"Row 2"` và `"headcount"` và `"> 0"`

---

### BB-06: Row có required_level không hợp lệ (AC-6)

**Input CSV:**
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
Bad Level Project,,,expert,2,planned,,
```

**Expected:**
- HTTP 200
- `skipped=1`
- `errors[0]` chứa `"Row 1"`, `"required_level"`, `"expert"`, và danh sách `junior, mid, senior, lead`

---

### BB-07: Row có end_date < start_date (AC-7)

**Input CSV:**
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
Date Error Project,,,,1,planned,2026-06-01,2026-01-01
```

**Expected:**
- HTTP 200
- `skipped=1`
- `errors[0]` chứa `"Row 1"`, `"end_date"`, và đề cập đến constraint ≥ start_date

---

### BB-08: Row có name rỗng (AC-8)

**Input CSV:**
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
,,,,1,planned,,
```

**Expected:**
- HTTP 200
- `skipped=1`
- `errors[0]` chứa `"Row 1"` và `"name"`

---

### BB-09: Header thiếu cột name (AC-9)

**Input CSV:**
```
description,required_skills,status
Some project,Python,active
```

**Expected:**
- HTTP 400
- Body: `{"error": {"code": "InvalidCsvHeader", "message": "Missing required column: name"}}`

---

### BB-10: Mix valid và invalid rows (AC-10)

**Input CSV:** 20 rows hợp lệ + 3 rows có lỗi (headcount=0, required_level=expert, end<start)

**Expected:**
- HTTP 200
- `inserted + updated = 20`, `skipped = 3`, `errors.length = 3`
- Mỗi error message có đúng row number

---

### BB-11: File không encode UTF-8 (AC-11)

**Input:**
- File CSV chứa bytes Latin-1 (ví dụ: `b"name\n\xe0\xe1\xe2"`)
- Content-Type: `text/csv`

**Expected:**
- HTTP 400
- Body: `{"error": {"code": "InvalidEncoding", "message": "File must be UTF-8 encoded"}}`

---

### BB-12: Trang Upload hiển thị column đúng (AC-12)

**Cách test:** Truy cập `http://localhost:3000/upload` sau khi login.

**Expected:**
- Projects CSV column list **không có** `project_id`
- Projects CSV column list **có** `name` (required) và 7 cột optional còn lại

---

### BB-13: Optional fields trống → null trong DB (AC-13)

**Input CSV:**
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
Minimal Project,,,,,,, 
```

**Expected:**
- HTTP 200, `inserted=1`
- DB row: `description=null`, `required_skills=null`, `required_level=null`, `headcount=1`, `status="planned"`, `start_date=null`, `end_date=null`

---

### BB-14: File đúng 10MB (Boundary B-1)

**Input:** CSV file kích thước = 10 * 1024 * 1024 bytes (không vượt quá).

**Expected:** HTTP 200 (không bị reject vì kích thước).

---

### BB-15: Upsert — update field sau khi đã insert

**Pre-condition:** DB có row `name="AI Platform Modernization"` với `headcount=3`.

**Input CSV:**
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
AI Platform Modernization,Updated desc,Python,senior,10,active,2026-01-01,2026-12-31
```

**Expected:**
- HTTP 200, `updated=1, inserted=0`
- DB row: `headcount=10`, `description="Updated desc"`

---

### BB-16: Upsert — optional field cũ bị overwrite bởi empty (OI-3 resolved)

**Pre-condition:** DB có row `name="Test Project"` với `description="Old description"`.

**Input CSV:**
```
name,description,required_skills,required_level,headcount,status,start_date,end_date
Test Project,,,,1,planned,,
```

**Expected:**
- HTTP 200, `updated=1`
- DB row: `description=null` (NOT `"Old description"`)
