# FEAT_02: Khách hàng có tài khoản — Đăng ký, Đăng nhập, Đặt bàn, Voucher, Đánh giá

> Mã feature: FEAT_02
> Actor chính: **Khách hàng có tài khoản** (bắt buộc đăng nhập)
> Phiên bản: 1.0 — 2026-06-09

---

## 1. Mục tiêu

Xây dựng toàn bộ luồng dành cho khách hàng đã có tài khoản: đăng ký, đăng nhập, quản lý hồ sơ, đặt bàn trước, xem/hủy đặt bàn, dùng voucher/tích điểm, và đánh giá sau khi ăn.

Luồng này tương ứng với UC-KH-04 → UC-KH-11.

---

## 2. Actor sử dụng

| Actor | Quyền API | Ghi chú |
|-------|-----------|---------|
| Khách hàng mới | `public` | Đăng ký tài khoản |
| Khách hàng đã đăng nhập | `customer-auth` | Đặt bàn, dùng voucher, đánh giá |
| Khách hàng own data | `customer-own` | Chỉ thao tác dữ liệu của mình |

---

## 3. Route / trang liên quan

| Route | Mô tả | Component/Trang |
|-------|-------|----------------|
| `/dang-ky` | Đăng ký tài khoản khách hàng | `DangKyPage.jsx` |
| `/dang-nhap` | Đăng nhập khách hàng | `DangNhapPage.jsx` |
| `/ho-so` | Hồ sơ cá nhân + lịch sử đơn hàng + đặt bàn | `HoSoPage.jsx` |
| `/dat-ban` | Đặt bàn trước | `DatBanPage.jsx` |
| `/danh-gia` | Đánh giá đơn hàng | `DanhGiaPage.jsx` |
| `/ma-giam-gia` | Quản lý voucher cá nhân (nếu có trang riêng) | — |

---

## 4. Danh sách màn hình

### Màn hình 4.1: Đăng ký (`/dang-ky`)
- Form nhập: Họ tên, Email, SĐT, Mật khẩu, Nhập lại mật khẩu.
- Nút "Đăng ký".
- Link "Đã có tài khoản? Đăng nhập".
- Validate: email đúng định dạng, SĐT 10 số, mật khẩu ≥ 6 ký tự.

### Màn hình 4.2: Đăng nhập (`/dang-nhap`)
- Form nhập: Email hoặc SĐT + Mật khẩu.
- Nút "Đăng nhập".
- Link "Chưa có tài khoản? Đăng ký".
- Hiển thị lỗi sai thông tin.

### Màn hình 4.3: Hồ sơ (`/ho-so`)
- Tab: Thông tin cá nhân | Đơn hàng | Đặt bàn | Điểm tích lũy.
- **Thông tin cá nhân:** Họ tên, SĐT, Email, Địa chỉ (inline edit).
- **Đơn hàng:** Danh sách đơn `GET /api/don-hang/me` (phân trang).
- **Đặt bàn:** Danh sách đặt bàn `GET /api/dat-ban/khach/:maKh`.
- **Điểm tích lũy:** Tổng điểm, lịch sử giao dịch điểm.

### Màn hình 4.4: Đặt bàn (`/dat-ban`)
- Chọn ngày, giờ đặt.
- Chọn số người.
- Chọn bàn trống (từ danh sách `Ban.TrangThai = 'TRONG'`).
- Nhập/ghi chú đặc biệt.
- Nhập mã voucher (tùy chọn).
- Xem trước: ngày giờ, bàn, số người, voucher (nếu có).
- Nút "Xác nhận đặt bàn".

### Màn hình 4.5: Chi tiết đặt bàn (từ `/ho-so`)
- Mã đặt bàn, ngày giờ, số người, bàn, trạng thái.
- Nút "Hủy đặt bàn" (nếu `CHO_XAC_NHAN` hoặc `DA_XAC_NHAN`).
- Trạng thái: `CHO_XAC_NHAN`, `DA_XAC_NHAN`, `DA_NHAN_BAN`, `HOAN_THANH`, `DA_HUY`, `KHONG_DEN`, `HET_HAN`.

### Màn hình 4.6: Đánh giá (`/danh-gia`)
- Danh sách đơn đủ điều kiện (`GET /api/don-hang/co-the-danh-gia`).
- Chọn đơn cần đánh giá.
- Nhập điểm (1-5 sao) + nội dung (tùy chọn).
- Nút "Gửi đánh giá".

