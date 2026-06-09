# FEAT-01: Khách hàng — Đặt hàng QR công khai (không đăng nhập)

> **Phạm vi:** Trải nghiệm khách hàng quét QR tại bàn → xem thực đơn → thêm/xóa giỏ hàng → gửi đơn → theo dõi trạng thái.  
> **Không bao gồm:** Đặt bàn, tài khoản, voucher, đánh giá — xem FEAT-02.

---

## 1. Mục tiêu

- Cho phép khách hàng tại bàn quét mã QR để xem thực đơn, thêm món vào giỏ hàng, gửi đơn đặt hàng mà **không cần đăng nhập**.
- Hệ thống tự xác định bàn thông qua `MaBan` có trong query string của URL QR.
- Khách có thể theo dõi trạng thái đơn hàng real-time (polling).
- Đảm bảo mỗi đơn hàng đều gắn với `MaBan`.

---

## 2. Actor sử dụng

| Actor | Vai trò | Ghi chú |
|-------|---------|---------|
| **Khách hàng** | Diễn viên chính | Quét QR tại bàn, đặt hàng, theo dõi đơn |

**Không có nhân viên trong luồng này.** Nhân viên can thiệp qua FEAT-03/04/05.

---

## 3. Route / Trang

| Route | Trang | Yêu cầu đăng nhập |
|-------|-------|--------------------|
| `/ban/:maBan` | Trang chủ thực đơn theo bàn (QR landing) | **Không** |
| `/ban/:maBan/goi-mon` | Gọi món / xem thực đơn theo bàn | **Không** |
| `/thuc-don` | Danh mục thực đơn (public) | **Không** |
| `/gio-hang` | Giỏ hàng / Xem trước đơn | **Không** |

> **Ghi chú:** QR code tại bàn chứa URL `/ban/:maBan` hoặc `/ban/:maBan/goi-mon`.  
> **KHÔNG** có route `/don-hang/tao` hoặc `/don-hang/:maDonHang` — khách theo dõi trạng thái ngay trên trang gọi món.

---

## 4. Danh sách màn hình

| STT | Màn hình | Mô tả |
|-----|----------|-------|
| 1 | **Trang chủ (QR Landing)** | Hiển thị danh mục + món ăn theo danh mục. Có header hiển thị tên bàn / mã bàn. |
| 2 | **Chi tiết món ăn** | Modal / overlay hiển thị tên, mô tả, giá, ảnh, nút "Thêm vào giỏ". |
| 3 | **Giỏ hàng** | Danh sách món đã chọn, số lượng, thành tiền từng món, tổng cộng. Cho phép sửa số lượng / xóa món. Nút "Gửi đơn hàng". |
| 4 | **Xác nhận đơn** | Dialog xác nhận trước khi gửi (danh sách món + tổng tiền). |
| 5 | **Theo dõi trạng thái đơn** | Hiển thị trạng thái hiện tại: `DANG_CHUAN_BI` → `DANG_PHUC_VU` → `HOAN_THANH`. Tự động cập nhật mỗi 5 giây. |

---

## 5. Thành phần giao diện

### 5.1 Header / Navigation bar

| Thành phần | Mô tả |
|------------|-------|
| Logo / tên nhà hàng | Bên trái, link về trang chủ |
| Thông tin bàn | Hiển thị `MaBan` hoặc "Bàn X" — **readonly**, lấy từ query string |
| Icon giỏ hàng | Badge hiển thị số lượng món đang chọn |

### 5.2 Thanh tìm kiếm

| Thành phần | Mô tả |
|------------|-------|
| Input tìm kiếm | Tìm theo tên món. Debounce 300ms. Placeholder: "Tìm món..." |
| Nút xóa | Xóa nội dung tìm kiếm |

### 5.3 Bộ lọc danh mục

| Thành phần | Mô tả |
|------------|-------|
| Tabs / chips danh mục | Hiển thị tất cả danh mục. Chọn 1 danh mục để lọc. Tab "Tất cả" mặc định. |
| Badge số lượng | Hiển thị số lượng món trong mỗi danh mục (tùy chọn) |

### 5.4 Card món ăn

| Thành phần | Mô tả |
|------------|-------|
| Ảnh món | Thumbnail vuông bo tròn góc |
| Tên món | In đậm, 1-2 dòng, ellipsis |
| Giá | Format tiền Việt, màu nổi bật |
| Nút "+" (Thêm vào giỏ) | Nếu món đã có trong giỏ → hiển thị stepper ± thay vì nút + đơn |
| Nhãn "Hết hàng" | Nếu `TrangThai` = `HET` — nút thêm bị disabled |

