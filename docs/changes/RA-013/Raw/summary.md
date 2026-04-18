Bạn là AI engineer trong dự án “AI Smart Resource Allocation & Bench Prediction System”.

Chúng tôi đã hoàn thành tính năng **Upload Project CSV**.
Nhiệm vụ của bạn là triển khai tính năng **Upload Engineers CSV**, với nguyên tắc:

 PHẢI tái sử dụng tối đa design, pattern, validation flow và structure từ Project CSV upload.

---

# 1. Context

Tính năng Upload Project CSV đã có:
- API endpoint 
- CSV parsing logic
- validation pattern
- error response format
- service structure (endpoint / service / validator / repository)

Hãy:
- tham khảo implementation đó
- reuse càng nhiều càng tốt
- giữ consistency toàn hệ thống

Không được thiết kế lại từ đầu nếu có thể reuse.

---

# 2. Mục tiêu

Cho phép upload CSV chứa danh sách engineers, hệ thống sẽ:
- parse CSV
- validate dữ liệu
- trả lỗi rõ ràng theo row/field
- lưu vào DB nếu hợp lệ
- đảm bảo dữ liệu dùng được cho:
  - allocation
  - match_score
  - bench forecast

---

# 3. Schema Engineer

Model Engineer gồm:

- name: string (required)
- email: string (required, unique)
- primary_skill: string (required)
- secondary_skills: string | optional
- level: string (required: junior/mid/senior/lead)
- years_of_experience: int (default = 0)
- availability_percentage: int (default = 100)
- bench_start_date: date | optional

Không cho phép CSV import:
- id
- created_at
- updated_at

---

# 4. CSV Format

Header:

name,email,primary_skill,secondary_skills,level,years_of_experience,availability_percentage,bench_start_date

Ví dụ:

Nguyen Van A,a@example.com,Python,"Django,FastAPI",senior,5,100,2026-01-01
Tran B,b@example.com,JavaScript,"React,Node.js",mid,3,80,

---

# 5. Validation Rules

## 5.1 Required
- name: bắt buộc
- email: bắt buộc
- primary_skill: bắt buộc
- level: bắt buộc

## 5.2 Value rules

### email
- phải đúng format email
- phải unique (check DB hoặc trong file)

### level
- chỉ được:
  - junior
  - mid
  - senior
  - lead

### years_of_experience
- >= 0
- integer

### availability_percentage
- 0 <= value <= 100

### secondary_skills
- optional
- string comma-separated

### bench_start_date
- optional
- format YYYY-MM-DD

---

## 5.3 File-level rules (reuse từ Project CSV)
- file phải là CSV hợp lệ
- header đúng format
- file không rỗng
- mapping theo header name (không phụ thuộc thứ tự)

---

# 6. Import Behavior

PHẢI giống Project CSV

Hãy kiểm tra xem Project dùng mode nào:

### Nếu Project dùng:
- Strict import → reuse
- Partial import → reuse

Không được tự ý chọn khác nếu chưa có lý do

---

# 7. API Design
Tham khảo cấu trúc tương ứng đã dựng của api upload project

Yêu cầu:
- multipart/form-data
- parse file
- validate
- insert DB

Response format giống Project CSV:

Success / Partial success:
{
  "inserted": 295,
  "updated": 0,
  "skipped": 5,
  "errors": [
    "Row 2: email — invalid email format",
    "Row 7: level — Input should be 'junior', 'mid', 'senior' or 'lead'"
  ]
}

Fatal error (HTTP 4xx):
{
  "error": {
    "code": "InvalidCsv" | "FileTooLarge" | "InvalidEncoding" | "InvalidCsvHeader",
    "message": "..."
  }
}

---

# 8. Implementation Requirements

MUST reuse structure từ Project

Tách các phần:

- endpoint (FastAPI)
- CSV parser (shared nếu có)
- validator (Engineer-specific)
- mapper (CSV → Entity)
- repository / DB layer

Nếu Project đã có:
- CSVService
- BaseValidator

→ reuse hoặc extend

---

# 9. Non-functional

- không crash khi có row lỗi
- error message rõ ràng cho user
- log đủ để debug
- code consistent với Project module

---

# 10. Test Cases

Phải mirror test của Project CSV

Thêm các case đặc thù Engineer:

1. email invalid → fail
2. email duplicate → fail
3. level invalid → fail
4. availability > 100 → fail
5. negative experience → fail
6. bench_start_date sai format → fail
7. mix valid + invalid rows → đúng behavior
8. file empty → fail
9. header sai → fail

---

# 11. Output format (bắt buộc)

Trả lời theo thứ tự:

1. Plan (ngắn)
2. So sánh với Project CSV (reuse gì)
3. API design
4. Validation rules
5. Code structure
6. Implementation code
7. Test cases
8. Open issues

---

# 12. Constraints

- Không rewrite lại logic CSV nếu đã có ở Project
- Không thay đổi response format
- Không thêm field ngoài schema
- Nếu có ambiguity → đưa vào Open Issues

Iput:
    backend :csv_ingestion.py
    fontend : upload/page.tsx
    file import: RA-013/Raw/engineers_300.csv
