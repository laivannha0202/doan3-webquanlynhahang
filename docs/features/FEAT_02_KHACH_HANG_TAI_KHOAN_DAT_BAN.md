# FEAT-02: Khách hàng — Tài khoản, Đặt bàn, voucher, đánh giá

> **Phạm vi:** Đăng ký/đăng nhập, quản lý tài khoản, đặt bàn (login required), xem lịch sử đơn, voucher, đánh giá.  
> **Liên quan:** FEAT-01 (QR ordering công khai), FEAT-06 (admin quản lý voucher/đánh giá).

---

## 1. Mục tiêu

- Cho phép khách hàng **đăng ký tài khoản**, **đăng nhập**, quản lý thông tin cá nhân.
- Khách hàng đã đăng nhập có thể **đặt bàn** (DatBan), xem **lịch sử đơn hàng**, sử dụng **voucher**, và **đánh giá** nhà hàng.
- Luồng đặt bàn yêu cầu đăng nhập và tạo `DatBan` có `MaKH`.
- Luồng QR ordering (FEAT-01) là công khai, không yêu cầu tài khoản.

---

## 2. Actor sử dụng

| Actor | Vai trò | Ghi chú |
|-------|---------|---------|
| **Khách hàng** | Diễn viên chính | Đăng ký/đăng nhập, đặt bàn, xem lịch sử, voucher, đánh giá |

---

## 3. Route / Trang

| Route | Trang | Yêu cầu đăng nhập |
|-------|-------|--------------------|
| `/dang-ky` | Đăng ký tài khoản | **Không** |
| `/dang-nhap` | Đăng nhập | **Không** |
| `/ho-so` | Trang tài khoản khách hàng | **Có** |
| `/ho-so/dat-ban-lich-su` | Lịch sử đặt bàn | **Có** |
| `/ho-so/don-hang-lich-su` | Lịch sử đơn hàng QR | **Có** |
| `/danh-gia` | Đánh giá nhà hàng | **Có** |

---

## 4. Danh sách màn hình

| STT | Màn hình | Mô tả |
|-----|----------|-------|
| 1 | **Đăng ký** | Form: họ tên, SĐT, email, mật khẩu, xác nhận mật khẩu |
| 2 | **Đăng nhập** | Form: SĐT/email + mật khẩu |
| 3 | **Trang tài khoản** | Hiển thị thông tin cá nhân, nút chỉnh sửa, nút đổi mật khẩu |
| 4 | **Chỉnh sửa thông tin** | Form: họ tên, SĐT, email — chỉnh sửa và lưu |
| 5 | **Đặt bàn** | Chọn ngày, giờ, số lượng khách, khu vực, số bàn → Xác nhận đặt |
| 6 | **Lịch sử đặt bàn** | Danh sách DatBan đã tạo, trạng thái, chi tiết |
| 7 | **Lịch sử đơn hàng** | Danh sách DonHang từ QR ordering, trạng thái, chi tiết |
| 8 | **Đổi mật khẩu** | Form: mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới |
| 9 | **Voucher của tôi** | Danh sách voucher khả dụng, đã sử dụng, đã hết hạn |
| 10 | **Đánh giá** | Form đánh giá: rating sao, bình luận, chọn đơn hàng đã thanh toán |

---

## 5. Thành phần giao diện

### 5.1 Form đăng ký

| Thành phần | Mô tả |
|------------|-------|
| Input họ tên | Text. Bắt buộc. Max 100 ký tự |
| Input SĐT | Text. Bắt buộc. Validate format VN (10 số, bắt đầu bằng 0) |
| Input email | Email. Bắt buộc. Validate format email |
| Input mật khẩu | Password. Bắt buộc. Min 8 ký tự |
| Input xác nhận mật khẩu | Password. Bắt buộc. Phải khớp mật khẩu |
| Nút "Đăng ký" | Submit form |
| Link "Đã có tài khoản? Đăng nhập" | Navigate `/dang-nhap` |

### 5.2 Form đăng nhập

| Thành phần | Mô tả |
|------------|-------|
| Input SĐT hoặc email | Text/Email. Bắt buộc |
| Input mật khẩu | Password. Bắt buộc |
| Nút "Đăng nhập" | Submit form |
| Link "Chưa có tài khoản? Đăng ký" | Navigate `/dang-ky` |

### 5.3 Trang tài khoản

