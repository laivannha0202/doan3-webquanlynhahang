import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Row,
  Select,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd'
import { TUY_CHON_KHU_VUC_UU_TIEN } from '../../../constants/khuVucBan'
import { HOST_NHAN_TRANG_THAI_DAT_BAN, CAC_TRANG_THAI_TAO_DAT_BAN_NOI_BO } from '../../datBan/constants/duLieuDatBan'
import {
  dinhDangNgayGio,
  dinhDangSoKhach,
  laySacThaiTrangThaiDatBan,
  layNhanKenhXacNhan,
  layNhanChoNgoi,
} from '../dinhDang'
import {
  coTheGanBanChoDatBan,
  coTheCheckInDatBan,
  coTheHoanThanhDatBan,
  coTheDanhDauKhongDen,
  layGhiChuUuTienDatBan,
  khopTimKiemDatBan,
  canXacNhanThuCong,
  laDatBanDaCheckIn,
} from '../boChon'
import { CAC_TRANG_THAI_DAT_BAN_CHO_XAC_NHAN } from '../hangSo'

const { TextArea } = Input

const KIEU_MUC_FORM_GON = { marginBottom: 12 }

const TRANG_THAI_DAT_BAN = Object.freeze({
  DA_XAC_NHAN: 'DA_XAC_NHAN',
  CHO_XAC_NHAN: 'CHO_XAC_NHAN',
  TU_CHOI_HET_CHO: 'TU_CHOI_HET_CHO',
})

const DEFAULT_FORM_VALUES = {
  name: '',
  phone: '',
  email: '',
  guests: '',
  date: '',
  time: '',
  seatingArea: 'KHONG_UU_TIEN',
  notes: '',
  internalNote: '',
  status: TRANG_THAI_DAT_BAN.DA_XAC_NHAN,
}

const QUICK_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'unassigned', label: 'Chưa gán bàn' },
  { key: 'pending', label: 'Chờ xác nhận' },
]

const PENDING_STATUS_SET = new Set([...CAC_TRANG_THAI_DAT_BAN_CHO_XAC_NHAN])

const CREATE_STATUS_OPTIONS = CAC_TRANG_THAI_TAO_DAT_BAN_NOI_BO.filter((status) => Boolean(HOST_NHAN_TRANG_THAI_DAT_BAN[status]))

const STATUS_TAG_COLORS = {
  success: 'success',
  warning: 'warning',
  danger: 'error',
  neutral: 'processing',
}

const ACTION_CONFIRMATION_COPY = {
  checkIn: {
    title: 'Xác nhận check-in',
    confirmLabel: 'Xác nhận check-in',
    message: 'Booking sẽ chuyển sang trạng thái đang phục vụ và tiếp tục giữ bàn đã gán.',
    description: 'Dùng khi khách đã đến và host muốn chuyển nhanh sang luồng phục vụ.',
    getMessage: (booking) => `Đánh dấu booking ${layMaDatBan(booking)} là đã check-in?`,
  },
  complete: {
    title: 'Xác nhận hoàn thành',
    confirmLabel: 'Hoàn thành booking',
    message: 'Booking sẽ được đóng và các bàn đang giữ sẽ được giải phóng.',
    description: 'Dùng sau khi khách đã dùng bữa xong hoặc quy trình phục vụ đã hoàn tất.',
    getMessage: (booking) => `Hoàn thành booking ${layMaDatBan(booking)} và trả lại bàn về trạng thái sẵn sàng?`,
  },
  noShow: {
    title: 'Xác nhận khách không đến',
    confirmLabel: 'Đánh dấu không đến',
    message: 'Hành động này sẽ đóng booking và trả lại toàn bộ bàn đang giữ.',
    description: 'Chỉ dùng khi đã xác nhận khách không đến hoặc quá thời gian giữ bàn.',
    getMessage: (booking) => `Đánh dấu booking ${layMaDatBan(booking)} là khách không đến?`,
  },
}

const seatingAreaOptions = TUY_CHON_KHU_VUC_UU_TIEN

const getStatusTagColor = (status) => STATUS_TAG_COLORS[laySacThaiTrangThaiDatBan(status)] || 'default'

