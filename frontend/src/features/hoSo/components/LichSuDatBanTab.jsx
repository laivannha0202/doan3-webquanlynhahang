import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs } from 'antd'
import { dinhDangNgay } from '../../noiBo/dinhDang'
import { useLichSuDatBan } from '../hooks/useLichSuDatBan'
import { layNhanTrangThai, tinhTrangThaiHienThi } from '../utils/lichSuDatBanUtils'

const BookingCalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const GuestIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 19c1.6-3 4-4.5 7-4.5s5.4 1.5 7 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const AreaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 20s6-4.8 6-10a6 6 0 1 0-12 0c0 5.2 6 10 6 10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
  </svg>
)

const ChevronIcon = ({ expanded }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ width: 16, height: 16, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const formatCurrency = (amount) => {
  if (amount == null) return '0đ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const layTenMonHienThi = (mon) => String(
  mon?.tenMon
    || mon?.TenMon
    || mon?.tenMonAn
    || mon?.TenMonAn
    || mon?.monAn?.tenMon
    || mon?.monAn?.TenMon
    || mon?.ten
    || mon?.name
    || mon?.maMon
    || mon?.MaMon
    || 'Món đang cập nhật',
).trim()

const layGiaMon = (mon) => Number(mon?.gia ?? mon?.donGia ?? mon?.DonGia ?? mon?.priceValue ?? 0)

const laySoLuongMon = (mon) => Number(mon?.soLuong ?? mon?.SoLuong ?? mon?.quantity ?? 1)

const layThanhTienMon = (mon) => Number(mon?.thanhTien ?? mon?.ThanhTien ?? layGiaMon(mon) * laySoLuongMon(mon))

const BookingCard = ({ booking, onCancelBooking, onRebook, hienThiNutHuy, hienThiNutDatLai }) => {
  const [chiTietMoRong, setChiTietMoRong] = useState(null)
  const toggleChiTiet = (key) => setChiTietMoRong(prev => prev === key ? null : key)

  const cardKey = booking.bookingCode || booking.id || booking.bookingId || `${booking.date}-${booking.time}`
  const moRong = chiTietMoRong === cardKey

  const { status: displayStatus, isExpired } = tinhTrangThaiHienThi(booking, new Date())
  const statusHienThi = booking.hienThiTrangThai || displayStatus
  const daHetHan = booking.isExpired !== undefined ? booking.isExpired : isExpired
  const { label: statusLabel, tone: statusTone } = layNhanTrangThai(daHetHan ? 'KHONG_DEN' : statusHienThi)
  const finalStatusLabel = daHetHan ? 'Quá hạn' : statusLabel

  const danhSachMon = booking.menuItems || booking.chiTietMonAn || []
  const coMonAn = Array.isArray(danhSachMon) && danhSachMon.length > 0
  const tongTien = danhSachMon.reduce((sum, mon) => sum + layThanhTienMon(mon), 0)

  const coTheHuy = hienThiNutHuy && !daHetHan && ['CHO_XAC_NHAN', 'DA_XAC_NHAN'].includes(statusHienThi)

  return (
    <div className="ho-so-history-card">
      <div className="ho-so-history-header">
        <strong>{booking.bookingCode}</strong>
        <span className={`nhan-trang-thai tone-${isExpired ? 'danger' : statusTone}`}>{finalStatusLabel}</span>
      </div>

      <div className="ho-so-history-meta-grid">
        <div className="ho-so-history-meta-item">
          <span className="ho-so-history-meta-icon"><BookingCalendarIcon /></span>
          <div>
            <span>Ngày giờ</span>
            <strong>{dinhDangNgay(booking.date)} • {booking.time}</strong>
          </div>
        </div>

        <div className="ho-so-history-meta-item">
          <span className="ho-so-history-meta-icon"><GuestIcon /></span>
          <div>
            <span>Số khách</span>
            <strong>{booking.guestCount || booking.guests || 0} người</strong>
          </div>
        </div>

        <div className="ho-so-history-meta-item">
          <span className="ho-so-history-meta-icon"><AreaIcon /></span>
          <div>
            <span>Khu vực</span>
            <strong>{booking.area || booking.seatingArea || 'Không ưu tiên'}</strong>
          </div>
        </div>
      </div>

      {coMonAn && (
        <div className="ho-so-history-detail-toggle">
          <button
            type="button"
            className="btn ho-so-action-btn ho-so-action-btn--detail"
            onClick={() => toggleChiTiet(cardKey)}
          >
            <span>Xem chi tiết món đã đặt</span>
            <ChevronIcon expanded={moRong} />
          </button>

          {moRong && (
            <div className="ho-so-history-mon-an">
              <table className="ho-so-mon-table">
                <thead>
                  <tr>
                    <th>Món</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSachMon.map((mon, idx) => (
                    <tr key={mon.id || mon.idMon || idx}>
                      <td>{layTenMonHienThi(mon)}</td>
                      <td>{laySoLuongMon(mon)}</td>
                      <td>{formatCurrency(layGiaMon(mon))}</td>
                      <td>{formatCurrency(layThanhTienMon(mon))}</td>
                    </tr>
                  ))}
                </tbody>
                {tongTien > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={3}><strong>Tạm tính món</strong></td>
                      <td><strong>{formatCurrency(tongTien)}</strong></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      )}

      <div className="ho-so-history-actions">
        {coTheHuy && (
          <button
            type="button"
            className="btn ho-so-action-btn ho-so-action-btn--danger"
            onClick={() => onCancelBooking(booking.bookingCode, statusHienThi)}
          >
            Hủy đặt bàn
          </button>
        )}

        {hienThiNutDatLai && (
          <button
            type="button"
            className="btn ho-so-action-btn ho-so-action-btn--rebook"
            onClick={() => onRebook(booking)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ width: 18, height: 18 }}>
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M9 14l1.5 1.5L15 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Đặt lại
          </button>
        )}
      </div>
    </div>
  )
}

const EmptyState = ({ message, description }) => (
  <div className="ho-so-empty-state">
    <div className="ho-so-empty-icon">
      <BookingCalendarIcon />
    </div>
    <h3>{message}</h3>
    <p>{description}</p>
    <Link to="/dat-ban" className="btn nut-chinh ho-so-empty-action">
      Đặt bàn ngay
    </Link>
  </div>
)

function LichSuDatBanTab({ bookings, onCancelBooking, onRebook }) {
  const { upcomingBookings, historyBookings } = useLichSuDatBan(bookings)

  const tabItems = [
    {
      key: 'upcoming',
      label: (
        <span className="ho-so-tab-label">
          Đơn sắp tới
          {upcomingBookings.length > 0 && (
            <span className="ho-so-tab-badge">{upcomingBookings.length}</span>
          )}
        </span>
      ),
      children: upcomingBookings.length === 0 ? (
        <EmptyState
          title="Không có đơn sắp tới"
          description="Bạn chưa có đơn đặt bàn nào sắp diễn ra."
        />
      ) : (
        <div className="ho-so-history-grid">
          {upcomingBookings.map((booking) => (
            <BookingCard
              key={booking.bookingCode || booking.id}
              booking={booking}
              onCancelBooking={onCancelBooking}
              onRebook={onRebook}
              hienThiNutHuy
              hienThiNutDatLai={false}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <span className="ho-so-tab-label">
          Lịch sử đặt bàn
          {historyBookings.length > 0 && (
            <span className="ho-so-tab-badge ho-so-tab-badge--muted">{historyBookings.length}</span>
          )}
        </span>
      ),
      children: historyBookings.length === 0 ? (
        <EmptyState
          title="Bạn chưa có lịch sử đặt bàn"
          description="Những đơn đã hoàn thành, đã hủy hoặc quá hạn sẽ hiển thị tại đây."
        />
      ) : (
        <div className="ho-so-history-grid">
          {historyBookings.map((booking) => (
            <BookingCard
              key={booking.bookingCode || booking.id}
              booking={booking}
              onCancelBooking={onCancelBooking}
              onRebook={onRebook}
              hienThiNutHuy={false}
              hienThiNutDatLai
            />
          ))}
        </div>
      ),
    },
  ]

  return (
    <article className="ho-so-card">
      <div className="ho-so-section-heading">
        <div>
          <h2>Quản lý đặt bàn</h2>
          <p>Xem và quản lý các đơn đặt bàn của bạn.</p>
        </div>
      </div>

      <Tabs
        items={tabItems}
        defaultActiveKey="upcoming"
        className="ho-so-booking-tabs"
      />
    </article>
  )
}

export default LichSuDatBanTab