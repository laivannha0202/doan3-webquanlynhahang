# FEAT_03: Nhân viên — Phục vụ bàn, đơn hàng, check-in đặt bàn

> Mã feature: FEAT_03
> Actor chính: **Nhân viên phục vụ** (đăng nhập nội bộ)
> Phiên bản: 1.0 — 2026-06-09

---

## 1. Mục tiêu

Cho phép nhân viên phục vụ quản lý sơ đồ bàn, check-in khách đặt bàn, gán/chuyển bàn, tiếp nhận đơn QR, phục vụ món cho khách, và dọn bàn sau khi khách rời.

Luồng này tương ứng với UC-NV-02 → UC-NV-07.

---

## 2. Actor sử dụng

| Actor | Quyền API | Ghi chú |
|-------|-----------|---------|
| Nhân viên phục vụ | `staff` | JWT `vaiTro='NhanVien'` hoặc `'Admin'` |

---

## 3. Route / trang liên quan

| Route | Mô tả | Component/Trang |
|-------|-------|----------------|
| `/noi-bo/so-do-ban` | Sơ đồ bàn (bản đồ trực quan) | `SoDoBanPage.jsx` |
| `/noi-bo/dat-ban` | Quản lý đặt bàn (danh sách + thao tác) | `DatBanNoiBoPage.jsx` |
| `/noi-bo/don-hang` | Danh sách đơn hàng (phục vụ / bếp) | `DonHangNoiBoPage.jsx` |
| `/noi-bo/quan-ly-ban` | Quản lý bàn (CRUD, trạng thái) | `QuanLyBanPage.jsx` |

---

## 4. Danh sách màn hình

### Màn hình 4.1: Sơ đồ bàn (`/noi-bo/so-do-ban`)
- Grid/bản đồ hiển thị tất cả bàn theo khu vực.
- Mỗi bàn hiển thị: tên bàn, trạng thái (`TRONG`, `DA_DAT`, `CO_KHACH`, `DANG_DON`, `BAO_TRI`), mã booking (nếu có).
- Click vào bàn → xem chi tiết: đơn hiện tại, booking, khách.
- Lọc theo trạng thái hoặc khu vực.

### Màn hình 4.2: Danh sách đặt bàn (`/noi-bo/dat-ban`)
- Bảng danh sách booking.
- Lọc: trạng thái (`CHO_XAC_NHAN`, `DA_XAC_NHAN`, `DA_NHAN_BAN`…), ngày.
- Thao tác: Duyệt (`CHO_XAC_NHAN → DA_XAC_NHAN`), Check-in (`DA_XAC_NHAN → DA_NHAN_BAN`), Gán bàn, Hủy.

