# FEAT-06: Admin / Quản trị — Quản lý toàn hệ thống

> **Phạm vi:** Admin quản lý thực đơn, danh mục, bàn, khu vực, nhân viên, khách hàng, voucher, đánh giá, xem báo cáo tổng quan, cấu hình hệ thống.  
> **Liên quan:** FEAT-01 đến FEAT-05 (dữ liệu do admin quản lý).

---

## 1. Mục tiêu

- Admin quản lý toàn bộ dữ liệu hệ thống: thực đơn, bàn, khu vực, nhân viên, khách hàng, voucher, đánh giá.
- Xem báo cáo tổng quan: doanh thu, đơn hàng, đánh giá trung bình.
- Cấu hình hệ thống (nếu có).
- Phân quyền admin là cấp cao nhất — có quyền truy cập tất cả.

---

## 2. Actor sử dụng

| Actor | Vai trò | Ghi chú |
|-------|---------|---------|
| **Admin** | Diễn viên chính | Quản trị hệ thống — toàn quyền |

---

## 3. Route / Trang

| Route | Trang | Yêu cầu đăng nhập | Role |
|-------|-------|--------------------|------|
| `/admin` | Dashboard tổng quan | ✅ | Admin |
| `/noi-bo/thuc-don` | Quản lý thực đơn (danh mục + món ăn) | ✅ | Admin |
| `/noi-bo/ban` | Quản lý bàn | ✅ | Admin |
| `/noi-bo/nhan-vien` | Quản lý nhân viên | ✅ | Admin |
| `/noi-bo/khach-hang` | Quản lý khách hàng | ✅ | Admin |
| `/noi-bo/voucher` | Quản lý voucher / chương trình khuyến mãi | ✅ | Admin |
| `/noi-bo/danh-gia` | Quản lý đánh giá | ✅ | Admin |
| `/noi-bo/don-hang` | Quản lý đơn hàng | ✅ | Admin |
| `/noi-bo/bao-cao` | Báo cáo doanh thu | ✅ | Admin |
| `/noi-bo/cau-hinh` | Cấu hình hệ thống (nếu có) | ✅ | Admin |

---

## 4. Danh sách màn hình

| STT | Màn hình | Mô tả |
|-----|----------|-------|
| 1 | **Dashboard** | Tổng quan: doanh thu hôm nay/tuần/tháng, số đơn hàng, số khách hàng mới, đánh giá trung bình, biểu đồ doanh thu. |
| 2 | **Quản lý danh mục** | CRUD danh mục: tên, mô tả, thứ tự hiển thị, trạng thái (đang ẩn/đang hiện). |
| 3 | **Quản lý món ăn** | CRUD món ăn: tên, mô tả, giá, ảnh, danh mục, trạng thái (Còn hàng/Hết hàng/Ngừng bán). |
| 4 | **Quản lý bàn** | CRUD bàn: tên, khu vực, số chỗ ngồi, trạng thái (TRONG/BAO_TRI). |
| 5 | **Quản lý khu vực** | CRUD khu vực: tên, mô tả. |
| 6 | **Quản lý nhân viên** | CRUD nhân viên: họ tên, SĐT, email, vai trò (Bếp/Phục vụ/Thu ngân), trạng thái (đang hoạt động/ngừng hoạt động). |
| 7 | **Quản lý khách hàng** | Xem danh sách khách hàng: tên, SĐT, email, số đơn đã đặt, trạng thái tài khoản. |
| 8 | **Quản lý voucher** | CRUD voucher/chương trình khuyến mãi: mã, tên, giá trị giảm, điều kiện, thời hạn, trạng thái. |
| 9 | **Quản lý đánh giá** | Xem danh sách đánh giá: khách, đơn hàng, số sao, nội dung, thời gian. Xóa đánh giá vi phạm. |
| 10 | **Quản lý đơn hàng** | Xem tất cả đơn hàng, filter theo trạng thái, xem chi tiết. Hủy đơn ngoại lệ. |
| 11 | **Báo cáo** | Biểu đồ doanh thu, top món bán chạy, tỷ lệ hủy đơn, đánh giá trung bình. |
| 12 | **Cấu hình** | Cấu hình nhà hàng (nếu có): tên, địa chỉ, SĐT, giờ mở cửa, thời gian giữ bàn. |

