export const CAC_TRANG_THAI_DAT_BAN_DANG_MO = new Set([
  'CHO_XAC_NHAN',
  'DA_XAC_NHAN',
  'DA_NHAN_BAN',
  'DANG_PHUC_VU',
])

export const laDatBanSapGanBan = (datBan, hienTai = new Date()) => {
  if (!CAC_TRANG_THAI_DAT_BAN_DANG_MO.has(datBan?.status)) return false
  if (Array.isArray(datBan?.danhSachMaBanDaGan) && datBan.danhSachMaBanDaGan.length > 0) return false

  const thoiDiemDatBan = new Date(`${datBan?.date || ''}T${datBan?.time || '00:00:00'}`)
  if (Number.isNaN(thoiDiemDatBan.getTime())) return false

  const chenhlech = thoiDiemDatBan.getTime() - hienTai.getTime()
  return chenhlech >= 0 && chenhlech <= 2 * 60 * 60 * 1000
}

export const taoChuoiDoanhThu7Ngay = (danhSachDoanhThu = []) => {
  return (Array.isArray(danhSachDoanhThu) ? danhSachDoanhThu : []).map((muc) => ({
    label: muc?.Ngay ? new Date(muc.Ngay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--',
    revenue: Number(muc?.DoanhThu || 0),
    completedOrders: Number(muc?.SoHoaDon || 0),
  }))
}

export const NOI_BO_THONG_KE_KHOANG_THOI_GIAN = Object.freeze([
  { key: 'today', label: 'Hôm nay' },
  { key: 'last7Days', label: '7 ngày' },
  { key: 'last30Days', label: '30 ngày' },
  { key: 'thisMonth', label: 'Tháng này' },
])
