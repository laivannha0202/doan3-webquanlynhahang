# Use Case: Nhân viên

Actor này bao gồm các nghiệp vụ nội bộ: **Phục vụ**, **Bếp**, **Thu ngân**.  
Trong API, quyền tương ứng là `staff` (JWT có `vaiTro='NhanVien'` hoặc `'Admin'`).

---

## Nhóm phục vụ

### UC-NV-01: Xem sơ đồ bàn

- **Mã use case:** UC-NV-01
- **Tên use case:** Xem sơ đồ bàn
- **Actor chính:** Nhân viên (phục vụ)
- **Mục tiêu:** Nhân viên xem danh sách bàn và trạng thái hiện tại để quản lý phục vụ.
- **Điều kiện bắt đầu:** Nhân viên đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/so-do-ban`.
  2. Hệ thống gọi `GET /api/ban`.
  3. Hiển thị sơ đồ bàn với trạng thái (TRONG, CO_KHACH, DA_DAT, DANG_DON, BAO_TRI).
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

### UC-NV-02: Check-in đặt bàn

- **Mã use case:** UC-NV-02
- **Tên use case:** Check-in đặt bàn
- **Actor chính:** Nhân viên (phục vụ)
- **Mục tiêu:** Khi khách đặt bàn đến nhà hàng, nhân viên xác nhận khách đã đến.
- **Điều kiện bắt đầu:** Có `DatBan` ở trạng thái `DA_XAC_NHAN`, bàn đã được gán.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/dat-ban`, tìm booking cần check-in.
  2. Nhân viên bấm "Khách đã đến".
  3. Hệ thống gọi `PATCH /api/dat-ban/:maDatBan/status` với `trangThai = 'DA_DEN'`.
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
- **Trạng thái thay đổi:** `DatBan.TrangThai` → `DA_DEN`; `Ban.TrangThai` → `CO_KHACH`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ check-in được khi `DatBan` đang ở `DA_XAC_NHAN`.
- **Acceptance Criteria:**
  - Check-in thành công → booking + bàn cập nhật trạng thái.
  - Booking không hợp lệ → 400.

---

### UC-NV-03: Gán bàn cho booking

- **Mã use case:** UC-NV-03
- **Tên use case:** Gán bàn cho booking
- **Actor chính:** Nhân viên (phục vụ)
- **Mục tiêu:** Nhân viên gán bàn cụ thể cho một đặt bàn đã xác nhận.
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

### UC-NV-04: Tạo đơn hộ khách

- **Mã use case:** UC-NV-04
- **Tên use case:** Tạo đơn hộ khách
- **Actor chính:** Nhân viên (phục vụ)
- **Mục tiêu:** Nhân viên tạo đơn gọi món thay khách tại bàn.
- **Điều kiện bắt đầu:** Bàn đang có khách (`CO_KHACH`), khách muốn gọi món qua nhân viên.
- **Luồng chính:**
  1. Nhân viên chọn bàn từ sơ đồ (UC-NV-01).
  2. Nhân viên chọn món từ thực đơn, thêm số lượng.
  3. Nhân viên xác nhận gửi đơn.
  4. Hệ thống gọi `POST /api/don-hang` với `MaBan`, danh sách món.
  5. Hệ thống tạo `DonHang` + `ChiTietDonHang`.
  6. Nếu bàn đang `TRONG`, hệ thống chuyển `CO_KHACH`.
- **Luồng thay thế:**
  - Khách muốn thêm món sau: nhân viên thêm vào đơn hiện tại.
- **Luồng lỗi:**
  - Bàn đang `BAO_TRI`: thông báo "Bàn không khả dụng".
- **Dữ liệu vào:** `maBan`, danh sách `{ maMon, soLuong }`.
- **Dữ liệu ra:** `DonHang` với `maDonHang`, danh sách món, tổng tiền.
- **API liên quan:** `POST /api/don-hang`.
- **Trạng thái thay đổi:** Tạo `DonHang` (`CHO_XU_LY`); `Ban.TrangThai` → `CO_KHACH` (nếu đang `TRONG`).
- **Quy tắc nghiệp vụ:** `staff`. Đơn gắn `MaBan`. Nhân viên có thể tạo đơn cho bất kỳ bàn nào.
- **Acceptance Criteria:**
  - Tạo đơn thành công → đơn trong DB.
  - Bàn `BAO_TRI` không cho tạo đơn.

---

### UC-NV-05: Xem đơn theo bàn

- **Mã use case:** UC-NV-05
- **Tên use case:** Xem đơn theo bàn
- **Actor chính:** Nhân viên (phục vụ)
- **Mục tiêu:** Nhân viên xem chi tiết đơn hàng đang mở tại bàn.
- **Điều kiện bắt đầu:** Bàn đang có khách (`CO_KHACH`), có `DonHang` mở.
- **Luồng chính:**
  1. Nhân viên chọn bàn từ sơ đồ (UC-NV-01).
  2. Hệ thống gọi `GET /api/ban/:maBan/order`.
  3. Hiển thị danh sách món, số lượng, trạng thái từng món, tổng tiền.
