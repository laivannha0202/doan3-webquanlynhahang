# FEAT-03: Nhân viên — Phục vụ: Bán hàng & quản lý đơn

> **Phạm vi:** Nhân viên (sub-role: Phục vụ) quản lý bàn, tạo đơn giúp khách (kiosk), theo dõi trạng thái đơn, chuyển trạng thái phục vụ.  
> **Liên quan:** FEAT-01 (QR ordering khách tự đặt), FEAT-04 (bếp xử lý), FEAT-05 (thu ngân thanh toán).

---

## 1. Mục tiêu

- Nhân viên phụ trách khu vực quản lý trạng thái bàn (dọn bàn, xếp bàn cho khách đặt trước).
- Nhân viên phụ vụ tạo đơn hàng giúp khách tại quầy/kiosk (khách không tự order).
- Nhân viên theo dõi đơn hàng và chuyển trạng thái khi phục vụ (`DANG_PHUC_VU` → `HOAN_THANH`).
- Phân quyền chặt chẽ: chỉ nhân viên có sub-role **Phục vụ** mới thực hiện được các thao tác trên.

---

## 2. Actor sử dụng

| Actor | Vai trò | Ghi chú |
|-------|---------|---------|
| **Nhân viên** | Diễn viên chính | Sub-role: **Phục vụ** — phụ trách khu vực, phục vụ khách, tạo đơn tại quầy |

> **Lưu ý:** Actor chính là "Nhân viên". Sub-role "Phục vụ" xác định quyền hạn cụ thể.  
> Trong code, `VaiTro` = `NHAN_VIEN`, `ChucNangPhu` = `PHUC_VU`.

---

## 3. Route / Trang

| Route | Trang | Yêu cầu đăng nhập | Role |
|-------|-------|--------------------|------|
| `/noi-bo/quan-ly-ban` | Quản lý bàn — xem trạng thái tất cả bàn | ✅ | Nhân viên |
| `/noi-bo/tao-don` | Tạo đơn giúp khách tại quầy/kiosk | ✅ | Nhân viên |
| `/noi-bo/don-hang` | Danh sách đơn hàng đang xử lý | ✅ | Nhân viên |
| `/noi-bo/don-hang/:maDonHang` | Chi tiết đơn hàng | ✅ | Nhân viên |

> **Lưu ý:** Routes trên cần được xác minh trong code. Nếu chưa có route riêng,  
> có thể nằm trong route admin hoặc trang quản lý chung.

---

## 4. Danh sách màn hình

| STT | Màn hình | Mô tả |
|-----|----------|-------|
| 1 | **Quản lý bàn** | Sơ đồ tất cả bàn theo khu vực. Hiển thị trạng thái: TRONG (xanh), DA_DAT (vàng), CO_KHACH (cam), DANG_DON (đỏ), BAO_TRI (xám). |
| 2 | **Tạo đơn tại quầy** | Chọn bàn → chọn món → thêm vào đơn → xác nhận tạo đơn. |
| 3 | **Danh sách đơn** | Danh sách đơn hàng theo trạng thái. Tab: `DANG_CHUAN_BI` / `DANG_PHUC_VU` / `HOAN_THANH` / `DA_THANH_TOAN` / `DA_HUY`. |
| 4 | **Chi tiết đơn** | Xem chi tiết đơn: bàn, danh sách món, trạng thái từng món, tổng tiền. Nút chuyển trạng thái. |

---

## 5. Thành phần giao diện

### 5.1 Quản lý bàn

| Thành phần | Mô tả |
|------------|-------|
| Filter khu vực | Select / tabs: Tất cả + từng khu vực |
| Card bàn | Hiển thị: tên bàn, số chỗ ngồi, trạng thái (badge màu). Click để xem chi tiết |
| Badge trạng thái | `TRONG` = xanh, `DA_DAT` = vàng, `CO_KHACH` = cam, `DANG_DON` = đỏ, `BAO_TRI` = xám |
| Nút "Dọn bàn" | Chỉ hiện khi `TrangThai = DANG_DON` |
| Nút "Xếp bàn" | Chỉ hiện khi `TrangThai = DA_DAT` — khách đến nhận bàn |
| Nút "Bảo trì" | Chuyển bàn sang `BAO_TRI` |

