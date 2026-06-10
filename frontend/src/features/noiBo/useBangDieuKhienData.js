import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CAC_TRANG_THAI_DAT_BAN_DANG_MO, laDatBanSapGanBan } from './thongKeNoiBo'

const taoDuLieuBangDieuKhien = (duLieuNoiBo = {}) => {
  const coDuLieuDoanhThu = Array.isArray(duLieuNoiBo.doanhThu7Ngay) && duLieuNoiBo.doanhThu7Ngay.length > 0
  const tuNgayMacDinh = duLieuNoiBo.dateRange?.tuNgay || (() => {
    const homNay = new Date()
    homNay.setDate(homNay.getDate() - 6)
    return homNay.toISOString().split('T')[0]
  })()
  const denNgayMacDinh = duLieuNoiBo.dateRange?.denNgay || new Date().toISOString().split('T')[0]

  return {
    stats: {
      todayRevenue: Number(duLieuNoiBo.tongQuan?.tongDoanhThu) || 0,
      weekRevenue: (Array.isArray(duLieuNoiBo.doanhThu7Ngay) ? duLieuNoiBo.doanhThu7Ngay : []).reduce((tong, muc) => tong + (Number(muc?.revenue) || 0), 0),
      openBookings: (duLieuNoiBo.hangDoiDatBan || []).filter((booking) => CAC_TRANG_THAI_DAT_BAN_DANG_MO.has(booking.status)).length,
      servingTables: Number(duLieuNoiBo.tongQuan?.soBanBan) || duLieuNoiBo.tomTatTonKhoBan?.occupied || 0,
    },
    revenue: {
      summary: {
        ...(duLieuNoiBo.tongQuan || {}),
        revenue: Number(duLieuNoiBo.tongQuan?.tongDoanhThu) || 0,
      },
      series: coDuLieuDoanhThu ? duLieuNoiBo.doanhThu7Ngay : [],
      dateRange: {
        tuNgay: tuNgayMacDinh,
        denNgay: denNgayMacDinh,
      },
    },
    urgentTasks: [
      {
        key: 'pending-bookings',
        title: 'Chờ xác nhận',
        value: duLieuNoiBo.danhSachDatBanChoXuLy?.length || 0,
        tone: 'warning',
      },
      {
        key: 'unassigned-bookings',
        title: 'Chưa gán bàn',
        value: (duLieuNoiBo.danhSachDatBanChuaGanBan || []).filter((booking) => laDatBanSapGanBan(booking)).length,
        tone: 'danger',
      },
      {
        key: 'arriving-soon',
        title: 'Khách sắp đến',
        value: duLieuNoiBo.danhSachDatBanSapDienRa?.length || 0,
        tone: 'success',
      },
      {
        key: 'dirty-tables',
        title: 'Bàn cần xử lý',
        value: duLieuNoiBo.tomTatTonKhoBan?.dirty || 0,
        tone: 'danger',
      },
    ],
    bookings: duLieuNoiBo.hangDoiDatBan || [],
    orders: duLieuNoiBo.danhSachDonHangDangMo || [],
    tablePressure: (duLieuNoiBo.tomTatBan || []).map((khuVuc) => ({
      ...khuVuc,
      percent: Math.round((khuVuc.occupancyRate || 0) * 100),
      busyTables: Number(khuVuc.occupied) + Number(khuVuc.held) + Number(khuVuc.dirty),
    })),
  }
}

export const useBangDieuKhienData = (duLieuNoiBo = {}) => {
  const chuKyDuLieu = useMemo(
    () => JSON.stringify({
      bookings: (duLieuNoiBo?.hangDoiDatBan || []).map((datBan) => [
        datBan.id,
        datBan.status,
        datBan.date,
        datBan.time,
        datBan.danhSachMaBanDaGan?.length || 0,
      ]),
      orders: (duLieuNoiBo?.danhSachDonHangDangMo || []).map((donHang) => [
        donHang.id,
        donHang.status,
        donHang.total,
        donHang.orderDate,
      ]),
      tables: (duLieuNoiBo?.tomTatBan || []).map((khuVuc) => [
        khuVuc.id,
        khuVuc.occupied,
        khuVuc.held,
        khuVuc.dirty,
        khuVuc.available,
      ]),
      revenue: (duLieuNoiBo?.doanhThu7Ngay || []).map((mucDoanhThu) => ({
        label: mucDoanhThu.label,
        revenue: mucDoanhThu.revenue,
      })),
      summary: duLieuNoiBo?.tongQuan || {},
    }),
    [
      duLieuNoiBo?.hangDoiDatBan,
      duLieuNoiBo?.danhSachDonHangDangMo,
      duLieuNoiBo?.tomTatBan,
      duLieuNoiBo?.doanhThu7Ngay,
      duLieuNoiBo?.tongQuan,
    ],
  )

  const { data: duLieuBangDieuKhien } = useQuery({
    queryKey: ['noi-bo-bang-dieu-khien', chuKyDuLieu],
    queryFn: async () => taoDuLieuBangDieuKhien(duLieuNoiBo),
    initialData: () => taoDuLieuBangDieuKhien(duLieuNoiBo),
    refetchInterval: 30000,
  })

  return duLieuBangDieuKhien
}
