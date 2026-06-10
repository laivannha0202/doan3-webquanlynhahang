import { Card, Col, Row, Typography } from 'antd'
import DashboardEmptyState from './DashboardEmptyState'

const dinhDangSoNguyen = (value) => (Number(value) || 0).toLocaleString('vi-VN')

const layMoTaMacDinh = (mucUuTien) => {
  const giaTri = Number(mucUuTien?.value) || 0

  switch (mucUuTien?.key) {
    case 'pending-bookings':
      return giaTri > 0
        ? 'Cần liên hệ khách và chốt xác nhận sớm.'
        : 'Hiện không còn booking nào chờ xác nhận.'
    case 'unassigned-bookings':
      return giaTri > 0
        ? 'Ưu tiên phân bàn trước khi khách đến.'
        : 'Các booking ưu tiên đã có bàn phù hợp.'
    case 'arriving-soon':
      return giaTri > 0
        ? 'Kiểm tra host, bàn và ghi chú phục vụ.'
        : 'Chưa có lượt khách sắp đến cần chuẩn bị.'
    case 'dirty-tables':
      return giaTri > 0
        ? 'Cần dọn hoặc xử lý bảo trì trước khi nhận lượt mới.'
        : 'Không có bàn nào đang chờ xử lý lúc này.'
    default:
      return giaTri > 0
        ? 'Đây là nhóm việc cần theo dõi ngay.'
        : 'Khối này sẽ tự cập nhật khi có việc phát sinh.'
  }
}

function HanhDongUuTien({ urgentTasks, loading = false }) {
  const danhSachMucUuTien = Array.isArray(urgentTasks) ? urgentTasks : []

  if (loading) {
    return <Card className="noi-bo-dashboard-card" title="Cần xử lý ngay" loading styles={{ body: { padding: '14px' } }} />
  }

  return (
    <Card className="noi-bo-dashboard-card" title="Cần xử lý ngay" styles={{ body: { padding: '14px' } }}>
      {danhSachMucUuTien.length > 0 ? (
        <Row className="noi-bo-dashboard-priority-grid" gutter={[12, 12]}>
          {danhSachMucUuTien.map((mucUuTien) => (
            <Col key={mucUuTien.key} xs={24} sm={12} md={12} xl={6}>
              <Card
                className={`noi-bo-dashboard-priority-card noi-bo-dashboard-priority-card--${mucUuTien.tone || 'neutral'}`}
                size="small"
                styles={{ body: { height: '100%', padding: 16 } }}
              >
                <div className="noi-bo-dashboard-priority-card__content">
                  <Typography.Text className="noi-bo-dashboard-priority-card__title">
                    {mucUuTien.title}
                  </Typography.Text>
                  <Typography.Title level={2} className="noi-bo-dashboard-priority-card__value">
                    {dinhDangSoNguyen(mucUuTien.value)}
                  </Typography.Title>
                  <Typography.Text className="noi-bo-dashboard-priority-card__detail">
                    {mucUuTien.detail || layMoTaMacDinh(mucUuTien)}
                  </Typography.Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <DashboardEmptyState
          compact
          title="Chưa có việc ưu tiên cần xử lý"
          description="Các đầu việc cần chú ý sẽ xuất hiện tại đây khi có phát sinh mới."
        />
      )}
    </Card>
  )
}

export default HanhDongUuTien
