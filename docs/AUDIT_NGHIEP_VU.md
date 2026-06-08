# AUDIT NGHIỆP VỤ HỆ THỐNG QUẢN LÝ NHÀ HÀNG

> Cập nhật: 2026-06-06 (bản gốc) → 2026-06-06 (cập nhật quyết định Mục 4)
> Phạm vi: read-only — không sửa code, không migration, không reset DB.
> Đối tượng: `QuanNhaHang` (MySQL 8) + backend NestJS tại `backend/nest-api/` + frontend React tại `frontend/` + seed/dev data tại `database/`.
> Vai đóng: Business Analyst, Backend Architect, Database Designer, QA Tester.

## 0. QUYẾT ĐỊNH ĐÃ CHỐT (2026-06-06)

| #   | Câu hỏi                                           | Quyết định                                                                                                                                                               | Ảnh hưởng trực tiếp                                                                                                                                                                               |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | ENUM chuẩn                                        | **Việt** (`CHO_XU_LY / DANG_CHE_BIEN / SAN_SANG / DA_PHUC_VU / HOAN_THANH / DA_HUY / DA_THANH_TOAN / DA_HOAN_TIEN / ...`)                                                | Mục 3 state machine dùng Việt; `common/constants.ts` phải rewrite; `donHang/contracts.js` FE phải rewrite; mọi đoạn mã hard-code ENUM phải đổi.                                                   |
| Q2  | Multi-payment THANH_CONG                          | **Chỉ 1 ThanhToan / 1 HoaDon (UPDATE dòng cũ khi retry)**                                                                                                                | Dùng `UNIQUE(MaHoaDon)` trong ThanhToan. Nếu thanh toán thất bại rồi thanh toán lại thì UPDATE dòng ThanhToan cũ, không insert thêm dòng mới. View `V_DoanhThuNgay` đơn giản hoá. Seed xoá TT017. |
| Q3  | Reset bàn khi DonHang `DA_HUY`                    | **Tự động** về `TRONG` (qua `DANG_DON` nếu bàn đang `CO_KHACH`)                                                                                                          | Thêm `DANG_DON` state; `BanTrangThaiReconcileService`; transition `CO_KHACH → DANG_DON → TRONG` sau timeout/staff.                                                                                |
| Q4  | Partial payment                                   | **Không** — thanh toán 1 lần                                                                                                                                             | `HoaDon.MaDonHang` UNIQUE giữ nguyên; không cần schema mở rộng; logic đơn giản.                                                                                                                   |
| Q5  | Bàn `BAO_TRI` cho đặt trước?                      | **Không** — Chỉ `TRONG` mới được chọn để tạo đặt bàn mới. `DA_DAT` là trạng thái sau khi booking đã xác nhận, không nhận thêm booking mới trừ khi xử lý cùng booking đó. | Lọc `Ban.TrangThai = 'TRONG'` ở BE + FE khi hiển thị danh sách bàn trống cho khách đặt.                                                                                                           |
| Q6  | Seed chứa kịch bản cảnh báo?                      | **Không** — seed sạch + folder `database/seed-scenarios/` riêng                                                                                                          | Seed chính chỉ chứa dữ liệu khớp invariant. Folder phụ chứa edge case cho QA/dev test.                                                                                                            |
| Q7  | Validate voucher ở đâu?                           | **Cả FE + BE** (2 lớp)                                                                                                                                                   | FE ẩn nút "Áp dụng" khi runtime state = `EXPIRED/USED_UP/INACTIVE`. BE là nguồn sự thật, reject lúc thanh toán (403).                                                                             |
| Q8  | Voucher `CUSTOMER/LOYALTY/VIP` enforce ownership? | **Có** — BE check `MaGiamGia.MaKH === payload.MaKH`, trả 403 nếu lệch                                                                                                    | Thêm guard trong `ma-giam-gia.service.ts`; log audit; FE hiển thị 403 message rõ.                                                                                                                 |

> ✅ **ĐÃ CHỐT TOÀN BỘ 8/8 CÂU** — sẵn sàng cho implementation.
>
> **Phạm vi Q1 (ENUM Việt):** áp dụng cho 5 cột trạng thái nghiệp vụ lõi — `Ban.TrangThai`, `DatBan.TrangThai`, `DonHang.TrangThai`, `ChiTietDonHang.TrangThai`, `ThanhToan.TrangThai`. Các ENUM kỹ thuật/danh mục như `LoaiMa`, `PhamVi`, `LoaiGiam`, runtime voucher state (`ACTIVE/UPCOMING/EXPIRED/USED_UP/USED/INACTIVE/DISABLED`) có thể giữ nguyên nếu không gây lỗi nghiệp vụ.

---

## 1. TỔNG QUAN NGHIỆP VỤ

### 1.1. Hai luồng nghiệp vụ chính

| #   | Luồng                                                                    | Tác nhân                                                                                         | Đầu vào                                                                                                    | Đầu ra                                                             | Bàn liên quan |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------- |
| 1   | **Khách tại bàn (QR gọi món)**                                           | Khách vãng lai — **không cần đăng nhập**                                                         | Ngồi tại bàn → quét QR trên bàn → xem thực đơn → gọi món → yêu cầu thanh toán                              | `DonHang` gắn `MaBan`                                              | Có            |
| 2   | **Khách đặt bàn (+ có thể gọi món trước hoặc đến nhận bàn rồi gọi món)** | Khách đặt bàn — **bắt buộc đăng nhập** (khách phải có tài khoản khách hàng, `DatBan` gắn `MaKH`) | Khách đăng nhập → `/dat-ban` → chọn ngày giờ, số người, xác nhận thông tin liên hệ (có thể chọn món trước) | `DatBan` gắn `MaKH` → staff xác nhận → gán bàn → khách đến → Order | Có            |

### 1.2. Ngoài phạm vi (Out of scope)

Phạm vi dự án **KHÔNG bao gồm** các luồng sau. Mọi tham chiếu/tính năng liên quan đều được xem là luồng thừa và cần dọn:

- **Không làm đặt món online** (khách không ngồi tại bàn, không quét QR).
- **Không làm mang về** (takeaway).
- **Không làm ship / giao hàng** (delivery).
- **Không làm checkout online độc lập** không gắn bàn (mọi thanh toán phải gắn với đơn thuộc `Ban` hoặc `DatBan`).

> Quyết định này có hiệu lực từ 2026-06-06. Mọi tài liệu, code, page, endpoint nào rơi vào các luồng trên đều nằm trong phạm vi dọn dẹp (xem thêm Lỗi 21 và các ghi chú tương ứng).

### 1.3. Actor chính của hệ thống

Hệ thống có 3 actor chính:

| Actor               | Mô tả                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Khách hàng**      | Khách vãng lai tại bàn (QR gọi món, không cần đăng nhập) hoặc khách có tài khoản / thành viên (đặt bàn, tích điểm, đánh giá, xem lịch sử).                                                                               |
| **Nhân viên**       | Nhân viên nội bộ, đảm nhiệm các nghiệp vụ: phục vụ (xem bàn, check-in đặt bàn, tạo đơn, phục vụ món), bếp (xem đơn bếp, cập nhật trạng thái chế biến món), thu ngân (xem hóa đơn, áp voucher/điểm, xác nhận thanh toán). |
| **Admin / Quản lý** | Quản lý toàn bộ hệ thống — bàn, thực đơn, nhân viên, khách hàng, voucher, doanh thu, đánh giá, cấu hình.                                                                                                                 |

### 1.4. Ma trận actor và chức năng

| Actor               | Chức năng chính                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Giới hạn                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Khách hàng**      | **Vãng lai (QR):** quét QR bàn → xem thực đơn → gọi món → yêu cầu thanh toán. Không cần đăng nhập. Có thể nhập SĐT để tích điểm / nhận hóa đơn điện tử. **Có tài khoản:** đặt bàn (bắt buộc đăng nhập), xem/hủy đặt bàn của mình, dùng voucher cá nhân, dùng điểm tích lũy, xem lịch sử đơn + điểm, đánh giá sau khi ăn.                                                                                                                                                                                             | Không can thiệp đơn của người khác; không xem doanh thu; không dùng voucher của `KhachHang` khác (BE enforce, trả 403). |
| **Nhân viên**       | **Phục vụ:** xem danh sách bàn + trạng thái; check-in đặt bàn (`DA_XAC_NHAN → DA_DEN`); tạo đơn hộ khách tại bàn; xem chi tiết đơn theo bàn; cập nhật món đã phục vụ (`ChiTietDonHang → DA_PHUC_VU`); chuyển bàn `DANG_DON → TRONG`. **Bếp:** xem danh sách đơn vào bếp; cập nhật trạng thái `ChiTietDonHang`: `CHO_CHE_BIEN → DANG_CHE_BIEN → SAN_SANG`. **Thu ngân:** xem hóa đơn; áp dụng voucher/điểm tại thanh toán; xác nhận thanh toán; tạo/cập nhật `HoaDon` + `ThanhToan`; chuyển đơn sang `DA_THANH_TOAN`. | Không CRUD thực đơn/bàn (riêng admin); không quản lý nhân viên; không xem báo cáo doanh thu tổng quan.                  |
| **Admin / Quản lý** | Quản lý dashboard tổng quan; CRUD bàn (kể cả `BAO_TRI`); quản lý thực đơn (món, danh mục, giá); quản lý đặt bàn (duyệt, hủy); quản lý đơn hàng (xem tất cả, can thiệp trạng thái); quản lý hóa đơn/thanh toán; quản lý voucher & điểm tích lũy; quản lý khách hàng; quản lý nhân viên (phân quyền); duyệt đánh giá; xem báo cáo doanh thu, món bán chạy, tần suất bàn; cấu hình hệ thống.                                                                                                                            | Không giới hạn nghiệp vụ; mọi thao tác đều được audit log.                                                              |

**Ràng buộc chung cho mọi actor:**