### 5.5 Giỏ hàng (Cart)

| Thành phần | Mô tả |
|------------|-------|
| Danh sách món | Mỗi dòng: ảnh nhỏ + tên + giá + stepper số lượng + thành tiền |
| Nút xóa món | Icon thùng rác trên mỗi dòng |
| Tổng cộng | Bold, tính real-time |
| Nút "Gửi đơn hàng" | Disabled nếu giỏ trống. Enabled khi có ≥ 1 món. |
| Ghi chú món | Cho phép nhập ghi chú riêng cho từng món (ví dụ: "Ít cay", "Không hành") |

### 5.6 Dialog xác nhận

| Thành phần | Mô tả |
|------------|-------|
| Tiêu đề | "Xác nhận đặt hàng" |
| Danh sách món | Tổng hợp số lượng + giá |
| Tổng tiền | In đậm |
| Nút "Xác nhận" | Gọi API tạo đơn |
| Nút "Quay lại" | Đóng dialog, quay về giỏ hàng |

### 5.7 Theo dõi trạng thái

| Thành phần | Mô tả |
|------------|-------|
| Stepper trạng thái | 3 bước: `DANG_CHUAN_BI` → `DANG_PHUC_VU` → `HOAN_THANH` |
| Thời gian đặt | Hiển thị thời gian tạo đơn |
| Danh sách món | Tóm tắt các món đã đặt |
| Tổng tiền | Hiển thị tổng |

---

## 6. Dữ liệu hiển thị

### 6.1 Danh sách món ăn (GET `/api/thuc-don`)

```typescript
// Response 200
{
  data: MonAn[];
  total: number;
  page: number;
  limit: number;
}

// MonAn object
{
  MaMonAn: string;        // "MON001"
  TenMonAn: string;       // "Phở bò tái"
  MoTa: string;           // "Phở bò truyền thống"
  GiaHienTai: number;     // 85000
  HinhAnh: string;        // URL ảnh
  MaDanhMuc: string;      // "DM001"
  TrangThai: "CON_HANG" | "HET" | "NGUNG_BAN";
  DanhMuc: {
    MaDanhMuc: string;
    TenDanhMuc: string;
  };
}
```

### 6.2 Chi tiết bàn (GET `/api/ban/:maBan`)

```typescript
// Response 200
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

### 6.3 Tạo đơn hàng (POST `/api/ban/:maBan/order`)

```typescript
// Request body
{
  MaBan: string;          // Bắt buộc — từ query string QR
  GhiChuDonHang?: string;
  ChiTietDonHang: {
    MaMonAn: string;
    SoLuong: number;      // ≥ 1
    GhiChu?: string;      // Ghi chú món (Ít cay, Không hành...)
  }[];
}

