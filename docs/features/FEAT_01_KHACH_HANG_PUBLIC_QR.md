# FEAT_01: Khách hàng vãng lai — QR gọi món tại bàn

> Mã feature: FEAT_01
> Actor chính: **Khách hàng vãng lai** (không cần đăng nhập)
> Phiên bản: 1.0 — 2026-06-09

---

## 1. Mục tiêu

Cho phép khách hàng ngồi tại bàn quét mã QR để xem thực đơn, gọi món, gửi đơn đến bếp, và yêu cầu thanh toán — **hoàn toàn không cần đăng nhập**.

Luồng này là luồng nghiệp vụ chính #1 của hệ thống (theo Audit Mục 1.1).

---

## 2. Actor sử dụng

| Actor | Quyền API | Ghi chú |
|-------|-----------|---------|
| Khách vãng lai | `public` | Không có token JWT. Đơn không gắn `MaKH`. |
| Khách có tài khoản (tùy chọn) | `customer-auth` | Nếu nhập SĐT/đăng nhập → đơn gắn `MaKH`, tích điểm được. |

---

## 3. Route / trang liên quan

| Route | Mô tả | Route hiện tại |
|-------|-------|---------------|
| `/ban/:maBan` | Trang chính của bàn — hiển thị thực đơn + giỏ hàng | `BanGoiMonPage.jsx` |
| `/ban/:maBan/thuc-don` | Xem thực đơn theo bàn (redirect hoặc overlay) | Gộp vào `/ban/:maBan` |
| `/ban/:maBan/goi-mon` | Gọi món tại bàn | `BanGoiMonPage.jsx` |

---

## 4. Danh sách màn hình

### Màn hình 4.1: Trang bàn (QR landing)
- Hiển thị khi khách quét QR → URL có `maBan`.
- Kiểm tra `maBan` hợp lệ, bàn không `BAO_TRI`.
- Hiển thị tên bàn, mã bàn.
- Nếu đã có đơn mở tại bàn → hiển thị nút "Xem đơn hiện tại".

### Màn hình 4.2: Thực đơn + Chọn món
- Danh sách món ăn theo danh mục.
- Mỗi món: hình ảnh, tên, giá, mô tả ngắn.
- Nút "Thêm" để thêm vào giỏ.
- Chọn số lượng (1, 2, 3...).
- Thanh giỏ hàng nổi ở dưới: hiển thị số món đã chọn + tổng tiền tạm tính.

### Màn hình 4.3: Giỏ hàng / Xác nhận đơn
- Danh sách món đã chọn: tên, số lượng, đơn giá, thành tiền.
- Nút +/- để thay đổi số lượng.
- Nút "Xoá món".
- Tổng tạm tính.
- Phí dịch vụ 5% (nếu áp dụng).
- Tổng thanh toán dự kiến.
- Nút "Gửi đơn".

### Màn hình 4.4: Đơn đã gửi / Đơn hiện tại
- Mã đơn (`maDonHang`).
- Danh sách món + trạng thái từng món (`DANG_CHUAN_BI`).
- Tổng tiền.
- Nút "Thêm món" → quay lại màn 4.2.
- Nút "Yêu cầu thanh toán".

### Màn hình 4.5: Yêu cầu thanh toán
- Xác nhận "Gửi yêu cầu thanh toán?".
- Sau khi gửi → hiển thị thông báo "Đã gửi yêu cầu, vui lòng chờ nhân viên".
- Không gọi API thanh toán trực tiếp — chờ staff xác nhận (UC-NV-13).

---

## 5. Thành phần giao diện

### Component `BanGoiMonPage`
- Header: tên bàn + mã bàn.
- Tabs/Section: Thực đơn | Đơn hiện tại.

### Component `DanhSachMonAn`
- Grid/list món ăn theo danh mục.
- Mỗi item: `HinhAnh`, `TenMon`, `Gia`, nút "Thêm".

### Component `GioHangTam`
- Floating bar ở dưới cùng màn hình.
- Hiển thị: số món đã chọn, tổng tiền.
- Click để mở modal chi tiết giỏ hàng.

### Component `XacNhanDonHang`
- Table món đã chọn.
- Nhập số lượng (input number).
- Nút xoá món.
- Tổng tạm tính + phí dịch vụ + tổng thanh toán.

