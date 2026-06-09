import { STORAGE_KEYS } from '../../constants/khoaLuuTru'
import { datJsonLuuTru, layJsonLuuTru, datMucLuuTru, layMucLuuTru } from '../dichVuLuuTru'
import {
  DU_LIEU_HE_THONG_MAU,
  THONG_TIN_DANG_NHAP_MAU,
  DANH_SACH_BAN_MAU,
  DANH_SACH_DON_HANG_HE_THONG_MAU,
  DANH_SACH_MA_GIAM_GIA_MAU,
} from '../../features/hoSo/mocks/duLieuHeThongMau'
import { DANH_SACH_MON } from '../../features/thucDon/mocks/duLieuThucDon'

const PHIEN_BAN_DU_LIEU_OFFLINE = '4'

const TAI_KHOAN_NOI_BO_MAU = [
  THONG_TIN_DANG_NHAP_MAU.admin,
  ...THONG_TIN_DANG_NHAP_MAU.nhanVien,
]

const TAI_KHOAN_KHACH_HANG_MAU = THONG_TIN_DANG_NHAP_MAU.khachHang
const MA_DON_REGEX = /\d+/g
const MA_BAN_REGEX = /\d+/g

const deepClone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value))
}

const boMatKhauKhoiTaiKhoan = (taiKhoan) => {
  const taiKhoanKhongMatKhau = { ...taiKhoan }
  delete taiKhoanKhongMatKhau.matKhau
  return taiKhoanKhongMatKhau
}

const taoIdMonTuMock = (dish, index) => {
  const currentId = Number(dish.id || 0)
  if (currentId > 0) {
    return `M${String(currentId).padStart(3, '0')}`
  }

  return `M${String(index + 1).padStart(3, '0')}`
}

const phanTichGiaMonMock = (giaTri) => {
  const so = Number(String(giaTri ?? '').replace(/[^\d]/g, ''))
  return Number.isFinite(so) ? so : 0
}

const taoDanhSachMonKhoiTao = () => DANH_SACH_MON.map((dish, index) => {
  const giaMon = Number(dish.priceValue || phanTichGiaMonMock(dish.price))

  return {
    MaMon: taoIdMonTuMock(dish, index),
    maMon: taoIdMonTuMock(dish, index),
    MaDanhMuc: `DM${String(index + 1).padStart(3, '0')}`,
    maDanhMuc: `DM${String(index + 1).padStart(3, '0')}`,
    TenMon: dish.name,
    tenMon: dish.name,
    MoTa: dish.description,
    moTa: dish.description,
    Gia: giaMon,
    gia: giaMon,
    HinhAnh: dish.image || '',
    hinhAnh: dish.image || '',
    TrangThai: 'Available',
    trangThai: 'Available',
    ThoiGianChuanBi: 15,
    thoiGianChuanBi: 15,
    badge: dish.badge || 'Đề xuất',
    tone: dish.tone || 'tone-amber',
    category: dish.category,
    id: taoIdMonTuMock(dish, index),
    name: dish.name,
    description: dish.description,
    price: giaMon,
    image: dish.image || '',
  }
})

const taoGiaoDichThanhToanMap = () => Object.fromEntries(
  (DU_LIEU_HE_THONG_MAU.danhSachThanhToan || []).map((payment) => [payment.maHoaDon, payment]),
)

const taoMapMatKhauMau = () => {
  const passwordMap = new Map()

  TAI_KHOAN_NOI_BO_MAU.forEach((account) => {
    passwordMap.set(String(account.email || '').trim().toLowerCase(), String(account.matKhau || ''))
  })

  TAI_KHOAN_KHACH_HANG_MAU.forEach((account) => {
    if (account?.matKhau) {
      passwordMap.set(String(account.email || '').trim().toLowerCase(), String(account.matKhau || ''))
    }
  })

  return passwordMap
}

const taoDanhSachTaiKhoanKhoiTao = () => {
  const passwordMap = taoMapMatKhauMau()

  return (DU_LIEU_HE_THONG_MAU.danhSachTaiKhoan || []).map((account) => {
    const email = String(account.email || '').trim().toLowerCase()

    return {
      ...deepClone(account),
      matKhau: passwordMap.get(email) || '',
    }
  })
}

const taoDanhSachDonHangKhoiTao = () => {
  const thanhToanTheoHoaDon = taoGiaoDichThanhToanMap()

  return DANH_SACH_DON_HANG_HE_THONG_MAU.map((order) => {
    const hoaDon = (DU_LIEU_HE_THONG_MAU.danhSachHoaDon || []).find((invoice) => invoice.maDonHang === order.maDonHang) || null
    const thanhToan = hoaDon ? thanhToanTheoHoaDon[hoaDon.maHoaDon] || null : null

    return {
      ...deepClone(order),
      ChiTiet: deepClone(order.items || []),
      DonHang: {
        MaDonHang: order.maDonHang,
        MaKH: order.maKH,
        MaBan: order.maBan || null,
        MaNV: order.maNV || null,
        MaDatBan: order.maDatBan || null,
        LoaiDon: order.loaiDon,
        TongTien: Number(order.tongTien || 0),
        TrangThai: order.trangThai,
        GhiChu: order.ghiChu || '',
        NgayTao: order.ngayTao || order.orderDate || '',
      },
      hoaDon: hoaDon ? deepClone(hoaDon) : null,
      thanhToan: thanhToan ? deepClone(thanhToan) : null,
    }
  })
}

const taoDanhSachDatBanKhoiTao = () => (DU_LIEU_HE_THONG_MAU.danhSachDatBan || []).map((booking) => deepClone(booking))

