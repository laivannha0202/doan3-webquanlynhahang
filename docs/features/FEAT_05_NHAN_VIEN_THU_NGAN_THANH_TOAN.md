# FEAT-05: Nhân viên — Thu ngân: Thanh toán & hóa đơn

> **Phạm vi:** Nhân viên (sub-role: Thu ngân) xem đơn `HOAN_THANH`, áp dụng voucher, tính tổng, xác nhận thanh toán (tiền mặt/Chuyển khoản), in hóa đơn.  
> **Liên quan:** FEAT-03 (phục vụ chuyển trạng thái), FEAT-04 (bếp hoàn thành), FEAT-06 (admin quản lý).

---

## 1. Mục tiêu

- Thu ngân xem danh sách đơn hàng `HOAN_THANH` chờ thanh toán.
- Áp dụng voucher giảm giá (nếu khách có).
- Xác nhận thanh toán: tiền mặt hoặc chuyển khoản.
- Sau khi thanh toán: `DonHang` → `DA_THANH_TOAN`, `Ban` → `DANG_DON`.
- Thu ngân là người **cuối cùng** xác nhận thanh toán — không ai khác có quyền này.

---

## 2. Actor sử dụng

| Actor | Vai trò | Ghi chú |
|-------|---------|---------|
| **Nhân viên** | Diễn viên chính | Sub-role: **Thu ngân** — thanh toán đơn, xác nhận thanh toán |

> **Lưu ý:** Actor chính là "Nhân viên". Sub-role "Thu ngân" xác định quyền hạn cụ thể.  
> Chỉ Thu ngân mới có quyền chuyển `DonHang` → `DA_THANH_TOAN`.

---

## 3. Route / Trang

| Route | Trang | Yêu cầu đăng nhập | Role |
|-------|-------|--------------------|------|
| `/noi-bo/don-hang` | Danh sách đơn chờ thanh toán | ✅ | Nhân viên |

> **Lưu ý:** Routes cần được xác minh trong code.

---

## 4. Danh sách màn hình

| STT | Màn hình | Mô tả |
|-----|----------|-------|
| 1 | **Danh sách đơn chờ thanh toán** | Danh sách đơn `HOAN_THANH`. Hiển thị: mã đơn, bàn, thời gian, tổng tiền, trạng thái. |
| 2 | **Chi tiết đơn + thanh toán** | Danh sách món, tổng tiền, voucher (nếu có), tổng sau giảm, phương thức thanh toán, nút xác nhận. |
| 3 | **Xác nhận thanh toán** | Dialog xác nhận: tổng tiền, phương thức, voucher. Nút "Xác nhận thanh toán". |
| 4 | **Hóa đơn** | Hóa đơn thanh toán: thông tin nhà hàng, đơn, tổng, thanh toán, thời gian. Nút "In hóa đơn". |

---

## 5. Thành phần giao diện

### 5.1 Danh sách đơn chờ thanh toán

| Thành phần | Mô tả |
|------------|-------|
| Header | "Thu ngân — Đơn chờ thanh toán" |
| Badge số đơn | Số lượng đơn `HOAN_THANH` chờ |
| Card đơn | Mã đơn, bàn, thời gian, số món, tổng tiền, nút "Thanh toán" |
| Sort | Mặc định: thời gian tạo ASC |
| Auto-refresh | Tự động refresh mỗi 10 giây |
| Filter | Tất cả / Chờ thanh toán / Đã thanh toán / Hủy |

### 5.2 Chi tiết đơn + thanh toán

