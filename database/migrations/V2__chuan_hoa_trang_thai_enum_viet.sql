-- ============================================================
-- Migration V2: Chuan hoa ENUM trang thai nghiep vu sang tieng Viet
-- Theo ADR-001 + Q1 (AUDIT_NGHIEP_VU.md Muc 0 + Muc 4)
-- ============================================================
-- Trinh tu thuc hien an toan:
--  1. Mo rong ENUM de chua GIA TRI CU (tieng Anh) + GIA TRI MOI (tieng Viet)
--  2. UPDATE du lieu cu sang gia tri Viet
--  3. Thu hep ENUM ve chi gia tri Viet chinh thuc
--  4. Cap nhat constants.ts + contracts.js + seed
-- ============================================================

-- ============================================================
-- 1. BAN
-- ============================================================
-- Cu: Available, Occupied, Reserved, Maintenance
-- Moi: TRONG, DA_DAT, CO_KHACH, DANG_DON, BAO_TRI
-- ============================================================
ALTER TABLE Ban
  MODIFY COLUMN TrangThai ENUM(
    'Available','Occupied','Reserved','Maintenance',
    'TRONG','DA_DAT','CO_KHACH','DANG_DON','BAO_TRI'
  ) NOT NULL DEFAULT 'Available';

UPDATE Ban SET TrangThai = 'TRONG'      WHERE TrangThai = 'Available';
UPDATE Ban SET TrangThai = 'CO_KHACH'   WHERE TrangThai = 'Occupied';
UPDATE Ban SET TrangThai = 'DA_DAT'     WHERE TrangThai = 'Reserved';
UPDATE Ban SET TrangThai = 'BAO_TRI'    WHERE TrangThai = 'Maintenance';

ALTER TABLE Ban
  MODIFY COLUMN TrangThai ENUM(
    'TRONG','DA_DAT','CO_KHACH','DANG_DON','BAO_TRI'
  ) NOT NULL DEFAULT 'TRONG';


-- ============================================================
-- 2. DATBAN
-- ============================================================
-- Cu: 23 gia tri tron Anh+Viet (Pending, Confirmed, Seated, Completed, Cancelled, NoShow, Expired, YEU_CAU_DAT_BAN, GIU_CHO_TAM, DA_XAC_NHAN, DA_GAN_BAN, CAN_GOI_LAI, TU_CHOI_HET_CHO, CHO_XAC_NHAN, DA_GHI_NHAN, DA_CHECK_IN, DA_XEP_BAN, DANG_PHUC_VU, DA_NHAN_BAN, DA_HOAN_THANH, DA_HUY, KHONG_DEN)
-- Moi: CHO_XAC_NHAN, DA_XAC_NHAN, DA_NHAN_BAN, HOAN_THANH, DA_HUY, KHONG_DEN, HET_HAN
-- ============================================================
ALTER TABLE DatBan
  MODIFY COLUMN TrangThai ENUM(
    'Pending','Confirmed','Seated','Completed','Cancelled','NoShow','Expired',
    'YEU_CAU_DAT_BAN','GIU_CHO_TAM','DA_XAC_NHAN','DA_GAN_BAN','CAN_GOI_LAI',
    'TU_CHOI_HET_CHO','CHO_XAC_NHAN','DA_GHI_NHAN','DA_CHECK_IN','DA_XEP_BAN',
    'DANG_PHUC_VU','DA_NHAN_BAN','DA_HOAN_THANH','DA_HUY','KHONG_DEN',
    'CHO_XAC_NHAN','DA_XAC_NHAN','DA_NHAN_BAN','HOAN_THANH','HET_HAN'
  ) NOT NULL DEFAULT 'Pending';

UPDATE DatBan SET TrangThai = 'CHO_XAC_NHAN' WHERE TrangThai IN ('Pending','YEU_CAU_DAT_BAN','GIU_CHO_TAM','CAN_GOI_LAI','CHO_XAC_NHAN');
UPDATE DatBan SET TrangThai = 'DA_XAC_NHAN'  WHERE TrangThai IN ('Confirmed','DA_XAC_NHAN','DA_GAN_BAN','DA_GHI_NHAN');
UPDATE DatBan SET TrangThai = 'DA_NHAN_BAN'  WHERE TrangThai IN ('Seated','DA_CHECK_IN','DA_XEP_BAN','DANG_PHUC_VU','DA_NHAN_BAN');
UPDATE DatBan SET TrangThai = 'HOAN_THANH'   WHERE TrangThai = 'Completed';
UPDATE DatBan SET TrangThai = 'DA_HUY'       WHERE TrangThai IN ('Cancelled','TU_CHOI_HET_CHO');
UPDATE DatBan SET TrangThai = 'KHONG_DEN'    WHERE TrangThai = 'NoShow';
UPDATE DatBan SET TrangThai = 'HET_HAN'      WHERE TrangThai = 'Expired';

ALTER TABLE DatBan
  MODIFY COLUMN TrangThai ENUM(
    'CHO_XAC_NHAN','DA_XAC_NHAN','DA_NHAN_BAN','HOAN_THANH','DA_HUY','KHONG_DEN','HET_HAN'
  ) NOT NULL DEFAULT 'CHO_XAC_NHAN';


