# AUDIT_CODE_THEO_FEAT

> **Báo cáo kiểm tra code thực tế vs 7 FEAT Specs**
> **Ngày:** 2026-06-09
> **Commit hiện tại:** `128562d7104533ed4a67eafce1e63b616524721f`
> **Branch:** `main`
> **Remote:** `origin https://github.com/laivannha0202/doan3-webquanlynhahang.git`
> **Cơ sở spec:** `docs/features/FEAT_01_*.md` … `docs/features/FEAT_07_*.md`
> **Phạm vi:** Chỉ kiểm tra (read-only). Không sửa code/backend/frontend/database/migration/docs/features. Không commit, không push.
> **Chỉ tạo/cập nhật file này:** `docs/AUDIT_CODE_THEO_FEAT.md`

---

## Mục lục

1. [Tổng quan audit](#1-tổng-quan-audit)
2. [Kết quả theo từng FEAT](#2-kết-quả-theo-từng-feat)
   - [FEAT-01: QR Public Ordering](#feat-01--qr-public-ordering-khách-quét-qr-gọi-món)
   - [FEAT-02: Customer Account + Booking](#feat-02--customer-account--booking-tài-khoản-khách-hàng--đặt-bàn)
   - [FEAT-03: Staff Serving](#feat-03--staff-serving-nhân-viên-phục-vụ)
   - [FEAT-04: Kitchen Staff](#feat-04--kitchen-staff-nhân-viên-bếp)
   - [FEAT-05: Cashier](#feat-05--cashier-thu-ngân)
   - [FEAT-06: Admin](#feat-06--admin-quản-trị)
   - [FEAT-07: Status Enums & API Contract](#feat-07--status-enums--api-contract)
3. [Bảng gap tổng hợp](#3-bảng-gap-tổng-hợp)
4. [Thứ tự code đề xuất (6 slice)](#4-thứ-tự-code-đề-xuất-6-slice)
5. [Kết luận](#5-kết-luận)

---

## 1. Tổng quan audit

### Commit hiện tại

```
128562d7104533ed4a67eafce1e63b616524721f
```

### Remote hiện tại

```
origin  https://github.com/laivannha0202/doan3-webquanlynhahang.git (fetch)
origin  https://github.com/laivannha0202/doan3-webquanlynhahang.git (push)
```

### Phạm vi audit

- Đọc 7 FEAT files trong `docs/features/` để xác định spec chuẩn.
- Đọc code thực tế:
  - Backend controllers/services/constants (`backend/nest-api/src/modules/*`, `backend/nest-api/src/common/constants.ts`)
  - Frontend routes/pages/utils/contracts (`frontend/src/pages/*`, `frontend/src/features/*`, `frontend/src/utils/*`)
  - Database schema + migration (`database/mysql_init_schema.sql`, `database/migrations/V*.sql`)
- So sánh code thực tế vs FEAT spec.
- Ghi nhận gap, không sửa.

### Khẳng định

- **Nguyên tắc:** FEAT spec là chuẩn — code phải khớp spec, không phải ngược lại.
- **Không sửa code** backend/frontend/database/migration/docs/features.
- **Không commit, không push.**
- **Chỉ tạo/cập nhật file:** `docs/AUDIT_CODE_THEO_FEAT.md`.

### Ký hiệu

| Ký hiệu | Ý nghĩa |
|---------|---------|
| ✅ | Đạt — code khớp spec |
| ⚠️ | Sai lệch nhỏ — cần sửa nhưng không block |
| ❌ | GAP — sai spec, cần sửa trước |
| ❓ | Chưa kiểm tra / chưa rõ |
| P0 | Cần sửa ngay (sai logic/bảo mật) |
| P1 | Cần sửa trong sprint này |
| P2 | Có thể để sprint sau |

---

## 2. Kết quả theo từng FEAT

### FEAT-01 — QR Public Ordering (Khách quét QR gọi món)

**Mô tả:** Khách quét QR tại bàn → xem thực đơn → gọi món → theo dõi trạng thái → yêu cầu thanh toán. Tất cả public, không cần đăng nhập.

#### Route frontend

| STT | FEAT yêu cầu | Code thực tế (`frontend/src/App.jsx`) | Kết quả |
|-----|-------------|--------------------------------------|---------|
| 1 | `/` (trang chủ) | `TrangChuPage` | ✅ |
| 2 | `/thuc-don` | `ThucDonPage` | ✅ |
| 3 | `/gioi-thieu` | `GioiThieuPage` | ✅ |
| 4 | `/ban/:maBan` | `BanGoiMonPage` tại `/ban/:maBan` | ✅ |
| 5 | `/ban/:maBan/goi-mon` | Route riêng `/ban/:maBan/goi-mon` | ✅ |

**Kết luận Route:** ✅ Đủ

#### API backend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `GET /api/ban` (public) | `BanController @Public() @Get()` | ✅ |
| 2 | `GET /api/ban/:maBan` (public) | `BanController @Public() @Get(':maBan')` | ✅ |
| 3 | `GET /api/ban/:maBan/thuc-don` (public) | `BanController @Public() @Get(':maBan/thuc-don')` | ✅ |
| 4 | `GET /api/thuc-don?danhMuc=...` (public) | `ThucDonController @Public() @Get()` | ✅ |
| 5 | `GET /api/thuc-don/:maMon` (public) | `ThucDonController @Public() @Get(':maMon')` | ✅ |
| 6 | `POST /api/ban/:maBan/order` (guest) | `BanController @Public() @Post(':maBan/order')` | ✅ |
| 7 | `GET /api/ban/:maBan/order` (guest) | `BanController @Public() @Get(':maBan/order')` | ✅ |
| 8 | `POST /api/ban/:maBan/yeu-cau-thanh-toan` (guest) | `BanController @Public() @Post(':maBan/yeu-cau-thanh-toan')` | ✅ |

**Kết luận API:** ✅ Đủ

#### Database/Entity

| Bảng/Entity | FEAT yêu cầu | Code thực tế | Kết quả |
|------------|-------------|-------------|---------|
| Ban | Có mã bàn (MaBan), trạng thái, sức chứa | Entity `Ban` với `maBan`, `trangThai`, `sucChua` | ✅ |
| ThucDon | Có món ăn, danh mục, giá, hình ảnh | Entity `ThucDon` + `DanhMuc` | ✅ |
| ChiTietDonHang | Liên kết đơn hàng + món ăn + trạng thái | Entity `ChiTietDonHang` | ✅ (trạng thái chưa đồng bộ — xem FEAT-07) |
| DonHang | Đơn hàng theo bàn | Entity `DonHang` | ✅ (trạng thái chưa đồng bộ — xem FEAT-07) |

#### Trạng thái

| Entity | Kết quả | Ghi chú |
|--------|---------|---------|
| DonHang | ⚠️ | Dùng trạng thái cấm (xem FEAT-07) |
| ChiTietDonHang | ⚠️ | Dùng trạng thái cấm (xem FEAT-07) |

#### Kết luận FEAT-01

| Hạng mục | Kết quả |
|----------|---------|
| Route frontend | ✅ Đủ |
| API backend | ✅ Đủ |
| Database/Entity | ✅ Đủ |
| Trạng thái | ⚠️ Lệch (phụ thuộc FEAT-07) |
| **Tổng** | **✅ Đạt** — flow QR public hoạt động đúng spec |
| **Mức ưu tiên sửa** | **P2** (chỉ cần đồng bộ status sau FEAT-07) |

---

### FEAT-02 — Customer Account + Booking (Tài khoản khách hàng + Đặt bàn)

**Mô tả:** Khách đăng ký/đăng nhập → quản lý hồ sơ → đặt bàn → xem điểm tích lũy + mã giảm giá + đánh giá.

#### Route frontend

| STT | FEAT yêu cầu | Code thực tế (`frontend/src/App.jsx`) | Kết quả |
|-----|-------------|--------------------------------------|---------|
| 1 | `/dang-nhap` | `DangNhapPage` | ✅ |
| 2 | `/dang-ky` | `DangKyPage` | ✅ |
| 3 | `/ho-so` | `HoSoPage` | ✅ |
| 4 | `/dat-ban` | `DatBanPage` | ✅ |
| 5 | `/danh-gia` | `DanhGiaPage` | ✅ |
| 6 | `/doi-mat-khau` | Không có route riêng | ⚠️ Thiếu (có API nhưng không có route) |
| 7 | `/diem-tich-luy` | Không có route riêng | ⚠️ Thiếu (có API nhưng không có route) |

**Kết luận Route:** ⚠️ Thiếu route `/doi-mat-khau` và `/diem-tich-luy`

#### API backend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `POST /api/auth/register` (public) | `AuthController @Public() @Post('register')` | ✅ |
| 2 | `POST /api/auth/login` (public) | `AuthController @Public() @Post('login')` | ✅ |
| 3 | `POST /api/auth/internal-login` (public) | `AuthController @Public() @Post('internal-login')` | ✅ |
| 4 | `POST /api/auth/logout` (auth) | `AuthController @UseGuards(JwtAuthGuard) @Post('logout')` | ✅ |
| 5 | `POST /api/auth/refresh` (public) | `AuthController @Public() @Post('refresh')` | ✅ |
| 6 | `GET /api/auth/me` (auth) | `AuthController @UseGuards(JwtAuthGuard) @Get('me')` | ✅ |
| 7 | `PUT /api/auth/me` (profile) (auth) | `AuthController @UseGuards(JwtAuthGuard) @Put('profile')` | ⚠️ Path `/profile` thay vì `/me` |
| 8 | `PUT /api/auth/doi-mat-khau` (auth) | `AuthController @UseGuards(JwtAuthGuard) @Put('doi-mat-khau')` | ✅ |
| 9 | `POST /api/dat-ban` (auth) | `DatBanController @Post()` | ✅ |
| 10 | `GET /api/dat-ban` (auth) | `DatBanController @Get()` | ✅ |
| 11 | `GET /api/dat-ban/availability` (public) | `DatBanController @Public() @Get('availability')` | ✅ |
| 12 | `GET /api/diem-tich-luy/me` (auth) | `DiemTichLuyController @Get('me')` | ✅ |
| 13 | `GET /api/ma-giam-gia/me` (auth) | `MaGiamGiaController @Get('me')` | ✅ |
| 14 | `POST /api/danh-gia` (auth) | `DanhGiaController @Post()` | ✅ |
| 15 | `GET /api/danh-gia` (public) | `DanhGiaController @Public() @Get()` | ✅ |
| 16 | `POST /api/diem-tich-luy/tinh-diem` (internal) | `DiemTichLuyController @Post('tinh-diem')` | ❓ Ngoài spec |
| 17 | `POST /api/diem-tich-luy/doi-diem` (auth) | `DiemTichLuyController @Post('doi-diem')` | ❓ Ngoài spec |
| 18 | `POST /api/diem-tich-luy/huy-don` (internal) | `DiemTichLuyController @Post('huy-don')` | ❓ Ngoài spec |
| 19 | `POST /api/ma-giam-gia/validate` (public) | `MaGiamGiaController @Public() @Post('validate')` | ❓ Ngoài spec |
| 20 | `GET /api/ma-giam-gia/public` (public) | `MaGiamGiaController @Public() @Get('public')` | ❓ Ngoài spec |
| 21 | `GET /api/ma-giam-gia/me/checkout` (auth) | `MaGiamGiaController @Get('me/checkout')` | ❓ Ngoài spec |

**Kết luận API:** ✅ Đủ spec + có thêm endpoints mới (tích lũy điểm, voucher, validate)

#### Database/Entity

| Bảng/Entity | FEAT yêu cầu | Code thực tế | Kết quả |
|------------|-------------|-------------|---------|
| NguoiDung | Lưu thông tin khách hàng | Entity `NguoiDung` (col: email, soDienThoai, matKhau, hoTen, vaiTro, diemTichLuy) | ✅ |
| DatBan | Đặt bàn, thời gian, trạng thái | Entity `DatBan` (col: maDatBan, maKH, maBan, thoiGianDat, trangThai) | ⚠️ Trạng thái DatBan: `DA_DEN` cấm |
| DiemTichLuy | Điểm tích lũy | Entity `DiemTichLuy` | ✅ |
| MaGiamGia | Mã giảm giá | Entity `MaGiamGia` | ✅ |
| DanhGia | Đánh giá | Entity `DanhGia` | ✅ |

#### Trạng thái

| Entity | Kết quả | Ghi chú |
|--------|---------|---------|
| DatBan | ⚠️ | `DA_DEN` là CẤM per FEAT-07 (phải là `DA_NHAN_BAN`) |
| NguoiDung | ✅ | VaiTro: Admin, NhanVien, KhachHang |

#### Kết luận FEAT-02

| Hạng mục | Kết quả |
|----------|---------|
| Route frontend | ⚠️ Thiếu `/doi-mat-khau`, `/diem-tich-luy` |
| API backend | ✅ Đủ (có thêm endpoints ngoài spec) |
| Database/Entity | ✅ Đủ |
| Trạng thái | ⚠️ Lệch (DatBan `DA_DEN` là CẤM) |
| **Tổng** | **⚠️ Sai lệch nhỏ** — thêm route FE, đồng bộ trạng thái DatBan |
| **Mức ưu tiên sửa** | **P1** |

---

### FEAT-03 — Staff Serving (Nhân viên phục vụ)

**Mô tả:** Nhân viên phục vụ quản lý sơ đồ bàn, tạo đơn, chuyển trạng thái bàn/món.

#### Route frontend

| STT | FEAT yêu cầu | Code thực tế (`frontend/src/App.jsx`) | Kết quả |
|-----|-------------|--------------------------------------|---------|
| 1 | `/noi-bo/quan-ly-ban` | `/noi-bo/so-do-ban` → `SoDoBanPage` | ⚠️ Route khác tên |
| 2 | `/noi-bo/tao-don` | Không có route riêng | ❌ Thiếu (dùng chung BanGoiMonPage) |
| 3 | `/noi-bo/don-hang` | `NoiBoDonHangPage` | ✅ |
| 4 | `/noi-bo/don-hang/:maDonHang` | Không có route riêng | ⚠️ Thiếu (detail đơn trong cùng component) |

**Kết luận Route:** ⚠️ Thiếu route `/noi-bo/quan-ly-ban` (dùng tên khác), thiếu `/noi-bo/tao-don`, thiếu route chi tiết đơn

#### API backend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `PATCH /api/ban/:maBan/status` (Phục vụ) | `BanController @Roles('Admin', 'NhanVien') @Patch(':maBan/status')` | ✅ |
| 2 | `POST /api/ban/:maBan/order` (tạo đơn) | `BanController @Public() @Post(':maBan/order')` | ✅ |
| 3 | `GET /api/don-hang` (staff) | `DonHangController @Roles('Admin', 'NhanVien') @Get()` | ✅ |
| 4 | `PATCH /api/don-hang/:maDonHang/status` (staff) | `DonHangController @Roles('Admin', 'NhanVien') @Patch(':maDonHang/status')` | ✅ |
| 5 | Phân quyền PHUC_VU (sub-role) | Chỉ check `VaiTro = 'NhanVien'`, không check `ChucNangPhu` | ⚠️ Chưa granular |
| 6 | Bàn trống → Có khách | Code có `@Patch(':maBan/status')` | ✅ |

**Kết luận API:** ✅ Đủ — nhưng phân quyền chưa granular (ai là NhanVien cũng được phục vụ, kể cả Bep/ThuNgan)

#### Database/Entity

| Bảng/Entity | FEAT yêu cầu | Code thực tế | Kết quả |
|------------|-------------|-------------|---------|
| Ban | Trạng thái: TRONG, CO_KHACH | Entity Ban có `trangThai` enum | ✅ |
| DonHang | Liên kết bàn + trạng thái | Entity DonHang | ⚠️ Trạng thái chưa đồng bộ |

#### Trạng thái

| Entity | Kết quả | Ghi chú |
|--------|---------|---------|
| DonHang | ❌ | FEAT-07: `DANG_PHUC_VU`, `HOAN_THANH`. Code dùng `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU` (CẤM) |

#### Kết luận FEAT-03

| Hạng mục | Kết quả |
|----------|---------|
| Route frontend | ⚠️ Thiếu/lệch tên route |
| API backend | ⚠️ Phân quyền chưa granular |
| Database/Entity | ✅ Đủ |
| Trạng thái | ❌ Dùng trạng thái cấm cho DonHang |
| **Tổng** | **⚠️ Sai lệch** — cần đồng bộ route, phân quyền, trạng thái |
| **Mức ưu tiên sửa** | **P1** |

---

### FEAT-04 — Kitchen Staff (Nhân viên bếp)

**Mô tả:** Nhân viên bếp xem đơn chờ (món cần chế biến), cập nhật trạng thái từng món.

#### Route frontend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `/noi-bo/don-hang` (bếp xem) | `NoiBoDonHangPage` tại `/noi-bo/don-hang` | ✅ (cùng route với phục vụ — filter role) |
| 2 | `/noi-bo/bep` (riêng) | Không có route riêng | ⚠️ FEAT-04 không yêu cầu route riêng, dùng chung don-hang |

#### API backend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `GET /api/don-hang` (bếp) | `DonHangController @Roles('Admin', 'NhanVien') @Get()` | ✅ |
| 2 | `PATCH /api/don-hang/:maDonHang/chi-tiet/:maChiTiet/trang-thai` | `@Patch(':maDonHang/chi-tiet/:maChiTiet/trang-thai')` | ✅ |
| 3 | Phân quyền BEP (sub-role) | Chỉ check `VaiTro = 'NhanVien' ` | ⚠️ Chưa granular |

**Kết luận API:** ✅ Endpoint đủ — nhưng chưa phân quyền granular

#### Database/Entity

| Bảng/Entity | FEAT yêu cầu | Code thực tế | Kết quả |
|------------|-------------|-------------|---------|
| ChiTietDonHang | Mỗi món trong đơn có trạng thái riêng | Entity `ChiTietDonHang` có `trangThai` | ⚠️ Trạng thái chưa đồng bộ |

#### Trạng thái ❌ GAP NGHIÊM TRỌNG

**FEAT-04 kỳ vọng flow ChiTietDonHang:** `DANG_CHUAN_BI` → `DANG_PHUC_VU` → `HOAN_THANH`

**Code constants.ts dùng:**

| FEAT-04 yêu cầu | Code constants.ts | Kết quả |
|-----------------|-------------------|---------|
| `DANG_CHUAN_BI` (món chờ) | `CHO_CHE_BIEN` | ❌ CẤM per FEAT-07 |
| `DANG_PHUC_VU` (đang làm) | `DANG_CHE_BIEN` | ❌ CẤM per FEAT-07 |
| — | `SAN_SANG` (chờ mang ra) | ❌ CẤM per FEAT-07 |
| — | `DA_PHUC_VU` | ❌ CẤM per FEAT-07 |
| `HOAN_THANH` (xong) | `HOAN_THANH` | ✅ Đúng |
| `DA_HUY` | `DA_HUY` | ✅ Đúng |

**4/6 trạng thái ChiTietDonHang là CẤM.**

#### Kết luận FEAT-04

| Hạng mục | Kết quả |
|----------|---------|
| Route frontend | ✅ Đủ (dùng chung) |
| API backend | ✅ Đủ endpoint, ⚠️ chưa phân quyền granular |
| Database/Entity | ⚠️ Cần đồng bộ |
| Trạng thái | ❌ **4/6 trạng thái CẤM** |
| **Tổng** | **❌ GAP — ưu tiên sửa trạng thái** |
| **Mức ưu tiên sửa** | **P0** |

---

### FEAT-05 — Cashier (Thu ngân)

**Mô tả:** Thu ngân xem đơn hoàn thành, xác nhận thanh toán, in hóa đơn, quản lý voucher.

#### Route frontend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `/noi-bo/don-hang` (chờ thanh toán) | `NoiBoDonHangPage` tại `/noi-bo/don-hang` | ✅ |
| 2 | `/noi-bo/thanh-toan` | Không có route riêng | ⚠️ Thanh toán trong DonHangPage |

#### API backend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `POST /api/ban/:maBan/xac-nhan-thanh-toan` **(CHỈ Thu ngân)** | `BanController @Roles('Admin', 'NhanVien')` | ❌ **Bất kỳ NhanVien nào cũng được** — không granular |
| 2 | `POST /api/ban/:maBan/in-hoa-don` | Chưa kiểm tra | ❓ |
| 3 | `POST /api/ma-giam-gia/validate` | `MaGiamGiaController @Public() @Post('validate')` | ✅ |
| 4 | `GET /api/ma-giam-gia` (staff) | `MaGiamGiaController @Roles('Admin', 'NhanVien') @Get()` | ✅ |

**Kết luận API:** ⚠️ Quyền thanh toán chưa granular — cần thêm role `ThuNgan` hoặc `ChucNangPhu = 'THU_NGAN'`

#### Database/Entity

| Bảng/Entity | FEAT yêu cầu | Code thực tế | Kết quả |
|------------|-------------|-------------|---------|
| ThanhToan | Lưu thông tin thanh toán | Entity `ThanhToan` | ✅ |
| HoaDon | In hóa đơn sau thanh toán | Chưa kiểm tra | ❓ |

#### Trạng thái

| Entity | Kết quả | Ghi chú |
|--------|---------|---------|
| DonHang | ❌ | Filter `HOAN_THANH` cho chờ thanh toán — code dùng `CHO_XU_LY` (CẤM) |
| ThanhToan | ⚠️ | FEAT-07: `THANH_CONG`, `THAT_BAI`, `DA_HOAN_TIEN`. Code có thêm `CHO_THANH_TOAN` (không có trong FEAT-07) |

#### Kết luận FEAT-05

| Hạng mục | Kết quả |
|----------|---------|
| Route frontend | ✅ Đủ |
| API backend | ❌ Quyền chưa granular, thiếu in-hóa-don |
| Database/Entity | ⚠️ Chưa kiểm tra HoaDon |
| Trạng thái | ⚠️ ThanhToan thừa `CHO_THANH_TOAN`, DonHang dùng trạng thái cấm |
| **Tổng** | **⚠️ Sai lệch — cần granular quyền + đồng bộ trạng thái** |
| **Mức ưu tiên sửa** | **P1** |

---

### FEAT-06 — Admin (Quản trị)

**Mô tả:** Admin quản lý toàn bộ hệ thống: người dùng, thực đơn, bàn, đặt bàn, đơn hàng, voucher, thống kê, đánh giá.

#### Route frontend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | `/noi-bo/dashboard` | `NoiBoDashboardPage` | ✅ |
| 2 | `/noi-bo/so-do-ban` | `NoiBoSoDoBanPage` | ✅ |
| 3 | `/noi-bo/don-hang` | `NoiBoDonHangPage` | ✅ |
| 4 | `/noi-bo/dat-ban` | `NoiBoDatBanPage` | ✅ |
| 5 | `/noi-bo/khach-hang` | `NoiBoKhachHangPage` | ✅ |
| 6 | `/noi-bo/nhan-vien` | `NoiBoNhanVienPage` | ✅ |
| 7 | `/noi-bo/thuc-don` | `NoiBoThucDonPage` | ✅ |
| 8 | `/noi-bo/ma-giam-gia` | `NoiBoMaGiamGiaPage` | ✅ |
| 9 | `/noi-bo/thong-ke` | `NoiBoThongKePage` | ✅ |
| 10 | `/noi-bo/danh-gia` | `NoiBoDanhGiaPage` | ✅ |

**Kết luận Route:** ✅ Đủ

#### API backend

| STT | FEAT yêu cầu | Code thực tế | Kết quả |
|-----|-------------|-------------|---------|
| 1 | CRUD `api/nguoi-dung` (Admin) | `NguoiDungController @Roles('Admin')` | ✅ |
| 2 | CRUD `api/thuc-don` (Admin) | `ThucDonController @Roles('Admin')` | ✅ |
| 3 | CRUD `api/ban` (Admin) | `BanController @Roles('Admin')` | ✅ |
| 4 | CRUD `api/dat-ban` (Admin) | `DatBanController @Roles('Admin', 'NhanVien')` | ✅ |
| 5 | CRUD `api/don-hang` (Admin) | `DonHangController @Roles('Admin', 'NhanVien')` | ✅ |
| 6 | CRUD `api/ma-giam-gia` (Admin) | `MaGiamGiaController @Roles('Admin')` | ✅ |
| 7 | `GET /api/thong-ke` (Admin) | `ThongKeController @Roles('Admin', 'QuanLy')` | ✅ |
| 8 | CRUD `api/danh-gia` (Admin) | `DanhGiaController @Roles('Admin')` | ✅ |
| 9 | Module `api/thong-bao` | `ThongBaoController` | ❓ Ngoài spec (FEAT-06 không đề cập) |

**Kết luận API:** ✅ Đủ + có thêm module thong-bao

#### Database/Entity

| Bảng/Entity | FEAT yêu cầu | Code thực tế | Kết quả |
|------------|-------------|-------------|---------|
| NguoiDung | Quản lý user | Entity `NguoiDung` | ✅ |
| ThucDon | Quản lý món ăn | Entity `ThucDon` + `DanhMuc` | ✅ |
| Ban | Quản lý bàn | Entity `Ban` | ✅ |
| MaGiamGia | Quản lý voucher | Entity `MaGiamGia` | ✅ |

#### Kết luận FEAT-06

| Hạng mục | Kết quả |
|----------|---------|
| Route frontend | ✅ Đủ |
| API backend | ✅ Đủ (có thêm thong-bao) |
| Database/Entity | ✅ Đủ |
| Trạng thái | ✅ (Admin không phụ thuộc trạng thái cụ thể) |
| **Tổng** | **✅ Đạt** |
| **Mức ưu tiên sửa** | **P2** |

---

### FEAT-07 — Status Enums & API Contract

**Mô tả:** Định nghĩa trạng thái chuẩn cho toàn bộ entity + API contract chi tiết.
**Đây là FEAT quan trọng nhất — code hiện tại VI PHẠM nhiều điểm.**

#### 7.1 Trạng thái DonHang

**FEAT-07 chuẩn (5 states):** `DANG_CHUAN_BI`, `DANG_PHUC_VU`, `HOAN_THANH`, `DA_THANH_TOAN`, `DA_HUY`

**Code `constants.ts`:**

| STT | Code constants.ts | FEAT-07 | Kết quả |
|-----|-------------------|---------|---------|
| 1 | `CHO_XU_LY` | `DANG_CHUAN_BI` | ❌ CẤM |
| 2 | `DA_XAC_NHAN` | ❌ Không có trong DonHang FEAT-07 | ⚠️ Thừa |
| 3 | `DANG_CHE_BIEN` | `DANG_PHUC_VU` | ❌ CẤM |
| 4 | `SAN_SANG` | `HOAN_THANH` | ❌ CẤM |
| 5 | `DA_PHUC_VU` | `HOAN_THANH` (hoặc `DANG_PHUC_VU`) | ❌ CẤM |
| 6 | `HOAN_THANH` | `HOAN_THANH` | ✅ |
| 7 | `DA_THANH_TOAN` | `DA_THANH_TOAN` | ✅ |
| 8 | `DA_HUY` | `DA_HUY` | ✅ |
| 9 | `DA_HOAN_TIEN` | ❌ Là trạng thái ThanhToan | ⚠️ Sai entity |

**Kết quả: 5/9 CẤM hoặc SAI — chỉ 4/9 đúng.**

#### 7.2 Trạng thái ChiTietDonHang

**FEAT-07 chuẩn (4 states):** `DANG_CHUAN_BI`, `DANG_PHUC_VU`, `HOAN_THANH`, `DA_HUY`

**Code `constants.ts`:**

| STT | Code constants.ts | FEAT-07 | Kết quả |
|-----|-------------------|---------|---------|
| 1 | `CHO_CHE_BIEN` | `DANG_CHUAN_BI` | ❌ CẤM |
| 2 | `DANG_CHE_BIEN` | `DANG_PHUC_VU` | ❌ CẤM |
| 3 | `SAN_SANG` | `HOAN_THANH` | ❌ CẤM |
| 4 | `DA_PHUC_VU` | `DANG_PHUC_VU` (đang phục vụ) hoặc `HOAN_THANH` | ❌ CẤM |
| 5 | `HOAN_THANH` | `HOAN_THANH` | ✅ |
| 6 | `DA_HUY` | `DA_HUY` | ✅ |

**Kết quả: 4/6 CẤM — chỉ 2/6 đúng.**

#### 7.3 Trạng thái DatBan

**FEAT-07 chuẩn (6 states):** `CHO_XAC_NHAN`, `DA_XAC_NHAN`, `DA_NHAN_BAN`, `HOAN_THANH`, `KHONG_DEN`, `DA_HUY`

**Code `constants.ts`:**

| STT | Code constants.ts | FEAT-07 | Kết quả |
|-----|-------------------|---------|---------|
| 1 | `CHO_XAC_NHAN` | `CHO_XAC_NHAN` | ✅ |
| 2 | `DA_XAC_NHAN` | `DA_XAC_NHAN` | ✅ |
| 3 | `DA_DEN` | `DA_NHAN_BAN` | ❌ CẤM |
| 4 | `HOAN_THANH` | `HOAN_THANH` | ✅ |
| 5 | `KHONG_DEN` | `KHONG_DEN` | ✅ |
| 6 | `DA_HUY` | `DA_HUY` | ✅ |
| 7 | `HET_HAN` | ❌ Không có trong FEAT-07 | ⚠️ Thừa |

**Kết quả: 1/7 CẤM (`DA_DEN`), 1/7 thừa (`HET_HAN`).**

#### 7.4 Trạng thái Ban

**FEAT-07 chuẩn (5 states):** `TRONG`, `DA_DAT`, `CO_KHACH`, `DANG_DON`, `BAO_TRI`

**Code `constants.ts`:** ✅ Khớp hoàn toàn.

#### 7.5 Trạng thái ThanhToan

**FEAT-07 chuẩn (3 states):** `THANH_CONG`, `THAT_BAI`, `DA_HOAN_TIEN`

**Code `constants.ts`:**

| STT | Code constants.ts | FEAT-07 | Kết quả |
|-----|-------------------|---------|---------|
| 1 | `CHO_THANH_TOAN` | ❌ Không có | ⚠️ Thừa |
| 2 | `THANH_CONG` | `THANH_CONG` | ✅ |
| 3 | `THAT_BAI` | `THAT_BAI` | ✅ |
| 4 | `DA_HOAN_TIEN` | `DA_HOAN_TIEN` | ✅ |

**Kết quả: 1/4 thừa (`CHO_THANH_TOAN`).**

#### 7.6 Trạng thái Voucher

**FEAT-07 yêu cầu:** Kiểm tra sau. Chưa đọc chi tiết MaGiamGia entity.

**Kết quả:** ❓ Chưa kiểm tra.

#### 7.7 API Contract sai lệch

| # | FEAT-07 yêu cầu | Code thực tế | Mức độ | Kết quả |
|---|-----------------|-------------|--------|---------|
| A1 | `PATCH /api/auth/profile` | `PUT /api/auth/profile` | Thấp | ⚠️ Method khác (PATCH vs PUT) |
| A2 | `GET /api/don-hang/:maDonHang` — **ghi chú: không có** | `@Get(':maDonHang')` **CÓ** | Thấp | ⚠️ Có endpoint dù FEAT-07 ghi không có |
| A3 | `PATCH /api/don-hang/chi-tiet/:maChiTiet/status` | `PATCH /api/don-hang/:maDonHang/chi-tiet/:maChiTiet/trang-thai` | Trung bình | ⚠️ Path khác (có thêm `:maDonHang`, dùng `trang-thai` thay `status`) |
| A4 | `POST /api/ban/:maBan/xac-nhan-thanh-toan` — **CHỈ Thu ngân** | `@Roles('Admin', 'NhanVien')` | **Cao** | ❌ Bất kỳ NhanVien nào cũng thanh toán được |
| A5 | `PUT /api/ban/:maBan/dat-ban/:maDatBan/xep-ban` | **Không có** | Trung bình | ❌ Thiếu endpoint xếp bàn |
| A6 | `PATCH /api/dat-ban/:maDatBan/xac-nhan` | Không có endpoint riêng — dùng chung `PATCH :maDatBan/status` | Trung bình | ⚠️ Generic thay vì specific |
| A7 | `PATCH /api/dat-ban/:maDatBan/huy` | Không có endpoint riêng | Trung bình | ⚠️ Generic |
| A8 | `PATCH /api/dat-ban/:maDatBan/nhan-ban` | Không có endpoint riêng | Trung bình | ⚠️ Generic |
| A9 | `PUT /api/ban/:maBan/trang-thai` | `PATCH /api/ban/:maBan/status` | Thấp | ⚠️ Method + path |

#### 7.8 Database ENUM thực tế

| Bảng | DB ENUM hiện tại | FEAT-07 chuẩn | Kết quả |
|------|-----------------|---------------|---------|
| DonHang | 16 giá trị: Pending, Confirmed, Preparing, Ready, Served, Serving, Paid, Cancelled, Completed, CHO_XU_LY, DANG_CHE_BIEN, SAN_SANG, DANG_PHUC_VU, DA_THANH_TOAN, DA_HUY, DA_HOAN_TIEN | `DANG_CHUAN_BI`, `DANG_PHUC_VU`, `HOAN_THANH`, `DA_THANH_TOAN`, `DA_HUY` | ❌ 11 giá trị thừa/sai |
| ChiTietDonHang | CHO_CHE_BIEN, DANG_CHE_BIEN, SAN_SANG, DA_PHUC_VU, HOAN_THANH, DA_HUY | `DANG_CHUAN_BI`, `DANG_PHUC_VU`, `HOAN_THANH`, `DA_HUY` | ❌ 4/6 CẤM |
| DatBan | CHO_XAC_NHAN, DA_XAC_NHAN, DA_DEN, HOAN_THANH, KHONG_DEN, DA_HUY, HET_HAN | `CHO_XAC_NHAN`, `DA_XAC_NHAN`, `DA_NHAN_BAN`, `HOAN_THANH`, `KHONG_DEN`, `DA_HUY` | ❌ `DA_DEN` thay `DA_NHAN_BAN`, thừa `HET_HAN` |
| Ban | TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI | ✅ Khớp | ✅ |
| ThanhToan | Pending, Success, Failed, Refunded (English) | `THANH_CONG`, `THAT_BAI`, `DA_HOAN_TIEN` | ❌ English + chưa VN |
| Voucher | ❓ Chưa kiểm tra | — | ❓ |

#### 7.9 V2 Migration (đã chạy)

File: `database/migrations/V2__chuan_hoa_trang_thai_enum_viet.sql`

Migration này đã:
- Chuyển DonHang ENUM từ English → **sang trạng thái CẤM** (`CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU`)
- Chuyển DatBan ENUM → **sang `DA_DEN`** (CẤM) thay vì `DA_NHAN_BAN`
- Chuyển ChiTietDonHang ENUM → **sang `CHO_CHE_BIEN`**, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU` (tất cả CẤM)

**→ Cần V3 migration để chuyển từ trạng thái CẤM → trạng thái chuẩn FEAT-07.**

#### 7.10 `don-hang-payment-status.service.ts` — Hardcoded set sai

File: `backend/nest-api/src/modules/don-hang/don-hang-payment-status.service.ts` (dòng 20–36)

```typescript
TRANG_THAI_DON_HANG_HOP_LE = new Set([
  'Pending', 'Confirmed', 'Preparing', 'Ready', 'Served', 'Serving', 
  'Paid', 'Cancelled', 'Completed',     // ← English legacy (9 states)
  'CHO_XU_LY', 'DANG_CHE_BIEN',        // ← BANNED (2 states)
  'SAN_SANG', 'DANG_PHUC_VU',          // ← 1 banned + 1 valid
  'DA_THANH_TOAN', 'DA_HUY'             // ← 2 valid
]);
```

**Vấn đề:**
- Chấp nhận 9 English legacy states (gây nhầm lẫn)
- Chấp nhận 3 trạng thái CẤM (`CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG`)
- Thiếu `HOAN_THANH`, `DANG_CHUAN_BI` (trạng thái chuẩn FEAT-07)
- Frontend gửi trạng thái mới → backend sẽ reject vì không trong set này

#### 7.11 Frontend constants còn trạng thái cũ/cấm

| File | Dòng | Chi tiết |
|------|------|----------|
| `frontend/src/features/donHang/contracts.js` | 2–6 | `CHO_XU_LY: '#ffa39e'`, `DANG_CHE_BIEN: '#ffd591'`, `SAN_SANG: '#b7eb8f'`, `DA_PHUC_VU: '#91d5ff'` — tất cả CẤM |
| `frontend/src/utils/donHang.js` | 52–54 | `TRANG_THAI_DON_HANG_DANG_HOAT_DONG` chứa `CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG` — CẤM |
| `frontend/src/pages/noiBo/NoiBoKhachHangPage.jsx` | 56 | `TRANG_THAI_DONHANG_MAP` có `SAN_SANG`, `Served`, `Paid`, `Completed` — CẤM + English |

#### Kết luận FEAT-07

| Hạng mục | Kết quả |
|----------|---------|
| Trạng thái DonHang constants | ❌ **5/9 CẤM hoặc SAI** |
| Trạng thái ChiTietDonHang constants | ❌ **4/6 CẤM** |
| Trạng thái DatBan constants | ❌ **1/7 CẤM (`DA_DEN`)** |
| Trạng thái ThanhToan constants | ⚠️ Thừa `CHO_THANH_TOAN` |
| Trạng thái Ban constants | ✅ Đúng |
| DB DonHang ENUM | ❌ 11/16 giá trị sai |
| DB ChiTietDonHang ENUM | ❌ 4/6 CẤM |
| DB DatBan ENUM | ❌ `DA_DEN` thay `DA_NHAN_BAN` |
| DB ThanhToan ENUM | ❌ English |
| don-hang-payment-status set | ❌ Hardcoded sai (chứa English + CẤM) |
| Frontend contracts | ❌ Dùng trạng thái CẤM |
| API Contract A4 (quyền thanh toán) | ❌ Không granular |
| API Contract A5 (xếp bàn) | ❌ Thiếu endpoint |
| API Contract A6-A8 (DatBan actions) | ⚠️ Generic thay vì specific |
| V2 Migration | ❌ Đã tạo trạng thái CẤM |
| **Tổng** | **❌ GAP NGHIÊM TRỌNG — cần V3 migration + đồng bộ toàn bộ** |
| **Mức ưu tiên sửa** | **P0** |

---

## 3. Bảng gap tổng hợp

### 3.1 Trạng thái — Entity vs FEAT-07

| Entity | FEAT-07 chuẩn | Code constants | DB ENUM | Kết quả |
|--------|---------------|----------------|---------|---------|
| Ban | 5 states | 5 states ✅ | 5 states ✅ | ✅ Khớp |
| DatBan | 6 states | 7 states: `DA_DEN` (CẤM) + `HET_HAN` (thừa) | `DA_DEN` + `HET_HAN` | ❌ `DA_DEN` → `DA_NHAN_BAN` |
| DonHang | 5 states | 9 states: 5 CẤM + `DA_HOAN_TIEN` sai entity | 16 states (English + VN cấm) | ❌ **Sai hoàn toàn** |
| ChiTietDonHang | 4 states | 6 states: 4 CẤM | 6 states: 4 CẤM | ❌ **Sai hoàn toàn** |
| ThanhToan | 3 states | 4 states: thừa `CHO_THANH_TOAN` | English | ⚠️ Chưa VN + thừa |
| Voucher | 3 states | ❓ Chưa kiểm tra | ❓ | ❓ |

### 3.2 Backend constants còn trạng thái cũ/cấm

| File | Vị trí | Trạng thái cấm |
|------|--------|----------------|
| `backend/nest-api/src/common/constants.ts` | `TRANG_THAI_DON_HANG` | `CHO_XU_LY`, `DA_XAC_NHAN`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU`, `DA_HOAN_TIEN` |
| `backend/nest-api/src/common/constants.ts` | `TRANG_THAI_CHI_TIET_DON_HANG` | `CHO_CHE_BIEN`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU` |
| `backend/nest-api/src/common/constants.ts` | `TRANG_THAI_DAT_BAN` | `DA_DEN` |
| `backend/nest-api/src/common/constants.ts` | `TRANG_THAI_DON_HANG_DANG_MO` | `CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU` |
| `backend/nest-api/src/common/constants.ts` | `TRANG_THAI_DAT_BAN_GIU_BAN` | `DA_DEN` |
| `backend/nest-api/src/common/constants.ts` | `TRANG_THAI_DON_HANG_CHO_THANH_TOAN` | `CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG` (nếu filter theo trạng thái đơn) |
| `backend/nest-api/src/modules/don-hang/don-hang-payment-status.service.ts` | Dòng 20–36 `TRANG_THAI_DON_HANG_HOP_LE` | `CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG` + 9 English states |

### 3.3 Frontend constants/contracts còn trạng thái cũ/cấm

| File | Chi tiết |
|------|----------|
| `frontend/src/features/donHang/contracts.js` | `TRANG_THAI_DON_HANG`: `CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU` |
| `frontend/src/utils/donHang.js` | `TRANG_THAI_DON_HANG_DANG_HOAT_DONG`: `CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG` |
| `frontend/src/pages/noiBo/NoiBoKhachHangPage.jsx` | `TRANG_THAI_DONHANG_MAP`: `SAN_SANG`, `Served`, `Paid`, `Completed` |

### 3.4 Database ENUM còn trạng thái English/cũ/cấm

| File | Chi tiết |
|------|----------|
| `database/mysql_init_schema.sql` dòng 163 | DonHang ENUM: 16 giá trị (Pending, Confirmed, Preparing, Ready, Served, Serving, Paid, Cancelled, Completed, CHO_XU_LY, DANG_CHE_BIEN, SAN_SANG, DANG_PHUC_VU, DA_THANH_TOAN, DA_HUY, DA_HOAN_TIEN) |
| `database/mysql_init_schema.sql` | ChiTietDonHang ENUM: CHO_CHE_BIEN, DANG_CHE_BIEN, SAN_SANG, DA_PHUC_VU, HOAN_THANH, DA_HUY |
| `database/mysql_init_schema.sql` | DatBan ENUM: CHO_XAC_NHAN, DA_XAC_NHAN, DA_DEN, HOAN_THANH, KHONG_DEN, DA_HUY, HET_HAN |
| `database/mysql_init_schema.sql` | ThanhToan ENUM: Pending, Success, Failed, Refunded |
| `database/migrations/V2__chuan_hoa_trang_thai_enum_viet.sql` | Đã tạo DonHang/ChiTietDonHang/DatBan với trạng thái CẤM |

### 3.5 DonHang/ChiTietDonHang chưa đồng bộ trạng thái chuẩn

| Vấn đề | Chi tiết | File ảnh hưởng |
|--------|----------|----------------|
| Thiếu `DANG_CHUAN_BI` cho DonHang | constants.ts không có state này | `constants.ts` |
| Thiếu `DANG_CHUAN_BI` cho ChiTietDonHang | Code dùng `CHO_CHE_BIEN` thay vì | `constants.ts` |
| `DANG_PHUC_VU` có trong DonHang enum nhưng FEAT-07 yêu cầu dùng cho DonHang | Khớp | ✅ |
| `DA_HOAN_TIEN` trong DonHang ENUM | Là trạng thái ThanhToan, không phải DonHang | DB + constants |
| Flow FEAT-03: `DANG_PHUC_VU` → `HOAN_THANH` | Code dùng `DANG_CHE_BIEN` → `SAN_SANG` → `DA_PHUC_VU` → `HOAN_THANH` (3 bước thừa) | constants, service |

### 3.6 DatBan còn trạng thái cũ (DA_DEN / DA_HOAN_THANH)

| Vấn đề | Chi tiết |
|--------|----------|
| `DA_DEN` trong DatBan | CẤM per FEAT-07 — phải là `DA_NHAN_BAN` |
| `HET_HAN` trong DatBan | Không có trong FEAT-07 DatBan — có thể là trạng thái hệ thống tự động hết hạn đặt bàn |

### 3.7 API FEAT yêu cầu nhưng code thiếu/lệch

| # | API | Vấn đề | Mức |
|---|-----|--------|-----|
| 1 | `POST /api/ban/:maBan/xac-nhan-thanh-toan` — CHỈ Thu ngân | `@Roles('Admin', 'NhanVien')` — không granular | **Cao** |
| 2 | `PUT /api/ban/:maBan/dat-ban/:maDatBan/xep-ban` | Không tồn tại | Trung bình |
| 3 | `PATCH /api/dat-ban/:maDatBan/xac-nhan` | Không có endpoint riêng | Trung bình |
| 4 | `PATCH /api/dat-ban/:maDatBan/huy` | Không có endpoint riêng | Trung bình |
| 5 | `PATCH /api/dat-ban/:maDatBan/nhan-ban` | Không có endpoint riêng | Trung bình |
| 6 | `POST /api/ban/:maBan/in-hoa-don` | Chưa kiểm tra có hay không | ❓ |

### 3.8 Route FEAT yêu cầu nhưng frontend thiếu/lệch

| # | Route FEAT | Route thực tế | Vấn đề |
|---|-----------|---------------|--------|
| 1 | `/noi-bo/quan-ly-ban` | `/noi-bo/so-do-ban` | Tên khác |
| 2 | `/noi-bo/tao-don` | Không có | Thiếu |
| 3 | `/noi-bo/don-hang/:maDonHang` | Không có route riêng | Thiếu |
| 4 | `/doi-mat-khau` | Không có route riêng | Thiếu |
| 5 | `/diem-tich-luy` | Không có route riêng | Thiếu |

### 3.9 Quyền public/auth/staff/admin — điểm chưa chắc chắn

| # | Endpoint | FEAT yêu cầu | Code thực tế | Đánh giá |
|---|----------|-------------|-------------|----------|
| 1 | `POST /api/ban/:maBan/xac-nhan-thanh-toan` | CHỈ Thu ngân | `@Roles('Admin', 'NhanVien')` | ❌ Cần thêm role THU_NGAN |
| 2 | `POST /api/ban/:maBan/order` | Public (guest) | `@Public()` | ✅ |
| 3 | `PATCH /api/ban/:maBan/status` | Phục vụ + Admin | `@Roles('Admin', 'NhanVien')` | ⚠️ Nên thêm sub-role PHUC_VU |
| 4 | `PATCH /api/don-hang/:maDonHang/chi-tiet/:maChiTiet/trang-thai` | Bếp + Admin | `@Roles('Admin', 'NhanVien')` | ⚠️ Nên thêm sub-role BEP |
| 5 | `GET /api/thong-ke` | Admin + Quản lý | `@Roles('Admin', 'QuanLy')` | ✅ |
| 6 | Đặt bàn cần MaKH bắt buộc | FEAT-02: yêu cầu đã đăng nhập | `@Post()` (auth) | ✅ (đã login nên có MaKH) |

---

## 4. Thứ tự code đề xuất (6 slice)

Thứ tự ưu tiên: **Slice 1 (trạng thái) → các slice còn lại** — vì mọi slice khác đều phụ thuộc vào trạng thái chuẩn.

---

### Slice 1: Đồng bộ enum/trạng thái

**Mục tiêu:**
- Đưa toàn bộ trạng thái DonHang, ChiTietDonHang, DatBan, ThanhToan về đúng FEAT-07.
- Xóa trạng thái CẤM khỏi constants, DB ENUM, frontend contracts.
- Tạo V3 migration để DB khớp FEAT-07.

**File khả năng phải sửa:**
- `backend/nest-api/src/common/constants.ts` — sửa enum, thêm `DANG_CHUAN_BI`, `DA_NHAN_BAN`, xóa CẤM
- `backend/nest-api/src/modules/don-hang/don-hang-payment-status.service.ts` — xóa hardcoded set, import từ constants
- `backend/nest-api/src/modules/don-hang/don-hang.service.ts` — kiểm tra logic filter
- `backend/nest-api/src/modules/dat-ban/dat-ban.service.ts` — kiểm tra logic filter
- `frontend/src/features/donHang/contracts.js` — đổi tên trạng thái
- `frontend/src/utils/donHang.js` — đổi tên trạng thái
- `frontend/src/pages/noiBo/NoiBoKhachHangPage.jsx` — đổi tên trạng thái
- `frontend/src/pages/noiBo/NoiBoChiTietDonHangPage.jsx` (nếu có) — kiểm tra
- `database/migrations/V3__chuan_hoa_trang_thai_theo_feat07.sql` — migration mới

**Rủi ro:**
- **CAO:** Nếu không đồng bộ DB + backend + frontend cùng lúc, hệ thống sẽ bị lỗi trạng thái (frontend gửi `DANG_CHUAN_BI` nhưng DB không chấp nhận).
- Cần deploy DB migration trước, rồi backend, rồi frontend.
- Cần kiểm tra tất cả service logic dùng `===` so sánh trạng thái (không dùng constants).

**Test cần chạy:**
- `SELECT COUNT(*) FROM DonHang WHERE trangThai = 'CHO_XU_LY'` — biết có data cần migrate
- Backend unit test cho từng service
- Frontend typecheck + lint
- Chạy thử flow: gọi món → bếp → phục vụ → thanh toán

**Điều kiện hoàn thành:**
- `constants.ts`: đúng 5 states cho DonHang, 4 states cho ChiTietDonHang, 6 states cho DatBan, 3 states cho ThanhToan
- `don-hang-payment-status.service.ts`: không còn hardcoded set, import từ constants
- DB: V3 migration chạy thành công, không còn trạng thái cấm trong ENUM
- Frontend: contracts.js không còn trạng thái cấm
- `rg "CHO_XU_LY|CHO_CHE_BIEN|DANG_CHE_BIEN|SAN_SANG|DA_PHUC_VU|DA_DEN" --no-heading` = 0 kết quả

---

### Slice 2: QR gọi món tại bàn

**Mục tiêu:**
- Đảm bảo flow guest quét QR → gọi món → theo dõi → yêu cầu thanh toán hoạt động với trạng thái mới.

**File khả năng phải sửa:**
- `frontend/src/pages/guest/BanGoiMonPage.jsx` — kiểm tra filter trạng thái
- `backend/nest-api/src/modules/ban/ban.controller.ts` — kiểm tra response shape

**Rủi ro:**
- Thấp (FEAT-01 đã hoạt động, chỉ cần đồng bộ tên trạng thái)

**Test cần chạy:**
- E2E flow: quét QR → xem menu → gọi món → theo dõi → yêu cầu thanh toán

**Điều kiện hoàn thành:**
- Guest có thể gọi món thành công
- Guest thấy đúng trạng thái mới (DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH)
- Guest yêu cầu thanh toán được

---

### Slice 3: Đặt bàn đăng nhập

**Mục tiêu:**
- Đồng bộ DatBan trạng thái (`DA_DEN` → `DA_NHAN_BAN`).
- Thêm route FE `/doi-mat-khau`, `/diem-tich-luy`.

**File khả năng phải sửa:**
- `frontend/src/App.jsx` — thêm route
- `frontend/src/pages/noiBo/NoiBoDatBanPage.jsx` — kiểm tra filter `DA_DEN`
- `backend/nest-api/src/modules/dat-ban/dat-ban.service.ts` — kiểm tra logic `DA_DEN`
- `backend/nest-api/src/common/constants.ts` — (đã sửa ở Slice 1)

**Rủi ro:**
- Trung bình: `DA_DEN` có thể đang dùng trong logic tính điểm/lịch sử
- Cần migrate data `DA_DEN` → `DA_NHAN_BAN`

**Test cần chạy:**
- Flow đặt bàn → xác nhận → nhận bàn → hoàn thành
- Update `DA_DEN` → `DA_NHAN_BAN` trong DB

**Điều kiện hoàn thành:**
- DatBan không còn `DA_DEN`
- Route `/doi-mat-khau` và `/diem-tich-luy` hoạt động
- Flow đặt bàn end-to-end

---

### Slice 4: Nhân viên phục vụ/bếp

**Mục tiêu:**
- Đồng bộ route FEAT-03/FEAT-04 với FEAT-07 status.
- Route `/noi-bo/quan-ly-ban` (hoặc giữ `/noi-bo/so-do-ban` và cập nhật FEAT).
- Phân quyền sub-role: PHUC_VU, BEP.

**File khả năng phải sửa:**
- `frontend/src/App.jsx` — route `/noi-bo/tao-don`
- `frontend/src/pages/noiBo/NoiBoDonHangPage.jsx` — filter trạng thái mới
- `frontend/src/pages/noiBo/NoiBoChiTietDonHangPage.jsx` (nếu có) — filter trạng thái mới
- `backend/nest-api/src/modules/don-hang/don-hang.controller.ts` — thêm role guard granular
- `backend/nest-api/src/modules/ban/ban.controller.ts` — thêm role guard granular

**Rủi ro:**
- Trung bình: thay đổi phân quyền có thể ảnh hưởng flow hiện tại
- Cần thêm `ChucNangPhu` vào JWT hoặc guard

**Test cần chạy:**
- Nhân viên PHUC_VU: chuyển bàn TRONG → CO_KHACH, tạo đơn
- Nhân viên BEP: xem đơn chờ, chuyển trạng thái món
- Nhân viên PHUC_VU không được làm việc của BEP

**Điều kiện hoàn thành:**
- Nhân viên PHUC_VU thấy route đúng
- Nhân viên BEP thấy đơn chờ đúng
- Chuyển trạng thái ChiTietDonHang theo flow FEAT-07

---

### Slice 5: Thu ngân thanh toán/in hóa đơn

**Mục tiêu:**
- Granular quyền Thu ngân (`POST /api/ban/:maBan/xac-nhan-thanh-toan`).
- Đồng bộ trạng thái thanh toán (`THANH_CONG`, `THAT_BAI`, `DA_HOAN_TIEN`).
- Xóa `CHO_THANH_TOAN` khỏi ThanhToan.
- In hóa đơn (nếu thiếu).

**File khả năng phải sửa:**
- `backend/nest-api/src/modules/ban/ban.controller.ts` — thêm role `THU_NGAN`
- `backend/nest-api/src/modules/thanh-toan/thanh-toan.service.ts` — logic thanh toán
- `frontend/src/pages/noiBo/NoiBoDonHangPage.jsx` — UI thanh toán
- `frontend/src/features/donHang/contracts.js` — (đã sửa ở Slice 1)

**Rủi ro:**
- Trung bình: quyền thanh toán granular có thể block nhân viên đang làm cả phục vụ + thu ngân
- Cần thiết kế ChucNangPhu phù hợp

**Test cần chạy:**
- Chỉ THU_NGAN mới xác nhận thanh toán được
- DonHang `HOAN_THANH` → `DA_THANH_TOAN`
- Ban `CO_KHACH` → `DANG_DON`
- In hóa đơn thành công

**Điều kiện hoàn thành:**
- Nhân viên không có quyền THU_NGAN không thanh toán được
- Thanh toán xong: DonHang `DA_THANH_TOAN`, Ban `DANG_DON`

---

### Slice 6: Admin quản trị

**Mục tiêu:**
- Đảm bảo admin có toàn quyền CRUD.
- Đồng bộ UI admin với trạng thái mới.

**File khả năng phải sửa:**
- `frontend/src/pages/noiBo/NoiBoDonHangPage.jsx` — filter/sort theo trạng thái mới
- `frontend/src/pages/noiBo/NoiBoKhachHangPage.jsx` — xóa `SAN_SANG`, `Served`, `Paid`, `Completed`
- `frontend/src/pages/noiBo/NoiBoDatBanPage.jsx` — kiểm tra filter
- `frontend/src/pages/noiBo/NoiBoThongKePage.jsx` — kiểm tra filter

**Rủi ro:**
- Thấp

**Test cần chạy:**
- Admin xem/thêm/sửa/xóa tất cả entity
- Thống kê vẫn chạy đúng với trạng thái mới

**Điều kiện hoàn thành:**
- Admin UI hiển thị trạng thái FEAT-07 (không còn `CHO_XU_LY`, `SAN_SANG`)
- Thống kê không bị broken bởi trạng thái mới
- Module `thong-bao` hoạt động (nếu cần)

---

## 5. Kết luận

### FEAT/Slice nào nên sửa trước

**Slice 1 — Đồng bộ enum/trạng thái — Ưu tiên cao nhất.**

### Lý do

1. **5/9 trạng thái DonHang trong constants.ts là CẤM.** Mọi slice khác (QR, đặt bàn, phục vụ, bếp, thu ngân, admin) đều dùng trạng thái DonHang và ChiTietDonHang. Nếu không sửa trạng thái trước, code mới sẽ tiếp tục dùng tên cấm.

2. **DB ENUM hiện tại có 16 giá trị cho DonHang** — hỗn độn giữa English legacy + Vietnamese cấm + Vietnamese đúng. Migration V2 đã tạo ra trạng thái CẤM, cần V3 migration để sửa.

3. **`don-hang-payment-status.service.ts` hardcoded set sai** — chấp nhận English + CẤM, thiếu trạng thái chuẩn. Đây là nguồn bug tiềm tàng khi frontend gửi trạng thái mới.

4. **Frontend contracts.js + donHang.js + NoiBoKhachHangPage.jsx** hiển thị trạng thái CẤM — gây nhầm lẫn cho người dùng.

5. **Quyền thanh toán chưa granular** — bất kỳ NhanVien nào cũng xác nhận thanh toán được, vi phạm FEAT-05.

### Không tự động sửa code trong bước này

Đây là báo cáo audit — chỉ ghi nhận gap, không sửa code. File duy nhất được tạo/cập nhật: `docs/AUDIT_CODE_THEO_FEAT.md`.

---

*Hết báo cáo.*
