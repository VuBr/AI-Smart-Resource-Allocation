Bạn là AI engineer trong dự án “AI Smart Resource Allocation & Bench Prediction System”.

Hãy phát triển tính năng Add Project cho hệ thống:

1. Ở màn hình projects, hiện đã có nút New Project nhưng chưa hoạt động. Khi nhấn nút này, hãy hiển thị một Modal cho phép người dùng nhập thông tin để thêm project mới.
2. Các trường thông tin cần nhập trong Modal giống với cấu trúc đã dùng cho import CSV project (ví dụ: description, required_skills,required_level, headcount, ...)., về Modal hiển thị có thể tham khảo Modal AI-Smart-Resource-Allocation\apps\web\features\engineers\AddEngineerModal.tsx
3. Tạo API backend để thêm project mới vào hệ thống.
4. Kết nối frontend với API này: khi người dùng nhập đủ thông tin và nhấn xác nhận trên Modal, gửi request lên backend để tạo project mới, sau đó cập nhật lại danh sách.
5. Giải thích rõ các file cần sửa/viết mới ở cả frontend và backend, và trình bày các bước thực hiện.


