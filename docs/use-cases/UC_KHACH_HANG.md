# Use Case: Khách hàng

Actor này bao gồm 2 loại: **Khách vãng lai tại bàn (QR)** — không cần đăng nhập, và **Khách có tài khoản/thành viên** — bắt buộc đăng nhập để đặt bàn, dùng voucher, tích điểm, đánh giá.
Trong API, quyền tương ứng là `customer-auth` (khách đã đăng nhập) hoặc `public` (khách vãng lai).

---

## UC-KH-01: Xem thực đơn

- **Mã use case:** UC-KH-01
- **Tên use case:** Xem thực đơn
- **Actor chính:** Khách hàng (cả vãng lai và có tài khoản)
- **Mục tiêu:** Khách xem danh sách món ăn theo danh mục, giá, hình ảnh để chọn món.
- **Điều kiện bắt đầu:** Khách đang ở trang chủ, trang thực đơn, hoặc đã quét QR bàn.
- **Luồng chính:**
  1. Khách truy cập `/thuc-don` hoặc quét QR → `/ban/:maBan/thuc-don`.
  2. Hệ thống hiển thị danh sách món ăn, phân loại theo danh mục.
  3. Khách có thể xem chi tiết món (tên, giá, mô tả, hình ảnh).
  4. Khách có thể lọc theo danh mục hoặc tìm kiếm.
- **Luồng thay thế:**
  - Nếu khách quét QR bàn, URL chứa `maBan` — hệ thống hiển thị thực đơn gắn với bàn đó, cho phép thêm món trực tiếp vào đơn của bàn.
- **Luồng lỗi:**
  - `MaBan` không hợp lệ: hiển thị thông báo "Bàn không tồn tại".
  - Không có dữ liệu món ăn: hiển thị trạng thái rỗng "Chưa có món ăn nào".
- **Dữ liệu vào:** `maBan` (optional, từ QR), từ khóa tìm kiếm (optional), `maDanhMuc` (optional).
- **Dữ liệu ra:** Danh sách `MonAn` có `MaMon`, `TenMon`, `Gia`, `HinhAnh`, `MoTa`, `TenDanhMuc`.
- **API liên quan:** `GET /api/thuc-don`, `GET /api/ban/:maBan/thuc-don`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** Public — không cần đăng nhập. Chỉ hiển thị món còn hoạt động (`TrangThai = 'Con'`).
- **Acceptance Criteria:**
  - Hiển thị danh sách món có phân trang.
  - Lọc theo danh mục hoạt động.
  - QR bàn hiển thị đúng thực đơn + cho phép gọi món.

---

## UC-KH-02: QR gọi món tại bàn

- **Mã use case:** UC-KH-02
- **Tên use case:** Gọi món tại bàn qua QR
- **Actor chính:** Khách hàng vãng lai (không cần đăng nhập)
- **Mục tiêu:** Khách quét QR, chọn món, gửi đơn đến bếp — không cần tài khoản.
- **Điều kiện bắt đầu:** Bàn có QR hợp lệ, bàn đang ở trạng thái `TRONG` hoặc `CO_KHACH`.
- **Luồng chính:**
  1. Khách quét QR trên bàn → vào trang `/ban/:maBan`.
  2. Hệ thống hiển thị thực đơn của bàn.
  3. Khách chọn món, chọn số lượng, thêm vào giỏ hàng tạm.
  4. Khách xác nhận gửi đơn.
  5. Hệ thống tạo `DonHang` với `MaBan`, `TrangThai = 'CHO_XU_LY'`.
  6. Hệ thống tạo `ChiTietDonHang` cho từng món (`TrangThai = 'CHO_CHE_BIEN'`).
  7. Hệ thống cập nhật `Ban.TrangThai = 'CO_KHACH'`.
  8. Trả về `maDonHang` cho khách.
