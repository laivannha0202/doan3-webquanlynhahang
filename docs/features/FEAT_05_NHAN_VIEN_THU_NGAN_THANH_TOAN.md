# FEAT_05: Nhân viên — Thu ngân, thanh toán

> Mã feature: FEAT_05
> Actor chính: **Nhân viên thu ngân** (đăng nhập nội bộ)
> Phiên bản: 1.0 — 2026-06-09

---

## 1. Mục tiêu

Cho phép nhân viên thu ngân xem hóa đơn, áp voucher/điểm cho khách, xác nhận thanh toán, in tạm tính/hóa đơn, và xử lý hoàn tiền.

Luồng này tương ứng với UC-NV-11 → UC-NV-13, UC-NV-15.

---

## 2. Actor sử dụng

| Actor | Quyền API | Ghi chú |
|-------|-----------|---------|
| Nhân viên thu ngân | `staff` | JWT `vaiTro='NhanVien'` hoặc `'Admin'` |

---

## 3. Route / trang liên quan

| Route | Mô tả | Component/Trang |
|-------|-------|----------------|
| `/noi-bo/don-hang` | Danh sách đơn (filter chờ thanh toán) | `DonHangNoiBoPage.jsx` |
| `/noi-bo/don-hang/:maDonHang` | Chi tiết đơn + hóa đơn | `DonHangChiTietPage.jsx` |
| `/noi-bo/thong-ke` | Thống kê doanh thu | `NoiBoThongKePage.jsx` |

---

## 4. Danh sách màn hình

### Màn hình 4.1: Danh sách đơn chờ thanh toán
- Bảng đơn hàng filter trạng thái `SAN_SANG`, `DA_PHUC_VU`.
- Mỗi đơn: mã đơn, bàn, tổng tiền, trạng thái, khách (nếu có).
- Click vào đơn → xem chi tiết + xử lý thanh toán.

### Màn hình 4.2: Chi tiết đơn + thanh toán
- Danh sách món + trạng thái từng món.
- Thông tin tạm tính: tổng tiền món, phí dịch vụ 5%, tổng tạm tính.
- Phần voucher/điểm:
  - Nhập mã voucher → validate → hiển thị số tiền giảm.
  - Nhập số điểm muốn dùng → kiểm tra điểm khả dụng.
  - Tổng thanh toán sau giảm.
- Chọn phương thức thanh toán: Tiền mặt, Chuyển khoản, MoMo, VNPay, ZaloPay.
- Nút "Xác nhận thanh toán".
- Nút "In tạm tính" / "In hóa đơn".

### Màn hình 4.3: Hoá đơn sau thanh toán
- Mã hóa đơn, mã đơn, ngày xuất.
- Danh sách món, tổng tiền, giảm giá, tổng thanh toán thực tế.
- Phương thức thanh toán.
- Nút "In hóa đơn" / "Xuất PDF".

---

## 5. Thành phần giao diện

### Component `DanhSachDonChoThanhToan`
- Bảng phân trang.
- Filter: trạng thái (`SAN_SANG`, `DA_PHUC_VU`), bàn, ngày.
- Badge màu trạng thái.

### Component `ChiTietDonThanhToan`
- Danh sách món + trạng thái.
- Tổng tạm tính, phí dịch vụ.
- Form voucher/điểm (xem Component `ApDungVoucherDiem`).
- Chọn phương thức thanh toán (radio/button group).
- Nút "Xác nhận thanh toán".

### Component `ApDungVoucherDiem`
- Input mã voucher + nút "Áp dụng".
- Hiển thị kết quả: hợp lệ → số tiền giảm; không hợp lệ → lỗi.
- Input số điểm muốn dùng.
- Hiển thị tổng sau giảm.

### Component `HoaDon`
- Xem trước hóa đơn (PDF/HTML).
- Nút in hoặc tải về.

---

## 6. Dữ liệu hiển thị

