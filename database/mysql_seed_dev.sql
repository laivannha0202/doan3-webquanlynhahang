-- ============================================================
USE QuanNhaHang;

-- DEV-ONLY: seed local/demo data only.
-- Khong dung file nay cho production hoac shared env.
-- Tat ca TrangThai su dung ENUM chuan tieng Viet theo mysql_init_schema.sql
-- ============================================================
INSERT INTO NguoiDung (MaND, TenND, Email, MatKhau, VaiTro, TrangThai) VALUES
('ND001', 'Admin System', 'admin@nhahang.com', '$2b$10$QQjUYOP2RIOusra.a.Sig.dnEWuKOnYCqQoMEqhJPX/T/XJ.dMEiW', 'Admin', 'Active'),
('ND002', 'Nguyễn Văn An', 'an.nv@nhahang.com', '$2b$10$wd0YWq1YXw0jlVA0qlrA.udcmvJRVp7MSUO0RH57wU4iA9Tf/JeS6', 'NhanVien', 'Active'),
('ND003', 'Lê Thị Bích', 'bich.lt@nhahang.com', '$2b$10$cU0ttRiu8gphooM1j9SuVuJ8l7M0GLj8G/ZzReu9xFxDyY/5YFi4W', 'NhanVien', 'Active'),
('ND004', 'Tran Van Khách', 'khach1@gmail.com', '$2b$10$XOeTjjVS0Y6Cm9U45RXyTeza/xg/V6ehWwVVnggLRZ55k41IEhGUG', 'KhachHang', 'Active'),
('ND005', 'Pham Thi Mai', 'mai.pt@gmail.com', '$2b$10$mBPXD0mV9Fw.JJQZMBtX5OZ2QzzG8fPjJIrNdz0DBgEan8DslLzZy', 'KhachHang', 'Active'),
('ND_KH_TEST_01', 'Nguyen Van Test', 'kháchtest01@gmail.com', '$2a$11$dtmZV4AJS/fB16ymIqO4AuCZuj21tj08dUYpY3uons9iJor0n1omW', 'KhachHang', 'Active');

INSERT INTO NhanVien (MaNV, MaND, HoTen, GioiTinh, SDT, ChucVu, NgayVaoLam) VALUES
('NV001', 'ND001', 'Admin System', 'Nam', '0901111111', 'Admin', '2024-01-01'),
('NV002', 'ND002', 'Nguyen Van An', 'Nam', '0901234567', 'QuảnLý', '2024-06-01'),
('NV003', 'ND003', 'Le Thi Bich', 'Nu', '0907654321', 'ThuNgân', '2025-01-15');

INSERT INTO KhachHang (MaKH, MaND, TenKH, SDT, DiaChi, DiemTichLuy) VALUES
('KH001', 'ND004', 'Trần Văn Khách', '0912345678', NULL, 150),
('KH002', 'ND005', 'Phạm Thị Mai', '0987654321', NULL, 80),
('KH003', NULL, 'Khách Vãng Lai', NULL, NULL, 0),
('KH_TEST_01', 'ND_KH_TEST_01', 'Nguyễn Văn Test', '0901239999', '123 Nguyen Hue, Q1, TP.HCM', 0);

INSERT INTO DanhMuc (MaDanhMuc, TenDanhMuc, ThuTu) VALUES
('DM001', 'Khai Vị', 1),
('DM002', 'Món Chính', 2),
('DM003', 'Tráng Miệng', 3),
('DM004', 'Đồ Uống', 4),
('DM005', 'Combo', 5);

INSERT INTO ThucDon (MaMon, MaDanhMuc, TenMon, MoTa, Gia, HinhAnh, ThoiGianChuanBi, TrangThai, NgayTao, NgayCapNhat) VALUES
('M001', 'DM001', 'Gỏi Cuốn Tôm Thịt', 'Gỏi cuốn tươi, thanh nhẹ, ăn cùng nước chấm đặc biệt.', 35000, NULL, 10, 'Available', NOW(), NOW()),
('M002', 'DM001', 'Chả Giò Hải Sản', 'Chả giò hải sản giòn rụm, nhân đầy và đậm vị.', 45000, NULL, 15, 'Available', NOW(), NOW()),
('M003', 'DM002', 'Cơm Rang Dương Châu', 'Cơm rang dương châu đầy đặn và dễ ăn.', 55000, NULL, 20, 'Available', NOW(), NOW()),
('M004', 'DM002', 'Phở Bò Đặc Biệt', 'Phở bò đậm đà, nước dùng ngọt thanh tự nhiên.', 75000, NULL, 25, 'Available', NOW(), NOW()),
('M005', 'DM002', 'Bún Bò Huế', 'Bún bò Huế cay nhẹ, hương vị đặc trưng.', 65000, NULL, 25, 'Available', NOW(), NOW()),
('M006', 'DM003', 'Kem Dâu Tây', 'Kem mát lạnh, vị dâu tây thanh mát.', 30000, NULL, 5, 'Available', NOW(), NOW()),
('M007', 'DM003', 'Bánh Flan Caramel', 'Bánh flan caramel mềm mịn, ngọt nhẹ.', 25000, NULL, 5, 'Available', NOW(), NOW()),
('M008', 'DM004', 'Cà Phê Sữa Đá', 'Cà phê sữa đá đậm vị, đúng chất Việt Nam.', 25000, NULL, 5, 'Available', NOW(), NOW()),
('M009', 'DM004', 'Trà Đào Cam Sả', 'Trà đào cam sả thanh mát, dễ uống.', 35000, NULL, 5, 'Available', NOW(), NOW()),
('M010', 'DM004', 'Nước Ép Cam', 'Nước ép cam tươi, bổ sung năng lượng.', 30000, NULL, 5, 'Available', NOW(), NOW()),
('M011', 'DM005', 'Combo Gia Đình', 'Combo dành cho 4 người gồm món chính, khai vị và đồ uống.', 299000, NULL, 20, 'Available', NOW(), NOW()),
('M012', 'DM005', 'Combo Couple', 'Combo gọn nhẹ cho 2 người với món chính và đồ uống.', 199000, NULL, 15, 'Available', NOW(), NOW()),
('M013', 'DM005', 'Combo Solo', 'Combo cá nhân tiết kiệm, phục vụ nhanh.', 129000, NULL, 10, 'Available', NOW(), NOW());

