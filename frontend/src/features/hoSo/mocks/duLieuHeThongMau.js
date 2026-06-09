import { DANH_SACH_PHIEU_GIAM_GIA_GOI_Y } from '../../gioHang/constants/phieuGiamGia'
import { TRANG_THAI_BAN } from '../../../constants/trangThaiBan'

const taoMonDonHang = ({ maChiTiet, maMon, tenMon, soLuong, donGia, thanhTien, ghiChu = '', trangThai = 'DANG_CHUAN_BI' }) => Object.freeze({
  id: maChiTiet,
  maChiTiet,
  menuItemId: maMon,
  maMon,
  tenMon,
  name: tenMon,
  soLuong,
  quantity: soLuong,
  donGia,
  price: donGia,
  thanhTien,
  note: ghiChu,
  ghiChu,
  status: trangThai,
  trangThai,
})

const taoTaiKhoan = ({
  id,
  maND,
  maNV = '',
  maKH = '',
  fullName,
  email,
  phone = '',
  role,
  vaiTro,
  trangThai = 'Active',
  chucVu = '',
  address = '',
  diemTichLuy = 0,
  laKhachVangLai = false,
}) => Object.freeze({
  id,
  maND,
  maNV,
  maKH,
  fullName,
  username: maND || maKH || id,
  email,
  phone,
  role,
  vaiTro,
  trangThai,
  chucVu,
  address,
  diemTichLuy,
  laKhachVangLai,
})

const taoBan = ({ code, name, tableNumber, capacity, areaId, rawAreaText, note = '', status = TRANG_THAI_BAN.TRONG }) => Object.freeze({
  id: code,
  code,
  name,
  tableNumber,
  capacity,
  areaId,
  rawAreaText,
  note,
  status,
})

const taoTongQuanDiem = (tongDiem) => Object.freeze({
  tongDiem,
  diemCoTheDoi: tongDiem - (tongDiem % 100),
  tiLeQuyDoi: 100,
  giaTriQuyDoi: 10000,
})

const MON_DH001 = Object.freeze([
  taoMonDonHang({ maChiTiet: 'CT001', maMon: 'M001', tenMon: 'Goi Cuon Tom Thit', soLuong: 2, donGia: 35000, thanhTien: 70000, trangThai: 'Done' }),
  taoMonDonHang({ maChiTiet: 'CT002', maMon: 'M004', tenMon: 'Pho Bo Dac Biet', soLuong: 1, donGia: 75000, thanhTien: 75000, trangThai: 'Done' }),
  taoMonDonHang({ maChiTiet: 'CT003', maMon: 'M008', tenMon: 'Ca Phe Sua Da', soLuong: 2, donGia: 25000, thanhTien: 50000, trangThai: 'Done' }),
  taoMonDonHang({ maChiTiet: 'CT004', maMon: 'M006', tenMon: 'Kem Dau Tay', soLuong: 1, donGia: 30000, thanhTien: 30000, trangThai: 'Done' }),
])

const MON_DH002 = Object.freeze([
  taoMonDonHang({ maChiTiet: 'CT005', maMon: 'M003', tenMon: 'Com Rang Duong Chau', soLuong: 1, donGia: 55000, thanhTien: 55000, ghiChu: 'Khong hanh', trangThai: 'Done' }),
  taoMonDonHang({ maChiTiet: 'CT006', maMon: 'M009', tenMon: 'Tra Dao Cam Sa', soLuong: 1, donGia: 35000, thanhTien: 35000, ghiChu: 'It da', trangThai: 'Done' }),
  taoMonDonHang({ maChiTiet: 'CT007', maMon: 'M007', tenMon: 'Banh Flan Caramel', soLuong: 2, donGia: 25000, thanhTien: 50000, trangThai: 'Done' }),
])

const MON_DH003 = Object.freeze([
  taoMonDonHang({ maChiTiet: 'CT008', maMon: 'M004', tenMon: 'Pho Bo Dac Biet', soLuong: 1, donGia: 75000, thanhTien: 75000, ghiChu: 'Them tieu', trangThai: 'DANG_CHUAN_BI' }),
  taoMonDonHang({ maChiTiet: 'CT009', maMon: 'M008', tenMon: 'Ca Phe Sua Da', soLuong: 2, donGia: 25000, thanhTien: 50000, ghiChu: 'Bot duong', trangThai: 'DANG_CHUAN_BI' }),
  taoMonDonHang({ maChiTiet: 'CT010', maMon: 'M010', tenMon: 'Nuoc Ep Cam', soLuong: 1, donGia: 30000, thanhTien: 30000, trangThai: 'DANG_CHUAN_BI' }),
])