- **Không có luồng đặt món online / mang về / ship** (theo Mục 1.2). Mọi `DonHang` trong scope **phải gắn `MaBan` hoặc `MaDatBan`** (nullable về mặt schema, nhưng nghiệp vụ chính bắt buộc).
- **QR gọi món tại bàn là public** — khách truy cập được, không yêu cầu đăng nhập.
- **Đăng nhập chỉ là optional cho gọi món QR** — dùng để liên kết `MaKH`, tích điểm, áp dụng voucher cá nhân, xem lịch sử, đánh giá.
- **Không được bắt khách đăng nhập mới được gọi món tại bàn.** Nếu khách muốn tích điểm / nhận hóa đơn điện tử / dùng điểm-voucher thì cung cấp tuỳ chọn nhập SĐT (upsert `KhachHang` ẩn danh) ngay tại thanh toán — không chặn luồng QR.
- **Đặt bàn yêu cầu khách đăng nhập.** `DatBan` phải gắn `MaKH`. Khách chỉ xem/hủy `DatBan` của chính mình. Tên + SĐT lấy từ hồ sơ khách hàng hoặc cho khách xác nhận/cập nhật khi đặt bàn.
- Voucher + điểm chỉ áp dụng tại **thời điểm thanh toán** (lưu snapshot trên `DonHang`/`HoaDon`).
- Voucher thuộc loại `CUSTOMER/LOYALTY/VIP` bắt buộc đúng chủ sở hữu (BE enforce, Q8).

### 1.5. Bảng thực thể nghiệp vụ cốt lõi

`NguoiDung` → `KhachHang` / `NhanVien` → `Ban` ← `DatBan` → `DonHang` → `HoaDon` → `ThanhToan` ; `MaGiamGia`, `GiaoDichDiem`, `DanhGia`, `KhuyenMai`, `ThongBao`.

### 1.6. Quy tắc nghiệp vụ đang áp dụng (trích từ `docs/MO_TA_NGHIEP_VU.md` + code)

- Voucher áp dụng **tại thời điểm thanh toán** (lưu `MaCode` + `GiamGia` trên `HoaDon`).
- Điểm tích lũy: **1 điểm / 10.000đ** (`TI_LE_TICH_DIEM_MAC_DINH=10000`).
- Quy đổi điểm: **100 điểm = 10.000đ** (`TI_LE_QUY_DOI_DIEM=100`, `GIA_TRI_QUY_DOI=10000`).
- Phí dịch vụ: **5% trên tạm tính** (`frontend/src/utils/phiDichVu.js`).
- QR bàn public — khách không cần đăng nhập để gọi món.
- Bàn `BAO_TRI` không cho đặt trước (chốt theo Q5).

---

## 2. DANH SÁCH LỖI NGHIỆP VỤ (22 LỖI)

> Mỗi lỗi có: **Mức độ** (Critical / High / Medium / Low), **Bằng chứng** (file + dòng), **Tác động**, **Gợi ý xử lý**.

### Lỗi 1: ENUM "dual state machine" trên `DatBan.TrangThai`, `DonHang.TrangThai`, `ChiTietDonHang.TrangThai`

- **Mức độ:** Critical
- **Bằng chứng:** `database/mysql_init_schema.sql` (toàn bộ ENUM); `backend/nest-api/src/common/constants.ts`; `don-hang-payment-status.service.ts:20-36` (Set `TRANG_THAI_DON_HANG_HOP_LE` gộp 9 Anh + 6 Việt); `database/mysql_seed_dev.sql:615-631` (UPDATE reconciliation dùng cả 2 hệ).
- **Tác động:** Cùng một trạng thái có 2 chuỗi đại diện (chuỗi cũ tiếng Anh ↔ chuỗi Việt `CHO_XU_LY` v.v.). FE/BE có thể đọc/ghi trộn lẫn, khiến so sánh sai, view/lọc sai, đếm sai.
- **Gợi ý:** **Q1 đã chốt Việt**. Bộ ENUM Việt chính thức xem Mục 4 Câu 1. Migration cột ENUM về 1 bộ Việt; mapping function 1 chiều cho dữ liệu cũ (nếu có giá trị Anh còn sót).

### Lỗi 2: Frontend `donHang/contracts.js` dùng bộ ENUM **Anh** nhưng Q1 chốt **Việt** — phải rewrite toàn bộ file

- **Mức độ:** High
- **Bằng chứng:** `frontend/src/features/donHang/contracts.js` (đang chứa 7 giá trị ENUM chưa chuẩn hoá theo Q1); `don-hang-payment-status.service.ts:111` chỉ kiểm tra Set `TRANG_THAI_DON_HANG_HOP_LE` chứ không map ngược.
- **Tác động:** Sau khi chốt Việt, file này phải rewrite hoàn toàn về bộ Việt (Mục 4 Câu 1). Mọi helper `laySacThaiDonHang` đều phải cập nhật.
- **Gợi ý:** Rewrite `contracts.js` đồng bộ 1 bộ Việt với BE.

### Lỗi 3: `ThanhToan.MaHoaDon` KHÔNG UNIQUE → rủi ro **double-count doanh thu**

- **Mức độ:** Critical
- **Bằng chứng:** `mysql_init_schema.sql` (khai báo `MaHoaDon VARCHAR(50)` không có UNIQUE); `mysql_seed_dev.sql` DH009 có `HD006` với 2 payment (`TT006` `THAT_BAI`, `TT017` `THANH_CONG` 126.500đ); view `V_DoanhThuNgay` join `ThanhToan WHERE TrangThai='THANH_CONG'` không DISTINCT `MaHoaDon`.
- **Tác động:** Mỗi `ThanhToan` thêm `THANH_CONG` cho cùng `HoaDon` sẽ được tính lại vào doanh thu ngày. Dùng thực tế trong seed → bug đã có trong dữ liệu mẫu.
- **Gợi ý:** **Q2 đã chốt: dùng `UNIQUE(MaHoaDon)` trong ThanhToan** (MySQL không hỗ trợ partial unique index trực tiếp, nên không dùng cú pháp `UNIQUE … WHERE`). Nếu thanh toán thất bại rồi thanh toán lại thì UPDATE dòng ThanhToan cũ (cùng `MaHoaDon`), không insert thêm dòng mới. Xoá `TT017` trong seed.

### Lỗi 4: `thong-ke.service.ts:layTongQuan()` sum `HoaDon.TongTien` thay vì `ThanhTien` → **overstate doanh thu bằng GiamGia**

- **Mức độ:** Critical
- **Bằng chứng:** `backend/nest-api/src/modules/thong-ke/thong-ke.service.ts:82` `SUM(TongTien)`; `mysql_init_schema.sql` cột `HoaDon.ThanhTien`; endpoint `/thong-ke/doanh-thu/ngay` dùng view `V_DoanhThuNgay` (join `ThanhToan` `TrangThai='THANH_CONG'`, sum `HoaDon.ThanhTien`).
- **Tác động:** Hai endpoint báo cáo 2 số khác nhau cho cùng ngày. Dashboard "Tổng doanh thu" luôn cao hơn "Doanh thu ngày" đúng bằng tổng `GiamGia` đã dùng.
- **Gợi ý:** Sửa `layTongQuan()` thành `SUM(ThanhTien) WHERE NgayXuat`; hoặc join `ThanhToan TrangThai='THANH_CONG'`.

### Lỗi 5: `dat-ban-query.service.ts` build SQL có `Set` truyền làm bind param cuối → có thể lỗi SQL hoặc sai logic lọc bàn trùng khung giờ

- **Mức độ:** High
- **Bằng chứng:** `backend/nest-api/src/modules/dat-ban/dat-ban-query.service.ts` (Set `TRANG_THAI_DAT_BAN_GIU_BAN` / `TRANG_THAI_DAT_BAN_SU_DUNG_BAN` được truyền trực tiếp làm bind param thay vì dùng `IN (?)` với array).
- **Tác động:** Câu query có thể bị MySQL từ chối; hoặc lọc sai khiến bàn đã bị đặt vẫn hiển thị `TRONG`, cho phép 2 booking cùng khung giờ cùng bàn.
- **Gợi ý:** Dùng `queryRunner.query(sql, [arr])` với `placeholder IN (?)` tự expand mảng.

### Lỗi 6: `don-hang-payment-status.service.ts` `TRANG_THAI_DON_HANG_HOP_LE` Set gộp 9 Anh + 6 Việt → chuyển trạng thái hỗn loạn

- **Mức độ:** High
- **Bằng chứng:** `don-hang-payment-status.service.ts:20-36` (Set cố định).
- **Tác động:** BE chấp nhận 15 giá trị cho cùng 1 trường. API client có thể gửi chuỗi cũ tiếng Anh ↔ chuỗi Việt `CHO_XU_LY` qua lại tùy ý. Không có state machine validator.
- **Gợi ý:** **Q1 chốt Việt** → Set phải còn đúng 9 giá trị Việt (Mục 3.3). Viết hàm `kiemTraChuyenTrangThaiDonHang(cu, moi)` theo DAG.

### Lỗi 7: Seed DB001 `CHO_XAC_NHAN` cho B004 nhưng DH001 cùng `MaBan=B004` `DA_THANH_TOAN` + `MaDatBan=DB001` → mâu thuẫn

- **Mức độ:** Medium
- **Bằng chứng:** `database/mysql_seed_dev.sql` (DH001 vs DB001 vs B004 status TRONG).
- **Tác động:** 1 đơn đã `DA_THANH_TOAN` nhưng bàn `TRONG` + booking `CHO_XAC_NHAN` cùng tham chiếu 1 bàn. Staff không biết nên phục vụ khách nào.
- **Gợi ý:** Seed phải đảm bảo invariant (Q3): `Ban.TrangThai` = `CO_KHACH` khi có đơn `DA_THANH_TOAN/DA_PHUC_VU` thuộc bàn đó; `DA_DAT` khi có booking `DA_XAC_NHAN` chưa check-in; reset `TRONG` khi không còn order/booking open.

### Lỗi 8: `Ban.TrangThai` chỉ 4 giá trị (`TRONG / CO_KHACH / DA_DAT / BAO_TRI`) — thiếu `DANG_DON`

- **Mức độ:** Medium
- **Bằng chứng:** `mysql_init_schema.sql` dòng ENUM `Ban.TrangThai`.
- **Tác động:** Sau khi khách rời, bàn cần dọn trước khi nhận khách mới; hiện không có state trung gian → buộc dùng `TRONG` (có thể bị đặt nhầm) hoặc `BAO_TRI` (nặng nề).
- **Gợi ý:** **Q3 chốt: thêm `DANG_DON`**, kèm timeout tự về `TRONG` (15 phút) hoặc staff bấm "Sẵn sàng".

### Lỗi 9: `HoaDon.MaDonHang` UNIQUE → **1 đơn 1 hóa đơn** → không model được partial payment (tách 2 lần)

