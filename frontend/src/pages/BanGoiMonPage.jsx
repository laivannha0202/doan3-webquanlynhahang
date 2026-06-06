import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import TheMonAn from '../features/thucDon/components/TheMonAn'
import { useThongBao } from '../context/ThongBaoContext'
import { layOrderDangMoTaiBanApi, layThucDonTheoBanApi, guiOrderTaiBanApi, guiYeuCauThanhToanTaiBanApi } from '../services/api/apiBanAn'
import { laySacThaiDonHang } from '../utils/donHang'
import { HOME_CAC_DANH_MUC_THUC_DON } from '../features/thucDon/constants/danhMucThucDon'
import { layAnhMonTheoTen } from '../features/thucDon/constants/anhMonAn'
import { chuanHoaDanhMucThucDon } from '../services/mappers/anhXaThucDon'
import { dinhDangTienTeVietNam } from '../utils/tienTe'

const STORAGE_KEY_PREFIX = 'ban_order_draft_'

const layTenMonHienThi = (mon = {}) => mon.tenMon || mon.TenMon || mon.maMon || mon.MaMon || 'Món chưa có tên'
const layMoTaMonHienThi = (mon = {}) => mon.moTa || mon.MoTa || 'Nhà hàng đang cập nhật mô tả cho món này.'
const layDanhMucMonHienThi = (mon = {}) => chuanHoaDanhMucThucDon(mon.maDanhMuc || mon.MaDanhMuc || mon.danhMuc || mon.category || '')
const layAnhMonHienThi = (mon = {}) => layAnhMonTheoTen(layTenMonHienThi(mon), layDanhMucMonHienThi(mon))

