-- V3: Đồng bộ_ENUM_trang_thai_chuan
-- Mục tiêu: Thống nhất tất cả status thành tiếng Việt chuẩn theo constants.ts
-- Chạy trên MySQL 8.0+
--
-- ⚠️ CHẠY TRÊN DATABASE ĐÃ CÓ DỮ LIỆU CŨ
-- Nếu chưa có bảng/ENUM cũ → dùng mysql_init_schema.sql mới thay thế.
--
-- Thứ tự an toàn cho từng bảng:
--   Bước A: ALTER ENUM tạm thời chứa cả giá trị cũ và giá trị mới
--   Bước B: UPDATE dữ liệu cũ sang trạng thái chuẩn
--   Bước C: ALTER ENUM lần cuối chỉ còn trạng thái chuẩn

SET @db = (SELECT DATABASE());

-- ============================================================
-- 1. BANG_BAN – TRANG_THAI_BAN
--    ENUM chuẩn: ('TRONG','DA_DAT','CO_KHACH','DANG_DON','BAO_TRI')
-- ============================================================

-- Bước A: ALTER ENUM tạm thời (cũ + mới — đầy đủ)
ALTER TABLE `Ban` MODIFY COLUMN `TrangThai`
  ENUM(
    -- chuẩn mới
    'TRONG','DA_DAT','CO_KHACH','DANG_DON','BAO_TRI',
    -- tiếng Việt có dấu
    'Trống','Đã đặt','Có khách','Đang dọn','Bảo trì',
    -- tiếng Anh thường
    'available','reserved','occupied','cleaning','maintenance',
    -- tiếng Anh hoa
    'Available','Reserved','Occupied','Maintenance',
    -- dirty / DIRTY
    'Dirty','DIRTY',
    -- frontend cũ
    'BAN','GIU_CHO','CAN_DON','DANG_SU_DUNG'
  ) NOT NULL DEFAULT 'TRONG';

-- Bước B: UPDATE dữ liệu cũ sang chuẩn
-- Tiếng Việt có dấu
UPDATE `Ban` SET `TrangThai` = 'TRONG'    WHERE `TrangThai` = 'Trống';
UPDATE `Ban` SET `TrangThai` = 'DA_DAT'   WHERE `TrangThai` = 'Đã đặt';
UPDATE `Ban` SET `TrangThai` = 'CO_KHACH' WHERE `TrangThai` = 'Có khách';
UPDATE `Ban` SET `TrangThai` = 'DANG_DON' WHERE `TrangThai` = 'Đang dọn';
UPDATE `Ban` SET `TrangThai` = 'BAO_TRI'  WHERE `TrangThai` = 'Bảo trì';

-- Tiếng Anh thường
UPDATE `Ban` SET `TrangThai` = 'TRONG'    WHERE `TrangThai` = 'available';
UPDATE `Ban` SET `TrangThai` = 'DA_DAT'   WHERE `TrangThai` = 'reserved';
UPDATE `Ban` SET `TrangThai` = 'CO_KHACH' WHERE `TrangThai` = 'occupied';
UPDATE `Ban` SET `TrangThai` = 'DANG_DON' WHERE `TrangThai` = 'cleaning';
UPDATE `Ban` SET `TrangThai` = 'BAO_TRI'  WHERE `TrangThai` = 'maintenance';

-- Tiếng Anh hoa
UPDATE `Ban` SET `TrangThai` = 'TRONG'    WHERE `TrangThai` = 'Available';
UPDATE `Ban` SET `TrangThai` = 'DA_DAT'   WHERE `TrangThai` = 'Reserved';
UPDATE `Ban` SET `TrangThai` = 'CO_KHACH' WHERE `TrangThai` = 'Occupied';
UPDATE `Ban` SET `TrangThai` = 'BAO_TRI'  WHERE `TrangThai` = 'Maintenance';

-- Dirty / DIRTY
UPDATE `Ban` SET `TrangThai` = 'DANG_DON' WHERE `TrangThai` = 'Dirty';
UPDATE `Ban` SET `TrangThai` = 'DANG_DON' WHERE `TrangThai` = 'DIRTY';