| Thành phần | Mô tả |
|------------|-------|
| Thông tin đơn | Mã đơn, bàn, thời gian, nhân viên tạo đơn |
| Danh sách món | Tên món, số lượng, đơn giá, thành tiền |
| Tổng tiền (trước giảm) | Hiển thị tổng |
| Chọn voucher | Select: voucher khả dụng của khách (nếu có MaKH). Hiển thị mã + giá trị giảm |
| Tổng tiền (sau giảm) | Bold. Tổng - giá trị voucher. ≥ 0 |
| Phương thức thanh toán | Radio: Tiền mặt / Chuyển khoản |
| Nhập số tiền khách đưa | Number input. Chỉ hiện khi chọn "Tiền mặt". Tự tính tiền thừa |
| Tiền thừa | Tự tính: Tiền khách đưa - Tổng sau giảm. Hiển thị khi tiền mặt |
| QR chuyển khoản | Hiển thị QR code (nếu chọn chuyển khoản). Mã QR chứa thông tin chuyển khoản |
| Nút "Xác nhận thanh toán" | Disabled nếu form invalid |

### 5.3 Dialog xác nhận

| Thành phần | Mô tả |
|------------|-------|
| Tổng tiền | Bold |
| Phương thức | Tiền mặt / Chuyển khoản |
| Voucher | Mã voucher (nếu có) |
| Nút "Xác nhận" | Gọi API thanh toán |
| Nút "Quay lại" | Đóng dialog |

### 5.4 Hóa đơn

| Thành phần | Mô tả |
|------------|-------|
| Header | Tên nhà hàng, địa chỉ, SĐT |
| Mã đơn | Mã DonHang |
| Danh sách món | Tên, SL, đơn giá, thành tiền |
| Tổng tiền | |
| Giảm giá (voucher) | Nếu có |
| Tổng thanh toán | |
| Phương thức | Tiền mặt / Chuyển khoản |
| Thời gian thanh toán | |
| Nút "In hóa đơn" | Print dialog |
| Nút "Đóng" | Đóng hóa đơn |

---

## 6. Dữ liệu hiển thị

### 6.1 Danh sách đơn chờ thanh toán (GET `/api/don-hang/thu-ngan`)

```typescript
// Query params: page, limit, TrangThai
// Response 200
{
  data: DonHangThuNgan[];
  total: number;
}

// DonHangThuNgan object
{
  MaDonHang: string;
  MaBan: string;
  TenBan: string;
  MaKH?: string;          // Null nếu khách vãng lai
  HoTenKhach?: string;
  NgayTao: string;
  TongTien: number;
  TrangThai: "HOAN_THANH" | "DA_THANH_TOAN" | "DA_HUY";
}
```

### 6.2 Áp dụng voucher (GET `/api/voucher/khach-hang/:maKH`)

```typescript
// Query params: MaDonHang (để check điều kiện đơn tối thiểu)
// Response 200
{
  data: VoucherKhachHang[];
}

// VoucherKhachHang object
{
  MaVoucher: string;
  MaKhuyenMai: string;
  TenChuongTrinh: string;
  GiaTriGiam: number;     // Số tiền giảm (đã tính)
  DieuKienApDung: string; // "Đơn tối thiểu 200000đ"
  NgayHetHan: string;
  TrangThai: "KHADUNG" | "DA_SU_DUNG" | "HET_HAN";
}
```

### 6.3 Xác nhận thanh toán (POST `/api/ban/:maBan/xac-nhan-thanh-toan`)

```typescript
// Request body
{
  MaDonHang: string;      // Bắt buộc
  PhuongThucThanhToan: "TIEN_MAT" | "CHUYEN_KHOAN";
  MaVoucher?: string;     // Nếu áp dụng voucher
  SoTienKhachDua?: number; // Chỉ khi tiền mặt
}

// Response 201
{
  MaThanhToan: string;
  MaDonHang: string;
  PhuongThucThanhToan: "TIEN_MAT" | "CHUYEN_KHOAN";
  SoTien: number;         // Tổng sau giảm
  MaVoucher?: string;
  GiaTriGiam?: number;
  TrangThai: "THANH_CONG";
  NgayThanhToan: string;  // ISO 8601
  TienThua?: number;      // Chỉ khi tiền mặt
}
```

### 6.4 Cập nhật trạng thái DonHang (tự động sau thanh toán)