// Response 201
{
  MaDonHang: string;      // "DH001234"
  MaBan: string;
  TrangThai: "DANG_CHUAN_BI";
  NgayTao: string;        // ISO 8601
  TongTien: number;
  ChiTietDonHang: ChiTietDonHangItem[];
}
```

### 6.4 Theo dõi trạng thái (GET `/api/ban/:maBan/order`)

```typescript
// Response 200
{
  data: {
    MaDonHang: string;
    MaBan: string;
    TrangThai: "DANG_CHUAN_BI" | "DANG_PHUC_VU" | "HOAN_THANH" | "DA_THANH_TOAN" | "DA_HUY";
    NgayTao: string;
    TongTien: number;
    ChiTietDonHang: {
      MaMonAn: string;
      TenMonAn: string;
      SoLuong: number;
      DonGia: number;
      ThanhTien: number;
      TrangThai: "DANG_CHUAN_BI" | "DANG_PHUC_VU" | "HOAN_THANH";
      GhiChu?: string;
    }[];
  }
}
```

> **Lưu ý:** Khách hàng tra cứu trạng thái đơn theo bàn (MaBan), không theo mã đơn hàng.

---

## 7. Form nhập liệu

### 7.1 Giỏ hàng — Thêm/Sửa món

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Số lượng | Number (stepper) | Min: 1, Max: 99 | Bước nhảy: 1 |
| Ghi chú món | Text | Max 200 ký tự | Tùy chọn. Placeholder: "Ghi chú cho món này..." |

### 7.2 Dialog xác nhận

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Ghi chú đơn | Textarea | Max 500 ký tự | Tùy chọn. Placeholder: "Yêu cầu đặc biệt cho đơn hàng..." |

> **Không có form đăng nhập/đăng ký** trong luồng này — đây là luồng công khai.

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động | Khi nào disabled |
|-----|--------|----------|-----------------|
| **Thêm vào giỏ** | Card món | Thêm 1 món vào giỏ | Món hết hàng (`TrangThai = HET`) |
| **Stepper +/-** | Card món / Cart item | Tăng/giảm số lượng | `-` disabled khi số lượng = 1 |
| **Xóa món** | Cart item | Xóa món khỏi giỏ | Giỏ trống |
| **Gửi đơn hàng** | Bottom giỏ hàng | Mở dialog xác nhận | Giỏ trống |
| **Xác nhận** | Dialog | Gọi API tạo đơn | Đang loading |
| **Quay lại** | Dialog | Đóng dialog | — |

---

## 9. API liên quan

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/ban/:maBan` | Public | `maBan` (path) | `Ban` object | Lấy thông tin bàn từ QR |
| `GET` | `/api/thuc-don` | Public | Query: `page`, `limit` | `{ data: MonAn[], total }` | Lấy danh sách món ăn |
| `POST` | `/api/ban/:maBan/order` | Public (guest) | `maBan` (path) + `DonHangCreateDto` | `DonHang` (201) | Tạo đơn cho bàn |
| `GET` | `/api/ban/:maBan/order` | Public (guest) | `maBan` (path) | `DonHang` + `ChiTietDonHang` | Xem trạng thái đơn theo bàn |

> **Lưu ý:** Tất cả endpoint trên đều public — không yêu cầu token.  
> `POST /api/ban/:maBan/order` **lấy MaBan từ URL path** — không cần truyền trong body.

---

## 10. Luồng xử lý chính

```
1. Khách quét QR tại bàn
   → URL: https://domain.com/?maBan=BAN01
   → Frontend lấy MaBan từ query string
   → Gọi GET /api/ban/:maBan để xác nhận bàn hợp lệ

2. Nếu bàn không tồn tại hoặc đang bảo trì → hiển thị thông báo lỗi, KHÔNG cho đặt

3. Trang chủ load → Gọi GET /api/thuc-don để lấy danh sách món ăn

4. Khách chọn danh mục → lọc món theo danh mục (client-side hoặc query param MaDanhMuc)

5. Khách chọn món → mở modal chi tiết → chọn số lượng → "Thêm vào giỏ"
   → Cart state được lưu trong localStorage (key: `cart_<MaBan>`)

6. Khách vào giỏ hàng → xem lại danh sách món, sửa số lượng, thêm ghi chú

7. Khách nhấn "Gửi đơn hàng" → dialog xác nhận

8. Khách nhấn "Xác nhận" → POST /api/ban/:maBan/order với body:
   {
     MaBan: "BAN01",
     ChiTietDonHang: [
       { MaMonAn: "MON001", SoLuong: 2, GhiChu: "Ít cay" },
       { MaMonAn: "MON003", SoLuong: 1 }
     ]
   }

9. Backend xử lý:
   a. Validate MaBan tồn tại, bàn không ở trạng thái BAO_TRI
   b. Validate từng MaMonAn tồn tại, còn hàng
   c. Tính tổng tiền từ GiaHienTai × SoLuong
   d. Tạo DonHang (TrangThai: DANG_CHUAN_BI)
   e. Tạo ChiTietDonHang cho từng món (TrangThai: DANG_CHUAN_BI)
   f. Cập nhật bàn: TrangThai → CO_KHACH (nếu TRONG)
   g. Trả về DonHang object (201)

10. Frontend chuyển sang trang theo dõi trạng thái
    → Hiển thị stepper: DANG_CHUAN_BI → DANG_PHUC_VU → HOAN_THANH
     → Polling GET /api/ban/:maBan/order mỗi 10 giây

11. Khi nhân viên/bếp cập nhật trạng thái (FEAT-03/04):
    → DANG_CHUAN_BI: Bếp đang chuẩn bị
    → DANG_PHUC_VU: Nhân viên đang phục vụ / món đang được mang ra
    → HOAN_THANH: Đã phục vụ xong

12. Đơn hàng hoàn thành → hiển thị thông báo "Đơn hàng đã hoàn thành!"
    → Xóa cart khỏi localStorage
```

---

## 11. Luồng thay thế

