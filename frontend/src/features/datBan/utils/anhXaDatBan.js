import { NHAN_KHU_VUC_DAT_BAN } from '../constants/duLieuDatBan.js'
import { dinhDangNgay } from '../../noiBo/dinhDang.js'

export const dinhDangNgayGioDatBan = (booking) => `${dinhDangNgay(booking.date)} ${booking.time || ''}`.trim()

const anhXaTrangThaiDatBan = (status) => {
  if (!status) return '🟡 Yêu cầu đặt bàn'
  if (status === 'CHO_XAC_NHAN') return '🟡 Yêu cầu đặt bàn'
  if (status === 'DA_XAC_NHAN') return '🟢 Đã xác nhận'
  if (status === 'DA_NHAN_BAN') return '🟣 Đã nhận bàn'
  if (status === 'HOAN_THANH') return '⚪ Đã hoàn thành'
  if (status === 'DA_HUY') return '🔴 Đã hủy'
  if (status === 'KHONG_DEN') return '⚫ Không đến'
  if (status === 'TU_CHOI_HET_CHO') return '🔴 Từ chối / hết chỗ'
  return status
}

export const chuanHoaDanhSachIdBanDaGan = (value) => (
  Array.isArray(value)
    ? value.map((tableId) => String(tableId).trim()).filter(Boolean)
    : []
)

export const chuanHoaDatBan = (booking) => {
  if (!booking || typeof booking !== 'object') {
    return null
  }

  const normalizedId = String(booking.id ?? booking.bookingCode ?? booking.maDatBan ?? booking.MaDatBan ?? '').trim()

  if (!normalizedId) {
    return null
  }

  const normalizedStatus = String(booking.status || booking.trangThai || 'CHO_XAC_NHAN').trim() || 'CHO_XAC_NHAN'
  const danhSachMaBanDaGan = chuanHoaDanhSachIdBanDaGan(booking.danhSachMaBanDaGan)

  return {
    id: normalizedId,
    bookingCode: String(booking.bookingCode || booking.maDatBan || booking.MaDatBan || normalizedId).trim() || normalizedId,
    guests: String(booking.guests ?? booking.soNguoi ?? booking.SoNguoi ?? '').trim(),
    date: String(booking.date ?? booking.ngayDat ?? booking.NgayDat ?? '').trim(),
    time: String(booking.time ?? booking.gioDat ?? booking.GioDat ?? '').trim(),
    seatingArea: (() => {
      const kvut = booking.khuVucUuTien ?? booking.KhuVucUuTien
      if (kvut && kvut.trim()) return String(kvut).trim()
      const sa = booking.seatingArea
      return String(sa ?? 'KHONG_UU_TIEN').trim() || 'KHONG_UU_TIEN'
    })(),
    notes: String(booking.notes ?? booking.ghiChu ?? booking.GhiChu ?? '').trim(),
    name: String(booking.name ?? booking.tenKhachDatBan ?? booking.TenKhachDatBan ?? booking.tenKH ?? booking.TenKH ?? '').trim(),
    phone: String(booking.phone ?? booking.sdtDatBan ?? booking.SDTDatBan ?? booking.sdt ?? booking.SDT ?? '').trim(),
    email: String(booking.email ?? booking.emailDatBan ?? booking.EmailDatBan ?? '').trim(),
    status: normalizedStatus,
    nguonTao: String(booking.nguonTao ?? booking.NguonTao ?? '').trim(),
    source: String(booking.source ?? booking.nguonTao ?? booking.NguonTao ?? '').trim(),
    createdAt: String(booking.createdAt ?? booking.ngayTao ?? booking.NgayTao ?? '').trim(),
    updatedAt: String(booking.updatedAt ?? booking.ngayCapNhat ?? booking.NgayCapNhat ?? '').trim(),
    userEmail: booking.userEmail ?? null,
    occasion: String(booking.occasion ?? '').trim(),
    confirmationChannel: Array.isArray(booking.confirmationChannel)
      ? booking.confirmationChannel.filter(Boolean)
      : booking.confirmationChannel
        ? [String(booking.confirmationChannel)]
        : [],
    internalNote: String(booking.internalNote ?? booking.ghiChuNoiBo ?? booking.GhiChuNoiBo ?? '').trim(),
    danhSachMaBanDaGan,
    danhSachBanDaGan: Array.isArray(booking.danhSachBanDaGan) ? booking.danhSachBanDaGan.filter(Boolean) : [],
    checkedInAt: String(booking.checkedInAt ?? '').trim(),
    seatedAt: String(booking.seatedAt ?? '').trim(),
    completedAt: String(booking.completedAt ?? '').trim(),
    cancelledAt: String(booking.cancelledAt ?? '').trim(),
    noShowAt: String(booking.noShowAt ?? '').trim(),
    createdBy: String(booking.createdBy ?? '').trim(),
    menuItems: (() => {
      const raw = booking.chiTietMonAn ?? booking.ChiTietMonAn
      if (!raw) return []
      if (Array.isArray(raw)) return raw
      try {
        const parsed = JSON.parse(String(raw))
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    })(),
  }
}

export const anhXaMucDatBan = (booking) => ({
  bookingId: booking.id,
  id: booking.bookingCode || booking.id,
  bookingCode: booking.bookingCode || booking.id,
  date: booking.date,
  time: booking.time,
  guestCount: Number(booking.guests) || 0,
  area: NHAN_KHU_VUC_DAT_BAN[booking.seatingArea] || booking.seatingArea || 'Không ưu tiên',
  dateTime: dinhDangNgayGioDatBan(booking),
  guests: Number(booking.guests) || 0,
  seatingArea: NHAN_KHU_VUC_DAT_BAN[booking.seatingArea] || '',
  rawStatus: booking.status || 'CHO_XAC_NHAN',
  status: anhXaTrangThaiDatBan(booking.status),
  statusLabel: anhXaTrangThaiDatBan(booking.status).replace(/^[^\s]+\s/, ''),
  statusTone: booking.status === 'DA_XAC_NHAN' || booking.status === 'DA_NHAN_BAN' ? 'success' : booking.status === 'DA_HUY' || booking.status === 'KHONG_DEN' || booking.status === 'TU_CHOI_HET_CHO' ? 'danger' : booking.status === 'HOAN_THANH' ? 'neutral' : 'warning',
  menuItems: booking.menuItems || booking.chiTietMonAn || [],
})