### 5.2 Tạo đơn tại quầy

| Thành phần | Mô tả |
|------------|-------|
| Chọn bàn | Select: chỉ hiện bàn `CO_KHACH` hoặc `TRONG` |
| Danh mục + món | Giống FEAT-01: danh mục tabs + card món + tìm kiếm |
| Giỏ hàng | Danh sách món đã chọn, số lượng, tổng tiền |
| Ghi chú đơn | Textarea — max 500 ký tự |
| Nút "Tạo đơn" | Disabled nếu giỏ trống hoặc chưa chọn bàn |
| Nút "Hủy" | Reset form |

### 5.3 Danh sách đơn

| Thành phần | Mô tả |
|------------|-------|
| Tab trạng thái | `DANG_CHUAN_BI` / `DANG_PHUC_VU` / `HOAN_THANH` / `DA_THANH_TOAN` / `DA_HUY` |
| Card đơn | Hiển thị: mã đơn, bàn, thời gian tạo, số món, tổng tiền, trạng thái |
| Badge trạng thái | Màu theo trạng thái |
| Click card → Chi tiết đơn | |

### 5.4 Chi tiết đơn

| Thành phần | Mô tả |
|------------|-------|
| Thông tin đơn | Mã đơn, bàn, thời gian, khách (nếu có) |
| Danh sách món | Tên món, số lượng, đơn giá, thành tiền, trạng thái từng món |
| Tổng tiền | Bold |
| Nút chuyển trạng thái | `DANG_CHUAN_BI` → `DANG_PHUC_VU` (khi bắt đầu phục vụ) |
| Nút hoàn thành | `DANG_PHUC_VU` → `HOAN_THANH` (khi phục vụ xong) |
| Nút hủy đơn | `DANG_CHUAN_BI` → `DA_HUY` (chỉ khi chưa bắt đầu) |

---

## 6. Dữ liệu hiển thị

### 6.1 Danh sách bàn (GET `/api/ban`)

```typescript
// Response 200
{
  data: Ban[];
  total: number;
}

// Ban object
{
  MaBan: string;          // "BAN01"
  TenBan: string;         // "Bàn 1"
  MaKhuVuc: string;       // "KV01"
  SoChoNgoi: number;      // 4
  TrangThai: "TRONG" | "DA_DAT" | "CO_KHACH" | "DANG_DON" | "BAO_TRI";
  KhuVuc: {
    MaKhuVuc: string;
    TenKhuVuc: string;
  };
}
```

### 6.2 Tạo đơn tại quầy (POST `/api/ban/:maBan/order`)

```typescript
// Request body
{
  MaBan: string;          // Bắt buộc
  MaKH?: string;          // Nếu khách có tài khoản. Null nếu khách vãng lai
  GhiChuDonHang?: string;
  ChiTietDonHang: {
    MaMonAn: string;
    SoLuong: number;
    GhiChu?: string;
  }[];
}

// Response 201
{
  MaDonHang: string;
  MaBan: string;
  TrangThai: "DANG_CHUAN_BI";
  NgayTao: string;
  TongTien: number;
  ChiTietDonHang: ChiTietDonHangItem[];
}
```

### 6.3 Danh sách đơn (GET `/api/don-hang`)

```typescript
// Query params: page, limit, TrangThai, MaBan
// Response 200
{
  data: DonHang[];
  total: number;
}
```

### 6.4 Cập nhật trạng thái (PATCH `/api/don-hang/:maDonHang/status`)