| Thành phần | Mô tả |
|------------|-------|
| Avatar / icon tài khoản | Hiển thị tên viết tắt hoặc ảnh |
| Thông tin cá nhân | Họ tên, SĐT, email — readonly |
| Nút "Chỉnh sửa" | Mở form chỉnh sửa |
| Nút "Đổi mật khẩu" | *(Chưa có route riêng — có thể là modal/trang con trong `/ho-so`)* |
| Nút "Đăng xuất" | Xóa token, redirect `/dang-nhap` |

### 5.4 Form đặt bàn

| Thành phần | Mô tả |
|------------|-------|
| Chọn ngày | Date picker. Min: hôm nay. Max: 30 ngày tới |
| Chọn giờ | Select. Giờ mở cửa: 10:00–21:00. Bước: 30 phút |
| Số lượng khách | Number. Min: 1, Max: 50 |
| Khu vực | Select. Từ API `/api/khu-vuc`. Chọn 1 khu vực |
| Số bàn | Number. Tự động tính dựa trên số lượng khách + khu vực |
| Ghi chú | Textarea. Max 500 ký tự. Tùy chọn |
| Nút "Đặt bàn" | Submit. Disabled nếu form invalid |
| Nút "Hủy" | Reset form |

### 5.5 Danh sách lịch sử

| Thành phần | Mô tả |
|------------|-------|
| Bộ lọc trạng thái | Tabs / chips: Tất cả / Chờ xác nhận / Đã xác nhận / Đã nhận bàn / Hoàn thành / Đã hủy |
| Card đơn / đặt bàn | Hiển thị: mã, ngày, trạng thái (badge màu), tóm tắt thông tin |
| Chi tiết | Click card → modal/panel hiển thị chi tiết |

### 5.6 Form đổi mật khẩu

| Thành phần | Mô tả |
|------------|-------|
| Input mật khẩu cũ | Password. Bắt buộc |
| Input mật khẩu mới | Password. Bắt buộc. Min 8 ký tự |
| Input xác nhận mật khẩu mới | Password. Bắt buộc. Phải khớp mật khẩu mới |
| Nút "Đổi mật khẩu" | Submit. Disabled nếu form invalid |

### 5.7 Voucher

| Thành phần | Mô tả |
|------------|-------|
| Danh sách voucher | Card voucher: mã, giá trị giảm, điều kiện, hạn sử dụng |
| Badge trạng thái | "Khả dụng" (xanh), "Đã sử dụng" (xám), "Hết hạn" (đỏ) |
| Nút "Áp dụng" | Chỉ hiển thị khi đặt bàn hoặc thanh toán. Chọn voucher để áp dụng |

### 5.8 Form đánh giá

| Thành phần | Mô tả |
|------------|-------|
| Chọn đơn hàng | Select. Chỉ hiển thị DonHang `DA_THANH_TOAN` chưa đánh giá |
| Rating sao | 5 sao. Bắt buộc. Click để chọn |
| Bình luận | Textarea. Max 1000 ký tự. Tùy chọn |
| Nút "Gửi đánh giá" | Submit. Disabled nếu chưa chọn sao |

---

## 6. Dữ liệu hiển thị

### 6.1 Đăng ký (POST `/api/auth/register`)

```typescript
// Request body
{
  HoTen: string;          // Bắt buộc
  SoDienThoai: string;    // Bắt buộc. 10 số, bắt đầu bằng 0
  Email: string;          // Bắt buộc. Format email
  MatKhau: string;        // Bắt buộc. Min 8 ký tự
}

// Response 201
{
  MaKH: string;           // "KH000001"
  HoTen: string;
  SoDienThoai: string;
  Email: string;
  VaiTro: "KHACH_HANG";
}
```

### 6.2 Đăng nhập (POST `/api/auth/login`)

```typescript
// Request body
{
  TenDangNhap: string;    // SĐT hoặc email
  MatKhau: string;
}

// Response 200
{
  access_token: string;   // JWT access token
  refresh_token: string;  // JWT refresh token
  user: {
    MaKH: string;
    HoTen: string;
    Email: string;
    SoDienThoai: string;
    VaiTro: "KHACH_HANG";
  };
}
```

### 6.3 Lấy thông tin tài khoản (GET `/api/auth/me`)

```typescript
// Request: Authorization: Bearer <token>
// Response 200
{
  MaKH: string;
  HoTen: string;
  SoDienThoai: string;
  Email: string;
  NgayTao: string;        // ISO 8601
  VaiTro: "KHACH_HANG";
}
```

### 6.4 Cập nhật tài khoản (PUT `/api/auth/me`)

