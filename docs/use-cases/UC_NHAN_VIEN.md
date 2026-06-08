# Use Case: Nhân viên

Actor này bao gồm các nghiệp vụ nội bộ: **Phục vụ**, **Bếp**, **Thu ngân**.

Trong API, quyền tương ứng là `staff` (JWT có `vaiTro='NhanVien'` hoặc `'Admin'`).

Mỗi use case dưới đây có 14 trường bắt buộc: mã, tên, actor chính, nghiệp vụ con, mục tiêu, điều kiện bắt đầu, luồng chính, luồng thay thế, luồng lỗi, dữ liệu vào, dữ liệu ra, API liên quan, trạng thái thay đổi, quy tắc nghiệp vụ, acceptance criteria.

---

## Nhóm phục vụ

### UC-NV-01: Đăng nhập nội bộ

- **Mã use case:** UC-NV-01
- **Tên use case:** Đăng nhập nội bộ
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ / Bếp / Thu ngân (tất cả)
- **Mục tiêu:** Nhân viên nội bộ đăng nhập để truy cập khu vực quản trị.
- **Điều kiện bắt đầu:** Nhân viên đã có tài khoản nội bộ (VaiTro = `NhanVien` hoặc `Admin`).
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/dang-nhap`.
  2. Hệ thống hiển thị form đăng nhập (Tên đăng nhập + Mật khẩu).
  3. Nhân viên nhập thông tin, bấm "Đăng nhập".
  4. Hệ thống gọi `POST /api/auth/internal-login`.
  5. Hệ thống kiểm tra thông tin, trả JWT token.
  6. Lưu token, chuyển hướng đến `/noi-bo/dashboard`.
- **Luồng thay thế:**
  - Khách hàng (`KhachHang`) cố đăng nhập nội bộ: hệ thống từ chối.
- **Luồng lỗi:**
  - Sai tên đăng nhập hoặc mật khẩu: thông báo "Sai thông tin đăng nhập".
  - Tài khoản bị khóa: thông báo "Tài khoản đã bị khóa".
- **Dữ liệu vào:** `tenDangNhap`, `matKhau`.
- **Dữ liệu ra:** Token JWT (access + refresh), thông tin `NguoiDung`.
- **API liên quan:** `POST /api/auth/internal-login`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu (chỉ tạo session/token).
- **Quy tắc nghiệp vụ:** `staff`. Không cho phép `KhachHang` đăng nhập qua luồng này.
- **Acceptance Criteria:**
  - Đăng nhập đúng → token hợp lệ, chuyển hướng dashboard.
  - Sai thông tin → 401.
  - `KhachHang` đăng nhập → bị từ chối.

---

### UC-NV-02: Xem sơ đồ bàn

- **Mã use case:** UC-NV-02
- **Tên use case:** Xem sơ đồ bàn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ
- **Mục tiêu:** Nhân viên xem danh sách bàn và trạng thái hiện tại để quản lý phục vụ.
- **Điều kiện bắt đầu:** Nhân viên đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/so-do-ban`.
  2. Hệ thống gọi `GET /api/ban`.
  3. Hiển thị sơ đồ bàn với trạng thái (`TRONG`, `DA_DAT`, `CO_KHACH`, `DANG_DON`, `BAO_TRI`).
  4. Nhân viên có thể lọc theo trạng thái hoặc khu vực.
- **Luồng thay thế:**
  - Nhân viên bấm vào bàn để xem chi tiết (đơn hiện tại, khách, booking).
- **Luồng lỗi:**
  - Không có dữ liệu bàn: hiển thị trạng thái rỗng.
- **Dữ liệu vào:** Token JWT (nội bộ).
- **Dữ liệu ra:** Danh sách `Ban` kèm trạng thái, khu vực.
- **API liên quan:** `GET /api/ban`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `staff`. Bàn `BAO_TRI` hiển thị với trạng thái riêng, không cho thao tác.
- **Acceptance Criteria:**
  - Hiển thị đúng trạng thái từng bàn.
  - Có trạng thái rỗng khi không có bàn.

