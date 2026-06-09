import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  CreditCardOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  PrinterOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Badge,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  List,
  Segmented,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd'
import { dinhDangTienTe } from '../../../utils/tienTe'
import { dinhDangNgay } from '../dinhDang'
import { layNhanTrangThaiDonHang, layNhanPhuongThucThanhToan, NHAN_LOAI_DON_HANG } from '../../../utils/donHang'
import { taoTongKetTienDonHang, moCuaSoInHoaDon } from '../../../utils/inHoaDon'

const { TextArea } = Input
const { useBreakpoint } = Grid

const BO_LOC_DON_HANG = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Đang chuẩn bị', statuses: ['DANG_CHUAN_BI'] },
  { key: 'served', label: 'Đang phục vụ', statuses: ['DANG_PHUC_VU'] },
  { key: 'paid', label: 'Đã thanh toán', statuses: ['DA_THANH_TOAN'] },
  { key: 'completed', label: 'Hoàn thành', statuses: ['HOAN_THANH'] },
  { key: 'cancelled', label: 'Đã hủy', statuses: ['DA_HUY'] },
]

const TUY_CHON_TRANG_THAI = [
  { value: 'DANG_CHUAN_BI', label: 'Đang chuẩn bị' },
  { value: 'DANG_PHUC_VU', label: 'Đang phục vụ' },
  { value: 'DA_THANH_TOAN', label: 'Đã thanh toán' },
  { value: 'HOAN_THANH', label: 'Hoàn thành' },
  { value: 'DA_HUY', label: 'Đã hủy' },
]

const KIEU_THE_TRANG_THAI = {
  DANG_CHUAN_BI: { tone: 'preparing', badge: 'badge-preparing', hint: 'Đơn đang được bếp chuẩn bị.' },
  DANG_PHUC_VU: { tone: 'served', badge: 'badge-served', hint: 'Đơn đang phục vụ tại bàn.' },
  DA_THANH_TOAN: { tone: 'paid', badge: 'badge-paid', hint: 'Đơn đã thanh toán, chốt doanh thu.' },
  HOAN_THANH: { tone: 'paid', badge: 'badge-paid', hint: 'Đơn đã hoàn tất, không còn giữ bàn.' },
  DA_HUY: { tone: 'cancelled', badge: 'badge-cancelled', hint: 'Đơn đã hủy, chỉ giữ lại để tra cứu.' },
}

const tinhSoLuongTheoBoLoc = (orders) => BO_LOC_DON_HANG.reduce((acc, filter) => {
  acc[filter.key] = filter.key === 'all'
    ? orders.length
    : orders.filter((order) => filter.statuses.includes(order.status)).length
  return acc
}, {})

const khopBoLocDonHang = (order, filterKey) => {
  if (filterKey === 'all') return true
  const filter = BO_LOC_DON_HANG.find((item) => item.key === filterKey)
  return filter ? filter.statuses.includes(order.status) : true
}

const dinhDangNhanBan = (order) => {
  const maBan = String(order.tableCode || order.maBan || order.MaBan || '').trim()
  const tenBan = String(order.tableName || order.tenBan || order.TenBan || '').trim()
  const soBan = String(order.tableNumber || order.soBan || order.SoBan || '').trim()
  if (maBan && tenBan) return `${maBan} - ${tenBan}`
  if (maBan) return maBan
  if (tenBan) return tenBan
  if (soBan) return `BÀN ${soBan.toUpperCase()}`
  return 'TẠI BÀN'
}

const layNhanLoaiDon = (loaiDon) => NHAN_LOAI_DON_HANG[loaiDon] || 'Tại bàn'

const layMauLoaiDon = () => 'purple'

const dinhDangMaDonHang = (order) => order.orderCode || order.code || `DH-${order.id}`

const layKieuTheTrangThai = (status) => KIEU_THE_TRANG_THAI[status] || KIEU_THE_TRANG_THAI.DANG_CHUAN_BI