-- ============================================================
-- 3. DONHANG
-- ============================================================
-- Cu: Pending, Confirmed, Preparing, Ready, Served, Serving, Paid, Cancelled, Completed + CHO_XU_LY, DANG_CHE_BIEN, SAN_SANG, DANG_PHUC_VU, DA_THANH_TOAN, DA_HUY
-- Moi: DANG_CHUAN_BI, DA_XAC_NHAN, DANG_CHE_BIEN, SAN_SANG, DA_PHUC_VU, HOAN_THANH, DA_HUY, DA_THANH_TOAN, DA_HOAN_TIEN
-- ============================================================
ALTER TABLE DonHang
  MODIFY COLUMN TrangThai ENUM(
    'Pending','Confirmed','Preparing','Ready','Served','Serving','Paid','Cancelled','Completed',
    'DANG_CHUAN_BI','DA_XAC_NHAN','DANG_CHE_BIEN','SAN_SANG','DANG_PHUC_VU','DA_THANH_TOAN','DA_HUY',
    'HOAN_THANH','DA_HOAN_TIEN'
  ) NOT NULL DEFAULT 'Pending';

UPDATE DonHang SET TrangThai = 'DANG_CHUAN_BI' WHERE TrangThai IN ('Pending','CHO_XU_LY');
UPDATE DonHang SET TrangThai = 'DA_XAC_NHAN'   WHERE TrangThai = 'Confirmed';
UPDATE DonHang SET TrangThai = 'DANG_CHE_BIEN' WHERE TrangThai IN ('Preparing','DANG_CHE_BIEN');
UPDATE DonHang SET TrangThai = 'SAN_SANG'      WHERE TrangThai = 'Ready';
UPDATE DonHang SET TrangThai = 'DA_PHUC_VU'    WHERE TrangThai IN ('Served','Serving','DANG_PHUC_VU');
UPDATE DonHang SET TrangThai = 'HOAN_THANH'    WHERE TrangThai = 'Completed';
UPDATE DonHang SET TrangThai = 'DA_HUY'        WHERE TrangThai = 'Cancelled';
UPDATE DonHang SET TrangThai = 'DA_THANH_TOAN' WHERE TrangThai = 'Paid';

ALTER TABLE DonHang
  MODIFY COLUMN TrangThai ENUM(
    'DANG_CHUAN_BI','DA_XAC_NHAN','DANG_CHE_BIEN','SAN_SANG','DA_PHUC_VU','HOAN_THANH','DA_HUY','DA_THANH_TOAN','DA_HOAN_TIEN'
  ) NOT NULL DEFAULT 'DANG_CHUAN_BI';


-- ============================================================
-- 4. CHI TIET DON HANG
-- ============================================================
-- Cu: Pending, Preparing, Ready, Served, Done, Cancelled
-- Moi: DANG_CHUAN_BI, DANG_CHE_BIEN, SAN_SANG, DA_PHUC_VU, HOAN_THANH, DA_HUY
-- ============================================================
ALTER TABLE ChiTietDonHang
  MODIFY COLUMN TrangThai ENUM(
    'Pending','Preparing','Ready','Served','Done','Cancelled',
    'DANG_CHUAN_BI','DANG_CHE_BIEN','SAN_SANG','DA_PHUC_VU','HOAN_THANH','DA_HUY'
  ) NOT NULL DEFAULT 'Pending';

UPDATE ChiTietDonHang SET TrangThai = 'DANG_CHUAN_BI' WHERE TrangThai IN ('Pending','CHO_CHE_BIEN');
UPDATE ChiTietDonHang SET TrangThai = 'DANG_CHE_BIEN' WHERE TrangThai IN ('Preparing','DANG_CHE_BIEN');
UPDATE ChiTietDonHang SET TrangThai = 'SAN_SANG'      WHERE TrangThai = 'Ready';
UPDATE ChiTietDonHang SET TrangThai = 'DA_PHUC_VU'    WHERE TrangThai = 'Served';
UPDATE ChiTietDonHang SET TrangThai = 'HOAN_THANH'    WHERE TrangThai = 'Done';
UPDATE ChiTietDonHang SET TrangThai = 'DA_HUY'        WHERE TrangThai = 'Cancelled';

ALTER TABLE ChiTietDonHang
  MODIFY COLUMN TrangThai ENUM(
    'DANG_CHUAN_BI','DANG_CHE_BIEN','SAN_SANG','DA_PHUC_VU','HOAN_THANH','DA_HUY'
  ) NOT NULL DEFAULT 'DANG_CHUAN_BI';


-- ============================================================
-- 5. THANH TOAN
-- ============================================================
-- Cu: Pending, Success, Failed, Refunded
-- Moi: CHO_THANH_TOAN, THANH_CONG, THAT_BAI, DA_HOAN_TIEN
-- ============================================================
ALTER TABLE ThanhToan
  MODIFY COLUMN TrangThai ENUM(
    'Pending','Success','Failed','Refunded',
    'CHO_THANH_TOAN','THANH_CONG','THAT_BAI','DA_HOAN_TIEN'
  ) NOT NULL DEFAULT 'Pending';

UPDATE ThanhToan SET TrangThai = 'CHO_THANH_TOAN' WHERE TrangThai = 'Pending';
UPDATE ThanhToan SET TrangThai = 'THANH_CONG'     WHERE TrangThai = 'Success';
UPDATE ThanhToan SET TrangThai = 'THAT_BAI'       WHERE TrangThai = 'Failed';
UPDATE ThanhToan SET TrangThai = 'DA_HOAN_TIEN'   WHERE TrangThai = 'Refunded';

ALTER TABLE ThanhToan
  MODIFY COLUMN TrangThai ENUM(
    'CHO_THANH_TOAN','THANH_CONG','THAT_BAI','DA_HOAN_TIEN'
  ) NOT NULL DEFAULT 'CHO_THANH_TOAN';
