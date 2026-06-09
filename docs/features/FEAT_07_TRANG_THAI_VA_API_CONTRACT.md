# FEAT-07: Trạng thái chuẩn & API Contract toàn hệ thống

> **Phạm vi:** Bảng trạng thái chuẩn cho tất cả entity (Ban, DatBan, DonHang, ChiTietDonHang, ThanhToan, Voucher), danh sách trạng thái cấm, và API contract chi tiết theo từng module.  
> **Tài liệu tham chiếu:** FEAT-01 đến FEAT-06.

---

## 1. Mục tiêu

- Định nghĩa **duy nhất** tất cả giá trị trạng thái (enum) cho mỗi entity.
- Liệt kê rõ ràng các trạng thái **cấm** — không được phép sử dụng trong code.
- Cung cấp API contract đầy đủ: Method, Endpoint, Quyền, Input, Output, Ghi chú cho từng module.
- Đảm bảo tính nhất quán giữa Frontend, Backend, và Database.

---

## 2. Actor sử dụng

| Actor | Vai trò | Ghi chú |
|-------|---------|---------|
| **Hệ thống** | Tài liệu tham khảo | Không có actor cụ thể — tất cả actors đều tham khảo tài liệu này |

---

## 3. Bảng trạng thái chuẩn

### 3.1 Ban (Bàn ăn)

| Trạng thái | Giá trị | Ý nghĩa | Màu hiển thị |
|------------|---------|---------|-------------|
| Trống | `TRONG` | Bàn sẵn sàng, không có khách | Xanh lá |
| Đã đặt | `DA_DAT` | Bàn đã được đặt trước, chờ khách đến | Vàng |
| Có khách | `CO_KHACH` | Có khách đang ngồi, dùng bữa | Cam |
| Cần dọn | `DANG_DON` | Khách đã rời đi, cần dọn dẹp | Đỏ |
| Bảo trì | `BAO_TRI` | Bàn đang bảo trì, không sử dụng được | Xám |

**Luồng trạng thái:**

```
TRONG ──đặt bàn──▶ DA_DAT ──khách đến──▶ CO_KHACH ──khách rời──▶ DANG_DON ──dọn xong──▶ TRONG
  │                   │                      │
  └──bảo trì──▶ BAO_TRI ◀──bảo trì──┘      │
       │                                      │
       └──────────▶ TRONG ◀──────────────────┘
```

### 3.2 DatBan (Đặt bàn)

| Trạng thái | Giá trị | Ý nghĩa |
|------------|---------|---------|
| Chờ xác nhận | `CHO_XAC_NHAN` | Khách đã đặt, chờ admin/nhân viên xác nhận |
| Đã xác nhận | `DA_XAC_NHAN` | Admin đã xác nhận, bàn được giữ |
| Đã nhận bàn | `DA_NHAN_BAN` | Khách đã đến nhận bàn |
| Hoàn thành | `HOAN_THANH` | Đã hoàn thành (thanh toán xong) |
| Không đến | `KHONG_DEN` | Khách không đến (admin đánh dấu hoặc tự động) |
| Đã hủy | `DA_HUY` | Khách hoặc admin hủy |

**Luồng trạng thái:**

```
CHO_XAC_NHAN ──xác nhận──▶ DA_XAC_NHAN ──khách đến──▶ DA_NHAN_BAN ──hoàn thành──▶ HOAN_THANH
       │                        │
       ├──khách hủy──▶ DA_HUY   ├──quá giờ──▶ KHONG_DEN
       │                        │
       └──hết chờ──▶ KHONG_DEN  └──hủy──▶ DA_HUY
```

### 3.3 DonHang (Đơn hàng)

| Trạng thái | Giá trị | Ý nghĩa | Actor chuyển |
|------------|---------|---------|-------------|
| Đang chuẩn bị | `DANG_CHUAN_BI` | Đơn mới tạo, chờ bếp chế biến | Tự động khi tạo |
| Đang phục vụ | `DANG_PHUC_VU` | Bếp bắt đầu chế biến / nhân viên đang phục vụ | Bếp / Phục vụ |
| Hoàn thành | `HOAN_THANH` | Tất cả món đã chế biến xong / đã phục vụ | Bếp / Phục vụ |
| Đã thanh toán | `DA_THANH_TOAN` | Thu ngân đã xác nhận thanh toán | **Thu ngân** |
| Đã hủy | `DA_HUY` | Đơn bị hủy (chưa bắt đầu chế biến) | Phục vụ / Admin |

