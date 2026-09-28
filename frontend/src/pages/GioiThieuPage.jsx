import chefPortrait from '../assets/img/chef.02d6c5b61bfdc70303b4.webp'
import anhGiaiThuong from '../assets/img/dish_1.png'

function GioiThieuPage() {
  return (
    <div className="about-page about-page-editorial">
      <section className="about-story about-editorial-story">
        <div className="container">
            <div className="about-editorial">
              <div className="about-editorial-media">
                <img className="about-editorial-image" src={chefPortrait} alt="Bếp trưởng của nhà hàng" />
              </div>

            <div className="about-editorial-copy">
              <p className="about-editorial-eyebrow">Lời đầu bếp</p>
              <h2 className="about-editorial-title">Hành trình của chúng tôi</h2>

              <div className="about-editorial-reading">
                <span className="about-editorial-mark" aria-hidden="true">“</span>
                <div className="about-editorial-prose">
                  <p>
                    Từ năm 2015, chúng tôi bắt đầu hành trình mang đến những trải nghiệm ẩm thực chân thực và đầy cảm xúc.
                    Mỗi món ăn không chỉ là sự kết hợp của nguyên liệu tươi ngon, mà còn là tâm huyết của đội ngũ đầu bếp
                    dày dạn kinh nghiệm.
                  </p>
                  <p>
                    Chúng tôi tin rằng bữa ăn ngon nhất là khi được chia sẻ cùng những người thân yêu. Không gian ấm cúng,
                    phong cách phục vụ tận tâm và thực đơn đa dạng — tất cả được thiết kế để bạn cảm thấy như đang ở nhà.
                  </p>
                  <p>
                    Với hơn 11 năm kinh nghiệm, chúng tôi đã phục vụ hơn 50,000 khách hàng hài lòng và không ngừng đổi mới
                    thực đơn với hơn 200 món ăn đa dạng từ Á đến Âu.
                  </p>
                </div>
              </div>

              <div className="about-editorial-closing">
                <p className="about-editorial-pullquote">
                  Ẩm thực không chỉ là món ăn, mà là nghệ thuật kết nối con người với nhau
                </p>
                <div className="about-editorial-author">
                  <p className="about-editorial-name">Nguyễn Minh Tuấn</p>
                  <p className="about-editorial-role">Bếp trưởng</p>
                </div>
                <p className="about-editorial-signature" aria-hidden="true">Nguyễn Minh Tuấn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-stats-section">
        <div className="container">
          <div className="about-stats-row">
            <div className="about-stat-item">
              <strong className="about-stat-number">11+</strong>
              <span className="nhan-thong-ke-gioi-thieu">Năm kinh nghiệm</span>
            </div>
            <div className="about-stat-item">
              <strong className="about-stat-number">50K+</strong>
              <span className="nhan-thong-ke-gioi-thieu">Khách hàng hài lòng</span>
            </div>
            <div className="about-stat-item">
              <strong className="about-stat-number">200+</strong>
              <span className="nhan-thong-ke-gioi-thieu">Món ăn đa dạng</span>
            </div>
            <div className="about-stat-item">
              <strong className="about-stat-number">4.9/5</strong>
              <span className="nhan-thong-ke-gioi-thieu">Đánh giá trung bình</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-awards-showcase">
        <div className="container">
          <div className="about-awards-shell">
            <div className="about-awards-copy">
              <p className="about-awards-eyebrow">Giải thưởng & Sự công nhận</p>
              <h2 className="about-awards-title">Dấu ấn ẩm thực của chúng tôi</h2>

              <div className="about-awards-grid">
                <article className="about-award-item">
                  <span className="about-award-index">01</span>
                  <div>
                    <h3>Không gian ẩm thực cao cấp</h3>
                    <p>Thiết kế sang trọng, ấm cúng và chỉn chu trong từng trải nghiệm tại bàn.</p>
                  </div>
                </article>

                <article className="about-award-item">
                  <span className="about-award-index">02</span>
                  <div>
                    <h3>Nguyên liệu chọn lọc mỗi ngày</h3>
                    <p>Ưu tiên nguồn nguyên liệu tươi, rõ xuất xứ để giữ trọn hương vị tự nhiên.</p>
                  </div>
                </article>

                <article className="about-award-item">
                  <span className="about-award-index">03</span>
                  <div>
                    <h3>Đội ngũ bếp giàu kinh nghiệm</h3>
                    <p>Kỹ thuật vững vàng kết hợp sáng tạo hiện đại để tạo nên những món ăn đáng nhớ.</p>
                  </div>
                </article>

                <article className="about-award-item">
                  <span className="about-award-index">04</span>
                  <div>
                    <h3>Hàng nghìn lượt khách hài lòng</h3>
                    <p>Dịch vụ tận tâm và chất lượng ổn định là lý do nhiều thực khách luôn quay lại.</p>
                  </div>
                </article>
              </div>
            </div>

            <div className="about-awards-media">
              <img className="about-awards-image" src={anhGiaiThuong} alt="Món ăn đặc trưng của nhà hàng" />
            </div>
          </div>
        </div>
      </section>

      <section className="about-team">
        <div className="container">
          <div className="section-head center">
            <h2>Đội ngũ của chúng tôi</h2>
            <p>Những con người tài năng đứng sau mỗi món ăn ngon</p>
          </div>

          <div className="team-grid">
            <div className="team-member">
              <div className="team-member-photo team-photo-1"></div>
              <h3 className="team-member-name">Nguyễn Minh Tuấn</h3>
              <p className="team-member-role">Bếp trưởng</p>
              <p className="team-member-bio">15 năm kinh nghiệm, từng làm việc tại các nhà hàng 5 sao</p>
            </div>

            <div className="team-member">
              <div className="team-member-photo team-photo-2"></div>
              <h3 className="team-member-name">Trần Thị Hương</h3>
              <p className="team-member-role">Quản lý nhà hàng</p>
              <p className="team-member-bio">Chuyên gia về trải nghiệm khách hàng và vận hành</p>
            </div>

            <div className="team-member">
              <div className="team-member-photo team-photo-3"></div>
              <h3 className="team-member-name">Lê Văn Đức</h3>
              <p className="team-member-role">Bếp phó</p>
              <p className="team-member-bio">Chuyên môn về ẩm thực Âu và món fusion sáng tạo</p>
            </div>

            <div className="team-member">
              <div className="team-member-photo team-photo-4"></div>
              <h3 className="team-member-name">Phạm Thu Hà</h3>
              <p className="team-member-role">Bếp bánh</p>
              <p className="team-member-bio">Nghệ nhân bánh ngọt với đam mê tạo nên những tác phẩm nghệ thuật</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GioiThieuPage