- **Luồng thay thế:**
  - Khách muốn thêm món sau khi đã gửi đơn: quay lại bước 3 với đơn hiện tại (`GET /ban/:maBan/order`) → thêm món → gửi bổ sung.
- **Luồng lỗi:**
  - `MaBan` không tồn tại hoặc bàn đang `BAO_TRI`: thông báo "Bàn không khả dụng".
  - Không có món nào trong giỏ khi gửi: thông báo "Vui lòng chọn món".
- **Dữ liệu vào:** `maBan` (từ QR), danh sách `{ maMon, soLuong }`.
- **Dữ liệu ra:** `DonHang` gồm `maDonHang`, danh sách món, tổng tiền.
- **API liên quan:** `GET /api/ban/:maBan/thuc-don`, `POST /api/ban/:maBan/order`, `GET /api/ban/:maBan/order`.
- **Trạng thái thay đổi:** `DonHang` → `CHO_XU_LY`; `Ban.TrangThai` → `CO_KHACH`.
- **Quy tắc nghiệp vụ:**
  - Không yêu cầu đăng nhập. Đơn gắn `MaBan` (không `MaKH` nếu khách không đăng nhập).
  - Không có luồng đặt món online / mang về / ship — đơn phải gắn bàn.
  - Khách có thể nhập SĐT để tích điểm (tùy chọn).
- **Acceptance Criteria:**
  - Khách vãng lai tạo đơn thành công mà không cần token.
  - Đơn xuất hiện trong danh sách đơn bếp.
  - Bàn chuyển sang `CO_KHACH`.

---

## UC-KH-03: Yêu cầu thanh toán tại bàn

- **Mã use case:** UC-KH-03
- **Tên use case:** Yêu cầu thanh toán tại bàn
- **Actor chính:** Khách hàng vãng lai (không cần đăng nhập)
- **Mục tiêu:** Khách gửi yêu cầu thanh toán cho nhân viên thu ngân xử lý.
- **Điều kiện bắt đầu:** Có `DonHang` đang mở tại bàn (`TrangThai` chưa phải `DA_THANH_TOAN` hoặc `DA_HUY`).
- **Luồng chính:**
  1. Khách bấm "Yêu cầu thanh toán" trên giao diện bàn.
  2. Hệ thống gửi yêu cầu: `POST /api/ban/:maBan/yeu-cau-thanh-toan`.
  3. Nhân viên thu ngân nhận thông báo (dashboard nội bộ).
  4. Nhân viên đến bàn, kiểm tra đơn, xác nhận thanh toán (UC-NV-13).
- **Luồng thay thế:**
  - Khách muốn thanh toán trực tiếp tại quầy: nhân viên tra cứu đơn theo bàn.
- **Luồng lỗi:**
  - Đơn đã thanh toán hoặc đã hủy: thông báo "Đơn không còn hiệu lực".
- **Dữ liệu vào:** `maBan`.
- **Dữ liệu ra:** Thông báo thành công + thông tin đơn gửi đến nhân viên.
- **API liên quan:** `POST /api/ban/:maBan/yeu-cau-thanh-toan`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu (chỉ gửi thông báo).
- **Quy tắc nghiệp vụ:** Public — không cần đăng nhập. Thanh toán do nhân viên xác nhận (UC-NV-13).
- **Acceptance Criteria:**
  - Yêu cầu hiển thị trong dashboard nhân viên.
  - Khách nhận được phản hồi thành công.

---

## UC-KH-04: Đăng ký tài khoản

- **Mã use case:** UC-KH-04
- **Tên use case:** Đăng ký tài khoản khách hàng
- **Actor chính:** Khách hàng (mới, chưa có tài khoản)
- **Mục tiêu:** Khách tạo tài khoản để đặt bàn, tích điểm, đánh giá.
- **Điều kiện bắt đầu:** Khách chưa đăng nhập, chưa có tài khoản.
- **Luồng chính:**
  1. Khách truy cập `/dang-ky`, điền form (Họ tên, Email, SĐT, Mật khẩu).
  2. Hệ thống validate dữ liệu đầu vào.
  3. Hệ thống tạo `NguoiDung` (`VaiTro = 'KhachHang'`) + `KhachHang` liên kết.
  4. Hệ thống trả về token JWT để đăng nhập tự động.
  5. Chuyển hướng đến trang chủ.