---

### UC-NV-03: Check-in đặt bàn

- **Mã use case:** UC-NV-03
- **Tên use case:** Check-in đặt bàn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ
- **Mục tiêu:** Khi khách đặt bàn đến nhà hàng, nhân viên xác nhận khách đã đến.
- **Điều kiện bắt đầu:** Có `DatBan` ở trạng thái `DA_XAC_NHAN`, bàn đã được gán.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/dat-ban`, tìm booking cần check-in.
  2. Nhân viên bấm "Khách đã đến".
  3. Hệ thống gọi `PATCH /api/dat-ban/:maDatBan/status` với `trangThai = 'DA_NHAN_BAN'`.
  4. Hệ thống cập nhật `Ban.TrangThai` từ `DA_DAT` → `CO_KHACH`.
  5. Hiển thị thông báo thành công.
- **Luồng thay thế:**
  - Khách đến sớm hơn giờ đặt: vẫn check-in được nếu bàn trống.
  - Khách đến trễ: nhân viên có thể chọn giữ bàn hoặc hủy.
- **Luồng lỗi:**
  - Booking đã hủy hoặc đã hoàn tất: thông báo "Booking không hợp lệ".
- **Dữ liệu vào:** `maDatBan`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/dat-ban/:maDatBan/status`.
- **Trạng thái thay đổi:** `DatBan.TrangThai` → `DA_NHAN_BAN`; `Ban.TrangThai` → `CO_KHACH`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ check-in được khi `DatBan` đang ở `DA_XAC_NHAN`.
- **Acceptance Criteria:**
  - Check-in thành công → booking + bàn cập nhật trạng thái.
  - Booking không hợp lệ → 400.

---

### UC-NV-04: Gán / chuyển bàn

- **Mã use case:** UC-NV-04
- **Tên use case:** Gán / chuyển bàn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ
- **Mục tiêu:** Nhân viên gán bàn cụ thể cho một đặt bàn đã xác nhận, hoặc chuyển bàn khi cần.
- **Điều kiện bắt đầu:** Có `DatBan` ở trạng thái `DA_XAC_NHAN`, chưa gán bàn hoặc cần đổi bàn.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/dat-ban`, chọn booking cần gán bàn.
  2. Nhân viên xem danh sách bàn trống (`Ban.TrangThai = 'TRONG'`).
  3. Nhân viên chọn bàn và xác nhận.
  4. Hệ thống gọi `PATCH /api/dat-ban/:maDatBan/assign-tables`.
  5. Hệ thống cập nhật `Ban.TrangThai` từ `TRONG` → `DA_DAT`.
- **Luồng thay thế:**
  - Đổi bàn cho booking đã gán bàn trước đó: bàn cũ về `TRONG`, bàn mới → `DA_DAT`.
- **Luồng lỗi:**
  - Bàn đã có khách hoặc đang bảo trì: thông báo "Bàn không khả dụng".
- **Dữ liệu vào:** `maDatBan`, `maBan`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/dat-ban/:maDatBan/assign-tables`.
- **Trạng thái thay đổi:** `DatBan` gán bàn; `Ban.TrangThai` → `DA_DAT`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ gán bàn `TRONG`. Booking phải ở `DA_XAC_NHAN`.
- **Acceptance Criteria:**
  - Gán thành công → bàn chuyển `DA_DAT`.
  - Gán bàn đã có người → 400.

---

### UC-NV-05: Tiếp nhận đơn QR