### 11.1 Bàn không tồn tại / đang bảo trì

```
1. GET /api/ban/:maBan trả 404 hoặc TrangThai = BAO_TRI
2. Hiển thị thông báo: "Bàn này hiện không khả dụng. Vui lòng liên hệ nhân viên."
3. KHÔNG hiển thị thực đơn, KHÔNG cho đặt hàng
```

### 11.2 Món ăn hết hàng

```
1. Món có TrangThai = "HET"
2. Card món hiển thị nhãn "Hết hàng"
3. Nút "Thêm vào giỏ" bị disabled
4. Nếu món đã có trong giỏ khi hết hàng → hiển thị thông báo "Món này vừa hết hàng"
```

### 11.3 Khách muốn thêm món sau khi đã đặt đơn

```
1. Trang theo dõi trạng thái có nút "Thêm món"
2. Quay về trang thực đơn, thêm món mới
3. Tạo đơn hàng mới (DonHang mới) gắn cùng MaBan
   → KHÔNG merge vào đơn cũ (mỗi lần "Gửi đơn" = 1 DonHang mới)
```

### 11.4 Lỗi mạng / API fail

```
1. Hiển thị toast: "Không thể kết nối server. Vui lòng thử lại."
2. Giữ nguyên state giỏ hàng (localStorage)
3. Retry thủ công khi khách nhấn lại
```

---

## 12. Luồng lỗi

| Mã lỗi | Thông báo | Hành động |
|---------|----------|----------|
| 400 - Thiếu MaBan | "Thiếu thông tin bàn. Vui lòng quét lại mã QR." | Quay về trang chủ |
| 400 - MaMonAn không hợp lệ | "Món '{tên}' không tồn tại trong thực đơn." | Xóa món khỏi giỏ, thông báo |
| 400 - Món hết hàng | "Món '{tên}' vừa hết hàng. Vui lòng chọn món khác." | Cập nhật trạng thái món |
| 404 - Bàn không tồn tại | "Bàn này không tồn tại." | Hiển thị lỗi, KHÔNG cho đặt |
| 409 - Bàn đang bảo trì | "Bàn này đang bảo trì. Vui lòng chọn bàn khác." | Hiển thị lỗi |
| 500 - Lỗi server | "Đã xảy ra lỗi. Vui lòng thử lại sau." | Retry thủ công |

---

## 13. Trạng thái thay đổi

### 13.1 Đơn hàng (`DonHang`)

```
[khởi tạo] ──POST /api/ban/:maBan/order──▶ DANG_CHUAN_BI
                                        │
                    ┌────────────────────┤
                    ▼                    ▼
              DANG_PHUC_VU           DA_HUY
                    │              (khách/hủy tự động)
                    ▼
              HOAN_THANH
                    │
                    ▼
              DA_THANH_TOAN
           (sau khi thu ngân xác nhận — FEAT-05)
```

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| *(khởi tạo)* | `POST /api/ban/:maBan/order` | `DANG_CHUAN_BI` | Khi tạo đơn mới |
| `DANG_CHUAN_BI` | Nhân viên/Bếp cập nhật (FEAT-03/04) | `DANG_PHUC_VU` | Bếp bắt đầu chế biến / nhân viên phục vụ |
| `DANG_PHUC_VU` | Nhân viên/Bếp cập nhật (FEAT-03/04) | `HOAN_THANH` | Phục vụ xong |
| `HOAN_THANH` | Thu ngân thanh toán (FEAT-05) | `DA_THANH_TOAN` | Khách đã thanh toán |
| `DANG_CHUAN_BI` | Hủy đơn | `DA_HUY` | Chỉ khi chưa bắt đầu chế biến |

### 13.2 Chi tiết đơn hàng (`ChiTietDonHang`)

```
[khởi tạo] ──POST /api/ban/:maBan/order──▶ DANG_CHUAN_BI
                                        │
                    ┌────────────────────┤
                    ▼                    ▼
              DANG_PHUC_VU           DA_HUY
                    │
                    ▼
              HOAN_THANH
```

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo |
|--------------------|---------|---------------------|
| `DANG_CHUAN_BI` | Bếp bắt đầu chế biến | `DANG_PHUC_VU` |
| `DANG_PHUC_VU` | Bếp hoàn thành chế biến | `HOAN_THANH` |
| `DANG_CHUAN_BI` | Hủy món | `DA_HUY` |