const taoDanhSachDanhGiaKhoiTao = () => {
  const customerByCode = new Map((DU_LIEU_HE_THONG_MAU.danhSachKhachHang || []).map((customer) => [customer.maKH, customer]))

  return [
    {
      maDanhGia: 'DG001',
      maKH: 'KH001',
      maDonHang: 'DH001',
      tenKhachHang: customerByCode.get('KH001')?.fullName || 'Tran Van Khach',
      email: customerByCode.get('KH001')?.email || 'khach1@gmail.com',
      soSao: 5,
      noiDung: 'Món ăn ngon, phục vụ nhanh và không gian rất dễ chịu.',
      phanHoi: 'Cảm ơn bạn đã ghé nhà hàng Nguyên Vị.',
      hinhAnh: [],
      soLuotHuuIch: 12,
      trangThai: 'Approved',
      ngayDanhGia: '2026-08-10T20:30:00',
    },
  ]
}

const taoDanhSachMaGiamGiaKhoiTao = () => DANH_SACH_MA_GIAM_GIA_MAU.map((voucher) => ({
  maGiamGia: voucher.code,
  maCode: voucher.code,
  code: voucher.code,
  tenGiamGia: voucher.moTa,
  tenCode: voucher.moTa,
  thongDiep: voucher.moTa,
  description: voucher.moTa,
  loaiGiam: voucher.giaTri.includes('%') ? 'percentage' : 'fixed_amount',
  discountType: voucher.giaTri.includes('%') ? 'percentage' : 'fixed_amount',
  giaTriGiam: voucher.giaTri.includes('%') ? Number(voucher.giaTri.replace('%', '')) : Number(String(voucher.giaTri).replace(/[^\d]/g, '')),
  discountValue: voucher.giaTri.includes('%') ? Number(voucher.giaTri.replace('%', '')) : Number(String(voucher.giaTri).replace(/[^\d]/g, '')),
  dieuKienToiThieu: voucher.code === 'WELCOME10' ? 100000 : voucher.code === 'SUMMER20' ? 200000 : 300000,
  minOrderAmount: voucher.code === 'WELCOME10' ? 100000 : voucher.code === 'SUMMER20' ? 200000 : 300000,
  giamToiDa: voucher.code === 'WELCOME10' ? 50000 : voucher.code === 'SUMMER20' ? 100000 : null,
  maxDiscountAmount: voucher.code === 'WELCOME10' ? 50000 : voucher.code === 'SUMMER20' ? 100000 : null,
  discountAmount: 0,
  hopLe: true,
  isValid: true,
}))

const taoBangKhoiTao = () => ({
  heThong: deepClone(DU_LIEU_HE_THONG_MAU),
  taiKhoan: taoDanhSachTaiKhoanKhoiTao(),
  ban: deepClone(DANH_SACH_BAN_MAU),
  datBan: taoDanhSachDatBanKhoiTao(),
  donHang: taoDanhSachDonHangKhoiTao(),
  danhGia: taoDanhSachDanhGiaKhoiTao(),
  thucDon: taoDanhSachMonKhoiTao(),
  maGiamGia: taoDanhSachMaGiamGiaKhoiTao(),
})

const sapXepSoTangDan = (values, fallbackValue = 0) => values
  .map((value) => Number(value || fallbackValue))
  .filter((value) => Number.isFinite(value))
  .sort((left, right) => right - left)

const taoTokenOffline = (user) => `offline-token-${user?.maND || user?.maKH || user?.id || 'guest'}`

export const taoPhanHoiOffline = (duLieu, thongDiep = 'Thanh cong', meta = null) => ({
  success: true,
  data: duLieu,
  message: thongDiep,
  meta: meta || { offline: true },
})

export const layDuLieuOffline = () => {
  const phienBanDangLuu = String(layMucLuuTru(STORAGE_KEYS.PHIEN_BAN_DU_LIEU_OFFLINE) || '').trim()
  const duLieuDaLuu = layJsonLuuTru(STORAGE_KEYS.DU_LIEU_OFFLINE_HE_THONG, null)

  if (phienBanDangLuu === PHIEN_BAN_DU_LIEU_OFFLINE && duLieuDaLuu && typeof duLieuDaLuu === 'object') {
    return duLieuDaLuu
  }

  const duLieuKhoiTao = taoBangKhoiTao()
  datJsonLuuTru(STORAGE_KEYS.DU_LIEU_OFFLINE_HE_THONG, duLieuKhoiTao)
  datMucLuuTru(STORAGE_KEYS.PHIEN_BAN_DU_LIEU_OFFLINE, PHIEN_BAN_DU_LIEU_OFFLINE)
  return duLieuKhoiTao
}

export const luuDuLieuOffline = (duLieu) => {
  datJsonLuuTru(STORAGE_KEYS.DU_LIEU_OFFLINE_HE_THONG, duLieu)
  return duLieu
}

export const docDuLieuOffline = (selector) => selector(layDuLieuOffline())

export const capNhatDuLieuOffline = (updater) => {
  const hienTai = layDuLieuOffline()
  const banSao = deepClone(hienTai)
  const ketQua = updater(banSao) || banSao
  luuDuLieuOffline(ketQua)
  return ketQua
}

export const timTaiKhoanTheoEmail = (email) => {
  const emailDaChuanHoa = String(email || '').trim().toLowerCase()
  if (!emailDaChuanHoa) return null
  return docDuLieuOffline((state) => state.taiKhoan.find((account) => String(account.email || '').trim().toLowerCase() === emailDaChuanHoa) || null)
}

export const timTaiKhoanTheoMaNDOffline = (maND) => docDuLieuOffline(
  (state) => state.taiKhoan.find((account) => String(account.maND || '') === String(maND || '')) || null,
)

export const timTaiKhoanTheoMaKHOffline = (maKH) => docDuLieuOffline(
  (state) => state.taiKhoan.find((account) => String(account.maKH || '') === String(maKH || '')) || null,
)

export const xacThucDangNhapOffline = ({ email, matKhau, noiBo = false }) => {
  const account = timTaiKhoanTheoEmail(email)
  if (!account || String(account.matKhau || '') !== String(matKhau || '')) {
    return null
  }

  if (noiBo && account.role !== 'admin' && account.role !== 'staff') {
    return false
  }

  return {
    user: deepClone(account),
    accessToken: taoTokenOffline(account),
  }
}