- **Mã use case:** UC-NV-05
- **Tên use case:** Tiếp nhận đơn QR
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ
- **Mục tiêu:** Nhân viên theo dõi và tiếp nhận đơn hàng từ khách quét QR tại bàn.
- **Điều kiện bắt đầu:** Khách đã quét QR và gửi đơn tại bàn (`DonHang` với `MaBan` có trạng thái `DANG_CHUAN_BI`).
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/don-hang` hoặc xem từ sơ đồ bàn (UC-NV-02).
  2. Hệ thống hiển thị danh sách đơn mới từ QR (trạng thái `DANG_CHUAN_BI`).
  3. Nhân viên xác nhận đã tiếp nhận đơn.
  4. Đơn được chuyển vào luồng xử lý của bếp (UC-NV-08).
- **Luồng thay thế:**
  - Nhân viên thêm món vào đơn QR nếu khách yêu cầu thêm.
- **Luồng lỗi:**
  - Đơn không tồn tại hoặc đã xử lý: thông báo "Đơn không hợp lệ".
- **Dữ liệu vào:** `maDonHang` (từ danh sách đơn QR).
- **Dữ liệu ra:** Thông báo tiếp nhận, trạng thái đơn cập nhật.
- **API liên quan:** `GET /api/don-hang`, `GET /api/ban/:maBan/order`.
- **Trạng thái thay đổi:** Không thay đổi trạng thái đơn (đơn đã `DANG_CHUAN_BI` từ khi khách tạo).
- **Quy tắc nghiệp vụ:** `staff`. Đơn QR tự động tạo bởi hệ thống, nhân viên chỉ tiếp nhận và theo dõi.
- **Acceptance Criteria:**
  - Đơn QR xuất hiện trong danh sách đơn nội bộ.
  - Nhân viên có thể xem chi tiết đơn theo bàn.

---

### UC-NV-06: Phục vụ món

- **Mã use case:** UC-NV-06
- **Tên use case:** Phục vụ món
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ
- **Mục tiêu:** Nhân viên xác nhận đã mang món ra cho khách.
- **Điều kiện bắt đầu:** Có `ChiTietDonHang` ở trạng thái `HOAN_THANH` (bếp đã nấu xong, chờ mang ra).
- **Luồng chính:**
  1. Nhân viên xem danh sách món cần phục vụ tại bàn (từ sơ đồ bàn UC-NV-02).
  2. Nhân viên xác nhận đã mang món ra cho khách.
  3. Hệ thống cập nhật `ChiTietDonHang.TrangThai` → `DA_PHUC_VU`.
  4. Nếu tất cả món đã `DA_PHUC_VU` hoặc `DA_HUY`, gợi ý chuyển `DonHang` → `HOAN_THANH`.
- **Luồng thay thế:**
  - Nhân viên mang một phần món: cập nhật từng món riêng lẻ.
- **Luồng lỗi:**
  - Món đã phục vụ trước đó: thông báo "Món đã được phục vụ".
- **Dữ liệu vào:** `maDonHang`, `maMon`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/don-hang/:maDonHang/status` (chi tiết món).
- **Trạng thái thay đổi:** `ChiTietDonHang.TrangThai` → `DA_PHUC_VU`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ cập nhật được món đang ở trạng thái `HOAN_THANH`.
- **Acceptance Criteria:**
  - Cập nhật thành công → món chuyển `DA_PHUC_VU`.
  - Cập nhật món không phải `HOAN_THANH` → 400.

---

### UC-NV-07: Dọn bàn

- **Mã use case:** UC-NV-07
- **Tên use case:** Dọn bàn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ
- **Mục tiêu:** Sau khi khách rời, nhân viên dọn bàn và chuyển về `TRONG`.
- **Điều kiện bắt đầu:** Bàn ở trạng thái `DANG_DON` (sau khi đơn đã đóng).
- **Luồng chính:**
  1. Nhân viên xem sơ đồ bàn, thấy bàn ở trạng thái `DANG_DON`.
  2. Nhân viên dọn bàn thực tế.
  3. Nhân viên bấm "Sẵn sàng" trên giao diện.
  4. Hệ thống gọi `PATCH /api/ban/:maBan/status` với `trangThai = 'TRONG'`.