```typescript
// Request body
{
  HoTen?: string;
  Email?: string;
  SoDienThoai?: string;
}

// Response 200
{
  MaKH: string;
  HoTen: string;
  SoDienThoai: string;
  Email: string;
}
```

### 6.5 Đổi mật khẩu

> **Lưu ý:** Endpoint `PUT /api/auth/doi-mat-khau` chưa được xác nhận trong `api.controller.ts`.  
> Cần kiểm tra `auth.controller.ts` xem có endpoint này không. Nếu chưa có, đây là feature cần triển khai.

```typescript
// Request body
{
  MatKhauCu: string;      // Bắt buộc
  MatKhauMoi: string;     // Bắt buộc. Min 8 ký tự
}

// Response 200
{
  message: string;        // "Đổi mật khẩu thành công"
}
```

### 6.6 Đặt bàn (POST `/api/dat-ban`)

```typescript
// Request body
{
  MaKH: string;           // Bắt buộc — từ JWT token
  NgayDat: string;        // YYYY-MM-DD. Bắt buộc. ≥ hôm nay
  GioBatDau: string;      // HH:mm. Bắt buộc
  SoLuongKhach: number;   // ≥ 1. Bắt buộc
  MaKhuVuc?: string;      // Tùy chọn. Nếu không chọn → hệ thống tự xếp
  SoBanPhuHop?: number;   // Tự tính dựa trên số lượng khách
  GhiChu?: string;        // Max 500 ký tự
}

// Response 201
{
  MaDatBan: string;       // "DB001234"
  MaKH: string;
  NgayDat: string;
  GioBatDau: string;
  SoLuongKhach: number;
  TrangThai: "CHO_XAC_NHAN";
  MaBan?: string;         // Có thể null nếu chưa xếp bàn
  MaSoDat?: string;       // "Mã số đặt" — mã đặt bàn public
  NgayTao: string;
}
```

> **Quan trọng:** `MaKH` **bắt buộc phải có** trong body — lấy từ JWT token.  
> Nếu khách chưa đăng nhập → trả 401.

### 6.7 Danh sách đặt bàn (GET `/api/dat-ban`)

```typescript
// Request: Authorization: Bearer <token>
// Query params: page, limit, TrangThai
// Response 200
{
  data: DatBan[];
  total: number;
}

// DatBan object
{
  MaDatBan: string;
  MaKH: string;
  NgayDat: string;
  GioBatDau: string;
  SoLuongKhach: number;
  TrangThai: "CHO_XAC_NHAN" | "DA_XAC_NHAN" | "DA_NHAN_BAN" | "HOAN_THANH" | "KHONG_DEN" | "DA_HUY";
  MaBan?: string;
  MaSoDat?: string;
  GhiChu?: string;
  NgayTao: string;
}
```

### 6.8 Lịch sử đơn hàng QR (GET `/api/don-hang/khach-hang/:maKH`)

```typescript
// Request: Authorization: Bearer <token>
// Query params: page, limit, TrangThai
// Response 200
{
  data: DonHang[];
  total: number;
}
```

### 6.9 Voucher (GET `/api/voucher/:maKH`)

```typescript
// Request: Authorization: Bearer <token>
// Response 200
{
  data: VoucherKhachHang[];
}

// VoucherKhachHang object
{
  MaVoucher: string;
  MaKhuyenMai: string;
  TenChuongTrinh: string;
  GiaTriGiam: number;
  DieuKienApDung: string;
  NgayBatDau: string;
  NgayHetHan: string;
  TrangThai: "KHADUNG" | "DA_SU_DUNG" | "HET_HAN";
}
```

### 6.10 Đánh giá (POST `/api/danh-gia`)

```typescript
// Request body
{
  MaKH: string;           // Bắt buộc — từ JWT
  MaDonHang: string;      // Bắt buộc — DonHang DA_THANH_TOAN
  SoSao: number;          // 1-5. Bắt buộc
  NoiDung?: string;       // Max 1000 ký tự. Tùy chọn
}

// Response 201
{
  MaDanhGia: string;
  MaKH: string;
  MaDonHang: string;
  SoSao: number;
  NoiDung?: string;
  NgayTao: string;
}
```

---

## 7. Form nhập liệu

### 7.1 Đăng ký

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Họ tên | Text | Bắt buộc. Max 100 | |
| SĐT | Text | Bắt buộc. Regex: `^0\d{9}$` | 10 số, bắt đầu bằng 0 |
| Email | Email | Bắt buộc. Format email hợp lệ | |
| Mật khẩu | Password | Bắt buộc. Min 8 ký tự | |
| Xác nhận mật khẩu | Password | Bắt buộc. Phải khớp `MatKhau` | Validate client-side |