export const THONG_TIN_DANG_NHAP_MAU = Object.freeze({
  admin: Object.freeze({
    email: 'admin@nhahang.com',
    matKhau: 'Admin@123',
    vaiTro: 'Admin',
    role: 'admin',
    maND: 'ND001',
  }),
  nhanVien: Object.freeze([
    Object.freeze({
      email: 'an.nv@nhahang.com',
      matKhau: 'Staff@123',
      vaiTro: 'NhanVien',
      role: 'staff',
      maND: 'ND002',
      maNV: 'NV002',
    }),
    Object.freeze({
      email: 'bich.lt@nhahang.com',
      matKhau: 'Staff@123',
      vaiTro: 'NhanVien',
      role: 'staff',
      maND: 'ND003',
      maNV: 'NV003',
    }),
  ]),
  khachHang: Object.freeze([
    Object.freeze({
      email: 'khach1@gmail.com',
      matKhau: '123',
      vaiTro: 'KhachHang',
      role: 'customer',
      maND: 'ND004',
      maKH: 'KH001',
    }),
    Object.freeze({
      email: 'mai.pt@gmail.com',
      matKhau: '123',
      vaiTro: 'KhachHang',
      role: 'customer',
      maND: 'ND005',
      maKH: 'KH002',
    }),
    Object.freeze({
      email: 'khachtest01@gmail.com',
      matKhau: '',
      vaiTro: 'KhachHang',
      role: 'customer',
      maND: 'ND_KH_TEST_01',
      maKH: 'KH_TEST_01',
      ghiChu: 'Hash goc trong DB dang chay chua duoc doi chieu thanh plain text.',
    }),
  ]),
})

export const DANH_SACH_QUAN_LY_MAU = Object.freeze([
  taoTaiKhoan({
    id: 'ND001',
    maND: 'ND001',
    maNV: 'NV001',
    fullName: 'Admin System',
    email: 'admin@nhahang.com',
    phone: '0901111111',
    role: 'admin',
    vaiTro: 'Admin',
    chucVu: 'Admin',
  }),
])

export const DANH_SACH_NHAN_VIEN_MAU = Object.freeze([
  taoTaiKhoan({
    id: 'ND002',
    maND: 'ND002',
    maNV: 'NV002',
    fullName: 'Nguyen Van An',
    email: 'an.nv@nhahang.com',
    phone: '0901234567',
    role: 'staff',
    vaiTro: 'NhanVien',
    chucVu: 'QuanLy',
  }),
  taoTaiKhoan({
    id: 'ND003',
    maND: 'ND003',
    maNV: 'NV003',
    fullName: 'Le Thi Bich',
    email: 'bich.lt@nhahang.com',
    phone: '0907654321',
    role: 'staff',
    vaiTro: 'NhanVien',
    chucVu: 'ThuNgan',
  }),
])

export const KHACH_HANG_VANG_LAI_MAU = Object.freeze({
  maKH: 'KH003',
  tenKH: 'Khach Vang Lai',
  sdt: '',
  diaChi: '',
  diemTichLuy: 0,
})

export const DANH_SACH_KHACH_HANG_MAU = Object.freeze([
  taoTaiKhoan({
    id: 'ND004',
    maND: 'ND004',
    maKH: 'KH001',
    fullName: 'Tran Van Khach',
    email: 'khach1@gmail.com',
    phone: '0912345678',
    role: 'customer',
    vaiTro: 'KhachHang',
    diemTichLuy: 150,
  }),
  taoTaiKhoan({
    id: 'ND005',
    maND: 'ND005',
    maKH: 'KH002',
    fullName: 'Pham Thi Mai',
    email: 'mai.pt@gmail.com',
    phone: '0987654321',
    role: 'customer',
    vaiTro: 'KhachHang',
    diemTichLuy: 80,
  }),
  taoTaiKhoan({
    id: 'KH003',
    maND: '',
    maKH: 'KH003',
    fullName: 'Khach Vang Lai',
    email: '',
    phone: '',
    role: 'customer',
    vaiTro: 'KhachHang',
    diemTichLuy: 0,
    laKhachVangLai: true,
  }),
  taoTaiKhoan({
    id: 'ND_KH_TEST_01',
    maND: 'ND_KH_TEST_01',
    maKH: 'KH_TEST_01',
    fullName: 'Nguyen Van Test',
    email: 'khachtest01@gmail.com',
    phone: '0901239999',
    role: 'customer',
    vaiTro: 'KhachHang',
    address: '123 Nguyen Hue, Q1, TP.HCM',
    diemTichLuy: 0,
  }),
])