- **Luồng thay thế:**
  - Hệ thống tự động chuyển `DANG_DON` → `TRONG` sau timeout 15 phút.
- **Luồng lỗi:**
  - Bàn đang `CO_KHACH`: thông báo "Bàn đang có khách".
- **Dữ liệu vào:** `maBan`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/ban/:maBan/status`.
- **Trạng thái thay đổi:** `Ban.TrangThai` → `TRONG`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ dọn được bàn `DANG_DON`.
- **Acceptance Criteria:**
  - Dọn thành công → bàn về `TRONG`.
  - Dọn bàn đang có khách → 400.

---

## Nhóm bếp

### UC-NV-08: Xem đơn bếp

- **Mã use case:** UC-NV-08
- **Tên use case:** Xem danh sách đơn vào bếp
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Bếp
- **Mục tiêu:** Nhân viên bếp xem danh sách đơn cần chế biến.
- **Điều kiện bắt đầu:** Nhân viên đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/don-hang`.
  2. Hệ thống gọi `GET /api/don-hang` (filter trạng thái `DANG_CHUAN_BI`).
  3. Hiển thị danh sách đơn, mỗi đơn hiển thị: mã đơn, bàn, danh sách món, số lượng, ghi chú.
- **Luồng thay thế:**
  - Bếp lọc theo trạng thái hoặc bàn.
- **Luồng lỗi:**
  - Không có đơn: hiển thị trạng thái rỗng "Không có đơn cần chế biến".
- **Dữ liệu vào:** Token JWT (nội bộ).
- **Dữ liệu ra:** Danh sách `DonHang` + `ChiTietDonHang`.
- **API liên quan:** `GET /api/don-hang`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ hiển thị đơn có món cần chế biến.
- **Acceptance Criteria:**
  - Hiển thị đúng danh sách đơn.
  - Có trạng thái rỗng khi không có đơn.

---

### UC-NV-09: Nhận chế biến món

- **Mã use case:** UC-NV-09
- **Tên use case:** Nhận chế biến món
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Bếp
- **Mục tiêu:** Bếp xác nhận đã bắt đầu nấu món.
- **Điều kiện bắt đầu:** Có `ChiTietDonHang` ở trạng thái `DANG_CHUAN_BI`.
- **Luồng chính:**
  1. Bếp xem danh sách đơn (UC-NV-08).
  2. Bếp chọn món cần nấu, bấm "Nhận chế biến".
  3. Hệ thống cập nhật `ChiTietDonHang.TrangThai` → `DANG_PHUC_VU`.
  4. Nếu `DonHang` đang `DANG_CHUAN_BI`, tự động chuyển `DonHang` → `DANG_PHUC_VU`.
- **Luồng thay thế:**
  - Bếp nhận toàn bộ đơn cùng lúc.
- **Luồng lỗi:**
  - Món đã nấu xong: thông báo "Món đã hoàn thành".
