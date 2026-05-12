Bạn là AI engineer trong dự án “AI Smart Resource Allocation & Bench Prediction System”.


### 1. Nghiệp vụ (theo spec RA-001)
- **Mục đích:** Báo cáo thiếu hụt kỹ năng (skill shortage) giúp quản lý biết những kỹ năng nào đang thiếu so với nhu cầu dự án.
- **Cách tính:** So sánh tổng số kỹ năng cần (từ các project đang active/planned) với số engineer hiện có kỹ năng đó (và còn available).
- **Kết quả:** Danh sách các kỹ năng, số lượng cần, số lượng hiện có, và mức thiếu hụt (`gap = required - available`).

### 2. Hãy thực hiện các bước sau:

> Replace the mock data in the `/reports/shortage` endpoint with real data from the database.  
> 
> - For each skill required by any active or planned project, calculate:
>   - `required`: total number of engineers needed for that skill (sum of all project requirements)
>   - `available`: number of engineers who have that skill (as primary or secondary skill) and are not fully allocated (availability_percentage > 0)
>   - `gap`: `required - available`
> - Return a list of objects: `{ "skill": str, "required": int, "available": int, "gap": int }`
> - Only include skills where `gap > 0`
> - Use the actual database models (Project, Engineer, Allocation) as defined in the domain model.
> - Do not return mock/static data.

### 3. Tham khảo nghiệp vụ & domain model
- **Project:** `required_skills`, `status` (active/planned)
- **Engineer:** `primary_skill`, `secondary_skills`, `availability_percentage`
- **Allocation:** để xác định engineer còn available

### 3.  Ngoài việc thay đổi api thì hãy map với frontedn tương ứng để khớp giữa frontedn và api

---

### 4. Yêu cầu mapping với frontend

- Đảm bảo response của API `/reports/shortage` trả về đúng format mà frontend đang sử dụng (kiểm tra file: `web/features/reports/` hoặc các component/table liên quan).
- Nếu frontend mong đợi thêm trường nào (ví dụ: skill label, description, v.v.), cần bổ sung rõ vào response hoặc cập nhật frontend cho đồng bộ.
- Đảm bảo các trường trả về: `skill`, `required`, `available`, `gap` là kiểu số/nguyên/thích hợp để frontend render bảng hoặc biểu đồ.
- Nếu có filter, sort, hoặc group ở frontend, cần đảm bảo API trả về đủ dữ liệu để thực hiện các thao tác này phía client.

---

### 5. Lưu ý về nghiệp vụ và kiểm thử

- Chỉ tính các project có `status` là `active` hoặc `planned`.
- Một engineer chỉ được tính là "available" nếu tổng allocation hiện tại < 100% (có thể kiểm tra qua bảng Allocation).
- Nếu một engineer có skill trùng cả primary và secondary, chỉ tính một lần.
- Đảm bảo loại bỏ các skill có `gap <= 0` khỏi kết quả trả về.
- Viết unit test cho cả trường hợp: đủ engineer, thiếu engineer, không có project nào active/planned, và các trường hợp biên (ví dụ: skill chỉ có trong secondary_skills).

---

### 6. Gợi ý kiểm tra frontend

- Kiểm tra các file:  
  - `web/features/reports/shortage-table.tsx` (hoặc tương tự)
  - `web/app/reports/page.tsx`
  - `web/types/index.ts` (định nghĩa type cho report)
- Đảm bảo frontend không bị lỗi khi API trả về danh sách rỗng hoặc thiếu trường.