```typescript
// Request body
{
  TrangThai: "DANG_PHUC_VU" | "HOAN_THANH" | "DA_HUY";
}

// Response 200
{
  MaDonHang: string;
  TrangThai: string;
  NgayCapNhat: string;
}
```

### 6.5 Cập nhật trạng thái bàn (PUT `/api/ban/:maBan/trang-thai`)

```typescript
// Request body
{
  TrangThai: "TRONG" | "BAO_TRI";
}

// Response 200
{
  MaBan: string;
  TrangThai: string;
}
```

---

## 7. Form nhập liệu

### 7.1 Tạo đơn tại quầy

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Bàn | Select | Bắt buộc. Chỉ hiện `TRONG` hoặc `CO_KHACH` | |
| Số lượng món | Number | ≥ 1, ≤ 99 | |
| Ghi chú đơn | Textarea | Max 500 ký tự | Tùy chọn |

### 7.2 Chuyển trạng thái bàn

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Trạng thái mới | Select | Chỉ hiện giá trị hợp lệ theo trạng thái hiện tại | |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động | Khi nào disabled |
|-----|--------|----------|-----------------|
| **Tạo đơn** | Form tạo đơn | POST `/api/ban/:maBan/order` | Giỏ trống, chưa chọn bàn, đang loading |
| **Dọn bàn** | Card bàn | PUT `/api/ban/:maBan/trang-thai` → `TRONG` | Trạng thái ≠ `DANG_DON` |
| **Xếp bàn** | Card bàn | PUT `/api/ban/:maBan/dat-ban/:maDatBan/xep-ban` → `CO_KHACH` | Trạng thái ≠ `DA_DAT` |
| **Bảo trì** | Card bàn | PUT `/api/ban/:maBan/trang-thai` → `BAO_TRI` | — |
| **Chuyển trạng thái** | Chi tiết đơn | PATCH `/api/don-hang/:maDonHang/status` | Trạng thái hiện tại không cho phép chuyển |
| **Hủy đơn** | Chi tiết đơn | PATCH `/api/don-hang/:maDonHang/status` → `DA_HUY` | Đơn đã `DANG_PHUC_VU` trở đi |

---

## 9. API liên quan

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/ban` | Nhân viên (Phục vụ) | Query: `MaKhuVuc`, `TrangThai` | `{ data: Ban[], total }` | Xem danh sách bàn |
| `GET` | `/api/ban/:maBan` | Nhân viên (Phục vụ) | `maBan` (path) | `Ban` object | Chi tiết bàn |
| `PUT` | `/api/ban/:maBan/trang-thai` | Nhân viên (Phục vụ) | `{ TrangThai }` | `Ban` (200) | Chuyển trạng thái bàn |
| `PUT` | `/api/ban/:maBan/dat-ban/:maDatBan/xep-ban` | Nhân viên (Phục vụ) | `maBan`, `maDatBan` | `Ban` (200) | Xếp bàn cho DatBan |
| `POST` | `/api/ban/:maBan/order` | Nhân viên | `maBan` (path) + `DonHangCreateDto` | `DonHang` (201) | Tạo đơn cho bàn |
| `GET` | `/api/ban/:maBan/order` | Nhân viên | `maBan` (path) | `DonHang` + `ChiTietDonHang` | Xem trạng thái đơn theo bàn |
| `GET` | `/api/don-hang` | Nhân viên | Query: `page`, `limit`, `TrangThai`, `MaBan` | `{ data: DonHang[], total }` | Danh sách đơn |
| `PATCH` | `/api/don-hang/:maDonHang/status` | Nhân viên | `{ TrangThai }` | `DonHang` (200) | Chuyển trạng thái |
| `PATCH` | `/api/don-hang/chi-tiet/:maChiTiet/status` | Nhân viên | `{ TrangThai }` | `ChiTietDonHang` (200) | Chuyển trạng thái món |
| `GET` | `/api/khu-vuc` | Nhân viên (Phục vụ) | Query: `page`, `limit` | `{ data: KhuVuc[], total }` | Danh sách khu vực |
| `GET` | `/api/thuc-don` | Public | Query: `page`, `limit` | `{ data: MonAn[], total }` | Danh sách món ăn |

> **Lưu ý:** Tất cả endpoint trên yêu cầu JWT token có `VaiTro = NHAN_VIEN`.

---

## 10. Luồng xử lý chính

### 10.1 Phục vụ — Quản lý bàn

```
1. Nhân viên đăng nhập (VaiTro: NHAN_VIEN, ChucNangPhu: PHUC_VU)
   → Vào trang `/noi-bo/don-hang`

