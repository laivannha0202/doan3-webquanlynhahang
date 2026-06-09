# FEAT-04: Nhân viên — Bếp: Chế biến & quản lý món

> **Phạm vi:** Nhân viên (sub-role: Bếp) xem danh sách đơn cần chế biến, cập nhật trạng thái ChiTietDonHang (`DANG_PHUC_VU` → `HOAN_THANH`).  
> **Liên quan:** FEAT-01 (QR ordering), FEAT-03 (phục vụ tạo đơn), FEAT-05 (thu ngân thanh toán).

---

## 1. Mục tiêu

- Nhân viên phụ trách khu vực bếp xem danh sách đơn hàng đang chờ chế biến.
- Cập nhật trạng thái `ChiTietDonHang` từ `DANG_CHUAN_BI` → `DANG_PHUC_VU` (bắt đầu chế biến) → `HOAN_THANH` (hoàn thành).
- Hủy món (`DA_HUY`) nếu nguyên liệu hết hoặc khách yêu cầu hủy.
- Phân quyền chặt chẽ: chỉ nhân viên có sub-role **Bếp** mới truy cập được.

---

## 2. Actor sử dụng

| Actor | Vai trò | Ghi chú |
|-------|---------|---------|
| **Nhân viên** | Diễn viên chính | Sub-role: **Bếp** — chế biến món, cập nhật trạng thái ChiTietDonHang |

> **Lưu ý:** Actor chính là "Nhân viên". Sub-role "Bếp" xác định quyền hạn cụ thể.

---

## 3. Route / Trang

| Route | Trang | Yêu cầu đăng nhập | Role |
|-------|-------|--------------------|------|
| `/noi-bo/don-hang` | Danh sách đơn cần chế biến | ✅ | Nhân viên |

> **Lưu ý:** Nhân viên bếp xem đơn hàng qua `/noi-bo/don-hang` — frontend lọc trạng thái `DANG_CHUAN_BI` để hiển thị đơn cần chế biến.

---

## 4. Danh sách màn hình

| STT | Màn hình | Mô tả |
|-----|----------|-------|
| 1 | **Danh sách đơn chờ chế biến** | Danh sách đơn `DANG_CHUAN_BI`. Hiển thị: mã đơn, bàn, thời gian, số món chờ. Sắp xếp theo thời gian tạo (cũ nhất lên đầu). |
| 2 | **Chi tiết đơn** | Danh sách món trong đơn + trạng thái từng món. Nút chuyển trạng thái cho từng món riêng biệt. |
| 3 | **Thông báo hoàn thành** | Khi hoàn thành món → thông báo cho nhân viên phục vụ (FEAT-03). |

---

## 5. Thành phần giao diện

### 5.1 Danh sách đơn chờ

| Thành phần | Mô tả |
|------------|-------|
| Header | "Bếp — Đơn cần chế biến" |
| Badge số đơn | Số lượng đơn `DANG_CHUAN_BI` |
| Card đơn | Mã đơn, bàn, thời gian tạo, số món chờ chế biến, thời gian chờ |
| Sort | Mặc định: thời gian tạo ASC (đơn cũ nhất lên đầu) |
| Auto-refresh | Tự động refresh mỗi 10 giây |
| Filter | Tất cả / Đang chờ / Đang chế biến / Hoàn thành |

### 5.2 Chi tiết đơn

| Thành phần | Mô tả |
|------------|-------|
| Thông tin đơn | Mã đơn, bàn, thời gian tạo, ghi chú đơn |
| Danh sách món | Mỗi dòng: tên món, số lượng, đơn giá, trạng thái, nút thao tác |
| Badge trạng thái món | `DANG_CHUAN_BI` = đỏ, `DANG_PHUC_VU` = cam, `HOAN_THANH` = xanh |
| Nút "Bắt đầu chế biến" | Chuyển ChiTietDonHang: `DANG_CHUAN_BI` → `DANG_PHUC_VU` |
| Nút "Hoàn thành" | Chuyển ChiTietDonHang: `DANG_PHUC_VU` → `HOAN_THANH` |
| Nút "Hủy món" | Chuyển ChiTietDonHang: `DANG_CHUAN_BI` → `DA_HUY` |