### 7.2 Đăng nhập

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| SĐT hoặc Email | Text | Bắt buộc | Accept cả SĐT và email |
| Mật khẩu | Password | Bắt buộc | |

### 7.3 Chỉnh sửa thông tin

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Họ tên | Text | Bắt buộc. Max 100 | Pre-fill từ API |
| SĐT | Text | Bắt buộc. Regex: `^0\d{9}$` | Pre-fill |
| Email | Email | Bắt buộc. Format email | Pre-fill |

### 7.4 Đặt bàn

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Ngày đặt | Date | Bắt buộc. ≥ hôm nay. ≤ 30 ngày tới | |
| Giờ bắt đầu | Select | Bắt buộc. 10:00–21:00, bước 30 phút | |
| Số lượng khách | Number | Bắt buộc. 1-50 | |
| Khu vực | Select | Tùy chọn. Từ API | |
| Ghi chú | Textarea | Max 500 ký tự. Tùy chọn | |

### 7.5 Đổi mật khẩu

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Mật khẩu cũ | Password | Bắt buộc | |
| Mật khẩu mới | Password | Bắt buộc. Min 8 ký tự. Khác mật khẩu cũ | |
| Xác nhận mật khẩu mới | Password | Bắt buộc. Phải khớp `MatKhauMoi` | |

### 7.6 Đánh giá

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Đơn hàng | Select | Bắt buộc. Chỉ DonHang `DA_THANH_TOAN` chưa review | |
| Số sao | Rating | Bắt buộc. 1-5 | |
| Nội dung | Textarea | Max 1000 ký tự. Tùy chọn | |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động | Khi nào disabled |
|-----|--------|----------|-----------------|
| **Đăng ký** | Form đăng ký | POST `/api/auth/register` | Form invalid, đang loading |
| **Đăng nhập** | Form đăng nhập | POST `/api/auth/login` | Form invalid, đang loading |
| **Chỉnh sửa** | Trang tài khoản | Mở form chỉnh sửa inline | — |
| **Lưu** | Form chỉnh sửa | PUT `/api/auth/me` | Form invalid, đang loading |
| **Đặt bàn** | Form đặt bàn | POST `/api/dat-ban` | Form invalid, đang loading |
| **Hủy đặt bàn** | Chi tiết đặt bàn | POST `/api/dat-ban/:maDatBan/huy` | Trạng thái ≠ CHO_XAC_NHAN |
| **Đổi mật khẩu** | Form đổi mật khẩu | PUT `/api/auth/doi-mat-khau` *(cần xác nhận endpoint)* | Form invalid, đang loading |
| **Gửi đánh giá** | Form đánh giá | POST `/api/danh-gia` | Chưa chọn sao, đang loading |
| **Đăng xuất** | Trang tài khoản | Xóa token, redirect `/dang-nhap` | — |

---

## 9. API liên quan

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `POST` | `/api/auth/register` | Public | `DangKyDto` | `KhachHang` (201) | Tạo tài khoản mới |
| `POST` | `/api/auth/login` | Public | `DangNhapDto` | `{ access_token, refresh_token, user }` (200) | Đăng nhập |
| `GET` | `/api/auth/me` | `KHACH_HANG` | Header: Bearer token | `KhachHang` (200) | Xem thông tin cá nhân |
| `PUT` | `/api/auth/me` | `KHACH_HANG` | `CapNhatProfileDto` | `KhachHang` (200) | Cập nhật thông tin |
| `PUT` | `/api/auth/doi-mat-khau` | `KHACH_HANG` | `DoiMatKhauDto` | `{ message }` (200) | Đổi mật khẩu *(cần xác nhận endpoint)* |
| `POST` | `/api/dat-ban` | `KHACH_HANG` | `DatBanCreateDto` | `DatBan` (201) | **Bắt buộc có `MaKH`** |
| `GET` | `/api/dat-ban` | `KHACH_HANG` | Query: `page`, `limit`, `TrangThai` | `{ data: DatBan[], total }` | Lịch sử đặt bàn |
| `GET` | `/api/dat-ban/:maDatBan` | `KHACH_HANG` | `maDatBan` (path) | `DatBan` (200) | Chi tiết đặt bàn |
| `POST` | `/api/dat-ban/:maDatBan/huy` | `KHACH_HANG` | `maDatBan` (path) | `DatBan` (200) | Hủy đặt bàn (chỉ khi `CHO_XAC_NHAN`) |
| `GET` | `/api/don-hang/khach-hang/:maKH` | `KHACH_HANG` | `maKH` (path), query: `page`, `limit` | `{ data: DonHang[], total }` | Lịch sử đơn QR |
| `GET` | `/api/voucher/:maKH` | `KHACH_HANG` | `maKH` (path) | `{ data: VoucherKhachHang[] }` | Voucher của tôi |
| `POST` | `/api/danh-gia` | `KHACH_HANG` | `DanhGiaDto` | `DanhGia` (201) | Đánh giá nhà hàng |
| `GET` | `/api/khu-vuc` | Public | Query: `page`, `limit` | `{ data: KhuVuc[], total }` | Danh sách khu vực |

