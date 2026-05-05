
# Yêu cầu cập nhật API get_active_allocations

## Thông tin ticket
Tên ticket: RA-014

## Mục tiêu
Loại task: simple, code theo mô tả yêu cầu

## Định nghĩa yêu cầu

Hiện tại, API `get_active_allocations` trong allocations.py trả về danh sách allocation với các trường như: id, engineer_id, project_id, percentage, status, start_date, end_date.

Tuy nhiên, ở component ActiveAllocationsTable (ActiveAllocationsTable.tsx), cần hiển thị thêm tên kỹ sư (`engineer_name`) và tên dự án (`project_name`) tương ứng với mỗi allocation.

### Yêu cầu:
- Cập nhật API `get_active_allocations` để trả về thêm hai trường: `engineer_name` (tên kỹ sư) và `project_name` (tên dự án) cho mỗi allocation.
- `engineer_name` lấy từ bảng Engineer, `project_name` lấy từ bảng Project dựa trên `engineer_id` và `project_id` của allocation.
- Đảm bảo không thay đổi các trường hiện có, chỉ bổ sung thêm hai trường mới.

### Ví dụ dữ liệu trả về mong muốn:

[
	{
		"id": "006212c0-af75-430e-9436-fe0c0492341d",
		"engineer_id": "9520b3b7-7434-4406-bcb6-6d030522de59",
		"engineer_name": "Nguyễn Văn A",
		"project_id": "419ef867-12aa-4c6e-881c-8cc0793f14d0",
		"project_name": "Dự án ABC",
		"percentage": 50,
		"status": "active",
		"start_date": "2026-02-28",
		"end_date": "2026-06-28"
	}
]
 