### Màn hình 4.3: Danh sách đơn hàng (`/noi-bo/don-hang`)
- Bảng đơn hàng theo trạng thái.
- Lọc: `DANG_CHUAN_BI`, `DA_XAC_NHAN`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU`.
- Click vào đơn → xem chi tiết + cập nhật trạng thái.

### Màn hình 4.4: Quản lý bàn (`/noi-bo/quan-ly-ban`)
- CRUD bàn: thêm, sửa, xóa, chuyển trạng thái `BAO_TRI`.
- Xuất QR bàn.

---

## 5. Thành phần giao diện

### Component `SoDoBan`
- Grid layout hiển thị bàn.
- Badge màu theo trạng thái:
  - `TRONG`: xanh lá
  - `DA_DAT`: cam
  - `CO_KHACH`: đỏ
  - `DANG_DON`: vàng
  - `BAO_TRI`: xám

### Component `ChiTietBan`
- Modal/drawer khi click vào bàn.
- Thông tin: tên bàn, trạng thái, booking (nếu có), đơn hiện tại (nếu có).
- Nút thao tác: Check-in, Gán bàn, Dọn bàn.

### Component `DanhSachDatBan`
- Bảng phân trang.
- Filter trạng thái + ngày.
- Nút: Duyệt, Check-in, Hủy.

### Component `DanhSachDonHang`
- Bảng phân trang.
- Filter trạng thái.
- Badge trạng thái từng món.

### Component `QuanLyBanForm`
- Form thêm/sửa bàn: tên, khu vực, sức chứa, trạng thái.

---

## 6. Dữ liệu hiển thị

### Sơ đồ bàn (từ `GET /api/ban`)
```
[
  {
    maBan: string,
    tenBan: string,
    khuVuc: string,
    sucChua: number,
    trangThai: string,  // "TRONG" | "DA_DAT" | "CO_KHACH" | "DANG_DON" | "BAO_TRI"
    donHienTai: { maDonHang, tongTien, trangThai } | null,
    datBan: { maDatBan, khachHang, gioDat, soNguoi } | null
  }
]
```

### Danh sách đặt bàn (từ `GET /api/dat-ban`)
```
[
  {
    maDatBan: string,
    ngayDat: string,
    gioDat: string,
    soNguoi: number,
    trangThai: string,
    khachHang: { maKH, tenKH, sdt },
    ban: { maBan, tenBan } | null,
    ghiChu: string
  }
]
```

### Danh sách đơn hàng (từ `GET /api/don-hang`)
```
[
  {
    maDonHang: string,
    maBan: string,
    tenBan: string,
    trangThai: string,
    tongTien: number,
    soMon: number,
    ngayTao: string
  }
]
```

---

## 7. Form nhập liệu

### Form check-in đặt bàn
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `maDatBan` | (từ danh sách) | Có | Phải ở `DA_XAC_NHAN` |

### Form gán bàn
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `maBan` | select | Có | Bàn phải ở `TRONG` |
| `maDatBan` | (từ danh sách) | Có | Phải ở `DA_XAC_NHAN` |

### Form dọn bàn
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `maBan` | (từ sơ đồ) | Có | Bàn phải ở `DANG_DON` |

### Form thêm/sửa bàn
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `tenBan` | text | Có | ≥ 2 ký tự, trùng → 400 |
| `khuVuc` | text | Có | — |
| `sucChua` | number | Có | 1–20 |
| `trangThai` | select | Có | `TRONG` hoặc `BAO_TRI` |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động |
|-----|--------|-----------|
| "Duyệt" | Danh sách đặt bàn | `PATCH /api/dat-ban/:maDatBan/status` với `DA_XAC_NHAN` |
| "Check-in" | Danh sách đặt bàn / Chi tiết bàn | `PATCH /api/dat-ban/:maDatBan/status` với `DA_NHAN_BAN` |
| "Gán bàn" | Chi tiết đặt bàn | `PATCH /api/dat-ban/:maDatBan/assign-tables` |
| "Chuyển bàn" | Chi tiết đặt bàn | Gán bàn mới → bàn cũ về `TRONG`, bàn mới → `DA_DAT` |
| "Hủy" | Danh sách đặt bàn | `PATCH /api/dat-ban/:maDatBan/status` với `DA_HUY` |
| "Sẵn sàng" | Chi tiết bàn (DANG_DON) | `PATCH /api/ban/:maBan/status` với `TRONG` |
| "Xuất QR" | Quản lý bàn | `GET /api/ban/:maBan/qr` |
| "Thêm bàn" | Quản lý bàn | `POST /api/ban` |
| "Sửa bàn" | Quản lý bàn | `PUT /api/ban/:maBan` |
| "Xóa bàn" | Quản lý bàn | `DELETE /api/ban/:maBan` |
| "Bảo trì" | Quản lý bàn | `PATCH /api/ban/:maBan/status` với `BAO_TRI` |

---

## 9. API liên quan

### `GET /api/ban` — staff
- Danh sách tất cả bàn.
- Response: danh sách `Ban` + trạng thái + đơn/booking hiện tại.

### `GET /api/dat-ban` — staff
- Danh sách tất cả đặt bàn.

### `PATCH /api/dat-ban/:maDatBan/status` — staff
- Duyệt / Check-in / Hủy đặt bàn.
- Request: `{ trangThai: 'DA_XAC_NHAN' | 'DA_NHAN_BAN' | 'DA_HUY' }`
- Side effects:
  - `DA_XAC_NHAN`: `Ban.TrangThai` → `DA_DAT` (nếu đã gán bàn).
  - `DA_NHAN_BAN`: `Ban.TrangThai` → `CO_KHACH`.
  - `DA_HUY`: `Ban.TrangThai` → `TRONG` (nếu bàn đang `DA_DAT`).

### `PATCH /api/dat-ban/:maDatBan/assign-tables` — staff
- Gán bàn cho đặt bàn.
- Request: `{ maBan }`
- Constraint: Bàn phải ở `TRONG`.
- Side effect: `Ban.TrangThai` → `DA_DAT`.

### `GET /api/don-hang` — staff
- Danh sách đơn hàng (filter trạng thái).

### `GET /api/don-hang/:maDonHang` — staff
- Chi tiết đơn hàng.

### `PATCH /api/ban/:maBan/status` — staff
- Cập nhật trạng thái bàn (dọn bàn, bảo trì).
- Request: `{ trangThai: 'TRONG' | 'BAO_TRI' }`

### `GET /api/ban/:maBan/qr` — staff
- Xuất QR code cho bàn.

### `POST /api/ban` — admin
- Tạo bàn mới.

### `PUT /api/ban/:maBan` — admin
- Sửa thông tin bàn.

### `DELETE /api/ban/:maBan` — admin
- Xóa bàn.

---

## 10. Luồng xử lý chính

### 10a. Xem sơ đồ bàn
```
1. Nhân viên vào /noi-bo/so-do-ban
2. GET /api/ban → hiển thị sơ đồ
3. Click vào bàn → xem chi tiết
```

### 10b. Check-in đặt bàn
```
1. Từ danh sách đặt bàn, tìm booking DA_XAC_NHAN
2. Bấm "Check-in"
3. PATCH /api/dat-ban/:maDatBan/status { trangThai: 'DA_NHAN_BAN' }
4. Backend: DatBan.TrangThai → DA_NHAN_BAN, Ban.TrangThai → CO_KHACH
5. Hiển thị thông báo thành công
```

### 10c. Gán bàn
```
1. Từ chi tiết đặt bàn DA_XAC_NHAN
2. Xem danh sách bàn TRONG
3. Chọn bàn → bấm "Gán bàn"
4. PATCH /api/dat-ban/:maDatBan/assign-tables { maBan }
5. Backend: Ban.TrangThai → DA_DAT
6. Hiển thị thông báo thành công
```

### 10d. Dọn bàn
```
1. Từ sơ đồ bàn, thấy bàn ở DANG_DON
2. Nhân viên dọn bàn thực tế
3. Bấm "Sẵn sàng"
4. PATCH /api/ban/:maBan/status { trangThai: 'TRONG' }
5. Backend: Ban.TrangThai → TRONG
```

### 10e. Phục vụ món
```
1. Từ danh sách đơn hàng, xem đơn cần phục vụ
2. Xem chi tiết đơn → danh sách món + trạng thái
3. Cập nhật món đã phục vụ: ChiTietDonHang.TrangThai → DA_PHUC_VU
4. Khi tất cả món DA_PHUC_VU → gợi ý chuyển đơn → HOAN_THANH
```

---

## 11. Luồng thay thế

### 11a. Đổi bàn cho booking
```
1. Chọn booking đang gán bàn
2. Bàn cũ → TRONG
3. Gán bàn mới → DA_DAT
```

### 11b. Khách đến sớm
```
1. Check-in khách đến sớm hơn giờ đặt
2. Vẫn check-in được nếu bàn TRONG hoặc DA_DAT
```

### 11c. Khách đến trễ
```
1. Nhân viên chọn giữ bàn hoặc hủy booking
2. Hủy → DatBan.TrangThai → DA_HUY, Ban → TRONG
```

---

## 12. Luồng lỗi

| Mã lỗi | Tình huống | Hiển thị |
|---------|-----------|----------|
| `400` | Check-in booking đã hủy/hết hạn | "Booking không hợp lệ" |
| `400` | Gán bàn đang CO_KHACH | "Bàn không khả dụng" |
| `400` | Gán bàn BAO_TRI | "Bàn không khả dụng" |
| `400` | Dọn bàn đang CO_KHACH | "Bàn đang có khách" |
| `400` | Dọn bàn đang TRONG | "Bàn đã sẵn sàng" |
| `400` | Xóa bàn đang có đơn/booking | "Không thể xóa bàn đang hoạt động" |
| `400` | Tên bàn trùng | "Bàn đã tồn tại" |
| `404` | Đơn hàng không tồn tại | "Không tìm thấy đơn hàng" |

---

## 13. Trạng thái thay đổi

### Khi check-in đặt bàn
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DatBan` | `TrangThai` | `DA_XAC_NHAN` | `DA_NHAN_BAN` |
| `Ban` | `TrangThai` | `DA_DAT` | `CO_KHACH` |