INSERT INTO Ban (MaBan, TenBan, KhuVuc, SoBan, SoChoNgoi, ViTri, GhiChu, TrangThai, NgayTao, NgayCapNhat) VALUES
('B001', 'Bàn 1', 'Trong nhà', 1, 2, 'Tang 1 - Cua so', NULL, 'TRONG', NOW(), NOW()),
('B002', 'Bàn 2', 'Trong nhà', 2, 4, 'Tang 1 - Khu A', NULL, 'TRONG', NOW(), NOW()),
('B003', 'Bàn 3', 'Trong nhà', 3, 4, 'Tang 1 - Khu B', NULL, 'TRONG', NOW(), NOW()),
('B004', 'Bàn 4', 'Trong nhà', 4, 6, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B005', 'Bàn VIP', 'Khu riêng', 5, 8, 'Khu riêng', NULL, 'TRONG', NOW(), NOW()),
('B006', 'Bàn 6', 'Ngoài trời', 6, 2, 'Ngoài trời', NULL, 'TRONG', NOW(), NOW()),
('B007', 'Bàn 7', 'Trong nhà', 7, 4, 'Tang 1 - Khu C', NULL, 'TRONG', NOW(), NOW()),
('B008', 'Bàn 8', 'Trong nhà', 8, 4, 'Tang 1 - Khu C', NULL, 'TRONG', NOW(), NOW()),
('B009', 'Bàn ngoài trời 9', 'Ngoài trời', 9, 6, 'Ngoài trời', NULL, 'TRONG', NOW(), NOW()),
('B010', 'Bàn 10', 'Ngoài trời', 10, 2, 'Ngoài trời', NULL, 'TRONG', NOW(), NOW()),
('B011', 'Bàn 11', 'Khu riêng', 11, 8, 'Khu riêng', NULL, 'TRONG', NOW(), NOW());

INSERT INTO QRCode (MaQR, MaBan, DuongDanQR, NgayHetHan, TrangThai) VALUES
('QR001', 'B001', 'http://localhost:5173/ban/B001', '2027-12-31 23:59:59', 'Active'),
('QR002', 'B002', 'http://localhost:5173/ban/B002', '2027-12-31 23:59:59', 'Active'),
('QR003', 'B003', 'http://localhost:5173/ban/B003', '2027-12-31 23:59:59', 'Active'),
('QR004', 'B004', 'http://localhost:5173/ban/B004', '2027-12-31 23:59:59', 'Active'),
('QR005', 'B005', 'http://localhost:5173/ban/B005', '2027-12-31 23:59:59', 'Active'),
('QR006', 'B006', 'http://localhost:5173/ban/B006', '2027-12-31 23:59:59', 'Active'),
('QR007', 'B007', 'http://localhost:5173/ban/B007', '2027-12-31 23:59:59', 'Active'),
('QR008', 'B008', 'http://localhost:5173/ban/B008', '2027-12-31 23:59:59', 'Active'),
('QR009', 'B009', 'http://localhost:5173/ban/B009', '2027-12-31 23:59:59', 'Active'),
('QR010', 'B010', 'http://localhost:5173/ban/B010', '2027-12-31 23:59:59', 'Active'),
('QR011', 'B011', 'http://localhost:5173/ban/B011', '2027-12-31 23:59:59', 'Active');

INSERT INTO MaGiamGia (MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu, NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao) VALUES
('WELCOME10', 'Chào mừng KH mới', 10, 'percentage', 'PUBLIC', NULL, NULL, 50000, 100000, '2026-01-01', '2026-12-31', 1, 0, 'Active', 'SEED'),
('SUMMER20', 'Khuyến mãi Hè', 20, 'percentage', 'PUBLIC', NULL, NULL, 100000, 200000, '2026-06-01', '2026-08-31', NULL, 0, 'Active', 'SEED'),
('GIAM50K', 'Giảm thẳng 50k', 50000, 'fixed_amount', 'PUBLIC', NULL, NULL, NULL, 300000, '2026-01-01', '2026-12-31', 500, 0, 'Active', 'SEED');

INSERT INTO DatBan (
    MaDatBan, MaKH, MaBan, MaNV, TenKhachDatBan, SDTDatBan, EmailDatBan,
    NgayDat, GioDat, GioKetThuc, SoNguoi, GhiChu, KhuVucUuTien, GhiChuNoiBo,
    NguonTao, TrangThai, NgayTao, NgayCapNhat
) VALUES
('DB001', 'KH001', 'B004', 'NV002', 'Tran Van Khách', '0912345678', 'khach1@gmail.com', '2026-08-10', '18:00:00', '20:00:00', 4, 'Sinh nhật, cần bánh kem', 'PHONG_VIP', 'Cần sắp xếp bàn đẹp và ưu tiên check-in đúng giờ.', 'WEB', 'CHO_XAC_NHAN', NOW(), NOW());

INSERT INTO DonHang (MaDonHang, MaKH, MaBan, MaNV, MaDatBan, LoaiDon, TongTien, TrangThai, NguonTao, GhiChu, NgayTao, NgayCapNhat) VALUES
('DH001', 'KH001', 'B004', 'NV002', 'DB001', 'TAI_BAN', 215000, 'DA_THANH_TOAN', 'DatBan', NULL, NOW(), NOW());

INSERT INTO ChiTietDonHang (MaChiTiet, MaDonHang, MaMon, SoLuong, DonGia, ThanhTien, GhiChu, TrangThai, NgayTao) VALUES
('CT001', 'DH001', 'M001', 2, 35000, 70000, NULL, 'HOAN_THANH', NOW()),
('CT002', 'DH001', 'M004', 1, 75000, 75000, NULL, 'HOAN_THANH', NOW()),
('CT003', 'DH001', 'M008', 2, 25000, 50000, NULL, 'HOAN_THANH', NOW()),
('CT004', 'DH001', 'M006', 1, 30000, 30000, NULL, 'HOAN_THANH', NOW());

INSERT INTO DonHang (MaDonHang, MaKH, MaBan, MaNV, MaDatBan, LoaiDon, TongTien, TrangThai, NguonTao, GhiChu, NgayTao, NgayCapNhat) VALUES
('DH002', 'KH002', 'B001', 'NV003', NULL, 'TAI_BAN', 140000, 'HOAN_THANH', 'TaiQuay', 'Khách gọi món tại bàn sau giờ làm', NOW(), NOW()),
('DH003', 'KH_TEST_01', 'B002', 'NV002', NULL, 'TAI_BAN', 180000, 'DANG_CHUAN_BI', 'TaiQuay', 'Khách gọi món tại bàn, báo nhân viên trước khi phục vụ', NOW(), NOW());

INSERT INTO ChiTietDonHang (MaChiTiet, MaDonHang, MaMon, SoLuong, DonGia, ThanhTien, GhiChu, TrangThai, NgayTao) VALUES
('CT005', 'DH002', 'M003', 1, 55000, 55000, 'Không hanh', 'HOAN_THANH', NOW()),
('CT006', 'DH002', 'M009', 1, 35000, 35000, 'It da', 'HOAN_THANH', NOW()),
('CT007', 'DH002', 'M007', 2, 25000, 50000, NULL, 'HOAN_THANH', NOW()),
('CT008', 'DH003', 'M004', 1, 75000, 75000, 'Them tieu', 'DANG_PHUC_VU', NOW()),
('CT009', 'DH003', 'M008', 2, 25000, 50000, 'Bot duong', 'DANG_PHUC_VU', NOW()),
('CT010', 'DH003', 'M010', 1, 30000, 30000, NULL, 'DANG_CHUAN_BI', NOW());

INSERT INTO HoaDon (MaHoaDon, MaDonHang, MaKH, MaNV, MaCode, TongTien, GiamGia, ThueSuat, TienThue, ThanhTien, GhiChu, NgayXuat) VALUES
('HD001', 'DH001', 'KH001', 'NV002', 'WELCOME10', 215000, 21500, 10, 19350, 212850, NULL, NOW()),
('HD002', 'DH002', 'KH002', 'NV003', NULL, 140000, 0, 10, 14000, 154000, 'Khách thanh toán tại bàn', NOW()),
('HD003', 'DH003', 'KH_TEST_01', 'NV002', 'GIAM50K', 180000, 50000, 10, 13000, 143000, 'Đơn gọi món tại bàn đã áp dụng ưu đãi', NOW());

INSERT INTO ThanhToan (MaThanhToan, MaHoaDon, PhuongThuc, SoTien, MaGiaoDich, TrangThai, ThoiGian) VALUES
('TT001', 'HD001', 'ChuyenKhoan', 212850, NULL, 'THANH_CONG', NOW()),
('TT002', 'HD002', 'TienMat', 154000, NULL, 'THAT_BAI', NOW()),
('TT003', 'HD003', 'MoMo', 143000, 'MOMO_DH003_001', 'THAT_BAI', NOW());

INSERT INTO LichSuDonHang (MaLichSu, MaDonHang, TrangThaiCu, TrangThaiMoi, GhiChu, NguoiThucHien, ThoiGian) VALUES
('LS007', 'DH002', NULL, 'DANG_CHUAN_BI', 'Tạo đơn gọi món tại bàn', 'System', NOW()),
('LS008', 'DH002', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên xác nhận món với khách tại bàn', 'NV003', NOW()),
('LS009', 'DH002', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp tiếp nhận đơn', 'NV003', NOW()),
('LS010', 'DH002', 'DANG_PHUC_VU', 'HOAN_THANH', 'Sẵn sàng trả khách tại quầy', 'NV003', NOW()),
('LS011', 'DH003', NULL, 'DANG_CHUAN_BI', 'Tạo đơn gọi món tại bàn', 'System', NOW()),
('LS012', 'DH003', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Xác nhận món với khách tại bàn', 'NV002', NOW());

INSERT INTO LichSuDiemTichLuy (MaGiaoDichDiem, MaKH, MaDonHang, LoaiBienDong, SoDiem, SoDiemTruoc, SoDiemSau, MoTa, NgayTao) VALUES
('LSD002', 'KH002', 'DH002', 'CONG', 15, 65, 80, 'Cộng điểm từ đơn gọi món tại bàn DH002', NOW()),
('LSD003', 'KH_TEST_01', 'DH003', 'CONG', 14, 0, 14, 'Tạm cộng điểm cho đơn gọi món tại bàn DH003', NOW());

-- ============================================================
-- MO RONG DỮ LIỆU MẪU DE KIEM TRA END-TO-END VOI BACKEND THAT
-- Cac tai khoan noi bo bo sung dung mat khau: Staff@123
-- Các tài khoản khách hàng bổ sung dùng mật khẩu: Khách@123
-- ============================================================
INSERT INTO NguoiDung (MaND, TenND, Email, MatKhau, VaiTro, TrangThai) VALUES
('ND006', 'Phạm Hoàng Long', 'long.host@nhahang.com', '$2b$10$wd0YWq1YXw0jlVA0qlrA.udcmvJRVp7MSUO0RH57wU4iA9Tf/JeS6', 'NhanVien', 'Active'),
('ND007', 'Trần Thu Hà', 'ha.phucvu@nhahang.com', '$2b$10$wd0YWq1YXw0jlVA0qlrA.udcmvJRVp7MSUO0RH57wU4iA9Tf/JeS6', 'NhanVien', 'Active'),
('ND008', 'Võ Gia Bảo', 'bao.thungan@nhahang.com', '$2b$10$wd0YWq1YXw0jlVA0qlrA.udcmvJRVp7MSUO0RH57wU4iA9Tf/JeS6', 'NhanVien', 'Inactive'),
('ND009', 'Nguyễn Thị Quyên', 'quyen.admin@nhahang.com', '$2b$10$QQjUYOP2RIOusra.a.Sig.dnEWuKOnYCqQoMEqhJPX/T/XJ.dMEiW', 'Admin', 'Active'),
('ND010', 'Lê Minh Châu', 'chau.lm@gmail.com', '$2b$12$nQJNiPj3O1iNDm624ZlBd.qrwnPSBrsxz7KV6JJp1ZBVAJloTQa8K', 'KhachHang', 'Active'),
('ND011', 'Hoàng Anh Thư', 'thu.ha@gmail.com', '$2b$12$nQJNiPj3O1iNDm624ZlBd.qrwnPSBrsxz7KV6JJp1ZBVAJloTQa8K', 'KhachHang', 'Active'),
('ND012', 'Bùi Quốc Đạt', 'dat.bq@gmail.com', '$2b$12$nQJNiPj3O1iNDm624ZlBd.qrwnPSBrsxz7KV6JJp1ZBVAJloTQa8K', 'KhachHang', 'Active'),
('ND013', 'Nguyễn Bảo Ngọc', 'ngoc.nb@gmail.com', '$2b$12$nQJNiPj3O1iNDm624ZlBd.qrwnPSBrsxz7KV6JJp1ZBVAJloTQa8K', 'KhachHang', 'Active'),
('ND014', 'Do Khanh Linh', 'linh.dk@gmail.com', '$2b$12$nQJNiPj3O1iNDm624ZlBd.qrwnPSBrsxz7KV6JJp1ZBVAJloTQa8K', 'KhachHang', 'Inactive'),
('ND015', 'Phan Gia Huy', 'huy.pg@gmail.com', '$2b$12$nQJNiPj3O1iNDm624ZlBd.qrwnPSBrsxz7KV6JJp1ZBVAJloTQa8K', 'KhachHang', 'Banned');

INSERT INTO NhanVien (MaNV, MaND, HoTen, GioiTinh, SDT, DiaChi, ChucVu, LuongCoBan, NgayVaoLam, TinhTrang) VALUES
('NV004', 'ND006', 'Pham Hoang Long', 'Nam', '0901112222', 'Quan 1, TP.HCM', 'Host', 8500000, '2025-06-10', 'Active'),
('NV005', 'ND007', 'Tran Thu Ha', 'Nu', '0901113333', 'Quan 3, TP.HCM', 'PhụcVụ', 7800000, '2025-08-01', 'Active'),
('NV006', 'ND008', 'Vo Gia Bao', 'Nam', '0901114444', 'Quan 7, TP.HCM', 'ThuNgân', 9200000, '2025-03-01', 'Inactive'),
('NV007', 'ND009', 'Nguyen Thi Quyen', 'Nu', '0901115555', 'Thu Duc, TP.HCM', 'QuảnLýCa', 13500000, '2024-09-15', 'Active');

INSERT INTO KhachHang (MaKH, MaND, TenKH, SDT, DiaChi, DiemTichLuy) VALUES
('KH004', NULL, 'Khách Lẻ Công Ty', NULL, 'Văn phòng công ty tại Quận 1', 0),
('KH005', NULL, 'Khách Bàn Tiệc', NULL, 'Khách doan dat tiec cuoi tu su kien', 0),
('KH006', 'ND010', 'Lê Minh Châu', '0908800001', '45 Le Loi, Quan 1, TP.HCM', 320),
('KH007', 'ND011', 'Hoàng Anh Thư', '0908800002', '88 Cach Mang Thang 8, Quan 3, TP.HCM', 45),
('KH008', 'ND012', 'Bùi Quốc Đạt', '0908800003', '12 Nguyen Hue, Quan 1, TP.HCM', 95),
('KH009', 'ND013', 'Nguyễn Bảo Ngọc', '0908800004', '67 Dien Bien Phu, Binh Thanh, TP.HCM', 12),
('KH010', 'ND014', 'Do Khanh Linh', '0908800005', '90 Tran Hung Dao, Quan 5, TP.HCM', 0),
('KH011', 'ND015', 'Phan Gia Huy', '0908800006', '14 Ho Tung Mau, Quan 1, TP.HCM', 0);

INSERT INTO ThucDon (MaMon, MaDanhMuc, TenMon, MoTa, Gia, HinhAnh, ThoiGianChuanBi, TrangThai, NgayTao, NgayCapNhat) VALUES
('M014', 'DM001', 'Salad Cá Ngừ', 'Salad cá ngừ sốt chanh dây thanh mát.', 68000, NULL, 12, 'Available', NOW(), NOW()),
('M015', 'DM002', 'Sườn Nướng Mật Ong', 'Sườn nướng mềm, sốt mật ong đậm vị.', 129000, NULL, 25, 'Available', NOW(), NOW()),
('M016', 'DM002', 'Lẩu Thái Hải Sản', 'Lẩu Thái chua cay nhẹ cho nhóm 2-4 người.', 259000, NULL, 30, 'Available', NOW(), NOW()),
('M017', 'DM004', 'Trà Vải Hoa Hồng', 'Đồ uống theo mùa, tạm thời hết hàng.', 42000, NULL, 5, 'Unavailable', NOW(), NOW()),
('M018', 'DM003', 'Bánh Tiramisu', 'Tráng miệng vị cà phê nhẹ.', 45000, NULL, 8, 'Available', NOW(), NOW()),
('M019', 'DM005', 'Combo Văn Phòng', 'Combo trưa gọn nhẹ cho nhân viên văn phòng.', 159000, NULL, 15, 'Unavailable', NOW(), NOW()),
('M020', 'DM002', 'Mì Ý Sốt Bò Bằm', 'Món tạm ngưng kinh doanh để cập nhật công thức.', 89000, NULL, 18, 'Deleted', NOW(), NOW());

INSERT INTO Ban (MaBan, TenBan, KhuVuc, SoBan, SoChoNgoi, ViTri, GhiChu, TrangThai, NgayTao, NgayCapNhat) VALUES
('B012', 'Bàn 12', 'Trong nhà', 12, 4, 'Tang 1 - Khu D', NULL, 'TRONG', NOW(), NOW()),
('B013', 'Bàn 13', 'Trong nhà', 13, 2, 'Trong nhà', 'Phu hop khách di 2 người', 'TRONG', NOW(), NOW()),
('B014', 'Phòng riêng 14', 'Khu riêng', 14, 6, 'Khu riêng', 'Bàn dự phòng cho booking VIP', 'TRONG', NOW(), NOW()),

-- =====================
-- BÀN MỚI: TRONG NHÀ / KHU RIÊNG / NGOÀI TRỜI (B015-B039)
-- =====================
('B015', 'Bàn 15', 'Trong nhà', 15, 2, 'Tang 1 - Gan cua so', NULL, 'TRONG', NOW(), NOW()),
('B016', 'Bàn 16', 'Trong nhà', 16, 4, 'Tang 1 - Khu A', NULL, 'TRONG', NOW(), NOW()),
('B017', 'Bàn 17', 'Trong nhà', 17, 4, 'Tang 1 - Khu A', NULL, 'TRONG', NOW(), NOW()),
('B018', 'Bàn 18', 'Trong nhà', 18, 6, 'Tang 1 - Khu B', NULL, 'TRONG', NOW(), NOW()),
('B019', 'Bàn 19', 'Trong nhà', 19, 4, 'Tang 1 - Khu B', NULL, 'TRONG', NOW(), NOW()),
('B020', 'Bàn 20', 'Trong nhà', 20, 4, 'Tang 1 - Khu C', NULL, 'TRONG', NOW(), NOW()),
('B021', 'Bàn 21', 'Trong nhà', 21, 6, 'Tang 1 - Khu C', NULL, 'TRONG', NOW(), NOW()),
('B022', 'Bàn 22', 'Trong nhà', 22, 2, 'Tang 1 - Khu D', NULL, 'TRONG', NOW(), NOW()),
('B023', 'Bàn 23', 'Trong nhà', 23, 4, 'Tang 1 - Khu D', NULL, 'BAO_TRI', NOW(), NOW()),
('B024', 'Bàn 24', 'Trong nhà', 24, 8, 'Tang 1 - Khu E', NULL, 'TRONG', NOW(), NOW()),
('B025', 'Bàn 25', 'Trong nhà', 25, 4, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B026', 'Bàn 26', 'Trong nhà', 26, 4, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B027', 'Bàn 27', 'Trong nhà', 27, 6, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B028', 'Bàn 28', 'Trong nhà', 28, 6, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B029', 'Bàn 29', 'Trong nhà', 29, 8, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B030', 'Bàn 30', 'Trong nhà', 30, 4, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B031', 'Bàn 31', 'Trong nhà', 31, 4, 'Trong nhà', NULL, 'TRONG', NOW(), NOW()),
('B032', 'Phòng riêng 32', 'Khu riêng', 32, 4, 'Tang 3 - Phong rieng', NULL, 'TRONG', NOW(), NOW()),
('B033', 'Phòng riêng 33', 'Khu riêng', 33, 6, 'Tang 3 - Phong rieng', NULL, 'TRONG', NOW(), NOW()),
('B034', 'Bàn 34', 'Trong nhà', 34, 8, 'Tang 3 - Phong lon', NULL, 'TRONG', NOW(), NOW()),
('B035', 'Bàn 35', 'Trong nhà', 35, 10, 'Tang 3 - Phong tiec', NULL, 'TRONG', NOW(), NOW()),
('B036', 'Bàn 36', 'Trong nhà', 36, 4, 'Tang 3 - Khu thanh pho', NULL, 'TRONG', NOW(), NOW()),
('B037', 'Bàn 37', 'Trong nhà', 37, 6, 'Tang 3 - Khu thanh pho', NULL, 'BAO_TRI', NOW(), NOW()),
('B038', 'Bàn 38', 'Trong nhà', 38, 2, 'Tang 3 - Ban nho', NULL, 'TRONG', NOW(), NOW()),

-- =====================
-- BÀN MỚI: KHU RIÊNG (B039-B048)
-- =====================
('B039', 'Bàn VIP 1', 'Khu riêng', 39, 8, 'Khu riêng', 'Phong VIP dau tien', 'TRONG', NOW(), NOW()),
('B040', 'Bàn VIP 2', 'Khu riêng', 40, 8, 'Khu riêng', 'Phong VIP thu hai', 'TRONG', NOW(), NOW()),
('B041', 'Bàn VIP 3', 'Khu riêng', 41, 10, 'Tang 3 - Phong VIP 3', 'Phong VIP lon nhat', 'TRONG', NOW(), NOW()),
('B042', 'Bàn VIP 4', 'Khu riêng', 42, 6, 'Khu riêng', NULL, 'TRONG', NOW(), NOW()),
('B043', 'Bàn VIP 5', 'Khu riêng', 43, 6, 'Khu riêng', NULL, 'TRONG', NOW(), NOW()),
('B044', 'Bàn VIP 6', 'Khu riêng', 44, 8, 'Tang 3 - Phong riêng C', NULL, 'TRONG', NOW(), NOW()),
('B045', 'Bàn VIP 7', 'Khu riêng', 45, 4, 'Khu riêng', NULL, 'TRONG', NOW(), NOW()),
('B046', 'Bàn VIP 8', 'Khu riêng', 46, 8, 'Tang 3 - Tang VIP', 'Danh cho khách VVIP', 'TRONG', NOW(), NOW()),
('B047', 'Bàn VIP 9', 'Khu riêng', 47, 10, 'Tang 3 - Hall VIP', 'Phong hop vuong mac', 'TRONG', NOW(), NOW()),
('B048', 'Bàn VIP 10', 'Khu riêng', 48, 6, 'Khu riêng', 'Vi tri view dep', 'TRONG', NOW(), NOW()),

-- =====================
-- BÀN MỚI: NGOÀI TRỜI (B049-B063)
-- =====================
('B049', 'Bàn NT 1', 'Ngoài trời', 49, 2, 'Ngoài trời - Khu A', NULL, 'TRONG', NOW(), NOW()),
('B050', 'Bàn NT 2', 'Ngoài trời', 50, 2, 'Ngoài trời - Khu A', NULL, 'TRONG', NOW(), NOW()),
('B051', 'Bàn NT 3', 'Ngoài trời', 51, 4, 'Ngoài trời - Khu A', NULL, 'TRONG', NOW(), NOW()),
('B052', 'Bàn NT 4', 'Ngoài trời', 52, 4, 'Ngoài trời - Khu A', NULL, 'TRONG', NOW(), NOW()),
('B053', 'Bàn NT 5', 'Ngoài trời', 53, 4, 'Ngoài trời - Khu B', NULL, 'TRONG', NOW(), NOW()),
('B054', 'Bàn NT 6', 'Ngoài trời', 54, 6, 'Ngoài trời - Khu B', NULL, 'TRONG', NOW(), NOW()),
('B055', 'Bàn NT 7', 'Ngoài trời', 55, 6, 'Ngoài trời - Khu B', NULL, 'TRONG', NOW(), NOW()),
('B056', 'Bàn NT 8', 'Ngoài trời', 56, 2, 'Ngoài trời - Khu C', NULL, 'TRONG', NOW(), NOW()),
('B057', 'Bàn NT 9', 'Ngoài trời', 57, 4, 'Ngoài trời - Khu C', NULL, 'TRONG', NOW(), NOW()),
('B058', 'Bàn NT 10', 'Ngoài trời', 58, 8, 'Ngoài trời - Khu C', NULL, 'TRONG', NOW(), NOW()),
('B059', 'Bàn NT 11', 'Ngoài trời', 59, 4, 'Ngoài trời - Khu D', NULL, 'TRONG', NOW(), NOW()),
('B060', 'Bàn NT 12', 'Ngoài trời', 60, 6, 'Ngoài trời - Khu D', NULL, 'TRONG', NOW(), NOW()),
('B061', 'Bàn NT 13', 'Ngoài trời', 61, 4, 'Ngoài trời - Khu D', NULL, 'BAO_TRI', NOW(), NOW()),
('B062', 'Bàn NT 14', 'Ngoài trời', 62, 2, 'Ngoài trời - Khu E', NULL, 'TRONG', NOW(), NOW()),
('B063', 'Bàn NT 15', 'Ngoài trời', 63, 4, 'Ngoài trời - Khu E', NULL, 'TRONG', NOW(), NOW());

INSERT INTO QRCode (MaQR, MaBan, DuongDanQR, NgayHetHan, TrangThai) VALUES
('QR012', 'B012', 'http://localhost:5173/ban/B012', '2027-12-31 23:59:59', 'Active'),
('QR013', 'B013', 'http://localhost:5173/ban/B013', '2027-12-31 23:59:59', 'Active'),
('QR014', 'B014', 'http://localhost:5173/ban/B014', '2027-12-31 23:59:59', 'Inactive'),

-- QR Trong nha / Khu rieng (B015-B038)
('QR015', 'B015', 'http://localhost:5173/ban/B015', '2027-12-31 23:59:59', 'Active'),
('QR016', 'B016', 'http://localhost:5173/ban/B016', '2027-12-31 23:59:59', 'Active'),
('QR017', 'B017', 'http://localhost:5173/ban/B017', '2027-12-31 23:59:59', 'Active'),
('QR018', 'B018', 'http://localhost:5173/ban/B018', '2027-12-31 23:59:59', 'Active'),
('QR019', 'B019', 'http://localhost:5173/ban/B019', '2027-12-31 23:59:59', 'Active'),
('QR020', 'B020', 'http://localhost:5173/ban/B020', '2027-12-31 23:59:59', 'Active'),
('QR021', 'B021', 'http://localhost:5173/ban/B021', '2027-12-31 23:59:59', 'Active'),
('QR022', 'B022', 'http://localhost:5173/ban/B022', '2027-12-31 23:59:59', 'Active'),
('QR023', 'B023', 'http://localhost:5173/ban/B023', '2027-12-31 23:59:59', 'Active'),
('QR024', 'B024', 'http://localhost:5173/ban/B024', '2027-12-31 23:59:59', 'Active'),
('QR025', 'B025', 'http://localhost:5173/ban/B025', '2027-12-31 23:59:59', 'Active'),
('QR026', 'B026', 'http://localhost:5173/ban/B026', '2027-12-31 23:59:59', 'Active'),
('QR027', 'B027', 'http://localhost:5173/ban/B027', '2027-12-31 23:59:59', 'Active'),
('QR028', 'B028', 'http://localhost:5173/ban/B028', '2027-12-31 23:59:59', 'Active'),
('QR029', 'B029', 'http://localhost:5173/ban/B029', '2027-12-31 23:59:59', 'Active'),
('QR030', 'B030', 'http://localhost:5173/ban/B030', '2027-12-31 23:59:59', 'Active'),
('QR031', 'B031', 'http://localhost:5173/ban/B031', '2027-12-31 23:59:59', 'Active'),
('QR032', 'B032', 'http://localhost:5173/ban/B032', '2027-12-31 23:59:59', 'Active'),
('QR033', 'B033', 'http://localhost:5173/ban/B033', '2027-12-31 23:59:59', 'Active'),
('QR034', 'B034', 'http://localhost:5173/ban/B034', '2027-12-31 23:59:59', 'Active'),
('QR035', 'B035', 'http://localhost:5173/ban/B035', '2027-12-31 23:59:59', 'Active'),
('QR036', 'B036', 'http://localhost:5173/ban/B036', '2027-12-31 23:59:59', 'Active'),
('QR037', 'B037', 'http://localhost:5173/ban/B037', '2027-12-31 23:59:59', 'Active'),
('QR038', 'B038', 'http://localhost:5173/ban/B038', '2027-12-31 23:59:59', 'Active'),

-- QR Khu rieng (B039-B048)
('QR039', 'B039', 'http://localhost:5173/ban/B039', '2027-12-31 23:59:59', 'Active'),
('QR040', 'B040', 'http://localhost:5173/ban/B040', '2027-12-31 23:59:59', 'Active'),
('QR041', 'B041', 'http://localhost:5173/ban/B041', '2027-12-31 23:59:59', 'Active'),
('QR042', 'B042', 'http://localhost:5173/ban/B042', '2027-12-31 23:59:59', 'Active'),
('QR043', 'B043', 'http://localhost:5173/ban/B043', '2027-12-31 23:59:59', 'Active'),
('QR044', 'B044', 'http://localhost:5173/ban/B044', '2027-12-31 23:59:59', 'Active'),
('QR045', 'B045', 'http://localhost:5173/ban/B045', '2027-12-31 23:59:59', 'Active'),
('QR046', 'B046', 'http://localhost:5173/ban/B046', '2027-12-31 23:59:59', 'Active'),
('QR047', 'B047', 'http://localhost:5173/ban/B047', '2027-12-31 23:59:59', 'Active'),
('QR048', 'B048', 'http://localhost:5173/ban/B048', '2027-12-31 23:59:59', 'Active'),

-- QR Ngoai troi (B049-B063)
('QR049', 'B049', 'http://localhost:5173/ban/B049', '2027-12-31 23:59:59', 'Active'),
('QR050', 'B050', 'http://localhost:5173/ban/B050', '2027-12-31 23:59:59', 'Active'),
('QR051', 'B051', 'http://localhost:5173/ban/B051', '2027-12-31 23:59:59', 'Active'),
('QR052', 'B052', 'http://localhost:5173/ban/B052', '2027-12-31 23:59:59', 'Active'),
('QR053', 'B053', 'http://localhost:5173/ban/B053', '2027-12-31 23:59:59', 'Active'),
('QR054', 'B054', 'http://localhost:5173/ban/B054', '2027-12-31 23:59:59', 'Active'),
('QR055', 'B055', 'http://localhost:5173/ban/B055', '2027-12-31 23:59:59', 'Active'),
('QR056', 'B056', 'http://localhost:5173/ban/B056', '2027-12-31 23:59:59', 'Active'),
('QR057', 'B057', 'http://localhost:5173/ban/B057', '2027-12-31 23:59:59', 'Active'),
('QR058', 'B058', 'http://localhost:5173/ban/B058', '2027-12-31 23:59:59', 'Active'),
('QR059', 'B059', 'http://localhost:5173/ban/B059', '2027-12-31 23:59:59', 'Active'),
('QR060', 'B060', 'http://localhost:5173/ban/B060', '2027-12-31 23:59:59', 'Active'),
('QR061', 'B061', 'http://localhost:5173/ban/B061', '2027-12-31 23:59:59', 'Active'),
('QR062', 'B062', 'http://localhost:5173/ban/B062', '2027-12-31 23:59:59', 'Active'),
('QR063', 'B063', 'http://localhost:5173/ban/B063', '2027-12-31 23:59:59', 'Active');

INSERT INTO MaGiamGia (MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu, NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao) VALUES
('VIP25', 'Ưu đãi VIP 25%', 25, 'percentage', 'VIP', 'KH006', NULL, 90000, 250000, DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 60 DAY), 200, 15, 'Active', 'SEED'),
('GIAM20K', 'Giảm 20k cho đơn từ 120k', 20000, 'fixed_amount', 'PUBLIC', NULL, NULL, NULL, 120000, DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 45 DAY), NULL, 12, 'Active', 'SEED'),
('LOYAL25K', 'Tri ân đổi 250 điểm lấy 25k', 25000, 'fixed_amount', 'LOYALTY', 'KH006', 250, NULL, 180000, DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 90 DAY), 1, 8, 'Active', 'SEED'),
('MORNING15', 'Ưu đãi buổi sáng', 15, 'percentage', 'PUBLIC', NULL, NULL, 30000, 80000, DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY), 100, 100, 'Inactive', 'SEED'),
('FLASH30', 'Flash sale 30%', 30, 'percentage', 'PUBLIC', NULL, NULL, 60000, 150000, DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 50, 50, 'HetHan', 'SEED');

