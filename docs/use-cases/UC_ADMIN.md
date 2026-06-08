# Use Case: Admin / Quản lý

Actor này có toàn quyền trên hệ thống. Mọi thao tác đều được audit log.

Trong API, quyền tương ứng là `admin`.

---

## UC-AD-01: Quản lý thực đơn

- **Mã use case:** UC-AD-01
- **Tên use case:** Quản lý thực đơn
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin thêm, sửa, xóa món ăn, quản lý danh mục, upload hình ảnh.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/thuc-don`.
  2. Admin xem danh sách món ăn.
  3. Admin thêm món mới: nhập tên, giá, danh mục, mô tả, upload hình ảnh.
  4. Hệ thống gọi `POST /api/thuc-don` + `POST /api/upload/mon-an`.
  5. Admin sửa món: chọn món → cập nhật thông tin → gọi `PUT /api/thuc-don/:maMon`.
  6. Admin xóa món: chọn món → xác nhận → gọi `DELETE /api/thuc-don/:maMon`.
- **Luồng thay thế:**
  - Admin upload hình ảnh riêng lẻ trước khi tạo món.
- **Luồng lỗi:**
  - Tên món đã tồn tại: thông báo "Món ăn đã tồn tại".
  - Danh mục không hợp lệ: thông báo "Vui lòng chọn danh mục hợp lệ".
- **Dữ liệu vào:** Thông tin món ăn (tên, giá, danh mục, mô tả, hình ảnh).
- **Dữ liệu ra:** Danh sách / chi tiết món ăn.
- **API liên quan:** `GET /api/thuc-don`, `POST /api/thuc-don`, `PUT /api/thuc-don/:maMon`, `DELETE /api/thuc-don/:maMon`, `POST /api/upload/mon-an`.
- **Trạng thái thay đổi:** Thêm/sửa/xóa `MonAn`.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin mới được CRUD thực đơn.
- **Acceptance Criteria:**
  - Thêm món thành công → món hiển thị trong danh sách.
  - Sửa món thành công → thông tin cập nhật đúng.
  - Xóa món thành công → món không còn trong danh sách.

---

## UC-AD-02: Quản lý bàn

- **Mã use case:** UC-AD-02
- **Tên use case:** Quản lý bàn
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin thêm, sửa, xóa bàn, chuyển trạng thái `BAO_TRI`.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/quan-ly-ban`.
  2. Admin xem danh sách bàn.
  3. Admin thêm bàn mới: nhập tên bàn, khu vực, sức chứa, mô tả.
  4. Hệ thống gọi `POST /api/ban`.
  5. Admin sửa bàn: gọi `PUT /api/ban/:maBan`.
  6. Admin xóa bàn: gọi `DELETE /api/ban/:maBan`.
  7. Admin chuyển bàn sang `BAO_TRI`: gọi `PATCH /api/ban/:maBan/status`.
- **Luồng thay thế:**
  - Admin xuất QR bàn: gọi `GET /api/ban/:maBan/qr`.
- **Luồng lỗi:**
  - Bàn đang có khách: thông báo "Không thể xóa bàn đang có khách".
  - Tên bàn đã tồn tại: thông báo "Bàn đã tồn tại".
- **Dữ liệu vào:** Thông tin bàn (tên, khu vực, sức chứa).
- **Dữ liệu ra:** Danh sách / chi tiết bàn.
- **API liên quan:** `GET /api/ban`, `POST /api/ban`, `PUT /api/ban/:maBan`, `DELETE /api/ban/:maBan`, `PATCH /api/ban/:maBan/status`, `GET /api/ban/:maBan/qr`.
- **Trạng thái thay đổi:** Thêm/sửa/xóa `Ban`; chuyển trạng thái `BAO_TRI`.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin mới được CRUD bàn.
- **Acceptance Criteria:**
  - Thêm bàn thành công → bàn hiển thị trong danh sách.
  - Xóa bàn đang có khách → 400.

---

## UC-AD-03: Quản lý nhân viên