---

## 10. Luồng xử lý chính

### 10.1 Đăng ký tài khoản

```
1. Khách nhấn "Đăng ký" → form hiển thị
2. Nhập: họ tên, SĐT, email, mật khẩu, xác nhận mật khẩu
3. Validate client-side:
   - Họ tên: không trống, max 100 ký tự
   - SĐT: regex ^0\d{9}$
   - Email: format hợp lệ
   - Mật khẩu: min 8 ký tự
   - Xác nhận mật khẩu: phải khớp
4. Nhấn "Đăng ký" → POST /api/auth/register
5. Backend:
   a. Check trùng SĐT hoặc email → 409 nếu trùng
   b. Hash mật khẩu (bcrypt, cost ≥ 10)
   c. Tạo KhachHang (VaiTro: KHACH_HANG)
   d. Trả 201 với thông tin (không có token)
6. Frontend: thông báo "Đăng ký thành công!" → redirect `/dang-nhap`
```

### 10.2 Đăng nhập

```
1. Khách nhập SĐT/email + mật khẩu
2. Nhấn "Đăng nhập" → POST `/api/auth/login`
3. Backend:
   a. Tìm KhachHang theo SoDienThoai hoặc Email
   b. So sánh mật khẩu hash
   c. Tạo JWT access token (15-30 phút) + refresh token (7-30 ngày)
   d. Trả 200 với token + thông tin user
4. Frontend: lưu token vào httpOnly cookie hoặc sessionStorage
   → Redirect đến trang chủ hoặc trang đặt bàn
```

### 10.3 Đặt bàn

```
1. Khách đăng nhập → vào trang /dat-ban
2. Chọn: ngày, giờ, số lượng khách, khu vực (tùy chọn), ghi chú
3. Nhấn "Đặt bàn" → POST /api/dat-ban
   Body: { MaKH, NgayDat, GioBatDau, SoLuongKhach, MaKhuVuc?, GhiChu? }
4. Backend:
   a. Validate MaKH tồn tại, JWT hợp lệ
   b. Validate NgayDat ≥ hôm nay, GioBatDau trong giờ mở cửa
   c. Tạo DatBan (TrangThai: CHO_XAC_NHAN)
   d. Trả 201 với MaDatBan + MaSoDat
5. Frontend: hiển thị thông báo "Đặt bàn thành công! Mã đặt: DB001234"
   → Chuyển trang lịch sử đặt bàn
```

### 10.4 Hủy đặt bàn

```
1. Khách vào lịch sử đặt bàn → chọn đơn có TrangThai = CHO_XAC_NHAN
2. Nhấn "Hủy đặt bàn" → dialog xác nhận
3. POST /api/dat-ban/:maDatBan/huy
4. Backend:
   a. Validate DatBan tồn tại, thuộc về MaKH hiện tại
   b. Validate TrangThai = CHO_XAC_NHAN (chỉ hủy được khi chưa xác nhận)
   c. Cập nhật TrangThai → DA_HUY
   d. Trả 200
5. Frontend: cập nhật badge trạng thái → "Đã hủy"
```

### 10.5 Đổi mật khẩu

```
1. Khách vào `/ho-so` → nhấn "Đổi mật khẩu" *(modal/trang con)*
2. Nhập: mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới
3. Validate client-side: min 8 ký tự, xác nhận khớp
4. Nhấn "Đổi mật khẩu" → PUT `/api/auth/doi-mat-khau` *(cần xác nhận endpoint)*
   Body: { MatKhauCu, MatKhauMoi }
5. Backend:
   a. Verify JWT → lấy MaKH
   b. So sánh MatKhauCu với hash trong DB → 401 nếu sai
   c. Hash MatKhauMoi (bcrypt, cost ≥ 10)
   d. Cập nhật mật khẩu
   e. Trả 200 { message: "Đổi mật khẩu thành công" }
6. Frontend: thông báo thành công → redirect `/ho-so`
   → Yêu cầu đăng nhập lại (token cũ vẫn có hiệu lực đến khi hết hạn)
```

