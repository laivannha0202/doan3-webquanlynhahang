import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDanhSachMonAn } from '../thucDon/hooks/useDanhSachMonAn'
import { SU_KIEN_THAY_DOI_DU_LIEU_DAT_BAN, useDatBan } from '../datBan/hooks/useDatBan'
import { useXacThuc } from '../../hooks/useXacThuc'
import { layDanhSachNguoiDungApi, taoNguoiDungNoiBoApi, capNhatNguoiDungNoiBoApi, xoaNguoiDungNoiBoApi } from '../../services/api/apiXacThuc'
import { layDanhSachDanhGiaApi, duyetDanhGiaApi } from '../../services/api/apiDanhGia'
import { layDanhSachDonHangApi, layChiTietDonHangApi, capNhatTrangThaiDonHangApi } from '../../services/api/apiDonHang'
import { layDanhSachBanApi, capNhatTrangThaiBanApi } from '../../services/api/apiBanAn'
import { layDanhSachDatBanApi } from '../../services/api/apiDatBan'
import { CAC_TRANG_THAI_DAT_BAN_DANG_HOAT_DONG, CAC_TRANG_THAI_DAT_BAN_DA_XAC_NHAN, CAC_TRANG_THAI_DAT_BAN_CHO_XAC_NHAN, TRANG_THAI_LICH_SU, chuanHoaTrangThaiDatBan } from './hangSo'
import { CAC_TRANG_THAI_DAT_BAN_DANG_MO } from './thongKeNoiBo'
import {
  layTomTatTaiKhoan,
  layTomTatDonHang,
  layTomTatTonKhoBan,
  layTomTatBan,
  layDatBanChuaGanBan,
  laDatBanDaCheckIn,
  laDatBanSapDienRa,
  sapXepDatBanChoVanHanh,
  sapXepDonHangChoVanHanh,
} from './boChon'
import { laySacThaiDonHang } from './dinhDang'
import { chuanHoaBanChoNoiBo } from '../../services/dichVuBanAn.js'
import { chuanHoaNguoiDungApi } from '../../services/api/apiXacThuc'

const chuanHoaDonHangNoiBo = (order) => {
  if (!order || typeof order !== 'object') return null

  const tongHopGia = order.tongHopGia || {}
  const tongTien = Number(
    order.total
    ?? order.tongTien
    ?? order.TongTien
    ?? tongHopGia.tongTien
    ?? tongHopGia.TongTien
    ?? 0,
  )

  return {
    ...order,
    id: order.id || order.orderCode || order.maDonHang || order.MaDonHang,
    orderCode: order.orderCode || order.maDonHang || order.MaDonHang || '',
    maBan: order.maBan || order.MaBan || order.tableCode || '',
    tableCode: order.tableCode || order.maBan || order.MaBan || '',
    tableName: order.tableName || order.tenBan || order.TenBan || '',
    tableNumber: order.tableNumber || order.soBan || order.SoBan || '',
    status: order.status || order.trangThai || order.TrangThai || '',
    total: tongTien,
  }
}

