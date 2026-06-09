import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Col,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd'
import { message } from 'antd'
import {
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  capNhatDiemKhachHang,
  layChiTietKhachHang,
  layDanhSachKhachHang,
  layLichSuKhachHang,
} from '../../services/api/apiKhachHang'

const TRANG_THAI_DATBAN_MAP = {
  CHO_XAC_NHAN: { color: 'gold', label: 'Chờ xác nhận' },
  DA_XAC_NHAN: { color: 'green', label: 'Đã xác nhận' },
  DA_NHAN_BAN: { color: 'cyan', label: 'Đã nhận bàn' },
  HOAN_THANH: { color: 'green', label: 'Đã hoàn thành' },
  DA_HUY: { color: 'default', label: 'Đã hủy' },
  KHONG_DEN: { color: 'default', label: 'Không đến' },
  TU_CHOI_HET_CHO: { color: 'red', label: 'Từ chối / hết chỗ' },
}

const TRANG_THAI_DONHANG_MAP = {
  DANG_CHUAN_BI: { color: 'orange', label: 'Đang chuẩn bị' },
  DANG_PHUC_VU: { color: 'green', label: 'Đang phục vụ' },
  HOAN_THANH: { color: 'default', label: 'Hoàn thành' },
  DA_THANH_TOAN: { color: 'blue', label: 'Đã thanh toán' },
  DA_HUY: { color: 'red', label: 'Đã hủy' },
}

const { Text } = Typography

const PHAN_LOAI_OPTIONS = [
  { value: 'tat-ca', label: 'Tất cả' },
  { value: 'co-tai-khoan', label: 'Có tài khoản' },
  { value: 'vang-lai', label: 'Vãng lai' },
]

