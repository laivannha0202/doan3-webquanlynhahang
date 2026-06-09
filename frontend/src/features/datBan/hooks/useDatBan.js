import { useCallback } from 'react'
import { STORAGE_KEYS } from '../../../constants/khoaLuuTru'
import { CAC_THAO_TAC_TRANG_THAI_DAT_BAN_HOST } from '../constants/duLieuDatBan'
import {
  huyDatBanApi,
  taoDatBanApi,
  taoDatBanNoiBoApi,
  layLichSuDatBanApi,
  layDanhSachDatBanApi,
  capNhatDatBanApi,
  capNhatTrangThaiDatBanApi,
  ganBanChoDatBanApi,
} from '../../../services/api/apiDatBan'
import { datJsonLuuTru } from '../../../services/dichVuLuuTru'
import { xoaBanNhapTamDatBan, layBanNhapTamDatBanHopLe, luuBanNhapTamDatBan } from '../utils/banNhapTamDatBan'
import { banKhaDungDat } from '../../../constants/trangThaiBan'
import {
  anhXaMucDatBan,
  chuanHoaDatBan,
} from '../utils/anhXaDatBan'
import { useXacThuc } from '../../../hooks/useXacThuc'

export const SU_KIEN_THAY_DOI_DU_LIEU_DAT_BAN = 'booking:data-changed'

export const phatSuKienThayDoiDuLieuDatBan = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(SU_KIEN_THAY_DOI_DU_LIEU_DAT_BAN))
}

const locBanPhuHopChoDatBan = (booking, danhSachBanGhiDe = [], { filterByArea = true } = {}) => {
  const tables = Array.isArray(danhSachBanGhiDe) ? danhSachBanGhiDe : []
  const soLuongKhach = Number(booking?.guests) || 0

  return tables.filter((table) => {
    // Chỉ cho phép bàn TRỐNG (Available) - loại trừ Reserved, Occupied, Maintenance
    if (!banKhaDungDat(table.status)) {
      return false
    }

    if (table.activeBookingId && String(table.activeBookingId) !== String(booking?.id)) {
      return false
    }

    const areaMatches = !filterByArea || !booking?.seatingArea || booking.seatingArea === 'KHONG_UU_TIEN' || table.areaId === booking.seatingArea
    const capacityOk = table.capacity >= soLuongKhach || soLuongKhach <= 0

    return areaMatches && capacityOk
  })
}