2. Hiển thị sơ đồ bàn theo khu vực:
   - TRONG (xanh): bàn trống
   - DA_DAT (vàng): bàn đã đặt trước, chờ khách đến
   - CO_KHACH (cam): có khách đang ngồi
   - DANG_DON (đỏ): cần dọn dẹp
   - BAO_TRI (xám): đang bảo trì

3. Nhân viên dọn bàn:
   a. Click bàn có TrangThai = DANG_DON
   b. Nhấn "Dọn bàn"
   c. PUT /api/ban/:maBan/trang-thai → { TrangThai: "TRONG" }
   d. Bàn chuyển sang TRONG

4. Nhân viên xếp bàn cho DatBan:
   a. Click bàn có TrangThai = DA_DAT
   b. Nhấn "Xếp bàn"
   c. PUT /api/ban/:maBan/dat-ban/:maDatBan/xep-ban
   d. Bàn chuyển sang CO_KHACES
   e. DatBan chuyển sang DA_NHAN_BAN

5. Nhân viên chuyển bàn sang bảo trì:
   a. Click bàn bất kỳ (trừ CO_KHACH nếu đang có khách)
   b. Nhấn "Bảo trì"
   c. PUT /api/ban/:maBan/trang-thai → { TrangThai: "BAO_TRI" }
```

### 10.2 Phục vụ — Tạo đơn tại quầy

```
1. Nhân viên vào `/noi-bo/tao-don`

2. Chọn bàn từ dropdown (chỉ hiện TRONG hoặc CO_KHACH)

3. Chọn món từ thực đơn (giống luồng FEAT-01):
   - Browse danh mục → chọn món → thêm số lượng → ghi chú

4. Kiểm tra giỏ hàng → tổng tiền

5. Nhấn "Tạo đơn" → POST `/api/ban/:maBan/order`
   Body: {
     MaBan: "BAN01",
     MaKH: "KH001" | null,    // Null nếu khách vãng lai
     ChiTietDonHang: [...]
   }

6. Backend:
   a. Validate MaBan tồn tại, không BAO_TRI
   b. Validate MaMonAn còn hàng
   c. Tính tổng tiền
   d. Tạo DonHang (TrangThai: DANG_CHUAN_BI)
   e. Tạo ChiTietDonHang
   f. Cập nhật bàn → CO_KHACH (nếu TRONG)
   g. Trả 201

7. Frontend: hiển thị thông báo "Tạo đơn thành công! Mã: DH001234"
   → Chuyển sang trang danh sách đơn
```

### 10.3 Phục vụ — Theo dõi & chuyển trạng thái đơn

```
1. Nhân viên vào `/noi-bo/don-hang`

2. Xem danh sách đơn theo tab trạng thái

3. Khi bắt đầu phục vụ (mang món ra bàn):
   a. Click đơn có TrangThai = DANG_CHUAN_BI
   b. Nhấn "Bắt đầu phục vụ"
   c. PATCH `/api/don-hang/:maDonHang/status` → `{ TrangThai: "DANG_PHUC_VU" }`
   d. DonHang → DANG_PHUC_VU