INSERT INTO DatBan (
    MaDatBan, MaKH, MaBan, MaNV, TenKhachDatBan, SDTDatBan, EmailDatBan,
    NgayDat, GioDat, GioKetThuc, SoNguoi, GhiChu, KhuVucUuTien, GhiChuNoiBo,
    NguonTao, TrangThai, NgayTao, NgayCapNhat
) VALUES
('DB002', 'KH002', NULL, 'NV004', 'Pham Thi Mai', '0987654321', 'mai.pt@gmail.com', DATE(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 90 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 90 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 210 MINUTE)), 2, 'Bàn gần cửa sổ nếu còn chỗ.', 'SANH_CHINH', 'Booking sắp đến, cần xác nhận qua điện thoại.', 'WEB', 'CHO_XAC_NHAN', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)),
('DB003', 'KH006', NULL, 'NV004', 'Lê Minh Châu', '0908800001', 'chau.lm@gmail.com', DATE(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 60 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 60 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 180 MINUTE)), 6, 'Cần không gian riêng cho nhóm họp mặt.', 'PHONG_VIP', 'Khách VIP, nếu hết chỗ cần gọi lại để đổi khung giờ.', 'WEB', 'CHO_XAC_NHAN', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 50 MINUTE), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
('DB004', 'KH006', 'B005', 'NV002', 'Lê Minh Châu', '0908800001', 'chau.lm@gmail.com', DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), '19:00:00', '21:00:00', 4, 'Sinh nhật gia đình.', 'PHONG_VIP', 'Đã xác nhận và giữ bàn VIP.', 'NOI_BO', 'DA_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '09:15:00'), TIMESTAMP(CURRENT_DATE(), '09:25:00')),
('DB005', 'KH007', 'B011', 'NV005', 'Hoang Anh Thu', '0908800002', 'thu.ha@gmail.com', DATE(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 45 MINUTE)), TIME(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 45 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 90 MINUTE)), 4, 'Đã đến đúng giờ.', 'PHONG_VIP', 'Khách đã check-in và đang dùng bữa.', 'NOI_BO', 'DA_NHAN_BAN', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)),
('DB006', 'KH001', 'B002', 'NV002', 'Tran Van Khách', '0912345678', 'khach1@gmail.com', CURRENT_DATE(), '12:00:00', '13:30:00', 2, 'Khách quen đặt bàn trưa và đã gọi món.', 'SANH_CHINH', 'Tạm giữ cho đến khi xác nhận lại số khách.', 'NOI_BO', 'CHO_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '10:05:00'), TIMESTAMP(CURRENT_DATE(), '10:10:00')),
('DB007', 'KH004', NULL, 'NV004', 'Khách Lẻ Công Ty', '0907772001', 'booking.doanhnghiep@demo.local', DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY), '18:30:00', '20:30:00', 8, 'Cần hóa đơn công ty.', 'SANH_CHINH', 'Booking đoạn từ website, chờ gọi xác nhận.', 'WEB', 'CHO_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '08:20:00'), TIMESTAMP(CURRENT_DATE(), '08:20:00')),
('DB008', 'KH002', 'B006', 'NV005', 'Pham Thi Mai', '0987654321', 'mai.pt@gmail.com', DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:00:00', '19:30:00', 2, 'Đặt bàn ngoài trời.', 'BAN_CONG', 'Khách không đến sau 20 phút.', 'WEB', 'KHONG_DEN', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '11:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:30:00')),
('DB009', 'KH008', NULL, 'NV004', 'Bùi Quốc Đạt', '0908800003', 'dat.bq@gmail.com', DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '19:00:00', '21:00:00', 3, 'Khách đổi lịch sang tuần sau.', 'SANH_CHINH', 'Đã hủy theo yêu cầu khách.', 'WEB', 'DA_HUY', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '16:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '12:00:00')),
('DB010', 'KH005', NULL, 'NV004', 'Khách Bàn Tiệc', '0907772002', 'ban.tiec@demo.local', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY), '20:00:00', '22:00:00', 10, 'Đoàn khách muốn phòng riêng.', 'PHONG_VIP', 'Hết sức chưa vào cuối tuần.', 'WEB', 'DA_HUY', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY), '15:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY), '10:30:00')),
('DB011', 'KH009', 'B014', 'NV007', 'Nguyễn Bảo Ngọc', '0908800004', 'ngoc.nb@gmail.com', DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY), '18:00:00', '20:00:00', 5, 'Đặt phòng riêng tiếp đối tác.', 'PHONG_VIP', 'Admin đã duyệt booking VIP.', 'NOI_BO', 'CHO_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '13:10:00'), TIMESTAMP(CURRENT_DATE(), '13:20:00')),
('DB012', 'KH008', 'B012', 'NV002', 'Bùi Quốc Đạt', '0908800003', 'dat.bq@gmail.com', DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), '18:15:00', '20:15:00', 4, 'Khách sẽ đến sau giờ tan làm.', 'SANH_CHINH', 'Đã ghi nhận và tạm giữ bàn tăng 1.', 'NOI_BO', 'DA_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '14:00:00'), TIMESTAMP(CURRENT_DATE(), '14:05:00')),
('DB013', 'KH_TEST_01', NULL, 'NV004', 'Nguyen Van Test', '0901239999', 'kháchtest01@gmail.com', DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), '17:30:00', '19:00:00', 3, 'Muốn ngồi gần máy lạnh.', 'SANH_CHINH', 'Khách mới tạo booking, chưa gán bàn.', 'WEB', 'CHO_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '15:15:00'), TIMESTAMP(CURRENT_DATE(), '15:15:00')),
('DB014', 'KH001', 'B013', 'NV005', 'Tran Van Khách', '0912345678', 'khach1@gmail.com', DATE(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)), TIME(DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 75 MINUTE)), 2, 'Khách vào bàn và đã gọi món.', 'SANH_CHINH', 'Đã xếp bàn trong nhà.', 'NOI_BO', 'DA_NHAN_BAN', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 10 MINUTE)),
('DB015', 'KH006', 'B010', 'NV004', 'Lê Minh Châu', '0908800001', 'chau.lm@gmail.com', DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY), '18:30:00', '20:00:00', 2, 'Booking cũ khách không đến.', 'BAN_CONG', 'Khách báo trễ nhưng không đến.', 'WEB', 'KHONG_DEN', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 11 DAY), '09:40:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY), '19:00:00'));

