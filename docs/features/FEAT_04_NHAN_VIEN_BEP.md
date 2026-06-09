# FEAT_04: Nhân viên — Bếp

> Mã feature: FEAT_04
> Actor chính: **Nhân viên bếp** (đăng nhập nội bộ)
> Phiên bản: 1.0 — 2026-06-09

---

## 1. Mục tiêu

Cho phép nhân viên bếp xem danh sách đơn cần chế biến, nhận chế biến món, cập nhật trạng thái món đang nấu, và đánh dấu món sẵn sàng mang ra cho khách.

Luồng này tương ứng với UC-NV-08 → UC-NV-10.

---

## 2. Actor sử dụng

| Actor | Quyền API | Ghi chú |
|-------|-----------|---------|
| Nhân viên bếp | `staff` | JWT `vaiTro='NhanVien'` hoặc `'Admin'` |

---

## 3. Route / trang liên quan

| Route | Mô tả | Component/Trang |
|-------|-------|----------------|
| `/noi-bo/don-hang` | Danh sách đơn hàng (tất cả nhân viên) | `DonHangNoiBoPage.jsx` |
| `/noi-bo/don-hang?tab=bep` | Tab bếp (filter đơn cần chế biến) | `DonHangNoiBoPage.jsx` (tab) |

---

## 4. Danh sách màn hình

### Màn hình 4.1: Danh sách đơn vào bếp
- Bảng hiển thị đơn theo trạng thái `DANG_CHUAN_BI`.
- Mỗi đơn hiển thị: mã đơn, bàn, danh sách món, số lượng, ghi chú.
- Lọc theo trạng thái hoặc bàn.
- Click vào đơn → xem chi tiết + cập nhật trạng thái món.

### Màn hình 4.2: Chi tiết đơn (bếp)
- Danh sách món trong đơn.
- Mỗi món: tên, số lượng, trạng thái (`DANG_CHUAN_BI`, `DANG_CHE_BIEN`, `SAN_SANG`).
- Nút thao tác: "Nhận chế biến", "Hoàn thành".

---

## 5. Thành phần giao diện

### Component `DanhSachDonBep`
- Bảng phân trang hiển thị đơn theo trạng thái.
- Badge màu theo trạng thái:
  - `DANG_CHUAN_BI`: vàng (chờ nhận)
  - `DANG_CHE_BIEN`: cam (đang nấu)
  - `SAN_SANG`: xanh lá (xong, chờ phục vụ)

### Component `ChiTietDonBep`
- Danh sách món trong đơn.
- Nút "Nhận chế biến" (chuyển `DANG_CHUAN_BI → DANG_CHE_BIEN`).
- Nút "Hoàn thành" (chuyển `DANG_CHE_BIEN → SAN_SANG`).

---

## 6. Dữ liệu hiển thị

### Danh sách đơn bếp (từ `GET /api/don-hang`)
```
[
  {
    maDonHang: string,
    maBan: string,
    tenBan: string,
    trangThai: string,  // "DANG_CHUAN_BI" | "DA_XAC_NHAN" | "DANG_CHE_BIEN" | "SAN_SANG"
    tongTien: number,
    soMon: number,
    ngayTao: string,
    chiTiet: [
      {
        maMon: string,
        tenMon: string,
        soLuong: number,
        donGia: number,
        trangThai: string  // "DANG_CHUAN_BI" | "DANG_CHE_BIEN" | "SAN_SANG" | "DA_PHUC_VU" | "DA_HUY"
      }
    ]
  }
]
```

---

## 7. Form nhập liệu

### Form nhận chế biến món
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `maDonHang` | (từ danh sách) | Có | Phải ở `DANG_CHUAN_BI` |
| `maMon` | (từ danh sách) | Có | Món phải ở `DANG_CHUAN_BI` |

### Form hoàn thành món
| Field | Kiểu | Bắt buộc | Validate |
|-------|------|-----------|----------|
| `maDonHang` | (từ danh sách) | Có | Phải ở `DANG_CHE_BIEN` |
| `maMon` | (từ danh sách) | Có | Món phải ở `DANG_CHE_BIEN` |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động |
|-----|--------|-----------|
| "Nhận chế biến" | Chi tiết đơn (bếp) | `PATCH /api/don-hang/:maDonHang/status` |
| "Hoàn thành" | Chi tiết đơn (bếp) | `PATCH /api/don-hang/:maDonHang/status` |

---

## 9. API liên quan

### `GET /api/don-hang` — staff
- Danh sách đơn hàng (filter trạng thái).
- Query: `?trangThai=DANG_CHUAN_BI` hoặc `?trangThai=DANG_CHE_BIEN`.

### `PATCH /api/don-hang/:maDonHang/status` — staff
- Cập nhật trạng thái đơn hoặc chi tiết đơn.
- Request (đơn): `{ trangThai: 'DANG_CHE_BIEN' }`
- Request (chi tiết): `{ chiTiet: [{ maMon, trangThai: 'DANG_CHE_BIEN' }] }`
- Side effects:
  - Khi chuyển `DANG_CHUAN_BI → DANG_CHE_BIEN`: `DonHang.TrangThai` tự chuyển `DANG_CHE_BIEN`.
  - Khi tất cả món `SAN_SANG`: `DonHang.TrangThai` tự chuyển `SAN_SANG`.