```typescript
// Backend tự động cập nhật:
// DonHang.TrangThai → DA_THANH_TOAN
// Ban.TrangThai → DANG_DON
```

---

## 7. Form nhập liệu

### 7.1 Chọn voucher

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Voucher | Select | Tùy chọn. Chỉ hiện voucher `KHADUNG` | Nếu khách không có voucher → bỏ trống |

### 7.2 Phương thức thanh toán

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Phương thức | Radio | Bắt buộc. `TIEN_MAT` hoặc `CHUYEN_KHOAN` | Mặc định: `TIEN_MAT` |
| Số tiền khách đưa | Number | ≥ Tổng sau giảm. Bắt buộc khi `TIEN_MAT` | Tự tính tiền thừa |

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động | Khi nào disabled |
|-----|--------|----------|-----------------|
| **Thanh toán** | Card đơn `HOAN_THANH` | Mở trang chi tiết + thanh toán | — |
| **Xác nhận thanh toán** | Trang thanh toán | POST `/api/ban/:maBan/xac-nhan-thanh-toan` | Chưa chọn phương thức, tiền mặt nhưng chưa nhập số tiền, đang loading |
| **Quay lại** | Dialog xác nhận | Đóng dialog | — |
| **In hóa đơn** | Trang hóa đơn | Print dialog | — |
| **Đóng** | Trang hóa đơn | Đóng, quay về danh sách | — |

---

## 9. API liên quan

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/don-hang/thu-ngan` | Nhân viên (Thu ngân) | Query: `page`, `limit`, `TrangThai` | `{ data: DonHangThuNgan[], total }` | Danh sách đơn chờ |
| `GET` | `/api/don-hang/:maDonHang` | Nhân viên (Thu ngân) | `maDonHang` (path) | `DonHang` + `ChiTietDonHang` | Chi tiết đơn |
| `GET` | `/api/voucher/khach-hang/:maKH` | Nhân viên (Thu ngân) | `maKH`, query: `MaDonHang` | `{ data: VoucherKhachHang[] }` | Voucher khả dụng |
| `POST` | `/api/ban/:maBan/xac-nhan-thanh-toan` | Nhân viên | `ThanhToanDto` | `ThanhToan` (201) | Xác nhận thanh toán — **chỉ Thu ngân** |
| `PATCH` | `/api/don-hang/:maDonHang/status` | Nhân viên | `{ TrangThai: "DA_THANH_TOAN" }` | `DonHang` (200) | Tự động sau thanh toán |
| `PATCH` | `/api/ban/:maBan/trang-thai` | Nhân viên | `{ TrangThai: "DANG_DON" }` | `Ban` (200) | Tự động sau thanh toán |

> **Lưu ý:** `POST /api/ban/:maBan/xac-nhan-thanh-toan` là endpoint quan trọng nhất — **chỉ Thu ngân mới có quyền**.  
> Backend tự cập nhật `DonHang.TrangThai → DA_THANH_TOAN` và `Ban.TrangThai → DANG_DON` sau khi thanh toán thành công.

---

## 10. Luồng xử lý chính

```
1. Thu ngân đăng nhập (VaiTro: NHAN_VIEN, ChucNangPhu: THU_NGAN)
   → Vào trang `/noi-bo/don-hang`

2. Hiển thị danh sách đơn `HOAN_THANH` chờ thanh toán
   → Auto-refresh mỗi 10 giây

3. Thu ngân chọn đơn → xem chi tiết:
   - Danh sách món + thành tiền
   - Tổng tiền
   - Thông tin khách (nếu có MaKH)

4. Nếu khách có MaKH:
   a. Gọi GET /api/voucher/khach-hang/:maKH?MaDonHang=...
   b. Hiển thị danh sách voucher khả dụng
   c. Thu ngân chọn voucher (nếu có) → tổng tiền giảm