---

## 5. Thành phần giao diện

### 5.1 Dashboard

| Thành phần | Mô tả |
|------------|-------|
| Card thống kê | Doanh thu hôm nay, Số đơn hôm nay, Số khách hàng mới, Đánh giá TB |
| Biểu đồ doanh thu | Line/Bar chart: doanh thu theo ngày/tuần/tháng |
| Top món bán chạy | Bảng xếp hạng 10 món có doanh thu cao nhất |
| Đơn chờ xử lý | Số đơn `DANG_CHUAN_BI`, `HOAN_THANH` chờ thanh toán |
| Đánh giá gần đây | 5 đánh giá mới nhất |

### 5.2 Table CRUD (Danh mục, Món ăn, Bàn, Khu vực, Nhân viên, Voucher, Đánh giá)

| Thành phần | Mô tả |
|------------|-------|
| Header | Tiêu đề + nút "Thêm mới" |
| Bộ lọc | Tìm kiếm, filter theo trạng thái |
| Table | Dữ liệu phân trang, sort theo cột |
| Nút hành động | Sửa / Xóa / xem chi tiết trên mỗi dòng |
| Modal/Drawer | Form thêm/sửa |
| Pagination | Phân trang, chọn số dòng/trang |

### 5.3 Form CRUD (thay đổi theo từng module)

| Module | Fields chính |
|--------|-------------|
| Danh mục | Tên danh mục, Mô tả, Thứ tự hiển thị, Trạng thái |
| Món ăn | Tên món, Mô tả, Giá hiện tại, Ảnh (upload), Danh mục (select), Trạng thái |
| Bàn | Tên bàn, Khu vực (select), Số chỗ ngồi, Trạng thái |
| Khu vực | Tên khu vực, Mô tả |
| Nhân viên | Họ tên, SĐT, Email, Mật khẩu (khi tạo), Vai trò (select: Bếp/Phục vụ/Thu ngân), Trạng thái |
| Voucher | Mã voucher, Tên chương trình, Loại giảm (Phần trăm/Cố định), Giá trị giảm, Đơn tối thiểu, Số lượng, Thời hạn |
| Đánh giá | Xem chi tiết (readonly), nút xóa |

### 5.4 Quản lý đặt bàn

| Thành phần | Mô tả |
|------------|-------|
| Danh sách đặt bàn | Tất cả DatBan, filter theo trạng thái |
| Nút "Xác nhận" | Chuyển `CHO_XAC_NHAN` → `DA_XAC_NHAN` |
| Nút "Hủy" | Chuyển `CHO_XAC_NHAN` → `DA_HUY` |
| Nút "Đánh dấu không đến" | Chuyển `DA_XAC_NHAN` → `KHONG_DEN` |

---

## 6. Dữ liệu hiển thị

### 6.1 Dashboard (GET `/api/thong-ke`)

```typescript
// Response 200
{
  doanhThuHomNay: number;
  doanhThuTuan: number;
  doanhThuThang: number;
  soDonHomNay: number;
  soKhachHangMoi: number;
  danhGiaTrungBinh: number;
  donChoXuLy: number;
  donHoanThanh: number;
  topMonBanChay: {
    MaMonAn: string;
    TenMonAn: string;
    SoLuongBan: number;
    DoanhThu: number;
  }[];
}
```

### 6.2 CRUD Thực đơn (Danh mục + Món ăn)

> **Lưu ý:** DanhMuc và MonAn được quản lý chung qua `POST /api/thuc-don`.  
> Không có endpoint riêng `/api/danh-muc` hoặc `/api/mon-an`.

```typescript
// POST /api/thuc-don
// Request body (bao gồm DanhMuc + MonAn)
{
  TenDanhMuc: string;      // Bắt buộc. Max 100
  MoTa?: string;           // Max 500
  MonAn: {
    TenMonAn: string;      // Bắt buộc. Max 200
    MoTa?: string;         // Max 1000
    GiaHienTai: number;    // Bắt buộc. ≥ 0
    HinhAnh?: string;      // URL ảnh
    TrangThai?: "CON_HANG" | "HET" | "NGUNG_BAN";
  }[];
}

// PUT /api/thuc-don
// Request body: fields cần cập nhật

// DELETE /api/thuc-don/:id
// Xóa thực đơn
```