### 10.6 Xem voucher

```
1. Khách vào `/ho-so` → xem section "Voucher của tôi"
2. Gọi GET `/api/voucher/:maKH`
3. Hiển thị danh sách voucher:
   - Khả dụng: badge xanh, nút "Áp dụng" (khi đặt bàn/thanh toán)
   - Đã sử dụng: badge xám
   - Hết hạn: badge đỏ
```

### 10.7 Đánh giá

```
1. Khách vào /danh-gia
2. Hiển thị select: chỉ DonHang có TrangThai = DA_THANH_TOAN
3. Chọn đơn hàng → nhập số sao + nội dung (tùy chọn)
4. Nhấn "Gửi đánh giá" → POST /api/danh-gia
   Body: { MaKH, MaDonHang, SoSao, NoiDung? }
5. Backend:
   a. Validate MaDonHang tồn tại, DA_THANH_TOAN, thuộc MaKH
   b. Check chưa đánh giá đơn này (1 đơn = 1 đánh giá)
   c. Tạo DanhGia
   d. Trả 201
6. Frontend: thông báo "Đánh giá thành công!"
   → Đơn hàng biến khỏi danh sách chưa đánh giá
```

---

## 11. Luồng thay thế

### 11.1 Đăng ký trùng SĐT hoặc email

```
1. POST /api/auth/register trả 409 Conflict
2. Hiển thị lỗi: "SĐT hoặc email đã được sử dụng. Vui lòng chọn email/SĐT khác."
3. Khách sửa lại thông tin → thử đăng ký lại
```

### 11.2 Đăng nhập sai mật khẩu

```
1. POST /api/auth/login trả 401
2. Hiển thị lỗi: "SĐT/email hoặc mật khẩu không chính xác."
3. KHÔNG tiết lộ nguyên nhân cụ thể (SĐT đúng mà sai pass, hay ngược lại)
```

### 11.3 Token hết hạn

```
1. API call trả 401 (token expired)
2. Frontend: thử refresh token bằng refresh_token
3. Nếu refresh thành công → retry API call
4. Nếu refresh thất bại → redirect `/dang-nhap` với thông báo "Phiên đăng nhập đã hết hạn"
```

### 11.4 Đặt bàn không chọn khu vực

```
1. MaKhuVuc = null → Backend tự xếp khu vực có bàn trống phù hợp
2. Nếu không có bàn trống → trả 409 "Không có bàn trống phù hợp"
```

---

## 12. Luồng lỗi

| Mã lỗi | Thông báo | Hành động |
|---------|----------|----------|
| 400 - Dữ liệu không hợp lệ | "Vui lòng kiểm tra lại thông tin nhập." | Hiển thị lỗi trên từng field |
| 401 - Sai thông tin đăng nhập | "SĐT/email hoặc mật khẩu không chính xác." | Để nguyên form, highlight lỗi |
| 401 - Token hết hạn | "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." | Redirect `/dang-nhap` |
| 403 - Không có quyền | "Bạn không có quyền thực hiện thao tác này." | Redirect trang chủ |
| 404 - Không tìm thấy | "Không tìm thấy dữ liệu." | Hiển thị thông báo |
| 409 - Trùng thông tin | "SĐT hoặc email đã được sử dụng." | Highlight field trùng |
| 409 - Bàn không trống | "Không có bàn trống phù hợp." | Gợi ý chọn thời gian khác |
| 422 - Mật khẩu cũ sai | "Mật khẩu cũ không chính xác." | Highlight field mật khẩu cũ |
| 500 - Lỗi server | "Đã xảy ra lỗi. Vui lòng thử lại." | Retry thủ công |

---

## 13. Trạng thái thay đổi

### 13.1 DatBan