- **Mã use case:** UC-AD-03
- **Tên use case:** Quản lý nhân viên
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin xem danh sách, tạo, sửa, xóa tài khoản nhân viên.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/nhan-vien`.
  2. Hệ thống gọi `GET /api/nguoi-dung`.
  3. Admin xem danh sách nhân viên.
  4. Admin tạo nhân viên mới (họ tên, email, SĐT, vai trò).
  5. Admin sửa thông tin nhân viên.
  6. Admin khóa/mở khóa tài khoản nhân viên.
- **Luồng thay thế:**
  - Admin đặt lại mật khẩu cho nhân viên.
- **Luồng lỗi:**
  - Email/SĐT đã tồn tại: thông báo "Thông tin đã được sử dụng".
- **Dữ liệu vào:** Thông tin nhân viên (họ tên, email, SĐT, vai trò).
- **Dữ liệu ra:** Danh sách / chi tiết nhân viên.
- **API liên quan:** `GET /api/nguoi-dung`.
- **Trạng thái thay đổi:** Thêm/sửa/xóa `NguoiDung` (`VaiTro = 'NhanVien'`).
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin mới quản lý được nhân viên.
- **Acceptance Criteria:**
  - Tạo nhân viên thành công → tài khoản mới trong DB.
  - Khóa nhân viên → nhân viên không đăng nhập được.

---

## UC-AD-04: Quản lý khách hàng

- **Mã use case:** UC-AD-04
- **Tên use case:** Quản lý khách hàng
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin xem danh sách khách hàng, tra cứu lịch sử.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập trang quản lý khách hàng.
  2. Hệ thống gọi API danh sách `NguoiDung` + `KhachHang`.
  3. Admin xem thông tin khách hàng (tên, SĐT, email, điểm, lịch sử đơn).
- **Luồng thay thế:**
  - Admin tìm kiếm khách hàng theo tên/SĐT/email.
- **Luồng lỗi:**
  - Không tìm thấy khách hàng: thông báo "Không tìm thấy".
- **Dữ liệu vào:** Từ khóa tìm kiếm (optional).
- **Dữ liệu ra:** Danh sách `KhachHang` + `NguoiDung`.
- **API liên quan:** `GET /api/nguoi-dung`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin mới xem được tất cả khách hàng.
- **Acceptance Criteria:**
  - Hiển thị đúng danh sách khách hàng.
  - Tìm kiếm theo SĐT trả về kết quả chính xác.

---

## UC-AD-05: Quản lý đặt bàn

- **Mã use case:** UC-AD-05
- **Tên use case:** Quản lý đặt bàn
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin duyệt, từ chối, hủy đặt bàn, gán bàn, xem tất cả booking.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/dat-ban`.
  2. Hệ thống gọi `GET /api/dat-ban`.
  3. Admin xem danh sách booking, lọc theo trạng thái/ngày.
  4. Admin duyệt booking (`CHO_XAC_NHAN → DA_XAC_NHAN`): gọi `PATCH /api/dat-ban/:maDatBan/status`.
  5. Admin từ chối/hủy booking: gọi `PATCH /api/dat-ban/:maDatBan/status` với `DA_HUY`.
- **Luồng thay thế:**
  - Admin gán bàn cho booking: gọi `PATCH /api/dat-ban/:maDatBan/assign-tables`.
- **Luồng lỗi:**
  - Booking đã xử lý trước đó: thông báo "Booking đã được xử lý".
- **Dữ liệu vào:** `maDatBan`, `trangThai`.
- **Dữ liệu ra:** Danh sách / chi tiết booking.
- **API liên quan:** `GET /api/dat-ban`, `PATCH /api/dat-ban/:maDatBan/status`, `PATCH /api/dat-ban/:maDatBan/assign-tables`.
- **Trạng thái thay đổi:** `DatBan.TrangThai` thay đổi; `Ban.TrangThai` thay đổi nếu gán bàn.
- **Quy tắc nghiệp vụ:** `admin`. Admin có toàn quyền trên booking.
- **Acceptance Criteria:**
  - Duyệt thành công → booking chuyển `DA_XAC_NHAN`.
  - Từ chối → booking chuyển `DA_HUY`.

---

## UC-AD-06: Quản lý đơn hàng