### 13.3 Bàn (`Ban`)

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Ghi chú |
|--------------------|---------|---------------------|---------|
| `TRONG` | Tạo đơn hàng mới | `CO_KHACH` | Khách bắt đầu đặt |
| `CO_KHACH` | Thu ngân xác nhận thanh toán | `DANG_DON` | Bàn cần dọn dẹp |
| `DANG_DON` | Nhân viên xác nhận dọn xong | `TRONG` | Bàn sẵn sàng cho khách mới |

---

## 14. Phân quyền

| Vai trò | Quyền truy cập | Ghi chú |
|---------|----------------|---------|
| **Khách hàng (chưa đăng nhập)** | Toàn bộ luồng QR — xem thực đơn, thêm giỏ, đặt đơn, theo dõi trạng thái | **Không cần đăng nhập** |
| **Nhân viên** | Không can thiệp trong luồng này | Can thiệp qua FEAT-03/04/05 |
| **Admin** | Quản lý thực đơn, trạng thái bàn, đơn hàng | Quản trị hệ thống |

> **Quan trọng:** Luồng QR ordering là **công khai** — ai quét QR đều có thể đặt hàng.  
> Không có phân quyền ở đây — khách hàng ẩn danh (anonymous).

---

## 15. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | Khách quét QR với `maBan=BAN01` → trang chủ load thực đơn của nhà hàng, hiển thị thông tin bàn BAN01 | Manual: mở URL `/?maBan=BAN01` |
| AC-02 | Nếu `maBan` không tồn tại → hiển thị thông báo lỗi, KHÔNG cho xem thực đơn | Manual: mở URL `/?maBan=KHONG_TON_TAI` |
| AC-03 | Nếu bàn đang bảo trì (`TrangThai=BAO_TRI`) → hiển thị thông báo "Bàn đang bảo trì" | Manual: test với bàn BAO_TRI |
| AC-04 | Danh sách món chỉ hiển thị món có `TrangThai=CON_HANG` — món `HET` hiển thị nhãn "Hết hàng", nút thêm disabled | Manual: kiểm tra card món |
| AC-05 | Nhập số lượng 0 hoặc âm → validation hiển thị "Số lượng phải ≥ 1" | Manual: thử nhập 0, -1 |
| AC-06 | Nhập số lượng > 99 → validation hiển thị "Số lượng tối đa 99" | Manual: thử nhập 100 |
| AC-07 | Tổng tiền giỏ hàng = tổng (GiaHienTai × SoLuong) cho tất cả món — tính real-time khi thay đổi số lượng | Manual: thêm 2 món, kiểm tra tổng |
| AC-08 | Nhấn "Gửi đơn hàng" → dialog hiển thị danh sách món + tổng tiền, chưa gọi API yet | Manual: kiểm tra dialog |
| AC-09 | Nhấn "Xác nhận" trong dialog → POST /api/ban/:maBan/order với body | Manual: kiểm tra Network tab |
| AC-10 | POST /api/ban/:maBan/order lấy MaBan từ URL path | Manual: thử gửi request |
| AC-11 | Sau khi tạo đơn → chuyển sang trang theo dõi trạng thái, hiển thị stepper 3 bước | Manual: kiểm tra trang redirect |
| AC-12 | Trang trạng thái tự động polling mỗi 5 giây — cập nhật khi nhân viên/bếp thay đổi trạng thái | Manual: mở 2 tab, thay đổi ở tab nhân viên |
| AC-13 | Nếu khách thêm món sau khi đã có đơn → tạo đơn mới (DonHang mới) gắn cùng MaBan, KHÔNG merge đơn cũ | Manual: tạo đơn 1, thêm món, tạo đơn 2 |
| AC-14 | Cart được lưu trong localStorage với key `cart_<MaBan>` — refresh trang không mất giỏ | Manual: thêm món → refresh → kiểm tra giỏ còn |
| AC-15 | Trạng thái `KHONG_DEN` chỉ áp dụng cho `DatBan` (FEAT-02), KHÔNG áp dụng cho `DonHang` | Code review |
| AC-16 | Tất cả enum trạng thái trong file này phải khớp với bảng chuẩn ở FEAT-07 (dùng đúng tên, không biến thể) | So sánh với FEAT-07 |

---

## 16. Checklist đối chiếu code hiện tại

> Kiểm tra từng mục below với code thực tế. Đánh dấu ✅ đã khớp, ❌ khác biệt, ⚠️ cần xác minh, ➖ chưa triển khai.