const taoCotBangMon = () => [
  {
    title: 'Món',
    dataIndex: 'name',
    key: 'name',
    render: (value, record) => (
      <div className="noi-bo-don-hang-item-name">
        <strong>{value}</strong>
        {record.size ? <span>Size {record.size}</span> : null}
      </div>
    ),
  },
  { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 64, align: 'center' },
  { title: 'Đơn giá', dataIndex: 'price', key: 'price', width: 120, render: (value) => dinhDangTienTe(value) },
  {
    title: 'Thành tiền',
    key: 'lineTotal',
    width: 132,
    render: (_, record) => dinhDangTienTe((Number(record.price) || 0) * (Number(record.quantity) || 0)),
  },
  {
    title: 'Ghi chú',
    dataIndex: 'note',
    key: 'note',
    render: (value) => value || <span className="noi-bo-don-hang-cell-muted">--</span>,
  },
]

function ThanhBoLocDonHang({ boLocDangChon, onFilterChange, counts, visibleCount, totalCount, donChoXuLy }) {
  const manHinh = useBreakpoint()
  const laMobile = manHinh.xs && !manHinh.md

  return (
    <Card>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>Quản lý đơn hàng</Typography.Title>
          <Typography.Text type="secondary">{visibleCount}/{totalCount} đơn hiển thị · {donChoXuLy} đơn cần xử lý ngay</Typography.Text>
        </div>
        <Segmented
          block={laMobile}
          options={BO_LOC_DON_HANG.map((filter) => ({
            label: <Space size={6}><span>{filter.label}</span><Badge count={counts[filter.key] || 0} size="small" /></Space>,
            value: filter.key,
          }))}
          value={boLocDangChon}
          onChange={onFilterChange}
        />
      </Space>
    </Card>
  )
}