- **Mã use case:** UC-AD-06
- **Tên use case:** Quản lý đơn hàng
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin xem tất cả đơn hàng, can thiệp trạng thái nếu cần.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/don-hang`.
  2. Hệ thống gọi `GET /api/don-hang`.
  3. Admin xem danh sách đơn hàng, lọc theo trạng thái/bàn/ngày.
  4. Admin xem chi tiết đơn.
  5. Admin can thiệp trạng thái đơn nếu cần: gọi `PATCH /api/don-hang/:maDonHang/status`.
- **Luồng thay thế:**
  - Admin hủy đơn hàng (nếu cần): chuyển `DA_HUY`.
- **Luồng lỗi:**
  - Đơn không tồn tại: thông báo "Không tìm thấy đơn hàng".
- **Dữ liệu vào:** `maDonHang`, `trangThai` (khi can thiệp).
- **Dữ liệu ra:** Danh sách / chi tiết `DonHang` + `ChiTietDonHang`.
- **API liên quan:** `GET /api/don-hang`, `PATCH /api/don-hang/:maDonHang/status`.
- **Trạng thái thay đổi:** `DonHang.TrangThai` (nếu admin can thiệp).
- **Quy tắc nghiệp vụ:** `admin`. Admin có quyền can thiệp bất kỳ đơn nào.
- **Acceptance Criteria:**
  - Xem danh sách tất cả đơn hàng.
  - Can thiệp trạng thái thành công.

---

## UC-AD-07: Quản lý voucher

- **Mã use case:** UC-AD-07
- **Tên use case:** Quản lý voucher / mã giảm giá
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin tạo, sửa, xóa mã giảm giá, theo dõi lượt sử dụng.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập trang quản lý voucher.
  2. Admin xem danh sách mã giảm giá (mã, loại, giá trị, hạn dùng, lượt đã dùng).
  3. Admin tạo mã mới: nhập mã, loại, giá trị, ngày hiệu lực, hạn dùng, số lượt tối đa.
  4. Admin sửa thông tin mã.
  5. Admin vô hiệu hóa mã (chuyển `Inactive`).
- **Luồng thay thế:**
  - Admin tạo mã cho khách hàng cụ thể (`LoaiMa = 'CUSTOMER'`): gắn `MaKH`.
- **Luồng lỗi:**
  - Mã đã tồn tại: thông báo "Mã giảm giá đã tồn tại".
  - Ngày hiệu lực sau ngày hết hạn: thông báo "Ngày không hợp lệ".
- **Dữ liệu vào:** Thông tin mã giảm giá (mã, loại, giá trị, ngày, lượt).
- **Dữ liệu ra:** Danh sách / chi tiết mã giảm giá.
- **API liên quan:** Module `MaGiamGia` (CRUD).
- **Trạng thái thay đổi:** Thêm/sửa/xóa `MaGiamGia`.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin mới quản lý voucher.
- **Acceptance Criteria:**
  - Tạo mã thành công → mã trong DB.
  - Vô hiệu hóa → mã không được áp dụng khi thanh toán.

---

## UC-AD-08: Duyệt đánh giá

- **Mã use case:** UC-AD-08
- **Tên use case:** Duyệt đánh giá
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin duyệt hoặc từ chối đánh giá của khách hàng.
- **Điều kiện bắt đầu:** Có `DanhGia` mới (trạng thái chờ duyệt).
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/danh-gia`.
  2. Hệ thống gọi `GET /api/danh-gia` (filter trạng thái chờ duyệt).
  3. Admin xem nội dung đánh giá.
  4. Admin duyệt: gọi `PATCH /api/danh-gia/:maDanhGia/duyet` với `trangThai = 'Approved'`.
  5. Admin từ chối: gọi `PATCH /api/danh-gia/:maDanhGia/duyet` với `trangThai = 'Rejected'`.
- **Luồng thay thế:**
  - Admin xem đánh giá đã duyệt / đã từ chối.
- **Luồng lỗi:**
  - Đánh giá không tồn tại: thông báo "Không tìm thấy đánh giá".
- **Dữ liệu vào:** `maDanhGia`, `trangThai` (`Approved` / `Rejected`).
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `GET /api/danh-gia`, `PATCH /api/danh-gia/:maDanhGia/duyet`.
- **Trạng thái thay đổi:** `DanhGia.TrangThai` → `Approved` / `Rejected`.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin duyệt đánh giá.
- **Acceptance Criteria:**
  - Duyệt thành công → đánh giá hiển thị công khai.
  - Từ chối → đánh giá ẩn với khách hàng khác.