### Component `TrangThaiDon`
- Mã đơn + trạng thái tổng hợp.
- Danh sách món kèm trạng thái `ChiTietDonHang.TrangThai`.
- Badge màu theo trạng thái.

---

## 6. Dữ liệu hiển thị

### Danh sách món (từ `GET /api/ban/:maBan/thuc-don`)

```
{
  maBan: string,
  tenBan: string,
  thucDon: [
    {
      maMon: string,
      tenMon: string,
      gia: number,
      hinhAnh: string | null,
      moTa: string,
      tenDanhMuc: string,
      trangThai: string  // "Con" = đang bán
    }
  ]
}
```

### Đơn hiện tại (từ `GET /api/ban/:maBan/order`)

```
{
  maDonHang: string,
  maBan: string,
  trangThai: string,  // "DANG_CHUAN_BI"
  tongTien: number,
  chiTiet: [
    {
      maMon: string,
      tenMon: string,
      soLuong: number,
      donGia: number,
      thanhTien: number,
      trangThai: string  // "DANG_CHUAN_BI" | "DANG_CHE_BIEN" | ...
    }
  ],
  ngayTao: string  // ISO datetime
}
```

---

## 7. Form nhập liệu

### Form gọi món (trong giỏ hàng)
| Field | Kiểu | Bắt buộc | Ghi chú |
|-------|------|-----------|---------|
| `soLuong` | number (min=1, max=99) | Có | Mặc định = 1 |

### Form yêu cầu thanh toán
| Field | Kiểu | Bắt buộc | Ghi chú |
|-------|------|-----------|---------|
| Không có input | — | — | Chỉ nút xác nhận |

> **Lưu ý:** Không có form nhập SĐT trong flow này. Nếu khách muốn tích điểm, chức năng nhập SĐT nằm ở thời điểm thanh toán (FEAT_05).

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động |
|-----|--------|-----------|
| "Thêm" | Mỗi món trong thực đơn | Thêm 1 món vào giỏ hàng tạm |
| "+"/"-" | Giỏ hàng chi tiết | Tăng/giảm số lượng |
| "Xoá" | Giỏ hàng chi tiết | Xoá món khỏi giỏ |
| "Gửi đơn" | Giỏ hàng xác nhận | `POST /api/ban/:maBan/order` |
| "Thêm món" | Đơn hiện tại | Chuyển sang tab thực đơn |
| "Yêu cầu thanh toán" | Đơn hiện tại | `POST /api/ban/:maBan/yeu-cau-thanh-toan` |
| "Xem đơn hiện tại" | Trang bàn (nếu có đơn mở) | Chuyển sang tab đơn hiện tại |

---

## 9. API liên quan

### `GET /api/ban/:maBan/thuc-don` — Public
- Lấy thực đơn theo bàn.
- Response: danh sách món `TrangThai = 'Con'`.
- Error: `404` nếu `MaBan` không tồn tại.

### `POST /api/ban/:maBan/order` — Public
- Tạo đơn hàng tại bàn.
- Request body:
```json
{
  "danhSachMon": [
    { "maMon": "M001", "soLuong": 2 },
    { "maMon": "M003", "soLuong": 1 }
  ]
}
```
- Response: `{ maDonHang, tongTien, chiTiet }`
- Side effects:
  - Tạo `DonHang` (`TrangThai = 'DANG_CHUAN_BI'`, `MaBan = :maBan`).
  - Tạo `ChiTietDonHang` cho từng món (`TrangThai = 'DANG_CHUAN_BI'`).
  - `Ban.TrangThai` → `CO_KHACH` (nếu đang `TRONG`).
- Error:
  - `400`: Bàn `BAO_TRI`, danh sách món trống, `MaBan` không hợp lệ.
  - `404`: Bàn không tồn tại.

### `GET /api/ban/:maBan/order` — Public
- Xem đơn đang mở tại bàn.
- Response: `DonHang` + `ChiTietDonHang` (nếu có).
- Error: `404` nếu không có đơn mở.