function BanGoiMonPage() {
  const { maBan } = useParams()
  const { hienThanhCong, hienLoi, hienThongTin } = useThongBao()
  const [banInfo, setBanInfo] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [tab, setTab] = useState('menu')
  const [gioTam, setGioTam] = useState([])
  const [orderDangMo, setOrderDangMo] = useState(null)
  const [yeuCauThanhToan, setYeuCauThanhToan] = useState(false)
  const [loi, setLoi] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [thucDonRes, orderRes] = await Promise.all([
          layThucDonTheoBanApi(maBan),
          layOrderDangMoTaiBanApi(maBan),
        ])
        const duLieuThucDon = thucDonRes?.duLieu || {}
        const danhSachMon = Array.isArray(duLieuThucDon?.data)
          ? duLieuThucDon.data
          : Array.isArray(duLieuThucDon?.monAn)
            ? duLieuThucDon.monAn
            : Array.isArray(duLieuThucDon)
              ? duLieuThucDon
              : []

        setBanInfo(duLieuThucDon?.ban || null)
        setMenuItems(danhSachMon)
        const trangThaiDonHang = orderRes?.duLieu?.donHang?.trangThai || orderRes?.duLieu?.DonHang?.TrangThai || orderRes?.duLieu?.trangThai || orderRes?.duLieu?.TrangThai || ''
        const laDonHangDangMo = laySacThaiDonHang(trangThaiDonHang) === 'warning'
        setOrderDangMo(laDonHangDangMo ? (orderRes?.duLieu?.donHang || orderRes?.duLieu || null) : null)
      } catch (error) {
        if ((error?.message || '').toLowerCase().includes('không tồn tại') || (error?.message || '').toLowerCase().includes('not found')) {
          setLoi('Bàn không tồn tại hoặc QR code không hợp lệ')
          return
        }
        setLoi('Không thể tải dữ liệu bàn lúc này')
      }
    }

    const khoaBanNhapTam = `${STORAGE_KEY_PREFIX}${maBan}`
    const draft = sessionStorage.getItem(khoaBanNhapTam)
    if (draft) {
      try {
        const gioTamDaLuu = JSON.parse(draft)
        setGioTam(Array.isArray(gioTamDaLuu) ? gioTamDaLuu : [])
      } catch {
        sessionStorage.removeItem(khoaBanNhapTam)
      }
    }

    load()
  }, [maBan])

  useEffect(() => {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${maBan}`, JSON.stringify(gioTam))
  }, [gioTam, maBan])

  const tongTien = useMemo(() => gioTam.reduce((tong, item) => tong + item.gia * item.soLuong, 0), [gioTam])
  const soBanHienThi = Number(banInfo?.soBan ?? String(maBan).replace(/^B/i, ''))
  const tenBanHienThi = banInfo?.tenBan?.trim() || `Bàn ${soBanHienThi}`

  const danhSachDanhMuc = useMemo(
    () => HOME_CAC_DANH_MUC_THUC_DON.map((danhMuc) => ({
      ...danhMuc,
      danhSachMon: menuItems.filter((mon) => layDanhMucMonHienThi(mon) === danhMuc.name),
    })).filter((danhMuc) => danhMuc.danhSachMon.length > 0),
    [menuItems],
  )

  const themMon = (mon) => {
    const maMon = mon.maMon || mon.MaMon
    const tenMon = layTenMonHienThi(mon)
    const giaMon = Number(mon.gia ?? mon.Gia ?? 0)
    const hinhAnh = layAnhMonHienThi(mon)

    setGioTam((current) => {
      const daCo = current.find((item) => item.maMon === maMon)
      if (!daCo) return [...current, { maMon, tenMon, gia: giaMon, hinhAnh, soLuong: 1 }]
      return current.map((item) => item.maMon === maMon ? { ...item, soLuong: item.soLuong + 1 } : item)
    })
    setTab('cart')
    hienThanhCong(`${tenMon} đã được thêm vào giỏ tạm.`, 'Đã thêm món')
  }

  const doiSoLuong = (maMon, delta) => {
    setGioTam((current) => current.reduce((acc, item) => {
      if (item.maMon !== maMon) { acc.push(item); return acc }
      const next = item.soLuong + delta
      if (next > 0) acc.push({ ...item, soLuong: next })
      return acc
    }, []))
  }

  const guiOrder = async () => {
    try {
      const ketQua = await guiOrderTaiBanApi(maBan, gioTam.map((item, index) => ({ maChiTiet: `CTBAN_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 6)}`, maMon: item.maMon, soLuong: item.soLuong })))
      setOrderDangMo(ketQua.data?.donHang || ketQua.duLieu?.donHang || ketQua.data || ketQua.duLieu)
      setGioTam([])
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${maBan}`)
      hienThanhCong('Đã gửi order xuống bếp.', 'Gửi order thành công')
    } catch (error) {
      hienLoi(error?.message || 'Không thể gửi order lúc này.')
    }
  }

  const yeuCauBill = async () => {
    try {
      await guiYeuCauThanhToanTaiBanApi(maBan)
      setYeuCauThanhToan(true)
      hienThongTin('Nhân viên sẽ mang bill ra ngay.', 'Đã gửi yêu cầu thanh toán')
    } catch (error) {
      hienLoi(error?.message || 'Không thể gửi yêu cầu thanh toán lúc này.')
    }
  }

  if (loi) return <div className="gio-hang-page"><div className="container"><div className="gio-hang-empty">{loi}</div></div></div>

  return (
    <div className="thuc-don-page ban-goi-mon-page">
      <section className="thuc-don-list-section thuc-don-list-section--reworked">
        <div className="container">
          <div className="thuc-don-toolbar-shell thuc-don-toolbar-shell--sticky ban-goi-mon-toolbar">
            <div className="ban-goi-mon-head">
              <div>
                <p className="thuc-don-results-kicker">QR gọi món tại bàn</p>
                <h2 className="ban-goi-mon-title">Nguyên Vị • {tenBanHienThi}</h2>
              </div>
              <span className="ban-goi-mon-count">{gioTam.reduce((tong, item) => tong + item.soLuong, 0)} món trong giỏ</span>
            </div>
            <div className="thuc-don-tabs-row" role="tablist" aria-label="Chế độ xem gọi món tại bàn">
              <button type="button" className={`thuc-don-tab ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>
                <span className="thuc-don-tab-icon" aria-hidden="true">🍽️</span>
                <span className="thuc-don-tab-copy"><strong>Thực đơn</strong></span>
              </button>
              <button type="button" className={`thuc-don-tab ${tab === 'cart' ? 'active' : ''}`} onClick={() => setTab('cart')}>
                <span className="thuc-don-tab-icon" aria-hidden="true">🛒</span>
                <span className="thuc-don-tab-copy"><strong>Giỏ hàng</strong></span>
                {gioTam.length > 0 ? <span className="thuc-don-tab-badge">{gioTam.reduce((t, i) => t + i.soLuong, 0)}</span> : null}
              </button>
            </div>
          </div>

          {tab === 'menu' ? (
            <div className="thuc-don-sections" aria-label="Danh sách món ăn theo danh mục tại bàn">
              {danhSachDanhMuc.map((danhMuc) => (
                <section key={danhMuc.name} className="thuc-don-category-section" data-category={danhMuc.name}>
                  <div className="thuc-don-results-head thuc-don-results-head--minimal thuc-don-results-head--section">
                    <div>
                      <p className="thuc-don-results-kicker">Danh mục</p>
                      <h3>{danhMuc.name}</h3>
                    </div>
                  </div>
                  <div className="thuc-don-grid thuc-don-grid--menu-showcase">
                    {danhMuc.danhSachMon.map((mon) => {
                      const tenMon = layTenMonHienThi(mon)
                      const moTa = layMoTaMonHienThi(mon)
                      const gia = Number(mon.gia ?? mon.Gia ?? 0)
                      const danhMucMon = layDanhMucMonHienThi(mon)

                      return (
                        <TheMonAn
                          key={mon.maMon || mon.MaMon}
                          variant="menu"
                          onAction={() => themMon(mon)}
                          actionLabel="Thêm vào giỏ"
                          dish={{
                            id: mon.maMon || mon.MaMon,
                            maMon: mon.maMon || mon.MaMon,
                            name: tenMon,
                            description: moTa,
                            price: dinhDangTienTeVietNam(gia),
                            priceValue: gia,
                            image: layAnhMonHienThi(mon),
                            category: danhMucMon,
                            badge: 'Mới',
                            tone: 'tone-amber',
                          }}
                        />
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
          <div className="gio-hang-layout">
            <div className="gio-hang-items-section">
              <div className="gio-hang-item-list">
                {gioTam.map((item) => (
                  <article key={item.maMon} className="gio-hang-item">
                    <div className="gio-hang-item-content" style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: '16px', alignItems: 'center' }}>
                      <img
                        src={item.hinhAnh}
                        alt={item.tenMon}
                        style={{ width: '96px', height: '96px', objectFit: 'cover', borderRadius: '14px' }}
                      />
                      <div>
                        <div className="gio-hang-item-top"><div className="gio-hang-item-copy"><h3>{item.tenMon}</h3><p style={{ margin: '6px 0 0', color: '#7a6a5d' }}>{dinhDangTienTeVietNam(item.gia)} / phần</p></div></div>
                        <div className="gio-hang-item-bottom"><div className="quantity-control"><button type="button" className="qty-btn" onClick={() => doiSoLuong(item.maMon, -1)}>-</button><span className="qty-value">{item.soLuong}</span><button type="button" className="qty-btn" onClick={() => doiSoLuong(item.maMon, 1)}>+</button></div><strong className="gio-hang-item-total">{dinhDangTienTeVietNam(item.gia * item.soLuong)}</strong></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="gio-hang-summary"><div className="tom-tat-card gio-hang-tom-tat-card"><div className="tom-tat-row tom-tat-total"><span>Tổng tiền</span><strong>{dinhDangTienTeVietNam(tongTien)}</strong></div><button type="button" className="btn gio-hang-checkout-btn w-full" disabled={gioTam.length === 0} onClick={guiOrder}>Gửi order</button><button type="button" className="btn nut-phu w-full" onClick={() => setTab('menu')}>Gọi thêm</button></div></div>
          </div>
        )}

        {orderDangMo ? (
          <section className="thanh-toan-form-panel ban-goi-mon-da-goi" style={{ marginTop: '1rem' }}>
            <h2>Món đã gọi</h2>
            <div className="thanh-toan-item-list">
              {(orderDangMo.chiTiet || orderDangMo.ChiTiet || []).map((item, index) => {
                const tenMon = item.tenMon || item.TenMon || item.maMon || item.MaMon
                const soLuong = item.soLuong || item.SoLuong
                const thanhTien = item.thanhTien || item.ThanhTien
                return <div key={`${item.maMon || item.MaMon}-${index}`} className="thanh-toan-item"><div><p className="thanh-toan-item-name">{tenMon}</p><p className="thanh-toan-item-qty">x{soLuong}</p></div><strong>{dinhDangTienTeVietNam(thanhTien)}</strong></div>
              })}
            </div>
            {!yeuCauThanhToan ? <button type="button" className="btn gio-hang-checkout-btn" onClick={yeuCauBill}>Yêu cầu thanh toán</button> : <p className="thanh-toan-tom-tat-note">Nhân viên sẽ mang bill ra ngay!</p>}
          </section>
        ) : null}
        </div>
      </section>
    </div>
  )
}

export default BanGoiMonPage
