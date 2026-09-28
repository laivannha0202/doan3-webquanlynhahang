import { useMemo } from 'react'
import { Button, ConfigProvider, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'
import SectionDanhSachMonDongBo from '../features/thucDon/components/SectionDanhSachMonDongBo'
import anhTimChungToi from '../assets/img/findus.585c393ccd3671513743.webp'
import knifeImage from '../assets/img/knife.1121c0a5afb62acb31cb.png'
import { ANH_HERO_TRANG_CHU, layAnhMonTheoTen } from '../features/thucDon/constants/anhMonAn'
import { useDanhSachMonAn } from '../features/thucDon/hooks/useDanhSachMonAn'
import { layDanhSachMonNoiBatTrangChu } from '../services/mappers/anhXaThucDon'

function TrangChuPage() {
  const { Title, Paragraph } = Typography
  const { dishes } = useDanhSachMonAn()

  const danhSachMonDacTrung = useMemo(
    () => layDanhSachMonNoiBatTrangChu(dishes).map((dish) => ({
      ...dish,
      image: dish.image || layAnhMonTheoTen(dish.name),
    })),
    [dishes],
  )

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#e8664a',
          colorLink: '#e8664a',
          colorInfo: '#e8664a',
          colorBorder: '#ead7c5',
          borderRadius: 0,
          controlOutline: 'rgba(232, 102, 74, 0.18)',
          colorPrimaryHover: '#d95b41',
          colorPrimaryActive: '#c94d34',
        },
      }}
    >
      <div className="trang-chu-page">
        <section className="hero" id="home">
        <div className="container mo-dau-grid">
          <div className="mo-dau-copy">
            <Space orientation="vertical" size={16} style={{ width: '100%', alignItems: 'flex-start' }}>
              <Title level={1} style={{ margin: 0 }}>Tinh hoa ẩm thực</Title>
              <Paragraph className="subtitle" style={{ marginBottom: 0 }}>
                Thưởng thức những món ăn được chuẩn bị chỉn chu, đậm đà bản sắc và phù hợp cho những buổi gặp gỡ ấm cúng lẫn các dịp đặc biệt.
              </Paragraph>
              <Button type="primary" size="large" href="/thuc-don">
                Xem thực đơn
              </Button>
            </Space>
          </div>

          <div className="mo-dau-showcase">
            <div className="hero-tham-chieu-mon">
              <span className="hero-tham-chieu-nen hero-tham-chieu-nen--tren" />
              <span className="hero-tham-chieu-nen hero-tham-chieu-nen--duoi" />
              <figure className="hero-tham-chieu-khung-anh">
                <img src={ANH_HERO_TRANG_CHU} alt="Món ăn chủ đạo của nhà hàng" className="hero-tham-chieu-anh" loading="eager" />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-am-thuc" aria-labelledby="showcase-am-thuc-title">
        <div className="container showcase-am-thuc-grid">
          <article className="showcase-am-thuc-panel showcase-am-thuc-panel--left">
            <h2 id="showcase-am-thuc-title">Về chúng tôi</h2>
            <span className="showcase-am-thuc-divider" aria-hidden="true" />
            <p>
              Từ cách chọn nguyên liệu đến cách đón tiếp, chúng tôi giữ một tinh thần phục vụ ấm áp và chỉn chu cho từng bữa ăn.
            </p>
            <Link className="showcase-am-thuc-link" to="/gioi-thieu">
              Xem thêm
            </Link>
          </article>

          <div className="showcase-am-thuc-center" aria-hidden="true">
            <span className="showcase-am-thuc-monogram">N</span>
            <img src={knifeImage} alt="" className="showcase-am-thuc-knife" loading="lazy" />
          </div>

          <article className="showcase-am-thuc-panel showcase-am-thuc-panel--right">
            <h3>Hành trình vị ngon</h3>
            <span className="showcase-am-thuc-divider" aria-hidden="true" />
            <p>
              Mỗi công thức được hoàn thiện qua nhiều lần cân chỉnh để hương vị lên bàn luôn gọn gàng, rõ nét và đáng nhớ.
            </p>
            <Link className="showcase-am-thuc-link" to="/thuc-don">
              Xem thực đơn
            </Link>
          </article>
        </div>
      </section>

      <section className="noi-bat-section">
        <div className="container">
          <SectionDanhSachMonDongBo
            tenMuc="Món Ngon Phải Thử"
            nhanMuc="Món được chọn nhiều"
            danhSachMon={danhSachMonDacTrung}
            maDanhMuc="mon-noi-bat"
          />

          <div className="noi-bat-section-action-wrap">
            <Button type="link" href="/thuc-don" style={{ paddingInline: 0 }}>
              Xem toàn bộ thực đơn
            </Button>
          </div>
        </div>
      </section>

      <section className="tim-chung-toi-section" aria-labelledby="tim-chung-toi-title">
        <div className="container tim-chung-toi-grid">
          <div className="tim-chung-toi-noi-dung">
            <p className="tim-chung-toi-kicker">Liên hệ</p>
            <h2 id="tim-chung-toi-title">Tìm chúng tôi</h2>
            <p className="tim-chung-toi-dia-chi">
              28 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
            </p>

            <div className="tim-chung-toi-thong-tin">
              <h3>Giờ Mở Cửa</h3>
              <p>Thứ Hai - Thứ Sáu: 10:00 Sáng - 02:00 Sáng</p>
              <p>Thứ Bảy - Chủ Nhật: 10:00 Sáng - 03:00 Sáng</p>
            </div>

            <Link className="btn nut-chinh tim-chung-toi-cta" to="/dat-ban">
              Ghé thăm chúng tôi
            </Link>
          </div>

          <div className="tim-chung-toi-visual">
            <span className="tim-chung-toi-khung tim-chung-toi-khung--tren" aria-hidden="true" />
            <span className="tim-chung-toi-khung tim-chung-toi-khung--duoi" aria-hidden="true" />
            <figure className="tim-chung-toi-anh-wrap">
              <img
                src={anhTimChungToi}
                alt="Thức uống đặc trưng của nhà hàng"
                className="tim-chung-toi-anh"
                loading="lazy"
              />
            </figure>
          </div>
        </div>
      </section>

    </div>
    </ConfigProvider>
  )
}

export default TrangChuPage