function DanhSachTheDonHang({ orders, idDonHangDangChon, onSelectOrder }) {
  if (!orders.length) {
    return (
      <Card>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có đơn hàng phù hợp với bộ lọc hiện tại" />
      </Card>
    )
  }

  return (
    <Card title="Danh sách order">
      <div className="grid gap-2.5">
        {orders.map((order) => {
          const kieuThe = layKieuTheTrangThai(order.status)
          const isSelected = String(idDonHangDangChon) === String(order.id)
          const mauTag = kieuThe.tone === 'cancelled' ? 'red' : kieuThe.tone === 'paid' ? 'green' : kieuThe.tone === 'preparing' ? 'orange' : 'blue'

          return (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              style={{
                cursor: 'pointer',
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                border: isSelected ? '1px solid #f59e0b' : '1px solid #e5e7eb',
                background: isSelected ? '#fff7ed' : '#fff',
              }}
            >
              <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <Typography.Text type="secondary">#{dinhDangMaDonHang(order)}</Typography.Text>
                    <div><Typography.Text strong>{dinhDangNhanBan(order)}</Typography.Text></div>
                  </div>
                  <Space size={4}>
                    <Tag color={layMauLoaiDon(order.loaiDon)}>{layNhanLoaiDon(order.loaiDon)}</Tag>
                    <Tag color={mauTag}>{layNhanTrangThaiDonHang(order.status)}</Tag>
                  </Space>
                </Space>
                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="Khách">{order.customer?.fullName || 'Khách lẻ'}</Descriptions.Item>
                  <Descriptions.Item label="Giờ tạo">{dinhDangNgay(order.orderDate)}</Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">{dinhDangTienTe(order.total)}</Descriptions.Item>
                  <Descriptions.Item label="Thanh toán">{layNhanPhuongThucThanhToan(order.paymentMethod)}</Descriptions.Item>
                </Descriptions>
                <Typography.Text type="secondary">{kieuThe.hint}</Typography.Text>
                {order.note ? <Typography.Text>{order.note}</Typography.Text> : null}
              </Space>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function BangChiTietDonHang({
  order,
  chiTietDonHang,
  dangTaiChiTiet,
  loiChiTiet,
  trangThaiDangSua,
  onStatusChange,
  onSubmit,
  onQuickPay,
  onPrint,
  dangLuuTrangThai,
}) {
  const manHinh = useBreakpoint()
  const laMobile = manHinh.xs && !manHinh.md

  if (!order) {
    return (
      <div className="noi-bo-don-hang-form-shell rounded-[22px] border border-dashed border-slate-200 bg-white/90 p-6 text-center shadow-sm">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chọn một đơn ở cột trái để xem chi tiết" />
      </div>
    )
  }

  const donHangNguon = chiTietDonHang || order
  const items = Array.isArray(donHangNguon.items) ? donHangNguon.items : []
  const kieuThe = layKieuTheTrangThai(order.status)
  const daDoiTrangThai = trangThaiDangSua !== order.status
  const tongKetTien = taoTongKetTienDonHang(donHangNguon)
  const coTheIn = !dangTaiChiTiet && items.length > 0

  return (
    <article className="noi-bo-don-hang-form-shell rounded-[22px] border border-[#E5E0DB] bg-white/95 p-4 shadow-[0_18px_40px_rgba(55,39,28,0.08)] md:p-4.5 xl:sticky xl:top-4 xl:self-start">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Order detail</p>
          <h2 className="m-0 text-[1.2rem] font-semibold tracking-[-0.04em] text-slate-900">{dinhDangNhanBan(order)}</h2>
          <p className="mt-1.5 mb-0 text-xs leading-5 text-slate-500">#{dinhDangMaDonHang(order)} · {kieuThe.hint}</p>
        </div>

        <div className="noi-bo-don-hang-status-control">
          <span className="noi-bo-don-hang-status-control__label">Trạng thái đơn</span>
          <Select size="middle" value={trangThaiDangSua} options={TUY_CHON_TRANG_THAI} onChange={onStatusChange} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <section className="space-y-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3.5">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Thông tin đơn</p>
            <h3 className="m-0 text-sm font-semibold text-slate-900">Khách hàng & thanh toán</h3>
          </div>

          <div className="noi-bo-don-hang-detail-grid">
            <label className="noi-bo-don-hang-detail-field">
              <span><UserOutlined /> Khách hàng</span>
              <Input size="middle" value={donHangNguon.customer?.fullName || 'Khách lẻ'} readOnly />
            </label>
            <label className="noi-bo-don-hang-detail-field">
              <span><FieldTimeOutlined /> Thời gian</span>
              <Input size="middle" value={dinhDangNgay(donHangNguon.orderDate)} readOnly />
            </label>
            <label className="noi-bo-don-hang-detail-field noi-bo-don-hang-detail-field--wide">
              <span><CreditCardOutlined /> Thanh toán</span>
              <Input size="middle" value={layNhanPhuongThucThanhToan(donHangNguon.paymentMethod)} readOnly />
            </label>
            <label className="noi-bo-don-hang-detail-field">
              <span>Loại đơn</span>
              <Input size="middle" value={layNhanLoaiDon(donHangNguon.loaiDon)} readOnly />
            </label>
            <div className="noi-bo-don-hang-detail-field noi-bo-don-hang-detail-field--wide">
              <span>Tổng kết thanh toán</span>
              <div className="noi-bo-don-hang-money-summary">
                <div className="noi-bo-don-hang-money-summary__row">
                  <span>Tạm tính</span>
                  <strong>{dinhDangTienTe(tongKetTien.subtotal)}</strong>
                </div>
                <div className="noi-bo-don-hang-money-summary__row">
                  <span>Phí dịch vụ</span>
                  <strong>{dinhDangTienTe(tongKetTien.serviceFee)}</strong>
                </div>
                {tongKetTien.discountAmount > 0 && (
                  <div className="noi-bo-don-hang-money-summary__row">
                    <span>Voucher</span>
                    <strong>-{dinhDangTienTe(tongKetTien.discountAmount)}</strong>
                  </div>
                )}
                <div className="noi-bo-don-hang-money-summary__divider" />
                <div className="noi-bo-don-hang-money-summary__row noi-bo-don-hang-money-summary__row--total">
                  <span>Tổng cộng</span>
                  <strong>{dinhDangTienTe(tongKetTien.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ghi chú</p>
              <h3 className="m-0 text-sm font-semibold text-slate-900">Thông tin bổ sung</h3>
            </div>
          </div>

          <label className="noi-bo-don-hang-detail-field noi-bo-don-hang-detail-field--wide">
            <span><FileTextOutlined /> Ghi chú đơn</span>
            <TextArea size="middle" rows={3} value={donHangNguon.note || 'Không có ghi chú cho đơn này.'} readOnly />
          </label>

          {loiChiTiet && <Alert type="warning" showIcon title={loiChiTiet} />}
        </section>

        <section className="space-y-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3.5">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Danh sách món</p>
            <h3 className="m-0 text-sm font-semibold text-slate-900">Chi tiết phục vụ</h3>
          </div>

          {dangTaiChiTiet ? (
            <div className="noi-bo-don-hang-detail-loading">
              <Spin size="small" />
              <span>Đang tải chi tiết món...</span>
            </div>
          ) : items.length ? (
            <div className="noi-bo-don-hang-items-table">
              <Table
                size="small"
                pagination={false}
                columns={taoCotBangMon()}
                dataSource={items.map((item, index) => ({ ...item, key: item.id || `item-${index + 1}` }))}
                rowKey="key"
                scroll={laMobile ? { x: 720 } : undefined}
              />
            </div>
          ) : (
            <div className="noi-bo-don-hang-items-empty">
              Chưa có dữ liệu món chi tiết cho đơn này.
            </div>
          )}
        </section>

        <div className="noi-bo-don-hang-form-actions">
          <Button type="primary" size="middle" icon={<CheckCircleOutlined />} onClick={onSubmit} loading={dangLuuTrangThai} disabled={!daDoiTrangThai}>
            Cập nhật
          </Button>
          <Button size="middle" icon={<PrinterOutlined />} onClick={onPrint} disabled={!coTheIn || dangLuuTrangThai}>
            In hóa đơn
          </Button>
          <Button size="middle" onClick={onQuickPay} loading={dangLuuTrangThai} disabled={order.status === 'DA_THANH_TOAN' || order.status === 'HOAN_THANH' || order.status === 'DA_HUY'}>
            Thanh toán
          </Button>
        </div>
      </div>
    </article>
  )
}

function DonHangTab({ orders, tomTatDonHang, donChoXuLy, layChiTietDonHang, onUpdateOrderStatus }) {
  const [boLocDangChon, setActiveFilter] = useState('all')
  const [idDonHangDangChon, setSelectedOrderId] = useState(orders[0]?.id ?? null)
  const [chiTietDonHangTheoId, setOrderDetailsById] = useState({})
  const [dangTaiChiTiet, setLoadingDetail] = useState(false)
  const [loiChiTiet, setDetailError] = useState('')
  const [trangThaiDangSua, setFormStatus] = useState('')
  const [dangLuuTrangThai, setSavingStatus] = useState(false)


  const soLuongTheoBoLoc = useMemo(() => tinhSoLuongTheoBoLoc(orders), [orders])

  const danhSachDonDaLoc = useMemo(
    () => orders.filter((order) => khopBoLocDonHang(order, boLocDangChon)),
    [orders, boLocDangChon],
  )

  useEffect(() => {
    if (!danhSachDonDaLoc.length) {
      setSelectedOrderId(null)
      return
    }

    const vanConTonTai = danhSachDonDaLoc.some((order) => String(order.id) === String(idDonHangDangChon))
    if (!vanConTonTai) {
      setSelectedOrderId(danhSachDonDaLoc[0].id)
    }
  }, [danhSachDonDaLoc, idDonHangDangChon])

  const donHangDangChon = useMemo(
    () => danhSachDonDaLoc.find((order) => String(order.id) === String(idDonHangDangChon)) || null,
    [danhSachDonDaLoc, idDonHangDangChon],
  )

  const chiTietDonHang = donHangDangChon ? chiTietDonHangTheoId[donHangDangChon.id] || null : null

  useEffect(() => {
    if (!donHangDangChon) {
      setFormStatus('')
      return
    }

    setFormStatus((chiTietDonHang || donHangDangChon).status)
  }, [donHangDangChon, chiTietDonHang])

  useEffect(() => {
    let daHuy = false

    const taiChiTiet = async () => {
      if (!donHangDangChon || chiTietDonHangTheoId[donHangDangChon.id]) {
        return
      }

      setLoadingDetail(true)
      setDetailError('')

      try {
        const detail = await layChiTietDonHang(donHangDangChon.id)
        if (!daHuy && detail) {
          setOrderDetailsById((current) => ({ ...current, [donHangDangChon.id]: detail }))
        }
      } catch (error) {
        if (!daHuy) {
          setDetailError(error?.message || 'Không thể tải chi tiết đơn hàng.')
        }
      } finally {
        if (!daHuy) {
          setLoadingDetail(false)
        }
      }
    }

    taiChiTiet()

    return () => {
      daHuy = true
    }
  }, [donHangDangChon, chiTietDonHangTheoId, layChiTietDonHang])

  const xuLyInHoaDon = () => {
    const donHangNguon = chiTietDonHang || donHangDangChon
    moCuaSoInHoaDon(donHangNguon, setDetailError)
  }

  const guiCapNhatTrangThai = async (nextStatus) => {
    if (!donHangDangChon || nextStatus === donHangDangChon.status) {
      return
    }

    setSavingStatus(true)
    setDetailError('')

    try {
      const result = await onUpdateOrderStatus(donHangDangChon.id, nextStatus)
      const donHangKeTiep = result?.duLieu || null
      if (donHangKeTiep) {
        setOrderDetailsById((current) => ({
          ...current,
          [donHangDangChon.id]: {
            ...(current[donHangDangChon.id] || donHangDangChon),
            ...donHangKeTiep,
            items: current[donHangDangChon.id]?.items || donHangDangChon.items || [],
          },
        }))
      }
      setFormStatus(nextStatus)
    } catch (error) {
      setDetailError(error?.message || 'Không thể cập nhật trạng thái đơn hàng.')
    } finally {
      setSavingStatus(false)
    }
  }

  const xuLyCapNhatTrangThai = async () => {
    await guiCapNhatTrangThai(trangThaiDangSua)
  }

  const xuLyThanhToanNhanh = async () => {
    await guiCapNhatTrangThai('DA_THANH_TOAN')
  }

  return (
    <section className="space-y-4 noi-bo-page-stack">
      <ThanhBoLocDonHang
        boLocDangChon={boLocDangChon}
        onFilterChange={setActiveFilter}
        counts={soLuongTheoBoLoc}
        visibleCount={danhSachDonDaLoc.length}
        totalCount={tomTatDonHang?.total || orders.length}
        donChoXuLy={donChoXuLy}
      />

      <section className="noi-bo-don-hang-layout">
        <div className="space-y-3 noi-bo-don-hang-list-col">
          <DanhSachTheDonHang orders={danhSachDonDaLoc} idDonHangDangChon={idDonHangDangChon} onSelectOrder={setSelectedOrderId} />
        </div>

        <BangChiTietDonHang
          order={donHangDangChon}
          chiTietDonHang={chiTietDonHang}
          dangTaiChiTiet={dangTaiChiTiet}
          loiChiTiet={loiChiTiet}
          trangThaiDangSua={trangThaiDangSua}
          onStatusChange={setFormStatus}
          onSubmit={xuLyCapNhatTrangThai}
          onQuickPay={xuLyThanhToanNhanh}
          onPrint={xuLyInHoaDon}
          dangLuuTrangThai={dangLuuTrangThai}
        />
      </section>
    </section>
  )
}

export default DonHangTab