- **Luồng thay thế:**
  - Khách đã có tài khoản: chuyển sang UC-KH-05 (Đăng nhập).
- **Luồng lỗi:**
  - Email/SĐT đã tồn tại: thông báo "Email hoặc SĐT đã được đăng ký".
  - Mật khẩu yếu: thông báo "Mật khẩu phải có ít nhất 6 ký tự".
  - Dữ liệu không hợp lệ: thông báo lỗi validate cụ thể.
- **Dữ liệu vào:** `hoTen`, `email`, `sdt`, `matKhau`.
- **Dữ liệu ra:** Token JWT + thông tin `NguoiDung`.
- **API liên quan:** `POST /api/auth/register`.
- **Trạng thái thay đổi:** Tạo mới `NguoiDung` (`VaiTro = 'KhachHang'`), `KhachHang`.
- **Quy tắc nghiệp vụ:**
  - Public — ai cũng có thể đăng ký.
  - Mật khẩu hash bằng bcrypt/argon2, cost ≥ 10.
  - Không cho phép đăng ký với vai trò `NhanVien` hoặc `Admin`.
- **Acceptance Criteria:**
  - Đăng ký thành công → tài khoản mới trong DB.
  - Trả token JWT hợp lệ.
  - Email/SĐT trùng → 409.

---

## UC-KH-05: Đăng nhập

- **Mã use case:** UC-KH-05
- **Tên use case:** Đăng nhập khách hàng
- **Actor chính:** Khách hàng (đã có tài khoản)
- **Mục tiêu:** Khách đăng nhập để sử dụng các chức năng yêu cầu xác thực.
- **Điều kiện bắt đầu:** Khách chưa đăng nhập, đã có tài khoản.
- **Luồng chính:**
  1. Khách truy cập `/dang-nhap`, nhập Email/SĐT + Mật khẩu.
  2. Hệ thống kiểm tra thông tin đăng nhập.
  3. Hệ thống trả token JWT (access + refresh).
  4. Lưu token và chuyển hướng đến trang trước đó hoặc trang chủ.
- **Luồng thay thế:**
  - Khách đăng nhập nội bộ: qua `/noi-bo/dang-nhap` (dành cho `NhanVien`/`Admin` — UC riêng).
- **Luồng lỗi:**
  - Sai Email/SĐT hoặc mật khẩu: thông báo "Sai thông tin đăng nhập".
  - Tài khoản bị khóa: thông báo "Tài khoản đã bị khóa".
- **Dữ liệu vào:** `tenDangNhap` (Email hoặc SĐT), `matKhau`.
- **Dữ liệu ra:** Token JWT (access + refresh), thông tin `NguoiDung`.
- **API liên quan:** `POST /api/auth/login`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu (chỉ tạo session/token).
- **Quy tắc nghiệp vụ:**
  - Public — ai cũng có thể gọi.
  - Access token thời hạn 15-30 phút, refresh token 7-30 ngày.
  - Không cho phép `NhanVien`/`Admin` đăng nhập qua luồng này.
- **Acceptance Criteria:**
  - Đăng nhập đúng → token hợp lệ.
  - Đăng nhập sai → 401.
  - `NhanVien` đăng nhập → bị từ chối (phải dùng internal-login).

---

## UC-KH-06: Đặt bàn