const layMaDatBan = (booking) => booking.bookingCode || booking.code || `DB-${booking.id}`
const layNguonDatBan = (booking) => {
  const nguonTao = String(booking.nguonTao || booking.source || '').trim().toUpperCase()
  if (nguonTao === 'NOI_BO') return 'Nội bộ'
  if (nguonTao === 'WEB') return 'Khách đặt online'
  return ''
}
const dinhDangBanDaGan = (table) => {
  const maBan = String(table?.code || table?.maBan || table?.id || '').trim()
  const tenBan = String(table?.name || table?.tenBan || '').trim()
  const khuVuc = String(table?.khuVuc || table?.rawAreaText || '').trim()
  return [maBan, tenBan && tenBan !== maBan ? tenBan : '', khuVuc].filter(Boolean).join(' - ')
}
const laBookingChuaGanBan = (booking) => !Array.isArray(booking.danhSachMaBanDaGan) || booking.danhSachMaBanDaGan.length === 0

function laNgayHomNay(value, homNay) {
  if (!value) return false
  const parsed = dayjs(value)
  return parsed.isValid() && parsed.format('YYYY-MM-DD') === homNay
}

function applyQuickFilter(bookings, quickFilter, homNay) {
  if (quickFilter === 'all') return bookings

  if (quickFilter === 'today') {
    return bookings.filter((booking) => laNgayHomNay(booking.date, homNay))
  }

  if (quickFilter === 'unassigned') {
    return bookings.filter((booking) => laBookingChuaGanBan(booking))
  }

  if (quickFilter === 'pending') {
    return bookings.filter((booking) => PENDING_STATUS_SET.has(booking.status))
  }

  return bookings
}

function getQuickFilterCounts(bookings, homNay) {
  const ketQua = {
    all: bookings.length,
    today: 0,
    unassigned: 0,
    pending: 0,
  }

  bookings.forEach((booking) => {
    if (laNgayHomNay(booking.date, homNay)) ketQua.today += 1
    if (laBookingChuaGanBan(booking)) ketQua.unassigned += 1
    if (PENDING_STATUS_SET.has(booking.status)) ketQua.pending += 1
  })

  return ketQua
}

function layThongTinTrangThaiTrong({ tongSoBooking, tuKhoaTimKiem, boLocNhanh }) {
  if (tongSoBooking === 0) {
    return {
      tieuDe: 'Chưa có booking nội bộ nào',
      moTa: 'Hãy tạo booking mới hoặc chờ dữ liệu đồng bộ từ hệ thống.',
    }
  }

  if (tuKhoaTimKiem.trim() && boLocNhanh !== 'all') {
    return {
      tieuDe: 'Chưa có booking phù hợp với bộ lọc hiện tại',
      moTa: 'Hãy thử đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác.',
    }
  }

  if (tuKhoaTimKiem.trim()) {
    return {
      tieuDe: 'Không tìm thấy booking khớp với từ khóa',
      moTa: 'Hãy thử tìm theo mã booking, tên khách hoặc số điện thoại khác.',
    }
  }

  if (boLocNhanh !== 'all') {
    return {
      tieuDe: 'Chưa có booking phù hợp với bộ lọc hiện tại',
      moTa: 'Hãy thử chuyển sang bộ lọc khác để tiếp tục xử lý.',
    }
  }

  return {
    tieuDe: 'Chưa có booking phù hợp',
    moTa: 'Hãy thử điều chỉnh bộ lọc hiện tại.',
  }
}

function DatBanToolbar({
  searchQuery,
  onSearchChange,
  onReset,
  dangChinhSua,
  visibleCount,
  phamViLabel,
  quickFilter,
  onQuickFilterChange,
  filterCounts,
}) {
  return (
    <Card className="dat-ban-noi-bo-toolbar-card">
      <Space orientation="vertical" size={14} style={{ width: '100%' }}>
        <div className="dat-ban-noi-bo-toolbar-card__top">
          <div>
            <span className="dat-ban-noi-bo-section-kicker">Đặt bàn nội bộ</span>
            <Typography.Title level={4} style={{ margin: '4px 0 0' }}>Danh sách booking</Typography.Title>
            <Typography.Text type="secondary">{visibleCount} booking · {phamViLabel}</Typography.Text>
          </div>

          <Space.Compact block className="dat-ban-noi-bo-toolbar-compact">
            <Input
              allowClear
              size="large"
              value={searchQuery}
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm theo mã booking, tên khách hoặc SĐT"
              onChange={(event) => onSearchChange(event.target.value)}
              className="booking-noi-bo-search"
            />
            <Button size="large" onClick={onReset} icon={<PlusOutlined />}>
              {dangChinhSua ? 'Tạo mới' : 'Làm mới'}
            </Button>
          </Space.Compact>
        </div>

        <Segmented
          block
          className="dat-ban-noi-bo-segmented"
          options={QUICK_FILTERS.map((boLoc) => ({
            label: (
              <span className="dat-ban-noi-bo-filter-option">
                <span>{boLoc.label}</span>
                <span className="dat-ban-noi-bo-filter-option__count">{filterCounts[boLoc.key] || 0}</span>
              </span>
            ),
            value: boLoc.key,
          }))}
          value={quickFilter}
          onChange={onQuickFilterChange}
        />
      </Space>
    </Card>
  )
}