### Routes (`frontend/src/App.jsx`)

| Route | Tồn tại? | Component | Ghi chú |
|-------|----------|-----------|---------|
| `/ban/:maBan` | ✅ | `TrangChuKhachHang` | QR landing page — xác nhận qua App.jsx |
| `/ban/:maBan/goi-mon` | ✅ | Gọi món | Trang gọi món theo bàn |
| `/thuc-don` | ✅ | `TrangChuKhachHang` | Public menu |
| `/gio-hang` | ✅ | `TrangChuKhachHang` | Giỏ hàng |

### API endpoints (`backend/nest-api/src/modules/`)

| Endpoint | Tồn tại? | Controller | Ghi chú |
|----------|----------|-----------|---------|
| `GET /api/ban/:maBan` | ⚠️ | `ban.controller.ts` | Public? Không có auth guard? |
| `GET /api/thuc-don` | ✅ | `thuc-don.controller.ts` | Public — xác nhận qua api.controller.ts |
| `POST /api/ban/:maBan/order` | ⚠️ | `don-hang.controller.ts` | Kiểm tra endpoint tồn tại trong api.controller.ts |
| `GET /api/ban/:maBan/order` | ⚠️ | `don-hang.controller.ts` | Public? Không yêu cầu auth? |

### Enum / State

| Enum | Giá trị trong code | Giá trị trong spec | Khớp? |
|------|-------------------|-------------------|-------|
| `Ban.TrangThai` | `TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI` | `TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI` | ✅ |
| `DonHang.TrangThai` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_THANH_TOAN, DA_HUY` | ✅ |
| `ChiTietDonHang.TrangThai` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_HUY` | `DANG_CHUAN_BI, DANG_PHUC_VU, HOAN_THANH, DA_HUY` | ✅ |

### Trạng thái cấm (KHÔNG được dùng)

| Trạng thái cấm | Xuất hiện trong code? | File | Ghi chú |
|----------------|----------------------|------|---------|
| `CHO_XU_LY` | ❌ Không tìm thấy | — | ✅ Đúng |
| `CHO_CHE_BIEN` | ❌ Không tìm thấy | — | ✅ Đúng |
| `DANG_CHUAN_BIEN` | ❌ Không tìm thấy | — | ✅ Đúng |
| `DANG_CHE_BIEN` | ❌ Không tìm thấy | — | ✅ Đúng |
| `SAN_SANG` | ❌ Không tìm thấy | — | ✅ Đúng |
| `DA_DEN` | ❌ Không tìm thấy | — | ✅ Đúng |

### Tích hợp với các FEAT khác

| FEAT | Mối liên hệ | Cần kiểm tra |
|------|-------------|-------------|
| FEAT-02 | DatBan — cần xác nhận đơn hàng QR có cần MaDatBan không | ✅ QR ordering không cần DatBan |
| FEAT-03 | Nhân viên phục vụ — cập nhật trạng thái đơn | Cần xác minh API cập nhật trạng thái |
| FEAT-04 | Bếp — chế biến món | Cần xác minh API chuyển trạng thái ChiTietDonHang |
| FEAT-05 | Thu ngân — thanh toán | Cần xác minh flow thanh toán nối tiếp từ QR order |
| FEAT-07 | State machines chuẩn | Cần xác minh các state ở trên khớp với FEAT-07 |

### Trạng thái cũ / không hợp lệ cần xác minh KHÔNG xuất hiện

| Trạng thái | Cần kiểm tra | Kết quả |
|-----------|-------------|---------|
| `CHO_XU_LY` | `rg "CHO_XU_LY" frontend/src/` | ❌ Không tìm thấy — OK |
| `DANG_CHE_BIEN` | `rg "DANG_CHE_BIEN" frontend/src/` | ❌ Không tìm thấy — OK |
| `SAN_SANG` | `rg "SAN_SANG" frontend/src/` | ❌ Không tìm thấy — OK |

> **Kết quả checklist:** Cần chạy `rg` trên toàn bộ `frontend/src/` và `backend/nest-api/src/modules/` để xác nhận.  
> Các trạng thái cũ (`CHO_XU_LY`, `DANG_CHE_BIEN`, `SAN_SANG`) **KHÔNG** được phép sử dụng.

---

*Ghi chú cuối: File này mô tả luồng QR ordering công khai. Tất cả enum trạng thái phải khớp với bảng chuẩn ở FEAT-07. Routes cần được xác minh với code thực tế trước khi triển khai.*