- **Mức độ:** Medium
- **Bằng chứng:** `mysql_init_schema.sql` UNIQUE constraint.
- **Tác động:** Nếu khách muốn đặt cọc 50% rồi trả phần còn lại, hệ thống không có luồng xử lý. Auto-create `HoaDon` tại thời điểm `DA_THANH_TOAN` chỉ tạo được 1 lần.
- **Gợi ý:** **Q4 chốt: KHÔNG cần partial** → giữ nguyên UNIQUE, không mở rộng schema. Đây không còn là lỗi cần sửa.

### Lỗi 10: `DonHangCreateOrderService` chuyển `Ban.TrangThai='CO_KHACH'` khi tạo order nhưng **chưa rõ** có reset `TRONG` khi đơn `DA_HUY`/`DA_THANH_TOAN`

- **Mức độ:** High
- **Bằng chứng:** `don-hang-create-order.service.ts:74` (UPDATE bàn sang CO_KHACH); `don-hang-payment-status.service.ts:301-307` (auto-create HoaDon khi status=DA_THANH_TOAN nhưng không thấy UPDATE bàn); seed nhiều bàn TRONG dù có đơn DA_THANH_TOAN (B001, B002, B003, B004).
- **Tác động:** Bàn cứ TRONG mãi dù đơn đã DA_THANH_TOAN → đặt nhầm khách.
- **Gợi ý:** **Q3 đã chốt: tự động**. Trong transaction khi chuyển sang `DA_THANH_TOAN`/`HOAN_THANH`/`DA_HUY`: nếu không còn `DonHang` open nào của bàn đó (status IN ('CHO_XU_LY','DA_XAC_NHAN','DANG_CHE_BIEN','SAN_SANG','DA_PHUC_VU')) và không còn `DatBan` open → `CO_KHACH → DANG_DON → TRONG` (qua trạng thái `DANG_DON` trung gian).

### Lỗi 11: **FE↔BE enum mismatch trên `Ban.TrangThai`** — Q1 chốt Việt, FE đã gửi đúng Việt

- **Mức độ:** High
- **Bằng chứng:** `frontend/src/services/api/apiBanAn.js:72-77` (`mapTrangThaiBanApi` chỉ chuẩn hóa input tên Việt → giữ nguyên giá trị Việt); `mysql_init_schema.sql` ENUM hiện tại chưa đồng bộ với bộ Việt theo Q1.
- **Tác động:** Hiện tại (ENUM Anh) FE gửi `TRONG/CO_KHACH/CHO_THANH_TOAN/BAO_TRI` → MySQL báo lỗi `ER_TRUNCATED_WRONG_VALUE`. Sau Q1, ENUM Việt làm ENUM hiện tại sai, cần migration.
- **Gợi ý:** Sau khi migration ENUM Việt, FE gửi raw `TRONG/DA_DAT/CO_KHACH/DANG_DON/BAO_TRI` — match hoàn toàn. Cần xoá `mapTrangThaiBanApi` (chỉ giữ label hiển thị tiếng Việt cho UI).

### Lỗi 12: **FE `buildPayloadTaoDon.js` gửi field `maGiamGia`, `soDiem`, `soTienGiam`, `thongTinVoucher` không tồn tại trên schema `DonHang`**

- **Mức độ:** High
- **Bằng chứng:** `frontend/src/features/donHang/buildPayloadTaoDon.js`; `mysql_init_schema.sql` (cột `DonHang`); `don-hang-create-order.service.ts` (không INSERT các cột này).
- **Tác động:** BE phải parse từ payload rồi áp vào `HoaDon` (voucher) và `GiaoDichDiem` (điểm) tại thời điểm thanh toán. Nếu BE chỉ validate theo DTO `TaoDonHangDto` (loại bỏ field lạ), toàn bộ thông tin voucher/điểm sẽ bị mất. Hiện không rõ BE xử lý thế nào.
- **Gợi ý:** Tạo DTO `TaoDonHangDto` rõ ràng với `voucherCode?: string`, `soDiemSuDung?: number`; BE validate, lưu snapshot vào `DonHang` (cột mới) hoặc apply ngay tại thanh toán.

### Lỗi 13: FE `apiDatBan.js#huyDatBanApi` cứng giá trị tiếng Anh — Q1 chốt Việt nên phải đổi sang `'DA_HUY'`

- **Mức độ:** Low
- **Bằng chứng:** `frontend/src/services/api/apiDatBan.js`.
- **Tác động:** Sau migration ENUM Việt, chuỗi tiếng Anh sẽ bị BE từ chối.
- **Gợi ý:** Thay bằng hằng số `TRANG_THAI_DAT_BAN.DA_HUY` từ `contracts.js` (sau khi rewrite Việt).

### Lỗi 14: DH009 (DA_HUY) có `TT006` (THAT_BAI) + `TT017` (THANH_CONG 126.500đ) trong seed

- **Mức độ:** Critical (minh chứng thực tế của Lỗi 3)
- **Bằng chứng:** `mysql_seed_dev.sql` (DH009 + HD006 + TT006 + TT017).
- **Tác động:** 1 đơn `DA_HUY` có 1 thanh toán `THANH_CONG` — view doanh thu sẽ cộng nhầm 126.500đ vào doanh thu ngày.
- **Gợi ý:** **Q2 chốt: xoá TT017 trong seed**. Thêm invariant ở BE: khi chuyển `DonHang → DA_HUY` → set `ThanhToan.TrangThai = 'THAT_BAI'` cho tất cả payment chưa THANH_CONG.

### Lỗi 15: Nhiều bàn `TRONG` dù có đơn `DA_THANH_TOAN`/`SAN_SANG`/`CHO_XU_LY` (B001, B002, B003, B004)

- **Mức độ:** High
- **Bằng chứng:** Seed `database/mysql_seed_dev.sql`; block UPDATE reconciliation cuối file.
- **Tác động:** Bàn có thể bị đặt nhầm bởi 2 đơn cùng lúc.
- **Gợi ý:** **Q3 chốt: tự động reset**. Migration tự động tính lại trạng thái bàn từ đơn + booking; trigger MySQL hoặc job BE chạy mỗi 5 phút.

### Lỗi 16: Block UPDATE reconciliation ở cuối `mysql_seed_dev.sql` (lines 615-631) — dev phải tự vá lại `Ban.TrangThai`

- **Mức độ:** Medium
- **Bằng chứng:** Trực tiếp trong seed file.
- **Tác động:** Seed tự nhận sai và phải patch sau insert. Chứng tỏ business logic cập nhật bàn chưa vận hành đúng.
- **Gợi ý:** **Q6 chốt: seed sạch, xoá block reconciliation**. Seed chính phải insert đúng invariant ngay từ đầu. Edge case chuyển sang folder `database/seed-scenarios/` riêng.

### Lỗi 17: Reconciliation SQL trong seed dùng cả Anh + Việt trong `CASE WHEN` → cả 2 hệ tồn tại trong data thật

- **Mức độ:** Medium
- **Bằng chứng:** `mysql_seed_dev.sql:615-631`.
- **Tác động:** Bất kỳ logic `WHERE TrangThai = 'DA_THANH_TOAN'` sẽ bỏ sót dữ liệu Anh.
- **Gợi ý:** **Q1 chốt Việt** → xoá hết CASE WHEN, viết lại block reconciliation chỉ dùng giá trị Việt.

### Lỗi 18: `LichSuDonHang` trong seed có DH001 `DANG_CHE_BIEN → DA_THANH_TOAN` (bỏ qua `SAN_SANG/DA_PHUC_VU`)

- **Mức độ:** Low
- **Bằng chứng:** `mysql_seed_dev.sql` (block UPDATE LichSuDonHang).
- **Tác động:** Có thể là test case hợp lệ (khách thanh toán trước khi nhận món), nhưng FE hiển thị lịch sử sẽ không có trạng thái trung gian — gây hiểu nhầm cho khách hàng.
- **Gợi ý:** Thống nhất flow: `DANG_CHE_BIEN → SAN_SANG → DA_PHUC_VU → DA_THANH_TOAN` (thanh toán sau khi ăn) HOẶC `DANG_CHE_BIEN → DA_PHUC_VU → DA_THANH_TOAN` (nhanh). Tài liệu hoá.

### Lỗi 19: `ChiTietDonHang.TrangThai` ENUM khác `DonHang.TrangThai` ENUM — state machine bị phân mảnh

- **Mức độ:** Medium
- **Bằng chứng:** `mysql_init_schema.sql` (`ChiTietDonHang.TrangThai` ENUM hiện đang dùng giá trị chưa chuẩn hoá theo Q1).
- **Tác động:** Bếp có thể đánh trạng thái cuối/huỷ từng món; tổng đơn chỉ chuyển khi item cuối cùng hoàn tất. Không tự động đồng bộ.
- **Gợi ý:** **Q1 chốt Việt** → ENUM `ChiTietDonHang.TrangThai` phải rewrite về `CHO_CHE_BIEN / DANG_CHE_BIEN / SAN_SANG / DA_PHUC_VU / HOAN_THANH / DA_HUY`. Rõ ràng: `ChiTietDonHang.TrangThai` quản lý per-item; `DonHang.TrangThai` tổng hợp. Thêm rule: khi tất cả item `HOAN_THANH` → `DonHang` chuyển `SAN_SANG` (hoặc `DA_PHUC_VU` tuỳ flow).

### Lỗi 20: `DonHang.MaKH` null nhiều đơn trong seed (DH004, DH013, DH018) — `if (trangThaiCongDiem.has(trangThai) && don.MaKH)` im lặng skip tích điểm

- **Mức độ:** Medium
- **Bằng chứng:** `mysql_seed_dev.sql`; `don-hang-payment-status.service.ts:147-158`.
- **Tác động:** Khách vãng lai tại bàn QR không bao giờ được tích điểm, không có cảnh báo.
- **Gợi ý:** FE cung cấp tùy chọn nhập SĐT khi thanh toán → nếu khách nhập SĐT thì tự tạo `KhachHang` ẩn danh (nếu chưa tồn tại), BE upsert `MaKH` rồi tích điểm; nếu khách không nhập SĐT thì đơn vẫn tạo bình thường nhưng không tích điểm. Không chặn luồng QR chỉ vì thiếu SĐT.

### Lỗi 21: `ThanhToanPage.jsx` **không gọi endpoint thanh toán** — đơn tạo xong cứ ở `CHO_XU_LY`, phụ thuộc staff thao tác

