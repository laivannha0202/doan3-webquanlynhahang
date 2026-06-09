import { LOAI_DON_HANG } from '../features/donHang/contracts'

export { LOAI_DON_HANG }

export const NHAN_LOAI_DON_HANG = Object.freeze({
  [LOAI_DON_HANG.TAI_BAN]: 'Tại bàn',
})

export const NHAN_TRANG_THAI_DON_HANG = Object.freeze({
  DANG_CHUAN_BI: 'Đang chuẩn bị',
  DANG_PHUC_VU: 'Đang phục vụ',
  HOAN_THANH: 'Hoàn tất',
  DA_THANH_TOAN: 'Đã thanh toán',
  DA_HUY: 'Đã hủy',
})

export const SAC_THAI_TRANG_THAI_DON_HANG = Object.freeze({
  DANG_CHUAN_BI: 'warning',
  DANG_PHUC_VU: 'warning',
  HOAN_THANH: 'success',
  DA_THANH_TOAN: 'success',
  DA_HUY: 'danger',
})

const BUOC_TIEN_TRINH_DON_HANG_THEO_TRANG_THAI = Object.freeze({
  DANG_CHUAN_BI: 1,
  DANG_PHUC_VU: 2,
  HOAN_THANH: 3,
  DA_THANH_TOAN: 4,
  DA_HUY: 0,
})

const TRANG_THAI_DON_HANG_DANG_HOAT_DONG = new Set([
  'DANG_CHUAN_BI',
  'DANG_PHUC_VU',
])

const TRANG_THAI_DON_HANG_KET_THUC = new Set([
  'HOAN_THANH',
  'DA_THANH_TOAN',
  'DA_HUY',
])

export const NHAN_PHUONG_THUC_THANH_TOAN = Object.freeze({
  TienMat: 'Tiền mặt',
  ChuyenKhoan: 'Chuyển khoản',
  TheNganHang: 'Thẻ',
  MoMo: 'MoMo',
  ZaloPay: 'ZaloPay',
  VNPay: 'VNPay',
})

export const TUY_CHON_PHUONG_THUC_THANH_TOAN = Object.freeze([
  {
    value: 'TienMat',
    label: 'Tiền mặt',
    description: 'Thanh toán trực tiếp tại bàn hoặc khi nhận món.',
  },
  {
    value: 'ChuyenKhoan',
    label: 'Chuyển khoản',
    description: 'Chuyển khoản khi thanh toán đơn hàng.',
  },
  {
    value: 'TheNganHang',
    label: 'Thanh toán bằng thẻ',
    description: 'Dùng thẻ tại bàn hoặc thiết bị hỗ trợ.',
  },
])

const chuanHoaVanBan = (giaTri) => String(giaTri ?? '').trim()

const chuanHoaKichCoDaChon = (giaTri) => chuanHoaVanBan(giaTri).toUpperCase() || 'M'

const chuanHoaToppingDaChon = (giaTri) => (
  Array.isArray(giaTri)
    ? giaTri.map((muc) => chuanHoaVanBan(muc)).filter(Boolean)
    : []
)

const BI_DANH_PHUONG_THUC_THANH_TOAN = Object.freeze({
  cash: 'TienMat',
  banking: 'ChuyenKhoan',
  card: 'TheNganHang',
})

export const chuanHoaPhuongThucThanhToan = (giaTri) => {
  const giaTriDaChuanHoa = chuanHoaVanBan(giaTri)

  if (NHAN_PHUONG_THUC_THANH_TOAN[giaTriDaChuanHoa]) {
    return giaTriDaChuanHoa
  }

  return BI_DANH_PHUONG_THUC_THANH_TOAN[giaTriDaChuanHoa.toLowerCase()] || 'TienMat'
}

export const chuanHoaIdMonAn = (giaTri) => String(giaTri ?? '').trim() || undefined

export const layNhanTrangThaiDonHang = (trangThai) => NHAN_TRANG_THAI_DON_HANG[trangThai] || chuanHoaVanBan(trangThai) || 'Không xác định'

export const laySacThaiDonHang = (trangThai) => SAC_THAI_TRANG_THAI_DON_HANG[trangThai] || 'neutral'

export const layBuocTienTrinhDonHang = (trangThai) => BUOC_TIEN_TRINH_DON_HANG_THEO_TRANG_THAI[trangThai] ?? 0

export const laTrangThaiDonHangDaHuy = (trangThai) => chuanHoaVanBan(trangThai) === 'DA_HUY'

export const laTrangThaiDonHangKetThuc = (trangThai) => TRANG_THAI_DON_HANG_KET_THUC.has(chuanHoaVanBan(trangThai))

export const laTrangThaiDonHangDangHoatDong = (trangThai) => TRANG_THAI_DON_HANG_DANG_HOAT_DONG.has(chuanHoaVanBan(trangThai))

export const layNhanPhuongThucThanhToan = (phuongThucThanhToan) => (
  NHAN_PHUONG_THUC_THANH_TOAN[phuongThucThanhToan] || chuanHoaVanBan(phuongThucThanhToan) || 'Chưa chọn'
)

export const anhXaMonTrongGioThanhMonDonHang = (monTrongGio) => ({
  menuItemId: chuanHoaIdMonAn(monTrongGio?.menuItemId ?? monTrongGio?.maMon ?? monTrongGio?.id),
  quantity: Math.max(1, Number(monTrongGio?.quantity) || 1),
  kichCoDaChon: chuanHoaKichCoDaChon(monTrongGio?.kichCoDaChon),
  toppingDaChon: chuanHoaToppingDaChon(monTrongGio?.toppingDaChon),
  ghiChuRieng: chuanHoaVanBan(monTrongGio?.ghiChuRieng),
  variantKey: chuanHoaVanBan(monTrongGio?.variantKey),
})

export const taoDuLieuTaoDonHang = ({ cartItems, voucherCode, soDiem, customer, note, tableNumber, paymentMethod }) => ({
  maKH: chuanHoaVanBan(customer?.customerCode || customer?.maKH),
  maBan: chuanHoaVanBan(tableNumber) || null,
  maNV: null,
  maDatBan: null,
  nguonTao: 'Online',
  items: Array.isArray(cartItems) ? cartItems.map(anhXaMonTrongGioThanhMonDonHang) : [],
  voucherCode: chuanHoaVanBan(voucherCode).toUpperCase(),
  soDiem: Number(soDiem) || 0,
  customer: {
    fullName: chuanHoaVanBan(customer?.fullName),
    phone: chuanHoaVanBan(customer?.phone),
    email: chuanHoaVanBan(customer?.email),
  },
  note: chuanHoaVanBan(note),
  tableNumber: chuanHoaVanBan(tableNumber),
  paymentMethod: chuanHoaPhuongThucThanhToan(paymentMethod),
})

export const layMonKhongHopLeTrongDonHang = (cartItems) => (
  Array.isArray(cartItems)
    ? cartItems.filter((item) => !chuanHoaIdMonAn(item?.menuItemId ?? item?.id))
    : []
)