function DatBanFormCard({
  editingBookingId,
  formValues,
  formError,
  onFieldChange,
  onSubmit,
  onReset,
}) {
  const dangChinhSua = editingBookingId !== null
  const title = dangChinhSua ? `Sửa booking #${editingBookingId}` : 'Tạo đặt bàn nội bộ'
  const subtitle = dangChinhSua ? 'Cập nhật nhanh để host xử lý ngay tại quầy.' : 'Điền nhanh thông tin để chốt bàn ngay trong ca làm việc.'

  return (
    <Card
      className="dat-ban-noi-bo-form-card"
      title={
        <div className="dat-ban-noi-bo-form-card__title-block">
          <Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        </div>
      }
      extra={<Tag color={dangChinhSua ? 'orange' : 'blue'}>{dangChinhSua ? 'Đang chỉnh sửa' : 'Tạo mới'}</Tag>}
    >
      <Space orientation="vertical" size={14} style={{ width: '100%' }}>
        <Form layout="vertical" onSubmitCapture={onSubmit}>
          <Divider titlePlacement="left" plain className="dat-ban-noi-bo-form-divider">Liên hệ khách</Divider>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Tên khách" style={KIEU_MUC_FORM_GON}>
                <Input size="large" value={formValues.name} onChange={onFieldChange('name')} placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Số điện thoại" style={KIEU_MUC_FORM_GON}>
                <Input size="large" value={formValues.phone} onChange={onFieldChange('phone')} placeholder="0901234567" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Email" style={KIEU_MUC_FORM_GON}>
                <Input size="large" type="email" value={formValues.email} onChange={onFieldChange('email')} placeholder="khach@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain className="dat-ban-noi-bo-form-divider">Chi tiết đặt bàn</Divider>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Ngày" style={KIEU_MUC_FORM_GON}>
                <Input size="large" type="date" value={formValues.date} onChange={onFieldChange('date')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Giờ" style={KIEU_MUC_FORM_GON}>
                <Input size="large" type="time" value={formValues.time} onChange={onFieldChange('time')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Số khách" style={KIEU_MUC_FORM_GON}>
                <InputNumber
                  size="large"
                  min={1}
                  value={formValues.guests === '' ? null : Number(formValues.guests)}
                  placeholder="Nhập số khách"
                  onChange={(value) => onFieldChange('guests')({ target: { value: value == null ? '' : String(value) } })}
                  className="!w-full"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Khu vực ưu tiên" style={KIEU_MUC_FORM_GON}>
                <Select
                  size="large"
                  value={formValues.seatingArea}
                  options={seatingAreaOptions}
                  onChange={(value) => onFieldChange('seatingArea')({ target: { value } })}
                />
              </Form.Item>
            </Col>
            {!dangChinhSua ? (
              <Col span={24}>
                <Form.Item label="Trạng thái ban đầu" style={KIEU_MUC_FORM_GON}>
                  <Select
                    size="large"
                    value={formValues.status}
                    options={CREATE_STATUS_OPTIONS.map((status) => ({ value: status, label: HOST_NHAN_TRANG_THAI_DAT_BAN[status] }))}
                    onChange={(value) => onFieldChange('status')({ target: { value } })}
                  />
                </Form.Item>
              </Col>
            ) : null}
          </Row>

          <Divider titlePlacement="left" plain className="dat-ban-noi-bo-form-divider">Ghi chú</Divider>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Ghi chú khách" style={KIEU_MUC_FORM_GON}>
                <TextArea rows={3} value={formValues.notes} onChange={onFieldChange('notes')} placeholder="Yêu cầu bàn gần cửa sổ, có trẻ nhỏ..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ghi chú nội bộ" style={KIEU_MUC_FORM_GON}>
                <TextArea rows={3} value={formValues.internalNote} onChange={onFieldChange('internalNote')} placeholder="Ưu tiên gọi xác nhận lại, cần quản lý duyệt..." />
              </Form.Item>
            </Col>
          </Row>

          {formError ? <Alert type="error" showIcon title={formError} style={{ marginTop: 8, marginBottom: 14 }} /> : null}

          <Space className="dat-ban-noi-bo-form-actions">
            <Button size="large" onClick={onReset}>{dangChinhSua ? 'Hủy chỉnh sửa' : 'Làm lại'}</Button>
            <Button type="primary" size="large" htmlType="submit" icon={<CheckCircleOutlined />}>{dangChinhSua ? 'Cập nhật' : 'Thêm mới'}</Button>
          </Space>
        </Form>
      </Space>
    </Card>
  )
}

function TheBookingDatBan({ booking, onEdit, onAssign, onConfirmAction, onQuickStatusChange }) {
  const banDaGan = booking.danhSachBanDaGan || []
  const danhSachMon = Array.isArray(booking.menuItems) && booking.menuItems.length ? booking.menuItems : booking.chiTietMonAn || []
  const chuaGanBan = laBookingChuaGanBan(booking)
  const dangChoXacNhan = PENDING_STATUS_SET.has(booking.status)
  const canhBaoUuTien = chuaGanBan || dangChoXacNhan
  const daCheckIn = laDatBanDaCheckIn(booking)
  const ghiChuUuTien = canXacNhanThuCong(booking)
    ? layGhiChuUuTienDatBan(booking) || 'Booking này cần host xác nhận trước khi chốt bàn.'
    : ''

  return (
    <Card className={`dat-ban-noi-bo-booking-card${canhBaoUuTien ? ' dat-ban-noi-bo-booking-card--urgent' : ''}`}>
      <div className="dat-ban-noi-bo-booking-card__layout">
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <Space wrap size={[8, 8]}>
              <Typography.Title level={5} style={{ margin: 0 }}>{layMaDatBan(booking)}</Typography.Title>
              <Tag color={getStatusTagColor(booking.status)}>{HOST_NHAN_TRANG_THAI_DAT_BAN[booking.status] || booking.status}</Tag>
              {chuaGanBan ? <Tag color="error">Chưa gán bàn</Tag> : null}
            </Space>
            <div className="dat-ban-noi-bo-booking-card__customer-row">
              <Typography.Text strong>{booking.name}</Typography.Text>
              <Typography.Text type="secondary">{booking.phone}</Typography.Text>
            </div>
          </div>

          <Space wrap size={[8, 8]}>
            <Tag icon={<CalendarOutlined />} className="dat-ban-noi-bo-meta-tag">{dinhDangNgayGio(booking.date, booking.time)}</Tag>
            <Tag icon={<UserOutlined />} className="dat-ban-noi-bo-meta-tag">{dinhDangSoKhach(booking.guests)}</Tag>
            <Tag icon={<EnvironmentOutlined />} className="dat-ban-noi-bo-meta-tag">{layNhanChoNgoi(booking.seatingArea)}</Tag>
            <Tag icon={<PhoneOutlined />} className="dat-ban-noi-bo-meta-tag">{layNhanKenhXacNhan(booking.confirmationChannel)}</Tag>
          </Space>

          <Descriptions bordered size="small" column={{ xs: 1, lg: 3 }} className="dat-ban-noi-bo-booking-desc">
            <Descriptions.Item label="Bàn đã gán">{banDaGan.length > 0 ? banDaGan.map(dinhDangBanDaGan).join(', ') : 'Chưa gán bàn'}</Descriptions.Item>
            <Descriptions.Item label="Nguồn">{layNguonDatBan(booking)}</Descriptions.Item>
            <Descriptions.Item label="Email">{booking.email || 'Chưa cập nhật'}</Descriptions.Item>
          </Descriptions>

          {danhSachMon.length ? (
            <List
              size="small"
              bordered
              header="Món khách chọn"
              dataSource={danhSachMon}
              renderItem={(mon) => (
                <List.Item>
                  <Typography.Text>{mon.tenMon || mon.ten || mon.name || mon.maMon}</Typography.Text>
                  <Typography.Text type="secondary">x{mon.soLuong || mon.quantity || 1}</Typography.Text>
                </List.Item>
              )}
            />
          ) : null}

          {ghiChuUuTien ? (
            <Alert type="warning" showIcon title="Ưu tiên xử lý" description={ghiChuUuTien} />
          ) : null}

          {dangChoXacNhan ? (
            <Alert
              type="info"
              showIcon
              title="Duyệt nhanh booking"
              description={(
                <Space wrap>
                  <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => onQuickStatusChange(booking, TRANG_THAI_DAT_BAN.DA_XAC_NHAN)}>
                    Duyệt booking
                  </Button>
                  <Button size="small" icon={<PhoneOutlined />} onClick={() => onQuickStatusChange(booking, TRANG_THAI_DAT_BAN.CHO_XAC_NHAN)}>
                    Cần gọi lại
                  </Button>
                  <Button size="small" danger icon={<StopOutlined />} onClick={() => onQuickStatusChange(booking, TRANG_THAI_DAT_BAN.TU_CHOI_HET_CHO)}>
                    Từ chối
                  </Button>
                </Space>
              )}
            />
          ) : null}

          {(booking.notes || booking.internalNote) ? (
            <Row gutter={[12, 12]}>
              {booking.notes ? (
                <Col xs={24} md={12}>
                  <Alert type="info" showIcon title="Ghi chú" description={booking.notes} className="dat-ban-noi-bo-note-alert" />
                </Col>
              ) : null}
              {booking.internalNote ? (
                <Col xs={24} md={12}>
                  <Alert type="info" showIcon title="Nội bộ" description={booking.internalNote} className="dat-ban-noi-bo-note-alert dat-ban-noi-bo-note-alert--internal" />
                </Col>
              ) : null}
            </Row>
          ) : null}
        </Space>

        <Card size="small" className="dat-ban-noi-bo-actions-card" title="Thao tác">
          <Space orientation="vertical" size={8} style={{ width: '100%' }}>
            <Button block icon={<EditOutlined />} onClick={() => onEdit(booking)}>
              Sửa
            </Button>
            {!daCheckIn ? (
              <Button
                block
                type={chuaGanBan ? 'primary' : 'default'}
                icon={<SwapOutlined />}
                onClick={() => onAssign(booking)}
                disabled={!coTheGanBanChoDatBan(booking)}
              >
                {chuaGanBan ? 'Gán bàn' : 'Đổi bàn'}
              </Button>
            ) : null}
            <Button block type="primary" icon={<CheckOutlined />} onClick={() => onConfirmAction('checkIn', booking)} disabled={!coTheCheckInDatBan(booking)}>
              Check-in
            </Button>
            <Button block icon={<CheckCircleOutlined />} onClick={() => onConfirmAction('complete', booking)} disabled={!coTheHoanThanhDatBan(booking)}>
              Hoàn thành
            </Button>
            {!daCheckIn ? (
              <Button block danger icon={<StopOutlined />} onClick={() => onConfirmAction('noShow', booking)} disabled={!coTheDanhDauKhongDen(booking)}>
                Không đến
              </Button>
            ) : null}
          </Space>
        </Card>
      </div>
    </Card>
  )
}

function DatBanBookingList({
  bookings,
  tongSoBooking,
  tuKhoaTimKiem,
  boLocNhanh,
  onEdit,
  onAssign,
  onConfirmAction,
  onQuickStatusChange,
}) {
  if (bookings.length === 0) {
    const trangThaiTrong = layThongTinTrangThaiTrong({ tongSoBooking, tuKhoaTimKiem, boLocNhanh })

    return (
      <Card className="dat-ban-noi-bo-empty-card">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={(
            <Space orientation="vertical" size={2}>
              <Typography.Text strong>{trangThaiTrong.tieuDe}</Typography.Text>
              <Typography.Text type="secondary">{trangThaiTrong.moTa}</Typography.Text>
            </Space>
          )}
        />
      </Card>
    )
  }

  return (
    <List
      className="dat-ban-noi-bo-list"
      split={false}
      dataSource={bookings}
      renderItem={(booking) => (
        <List.Item key={booking.id} className="dat-ban-noi-bo-list__item">
          <TheBookingDatBan
            booking={booking}
            onEdit={onEdit}
            onAssign={onAssign}
            onConfirmAction={onConfirmAction}
            onQuickStatusChange={onQuickStatusChange}
          />
        </List.Item>
      )}
    />
  )
}

function DatBanAssignModal({
  booking,
  open,
  selectedTableIds,
  assignableTables,
  selectedCapacity,
  error,
  onClose,
  onToggleTable,
  onSubmit,
}) {
  const sucChuaCan = Number(booking?.guests || 0)
  const duSucChua = selectedCapacity >= sucChuaCan
  const tapBanDangChon = useMemo(() => new Set(selectedTableIds), [selectedTableIds])
  const tapBanDangGan = useMemo(
    () => new Set(Array.isArray(booking?.danhSachMaBanDaGan) ? booking.danhSachMaBanDaGan : []),
    [booking],
  )

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={booking ? `Gán bàn · ${layMaDatBan(booking)}` : 'Gán bàn'}
      size={460}
      destroyOnHidden
      className="dat-ban-noi-bo-assign-drawer"
    >
      {booking ? (
        <Space orientation="vertical" size={14} style={{ width: '100%' }}>
          <Descriptions bordered size="small" column={1} className="dat-ban-noi-bo-assign-desc">
            <Descriptions.Item label="Khách">{booking.name}</Descriptions.Item>
            <Descriptions.Item label="Số khách">{dinhDangSoKhach(booking.guests)}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{dinhDangNgayGio(booking.date, booking.time)}</Descriptions.Item>
            <Descriptions.Item label="Khu vực ưu tiên">{layNhanChoNgoi(booking.seatingArea)}</Descriptions.Item>
            <Descriptions.Item label="Bàn hiện tại">{booking.danhSachBanDaGan?.length ? booking.danhSachBanDaGan.map(dinhDangBanDaGan).join(', ') : 'Chưa gán bàn'}</Descriptions.Item>
          </Descriptions>

          <Alert
            type={duSucChua ? 'success' : 'warning'}
            showIcon
            title="Tổng sức chứa đang chọn"
            description={`${selectedCapacity}/${sucChuaCan} khách`}
          />

          <Space wrap size={[8, 8]}>
            <Tag>Bàn trống</Tag>
            <Tag color="warning">Đang gán</Tag>
            <Tag color="success">Đã chọn</Tag>
          </Space>

          <List
            className="dat-ban-noi-bo-ban-list"
            grid={{ gutter: 12, xs: 1, sm: 2, md: 3 }}
            dataSource={assignableTables}
            renderItem={(table) => {
              const daChon = tapBanDangChon.has(table.id)
              const dangGan = tapBanDangGan.has(table.id)

              return (
                <List.Item>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => onToggleTable(table.id)}
                    className={`dat-ban-noi-bo-ban-tile${dangGan ? ' dat-ban-noi-bo-ban-tile--current' : ''}${daChon ? ' dat-ban-noi-bo-ban-tile--selected' : ''}`}
                  >
                    <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                      <Typography.Text strong>{table.code} - {table.name || 'Bàn'}</Typography.Text>
                      <Typography.Text>{table.tableNumber ? `Số ${table.tableNumber} · ` : ''}{table.capacity} khách</Typography.Text>
                      <Typography.Text type="secondary">{layNhanChoNgoi(table.areaId)}</Typography.Text>
                      <Tag color={dangGan ? 'warning' : daChon ? 'success' : 'default'}>{dangGan ? 'Đang gán' : daChon ? 'Đã chọn' : 'Bàn trống'}</Tag>
                    </Space>
                  </Card>
                </List.Item>
              )
            }}
          />

          {error ? <Alert type="error" showIcon title={error} /> : null}

          <Space className="dat-ban-noi-bo-assign-actions">
            <Button size="large" onClick={onClose}>Hủy</Button>
            <Button size="large" type="primary" onClick={onSubmit}>Lưu gán bàn</Button>
          </Space>
        </Space>
      ) : null}
    </Drawer>
  )
}