- **Mức độ:** High
- **Bằng chứng:** `frontend/src/pages/ThanhToanPage.jsx` (gọi `taoDonHangApi`, sau đó `xoaPhieuGiamGiaDaApDung + xoaBanNhapTamThanhToan + xoaToanBoGio + navigate('/ho-so')`); `taoDonHangApi` trong `apiDonHang.js` chỉ gọi `POST /don-hang`.
- **Tác động:**
  - Đơn (gắn bàn hoặc từ đặt bàn) luôn ở `CHO_XU_LY` → không có `HoaDon` → `layTongQuan()` trả 0 cho ngày đó.
  - Voucher (`maGiamGia`) và điểm (`soDiem`) trong payload bị BE bỏ qua nếu không có route thanh toán riêng.
  - Khách không nhận được hoá đơn/email xác nhận thanh toán.
- **Gợi ý:**
  - Nếu `ThanhToanPage` còn tồn tại trong scope hiện tại, chỉ phục vụ thanh toán cho **đơn gắn bàn** (QR tại bàn) hoặc **đơn từ đặt bàn** (khách đã có `MaBan`/`MaDatBan`). Thêm bước `thanhToanApi({ maDonHang, phuongThuc, maGiamGia, soDiem })` sau khi tạo đơn; hoặc thay đổi `taoDonHangApi` để tạo cả `DonHang + HoaDon` luôn.
  - Theo Mục 1.2, hệ thống **không làm** luồng đặt món online / mang về / ship. Nếu `ThanhToanPage` hiện đang phục vụ các luồng đó (không gắn bàn, không gắn `MaDatBan`) thì **không yêu cầu tạo flow thay thế**; thay vào đó chuyển thành task **kiểm tra / dọn luồng thừa** (xem FE-4).

### Lỗi 22: `xacNhanThanhToanTaiBan` và `capNhatTrangThaiDonHang` (DA_THANH_TOAN) **auto-create HoaDon + ThanhToan với `PhuongThuc='TienMat'`** — bỏ qua PhuongThuc FE gửi

- **Mức độ:** High
- **Bằng chứng:** `don-hang-payment-status.service.ts:217-220, 301-307` (hard-code `PhuongThuc = 'TienMat'`); seed có `TT004-TT013` với `PhuongThuc = 'MoMo'/'VNPay'/'ZaloPay'/'ChuyenKhoan'`.
- **Tác động:** Khách trả MoMo/VNPay nhưng hệ thống tự tạo thêm 1 payment `TienMat` `THANH_CONG` → cộng dồn doanh thu 2 lần (Lỗi 3 đã đề cập, Q2 chốt 1 `THANH_CONG`/HoaDon nên lỗi này càng nghiêm trọng).
- **Gợi ý:** Đọc `PhuongThuc` từ payload/PATCH body; không hard-code.

---

## 3. STATE MACHINE ĐỀ XUẤT (chuẩn hoá theo Q1: ENUM Việt)

### 3.1. `Ban.TrangThai` — 5 trạng thái (Việt)

```
                         ┌──────────────┐
             ┌──────────►│  BAO_TRI     │◄───────────┐
             │           └──────────────┘            │
    ┌────────┴───────┐                               │
    │     TRONG      │◄─────────────┐                │
    └────────┬───────┘              │                │
             │                      │                │
              │  (booking DA_XAC_NHAN)│                │
             ▼                      │                │
    ┌────────┴───────┐              │                │
    │    DA_DAT      │──────────────┤                │
    └────────┬───────┘              │                │
             │ (check-in /          │                │
             │  khách tới)          │                │
             ▼                      │                │
    ┌────────┴───────┐              │                │
    │    CO_KHACH    │──────────────┤                │
    └────────┬───────┘              │                │
             │ (khách rời, Q3 auto) │                │
             ▼                      │                │
    ┌────────┴───────┐              │                │
    │   DANG_DON     │──── timeout 15' ──┐           │
    └────────┬───────┘                  │           │
             │ (staff bấm Sẵn sàng)     │           │
             └──────────────────────────┴───────────┘
```

- TRONG ↔ BAO_TRI: Admin đổi.
- TRONG → DA_DAT: khi booking được xác nhận (`DatBan.TrangThai` chuyển sang `DA_XAC_NHAN`).
- TRONG → CO_KHACH: khi khách gọi món trực tiếp tại bàn (QR tại bàn) hoặc nhân viên tạo order tại bàn (`DonHang` được INSERT với `MaBan`).
- DA_DAT → CO_KHACH: khi khách đặt bàn đến check-in (`DatBan.TrangThai` chuyển sang `DA_DEN` hoặc `DonHang` được tạo thuộc bàn đó).
- CO_KHACH → DANG_DON: customer rời (sau khi đơn HOAN_THANH/DA_HUY) HOẶC staff bấm "Dọn bàn". **Q3: tự động**.
- DANG_DON → TRONG: timeout 15 phút HOẶC staff bấm "Sẵn sàng".
- **Constraint cứng** (theo từng trạng thái bàn):
  - `TRONG`: không có `DonHang`/`DatBan` active nào thuộc bàn.
  - `DA_DAT`: phải có ít nhất 1 `DatBan` `DA_XAC_NHAN` thuộc bàn.
    - `CHO_XAC_NHAN` chưa giữ bàn cứng — bàn vẫn có thể là `TRONG`, chưa làm bàn thành `DA_DAT`.
    - `DA_DEN` nghĩa là khách đã đến/check-in — bàn phải chuyển sang `CO_KHACH`.
  - `CO_KHACH`: phải có `DonHang` open (status ∈ `{CHO_XU_LY, DA_XAC_NHAN, DANG_CHE_BIEN, SAN_SANG, DA_PHUC_VU}`) thuộc bàn **hoặc** `DatBan` đang sử dụng (`DA_DEN`).
  - `DANG_DON`: không bắt buộc có `DonHang`/`DatBan` active, nhưng phải là trạng thái sau khi đơn/booking vừa đóng (status cuối = `HOAN_THANH/DA_HUY/DA_THANH_TOAN`) hoặc đang trong thời gian dọn bàn (timeout 15 phút hoặc staff bấm "Sẵn sàng").
  - `BAO_TRI`: không nhận booking/order mới. Có thể đi kèm `DonHang`/`DatBan` cũ đang chờ xử lý nhưng bàn không giao dịch.

### 3.2. `DatBan.TrangThai` — 7 trạng thái trong state machine (Việt), trong đó 6 giá trị lưu DB

```
   ┌──────┐
   │  MOI │ (FE/temp — KHÔNG lưu DB, dùng cho UI khi user mở form đặt bàn)
   └──┬───┘
       │ POST /dat-ban
       ▼
   ┌──────────────────┐
   │  CHO_XAC_NHAN    │  (chờ staff xác nhận — lưu DB)
   └────┬─────────────┘
         │ staff duyệt
         ▼
   ┌──────────────────┐
   │  DA_XAC_NHAN     │  ← giữ chỗ bàn (lưu DB)
   └────┬─────────────┘
          │ khách tới
          ▼
   ┌──────────────────┐
   │     DA_DEN       │  ← đã gán món/order (lưu DB)
   └────┬─────────────┘
          │ đơn xong
          ▼
   ┌──────────────────┐
   │  HOAN_THANH      │  ← kết thúc tốt đẹp (lưu DB)
   └──────────────────┘

   từ CHO_XAC_NHAN/DA_XAC_NHAN có thể chuyển:
   ┌──────────────────┐
   │     DA_HUY       │  ← staff/khách huỷ (lưu DB)
   └──────────────────┘
   ┌──────────────────┐
   │    KHONG_DEN     │  ← khách không đến sau X phút (lưu DB)
   └──────────────────┘
   ┌──────────────────┐
   │     HET_HAN      │  ← quá thời gian giữ chỗ (lưu DB)
   └──────────────────┘
```

- **DB ENUM chính thức** (6 giá trị, không bao gồm `MOI`): `CHO_XAC_NHAN / DA_XAC_NHAN / DA_DEN / HOAN_THANH / DA_HUY / KHONG_DEN / HET_HAN`.
- `MOI` chỉ là trạng thái tạm trên frontend (UI khi user mở form đặt bàn), không bao giờ ghi vào DB. Khi user submit form, `MOI → CHO_XAC_NHAN` và dòng mới được INSERT với `TrangThai = 'CHO_XAC_NHAN'`.
- Chỉ cho phép chuyển trạng thái theo chiều mũi tên. Nếu muốn huỷ `DA_DEN` → phải qua `HOAN_THANH` (đóng order) trước.

### 3.3. `DonHang.TrangThai` — 9 trạng thái (Việt)

```
   ┌──────────────────┐
   │    CHO_XU_LY     │  (tạo từ FE)
   └────┬─────────────┘
         │ staff xác nhận
         ▼
   ┌──────────────────┐
   │   DA_XAC_NHAN    │  (bếp nhận)
   └────┬─────────────┘
         ▼
   ┌──────────────────┐
   │  DANG_CHE_BIEN   │  (đang nấu)
   └────┬─────────────┘
         ▼
   ┌──────────────────┐
   │    SAN_SANG      │  (món xong, chờ mang ra)
   └────┬─────────────┘
         ▼
   ┌──────────────────┐
   │   DA_PHUC_VU     │  (đã mang ra)
   └────┬─────────────┘
         │ khách yêu cầu thanh toán + staff xác nhận
         ▼
   ┌──────────────────┐
   │  DA_THANH_TOAN   │  (đã thanh toán)
   └────┬─────────────┘
         │ in bill + kết thúc
         ▼
   ┌──────────────────┐
   │   HOAN_THANH     │  (đơn kết thúc, release bàn)
   └──────────────────┘

   Cho phép huỷ từ CHO_XU_LY/DA_XAC_NHAN/DANG_CHE_BIEN:
   ┌──────────────────┐
   │     DA_HUY       │  ← Q3: tự động trigger reset bàn
   └──────────────────┘

   Sau khi DA_THANH_TOAN có thể hoàn tiền:
   ┌──────────────────┐
   │   DA_HOAN_TIEN   │
   └──────────────────┘
```

