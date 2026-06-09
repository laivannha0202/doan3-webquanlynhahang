# FEAT_07: Trạng thái đơn hàng & API contract

> Mã feature: FEAT_07
> Actor chính: **Tất cả** (FE/BE/DB)
> Phiên bản: 1.0 — 2026-06-09

---

## 1. Mục tiêu

Định nghĩa chuẩn cho:
1. **State machine** của 4 thực thể chính (Bàn, Đặt bàn, Đơn hàng, Chi tiết đơn hàng).
2. **Trạng thái hợp lệ** của từng thực thể.
3. **Mapping giữa FE và BE** (tên field, giá trị ENUM, contract API).
4. **Luồng thanh toán** chuẩn, bao gồm tích điểm, áp voucher, tạo HoaDon/ThanhToan.

Document này làm chuẩn cho việc đồng bộ giữa frontend, backend và database.

---

## 2. Actor liên quan

| Actor | Ảnh hưởng |
|-------|-----------|
| Khách hàng (QR) | Tạo đơn, huỷ đơn, yêu cầu thanh toán |
| Khách hàng (có TK) | Đặt bàn, huỷ đặt bàn, đánh giá |
| Nhân viên phục vụ | Check-in, gán bàn, phục vụ món, dọn bàn |
| Nhân viên bếp | Nhận chế biến, hoàn thành món |
| Nhân viên thu ngân | Áp voucher/điểm, xác nhận thanh toán, in hoá đơn |
| Admin | CRUD thực đơn/bàn, duyệt đặt bàn, cấu hình hệ thống |

---

## 3. State machine

### 3.1 Bàn (`Ban`)
```
TRONG  →  DA_DAT  (khi booking được xác nhận & gán bàn)
DA_DAT  →  CO_KHACH  (khi khách check-in)
CO_KHACH  →  DANG_DON  (khi thanh toán xong, chờ dọn)
DANG_DON  →  TRONG  (sau khi dọn xong)
BAO_TRI  ↔  TRONG  (admin chuyển)
```

- **TRONG**: Bàn trống, sẵn sàng phục vụ.
- **DA_DAT**: Bàn đã được gán cho booking (chờ khách check-in).
- **CO_KHACH**: Bàn đang có khách ngồi.
- **DANG_DON**: Bàn vừa thanh toán xong, chờ nhân viên dọn.
- **BAO_TRI**: Bàn đang bảo trì, không phục vụ.

### 3.2 Đặt bàn (`DatBan`)
```
CHO_XAC_NHAN  →  DA_XAC_NHAN  (admin xác nhận)
DA_XAC_NHAN  →  DA_NHAN_BAN  (khách check-in)
DA_NHAN_BAN  →  HOAN_THANH  (đơn hàng hoàn tất)

CHO_XAC_NHAN / DA_XAC_NHAN  →  DA_HUY  (admin hoặc khách huỷ)
```

- **CHO_XAC_NHAN**: Đặt bàn mới, chờ admin xác nhận.
- **DA_XAC_NHAN**: Đã xác nhận, chờ khách đến.
- **DA_NHAN_BAN**: Khách đã check-in, bàn đang phục vụ.
- **HOAN_THANH**: Hoàn tất.
- **DA_HUY**: Bị huỷ.

### 3.3 Đơn hàng (`DonHang`)
```
DANG_CHUAN_BI  →  DA_XAC_NHAN  (nhân viên xác nhận)
DA_XAC_NHAN  →  DANG_CHE_BIEN  (bếp nhận)
DANG_CHE_BIEN  →  SAN_SANG  (bếp hoàn thành)
SAN_SANG  →  DA_PHUC_VU  (nhân viên phục vụ mang ra)
DA_PHUC_VU  →  DA_THANH_TOAN  (thu ngân xác nhận thanh toán)
DA_THANH_TOAN  →  HOAN_THANH  (in hoá đơn, đóng đơn)

Từ DANG_CHUAN_BI / DA_XAC_NHAN / DANG_CHE_BIEN có thể:
→  DA_HUY  (nhân viên hoặc admin huỷ)
```

- **DANG_CHUAN_BI**: Đơn mới tạo, chờ nhân viên xác nhận.
- **DA_XAC_NHAN**: Nhân viên đã xác nhận, chờ bếp chế biến.
- **DANG_CHE_BIEN**: Bếp đang chế biến.
- **SAN_SANG**: Món đã xong, chờ mang ra cho khách.
- **DA_PHUC_VU**: Món đã mang ra cho khách.
- **DA_THANH_TOAN**: Khách đã thanh toán.
- **HOAN_THANH**: Hoàn tất.
- **DA_HUY**: Bị huỷ.