export const dangKyTaiKhoanKhachHangOffline = ({ hoTen, email, soDienThoai, matKhau, diaChi = '' }) => {
  const emailDaChuanHoa = String(email || '').trim().toLowerCase()
  if (timTaiKhoanTheoEmail(emailDaChuanHoa)) {
    throw new Error('Email đã tồn tại.')
  }

  const state = capNhatDuLieuOffline((draft) => {
    const maNDDangCo = sapXepSoTangDan(draft.taiKhoan.map((account) => String(account.maND || '').match(MA_DON_REGEX)?.[0]))
    const maKHDangCo = sapXepSoTangDan(draft.taiKhoan.map((account) => String(account.maKH || '').match(MA_DON_REGEX)?.[0]))
    const maNDMoi = `ND${String((maNDDangCo[0] || 5) + 1).padStart(3, '0')}`
    const maKHMoi = `KH${String((maKHDangCo[0] || 3) + 1).padStart(3, '0')}`

    const taiKhoanMoi = {
      id: maNDMoi,
      maND: maNDMoi,
      maKH: maKHMoi,
      maNV: '',
      fullName: String(hoTen || '').trim(),
      username: maNDMoi,
      email: emailDaChuanHoa,
      phone: String(soDienThoai || '').trim(),
      role: 'customer',
      vaiTro: 'KhachHang',
      trangThai: 'Active',
      chucVu: '',
      address: String(diaChi || '').trim(),
      diemTichLuy: 0,
      matKhau: String(matKhau || ''),
    }

    draft.taiKhoan.push(taiKhoanMoi)
    draft.heThong.danhSachTaiKhoan = draft.taiKhoan.map(boMatKhauKhoiTaiKhoan)
    draft.heThong.danhSachKhachHang = draft.taiKhoan.filter((account) => account.role === 'customer')

    draft.heThong.tongQuanDiemTichLuyTheoKhachHang = {
      ...(draft.heThong.tongQuanDiemTichLuyTheoKhachHang || {}),
      [maKHMoi]: { tongDiem: 0, diemCoTheDoi: 0, tiLeQuyDoi: 100, giaTriQuyDoi: 10000, maKH: maKHMoi },
    }

    draft.heThong.lichSuDiemTichLuyTheoKhachHang = {
      ...(draft.heThong.lichSuDiemTichLuyTheoKhachHang || {}),
      [maKHMoi]: [],
    }

    draft.heThong.lichSuDatBanTheoKhachHang = {
      ...(draft.heThong.lichSuDatBanTheoKhachHang || {}),
      [maKHMoi]: [],
    }

    draft.heThong.donHangHoSoTheoKhachHang = {
      ...(draft.heThong.donHangHoSoTheoKhachHang || {}),
      [maKHMoi]: [],
    }
  })

  const taiKhoanMoi = state.taiKhoan[state.taiKhoan.length - 1]
  return {
    user: deepClone(taiKhoanMoi),
    accessToken: taoTokenOffline(taiKhoanMoi),
  }
}

export const capNhatTaiKhoanOffline = (maND, updater) => {
  const state = capNhatDuLieuOffline((draft) => {
    const index = draft.taiKhoan.findIndex((account) => String(account.maND || '') === String(maND || ''))
    if (index < 0) {
      throw new Error('Không tìm thấy người dùng.')
    }

    const currentAccount = draft.taiKhoan[index]
    draft.taiKhoan[index] = {
      ...currentAccount,
      ...updater(currentAccount),
    }

    draft.heThong.danhSachTaiKhoan = draft.taiKhoan.map(boMatKhauKhoiTaiKhoan)
    draft.heThong.danhSachKhachHang = draft.taiKhoan.filter((account) => account.role === 'customer')
    draft.heThong.danhSachQuanLy = draft.taiKhoan.filter((account) => account.role === 'admin')
    draft.heThong.danhSachNhanVien = draft.taiKhoan.filter((account) => account.role === 'staff')
  })

  return state.taiKhoan.find((account) => String(account.maND || '') === String(maND || '')) || null
}

export const layDanhSachTaiKhoanOffline = () => docDuLieuOffline((state) => state.taiKhoan.map((taiKhoan) => deepClone(boMatKhauKhoiTaiKhoan(taiKhoan))))

export const taoNguoiDungNoiBoOffline = ({ hoTen, email, soDienThoai = '', vaiTro = 'NhanVien', trangThai = 'Active', chucVu = '', matKhau = '' }) => {
  const emailDaChuanHoa = String(email || '').trim().toLowerCase()
  if (timTaiKhoanTheoEmail(emailDaChuanHoa)) {
    throw new Error('Email đã tồn tại.')
  }

  const state = capNhatDuLieuOffline((draft) => {
    const maNDDangCo = sapXepSoTangDan(draft.taiKhoan.map((account) => String(account.maND || '').match(MA_DON_REGEX)?.[0]))
    const maNVDangCo = sapXepSoTangDan(draft.taiKhoan.map((account) => String(account.maNV || '').match(MA_DON_REGEX)?.[0]))
    const maNDMoi = `ND${String((maNDDangCo[0] || 5) + 1).padStart(3, '0')}`
    const maNVMoi = `NV${String((maNVDangCo[0] || 3) + 1).padStart(3, '0')}`
    const role = vaiTro === 'Admin' ? 'admin' : 'staff'

    draft.taiKhoan.push({
      id: maNDMoi,
      maND: maNDMoi,
      maKH: '',
      maNV: maNVMoi,
      fullName: String(hoTen || '').trim(),
      username: maNDMoi,
      email: emailDaChuanHoa,
      phone: String(soDienThoai || '').trim(),
      role,
      vaiTro,
      trangThai: String(trangThai || 'Active').trim() || 'Active',
      chucVu: String(chucVu || (vaiTro === 'Admin' ? 'Quản lý' : 'Nhân viên')).trim(),
      address: '',
      diemTichLuy: 0,
      matKhau: String(matKhau || ''),
    })

    draft.heThong.danhSachTaiKhoan = draft.taiKhoan.map(boMatKhauKhoiTaiKhoan)
    draft.heThong.danhSachQuanLy = draft.taiKhoan.filter((account) => account.role === 'admin')
    draft.heThong.danhSachNhanVien = draft.taiKhoan.filter((account) => account.role === 'staff')
  })

  return state.taiKhoan[state.taiKhoan.length - 1]
}