export const DANH_SACH_TAI_KHOAN_MAU = Object.freeze([
  ...DANH_SACH_QUAN_LY_MAU,
  ...DANH_SACH_NHAN_VIEN_MAU,
  ...DANH_SACH_KHACH_HANG_MAU.filter((taiKhoan) => !taiKhoan.laKhachVangLai),
])

export const DANH_SACH_BAN_MAU = Object.freeze([
  taoBan({ code: 'B001', name: 'Ban 1', tableNumber: 1, capacity: 2, areaId: 'SANH_CHINH', rawAreaText: 'Trong nha' }),
  taoBan({ code: 'B002', name: 'Ban 2', tableNumber: 2, capacity: 4, areaId: 'SANH_CHINH', rawAreaText: 'Trong nha' }),
  taoBan({ code: 'B003', name: 'Ban 3', tableNumber: 3, capacity: 4, areaId: 'SANH_CHINH', rawAreaText: 'Trong nha' }),
  taoBan({ code: 'B004', name: 'Ban 4', tableNumber: 4, capacity: 6, areaId: 'SANH_CHINH', rawAreaText: 'Trong nha' }),
  taoBan({ code: 'B005', name: 'Ban VIP', tableNumber: 5, capacity: 8, areaId: 'PHONG_VIP', rawAreaText: 'Khu rieng' }),
  taoBan({ code: 'B006', name: 'Ban 6', tableNumber: 6, capacity: 2, areaId: 'BAN_CONG', rawAreaText: 'Ngoai troi' }),
  taoBan({ code: 'B007', name: 'Ban 7', tableNumber: 7, capacity: 4, areaId: 'SANH_CHINH', rawAreaText: 'Trong nha' }),
  taoBan({ code: 'B008', name: 'Ban 8', tableNumber: 8, capacity: 4, areaId: 'SANH_CHINH', rawAreaText: 'Trong nha' }),
  taoBan({ code: 'B009', name: 'Ban 9', tableNumber: 9, capacity: 6, areaId: 'BAN_CONG', rawAreaText: 'Ngoai troi' }),
  taoBan({ code: 'B010', name: 'Ban 10', tableNumber: 10, capacity: 2, areaId: 'BAN_CONG', rawAreaText: 'Ngoai troi' }),
  taoBan({ code: 'B011', name: 'Ban 11', tableNumber: 11, capacity: 8, areaId: 'PHONG_VIP', rawAreaText: 'Khu rieng' }),
])

export const DANH_SACH_DAT_BAN_MAU = Object.freeze([
  Object.freeze({
    id: 'DB001',
    bookingCode: 'DB001',
    maKH: 'KH001',
    maNV: 'NV002',
    danhSachMaBanDaGan: Object.freeze(['B004']),
    danhSachBanDaGan: Object.freeze([DANH_SACH_BAN_MAU.find((ban) => ban.code === 'B004')]),
    guests: '4',
    date: '2026-08-10',
    time: '18:00',
    seatingArea: 'PHONG_VIP',
    notes: 'Sinh nhat, can banh kem',
    internalNote: 'Can sap xep ban dep va uu tien check-in dung gio',
    name: 'Tran Van Khach',
    phone: '0912345678',
    email: 'khach1@gmail.com',
    status: 'DA_XAC_NHAN',
    source: 'DatBan',
    createdAt: '2026-08-10T17:00:00',
    updatedAt: '2026-08-10T17:30:00',
    createdBy: 'NV002',
  }),
])

export const LICH_SU_DAT_BAN_MAU_THEO_KHACH_HANG = Object.freeze({
  KH001: Object.freeze([
    Object.freeze({
      bookingId: 'DB001',
      id: 'DB001',
      bookingCode: 'DB001',
      date: '2026-08-10',
      time: '18:00',
      guestCount: 4,
      area: 'Khu riêng',
      dateTime: '10/08/2026 18:00',
      guests: 4,
      seatingArea: 'Khu riêng',
      rawStatus: 'DA_XAC_NHAN',
      status: '🟢 Đã xác nhận',
      statusLabel: 'Đã xác nhận',
      statusTone: 'success',
    }),
  ]),
  KH002: Object.freeze([]),
  KH003: Object.freeze([]),
  KH_TEST_01: Object.freeze([]),
})