### Khi gán bàn
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `Ban` (mới) | `TrangThai` | `TRONG` | `DA_DAT` |

### Khi dọn bàn
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `Ban` | `TrangThai` | `DANG_DON` | `TRONG` |

### Khi phục vụ món
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `ChiTietDonHang` | `TrangThai` | `SAN_SANG` | `DA_PHUC_VU` |

### Khi hủy đặt bàn
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DatBan` | `TrangThai` | `CHO_XAC_NHAN` / `DA_XAC_NHAN` | `DA_HUY` |
| `Ban` | `TrangThai` | `DA_DAT` | `TRONG` |

---

## 14. Phân quyền

| Endpoint | Mức quyền | Ghi chú |
|----------|-----------|--------|
| `GET /api/ban` | `staff` | Xem tất cả bàn |
| `PATCH /api/ban/:maBan/status` | `staff` | Dọn bàn, bảo trì |
| `GET /api/dat-ban` | `staff` | Xem tất cả booking |
| `PATCH /api/dat-ban/:maDatBan/status` | `staff` | Duyệt, check-in, hủy |
| `PATCH /api/dat-ban/:maDatBan/assign-tables` | `staff` | Gán bàn |
| `GET /api/don-hang` | `staff` | Xem tất cả đơn |
| `GET /api/don-hang/:maDonHang` | `staff` | Chi tiết đơn |
| `POST /api/ban` | `admin` | Tạo bàn mới |
| `PUT /api/ban/:maBan` | `admin` | Sửa bàn |
| `DELETE /api/ban/:maBan` | `admin` | Xóa bàn |
| `GET /api/ban/:maBan/qr` | `staff` | Xuất QR |

---

## 15. Acceptance Criteria

### AC-01: Xem sơ đồ bàn
- [ ] Hiển thị đúng trạng thái từng bàn
- [ ] Lọc theo trạng thái/khu vực
- [ ] Click vào bàn → xem chi tiết

### AC-02: Check-in đặt bàn
- [ ] Check-in thành công → `DatBan = DA_NHAN_BAN`, `Ban = CO_KHACH`
- [ ] Check-in booking đã hủy → 400

### AC-03: Gán bàn
- [ ] Gán thành công → `Ban = DA_DAT`
- [ ] Gán bàn đã có khách → 400

### AC-04: Dọn bàn
- [ ] Dọn thành công → `Ban = TRONG`
- [ ] Dọn bàn đang có khách → 400

### AC-05: Phục vụ món
- [ ] Cập nhật `ChiTietDonHang = DA_PHUC_VU`
- [ ] Tất cả món xong → gợi ý `DonHang = HOAN_THANH`

### AC-06: Quản lý bàn
- [ ] Thêm bàn thành công
- [ ] Sửa bàn thành công
- [ ] Xóa bàn trống thành công
- [ ] Xóa bàn đang có đơn → 400

---

## 16. Checklist đối chiếu code hiện tại

| # | Kiểm tra | File kiểm tra | Trạng thái |
|---|----------|---------------|-----------|
| 1 | `SoDoBanPage.jsx` tồn tại + route `/noi-bo/so-do-ban` | `frontend/src/pages/noiBo/` | ☐ |
| 2 | `DatBanNoiBoPage.jsx` tồn tại + route `/noi-bo/dat-ban` | `frontend/src/pages/noiBo/` | ☐ |
| 3 | `DonHangNoiBoPage.jsx` tồn tại + route `/noi-bo/don-hang` | `frontend/src/pages/noiBo/` | ☐ |
| 4 | `QuanLyBanPage.jsx` tồn tại + route `/noi-bo/quan-ly-ban` | `frontend/src/pages/noiBo/` | ☐ |
| 5 | `GET /api/ban` trả về danh sách bàn + trạng thái | `backend/nest-api/src/modules/ban/` | ☐ |
| 6 | `PATCH /api/dat-ban/:maDatBan/status` kiểm tra `staff` | `backend/nest-api/src/modules/dat-ban/` | ☐ |
| 7 | `PATCH /api/dat-ban/:maDatBan/assign-tables` kiểm tra `staff` | `backend/nest-api/src/modules/dat-ban/` | ☐ |
| 8 | `PATCH /api/ban/:maBan/status` kiểm tra `staff` | `backend/nest-api/src/modules/ban/` | ☐ |
| 9 | `POST /api/ban` kiểm tra `admin` | `backend/nest-api/src/modules/ban/` | ☐ |
| 10 | `DELETE /api/ban/:maBan` kiểm tra `admin` + check active orders | `backend/nest-api/src/modules/ban/` | ☐ |