export const xoaNguoiDungNoiBoOffline = (maND) => {
  capNhatDuLieuOffline((draft) => {
    const taiKhoan = draft.taiKhoan.find((account) => String(account.maND || '') === String(maND || ''))
    if (!taiKhoan) {
      throw new Error('Không tìm thấy người dùng.')
    }

    if (taiKhoan.role === 'customer') {
      throw new Error('Chỉ có thể xóa tài khoản nội bộ.')
    }

    draft.taiKhoan = draft.taiKhoan.filter((account) => String(account.maND || '') !== String(maND || ''))
    draft.heThong.danhSachTaiKhoan = draft.taiKhoan.map(boMatKhauKhoiTaiKhoan)
    draft.heThong.danhSachQuanLy = draft.taiKhoan.filter((account) => account.role === 'admin')
    draft.heThong.danhSachNhanVien = draft.taiKhoan.filter((account) => account.role === 'staff')
  })
}

export const layDanhSachBanOffline = () => docDuLieuOffline((state) => deepClone(state.ban))
export const layDanhSachMonOffline = () => docDuLieuOffline((state) => deepClone(state.thucDon))
export const layDanhSachDonHangOffline = () => docDuLieuOffline((state) => deepClone(state.donHang))
export const layDanhSachDatBanOffline = () => docDuLieuOffline((state) => deepClone(state.datBan))
export const layDanhSachDanhGiaOffline = () => docDuLieuOffline((state) => deepClone(state.danhGia))
export const layDanhSachMaGiamGiaOffline = () => docDuLieuOffline((state) => deepClone(state.maGiamGia))

export const timMaGiamGiaOfflineTheoCode = (code) => docDuLieuOffline(
  (state) => state.maGiamGia.find((voucher) => String(voucher.code || voucher.maCode || '').trim().toUpperCase() === String(code || '').trim().toUpperCase()) || null,
)

export const timDonHangOfflineTheoMa = (maDonHang) => docDuLieuOffline((state) => state.donHang.find((order) => String(order.maDonHang || order.orderCode) === String(maDonHang || '')) || null)
export const timDatBanOfflineTheoMa = (maDatBan) => docDuLieuOffline((state) => state.datBan.find((booking) => String(booking.bookingCode || booking.id) === String(maDatBan || '')) || null)
const normalizeMaBan = (input) => {
  if (!input) return null
  const trimmed = String(input).trim()
  const match = trimmed.match(/^([A-Za-z]+)(\d+)$/)
  if (!match) return trimmed
  const prefix = match[1].toUpperCase()
  const num = match[2].padStart(3, '0')
  return `${prefix}${num}`
}

export const timBanOfflineTheoMa = (maBan) => {
  const giaTri = String(maBan || '').trim()
  const normalized = normalizeMaBan(giaTri)
  return docDuLieuOffline((state) => state.ban.find((table) => {
    const code = String(table.code || table.id || '')
    return code === giaTri || (normalized && code === normalized)
  }) || null)
}
export const timDanhGiaOfflineTheoMa = (maDanhGia) => docDuLieuOffline((state) => state.danhGia.find((review) => String(review.maDanhGia || '') === String(maDanhGia || '')) || null)

export const layLichSuDatBanTheoKhachHangOffline = (maKH) => docDuLieuOffline((state) => deepClone(state.heThong.lichSuDatBanTheoKhachHang?.[String(maKH || '')] || []))

export const layTongQuanDiemTheoKhachHangOffline = (maKH) => docDuLieuOffline((state) => deepClone(state.heThong.tongQuanDiemTichLuyTheoKhachHang?.[String(maKH || '')] || { maKH, tongDiem: 0, diemCoTheDoi: 0, tiLeQuyDoi: 100, giaTriQuyDoi: 10000 }))
export const layLichSuDiemTheoKhachHangOffline = (maKH) => docDuLieuOffline((state) => deepClone(state.heThong.lichSuDiemTichLuyTheoKhachHang?.[String(maKH || '')] || []))
export const taoMaDatBanMoiOffline = () => {
  const danhSach = layDanhSachDatBanOffline()
  const soLonNhat = sapXepSoTangDan(danhSach.map((booking) => String(booking.bookingCode || booking.id || '').match(MA_DON_REGEX)?.[0]))[0] || 1
  return `DB${String(soLonNhat + 1).padStart(3, '0')}`
}

export const taoMaDonHangMoiOffline = () => {
  const danhSach = layDanhSachDonHangOffline()
  const soLonNhat = sapXepSoTangDan(danhSach.map((order) => String(order.maDonHang || '').match(MA_DON_REGEX)?.[0]))[0] || 3
  return `DH${String(soLonNhat + 1).padStart(3, '0')}`
}

export const taoMaDanhGiaMoiOffline = () => {
  const danhSach = layDanhSachDanhGiaOffline()
  const soLonNhat = sapXepSoTangDan(danhSach.map((review) => String(review.maDanhGia || '').match(MA_DON_REGEX)?.[0]))[0] || 1
  return `DG${String(soLonNhat + 1).padStart(3, '0')}`
}

export const taoMaHoaDonMoiOffline = () => {
  const danhSach = docDuLieuOffline((state) => state.heThong.danhSachHoaDon || [])
  const soLonNhat = sapXepSoTangDan(danhSach.map((invoice) => String(invoice.maHoaDon || '').match(MA_DON_REGEX)?.[0]))[0] || 3
  return `HD${String(soLonNhat + 1).padStart(3, '0')}`
}

