/**
 * Chuẩn hóa vai trò người dùng nội bộ.
 * File này là NGUỒN DUY NHẤT cho mapping vai trò FE ↔ BE.
 *
 * Quy ước:
 * - API backend trả về: 'Admin', 'NhanVien', 'KhachHang'
 * - Internal FE dùng: 'admin', 'staff', 'customer'
 */

const VAI_TRO_MAP = {
  Admin: 'admin',
  NhanVien: 'staff',
  KhachHang: 'customer',
}

const VAI_TRO_MAP_NGUOC = {
  admin: 'Admin',
  staff: 'NhanVien',
  customer: 'KhachHang',
}

/**
 * Chuyển vai trò từ API backend → internal FE.
 * Ví dụ: 'Admin' → 'admin', 'NhanVien' → 'staff'
 */
export const chuanHoaVaiTroNoiBo = (vaiTro) => {
  const giaTri = String(vaiTro || '').trim()
  if (!giaTri) return 'customer'
  return VAI_TRO_MAP[giaTri] || 'customer'
}

/**
 * Chuyển vai trò từ internal FE → API backend.
 * Ví dụ: 'admin' → 'Admin', 'staff' → 'NhanVien'
 */
export const chuanHoaVaiTroNoiBoApi = (vaiTro) => {
  const giaTri = String(vaiTro || '').trim()
  if (!giaTri) return 'NhanVien'
  return VAI_TRO_MAP_NGUOC[giaTri] || 'NhanVien'
}