```
[khởi tạo] ──POST /api/dat-ban──▶ CHO_XAC_NHAN
                                       │
                    ┌──────────────────┤
                    ▼                  ▼
              DA_XAC_NHAN          DA_HUY
                    │            (khách hủy / admin hủy)
                    ▼
              DA_NHAN_BAN
                    │
         ┌─────────┤
         ▼         ▼
    HOAN_THANH   KHONG_DEN
    (khách đến    (khách không đến,
     và thanh toán) admin đánh dấu)
```

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| *(khởi tạo)* | `POST /api/dat-ban` | `CHO_XAC_NHAN` | Khách đặt bàn mới |
| `CHO_XAC_NHAN` | Admin xác nhận (FEAT-06) | `DA_XAC_NHAN` | |
| `CHO_XAC_NHAN` | Khách hủy | `DA_HUY` | Chỉ hủy được khi `CHO_XAC_NHAN` |
| `CHO_XAC_NHAN` | Admin hủy (FEAT-06) | `DA_HUY` | |
| `CHO_XAC_NHAN` | Hết thời gian chờ | `KHONG_DEN` | Tự động sau X giờ (business rule) |
| `DA_XAC_NHAN` | Khách đến nhận bàn | `DA_NHAN_BAN` | Nhân viên xác nhận (FEAT-03) |
| `DA_NHAN_BAN` | Hoàn thành | `HOAN_THANH` | |
| `DA_XAC_NHAN` | Hết thời gian giữ bàn | `KHONG_DEN` | Admin đánh dấu (FEAT-06) |

### 13.2 Bàn (`Ban`) — liên quan đặt bàn

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| `TRONG` | Đặt bàn xác nhận | `DA_DAT` | Bàn được giữ cho DatBan |
| `DA_DAT` | Khách đến nhận bàn | `CO_KHACH` | Bàn bắt đầu phục vụ |
| `DA_DAT` | Hủy / không đến | `TRONG` | Bàn trả về trống |
| `CO_KHACH` | Thu ngân xác nhận thanh toán | `DANG_DON` | Cần dọn dẹp |
| `DANG_DON` | Nhân viên dọn xong | `TRONG` | Bàn sẵn sàng |

### 13.3 DonHang (QR ordering từ FEAT-01)

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| *(khởi tạo)* | `POST /api/ban/:maBan/order` | `DANG_CHUAN_BI` | Đơn QR từ FEAT-01 |
| `DANG_CHUAN_BI` | Bếp/nhân viên cập nhật | `DANG_PHUC_VU` | |
| `DANG_PHUC_VU` | Bếp/nhân viên cập nhật | `HOAN_THANH` | |
| `HOAN_THANH` | Thu ngân thanh toán | `DA_THANH_TOAN` | |
| `DANG_CHUAN_BI` | Hủy đơn | `DA_HUY` | |

---

## 14. Phân quyền

| Vai trò | Quyền truy cập | Ghi chú |
|---------|----------------|---------|
| **Khách hàng (chưa đăng nhập)** | Đăng ký, đăng nhập, xem thực đơn (FEAT-01) | Không đặt bàn, không xem lịch sử |
| **Khách hàng (đã đăng nhập)** | Toàn bộ luồng: tài khoản, đặt bàn, lịch sử, voucher, đánh giá | Yêu cầu JWT token `VaiTro = KHACH_HANG` |
| **Nhân viên** | Không can thiệp trong luồng này | Xem FEAT-03/04/05 |
| **Admin** | Quản lý voucher, xác nhận/hủy đặt bàn, xem tất cả đặt bàn | Xem FEAT-06 |

---

## 15. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | Đăng ký với SĐT trùng → 409, hiển thị lỗi "SĐT đã được sử dụng" | Manual |
| AC-02 | Đăng ký với email trùng → 409, hiển thị lỗi "Email đã được sử dụng" | Manual |
| AC-03 | Đăng nhập đúng thông tin → nhận JWT token, redirect trang chủ | Manual |
| AC-04 | Đăng nhập sai mật khẩu → 401, lỗi chung "SĐT/email hoặc mật khẩu không chính xác" | Manual |
| AC-05 | Đặt bàn với `MaKH` trong body → tạo DatBan thành công, `TrangThai = CHO_XAC_NHAN` | Manual |
| AC-06 | Đặt bàn **không có `MaKH`** → trả 401 hoặc 400 | Manual |
| AC-07 | Hủy đặt bàn khi `CHO_XAC_NHAN` → `DA_HUY` | Manual |
| AC-08 | Hủy đặt bàn khi `DA_XAC_NHAN` → 400 "Chỉ hủy được khi chưa xác nhận" | Manual |
| AC-09 | Đổi mật khẩu với mật khẩu cũ sai → 422 | Manual |
| AC-10 | Đổi mật khẩu thành công → token vẫn hiệu lực, không cần đăng nhập lại | Manual |
| AC-11 | Đánh giá đơn chưa thanh toán → 400 | Manual |
| AC-12 | Đánh giá đơn đã đánh giá rồi → 409 "Đã đánh giá đơn này" | Manual |
| AC-13 | Token hết hạn → tự refresh, nếu refresh fail → redirect `/dang-nhap` | Manual |
| AC-14 | Voucher `KHADUNG` hiển thị nút "Áp dụng"; `DA_SU_DUNG` / `HET_HAN` hiển thị badge xám/đỏ | Manual |
| AC-15 | Trạng thái `KHONG_DEN` chỉ áp dụng cho `DatBan`, KHÔNG áp dụng cho `DonHang` | Code review |