### 6.4 CRUD Bàn

```typescript
// POST /api/ban
// Request body
{
  TenBan: string;          // Bắt buộc
  MaKhuVuc: string;        // Bắt buộc
  SoChoNgoi: number;       // ≥ 1
  TrangThai?: "TRONG" | "BAO_TRI";
}

// PUT /api/ban/:maBan
// Request body: fields cần cập nhật
```

### 6.5 CRUD Nhân viên

```typescript
// POST /api/nhan-vien
// Request body
{
  HoTen: string;
  SoDienThoai: string;
  Email: string;
  MatKhau: string;         // Khi tạo
  ChucNangPhu: "BEP" | "PHUC_VU" | "THU_NGAN";
  TrangThai?: "DANG_HOAT_DONG" | "NGUNG_HOAT_DONG";
}

// PUT /api/nhan-vien/:maNhanVien
// Request body: fields cần cập nhật (không bao gồm MatKhau)
```

### 6.6 CRUD Voucher

```typescript
// POST /api/khuyen-mai
// Request body
{
  TenChuongTrinh: string;  // Bắt buộc
  MoTa?: string;
  LoaiGiam: "PHAN_TRAM" | "CO_DINH";
  GiaTriGiam: number;      // ≥ 0
  DonToiThieu?: number;    // Đơn tối thiểu để áp dụng
  SoLuong: number;         // Số lượng voucher phát hành
  NgayBatDau: string;      // YYYY-MM-DD
  NgayHetHan: string;      // YYYY-MM-DD
  TrangThai?: "HOAT_DONG" | "NGUNG";
}

// PUT /api/khuyen-mai/:maKhuyenMai
// Request body: fields cần cập nhật
```

### 6.7 Quản lý đánh giá

```typescript
// GET /api/danh-gia
// Query params: page, limit, SoSao, MaKH
// Response 200
{
  data: DanhGia[];
  total: number;
}

// DELETE /api/danh-gia/:maDanhGia
// Response 200
{
  message: string;
}
```

### 6.8 Báo cáo doanh thu (GET `/api/thong-ke`)

```typescript
// Query params: TuNgay, DenNgay, Loai: "ngay" | "tuan" | "thang"
// Response 200
{
  data: {
    ThoiGian: string;
    DoanhThu: number;
    SoDon: number;
    DonHuy: number;
  }[];
  TongDoanhThu: number;
  TongSoDon: number;
  TiLeHuy: number;        // % đơn bị hủy
}
```

---

## 7. Form nhập liệu

### 7.1 Danh mục

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Tên danh mục | Text | Bắt buộc. Max 100 | |
| Mô tả | Textarea | Max 500 | Tùy chọn |
| Thứ tự hiển thị | Number | ≥ 0 | Mặc định: 0 |
| Trạng thái | Radio | `DANG_HIEN` / `AN` | Mặc định: `DANG_HIEN` |

### 7.2 Món ăn

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Tên món | Text | Bắt buộc. Max 200 | |
| Mô tả | Textarea | Max 1000 | Tùy chọn |
| Giá hiện tại | Number | Bắt buộc. ≥ 0 | |
| Ảnh | File upload | jpg/png, ≤ 5MB | Tùy chọn |
| Danh mục | Select | Bắt buộc | Từ API `/api/thuc-don` |
| Trạng thái | Radio | `CON_HANG` / `HET` / `NGUNG_BAN` | Mặc định: `CON_HANG` |

### 7.3 Bàn

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Tên bàn | Text | Bắt buộc. Max 50 | |
| Khu vực | Select | Bắt buộc | Từ API `/api/khu-vuc` |
| Số chỗ ngồi | Number | ≥ 1 | |
| Trạng thái | Radio | `TRONG` / `BAO_TRI` | Mặc định: `TRONG` |