**Luồng trạng thái:**

```
DANG_CHUAN_BI ──bếp bắt đầu──▶ DANG_PHUC_VU ──phục vụ xong──▶ HOAN_THANH ──thanh toán──▶ DA_THANH_TOAN
       │
       └──hủy──▶ DA_HUY
```

**Quy tắc:**
- `DANG_CHUAN_BI` → `DANG_PHUC_VU`: Chỉ khi bắt đầu chế biến / phục vụ
- `DANG_PHUC_VU` → `HOAN_THANH`: Khi tất cả ChiTietDonHang `HOAN_THANH`
- `HOAN_THANH` → `DA_THANH_TOAN`: **CHỈ Thu ngân** mới có quyền
- `DANG_CHUAN_BI` → `DA_HUY`: Chỉ khi chưa bắt đầu chế biến
- **KHÔNG** cho phép: `DANG_PHUC_VU` → `DA_HUY`, `HOAN_THANH` → `DA_HUY`, `DA_THANH_TOAN` → bất kỳ

### 3.4 ChiTietDonHang (Món trong đơn)

| Trạng thái | Giá trị | Ý nghĩa | Actor chuyển |
|------------|---------|---------|-------------|
| Đang chuẩn bị | `DANG_CHUAN_BI` | Món chờ bếp chế biến | Tự động khi tạo đơn |
| Đang phục vụ | `DANG_PHUC_VU` | Bếp đang chế biến món này | Bếp |
| Hoàn thành | `HOAN_THANH` | Chế biến xong, đã phục vụ | Bếp |
| Đã hủy | `DA_HUY` | Món bị hủy (nguyên liệu hết / khách yêu cầu) | Bếp / Phục vụ |

**Luồng trạng thái:**

```
DANG_CHUAN_BI ──bếp bắt đầu──▶ DANG_PHUC_VU ──hoàn thành──▶ HOAN_THANH
       │
       └──hủy──▶ DA_HUY
```

**Tự động cập nhật DonHang:**
- Khi **tất cả** ChiTietDonHang = `HOAN_THANH` → DonHang → `HOAN_THANH`
- Khi **tất cả** ChiTietDonHang = `DA_HUY` → DonHang → `DA_HUY`
- Khi **còn** ChiTietDonHang `DANG_CHUAN_BI` hoặc `DANG_PHUC_VU` → DonHang giữ nguyên

### 3.5 ThanhToan (Thanh toán)

| Trạng thái | Giá trị | Ý nghĩa |
|------------|---------|---------|
| Thành công | `THANH_CONG` | Thanh toán thành công |
| Thất bại | `THAT_BAI` | Thanh toán thất bại (lỗi hệ thống) |
| Đã hoàn tiền | `DA_HOAN_TIEN` | Đã hoàn tiền sau khi thanh toán thành công |

### 3.6 Voucher (Khuyến mãi)

| Trạng thái | Giá trị | Ý nghĩa |
|------------|---------|---------|
| Khả dụng | `KHADUNG` | Voucher khả dụng, khách có thể sử dụng |
| Đã sử dụng | `DA_SU_DUNG` | Voucher đã được áp dụng vào đơn |
| Hết hạn | `HET_HAN` | Voucher đã hết hạn sử dụng |

---

## 4. Danh sách trạng thái CẤM

> **Các trạng thái dưới đây KHÔNG được phép sử dụng trong code.**  
> Nếu tìm thấy → BUG cần fix ngay.

| Trạng thái cấm | Tại sao cấm | Thay thế bằng |
|----------------|-------------|-------------|
| `CHO_XU_LY` | Không có trong schema | `DANG_CHUAN_BI` (DonHang) hoặc `CHO_XAC_NHAN` (DatBan) |
| `CHO_CHE_BIEN` | Không có trong schema | `DANG_CHUAN_BI` |
| `DANG_CHUAN_BIEN` | Không có trong schema | `DANG_PHUC_VU` |
| `DANG_CHE_BIEN` | Lỗi chính tả / không chuẩn | `DANG_PHUC_VU` |
| `SAN_SANG` | Không có trong schema | `HOAN_THANH` |
| `DA_PHUC_VU` | Không có trong schema | `HOAN_THANH` (DonHang) hoặc `DANG_PHUC_VU` (ChiTietDonHang) |
| `DA_DEN` | Không có trong schema | `DA_NHAN_BAN` (DatBan) |