- **Mã use case:** UC-KH-06
- **Tên use case:** Đặt bàn trước
- **Actor chính:** Khách hàng (đã đăng nhập)
- **Mục tiêu:** Khách đặt bàn trước cho ngày giờ cụ thể.
- **Điều kiện bắt đầu:** Khách đã đăng nhập (có token JWT hợp lệ).
- **Luồng chính:**
  1. Khách truy cập `/dat-ban`, chọn ngày giờ, số người.
  2. Hệ thống kiểm tra khả dụng (`GET /api/dat-ban/availability`).
  3. Khách xem danh sách bàn trống (`Ban.TrangThai = 'TRONG'`), chọn bàn (hoặc để hệ thống tự gán).
  4. Khách xác nhận thông tin liên hệ (tự động lấy từ hồ sơ, có thể sửa).
  5. Hệ thống tạo `DatBan` với `TrangThai = 'CHO_XAC_NHAN'`, gắn `MaKH`.
  6. Trả về thông tin đặt bàn.
- **Luồng thay thế:**
  - Không có bàn trống: hiển thị "Không còn bàn trống trong khung giờ này", đề xuất khung giờ khác.
  - Khách muốn gọi món trước: có thể chọn món ngay sau khi đặt bàn thành công (đơn sẽ gắn `MaDatBan`).
- **Luồng lỗi:**
  - Ngày giờ trong quá khứ: thông báo "Vui lòng chọn thời gian trong tương lai".
  - Số người vượt quá sức chứa: thông báo "Số người vượt quá sức chứa tối đa".
- **Dữ liệu vào:** `ngayDat`, `gioDat`, `soNguoi`, `maBan` (optional), `ghiChu`.
- **Dữ liệu ra:** `DatBan` gồm `maDatBan`, thông tin bàn, thời gian.
- **API liên quan:** `GET /api/dat-ban/availability`, `POST /api/dat-ban`.
- **Trạng thái thay đổi:** Tạo `DatBan` (`TrangThai = 'CHO_XAC_NHAN'`).
- **Quy tắc nghiệp vụ:**
  - Bắt buộc đăng nhập (`customer-auth`). `DatBan` gắn `MaKH`.
  - Chỉ bàn `TRONG` được chọn. `BAO_TRI` không hiển thị.
  - Không cho phép đặt bàn public bằng tên + SĐT.
  - Sau khi đặt, bàn chưa chuyển `DA_DAT` ngay — chỉ chuyển khi staff duyệt (`DA_XAC_NHAN`).
- **Acceptance Criteria:**
  - Chưa đăng nhập → chuyển hướng đăng nhập.
  - Đặt thành công → `DatBan` trong DB với `MaKH` tương ứng.
  - Bàn `BAO_TRI` không hiển thị.

---

## UC-KH-07: Xem đặt bàn của tôi

- **Mã use case:** UC-KH-07
- **Tên use case:** Xem danh sách đặt bàn của tôi
- **Actor chính:** Khách hàng (đã đăng nhập)
- **Mục tiêu:** Khách xem lịch sử đặt bàn và trạng thái hiện tại.
- **Điều kiện bắt đầu:** Khách đã đăng nhập, đã có ít nhất một `DatBan`.
- **Luồng chính:**
  1. Khách truy cập `/ho-so`, chọn tab "Đặt bàn".
  2. Hệ thống gọi `GET /api/dat-ban/khach/:maKh`.
  3. Hiển thị danh sách đặt bàn theo thời gian (mới nhất trước).
  4. Mỗi đặt bàn hiển thị: mã, ngày giờ, số người, bàn, trạng thái.
- **Luồng thay thế:**
  - Không có đặt bàn nào: hiển thị trạng thái rỗng "Bạn chưa có đặt bàn nào".
- **Luồng lỗi:**
  - Token hết hạn: yêu cầu đăng nhập lại.
- **Dữ liệu vào:** `maKh` (từ token).
- **Dữ liệu ra:** Danh sách `DatBan` của khách.
- **API liên quan:** `GET /api/dat-ban/khach/:maKh`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `customer-own` — chỉ xem đặt bàn của chính mình (BE enforce).
- **Acceptance Criteria:**
  - Chỉ hiển thị đặt bàn của khách hiện tại.
  - Có trạng thái rỗng khi chưa có đặt bàn.
  - Có trạng thái loading khi đang tải.