### 7.4 Nhân viên

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Họ tên | Text | Bắt buộc. Max 100 | |
| SĐT | Text | Bắt buộc. Regex: `^0\d{9}$` | |
| Email | Email | Bắt buộc. Format hợp lệ | |
| Mật khẩu | Password | Bắt buộc khi tạo. Min 8 ký tự | Khi sửa: optional |
| Vai trò (ChucNangPhu) | Select | Bắt buộc. `BEP` / `PHUC_VU` / `THU_NGAN` | |
| Trạng thái | Radio | `DANG_HOAT_DONG` / `NGUNG_HOAT_DONG` | Mặc định: `DANG_HOAT_DONG` |

### 7.5 Voucher

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Tên chương trình | Text | Bắt buộc. Max 200 | |
| Mô tả | Textarea | Max 1000 | Tùy chọn |
| Loại giảm | Radio | `PHAN_TRAM` / `CO_DINH` | |
| Giá trị giảm | Number | ≥ 0. Nếu PHAN_TRAM: ≤ 100 | |
| Đơn tối thiểu | Number | ≥ 0 | Tùy chọn |
| Số lượng | Number | ≥ 1 | |
| Ngày bắt đầu | Date | Bắt buộc | |
| Ngày hết hạn | Date | Bắt buộc. ≥ Ngày bắt đầu | |
| Trạng thái | Radio | `HOAT_DONG` / `NGUNG` | Mặc định: `HOAT_DONG` |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động | Khi nào disabled |
|-----|--------|----------|-----------------|
| **Thêm mới** | Header table | Mở form thêm | — |
| **Sửa** | Row action | Mở form sửa với data hiện tại | — |
| **Xóa** | Row action | Dialog xác nhận xóa | — |
| **Lưu** | Form | POST hoặc PUT API | Form invalid, đang loading |
| **Xác nhận đặt bàn** | Row action (DatBan) | PUT → `DA_XAC_NHAN` | Trạng thái ≠ `CHO_XAC_NHAN` |
| **Hủy đặt bàn** | Row action (DatBan) | PUT → `DA_HUY` | Trạng thái ≠ `CHO_XAC_NHAN` |
| **Không đến** | Row action (DatBan) | PUT → `KHONG_DEN` | Trạng thái ≠ `DA_XAC_NHAN` |
| **Xóa đánh giá** | Row action | Dialog xác nhận | — |
| **Export Excel** | Header table | Tải file Excel | Không có dữ liệu |

---