---

## 6. Dữ liệu hiển thị

### 6.1 Danh sách đơn chờ chế biến (GET `/api/don-hang/bep`)

```typescript
// Query params: page, limit, TrangThai
// Response 200
{
  data: DonHangBep[];
  total: number;
}

// DonHangBep object
{
  MaDonHang: string;
  MaBan: string;
  TenBan: string;
  NgayTao: string;        // ISO 8601
  GhiChuDonHang?: string;
  SoMonChoCheBien: number;
  ChiTietDonHang: {
    MaChiTietDonHang: string;
    MaMonAn: string;
    TenMonAn: string;
    SoLuong: number;
    GhiChu?: string;
    TrangThai: "DANG_CHUAN_BI" | "DANG_PHUC_VU" | "HOAN_THANH" | "DA_HUY";
  }[];
}
```

### 6.2 Cập nhật trạng thái ChiTietDonHang

```typescript
// PUT /api/don-hang/:maDonHang/chi-tiet/:maChiTiet/trang-thai
// Request body
{
  TrangThai: "DANG_PHUC_VU" | "HOAN_THANH" | "DA_HUY";
}

// Response 200
{
  MaChiTietDonHang: string;
  TrangThai: string;
  NgayCapNhat: string;
}
```

### 6.3 Tự động cập nhật DonHang.TrangThai

Khi **tất cả** ChiTietDonHang trong đơn có trạng thái `HOAN_THANH` hoặc `DA_HUY`:
- Nếu tất cả `HOAN_THANH` → DonHang tự chuyển `DANG_PHUC_VU` → `HOAN_THANH`
- Nếu tất cả `DA_HUY` → DonHang tự chuyển → `DA_HUY`
- Nếu có cả `HOAN_THANH` và `DA_HUY` → DonHang vẫn `DANG_PHUC_VU` (chờ món còn lại)

> **Logic cập nhật DonHang:** Backend tự động tính — không cần nhân viên thao tác thủ công.

---

## 7. Form nhập liệu

### 7.1 Chuyển trạng thái món

| Field | Kiểu | Validation | Ghi chú |
|-------|------|-----------|---------|
| Trạng thái mới | Button (inline) | Chỉ hiện nút hợp lệ theo trạng thái hiện tại | Không cần form riêng |

> **Không có form nhập liệu phức tạp.** Thao tác chỉ là click nút chuyển trạng thái.

---

## 8. Nút thao tác

| Nút | Vị trí | Hành động | Khi nào disabled |
|-----|--------|----------|-----------------|
| **Bắt đầu chế biến** | Chi tiết món `DANG_CHUAN_BI` | PUT → `DANG_PHUC_VU` | — |
| **Hoàn thành** | Chi tiết món `DANG_PHUC_VU` | PUT → `HOAN_THANH` | — |
| **Hủy món** | Chi tiết món `DANG_CHUAN_BI` | PUT → `DA_HUY` | — |
| **Hoàn thành tất cả** | Footer chi tiết đơn | PUT tất cả món còn `DANG_PHUC_VU` → `HOAN_THANH` | Không có món `DANG_PHUC_VU` |

---

## 9. API liên quan

| Method | Endpoint | Quyền | Input | Output | Ghi chú |
|--------|----------|-------|-------|--------|---------|
| `GET` | `/api/don-hang/bep` | Nhân viên (Bếp) | Query: `page`, `limit`, `TrangThai` | `{ data: DonHangBep[], total }` | Danh sách đơn chờ |
| `GET` | `/api/don-hang/:maDonHang` | Nhân viên (Bếp) | `maDonHang` (path) | `DonHang` + `ChiTietDonHang` | Chi tiết đơn |
| `PUT` | `/api/don-hang/:maDonHang/chi-tiet/:maChiTiet/trang-thai` | Nhân viên (Bếp) | `{ TrangThai }` | `ChiTietDonHang` (200) | Cập nhật trạng thái món |