### Chi tiết đơn (từ `GET /api/don-hang/:maDonHang`)
```
{
  maDonHang: string,
  maBan: string,
  tenBan: string,
  trangThai: string,
  ngayTao: string,
  tongTien: number,       // tổng tiền món
  phiDichVu: number,      // 5% tạm tính
  tamTinh: number,        // tongTien + phiDichVu
  giamGia: number,        // số tiền giảm từ voucher
  soDiem: number,         // điểm đã dùng
  thanhTien: number,      // tamTinh - giamGia
  khachHang: { maKH, tenKH, sdt, diemTichLuy } | null,
  chiTiet: [
    {
      maMon: string,
      tenMon: string,
      soLuong: number,
      donGia: number,
      thanhTien: number,
      trangThai: string
    }
  ]
}
```

### Hóa đơn (từ `GET /api/don-hang/:maDonHang` hoặc response sau thanh toán)
```
{
  maHoaDon: string,
  maDonHang: string,
  ngayXuat: string,
  tongTien: number,
  giamGia: number,
  thanhTien: number,
  phuongThuc: string,
  trangThai: string  // "THANH_CONG" | "THAT_BAI"
}
```

---

## 7. Form nhập liệu

### Form áp voucher
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `maCode` | text | Không | `POST /api/ma-giam-gia/validate` |

### Form dùng điểm
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `soDiem` | number | Không | ≤ điểm khách đang có, bội số 100 (tùy quy tắc) |

### Form xác nhận thanh toán
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `phuongThuc` | select | Có | `TienMat`, `ChuyenKhoan`, `MoMo`, `VNPay`, `ZaloPay` |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động |
|-----|--------|-----------|
| "Áp dụng voucher" | Chi tiết đơn | `POST /api/ma-giam-gia/validate` → hiển thị giảm giá |
| "Xác nhận thanh toán" | Chi tiết đơn | `PATCH /api/don-hang/:maDonHang/status` với `DA_THANH_TOAN` |
| "In tạm tính" | Chi tiết đơn | `GET /api/don-hang/:maDonHang` → in bản tạm tính |
| "In hóa đơn" | Hóa đơn | In bản PDF hóa đơn |
| "Hoàn tiền" | Hóa đơn (admin) | `PATCH /api/don-hang/:maDonHang/status` với `DA_HOAN_TIEN` |

---

## 9. API liên quan

### `GET /api/don-hang` — staff
- Danh sách đơn (filter `SAN_SANG`, `DA_PHUC_VU`).

### `GET /api/don-hang/:maDonHang` — staff
- Chi tiết đơn + hóa đơn.

### `POST /api/ma-giam-gia/validate` — public
- Kiểm tra voucher hợp lệ.
- Request: `{ maCode }`
- Response: `{ hopLe, soTienGiam, loaiMa, phamVi }`

### `PATCH /api/don-hang/:maDonHang/status` — staff
- Xác nhận thanh toán: `{ trangThai: 'DA_THANH_TOAN', phuongThuc, maCode?, soDiem? }`
- Hoàn tiền: `{ trangThai: 'DA_HOAN_TIEN' }`
- Side effects:
  - `DA_THANH_TOAN`: Tạo `HoaDon` + `ThanhToan` (`THANH_CONG`). Cập nhật `DonHang.TrangThai`. Tích điểm cho khách (nếu có `MaKH`). Cập nhật `Ban.TrangThai` → `DANG_DON`.
  - `DA_HOAN_TIEN`: Cập nhật `ThanhToan.TrangThai` → `DA_HOAN_TIEN`.

### `POST /api/ban/:maBan/xac-nhan-thanh-toan` — staff
- Thanh toán tại bàn (thu ngân đến bàn).
- Request: `{ maDonHang, phuongThuc, maCode?, soDiem? }`

---

## 10. Luồng xử lý chính

### 10a. Xem danh sách đơn chờ thanh toán
```
1. Thu ngân vào /noi-bo/don-hang
2. Lọc trạng thái SAN_SANG hoặc DA_PHUC_VU
3. GET /api/don-hang?trangThai=SAN_SANG,DA_PHUC_VU
4. Hiển thị danh sách
```