export const taoMaThanhToanMoiOffline = () => {
  const danhSach = docDuLieuOffline((state) => state.heThong.danhSachThanhToan || [])
  const soLonNhat = sapXepSoTangDan(danhSach.map((payment) => String(payment.maThanhToan || '').match(MA_DON_REGEX)?.[0]))[0] || 3
  return `TT${String(soLonNhat + 1).padStart(3, '0')}`
}

export const capNhatHeThongOffline = (updater) => capNhatDuLieuOffline((draft) => {
  updater(draft)
  draft.heThong.danhSachBan = deepClone(draft.ban)
  draft.heThong.danhSachDonHangHeThong = draft.donHang.map((order) => ({ ...order, items: deepClone(order.items || []), danhSachMon: deepClone(order.danhSachMon || []) }))
  draft.heThong.danhSachDatBan = deepClone(draft.datBan)
  draft.heThong.danhSachDanhGia = deepClone(draft.danhGia)
  draft.heThong.danhSachMaGiamGia = deepClone(draft.maGiamGia)
  draft.heThong.danhSachHoaDon = deepClone(draft.heThong.danhSachHoaDon || [])
  draft.heThong.danhSachThanhToan = deepClone(draft.heThong.danhSachThanhToan || [])
  draft.heThong.danhSachThucDon = deepClone(draft.thucDon)
})

export const layThucDonTheoBanOffline = (maBan) => ({
  ban: timBanOfflineTheoMa(maBan),
  data: layDanhSachMonOffline(),
})

export const taoThongTinQrBanOffline = (maBan) => {
  const table = timBanOfflineTheoMa(maBan)
  if (!table) {
    throw new Error('Không tìm thấy bàn.')
  }

  const maBanThuc = table.code || table.id || ''

  return {
    maBan: maBanThuc,
    tenBan: table.name,
    khuVuc: table.rawAreaText || '',
    url: `${window.location.origin}/ban/${encodeURIComponent(maBanThuc)}/goi-mon`,
    qrBase64: '',
  }
}

export const taoHoacCapNhatDonHangOffline = (orderInput, options = {}) => {
  let ketQua = null

  capNhatHeThongOffline((draft) => {
    const maDonHang = String(options.maDonHang || orderInput.maDonHang || orderInput.orderCode || taoMaDonHangMoiOffline()).trim()
    const index = draft.donHang.findIndex((order) => String(order.maDonHang || order.orderCode || '') === maDonHang)
    const mucHienTai = index >= 0 ? draft.donHang[index] : {}
    const chiTiet = Array.isArray(orderInput.chiTiet || orderInput.ChiTiet || orderInput.items)
      ? deepClone(orderInput.chiTiet || orderInput.ChiTiet || orderInput.items)
      : deepClone(mucHienTai.items || [])

    const chiTietDaChuanHoa = deepClone(chiTiet).map((item) => {
      const maMon = item.maMon || item.MaMon || item.menuItemId || ''
      const monTuThucDon = draft.thucDon.find((dish) => String(dish.maMon || dish.MaMon || '') === String(maMon))
      const soLuong = Number(item.soLuong || item.SoLuong || item.quantity || 0)
      const donGia = Number(item.donGia || item.DonGia || item.price || monTuThucDon?.gia || monTuThucDon?.Gia || 0)
      const tenMon = item.tenMon || item.TenMon || item.name || monTuThucDon?.tenMon || monTuThucDon?.TenMon || monTuThucDon?.name || ''

      return {
        ...item,
        maMon,
        menuItemId: item.menuItemId || maMon,
        tenMon,
        name: tenMon,
        soLuong,
        quantity: soLuong,
        donGia,
        price: donGia,
        thanhTien: Number(item.thanhTien || item.ThanhTien || (soLuong * donGia)),
      }
    })

    const tongTien = Number(orderInput.tongTien || orderInput.TongTien || orderInput.total || chiTietDaChuanHoa.reduce((sum, item) => sum + Number(item.thanhTien || 0), 0) || mucHienTai.tongTien || 0)
    const voucher = orderInput.voucher || mucHienTai.voucher || {}
    const tongHopGia = orderInput.tongHopGia || mucHienTai.tongHopGia || {
      tamTinh: tongTien,
      giamGia: 0,
      phiDichVu: 0,
      tongTien,
    }

    const baseOrder = {
      ...mucHienTai,
      ...deepClone(orderInput),
      maDonHang,
      orderCode: maDonHang,
      id: maDonHang,
      maKH: orderInput.maKH || orderInput.MaKH || mucHienTai.maKH || '',
      maBan: orderInput.maBan || orderInput.MaBan || orderInput.tableCode || mucHienTai.maBan || '',
      maNV: orderInput.maNV || orderInput.MaNV || mucHienTai.maNV || '',
      maDatBan: orderInput.maDatBan || orderInput.MaDatBan || mucHienTai.maDatBan || '',
      loaiDon: orderInput.loaiDon || orderInput.LoaiDon || mucHienTai.loaiDon || 'TAI_BAN',
      trangThai: orderInput.trangThai || orderInput.TrangThai || orderInput.status || mucHienTai.trangThai || 'DANG_CHUAN_BI',
      tongTien,
      total: tongTien,
      ngayTao: orderInput.ngayTao || orderInput.NgayTao || orderInput.orderDate || mucHienTai.ngayTao || new Date().toISOString(),
      ghiChu: orderInput.ghiChu || orderInput.GhiChu || orderInput.note || mucHienTai.ghiChu || '',
      customer: {
        code: orderInput.maKH || orderInput.MaKH || mucHienTai.maKH || '',
        fullName: orderInput.tenKhachHang || orderInput.TenKhachHang || orderInput.customer?.fullName || mucHienTai.customer?.fullName || '',
        phone: orderInput.soDienThoai || orderInput.SoDienThoai || orderInput.customer?.phone || mucHienTai.customer?.phone || '',
        email: orderInput.email || orderInput.Email || orderInput.customer?.email || mucHienTai.customer?.email || '',
      },
      tongHopGia: deepClone(tongHopGia),
      voucher: deepClone(voucher),
      items: chiTietDaChuanHoa.map((item, index) => ({
        id: item.id || item.maChiTiet || item.MaChiTiet || `CT_${index + 1}`,
        maChiTiet: item.maChiTiet || item.MaChiTiet || item.id || `CT_${index + 1}`,
        maMon: item.maMon || item.MaMon || item.menuItemId || '',
        tenMon: item.tenMon || item.TenMon || item.name || '',
        soLuong: Number(item.soLuong || item.SoLuong || item.quantity || 0),
        donGia: Number(item.donGia || item.DonGia || item.price || 0),
        thanhTien: Number(item.thanhTien || item.ThanhTien || 0),
        quantity: Number(item.soLuong || item.SoLuong || item.quantity || 0),
        price: Number(item.donGia || item.DonGia || item.price || 0),
        name: item.tenMon || item.TenMon || item.name || '',
        note: item.ghiChu || item.GhiChu || item.note || '',
        status: item.trangThai || item.TrangThai || item.status || '',
      })),
    }

    baseOrder.danhSachMon = baseOrder.items.map((item) => ({
      tenMon: item.tenMon || item.name,
      soLuong: item.soLuong || item.quantity,
      donGia: item.donGia || item.price,
      thanhTien: item.thanhTien,
    }))

    baseOrder.ChiTiet = baseOrder.items.map((item) => ({
      MaChiTiet: item.maChiTiet,
      MaMon: item.maMon,
      TenMon: item.tenMon || item.name,
      SoLuong: item.soLuong || item.quantity,
      DonGia: item.donGia || item.price,
      ThanhTien: item.thanhTien,
      GhiChu: item.note || '',
      TrangThai: item.status || '',
    }))

    baseOrder.DonHang = {
      MaDonHang: maDonHang,
      MaKH: baseOrder.maKH,
      MaBan: baseOrder.maBan || null,
      MaNV: baseOrder.maNV || null,
      MaDatBan: baseOrder.maDatBan || null,
      LoaiDon: baseOrder.loaiDon,
      TongTien: Number(baseOrder.tongTien || 0),
      TrangThai: baseOrder.trangThai,
      GhiChu: baseOrder.ghiChu || '',
      NgayTao: baseOrder.ngayTao,
    }

    if (index >= 0) {
      draft.donHang[index] = baseOrder
    } else {
      draft.donHang.push(baseOrder)
    }

    if (baseOrder.maKH) {
      const lichSuKhach = draft.heThong.donHangHoSoTheoKhachHang?.[baseOrder.maKH] || []
      const mucHoSo = {
        maDonHang: baseOrder.maDonHang,
        loaiDon: baseOrder.loaiDon,
        trangThai: baseOrder.trangThai,
        tongTien: Number(baseOrder.tongTien || 0),
        ngayTao: baseOrder.ngayTao,
        danhSachMon: deepClone(baseOrder.danhSachMon || []),
      }

      draft.heThong.donHangHoSoTheoKhachHang = {
        ...(draft.heThong.donHangHoSoTheoKhachHang || {}),
        [baseOrder.maKH]: [
          mucHoSo,
          ...lichSuKhach.filter((item) => String(item.maDonHang || '') !== baseOrder.maDonHang),
        ],
      }
    }

    ketQua = baseOrder
  })

  return ketQua ? deepClone(ketQua) : null
}