> **Lưu ý:** Tất cả endpoint trên yêu cầu JWT token có `VaiTro = NHAN_VIEN`.

---

## 10. Luồng xử lý chính

```
1. Nhân viên Bếp đăng nhập (VaiTro: NHAN_VIEN, ChucNangPhu: BEP)
   → Vào trang `/noi-bo/don-hang`

2. Hiển thị danh sách đơn `DANG_CHUAN_BI` (đơn cần chế biến)
   → Sắp xếp theo thời gian tạo ASC (đơn cũ nhất lên đầu)
   → Auto-refresh mỗi 10 giây

3. Nhân viên chọn đơn → xem chi tiết:
   - Danh sách món + trạng thái từng món
   - Ghi chú đơn (nếu có)

4. Bắt đầu chế biến món:
   a. Click nút "Bắt đầu chế biến" trên món `DANG_CHUAN_BI`
   b. PUT /api/don-hang/:maDonHang/chi-tiet/:maChiTiet/trang-thai
      Body: { TrangThai: "DANG_PHUC_VU" }
   c. Món chuyển sang `DANG_PHUC_VU`
   d. Badge: đỏ → cam

5. Hoàn thành món:
   a. Click nút "Hoàn thành" trên món `DANG_PHUC_VU`
   b. PUT → { TrangThai: "HOAN_THANH" }
   c. Món chuyển sang `HOAN_THANH`
   d. Badge: cam → xanh

6. Khi tất cả món trong đơn đều `HOAN_THANH`:
   → Backend tự động cập nhật DonHang.TrangThai → `HOAN_THANH`
   → Nhân viên phục vụ (FEAT-03) nhận thông báo
   → Thu ngân (FEAT-05) có thể thanh toán

7. Hủy món (nếu cần):
   a. Click "Hủy món" trên món `DANG_CHUAN_BI`
   b. PUT → { TrangThai: "DA_HUY" }
   c. Món chuyển sang `DA_HUY`
   d. Nếu tất cả món bị hủy → DonHang → `DA_HUY`
```

---

## 11. Luồng thay thế

### 11.1 Món hết nguyên liệu

```
1. Nhân viên Bếp thấy nguyên liệu hết
2. Hủy món: PUT → { TrangThai: "DA_HUY" }
3. DonHang vẫn giữ nguyên trạng thái (chờ các món khác)
4. Nếu tất cả món bị hủy → DonHang → DA_HUY
5. Nhân viên Phục vụ thông báo cho khách (ngoài hệ thống)
```

### 11.2 Khách yêu cầu hủy món

```
1. Nhân viên Phục vụ thông báo cho Bếp
2. Bếp hủy món: PUT → { TrangThai: "DA_HUY" }
3. Nếu còn món khác → DonHang vẫn chế biến
4. Nếu tất cả hủy → DonHang → DA_HUY
```

### 11.3 Đơn quá lâu chờ chế biến

```
1. Hệ thống không có tính năng cảnh báo thời gian chờ
2. Nhân viên Bếp tự theo dõi qua giao diện
3. Sắp xếp theo thời gian tạo ASC giúp ưu tiên đơn cũ
```

---

## 12. Luồng lỗi

| Mã lỗi | Thông báo | Hành động |
|---------|----------|----------|
| 400 - Chuyển trạng thái không hợp lệ | "Không thể chuyển từ '{hiện tại}' sang '{mới}'" | Toast lỗi |
| 401 - Token hết hạn | "Phiên đã hết hạn." | Redirect đăng nhập |
| 403 - Không có quyền | "Bạn không có quyền thao tác này." | — |
| 404 - Không tìm thấy | "Không tìm thấy đơn/món." | Reload danh sách |
| 500 - Lỗi server | "Đã xảy ra lỗi." | Retry |

