# FEAT_06: Admin / Quản lý

> Mã feature: FEAT_06
> Actor chính: **Admin / Quản lý** (đăng nhập nội bộ)
> Phiên bản: 1.0 — 2026-06-09

---

## 1. Mục tiêu

Admin quản lý toàn bộ hệ thống: thực đơn, bàn, nhân viên, khách hàng, voucher, đặt bàn, đơn hàng, đánh giá, và xem thống kê doanh thu.

Luồng này tương ứng với UC-AD-01 → UC-AD-07.

---

## 2. Actor sử dụng

| Actor | Quyền API | Ghi chú |
|-------|-----------|---------|
| Admin / Quản lý | `admin` | JWT `vaiTro='Admin'` |

---

## 3. Route / trang liên quan

| Route | Mô tả | Component/Trang |
|-------|-------|----------------|
| `/noi-bo/thuc-don` | Quản lý thực đơn | `NoiBoThucDonPage.jsx` |
| `/noi-bo/quan-ly-ban` | Quản lý bàn | `QuanLyBanPage.jsx` |
| `/noi-bo/nhan-vien` | Quản lý nhân viên | `NhanVienNoiBoPage.jsx` |
| `/noi-bo/dat-ban` | Quản lý đặt bàn | `DatBanNoiBoPage.jsx` |
| `/noi-bo/don-hang` | Quản lý đơn hàng | `DonHangNoiBoPage.jsx` |
| `/noi-bo/danh-gia` | Duyệt đánh giá | `DanhGiaNoiBoPage.jsx` |
| `/noi-bo/thong-ke` | Thống kê doanh thu | `NoiBoThongKePage.jsx` |
| `/noi-bo/dashboard` | Dashboard tổng quan | `DashboardPage.jsx` |

---

## 4. Danh sách màn hình

### Màn hình 4.1: Quản lý thực đơn
- Danh sách món ăn theo danh mục.
- Thêm/sửa/xóa món: tên, giá, danh mục, mô tả, hình ảnh.
- Upload hình ảnh món (`POST /api/upload/mon-an`).
- CRUD: `POST/PUT/DELETE /api/thuc-don/:maMon`.

### Màn hình 4.2: Quản lý bàn
- Danh sách bàn: tên, khu vực, sức chứa, trạng thái.
- Thêm/sửa/xóa bàn.
- Chuyển trạng thái `BAO_TRI` / `TRONG`.
- Xuất QR bàn (`GET /api/ban/:maBan/qr`).

### Màn hình 4.3: Quản lý nhân viên
- Danh sách nhân viên (từ `GET /api/nguoi-dung`).
- Tạo/sửa/xóa tài khoản nhân viên.
- Phân quyền: `NhanVien` / `Admin`.

### Màn hình 4.4: Quản lý đặt bàn
- Danh sách booking: ngày giờ, trạng thái, bàn.
- Lọc theo trạng thái/ngày.
- Duyệt/từ chối/hủy booking.
- Gán bàn cho booking.

### Màn hình 4.5: Quản lý đơn hàng
- Danh sách tất cả đơn.
- Can thiệp trạng thái đơn nếu cần.

### Màn hình 4.6: Duyệt đánh giá
- Danh sách đánh giá chờ duyệt (`ChoDuyet`).
- Duyệt/từ chối đánh giá.

### Màn hình 4.7: Thống kê doanh thu
- Biểu đồ doanh thu theo ngày/tháng/năm.
- Top món bán chạy.
- Tần suất bàn.

---

## 5. Thành phần giao diện

### Component `QuanLyThucDon`
- Table món ăn + filter danh mục + nút thêm/sửa/xóa.
- Modal form thêm/sửa món.
- Upload ảnh (drag & drop hoặc click).

### Component `QuanLyBan`
- Table bàn + filter trạng thái/khu vực.
- Modal form thêm/sửa bàn.
- Nút xuất QR.

### Component `QuanLyNhanVien`
- Table nhân viên + filter vai trò.
- Modal form tạo/sửa tài khoản.

### Component `QuanLyDatBan`
- Table booking + filter trạng thái/ngày.
- Nút: Duyệt, Hủy, Gán bàn.

### Component `DuyetDanhGia`
- Table đánh giá chờ duyệt.
- Nút: Duyệt, Từ chối.

---