5. Thu ngân chọn phương thức thanh toán:
   a. Tiền mặt:
      - Nhập số tiền khách đưa
      - Tự tính tiền thừa
      - Disabled nút "Xác nhận" nếu số tiền < tổng sau giảm
   b. Chuyển khoản:
      - Hiển thị QR code (mã QR chứa thông tin chuyển khoản)
      - Chờ xác nhận đã nhận tiền

6. Nhấn "Xác nhận thanh toán" → dialog xác nhận

7. Nhấn "Xác nhận" trong dialog → POST `/api/ban/:maBan/xac-nhan-thanh-toan`
   Body: {
     MaDonHang: "DH001234",
     PhuongThucThanhToan: "TIEN_MAT",
     MaVoucher: "VC001" | null,
     SoTienKhachDua: 500000
   }

8. Backend xử lý:
   a. Validate MaDonHang tồn tại, TrangThai = HOAN_THANH
   b. Validate MaVoucher (nếu có): tồn tại, KHADUNG, điều kiện đơn tối thiểu
   c. Tính tổng sau giảm
   d. Tạo ThanhToan (TrangThai: THANH_CONG)
   e. Cập nhật DonHang.TrangThai → DA_THANH_TOAN
   f. Cập nhật Ban.TrangThai → DANG_DON
   g. Nếu dùng voucher → cập nhật Voucher.TrangThai → DA_SU_DUNG
   h. Trả 201 với thông tin thanh toán

9. Hiển thị hóa đơn → nút "In hóa đơn"
```

---

## 11. Luồng thay thế

### 11.1 Khách vãng lai (không có MaKH)

```
1. DonHang.MaKH = null
2. Không hiển thị phần chọn voucher
3. Thu ngân tính tổng tiền, thanh toán tiền mặt
4. Không lưu thông tin khách trên hóa đơn
```

### 11.2 Khách có voucher nhưng không dùng

```
1. Thu ngân bỏ qua phần voucher
2. Thanh toán bình thường với tổng tiền gốc
3. Voucher vẫn giữ trạng thái KHADUNG (chưa dùng)
```

### 11.3 Thanh toán chuyển khoản — chờ xác nhận

```
1. Thu ngân chọn "Chuyển khoản" → hiển thị QR
2. Khách quét QR → chuyển tiền
3. Thu ngân xác nhận đã nhận tiền (nút "Xác nhận đã nhận")
4. POST `/api/ban/:maBan/xac-nhan-thanh-toan` với PhuongThucThanhToan = CHUYEN_KHOAN
5. Hệ thống xử lý như thanh toán tiền mặt
```

### 11.4 Hủy thanh toán (trường hợp đặc biệt)

```
1. Nếu đã tạo ThanhToan nhưng cần hủy:
   - PATCH `/api/don-hang/:maDonHang/status` → `DA_HUY` (nếu cần)
   - Hoặc liên hệ admin (FEAT-06)