INSERT INTO DatBan (
    MaDatBan, MaKH, MaBan, MaNV, TenKhachDatBan, SDTDatBan, EmailDatBan,
    NgayDat, GioDat, GioKetThuc, SoNguoi, GhiChu, KhuVucUuTien, GhiChuNoiBo,
    NguonTao, TrangThai, NgayTao, NgayCapNhat
) VALUES
('DB016', 'KH008', 'B012', 'NV002', 'Bùi Quốc Đạt', '0908800003', 'dat.bq@gmail.com', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:15:00', '13:45:00', 4, 'Họp mặt bạn bè buổi trưa.', 'SANH_CHINH', 'Đã phục vụ xong và khách đánh giá tốt.', 'NOI_BO', 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:40:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:50:00')),
('DB017', 'KH009', 'B014', 'NV007', 'Nguyễn Bảo Ngọc', '0908800004', 'ngoc.nb@gmail.com', DATE(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 75 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 75 MINUTE)), TIME(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 195 MINUTE)), 5, 'Khách tiếp đối tác, ưu tiên phòng riêng.', 'PHONG_VIP', 'Cần kiểm tra lại setup phòng VIP trước giờ đến.', 'NOI_BO', 'CHO_XAC_NHAN', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 35 MINUTE), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 10 MINUTE)),
('DB018', 'KH006', 'B005', 'NV002', 'Lê Minh Châu', '0908800001', 'chau.lm@gmail.com', DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '19:15:00', '21:00:00', 6, 'Tiệc nhỏ kỷ niệm của nhóm thân thiết.', 'PHONG_VIP', 'Khách đã dùng bữa trọn vẹn và hoàn thành thanh toán.', 'NOI_BO', 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '17:30:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:05:00')),
('DB019', 'KH004', NULL, 'NV004', 'Khách Lẻ Công Ty', '0907772003', 'company.booking2@demo.local', DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), '18:45:00', '20:30:00', 10, 'Cần xác nhận lại số lượng khách và yêu cầu hóa đơn.', 'SANH_CHINH', 'Booking doanh nghiệp mới từ website.', 'WEB', 'CHO_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '16:10:00'), TIMESTAMP(CURRENT_DATE(), '16:10:00')),
('DB020', 'KH008', 'B009', 'NV005', 'Bùi Quốc Đạt', '0908800003', 'dat.bq@gmail.com', CURRENT_DATE(), '19:15:00', '20:45:00', 4, 'Đặt bàn tối cuối ngày sau giờ làm.', 'BAN_CONG', 'Khách đã xác nhận, ưu tiên phục vụ nhanh trong ca cao điểm.', 'NOI_BO', 'DA_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '17:10:00'), TIMESTAMP(CURRENT_DATE(), '17:20:00'));

INSERT INTO DatBan (
    MaDatBan, MaKH, MaBan, MaNV, TenKhachDatBan, SDTDatBan, EmailDatBan,
    NgayDat, GioDat, GioKetThuc, SoNguoi, GhiChu, KhuVucUuTien, ChiTietMonAn,
    GhiChuNoiBo, NguonTao, TrangThai, NgayTao, NgayCapNhat
) VALUES
('DB021', 'KH001', 'B006', 'NV002', 'Tran Van Khách', '0912345678', 'khach1@gmail.com', CURRENT_DATE(), '18:30:00', '20:00:00', 3, 'Booking B006 có gọi món trước để test order đang mở.', 'BAN_CONG', JSON_ARRAY(JSON_OBJECT('maMon', 'M003', 'soLuong', 1), JSON_OBJECT('maMon', 'M008', 'soLuong', 2), JSON_OBJECT('maMon', 'M014', 'soLuong', 1)), 'Seed tạo order mở cho bàn B006.', 'NOI_BO', 'DA_XAC_NHAN', TIMESTAMP(CURRENT_DATE(), '17:40:00'), TIMESTAMP(CURRENT_DATE(), '17:45:00'));

INSERT INTO DonHang (MaDonHang, MaKH, MaBan, MaNV, MaDatBan, LoaiDon, TongTien, TrangThai, NguonTao, GhiChu, NgayTao, NgayCapNhat) VALUES
('DH004', 'KH003', 'B003', 'NV004', NULL, 'TAI_BAN', 110000, 'DANG_PHUC_VU', 'QRCode', 'Khách tai ban goi them mon va nuoc.', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 35 MINUTE), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE)),
('DH005', 'KH006', 'B009', 'NV002', NULL, 'TAI_BAN', 351000, 'HOAN_THANH', 'QRCode', 'Khách yêu cầu xuất hóa đơn tại bàn.', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 70 MINUTE), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 8 MINUTE)),
('DH006', 'KH007', 'B011', 'NV005', 'DB005', 'TAI_BAN', 205000, 'HOAN_THANH', 'DatBan', 'Da phục vụ xong mon chinh, cho danh gia.', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 50 MINUTE), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 4 MINUTE)),
('DH007', 'KH006', 'B006', 'NV003', NULL, 'TAI_BAN', 210000, 'DA_THANH_TOAN', 'TaiQuay', 'Khách gọi món tại bàn cho buổi trưa.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:20:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:45:00')),
('DH008', 'KH008', 'B007', 'NV005', NULL, 'TAI_BAN', 168000, 'DA_THANH_TOAN', 'TaiQuay', 'Khách dùng bữa tại bàn trong khung tối.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:40:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '19:40:00')),
('DH009', 'KH009', 'B008', 'NV007', NULL, 'TAI_BAN', 115000, 'DA_HUY', 'TaiQuay', 'Khách hủy đơn tại bàn trước khi bếp nhận.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:50:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:05:00')),
('DH010', 'KH002', 'B001', 'NV003', NULL, 'TAI_BAN', 147000, 'DA_THANH_TOAN', 'TaiQuay', 'Khách ăn tại quán vào giờ trưa.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '12:20:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '13:10:00')),
('DH011', 'KH001', 'B010', 'NV003', NULL, 'TAI_BAN', 188000, 'DA_THANH_TOAN', 'TaiQuay', 'Khách gọi món tại bàn buổi tối cho gia đình.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:45:00')),
('DH012', 'KH006', 'B011', 'NV002', NULL, 'TAI_BAN', 307000, 'DA_THANH_TOAN', 'TaiQuay', 'Đơn gọi món tại bàn VIP đã áp dụng ưu đãi.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '18:15:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '19:30:00')),
('DH013', 'KH001', 'B013', 'NV005', 'DB014', 'TAI_BAN', 105000, 'DANG_CHUAN_BI', 'QRCode', 'Order trong nhà vừa tạo, đang chờ bếp tiếp nhận.', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE), DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 MINUTE)),
('DH014', 'KH008', 'B012', 'NV002', 'DB016', 'TAI_BAN', 268000, 'DA_THANH_TOAN', 'DatBan', 'Khách dùng bữa trưa và thanh toán trọn vẹn.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:18:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:42:00')),
('DH015', 'KH006', 'B005', 'NV002', 'DB018', 'TAI_BAN', 394000, 'DA_THANH_TOAN', 'DatBan', 'Tiệc VIP đã phục vụ xong, doanh thu cao.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '19:20:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:10:00')),
('DH016', 'KH007', 'B003', 'NV003', NULL, 'TAI_BAN', 172000, 'DA_THANH_TOAN', 'TaiQuay', 'Khách gọi món tại bàn buổi tối, có mua thêm tráng miệng.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:30:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:20:00')),
('DH017', 'KH009', 'B004', 'NV005', NULL, 'TAI_BAN', 226000, 'DA_THANH_TOAN', 'TaiQuay', 'Đơn gọi món tại bàn buổi tối trong nhà hàng.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:35:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '19:50:00')),
('DH018', 'KH001', 'B002', 'NV003', 'DB006', 'TAI_BAN', 184000, 'DANG_CHUAN_BI', 'DatBan', 'Booking trưa đang chờ bếp tiếp nhận.', TIMESTAMP(CURRENT_DATE(), '11:35:00'), TIMESTAMP(CURRENT_DATE(), '11:40:00')),
('DH019', 'KH008', 'B009', 'NV005', 'DB020', 'TAI_BAN', 312000, 'DA_THANH_TOAN', 'DatBan', 'Khách tới cuối ngày đã thanh toán ngay sau bữa tối.', TIMESTAMP(CURRENT_DATE(), '19:18:00'), TIMESTAMP(CURRENT_DATE(), '20:48:00')),
('DH020', 'KH001', 'B006', 'NV002', 'DB021', 'TAI_BAN', 182000, 'DANG_CHUAN_BI', 'DatBan', 'Booking B006 có món đặt trước, đang mở.', TIMESTAMP(CURRENT_DATE(), '17:46:00'), TIMESTAMP(CURRENT_DATE(), '17:46:00'));

INSERT INTO ChiTietDonHang (MaChiTiet, MaDonHang, MaMon, SoLuong, DonGia, ThanhTien, GhiChu, TrangThai, NgayTao) VALUES
('CT011', 'DH004', 'M002', 1, 45000, 45000, 'Lam gion ky', 'DANG_PHUC_VU', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 34 MINUTE)),
('CT012', 'DH004', 'M008', 1, 25000, 25000, 'It da', 'HOAN_THANH', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 33 MINUTE)),
('CT013', 'DH004', 'M009', 1, 35000, 35000, NULL, 'DANG_CHUAN_BI', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 32 MINUTE)),
('CT014', 'DH005', 'M011', 1, 299000, 299000, NULL, 'HOAN_THANH', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 68 MINUTE)),
('CT015', 'DH005', 'M009', 1, 35000, 35000, 'Không da', 'HOAN_THANH', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 66 MINUTE)),
('CT016', 'DH006', 'M004', 1, 75000, 75000, NULL, 'HOAN_THANH', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 48 MINUTE)),
('CT017', 'DH006', 'M005', 1, 65000, 65000, 'Bot cay', 'HOAN_THANH', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 47 MINUTE)),
('CT018', 'DH006', 'M008', 1, 25000, 25000, NULL, 'HOAN_THANH', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 46 MINUTE)),
('CT019', 'DH006', 'M010', 1, 30000, 30000, NULL, 'HOAN_THANH', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 45 MINUTE)),
('CT020', 'DH007', 'M012', 1, 199000, 199000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:22:00')),
('CT021', 'DH007', 'M007', 1, 25000, 25000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:23:00')),
('CT022', 'DH008', 'M003', 1, 55000, 55000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:42:00')),
('CT023', 'DH008', 'M004', 1, 75000, 75000, 'Them hanh', 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:43:00')),
('CT024', 'DH008', 'M009', 1, 35000, 35000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:44:00')),
('CT025', 'DH009', 'M005', 1, 65000, 65000, NULL, 'DA_HUY', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:52:00')),
('CT026', 'DH009', 'M010', 1, 30000, 30000, NULL, 'DA_HUY', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:53:00')),
('CT027', 'DH010', 'M001', 1, 35000, 35000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '12:21:00')),
('CT028', 'DH010', 'M003', 1, 55000, 55000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '12:22:00')),
('CT029', 'DH010', 'M008', 2, 25000, 50000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '12:23:00')),
('CT030', 'DH011', 'M013', 1, 129000, 129000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:02:00')),
('CT031', 'DH011', 'M008', 2, 25000, 50000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:03:00')),
('CT032', 'DH012', 'M011', 1, 299000, 299000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '18:16:00')),
('CT033', 'DH012', 'M010', 2, 30000, 60000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '18:17:00')),
('CT034', 'DH013', 'M002', 1, 45000, 45000, 'Không hanh phi', 'DANG_CHUAN_BI', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 19 MINUTE)),
('CT035', 'DH013', 'M003', 1, 55000, 55000, NULL, 'DANG_CHUAN_BI', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 18 MINUTE)),
('CT036', 'DH014', 'M015', 1, 129000, 129000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:20:00')),
('CT037', 'DH014', 'M014', 1, 68000, 68000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:21:00')),
('CT038', 'DH014', 'M018', 1, 45000, 45000, 'Sinh nhat tang kem', 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:22:00')),
('CT039', 'DH015', 'M016', 1, 259000, 259000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '19:25:00')),
('CT040', 'DH015', 'M015', 1, 129000, 129000, 'Cat nho de chia mon', 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '19:26:00')),
('CT041', 'DH016', 'M013', 1, 129000, 129000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:35:00')),
('CT042', 'DH016', 'M018', 1, 45000, 45000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:36:00')),
('CT043', 'DH017', 'M015', 1, 129000, 129000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:40:00')),
('CT044', 'DH017', 'M009', 1, 35000, 35000, 'It da', 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:41:00')),
('CT045', 'DH017', 'M010', 1, 30000, 30000, NULL, 'HOAN_THANH', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:42:00')),
('CT046', 'DH018', 'M003', 1, 55000, 55000, NULL, 'DANG_CHUAN_BI', TIMESTAMP(CURRENT_DATE(), '11:36:00')),
('CT047', 'DH018', 'M008', 2, 25000, 50000, NULL, 'DANG_CHUAN_BI', TIMESTAMP(CURRENT_DATE(), '11:37:00')),
('CT048', 'DH018', 'M014', 1, 68000, 68000, NULL, 'DANG_CHUAN_BI', TIMESTAMP(CURRENT_DATE(), '11:38:00')),
('CT049', 'DH019', 'M016', 1, 259000, 259000, NULL, 'HOAN_THANH', TIMESTAMP(CURRENT_DATE(), '19:20:00')),
('CT050', 'DH019', 'M009', 1, 35000, 35000, NULL, 'HOAN_THANH', TIMESTAMP(CURRENT_DATE(), '19:21:00')),
('CT051', 'DH019', 'M018', 1, 45000, 45000, 'Tang kem sau bữa tối', 'HOAN_THANH', TIMESTAMP(CURRENT_DATE(), '19:22:00')),
('CT052', 'DH020', 'M003', 1, 55000, 55000, NULL, 'DANG_CHUAN_BI', TIMESTAMP(CURRENT_DATE(), '17:47:00')),
('CT053', 'DH020', 'M008', 2, 25000, 50000, NULL, 'DANG_CHUAN_BI', TIMESTAMP(CURRENT_DATE(), '17:48:00')),
('CT054', 'DH020', 'M014', 1, 68000, 68000, NULL, 'DANG_CHUAN_BI', TIMESTAMP(CURRENT_DATE(), '17:49:00'));

INSERT INTO HoaDon (MaHoaDon, MaDonHang, MaKH, MaNV, MaCode, TongTien, GiamGia, ThueSuat, TienThue, ThanhTien, GhiChu, NgayXuat) VALUES
('HD004', 'DH007', 'KH006', 'NV003', 'LOYAL25K', 210000, 25000, 10, 21000, 231000, 'Đơn gọi món tại bàn tri ân thành viên.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:46:00')),
('HD005', 'DH008', 'KH008', 'NV005', 'GIAM20K', 168000, 20000, 10, 16800, 184800, 'Ưu đãi cho đơn gọi món tại bàn.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '19:42:00')),
('HD006', 'DH009', 'KH009', 'NV007', NULL, 115000, 0, 10, 11500, 126500, 'Thanh toán thất bại trước khi khách hủy đơn.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:08:00')),
('HD007', 'DH010', 'KH002', 'NV003', NULL, 147000, 0, 10, 14700, 161700, 'Hóa đơn tại quầy giờ trưa.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '13:12:00')),
('HD008', 'DH011', 'KH001', 'NV003', NULL, 188000, 0, 8, 15040, 203040, 'Hóa đơn gọi món tại bàn buổi tối.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:46:00')),
('HD009', 'DH012', 'KH006', 'NV002', 'VIP25', 307000, 90000, 8, 24560, 331560, 'Đơn gọi món tại bàn VIP có áp dụng mã giảm giá.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '19:32:00')),
('HD010', 'DH014', 'KH008', 'NV002', NULL, 268000, 0, 10, 26800, 294800, 'Đơn tại quán buổi trưa có thêm tráng miệng.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:40:00')),
('HD011', 'DH015', 'KH006', 'NV002', 'VIP25', 394000, 90000, 10, 39400, 343400, 'Đơn tiệc VIP đã áp dụng ưu đãi thành viên.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:08:00')),
('HD012', 'DH016', 'KH007', 'NV003', NULL, 172000, 0, 8, 13760, 185760, 'Đơn gọi món tại bàn sau giờ tan làm.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:18:00')),
('HD013', 'DH017', 'KH009', 'NV005', 'GIAM20K', 226000, 20000, 8, 18080, 224080, 'Đơn gọi món tại bàn buổi tối.', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '19:48:00')),
('HD014', 'DH019', 'KH008', 'NV005', NULL, 312000, 0, 10, 31200, 343200, 'Đơn bữa tối cao điểm trong nhà hàng.', TIMESTAMP(CURRENT_DATE(), '20:46:00'));

INSERT INTO ThanhToan (MaThanhToan, MaHoaDon, PhuongThuc, SoTien, MaGiaoDich, TrangThai, ThoiGian) VALUES
('TT004', 'HD004', 'ChuyenKhoan', 231000, 'CK_DH007_001', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:48:00')),
('TT005', 'HD005', 'MoMo', 184800, 'MOMO_DH008_001', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '19:44:00')),
('TT006', 'HD006', 'VNPay', 126500, 'VNPAY_DH009_001', 'THAT_BAI', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:09:00')),
('TT007', 'HD007', 'TienMat', 161700, NULL, 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '13:15:00')),
('TT008', 'HD008', 'TheNganHang', 203040, 'CARD_DH011_001', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:48:00')),
('TT009', 'HD009', 'ZaloPay', 331560, 'ZALOPAY_DH012_001', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '19:35:00')),
('TT010', 'HD010', 'TienMat', 294800, NULL, 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:42:00')),
('TT011', 'HD011', 'TheNganHang', 343400, 'CARD_DH015_001', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:10:00')),
('TT012', 'HD012', 'ChuyenKhoan', 185760, 'CK_DH016_001', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:20:00')),
('TT013', 'HD013', 'MoMo', 224080, 'MOMO_DH017_001', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '19:50:00')),
('TT014', 'HD014', 'TienMat', 343200, NULL, 'THANH_CONG', TIMESTAMP(CURRENT_DATE(), '20:48:00')),
('TT015', 'HD002', 'TienMat', 154000, NULL, 'THANH_CONG', NOW()),
('TT016', 'HD003', 'MoMo', 143000, 'MOMO_DH003_002', 'THANH_CONG', NOW()),
('TT017', 'HD006', 'VNPay', 126500, 'VNPAY_DH009_002', 'THANH_CONG', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:12:00'));

INSERT INTO DanhGia (MaDanhGia, MaKH, MaDonHang, SoSao, NoiDung, PhanHoi, HinhAnh, SoLuotHuuIch, NgayDanhGia, NgayCapNhat, TrangThai) VALUES
('DG001', 'KH001', 'DH001', 5, 'Không gian đẹp, món lên nhanh và phục vụ lịch sự.', 'Cảm ơn quý khách đã ủng hộ nhà hàng.', NULL, 12, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '09:15:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '10:00:00'), 'Approved'),
('DG002', 'KH006', 'DH007', 4, 'Món phục vụ đúng giờ, trình bày cẩn thận.', NULL, NULL, 3, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:00:00'), 'Pending'),
('DG003', 'KH008', 'DH008', 2, 'Món lên bàn hơi nguội và nước chấm bị thiếu.', 'Nhà hàng đã liên hệ xin lỗi và gửi ưu đãi cho đơn tiếp theo.', NULL, 1, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '21:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '21:20:00'), 'Rejected'),
('DG004', 'KH002', 'DH010', 5, 'Cơm rang vừa vị, phục vụ nhanh vào giờ cao điểm.', NULL, '["/uploads/reviews/dg004-1.jpg"]', 8, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '14:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '14:00:00'), 'Approved'),
('DG005', 'KH001', 'DH011', 4, 'Combo bữa trưa tiện lợi, đồ ăn vẫn nóng khi lên bàn.', NULL, NULL, 5, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 11 DAY), '19:10:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 11 DAY), '19:10:00'), 'Approved'),
('DG006', 'KH006', 'DH012', 5, 'Nhân viên phục vụ tận tình, gọi món trước và được chuẩn bị rất chu đáo.', 'Cảm ơn quý khách, hẹn gặp lại ở đơn tiếp theo.', '["/uploads/reviews/dg006-1.jpg","/uploads/reviews/dg006-2.jpg"]', 15, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 19 DAY), '20:15:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 19 DAY), '20:40:00'), 'Approved'),
('DG007', 'KH008', 'DH014', 5, 'Bữa trưa rất ngon, món nướng và salad cân bằng, ra món nhanh.', NULL, NULL, 6, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '15:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '15:00:00'), 'Approved'),
('DG008', 'KH006', 'DH015', 5, 'Phòng VIP riêng tư, lau lên nóng và phục vụ chu đáo.', 'Cảm ơn quý khách đã tin tưởng đặt tiệc nhỏ tại nhà hàng.', NULL, 11, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '22:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '22:15:00'), 'Approved'),
('DG009', 'KH007', 'DH016', 4, 'Món lên bàn gọn gàng, bánh tiramisu rất ngon.', NULL, NULL, 4, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '09:00:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '09:00:00'), 'Pending'),
('DG010', 'KH009', 'DH017', 4, 'Không gian bàn sạch sẽ, đồ uống còn lạnh và đồ ăn gọi kỹ.', NULL, NULL, 2, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:10:00'), TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:10:00'), 'Approved'),
('DG011', 'KH008', 'DH019', 5, 'Bữa tối đông khách nhưng nhà hàng phục vụ vẫn nhanh, món rất ngon.', NULL, NULL, 7, TIMESTAMP(CURRENT_DATE(), '22:05:00'), TIMESTAMP(CURRENT_DATE(), '22:05:00'), 'Approved');

INSERT INTO LichSuDonHang (MaLichSu, MaDonHang, TrangThaiCu, TrangThaiMoi, GhiChu, NguoiThucHien, ThoiGian) VALUES
('LS013', 'DH001', NULL, 'DANG_CHUAN_BI', 'Tạo đơn từ booking đã xác nhận', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:15:00')),
('LS014', 'DH001', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Thu ngân xác nhận order tại quán', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:17:00')),
('LS015', 'DH001', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp tiếp nhận món', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:22:00')),
('LS016', 'DH001', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Hoàn tất thanh toán đơn tại quán', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '20:12:00')),
('LS017', 'DH004', NULL, 'DANG_CHUAN_BI', 'Tao order moi qua QR tai ban', 'System', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 35 MINUTE)),
('LS018', 'DH004', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên da xác nhận order tai ban', 'NV004', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 25 MINUTE)),
('LS019', 'DH004', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp đang chuẩn bị món', 'NV004', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE)),
('LS020', 'DH005', NULL, 'DANG_CHUAN_BI', 'Khách tai ban goi combo gia dinh', 'System', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 70 MINUTE)),
('LS021', 'DH005', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên tiep nhan don tai ban', 'NV002', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 60 MINUTE)),
('LS022', 'DH005', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp hoàn tất món chính', 'NV002', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
('LS023', 'DH005', 'DANG_PHUC_VU', 'HOAN_THANH', 'Bàn đã yêu cầu thanh toán, chờ xuất hóa đơn', 'NV002', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 8 MINUTE)),
('LS024', 'DH006', NULL, 'DANG_CHUAN_BI', 'Tao don theo booking check-in', 'NV005', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 50 MINUTE)),
('LS025', 'DH006', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Order duoc xác nhận tai ban', 'NV005', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 42 MINUTE)),
('LS026', 'DH006', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp bắt đầu chế biến', 'NV005', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
('LS027', 'DH006', 'DANG_PHUC_VU', 'HOAN_THANH', 'Da san sang phục vụ', 'NV005', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)),
('LS028', 'DH006', 'HOAN_THANH', 'Served', 'Nhân viên da mang mon ra ban', 'NV005', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 4 MINUTE)),
('LS029', 'DH007', NULL, 'DANG_CHUAN_BI', 'Khách tạo đơn gọi món tại bàn', 'System', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:20:00')),
('LS030', 'DH007', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Thu ngân gọi xác nhận đơn', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:25:00')),
('LS031', 'DH007', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp xử lý đơn trưa', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:30:00')),
('LS032', 'DH007', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Khách thanh toán tại bàn', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:48:00')),
('LS033', 'DH008', NULL, 'DANG_CHUAN_BI', 'Khách tạo đơn gọi món tại bàn', 'System', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:40:00')),
('LS034', 'DH008', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên xác nhận món với khách tại bàn', 'NV005', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:45:00')),
('LS035', 'DH008', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp chuẩn bị đơn tại bàn', 'NV005', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '18:55:00')),
('LS036', 'DH008', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Đơn tại bàn đã thanh toán', 'NV005', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '19:44:00')),
('LS037', 'DH009', NULL, 'DANG_CHUAN_BI', 'Tạo đơn gọi món tại bàn online', 'System', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:50:00')),
('LS038', 'DH009', 'DANG_CHUAN_BI', 'DA_HUY', 'Khách hủy đơn trước khi bếp nhận', 'NV007', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:05:00')),
('LS039', 'DH010', NULL, 'DANG_CHUAN_BI', 'Tạo đơn tại quầy giờ trưa', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '12:20:00')),
('LS040', 'DH010', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Thu ngân xác nhận order', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '12:25:00')),
('LS041', 'DH010', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp ra món nhanh cho khách ăn tại quán', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '12:35:00')),
('LS042', 'DH010', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Khách thanh toán xong tại quầy', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '13:15:00')),
('LS043', 'DH011', NULL, 'DANG_CHUAN_BI', 'Đơn gọi món tại bàn buổi tối được tạo từ app', 'System', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:00:00')),
('LS044', 'DH011', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Thu ngân xác nhận món tại bàn', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:10:00')),
('LS045', 'DH011', 'DANG_CHUAN_BI', 'DA_THANH_TOAN', 'Khách thanh toán tại bàn bằng thẻ', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:48:00')),
('LS046', 'DH012', NULL, 'DANG_CHUAN_BI', 'Khách VIP tạo đơn gọi món tại bàn', 'System', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '18:15:00')),
('LS047', 'DH012', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên gọi xác nhận và áp mã VIP', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '18:25:00')),
('LS048', 'DH012', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp xử lý đơn lớn', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '18:45:00')),
('LS049', 'DH012', 'DANG_PHUC_VU', 'HOAN_THANH', 'Bếp đã hoàn tất món tại bàn', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '19:10:00')),
('LS050', 'DH012', 'HOAN_THANH', 'DA_THANH_TOAN', 'Thanh toán thành công qua ZaloPay', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '19:35:00')),
('LS051', 'DH013', NULL, 'DANG_CHUAN_BI', 'Khách vua tao order trong nhà', 'System', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)),
('LS052', 'DH013', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên tiep nhan order tai bar', 'NV005', DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 MINUTE)),
('LS053', 'DH014', NULL, 'DANG_CHUAN_BI', 'Tạo đơn theo booking buổi trưa', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:18:00')),
('LS054', 'DH014', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Host chốt món và gửi bếp', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:22:00')),
('LS055', 'DH014', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp xử lý món trưa', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '12:30:00')),
('LS056', 'DH014', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Khách thanh toán xong trước 14h', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:42:00')),
('LS057', 'DH015', NULL, 'DANG_CHUAN_BI', 'Tạo đơn tiệc VIP theo booking', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '19:20:00')),
('LS058', 'DH015', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Quản lý ca xác nhận đơn VIP', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '19:25:00')),
('LS059', 'DH015', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp xử lý lẩu và món nướng', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '19:40:00')),
('LS060', 'DH015', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Khách thanh toán sau bữa tối', 'NV002', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:10:00')),
('LS061', 'DH016', NULL, 'DANG_CHUAN_BI', 'Tạo đơn gọi món tại bàn buổi tối', 'System', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:30:00')),
('LS062', 'DH016', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Thu ngân xác nhận món với khách tại bàn', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:40:00')),
('LS063', 'DH016', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp hoàn tất combo và tráng miệng', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '17:55:00')),
('LS064', 'DH016', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Khách thanh toán đúng giờ tại bàn', 'NV003', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:20:00')),
('LS065', 'DH017', NULL, 'DANG_CHUAN_BI', 'Tạo đơn gọi món tại bàn nội thành', 'System', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:35:00')),
('LS066', 'DH017', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên xác nhận món buổi tối tại bàn', 'NV005', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:45:00')),
('LS067', 'DH017', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp chuẩn bị món tại bàn', 'NV005', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '19:00:00')),
('LS068', 'DH017', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Khách thanh toán tại bàn', 'NV005', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '19:50:00')),
('LS069', 'DH018', NULL, 'DANG_CHUAN_BI', 'Đơn trưa hôm nay vừa được tạo', 'NV003', TIMESTAMP(CURRENT_DATE(), '11:35:00')),
('LS070', 'DH018', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Thu ngân đã xác nhận order bàn trưa', 'NV003', TIMESTAMP(CURRENT_DATE(), '11:40:00')),
('LS071', 'DH019', NULL, 'DANG_CHUAN_BI', 'Tạo đơn bữa tối cao điểm theo booking', 'NV005', TIMESTAMP(CURRENT_DATE(), '19:18:00')),
('LS072', 'DH019', 'DANG_CHUAN_BI', 'DANG_CHUAN_BI', 'Nhân viên đã chốt món cho khách bữa tối', 'NV005', TIMESTAMP(CURRENT_DATE(), '19:22:00')),
('LS073', 'DH019', 'DANG_CHUAN_BI', 'DANG_PHUC_VU', 'Bếp hoàn tất món chính và tráng miệng', 'NV005', TIMESTAMP(CURRENT_DATE(), '19:40:00')),
('LS074', 'DH019', 'DANG_PHUC_VU', 'DA_THANH_TOAN', 'Khách thanh toán xong trong khung cao điểm tối', 'NV005', TIMESTAMP(CURRENT_DATE(), '20:48:00'));

INSERT INTO LichSuDiemTichLuy (MaGiaoDichDiem, MaKH, MaDonHang, LoaiBienDong, SoDiem, SoDiemTruoc, SoDiemSau, MoTa, NgayTao) VALUES
('LSD004', 'KH001', 'DH011', 'CONG', 120, 0, 120, 'Cộng điểm từ đơn gọi món tại bàn DH011', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '18:50:00')),
('LSD005', 'KH001', 'DH001', 'CONG', 115, 120, 235, 'Cộng điểm từ đơn tại quán DH001', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '20:15:00')),
('LSD006', 'KH002', 'DH010', 'CONG', 150, 0, 150, 'Cộng điểm từ đơn tại quầy DH010', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '13:20:00')),
('LSD007', 'KH006', 'DH012', 'CONG', 180, 0, 180, 'Cộng điểm từ đơn gọi món tại bàn VIP DH012', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '19:40:00')),
('LSD008', 'KH006', 'DH007', 'CONG', 140, 180, 320, 'Cộng điểm từ đơn gọi món tại bàn DH007', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:50:00')),
('LSD009', 'KH007', NULL, 'DIEU_CHINH', 45, 0, 45, 'Admin điều chỉnh điểm khuyến khích khách hàng thân thiết', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '09:00:00')),
('LSD010', 'KH008', 'DH008', 'CONG', 95, 0, 95, 'Cộng điểm từ đơn gọi món tại bàn DH008', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '19:50:00')),
('LSD011', 'KH009', NULL, 'CONG', 12, 0, 12, 'Tăng điểm cho khách đối tác mới đăng ký', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '10:00:00')),
('LSD012', 'KH008', 'DH014', 'CONG', 180, 95, 275, 'Cộng điểm từ đơn buổi trưa DH014', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '13:45:00')),
('LSD013', 'KH006', 'DH015', 'CONG', 250, 320, 570, 'Cộng điểm từ đơn tiệc VIP DH015', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), '21:15:00')),
('LSD014', 'KH007', 'DH016', 'CONG', 120, 45, 165, 'Cộng điểm từ đơn gọi món tại bàn DH016', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:25:00')),
('LSD015', 'KH009', 'DH017', 'CONG', 160, 12, 172, 'Cộng điểm từ đơn gọi món tại bàn DH017', TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '19:55:00')),
('LSD016', 'KH008', 'DH019', 'CONG', 210, 275, 485, 'Cộng điểm từ đơn bữa tối cao điểm DH019', TIMESTAMP(CURRENT_DATE(), '20:55:00'));

UPDATE KhachHang
SET DiemTichLuy = CASE MaKH
    WHEN 'KH001' THEN 235
    WHEN 'KH002' THEN 165
    WHEN 'KH006' THEN 570
    WHEN 'KH007' THEN 165
    WHEN 'KH008' THEN 485
    WHEN 'KH009' THEN 172
    WHEN 'KH_TEST_01' THEN 14
    ELSE DiemTichLuy
END
WHERE MaKH IN ('KH001', 'KH002', 'KH006', 'KH007', 'KH008', 'KH009', 'KH_TEST_01');

UPDATE MaGiamGia
SET SoLanDaDung = CASE MaCode
    WHEN 'WELCOME10' THEN 1
    WHEN 'GIAM50K' THEN 1
    WHEN 'LOYAL25K' THEN 1
    WHEN 'GIAM20K' THEN 1
    WHEN 'VIP25' THEN 1
    ELSE SoLanDaDung
END
WHERE MaCode IN ('WELCOME10', 'GIAM50K', 'LOYAL25K', 'GIAM20K', 'VIP25');

INSERT INTO ThongBao (MaThongBao, MaND, TieuDe, NoiDung, LoaiThongBao, MaThamChieu, DaDoc, NgayTao) VALUES
('TB001', 'ND001', 'Co danh gia moi cho duyet', 'Đánh giá DG002 dang o trang thai Pending va can admin xu ly.', 'DanhGia', 'DG002', FALSE, DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 50 MINUTE)),
('TB002', 'ND002', 'Booking sap den can gọi lại', 'Booking DB002 sap den trong vong 2 gio va chua chot hoàn tất.', 'DatBan', 'DB002', FALSE, DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 35 MINUTE)),
('TB003', 'ND003', 'Đơn tại bàn sẵn sàng phục vụ', 'Đơn DH002 đã sẵn sàng, cần phục vụ khách tại bàn.', 'DonHang', 'DH002', FALSE, DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)),
('TB004', 'ND006', 'Ban B003 vua co order moi', 'Khách tai ban B003 vua gui them mon qua QR.', 'DonHang', 'DH004', FALSE, DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)),
('TB005', 'ND007', 'Booking VIP da duoc xác nhận', 'Booking DB004 da giu phong VIP cho khách Le Minh Chau.', 'DatBan', 'DB004', TRUE, TIMESTAMP(CURRENT_DATE(), '09:30:00')),
('TB006', 'ND004', 'Điểm tích lũy vừa được cập nhật', 'Bạn vừa nhận thêm điểm từ đơn hàng DH001.', 'HeThong', 'DH001', TRUE, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '20:20:00')),
('TB007', 'ND010', 'Đơn tại bàn thành công', 'Đơn DH007 đã thanh toán thành công, điểm tích lũy đã được cộng.', 'DonHang', 'DH007', TRUE, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '11:55:00')),
('TB008', 'ND001', 'Cần xử lý thanh toán thất bại', 'Thanh toán TT006 của đơn DH009 đang ở trạng thái Failed.', 'HeThong', 'TT006', FALSE, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:10:00')),
('TB009', 'ND003', 'Khách vua danh gia 5 sao', 'Đánh giá DG004 da duoc khách gui cho don DH010.', 'DanhGia', 'DG004', TRUE, TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '14:05:00')),
('TB010', 'ND009', 'Bao cao cuoi ngay da san sang', 'Du lieu doanh thu va booking hom nay da san sang de doi chieu.', 'HeThong', 'REPORT_001', FALSE, TIMESTAMP(CURRENT_DATE(), '22:00:00'));

-- ============================================================
-- DIEU CHINH DỮ LIỆU MẪU SAU KHI INSERT
-- Gom cac lenh UPDATE xuong cuoi de de theo doi khi chay seed.
-- ============================================================

-- Tai khoan khách test moi
UPDATE NguoiDung
SET MatKhau = '$2b$10$XOeTjjVS0Y6Cm9U45RXyTeza/xg/V6ehWwVVnggLRZ55k41IEhGUG'
WHERE LOWER(Email) = LOWER('khach1@gmail.com');

-- Dong bo bo seed goc ve moc thoi gian co y nghia hon cho viec test.
UPDATE DatBan
SET NgayDat = DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY),
    GioDat = '18:00:00',
    GioKetThuc = '20:00:00',
    TrangThai = 'HOAN_THANH',
    NgayTao = TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), '14:00:00'),
    NgayCapNhat = TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '20:05:00')
WHERE MaDatBan = 'DB001';

UPDATE DonHang
SET NgayTao = TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '18:15:00'),
    NgayCapNhat = TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '20:10:00')