---

## UC-KH-08: Hủy đặt bàn của tôi

- **Mã use case:** UC-KH-08
- **Tên use case:** Hủy đặt bàn
- **Actor chính:** Khách hàng (đã đăng nhập)
- **Mục tiêu:** Khách hủy đặt bàn khi không thể đến.
- **Điều kiện bắt đầu:** Khách đã đăng nhập, có `DatBan` ở trạng thái `CHO_XAC_NHAN` hoặc `DA_XAC_NHAN`.
- **Luồng chính:**
  1. Khách chọn đặt bàn cần hủy (từ danh sách UC-KH-07).
  2. Khách bấm "Hủy đặt bàn".
  3. Hệ thống hiển thị xác nhận "Bạn có chắc muốn hủy?".
  4. Khách xác nhận.
  5. Hệ thống gọi `PATCH /api/dat-ban/:maDatBan/status` với `trangThai = 'DA_HUY'`.
  6. Hiển thị thông báo "Hủy đặt bàn thành công".
- **Luồng thay thế:**
  - Đặt bàn ở trạng thái `DA_DEN` hoặc `HOAN_THANH`: không cho phép hủy (liên hệ nhà hàng).
- **Luồng lỗi:**
  - Đặt bàn không thuộc sở hữu: 403 "Bạn không có quyền hủy đặt bàn này".
  - Đặt bàn đã hủy: thông báo "Đặt bàn đã được hủy trước đó".
- **Dữ liệu vào:** `maDatBan`.
- **Dữ liệu ra:** Thông báo kết quả.
- **API liên quan:** `PATCH /api/dat-ban/:maDatBan/status`.
- **Trạng thái thay đổi:** `DatBan.TrangThai` → `DA_HUY`.
- **Quy tắc nghiệp vụ:**
  - `customer-own` — chỉ hủy đặt bàn của chính mình.
  - Chỉ hủy được khi trạng thái là `CHO_XAC_NHAN` hoặc `DA_XAC_NHAN`.
  - `DA_DEN` trở đi không cho hủy online.
- **Acceptance Criteria:**
  - Hủy thành công → `DatBan.TrangThai = 'DA_HUY'`.
  - Hủy đặt bàn của người khác → 403.
  - Hủy đặt bàn đã quá hạn → thông báo phù hợp.

---

## UC-KH-09: Xem lịch sử đơn hàng

- **Mã use case:** UC-KH-09
- **Tên use case:** Xem lịch sử đơn hàng
- **Actor chính:** Khách hàng (đã đăng nhập)
- **Mục tiêu:** Khách xem danh sách đơn hàng đã tạo và trạng thái.
- **Điều kiện bắt đầu:** Khách đã đăng nhập, đã có ít nhất một `DonHang` gắn `MaKH`.
- **Luồng chính:**
  1. Khách truy cập `/ho-so`, chọn tab "Đơn hàng".
  2. Hệ thống gọi `GET /api/don-hang/me`.
  3. Hiển thị danh sách đơn hàng (mới nhất trước).
  4. Mỗi đơn hàng hiển thị: mã, ngày tạo, bàn, tổng tiền, trạng thái.
  5. Khách có thể xem chi tiết đơn (`GET /api/don-hang/:maDonHang`).
- **Luồng thay thế:**
  - Khách vãng lai (không đăng nhập) không xem được lịch sử — đơn vãng lai không gắn `MaKH`.
  - Không có đơn hàng: hiển thị trạng thái rỗng.
- **Luồng lỗi:**
  - Token hết hạn: yêu cầu đăng nhập lại.
