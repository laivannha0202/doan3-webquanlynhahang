import { useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Card, Col, Empty, Form, Input, InputNumber, Modal, Popconfirm, QRCode, Row, Segmented, Select, Space, Statistic, Table, Tag, Tooltip, Typography, message } from 'antd'
import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined, PrinterOutlined, QrcodeOutlined, TableOutlined } from '@ant-design/icons'
import { capNhatBanApi, layDanhSachBanApi, layQrBanApi, taoBanApi, xoaBanApi } from '../../services/api/apiBanAn'
import { layOrderDangMoTaiBanApi, layTenMonTrongChiTietOrder, xacNhanThanhToanTaiBanApi } from '../../services/api/apiBanAn'
import { chuanHoaTrangThaiBan } from '../../constants/trangThaiBan'
import { laySacThaiDonHang } from '../../utils/donHang'
import { DANH_SACH_TEN_KHU_VUC_BAN, chuanHoaTenKhuVucBan } from '../../constants/khuVucBan'
import { dinhDangTienTeVietNam } from '../../utils/tienTe'

const DANH_SACH_KHU_VUC = DANH_SACH_TEN_KHU_VUC_BAN
const NHAN_TRANG_THAI = {
  TRONG: { label: 'TRỐNG', color: 'green' },
  DA_DAT: { label: 'ĐÃ ĐẶT', color: 'orange' },
  CO_KHACH: { label: 'ĐANG PHỤC VỤ', color: 'red' },
  BAO_TRI: { label: 'BẢO TRÌ', color: 'default' },
}

const trangThaiNoiBo = (trangThai) => chuanHoaTrangThaiBan(trangThai)