- **Auto-transition** (theo trạng thái tổng hợp của `ChiTietDonHang`):
  - Khi tất cả `ChiTietDonHang.TrangThai ∈ {'SAN_SANG', 'DA_HUY'}` → `DonHang.TrangThai` có thể chuyển sang `SAN_SANG`.
  - Khi tất cả `ChiTietDonHang.TrangThai ∈ {'DA_PHUC_VU', 'HOAN_THANH', 'DA_HUY'}` → `DonHang.TrangThai` có thể chuyển sang `DA_PHUC_VU`.
  - `DonHang` chỉ chuyển `DA_THANH_TOAN` / `HOAN_THANH` theo luồng thanh toán (không auto từ trạng thái chi tiết món).

### 3.4. `ThanhToan.TrangThai` — 4 trạng thái (Việt)

```
   ┌──────────────────┐
   │  CHO_THANH_TOAN  │  (init, chờ cổng thanh toán)
   └────┬─────────────┘
         │ MoMo/VNPay callback thành công
         ▼
   ┌──────────────────┐
   │   THANH_CONG     │  (chính thức ghi nhận doanh thu)
   └──────────────────┘

   từ CHO_THANH_TOAN:
   ┌──────────────────┐
   │    THAT_BAI      │  (timeout / user cancel)
   └──────────────────┘

   từ THANH_CONG (sau khi đã thanh toán xong):
   ┌──────────────────┐
   │   DA_HOAN_TIEN   │  (hoàn tiền)
   └──────────────────┘
```

- **Constraint cứng (Q2)**: dùng `UNIQUE(MaHoaDon)` trong ThanhToan (MySQL không hỗ trợ partial unique index trực tiếp). Khi thanh toán thất bại rồi khách thanh toán lại cùng `MaHoaDon` thì UPDATE dòng ThanhToan cũ (đổi `TrangThai`, `PhuongThuc`, `ThoiGian`, `SoTien` nếu cần), không insert thêm dòng mới.

### 3.5. `ChiTietDonHang.TrangThai` — 6 trạng thái (Việt)

```
   CHO_CHE_BIEN → DANG_CHE_BIEN → SAN_SANG → DA_PHUC_VU → HOAN_THANH
                       ↓                ↓
                    DA_HUY          DA_HUY
```

- `SAN_SANG`: bếp làm xong món, chờ nhân viên/phục vụ mang ra.
- `DA_PHUC_VU`: nhân viên đã mang món ra cho khách.
- `HOAN_THANH`: trạng thái kết thúc chi tiết món sau khi đã phục vụ/đóng món (ví dụ: khách ăn xong, khoá món trong báo cáo). `HOAN_THANH` là điểm cuối của vòng đời chi tiết món hợp lệ, **không đồng nghĩa** với việc bếp vừa xong (đó là `SAN_SANG`).
- `DA_HUY`: món bị huỷ, có thể từ khách hoặc staff; trạng thái cuối (không thể chuyển sang trạng thái khác).
- **Rule tổng hợp `DonHang`** (xem Mục 3.3 Auto-transition):
  - Tất cả chi tiết món đạt `SAN_SANG` hoặc `DA_HUY` → `DonHang` có thể chuyển `SAN_SANG`.
  - Tất cả chi tiết món đạt `DA_PHUC_VU` / `HOAN_THANH` / `DA_HUY` → `DonHang` có thể chuyển `DA_PHUC_VU`.
  - `DonHang` chỉ chuyển `DA_THANH_TOAN` / `HOAN_THANH` theo luồng thanh toán.

### 3.6. `MaGiamGia.TrangThai` (3) + runtime states ở FE (7)

- DB ENUM giữ nguyên: `Active / Inactive / HetHan`.
- FE `voucherTrangThai.js` runtime suy ra: `ACTIVE / UPCOMING / EXPIRED / USED_UP / USED / INACTIVE / DISABLED` dựa trên `NgayBatDau/NgayKetThuc/SoLanDaDung/SoLanToiDa/MaKH`. Mapping rõ ràng ở `frontend/src/services/api/voucherTrangThai.js`.

---

## 4. CÂU HỎI CHỐT (CẦN USER XÁC NHẬN)

> 8 câu hỏi bắt buộc trả lời trước khi sửa code:
> **Q1–Q8 đã chốt toàn bộ ngày 2026-06-06** (xem Mục 0).

### Câu 1: Chốt 1 bộ ENUM — Anh hay Việt? — ✅ **ĐÃ CHỐT: VIỆT**

- Lý do chốt: dễ đọc cho người Việt, khớp với phần lớn seed hiện hữu.
- Việc cần làm: rewrite `common/constants.ts` + mọi helper trong `donHang/contracts.js`; mapping ngược 1 chiều cho dữ liệu cũ (nếu có seed nào còn giá trị Anh).
- Bộ ENUM Việt chính thức áp dụng:
  - `DonHang.TrangThai`: `CHO_XU_LY / DA_XAC_NHAN / DANG_CHE_BIEN / SAN_SANG / DA_PHUC_VU / HOAN_THANH / DA_HUY / DA_THANH_TOAN / DA_HOAN_TIEN`.
  - `DatBan.TrangThai` DB: `CHO_XAC_NHAN / DA_XAC_NHAN / DA_DEN / HOAN_THANH / DA_HUY / KHONG_DEN / HET_HAN`. `MOI` chỉ là trạng thái tạm trên FE (khi user mở form đặt bàn), không lưu DB.
  - `Ban.TrangThai`: `TRONG / DA_DAT / CO_KHACH / DANG_DON / BAO_TRI`.
  - `ChiTietDonHang.TrangThai`: `CHO_CHE_BIEN / DANG_CHE_BIEN / SAN_SANG / DA_PHUC_VU / HOAN_THANH / DA_HUY`.
  - `ThanhToan.TrangThai`: `CHO_THANH_TOAN / THANH_CONG / THAT_BAI / DA_HOAN_TIEN`.

### Câu 2: Nhiều `ThanhToan` `THANH_CONG` cho cùng `HoaDon` — có cho phép không? — ✅ **ĐÃ CHỐT: KHÔNG (UPDATE dòng cũ khi retry)**

- Việc cần làm: dùng `UNIQUE(MaHoaDon)` trong ThanhToan (MySQL không hỗ trợ partial unique index trực tiếp); nếu thanh toán thất bại rồi thanh toán lại thì UPDATE dòng ThanhToan cũ thay vì insert dòng mới; xoá `TT017` trong seed; view `V_DoanhThuNgay` đơn giản hoá; sửa `don-hang-payment-status.service.ts` chặn auto-create duplicate.

### Câu 3: Đơn `DA_HUY` có reset bàn về `TRONG` (qua `DANG_DON`) không? — ✅ **ĐÃ CHỐT: CÓ, tự động (qua DANG_DON)**

- Việc cần làm: thêm `DANG_DON` state; `BanTrangThaiReconcileService` cron + on-update; transition `CO_KHACH → DANG_DON → TRONG` (timeout 15 phút hoặc staff bấm "Sẵn sàng").

### Câu 4: Partial payment có cần không? — ✅ **ĐÃ CHỐT: KHÔNG**

- `HoaDon.MaDonHang` UNIQUE giữ nguyên; không cần schema mở rộng; auto-create HoaDon tại thời điểm `DA_THANH_TOAN` chỉ 1 lần.

### Câu 5: Bàn `BAO_TRI` có cho đặt trước không? — ✅ **ĐÃ CHỐT: CHỈ TRONG**

- Chỉ bàn ở trạng thái `TRONG` mới được chọn để tạo đặt bàn mới. `DA_DAT` là trạng thái bàn đã có booking xác nhận, không nhận thêm booking mới trừ khi xử lý cùng booking đó.
- Lọc `Ban.TrangThai = 'TRONG'` ở cả BE (`dat-ban-query.service.ts`) và FE (`DatBanPage`).

### Câu 6: Seed có cần sinh kịch bản cảnh báo không? — ✅ **ĐÃ CHỐT: KHÔNG (seed sạch)**

- Seed chính viết lại đảm bảo mọi invariant.
- Tạo folder `database/seed-scenarios/` chứa các file riêng cho QA/dev test edge case (đặt tên rõ: `01-double-payment.sql`, `02-ban-inconsistent.sql`, `03-khach-vang-lai.sql`).

### Câu 7: Voucher hết hạn còn trong form đặt bàn — xử lý ở FE hay BE? — ✅ **ĐÃ CHỐT: CẢ HAI**

- FE (`DatBanPage`): dùng `voucherTrangThai.js` runtime, ẩn nút "Áp dụng" khi `EXPIRED/USED_UP/INACTIVE`. (Lưu ý: `GioHangPage` thuộc luồng đặt món online / mang về — theo Mục 1.2 đã được loại khỏi scope.)
- BE (`ma-giam-gia.service.ts`): là nguồn sự thật, check tại thời điểm thanh toán, trả 403 với message rõ.

### Câu 8: Voucher `CUSTOMER/LOYALTY/VIP` enforce ownership? — ✅ **ĐÃ CHỐT: CÓ (BE enforce + 403)**

- BE guard: `if (LoaiMa IN ('CUSTOMER','LOYALTY','VIP') && MaGiamGia.MaKH !== payload.MaKH) → throw 403`.
- Log audit, FE hiển thị 403 message rõ ràng.

---

## 5. ROADMAP THEO PHASE

### Phase 0 — Chốt & Migration nền (1–2 ngày)

- ✅ Q1–Q8 đã chốt toàn bộ ngày 2026-06-06 (xem Mục 0).
- Tạo ADR `docs/ADR-001-enum-chuan-hoa.md` (chốt ENUM **Việt** + danh sách giá trị chính thức ở Mục 4 Câu 1).
- Migration DB: chuẩn hoá ENUM về 1 bộ Việt, dùng `UNIQUE(MaHoaDon)` trong ThanhToan (Q2).
- Cập nhật `common/constants.ts` còn đúng 1 bộ Việt.
- Mapping helper 1 chiều Anh→Việt cho dữ liệu cũ (chỉ áp dụng nếu còn giá trị Anh).
- Tạo `database/seed-scenarios/` với README + 3 file mẫu (Q6).

### Phase 1 — Database (1 ngày)

- Tạo migration `database/migrations/V2__chuan_hoa_trang_thai.sql`.
- Thêm `Ban.TrangThai` = `DANG_DON`; tạo view `V_BanHienTai` tổng hợp từ DonHang+DatBan.
- Sửa view `V_DoanhThuNgay`: join `HoaDon.ThanhTien WHERE EXISTS ThanhToan.TrangThai='THANH_CONG'` (Q2).
- `UNIQUE(MaHoaDon)` trong ThanhToan (Q2).
- Seed lại (Q6): xoá block reconciliation cuối file; tạo folder `database/seed-scenarios/` với README + 3 file mẫu.