### Màn hình 4.7: Dùng voucher tại thanh toán
- Nhập mã voucher → `POST /api/ma-giam-gia/validate`.
- Hiển thị số tiền giảm.
- Nhập số điểm muốn dùng (tùy chọn).
- FE ẩn nút "Áp dụng" khi voucher `EXPIRED/USED_UP/INACTIVE` (Q7).

---

## 5. Thành phần giao diện

### Component `DangKyForm`
- Form 5 field + validate client-side.
- Gọi `POST /api/auth/register`.

### Component `DangNhapForm`
- Form 2 field + submit.
- Gọi `POST /api/auth/login`.

### Component `HoSoPage`
- Tabs: Thông tin | Đơn hàng | Đặt bàn | Điểm.
- TabsContent cho mỗi tab.

### Component `DatBanForm`
- Date picker, time picker, number input (số người).
- Danh sách bàn trống (grid/badge trạng thái).
- Input mã voucher.
- Nút xác nhận.

### Component `DanhGiaForm`
- Star rating (1-5).
- Textarea nội dung (optional).
- Gọi `POST /api/danh-gia`.

### Component `VoucherInput`
- Input mã voucher + nút "Áp dụng".
- Gọi `POST /api/ma-giam-gia/validate`.
- Hiển thị kết quả: mã hợp lệ → số tiền giảm; không hợp lệ → lỗi.

---

## 6. Dữ liệu hiển thị

### Profile (từ `GET /api/auth/me`)
```
{
  maND: string,
  hoTen: string,
  email: string,
  sdt: string,
  vaiTro: "KhachHang",
  khachHang: {
    maKH: string,
    tenKH: string,
    diemTichLuy: number
  }
}
```

### Danh sách đặt bàn (từ `GET /api/dat-ban/khach/:maKh`)
```
[
  {
    maDatBan: string,
    ngayDat: string,  // "2026-06-15"
    gioDat: string,   // "19:00"
    soNguoi: number,
    trangThai: string,  // "CHO_XAC_NHAN" | "DA_XAC_NHAN" | ...
    ban: { maBan: string, tenBan: string } | null,
    ghiChu: string
  }
]
```

### Danh sách đánh giá (từ `GET /api/don-hang/co-the-danh-gia`)
```
[
  {
    maDonHang: string,
    ngayTao: string,
    tongTien: number,
    daDanhGia: boolean
  }
]
```

---

## 7. Form nhập liệu

### Form đăng ký
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `hoTen` | text | Có | ≥ 2 ký tự |
| `email` | email | Có | Email hợp lệ, trùng → 409 |
| `sdt` | tel | Có | 10 số, trùng → 409 |
| `matKhau` | password | Có | ≥ 6 ký tự |
| `nhapLaiMatKhau` | password | Có | Phải khớp `matKhau` |

### Form đăng nhập
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `tenDangNhap` | text | Có | Email hoặc SĐT |
| `matKhau` | password | Có | — |

### Form đặt bàn
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `ngayDat` | date | Có | ≥ hôm nay |
| `gioDat` | time | Có | Trong giờ mở cửa |
| `soNguoi` | number | Có | 1–20 |
| `maBan` | select | Không | Bàn `TRONG` |
| `ghiChu` | textarea | Không | ≤ 500 ký tự |
| `maCode` (voucher) | text | Không | `POST /api/ma-giam-gia/validate` |

### Form đánh giá
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `diem` | star (1-5) | Có | 1 ≤ diem ≤ 5 |
| `noiDung` | textarea | Không | ≤ 1000 ký tự |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động |
|-----|--------|-----------|
| "Đăng ký" | Form đăng ký | `POST /api/auth/register` → auto login |
| "Đăng nhập" | Form đăng nhập | `POST /api/auth/login` → lưu token |
| "Chỉnh sửa" | Hồ sơ cá nhân | Toggle inline edit |
| "Lưu" | Hồ sơ (edit mode) | `PUT /api/auth/profile` |
| "Đặt bàn" | Trang đặt bàn | `POST /api/dat-ban` |
| "Hủy đặt bàn" | Chi tiết đặt bàn | `PATCH /api/dat-ban/:maDatBan/status` với `DA_HUY` |
| "Áp dụng voucher" | Thanh toán | `POST /api/ma-giam-gia/validate` |
| "Gửi đánh giá" | Form đánh giá | `POST /api/danh-gia` |

---

## 9. API liên quan