- **Dữ liệu vào:** `maDonHang`, `maMon`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/don-hang/:maDonHang/status`.
- **Trạng thái thay đổi:** `ChiTietDonHang.TrangThai` → `DANG_PHUC_VU`; `DonHang.TrangThai` → `DANG_PHUC_VU`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ cập nhật được món `DANG_CHUAN_BI`.
- **Acceptance Criteria:**
  - Cập nhật thành công → món chuyển `DANG_PHUC_VU`.
  - Đơn tự động chuyển `DANG_PHUC_VU`.

---

### UC-NV-10: Cập nhật món sẵn sàng

- **Mã use case:** UC-NV-10
- **Tên use case:** Cập nhật món nấu xong
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Bếp
- **Mục tiêu:** Bếp thông báo món đã nấu xong, sẵn sàng mang ra.
- **Điều kiện bắt đầu:** Có `ChiTietDonHang` ở trạng thái `DANG_PHUC_VU`.
- **Luồng chính:**
  1. Bếp xem danh sách món đang nấu (UC-NV-08).
  2. Bếp chọn món đã xong, bấm "Hoàn thành".
  3. Hệ thống cập nhật `ChiTietDonHang.TrangThai` → `HOAN_THANH`.
  4. Nếu tất cả món trong đơn đạt `HOAN_THANH` hoặc `DA_HUY`, tự động chuyển `DonHang` → `HOAN_THANH`.
- **Luồng thay thế:**
  - Bếp hoàn thành từng món riêng lẻ.
- **Luồng lỗi:**
  - Món đã sẵn sàng trước đó: thông báo "Món đã được đánh dấu sẵn sàng".
- **Dữ liệu vào:** `maDonHang`, `maMon`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/don-hang/:maDonHang/status`.
- **Trạng thái thay đổi:** `ChiTietDonHang.TrangThai` → `HOAN_THANH`; `DonHang.TrangThai` → `HOAN_THANH` (nếu tất cả món đã xong).
- **Quy tắc nghiệp vụ:** `staff`. Chỉ cập nhật được món `DANG_PHUC_VU`.
- **Acceptance Criteria:**
  - Cập nhật thành công → món chuyển `HOAN_THANH`.
  - Đơn tự động chuyển `HOAN_THANH` khi tất cả món xong.

---

## Nhóm thu ngân

### UC-NV-11: Xem hóa đơn

- **Mã use case:** UC-NV-11
- **Tên use case:** Xem hóa đơn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Thu ngân
- **Mục tiêu:** Thu ngân xem chi tiết hóa đơn của bàn để đối chiếu trước khi thanh toán.
- **Điều kiện bắt đầu:** Bàn có `DonHang` đang mở hoặc đã yêu cầu thanh toán.
- **Luồng chính:**
  1. Thu ngân tìm đơn theo bàn hoặc mã đơn.
  2. Hệ thống gọi `GET /api/don-hang/:maDonHang`.
  3. Hiển thị chi tiết: danh sách món, số lượng, đơn giá, thành tiền, tạm tính, giảm giá, phí dịch vụ, tổng thanh toán.
- **Luồng thay thế:**
  - Thu ngân xem danh sách bàn đã yêu cầu thanh toán.
- **Luồng lỗi:**
  - Đơn không tồn tại: thông báo "Không tìm thấy đơn hàng".
- **Dữ liệu vào:** `maDonHang` hoặc `maBan`.
- **Dữ liệu ra:** `DonHang` + `ChiTietDonHang` + `HoaDon` (nếu có).
- **API liên quan:** `GET /api/don-hang/:maDonHang`, `GET /api/ban/:maBan/order`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `staff`. Xem được tất cả đơn.
- **Acceptance Criteria:**
  - Hiển thị đúng chi tiết đơn.
  - Có thông báo khi đơn không tồn tại.

---

### UC-NV-12: Áp voucher / điểm

- **Mã use case:** UC-NV-12
- **Tên use case:** Áp voucher và điểm cho hóa đơn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Thu ngân
- **Mục tiêu:** Thu ngân áp dụng voucher hoặc điểm tích lũy cho hóa đơn theo yêu cầu của khách.
- **Điều kiện bắt đầu:** Có `DonHang` cần thanh toán, khách có voucher/điểm.
- **Luồng chính:**
  1. Thu ngân nhập mã voucher khách cung cấp.
  2. Hệ thống gọi `POST /api/ma-giam-gia/validate`.
  3. Hệ thống kiểm tra mã hợp lệ, hiển thị số tiền giảm.
  4. Thu ngân nhập số điểm khách muốn dùng (nếu có).
  5. Hệ thống kiểm tra điểm khả dụng.
  6. Hiển thị tổng thanh toán sau giảm.
- **Luồng thay thế:**
  - Khách không có voucher/điểm: bỏ qua.
- **Luồng lỗi:**
  - Voucher hết hạn/hết lượt: thông báo "Mã không hợp lệ".
  - Voucher không đúng chủ: thông báo "Mã không thuộc về khách này".
