import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Tooltip,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { dinhDangNgay } from '../../features/noiBo/dinhDang.js'
import {
  layDanhSachMaGiamGiaApi,
  taoMaGiamGiaApi,
  capNhatMaGiamGiaApi,
  xoaMaGiamGiaApi,
} from '../../services/api/apiMaGiamGia'
import {
  getVoucherTrangThaiBadgeClass,
  getVoucherTrangThaiLabel,
  getVoucherLoaiMaLabel,
  getVoucherNguonLabel,
  normalizeVoucherLoaiMa,
} from '../../services/api/voucherTrangThai'
import { layDanhSachKhachHang } from '../../services/api/apiKhachHang'

const { Title } = Typography
const { RangePicker } = DatePicker

const TRANG_THAI_OPTIONS = [
  { value: 'Active', label: 'Hoạt động' },
  { value: 'Inactive', label: 'Tạm tắt' },
  { value: 'HetHan', label: 'Hết hạn' },
]

const LOAI_GIAM_OPTIONS = [
  { value: 'percentage', label: 'Phần trăm (%)' },
  { value: 'fixed_amount', label: 'Số tiền (VNĐ)' },
]

const LOAI_MA_OPTIONS = [
  { value: 'PUBLIC', label: getVoucherLoaiMaLabel('PUBLIC') },
  { value: 'CUSTOMER', label: getVoucherLoaiMaLabel('CUSTOMER') },
  { value: 'LOYALTY', label: getVoucherLoaiMaLabel('LOYALTY') },
  { value: 'VIP', label: getVoucherLoaiMaLabel('VIP') },
  { value: 'BIRTHDAY', label: getVoucherLoaiMaLabel('BIRTHDAY') },
]

const LOAI_MA_CAN_KHACH = new Set(['CUSTOMER', 'LOYALTY', 'VIP', 'BIRTHDAY'])

function taoFormMacDinh() {
  return {
    maCode: '',
    tenCode: '',
    giaTri: 0,
    loaiGiam: 'percentage',
    loaiMa: 'PUBLIC',
    maKH: '',
    diemDaDoi: null,
    giaTriToiDa: null,
    donHangToiThieu: 0,
    ngayApDung: null,
    soLanToiDa: null,
    nguonTao: 'NOI_BO',
    trangThai: 'Active',
  }
}

function chuanHoaDuLieuForm(ma) {
  if (!ma) return taoFormMacDinh()
  return {
    ...ma,
    ngayApDung: ma.ngayBatDau && ma.ngayKetThuc ? [dayjs(ma.ngayBatDau), dayjs(ma.ngayKetThuc)] : null,
    loaiMa: normalizeVoucherLoaiMa(ma.loaiMa || ma.LoaiMa || 'PUBLIC'),
    maKH: ma.maKH || ma.maKhachHang || '',
    diemDaDoi: ma.diemDaDoi ?? null,
    nguonTao: ma.nguonTao || ma.nguon || 'NOI_BO',
  }
}

function chuanHoaDuLieuGuiDi(giaTri) {
  const ngayApDung = Array.isArray(giaTri.ngayApDung) ? giaTri.ngayApDung : []
  return {
    ...giaTri,
    ngayBatDau: ngayApDung[0] ? ngayApDung[0].format('YYYY-MM-DD') : null,
    ngayKetThuc: ngayApDung[1] ? ngayApDung[1].format('YYYY-MM-DD') : null,
    maKH: String(giaTri.maKH || '').trim(),
    loaiMa: normalizeVoucherLoaiMa(giaTri.loaiMa || 'PUBLIC'),
    diemDaDoi: giaTri.diemDaDoi != null && giaTri.diemDaDoi !== '' ? Number(giaTri.diemDaDoi) : null,
    nguonTao: String(giaTri.nguonTao || 'NOI_BO').trim() || 'NOI_BO',
  }
}

function dinhDangGia(giaTri, loaiGiam) {
  if (loaiGiam === 'percentage') {
    return `${Number(giaTri || 0)}%`
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(giaTri || 0))
}