- **Dữ liệu vào:** `maKh` (từ token).
- **Dữ liệu ra:** Danh sách `DonHang` + `ChiTietDonHang`.
- **API liên quan:** `GET /api/don-hang/me`, `GET /api/don-hang/:maDonHang`.
- **Trạng thái thay đổi:** Không thay đổi dữ liệu.
- **Quy tắc nghiệp vụ:** `customer-own` — chỉ xem đơn của chính mình.
- **Acceptance Criteria:**
  - Chỉ hiển thị đơn gắn `MaKH` của khách.
  - Có trạng thái rỗng + loading.

---

## UC-KH-10: Dùng voucher / điểm tích lũy

- **Mã use case:** UC-KH-10
- **Tên use case:** Dùng voucher và điểm tích lũy khi thanh toán
- **Actor chính:** Khách hàng (đã đăng nhập, có voucher/điểm)
- **Mục tiêu:** Khách áp dụng mã giảm giá hoặc điểm tích lũy để giảm tiền thanh toán.
- **Điều kiện bắt đầu:** Khách đã đăng nhập, có `DonHang` đang mở, có voucher hoặc điểm khả dụng.
- **Luồng chính:**
  1. Tại màn hình thanh toán, khách nhập mã voucher (nếu có).
  2. Hệ thống gọi `POST /api/ma-giam-gia/validate` với `maCode`.
  3. Hệ thống kiểm tra: mã tồn tại, còn hạn, còn lượt, đúng chủ sở hữu (đối với `CUSTOMER/LOYALTY/VIP`).
  4. Hiển thị số tiền giảm cho khách.
  5. Khách nhập số điểm muốn dùng (nếu có).
  6. Hệ thống kiểm tra điểm khả dụng.
  7. Khách xác nhận thanh toán → voucher + điểm được áp dụng.
- **Luồng thay thế:**
  - Khách không có voucher: bỏ qua bước 1-4.
  - Khách không có điểm: bỏ qua bước 5-6.
  - Voucher hết hạn / hết lượt: FE ẩn nút "Áp dụng" (Q7).
- **Luồng lỗi:**
  - Voucher không đúng chủ (`CUSTOMER/LOYALTY/VIP`): BE trả 403.
  - Điểm không đủ: thông báo "Số điểm không khả dụng".
  - Voucher đã hết lượt: thông báo "Mã đã hết lượt sử dụng".
- **Dữ liệu vào:** `maCode` (voucher), `soDiem` (điểm), `maDonHang`.
- **Dữ liệu ra:** Số tiền giảm, tổng thanh toán sau giảm.
- **API liên quan:** `POST /api/ma-giam-gia/validate`.
- **Trạng thái thay đổi:** Nếu thanh toán thành công — `MaGiamGia.SoLanDaDung++`, `KhachHang.DiemTichLuy` trừ, tạo `GiaoDichDiem`.
- **Quy tắc nghiệp vụ:**
  - Voucher `CUSTOMER/LOYALTY/VIP` enforce ownership (BE trả 403 nếu không đúng chủ — Q8).
  - FE + BE validate 2 lớp (Q7).
  - Áp dụng tại thời điểm thanh toán, lưu snapshot.
  - Không cho phép khách vãng lai (không đăng nhập) dùng voucher/điểm.
- **Acceptance Criteria:**
  - Voucher hợp lệ → giảm tiền đúng.
  - Voucher `CUSTOMER` của người khác → 403.
  - Điểm dùng xong → trừ đúng trong DB.

---

## UC-KH-11: Đánh giá sau khi ăn

- **Mã use case:** UC-KH-11
- **Tên use case:** Đánh giá đơn hàng
- **Actor chính:** Khách hàng (đã đăng nhập, đã có đơn hoàn tất)
- **Mục tiêu:** Khách gửi đánh giá cho đơn hàng đã hoàn tất.
- **Điều kiện bắt đầu:** Khách đã đăng nhập, có `DonHang` đủ điều kiện đánh giá (`HOAN_THANH` hoặc `DA_THANH_TOAN`).
- **Luồng chính:**
  1. Khách truy cập `/danh-gia` hoặc từ chi tiết đơn hàng.
  2. Hệ thống gọi `GET /api/don-hang/co-the-danh-gia` để lấy đơn đủ điều kiện.
  3. Khách chọn đơn cần đánh giá.
  4. Khách nhập điểm (1-5 sao) + nội dung đánh giá.
  5. Hệ thống gọi `POST /api/danh-gia`.
  6. Hiển thị thông báo "Đánh giá thành công, chờ duyệt".