## 9. API liên quan

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/thong-ke` | Admin | — | `ThongKe` (200) | Dashboard tổng quan / Báo cáo |
| `GET` | `/api/thuc-don` | Admin | Query: `page`, `limit` | `{ data: ThucDon[], total }` | CRUD Thực đơn |
| `POST` | `/api/thuc-don` | Admin | `ThucDonCreateDto` | `ThucDon` (201) | Tạo thực đơn (DanhMuc + MonAn) |
| `PUT` | `/api/thuc-don` | Admin | `ThucDonUpdateDto` | `ThucDon` (200) | Cập nhật thực đơn |
| `DELETE` | `/api/thuc-don/:id` | Admin | — | 200 | Xóa thực đơn |
| `POST` | `/api/thuc-don/upload` | Admin | `file` (multipart) | `{ url: string }` | Upload ảnh món ăn |
| `GET` | `/api/ban` | Admin | Query: `MaKhuVuc`, `TrangThai` | `{ data: Ban[], total }` | CRUD Bàn |
| `POST` | `/api/ban` | Admin | `BanCreateDto` | `Ban` (201) | |
| `PUT` | `/api/ban/:maBan` | Admin | `BanUpdateDto` | `Ban` (200) | |
| `DELETE` | `/api/ban/:maBan` | Admin | — | 200 | Soft delete |
| `GET` | `/api/khu-vuc` | Admin | Query: `page`, `limit` | `{ data: KhuVuc[], total }` | CRUD Khu vực |
| `POST` | `/api/khu-vuc` | Admin | `KhuVucCreateDto` | `KhuVuc` (201) | |
| `PUT` | `/api/khu-vuc/:maKhuVuc` | Admin | `KhuVucUpdateDto` | `KhuVuc` (200) | |
| `DELETE` | `/api/khu-vuc/:maKhuVuc` | Admin | — | 200 | Soft delete |
| `GET` | `/api/nhan-vien` | Admin | Query: `page`, `limit`, `ChucNangPhu` | `{ data: NhanVien[], total }` | CRUD Nhân viên |
| `POST` | `/api/nhan-vien` | Admin | `NhanVienCreateDto` | `NhanVien` (201) | |
| `PUT` | `/api/nhan-vien/:maNhanVien` | Admin | `NhanVienUpdateDto` | `NhanVien` (200) | |
| `DELETE` | `/api/nhan-vien/:maNhanVien` | Admin | — | 200 | Soft delete |
| `GET` | `/api/khach-hang` | Admin | Query: `page`, `limit` | `{ data: KhachHang[], total }` | Xem KH |
| `GET` | `/api/dat-ban` | Admin | Query: `page`, `limit`, `TrangThai` | `{ data: DatBan[], total }` | Quản lý đặt bàn |
| `PUT` | `/api/dat-ban/:maDatBan/xac-nhan` | Admin | — | `DatBan` (200) | `CHO_XAC_NHAN` → `DA_XAC_NHAN` |
| `PUT` | `/api/dat-ban/:maDatBan/huy` | Admin | — | `DatBan` (200) | → `DA_HUY` |
| `PUT` | `/api/dat-ban/:maDatBan/khong-den` | Admin | — | `DatBan` (200) | → `KHONG_DEN` |
| `GET` | `/api/khuyen-mai` | Admin | Query: `page`, `limit` | `{ data: KhuyenMai[], total }` | CRUD Voucher |
| `POST` | `/api/khuyen-mai` | Admin | `KhuyenMaiCreateDto` | `KhuyenMai` (201) | |
| `PUT` | `/api/khuyen-mai/:maKhuyenMai` | Admin | `KhuyenMaiUpdateDto` | `KhuyenMai` (200) | |
| `DELETE` | `/api/khuyen-mai/:maKhuyenMai` | Admin | — | 200 | |
| `GET` | `/api/danh-gia` | Admin | Query: `page`, `limit`, `SoSao` | `{ data: DanhGia[], total }` | Quản lý đánh giá |
| `DELETE` | `/api/danh-gia/:maDanhGia` | Admin | — | 200 | Xóa đánh giá |
| `GET` | `/api/don-hang` | Admin | Query: `page`, `limit`, `TrangThai` | `{ data: DonHang[], total }` | Quản lý đơn |
| `PUT` | `/api/don-hang/:maDonHang/huy` | Admin | — | `DonHang` (200) | Hủy đơn ngoại lệ |
| `GET` | `/api/thong-ke` | Admin | Query: `TuNgay`, `DenNgay` | `ThongKe` (200) | Báo cáo doanh thu |

> **Lưu ý:** Tất cả endpoint trên yêu cầu JWT token có `VaiTro = ADMIN`.

---

## 10. Luồng xử lý chính

### 10.1 Quản lý thực đơn

```
1. Admin vào `/noi-bo/thuc-don`

2. Quản lý Danh mục:
   a. Xem danh sách → table phân trang
   b. "Thêm mới" → form → POST /api/danh-muc
   c. "Sửa" → form pre-fill → PUT /api/danh-muc/:maDanhMuc
   d. "Xóa" → dialog xác nhận → DELETE /api/danh-muc/:maDanhMuc

3. Quản lý Món ăn:
   a. Xem danh sách → filter theo danh mục
   b. "Thêm mới" → form → POST /api/mon-an (bao gồm upload ảnh)
   c. "Sửa" → form pre-fill → PUT /api/mon-an/:maMonAn
   d. "Xóa" → dialog xác nhận → DELETE /api/mon-an/:maMonAn
   e. Chuyển trạng thái: CON_HANG ↔ HET ↔ NGUNG_BAN
```

### 10.2 Quản lý nhân viên

```
1. Admin vào `/noi-bo/nhan-vien`