-- Frontend cũ
UPDATE `Ban` SET `TrangThai` = 'BAO_TRI'  WHERE `TrangThai` = 'BAN';
UPDATE `Ban` SET `TrangThai` = 'DA_DAT'   WHERE `TrangThai` = 'GIU_CHO';
UPDATE `Ban` SET `TrangThai` = 'BAO_TRI'  WHERE `TrangThai` = 'CAN_DON';
UPDATE `Ban` SET `TrangThai` = 'CO_KHACH' WHERE `TrangThai` = 'DANG_SU_DUNG';

-- Bước C: ALTER ENUM cuối chỉ còn chuẩn
ALTER TABLE `Ban` MODIFY COLUMN `TrangThai`
  ENUM('TRONG','DA_DAT','CO_KHACH','DANG_DON','BAO_TRI') NOT NULL DEFAULT 'TRONG';

-- ============================================================
-- 2. BANG_DATBAN – TRANG_THAI_DAT_BAN
--    ENUM chuẩn: ('CHO_XAC_NHAN','DA_XAC_NHAN','DA_NHAN_BAN','HOAN_THANH','KHONG_DEN','DA_HUY','TU_CHOI_HET_CHO')
-- ============================================================

-- Bước A: ALTER ENUM tạm thời (cũ + mới — đầy đủ)
ALTER TABLE `DatBan` MODIFY COLUMN `TrangThai`
  ENUM(
    -- chuẩn mới
    'CHO_XAC_NHAN','DA_XAC_NHAN','DA_NHAN_BAN','HOAN_THANH','KHONG_DEN','DA_HUY','TU_CHOI_HET_CHO',
    -- tiếng Việt có dấu
    'Yêu cầu đặt bàn','Đã xác nhận','Đã hoàn thành','Đã hủy','Không đến',
    -- tiếng Anh
    'Pending','Confirmed','Seated','Completed','Cancelled','NoShow','Expired',
    -- frontend cũ
    'YEU_CAU_DAT_BAN','GIU_CHO_TAM','CAN_GOI_LAI',
    'DA_CHECK_IN','DA_XEP_BAN','DA_HOAN_THANH','DA_GHI_NHAN','EXPIRED',
    'DA_DEN'
  ) NOT NULL DEFAULT 'CHO_XAC_NHAN';

-- Bước B: UPDATE dữ liệu cũ sang chuẩn
-- Tiếng Việt có dấu
UPDATE `DatBan` SET `TrangThai` = 'CHO_XAC_NHAN' WHERE `TrangThai` = 'Yêu cầu đặt bàn';
UPDATE `DatBan` SET `TrangThai` = 'DA_XAC_NHAN'  WHERE `TrangThai` = 'Đã xác nhận';
UPDATE `DatBan` SET `TrangThai` = 'HOAN_THANH'   WHERE `TrangThai` = 'Đã hoàn thành';
UPDATE `DatBan` SET `TrangThai` = 'DA_HUY'       WHERE `TrangThai` = 'Đã hủy';
UPDATE `DatBan` SET `TrangThai` = 'KHONG_DEN'    WHERE `TrangThai` = 'Không đến';

-- Tiếng Anh
UPDATE `DatBan` SET `TrangThai` = 'CHO_XAC_NHAN' WHERE `TrangThai` = 'Pending';
UPDATE `DatBan` SET `TrangThai` = 'DA_XAC_NHAN'  WHERE `TrangThai` = 'Confirmed';
UPDATE `DatBan` SET `TrangThai` = 'DA_NHAN_BAN'  WHERE `TrangThai` = 'Seated';
UPDATE `DatBan` SET `TrangThai` = 'HOAN_THANH'   WHERE `TrangThai` = 'Completed';
UPDATE `DatBan` SET `TrangThai` = 'DA_HUY'       WHERE `TrangThai` = 'Cancelled';
UPDATE `DatBan` SET `TrangThai` = 'KHONG_DEN'    WHERE `TrangThai` = 'NoShow';
UPDATE `DatBan` SET `TrangThai` = 'KHONG_DEN'    WHERE `TrangThai` = 'Expired';