### Lệnh kiểm tra trạng thái cấm

```bash
# Kiểm tra trong backend
rg "CHO_XU_LY|CHO_CHE_BIEN|DANG_CHUAN_BIEN|DANG_CHE_BIEN|SAN_SANG|DA_PHUC_VU|DA_DEN" backend/nest-api/src/ --no-heading

# Kiểm tra trong frontend
rg "CHO_XU_LY|CHO_CHE_BIEN|DANG_CHUAN_BIEN|DANG_CHE_BIEN|SAN_SANG|DA_PHUC_VU|DA_DEN" frontend/src/ --no-heading

# Kiểm tra trong database schema
rg "CHO_XU_LY|CHO_CHE_BIEN|DANG_CHUAN_BIEN|DANG_CHE_BIEN|SAN_SANG|DA_PHUC_VU|DA_DEN" database/ --no-heading
```

**Kết quả mong đợi:** Không tìm thấy kết quả nào.

---

## 5. Bảng ánh xạ trạng thái cũ → mới (nếu cần refactor)

| Entity | Trạng thái cũ | Trạng thái mới | File cần sửa |
|--------|-------------|---------------|-------------|
| DonHang | `DANG_CHE_BIEN` | `DANG_PHUC_VU` | Frontend + Backend |
| DonHang | `SAN_SANG` | `HOAN_THANH` | Frontend + Backend |
| ChiTietDonHang | `DANG_CHE_BIEN` | `DANG_PHUC_VU` | Frontend + Backend |
| ChiTietDonHang | `SAN_SANG` | `HOAN_THANH` | Frontend + Backend |
| DatBan | `DA_DEN` | `DA_NHAN_BAN` | Frontend + Backend |

> **Lưu ý:** Bảng trên chỉ áp dụng nếu trong code vẫn còn dùng trạng thái cũ.  
> Cần chạy lệnh `rg` ở mục 4 để xác nhận.

---

## 6. API Contract — Module Auth (Xác thực)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `POST` | `/api/auth/register` | Public | `{ HoTen, SoDienThoai, Email, MatKhau }` | `KhachHang` (201) | Tạo tài khoản KH |
| `POST` | `/api/auth/login` | Public | `{ TenDangNhap, MatKhau }` | `{ access_token, refresh_token, user }` (200) | Đăng nhập |
| `GET` | `/api/auth/me` | Auth | Header: `Authorization: Bearer <token>` | `User` (200) | Lấy thông tin user hiện tại |
| `PUT` | `/api/auth/me` | Auth | `{ HoTen?, Email?, SoDienThoai? }` | `User` (200) | Cập nhật profile |
| `PUT` | `/api/auth/doi-mat-khau` | Auth | `{ MatKhauCu, MatKhauMoi }` | `{ message }` (200) | Đổi mật khẩu |

---

## 7. API Contract — Module ThucDon (Thực đơn + Danh mục + Món ăn)

> **Lưu ý:** DanhMuc và MonAn được quản lý chung trong module `thuc-don`.  
> Không có endpoint riêng `/api/danh-muc` hoặc `/api/mon-an`.

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/thuc-don` | Public | Query: `page`, `limit` | `{ data: MonAn[], total }` | Lấy danh sách món ăn |
| `GET` | `/api/thuc-don/ban/:maBan` | Public | `maBan` (path) | `{ data: MonAn[], total }` | Món ăn theo bàn |
| `POST` | `/api/thuc-don` | Admin | `ThucDonCreateDto` (bao gồm DanhMuc + MonAn) | `ThucDon` (201) | Tạo thực đơn mới |
| `PUT` | `/api/thuc-don` | Admin | `ThucDonUpdateDto` | `ThucDon` (200) | Cập nhật thực đơn |
| `DELETE` | `/api/thuc-don/:id` | Admin | `id` (path) | 200 | Xóa thực đơn |
| `POST` | `/api/thuc-don/upload` | Admin | `file` (multipart) | `{ url: string }` | Upload ảnh món ăn |

**Trạng thái MonAn:**
- `CON_HANG`: Còn hàng (mặc định)
- `HET`: Hết hàng
- `NGUNG_BAN`: Ngừng bán

---

## 9. API Contract — Module Ban (Bàn ăn)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/ban` | Public | Query: `MaKhuVuc`, `TrangThai`, `page`, `limit` | `{ data: Ban[], total }` | Lấy danh sách bàn |
| `GET` | `/api/ban/:maBan` | Public | `maBan` (path) | `Ban` (200) | Chi tiết bàn |
| `POST` | `/api/ban` | Admin | `{ TenBan, MaKhuVuc, SoChoNgoi, TrangThai? }` | `Ban` (201) | Tạo mới |
| `PUT` | `/api/ban/:maBan` | Admin | `{ TenBan?, MaKhuVuc?, SoChoNgoi?, TrangThai? }` | `Ban` (200) | Cập nhật |
| `PUT` | `/api/ban/:maBan/trang-thai` | Nhân viên (Phục vụ/Thu ngân) | `{ TrangThai }` | `Ban` (200) | Chỉ cập nhật trạng thái |
| `PUT` | `/api/ban/:maBan/dat-ban/:maDatBan/xep-ban` | Nhân viên (Phục vụ) | — | `Ban` (200) | Xếp bàn cho DatBan |
| `DELETE` | `/api/ban/:maBan` | Admin | — | 200 | Xóa mềm |