---

## 13. Trạng thái thay đổi

### 13.1 ChiTietDonHang (món trong đơn)

```
[khởi tạo] ──POST /api/ban/:maBan/order──▶ DANG_CHUAN_BI
                                       │
                    ┌──────────────────┤
                    ▼                  ▼
              DANG_PHUC_VU          DA_HUY
              (bếp bắt đầu        (hủy nguyên liệu /
               chế biến)            khách yêu cầu hủy)
                    │
                    ▼
              HOAN_THANH
              (chế biến xong)
```

| Trạng thái hiện tại | Trigger | Trạng thái tiếp theo | Actor |
|--------------------|---------|---------------------|-------|
| `DANG_CHUAN_BI` | Bếp bắt đầu chế biến | `DANG_PHUC_VU` | Nhân viên (Bếp) |
| `DANG_PHUC_VU` | Bếp hoàn thành | `HOAN_THANH` | Nhân viên (Bếp) |
| `DANG_CHUAN_BI` | Hủy món | `DA_HUY` | Nhân viên (Bếp) |

### 13.2 DonHang (tự động cập nhật)

| Điều kiện | DonHang.TrangThai | Ghi chú |
|----------|-------------------|---------|
| Tất cả ChiTietDonHang = `HOAN_THANH` | `HOAN_THANH` | Backend tự động |
| Tất cả ChiTietDonHang = `DA_HUY` | `DA_HUY` | Backend tự động |
| Còn ChiTietDonHang `DANG_CHUAN_BI` hoặc `DANG_PHUC_VU` | Giữ nguyên (`DANG_CHUAN_BI` hoặc `DANG_PHUC_VU`) | Chờ xử lý |

---

## 14. Phân quyền

| Vai trò | Quyền truy cập | Ghi chú |
|---------|----------------|---------|
| **Nhân viên (Bếp)** | Xem đơn `DANG_CHUAN_BI`, cập nhật trạng thái ChiTietDonHang | JWT `VaiTro = NHAN_VIEN`, `ChucNangPhu = BEP` |
| **Nhân viên (Phục vụ)** | Không truy cập trang bếp | FEAT-03 |
| **Nhân viên (Thu ngân)** | Không truy cập trang bếp | FEAT-05 |
| **Admin** | Toàn bộ quyền + xem báo cáo | FEAT-06 |

---

## 15. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | Nhân viên Bếp đăng nhập → vào `/noi-bo/don-hang`, xem danh sách đơn `DANG_CHUAN_BI` | Manual |
| AC-02 | Đơn mới tạo từ FEAT-01/03 → xuất hiện ngay trong danh sách bếp (auto-refresh) | Manual: tạo đơn, chờ 10 giây |
| AC-03 | Click "Bắt đầu chế biến" → ChiTietDonHang `DANG_PHUC_VU` | Manual |
| AC-04 | Click "Hoàn thành" → ChiTietDonHang `HOAN_THANH` | Manual |
| AC-05 | Tất cả món `HOAN_THANH` → DonHang tự chuyển `HOAN_THANH` | Manual |
| AC-06 | Click "Hủy món" trên `DANG_CHUAN_BI` → `DA_HUY` | Manual |
| AC-07 | Tất cả món `DA_HUY` → DonHang tự chuyển `DA_HUY` | Manual |
| AC-08 | Nhân viên Phục vụ KHÔNG thể truy cập `/noi-bo/don-hang` (nếu phân quyền đúng) | Manual |
| AC-09 | Nhân viên Bếp KHÔNG thể truy cập `/noi-bo/quan-ly-ban` | Manual |
| AC-10 | ChiTietDonHang `HOAN_THANH` KHÔNG cho phép chuyển về `DANG_PHUC_VU` | Manual |
| AC-11 | ChiTietDonHang `DA_HUY` KHÔNG cho phép chuyển trạng thái | Manual |
| AC-12 | Trạng thái `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU` KHÔNG xuất hiện trong code | Code review |