### 10b. Xem chi tiết đơn
```
1. Click vào đơn cần thanh toán
2. GET /api/don-hang/:maDonHang
3. Hiển thị: danh sách món, tạm tính, phí dịch vụ
```

### 10c. Áp voucher / điểm
```
1. Nhập mã voucher → POST /api/ma-giam-gia/validate
2. Hợp lệ → hiển thị số tiền giảm
3. Nhập số điểm muốn dùng → kiểm tra điểm khả dụng
4. Hiển thị tổng thanh toán sau giảm
```

### 10d. Xác nhận thanh toán
```
1. Thu ngân chọn phương thức thanh toán
2. Bấm "Xác nhận thanh toán"
3. PATCH /api/don-hang/:maDonHang/status {
     trangThai: 'DA_THANH_TOAN',
     phuongThuc: 'TienMat',
     maCode: 'MA-GIAM-001',   // nếu có
     soDiem: 100              // nếu có
   }
4. Backend:
   - Tạo HoaDon (MaDonHang UNIQUE → 1 đơn 1 hóa đơn)
   - Tạo ThanhToan (TrangThai='THANH_CONG')
   - Cập nhật DonHang.TrangThai → DA_THANH_TOAN
   - Tích điểm cho khách (nếu có MaKH)
   - Cập nhật Voucher.SoLanDaDung++ (nếu dùng voucher)
   - Trừ điểm trong KhachHang.DiemTichLuy (nếu dùng điểm)
   - Cập nhật Ban.TrangThai → DANG_DON
5. Hiển thị thông báo thành công + hóa đơn
```

### 10e. In tạm tính / hóa đơn
```
1. Thu ngân bấm "In tạm tính" hoặc "In hóa đơn"
2. GET /api/don-hang/:maDonHang → lấy dữ liệu
3. Hiển thị bản xem trước (PDF/HTML)
4. Xác nhận in → gửi đến máy in hoặc tải PDF
```

---

## 11. Luồng thay thế

### 11a. Thanh toán thất bại
```
1. PATCH /api/don-hang/:maDonHang/status với THAT_BAI
2. Đơn giữ nguyên trạng thái
3. Thu ngân chọn lại phương thức hoặc thử lại
```

### 11b. Khách muốn thanh toán tại quầy
```
1. Thu ngân tra cứu đơn theo bàn hoặc mã đơn
2. Xem chi tiết → áp voucher/điểm → xác nhận thanh toán
```

### 11c. Hoàn tiền sau thanh toán
```
1. Admin chọn đơn đã DA_THANH_TOAN
2. PATCH /api/don-hang/:maDonHang/status với DA_HOAN_TIEN
3. Backend: Cập nhật ThanhToan.TrangThai → DA_HOAN_TIEN
4. Không thay đổi Ban.TrangThai (bàn vẫn DANG_DON)
```

---

## 12. Luồng lỗi

| Mã lỗi | Tình huống | Hiển thị |
|---------|-----------|----------|
| `400` | Đơn đã thanh toán trước đó | "Đơn đã được thanh toán" |
| `400` | Phương thức không hợp lệ | "Phương thức thanh toán không hợp lệ" |
| `400` | Voucher hết hạn/hết lượt | "Mã giảm giá không hợp lệ" |
| `400` | Điểm không đủ | "Số điểm không khả dụng" |
| `400` | Đơn không tồn tại | "Không tìm thấy đơn hàng" |
| `403` | Voucher không đúng chủ | "Mã không thuộc về khách này" |
| `404` | Đơn không tồn tại | "Không tìm thấy đơn hàng" |

---

## 13. Trạng thái thay đổi

