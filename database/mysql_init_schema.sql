DROP DATABASE IF EXISTS QuanNhaHang;

CREATE DATABASE IF NOT EXISTS QuanNhaHang
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE QuanNhaHang;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS NguoiDung (
    MaND        VARCHAR(50) PRIMARY KEY,
    TenND       VARCHAR(100) NOT NULL,
    Email       VARCHAR(100) NOT NULL UNIQUE,
    MatKhau     VARCHAR(255) NOT NULL,
    VaiTro      ENUM('Admin','NhanVien','KhachHang') NOT NULL DEFAULT 'KhachHang',
    TrangThai   ENUM('Active','Inactive','Banned') NOT NULL DEFAULT 'Active',
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS NhanVien (
    MaNV        VARCHAR(50) PRIMARY KEY,
    MaND        VARCHAR(50) NOT NULL UNIQUE,
    HoTen       VARCHAR(100) NOT NULL,
    GioiTinh    ENUM('Nam','Nu','Khac'),
    SDT         VARCHAR(20),
    DiaChi      VARCHAR(255),
    ChucVu      VARCHAR(50) NOT NULL,
    LuongCoBan  DECIMAL(15,2) DEFAULT 0,
    NgayVaoLam  DATE,
    TinhTrang   ENUM('Active','Inactive','NghiViec') NOT NULL DEFAULT 'Active',
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_NhanVien_NguoiDung
        FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS KhachHang (
    MaKH        VARCHAR(50) PRIMARY KEY,
    MaND        VARCHAR(50) UNIQUE,
    TenKH       VARCHAR(100) NOT NULL,
    SDT         VARCHAR(20) UNIQUE,
    DiaChi      VARCHAR(255),
    DiemTichLuy INT NOT NULL DEFAULT 0,
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_KhachHang_NguoiDung
        FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Ban (
    MaBan       VARCHAR(50) PRIMARY KEY,
    TenBan      VARCHAR(50),
    KhuVuc      VARCHAR(50),
    SoBan       INT NOT NULL,
    SoChoNgoi   INT NOT NULL,
    ViTri       VARCHAR(100),
    GhiChu      VARCHAR(255),
    TrangThai   ENUM('TRONG','DA_DAT','CO_KHACH','DANG_DON','BAO_TRI') NOT NULL DEFAULT 'TRONG',
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_Ban_SoBan UNIQUE (SoBan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS QRCode (
    MaQR        VARCHAR(50) PRIMARY KEY,
    MaBan       VARCHAR(50) NOT NULL UNIQUE,
    DuongDanQR  VARCHAR(500) NOT NULL,
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayHetHan  DATETIME,
    TrangThai   ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    CONSTRAINT FK_QRCode_Ban
        FOREIGN KEY (MaBan) REFERENCES Ban(MaBan) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS DanhMuc (
    MaDanhMuc   VARCHAR(50) PRIMARY KEY,
    TenDanhMuc  VARCHAR(100) NOT NULL,
    MoTa        VARCHAR(255),
    ThuTu       INT NOT NULL DEFAULT 0,
    TrangThai   ENUM('Active','Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ThucDon (
    MaMon           VARCHAR(50) PRIMARY KEY,
    MaDanhMuc       VARCHAR(50),
    TenMon          VARCHAR(150) NOT NULL,
    MoTa            VARCHAR(500),
    Gia             DECIMAL(15,2) NOT NULL,
    HinhAnh         VARCHAR(500),
    ThoiGianChuanBi INT DEFAULT 0,
    TrangThai       ENUM('Available','Unavailable','Deleted') NOT NULL DEFAULT 'Available',
    NgayTao         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_ThucDon_DanhMuc
        FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc(MaDanhMuc) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. MA GIAM GIA
-- ============================================================
CREATE TABLE IF NOT EXISTS MaGiamGia (
    MaCode          VARCHAR(50) PRIMARY KEY,
    TenCode         VARCHAR(100) NOT NULL,
    GiaTri          DECIMAL(10,2) NOT NULL,
    LoaiGiam        ENUM('percentage','fixed_amount') NOT NULL,
    LoaiMa          ENUM('PUBLIC','CUSTOMER','LOYALTY','VIP','BIRTHDAY') NOT NULL DEFAULT 'PUBLIC',
    MaKH            VARCHAR(50),
    DiemDaDoi       INT DEFAULT NULL,
    GiaTriToiDa     DECIMAL(15,2),
    DonHangToiThieu DECIMAL(15,2) DEFAULT 0,
    NgayBatDau      DATE NOT NULL,
    NgayKetThuc     DATE NOT NULL,
    SoLanToiDa      INT DEFAULT NULL,
    SoLanDaDung     INT NOT NULL DEFAULT 0,
    TrangThai       ENUM('Active','Inactive','HetHan') NOT NULL DEFAULT 'Active',
    NguonTao        VARCHAR(50) DEFAULT NULL,
    PhamVi          ENUM('DAT_BAN','DON_HANG','CA_HAI') NOT NULL DEFAULT 'CA_HAI',
    CONSTRAINT FK_MaGiamGia_KhachHang
        FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. ĐẶT BÀN
-- ============================================================
CREATE TABLE IF NOT EXISTS DatBan (
    MaDatBan       VARCHAR(50) PRIMARY KEY,
    MaKH           VARCHAR(50),
    MaBan          VARCHAR(50),
    MaNV           VARCHAR(50),
    TenKhachDatBan VARCHAR(100),
    SDTDatBan      VARCHAR(20),
    EmailDatBan    VARCHAR(100),
    NgayDat        DATE NOT NULL,
    GioDat         TIME NOT NULL,
    GioKetThuc     TIME,
    SoNguoi        INT NOT NULL,
    GhiChu         VARCHAR(500),
    KhuVucUuTien   VARCHAR(50),
    GhiChuNoiBo    VARCHAR(500),
    NguonTao       ENUM('WEB','NOI_BO') NOT NULL DEFAULT 'WEB',
    TrangThai      ENUM('CHO_XAC_NHAN','DA_XAC_NHAN','DA_NHAN_BAN','HOAN_THANH','KHONG_DEN','DA_HUY','TU_CHOI_HET_CHO') NOT NULL DEFAULT 'CHO_XAC_NHAN',
    NgayTao        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_DatBan_KhachHang
        FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE SET NULL,
    CONSTRAINT FK_DatBan_Ban
        FOREIGN KEY (MaBan) REFERENCES Ban(MaBan) ON DELETE SET NULL,
    CONSTRAINT FK_DatBan_NhanVien
        FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. ĐƠN HÀNG
-- ============================================================
CREATE TABLE IF NOT EXISTS DonHang (
    MaDonHang   VARCHAR(50) PRIMARY KEY,
    MaKH        VARCHAR(50),
    MaBan       VARCHAR(50),
    MaNV        VARCHAR(50),
    MaDatBan    VARCHAR(50),
    LoaiDon     ENUM('TAI_BAN') NOT NULL DEFAULT 'TAI_BAN',
    TongTien    DECIMAL(15,2) NOT NULL DEFAULT 0,
    TrangThai   ENUM('DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_THANH_TOAN','DA_HUY') NOT NULL DEFAULT 'DANG_CHUAN_BI',
    NguonTao    ENUM('TaiQuay','QRCode','DatBan','Online') NOT NULL DEFAULT 'TaiQuay',
    GhiChu      VARCHAR(500),
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_DonHang_KhachHang
        FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE SET NULL,
    CONSTRAINT FK_DonHang_Ban
        FOREIGN KEY (MaBan) REFERENCES Ban(MaBan) ON DELETE SET NULL,
    CONSTRAINT FK_DonHang_NhanVien
        FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE SET NULL,
    CONSTRAINT FK_DonHang_DatBan
        FOREIGN KEY (MaDatBan) REFERENCES DatBan(MaDatBan) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. CHI TIẾT ĐƠN HÀNG
-- ============================================================
CREATE TABLE IF NOT EXISTS ChiTietDonHang (
    MaChiTiet   VARCHAR(50) PRIMARY KEY,
    MaDonHang   VARCHAR(50) NOT NULL,
    MaMon       VARCHAR(50) NOT NULL,
    SoLuong     INT NOT NULL,
    DonGia      DECIMAL(15,2) NOT NULL,
    ThanhTien   DECIMAL(15,2) NOT NULL,
    GhiChu      VARCHAR(255),
    TrangThai   ENUM('DANG_CHUAN_BI','DANG_PHUC_VU','HOAN_THANH','DA_HUY') NOT NULL DEFAULT 'DANG_CHUAN_BI',
    NgayTao     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_ChiTietDonHang_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietDonHang_ThucDon
        FOREIGN KEY (MaMon) REFERENCES ThucDon(MaMon) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. HÓA ĐƠN
-- ============================================================
CREATE TABLE IF NOT EXISTS HoaDon (
    MaHoaDon    VARCHAR(50) PRIMARY KEY,
    MaDonHang   VARCHAR(50) NOT NULL UNIQUE,
    MaKH        VARCHAR(50),
    MaNV        VARCHAR(50),
    MaCode      VARCHAR(50),
    TongTien    DECIMAL(15,2) NOT NULL,
    GiamGia     DECIMAL(15,2) NOT NULL DEFAULT 0,
    ThueSuat    DECIMAL(5,2) NOT NULL DEFAULT 0,
    TienThue    DECIMAL(15,2) NOT NULL DEFAULT 0,
    ThanhTien   DECIMAL(15,2) NOT NULL,
    GhiChu      VARCHAR(255),
    NgayXuat    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_HoaDon_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE CASCADE,
    CONSTRAINT FK_HoaDon_KhachHang
        FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE SET NULL,
    CONSTRAINT FK_HoaDon_NhanVien
        FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE SET NULL,
    CONSTRAINT FK_HoaDon_MaGiamGia
        FOREIGN KEY (MaCode) REFERENCES MaGiamGia(MaCode) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. THANH TOÁN
-- ============================================================
CREATE TABLE IF NOT EXISTS ThanhToan (
    MaThanhToan VARCHAR(50) PRIMARY KEY,
    MaHoaDon    VARCHAR(50) NOT NULL,
    PhuongThuc  ENUM('TienMat','ChuyenKhoan','TheNganHang','MoMo','ZaloPay','VNPay') NOT NULL,
    SoTien      DECIMAL(15,2) NOT NULL,
    MaGiaoDich  VARCHAR(100),
    TrangThai   ENUM('THANH_CONG','THAT_BAI','DA_HOAN_TIEN') NOT NULL DEFAULT 'THANH_CONG',
    ThoiGian    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_ThanhToan_HoaDon
        FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. ĐÁNH GIÁ
-- ============================================================
CREATE TABLE IF NOT EXISTS DanhGia (
    MaDanhGia    VARCHAR(50) PRIMARY KEY,
    MaKH         VARCHAR(50) NOT NULL,
    MaDonHang    VARCHAR(50) NOT NULL,
    SoSao        TINYINT NOT NULL,
    NoiDung      VARCHAR(500),
    PhanHoi      VARCHAR(500),
    HinhAnh      LONGTEXT,
    SoLuotHuuIch INT NOT NULL DEFAULT 0,
    NgayDanhGia  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    TrangThai    ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
    CONSTRAINT FK_DanhGia_KhachHang
        FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    CONSTRAINT FK_DanhGia_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE CASCADE,
    CONSTRAINT UQ_DanhGia_MaKH_MaDonHang UNIQUE (MaKH, MaDonHang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. LỊCH SỬ ĐƠN HÀNG
-- ============================================================
CREATE TABLE IF NOT EXISTS LichSuDonHang (
    MaLichSu      VARCHAR(50) PRIMARY KEY,
    MaDonHang     VARCHAR(50) NOT NULL,
    TrangThaiCu   VARCHAR(50),
    TrangThaiMoi  VARCHAR(50) NOT NULL,
    GhiChu        VARCHAR(255),
    NguoiThucHien VARCHAR(50),
    ThoiGian      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_LichSuDonHang_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. LICH SU DIEM TICH LUY
-- ============================================================
CREATE TABLE IF NOT EXISTS LichSuDiemTichLuy (
    MaGiaoDichDiem VARCHAR(50) PRIMARY KEY,
    MaKH           VARCHAR(50) NOT NULL,
    MaDonHang      VARCHAR(50),
    MaVoucher      VARCHAR(50),
    LoaiBienDong   ENUM('CONG','TRU','DIEU_CHINH') NOT NULL DEFAULT 'CONG',
    SoDiem         INT NOT NULL,
    SoDiemTruoc    INT NOT NULL DEFAULT 0,
    SoDiemSau      INT NOT NULL DEFAULT 0,
    MoTa           VARCHAR(255),
    NguoiThucHien  VARCHAR(50),
    NgayTao        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_LichSuDiemTichLuy_KhachHang
        FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    CONSTRAINT FK_LichSuDiemTichLuy_DonHang
        FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE SET NULL,
    CONSTRAINT FK_LichSuDiemTichLuy_MaVoucher
        FOREIGN KEY (MaVoucher) REFERENCES MaGiamGia(MaCode) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. THÔNG BÁO
-- ============================================================
CREATE TABLE IF NOT EXISTS ThongBao (
    MaThongBao   VARCHAR(50) PRIMARY KEY,
    MaND         VARCHAR(50) NOT NULL,
    TieuDe       VARCHAR(200) NOT NULL,
    NoiDung      VARCHAR(500),
    LoaiThongBao ENUM('DonHang','DatBan','DanhGia','HeThong') NOT NULL,
    MaThamChieu  VARCHAR(50),
    DaDoc        BOOLEAN NOT NULL DEFAULT FALSE,
    NgayTao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_ThongBao_NguoiDung
        FOREIGN KEY (MaND) REFERENCES NguoiDung(MaND) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX IDX_Ban_TrangThai ON Ban(TrangThai);
CREATE INDEX IDX_DatBan_NgayDat ON DatBan(NgayDat);
CREATE INDEX IDX_DatBan_TrangThai ON DatBan(TrangThai);
CREATE INDEX IDX_DatBan_MaKH ON DatBan(MaKH);
CREATE INDEX IDX_ThucDon_DanhMuc ON ThucDon(MaDanhMuc);
CREATE INDEX IDX_ThucDon_TrangThai ON ThucDon(TrangThai);
CREATE INDEX IDX_DonHang_NgayTao ON DonHang(NgayTao);
CREATE INDEX IDX_DonHang_TrangThai ON DonHang(TrangThai);
CREATE INDEX IDX_DonHang_MaBan ON DonHang(MaBan);
CREATE INDEX IDX_LichSuDiemTichLuy_MaDonHang ON LichSuDiemTichLuy(MaDonHang);
CREATE INDEX IDX_LichSuDiemTichLuy_MaVoucher ON LichSuDiemTichLuy(MaVoucher);
CREATE INDEX IDX_DonHang_MaKH ON DonHang(MaKH);
CREATE INDEX IDX_ChiTiet_DonHang ON ChiTietDonHang(MaDonHang);
CREATE INDEX IDX_ChiTiet_TrangThai ON ChiTietDonHang(TrangThai);
CREATE INDEX IDX_ThanhToan_HoaDon ON ThanhToan(MaHoaDon);
CREATE INDEX IDX_ThanhToan_TrangThai ON ThanhToan(TrangThai);
CREATE INDEX IDX_DanhGia_TrangThai ON DanhGia(TrangThai);
CREATE INDEX IDX_LichSu_DonHang ON LichSuDonHang(MaDonHang);
CREATE INDEX IDX_LichSuDiemTichLuy_MaKH ON LichSuDiemTichLuy(MaKH);
CREATE INDEX IDX_LichSuDiemTichLuy_NgayTao ON LichSuDiemTichLuy(NgayTao);
CREATE INDEX IDX_LichSuDiemTichLuy_Loai ON LichSuDiemTichLuy(LoaiBienDong);
CREATE INDEX IDX_MaGiamGia_LoaiMa ON MaGiamGia(LoaiMa);
CREATE INDEX IDX_MaGiamGia_PhamVi ON MaGiamGia(PhamVi);
CREATE INDEX IDX_MaGiamGia_MaKH ON MaGiamGia(MaKH);
CREATE INDEX IDX_HoaDon_NgayXuat ON HoaDon(NgayXuat);
CREATE INDEX IDX_HoaDon_MaNV ON HoaDon(MaNV);
CREATE INDEX IDX_Ban_KhuVuc_SoChoNgoi ON Ban(KhuVuc, SoChoNgoi);
CREATE INDEX IDX_ThongBao_MaND ON ThongBao(MaND);
CREATE INDEX IDX_ThongBao_DaDoc ON ThongBao(DaDoc);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VIEWS
-- ============================================================
-- Lưu ý: view nay tinh doanh thu theo HoaDon va chỉ lọc ThanhToan = 'THANH_CONG'.
-- Nếu 1 hóa đơn có nhiều ThanhToan thành công, số liệu có thể bị đếm trùng.
-- Schema hien tai không ep UNIQUE(MaHoaDon) trong ThanhToan, nen day la canh bao khi doc KPI.
CREATE OR REPLACE VIEW V_DoanhThuNgay AS
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

-- Lưu ý: view này đếm món bán chạy theo đơn hàng không bị DA_HUY.
-- Day không phai KPI doanh thu chi tai cac don da DA_THANH_TOAN/HOAN_THANH; chi la tong hop luot mua mon cho don con hieu luc.
CREATE OR REPLACE VIEW V_MonBanChay AS
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

CREATE OR REPLACE VIEW V_TinhTrangBan AS
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

ALTER TABLE DatBan
    ADD COLUMN ChiTietMonAn JSON AFTER KhuVucUuTien;