function NoiBoMaGiamGiaPage() {
  const [danhSach, datDanhSach] = useState([])
  const [danhSachKhachHang, datDanhSachKhachHang] = useState([])
  const [dangTai, datDangTai] = useState(false)
  const [dangTaiKhachHang, datDangTaiKhachHang] = useState(false)
  const [dangXuLy, datDangXuLy] = useState(false)
  const [nganKeoDangMo, datNganKeoDangMo] = useState(false)
  const [cheDoBieuMau, datCheDoBieuMau] = useState('create')
  const [maDangSua, datMaDangSua] = useState(null)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const loaiMaDangChon = Form.useWatch('loaiMa', form) || 'PUBLIC'

  const taiDanhSach = useCallback(async () => {
    datDangTai(true)
    try {
      const phanHoi = await layDanhSachMaGiamGiaApi()
      datDanhSach(Array.isArray(phanHoi.duLieu) ? phanHoi.duLieu : [])
    } catch (loi) {
      messageApi.error(loi?.message || 'Không thể tải danh sách mã giảm giá.')
    } finally {
      datDangTai(false)
    }
  }, [messageApi])

  useEffect(() => {
    taiDanhSach()
  }, [taiDanhSach])

  useEffect(() => {
    if (String(loaiMaDangChon || 'PUBLIC').toUpperCase() === 'PUBLIC') {
      form.setFieldsValue({ maKH: '', diemDaDoi: null })
      return
    }

    if (String(loaiMaDangChon || 'PUBLIC').toUpperCase() !== 'LOYALTY') {
      form.setFieldsValue({ diemDaDoi: null })
    }
  }, [form, loaiMaDangChon])

  useEffect(() => {
    const taiKhachHang = async () => {
      datDangTaiKhachHang(true)
      try {
        const res = await layDanhSachKhachHang({ soLuong: 200, trang: 1, sapXep: 'ngay-tao', thuTu: 'desc' })
        datDanhSachKhachHang(Array.isArray(res.data) ? res.data : [])
      } catch {
        datDanhSachKhachHang([])
      } finally {
        datDangTaiKhachHang(false)
      }
    }

    taiKhachHang()
  }, [])

  const datLaiBieuMau = () => {
    datCheDoBieuMau('create')
    datMaDangSua(null)
    form.resetFields()
    datNganKeoDangMo(false)
  }

  const moNganKeoTaoMoi = () => {
    datLaiBieuMau()
    datCheDoBieuMau('create')
    datNganKeoDangMo(true)
  }

  const moNganKeoSua = useCallback((record) => {
    datCheDoBieuMau('edit')
    datMaDangSua(record.maCode)
    const duLieu = chuanHoaDuLieuForm(record)
    form.setFieldsValue(duLieu)
    datNganKeoDangMo(true)
  }, [form])

  const xuLySaoChepMa = useCallback(async (maCode) => {
    const maCodeHopLe = String(maCode || '').trim()
    if (!maCodeHopLe) return

    try {
      await navigator.clipboard.writeText(maCodeHopLe)
      messageApi.success('Đã sao chép mã.')
    } catch {
      messageApi.error('Không thể sao chép mã.')
    }
  }, [messageApi])

  const xuLyLuu = async () => {
    try {
      const giaTri = await form.validateFields()
      datDangXuLy(true)
      const duLieuGui = chuanHoaDuLieuGuiDi(giaTri)

      if (cheDoBieuMau === 'create') {
        await taoMaGiamGiaApi(duLieuGui)
        messageApi.success('Tạo mã giảm giá thành công.')
      } else {
        await capNhatMaGiamGiaApi(maDangSua, duLieuGui)
        messageApi.success('Cập nhật mã giảm giá thành công.')
      }

      datLaiBieuMau()
      taiDanhSach()
    } catch (loi) {
      if (loi?.errorFields) return
      messageApi.error(loi?.message || 'Đã xảy ra lỗi khi lưu.')
    } finally {
      datDangXuLy(false)
    }
  }

  const xuLyXoá = useCallback((record) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: `Bạn có chắc muốn xoá mã giảm giá "${record.tenCode}" (${record.maCode}) khong?`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huy',
      onOk: async () => {
        try {
          await xoaMaGiamGiaApi(record.maCode)
          messageApi.success('Xoá mã giảm giá thành công.')
          taiDanhSach()
        } catch (loi) {
          messageApi.error(loi?.message || 'Đã xảy ra lỗi khi xoá.')
        }
      },
    })
  }, [messageApi, taiDanhSach])

  const banDoKhachHang = useMemo(
    () =>
      new Map(
        danhSachKhachHang.map((khach) => [
          String(khach.maKH || '').trim(),
          khach,
        ]),
      ),
    [danhSachKhachHang],
  )

  const cotBang = useMemo(
    () => [
      {
        title: 'Mã',
        dataIndex: 'maCode',
        key: 'maCode',
        width: 140,
        fixed: 'left',
        render: (val) => {
          const maCode = String(val || '').trim()
          return (
            <Space size={4} style={{ minWidth: 0, width: '100%' }}>
              <Tooltip title={maCode}>
                <code
                  style={{
                    display: 'inline-block',
                    maxWidth: 78,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 12,
                  }}
                >
                  {maCode}
                </code>
              </Tooltip>
              <Tooltip title="Sao chép mã">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => xuLySaoChepMa(maCode)}
                />
              </Tooltip>
            </Space>
          )
        },
      },
      {
        title: 'Tên mã',
        dataIndex: 'tenCode',
        key: 'tenCode',
        width: 200,
        ellipsis: true,
      },
      {
        title: 'Loại mã',
        dataIndex: 'loaiMa',
        key: 'loaiMa',
        width: 160,
        render: (val, record) => record.loaiMaHienThi || getVoucherLoaiMaLabel(val),
      },
      {
        title: 'Khách sở hữu',
        dataIndex: 'maKH',
        key: 'maKH',
        width: 180,
        render: (val) => {
          const khach = banDoKhachHang.get(String(val || '').trim())
          return val ? `${val}${khach?.tenKH ? ` - ${khach.tenKH}` : ''}` : '--'
        },
      },
      {
        title: 'Loại giảm',
        dataIndex: 'loaiGiam',
        key: 'loaiGiam',
        width: 130,
        render: (val) => LOAI_GIAM_OPTIONS.find((o) => o.value === val)?.label || val,
      },
      {
        title: 'Giá trị',
        dataIndex: 'giaTri',
        key: 'giaTri',
        width: 110,
        align: 'right',
        render: (giaTri, record) => dinhDangGia(giaTri, record.loaiGiam),
      },
      {
        title: 'Giảm tối đa',
        dataIndex: 'giaTriToiDa',
        key: 'giaTriToiDa',
        width: 130,
        align: 'right',
        render: (val, record) =>
          record.loaiGiam === 'percentage' && val != null
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val))
            : '--',
      },
      {
        title: 'Đơn tối thiểu',
        dataIndex: 'donHangToiThieu',
        key: 'donHangToiThieu',
        width: 130,
        align: 'right',
        render: (val) =>
          val > 0
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val))
            : '--',
      },
      {
        title: 'Ngày áp dụng',
        key: 'ngayApDung',
        width: 160,
        render: (_, record) =>
          record.ngayBatDau && record.ngayKetThuc
            ? `${dinhDangNgay(record.ngayBatDau)} - ${dinhDangNgay(record.ngayKetThuc)}`
            : '--',
      },
      {
        title: 'Lượt dùng',
        key: 'luotDung',
        width: 110,
        align: 'center',
        render: (_, record) => {
          const daDung = Number(record.soLanDaDung || 0)
          const toiDa = record.soLanToiDa
          return toiDa != null ? `${daDung} / ${toiDa}` : `${daDung}`
        },
      },
      {
        title: 'Nguồn',
        dataIndex: 'nguon',
        key: 'nguon',
        width: 160,
        render: (val) => {
          const nhanNguon = getVoucherNguonLabel(val)
          return (
            <Tooltip title={nhanNguon}>
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'bottom',
                }}
              >
                {nhanNguon}
              </span>
            </Tooltip>
          )
        },
      },
      {
        title: 'Trạng thái',
        dataIndex: 'trangThai',
        key: 'trangThai',
        width: 110,
        render: (_, record) => {
          return (
            <Tag className={`nhan-trang-thai voucher-trang-thai ${getVoucherTrangThaiBadgeClass(record)}`}>
              {getVoucherTrangThaiLabel(record)}
            </Tag>
          )
        },
      },
      {
        title: 'Thao tác',
        key: 'thaoTac',
        width: 110,
        fixed: 'right',
        render: (_, record) => (
          <Space size={4}>
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => moNganKeoSua(record)} />
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => xuLyXoá(record)} />
          </Space>
        ),
      },
    ],
    [banDoKhachHang, moNganKeoSua, xuLyXoá, xuLySaoChepMa],
  )

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý mã giảm giá</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={moNganKeoTaoMoi}>
            Thêm mã mới
          </Button>
        </Space>
      </Space>

      {danhSach.length === 0 && !dangTai ? (
        <Alert
          type="info"
          showIcon
          title="Chưa có mã giảm giá nào."
          description="Nhấn 'Thêm mã mới' để tạo mã giảm giá đầu tiên."
        />
      ) : (
        <Table
          columns={cotBang}
          dataSource={danhSach}
          rowKey="maCode"
          loading={dangTai}
          scroll={{ x: 1600 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (tong) => `Tổng ${tong} mã` }}
        />
      )}

      <Drawer
        title={cheDoBieuMau === 'create' ? 'Tạo mã giảm giá mới' : `Sửa mã giảm giá: ${maDangSua}`}
        placement="right"
        size={480}
        open={nganKeoDangMo}
        onClose={datLaiBieuMau}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={datLaiBieuMau}>Huy</Button>
            <Button type="primary" loading={dangXuLy} onClick={xuLyLuu}>
              {cheDoBieuMau === 'create' ? 'Tạo mã' : 'Lưu thay đổi'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="maCode"
            label="Mã"
            rules={[{ required: true, message: 'Vui lòng nhập mã code.' }]}
          >
            <Input
              placeholder="VD: SUMMER2025"
              disabled={cheDoBieuMau === 'edit'}
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="tenCode"
            label="Tên mã giảm giá"
            rules={[{ required: true, message: 'Vui lòng nhập tên mã giảm giá.' }]}
          >
            <Input placeholder="VD: Giam gia mua he 2025" maxLength={100} showCount />
          </Form.Item>

          <Form.Item name="loaiGiam" label="Loại giảm" rules={[{ required: true }]}>
            <Select options={LOAI_GIAM_OPTIONS} />
          </Form.Item>

          <Form.Item name="loaiMa" label="Loại mã" rules={[{ required: true, message: 'Vui lòng chọn loại mã.' }]}>
            <Select options={LOAI_MA_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="maKH"
            label="Khách sở hữu"
            rules={[
              {
                validator: (_, value) =>
                  LOAI_MA_CAN_KHACH.has(String(loaiMaDangChon || 'PUBLIC').toUpperCase()) && !String(value || '').trim()
                    ? Promise.reject(new Error('Vui lòng chọn khách hàng sở hữu.'))
                    : Promise.resolve(),
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              loading={dangTaiKhachHang}
              placeholder="Chọn khách hàng"
              optionFilterProp="label"
              options={danhSachKhachHang.map((khach) => ({
                value: khach.maKH,
                label: `${khach.maKH} - ${khach.tenKH}`,
              }))}
              disabled={!LOAI_MA_CAN_KHACH.has(String(loaiMaDangChon || 'PUBLIC').toUpperCase())}
            />
          </Form.Item>

          {String(loaiMaDangChon || 'PUBLIC').toUpperCase() === 'LOYALTY' && (
            <Form.Item
              name="diemDaDoi"
              label="Số điểm đã đổi"
              rules={[{ required: true, message: 'Vui lòng nhập số điểm đã đổi.' }]}
            >
              <InputNumber min={1} step={100} style={{ width: '100%' }} placeholder="Ví dụ: 100" />
            </Form.Item>
          )}

          <Form.Item
            name="giaTri"
            label="Giá trị giảm"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm.' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>

          <Form.Item name="giaTriToiDa" label="Giảm tối đa (VND)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Để trống = không giới hạn" />
          </Form.Item>

          <Form.Item name="donHangToiThieu" label="Đơn hàng tối thiểu (VND)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0 = không yêu cầu" />
          </Form.Item>

          <Form.Item
            name="ngayApDung"
            label="Ngày áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn ngày áp dụng.' }]}
          >
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="soLanToiDa" label="Số lần sử dụng tối đa">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Để trống = không giới hạn" />
          </Form.Item>

          <Form.Item name="nguonTao" label="Nguồn tạo">
            <Input placeholder="VD: Tạo thủ công, Dữ liệu mẫu, Hệ thống" maxLength={50} />
          </Form.Item>

          <Form.Item name="trangThai" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={TRANG_THAI_OPTIONS} />
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  )
}

export default NoiBoMaGiamGiaPage
