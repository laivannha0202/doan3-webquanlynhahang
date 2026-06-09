import { TRANG_THAI_DON_SAP_TOI, TRANG_THAI_LICH_SU } from '../../noiBo/hangSo'

export const TRANG_THAI_KET_THUC = new Set(['HOAN_THANH', 'DA_HUY', 'KHONG_DEN', 'TU_CHOI_HET_CHO'])

export const BADGE_TONE = {
  WARNING: 'warning',
  SUCCESS: 'success',
  DANGER: 'danger',
  INFO: 'info',
  NEUTRAL: 'neutral',
}

export const NHAN_TRANG_THAI_KHACH_HANG = {
  CHO_XAC_NHAN: { label: 'Yêu cầu đặt bàn', tone: BADGE_TONE.WARNING },
  DA_XAC_NHAN: { label: 'Đã xác nhận', tone: BADGE_TONE.SUCCESS },
  DA_NHAN_BAN: { label: 'Đã nhận bàn', tone: BADGE_TONE.SUCCESS },
  HOAN_THANH: { label: 'Đã hoàn thành', tone: BADGE_TONE.INFO },
  DA_HUY: { label: 'Đã huỷ', tone: BADGE_TONE.NEUTRAL },
  TU_CHOI_HET_CHO: { label: 'Từ chối / hết chỗ', tone: BADGE_TONE.DANGER },
  KHONG_DEN: { label: 'Không đến', tone: BADGE_TONE.DANGER },
}

const chuanHoaTrangThai = (status) => {
  if (!status) return ''
  const s = String(status).trim()
  if (['Pending', 'YEU_CAU_DAT_BAN', 'CHO_XAC_NHAN'].includes(s)) return 'CHO_XAC_NHAN'
  if (['Confirmed', 'DA_XAC_NHAN'].includes(s)) return 'DA_XAC_NHAN'
  if (['Completed', 'DA_HOAN_THANH'].includes(s)) return 'HOAN_THANH'
  if (['Cancelled', 'DA_HUY', 'TU_CHOI_HET_CHO'].includes(s)) return 'DA_HUY'
  if (['NO_SHOW', 'KHONG_DEN'].includes(s)) return 'KHONG_DEN'
  if (['GIU_CHO_TAM', 'DA_GHI_NHAN', 'DA_CHECK_IN', 'DA_XEP_BAN'].includes(s)) return 'DA_XAC_NHAN'
  if (['CAN_GOI_LAI'].includes(s)) return 'CHO_XAC_NHAN'
  return s
}

/**
 * Parse ngay va gio thanh Date de so sanh.
 * Ho tro nhieu dinh dang: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY.
 */
const taoNgayGioSoSanh = (date, time) => {
  if (!date) return null
  const ngayStr = String(date).trim()
  let gioStr = String(time || '00:00').trim()

  // Chuan hoa gio: neu co san giay (HH:MM:SS) thi giu nguyen, neu chi co HH:MM thi them :00
  if (/^\d{1,2}:\d{2}$/.test(gioStr)) {
    gioStr = `${gioStr}:00`
  }

  // Thu ISO truoc
  let parsed = new Date(`${ngayStr}T${gioStr}`)
  if (!isNaN(parsed.getTime())) return parsed

  // Thu DD/MM/YYYY
  const parts = ngayStr.split(/[-/]/)
  if (parts.length === 3) {
    const [p1, p2, p3] = parts.map(Number)
    if (p1 > 12 && p2 <= 12) {
      // Dinh dang DD/MM/YYYY
      parsed = new Date(`${p3}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}T${gioStr}`)
    } else {
      // Dinh dang MM/DD/YYYY hoac YYYY-MM-DD
      parsed = new Date(`${p3}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}T${gioStr}`)
    }
    if (!isNaN(parsed.getTime())) return parsed
  }

  return null
}

export const tinhTrangThaiHienThi = (booking, hienTai) => {
  const rawStatus = booking.status || booking.trangThai || ''
  const normalized = chuanHoaTrangThai(rawStatus)
  const bookingTime = taoNgayGioSoSanh(booking.date || booking.ngayDat, booking.time || booking.gioDat)

  if (!bookingTime) return { status: normalized, isExpired: false }

  const isPast = bookingTime < hienTai
  const isTerminal = TRANG_THAI_KET_THUC.has(normalized)

  if (!isTerminal && isPast) {
    return { status: 'KHONG_DEN', isExpired: true }
  }

  return { status: normalized, isExpired: false }
}

export const tachDanhSachDatBan = (bookings) => {
  const hienTai = new Date()
  // Reset ve dau ngay de so sanh ngay (bo qua gio)
  const homNay = new Date(hienTai.getFullYear(), hienTai.getMonth(), hienTai.getDate())

  const upcomingBookings = []
  const historyBookings = []

  for (const booking of bookings) {
    const { status, isExpired } = tinhTrangThaiHienThi(booking, hienTai)
    const bookingTime = taoNgayGioSoSanh(booking.date || booking.ngayDat, booking.time || booking.gioDat)

    // Ngay dat >= hom nay va trang thai chua ket thuc → Don sap toi
    const isTerminal = TRANG_THAI_KET_THUC.has(status)
    const isFutureOrToday = bookingTime && bookingTime >= homNay

    if (!isTerminal && isFutureOrToday && !isExpired) {
      upcomingBookings.push({ ...booking, hienThiTrangThai: status, isExpired: false })
    } else {
      historyBookings.push({ ...booking, hienThiTrangThai: status, isExpired })
    }
  }

  // Don sap toi: ngay gan nhat len truoc (ascending)
  upcomingBookings.sort((a, b) => {
    const timeA = taoNgayGioSoSanh(a.date || a.ngayDat, a.time || a.gioDat)
    const timeB = taoNgayGioSoSanh(b.date || b.ngayDat, b.time || b.gioDat)
    if (!timeA) return 1
    if (!timeB) return -1
    return timeA - timeB
  })

  // Lich su: ngay moi nhat len truoc (descending)
  historyBookings.sort((a, b) => {
    const timeA = taoNgayGioSoSanh(a.date || a.ngayDat, a.time || a.gioDat)
    const timeB = taoNgayGioSoSanh(b.date || b.ngayDat, b.time || b.gioDat)
    if (!timeA) return 1
    if (!timeB) return -1
    return timeB - timeA
  })

  return { upcomingBookings, historyBookings }
}

export const layNhanTrangThai = (status) => {
  return NHAN_TRANG_THAI_KHACH_HANG[status] || { label: status || 'Không xác định', tone: 'default' }
}