export const useDatBan = () => {
  const { nguoiDungHienTai } = useXacThuc()
  const updateBookingStatus = useCallback(async (bookingId, nextStatus, fallbackError) => {
    try {
      const { duLieu, thongDiep } = await capNhatTrangThaiDatBanApi(bookingId, nextStatus)
      const datBanDaChuanHoa = chuanHoaDatBan(duLieu)

      if (!datBanDaChuanHoa) {
        return { success: false, error: 'Không nhận được dữ liệu đặt bàn hợp lệ từ máy chủ.' }
      }

      phatSuKienThayDoiDuLieuDatBan()
      return {
        success: true,
        booking: datBanDaChuanHoa,
        message: thongDiep,
      }
    } catch (error) {
      return { success: false, error: error?.message || fallbackError }
    }
  }, [])

  const luuBanNhapTam = useCallback((duLieuNhapTam) => luuBanNhapTamDatBan(STORAGE_KEYS.BAN_NHAP_TAM_DAT_BAN, duLieuNhapTam), [])

  const layBanNhapTam = useCallback(() => layBanNhapTamDatBanHopLe(STORAGE_KEYS.BAN_NHAP_TAM_DAT_BAN), [])

  const xoaBanNhapTam = useCallback(() => {
    xoaBanNhapTamDatBan(STORAGE_KEYS.BAN_NHAP_TAM_DAT_BAN)
  }, [])

  const taoDatBan = useCallback(async ({ booking, confirmationPayload }) => {
    const maKh = nguoiDungHienTai?.maKH
    const bookingCoMaKH = maKh ? { ...booking, maKH: maKh } : booking
    const { duLieu } = await taoDatBanApi(bookingCoMaKH)
    const createdBooking = chuanHoaDatBan(duLieu)

    datJsonLuuTru(STORAGE_KEYS.XAC_NHAN_DAT_BAN_GAN_NHAT, {
      ...confirmationPayload,
      bookingCode: createdBooking?.bookingCode || confirmationPayload?.bookingCode,
      bookingId: createdBooking?.id || confirmationPayload?.bookingId,
      status: createdBooking?.status || confirmationPayload?.status,
    })
    xoaBanNhapTamDatBan(STORAGE_KEYS.BAN_NHAP_TAM_DAT_BAN)
    phatSuKienThayDoiDuLieuDatBan()
    return createdBooking
  }, [nguoiDungHienTai?.maKH])

  const taoDatBanNoiBo = useCallback(async (duLieuGuiDi) => {
    try {
      const { duLieu, thongDiep } = await taoDatBanNoiBoApi(duLieuGuiDi)
      const datBanDaChuanHoa = chuanHoaDatBan(duLieu)

      if (!datBanDaChuanHoa) {
        return { success: false, error: 'Không nhận được dữ liệu đặt bàn hợp lệ từ máy chủ.' }
      }

      phatSuKienThayDoiDuLieuDatBan()
      return {
        success: true,
        booking: datBanDaChuanHoa,
        message: thongDiep,
      }
    } catch (error) {
      return { success: false, error: error?.message || 'Không thể tạo đặt bàn nội bộ.' }
    }
  }, [])

  const capNhatDatBanNoiBo = useCallback(async (bookingId, duLieuGuiDi) => {
    try {
      const { duLieu, thongDiep } = await capNhatDatBanApi(bookingId, duLieuGuiDi)
      const datBanDaCapNhat = chuanHoaDatBan(duLieu)

      if (!datBanDaCapNhat) {
        return { success: false, error: 'Không nhận được dữ liệu đặt bàn hợp lệ từ máy chủ.' }
      }

      phatSuKienThayDoiDuLieuDatBan()
      return {
        success: true,
        booking: datBanDaCapNhat,
        message: thongDiep,
      }
    } catch (error) {
      return { success: false, error: error?.message || 'Không thể cập nhật booking.' }
    }
  }, [])

  const ganBanChoDatBan = useCallback(async (bookingId, danhSachIdBan) => {
    try {
      const { duLieu, thongDiep } = await ganBanChoDatBanApi(bookingId, danhSachIdBan)
      const datBanDaChuanHoa = chuanHoaDatBan(duLieu)

      if (!datBanDaChuanHoa) {
        return { success: false, error: 'Không nhận được dữ liệu đặt bàn hợp lệ từ máy chủ.' }
      }

      phatSuKienThayDoiDuLieuDatBan()
      return {
        success: true,
        booking: datBanDaChuanHoa,
        message: thongDiep,
      }
    } catch (error) {
      return { success: false, error: error?.message || 'Không thể gán bàn cho booking này.' }
    }
  }, [])

  const capNhatTrangThaiDatBan = useCallback(
    async (bookingId, trangThai, thongDiepLoiMacDinh = 'Không thể cập nhật trạng thái booking.') => updateBookingStatus(bookingId, trangThai, thongDiepLoiMacDinh),
    [updateBookingStatus],
  )

  const danhDauDaCheckIn = useCallback(
    async (bookingId) => capNhatTrangThaiDatBan(bookingId, 'DA_NHAN_BAN', 'Không thể check-in đặt bàn.'),
    [capNhatTrangThaiDatBan],
  )

  const danhDauHoanThanh = useCallback(
    async (bookingId) => capNhatTrangThaiDatBan(bookingId, 'HOAN_THANH', 'Không thể hoàn thành booking.'),
    [capNhatTrangThaiDatBan],
  )

  const danhDauKhongDen = useCallback(
    async (bookingId) => capNhatTrangThaiDatBan(bookingId, 'KHONG_DEN', 'Không thể đánh dấu không đến.'),
    [capNhatTrangThaiDatBan],
  )

  const traBanTachRoi = useCallback(() => ({
    success: false,
    error: 'Không hỗ trợ trả bàn độc lập. Hãy hoàn thành, đánh dấu không đến hoặc hủy booking để đồng bộ trạng thái bàn.',
  }), [])

  const layLichSuDatBan = useCallback(async () => {
    const maKh = nguoiDungHienTai?.maKH
    if (!maKh) {
      return []
    }
    const { duLieu } = await layLichSuDatBanApi(maKh)

    if (!Array.isArray(duLieu)) {
      return []
    }

    const result = duLieu
      .map((item) => {
        if (item && typeof item === 'object' && 'bookingId' in item && 'dateTime' in item && 'rawStatus' in item) {
          return item
        }

        const normalized = chuanHoaDatBan(item)
        if (!normalized) {
          return null
        }
        return anhXaMucDatBan(normalized)
      })
      .filter(Boolean)
    return result
  }, [nguoiDungHienTai?.maKH])

  const huyDatBan = useCallback(async (bookingId, maDatBan) => {
    try {
      const { thongDiep } = await huyDatBanApi(bookingId)
      const lichSuDatBan = await layLichSuDatBan()
      phatSuKienThayDoiDuLieuDatBan()
      return {
        success: true,
        message: thongDiep || `Đã hủy đặt bàn ${maDatBan} thành công.`,
        lichSuDatBan,
      }
    } catch (error) {
      return { success: false, error: error?.message || 'Không thể hủy đặt bàn này. Vui lòng thử lại.' }
    }
  }, [layLichSuDatBan])

  const layDanhSachDatBanHost = useCallback(async () => {
    try {
      const { duLieu } = await layDanhSachDatBanApi()
      const danhSachDatBan = Array.isArray(duLieu) ? duLieu : []
      return danhSachDatBan.map(chuanHoaDatBan).filter(Boolean)
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        return []
      }

      throw error
    }
  }, [])

  const layBanPhuHopChoDatBan = useCallback((booking, danhSachBanGhiDe = [], options) => locBanPhuHopChoDatBan(booking, danhSachBanGhiDe, options), [])

  return {
    thaoTacTrangThaiDatBan: CAC_THAO_TAC_TRANG_THAI_DAT_BAN_HOST,
    layBanNhapTam,
    luuBanNhapTam,
    xoaBanNhapTam,
    taoDatBan,
    taoDatBanNoiBo,
    capNhatDatBanNoiBo,
    capNhatTrangThaiDatBan,
    ganBanChoDatBan,
    danhDauDaCheckIn,
    danhDauHoanThanh,
    danhDauKhongDen,
    traBanTachRoi,
    layBanPhuHopChoDatBan,
    layLichSuDatBan,
    huyDatBan,
    layDanhSachDatBanHost,
  }
}
