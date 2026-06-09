import { NHAN_KHU_VUC_DAT_BAN } from '../datBan/constants/duLieuDatBan'
import { laySacThaiDonHang as laySacThaiDonHangChuan } from '../../utils/donHang'
import { chuanHoaTrangThaiDatBan } from './hangSo'

export const dinhDangNgay = (giaTri) => {
  if (!giaTri) return '--'

  const chuoiGiaTri = String(giaTri).trim()
  const khopNamThangNgay = chuoiGiaTri.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (khopNamThangNgay) {
    const [, nam, thang, ngay] = khopNamThangNgay
    return `${ngay}/${thang}/${nam}`
  }

  const doiTuongNgay = new Date(chuoiGiaTri)
  if (Number.isNaN(doiTuongNgay.getTime())) {
    return '--'
  }

  return doiTuongNgay.toLocaleDateString('vi-VN')
}

export const dinhDangNgayGio = (ngay, gio) => {
  if (!ngay) return '--'

  const [nam, thang, ngayTrongThang] = String(ngay).split('-')
  if (!nam || !thang || !ngayTrongThang) return `${ngay} ${gio || ''}`.trim()

  return `${ngayTrongThang}/${thang}/${nam} ${gio || ''}`.trim()
}

export const dinhDangSoKhach = (soKhach) => `${soKhach} khách`
export const layNhanChoNgoi = (giaTri) => NHAN_KHU_VUC_DAT_BAN[giaTri] || giaTri || 'Không ưu tiên'

export const laySacThaiTrangThaiDatBan = (trangThai) => {
  const trangThaiDaChuanHoa = chuanHoaTrangThaiDatBan(trangThai)

  if (trangThaiDaChuanHoa === 'DA_HUY' || trangThaiDaChuanHoa === 'TU_CHOI_HET_CHO' || trangThaiDaChuanHoa === 'KHONG_DEN') return 'danger'
  if (trangThaiDaChuanHoa === 'DA_NHAN_BAN' || trangThaiDaChuanHoa === 'HOAN_THANH') return 'neutral'
  if (trangThaiDaChuanHoa === 'DA_XAC_NHAN') return 'success'
  return 'warning'
}

export const layNhanTrangThaiDatBan = (trangThai) => {
  if (!trangThai) return 'Chờ xác nhận'
  const trangThaiDaChuanHoa = chuanHoaTrangThaiDatBan(trangThai)
  const banDo = {
    CHO_XAC_NHAN: 'Chờ xác nhận',
    DA_XAC_NHAN: 'Đã xác nhận',
    DA_NHAN_BAN: 'Đã nhận bàn',
    HOAN_THANH: 'Đã hoàn thành',
    DA_HUY: 'Đã hủy',
    KHONG_DEN: 'Không đến',
    TU_CHOI_HET_CHO: 'Từ chối / hết chỗ',
  }

  return banDo[trangThai] || banDo[trangThaiDaChuanHoa] || trangThai
}

export const laySacThaiDonHang = (trangThai) => laySacThaiDonHangChuan(trangThai)

export const layNhanKenhXacNhan = (danhSachKenh) => {
  if (Array.isArray(danhSachKenh) && danhSachKenh.length > 0) return danhSachKenh.join(' / ')
  return 'SMS'
}