2. Hệ thống không có flow hủy thanh toán tự động
3. Thu ngân cần liên hệ admin để xử lý ngoại lệ
```

---

## 12. Luồng lỗi

| Mã lỗi | Thông báo | Hành động |
|---------|----------|----------|
| 400 - Đơn chưa sẵn sàng | "Đơn này chưa hoàn thành. Không thể thanh toán." | Reload danh sách |
| 400 - Voucher không hợp lệ | "Voucher không khả dụng hoặc đã hết hạn." | Bỏ chọn voucher |
| 400 - Voucher không đạt điều kiện | "Đơn hàng chưa đạt điều kiện tối thiểu của voucher." | Chọn voucher khác hoặc bỏ |
| 400 - Số tiền不足 | "Số tiền khách đưa không đủ." | Nhập lại số tiền |
| 401 - Token hết hạn | "Phiên đã hết hạn." | Redirect đăng nhập |
| 403 - Không có quyền | "Bạn không có quyền thanh toán." | — |
| 404 - Không tìm thấy | "Không tìm thấy đơn." | Reload danh sách |
| 409 - Đơn đã thanh toán | "Đơn này đã được thanh toán." | Reload danh sách |
| 500 - Lỗi server | "Đã xảy ra lỗi." | Retry |

---

## 13. Trạng thái thay đổi

### 13.1 DonHang

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Actor |
|--------------------|---------|---------------------|-------|
| `HOAN_THANH` | Thu ngân xác nhận thanh toán | `DA_THANH_TOAN` | Nhân viên (Thu ngân) |
| `DANG_CHUAN_BI` | Hủy đơn | `DA_HUY` | Nhân viên (Phục vụ) / Admin |

> **CHỈ** Thu ngân mới có quyền chuyển `HOAN_THANH` → `DA_THANH_TOAN`.  
> Không ai khác (Nhân viên Phục vụ, Bếp, Admin) có quyền này.

### 13.2 Ban

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| `CO_KHACH` | Thu ngân xác nhận thanh toán | `DANG_DON` | Bàn cần dọn dẹp |
| `DANG_DON` | Nhân viên Phục vụ dọn xong | `TRONG` | Bàn sẵn sàng |

### 13.3 ThanhToan

```
[khởi tạo] ──POST /api/ban/:maBan/xac-nhan-thanh-toan──▶ THANH_CONG
                                       │
                    ┌──────────────────┤
                    ▼                  ▼
              THAT_BAI           DA_HOAN_TIEN
           (lỗi thanh toán)     (hoàn tiền sau khi đã thanh toán)
```

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| *(khởi tạo)* | `POST /api/ban/:maBan/xac-nhan-thanh-toan` | `THANH_CONG` | Thanh toán thành công |
| `THANH_CONG` | Hoàn tiền (admin) | `DA_HOAN_TIEN` | Trường hợp ngoại lệ |

### 13.4 Voucher

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| `KHADUNG` | Khách dùng voucher khi thanh toán | `DA_SU_DUNG` | Tự động sau POST `/api/ban/:maBan/xac-nhan-thanh-toan` |

---

## 14. Phân quyền

| Vai trò | Quyền truy cập | Ghi chú |
|---------|----------------|---------|
| **Nhân viên (Thu ngân)** | Toàn bộ luồng: xem đơn, voucher, thanh toán, in hóa đơn | JWT `VaiTro = NHAN_VIEN`, `ChucNangPhu = THU_NGAN` |
| **Nhân viên (Phục vụ)** | KHÔNG có quyền thanh toán | FEAT-03 |
| **Nhân viên (Bếp)** | KHÔNG có quyền thanh toán | FEAT-04 |
| **Admin** | Xem tất cả thanh toán, quản lý voucher, hoàn tiền | FEAT-06 |

> **Quan trọng:** Quyền thanh toán là **duy nhất** cho Thu ngân.  
> Endpoint `POST /api/ban/:maBan/xac-nhan-thanh-toan` phải check quyền Thu ngân.

---

## 15. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | Thu ngân đăng nhập → vào `/noi-bo/don-hang`, xem danh sách đơn `HOAN_THANH` | Manual |
| AC-02 | Đơn `HOAN_THANH` → hiển thị nút "Thanh toán" | Manual |
| AC-03 | Chọn tiền mặt → nhập số tiền khách đưa → tự tính tiền thừa | Manual |
| AC-04 | Nhập số tiền不足 → nút "Xác nhận" disabled | Manual |
| AC-05 | Chọn chuyển khoản → hiển thị QR code | Manual |
| AC-06 | Áp dụng voucher → tổng tiền giảm đúng | Manual |
| AC-07 | Voucher không đạt điều kiện → lỗi "Đơn chưa đạt tối thiểu" | Manual |
| AC-08 | Xác nhận thanh toán → `DonHang` → `DA_THANH_TOAN` | Manual |
| AC-09 | Sau thanh toán → `Ban` → `DANG_DON` | Manual |
| AC-10 | Hóa đơn hiển thị đúng thông tin: danh sách món, tổng, giảm giá, thanh toán | Manual |
| AC-11 | Nhân viên Phục vụ KHÔNG có quyền truy cập `/noi-bo/don-hang` (thanh toán) | Manual |
| AC-12 | Nhân viên Bếp KHÔNG có quyền thanh toán | Manual |
| AC-13 | Trạng thái `SAN_SANG`, `DA_PHUC_VU` KHÔNG xuất hiện trong code | Code review |

---

## 16. Checklist đối chiếu code hiện tại

### Routes

| Route | Tồn tại? | Component | Ghi chú |
|-------|----------|-----------|---------|
| `/noi-bo/don-hang` | ✅ | `DonHangNoiBo` | Danh sách đơn — frontend hiển thị đơn `HOAN_THANH` cho thu ngân |

### API endpoints

| Endpoint | Tồn tại? | Controller | Ghi chú |
|----------|----------|-----------|---------|
| `GET /api/don-hang` | ✅ | `don-hang.controller.ts` | Danh sách đơn — frontend lọc `HOAN_THANH` cho thu ngân |
| `POST /api/ban/:maBan/xac-nhan-thanh-toan` | ✅ | `ban.controller.ts` | Xác nhận thanh toán — cần check quyền Thu ngân |

### Enum / State — **QUAN TRỌNG**

| Trạng thái cấm | Xuất hiện trong code? | File | Ghi chú |
|----------------|----------------------|------|---------|
| `CHO_XU_LY` | ❌ | — | ✅ OK |
| `DANG_CHE_BIEN` | ❌ | — | ✅ OK |
| **`SAN_SANG`** | ❌ | — | ✅ OK — **phải dùng `HOAN_THANH`** |
| **`DA_PHUC_VU`** | ❌ | — | ✅ OK — **dùng cho ChiTietDonHang, KHÔNG dùng cho DonHang** |
| `DA_DEN` | ❌ | — | ✅ OK |

### Kiểm tra code cụ thể

```bash
# Trạng thái cũ trong backend
rg "SAN_SANG" backend/nest-api/src/modules/ --no-heading
rg "DA_PHUC_VU" backend/nest-api/src/modules/ --no-heading