const DON_HANG_DH001 = Object.freeze({
  id: 'DH001',
  maDonHang: 'DH001',
  orderCode: 'DH001',
  orderDate: '2026-08-10T18:00:00',
  ngayTao: '2026-08-10T18:00:00',
  loaiDon: 'TAI_BAN',
  status: 'DA_THANH_TOAN',
  trangThai: 'DA_THANH_TOAN',
  total: 215000,
  tongTien: 215000,
  subtotal: 225000,
  serviceFee: 0,
  discountAmount: 10000,
  tongHopGia: Object.freeze({
    tamTinh: 225000,
    phiDichVu: 0,
    giamGia: 10000,
    tongTien: 215000,
  }),
  voucher: Object.freeze({
    code: 'WELCOME10',
    maCode: 'WELCOME10',
    tenCode: 'Chao mung KH moi',
    giaTri: '10%',
    giamGia: 21500,
  }),
  paymentMethod: 'ChuyenKhoan',
  paymentStatus: 'Success',
  note: '',
  ghiChu: '',
  tableNumber: 'B004',
  maBan: 'B004',
  maKH: 'KH001',
  maNV: 'NV002',
  maDatBan: 'DB001',
  nguonTao: 'DatBan',
  customer: Object.freeze({
    code: 'KH001',
    fullName: 'Tran Van Khach',
    phone: '0912345678',
    email: 'khach1@gmail.com',
    address: '',
  }),
  items: MON_DH001,
  danhSachMon: MON_DH001,
})

const DON_HANG_DH002 = Object.freeze({
  id: 'DH002',
  maDonHang: 'DH002',
  orderCode: 'DH002',
  orderDate: '2026-08-10T18:30:00',
  ngayTao: '2026-08-10T18:30:00',
  loaiDon: 'TAI_BAN',
  status: 'DANG_PHUC_VU',
  trangThai: 'DANG_PHUC_VU',
  total: 140000,
  tongTien: 140000,
  subtotal: 140000,
  serviceFee: 0,
  discountAmount: 0,
  tongHopGia: Object.freeze({
    tamTinh: 140000,
    phiDichVu: 0,
    giamGia: 0,
    tongTien: 140000,
  }),
  voucher: Object.freeze({}),
  paymentMethod: 'TienMat',
  paymentStatus: 'THANH_CONG',
  note: 'Khach goi mon tai ban sau gio tan lam',
  ghiChu: 'Khach goi mon tai ban sau gio tan lam',
  tableNumber: 'B001',
  maBan: 'B001',
  maKH: 'KH002',
  maNV: 'NV003',
  maDatBan: '',
  nguonTao: 'Online',
  customer: Object.freeze({
    code: 'KH002',
    fullName: 'Pham Thi Mai',
    phone: '0987654321',
    email: 'mai.pt@gmail.com',
    address: '',
  }),
  items: MON_DH002,
  danhSachMon: MON_DH002,
})

const DON_HANG_DH003 = Object.freeze({
  id: 'DH003',
  maDonHang: 'DH003',
  orderCode: 'DH003',
  orderDate: '2026-08-10T19:15:00',
  ngayTao: '2026-08-10T19:15:00',
  loaiDon: 'TAI_BAN',
  status: 'DA_XAC_NHAN',
  trangThai: 'DA_XAC_NHAN',
  total: 180000,
  tongTien: 180000,
  subtotal: 155000,
  serviceFee: 10000,
  discountAmount: 0,
  tongHopGia: Object.freeze({
    tamTinh: 155000,
    phiDichVu: 10000,
    giamGia: 0,
    tongTien: 180000,
  }),
  voucher: Object.freeze({
    code: 'GIAM50K',
    maCode: 'GIAM50K',
    tenCode: 'Giam thang 50k',
    giaTri: '50.000đ',
    giamGia: 50000,
  }),
  paymentMethod: 'MoMo',
  paymentStatus: 'THANH_CONG',
  note: 'Khach goi mon tai ban, bao nhan vien truoc khi phuc vu',
  ghiChu: 'Khach goi mon tai ban, bao nhan vien truoc khi phuc vu',
  tableNumber: 'B002',
  maBan: 'B002',
  maKH: 'KH_TEST_01',
  maNV: 'NV002',
  maDatBan: '',
  nguonTao: 'Online',
  customer: Object.freeze({
    code: 'KH_TEST_01',
    fullName: 'Nguyen Van Test',
    phone: '0901239999',
    email: 'khachtest01@gmail.com',
    address: '123 Nguyen Hue, Q1, TP.HCM',
  }),
  items: MON_DH003,
  danhSachMon: MON_DH003,
})