- **Dữ liệu vào:** `maDonHang`, `maCode` (voucher), `soDiem` (điểm).
- **Dữ liệu ra:** Số tiền giảm, tổng thanh toán sau giảm.
- **API liên quan:** `POST /api/ma-giam-gia/validate`.
- **Trạng thái thay đổi:** Chưa thay đổi dữ liệu (chỉ xem trước). Thay đổi khi xác nhận thanh toán (UC-NV-13).
- **Quy tắc nghiệp vụ:** `staff`. Voucher `CUSTOMER/LOYALTY/VIP` phải đúng chủ.
- **Acceptance Criteria:**
  - Voucher hợp lệ → hiển thị giảm giá.
  - Voucher hết hạn → thông báo lỗi.

---

### UC-NV-13: Xác nhận thanh toán

- **Mã use case:** UC-NV-13
- **Tên use case:** Xác nhận thanh toán
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Thu ngân
- **Mục tiêu:** Thu ngân xác nhận khách đã thanh toán, chuyển đơn sang `DA_THANH_TOAN`.
- **Điều kiện bắt đầu:** Có `DonHang` đã được yêu cầu thanh toán hoặc thu ngân muốn đóng đơn.
- **Luồng chính:**
  1. Thu ngân kiểm tra hóa đơn (UC-NV-11), áp voucher/điểm (UC-NV-12) nếu có.
  2. Thu ngân chọn phương thức thanh toán (Tiền mặt, Chuyển khoản, MoMo, VNPay, ZaloPay).
  3. Thu ngân xác nhận thanh toán.
  4. Hệ thống gọi `POST /api/ban/:maBan/xac-nhan-thanh-toan` (tại bàn) hoặc `PATCH /api/don-hang/:maDonHang/status`.
  5. Hệ thống tạo `HoaDon` + `ThanhToan` (`TrangThai = 'THANH_CONG'`).
  6. Hệ thống cập nhật `DonHang.TrangThai` → `DA_THANH_TOAN`.
  7. Hệ thống tích điểm cho khách (nếu có `MaKH`).
  8. Hệ thống cập nhật `Ban.TrangThai` → `DANG_DON`.
  9. Hiển thị thông báo thành công + in hóa đơn.
- **Luồng thay thế:**
  - Thanh toán thất bại: thông báo lỗi, không thay đổi trạng thái đơn.
- **Luồng lỗi:**
  - Đơn đã thanh toán: thông báo "Đơn đã được thanh toán trước đó".
  - Phương thức thanh toán không hợp lệ: thông báo lỗi.
- **Dữ liệu vào:** `maDonHang`, `phuongThuc`, `maGiamGia` (optional), `soDiem` (optional).
- **Dữ liệu ra:** `HoaDon` + `ThanhToan`, thông báo thành công.
- **API liên quan:** `POST /api/ban/:maBan/xac-nhan-thanh-toan`, `PATCH /api/don-hang/:maDonHang/status`.
- **Trạng thái thay đổi:** `DonHang` → `DA_THANH_TOAN`; tạo `HoaDon` + `ThanhToan`; `Ban` → `DANG_DON`; tích điểm + cập nhật voucher.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ xác nhận được đơn chưa thanh toán. `PhuongThuc` lấy từ payload, không hard-code.
- **Acceptance Criteria:**
  - Thanh toán thành công → đơn, hóa đơn, thanh toán, bàn cập nhật đúng.
  - Tích điểm nếu có `MaKH`.

---

### UC-NV-14: Gọi món hộ khách tại bàn