# Trạng thái cũ trong frontend
rg "SAN_SANG" frontend/src/ --no-heading
rg "DA_PHUC_VU" frontend/src/ --no-heading
```

### Phân quyền

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| `@UseGuards(AuthGuard)` trên route thu ngân | ⚠️ | Cần xác minh |
| `VaiTro` check = `NHAN_VIEN` | ⚠️ | Cần xác minh |
| `ChucNangPhu` check = `THU_NGAN` | ⚠️ | **Cần kiểm tra** |
| `POST /api/ban/:maBan/xac-nhan-thanh-toan` check quyền Thu ngân | ⚠️ | **Quan trọng — kiểm tra** |

### Tích hợp với FEAT khác

| FEAT | Mối liên hệ |
|------|-------------|
| FEAT-01 | QR ordering → tạo DonHang → khi HOAN_THANH → Thu ngân thanh toán |
| FEAT-02 | DatBan → khách có thể có voucher |
| FEAT-03 | Phục vụ chuyển `DANG_PHUC_VU` → `HOAN_THANH` → đơn chờ thanh toán |
| FEAT-04 | Bếp hoàn thành → ChiTietDonHang `HOAN_THANH` → DonHang `HOAN_THANH` |
| FEAT-06 | Admin quản lý voucher, xem báo cáo thanh toán |
| FEAT-07 | State machines chuẩn |

---

*Ghi chú: Thu ngân là người cuối cùng xác nhận thanh toán. `POST /api/ban/:maBan/xac-nhan-thanh-toan` PHẢI check quyền Thu ngân. Sau thanh toán: DonHang → DA_THANH_TOAN, Ban → DANG_DON. Trạng thái `SAN_SANG` và `DA_PHUC_VU` KHÔNG dùng cho DonHang — chỉ dùng cho ChiTietDonHang.*