- **Luồng thay thế:**
  - Khách muốn đánh giá không dùng lời: chỉ chọn điểm sao.
- **Luồng lỗi:**
  - Đơn chưa hoàn tất: thông báo "Chỉ đánh giá đơn đã hoàn tất".
  - Đã đánh giá đơn này: thông báo "Bạn đã đánh giá đơn này".
  - Đơn không thuộc sở hữu: 403.
- **Dữ liệu vào:** `maDonHang`, `diem` (1-5), `noiDung` (optional).
- **Dữ liệu ra:** `DanhGia` gồm `maDanhGia`, trạng thái chờ duyệt.
- **API liên quan:** `GET /api/don-hang/co-the-danh-gia`, `POST /api/danh-gia`.
- **Trạng thái thay đổi:** Tạo `DanhGia` (`TrangThai = 'ChoDuyet'` hoặc `Approved` tùy cấu hình).
- **Quy tắc nghiệp vụ:**
  - `customer-own` — chỉ review đơn của chính mình.
  - Mỗi đơn chỉ được đánh giá một lần.
  - Đánh giá có thể cần admin duyệt trước khi hiển thị công khai.
- **Acceptance Criteria:**
  - Đánh giá thành công → bản ghi trong DB.
  - Đánh giá đơn của người khác → 403.
  - Đánh giá đơn chưa hoàn tất → 400.

---

## UC-KH-12: Xem hồ sơ / điểm tích lũy

- **Mã use case:** UC-KH-12
- **Tên use case:** Xem hồ sơ và điểm tích lũy
- **Actor chính:** Khách hàng (đã đăng nhập)
- **Mục tiêu:** Khách xem và sửa thông tin cá nhân, xem điểm tích lũy và lịch sử.
- **Điều kiện bắt đầu:** Khách đã đăng nhập.
- **Luồng chính:**
  1. Khách truy cập `/ho-so`.
  2. Hệ thống hiển thị thông tin cá nhân (họ tên, email, SĐT, địa chỉ).
  3. Hệ thống hiển thị số điểm hiện tại (`GET /api/diem-tich-luy/me`).
  4. Hệ thống hiển thị lịch sử biến động điểm (`GET /api/diem-tich-luy/me/history`).
  5. Khách có thể chỉnh sửa thông tin cá nhân (PUT).
- **Luồng thay thế:**
  - Khách muốn đổi mật khẩu: bấm "Đổi mật khẩu" → `PUT /api/auth/doi-mat-khau`.
- **Luồng lỗi:**
  - Token hết hạn: yêu cầu đăng nhập lại.
- **Dữ liệu vào:** `maKh` (từ token), thông tin cập nhật (nếu sửa).
- **Dữ liệu ra:** Thông tin `NguoiDung` + `KhachHang` + điểm + lịch sử điểm.
- **API liên quan:** `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/doi-mat-khau`, `GET /api/diem-tich-luy/me`, `GET /api/diem-tich-luy/me/history`.
- **Trạng thái thay đổi:** `PUT /api/auth/profile` → cập nhật thông tin. `PUT /api/auth/doi-mat-khau` → thay đổi mật khẩu.
- **Quy tắc nghiệp vụ:** `customer-own` — chỉ xem/sửa hồ sơ của chính mình.
- **Acceptance Criteria:**
  - Hiển thị đúng thông tin, điểm, lịch sử.
  - Sửa thông tin thành công.
  - Đổi mật khẩu thành công.