export const capNhatTrangThaiDonHangOffline = (maDonHang, trangThai) => taoHoacCapNhatDonHangOffline({ trangThai, status: trangThai }, { maDonHang })

export const layDonHangCoTheDanhGiaOffline = (maKH) => docDuLieuOffline((state) => state.donHang
  .filter((order) => String(order.maKH || '') === String(maKH || '') && String(order.trangThai || '') === 'DA_THANH_TOAN')
  .map((order) => ({
    maDonHang: order.maDonHang,
    chiTiet: deepClone(order.items || []).map((item) => ({
      name: item.tenMon || item.name,
      tenMon: item.tenMon || item.name,
    })),
    status: order.trangThai,
  })))

export const taoHoacCapNhatDanhGiaOffline = (reviewInput, options = {}) => {
  let ketQua = null

  capNhatHeThongOffline((draft) => {
    const maDanhGia = String(options.maDanhGia || reviewInput.maDanhGia || taoMaDanhGiaMoiOffline()).trim()
    const index = draft.danhGia.findIndex((review) => String(review.maDanhGia || '') === maDanhGia)
    const mucHienTai = index >= 0 ? draft.danhGia[index] : {}

    const review = {
      ...mucHienTai,
      ...deepClone(reviewInput),
      maDanhGia,
      maKH: reviewInput.maKH || mucHienTai.maKH || '',
      maDonHang: reviewInput.maDonHang || mucHienTai.maDonHang || '',
      tenKhachHang: reviewInput.tenKhachHang || mucHienTai.tenKhachHang || timTaiKhoanTheoMaKHOffline(reviewInput.maKH || mucHienTai.maKH || '')?.fullName || '',
      email: reviewInput.email || mucHienTai.email || timTaiKhoanTheoMaKHOffline(reviewInput.maKH || mucHienTai.maKH || '')?.email || '',
      soSao: Number(reviewInput.soSao || mucHienTai.soSao || 0),
      noiDung: reviewInput.noiDung || mucHienTai.noiDung || '',
      phanHoi: reviewInput.phanHoi ?? mucHienTai.phanHoi ?? '',
      hinhAnh: Array.isArray(reviewInput.hinhAnh) ? deepClone(reviewInput.hinhAnh) : (Array.isArray(mucHienTai.hinhAnh) ? deepClone(mucHienTai.hinhAnh) : []),
      soLuotHuuIch: Number(reviewInput.soLuotHuuIch ?? mucHienTai.soLuotHuuIch ?? 0),
      trangThai: reviewInput.trangThai || mucHienTai.trangThai || 'Pending',
      ngayDanhGia: reviewInput.ngayDanhGia || mucHienTai.ngayDanhGia || new Date().toISOString(),
    }

    if (index >= 0) {
      draft.danhGia[index] = review
    } else {
      draft.danhGia.push(review)
    }

    ketQua = review
  })

  return ketQua ? deepClone(ketQua) : null
}

