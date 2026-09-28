import dish1 from '../../../assets/img/dish_1.png'
import dish2 from '../../../assets/img/dish_2.png'
import dish3 from '../../../assets/img/dish_3.png'
import dish4 from '../../../assets/img/dish_4.png'
import dish5 from '../../../assets/img/dish_5.webp'
import dish6 from '../../../assets/img/dish_6.webp'
import image3 from '../../../assets/img/image3.png'
import image4 from '../../../assets/img/image4.webp'
import image5 from '../../../assets/img/image5.png'
import menu1 from '../../../assets/img/menu_1.png'
import menu2 from '../../../assets/img/menu_2.png'
import menu4 from '../../../assets/img/menu_4.png'
import menu5 from '../../../assets/img/menu_5.webp'
import menu51 from '../../../assets/img/menu_5_1.webp'
import welcome from '../../../assets/img/welcome.webp'

const chuanHoaTenMon = (giaTri) => String(giaTri ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

export const ANH_HERO_TRANG_CHU = welcome
export const ANH_HERO_PHU_TRANG_CHU = menu2
export const ANH_HERO_CHI_TIET_TRANG_CHU = image5
export const ANH_HERO_NOI_BAT_TRANG_CHU = menu5

const BAN_DO_ANH_MON_THEO_TEN = Object.freeze({
  [chuanHoaTenMon('Bò Bít Tết Úc')]: dish1,
  [chuanHoaTenMon('Bò Nướng Tảng Sốt Tiêu Xanh')]: dish1,
  [chuanHoaTenMon('Cá Hồi Nướng Teriyaki')]: image5,
  [chuanHoaTenMon('Cá Hồi Nướng Lá Chanh')]: welcome,
  [chuanHoaTenMon('Gà Nướng Mật Ong')]: dish4,
  [chuanHoaTenMon('Gà Nướng Mật Ong Thảo Mộc')]: dish4,
  [chuanHoaTenMon('Mì Ý Hải Sản')]: dish6,
  [chuanHoaTenMon('Mì Ý Hải Sản Sốt Cà Chua')]: dish6,
  [chuanHoaTenMon('Salad Caesar')]: image3,
  [chuanHoaTenMon('Salad Trái Cây Sốt Sữa Chua')]: image3,
  [chuanHoaTenMon('Súp Bí Đỏ')]: image4,
  [chuanHoaTenMon('Gỏi Cuốn Tôm Thịt')]: menu2,
  [chuanHoaTenMon('Khoai Tây Chiên')]: menu5,
  [chuanHoaTenMon('Trà Đào Cam Sả')]: image5,
  [chuanHoaTenMon('Sinh Tố Bơ')]: menu4,
  [chuanHoaTenMon('Cà Phê Sữa Đá')]: menu51,
  [chuanHoaTenMon('Nước Ép Dưa Hấu')]: dish2,
  [chuanHoaTenMon('Tiramisu')]: menu1,
  [chuanHoaTenMon('Panna Cotta')]: dish5,
  [chuanHoaTenMon('Kem Vani')]: menu1,
  [chuanHoaTenMon('Combo Gia Đình')]: menu2,
  [chuanHoaTenMon('Combo Couple')]: menu5,
  [chuanHoaTenMon('Combo Solo')]: menu4,
  [chuanHoaTenMon('Sườn Nướng BBQ Khói Nhẹ')]: menu5,
  [chuanHoaTenMon('Lẩu Nấm Thanh Vị')]: dish6,
  [chuanHoaTenMon('Cơm Trộn Bò Nhật')]: dish3,
  [chuanHoaTenMon('Pho Bo Dac Biet')]: dish1,
  [chuanHoaTenMon('Phở Bò Đặc Biệt')]: dish1,
  [chuanHoaTenMon('Banh Flan Caramel')]: dish5,
  [chuanHoaTenMon('Bánh Flan Caramel')]: dish5,
  [chuanHoaTenMon('Goi Cuon Tom Thit')]: menu2,
  [chuanHoaTenMon('Gỏi Cuốn Tôm Thịt')]: menu2,
  [chuanHoaTenMon('Chả Giò Hải Sản')]: dish4,
  [chuanHoaTenMon('Cha Gio Hai San')]: dish4,
  [chuanHoaTenMon('Com Rang Duong Chau')]: dish3,
  [chuanHoaTenMon('Cơm Rang Dương Châu')]: dish3,
  [chuanHoaTenMon('Bun Bo Hue')]: dish1,
  [chuanHoaTenMon('Bún Bò Huế')]: dish1,
  [chuanHoaTenMon('Kem Dau Tay')]: menu1,
  [chuanHoaTenMon('Kem Dâu Tây')]: menu1,
  [chuanHoaTenMon('Ca Phe Sua Da')]: menu51,
  [chuanHoaTenMon('Cà Phê Sữa Đá')]: menu51,
  [chuanHoaTenMon('Tra Dao Cam Sa')]: image5,
  [chuanHoaTenMon('Trà Đào Cam Sả')]: image5,
  [chuanHoaTenMon('Nuoc Ep Cam')]: dish2,
  [chuanHoaTenMon('Nước Ép Cam')]: dish2,
  [chuanHoaTenMon('Salad Cá Ngừ')]: image3,
  [chuanHoaTenMon('Sườn Nướng Mật Ong')]: dish4,
  [chuanHoaTenMon('Lẩu Thái Hải Sản')]: dish6,
  [chuanHoaTenMon('Trà Vải Hoa Hồng')]: image5,
  [chuanHoaTenMon('Bánh Tiramisu')]: menu1,
  [chuanHoaTenMon('Combo Văn Phòng')]: menu2,
  [chuanHoaTenMon('Mì Ý Sốt Bò Bằm')]: dish6,
})

const BAN_DO_ANH_MAC_DINH_THEO_DANH_MUC = Object.freeze({
  DM001: menu2,
  DM002: dish3,
  DM003: dish5,
  DM004: image5,
  DM005: menu4,
  'Khai Vị': menu2,
  'Món Chính': dish3,
  'Tráng Miệng': dish5,
  'Đồ Uống': image5,
  Combo: menu4,
})

export const layAnhMonTheoTen = (tenMon, danhMuc = '') => {
  const anhTheoTen = BAN_DO_ANH_MON_THEO_TEN[chuanHoaTenMon(tenMon)]
  if (anhTheoTen) {
    return anhTheoTen
  }

  return BAN_DO_ANH_MAC_DINH_THEO_DANH_MUC[String(danhMuc ?? '').trim()] || dish1
}