## 6. Dữ liệu hiển thị

### Danh sách nhân viên (từ `GET /api/nguoi-dung`)
```
[
  {
    maND: string,
    hoTen: string,
    email: string,
    sdt: string,
    vaiTro: "NhanVien" | "Admin",
    trangThai: string,
    ngayTao: string
  }
]
```

### Danh sách đánh giá (từ `GET /api/danh-gia`)
```
[
  {
    maDanhGia: string,
    maDonHang: string,
    maKH: string,
    tenKH: string,
    diem: number,
    noiDung: string,
    trangThai: "ChoDuyet" | "Approved" | "Rejected",
    ngayTao: string
  }
]
```

---

## 7. Form nhập liệu

### Form thêm/sửa món ăn
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `tenMon` | text | Có | ≥ 2 ký tự, trùng → 400 |
| `gia` | number | Có | ≥ 0 |
| `maDanhMuc` | select | Có | Phải tồn tại |
| `moTa` | textarea | Không | ≤ 500 ký tự |
| `hinhAnh` | file | Không | jpg/png, ≤ 5MB |

### Form thêm/sửa bàn
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `tenBan` | text | Có | ≥ 2 ký tự, trùng → 400 |
| `khuVuc` | text | Có | — |
| `sucChua` | number | Có | 1–20 |
| `trangThai` | select | Có | `TRONG` hoặc `BAO_TRI` |

### Form tạo nhân viên
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `hoTen` | text | Có | ≥ 2 ký tự |
| `email` | email | Có | Email hợp lệ, trùng → 409 |
| `sdt` | tel | Có | 10 số, trùng → 409 |
| `matKhau` | password | Có | ≥ 6 ký tự |
| `vaiTro` | select | Có | `NhanVien` hoặc `Admin` |

### Form voucher
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `maCode` | text | Có | Trùng → 400 |
| `loaiMa` | select | Có | `GiamGia`, `CUSTOMER`, `LOYALTY`, `VIP` |
| `giaTri` | number | Có | > 0 |
| `ngayBatDau` | date | Có | — |
| `ngayKetThuc` | date | Có | ≥ ngayBatDau |
| `soLanToiDa` | number | Không | ≥ 0 |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động |
|-----|--------|-----------|
| "Thêm món" | Quản lý thực đơn | Mở form thêm |
| "Sửa" | Mỗi dòng | Mở form sửa |
| "Xóa" | Mỗi dòng | Xác nhận → `DELETE /api/thuc-don/:maMon` |
| "Upload ảnh" | Form thêm/sửa | `POST /api/upload/mon-an` |
| "Thêm bàn" | Quản lý bàn | Mở form thêm |
| "Sửa" | Mỗi dòng | Mở form sửa |
| "Xóa" | Mỗi dòng | `DELETE /api/ban/:maBan` |
| "Xuất QR" | Mỗi dòng | `GET /api/ban/:maBan/qr` |
| "Bảo trì" | Mỗi dòng | `PATCH /api/ban/:maBan/status` với `BAO_TRI` |
| "Duyệt" | Đặt bàn | `PATCH /api/dat-ban/:maDatBan/status` với `DA_XAC_NHAN` |
| "Hủy" | Đặt bàn | `PATCH /api/dat-ban/:maDatBan/status` với `DA_HUY` |
| "Gán bàn" | Đặt bàn | `PATCH /api/dat-ban/:maDatBan/assign-tables` |
| "Duyệt" | Đánh giá | `PATCH /api/danh-gia/:maDanhGia/duyet` với `Approved` |
| "Từ chối" | Đánh giá | `PATCH /api/danh-gia/:maDanhGia/duyet` với `Rejected` |

---

## 9. API liên quan

### Thực đơn
- `GET /api/thuc-don` — public
- `POST /api/thuc-don` — admin
- `PUT /api/thuc-don/:maMon` — admin
- `DELETE /api/thuc-don/:maMon` — admin
- `POST /api/upload/mon-an` — admin

### Bàn
- `GET /api/ban` — public
- `POST /api/ban` — admin
- `PUT /api/ban/:maBan` — admin
- `DELETE /api/ban/:maBan` — admin
- `PATCH /api/ban/:maBan/status` — admin (BAO_TRI/TRONG)
- `GET /api/ban/:maBan/qr` — staff