---

## 10. Luồng xử lý chính

### 10a. Xem danh sách đơn vào bếp
```
1. Nhân viên bếp vào /noi-bo/don-hang
2. Lọc trạng thái DANG_CHUAN_BI
3. GET /api/don-hang?trangThai=DANG_CHUAN_BI
4. Hiển thị danh sách đơn
```

### 10b. Nhận chế biến món
```
1. Chọn đơn DANG_CHUAN_BI
2. Chọn món cần nhận
3. Bấm "Nhận chế biến"
4. PATCH /api/don-hang/:maDonHang/status { trangThai: 'DANG_CHE_BIEN' }
5. Backend: ChiTietDonHang.TrangThai → DANG_CHE_BIEN, DonHang.TrangThai → DANG_CHE_BIEN
6. Hiển thị thông báo thành công
```

### 10c. Hoàn thành món
```
1. Chọn đơn DANG_CHE_BIEN
2. Chọn món đã xong
3. Bấm "Hoàn thành"
4. PATCH /api/don-hang/:maDonHang/status { chiTiet: [{ maMon, trangThai: 'SAN_SANG' }] }
5. Backend: ChiTietDonHang.TrangThai → SAN_SANG
6. Nếu tất cả món SAN_SANG → DonHang.TrangThai → SAN_SANG
7. Hiển thị thông báo thành công
```

---

## 11. Luồng thay thế

### 11a. Bếp nhận toàn bộ đơn cùng lúc
```
1. Chọn nhiều đơn DANG_CHUAN_BI
2. Bấm "Nhận chế biến"
3. Backend xử lý từng đơn
```

### 11b. Món bị huỷ
```
1. Món bị khách hoặc staff huỷ
2. ChiTietDonHang.TrangThai → DA_HUY
3. DonHang vẫn giữ nguyên trạng thái
```

---

## 12. Luồng lỗi

| Mã lỗi | Tình huống | Hiển thị |
|---------|-----------|----------|
| `400` | Món đã nấu xong | "Món đã hoàn thành" |
| `400` | Món đã nhận trước đó | "Món đang được chế biến" |
| `400` | Đơn không tồn tại | "Không tìm thấy đơn hàng" |
| `400` | Đơn đã huỷ | "Đơn đã bị huỷ" |
| `404` | Đơn không tồn tại | "Không tìm thấy đơn hàng" |

---

## 13. Trạng thái thay đổi

### Khi nhận chế biến
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DonHang` | `TrangThai` | `DANG_CHUAN_BI` | `DANG_CHE_BIEN` |
| `ChiTietDonHang` | `TrangThai` | `DANG_CHUAN_BI` | `DANG_CHE_BIEN` |

### Khi hoàn thành món
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `ChiTietDonHang` | `TrangThai` | `DANG_CHE_BIEN` | `SAN_SANG` |
| `DonHang` | `TrangThai` | `DANG_CHE_BIEN` | `SAN_SANG` (nếu tất cả món xong) |

### Khi huỷ món
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `ChiTietDonHang` | `TrangThai` | (bất kỳ) | `DA_HUY` |

---

## 14. Phân quyền

| Endpoint | Mức quyền | Ghi chú |
|----------|-----------|--------|
| `GET /api/don-hang` | `staff` | Xem tất cả đơn |
| `PATCH /api/don-hang/:maDonHang/status` | `staff` | Cập nhật trạng thái đơn/ch tiết |

---

## 15. Acceptance Criteria

### AC-01: Xem danh sách đơn vào bếp
- [ ] Hiển thị đúng danh sách đơn `DANG_CHUAN_BI`
- [ ] Có trạng thái rỗng khi không có đơn

### AC-02: Nhận chế biến
- [ ] Cập nhật thành công → món chuyển `DANG_CHE_BIEN`
- [ ] Đơn tự động chuyển `DANG_CHE_BIEN`

### AC-03: Hoàn thành món
- [ ] Cập nhật thành công → món chuyển `SAN_SANG`
- [ ] Tất cả món xong → đơn tự động chuyển `SAN_SANG`

### AC-04: Huỷ món
- [ ] Món chuyển `DA_HUY`
- [ ] DonHang không thay đổi trạng thái

---

## 16. Checklist đối chiếu code hiện tại

| # | Kiểm tra | File kiểm tra | Trạng thái |
|---|----------|---------------|-----------|
| 1 | `DonHangNoiBoPage.jsx` có tab/filter cho bếp | `frontend/src/pages/noiBo/` | ☐ |
| 2 | `GET /api/don-hang` hỗ trợ filter trạng thái | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 3 | `PATCH /api/don-hang/:maDonHang/status` cập nhật `ChiTietDonHang` | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 4 | Tự động chuyển `DonHang.TrangThai` khi tất cả món `SAN_SANG` | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 5 | ENUM `ChiTietDonHang.TrangThai` dùng Việt | `backend/nest-api/src/common/constants.ts` | ☐ |