WHERE MaDonHang = 'DH001';

UPDATE HoaDon
SET NgayXuat = TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '20:10:00')
WHERE MaHoaDon = 'HD001';

UPDATE ThanhToan
SET ThoiGian = TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), '20:12:00')
WHERE MaThanhToan = 'TT001';

UPDATE LichSuDiemTichLuy
SET SoDiemTruoc = 150,
    SoDiemSau = 165,
    MoTa = 'Cộng điểm từ đơn gọi món tại bàn DH002',
    NgayTao = TIMESTAMP(CURRENT_DATE(), '18:45:00')
WHERE MaGiaoDichDiem = 'LSD002';

UPDATE Ban SET TrangThai = 'TRONG';
UPDATE Ban SET TrangThai = 'BAO_TRI' WHERE MaBan IN ('B007', 'B023', 'B037', 'B061');
UPDATE Ban b
JOIN DatBan db ON db.MaBan = b.MaBan
SET b.TrangThai = 'DA_DAT'
WHERE b.TrangThai <> 'BAO_TRI'
  AND db.TrangThai IN ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'YEU_CAU_DAT_BAN', 'GIU_CHO_TAM', 'DA_XAC_NHAN', 'CAN_GOI_LAI', 'CHO_XAC_NHAN', 'DA_GHI_NHAN', 'DA_GAN_BAN');
UPDATE Ban b
JOIN DatBan db ON db.MaBan = b.MaBan
SET b.TrangThai = 'CO_KHACH'
WHERE b.TrangThai <> 'BAO_TRI'
  AND db.TrangThai IN ('DA_NHAN_BAN', 'DA_CHECK_IN', 'DA_XEP_BAN', 'DANG_PHUC_VU', 'DA_NHAN_BAN');
UPDATE Ban b
JOIN DonHang dh ON dh.MaBan = b.MaBan
SET b.TrangThai = 'CO_KHACH'
WHERE b.TrangThai <> 'BAO_TRI'
  AND dh.TrangThai IN ('DANG_CHUAN_BI', 'DA_XAC_NHAN', 'DANG_PHUC_VU', 'HOAN_THANH', 'CHO_XU_LY', 'DANG_CHE_BIEN', 'SAN_SANG');