### `POST /api/auth/register` — Public
- Đăng ký tài khoản khách hàng.
- Request: `{ hoTen, email, sdt, matKhau }`
- Response: `{ token, nguoiDung }`
- Side effect: Tạo `NguoiDung` (`VaiTro = 'KhachHang'`) + `KhachHang`.

### `POST /api/auth/login` — Public
- Đăng nhập khách hàng.
- Request: `{ tenDangNhap, matKhau }`
- Response: `{ token, nguoiDung }`
- Error: `401` sai thông tin, `403` nếu `NhanVien`/`Admin`.

### `GET /api/auth/me` — customer-own
- Lấy thông tin user đang đăng nhập.

### `PUT /api/auth/profile` — customer-own
- Cập nhật hồ sơ cá nhân.

### `GET /api/dat-ban/khach/:maKh` — customer-own
- Lấy danh sách đặt bàn của khách.

### `POST /api/dat-ban` — customer-auth
- Tạo đặt bàn mới.
- Request: `{ ngayDat, gioDat, soNguoi, maBan?, ghiChu?, maCode? }`
- Response: `{ maDatBan, trangThai: 'CHO_XAC_NHAN' }`
- Constraint: `DatBat` phải gắn `MaKH`.

### `PATCH /api/dat-ban/:maDatBan/status` — customer-own
- Hủy đặt bàn.
- Request: `{ trangThai: 'DA_HUY' }`
- Constraint: Chỉ `CHO_XAC_NHAN` hoặc `DA_XAC_NHAN` mới hủy được.

### `POST /api/ma-giam-gia/validate` — public
- Kiểm tra voucher hợp lệ.
- Request: `{ maCode }`
- Response: `{ hopLe, soTienGiam, loaiMa, phamVi }`

### `GET /api/don-hang/me` — customer-own
- Lịch sử đơn hàng của khách.

### `GET /api/don-hang/co-the-danh-gia` — customer-own
- Danh sách đơn đủ điều kiện đánh giá.

### `POST /api/danh-gia` — customer-own
- Gửi đánh giá.
- Request: `{ maDonHang, diem, noiDung? }`

---

## 10. Luồng xử lý chính

### 10a. Đăng ký
```
1. Khách vào /dang-ky
2. Điền form (hoTen, email, sdt, matKhau)
3. Validate client-side
4. POST /api/auth/register
5. Backend tạo NguoiDung + KhachHang
6. Trả JWT token
7. Lưu token → chuyển hướng /ho-so hoặc trang trước đó
```

### 10b. Đăng nhập
```
1. Khách vào /dang-nhap
2. Nhập tenDangNhap + matKhau
3. POST /api/auth/login
4. Kiểm tra thông tin → trả JWT
5. Lưu token → chuyển hướng trang trước đó hoặc /
```

### 10c. Đặt bàn
```
1. Khách vào /dat-ban (đăng nhập)
2. Chọn ngày, giờ, số người
3. GET /api/dat-ban/availability → kiểm tra khả dụng
4. Hiển thị danh sách bàn trống (TRONG)
5. Khách chọn bàn (hoặc để hệ thống tự gán)
6. Nhập voucher (tùy chọn) → validate
7. Bấm "Xác nhận đặt bàn"
8. POST /api/dat-ban
9. Backend tạo DatBan (CHO_XAC_NHAN) gắn MaKH
10. Hiển thị thông báo thành công
```

### 10d. Hủy đặt bàn
```
1. Từ /ho-so → tab Đặt bàn
2. Chọn đặt bàn cần hủy
3. Bấm "Hủy đặt bàn"
4. Xác nhận "Bạn có chắc muốn hủy?"
5. PATCH /api/dat-ban/:maDatBan/status { trangThai: 'DA_HUY' }
6. Hiển thị thông báo thành công
```

### 10e. Đánh giá
```
1. Khách vào /danh-gia
2. GET /api/don-hang/co-the-danh-gia → danh sách đơn
3. Chọn đơn cần đánh giá
4. Nhập điểm (1-5 sao) + nội dung
5. POST /api/danh-gia
6. Hiển thị "Đánh giá thành công, chờ duyệt"
```

---

## 11. Luồng thay thế

### 11a. Khách đã có tài khoản → đăng nhập
```
Từ /dang-ky → link "Đã có tài khoản? Đăng nhập" → /dang-nhap
```