### Nhân viên
- `GET /api/nguoi-dung` — admin

### Đặt bàn
- `GET /api/dat-ban` — admin
- `PATCH /api/dat-ban/:maDatBan/status` — admin
- `PATCH /api/dat-ban/:maDatBan/assign-tables` — admin

### Đánh giá
- `GET /api/danh-gia` — public / staff (public chỉ Approved)
- `PATCH /api/danh-gia/:maDanhGia/duyet` — admin

### Thống kê
- `GET /api/thong-ke/tong-quan` — admin
- `GET /api/thong-ke/doanh-thu/ngay` — admin
- `GET /api/thong-ke/mon-ban-chay` — admin

---

## 10. Luồng xử lý chính

### 10a. Quản lý thực đơn
```
1. Admin vào /noi-bo/thuc-don
2. GET /api/thuc-don → danh sách món
3. Thêm món: POST /api/thuc-don + POST /api/upload/mon-an
4. Sửa món: PUT /api/thuc-don/:maMon
5. Xóa món: DELETE /api/thuc-don/:maMon
```

### 10b. Quản lý bàn
```
1. Admin vào /noi-bo/quan-ly-ban
2. GET /api/ban → danh sách bàn
3. Thêm bàn: POST /api/ban
4. Sửa bàn: PUT /api/ban/:maBan
5. Xóa bàn: DELETE /api/ban/:maBan (kiểm tra đơn/booking active)
6. Xuất QR: GET /api/ban/:maBan/qr
```

### 10c. Quản lý nhân viên
```
1. Admin vào /noi-bo/nhan-vien
2. GET /api/nguoi-dung → danh sách nhân viên
3. Tạo nhân viên: POST (tạo NguoiDung + NhanVien)
4. Sửa thông tin
5. Khóa/mở khóa tài khoản
```

### 10d. Quản lý đặt bàn
```
1. Admin vào /noi-bo/dat-ban
2. GET /api/dat-ban → danh sách booking
3. Duyệt: PATCH /api/dat-ban/:maDatBan/status { trangThai: 'DA_XAC_NHAN' }
4. Hủy: PATCH /api/dat-ban/:maDatBan/status { trangThai: 'DA_HUY' }
5. Gán bàn: PATCH /api/dat-ban/:maDatBan/assign-tables { maBan }
```

### 10e. Duyệt đánh giá
```
1. Admin vào /noi-bo/danh-gia
2. GET /api/danh-gia → filter ChoDuyet
3. Duyệt: PATCH /api/danh-gia/:maDanhGia/duyet { trangThai: 'Approved' }
4. Từ chối: PATCH /api/danh-gia/:maDanhGia/duyet { trangThai: 'Rejected' }
```

---

## 11. Luồng thay thế

### 11a. Xóa bàn đang có đơn/booking
```
1. DELETE /api/ban/:maBan → 400 "Không thể xóa bàn đang hoạt động"
```

### 11b. Gán bàn đã có khách
```
1. PATCH assign-tables với bàn đang CO_KHACH → 400 "Bàn không khả dụng"
```

### 11c. Tên bàn trùng
```
1. POST/PUT /api/ban → 400 "Bàn đã tồn tại"
```

---

## 12. Luồng lỗi

| Mã lỗi | Tình huống | Hiển thị |
|---------|-----------|----------|
| `400` | Tên bàn/món trùng | "Đã tồn tại" |
| `400` | Xóa bàn đang hoạt động | "Không thể xóa bàn đang hoạt động" |
| `400` | Gán bàn không khả dụng | "Bàn không khả dụng" |
| `400` | Ngày voucher không hợp lệ | "Ngày không hợp lệ" |
| `409` | Email/SĐT trùng khi tạo nhân viên | "Thông tin đã được sử dụng" |
| `404` | Đánh giá không tồn tại | "Không tìm thấy đánh giá" |

---

## 13. Trạng thái thay đổi

### Khi thêm bàn
| Entity | Field | Giá trị mới |
|--------|-------|-------------|
| `Ban` | `TrangThai` | `TRONG` |