**Trạng thái Ban (xem mục 3.1):** `TRONG`, `DA_DAT`, `CO_KHACH`, `DANG_DON`, `BAO_TRI`

---

## 10. API Contract — Module KhuVuc (Khu vực)

> **Lưu ý:** Module `khu-vuc` tồn tại trong backend nhưng **không có endpoint trong `api.controller.ts`**.  
> Cần kiểm tra `khu-vuc.controller.ts` xem có endpoint riêng không.

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/khu-vuc` | Public | Query: `page`, `limit` | `{ data: KhuVuc[], total }` | Danh sách khu vực *(cần xác nhận)* |
| `POST` | `/api/khu-vuc` | Admin | `{ TenKhuVuc, MoTa? }` | `KhuVuc` (201) | Tạo mới *(cần xác nhận)* |
| `PUT` | `/api/khu-vuc/:maKhuVuc` | Admin | `{ TenKhuVuc?, MoTa? }` | `KhuVuc` (200) | Cập nhật *(cần xác nhận)* |
| `DELETE` | `/api/khu-vuc/:maKhuVuc` | Admin | — | 200 | Xóa mềm *(cần xác nhận)* |

---

## 11. API Contract — Module DonHang (Đơn hàng)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/don-hang` | Staff (NV) | Query: `page`, `limit`, `TrangThai`, `MaBan` | `{ data: DonHang[], total }` | Danh sách đơn (staff only) |
| `POST` | `/api/ban/:maBan/order` | Public (guest) / Staff | `maBan` (path) + `{ MaKH?, GhiChuDonHang?, ChiTietDonHang[] }` | `DonHang` (201) | Tạo đơn cho bàn |
| `GET` | `/api/ban/:maBan/order` | Public / Staff | `maBan` (path) | `DonHang` + `ChiTietDonHang` | Xem trạng thái đơn theo bàn |
| `PATCH` | `/api/don-hang/:maDonHang/status` | Staff | `{ TrangThai }` | `DonHang` (200) | Chuyển trạng thái đơn |
| `PATCH` | `/api/don-hang/chi-tiet/:maChiTiet/status` | Staff (Bếp) | `{ TrangThai }` | `ChiTietDonHang` (200) | Chuyển trạng thái món |

> **Lưu ý:** Không có endpoint `GET /api/don-hang/:maDonHang` riêng — khách dùng `GET /api/ban/:maBan/order`.  
> Không có endpoint `/api/don-hang/thu-ngan`, `/api/don-hang/bep` — staff dùng `GET /api/don-hang` với filter.

**Trạng thái DonHang (xem mục 3.3):** `DANG_CHUAN_BI`, `DANG_PHUC_VU`, `HOAN_THANH`, `DA_THANH_TOAN`, `DA_HUY`

**Trạng thái ChiTietDonHang (xem mục 3.4):** `DANG_CHUAN_BI`, `DANG_PHUC_VU`, `HOAN_THANH`, `DA_HUY`

---