export const DANH_SACH_DON_HANG_HE_THONG_MAU = Object.freeze([
  DON_HANG_DH001,
  DON_HANG_DH002,
  DON_HANG_DH003,
])

export const CHI_TIET_DON_HANG_MAU_THEO_MA = Object.freeze({
  DH001: DON_HANG_DH001,
  DH002: DON_HANG_DH002,
  DH003: DON_HANG_DH003,
})

export const DANH_SACH_DON_HANG_HO_SO_MAU = Object.freeze([])

export const DON_HANG_HO_SO_MAU_THEO_KHACH_HANG = Object.freeze({
  KH001: Object.freeze([]),
  KH002: Object.freeze([]),
  KH003: Object.freeze([]),
  KH_TEST_01: Object.freeze([]),
})

export const DANH_SACH_HOA_DON_MAU = Object.freeze([
  Object.freeze({
    maHoaDon: 'HD001',
    maDonHang: 'DH001',
    maKH: 'KH001',
    maCode: 'WELCOME10',
    tongTien: 215000,
    giamGia: 21500,
    thueSuat: 10,
    tienThue: 19350,
    thanhTien: 212850,
    ghiChu: '',
    ngayXuat: '2026-08-10T20:00:00',
  }),
  Object.freeze({
    maHoaDon: 'HD002',
    maDonHang: 'DH002',
    maKH: 'KH002',
    maCode: '',
    tongTien: 140000,
    giamGia: 0,
    thueSuat: 10,
    tienThue: 14000,
    thanhTien: 154000,
    ghiChu: 'Khach den lay tai quay',
    ngayXuat: '2026-08-10T18:40:00',
  }),
  Object.freeze({
    maHoaDon: 'HD003',
    maDonHang: 'DH003',
    maKH: 'KH_TEST_01',
    maCode: 'GIAM50K',
    tongTien: 180000,
    giamGia: 50000,
    thueSuat: 10,
    tienThue: 13000,
    thanhTien: 143000,
    ghiChu: 'Don goi mon tai ban khu vuc trung tam',
    ngayXuat: '2026-08-10T19:30:00',
  }),
])

export const DANH_SACH_THANH_TOAN_MAU = Object.freeze([
  Object.freeze({
    maThanhToan: 'TT001',
    maHoaDon: 'HD001',
    phuongThuc: 'ChuyenKhoan',
    soTien: 212850,
    maGiaoDich: '',
    trangThai: 'Success',
    thoiGian: '2026-08-10T20:05:00',
  }),
  Object.freeze({
    maThanhToan: 'TT002',
    maHoaDon: 'HD002',
    phuongThuc: 'TienMat',
    soTien: 154000,
    maGiaoDich: '',
    trangThai: 'DANG_CHUAN_BI',
    thoiGian: '2026-08-10T18:45:00',
  }),
  Object.freeze({
    maThanhToan: 'TT003',
    maHoaDon: 'HD003',
    phuongThuc: 'MoMo',
    soTien: 143000,
    maGiaoDich: 'MOMO_DH003_001',
    trangThai: 'DANG_CHUAN_BI',
    thoiGian: '2026-08-10T19:35:00',
  }),
])

export const LICH_SU_TRANG_THAI_DON_HANG_MAU = Object.freeze({
  DH001: Object.freeze([]),
  DH002: Object.freeze([
    Object.freeze({ maLichSu: 'LS007', maDonHang: 'DH002', trangThaiCu: '', trangThaiMoi: 'DANG_CHUAN_BI', ghiChu: 'Tao don goi mon tai ban', nguoiThucHien: 'System', thoiGian: '2026-08-10T18:30:00' }),
    Object.freeze({ maLichSu: 'LS008', maDonHang: 'DH002', trangThaiCu: 'DANG_CHUAN_BI', trangThaiMoi: 'DA_XAC_NHAN', ghiChu: 'Nhan vien xac nhan mon voi khach tai ban', nguoiThucHien: 'NV003', thoiGian: '2026-08-10T18:32:00' }),
    Object.freeze({ maLichSu: 'LS009', maDonHang: 'DH002', trangThaiCu: 'DA_XAC_NHAN', trangThaiMoi: 'DANG_CHUAN_BI', ghiChu: 'Bep tiep nhan don', nguoiThucHien: 'NV003', thoiGian: '2026-08-10T18:34:00' }),
    Object.freeze({ maLichSu: 'LS010', maDonHang: 'DH002', trangThaiCu: 'DANG_CHUAN_BI', trangThaiMoi: 'DANG_PHUC_VU', ghiChu: 'Mon san sang phuc vu tai ban', nguoiThucHien: 'NV003', thoiGian: '2026-08-10T18:38:00' }),
  ]),
  DH003: Object.freeze([
    Object.freeze({ maLichSu: 'LS011', maDonHang: 'DH003', trangThaiCu: '', trangThaiMoi: 'DANG_CHUAN_BI', ghiChu: 'Tao don goi mon tai ban', nguoiThucHien: 'System', thoiGian: '2026-08-10T19:15:00' }),
    Object.freeze({ maLichSu: 'LS012', maDonHang: 'DH003', trangThaiCu: 'DANG_CHUAN_BI', trangThaiMoi: 'DA_XAC_NHAN', ghiChu: 'Xac nhan mon voi khach tai ban', nguoiThucHien: 'NV002', thoiGian: '2026-08-10T19:20:00' }),
  ]),
})