export const tinhTongTienTheoChiTietOffline = (items = []) => items.reduce((sum, item) => sum + Number(item.ThanhTien || item.thanhTien || item.donGia || item.price || 0), 0)

export const taoChiTietDonHangTaiBanOffline = (order) => ({
  DonHang: {
    MaDonHang: order.maDonHang,
    TongTien: Number(order.tongTien || 0),
  },
  ChiTiet: deepClone(order.items || []).map((item) => ({
    MaChiTiet: item.maChiTiet || item.id,
    MaMon: item.maMon || item.menuItemId,
    TenMon: item.tenMon || item.name,
    SoLuong: Number(item.soLuong || item.quantity || 0),
    ThanhTien: Number(item.thanhTien || item.price || 0),
  })),
})

export const capNhatTrangThaiBanOffline = (maBan, status) => capNhatHeThongOffline((draft) => {
  const table = draft.ban.find((item) => String(item.code || item.id) === String(maBan || ''))
  if (!table) {
    throw new Error('Không tìm thấy bàn.')
  }

  table.status = status
})

export const taoHoacCapNhatDatBanOffline = ({ booking, maDatBan }) => {
  let ketQua = null

  capNhatHeThongOffline((draft) => {
    const bookingCode = String(maDatBan || booking.maDatBan || booking.bookingCode || taoMaDatBanMoiOffline()).trim()
    const index = draft.datBan.findIndex((item) => String(item.bookingCode || item.id || '') === bookingCode)
    const mucHienTai = index >= 0 ? draft.datBan[index] : {}
    const danhSachMaBanDaGan = Array.isArray(booking.danhSachMaBanDaGan)
      ? booking.danhSachMaBanDaGan.map((item) => String(item || '').trim()).filter(Boolean)
      : (booking.maBan || booking.tableCode
        ? [String(booking.maBan || booking.tableCode).trim()]
        : Array.isArray(mucHienTai.danhSachMaBanDaGan)
          ? mucHienTai.danhSachMaBanDaGan.map((item) => String(item || '').trim()).filter(Boolean)
          : [])

    const danhSachBanDaGan = danhSachMaBanDaGan
      .map((maBan) => draft.ban.find((table) => String(table.code || table.id) === maBan))
      .filter(Boolean)
      .map((table) => ({ id: table.id, code: table.code, name: table.name }))

    const baseData = {
      id: bookingCode,
      bookingCode,
      maDatBan: bookingCode,
      MaDatBan: bookingCode,
      maKH: booking.maKH || booking.customerCode || mucHienTai.maKH || 'KH001',
      MaKH: booking.maKH || booking.customerCode || mucHienTai.MaKH || mucHienTai.maKH || 'KH001',
      maNV: booking.maNV || booking.staffCode || mucHienTai.maNV || 'NV002',
      MaNV: booking.maNV || booking.staffCode || mucHienTai.MaNV || mucHienTai.maNV || 'NV002',
      guests: String(booking.soNguoi || booking.guests || mucHienTai.soNguoi || mucHienTai.guests || ''),
      soNguoi: Number(booking.soNguoi || booking.guests || mucHienTai.soNguoi || mucHienTai.guests || 0),
      SoNguoi: Number(booking.soNguoi || booking.guests || mucHienTai.SoNguoi || mucHienTai.soNguoi || 0),
      date: booking.ngayDat || booking.date || mucHienTai.ngayDat || mucHienTai.date || '',
      ngayDat: booking.ngayDat || booking.date || mucHienTai.ngayDat || mucHienTai.date || '',
      NgayDat: booking.ngayDat || booking.date || mucHienTai.NgayDat || mucHienTai.ngayDat || '',
      time: booking.gioDat || booking.time || mucHienTai.gioDat || mucHienTai.time || '',
      gioDat: booking.gioDat || booking.time || mucHienTai.gioDat || mucHienTai.time || '',
      GioDat: booking.gioDat || booking.time || mucHienTai.GioDat || mucHienTai.gioDat || '',
      endTime: booking.gioKetThuc || booking.endTime || mucHienTai.gioKetThuc || mucHienTai.endTime || '',
      gioKetThuc: booking.gioKetThuc || booking.endTime || mucHienTai.gioKetThuc || mucHienTai.endTime || '',
      GioKetThuc: booking.gioKetThuc || booking.endTime || mucHienTai.GioKetThuc || mucHienTai.gioKetThuc || '',
      note: booking.ghiChu || booking.notes || mucHienTai.ghiChu || mucHienTai.notes || '',
      notes: booking.ghiChu || booking.notes || mucHienTai.notes || mucHienTai.ghiChu || '',
      ghiChu: booking.ghiChu || booking.notes || mucHienTai.ghiChu || mucHienTai.notes || '',
      GhiChu: booking.ghiChu || booking.notes || mucHienTai.GhiChu || mucHienTai.ghiChu || '',
      seatingArea: booking.khuVucUuTien || booking.seatingArea || mucHienTai.khuVucUuTien || mucHienTai.seatingArea || 'KHONG_UU_TIEN',
      khuVucUuTien: booking.khuVucUuTien || booking.seatingArea || mucHienTai.khuVucUuTien || mucHienTai.seatingArea || 'KHONG_UU_TIEN',
      KhuVucUuTien: booking.khuVucUuTien || booking.seatingArea || mucHienTai.KhuVucUuTien || mucHienTai.khuVucUuTien || 'KHONG_UU_TIEN',
      internalNote: booking.ghiChuNoiBo || booking.internalNote || mucHienTai.ghiChuNoiBo || mucHienTai.internalNote || '',
      ghiChuNoiBo: booking.ghiChuNoiBo || booking.internalNote || mucHienTai.ghiChuNoiBo || mucHienTai.internalNote || '',
      GhiChuNoiBo: booking.ghiChuNoiBo || booking.internalNote || mucHienTai.GhiChuNoiBo || mucHienTai.ghiChuNoiBo || '',
      name: booking.tenKhachDatBan || booking.name || mucHienTai.tenKhachDatBan || mucHienTai.name || '',
      tenKhachDatBan: booking.tenKhachDatBan || booking.name || mucHienTai.tenKhachDatBan || mucHienTai.name || '',
      TenKhachDatBan: booking.tenKhachDatBan || booking.name || mucHienTai.TenKhachDatBan || mucHienTai.tenKhachDatBan || '',
      phone: booking.sdtDatBan || booking.phone || mucHienTai.sdtDatBan || mucHienTai.phone || '',
      sdtDatBan: booking.sdtDatBan || booking.phone || mucHienTai.sdtDatBan || mucHienTai.phone || '',
      SDTDatBan: booking.sdtDatBan || booking.phone || mucHienTai.SDTDatBan || mucHienTai.sdtDatBan || '',
      email: booking.emailDatBan || booking.email || mucHienTai.emailDatBan || mucHienTai.email || '',
      emailDatBan: booking.emailDatBan || booking.email || mucHienTai.emailDatBan || mucHienTai.email || '',
      EmailDatBan: booking.emailDatBan || booking.email || mucHienTai.EmailDatBan || mucHienTai.emailDatBan || '',
      status: booking.trangThai || booking.status || mucHienTai.trangThai || mucHienTai.status || 'CHO_XAC_NHAN',
      trangThai: booking.trangThai || booking.status || mucHienTai.trangThai || mucHienTai.status || 'CHO_XAC_NHAN',
      TrangThai: booking.trangThai || booking.status || mucHienTai.TrangThai || mucHienTai.trangThai || 'CHO_XAC_NHAN',
      danhSachMaBanDaGan,
      danhSachBanDaGan,
      maBan: danhSachMaBanDaGan[0] || '',
      MaBan: danhSachMaBanDaGan[0] || '',
      tableCode: danhSachMaBanDaGan[0] || '',
      createdAt: booking.ngayTao || booking.createdAt || new Date().toISOString(),
      ngayTao: booking.ngayTao || booking.createdAt || new Date().toISOString(),
      NgayTao: booking.ngayTao || booking.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString(),
      NgayCapNhat: new Date().toISOString(),
      nguonTao: booking.nguonTao || booking.source || 'WEB',
      source: booking.nguonTao || booking.source || 'WEB',
      createdBy: booking.createdBy || '',
      chiTietMonAn: Array.isArray(booking.chiTietMonAn)
        ? booking.chiTietMonAn
        : Array.isArray(booking.selectedMenuItems)
        ? booking.selectedMenuItems
        : mucHienTai.chiTietMonAn || [],
      ChiTietMonAn: Array.isArray(booking.chiTietMonAn)
        ? JSON.stringify(booking.chiTietMonAn)
        : Array.isArray(booking.selectedMenuItems)
        ? JSON.stringify(booking.selectedMenuItems)
        : mucHienTai.ChiTietMonAn || null,
    }

    if (index >= 0) {
      draft.datBan[index] = {
        ...draft.datBan[index],
        ...baseData,
      }
      ketQua = draft.datBan[index]
    } else {
      draft.datBan.push(baseData)
      ketQua = baseData
    }

    const lichSuKhach = draft.heThong.lichSuDatBanTheoKhachHang?.[baseData.maKH] || []
    const mucHoSo = {
      bookingId: bookingCode,
      id: bookingCode,
      bookingCode,
      date: baseData.date,
      time: baseData.time,
      guestCount: Number(baseData.soNguoi || 0),
      area: baseData.seatingArea,
      dateTime: `${baseData.date} ${baseData.time}`.trim(),
      guests: Number(baseData.soNguoi || 0),
      seatingArea: baseData.seatingArea,
      rawStatus: baseData.status,
      status: baseData.status,
      statusLabel: baseData.status,
      statusTone: baseData.status === 'DA_XAC_NHAN' || baseData.status === 'DA_NHAN_BAN' ? 'success' : baseData.status === 'DA_HUY' || baseData.status === 'KHONG_DEN' ? 'danger' : 'warning',
    }

    draft.heThong.lichSuDatBanTheoKhachHang = {
      ...(draft.heThong.lichSuDatBanTheoKhachHang || {}),
      [baseData.maKH]: [
        mucHoSo,
        ...lichSuKhach.filter((item) => String(item.bookingCode || item.id) !== bookingCode),
      ],
    }
  })

  return ketQua ? deepClone(ketQua) : null
}

export const capNhatTrangThaiDatBanOffline = (maDatBan, trangThai) => taoHoacCapNhatDatBanOffline({ booking: { trangThai, status: trangThai }, maDatBan })

export const ganBanChoDatBanOffline = (maDatBan, danhSachMaBan = []) => taoHoacCapNhatDatBanOffline({
  booking: {
    danhSachMaBanDaGan: danhSachMaBan,
    maBan: danhSachMaBan[0] || '',
  },
  maDatBan,
})

export const laySoBanMoiOffline = () => {
  const values = layDanhSachBanOffline().map((table) => {
    const matches = String(table.code || '').match(MA_BAN_REGEX)
    return matches ? matches[0] : String(table.tableNumber || 0)
  })
  return (sapXepSoTangDan(values)[0] || 11) + 1
}