-- Frontend cũ
UPDATE `DatBan` SET `TrangThai` = 'CHO_XAC_NHAN' WHERE `TrangThai` = 'YEU_CAU_DAT_BAN';
UPDATE `DatBan` SET `TrangThai` = 'CHO_XAC_NHAN' WHERE `TrangThai` = 'GIU_CHO_TAM';
UPDATE `DatBan` SET `TrangThai` = 'CHO_XAC_NHAN' WHERE `TrangThai` = 'CAN_GOI_LAI';
UPDATE `DatBan` SET `TrangThai` = 'DA_NHAN_BAN'  WHERE `TrangThai` = 'DA_CHECK_IN';
UPDATE `DatBan` SET `TrangThai` = 'DA_NHAN_BAN'  WHERE `TrangThai` = 'DA_XEP_BAN';
UPDATE `DatBan` SET `TrangThai` = 'HOAN_THANH'   WHERE `TrangThai` = 'DA_HOAN_THANH';
UPDATE `DatBan` SET `TrangThai` = 'DA_XAC_NHAN'  WHERE `TrangThai` = 'DA_GHI_NHAN';
UPDATE `DatBan` SET `TrangThai` = 'KHONG_DEN'    WHERE `TrangThai` = 'EXPIRED';
UPDATE `DatBan` SET `TrangThai` = 'DA_NHAN_BAN'  WHERE `TrangThai` = 'DA_DEN';

-- Bước C: ALTER ENUM cuối chỉ còn chuẩn
ALTER TABLE `DatBan` MODIFY COLUMN `TrangThai`
  ENUM('CHO_XAC_NHAN','DA_XAC_NHAN','DA_NHAN_BAN','HOAN_THANH','KHONG_DEN','DA_HUY','TU_CHOI_HET_CHO') NOT NULL DEFAULT 'CHO_XAC_NHAN';

-- ============================================================
-- 3. BANG_DONHANG – TRANG_THAI_DON_HANG
--    ENUM chuẩn: ('DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_THANH_TOAN','DA_HUY')
-- ============================================================

-- Bước A: ALTER ENUM tạm thời (cũ + mới — đầy đủ)
ALTER TABLE `DonHang` MODIFY COLUMN `TrangThai`
  ENUM(
    -- chuẩn mới
    'DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_THANH_TOAN','DA_HUY',
    -- tiếng Việt có dấu
    'Mới tạo','Moi_tao','Đã thanh toán','Hoàn thành','Đã hủy',
    -- tiếng Anh
    'Pending','Confirmed','Preparing','Serving','Ready','Served','Completed','Paid','Cancelled',
    -- frontend cũ
    'MOI_TAO','CHO_XU_LY','CHO_CHE_BIEN','DANG_CHE_BIEN',
    'SAN_SANG','DA_PHUC_VU','DA_XAC_NHAN'
  ) NOT NULL DEFAULT 'DANG_CHUAN_BI';

-- Bước B: UPDATE dữ liệu cũ sang chuẩn
-- Tiếng Việt có dấu
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'Mới tạo';
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'Moi_tao';
UPDATE `DonHang` SET `TrangThai` = 'DA_THANH_TOAN' WHERE `TrangThai` = 'Đã thanh toán';
UPDATE `DonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Hoàn thành';
UPDATE `DonHang` SET `TrangThai` = 'DA_HUY'        WHERE `TrangThai` = 'Đã hủy';

-- Tiếng Anh
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'Pending';
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'Confirmed';
UPDATE `DonHang` SET `TrangThai` = 'DANG_PHUC_VU'  WHERE `TrangThai` = 'Preparing';
UPDATE `DonHang` SET `TrangThai` = 'DANG_PHUC_VU'  WHERE `TrangThai` = 'Serving';
UPDATE `DonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Ready';
UPDATE `DonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Served';
UPDATE `DonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Completed';
UPDATE `DonHang` SET `TrangThai` = 'DA_THANH_TOAN' WHERE `TrangThai` = 'Paid';
UPDATE `DonHang` SET `TrangThai` = 'DA_HUY'        WHERE `TrangThai` = 'Cancelled';