### `POST /api/ban/:maBan/yeu-cau-thanh-toan` — Public
- Gửi yêu cầu thanh toán.
- Không thay đổi trạng thái đơn — chỉ gửi thông báo đến staff.
- Response: `{ message: "Đã gửi yêu cầu thanh toán" }`
- Error: `400` nếu đơn đã `DA_THANH_TOAN`/`DA_HUY`.

---

## 10. Luồng xử lý chính

```
1. Khách quét QR trên bàn → mở /ban/:maBan
2. GET /api/ban/:maBan/thuc-don → hiển thị thực đơn
3. Khách chọn món → thêm vào giỏ hàng tạm (FE state)
4. Khách bấm "Gửi đơn"
5. POST /api/ban/:maBan/order { danhSachMon }
6. Backend tạo DonHang + ChiTietDonHang
7. Backend cập nhật Ban.TrangThai → CO_KHACH
8. FE hiển thị đơn hiện tại với trạng thái DANG_CHUAN_BI
9. Khách chờ nhân viên xử lý
10. Khách bấm "Yêu cầu thanh toán"
11. POST /api/ban/:maBan/yeu-cau-thanh-toan
12. FE hiển thị thông báo "Đã gửi yêu cầu, vui lòng chờ"
```

---

## 11. Luồng thay thế

### 11a. Khách thêm món sau khi đã gửi đơn
```
1. Khách ở màn hình "Đơn hiện tại"
2. Bấm "Thêm món"
3. Quay lại thực đơn, chọn thêm món
4. POST /api/ban/:maBan/order (với danh sách món mới)
5. Backend thêm vào DonHang + ChiTietDonHang hiện tại
```

### 11b. Khách có tài khoản muốn tích điểm
```
1. Khách đăng nhập trước khi gọi món (tùy chọn)
2. Token JWT được lưu → các API call kèm Authorization header
3. DonHang tự động gắn MaKH
4. Sau thanh toán → tích điểm
```

### 11c. Bàn đã có đơn mở
```
1. Khách quét QR → GET /api/ban/:maBan/order trả về đơn hiện tại
2. FE hiển thị nút "Xem đơn hiện tại" thay vì gọi món mới
3. Khách có thể thêm món vào đơn hiện tại hoặc yêu cầu thanh toán
```

---

## 12. Luồng lỗi

| Mã lỗi | Tình huống | Hiển thị |
|---------|-----------|----------|
| `404` | `MaBan` không tồn tại | "Bàn không tồn tại" |
| `400` | Bàn đang `BAO_TRI` | "Bàn không khả dụng" |
| `400` | Danh sách món trống khi gửi | "Vui lòng chọn món" |
| `400` | `maMon` không tồn tại | "Món không tồn tại" |
| `400` | Món không hoạt động (`TrangThai ≠ 'Con'`) | "Món hiện khôngavailable" |
| `400` | Đơn đã thanh toán/huỷ khi yêu cầu TT | "Đơn không còn hiệu lực" |
| `500` | Lỗi server | "Đã có lỗi xảy ra, vui lòng thử lại" |

---

## 13. Trạng thái thay đổi

### Khi tạo đơn (`POST /api/ban/:maBan/order`)
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| `DonHang` | `TrangThai` | — (INSERT) | `DANG_CHUAN_BI` |
| `ChiTietDonHang` | `TrangThai` | — (INSERT) | `DANG_CHUAN_BI` |
| `Ban` | `TrangThai` | `TRONG` (hoặc giữ nguyên nếu đã `CO_KHACH`) | `CO_KHACH` |

### Khi yêu cầu thanh toán
| Entity | Field | Giá trị cũ | Giá trị mới |
|--------|-------|-----------|-------------|
| — | — | — | Không thay đổi (chỉ gửi thông báo) |

---

## 14. Phân quyền

| Endpoint | Mức quyền | Giải thích |
|----------|-----------|-----------|
| `GET /api/ban/:maBan/thuc-don` | `public` | Ai cũng xem được |
| `POST /api/ban/:maBan/order` | `public` | Khách tại bàn tạo đơn, không cần token |
| `GET /api/ban/:maBan/order` | `public` | Xem đơn tại bàn |
| `POST /api/ban/:maBan/yeu-cau-thanh-toan` | `public` | Gửi yêu cầu TT |