### 11b. Khách muốn đặt bàn + gọi món trước
```
1. Đặt bàn thành công
2. Chọn "Gọi món trước" → chuyển sang FEAT_01 (QR flow)
3. DonHang gắn MaDatBan
```

### 11c. Đặt bàn hết bàn trống
```
1. GET /api/dat-ban/availability trả về rỗng
2. Hiển thị "Không còn bàn trống trong khung giờ này"
3. Đề xuất khung giờ khác
```

### 11d. Voucher không hợp lệ
```
1. POST /api/ma-giam-gia/validate → hopLe = false
2. Hiển thị lỗi: "Mã không hợp lệ" / "Mã đã hết lượt" / "Mã đã hết hạn"
3. FE ẩn nút "Áp dụng" nếu EXPIRED/USED_UP/INACTIVE (Q7)
```

### 11e. Đã đánh giá đơn này
```
1. POST /api/danh-gia → 400 "Bạn đã đánh giá đơn này"
2. Hiển thị thông báo
```

---

## 12. Luồng lỗi

| Mã lỗi | Tình huống | Hiển thị |
|---------|-----------|----------|
| `409` | Email/SĐT đã tồn tại (đăng ký) | "Email hoặc SĐT đã được đăng ký" |
| `401` | Sai thông tin đăng nhập | "Sai thông tin đăng nhập" |
| `403` | NhanVien/Admin đăng nhập qua luồng này | "Tài khoản không hỗ trợ đăng nhập khách hàng" |
| `400` | Mật khẩu yếu | "Mật khẩu phải có ít nhất 6 ký tự" |
| `400` | Ngày giờ trong quá khứ | "Vui lòng chọn thời gian trong tương lai" |
| `400` | Số người vượt sức chứa | "Số người vượt quá sức chứa tối đa" |
| `403` | Hủy đặt bàn của người khác | "Bạn không có quyền hủy đặt bàn này" |
| `400` | Đặt bàn đã hủy trước đó | "Đặt bàn đã được hủy trước đó" |
| `400` | Đơn chưa hoàn tất (đánh giá) | "Chỉ đánh giá đơn đã hoàn tất" |
| `400` | Đã đánh giá đơn | "Bạn đã đánh giá đơn này" |
| `403` | Voucher không đúng chủ (CUSTOMER/LOYALTY/VIP) | "Mã không thuộc về khách này" |

---

## 13. Trạng thái thay đổi

### Khi đăng ký
| Entity | Field | Giá trị mới |
|--------|-------|-------------|
| `NguoiDung` | `VaiTro` | `KhachHang` |
| `KhachHang` | — | INSERT mới |

### Khi đặt bàn
| Entity | Field | Giá trị mới |
|--------|-------|-------------|
| `DatBan` | `TrangThai` | `CHO_XAC_NHAN` |
| `DatBan` | `MaKH` | `maKh` (từ JWT) |