---

## 16. Checklist đối chiếu code hiện tại

### Routes

| Route | Tồn tại? | Component | Ghi chú |
|-------|----------|-----------|---------|
| `/noi-bo/don-hang` | ✅ | `DonHangNoiBo` | Danh sách đơn — frontend lọc `DANG_CHUAN_BI` cho bếp |

### API endpoints

| Endpoint | Tồn tại? | Controller | Ghi chú |
|----------|----------|-----------|---------|
| `GET /api/don-hang` | ✅ | `don-hang.controller.ts` | Danh sách đơn — frontend lọc `DANG_CHUAN_BI` cho bếp |
| `PATCH /api/don-hang/:maDonHang/status` | ✅ | `don-hang.controller.ts` | Cập nhật trạng thái đơn |
| `PUT /api/don-hang/:maDonHang/chi-tiet/:maChiTiet/trang-thai` | ⚠️ | — | **Cần kiểm tra** endpoint cập nhật trạng thái ChiTietDonHang |

### Enum / State — **QUAN TRỌNG: Kiểm tra trạng thái cũ**

| Trạng thái cấm | Xuất hiện trong code? | File | Ghi chú |
|----------------|----------------------|------|---------|
| `CHO_XU_LY` | ❌ Không tìm thấy | — | ✅ OK |
| `CHO_CHE_BIEN` | ❌ Không tìm thấy | — | ✅ OK |
| `DANG_CHUAN_BIEN` | ❌ Không tìm thấy | — | ✅ OK |
| **`DANG_CHE_BIEN`** | ❌ Không tìm thấy | — | ✅ OK — **phải dùng `DANG_PHUC_VU`** |
| **`SAN_SANG`** | ❌ Không tìm thấy | — | ✅ OK — **phải dùng `HOAN_THANH`** |
| **`DA_PHUC_VU`** | ❌ Không tìm thấy | — | ✅ OK — **dùng cho ChiTietDonHang, không dùng cho DonHang** |

### Kiểm tra code bếp cụ thể

```bash
# Kiểm tra trạng thái cũ trong code bếp
rg "DANG_CHE_BIEN" backend/nest-api/src/modules/ --no-heading
rg "SAN_SANG" backend/nest-api/src/modules/ --no-heading
rg "DA_PHUC_VU" backend/nest-api/src/modules/ --no-heading

# Kiểm tra frontend
rg "DANG_CHE_BIEN" frontend/src/ --no-heading
rg "SAN_SANG" frontend/src/ --no-heading
```

### Phân quyền

| Kiểm tra | Kết quả | Ghi chú |
|---------|---------|---------|
| `@UseGuards(AuthGuard)` trên route bếp | ⚠️ | Cần xác minh |
| `VaiTro` check = `NHAN_VIEN` | ⚠️ | Cần xác minh |
| `ChucNangPhu` check = `BEP` | ⚠️ | **Cần kiểm tra** — có thể chưa implement |

### Tích hợp với FEAT khác

| FEAT | Mối liên hệ |
|------|-------------|
| FEAT-01 | QR ordering → tạo DonHang → Bếp nhận đơn `DANG_CHUAN_BI` |
| FEAT-02 | DatBan → không liên quan trực tiếp đến bếp |
| FEAT-03 | Phục vụ tạo đơn → Bếp chế biến |
| FEAT-05 | Thu ngân thanh toán → chỉ sau khi Bếp hoàn thành |
| FEAT-06 | Admin quản lý nhân viên |
| FEAT-07 | State machines chuẩn |

---

*Ghi chú: Trạng thái chuẩn: ChiTietDonHang dùng `DANG_PHUC_VU` (bếp đang chế biến) và `HOAN_THANH` (hoàn thành). KHÔNG dùng `DANG_CHE_BIEN` hay `SAN_SANG`. Route `/noi-bo/don-hang` dùng chung cho tất cả nhân viên — frontend phân quyền hiển thị theo vai trò.*