function NoiBoKhachHangPage() {
  const [danhSach, setDanhSach] = useState([])
  const [phanTrang, setPhanTrang] = useState({ trang: 1, soLuong: 10, tong: 0 })
  const [dangTai, setDangTai] = useState(false)
  const [tuKhoa, setTuKhoa] = useState('')
  const [phanLoai, setPhanLoai] = useState('tat-ca')

  const [chiTietOpen, setChiTietOpen] = useState(false)
  const [khachHangChiTiet, setKhachHangChiTiet] = useState(null)
  const [lichSu, setLichSu] = useState({ datBan: [], donHang: [] })
  const [dangTaiLichSu, setDangTaiLichSu] = useState(false)

  const [diemModalOpen, setDiemModalOpen] = useState(false)
  const [dangLuuDiem, setDangLuuDiem] = useState(false)
  const [formDiem] = Form.useForm()

  const loadDanhSach = useCallback(async () => {
    setDangTai(true)
    try {
      const res = await layDanhSachKhachHang({
        tuKhoa,
        phanLoai,
        trang: phanTrang.trang,
        soLuong: phanTrang.soLuong,
        sapXep: 'ngay-tao',
        thuTu: 'desc',
      })
      setDanhSach(res.data || [])
      setPhanTrang((prev) => ({ ...prev, tong: res.meta?.tongSo || 0 }))
    } catch {
      message.error('Không thể tải danh sách khách hàng.')
    } finally {
      setDangTai(false)
    }
  }, [tuKhoa, phanLoai, phanTrang.trang, phanTrang.soLuong])

  useEffect(() => {
    loadDanhSach()
  }, [loadDanhSach])

  const openChiTiet = async (maKH) => {
    setChiTietOpen(true)
    setDangTaiLichSu(true)
    try {
      const [chiTiet, ls] = await Promise.all([
        layChiTietKhachHang(maKH),
        layLichSuKhachHang(maKH),
      ])
      const duLieuChiTiet = chiTiet?.data || chiTiet
      setKhachHangChiTiet(duLieuChiTiet || ls.data?.khachHang || null)
      setLichSu({
        datBan: ls.data?.datBan || [],
        donHang: ls.data?.donHang || [],
      })
    } catch {
      message.error('Không thể tải chi tiết khách hàng.')
    } finally {
      setDangTaiLichSu(false)
    }
  }

  const luuDiem = async (values) => {
    if (!khachHangChiTiet?.maKH) return
    setDangLuuDiem(true)
    try {
      await capNhatDiemKhachHang(khachHangChiTiet.maKH, {
        soDiem: values.soDiem,
        moTa: values.moTa || 'Cập nhật điểm thủ công',
      })
      setDiemModalOpen(false)
      formDiem.resetFields()
      await loadDanhSach()
      const moi = await layChiTietKhachHang(khachHangChiTiet.maKH)
      setKhachHangChiTiet(moi?.data || moi)
    } catch {
      message.error('Không thể cập nhật điểm khách hàng.')
    } finally {
      setDangLuuDiem(false)
    }
  }

  const cotBang = useMemo(() => [
    {
      title: 'Khách hàng',
      key: 'khachHang',
      render: (_, r) => (
        <Space>
          <UserOutlined className="text-slate-400" />
          <div>
            <div className="font-semibold">{r.tenKH || '--'}</div>
            <Text type="secondary" className="text-xs">{r.maKH}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'sdt',
      key: 'sdt',
      render: (v) => v || '--',
    },
    {
      title: 'Phân loại',
      dataIndex: 'coTaiKhoan',
      key: 'coTaiKhoan',
      render: (co) => (co
        ? <Tag color="purple">Có tài khoản</Tag>
        : <Tag color="orange">Vãng lai</Tag>),
    },
    {
      title: 'Điểm tích lũy',
      dataIndex: 'diemTichLuy',
      key: 'diemTichLuy',
      align: 'right',
      render: (d) => <Text strong className={(Number(d) || 0) > 0 ? 'text-orange-600' : 'text-slate-500'}>{d?.toLocaleString() ?? 0}</Text>,
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openChiTiet(r.maKH)}>
            Chi tiết
          </Button>
          <Button size="small" type="primary" onClick={() => { openChiTiet(r.maKH); setDiemModalOpen(true); }}>
            Cập nhật điểm
          </Button>
        </Space>
      ),
    },
  ], [])

  return (
    <div className="space-y-4">
      <Row gutter={12} align="middle">
        <Col flex="auto">
          <Input
            placeholder="Tìm theo tên, mã KH, SĐT..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={tuKhoa}
            onChange={(e) => { setTuKhoa(e.target.value); setPhanTrang((p) => ({ ...p, trang: 1 })) }}
            allowClear
          />
        </Col>
        <Col>
          <Space>
            {PHAN_LOAI_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type={phanLoai === opt.value ? 'primary' : 'default'}
                onClick={() => { setPhanLoai(opt.value); setPhanTrang((p) => ({ ...p, trang: 1 })) }}
              >
                {opt.label}
              </Button>
            ))}
          </Space>
        </Col>
      </Row>

      <Spin spinning={dangTai}>
        <Table
          columns={cotBang}
          dataSource={danhSach}
          rowKey="maKH"
          pagination={{
            current: phanTrang.trang,
            pageSize: phanTrang.soLuong,
            total: phanTrang.tong,
            showSizeChanger: true,
            showTotal: (t, range) => `${range[0]}-${range[1]} / ${t} khách hàng`,
            onChange: (trang, soLuong) => setPhanTrang({ trang, soLuong }),
          }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có khách hàng nào" /> }}
        />
      </Spin>

      <Modal
        title="Cập nhật điểm tích lũy"
        open={diemModalOpen}
        onCancel={() => { setDiemModalOpen(false); formDiem.resetFields() }}
        footer={null}
      >
        <Form form={formDiem} layout="vertical" onFinish={luuDiem}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="soDiem" label="Số điểm thay đổi (âm để trừ)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} placeholder="VD: 100 hoặc -50" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="moTa" label="Mô tả">
                <Input placeholder="Lý do thay đổi" />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Hiện tại: <strong>{khachHangChiTiet?.diemTichLuy?.toLocaleString() ?? 0}</strong> điểm
          </Text>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setDiemModalOpen(false); formDiem.resetFields() }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={dangLuuDiem}>Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={chiTietOpen}
        title="Chi tiết khách hàng"
        onClose={() => setChiTietOpen(false)}
        size={600}
      >
        {khachHangChiTiet && (
          <Space orientation="vertical" style={{ width: '100%' }} size={16}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Text type="secondary">Mã KH</Text>
                <div><Text strong>{khachHangChiTiet.maKH}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Phân loại</Text>
                <div>
                  {khachHangChiTiet.coTaiKhoan
                    ? <Tag color="purple">Có tài khoản</Tag>
                    : <Tag color="orange">Vãng lai</Tag>}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Họ tên</Text>
                <div><Text strong>{khachHangChiTiet.tenKH}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Số điện thoại</Text>
                <div><Text>{khachHangChiTiet.sdt || 'Không có'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Địa chỉ</Text>
                <div><Text>{khachHangChiTiet.diaChi || 'Không có'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Điểm tích lũy</Text>
                <div><Text strong style={{ color: (Number(khachHangChiTiet.diemTichLuy) || 0) > 0 ? '#fa8c16' : '#64748b', fontSize: 16 }}>{khachHangChiTiet.diemTichLuy?.toLocaleString() ?? 0}</Text></div>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            <Text strong>Lịch sử đặt bàn ({lichSu.datBan.length})</Text>
            {dangTaiLichSu ? (
              <Text type="secondary">Đang tải...</Text>
            ) : lichSu.datBan.length === 0 ? (
              <Text type="secondary">Chưa có lịch sử đặt bàn</Text>
            ) : (
              <List
                size="small"
                dataSource={lichSu.datBan}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <div style={{ width: '100%' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text>{item.tenBan || 'Bàn'} - {item.soNguoi} người</Text>
                        <Tag color={TRANG_THAI_DATBAN_MAP[item.trangThai]?.color || 'default'}>
                          {TRANG_THAI_DATBAN_MAP[item.trangThai]?.label || item.trangThai}
                        </Tag>
                      </Space>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.ngayDen ? dayjs(item.ngayDen).format('DD/MM/YYYY') : ''} {item.gioDen || ''}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}

            <Divider style={{ margin: '8px 0' }} />

            <Text strong>Lịch sử đơn hàng ({lichSu.donHang.length})</Text>
            {dangTaiLichSu ? (
              <Text type="secondary">Đang tải...</Text>
            ) : lichSu.donHang.length === 0 ? (
              <Text type="secondary">Chưa có đơn hàng</Text>
            ) : (
              <List
                size="small"
                dataSource={lichSu.donHang}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <div style={{ width: '100%' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text>{item.tenBan || 'Không rõ bàn'} - {item.tongTien?.toLocaleString()} VND</Text>
                        <Tag color={TRANG_THAI_DONHANG_MAP[item.trangThai]?.color || 'default'}>
                          {TRANG_THAI_DONHANG_MAP[item.trangThai]?.label || item.trangThai}
                        </Tag>
                      </Space>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.ngayDonHang ? dayjs(item.ngayDonHang).format('DD/MM/YYYY HH:mm') : ''}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Space>
        )}
      </Drawer>
    </div>
  )
}

export default NoiBoKhachHangPage