### Khi hủy đặt bàn
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DatBan` | `TrangThai` | `CHO_XAC_NHAN` hoặc `DA_XAC_NHAN` | `DA_HUY` |

### Khi gửi đánh giá
| Entity | Field | Giá trị mới |
|--------|-------|-------------|
| `DanhGia` | `TrangThai` | `ChoDuyet` |

---

## 14. Phân quyền

| Endpoint | Mức quyền | Ghi chú |
|----------|-----------|--------|
| `POST /api/auth/register` | `public` | Ai cũng đăng ký được |
| `POST /api/auth/login` | `public` | Khách hàng login |
| `GET /api/auth/me` | `customer-own` | Xem profile mình |
| `PUT /api/auth/profile` | `customer-own` | Sửa profile mình |
| `GET /api/dat-ban/khach/:maKh` | `customer-own` | Xem đặt bàn mình |
| `POST /api/dat-ban` | `customer-auth` | Tạo đặt bàn, bắt buộc đăng nhập |
| `PATCH /api/dat-ban/:maDatBan/status` | `customer-own` | Hủy đặt bàn mình |
| `POST /api/ma-giam-gia/validate` | `public` | Kiểm tra voucher |
| `GET /api/don-hang/me` | `customer-own` | Lịch sử đơn mình |
| `GET /api/don-hang/co-the-danh-gia` | `customer-own` | Đơn đánh giá được |
| `POST /api/danh-gia` | `customer-own` | Đánh giá đơn mình |

---

## 15. Acceptance Criteria

### AC-01: Đăng ký
- [ ] Form validates email, SĐT, mật khẩu đúng
- [ ] Email trùng → 409 "Email hoặc SĐT đã được đăng ký"
- [ ] Đăng ký thành công → auto login, chuyển hướng `/ho-so`
- [ ] Token JWT hợp lệ

### AC-02: Đăng nhập
- [ ] Sai thông tin → 401
- [ ] Đăng nhập đúng → token hợp lệ, chuyển hướng trang trước đó
- [ ] `NhanVien`/`Admin` đăng nhập → bị từ chối

### AC-03: Xem/sửa hồ sơ
- [ ] Hiển thị đúng thông tin từ `GET /api/auth/me`
- [ ] Chỉnh sửa inline → `PUT /api/auth/profile` → cập nhật thành công

### AC-04: Đặt bàn
- [ ] Chọn ngày giờ, số người, bàn trống
- [ ] Voucher validate thành công → hiển thị giảm giá
- [ ] Đặt thành công → `DatBan` trong DB với `MaKH` đúng
- [ ] Bàn `BAO_TRI` không hiển thị
- [ ] Bàn `TRONG` mới được chọn (Q5)

### AC-05: Xem/hủy đặt bàn
- [ ] Danh sách chỉ hiện đặt bàn của mình (`customer-own`)
- [ ] Có trạng thái rỗng khi chưa có đặt bàn
- [ ] Hủy `CHO_XAC_NHAN`/`DA_XAC_NHAN` → `DA_HUY`
- [ ] Hủy `DA_NHAN_BAN` → không cho phép

### AC-06: Đánh giá
- [ ] Chỉ hiện đơn `HOAN_THANH`/`DA_THANH_TOAN`
- [ ] Đã đánh giá → không hiện lại
- [ ] Gửi thành công → `DanhGia.TrangThai = 'ChoDuyet'`
- [ ] Đơn của người khác → 403

### AC-07: Dùng voucher
- [ ] Voucher hợp lệ → hiển thị số tiền giảm
- [ ] Voucher `CUSTOMER` của người khác → 403
- [ ] FE ẩn nút "Áp dụng" khi `EXPIRED/USED_UP/INACTIVE`
- [ ] Điểm dùng xong → trừ đúng trong DB

---

## 16. Checklist đối chiếu code hiện tại

| # | Kiểm tra | File kiểm tra | Trạng thái |
|---|----------|---------------|-----------|
| 1 | `DangKyPage.jsx` tồn tại + route `/dang-ky` | `frontend/src/pages/DangKyPage.jsx`, `App.jsx` | ☐ |
| 2 | `DangNhapPage.jsx` tồn tại + route `/dang-nhap` | `frontend/src/pages/DangNhapPage.jsx`, `App.jsx` | ☐ |
| 3 | `HoSoPage.jsx` tồn tại + route `/ho-so` | `frontend/src/pages/HoSoPage.jsx`, `App.jsx` | ☐ |
| 4 | `DatBanPage.jsx` tồn tại + route `/dat-ban` | `frontend/src/pages/DatBanPage.jsx`, `App.jsx` | ☐ |
| 5 | `DanhGiaPage.jsx` tồn tại + route `/danh-gia` | `frontend/src/pages/DanhGiaPage.jsx`, `App.jsx` | ☐ |
| 6 | `POST /api/auth/register` tạo `NguoiDung` + `KhachHang` | `backend/nest-api/src/modules/auth/` | ☐ |
| 7 | `POST /api/auth/login` từ chối `NhanVien`/`Admin` | `backend/nest-api/src/modules/auth/` | ☐ |
| 8 | `POST /api/dat-ban` gắn `MaKH` từ JWT | `backend/nest-api/src/modules/dat-ban/` | ☐ |
| 9 | `PATCH /api/dat-ban/:maDatBan/status` kiểm tra `customer-own` | `backend/nest-api/src/modules/dat-ban/` | ☐ |
| 10 | `POST /api/danh-gia` kiểm tra `customer-own` + đơn đánh giá được | `backend/nest-api/src/modules/danh-gia/` | ☐ |
| 11 | `POST /api/ma-giam-gia/validate` enforce ownership (Q8) | `backend/nest-api/src/modules/ma-giam-gia/` | ☐ |
| 12 | Lọc bàn `TRONG` khi hiển thị danh sách đặt bàn (Q5) | FE + BE | ☐ |
| 13 | FE ẩn nút voucher khi EXPIRED/USED_UP/INACTIVE (Q7) | `voucherTrangThai.js` | ☐ |