export const TONG_QUAN_DIEM_TICH_LUY_MAU_THEO_KHACH_HANG = Object.freeze({
  KH001: taoTongQuanDiem(150),
  KH002: taoTongQuanDiem(80),
  KH003: taoTongQuanDiem(0),
  KH_TEST_01: taoTongQuanDiem(14),
})

export const LICH_SU_DIEM_TICH_LUY_MAU_THEO_KHACH_HANG = Object.freeze({
  KH001: Object.freeze([]),
  KH002: Object.freeze([
    Object.freeze({
      maGiaoDichDiem: 'LSD002',
      maKH: 'KH002',
      maDonHang: 'DH002',
      loaiBienDong: 'CONG',
      soDiem: 15,
      soDiemTruoc: 65,
      soDiemSau: 80,
      moTa: 'Cộng điểm từ đơn gọi món tại bàn DH002',
      ngayTao: '2026-08-10T18:45:00',
    }),
  ]),
  KH003: Object.freeze([]),
  KH_TEST_01: Object.freeze([
    Object.freeze({
      maGiaoDichDiem: 'LSD003',
      maKH: 'KH_TEST_01',
      maDonHang: 'DH003',
      loaiBienDong: 'CONG',
      soDiem: 14,
      soDiemTruoc: 0,
      soDiemSau: 14,
      moTa: 'Tạm cộng điểm cho đơn gọi món tại bàn DH003',
      ngayTao: '2026-08-10T19:40:00',
    }),
  ]),
})

export const DANH_SACH_MA_GIAM_GIA_MAU = DANH_SACH_PHIEU_GIAM_GIA_GOI_Y

export const DU_LIEU_HE_THONG_MAU = Object.freeze({
  thongTinDangNhap: THONG_TIN_DANG_NHAP_MAU,
  danhSachTaiKhoan: DANH_SACH_TAI_KHOAN_MAU,
  danhSachQuanLy: DANH_SACH_QUAN_LY_MAU,
  danhSachNhanVien: DANH_SACH_NHAN_VIEN_MAU,
  danhSachKhachHang: DANH_SACH_KHACH_HANG_MAU,
  danhSachBan: DANH_SACH_BAN_MAU,
  danhSachDatBan: DANH_SACH_DAT_BAN_MAU,
  lichSuDatBanTheoKhachHang: LICH_SU_DAT_BAN_MAU_THEO_KHACH_HANG,
  danhSachDonHangHeThong: DANH_SACH_DON_HANG_HE_THONG_MAU,
  chiTietDonHangTheoMa: CHI_TIET_DON_HANG_MAU_THEO_MA,
  donHangHoSoTheoKhachHang: DON_HANG_HO_SO_MAU_THEO_KHACH_HANG,
  danhSachHoaDon: DANH_SACH_HOA_DON_MAU,
  danhSachThanhToan: DANH_SACH_THANH_TOAN_MAU,
  lichSuTrangThaiDonHang: LICH_SU_TRANG_THAI_DON_HANG_MAU,
  tongQuanDiemTichLuyTheoKhachHang: TONG_QUAN_DIEM_TICH_LUY_MAU_THEO_KHACH_HANG,
  lichSuDiemTichLuyTheoKhachHang: LICH_SU_DIEM_TICH_LUY_MAU_THEO_KHACH_HANG,
  danhSachMaGiamGia: DANH_SACH_MA_GIAM_GIA_MAU,
})