4. Khi phục vụ xong (tất cả món đã ra):
   a. Click đơn có TrangThai = DANG_PHUC_VU
   b. Nhấn "Hoàn thành"
   c. PATCH `/api/don-hang/:maDonHang/status` → `{ TrangThai: "HOAN_THANH" }`
   d. DonHang → HOAN_THANH
   e. Chuyển sang FEAT-05 (thu ngân thanh toán)

5. Khi cần hủy đơn (chưa bắt đầu chế biến):
   a. Click đơn có TrangThai = DANG_CHUAN_BI
   b. Nhấn "Hủy đơn" → xác nhận
   c. PATCH `/api/don-hang/:maDonHang/status` → `{ TrangThai: "DA_HUY" }`
   d. DonHang → DA_HUY
```

---

## 11. Luồng thay thế

### 11.1 Khách vãng lai không có tài khoản

```
1. Nhân viên tạo đơn tại quầy → MaKH = null
2. Đơn hàng vẫn tạo được, gắn với MaBan
3. Khách theo dõi trạng thái qua màn hình tại bàn (FEAT-01)
4. Thu ngân thanh toán tiền mặt (FEAT-05)
```

### 11.2 Khách đã có tài khoản

```
1. Nhân viên hỏi SĐT hoặc email khách hàng
2. Tìm KhachHang → lấy MaKH
3. Tạo đơn với MaKH trong body
4. Khách có thể xem lịch sử đơn trên app (FEAT-02)
```

### 11.3 Bếp không xử lý kịp

```
1. Nhân viên thấy đơn chờ quá lâu
2. Nhân viên liên hệ bếp trực tiếp (ngoài hệ thống)
3. Hệ thống không có tính năng thông báo/gợi ý cho bếp
```

### 11.4 Lỗi khi chuyển trạng thái

```
1. PATCH `/api/don-hang/:maDonHang/status` trả 400
   → "Không thể chuyển từ trạng thái '{hiện tại}' sang '{mới}'"