- **Mã use case:** UC-NV-14
- **Tên use case:** Gọi món hộ khách tại bàn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Phục vụ
- **Mục tiêu:** Nhân viên gọi món hộ cho khách vãng lai không tự quét QR hoặc cần hỗ trợ.
- **Điều kiện bắt đầu:** Khách đang ngồi tại bàn, muốn gọi món qua nhân viên thay vì tự quét QR.
- **Luồng chính:**
  1. Nhân viên chọn bàn từ sơ đồ (UC-NV-02).
  2. Nhân viên chọn món từ thực đơn, thêm số lượng.
  3. Nhân viên xác nhận gửi đơn.
  4. Hệ thống gọi `POST /api/don-hang` với `MaBan`, danh sách món.
  5. Hệ thống tạo `DonHang` (`TrangThai = 'DANG_CHUAN_BI'`) + `ChiTietDonHang`.
  6. Hệ thống cập nhật `Ban.TrangThai` → `CO_KHACH`.
- **Luồng thay thế:**
  - Khách muốn thêm món sau: nhân viên thêm vào đơn hiện tại.
- **Luồng lỗi:**
  - Bàn đang `BAO_TRI`: thông báo "Bàn không khả dụng".
  - Bàn `TRONG` nhưng chưa check-in: tạo đơn trước, cập nhật bàn sau.
- **Dữ liệu vào:** `maBan`, danh sách `{ maMon, soLuong }`.
- **Dữ liệu ra:** `DonHang` với `maDonHang`, danh sách món, tổng tiền.
- **API liên quan:** `POST /api/don-hang`.
- **Trạng thái thay đổi:** Tạo `DonHang` (`DANG_CHUAN_BI`); `Ban.TrangThai` → `CO_KHACH`.
- **Quy tắc nghiệp vụ:** `staff`. Đơn gắn `MaBan`. Áp dụng cho khách vãng lai không cần đăng nhập.
- **Acceptance Criteria:**
  - Tạo đơn thành công → đơn trong DB, hiển thị trong danh sách bếp.
  - Bàn `BAO_TRI` không cho tạo đơn.

---

### UC-NV-15: In tạm tính / In hóa đơn

- **Mã use case:** UC-NV-15
- **Tên use case:** In tạm tính hoặc hóa đơn
- **Actor chính:** Nhân viên
- **Nghiệp vụ con:** Thu ngân
- **Mục tiêu:** Thu ngân in tạm tính (trước thanh toán) hoặc in hóa đơn (sau thanh toán) cho khách.
- **Điều kiện bắt đầu:** Có `DonHang` tại bàn.
- **Luồng chính:**
  1. Thu ngân chọn bàn hoặc mã đơn.
  2. Thu ngân bấm "In tạm tính" hoặc "In hóa đơn".
  3. Hệ thống gọi `GET /api/don-hang/:maDonHang` để lấy dữ liệu.
  4. Hệ thống hiển thị bản xem trước (PDF/HTML).
  5. Thu ngân xác nhận in.
  6. Hệ thống gửi yêu cầu in đến máy in (nếu có) hoặc hiển thị PDF để tải về.
- **Luồng thay thế:**
  - Thu ngân gửi hóa đơn qua email/SMS cho khách.
- **Luồng lỗi:**
  - Đơn không tồn tại: thông báo "Không tìm thấy đơn hàng".
  - Máy in không kết nối: thông báo "Không thể kết nối máy in".
- **Dữ liệu vào:** `maDonHang`, loại (`tamTinh` hoặc `hoaDon`).
- **Dữ liệu ra:** PDF hóa đơn/tạm tính.
- **API liên quan:** `GET /api/don-hang/:maDonHang`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu (chỉ xuất hóa đơn).
- **Quy tắc nghiệp vụ:** `staff`. Tạm tính không cần thanh toán trước. Hóa đơn chỉ in sau khi `DA_THANH_TOAN`.
- **Acceptance Criteria:**
  - In tạm tính thành công → PDF hiển thị đúng chi tiết.
  - In hóa đơn sau thanh toán → PDF hiển thị đúng tổng tiền, voucher, điểm.
  - In hóa đơn trước thanh toán → thông báo "Chưa thanh toán".
