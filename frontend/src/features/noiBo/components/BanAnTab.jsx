import { useMemo, useState } from 'react'
import {
  CheckOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Badge, Button, Drawer, Empty, Tabs, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { layNhanChoNgoi, laySacThaiDonHang } from '../dinhDang'
import { chuanHoaTrangThaiBan } from '../../../constants/trangThaiBan'

const NHAN_TRANG_THAI_BAN = {
  AVAILABLE: 'Sẵn sàng',
  HELD: 'Đã đặt',
  OCCUPIED: 'Đang phục vụ',
  DIRTY: 'Bảo trì',
}

const SAC_THAI_TRANG_THAI_BAN = {
  AVAILABLE: 'success',
  HELD: 'warning',
  OCCUPIED: 'danger',
  DIRTY: 'neutral',
}

const KIEU_TRANG_THAI_BAN = {
  AVAILABLE: {
    card: 'border-emerald-100 bg-white text-slate-900',
    dot: 'bg-emerald-500',
    accent: 'text-emerald-700',
    subtle: 'text-emerald-600',
    surface: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    badgeColor: '#10b981',
    drawerSurface: 'border-emerald-100 bg-emerald-50/70',
  },
  HELD: {
    card: 'border-orange-200 bg-orange-50 text-orange-950',
    dot: 'bg-orange-500',
    accent: 'text-orange-700',
    subtle: 'text-orange-600',
    surface: 'border-orange-100 bg-orange-100/80 text-orange-700',
    badgeColor: '#f97316',
    drawerSurface: 'border-orange-100 bg-orange-50/80',
  },
  OCCUPIED: {
    card: 'border-rose-200 bg-rose-50 text-rose-950',
    dot: 'bg-rose-500',
    accent: 'text-rose-700',
    subtle: 'text-rose-600',
    surface: 'border-rose-100 bg-rose-100/80 text-rose-700',
    badgeColor: '#f43f5e',
    drawerSurface: 'border-rose-100 bg-rose-50/80',
  },
  DIRTY: {
    card: 'border-slate-200 bg-slate-100 text-slate-700',
    dot: 'bg-slate-400',
    accent: 'text-slate-600',
    subtle: 'text-slate-500',
    surface: 'border-slate-200 bg-white/70 text-slate-600',
    badgeColor: '#94a3b8',
    drawerSurface: 'border-slate-200 bg-slate-50/90',
  },
}

const kieuNutDrawer = {
  primary: {
    background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    borderColor: '#f97316',
    boxShadow: '0 12px 24px rgba(249, 115, 22, 0.2)',
    color: '#fff',
  },
  success: {
    background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
    borderColor: '#1e8449',
    boxShadow: '0 12px 24px rgba(39, 174, 96, 0.18)',
    color: '#fff',
  },
  danger: {
    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    borderColor: '#c0392b',
    boxShadow: '0 12px 24px rgba(192, 57, 43, 0.2)',
    color: '#fff',
  },
}

const laySoHangMucTieu = (soLuongBan) => {
  if (soLuongBan >= 10) return 3
  if (soLuongBan >= 5) return 2
  return 1
}

const laySoCotKhuVuc = (soLuongBan) => {
  if (soLuongBan <= 0) return 1

  const soHangMucTieu = laySoHangMucTieu(soLuongBan)
  return Math.max(1, Math.ceil(soLuongBan / soHangMucTieu))
}

const layLopChamKhuVuc = (tyLeLapDay) => (tyLeLapDay >= 1 ? 'bg-orange-500' : 'bg-slate-300')

const layLopHinhDangBan = (sucChua) => {
  if (sucChua <= 2) {
    return {
      khung: 'rounded-[999px] min-h-[138px]',
      matBan: 'rounded-[999px] px-5 py-4',
      vienTrangTri: 'rounded-[999px]',
    }
  }

  if (sucChua <= 4) {
    return {
      khung: 'rounded-[34px] min-h-[148px]',
      matBan: 'rounded-[30px] px-5 py-4',
      vienTrangTri: 'rounded-[30px]',
    }
  }

  if (sucChua <= 6) {
    return {
      khung: 'rounded-[999px] min-h-[150px]',
      matBan: 'rounded-[999px] px-6 py-4',
      vienTrangTri: 'rounded-[999px]',
    }
  }

  return {
    khung: 'rounded-[32px] min-h-[156px]',
    matBan: 'rounded-[28px] px-6 py-4',
    vienTrangTri: 'rounded-[28px]',
  }
}

const dinhDangGioDatBan = (datBan) => {
  if (!datBan?.time) return ''

  const normalized = String(datBan.time).trim()
  if (/^\d{2}:\d{2}$/.test(normalized)) return normalized
  if (/^\d{2}:\d{2}:\d{2}$/.test(normalized)) return normalized.slice(0, 5)

  return ''
}

const chuanHoaTrangThaiChoPos = (trangThai = '') => {
  const chuanHoa = chuanHoaTrangThaiBan(trangThai)

  if (chuanHoa === 'TRONG') return 'AVAILABLE'
  if (chuanHoa === 'DA_DAT') return 'HELD'
  if (chuanHoa === 'CO_KHACH') return 'OCCUPIED'
  if (chuanHoa === 'DANG_DON') return 'DIRTY'
  if (chuanHoa === 'BAO_TRI') return 'DIRTY'

  return 'DIRTY'
}

const taoMoHinhHienThiBan = (table, datBanTheoId) => {
  const datBan = table.activeBookingId ? datBanTheoId.get(String(table.activeBookingId)) : null
  const status = chuanHoaTrangThaiChoPos(table.status)
  const kieuTrangThai = KIEU_TRANG_THAI_BAN[status] || KIEU_TRANG_THAI_BAN.DIRTY

  return {
    ...table,
    datBan,
    status,
    displayName: table.name || table.code || 'Bàn',
    tableCode: table.code || table.maBan || '',
    tableNumber: Number(table.tableNumber ?? table.soBan ?? 0),
    sucChua: Number(table.sucChua ?? table.capacity ?? 0),
    areaLabel: layNhanChoNgoi(table.areaId),
    statusLabel: NHAN_TRANG_THAI_BAN[status] || table.status,
    statusTone: SAC_THAI_TRANG_THAI_BAN[status] || 'neutral',
    kieuTrangThai,
    bookingCode: datBan?.bookingCode || table.activeBookingCode || '',
    timeText: status === 'HELD' || status === 'OCCUPIED' ? dinhDangGioDatBan(datBan) : '',
  }
}

function BanAnTabCoDien({ phamViLabel, tomTatBan, tables, tomTatTonKhoBan, xuLyDanhDauBanSanSang, xuLyDanhDauBanBan }) {
  return (
    <article className="ho-so-card">
      <div className="van-hanh-board-head">
        <h2>Tình trạng bàn ăn</h2>
        <span>{phamViLabel}</span>
      </div>

      <div className="noi-bo-ban-overview-grid">
        <article className="van-hanh-stat-card noi-bo-ban-card">
          <span>Sẵn sàng</span>
          <strong>{tomTatTonKhoBan.available}</strong>
          <p className="noi-bo-ban-note">Bàn có thể nhận khách ngay.</p>
        </article>
        <article className="van-hanh-stat-card noi-bo-ban-card">
          <span>Giữ chỗ</span>
          <strong>{tomTatTonKhoBan.held}</strong>
          <p className="noi-bo-ban-note">Đã gán booking nhưng chưa check-in.</p>
        </article>
        <article className="van-hanh-stat-card noi-bo-ban-card">
          <span>Đang phục vụ</span>
          <strong>{tomTatTonKhoBan.occupied}</strong>
          <p className="noi-bo-ban-note">Đang có khách tại bàn.</p>
        </article>
        <article className="van-hanh-stat-card noi-bo-ban-card">
          <span>Đang dọn</span>
          <strong>{tomTatTonKhoBan.dirty}</strong>
          <p className="noi-bo-ban-note">Cần dọn trước khi nhận khách mới.</p>
        </article>
      </div>

      <div className="noi-bo-ban-grid noi-bo-list-top-gap">
        {tomTatBan.map((area) => (
          <article key={area.id} className="van-hanh-stat-card noi-bo-ban-card">
            <span>{area.name}</span>
            <strong>{area.available}/{area.total}</strong>
            <p className="noi-bo-ban-note">
              {area.occupied} đang phục vụ · {area.held} giữ chỗ · {area.dirty} đang dọn.
            </p>
          </article>
        ))}
      </div>

      <div className="ho-so-list noi-bo-list-top-gap">
        {tables.map((table) => (
          <div key={table.id} className="ho-so-list-item">
            <div className="ho-so-list-top">
              <strong>{table.code}</strong>
              <span className={`nhan-trang-thai tone-${SAC_THAI_TRANG_THAI_BAN[table.status] || 'neutral'}`}>
                {NHAN_TRANG_THAI_BAN[table.status] || table.status}
              </span>
            </div>

            <div className="ho-so-list-meta noi-bo-don-hang-meta">
              <p><span>Khu vực</span><strong>{layNhanChoNgoi(table.areaId)}</strong></p>
              <p><span>Sức chứa</span><strong>{table.sucChua} khách</strong></p>
              <p><span>Booking hiện tại</span><strong>{table.activeBookingCode || 'Trống'}</strong></p>
              <p><span>Ghi chú</span><strong>{table.note || '--'}</strong></p>
            </div>

            <div className="noi-bo-mon-item-actions">
              {table.status === 'DANG_DON' ? (
                <button type="button" className="noi-bo-quick-btn noi-bo-quick-nut-chinh" onClick={() => xuLyDanhDauBanSanSang(table.id)}>
                  Sẵn sàng lại
                </button>
              ) : (
                <button type="button" className="noi-bo-quick-btn" onClick={() => xuLyDanhDauBanBan(table.id)}>
                  Đánh dấu dọn bàn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function BanAnTabPos({
  phamViLabel,
  tomTatBan,
  tables,
  bookings,
  orders,
  xuLyCheckIn,
  xuLyDanhDauBanSanSang,
  xuLyHoanThanh,
}) {
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  const [idBanDangChon, setIdBanDangChon] = useState(null)
  const [dangGuiHanhDong, setDangGuiHanhDong] = useState(false)

  const datBanTheoId = useMemo(
    () => new Map((bookings || []).map((datBan) => [String(datBan.id), datBan])),
    [bookings],
  )

  const donHangTheoMaBan = useMemo(
    () => new Map(
      (orders || [])
        .filter((order) => laySacThaiDonHang(order?.status) === 'warning')
        .map((order) => {
          const maBan = String(order.tableCode || order.maBan || order.MaBan || order.tableNumber || '').trim().toUpperCase()
          return [maBan, order]
        })
        .filter(([maBan]) => maBan),
    ),
    [orders],
  )

  const moHinhHienThiBan = useMemo(
    () => tables.map((table) => taoMoHinhHienThiBan(table, datBanTheoId)),
    [datBanTheoId, tables],
  )

  const tomTatBanDangPos = useMemo(() => ({
    total: moHinhHienThiBan.length,
    available: moHinhHienThiBan.filter((table) => table.status === 'AVAILABLE').length,
    held: moHinhHienThiBan.filter((table) => table.status === 'HELD').length,
    occupied: moHinhHienThiBan.filter((table) => table.status === 'OCCUPIED').length,
    dirty: moHinhHienThiBan.filter((table) => table.status === 'DIRTY').length,
  }), [moHinhHienThiBan])

  const banDangChon = useMemo(
    () => moHinhHienThiBan.find((table) => table.id === idBanDangChon) || null,
    [idBanDangChon, moHinhHienThiBan],
  )

  const donHangDangChon = useMemo(() => {
    if (!banDangChon) return null
    return (
      donHangTheoMaBan.get(String(banDangChon.tableCode || banDangChon.code || banDangChon.maBan || '').trim().toUpperCase()) ||
      null
    )
  }, [donHangTheoMaBan, banDangChon])

  const danhSachTomTat = [
    { key: 'total', label: 'Tổng bàn', value: tomTatBanDangPos.total, dot: 'bg-slate-400' },
    { key: 'available', label: 'Trống', value: tomTatBanDangPos.available, dot: KIEU_TRANG_THAI_BAN.AVAILABLE.dot },
    { key: 'occupied', label: 'Đang phục vụ', value: tomTatBanDangPos.occupied, dot: KIEU_TRANG_THAI_BAN.OCCUPIED.dot },
    { key: 'held', label: 'Đã đặt', value: tomTatBanDangPos.held, dot: KIEU_TRANG_THAI_BAN.HELD.dot },
    { key: 'dirty', label: 'Bảo trì', value: tomTatBanDangPos.dirty, dot: KIEU_TRANG_THAI_BAN.DIRTY.dot },
  ]

  const xuLyMoDrawer = (idBan) => setIdBanDangChon(idBan)
  const xuLyDongDrawer = () => setIdBanDangChon(null)

  const xuLyDanhDauSanSang = async (event, idBan) => {
    event.stopPropagation()
    await xuLyDanhDauBanSanSang?.(idBan)
  }

  const thucThiHanhDongBan = async (hanhDong) => {
    if (!banDangChon || dangGuiHanhDong || !hanhDong) return

    if (hanhDong.type === 'navigate-orders') {
      navigate('/noi-bo/don-hang')
      xuLyDongDrawer()
      return
    }

    if (hanhDong.type === 'walk-in') {
      messageApi.info('Dùng tab Đặt bàn để tạo booking walk-in cho bàn này.')
      xuLyDongDrawer()
      navigate('/noi-bo/dat-ban')
      return
    }

    setDangGuiHanhDong(true)

    try {
      if (hanhDong.type === 'check-in') {
        if (!banDangChon.datBan?.id) {
          messageApi.warning('Bàn này chưa có booking để check-in.')
          return
        }

        const ketQua = await xuLyCheckIn?.(banDangChon.datBan.id)
        if (ketQua?.success) {
          messageApi.success('Đã check-in booking cho bàn này.')
          xuLyDongDrawer()
          return
        }

        messageApi.error(ketQua?.error || 'Không thể check-in booking.')
        return
      }

      if (hanhDong.type === 'complete-booking') {
        if (!banDangChon.datBan?.id) {
          messageApi.warning('Bàn này chưa có booking đang phục vụ để giải phóng.')
          return
        }

        const ketQua = await xuLyHoanThanh?.(banDangChon.datBan.id)
        if (ketQua?.success) {
          messageApi.success('Đã giải phóng bàn thành công.')
          xuLyDongDrawer()
          return
        }

        messageApi.error(ketQua?.error || 'Không thể giải phóng bàn.')
        return
      }

      if (hanhDong.type === 'mark-ready') {
        await xuLyDanhDauBanSanSang?.(banDangChon.id)
        messageApi.success('Đã đánh dấu bàn sẵn sàng.')
        xuLyDongDrawer()
      }
    } finally {
      setDangGuiHanhDong(false)
    }
  }

  const danhSachHanhDongBanDangChon = useMemo(() => {
    if (!banDangChon) return []

    if (banDangChon.status === 'AVAILABLE') {
      return [
        {
          key: 'walk-in',
          type: 'walk-in',
          label: 'Nhận walk-in',
          icon: <ShoppingCartOutlined />,
          style: kieuNutDrawer.primary,
          typeButton: 'primary',
        },
      ]
    }

    if (banDangChon.status === 'HELD') {
      return [
        {
          key: 'check-in',
          type: 'check-in',
          label: 'Check-in',
          icon: <CheckOutlined />,
          style: kieuNutDrawer.success,
          typeButton: 'primary',
          disabled: !banDangChon.datBan?.id,
        },
      ]
    }

    if (banDangChon.status === 'OCCUPIED') {
      return [
        {
          key: 'view-order',
          type: 'navigate-orders',
          label: donHangDangChon ? `Xem đơn #${donHangDangChon.orderCode || donHangDangChon.code || donHangDangChon.id}` : 'Xem đơn',
          icon: <EyeOutlined />,
          typeButton: 'default',
        },
        {
          key: 'free-table',
          type: 'complete-booking',
          label: 'Giải phóng bàn',
          icon: <CreditCardOutlined />,
          style: kieuNutDrawer.danger,
          typeButton: 'primary',
          disabled: !banDangChon.datBan?.id,
        },
      ]
    }

    if (banDangChon.status === 'DIRTY') {
      return [
        {
          key: 'mark-ready',
          type: 'mark-ready',
          label: 'Đánh dấu đã dọn',
          icon: <CheckOutlined />,
          style: kieuNutDrawer.success,
          typeButton: 'primary',
        },
      ]
    }

    return []
  }, [donHangDangChon, banDangChon])

  const danhSachTab = tomTatBan.map((area) => {
    const danhSachBanTheoKhuVuc = moHinhHienThiBan.filter((table) => table.areaId === area.id)
    const soCotKhuVuc = laySoCotKhuVuc(danhSachBanTheoKhuVuc.length)

    return {
      key: area.id,
      label: (
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${layLopChamKhuVuc(area.tyLeLapDay)}`} />
          <span className="font-semibold text-slate-800">{area.name}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            {area.available}/{area.total}
          </span>
        </div>
      ),
      children: danhSachBanTheoKhuVuc.length ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${soCotKhuVuc}, minmax(126px, 1fr))` }}>
          {danhSachBanTheoKhuVuc.map((table) => {
              const lopHinhDangBan = layLopHinhDangBan(table.sucChua)

              return (
                <div
                  key={table.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => xuLyMoDrawer(table.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && xuLyMoDrawer(table.id)}
                  className={`group relative flex flex-col justify-center overflow-hidden border border-white/70 bg-gradient-to-br from-white via-white to-slate-50/90 p-3 text-left shadow-[0_18px_32px_rgba(148,163,184,0.14)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 ${lopHinhDangBan.khung} ${table.kieuTrangThai.card}`}
                >
                  <span className={`pointer-events-none absolute inset-[9px] border border-white/80 opacity-80 ${lopHinhDangBan.vienTrangTri}`} />

                  <div className={`relative flex h-full flex-col justify-between border border-black/5 bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm ${lopHinhDangBan.matBan}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${table.kieuTrangThai.dot}`} />

                      <div className="flex items-center gap-2">
                        {table.status === 'DIRTY' && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => xuLyDanhDauSanSang(event, table.id)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && xuLyDanhDauSanSang(event, table.id)}
                            aria-label={`Đánh dấu ${table.displayName} sẵn sàng lại`}
                            className="!h-7 !w-7 !border !border-emerald-200 !bg-emerald-50 !text-emerald-700 flex items-center justify-center rounded-full cursor-pointer"
                          >
                            <CheckOutlined />
                          </span>
                        )}

                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold shadow-sm ${table.kieuTrangThai.surface}`}>
                          <UserOutlined className="text-[10px]" />
                          {table.sucChua}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
                      <div className="text-[1.15rem] font-black leading-tight text-inherit md:text-[1.3rem]">
                        {table.displayName}
                      </div>
                      <div className={`mt-1 text-[10px] font-semibold ${table.kieuTrangThai.subtle}`}>
                        {[table.tableCode, table.tableNumber ? `Số ${table.tableNumber}` : '', `${table.sucChua} khách`].filter(Boolean).join(' · ')}
                      </div>
                      {table.bookingCode ? (
                        <div className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${table.kieuTrangThai.subtle}`}>
                          {table.bookingCode}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-end justify-between gap-2 text-[11px]">
                      <span className={`font-semibold ${table.kieuTrangThai.accent}`}>{table.statusLabel}</span>
                      {table.timeText ? (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-semibold shadow-sm ${table.kieuTrangThai.surface}`}>
                          <ClockCircleOutlined className="text-[10px]" />
                          {table.timeText}
                        </span>
                      ) : <span />}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bàn trong khu vực này" />
        </div>
      ),
    }
  })

  return (
    <>
      {contextHolder}
      <article className="rounded-none border border-[#E5E0DB] bg-white/95 p-4 shadow-[0_18px_40px_rgba(55,39,28,0.08)] md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">POS floor map</p>
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">Tổng quan sơ đồ bàn</h2>
              <p className="mt-1 mb-0 text-sm text-slate-500">{phamViLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                <span className={`h-2 w-2 rounded-full ${KIEU_TRANG_THAI_BAN.AVAILABLE.dot}`} /> Trống
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                <span className={`h-2 w-2 rounded-full ${KIEU_TRANG_THAI_BAN.HELD.dot}`} /> Đã đặt
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                <span className={`h-2 w-2 rounded-full ${KIEU_TRANG_THAI_BAN.OCCUPIED.dot}`} /> Đang phục vụ
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                <span className={`h-2 w-2 rounded-full ${KIEU_TRANG_THAI_BAN.DIRTY.dot}`} /> Bảo trì
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {danhSachTomTat.map((item) => (
              <div key={item.key} className="inline-flex min-w-[116px] items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 shadow-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                <div>
                  <div className="text-lg font-bold leading-none text-slate-900">{item.value}</div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-none border border-slate-200 bg-[#FCFCFD] px-2 py-3 md:px-3">
            <Tabs items={danhSachTab} animated size="middle" className="noi-bo-pos-table-tabs" />
          </div>
        </div>
      </article>

      <Drawer
        open={Boolean(banDangChon)}
        onClose={xuLyDongDrawer}
        size={420}
        destroyOnClose
        title={banDangChon ? (
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Chi tiết bàn</div>
              <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{banDangChon.displayName}</div>
            </div>
            <Badge
              color={banDangChon.kieuTrangThai.badgeColor}
              text={<span className="text-sm font-semibold text-slate-600">{banDangChon.statusLabel}</span>}
            />
          </div>
        ) : null}
      >
        {banDangChon ? (
          <div className="flex flex-col gap-4">
            <div className={`rounded-[22px] border p-4 shadow-sm ${banDangChon.kieuTrangThai.drawerSurface}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Khu vực</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{banDangChon.areaLabel}</div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${banDangChon.kieuTrangThai.surface}`}>
                  <UserOutlined />
                  {banDangChon.sucChua} ghế
                </span>
              </div>

              {banDangChon.bookingCode || banDangChon.timeText ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Booking</div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">{banDangChon.bookingCode || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Giờ vào</div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">{banDangChon.timeText || '—'}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Sức chứa</div>
                <div className="mt-2 text-base font-semibold text-slate-900">{banDangChon.sucChua} khách</div>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Khu vực</div>
                <div className="mt-2 text-base font-semibold text-slate-900">{banDangChon.areaLabel || '--'}</div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Khối hành động</div>
              <div className="mt-1 text-sm text-slate-500">
                {banDangChon.status === 'AVAILABLE' ? 'Nhận khách walk-in nhanh cho bàn đang trống.' : null}
                {banDangChon.status === 'HELD' ? 'Check-in booking đã gán cho bàn này.' : null}
                {banDangChon.status === 'OCCUPIED' ? 'Mở luồng đơn hàng hiện tại hoặc giải phóng bàn sau khi phục vụ xong.' : null}
                {banDangChon.status === 'DIRTY' ? 'Bàn đang ở trạng thái bảo trì, chỉ chuyển về sẵn sàng khi đã xử lý xong.' : null}
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {danhSachHanhDongBanDangChon.map((hanhDong) => (
                  <Button
                    key={hanhDong.key}
                    type={hanhDong.typeButton || 'default'}
                    size="large"
                    block
                    icon={hanhDong.icon}
                    style={hanhDong.style}
                    disabled={hanhDong.disabled || dangGuiHanhDong}
                    loading={dangGuiHanhDong && hanhDong.type !== 'navigate-orders' && hanhDong.type !== 'walk-in'}
                    onClick={() => thucThiHanhDongBan(hanhDong)}
                  >
                    {hanhDong.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  )
}

function BanAnTab(props) {
  const { variant = 'legacy' } = props

  if (variant === 'pos') {
    return <BanAnTabPos {...props} />
  }

  return <BanAnTabCoDien {...props} />
}

export default BanAnTab