## 12. API Contract — Module DatBan (Đặt bàn)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/dat-ban` | Auth (KH:自己的, Admin:all) | Query: `page`, `limit`, `TrangThai`, `MaKH` | `{ data: DatBan[], total }` | Danh sách đặt bàn |
| `GET` | `/api/dat-ban/:maDatBan` | Auth | `maDatBan` (path) | `DatBan` (200) | Chi tiết đặt bàn |
| `POST` | `/api/dat-ban` | KH (login required) | `{ MaKH, NgayDat, GioBatDau, SoLuongKhach, MaKhuVuc?, GhiChu? }` | `DatBan` (201) | **Bắt buộc có `MaKH`** |
| `PUT` | `/api/dat-ban/:maDatBan/xac-nhan` | Admin | — | `DatBan` (200) | `CHO_XAC_NHAN` → `DA_XAC_NHAN` |
| `PUT` | `/api/dat-ban/:maDatBan/huy` | Admin / KH (chính mình, chỉ `CHO_XAC_NHAN`) | — | `DatBan` (200) | → `DA_HUY` |
| `PUT` | `/api/dat-ban/:maDatBan/khong-den` | Admin | — | `DatBan` (200) | → `KHONG_DEN` |
| `PUT` | `/api/dat-ban/:maDatBan/nhan-ban` | Nhân viên (Phục vụ) | — | `DatBan` (200) | `DA_XAC_NHAN` → `DA_NHAN_BAN` |

**Trạng thái DatBan (xem mục 3.2):** `CHO_XAC_NHAN`, `DA_XAC_NHAN`, `DA_NHAN_BAN`, `HOAN_THANH`, `KHONG_DEN`, `DA_HUY`

---

## 13. API Contract — Module ThanhToan (Thanh toán)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `POST` | `/api/ban/:maBan/xac-nhan-thanh-toan` | **Thu ngân** | `{ PhuongThucThanhToan, MaVoucher?, SoTienKhachDua? }` | `ThanhToan` (201) | **CHỈ Thu ngân** |

> **Lưu ý:** Không có endpoint `/api/thanh-toan` riêng. Thanh toán thực hiện qua `POST /api/ban/:maBan/xac-nhan-thanh-toan`.

**Phương thức thanh toán:**
- `TIEN_MAT`: Tiền mặt
- `CHUYEN_KHOAN`: Chuyển khoản

**Trạng thái ThanhToan (xem mục 3.5):** `THANH_CONG`, `THAT_BAI`, `DA_HOAN_TIEN`

**Tự động cập nhật sau thanh toán:**
- `DonHang.TrangThai` → `DA_THANH_TOAN`
- `Ban.TrangThai` → `DANG_DON`
- `Voucher.TrangThai` → `DA_SU_DUNG` (nếu có)

---

## 14. API Contract — Module KhuyenMai / Voucher

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/khuyen-mai` | Admin | Query: `page`, `limit`, `TrangThai` | `{ data: KhuyenMai[], total }` | Danh sách chương trình KM |
| `GET` | `/api/khuyen-mai/:maKhuyenMai` | Admin | `maKhuyenMai` (path) | `KhuyenMai` (200) | Chi tiết |
| `POST` | `/api/khuyen-mai` | Admin | `KhuyenMaiCreateDto` | `KhuyenMai` (201) | Tạo chương trình KM |
| `PUT` | `/api/khuyen-mai/:maKhuyenMai` | Admin | `KhuyenMaiUpdateDto` | `KhuyenMai` (200) | Cập nhật |
| `DELETE` | `/api/khuyen-mai/:maKhuyenMai` | Admin | — | 200 | Xóa |
| `GET` | `/api/voucher/:maKH` | Auth (KH / Thu ngân) | `maKH`, query: `MaDonHang` | `{ data: VoucherKhachHang[] }` | Voucher của KH |

**Trạng thái Voucher (xem mục 3.6):** `KHADUNG`, `DA_SU_DUNG`, `HET_HAN`

---

## 15. API Contract — Module DanhGia (Đánh giá)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/danh-gia` | Admin | Query: `page`, `limit`, `SoSao`, `MaKH` | `{ data: DanhGia[], total }` | Danh sách đánh giá |
| `GET` | `/api/danh-gia/:maDanhGia` | Auth | `maDanhGia` (path) | `DanhGia` (200) | Chi tiết |
| `POST` | `/api/danh-gia` | KH (login required) | `{ MaKH, MaDonHang, SoSao, NoiDung? }` | `DanhGia` (201) | Đánh giá (1 đơn = 1 đánh giá) |
| `DELETE` | `/api/danh-gia/:maDanhGia` | Admin | — | 200 | Xóa đánh giá |

---