- **Luồng thay thế:**
  - Bàn có nhiều đơn: hiển thị tất cả đơn đang mở.
- **Luồng lỗi:**
  - Bàn không có đơn: thông báo "Bàn chưa có đơn nào".
- **Dữ liệu vào:** `maBan`.
- **Dữ liệu ra:** `DonHang` + `ChiTietDonHang` của bàn.
- **API liên quan:** `GET /api/ban/:maBan/order`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ xem đơn thuộc bàn được chỉ định.
- **Acceptance Criteria:**
  - Hiển thị đúng đơn của bàn.
  - Có trạng thái rỗng khi chưa có đơn.

---

### UC-NV-06: Cập nhật món đã phục vụ

- **Mã use case:** UC-NV-06
- **Tên use case:** Cập nhật món đã phục vụ
- **Actor chính:** Nhân viên (phục vụ)
- **Mục tiêu:** Nhân viên đánh dấu món đã mang ra cho khách.
- **Điều kiện bắt đầu:** Có `ChiTietDonHang` ở trạng thái `SAN_SANG`.
- **Luồng chính:**
  1. Nhân viên xem danh sách món `SAN_SANG` của bàn (UC-NV-05).
  2. Nhân viên xác nhận đã mang món ra cho khách.
  3. Hệ thống gọi API cập nhật `ChiTietDonHang.TrangThai` → `DA_PHUC_VU`.
  4. Nếu tất cả món đã `DA_PHUC_VU`/`DA_HUY`, gợi ý chuyển `DonHang` → `DA_PHUC_VU`.
- **Luồng thay thế:**
  - Nhân viên mang một phần món: cập nhật từng món riêng lẻ.
- **Luồng lỗi:**
  - Món đã phục vụ trước đó: thông báo "Món đã được phục vụ".
- **Dữ liệu vào:** `maDonHang`, `maMon`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/don-hang/:maDonHang/status` (chi tiết món).
- **Trạng thái thay đổi:** `ChiTietDonHang.TrangThai` → `DA_PHUC_VU`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ cập nhật được món đang `SAN_SANG`.
- **Acceptance Criteria:**
  - Cập nhật thành công → món chuyển `DA_PHUC_VU`.
  - Cập nhật món không phải `SAN_SANG` → 400.

---

### UC-NV-07: Dọn bàn

- **Mã use case:** UC-NV-07
- **Tên use case:** Dọn bàn
- **Actor chính:** Nhân viên (phục vụ)
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
- **Actor chính:** Nhân viên (bếp)
- **Mục tiêu:** Nhân viên bếp xem danh sách đơn cần chế biến.
- **Điều kiện bắt đầu:** Nhân viên đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/don-hang`.
  2. Hệ thống gọi `GET /api/don-hang` (filter trạng thái `CHO_XU_LY`, `DA_XAC_NHAN`, `DANG_CHE_BIEN`).
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

### UC-NV-09: Cập nhật món đang chế biến

- **Mã use case:** UC-NV-09
- **Tên use case:** Cập nhật món đang chế biến
- **Actor chính:** Nhân viên (bếp)
- **Mục tiêu:** Bếp xác nhận đã bắt đầu nấu món.
- **Điều kiện bắt đầu:** Có `ChiTietDonHang` ở trạng thái `CHO_CHE_BIEN`.
- **Luồng chính:**
  1. Bếp xem danh sách đơn (UC-NV-08).
  2. Bếp chọn món cần nấu, bấm "Nhận chế biến".
  3. Hệ thống cập nhật `ChiTietDonHang.TrangThai` → `DANG_CHE_BIEN`.
  4. Nếu `DonHang` đang `CHO_XU_LY`, tự động chuyển `DonHang` → `DA_XAC_NHAN`.
- **Luồng thay thế:**
  - Bếp nhận toàn bộ đơn cùng lúc.
- **Luồng lỗi:**
  - Món đã nấu xong: thông báo "Món đã hoàn thành".