### Phase 2 — Backend (2–3 ngày)

- Thêm `BanTrangThaiReconcileService` chạy cron + on-update.
- Sửa `don-hang-create-order.service.ts`: nhận `voucherCode?` + `soDiemSuDung?` từ DTO; lưu snapshot vào `DonHang` (cột mới).
- Sửa `don-hang-payment-status.service.ts`:
  - `PhuongThuc` không hard-code.
  - Validate transition theo DAG (xem Mục 3.3).
  - Khi chuyển `DA_THANH_TOAN`/`DA_HUY`: tự động reset bàn về `DANG_DON` (nếu còn người) hoặc `TRONG` (nếu không còn ai).
- Sửa `thong-ke.service.ts:layTongQuan()`: dùng `ThanhTien` thay vì `TongTien`.
- Sửa `dat-ban-query.service.ts`: expand `IN (?)` đúng cách.
- Bổ sung test E2E cho mỗi state transition.

### Phase 3 — Frontend (1–2 ngày)

- Cập nhật `donHang/contracts.js` đồng bộ 1 bộ ENUM Việt (Q1).
- Sửa `apiBanAn.js:mapTrangThaiBanApi` → gửi raw ENUM Việt (Q1).
- Sửa `apiDatBan.js:huyDatBanApi` → dùng hằng số từ `contracts.js` (Q1).
- Lọc `Ban.TrangThai = 'TRONG'` ở `DatBanPage` (Q5).
- Validate voucher runtime ở FE `DatBanPage` (Q7) — ẩn nút "Áp dụng" khi runtime state = `EXPIRED/USED_UP/INACTIVE`.
- Sửa `ThanhToanPage.jsx`: thêm bước gọi `thanhToanApi({ maDonHang, phuongThuc, maGiamGia, soDiem })` sau khi tạo đơn (theo Câu 21) — **chỉ áp dụng cho flow QR tại bàn hoặc flow đặt bàn + ăn + thanh toán tại nhà hàng** (theo Mục 1.1). Nếu phát hiện luồng đặt món online / mang về / ship còn tồn tại trong `ThanhToanPage` thì chuyển sang task dọn luồng thừa (xem FE-4).
- Hiển thị trạng thái bàn + lịch sử chuyển trạng thái (`LichSuDonHang`) trong `HoSoPage` cho khách.

### Phase 4 — Test (1–2 ngày)

- Unit test (NestJS) cho mỗi state transition.
- E2E test (Playwright) cho:
  - **Flow QR tại bàn**: tạo đơn → huỷ/thanh toán → kiểm tra bàn cập nhật đúng trạng thái (`CO_KHACH → DANG_DON → TRONG` khi đóng đơn; `TRONG` ngay khi huỷ đơn không phát sinh order mới).
  - **Flow đặt bàn + đến + ăn + thanh toán**: xác nhận booking → khách đến nhận bàn → gọi món → thanh toán tại nhà hàng → kiểm tra bàn đi qua `TRONG → DA_DAT → CO_KHACH → DANG_DON → TRONG`.
- Test seed-data integrity: chạy assertion SQL, đảm bảo mọi DonHang open đều có bàn đúng trạng thái.

### Phase 5 — Docs (0.5 ngày)

- Cập nhật `docs/MO_TA_NGHIEP_VU.md`: bổ sung state machine đã chốt.
- Kiểm tra lại endpoint `/xac-nhan-thanh-toan`. Nếu hiện còn public thì đổi sang staff. Nếu đã có guard `Admin/NhanVien` thì chỉ cập nhật `docs/ma-tran-phan-quyen-api.md` cho khớp code.
- Tạo `docs/STATE_MACHINES.md` (tham chiếu Mục 3 của audit này).
- Cập nhật `README.md` với cách chạy migration.

---

## 6. TASK CHI TIẾT (DB / BE / FE / TEST / DOCS)

> Mỗi task có: **Mục tiêu**, **File cần kiểm tra/sửa**, **Rủi ro**, **Cách verify**.

### 6.1. DB TASKS

#### DB-1. Chuẩn hoá ENUM về **Việt** (Q1)

- **Mục tiêu:** Đưa 5 cột trạng thái về 1 bộ Việt duy nhất:
  - `Ban.TrangThai`: `TRONG / DA_DAT / CO_KHACH / DANG_DON / BAO_TRI`.
  - `DatBan.TrangThai`: `CHO_XAC_NHAN / DA_XAC_NHAN / DA_DEN / HOAN_THANH / DA_HUY / KHONG_DEN / HET_HAN` (MOI là FE/temp, không lưu DB).
  - `DonHang.TrangThai`: `CHO_XU_LY / DA_XAC_NHAN / DANG_CHE_BIEN / SAN_SANG / DA_PHUC_VU / HOAN_THANH / DA_HUY / DA_THANH_TOAN / DA_HOAN_TIEN`.
  - `ChiTietDonHang.TrangThai`: `CHO_CHE_BIEN / DANG_CHE_BIEN / SAN_SANG / DA_PHUC_VU / HOAN_THANH / DA_HUY`.
  - `ThanhToan.TrangThai`: `CHO_THANH_TOAN / THANH_CONG / THAT_BAI / DA_HOAN_TIEN`.
  - Tham chiếu chi tiết: Mục 3 (state machine) + Mục 4 Câu 1.
- **Phạm vi áp dụng Q1:** 5 cột trạng thái nghiệp vụ lõi ở trên. Các ENUM kỹ thuật/danh mục khác (`LoaiMa`, `PhamVi`, `LoaiGiam`, runtime voucher state) **ngoài phạm vi** DB-1, giữ nguyên nếu không gây lỗi nghiệp vụ.
- **File:** `database/mysql_init_schema.sql` (V2 migration); `database/mysql_seed_dev.sql` (làm sạch data trước khi migration).
- **Rủi ro:** Mất data cũ nếu không backup; phá vỡ các query cũ `WHERE TrangThai = '…'` (giá trị tiếng Anh) đang tồn tại.
- **Verify:**
  ```sql
  -- Trước migration: COUNT các giá trị Việt + Anh
  SELECT TrangThai, COUNT(*) FROM DonHang GROUP BY TrangThai;
  -- Sau migration: chỉ còn giá trị Việt
  SELECT TrangThai, COUNT(*) FROM DonHang GROUP BY TrangThai;
  -- Expect: chỉ thấy CHO_XU_LY, DA_XAC_NHAN, DANG_CHE_BIEN, SAN_SANG, DA_PHUC_VU, HOAN_THANH, DA_HUY, DA_THANH_TOAN, DA_HOAN_TIEN
  ```

#### DB-2. UNIQUE constraint cho ThanhToan (Q2)

- **Mục tiêu:** Ngăn 2 `ThanhToan` cùng `MaHoaDon` có `TrangThai='THANH_CONG'`.
- **File:** `database/mysql_init_schema.sql`.
- **Rủi ro:** Reject seed cũ (DH009 có TT017 trùng). Phải xoá TT017 trước khi apply.
- **Verify:**
  ```sql
  -- Test: insert trùng THANH_CONG sẽ fail
  INSERT INTO ThanhToan(MaHoaDon, PhuongThuc, TrangThai, SoTien, ThoiGian)
  VALUES ('HD006', 'TienMat', 'THANH_CONG', 100, NOW());
  -- Expect: Duplicate entry error (nếu đã có 1 dòng `THANH_CONG` cùng `MaHoaDon`)
  ```

#### DB-3. View doanh thu

- **Mục tiêu:** Đảm bảo `V_DoanhThuNgay` join đúng và không double-count (Q2 chốt 1 `THANH_CONG`/HoaDon → view đơn giản hoá).
- **File:** `database/mysql_init_schema.sql` (CREATE VIEW).
- **Rủi ro:** Sai số liệu; breaking change cho endpoint cũ.
- **Verify:**
  ```sql
  -- Test với seed cũ (sau khi xoá TT017)
  SELECT * FROM V_DoanhThuNgay WHERE Ngay = '2026-06-06';
  -- Expect: chỉ tính 1 lần HD006
  ```

#### DB-4. Bàn reconcile (Q3)

- **Mục tiêu:** View `V_BanHienTai` tổng hợp trạng thái từ `DonHang` + `DatBan`.
- **File:** `database/mysql_init_schema.sql`.
- **Rủi ro:** Performance với bàn >1000; có thể cần index.
- **Verify:**
  ```sql
  SELECT MaBan, TrangThaiHienTai FROM V_BanHienTai WHERE MaBan = 'B001';
  -- Expect: 'CO_KHACH' nếu có DonHang open
  ```

#### DB-5. Bổ sung cột lưu snapshot voucher/điểm trên DonHang

- **Mục tiêu:** Tránh BE phải parse payload từ FE, lưu snapshot tại thời điểm tạo đơn.
- **File:** `database/mysql_init_schema.sql` (ALTER TABLE DonHang ADD COLUMN ...).
- **Rủi ro:** Migration nặng; cần default value.
- **Verify:**
  ```sql
  DESCRIBE DonHang;
  -- Expect: cột MaVoucherSnapshot, SoDiemSuDungSnapshot, ThoiDiemTaoDon
  ```

### 6.2. BE TASKS

#### BE-1. Tạo DTO `TaoDonHangDto` (đồng bộ ENUM Việt theo Q1)

- **Mục tiêu:** Validate payload rõ ràng, có `voucherCode?` + `soDiemSuDung?` + `phuongThuc?` + `trangThaiDonHang?` (giá trị Việt).
- **File:** `backend/nest-api/src/modules/don-hang/dto/tao-don-hang.dto.ts` (mới).
- **Rủi ro:** Breaking change với FE cũ; cần version API.
- **Verify:** Unit test DTO với payload thiếu/sai → expect 400.

#### BE-2. Sửa `don-hang-create-order.service.ts`

- **Mục tiêu:** Nhận `voucherCode?` + `soDiemSuDung?` từ DTO, validate, lưu snapshot.
- **File:** `backend/nest-api/src/modules/don-hang/don-hang-create-order.service.ts`.
- **Rủi ro:** BE có thể áp dụng voucher/điểm 2 lần (1 lúc tạo, 1 lúc thanh toán).
- **Verify:** Unit test: tạo đơn có voucher → check `DonHang.MaVoucherSnapshot`; tạo đơn có điểm → check `SoDiemSuDungSnapshot`.