function NoiBoQuanLyBanPage() {
  const [danhSachBan, setDanhSachBan] = useState([])
  const [dangTai, setDangTai] = useState(true)
  const [boLocTrangThai, setBoLocTrangThai] = useState('ALL')
  const [boLocKhuVuc, setBoLocKhuVuc] = useState('Tất cả')
  const [dangMoForm, setDangMoForm] = useState(false)
  const [banDangSua, setBanDangSua] = useState(null)
  const [qrDangXem, setQrDangXem] = useState(null)
  const [orderDangXem, setOrderDangXem] = useState(null)
  const [dangXuLy, setDangXuLy] = useState('')
  const [form] = Form.useForm()

  const taiLai = async () => {
    setDangTai(true)
    try {
      const { duLieu } = await layDanhSachBanApi()
      setDanhSachBan(Array.isArray(duLieu) ? duLieu : [])
    } finally {
      setDangTai(false)
    }
  }

  useEffect(() => {
    taiLai()

    if (dangMoForm || orderDangXem || qrDangXem) {
      return undefined
    }

    const intervalId = window.setInterval(() => taiLai(), 3000)
    return () => window.clearInterval(intervalId)
  }, [dangMoForm, orderDangXem, qrDangXem])

  const thongKe = useMemo(() => ({
    tong: danhSachBan.length,
    trong: danhSachBan.filter((ban) => trangThaiNoiBo(ban.status) === 'TRONG').length,
    giuCho: danhSachBan.filter((ban) => trangThaiNoiBo(ban.status) === 'DA_DAT').length,
    coKhach: danhSachBan.filter((ban) => trangThaiNoiBo(ban.status) === 'CO_KHACH').length,
    canDon: danhSachBan.filter((ban) => trangThaiNoiBo(ban.status) === 'BAO_TRI').length,
  }), [danhSachBan])

  const danhSachHienThi = useMemo(() => danhSachBan.filter((ban) => {
    const matchTrangThai = boLocTrangThai === 'ALL' || trangThaiNoiBo(ban.status) === boLocTrangThai
    const matchKhuVuc = boLocKhuVuc === 'Tất cả' || (ban.rawAreaText || '').includes(boLocKhuVuc)
    return matchTrangThai && matchKhuVuc
  }), [boLocKhuVuc, boLocTrangThai, danhSachBan])

  const moModalThem = () => {
    setBanDangSua(null)
    form.setFieldsValue({ maBan: '', tenBan: '', soBan: undefined, khuVuc: 'Trong nhà', sucChua: 4, ghiChu: '' })
    setDangMoForm(true)
  }

  const moModalSua = (ban) => {
    setBanDangSua(ban)
    form.setFieldsValue({ maBan: ban.code, tenBan: ban.name, soBan: ban.tableNumber || ban.soBan, khuVuc: chuanHoaTenKhuVucBan(ban.rawAreaText), sucChua: ban.capacity, ghiChu: ban.note || '' })
    setDangMoForm(true)
  }

  const luuBan = async (values) => {
    const payload = {
      maBan: banDangSua ? values.maBan : undefined,
      tenBan: values.tenBan,
      khuVuc: values.khuVuc,
      soChoNgoi: Number(values.sucChua),
      ghiChu: values.ghiChu || '',
      soBan: Number(values.soBan || 0),
      viTri: values.khuVuc,
    }

    try {
      if (banDangSua) {
        await capNhatBanApi(banDangSua.code, payload)
      } else {
        await taoBanApi(payload)
      }
      message.success(banDangSua ? 'Đã cập nhật bàn.' : 'Đã thêm bàn mới.')
      setBanDangSua(null)
      setDangMoForm(false)
      form.resetFields()
      await taiLai()
    } catch (loi) {
      message.error(loi?.message || 'Không thể lưu bàn.')
    }
  }

  const moQr = async (ban) => {
    const { duLieu } = await layQrBanApi(ban.code)
    setQrDangXem(duLieu)
  }

  const taiQrVe = () => {
    if (!qrDangXem?.qrBase64) return
    const a = document.createElement('a')
    a.href = qrDangXem.qrBase64
    a.download = `${qrDangXem.tenBan || qrDangXem.maBan || 'qr-ban'}.png`
    a.click()
  }

  const moOrder = async (ban) => {
    const { duLieu } = await layOrderDangMoTaiBanApi(ban.code)
    const danhSachChiTiet = duLieu?.chiTiet || duLieu?.ChiTiet || []
    const trangThaiDonHang = duLieu?.donHang?.trangThai || duLieu?.DonHang?.TrangThai || duLieu?.trangThai || duLieu?.TrangThai || ''
    const coOrderDangMo = laySacThaiDonHang(trangThaiDonHang) === 'warning'
      && Boolean(duLieu?.DonHang || duLieu?.donHang || (Array.isArray(danhSachChiTiet) && danhSachChiTiet.length))
    setOrderDangXem({ ban, duLieu: coOrderDangMo ? duLieu : null, khongCoOrder: !coOrderDangMo })
  }

  const xoaBan = async (ban) => {
    await xoaBanApi(ban.code)
    await taiLai()
  }

  const xacNhanThanhToan = async (ban) => {
    setDangXuLy(ban.code)
    try {
      await xacNhanThanhToanTaiBanApi(ban.code)
      setOrderDangXem(null)
      await taiLai()
    } catch (error) {
      const thongBao = error?.message || 'Không thể xác nhận thanh toán.'
      if (String(thongBao).includes('403') || String(thongBao).includes('Forbidden') || String(thongBao).includes('thu ngan') || String(thongBao).includes('xác nhận thanh toán')) {
        message.warning('Chỉ thu ngân hoặc quản lý được xác nhận thanh toán.')
      } else {
        message.error(thongBao)
      }
    } finally {
      setDangXuLy('')
    }
  }

  const cotBan = [
    {
      title: 'Bàn',
      dataIndex: 'name',
      key: 'name',
      render: (_, ban) => (
        <Space>
          <Avatar icon={<TableOutlined />} style={{ background: '#f07d5c' }} />
          <div>
            <Typography.Text strong>{ban.name}</Typography.Text>
            <div><Typography.Text type="secondary">{ban.code} • Số {ban.tableNumber || ban.soBan || '--'} • {ban.rawAreaText || 'Trong nhà'} • {ban.capacity} người</Typography.Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, ban) => {
        const trangThai = NHAN_TRANG_THAI[trangThaiNoiBo(ban.status)]
        return <Tag color={trangThai.color}>{trangThai.label}</Tag>
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (value) => value || '---',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, ban) => {
        const coTheXoa = trangThaiNoiBo(ban.status) === 'TRONG'
        const canXacNhanThanhToan = false
        return (
          <Space wrap>
            <Button icon={<EyeOutlined />} onClick={() => moOrder(ban)}>Xem order</Button>
            <Button icon={<QrcodeOutlined />} onClick={() => moQr(ban)}>QR Code</Button>
            <Button icon={<EditOutlined />} onClick={() => moModalSua(ban)}>Sửa</Button>
            <Tooltip title={coTheXoa ? '' : 'Bàn đang có khách'}>
              <span>
                <Popconfirm title="Xóa bàn này?" onConfirm={() => xoaBan(ban)} disabled={!coTheXoa}>
                  <Button icon={<DeleteOutlined />} danger disabled={!coTheXoa}>Xóa</Button>
                </Popconfirm>
              </span>
            </Tooltip>
            {canXacNhanThanhToan ? <Button type="primary" loading={dangXuLy === ban.code} onClick={() => xacNhanThanhToan(ban)}>Xác nhận thanh toán</Button> : null}
          </Space>
        )
      },
    },
  ]

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Tổng bàn" value={thongKe.tong} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Trống" value={thongKe.trong} styles={{ content: { color: '#059669' } }} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Đã đặt" value={thongKe.giuCho} styles={{ content: { color: '#d97706' } }} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Đang phục vụ" value={thongKe.coKhach} styles={{ content: { color: '#dc2626' } }} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Bảo trì" value={thongKe.canDon} /></Card></Col>
      </Row>

      <Card title="Quản lý bàn" extra={<Button type="primary" icon={<PlusOutlined />} onClick={moModalThem}>Thêm bàn</Button>}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Segmented options={[{ label: 'Tất cả', value: 'ALL' }, { label: 'Trống', value: 'TRONG' }, { label: 'Đã đặt', value: 'DA_DAT' }, { label: 'Đang phục vụ', value: 'CO_KHACH' }, { label: 'Bảo trì', value: 'BAO_TRI' }]} value={boLocTrangThai} onChange={setBoLocTrangThai} />
          <Select value={boLocKhuVuc} onChange={setBoLocKhuVuc} style={{ minWidth: 180 }} options={['Tất cả', ...DANH_SACH_KHU_VUC].map((muc) => ({ label: muc, value: muc }))} />
        </Space>
        <Table rowKey="code" loading={dangTai} columns={cotBan} dataSource={danhSachHienThi} pagination={{ pageSize: 8 }} scroll={{ x: 920 }} />
      </Card>

      <Modal open={Boolean(qrDangXem)} title={qrDangXem?.tenBan} footer={null} onCancel={() => setQrDangXem(null)}>
        {qrDangXem ? (
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Typography.Text type="secondary">{qrDangXem.khuVuc}</Typography.Text>
            <div style={{ display: 'flex', justifyContent: 'center' }}><QRCode value={qrDangXem.url || ''} size={240} /></div>
            <Typography.Paragraph copyable={{ text: qrDangXem.url }} style={{ marginBottom: 0 }}>{qrDangXem.url}</Typography.Paragraph>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={taiQrVe}>Tải QR về</Button>
              <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>In QR</Button>
            </Space>
          </Space>
        ) : null}
      </Modal>

      <Modal open={Boolean(orderDangXem)} title={orderDangXem ? `Order của ${orderDangXem.ban.name}` : 'Order'} onCancel={() => setOrderDangXem(null)} footer={null} size={720}>
        {orderDangXem ? (
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            {orderDangXem.khongCoOrder ? (
              <Card variant="borderless"><Empty description="Bàn này hiện chưa có order đang mở." /></Card>
            ) : (
              <>
                <Table
                  rowKey={(row) => String(row.MaChiTiet || row.maChiTiet || `${row.MaMon || row.maMon || 'mon'}-${row.TenMon || row.tenMon || 'ten'}`)}
                  pagination={false}
                  dataSource={orderDangXem.duLieu?.chiTiet || orderDangXem.duLieu?.ChiTiet || []}
                  columns={[
                    { title: 'Tên món', dataIndex: 'TenMon', key: 'TenMon', render: (_, row) => layTenMonTrongChiTietOrder(row) || row.maMon || row.MaMon || 'Món đang cập nhật' },
                    { title: 'Số lượng', dataIndex: 'SoLuong', key: 'SoLuong', width: 100, render: (_, row) => `x${row.SoLuong || row.soLuong}` },
                    { title: 'Thành tiền', dataIndex: 'ThanhTien', key: 'ThanhTien', width: 140, render: (_, row) => dinhDangTienTeVietNam(row.ThanhTien || row.thanhTien) },
                  ]}
                />
                <Space orientation="vertical" size={6} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text>Tạm tính món</Typography.Text>
                    <Typography.Text>{dinhDangTienTeVietNam(orderDangXem.duLieu?.tamTinh || orderDangXem.duLieu?.tongTienMon || 0)}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text>Phí dịch vụ</Typography.Text>
                    <Typography.Text>{dinhDangTienTeVietNam(orderDangXem.duLieu?.phiDichVu || 0)}</Typography.Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text strong>Tổng thanh toán</Typography.Text>
                    <Typography.Text strong>{dinhDangTienTeVietNam(orderDangXem.duLieu?.tongThanhToan || orderDangXem.duLieu?.tamTinh || 0)}</Typography.Text>
                  </div>
                </Space>
              </>
            )}
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={() => setOrderDangXem(null)}>Đóng</Button>
              {!orderDangXem.khongCoOrder ? <Button type="primary" onClick={() => xacNhanThanhToan(orderDangXem.ban)}>Xác nhận thanh toán</Button> : null}
            </Space>
          </Space>
        ) : null}
      </Modal>

      <Modal open={dangMoForm} footer={null} onCancel={() => { setBanDangSua(null); setDangMoForm(false); form.resetFields(); }} title={banDangSua ? 'Sửa bàn' : 'Thêm bàn mới'} destroyOnHidden>
        <Form layout="vertical" form={form} onFinish={luuBan}>
          {banDangSua ? <Form.Item label="Mã bàn" name="maBan"><Input readOnly /></Form.Item> : null}
          <Form.Item label="Tên bàn" name="tenBan" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item
            label="Số bàn"
            name="soBan"
            rules={[
              { required: true, message: 'Vui lòng nhập số bàn.' },
              {
                validator: (_, giaTri) => {
                  if (!giaTri) return Promise.resolve()
                  const soBanMoi = Number(giaTri)
                  const biTrungSoBan = danhSachBan.some((ban) => Number(ban.tableNumber || ban.soBan || 0) === soBanMoi && (!banDangSua || String(ban.code) !== String(banDangSua.code)))
                  return biTrungSoBan ? Promise.reject(new Error(`Số bàn ${soBanMoi} đã tồn tại.`)) : Promise.resolve()
                },
              },
            ]}
          ><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Khu vực" name="khuVuc" rules={[{ required: true }]}><Select options={DANH_SACH_KHU_VUC.map((muc) => ({ label: muc, value: muc }))} /></Form.Item>
          <Form.Item label="Sức chứa" name="sucChua" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Ghi chú" name="ghiChu"><Input /></Form.Item>
          <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => { setBanDangSua(null); setDangMoForm(false); form.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu bàn</Button>
          </Space>
        </Form>
      </Modal>
    </Space>
  )
}

export default NoiBoQuanLyBanPage
