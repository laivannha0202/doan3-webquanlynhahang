import { CAC_KHU_VUC_BAN_CHUAN, NHAN_KHU_VUC_BAN } from '../../../constants/khuVucBan.js'

export const NHAN_THU_TRONG_TUAN = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

export const CAC_DIP_DAT_BAN = ['Sinh nhật', 'Kỷ niệm', 'Tiếp khách / công việc', 'Cần không gian yên tĩnh']

export const CAC_GOI_Y_GHI_CHU_DAT_BAN = ['Sinh nhật', 'Có trẻ em', 'Cần ghế em bé', 'Dị ứng thực phẩm', 'Có thể đến muộn']

export const CAC_SO_KHACH_DAT_BAN = Array.from({ length: 10 }, (_, index) => index + 1)
export const SO_NGAY_DAT_BAN_HIEN_NHANH = 10
export const SO_NGAY_TOI_DA_NHAN_DAT_BAN = 30
export const THU_DONG_CUA_DAT_BAN = [2]
export const GIO_GIOI_HAN_NHAN_DAT_BAN = '21:45'
export const SO_PHUT_TOI_THIEU_TRUOC_GIO_DAT_BAN = 30

export const CAC_CA_KHUNG_GIO_DAT_BAN = [
  {
    id: 'lunch',
    icon: '🍱',
    label: 'Buổi trưa',
    timeRange: '11:00 - 14:00',
    slots: ['11:00', '12:00', '13:00'],
  },
  {
    id: 'dinner',
    icon: '🍽️',
    label: 'Buổi tối',
    timeRange: '17:00 - 22:00',
    slots: ['17:00', '18:00', '19:00', '20:00', '21:00'],
  },
]

export const NHAN_KHU_VUC_DAT_BAN = NHAN_KHU_VUC_BAN

export const KHU_VUC_DAT_BAN_CONG_KHAI = CAC_KHU_VUC_BAN_CHUAN.map((khuVuc) => ({
  value: khuVuc.id,
  icon: khuVuc.id === 'SANH_CHINH' ? '🏠' : khuVuc.id === 'PHONG_VIP' ? '👑' : '🌿',
  label: khuVuc.name,
  description: khuVuc.id === 'SANH_CHINH'
    ? 'Điều hoà mát mẻ, yên tĩnh'
    : khuVuc.id === 'PHONG_VIP'
      ? 'Riêng tư, phù hợp tiếp khách hoặc nhóm cần không gian tách biệt'
      : 'Thoáng gió, view đẹp',
}))

export const NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN = {
  AVAILABLE: 'Còn bàn',
  LIMITED: 'Sắp hết',
  FULL: 'Hết chỗ',
}

export const NHAN_GOI_Y_KHU_VUC_DAT_BAN = {
  PHONG_VIP_NHOM_NHO: 'Phù hợp cho nhóm nhỏ',
  PHONG_VIP_KHUYEN_NGHI: 'Khuyến nghị',
}

export const NHAN_TRANG_THAI_DAT_BAN = {
  CHO_XAC_NHAN: '🟡 Yêu cầu đặt bàn',
  DA_XAC_NHAN: '🟢 Đặt bàn thành công',
  TU_CHOI_HET_CHO: '🔴 Từ chối / hết chỗ',
}

export const HOST_NHAN_TRANG_THAI_DAT_BAN = {
  CHO_XAC_NHAN: 'Chờ xác nhận',
  DA_XAC_NHAN: 'Đã xác nhận',
  DA_NHAN_BAN: 'Đã nhận bàn',
  HOAN_THANH: 'Đã hoàn thành',
  DA_HUY: 'Đã hủy',
  KHONG_DEN: 'Không đến',
  TU_CHOI_HET_CHO: 'Từ chối / hết chỗ',
}

export const CAC_THAO_TAC_TRANG_THAI_DAT_BAN_HOST = [
  'CHO_XAC_NHAN',
  'DA_XAC_NHAN',
  'DA_NHAN_BAN',
  'HOAN_THANH',
  'DA_HUY',
  'KHONG_DEN',
  'TU_CHOI_HET_CHO',
]

export const CAC_TRANG_THAI_TAO_DAT_BAN_NOI_BO = [
  'CHO_XAC_NHAN',
  'DA_XAC_NHAN',
]