function DatBanConfirmModal({ pendingAction, open, onClose, onConfirm }) {
  if (!pendingAction) return null

  const copy = ACTION_CONFIRMATION_COPY[pendingAction.type]
  if (!copy) return null

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onConfirm}
      okText={copy.confirmLabel}
      cancelText="Hủy"
      title={copy.title}
      centered
      okButtonProps={{ danger: pendingAction.type === 'noShow' }}
    >
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Alert type={pendingAction.type === 'noShow' ? 'warning' : 'info'} showIcon title={copy.message} description={copy.description} />
        <Typography.Text className="dat-ban-noi-bo-confirm-text">{copy.getMessage(pendingAction.booking)}</Typography.Text>
      </Space>
    </Modal>
  )
}

function DatBanTab({
  hangDoiDatBan,
  handleCreateInternalBooking,
  handleUpdateInternalBooking,
  handleAssignTables,
  handleQuickStatusChange,
  handleCheckIn,
  handleComplete,
  xuLyKhachKhongDen,
  phamViLabel,
  getAvailableTablesForBooking,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES)
  const [formError, setFormError] = useState('')
  const [assigningBooking, setAssigningBooking] = useState(null)
  const [selectedTableIds, setSelectedTableIds] = useState([])
  const [daChonBanMoi, setDaChonBanMoi] = useState(false)
  const [assignableTables, setAssignableTables] = useState([])
  const [assignModalError, setAssignModalError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)

  const homNay = dayjs().format('YYYY-MM-DD')
  const dangChinhSua = editingBookingId !== null

  const filterCounts = useMemo(
    () => getQuickFilterCounts(hangDoiDatBan, homNay),
    [hangDoiDatBan, homNay],
  )

  const visibleBookings = useMemo(() => {
    const searched = hangDoiDatBan.filter((booking) => khopTimKiemDatBan(booking, searchQuery))
    return applyQuickFilter(searched, quickFilter, homNay)
  }, [hangDoiDatBan, quickFilter, searchQuery, homNay])

  const tapBanDangChon = useMemo(() => new Set(selectedTableIds), [selectedTableIds])
  const tapBanDangGan = useMemo(
    () => new Set(Array.isArray(assigningBooking?.danhSachMaBanDaGan) ? assigningBooking.danhSachMaBanDaGan : []),
    [assigningBooking],
  )

  const selectedCapacity = useMemo(
    () => assignableTables.reduce((sum, table) => {
      const dangTinhSucChua = daChonBanMoi ? tapBanDangChon.has(table.id) : tapBanDangGan.has(table.id)
      return dangTinhSucChua ? sum + (Number(table.capacity) || 0) : sum
    }, 0),
    [assignableTables, daChonBanMoi, tapBanDangChon, tapBanDangGan],
  )

  const resetForm = () => {
    setEditingBookingId(null)
    setFormValues(DEFAULT_FORM_VALUES)
    setFormError('')
  }

  const resetAssignModal = () => {
    setAssigningBooking(null)
    setSelectedTableIds([])
    setDaChonBanMoi(false)
    setAssignableTables([])
    setAssignModalError('')
  }

  const resetPendingAction = () => {
    setPendingAction(null)
  }

  const handleChange = (field) => (event) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: event.target.value,
    }))
  }

  const validateForm = () => {
    if (!formValues.name.trim()) return 'Vui lòng nhập tên khách.'
    if (!formValues.phone.trim()) return 'Vui lòng nhập số điện thoại.'
    if (!formValues.date.trim()) return 'Vui lòng chọn ngày.'
    if (!formValues.time.trim()) return 'Vui lòng nhập giờ.'
    if ((Number(formValues.guests) || 0) <= 0) return 'Số khách phải lớn hơn 0.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextError = validateForm()
    if (nextError) {
      setFormError(nextError)
      return
    }

    const duLieuGuiDi = {
      name: formValues.name.trim(),
      phone: formValues.phone.trim(),
      email: formValues.email.trim(),
      guests: String(Number(formValues.guests) || 0),
      date: formValues.date.trim(),
      time: formValues.time.trim(),
      seatingArea: formValues.seatingArea,
      notes: formValues.notes.trim(),
      internalNote: formValues.internalNote.trim(),
      ...(!dangChinhSua ? { status: formValues.status } : {}),
    }

    const ketQua = dangChinhSua
      ? await handleUpdateInternalBooking(editingBookingId, duLieuGuiDi)
      : await handleCreateInternalBooking(duLieuGuiDi)

    if (!ketQua?.success) {
      setFormError(ketQua?.error || 'Không thể lưu đặt bàn nội bộ.')
      return
    }

    resetForm()
  }

  const handleEditBooking = (booking) => {
    setEditingBookingId(booking.id)
    setFormValues({
      name: booking.name || '',
      phone: booking.phone || '',
      email: booking.email || '',
      guests: booking.guests ? String(booking.guests) : '',
      date: booking.date || '',
      time: booking.time || '',
      seatingArea: booking.seatingArea || 'KHONG_UU_TIEN',
      notes: booking.notes || '',
      internalNote: booking.internalNote || '',
      status: booking.status || 'DA_XAC_NHAN',
    })
    setFormError('')
  }

  const openAssignModal = (booking) => {
    const danhSachBanPhuHop = getAvailableTablesForBooking(booking)

    if (danhSachBanPhuHop.length === 0) {
      setFormError(`Không còn bàn phù hợp cho booking ${layMaDatBan(booking)}.`)
      return
    }

    setAssigningBooking(booking)
    setAssignableTables(danhSachBanPhuHop)
    setSelectedTableIds([])
    setDaChonBanMoi(false)
    setAssignModalError('')
    setFormError('')
  }

  const toggleTableSelection = (tableId) => {
    setSelectedTableIds([tableId])
    setDaChonBanMoi(true)
    setAssignModalError('')
  }

  const handleAssignSubmit = async () => {
    if (!assigningBooking) return

    if (selectedTableIds.length !== 1) {
      setAssignModalError('Chỉ được gán đúng một bàn cho đặt bàn.')
      return
    }

    const ketQua = await handleAssignTables(assigningBooking.id, selectedTableIds)
    if (!ketQua?.success) {
      setAssignModalError(ketQua?.error || 'Không thể gán bàn cho booking này.')
      return
    }

    setFormError('')
    resetAssignModal()
  }

  const openConfirmAction = (type, booking) => {
    setPendingAction({ type, booking })
    setFormError('')
  }

  const handleConfirmAction = async () => {
    if (!pendingAction?.booking) return

    const { booking, type } = pendingAction
    let ketQua = null

    if (type === 'checkIn') ketQua = await handleCheckIn(booking.id)
    if (type === 'complete') ketQua = await handleComplete(booking.id)
    if (type === 'noShow') ketQua = await xuLyKhachKhongDen(booking.id)

    if (!ketQua?.success) {
      setFormError(ketQua?.error || 'Không thể thực hiện thao tác này.')
      return
    }

    setFormError('')
    resetPendingAction()
  }

  return (
    <section className="dat-ban-noi-bo-layout">
      <div className="dat-ban-noi-bo-layout__list-col">
        <DatBanToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={resetForm}
          dangChinhSua={dangChinhSua}
          visibleCount={visibleBookings.length}
          phamViLabel={phamViLabel}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          filterCounts={filterCounts}
        />

        <DatBanBookingList
          bookings={visibleBookings}
          tongSoBooking={hangDoiDatBan.length}
          tuKhoaTimKiem={searchQuery}
          boLocNhanh={quickFilter}
          onEdit={handleEditBooking}
          onAssign={openAssignModal}
          onConfirmAction={openConfirmAction}
          onQuickStatusChange={handleQuickStatusChange}
        />
      </div>

      <div className="dat-ban-noi-bo-layout__form-col">
        <DatBanFormCard
          editingBookingId={editingBookingId}
          formValues={formValues}
          formError={formError}
          onFieldChange={handleChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      </div>

      <DatBanAssignModal
        booking={assigningBooking}
        open={Boolean(assigningBooking)}
        selectedTableIds={selectedTableIds}
        assignableTables={assignableTables}
        selectedCapacity={selectedCapacity}
        error={assignModalError}
        onClose={resetAssignModal}
        onToggleTable={toggleTableSelection}
        onSubmit={handleAssignSubmit}
      />

      <DatBanConfirmModal
        pendingAction={pendingAction}
        open={Boolean(pendingAction)}
        onClose={resetPendingAction}
        onConfirm={handleConfirmAction}
      />
    </section>
  )
}

export default DatBanTab