export const useDuLieuBangDieuKhien = () => {
  const { laQuanLy } = useXacThuc()
  const {
    ganBanChoDatBan,
    taoDatBanNoiBo,
    layBanPhuHopChoDatBan,
    capNhatTrangThaiDatBan,
    danhDauDaCheckIn,
    danhDauHoanThanh,
    danhDauKhongDen,
    capNhatDatBanNoiBo,
  } = useDatBan()
  const { dishes: danhSachMon, reloadDishes: taiLaiDanhSachMon } = useDanhSachMonAn()
  const [danhSachDatBan, setDanhSachDatBan] = useState([])
  const [danhSachDonHang, setDanhSachDonHang] = useState([])
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState([])
  const [danhSachBan, setDanhSachBan] = useState([])
  const [danhSachDanhGia, setDanhSachDanhGia] = useState([])
  const [dangTaiDuLieu, setDangTaiDuLieu] = useState(false)
  const [daTaiDuLieuLanDau, setDaTaiDuLieuLanDau] = useState(false)
  const [loiTaiDuLieu, setLoiTaiDuLieu] = useState('')
  const daKhoiTaoLanDauRef = useRef(false)

  const taiLaiDuLieu = useCallback(async () => {
    try {
      setDangTaiDuLieu(true)
      setLoiTaiDuLieu('')

      const [ketQuaDatBan, ketQuaDonHang, ketQuaTaiKhoan, ketQuaBan, ketQuaDanhGia] = await Promise.allSettled([
        layDanhSachDatBanApi(),
        layDanhSachDonHangApi(),
        laQuanLy ? layDanhSachNguoiDungApi() : Promise.resolve({ duLieu: [] }),
        layDanhSachBanApi(),
        layDanhSachDanhGiaApi(),
      ])

      const loiNghiemTrong = [ketQuaDatBan, ketQuaDonHang, ketQuaBan, ketQuaDanhGia]
        .find((ketQua) => ketQua.status === 'rejected')

      if (loiNghiemTrong) {
        throw loiNghiemTrong.reason
      }

      const nextBookingsResponse = ketQuaDatBan.status === 'fulfilled' ? ketQuaDatBan.value : null
      const nextOrdersResponse = ketQuaDonHang.status === 'fulfilled' ? ketQuaDonHang.value : null
      const nextAccountsResponse = ketQuaTaiKhoan.status === 'fulfilled' ? ketQuaTaiKhoan.value : null
      const nextTablesResponse = ketQuaBan.status === 'fulfilled' ? ketQuaBan.value : null
      const nextReviewsResponse = ketQuaDanhGia.status === 'fulfilled' ? ketQuaDanhGia.value : null

      setDanhSachDatBan(Array.isArray(nextBookingsResponse?.duLieu) ? nextBookingsResponse.duLieu : [])
      setDanhSachDonHang(Array.isArray(nextOrdersResponse?.duLieu) ? nextOrdersResponse.duLieu.map(chuanHoaDonHangNoiBo).filter(Boolean) : [])
      setDanhSachTaiKhoan(Array.isArray(nextAccountsResponse?.duLieu) ? nextAccountsResponse.duLieu.map(chuanHoaNguoiDungApi).filter(Boolean) : [])
      setDanhSachBan(Array.isArray(nextTablesResponse?.duLieu) ? nextTablesResponse.duLieu.map(chuanHoaBanChoNoiBo).filter(Boolean) : [])
      setDanhSachDanhGia(Array.isArray(nextReviewsResponse?.duLieu) ? nextReviewsResponse.duLieu : [])

      if (ketQuaTaiKhoan.status === 'rejected') {
        const loiTaiKhoan = ketQuaTaiKhoan.reason?.message || ''
        const laLoiPhanQuyen = ketQuaTaiKhoan.reason?.status === 403 || loiTaiKhoan.toLowerCase().includes('quyen')

        if (!laLoiPhanQuyen) {
          throw ketQuaTaiKhoan.reason
        }
      }
    } catch (error) {
      setLoiTaiDuLieu(error?.message || 'Không thể tải dữ liệu nội bộ từ máy chủ.')
      throw error
    } finally {
      setDangTaiDuLieu(false)
      setDaTaiDuLieuLanDau(true)
    }
  }, [laQuanLy])

  useEffect(() => {
    if (daKhoiTaoLanDauRef.current) {
      return undefined
    }
    daKhoiTaoLanDauRef.current = true

    taiLaiDuLieu()

    const xuLyLuuTru = () => {
      taiLaiDuLieu()
    }

    window.addEventListener('storage', xuLyLuuTru)
    window.addEventListener(SU_KIEN_THAY_DOI_DU_LIEU_DAT_BAN, taiLaiDuLieu)

    return () => {
      window.removeEventListener('storage', xuLyLuuTru)
      window.removeEventListener(SU_KIEN_THAY_DOI_DU_LIEU_DAT_BAN, taiLaiDuLieu)
    }
  }, [taiLaiDuLieu])

  const hangDoiDatBan = useMemo(
    () => sapXepDatBanChoVanHanh(danhSachDatBan.filter((booking) => !TRANG_THAI_LICH_SU.has(chuanHoaTrangThaiDatBan(booking.status))), new Date()),
    [danhSachDatBan],
  )
  const danhSachDatBanDangHoatDong = useMemo(
    () => hangDoiDatBan.filter((booking) => CAC_TRANG_THAI_DAT_BAN_DANG_HOAT_DONG.has(chuanHoaTrangThaiDatBan(booking.status))),
    [hangDoiDatBan],
  )
  const danhSachDatBanDangMo = useMemo(
    () => hangDoiDatBan.filter((booking) => CAC_TRANG_THAI_DAT_BAN_DANG_MO.has(chuanHoaTrangThaiDatBan(booking.status)) || CAC_TRANG_THAI_DAT_BAN_DANG_MO.has(booking.status)),
    [hangDoiDatBan],
  )
  const danhSachDatBanDaXacNhan = useMemo(
    () => danhSachDatBanDangHoatDong.filter((booking) => CAC_TRANG_THAI_DAT_BAN_DA_XAC_NHAN.has(chuanHoaTrangThaiDatBan(booking.status))),
    [danhSachDatBanDangHoatDong],
  )
  const danhSachDatBanChoXuLy = useMemo(
    () => hangDoiDatBan.filter((booking) => CAC_TRANG_THAI_DAT_BAN_CHO_XAC_NHAN.has(chuanHoaTrangThaiDatBan(booking.status))),
    [hangDoiDatBan],
  )
  const danhSachDatBanSapDienRa = useMemo(() => {
    const now = new Date()
    return danhSachDatBanDangHoatDong.filter((booking) => laDatBanSapDienRa(booking, now))
  }, [danhSachDatBanDangHoatDong])
  const soLuongDatBanDaCheckIn = useMemo(
    () => danhSachDatBan.filter((booking) => laDatBanDaCheckIn(booking)).length,
    [danhSachDatBan],
  )
  const tomTatBan = useMemo(() => layTomTatBan(danhSachBan), [danhSachBan])
  const tomTatTonKhoBan = useMemo(() => layTomTatTonKhoBan(danhSachBan), [danhSachBan])
  const danhSachDatBanChuaGanBan = useMemo(() => layDatBanChuaGanBan(danhSachDatBanDangHoatDong), [danhSachDatBanDangHoatDong])
  const tomTatDonHang = useMemo(() => layTomTatDonHang(danhSachDonHang), [danhSachDonHang])
  const danhSachDonHangDangMo = useMemo(
    () => sapXepDonHangChoVanHanh(danhSachDonHang).filter((order) => laySacThaiDonHang(order.status) === 'warning'),
    [danhSachDonHang],
  )
  const danhSachDonHangDaSapXep = useMemo(() => sapXepDonHangChoVanHanh(danhSachDonHang), [danhSachDonHang])
  const tomTatTaiKhoan = useMemo(() => layTomTatTaiKhoan(danhSachTaiKhoan), [danhSachTaiKhoan])
  const danhSachDanhGiaChoDuyet = useMemo(
    () => danhSachDanhGia.filter((danhGia) => danhGia.trangThai === 'Pending'),
    [danhSachDanhGia],
  )

  const xuLyTaoDatBanNoiBo = useCallback(async (duLieuGuiDi) => {
    const ketQua = await taoDatBanNoiBo(duLieuGuiDi)
    if (ketQua?.success) await taiLaiDuLieu()
    return ketQua
  }, [taoDatBanNoiBo, taiLaiDuLieu])

  const xuLyCapNhatDatBanNoiBo = useCallback(async (bookingId, duLieuGuiDi) => {
    const ketQua = await capNhatDatBanNoiBo(bookingId, duLieuGuiDi)
    if (ketQua?.success) await taiLaiDuLieu()
    return ketQua
  }, [capNhatDatBanNoiBo, taiLaiDuLieu])

  const xuLyGanBan = useCallback(async (bookingId, danhSachIdBan) => {
    const ketQua = await ganBanChoDatBan(bookingId, danhSachIdBan)
    if (ketQua?.success) await taiLaiDuLieu()
    return ketQua
  }, [ganBanChoDatBan, taiLaiDuLieu])

  const xuLyCapNhatTrangThaiDatBan = useCallback(async (bookingId, trangThai, thongDiepLoiMacDinh) => {
    const ketQua = await capNhatTrangThaiDatBan(bookingId, trangThai, thongDiepLoiMacDinh)
    if (ketQua?.success) await taiLaiDuLieu()
    return ketQua
  }, [capNhatTrangThaiDatBan, taiLaiDuLieu])

  const xuLyCheckIn = useCallback(async (bookingId) => {
    const ketQua = await danhDauDaCheckIn(bookingId)
    if (ketQua?.success) await taiLaiDuLieu()
    return ketQua
  }, [danhDauDaCheckIn, taiLaiDuLieu])

  const xuLyHoanThanh = useCallback(async (bookingId) => {
    const ketQua = await danhDauHoanThanh(bookingId)
    if (ketQua?.success) await taiLaiDuLieu()
    return ketQua
  }, [danhDauHoanThanh, taiLaiDuLieu])

  const xuLyKhachKhongDen = useCallback(async (bookingId) => {
    const ketQua = await danhDauKhongDen(bookingId)
    if (ketQua?.success) await taiLaiDuLieu()
    return ketQua
  }, [danhDauKhongDen, taiLaiDuLieu])

  const xuLyDanhDauBanBan = useCallback(async (tableId) => {
    await capNhatTrangThaiBanApi(tableId, 'BAO_TRI')
    await taiLaiDuLieu()
  }, [taiLaiDuLieu])

  const xuLyDanhDauBanSanSang = useCallback(async (tableId) => {
    await capNhatTrangThaiBanApi(tableId, 'TRONG')
    await taiLaiDuLieu()
  }, [taiLaiDuLieu])

  const layChiTietDonHang = useCallback(async (orderId) => {
    const ketQua = await layChiTietDonHangApi(orderId)
    return ketQua?.duLieu || null
  }, [])

  const xuLyCapNhatTrangThaiDonHang = useCallback(async (orderId, status) => {
    const ketQua = await capNhatTrangThaiDonHangApi(orderId, status)
    if (ketQua?.duLieu) {
      await taiLaiDuLieu()
    }
    return ketQua
  }, [taiLaiDuLieu])

  const xuLyDuyetDanhGia = useCallback(async (maDanhGia, trangThai, phanHoi = '') => {
    const ketQua = await duyetDanhGiaApi(maDanhGia, { trangThai, phanHoi })
    if (ketQua?.duLieu) {
      await taiLaiDuLieu()
    }
    return ketQua
  }, [taiLaiDuLieu])

  const xuLyTaoNguoiDungNoiBo = useCallback(async (duLieuGuiDi) => {
    const ketQua = await taoNguoiDungNoiBoApi(duLieuGuiDi)
    if (ketQua?.duLieu) {
      await taiLaiDuLieu()
    }
    return ketQua
  }, [taiLaiDuLieu])

  const xuLyCapNhatNguoiDungNoiBo = useCallback(async (maND, duLieuGuiDi) => {
    const ketQua = await capNhatNguoiDungNoiBoApi(maND, duLieuGuiDi)
    if (ketQua?.duLieu) {
      await taiLaiDuLieu()
    }
    return ketQua
  }, [taiLaiDuLieu])

  const xuLyXoaNguoiDungNoiBo = useCallback(async (maND) => {
    const ketQua = await xoaNguoiDungNoiBoApi(maND)
    await taiLaiDuLieu()
    return ketQua
  }, [taiLaiDuLieu])

  return {
    tomTatTaiKhoan,
    danhSachDatBanDangHoatDong,
    danhSachDatBanDangMo,
    hangDoiDatBan,
    soLuongDatBanDaCheckIn,
    danhSachDatBanDaXacNhan,
    danhSachBan,
    danhSachDanhGia,
    danhSachDanhGiaChoDuyet,
    danhSachDatBan,
    danhSachDonHang,
    danhSachMon,
    danhSachTaiKhoan,
    dangTaiDuLieu,
    daTaiDuLieuLanDau,
    loiTaiDuLieu,
    xuLyGanBan,
    xuLyCapNhatTrangThaiDatBan,
    xuLyCheckIn,
    xuLyHoanThanh,
    xuLyTaoDatBanNoiBo,
    xuLyDanhDauBanBan,
    xuLyDanhDauBanSanSang,
    xuLyKhachKhongDen,
    xuLyCapNhatDatBanNoiBo,
    layBanPhuHopChoDatBan,
    layChiTietDonHang,
    xuLyCapNhatTrangThaiDonHang,
    xuLyDuyetDanhGia,
    xuLyTaoNguoiDungNoiBo,
    xuLyCapNhatNguoiDungNoiBo,
    xuLyXoaNguoiDungNoiBo,
    danhSachDonHangDangMo,
    tomTatDonHang,
    danhSachDatBanChoXuLy,
    danhSachDonHangDaSapXep,
    tomTatTonKhoBan,
    tomTatBan,
    taiLaiDanhSachMon,
    taiLaiDuLieu,
    danhSachDatBanSapDienRa,
    danhSachDatBanChuaGanBan,
  }
}