2. Hiển thị toast lỗi
3. Reload danh sách đơn
```

---

## 12. Luồng lỗi

| Mã lỗi | Thông báo | Hành động |
|---------|----------|----------|
| 400 - Chuyển trạng thái không hợp lệ | "Không thể chuyển từ '{hiện tại}' sang '{mới}'" | Toast lỗi |
| 400 - Bàn đang bảo trì | "Bàn này đang bảo trì. Không thể tạo đơn." | Chọn bàn khác |
| 400 - Món hết hàng | "Món '{tên}' vừa hết hàng." | Xóa khỏi giỏ |
| 401 - Token hết hạn | "Phiên đã hết hạn." | Redirect đăng nhập |
| 403 - Không có quyền | "Bạn không có quyền thao tác này." | — |
| 404 - Không tìm thấy | "Không tìm thấy đơn/bàn." | Reload danh sách |
| 500 - Lỗi server | "Đã xảy ra lỗi." | Retry |

---

## 13. Trạng thái thay đổi

### 13.1 DonHang

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Actor |
|--------------------|---------|---------------------|-------|
| *(khởi tạo)* | `POST /api/ban/:maBan/order` (nhân viên tạo) | `DANG_CHUAN_BI` | Nhân viên |
| `DANG_CHUAN_BI` | Nhân viên bắt đầu phục vụ | `DANG_PHUC_VU` | Nhân viên (Phục vụ) |
| `DANG_PHUC_VU` | Nhân viên hoàn thành | `HOAN_THANH` | Nhân viên (Phục vụ) |
| `HOAN_THANH` | Thu ngân thanh toán | `DA_THANH_TOAN` | Nhân viên (Thu ngân) — FEAT-05 |
| `DANG_CHUAN_BI` | Nhân viên hủy | `DA_HUY` | Nhân viên (Phục vụ) |

### 13.2 ChiTietDonHang

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Actor |
|--------------------|---------|---------------------|-------|
| `DANG_CHUAN_BI` | Bếp bắt đầu chế biến | `DANG_PHUC_VU` | Nhân viên (Bếp) — FEAT-04 |
| `DANG_PHUC_VU` | Bếp hoàn thành | `HOAN_THANH` | Nhân viên (Bếp) — FEAT-04 |
| `DANG_CHUAN_BI` | Nhân viên hủy món | `DA_HUY` | Nhân viên (Phục vụ) |

### 13.3 Ban

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Actor |
|--------------------|---------|---------------------|-------|
| `TRONG` | Tạo đơn / xếp bàn | `CO_KHACES` | Nhân viên (Phục vụ) |
| `CO_KHACES` | Thu ngân xác nhận thanh toán | `DANG_DON` | Nhân viên (Thu ngân) — FEAT-05 |
| `DANG_DON` | Nhân viên dọn dẹp xong | `TRONG` | Nhân viên (Phục vụ) |
| `DA_DAT` | Xếp bàn cho khách đến | `CO_KHACES` | Nhân viên (Phục vụ) |
| `TRONG` hoặc `DA_DAT` | Chuyển bảo trì | `BAO_TRI` | Nhân viên (Phục vụ) |
| `BAO_TRI` | Kết thúc bảo trì | `TRONG` | Nhân viên (Phục vụ) |

---

## 14. Phân quyền

| Vai trò | Quyền truy cập | Ghi chú |
|---------|----------------|---------|
| **Nhân viên (Phục vụ)** | Quản lý bàn, tạo đơn tại quầy, theo dõi đơn, chuyển trạng thái `DANG_CHUAN_BI` → `DANG_PHUC_VU` → `HOAN_THANH`, hủy đơn | Yêu cầu JWT `VaiTro = NHAN_VIEN`, `ChucNangPhu = PHUC_VU` |
| **Nhân viên (Bếp)** | Xem đơn `DANG_CHUAN_BI`, chuyển trạng thái ChiTietDonHang | FEAT-04 |
| **Nhân viên (Thu ngân)** | Thanh toán đơn `HOAN_THANH` | FEAT-05 |
| **Admin** | Toàn bộ quyền + quản lý nhân viên, xem báo cáo | FEAT-06 |

---

## 15. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | Nhân viên đăng nhập → vào được `/noi-bo/don-hang`, xem danh sách đơn | Manual |
| AC-02 | Bàn `DANG_DON` → nút "Dọn bàn" hiển thị → nhấn → bàn chuyển `TRONG` | Manual |
| AC-03 | Bàn `DA_DAT` → nút "Xếp bàn" hiển thị → nhấn → bàn chuyển `CO_KHACES`, DatBan chuyển `DA_NHAN_BAN` | Manual |
| AC-04 | Tạo đơn tại quầy với `MaBan` → DonHang tạo thành công `DANG_CHUAN_BI` | Manual |
| AC-05 | Tạo đơn **không có `MaBan`** → trả 400 | Manual |
| AC-06 | Đơn `DANG_CHUAN_BI` → nhấn "Bắt đầu phục vụ" → chuyển `DANG_PHUC_VU` | Manual |
| AC-07 | Đơn `DANG_PHUC_VU` → nhấn "Hoàn thành" → chuyển `HOAN_THANH` | Manual |
| AC-08 | Đơn `DANG_PHUC_VU` → KHÔNG cho phép chuyển trực tiếp về `DA_HUY` | Manual |
| AC-09 | Nhân viên (Bếp) KHÔNG thể truy cập trang quản lý bàn | Manual: thử truy cập route |
| AC-10 | Nhân viên (Thu ngân) KHÔNG thể tạo đơn tại quầy | Manual: thử tạo đơn |
| AC-11 | Tạo đơn với MaMonAn hết hàng → trả 400, hiển thị lỗi rõ ràng | Manual |
| AC-12 | Tất cả enum trạng thái phải khớp với FEAT-07 | Code review |

---

## 16. Checklist đối chiếu code hiện tại

### Routes

| Route | Tồn tại? | Component | Ghi chú |
|-------|----------|-----------|---------|
| `/noi-bo/don-hang` | ✅ | `DonHangNoiBo` | Danh sách đơn hàng |
| `/noi-bo/don-hang/:maDonHang` | ✅ | Route con của `/noi-bo/don-hang` | Chi tiết đơn |

### API endpoints

| Endpoint | Tồn tại? | Controller | Ghi chú |
|----------|----------|-----------|---------|
| `GET /api/ban` | ✅ | `ban.controller.ts` | |
| `PUT /api/ban/:maBan/trang-thai` | ⚠️ | — | **Cần kiểm tra** endpoint cập nhật trạng thái |
| `PUT /api/ban/:maBan/dat-ban/:maDatBan/xep-ban` | ⚠️ | — | **Cần kiểm tra** |
| `POST /api/ban/:maBan/order` | ✅ | `don-hang.controller.ts` | Tạo đơn cho bàn |
| `GET /api/don-hang` | ✅ | `don-hang.controller.ts` | Danh sách đơn (staff only) |
| `PATCH /api/don-hang/:maDonHang/status` | ✅ | `don-hang.controller.ts` | Cập nhật trạng thái |
| `PATCH /api/don-hang/chi-tiet/:maChiTiet/status` | ✅ | `don-hang.controller.ts` | Cập nhật trạng thái món |

### Enum / State

| Enum | Giá trị trong code | Giá trị trong spec | Khớp? |
|------|-------------------|-------------------|-------|
| `DonHang.TrangThai` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | ✅ |
| `ChiTietDonHang.TrangThai` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_HUY` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_HUY` | ✅ |
| `Ban.TrangThai` | `TRONG, DA_DAT, CO_KHACES, DANG_DON, BAO_TRI` | `TRONG, DA_DAT, CO_KHACES, DANG_DON, BAO_TRI` | ✅ |

### Trạng thái cấm

| Trạng thái cấm | Xuất hiện trong code backend? | Kết quả |
|----------------|------------------------------|---------|
| `CHO_XU_LY` | ❌ | ✅ OK |
| `CHO_CHE_BIEN` | ❌ | ✅ OK |
| `DANG_CHUAN_BIEN` | ❌ | ✅ OK |
| `DANG_CHE_BIEN` | ❌ | ✅ OK |
| `SAN_SANG` | ❌ | ✅ OK |
| `DA_PHUC_VU` | ❌ | ✅ OK |
| `DA_DEN` | ❌ | ✅ OK |

### Phân quyền

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| `@UseGuards(AuthGuard)` trên các route nhân viên | ⚠️ | Cần xác minh |
| `VaiTro` check = `NHAN_VIEN` | ⚠️ | Cần xác minh |
| `ChucNangPhu` check = `PHUC_VU` | ⚠️ | Cần xác minh — **có thể chưa implement phân quyền sub-role** |

### Tích hợp với FEAT khác

| FEAT | Mối liên hệ |
|------|-------------|
| FEAT-01 | QR ordering — khách tự đặt, không qua nhân viên |
| FEAT-02 | DatBan — nhân viên xác nhận khi khách đến |
| FEAT-04 | Bếp — xử lý ChiTietDonHang |
| FEAT-05 | Thu ngân — thanh toán DonHang HOAN_THANH |
| FEAT-06 | Admin — quản lý nhân viên, phân quyền |
| FEAT-07 | State machines chuẩn |

---

*Ghi chú: Actor chính là "Nhân viên" với sub-role "Phục vụ". Routes cần xác minh — nhiều route có thể chưa triển khai riêng cho nhân viên, có thể nằm trong trang admin. Cần kiểm tra phân quyền sub-role (ChucNangPhu) trong code backend.*