### Khi duyệt đặt bàn
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DatBan` | `TrangThai` | `CHO_XAC_NHAN` | `DA_XAC_NHAN` |
| `Ban` | `TrangThai` | `TRONG` | `DA_DAT` (nếu đã gán bàn) |

### Khi hủy đặt bàn
| Entity | Field | Giá trị cũ | giá trị mới |
|--------|-------|-----------|-------------|
| `DatBan` | `TrangThai` | `CHO_XAC_NHAN` / `DA_XAC_NHAN` | `DA_HUY` |
| `Ban` | `TrangThai` | `DA_DAT` | `TRONG` |

### Khi duyệt đánh giá
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DanhGia` | `TrangThai` | `ChoDuyet` | `Approved` / `Rejected` |

### Khi xóa món
| Entity | Field | Giá trị mới |
|--------|-------|-------------|
| `MonAn` | — | DELETE |

---

## 14. Phân quyền

| Endpoint | Mức quyền | Ghi chú |
|----------|-----------|--------|
| `POST /api/thuc-don` | `admin` | — |
| `PUT /api/thuc-don/:maMon` | `admin` | — |
| `DELETE /api/thuc-don/:maMon` | `admin` | — |
| `POST /api/upload/mon-an` | `admin` | — |
| `POST /api/ban` | `admin` | — |
| `PUT /api/ban/:maBan` | `admin` | — |
| `DELETE /api/ban/:maBan` | `admin` | Check active orders |
| `PATCH /api/ban/:maBan/status` | `admin` | BAO_TRI / TRONG |
| `GET /api/nguoi-dung` | `admin` | Danh sách nhân viên |
| `GET /api/dat-ban` | `admin` | Tất cả booking |
| `PATCH /api/dat-ban/:maDatBan/status` | `admin` | Duyệt / Hủy |
| `PATCH /api/dat-ban/:maDatBan/assign-tables` | `admin` | — |
| `PATCH /api/danh-gia/:maDanhGia/duyet` | `admin` | Duyệt / Từ chối |
| `GET /api/thong-ke/*` | `admin` | Tất cả thống kê |

---

## 15. Acceptance Criteria

### AC-01: Quản lý thực đơn
- [ ] Thêm món thành công → hiển thị trong danh sách
- [ ] Sửa món thành công → thông tin cập nhật đúng
- [ ] Xóa món thành công → không còn trong danh sách
- [ ] Upload ảnh thành công

### AC-02: Quản lý bàn
- [ ] Thêm bàn thành công → bàn hiển thị trong danh sách
- [ ] Sửa bàn thành công
- [ ] Xóa bàn trống thành công
- [ ] Xóa bàn đang có đơn → 400
- [ ] Xuất QR thành công

### AC-03: Quản lý nhân viên
- [ ] Tạo nhân viên thành công
- [ ] Sửa thông tin thành công
- [ ] Email/SĐT trùng → 409

### AC-04: Quản lý đặt bàn
- [ ] Duyệt booking → `DA_XAC_NHAN`, bàn → `DA_DAT`
- [ ] Hủy booking → `DA_HUY`, bàn → `TRONG`

### AC-05: Duyệt đánh giá
- [ ] Duyệt → `Approved`, hiển thị công khai
- [ ] Từ chối → `Rejected`, ẩn

---

## 16. Checklist đối chiếu code hiện tại

| # | Kiểm tra | File kiểm tra | Trạng thái |
|---|----------|---------------|-----------|
| 1 | `POST/PUT/DELETE /api/thuc-don` kiểm tra `admin` | `backend/nest-api/src/modules/thuc-don/` | ☐ |
| 2 | `POST/PUT/DELETE /api/ban` kiểm tra `admin` | `backend/nest-api/src/modules/ban/` | ☐ |
| 3 | `DELETE /api/ban/:maBan` kiểm tra active orders | `backend/nest-api/src/modules/ban/` | ☐ |
| 4 | `GET /api/nguoi-dung` kiểm tra `admin` | `backend/nest-api/src/modules/nguoi-dung/` | ☐ |
| 5 | `PATCH /api/dat-ban/:maDatBan/status` kiểm tra `admin` | `backend/nest-api/src/modules/dat-ban/` | ☐ |
| 6 | `PATCH /api/danh-gia/:maDanhGia/duyet` kiểm tra `admin` | `backend/nest-api/src/modules/danh-gia/` | ☐ |
| 7 | `GET /api/thong-ke/*` kiểm tra `admin` | `backend/nest-api/src/modules/thong-ke/` | ☐ |