2. Xem danh sách nhân viên → filter theo ChucNangPhu

3. "Thêm mới":
   a. Form: họ tên, SĐT, email, mật khẩu, vai trò (Bếp/Phục vụ/Thu ngân)
   b. POST /api/nhan-vien
   c. Backend hash mật khẩu, tạo NhanVien

4. "Sửa":
   a. Form pre-fill (không hiển thị mật khẩu)
   b. PUT /api/nhan-vien/:maNhanVien

5. "Xóa" (ngừng hoạt động):
   a. PUT /api/nhan-vien/:maNhanVien → TrangThai: NGUNG_HOAT_DONG
   b. Không DELETE cứng
```

### 10.3 Quản lý voucher

```
1. Admin vào `/noi-bo/voucher`

2. "Thêm mới":
   a. Form: tên chương trình, loại giảm, giá trị, đơn tối thiểu, số lượng, thời hạn
   b. POST /api/khuyen-mai
   c. Backend tạo Voucher + tự tạo các mã voucher con (nếu có)

3. "Sửa":
   a. Form pre-fill → PUT /api/khuyen-mai/:maKhuyenMai
   b. Chỉ sửa được voucher chưa hết hạn

4. "Ngừng phát hành":
   a. PUT → TrangThai: NGUNG
   b. Voucher đã phát hành cho KH vẫn dùng được đến hết hạn
```

### 10.4 Quản lý đặt bàn

```
1. Admin vào danh sách đặt bàn

2. Xác nhận đặt bàn:
   a. Click đơn `CHO_XAC_NHAN`
   b. PUT /api/dat-ban/:maDatBan/xac-nhan
   c. TrangThai → DA_XAC_NHAN

3. Hủy đặt bàn:
   a. Click đơn `CHO_XAC_NHAN`
   b. PUT /api/dat-ban/:maDatBan/huy
   c. TrangThai → DA_HUY

4. Đánh dấu không đến:
   a. Click đơn `DA_XAC_NHAN` đã quá giờ hẹn
   b. PUT /api/dat-ban/:maDatBan/khong-den
   c. TrangThai → KHONG_DEN
```

### 10.5 Xem báo cáo

```
1. Admin vào `/noi-bo/bao-cao`

2. Chọn khoảng thời gian: hôm nay / tuần / tháng / tùy chỉnh

3. Hiển thị:
   - Biểu đồ doanh thu theo ngày
   - Tổng doanh thu, tổng đơn, tỷ lệ hủy
   - Top món bán chạy
   - Biểu đồ đánh giá