---

## UC-AD-09: Xem thống kê doanh thu

- **Mã use case:** UC-AD-09
- **Tên use case:** Xem thống kê doanh thu
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin xem doanh thu theo ngày/tháng, món bán chạy, tần suất bàn.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/thong-ke`.
  2. Admin chọn loại thống kê (doanh thu ngày/tháng/năm).
  3. Hệ thống gọi các API `/thong-ke/*`.
  4. Hiển thị: biểu đồ doanh thu, top món bán chạy, booking count.
- **Luồng thay thế:**
  - Admin xuất báo cáo (in / download).
- **Luồng lỗi:**
  - Không có dữ liệu: hiển thị trạng thái rỗng.
- **Dữ liệu vào:** `tuNgay`, `denNgay`, loại thống kê.
- **Dữ liệu ra:** Số liệu thống kê, biểu đồ.
- **API liên quan:** `GET /api/thong-ke/tong-quan`, `GET /api/thong-ke/doanh-thu/ngay`, `GET /api/thong-ke/mon-ban-chay`, `GET /api/thong-ke/booking-count`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin xem được thống kê.
- **Acceptance Criteria:**
  - Hiển thị đúng số liệu doanh thu.
  - Có trạng thái rỗng khi chưa có dữ liệu.

---

## UC-AD-10: Xem dashboard tổng quan

- **Mã use case:** UC-AD-10
- **Tên use case:** Xem dashboard tổng quan
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin xem dashboard hiển thị các chỉ số vận hành chính.
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập `/noi-bo/dashboard`.
  2. Hệ thống gọi API tổng quan.
  3. Hiển thị: tổng doanh thu hôm nay, số đơn hôm nay, số bàn đang có khách, số booking hôm nay, top món.
- **Luồng thay thế:**
  - Admin click vào chỉ số để xem chi tiết.
- **Luồng lỗi:**
  - Không có dữ liệu: hiển thị trạng thái rỗng "Chưa có dữ liệu".
- **Dữ liệu vào:** Token JWT (admin).
- **Dữ liệu ra:** Các chỉ số tổng quan.
- **API liên quan:** `GET /api/thong-ke/tong-quan`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin xem được dashboard.
- **Acceptance Criteria:**
  - Hiển thị đúng các chỉ số.
  - Có trạng thái loading + rỗng.

---

## UC-AD-11: Cấu hình hệ thống

- **Mã use case:** UC-AD-11
- **Tên use case:** Cấu hình hệ thống
- **Actor chính:** Admin / Quản lý
- **Mục tiêu:** Admin quản lý các cấu hình chung của hệ thống (tỷ lệ tích điểm, phí dịch vụ, thông tin nhà hàng).
- **Điều kiện bắt đầu:** Admin đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Admin truy cập trang cấu hình hệ thống.
  2. Admin xem các cấu hình hiện tại.
  3. Admin thay đổi cấu hình:
     - Tỷ lệ tích điểm (mặc định: 10.000đ = 1 điểm).
     - Tỷ lệ quy đổi điểm (mặc định: 100 điểm = 10.000đ).
     - Phí dịch vụ (%).
     - Thông tin nhà hàng (tên, địa chỉ, SĐT, email).
     - Thời gian tự động chuyển `DANG_DON → TRONG` (phút).
  4. Hệ thống gọi API cập nhật cấu hình.
  5. Hiển thị thông báo thành công.
- **Luồng thay thế:**
  - Admin khôi phục cấu hình mặc định.
- **Luồng lỗi:**
  - Giá trị không hợp lệ: thông báo "Giá trị cấu hình không hợp lệ".
- **Dữ liệu vào:** Các tham số cấu hình.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** Module cấu hình (nếu có).
- **Trạng thái thay đổi:** Cập nhật cấu hình hệ thống.
- **Quy tắc nghiệp vụ:** `admin`. Chỉ admin mới thay đổi cấu hình hệ thống.
- **Acceptance Criteria:**
  - Cập nhật thành công → cấu hình mới có hiệu lực.
  - Giá trị âm → 400.
