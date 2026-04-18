Input cho Task RA-012
Ticket Information
Tên ticket: RA-012

Mục tiêu: Trước đây chỉ là phần MocData, Bây giờ cần triển khai tính năng Upload Project CSV cho backend, frontend từ dữ liệu thực tế.

Loại task: Phase 2 – Tạo Spec Pack (đặc tả có thể triển khai).

Bám theo model Project hiện có:
- name (required)
- description (optional)
- required_skills (optional)
- required_level (optional: junior/mid/senior/lead)
- headcount (default 1, must be > 0)
- status (default planned, only planned/active/closed)
- start_date (optional, YYYY-MM-DD)
- end_date (optional, YYYY-MM-DD, must be >= start_date if both present)

Không import các field:
- id
- created_at
- updated_at

CSV header:
name,description,required_skills,required_level,headcount,status,start_date,end_date

Yêu cầu:
- tạo API upload dựa trên cấu trúc hiện tại của dự án.
- parse file CSV
- validate từng row
- trả lỗi rõ ràng theo row/field
- nếu hợp lệ thì lưu DB
Iput:
    backend :csv_ingestion.py
    fontend : upload/page.tsx
    file import: RA-012/Raw/projects_25.csv
 