-- Frontend cũ
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'MOI_TAO';
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'CHO_XU_LY';
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'CHO_CHE_BIEN';
UPDATE `DonHang` SET `TrangThai` = 'DANG_PHUC_VU'  WHERE `TrangThai` = 'DANG_CHE_BIEN';
UPDATE `DonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'SAN_SANG';
UPDATE `DonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'DA_PHUC_VU';
UPDATE `DonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'DA_XAC_NHAN';

-- Bước C: ALTER ENUM cuối chỉ còn chuẩn
ALTER TABLE `DonHang` MODIFY COLUMN `TrangThai`
  ENUM('DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_THANH_TOAN','DA_HUY') NOT NULL DEFAULT 'DANG_CHUAN_BI';

-- ============================================================
-- 4. BANG_CHITIETDONHANG – TRANG_THAI_CHI_TIET_DON_HANG
--    ENUM chuẩn: ('DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_HUY')
-- ============================================================

-- Bước A: ALTER ENUM tạm thời (cũ + mới — đầy đủ)
ALTER TABLE `ChiTietDonHang` MODIFY COLUMN `TrangThai`
  ENUM(
    -- chuẩn mới
    'DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_HUY',
    -- tiếng Việt có dấu
    'Mới tạo','Đang phục vụ','Đã hoàn thành','Đã hủy',
    -- tiếng Anh
    'Pending','Preparing','Ready','Served','Done','Completed','Cancelled',
    -- frontend cũ
    'SAN_SANG','DA_PHUC_VU'
  ) NOT NULL DEFAULT 'DANG_CHUAN_BI';

-- Bước B: UPDATE dữ liệu cũ sang chuẩn
-- Tiếng Việt có dấu
UPDATE `ChiTietDonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'Mới tạo';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'DANG_PHUC_VU'  WHERE `TrangThai` = 'Đang phục vụ';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Đã hoàn thành';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'DA_HUY'        WHERE `TrangThai` = 'Đã hủy';

-- Tiếng Anh
UPDATE `ChiTietDonHang` SET `TrangThai` = 'DANG_CHUAN_BI' WHERE `TrangThai` = 'Pending';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'DANG_PHUC_VU'  WHERE `TrangThai` = 'Preparing';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Ready';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Served';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Done';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'Completed';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'DA_HUY'        WHERE `TrangThai` = 'Cancelled';