> **Lưu ý:** Không có `customer-own` check ở các endpoint này vì đơn QR không gắn `MaKH` (trừ khi khách đăng nhập). Mọi người đều có thể gọi món tại bàn.

---

## 15. Acceptance Criteria

### AC-01: Quét QR vào trang bàn
- [ ] QR URL dạng `/ban/:maBan` mở đúng trang bàn
- [ ] Hiển thị tên bàn, mã bàn
- [ ] `MaBan` không hợp lệ → hiển thị lỗi "Bàn không tồn tại"
- [ ] Bàn `BAO_TRI` → hiển thị "Bàn không khả dụng"

### AC-02: Xem thực đơn
- [ ] Hiển thị danh sách món theo danh mục
- [ ] Chỉ hiện món `TrangThai = 'Con'`
- [ ] Mỗi món có: hình ảnh, tên, giá, nút "Thêm"
- [ ] Có thể lọc theo danh mục

### AC-03: Gọi món (tạo đơn)
- [ ] Thêm món vào giỏ hàng tạm (FE state)
- [ ] Thay đổi số lượng bằng +/- hoặc input
- [ ] Xoá món khỏi giỏ
- [ ] Giỏ hàng hiển thị tổng tạm tính
- [ ] Bấm "Gửi đơn" → gọi `POST /api/ban/:maBan/order`
- [ ] Đơn tạo thành công → chuyển sang màn "Đơn hiện tại"
- [ ] `DonHang.TrangThai = 'DANG_CHUAN_BI'`
- [ ] `Ban.TrangThai → 'CO_KHACH'`

### AC-04: Xem đơn hiện tại
- [ ] Hiển thị mã đơn, danh sách món, trạng thái từng món
- [ ] Tổng tiền
- [ ] Nút "Thêm món" để quay lại thực đơn
- [ ] Nút "Yêu cầu thanh toán"

### AC-05: Yêu cầu thanh toán
- [ ] Xác nhận trước khi gửi
- [ ] Gọi `POST /api/ban/:maBan/yeu-cau-thanh-toan`
- [ ] Hiển thị thông báo "Đã gửi yêu cầu, vui lòng chờ"
- [ ] Không thay đổi trạng thái đơn

### AC-06: Thêm món vào đơn hiện tại
- [ ] Từ "Đơn hiện tại" → bấm "Thêm món"
- [ ] Quay lại thực đơn, chọn thêm món
- [ ] Gửi đơn bổ sung → thêm vào DonHang hiện tại
- [ ] ChiTietDonHang mới có `TrangThai = 'DANG_CHUAN_BI'`

---

## 16. Checklist đối chiếu code hiện tại

| # | Kiểm tra | File kiểm tra | Trạng thái |
|---|----------|---------------|-----------|
| 1 | `BanGoiMonPage.jsx` tồn tại + có route `/ban/:maBan` | `frontend/src/pages/BanGoiMonPage.jsx`, `frontend/src/App.jsx` | ☐ |
| 2 | `GET /api/ban/:maBan/thuc-don` hoạt động | `backend/nest-api/src/modules/ban/` | ☐ |
| 3 | `POST /api/ban/:maBan/order` public, tạo `DonHang` + `ChiTietDonHang` | `backend/nest-api/src/modules/don-hang/` | ☐ |
| 4 | `GET /api/ban/:maBan/order` trả đơn hiện tại | `backend/nest-api/src/modules/ban/` | ☐ |
| `5` | `POST /api/ban/:maBan/yeu-cau-thanh-toan` hoạt động | `backend/nest-api/src/modules/ban/` | ☐ |
| 6 | `Ban.TrangThai` cập nhật về `CO_KHACH` khi tạo đơn | `don-hang-create-order.service.ts` | ☐ |
| 7 | ENUM `DonHang.TrangThai` dùng Việt `DANG_CHUAN_BI` | `common/constants.ts`, `contracts.js` | ☐ |
| 8 | ENUM `ChiTietDonHang.TrangThai` dùng Việt | `common/constants.ts` | ☐ |
| 9 | Phí dịch vụ 5% được tính ở FE | `frontend/src/utils/phiDichVu.js` | ☐ |
| 10 | Không có luồng online/takeaway/ship trong flow này | Kiểm tra `ThanhToanPage.jsx` | ☐ |