#### BE-3. Sửa `don-hang-payment-status.service.ts` (Q1 + Q2 + Q3)

- **Mục tiêu:** (a) `PhuongThuc` không hard-code; (b) Validate transition theo DAG Việt; (c) Reset bàn khi `DA_THANH_TOAN/HOAN_THANH/DA_HUY` (Q3); (d) chặn 2 `ThanhToan THANH_CONG` cùng `MaHoaDon` (Q2).
- **File:** `backend/nest-api/src/modules/don-hang/don-hang-payment-status.service.ts`.
- **Rủi ro:** Logic phức tạp dễ sót; cần transaction.
- **Verify:** Unit test:
  - Transition `CHO_XU_LY → DA_XAC_NHAN` OK; `CHO_XU_LY → DA_HUY` OK; `DA_HUY → DA_XAC_NHAN` FAIL.
  - Sau khi `DA_THANH_TOAN` + reset bàn: `SELECT * FROM Ban WHERE MaBan=?` → expect `DANG_DON` hoặc `TRONG`.

#### BE-4. Sửa `thong-ke.service.ts:layTongQuan()`

- **Mục tiêu:** Sum `ThanhTien` thay vì `TongTien`; filter theo `NgayXuat`.
- **File:** `backend/nest-api/src/modules/thong-ke/thong-ke.service.ts:82`.
- **Rủi ro:** Số liệu dashboard thay đổi → cần thông báo trước.
- **Verify:** Snapshot số liệu cũ → apply fix → so sánh, chênh lệch = tổng `GiamGia` ngày đó.

#### BE-5. Sửa `dat-ban-query.service.ts` Set param

- **Mục tiêu:** Expand `IN (?)` với mảng đúng cách.
- **File:** `backend/nest-api/src/modules/dat-ban/dat-ban-query.service.ts`.
- **Rủi ro:** Có thể đã chạy đúng do driver; cần test kỹ.
- **Verify:** Unit test với 5 booking trùng khung giờ → expect chỉ 1 bàn match.

#### BE-6. Sửa `ma-giam-gia.service.ts` enforce ownership (Q8)

- **Mục tiêu:** Nếu `LoaiMa IN ('CUSTOMER','LOYALTY','VIP')` thì `maKH trong payload` phải khớp `MaGiamGia.MaKH`. Throw 403 nếu lệch.
- **File:** `backend/nest-api/src/modules/ma-giam-gia/ma-giam-gia.service.ts`.
- **Rủi ro:** Breaking change với flow cũ; cần log lỗi rõ ràng.
- **Verify:** Unit test: KH007 dùng voucher của KH001 → expect 403.

#### BE-7. Thêm `BanTrangThaiReconcileService`

- **Mục tiêu:** Cron 5 phút + on-update reconcile `Ban.TrangThai` từ `DonHang + DatBan`.
- **File:** `backend/nest-api/src/modules/ban/ban-reconcile.service.ts` (mới).
- **Rủi ro:** Conflict với transaction đang chạy; cần lock row.
- **Verify:** Test: tạo đơn + tắt BE + chờ cron → bàn về đúng trạng thái.

### 6.3. FE TASKS

#### FE-1. Rewrite `donHang/contracts.js` về **ENUM Việt** (Q1)

- **Mục tiêu:** Đồng bộ 1 bộ ENUM Việt với BE; thêm `DA_THANH_TOAN` / `DA_HOAN_TIEN`.
- **File:** `frontend/src/features/donHang/contracts.js`.
- **Rủi ro:** Cập nhật toàn bộ helper `laySacThaiDonHang` + mọi page dùng ENUM.
- **Verify:** Type-check + chạy qua các page: `HoSoPage`, `BanGoiMonPage`, `ThanhToanPage`.

#### FE-2. Sửa `apiBanAn.js:mapTrangThaiBanApi` (Q1)

- **Mục tiêu:** Sau khi ENUM Việt migrate, xoá `mapTrangThaiBanApi` (FE đã gửi đúng Việt). Giữ riêng label hiển thị tiếng Việt cho UI.
- **File:** `frontend/src/services/api/apiBanAn.js`.
- **Rủi ro:** Mất UX nếu staff muốn nhìn trạng thái Việt; có thể giữ label tiếng Việt riêng.
- **Verify:** Manual test: PATCH `/ban/B001/status` với `trangThai: 'TRONG'` → thành công.

#### FE-3. Sửa `apiDatBan.js:huyDatBanApi` (Q1)

- **Mục tiêu:** Dùng hằng số `DA_HUY` từ `contracts.js` thay vì hard-code giá trị tiếng Anh.
- **File:** `frontend/src/services/api/apiDatBan.js`.
- **Rủi ro:** Nhỏ.
- **Verify:** Test huỷ booking → kiểm tra response.

#### FE-4. Sửa `ThanhToanPage.jsx` — thêm bước thanh toán

- **Mục tiêu:** Gọi `thanhToanApi` sau khi tạo đơn (theo Lỗi 21).
- **File:** `frontend/src/pages/ThanhToanPage.jsx`, `frontend/src/services/api/apiDonHang.js` (thêm `thanhToanApi`).
- **Rủi ro:** UX khó hiểu nếu BE từ chối thanh toán; cần rollback `DonHang` đã tạo.
- **Verify:** Manual test: thanh toán với MoMo → đơn chuyển `DA_THANH_TOAN` + HoaDon tạo + ThanhToan `THANH_CONG`.

#### FE-5. FE cung cấp tùy chọn nhập SĐT ở ThanhToanPage; chỉ bắt buộc nếu khách muốn tích điểm / dùng điểm-voucher / nhận hóa đơn điện tử

- **Mục tiêu:** Upsert KhachHang ẩn danh → gắn `MaKH` cho đơn → tích điểm (nếu khách nhập SĐT). Khách không nhập SĐT thì đơn vẫn tạo bình thường, không tích điểm.
- **File:** `frontend/src/pages/ThanhToanPage.jsx`.
- **Rủi ro:** Nhỏ — khách tự nguyện nhập SĐT.
- **Verify:** Test tạo đơn vãng lai không nhập SĐT → đơn tạo thành công, `DonHang.MaKH IS NULL`, không có `LichSuDiem`. Test nhập SĐT → `DonHang.MaKH IS NOT NULL` + `LichSuDiem` có bản ghi.

### 6.4. TEST TASKS

#### TEST-1. Unit test state transition

- **Mục tiêu:** Mỗi cặp `(trangThaiCu, trangThaiMoi)` chỉ OK nếu có cạnh trong DAG.
- **File:** `backend/nest-api/src/modules/don-hang/__tests__/state-transition.spec.ts` (mới).
- **Verify:** `npm run test` pass ≥ 95% coverage.

#### TEST-2. E2E flow QR

- **Mục tiêu:** Khách QR → tạo order → huỷ → bàn về `TRONG`.
- **File:** `e2e/qr-order-cancel.spec.ts` (mới).
- **Verify:** `npm run test:e2e` pass; screenshot trước/sau.

#### TEST-3. E2E flow đặt bàn + ăn + trả

- **Mục tiêu:** Booking `DA_XAC_NHAN` → check-in → order → `DA_PHUC_VU` → `DA_THANH_TOAN` → bàn về `TRONG` (qua `DANG_DON`).
- **File:** `e2e/full-table-flow.spec.ts` (mới).
- **Verify:** Pass + log state machine rõ ràng.

#### TEST-4. Seed integrity assertion

- **Mục tiêu:** Sau seed, chạy script SQL kiểm tra invariant (bàn, đơn, đặt bàn).
- **File:** `database/scripts/assert-seed-integrity.sql` (mới).
- **Verify:** Manual chạy → expect 0 rows returned.

### 6.5. DOCS TASKS

#### DOC-1. Cập nhật `docs/MO_TA_NGHIEP_VU.md`

- **Mục tiêu:** Thêm state machine đã chốt (Mục 3 của audit này).
- **Rủi ro:** Nhỏ.
- **Verify:** Đọc lại toàn bộ file, đảm bảo không còn phần mô tả cũ mâu thuẫn.

#### DOC-2. Tạo `docs/STATE_MACHINES.md`

- **Mục tiêu:** Diagram 4 state machine (Bàn / Đặt bàn / Đơn hàng / Thanh toán).
- **Rủi ro:** Nhỏ.
- **Verify:** File render đúng trên GitHub.

#### DOC-3. Cập nhật `docs/ma-tran-phan-quyen-api.md`

- **Mục tiêu:** Kiểm tra lại endpoint `/xac-nhan-thanh-toan`. Nếu hiện còn public thì đổi sang staff. Nếu đã có guard `Admin/NhanVien` thì chỉ cập nhật tài liệu phân quyền cho khớp code.
- **Rủi ro:** Breaking change với FE cũ nếu đang public (cần đăng nhập sau khi đổi).
- **Verify:** Test gọi endpoint khi chưa login (nếu đã chuyển sang staff) → 401; nếu đã staff thì đảm bảo FE truyền token đúng.

#### DOC-4. Cập nhật `README.md`

- **Mục tiêu:** Bổ sung hướng dẫn chạy migration V2.
- **Rủi ro:** Nhỏ.
- **Verify:** Clone fresh + chạy theo hướng dẫn.

---

## 7. KẾT LUẬN — ƯU TIÊN SỬA TRƯỚC (TOP 5)

> Dựa trên mức độ nghiêm trọng + rủi ro dữ liệu + tác động kinh doanh.

### ƯU TIÊN 1 (P0, làm ngay tuần này) — Chuẩn hoá ENUM về **Việt** (Q1 đã chốt)

- **Lỗi:** #1, #2, #6, #11, #17.
- **Lý do:** Mọi state machine khác đều phụ thuộc ENUM. Sửa sớm giảm 50% bug phía dưới.
- **Owner:** Backend Architect + Database Designer.
- **Output:** ADR-001 + migration V2 (ENUM Việt) + cập nhật `constants.ts` + rewrite `contracts.js` + mapping helper Anh→Việt.

### ƯU TIÊN 2 (P0) — Sửa doanh thu & UNIQUE ThanhToan (Q2 đã chốt)

