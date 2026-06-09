// Enum trạng thái bàn - nguồn duy nhất cho toàn bộ frontend
// Giá trị lưu trong DB là FEAT-07 chuẩn

export const TRANG_THAI_BAN = Object.freeze({
  TRONG: 'TRONG',
  GIU_CHO: 'DA_DAT',         // giữ key cũ, giá trị FEAT-07
  DANG_SU_DUNG: 'CO_KHACH',  // giữ key cũ, giá trị FEAT-07
  BAN: 'BAO_TRI',            // giữ key cũ, giá trị FEAT-07
  DA_DAT: 'DA_DAT',
  CO_KHACH: 'CO_KHACH',
  DANG_DON: 'DANG_DON',
  BAO_TRI: 'BAO_TRI',
})

// Tập hợp tất cả giá trị có thể gặp (FEAT-07 + fallback cũ)
export const GIA_TRI_TRONG = ['TRONG', 'Available']
export const GIA_TRI_GIU_CHO = ['DA_DAT', 'GIU_CHO', 'Reserved', 'CHO_THANH_TOAN']
export const GIA_TRI_DANG_SU_DUNG = ['CO_KHACH', 'DANG_SU_DUNG', 'Occupied']
export const GIA_TRI_BAN = ['BAO_TRI', 'BAN', 'CAN_DON', 'Maintenance', 'DIRTY']
export const GIA_TRI_DANG_DON = ['DANG_DON']

// Hàm chuẩn hóa bất kỳ giá trị nào về key hiển thị
export const chuanHoaTrangThaiBan = (trangThai = '') => {
  const giaTri = String(trangThai || '').trim().toUpperCase()

  if (GIA_TRI_TRONG.map((v) => v.toUpperCase()).includes(giaTri)) return 'TRONG'
  if (GIA_TRI_GIU_CHO.map((v) => v.toUpperCase()).includes(giaTri)) return 'DA_DAT'
  if (GIA_TRI_DANG_SU_DUNG.map((v) => v.toUpperCase()).includes(giaTri)) return 'CO_KHACH'
  if (GIA_TRI_BAN.map((v) => v.toUpperCase()).includes(giaTri)) return 'BAO_TRI'
  if (GIA_TRI_DANG_DON.map((v) => v.toUpperCase()).includes(giaTri)) return 'BAO_TRI'

  // Fallback an toàn: coi là cần dọn (không cho dùng bàn nếu không rõ tình trạng)
  return 'BAO_TRI'
}

// Hàm kiểm tra bàn có khả dụng để đặt không (trống = Available)
export const banKhaDungDat = (trangThai = '') => {
  const chuanHoa = chuanHoaTrangThaiBan(trangThai)
  return chuanHoa === 'TRONG'
}

// Hàm kiểm tra bàn đang bận (không thể đặt)
export const banDangBan = (trangThai = '') => {
  const chuanHoa = chuanHoaTrangThaiBan(trangThai)
  return chuanHoa === 'DA_DAT' || chuanHoa === 'CO_KHACH' || chuanHoa === 'BAO_TRI'
}