```

---

## 11. Luồng thay thế

### 11.1 Xóa danh mục có món ăn

```
1. DELETE /api/danh-muc/:maDanhMuc
2. Nếu danh mục có món ăn → 409 "Không thể xóa danh mục có món ăn"
3. Admin cần chuyển món sang danh mục khác trước khi xóa
```

### 11.2 Xóa bàn có đơn hàng

```
1. DELETE /api/ban/:maBan
2. Nếu bàn có DonHang chưa hoàn thành → 409
3. Admin cần thanh toán/hủy tất cả đơn trước khi xóa
```

### 11.3 Sửa giá món ăn

```
1. PUT /api/mon-an/:maMonAn → GiaHienTai mới
2. Backend tự tạo bản ghi lịch sử giá (MonAnLichSuGia)
3. DonHang cũ vẫn giữ giá cũ, đơn mới dùng giá mới
```

---

## 12. Luồng lỗi

| Mã lỗi | Thông báo | Hành động |
|---------|----------|----------|
| 400 - Dữ liệu không hợp lệ | "Vui lòng kiểm tra lại thông tin." | Hiển thị lỗi trên field |
| 401 - Token hết hạn | "Phiên đã hết hạn." | Redirect `/dang-nhap` |
| 403 - Không có quyền | "Bạn không có quyền truy cập." | Redirect trang chủ |
| 404 - Không tìm thấy | "Không tìm thấy dữ liệu." | Reload |
| 409 - Xóa dữ liệu liên kết | "Không thể xóa vì có dữ liệu liên kết." | Hành động khác |
| 409 - Trùng thông tin | "Thông tin đã tồn tại." | Highlight field trùng |
| 500 - Lỗi server | "Đã xảy ra lỗi." | Retry |

---

## 13. Trạng thái thay đổi

### 13.1 DatBan — Admin quản lý

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Actor |
|--------------------|---------|---------------------|-------|
| `CHO_XAC_NHAN` | Admin xác nhận | `DA_XAC_NHAN` | Admin |
| `CHO_XAC_NHAN` | Admin hủy | `DA_HUY` | Admin |
| `CHO_XAC_NHAN` | Hết thời gian chờ | `KHONG_DEN` | Admin / Tự động |
| `DA_XAC_NHAN` | Quá giờ giữ bàn | `KHONG_DEN` | Admin |

### 13.2 Món ăn — Admin quản lý

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo |
|--------------------|---------|---------------------|
| `CON_HANG` | Hết hàng | `HET` |
| `HET` | Nhập hàng lại | `CON_HANG` |
| `CON_HANG` | Ngừng bán | `NGUNG_BAN` |
| `HET` | Ngừng bán | `NGUNG_BAN` |
| `NGUNG_BAN` | Bán lại | `CON_HANG` |

### 13.3 Bàn — Admin quản lý

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo |
|--------------------|---------|---------------------|
| `TRONG` | Chuyển bảo trì | `BAO_TRI` |
| `BAO_TRI` | Kết thúc bảo trì | `TRONG` |

---

## 14. Phân quyền

| Vai trò | Quyền truy cập | Ghi chú |
|---------|----------------|---------|
| **Admin** | Toàn bộ: CRUD tất cả, quản lý đặt bàn, xem báo cáo, cấu hình | JWT `VaiTro = ADMIN` |
| **Nhân viên** | Theo sub-role: Phục vụ (FEAT-03), Bếp (FEAT-04), Thu ngân (FEAT-05) | Không có quyền admin |
| **Khách hàng** | Không truy cập admin | FEAT-01/02 |

---

## 15. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | Admin đăng nhập → vào `/admin`, dashboard hiển thị thống kê | Manual |
| AC-02 | CRUD danh mục: thêm/sửa/xóa thành công | Manual |
| AC-03 | CRUD món ăn: thêm/sửa/xóa, upload ảnh, thay đổi giá | Manual |
| AC-04 | CRUD bàn: thêm/sửa/xóa, thay đổi trạng thái | Manual |
| AC-05 | CRUD nhân viên: thêm/sửa, gán vai trò Bếp/Phục vụ/Thu ngân | Manual |
| AC-06 | Xem danh sách khách hàng | Manual |
| AC-07 | CRUD voucher: thêm/sửa/ngừng phát hành | Manual |
| AC-08 | Xem + xóa đánh giá | Manual |
| AC-09 | Xác nhận/hủy đặt bàn → trạng thái đúng | Manual |
| AC-10 | Đánh dấu `KHONG_DEN` cho đặt bàn quá giờ | Manual |
| AC-11 | Xem báo cáo doanh thu theo khoảng thời gian | Manual |
| AC-12 | Nhân viên KHÔNG thể truy cập `/admin` | Manual |
| AC-13 | Xóa danh mục có món ăn → 409 | Manual |
| AC-14 | Sửa giá món → DonHang cũ giữ nguyên giá cũ | Manual |

---

## 16. Checklist đối chiếu code hiện tại

### Routes

| Route | Tồn tại? | Component | Ghi chú |
|-------|----------|-----------|---------|
| `/admin` | ✅ | `AdminLayout`, `TrangChuAdmin` | |
| `/noi-bo/thuc-don` | ✅ | `QuanLyThucDon`, `DanhMuc`, `MonAn` | |
| `/noi-bo/ban` | ✅ | `QuanLyBan` | |
| `/noi-bo/nhan-vien` | ✅ | `QuanLyNhanVien`, `NhanVien` | |
| `/noi-bo/khach-hang` | ⚠️ | `KhachHang` hoặc `QuanLyKhachHang` | **Cần kiểm tra** |
| `/noi-bo/voucher` | ⚠️ | `KhuyenMai`, `Voucher` hoặc `QuanLyVoucher` | **Cần kiểm tra** |
| `/noi-bo/danh-gia` | ⚠️ | `DanhGia` hoặc `QuanLyDanhGia` | **Cần kiểm tra** |
| `/noi-bo/don-hang` | ✅ | `QuanLyDonHang` | |
| `/noi-bo/bao-cao` | ✅ | `ThongKe` | |
| `/noi-bo/cau-hinh` | ⚠️ | — | **Có thể chưa triển khai** |

### API endpoints

| Endpoint | Tồn tại? | Controller | Ghi chú |
|----------|----------|-----------|---------|
| `GET /api/thong-ke` | ✅ | `thong-ke.controller.ts` | Dashboard + Báo cáo |
| `POST /api/danh-muc` | ✅ | `danh-muc.controller.ts` | |
| `PUT /api/danh-muc/:maDanhMuc` | ✅ | `danh-muc.controller.ts` | |
| `DELETE /api/danh-muc/:maDanhMuc` | ⚠️ | `danh-muc.controller.ts` | **Cần kiểm tra** soft/hard delete |
| `POST /api/mon-an` | ✅ | `mon-an.controller.ts` | |
| `PUT /api/mon-an/:maMonAn` | ✅ | `mon-an.controller.ts` | |
| `DELETE /api/mon-an/:maMonAn` | ⚠️ | `mon-an.controller.ts` | **Cần kiểm tra** |
| `POST /api/ban` | ✅ | `ban.controller.ts` | |
| `PUT /api/ban/:maBan` | ⚠️ | `ban.controller.ts` | **Cần kiểm tra** |
| `DELETE /api/ban/:maBan` | ⚠️ | `ban.controller.ts` | **Cần kiểm tra** |
| `POST /api/khu-vuc` | ✅ | `khu-vuc.controller.ts` | |
| `POST /api/nhan-vien` | ⚠️ | — | **Cần kiểm tra** |
| `GET /api/khach-hang` | ⚠️ | — | **Cần kiểm tra** |
| `GET /api/dat-ban` | ✅ | `dat-ban.controller.ts` | Admin có quyền xem tất cả? |
| `PUT /api/dat-ban/:maDatBan/xac-nhan` | ⚠️ | — | **Cần kiểm tra** |
| `PUT /api/dat-ban/:maDatBan/khong-den` | ⚠️ | — | **Cần kiểm tra** |
| `POST /api/khuyen-mai` | ⚠️ | — | **Cần kiểm tra** |
| `GET /api/danh-gia` | ✅ | `danh-gia.controller.ts` | |
| `DELETE /api/danh-gia/:maDanhGia` | ⚠️ | — | **Cần kiểm tra** |
| `GET /api/thong-ke` | ✅ | `thong-ke.controller.ts` | Báo cáo doanh thu (query: TuNgay, DenNgay) |

### Phân quyền

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| `@UseGuards(AuthGuard)` trên tất cả route admin | ⚠️ | Cần xác minh |
| `VaiTro` check = `ADMIN` | ⚠️ | Cần xác minh |
| Route `/admin/*` redirect → `/noi-bo/*` | ✅ | `ChuyenHuongTuDuongDanCu` component | |

### Tích hợp với FEAT khác

| FEAT | Mối liên hệ |
|------|-------------|
| FEAT-01 | Admin quản lý thực đơn, bàn, khu vực |
| FEAT-02 | Admin quản lý voucher, khách hàng, đặt bàn |
| FEAT-03 | Admin quản lý nhân viên Phục vụ |
| FEAT-04 | Admin quản lý nhân viên Bếp |
| FEAT-05 | Admin quản lý voucher, xem báo cáo thanh toán |
| FEAT-07 | State machines chuẩn — admin thay đổi trạng thái theo rule |

---

*Ghi chú: Admin có quyền cao nhất. Nhiều route cần kiểm tra — có thể chưa triển khai đầy đủ (đặc biệt: dashboard, báo cáo, voucher, cấu hình). Cần xác minh phân quyền `VaiTro = ADMIN` trên tất cả route admin.*