### Khi xác nhận thanh toán
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DonHang` | `TrangThai` | `SAN_SANG` / `DA_PHUC_VU` | `DA_THANH_TOAN` |
| `HoaDon` | — | — | INSERT mới (MaHoaDon, TongTien, GiamGia, ThanhTien) |
| `ThanhToan` | `TrangThai` | — | `THANH_CONG` |
| `Ban` | `TrangThai` | `CO_KHACH` | `DANG_DON` |
| `KhachHang` | `DiemTichLuy` | (nếu có MaKH) | `+= Math.floor(TongTien / TI_LE_TICH_DIEM)` |
| `MaGiamGia` | `SoLanDaDung` | (nếu dùng voucher) | `+= 1` |

### Khi hoàn tiền
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DonHang` | `TrangThai` | `DA_THANH_TOAN` | `DA_HOAN_TIEN` |
| `ThanhToan` | `TrangThai` | `THANH_CONG` | `DA_HOAN_TIEN` |

---

## 14. Phân quyền

| Endpoint | Mức quyền | Ghi chú |
|----------|-----------|--------|
| `GET /api/don-hang` | `staff` | Xem tất cả đơn |
| `GET /api/don-hang/:maDonHang` | `staff` | Chi tiết đơn |
| `PATCH /api/don-hang/:maDonHang/status` | `staff` | Xác nhận thanh toán / hoàn tiền |
| `POST /api/ban/:maBan/xac-nhan-thanh-toan` | `staff` | Thanh toán tại bàn |
| `POST /api/ma-giam-gia/validate` | `public` | Kiểm tra voucher |

---

## 15. Acceptance Criteria

### AC-01: Xem danh sách đơn chờ thanh toán
- [ ] Hiển thị đúng đơn `SAN_SANG` / `DA_PHUC_VU`
- [ ] Có filter theo bàn/ngày

### AC-02: Áp voucher
- [ ] Voucher hợp lệ → hiển thị số tiền giảm
- [ ] Voucher hết hạn/hết lượt → lỗi rõ ràng
- [ ] Voucher `CUSTOMER` của người khác → 403

### AC-03: Dùng điểm
- [ ] Nhập số điểm → kiểm tra điểm khả dụng
- [ ] Số điểm > điểm hiện tại → lỗi
- [ ] Tổng thanh toán sau giảm đúng

### AC-04: Xác nhận thanh toán
- [ ] Chọn phương thức → xác nhận → `DonHang = DA_THANH_TOAN`
- [ ] Tạo `HoaDon` + `ThanhToan THANH_CONG`
- [ ] Tích điểm nếu khách có `MaKH`
- [ ] Cập nhật voucher `SoLanDaDung++`
- [ ] `Ban → DANG_DON`

### AC-05: Hoàn tiền
- [ ] `DonHang = DA_HOAN_TIEN`, `ThanhToan = DA_HOAN_TIEN`
- [ ] Chỉ admin mới hoàn tiền được

### AC-06: In hóa đơn
- [ ] In tạm tính thành công → PDF đúng chi tiết
- [ ] In hóa đơn sau thanh toán → PDF đúng tổng tiền, voucher, điểm

---

## 16. Checklist đối chiếu code hiện tại

| # | Kiểm tra | File kiểm tra | Trạng thái |
|---|----------|---------------|-----------|
| 1 | `DonHangNoiBoPage.jsx` có filter trạng thái `SAN_SANG/DA_PHUC_VU` | `frontend/src/pages/noiBo/` | ☐ |
| 2 | `DonHangChiTietPage.jsx` có form voucher/điểm + nút thanh toán | `frontend/src/pages/noiBo/` | ☐ |
| 3 | `PATCH /api/don-hang/:maDonHang/status` tạo `HoaDon` + `ThanhToan` | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 4 | Tích điểm khi `DA_THANH_TOAN` + có `MaKH` | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 5 | `Ban.TrangThai → DANG_DON` sau `DA_THANH_TOAN` | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 6 | `HoaDon.MaDonHang` UNIQUE (1 đơn 1 hóa đơn) | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 7 | Voucher validate đúng (`CUSTOMER/LOYALTY/VIP` enforce ownership) | `backend/nest-api/src/modules/ma-giam-gia/` | ☐ |
| 8 | `ThanhToan.TrangThai` dùng ENUM Việt | `backend/nest-api/src/common/constants.ts` | ☐ |