-- Frontend cũ
UPDATE `ChiTietDonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'SAN_SANG';
UPDATE `ChiTietDonHang` SET `TrangThai` = 'HOAN_THANH'    WHERE `TrangThai` = 'DA_PHUC_VU';

-- Bước C: ALTER ENUM cuối chỉ còn chuẩn
ALTER TABLE `ChiTietDonHang` MODIFY COLUMN `TrangThai`
  ENUM('DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_HUY') NOT NULL DEFAULT 'DANG_CHUAN_BI';

-- ============================================================
-- 5. BANG_THANHTOAN – TRANG_THAI_THANH_TOAN
--    ENUM chuẩn: ('THANH_CONG','THAT_BAI','DA_HOAN_TIEN')
-- ============================================================

-- Bước A: ALTER ENUM tạm thời (cũ + mới — đầy đủ)
ALTER TABLE `ThanhToan` MODIFY COLUMN `TrangThai`
  ENUM(
    -- chuẩn mới
    'THANH_CONG','THAT_BAI','DA_HOAN_TIEN',
    -- tiếng Việt có dấu
    'Thành công','Thất bại','Đã hoàn tiền',
    -- tiếng Anh
    'Success','Failed','Refunded','Pending','Cancelled'
  ) NOT NULL DEFAULT 'THANH_CONG';

-- Bước B: UPDATE dữ liệu cũ sang chuẩn
-- Tiếng Việt có dấu
UPDATE `ThanhToan` SET `TrangThai` = 'THANH_CONG'   WHERE `TrangThai` = 'Thành công';
UPDATE `ThanhToan` SET `TrangThai` = 'THAT_BAI'     WHERE `TrangThai` = 'Thất bại';
UPDATE `ThanhToan` SET `TrangThai` = 'DA_HOAN_TIEN' WHERE `TrangThai` = 'Đã hoàn tiền';

-- Tiếng Anh
UPDATE `ThanhToan` SET `TrangThai` = 'THANH_CONG'   WHERE `TrangThai` = 'Success';
UPDATE `ThanhToan` SET `TrangThai` = 'THAT_BAI'     WHERE `TrangThai` = 'Failed';
UPDATE `ThanhToan` SET `TrangThai` = 'DA_HOAN_TIEN' WHERE `TrangThai` = 'Refunded';
UPDATE `ThanhToan` SET `TrangThai` = 'THAT_BAI'     WHERE `TrangThai` = 'Pending';
UPDATE `ThanhToan` SET `TrangThai` = 'THAT_BAI'     WHERE `TrangThai` = 'Cancelled';

-- Bước C: ALTER ENUM cuối chỉ còn chuẩn
ALTER TABLE `ThanhToan` MODIFY COLUMN `TrangThai`
  ENUM('THANH_CONG','THAT_BAI','DA_HOAN_TIEN') NOT NULL DEFAULT 'THANH_CONG';

-- ============================================================
-- 6. CÁC VIEW – cần DROP + CREATE LẠI vì ENUM thay đổi
--    ⚠️ Dùng đúng tên bảng/cột theo mysql_init_schema.sql:
--      - Bảng thực đơn: ThucDon (MaMon, TenMon, Gia)
--      - Bảng chi tiết: ChiTietDonHang (MaMon, SoLuong, ThanhTien)
--      - Bảng hóa đơn: HoaDon (MaHoaDon, MaDonHang, TongTien, GiamGia, ThanhTien)
--      - Bảng thanh toán: ThanhToan (MaThanhToan, MaHoaDon, TrangThai)
-- ============================================================

DROP VIEW IF EXISTS `V_DoanhThuNgay`;
CREATE VIEW `V_DoanhThuNgay` AS
SELECT
    DATE(hd.NgayXuat) AS Ngay,
    COUNT(hd.MaHoaDon) AS SoHoaDon,
    SUM(hd.TongTien) AS TongTruocGiam,
    SUM(hd.GiamGia) AS TongGiam,
    SUM(hd.ThanhTien) AS DoanhThu
FROM HoaDon hd
JOIN ThanhToan tt
    ON tt.MaHoaDon = hd.MaHoaDon
   AND tt.TrangThai = 'THANH_CONG'
GROUP BY DATE(hd.NgayXuat);

DROP VIEW IF EXISTS `V_MonBanChay`;
CREATE VIEW `V_MonBanChay` AS
SELECT
    td.MaMon,
    td.TenMon,
    dm.TenDanhMuc,
    SUM(ct.SoLuong) AS TongSoLuong,
    SUM(ct.ThanhTien) AS TongDoanhThu
FROM ChiTietDonHang ct
JOIN ThucDon td
    ON td.MaMon = ct.MaMon
JOIN DanhMuc dm
    ON dm.MaDanhMuc = td.MaDanhMuc
JOIN DonHang dh
    ON dh.MaDonHang = ct.MaDonHang
   AND dh.TrangThai <> 'DA_HUY'
GROUP BY td.MaMon, td.TenMon, dm.TenDanhMuc
ORDER BY TongSoLuong DESC;

DROP VIEW IF EXISTS `V_TinhTrangBan`;
CREATE VIEW `V_TinhTrangBan` AS
SELECT
    b.MaBan,
    b.TenBan,
    b.KhuVuc,
    b.SoBan,
    b.SoChoNgoi,
    b.ViTri,
    b.GhiChu,
    b.TrangThai,
    dh.MaDonHang,
    dh.TrangThai AS TrangThaiDon
FROM Ban b
LEFT JOIN DonHang dh
    ON dh.MaDonHang = (
        SELECT dh2.MaDonHang
        FROM DonHang dh2
        WHERE dh2.MaBan = b.MaBan
          AND dh2.TrangThai NOT IN ('DA_THANH_TOAN', 'DA_HUY')
        ORDER BY dh2.NgayTao DESC
        LIMIT 1
    );

-- ============================================================
-- DONE
-- ============================================================