- **Lỗi:** #3, #4, #14, #22.
- **Lý do:** Đang có data sai thực tế (DH009 + TT017). Dashboard báo cáo sai số.
- **Owner:** Database Designer + Backend Architect.
- **Output:** `UNIQUE(MaHoaDon)` trong ThanhToan (Q2) + view doanh thu mới + sửa `layTongQuan()` + xoá TT017 trong seed.

### ƯU TIÊN 3 (P1) — State machine + auto-reset bàn (Q3 đã chốt)

- **Lỗi:** #5, #7, #8, #10, #15, #16.
- **Lý do:** Bàn trống/lỏng là nguồn gốc của hầu hết lỗi nghiệp vụ nghiêm trọng (2 khách 1 bàn, không ai biết bàn nào trống).
- **Owner:** Backend Architect + Business Analyst.
- **Output:** `BanTrangThaiReconcileService` + DAG validator Việt + thêm `DANG_DON` state (Q3) + auto-reset `CO_KHACH → DANG_DON → TRONG` khi đơn `DA_THANH_TOAN/HOAN_THANH/DA_HUY`.

### ƯU TIÊN 4 (P1) — Sửa FE↔BE contract

- **Lỗi:** #11, #12, #13, #21.
- **Lý do:** Voucher/điểm bị mất, đơn tạo xong không có HoaDon, bàn update lỗi ENUM.
- **Owner:** Frontend + Backend Architect.
- **Output:** DTO rõ ràng + map ENUM Việt ở FE + thêm endpoint `thanhToanApi` + filter BAO_TRI khi đặt bàn (Q5).

### ƯU TIÊN 5 (P2) — Phân quyền & hardening

- **Lỗi:** #11 (security liên quan), `ma-tran-phan-quyen-api.md` đề xuất, Lỗi #6 (FE hard-code enum dễ leak).
- **Lý do:** Cần rà soát endpoint `/xac-nhan-thanh-toan` — nếu hiện đang public thì là lỗ hổng; nếu đã có guard `Admin/NhanVien` thì chỉ cần đồng bộ tài liệu.
- **Owner:** Backend Architect + Security.
- **Output:** Rà soát lại guard của endpoint; nếu thiếu thì thêm `JwtAuthGuard` + role guard; bổ sung test 401/403.

---

## 8. PHỤ LỤC

### 8.1. Checklist verify sau khi sửa

- [ ] Re-import seed → tất cả DonHang có `MaKH` (hoặc note rõ vì sao null).
- [ ] Re-import seed → mọi bàn `Ban.TrangThai` = `CO_KHACH` nếu có đơn open, ngược lại `TRONG`.
- [ ] Không còn 2 `ThanhToan` `THANH_CONG` cùng `MaHoaDon`.
- [ ] `/thong-ke/tong-quan` ≈ `/thong-ke/doanh-thu/ngay` (chênh lệch doanh thu hôm nay < 1%).
- [ ] `layDanhSachVoucherChoCheckoutApi` trả voucher mà khách hiện tại có quyền dùng.
- [ ] E2E: khách QR → tạo order → huỷ → bàn `TRONG`.
- [ ] E2E: khách đặt bàn + đến + ăn + trả MoMo → đơn `DA_THANH_TOAN` + HoaDon + ThanhToan `THANH_CONG` + LichSuDiem cộng điểm + Voucher `SoLanDaDung++` + Bàn về `DANG_DON` rồi `TRONG` sau 15'.
- [ ] PATCH `/ban/B001/status` từ FE với raw ENUM Việt (Q1) → 200 OK.
- [ ] PATCH `/ban/B001/status` với ENUM Việt ngoài whitelist (sau migration) → 400 (BE reject).

### 8.2. Mapping field quan trọng FE↔BE (Q1: ENUM Việt)

| Khái niệm        | Field FE                  | Field BE (DB)                             | Ghi chú                                                                                                                                                                                                                               |
| ---------------- | ------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mã đơn hàng      | `maDonHang`               | `DonHang.MaDonHang`                       | VARCHAR(20) DHxxx                                                                                                                                                                                                                     |
| Trạng thái đơn   | `trangThai`               | `DonHang.TrangThai`                       | **Q1 ENUM Việt**: `CHO_XU_LY / DA_XAC_NHAN / DANG_CHE_BIEN / SAN_SANG / DA_PHUC_VU / HOAN_THANH / DA_HUY / DA_THANH_TOAN / DA_HOAN_TIEN`                                                                                              |
| Mã KH            | `maKH`                    | `DonHang.MaKH`                            | nullable — lỗi #20                                                                                                                                                                                                                    |
| Mã bàn           | `maBan`                   | `DonHang.MaBan`                           | nullable về mặt schema, **nhưng trong scope hiện tại mọi `DonHang` đều phải gắn `MaBan` hoặc `MaDatBan`** (theo Mục 1.1). Trường hợp `MaBan IS NULL` chỉ xuất hiện ở dữ liệu cũ / edge case, không phải nghiệp vụ chính của hệ thống. |
| Mã đặt bàn       | `maDatBan`                | `DonHang.MaDatBan`                        | Dùng khi đơn được tạo từ luồng đặt bàn.                                                                                                                                                                                               |
| Voucher          | `voucherCode` (payload)   | `DonHang.MaVoucherSnapshot` (sau BE-2)    | Lỗi #12                                                                                                                                                                                                                               |
| Điểm dùng        | `soDiem` (payload)        | `DonHang.SoDiemSuDungSnapshot` (sau BE-2) | Lỗi #12                                                                                                                                                                                                                               |
| Phương thức TT   | `phuongThuc`              | `ThanhToan.PhuongThuc`                    | VARCHAR, hiện hard-code 'TienMat' — lỗi #22                                                                                                                                                                                           |
| Số tiền đơn      | `thanhTien`               | `DonHang.TongTien`                        | tạm tính                                                                                                                                                                                                                              |
| Số tiền sau giảm | `thanhTien` (sau voucher) | `HoaDon.ThanhTien`                        | cột chuẩn để báo cáo                                                                                                                                                                                                                  |
| Trạng thái bàn   | `trangThai`               | `Ban.TrangThai`                           | **Q1 ENUM Việt**: `TRONG / DA_DAT / CO_KHACH / DANG_DON / BAO_TRI` (Q3 thêm `DANG_DON`)                                                                                                                                               |

### 8.3. File đã đọc để audit

- DB: `database/mysql_init_schema.sql` (toàn bộ), `database/mysql_seed_dev.sql` (toàn bộ).
- Docs: `README.md`, `docs/MO_TA_NGHIEP_VU.md`, `docs/ma-tran-phan-quyen-api.md`, `docs/quytacfe.md`.
- BE: `backend/nest-api/src/app.module.ts`; `backend/nest-api/src/common/constants.ts`; `backend/nest-api/src/modules/ban/*`; `backend/nest-api/src/modules/dat-ban/*`; `backend/nest-api/src/modules/don-hang/*`; `backend/nest-api/src/modules/thong-ke/thong-ke.service.ts`; `backend/nest-api/src/modules/ma-giam-gia/ma-giam-gia.service.ts`; `backend/nest-api/src/modules/diem-tich-luy/diem-tich-luy.service.ts`; `backend/nest-api/src/modules/thuc-don/dto/*`; `backend/nest-api/src/modules/khach-hang/*` (sơ lược); `backend/nest-api/src/modules/auth/auth.service.ts` (sơ lược).
- FE: `frontend/src/services/api/*` (15 file); `frontend/src/features/donHang/contracts.js` + `buildPayloadTaoDon.js`; `frontend/src/features/datBan/**`; `frontend/src/pages/ThanhToanPage.jsx`, `GioHangPage.jsx`, `BanGoiMonPage.jsx`, `DatBanPage.jsx` (sơ lược); `frontend/AGENTS.md`.

### 8.4. File CHƯA đọc sâu (giới hạn phạm vi)

- `frontend/src/pages/TrangChuPage.jsx`, `GioiThieuPage.jsx`, `ThucDonPage.jsx`, `DatBanPage.jsx` (mới đọc tên), `HoSoPage.jsx`, `DanhGiaPage.jsx`, `DangNhapPage.jsx`, `DangNhapNoiBoPage.jsx`, `DangKyPage.jsx`.
- `frontend/src/components/**` (ngoài `DauTrang`, `ChanTrang`, `TuyenDuongBaoVe`).
- `backend/nest-api/src/modules/danh-gia/*`, `thong-bao/*`, `tai-ban/*` (module rỗng).
- `backend/nest-api/src/common/guards/*`, `strategies/*`, `decorators/*` (phân quyền chi tiết).

Các phần này không ảnh hưởng kết luận audit nghiệp vụ ở Mục 1–7, nhưng cần đọc thêm nếu muốn đối chiếu chi tiết phân quyền hoặc flow bếp.

---

## 9. TRẠNG THÁI & ĐIỀU KIỆN ĐỂ BẮT ĐẦU IMPLEMENT

**Trạng thái hiện tại:**

- ✅ 8/8 câu hỏi đã chốt (Mục 0).
- ✅ Mục 3 state machine Việt đã chuẩn hoá.
- ✅ Mục 5 roadmap đã sẵn sàng.
- ✅ Mục 6 task list chi tiết (DB/BE/FE/Test/Docs) đã rõ.
- ✅ Mục 7 top 5 ưu tiên đã sắp xếp.
- ⏸ **Audit đang ở chế độ read-only** — chưa sửa code, chưa tạo migration, chưa reset DB.

**Để bắt đầu Phase 0 (tạo ADR-001 + migration V2 + rewrite constants.ts + contracts.js), cần:**

1. User commit file `docs/AUDIT_NGHIEP_VU.md` (hiện đang untracked).
2. User phê duyệt vi phạm ràng buộc read-only ban đầu (cho phép Phase 0: tạo file mới ADR + migration, KHÔNG chạy migration, KHÔNG xoá file cũ).
3. Sau khi Phase 0 xong, xin lại phê duyệt cho Phase 1+ (chạy migration, sửa code, xoá block reconciliation trong seed, tạo folder `seed-scenarios/`).

**Lưu ý quan trọng:**

- `backend/AGENTS.md` + `frontend/AGENTS.md` vẫn cấm hard-code, đổi contract, refactor lớn — mọi sửa phải theo Mục 6.
- Mục 1.6 nói "Bàn `BAO_TRI` không cho đặt trước" — Q5 đã chốt khớp với nghiệp vụ hiện tại, không phải thay đổi hành vi.

---

**END OF AUDIT**