### 3.4 Chi tiết đơn hàng (`ChiTietDonHang`)
```
DANG_CHUAN_BI  →  DA_XAC_NHAN  (nhân viên xác nhận)
DA_XAC_NHAN  →  DANG_CHE_BIEN  (bếp nhận)
DANG_CHE_BIEN  →  SAN_SANG  (bếp hoàn thành)
SAN_SANG  →  DA_PHUC_VU  (nhân viên phục vụ mang ra)

Từ bất kỳ trạng thái nào (trừ HOAN_THANH):
→  DA_HUY  (nhân viên hoặc admin huỷ món)
```

---

## 4. Mapping FE ↔ BE

### 4.1 Field names

| Entity | Field | FE (camelCase) | BE (PascalCase / DB) |
|--------|-------|----------------|----------------------|
| Bàn | Mã bàn | `maBan` | `MaBan` |
| Bàn | Tên bàn | `tenBan` | `TenBan` |
| Bàn | Trạng thái | `trangThai` | `TrangThai` |
| Đặt bàn | Mã đặt bàn | `maDatBan` | `MaDatBan` |
| Đặt bàn | Trạng thái | `trangThai` | `TrangThai` |
| Đơn hàng | Mã đơn | `maDonHang` | `MaDonHang` |
| Đơn hàng | Trạng thái | `trangThai` | `TrangThai` |
| Đơn hàng | Mã bàn | `maBan` | `MaBan` |
| Chi tiết | Trạng thái | `trangThai` | `TrangThai` |
| Hoá đơn | Mã hoá đơn | `maHoaDon` | `MaHoaDon` |
| Thanh toán | Mã thanh toán | `maThanhToan` | `MaThanhToan` |

### 4.2 Trạng thái hợp lệ

| Entity | FE values | DB ENUM |
|--------|-----------|---------|
| Bàn | `TRONG`, `DA_DAT`, `CO_KHACH`, `DANG_DON`, `BAO_TRI` | `BanTrangThai` |
| Đặt bàn | `CHO_XAC_NHAN`, `DA_XAC_NHAN`, `DA_NHAN_BAN`, `HOAN_THANH`, `DA_HUY` | `DatBanTrangThai` |
| Đơn hàng | `DANG_CHUAN_BI`, `DA_XAC_NHAN`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU`, `DA_THANH_TOAN`, `HOAN_THANH`, `DA_HUY` | `DonHangTrangThai` |
| Chi tiết đơn | `DANG_CHUAN_BI`, `DA_XAC_NHAN`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU`, `DA_HUY` | `ChiTietDonHangTrangThai` |

---

## 5. API contract cho trạng thái

### 5.1 Cập nhật trạng thái đơn hàng
```
PATCH /api/don-hang/:maDonHang/status
Body: { trangThai: string }
```

- **BE validate**: Kiểm tra transition hợp lệ theo state machine.
- **Side effect**:
  - `DA_THANH_TOAN` → tạo HoaDon + ThanhToan(THANH_CONG), cập nhật Ban→`DANG_DON`, tích điểm, cập nhật voucher.
  - `DA_HUY` → cập nhật Ban→`TRONG` (nếu không còn đơn nào của bàn đang mở).

### 5.2 Cập nhật trạng thái bàn
```
PATCH /api/ban/:maBan/status
Body: { trangThai: string }
```

- Chỉ `TRONG` ↔ `BAO_TRI` (admin).
- `DANG_DON` → `TRONG` (nhân viên dọn bàn).

### 5.3 Cập nhật trạng thái đặt bàn
```
PATCH /api/dat-ban/:maDatBan/status
Body: { trangThai: string }
```

- `DA_XAC_NHAN`, `DA_HUY` (admin).
- `DA_NHAN_BAN` (admin khi check-in).

---

## 6. Luồng thanh toán chuẩn

### 6.1 Thanh toán tại bàn (QR)
```
1. Khách bấm "Yêu cầu thanh toán"
2. FE gọi POST /api/ban/:maBan/yeu-cau-thanh-toan
3. Nhân viên thu ngân nhận thông báo
4. Thu ngân mở đơn, áp voucher/điểm (nếu có)
5. Thu ngân chọn phương thức thanh toán
6. PATCH /api/don-hang/:maDonHang/status { trangThai: 'DA_THANH_TOAN', phuongThuc, maCode?, soDiem? }
7. Backend:
   a. Tạo HoaDon (MaDonHang UNIQUE → 1 đơn 1 hóa đơn)
   b. Tạo ThanhToan (TrangThai='THANH_CONG')
   c. Cập nhật DonHang.TrangThai → DA_THANH_TOAN
   d. Tích điểm cho khách (nếu có MaKH)
   e. Cập nhật Voucher.SoLanDaDung++ (nếu dùng voucher)
   f. Trừ điểm trong KhachHang.DiemTichLuy (nếu dùng điểm)
   g. Cập nhật Ban.TrangThai → DANG_DON
```

### 6.2 Hoàn tiền
```
1. Admin chọn đơn đã DA_THANH_TOAN
2. PATCH /api/don-hang/:maDonHang/status { trangThai: 'DA_HOAN_TIEN' }
3. Backend: Cập nhật ThanhToan.TrangThai → DA_HOAN_TIEN
```