- **Dữ liệu vào:** `maDonHang`, `maMon`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/don-hang/:maDonHang/status`.
- **Trạng thái thay đổi:** `ChiTietDonHang.TrangThai` → `DANG_CHE_BIEN`; `DonHang.TrangThai` → `DA_XAC_NHAN`.
- **Quy tắc nghiệp vụ:** `staff`. Chỉ cập nhật được món `CHO_CHE_BIEN`.
- **Acceptance Criteria:**
  - Cập nhật thành công → món chuyển `DANG_CHE_BIEN`.
  - Đơn tự động chuyển `DA_XAC_NHAN`.

---

### UC-NV-10: Cập nhật món sẵn sàng

- **Mã use case:** UC-NV-10
- **Tên use case:** Cập nhật món nấu xong
- **Actor chính:** Nhân viên (bếp)
- **Mục tiêu:** Bếp thông báo món đã nấu xong, sẵn sàng mang ra.
- **Điều kiện bắt đầu:** Có `ChiTietDonHang` ở trạng thái `DANG_CHE_BIEN`.
- **Luồng chính:**
  1. Bếp xem danh sách món đang nấu (UC-NV-08).
  2. Bếp chọn món đã xong, bấm "Hoàn thành".
  3. Hệ thống cập nhật `ChiTietDonHang.TrangThai` → `SAN_SANG`.
  4. Nếu tất cả món trong đơn đạt `SAN_SANG`/`DA_HUY`, tự động chuyển `DonHang` → `SAN_SANG`.
- **Luồng thay thế:**
  - Bếp hoàn thành từng món riêng lẻ.
- **Luồng lỗi:**
  - Món đã sẵn sàng trước đó: thông báo "Món đã được đánh dấu sẵn sàng".
- **Dữ liệu vào:** `maDonHang`, `maMon`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/don-hang/:maDonHang/status`.
- **Trạng thái thay đổi:** `ChiTietDonHang.TrangThai` → `SAN_SANG`; `DonHang.TrangThai` → `SAN_SANG` (nếu tất cả món đã xong).
- **Quy tắc nghiệp vụ:** `staff`. Chỉ cập nhật được món `DANG_CHE_BIEN`.
- **Acceptance Criteria:**
  - Cập nhật thành công → món chuyển `SAN_SANG`.
  - Đơn tự động chuyển `SAN_SANG` khi tất cả món xong.

---

## Nhóm thu ngân

### UC-NV-11: Xem hóa đơn

- **Mã use case:** UC-NV-11
- **Tên use case:** Xem hóa đơn
- **Actor chính:** Nhân viên (thu ngân)
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
- **Actor chính:** Nhân viên (thu ngân)
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
- **Dữ liệu ra:** Số tiền giảm, tổng thanh toán.
- **API liên quan:** `POST /api/ma-giam-gia/validate`.
- **Trạng thái thay đổi:** Chưa thay đổi dữ liệu (chỉ xem trước). Thay đổi khi xác nhận thanh toán (UC-NV-13).
- **Quy tắc nghiệp vụ:** `staff`. Voucher `CUSTOMER/LOYALTY/VIP` phải đúng chủ (Q8).
- **Acceptance Criteria:**
  - Voucher hợp lệ → hiển thị giảm giá.
  - Voucher hết hạn → thông báo lỗi.

---

### UC-NV-13: Xác nhận thanh toán

- **Mã use case:** UC-NV-13
- **Tên use case:** Xác nhận thanh toán
- **Actor chính:** Nhân viên (thu ngân)
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
- **Quy tắc nghiệp vụ:** `staff`. Chỉ xác nhận được đơn chưa thanh toán. `PhuongThuc` lấy từ payload, không hard-code (Q2).
- **Acceptance Criteria:**
  - Thanh toán thành công → đơn, hóa đơn, thanh toán, bàn cập nhật đúng.
  - Tích điểm nếu có `MaKH`.

---

## Chung

### UC-NV-14: Xem danh sách booking

- **Mã use case:** UC-NV-14
- **Tên use case:** Xem danh sách booking
- **Actor chính:** Nhân viên (tất cả)
- **Mục tiêu:** Nhân viên xem tất cả đặt bàn để quản lý và xử lý.
- **Điều kiện bắt đầu:** Nhân viên đã đăng nhập nội bộ.
- **Luồng chính:**
  1. Nhân viên truy cập `/noi-bo/dat-ban`.
  2. Hệ thống gọi `GET /api/dat-ban`.
  3. Hiển thị danh sách booking, có thể lọc theo trạng thái, ngày, bàn.
  4. Mỗi booking hiển thị: mã, tên khách, SĐT, ngày giờ, số người, bàn, trạng thái.
- **Luồng thay thế:**
  - Nhân viên bấm vào booking để xem chi tiết hoặc thao tác (check-in, hủy, gán bàn).
- **Luồng lỗi:**
  - Không có booking: hiển thị trạng thái rỗng.
- **Dữ liệu vào:** Token JWT (nội bộ).
- **Dữ liệu ra:** Danh sách `DatBan`.
- **API liên quan:** `GET /api/dat-ban`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `staff`. Xem được tất cả booking (không filter theo nhân viên).
- **Acceptance Criteria:**
  - Hiển thị đúng danh sách booking.
  - Có filter theo trạng thái/ngày.
  - Có trạng thái rỗng khi không có booking.