---

## 16. Checklist đối chiếu code hiện tại

### Routes (`frontend/src/App.jsx`)

| Route | Tồn tại? | Component | Ghi chú |
|-------|----------|-----------|---------|
| `/dang-ky` | ✅ | `DangKy` | |
| `/dang-nhap` | ✅ | `DangNhap` | |
| `/ho-so` | ✅ | `HoSo` | Trang tài khoản khách hàng |
| `/ho-so/dat-ban-lich-su` | ✅ | Route con của `/ho-so` | Lịch sử đặt bàn |
| `/ho-so/don-hang-lich-su` | ✅ | Route con của `/ho-so` | Lịch sử đơn hàng QR |
| `/dat-ban` | ✅ | `DatBan` | ProtectedRoute |
| `/danh-gia` | ✅ | `DanhGia` | Đánh giá đơn |

### API endpoints

| Endpoint | Tồn tại? | Controller | Ghi chú |
|----------|----------|-----------|---------|
| `POST /api/auth/register` | ✅ | `auth.controller.ts` | |
| `POST /api/auth/login` | ✅ | `auth.controller.ts` | |
| `GET /api/auth/me` | ✅ | `auth.controller.ts` | `@UseGuards(AuthGuard)` |
| `PUT /api/auth/me` | ✅ | `auth.controller.ts` | |
| `PUT /api/auth/doi-mat-khau` | ⚠️ | — | **Cần kiểm tra** endpoint `doi-mat-khau` |
| `POST /api/dat-ban` | ✅ | `dat-ban.controller.ts` | **Kiểm tra `MaKH` là bắt buộc** |
| `GET /api/dat-ban` | ⚠️ | `dat-ban.controller.ts` | Filter by MaKH? |
| `POST /api/dat-ban/:maDatBan/huy` | ⚠️ | — | **Cần kiểm tra** endpoint hủy |
| `GET /api/don-hang/khach-hang/:maKH` | ❌ | — | Không có trong api.controller.ts — cần xác minh |
| `GET /api/voucher/:maKH` | ⚠️ | — | **Cần kiểm tra** |
| `POST /api/danh-gia` | ✅ | `danh-gia.controller.ts` | |

### Enum / State

| Enum | Giá trị trong code | Giá trị trong spec | Khớp? |
|------|-------------------|-------------------|-------|
| `DatBan.TrangThai` | `CHO_XAC_NHAN, DA_XAC_NHAN, DA_NHAN_BAN, HOAN_THANH, KHONG_DEN, DA_HUY` | `CHO_XAC_NHAN, DA_XAC_NHAN, DA_NHAN_BAN, HOAN_THANH, KHONG_DEN, DA_HUY` | ✅ |
| `Ban.TrangThai` | `TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI` | `TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI` | ✅ |
| `DonHang.TrangThai` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | ✅ |

### Trạng thái cấm

| Trạng thái cấm | Xuất hiện trong code? | Kết quả |
|----------------|----------------------|---------|
| `CHO_XU_LY` | ❌ | ✅ OK |
| `DANG_CHE_BIEN` | ❌ | ✅ OK |
| `SAN_SANG` | ❌ | ✅ OK |
| `DA_PHUC_VU` | ❌ | ✅ OK |
| `DA_DEN` | ❌ | ✅ OK |

### Tích hợp với FEAT khác

| FEAT | Mối liên hệ |
|------|-------------|
| FEAT-01 | QR ordering không cần DatBan, không cần MaKH |
| FEAT-03 | Nhân viên xác nhận đặt bàn → `DA_NHAN_BAN` |
| FEAT-05 | Thu ngân thanh toán → `HOAN_THANH` / `DA_THANH_TOAN` |
| FEAT-06 | Admin quản lý voucher, xác nhận/hủy đặt bàn |
| FEAT-07 | State machines chuẩn — đảm bảo tất cả state ở trên khớp |

---

*Ghi chú: Luồng đặt bàn yêu cầu đăng nhập. `MaKH` bắt buộc trong body. Route `/ho-so` đã xác nhận. Endpoint `/api/auth/doi-mat-khau` cần kiểm tra thêm.*