---

## 7. Phân quyền theo trạng thái

| Action | Phân quyền | Ghi chú |
|--------|-----------|---------|
| Tạo đơn (QR) | `public` | Khách tại bàn |
| Tạo đơn (nhân viên) | `staff` | Nhân viên tạo hộ |
| Xác nhận đơn | `staff` | Nhân viên phục vụ |
| Nhận chế biến | `staff` | Nhân viên bếp |
| Hoàn thành món | `staff` | Nhân viên bếp |
| Phục vụ món | `staff` | Nhân viên phục vụ |
| Áp voucher/điểm | `staff` | Nhân viên thu ngân |
| Xác nhận thanh toán | `staff` | Nhân viên thu ngân |
| Hoàn tiền | `admin` | Chỉ admin |
| Hủy đơn | `staff` / `admin` | Tùy trạng thái |
| CRUD thực đơn | `admin` | — |
| CRUD bàn | `admin` | — |
| Duyệt đặt bàn | `admin` | — |
| Duyệt đánh giá | `admin` | — |

---

## 8. Edge case quan trọng

| # | Edge case | Xử lý |
|---|-----------|-------|
| 1 | Khách huỷ đơn đang `DANG_CHE_BIEN` | Chỉ huỷ được nếu chưa `SAN_SANG`; nếu đã `SAN_SANG` → thông báo "Món đã hoàn thành, không thể huỷ" |
| 2 | Huỷ đơn khi bàn đang `CO_KHACH` | DonHang→`DA_HUY`, nếu không còn đơn nào mở → Ban→`DANG_DON` |
| 3 | Thanh toán 2 lần cùng đơn | Backend chặn: DonHang đã `DA_THANH_TOAN` → 400 "Đơn đã thanh toán" |
| 4 | Áp voucher + điểm cùng lúc | Cho phép; tổng giảm = voucher + điểm; tối đa giảm = tổng tạm tính |
| 5 | Đơn có nhiều món, huỷ 1 món | Chỉ huỷ ChiTietDonHang; DonHang giữ nguyên; cập nhật tổng tiền |
| 6 | Bàn `BAO_TRI` nhưng có đơn cũ | Cho phép xử lý đơn cũ; không tạo đơn mới |
| 7 | Đặt bàn `DA_XAC_NHAN` quá giờ | Admin có thể huỷ hoặc giữ; backend có thể auto-convert `HET_HAN` |
| 8 | Thanh toán thất bại | DonHang giữ nguyên; nhân viên chọn lại phương thức hoặc thử lại |

---

## 9. Acceptance Criteria

### AC-1: State machine đúng
- [ ] Mỗi transition chỉ xảy ra khi đúng điều kiện
- [ ] Reject transition sai → 400

### AC-2: Đồng bộ FE ↔ BE
- [ ] FE gửi đúng giá trị ENUM Việt
- [ ] BE trả đúng format JSON theo contract
- [ ] Không có mismatch field name

### AC-3: Thanh toán
- [ ] Tạo HoaDon + ThanhToan(THANH_CONG) khi `DA_THANH_TOAN`
- [ ] 1 đơn chỉ có 1 HoaDon (UNIQUE constraint)
- [ ] Tích điểm đúng công thức
- [ ] Voucher SoLanDaDung++
- [ ] Ban→`DANG_DON` sau thanh toán

### AC-4: Hoàn tiền
- [ ] DonHang→`DA_HOAN_TIEN`, ThanhToan→`DA_HOAN_TIEN`
- [ ] Chỉ admin mới hoàn tiền được

### AC-5: Hủy đơn
- [ ] DonHang→`DA_HUY`, kiểm tra bàn
- [ ] Nếu không còn đơn mở → Ban→`DANG_DON` → `TRONG`

---

## 10. Checklist đối chiếu code hiện tại

| # | Kiểm tra | File kiểm tra | Trạng thái |
|---|----------|---------------|-----------|
| 1 | State machine Bàn đúng 5 trạng thái | `database/mysql_init_schema.sql` | ☐ |
| 2 | State machine Đơn hàng đúng 8 trạng thái | `database/mysql_init_schema.sql` | ☐ |
| 3 | DonHang状态transition validation | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 4 | ThanhToan tạo đúng khi DA_THANH_TOAN | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 5 | HoaDon.MaDonHang UNIQUE | `database/mysql_init_schema.sql` | ☐ |
| 6 | Tích điểm đúng công thức | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 7 | FE gửi đúng ENUM values | `frontend/src/common/constants.js` | ☐ |
| 8 | FE state machine đúng | `frontend/src/pages/BanGoiMonPage.jsx` | ☐ |
| 9 | Phân quyền theo action đúng | `backend/nest-api/src/common/guards/` | ☐ |
| 10 | Edge cases được xử lý | `backend/nest-api/src/modules/don-hang/` | ☐ |
