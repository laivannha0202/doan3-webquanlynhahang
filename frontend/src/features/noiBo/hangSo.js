import { CAC_KHU_VUC_BAN_CHUAN } from '../../constants/khuVucBan'

export const CAC_BO_LOC_NGAY = Object.freeze([
  { key: 'all', label: 'Tất cả ngày' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'tomorrow', label: 'Ngày mai' },
  { key: 'last7Days', label: '7 ngày gần đây' },
  { key: 'last30Days', label: '30 ngày gần đây' },
])

export const CAC_BO_LOC_CA = Object.freeze([
  { key: 'all', label: 'Mọi ca' },
  { key: 'lunch', label: 'Ca trưa' },
  { key: 'dinner', label: 'Ca tối' },
])

export const CAC_KHU_VUC_BAN = CAC_KHU_VUC_BAN_CHUAN

export const CAC_TRANG_THAI_DAT_BAN_DANG_HOAT_DONG = new Set([
  'CHO_XAC_NHAN',
  'DA_XAC_NHAN',
  'DA_NHAN_BAN',
])

export const CAC_TRANG_THAI_DAT_BAN_CHO_XAC_NHAN = new Set([
  'CHO_XAC_NHAN',
])

export const CAC_TRANG_THAI_DAT_BAN_DA_XAC_NHAN = new Set([
  'DA_XAC_NHAN',
  'DA_NHAN_BAN',
])

export const TRANG_THAI_DON_SAP_TOI = new Set(['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DA_NHAN_BAN'])

const BAN_DO_TRANG_THAI_DAT_BAN = Object.freeze({
  NOSHOW: 'KHONG_DEN',
  NO_SHOW: 'KHONG_DEN',
  EXPIRED: 'KHONG_DEN',
  CANCELLED: 'DA_HUY',
  COMPLETED: 'HOAN_THANH',
  DA_HOAN_THANH: 'HOAN_THANH',
  PENDING: 'CHO_XAC_NHAN',
  YEU_CAU_DAT_BAN: 'CHO_XAC_NHAN',
  CAN_GOI_LAI: 'CHO_XAC_NHAN',
  GIU_CHO_TAM: 'CHO_XAC_NHAN',
  CONFIRMED: 'DA_XAC_NHAN',
  DA_GHI_NHAN: 'DA_XAC_NHAN',
  SEATED: 'DA_NHAN_BAN',
  DA_CHECK_IN: 'DA_NHAN_BAN',
  DA_XEP_BAN: 'DA_NHAN_BAN',
})

export const chuanHoaTrangThaiDatBan = (trangThai = '') => {
  const giaTri = String(trangThai || '').trim()
  if (!giaTri) return ''

  const khoa = giaTri.replace(/[\s-]+/g, '_').toUpperCase()
  return BAN_DO_TRANG_THAI_DAT_BAN[khoa] || khoa
}

export const TRANG_THAI_LICH_SU = new Set(['HOAN_THANH', 'DA_HUY', 'KHONG_DEN', 'TU_CHOI_HET_CHO'])
