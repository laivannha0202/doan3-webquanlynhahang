# Mô tả nghiệp vụ hiện tại của hệ thống

## 1. Mục đích tài liệu

File này mô tả **hiện trạng triển khai thực tế** của repo tại thời điểm hiện tại, dùng để:

- hiểu đúng cấu trúc frontend / backend đang chạy
- nắm các nghiệp vụ lõi đã có trong mã nguồn
- tránh mô tả quá tay những phần mới chỉ ở mức nền tảng hoặc định hướng mở rộng

## 2. Kiến trúc hiện tại của repo

Hiện trạng đúng của repo:

- frontend chính nằm trong `frontend/`
- mã nguồn giao diện chính nằm trong `frontend/src/`
- frontend dùng React + Vite
- backend chính nằm trong `backend/nest-api/`
- backend dùng NestJS + TypeScript + MySQL
- frontend gọi backend qua base URL có dạng `/api`

Điều quan trọng:

- khi cần kiểm tra API đang chạy thật, ưu tiên đọc `backend/nest-api/src/modules/**`
- khi cần kiểm tra route giao diện, ưu tiên đọc `frontend/src/App.jsx`

## 3. Nhóm nghiệp vụ đã có trong mã nguồn

### 3.1 Khách hàng

Hệ thống hiện có các luồng chính cho khách hàng:

- xem trang chủ và giới thiệu nhà hàng
- xem thực đơn công khai
- đăng ký, đăng nhập
- đặt bàn (yêu cầu đăng nhập, tài khoản khách hàng)
- thêm món vào giỏ hàng
- thanh toán (chỉ cho đơn gắn bàn hoặc đơn từ đặt bàn, không phải luồng đặt món online/mang về/ship)
- xem hồ sơ cá nhân
- xem lịch sử đơn hàng
- xem lịch sử đặt bàn
- gửi đánh giá cho đơn hàng đủ điều kiện
- gọi món tại bàn qua mã QR theo `maBan` (không cần đăng nhập)

### 3.2 Nhân viên / nội bộ

Khu vực nội bộ hiện có:

- đăng nhập nội bộ
- dashboard vận hành
- quản lý danh sách booking
- theo dõi sơ đồ bàn
- quản lý bàn
- theo dõi và cập nhật trạng thái đơn hàng gọi món tại bàn
- xem và xử lý đánh giá

### 3.3 Quản trị

Tài khoản quản trị hiện có thêm các nhóm chức năng:

- quản lý món ăn
- quản lý tài khoản nội bộ
- quản lý bàn nâng cao
- xem thống kê doanh thu mức cơ bản trên dashboard / trang nội bộ

## 4. Các route giao diện chính

### Public / khách hàng

- `/`
- `/thuc-don`
- `/dat-ban`
- `/gio-hang`
- `/thanh-toan`
- `/gioi-thieu`
- `/ho-so`
- `/danh-gia`
- `/dang-nhap`
- `/dang-ky`
- `/ban/:maBan`
- `/ban/:maBan/goi-mon`

### Nội bộ

- `/noi-bo/dang-nhap`
- `/noi-bo/dashboard`
- `/noi-bo/dat-ban`
- `/noi-bo/so-do-ban`
- `/noi-bo/quan-ly-ban`
- `/noi-bo/thuc-don`
- `/noi-bo/don-hang`
- `/noi-bo/danh-gia`
- `/noi-bo/thong-ke`
- `/noi-bo/nhan-vien`

Một số route cũ như `/admin/*`, `/dang-nhap-noi-bo`, `/bang-dieu-khien-host` hiện được giữ để chuyển hướng tương thích sang khu vực nội bộ mới.

## 5. Backend chính đang dùng

Backend chính của repo là `backend/nest-api/`.

Stack backend:

- NestJS
- TypeScript
- MySQL
- JWT
- Swagger

Các nhóm controller chính:

- `auth`
- `nguoi-dung`
- `thuc-don`
- `ban`
- `dat-ban`
- `don-hang`
- `voucher`
- `danh-gia`
- `diem-tich-luy`

## 6. Các điểm nghiệp vụ đã nối frontend - backend

Hiện frontend và backend đã nối thật ở các mảng:

- xác thực khách hàng và nội bộ
- thực đơn
- bàn ăn
- đặt bàn
- đơn hàng gọi món tại bàn
- đánh giá
- tài khoản nội bộ

Đây là các mảng cần ưu tiên giữ ổn định contract khi chỉnh sửa.

## 7. Các điểm không nên mô tả là đã hoàn thiện toàn bộ

Để tài liệu trung thực với hiện trạng mã nguồn, không nên khẳng định quá mức rằng hệ thống đã hoàn chỉnh toàn diện ở các mảng sau nếu chưa phát triển thêm:

- quản lý kho / nguyên liệu
- báo cáo tổng hợp nhiều chiều, BI hoặc dashboard phân tích sâu
- vận hành chuỗi chi nhánh hoặc đa cơ sở
- các quy trình ERP mở rộng ngoài phạm vi đồ án hiện tại

Nếu cần mô tả trong báo cáo, nên dùng cách diễn đạt như:

- “đã có nền tảng để mở rộng tiếp”
- “đã có module / màn hình cơ bản”
- “đang tập trung hoàn thiện nghiệp vụ lõi trước”

## 8. Ý nghĩa khi chỉnh sửa repo

Khi sửa repo này để ổn định và sẵn sàng nộp:

- ưu tiên giữ nguyên kiến trúc hiện tại
- ưu tiên sửa mismatch giữa frontend và backend
- ưu tiên sửa route thiếu, test mẫu sai, tài liệu lệch
- không nên thêm hệ thống lớn mới nếu chưa có nền sẵn trong mã nguồn

## 9. Kết luận

Cách hiểu đúng repo hiện tại:

- frontend chính: `frontend/`
- backend chính: `backend/nest-api/`
- contract API nguồn sự thật: controller và service trong `backend/nest-api/src/modules/**`
- trọng tâm đã làm tốt: auth, menu, table, booking, order tại bàn, voucher, review, dashboard nội bộ
- trọng tâm cần mô tả trung thực: báo cáo nâng cao và các mảng mở rộng chưa phải phần hoàn thiện end-to-end