## 16. API Contract — Module NhanVien (Nhân viên)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/nhan-vien` | Admin | Query: `page`, `limit`, `ChucNangPhu`, `TrangThai` | `{ data: NhanVien[], total }` | Danh sách nhân viên |
| `GET` | `/api/nhan-vien/:maNhanVien` | Admin | `maNhanVien` (path) | `NhanVien` (200) | Chi tiết |
| `POST` | `/api/nhan-vien` | Admin | `NhanVienCreateDto` | `NhanVien` (201) | Tạo mới |
| `PUT` | `/api/nhan-vien/:maNhanVien` | Admin | `NhanVienUpdateDto` | `NhanVien` (200) | Cập nhật |
| `DELETE` | `/api/nhan-vien/:maNhanVien` | Admin | — | 200 | Ngừng hoạt động (soft delete) |

**Phân quyền nhân viên (ChucNangPhu):**
- `BEP`: Bếp — FEAT-04
- `PHUC_VU`: Phục vụ — FEAT-03
- `THU_NGAN`: Thu ngân — FEAT-05

---

## 17. API Contract — Module KhachHang (Khách hàng)

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/khach-hang` | Admin | Query: `page`, `limit`, `search` | `{ data: KhachHang[], total }` | Danh sách KH |
| `GET` | `/api/khach-hang/:maKH` | Admin | `maKH` (path) | `KhachHang` (200) | Chi tiết KH |

---

## 18. API Contract — Module Admin Dashboard & Báo cáo

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/thong-ke` | Admin | — | `ThongKe` (200) | Dashboard tổng quan |
| `GET` | `/api/thong-ke` | Admin | Query: `TuNgay`, `DenNgay` | `ThongKe` (200) | Báo cáo doanh thu |

---

## 19. Checklist đối chiếu code hiện tại

### Enum trong Database (`database/mysql_init_schema.sql`)

| Entity | Giá trị enum trong DB | Giá trị chuẩn | Khớp? |
|--------|----------------------|---------------|-------|
| `Ban.TrangThai` | `TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI` | `TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI` | ✅ |
| `DatBan.TrangThai` | `CHO_XAC_NHAN, DA_XAC_NHAN, DA_NHAN_BAN, HOAN_THANH, KHONG_DEN, DA_HUY` | `CHO_XAC_NHAN, DA_XAC_NHAN, DA_NHAN_BAN, HOAN_THANH, KHONG_DEN, DA_HUY` | ✅ |
| `DonHang.TrangThai` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | ✅ |
| `ChiTietDonHang.TrangThai` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_HUY` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_HUY` | ✅ |
| `ThanhToan.TrangThai` | `THANH_CONG, THAT_BAI, DA_HOAN_TIEN` | `THANH_CONG, THAT_BAI, DA_HOAN_TIEN` | ✅ |
| `MonAn.TrangThai` | `CON_HANG, HET, NGUNG_BAN` | `CON_HANG, HET, NGUNG_BAN` | ✅ |

### Trạng thái cấm trong code

```bash
# Backend
rg "CHO_XU_LY|CHO_CHE_BIEN|DANG_CHUAN_BIEN|DANG_CHE_BIEN|SAN_SANG|DA_PHUC_VU|DA_DEN" backend/nest-api/src/ --no-heading

# Frontend
rg "CHO_XU_LY|CHO_CHE_BIEN|DANG_CHUAN_BIEN|DANG_CHE_BIEN|SAN_SANG|DA_PHUC_VU|DA_DEN" frontend/src/ --no-heading
```

**Kết quả:** ❌ Không tìm thấy → ✅ Đúng

### API Endpoints kiểm tra

| Endpoint quan trọng | Tồn tại? | Ghi chú |
|---------------------|----------|---------|
| `POST /api/ban/:maBan/order` | ✅ | Tạo đơn — MaBan lấy từ URL path |
| `POST /api/ban/:maBan/xac-nhan-thanh-toan` | ✅ | Thanh toán — cần check quyền Thu ngân |
| `PATCH /api/don-hang/:maDonHang/status` | ✅ | Cập nhật trạng thái đơn |
| `PATCH /api/don-hang/chi-tiet/:maChiTiet/status` | ✅ | Cập nhật trạng thái món |
| `POST /api/dat-ban` | ✅ | Đặt bàn — check `MaKH` bắt buộc |

---

*Ghi chú: Tài liệu này là nguồn duy nhất cho tất cả trạng thái. Khi viết code, PHẢI tham khảo bảng ở mục 3. Không được tự ý tạo trạng thái mới. Trạng thái cấm ở mục 4 phải được kiểm tra định kỳ bằng lệnh rg.*
