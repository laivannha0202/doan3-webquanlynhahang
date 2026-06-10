import { layJsonLuuTru, xoaMucLuuTru, datJsonLuuTru } from './dichVuLuuTru'

export const PHAM_VI_XAC_THUC = Object.freeze({
  KHACH_HANG: 'khach-hang',
  NOI_BO: 'noi-bo',
})

const KHOA_LUU_TRU_THEO_PHAM_VI = Object.freeze({
  [PHAM_VI_XAC_THUC.KHACH_HANG]: Object.freeze({
    nguoiDung: 'restaurant_customer_current_user',
    accessToken: 'restaurant_customer_auth_token',
    refreshToken: 'restaurant_customer_refresh_token',
  }),
  [PHAM_VI_XAC_THUC.NOI_BO]: Object.freeze({
    nguoiDung: 'restaurant_internal_current_user',
    accessToken: 'restaurant_internal_auth_token',
    refreshToken: 'restaurant_internal_refresh_token',
  }),
})

let phamViXacThucHienTai = PHAM_VI_XAC_THUC.KHACH_HANG
const maXacThucTrongBoNhoTheoPhamVi = {
  [PHAM_VI_XAC_THUC.KHACH_HANG]: '',
  [PHAM_VI_XAC_THUC.NOI_BO]: '',
}
const refreshTokenTrongBoNhoTheoPhamVi = {
  [PHAM_VI_XAC_THUC.KHACH_HANG]: '',
  [PHAM_VI_XAC_THUC.NOI_BO]: '',
}

export const SU_KIEN_THAY_DOI_NGUOI_DUNG_XAC_THUC = 'auth:user-changed'
export const VAI_TRO_XAC_THUC = Object.freeze({
  KHACH_HANG: 'KhachHang',
  NHAN_VIEN: 'NhanVien',
  QUAN_TRI: 'Admin',
})

const phatSuKienThayDoiNguoiDung = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SU_KIEN_THAY_DOI_NGUOI_DUNG_XAC_THUC))
  }
}

const chuanHoaVaiTro = (vaiTro) => {
  if (vaiTro === 'Admin' || vaiTro === 'admin' || vaiTro === 'QuanLy' || vaiTro === 'quanly') return VAI_TRO_XAC_THUC.QUAN_TRI
  if (vaiTro === 'NhanVien' || vaiTro === 'staff') return VAI_TRO_XAC_THUC.NHAN_VIEN
  if (vaiTro === 'KhachHang' || vaiTro === 'customer') return VAI_TRO_XAC_THUC.KHACH_HANG
  if (vaiTro === VAI_TRO_XAC_THUC.QUAN_TRI) return VAI_TRO_XAC_THUC.QUAN_TRI
  if (vaiTro === VAI_TRO_XAC_THUC.NHAN_VIEN) return VAI_TRO_XAC_THUC.NHAN_VIEN
  return VAI_TRO_XAC_THUC.KHACH_HANG
}

const chuanHoaNguoiDung = (nguoiDung) => {
  if (!nguoiDung || typeof nguoiDung !== 'object') return null

  return {
    ...nguoiDung,
    maND: String(nguoiDung.maND ?? nguoiDung.MaND ?? '').trim(),
    maKH: String(nguoiDung.maKH ?? nguoiDung.MaKH ?? '').trim(),
    fullName: String(nguoiDung.fullName ?? nguoiDung.tenND ?? nguoiDung.TenND ?? nguoiDung.tenKH ?? nguoiDung.TenKH ?? nguoiDung.name ?? '').trim(),
    username: String(nguoiDung.username ?? nguoiDung.maND ?? nguoiDung.MaND ?? '').trim(),
    email: String(nguoiDung.email ?? '').trim(),
    phone: String(nguoiDung.phone ?? nguoiDung.sdt ?? nguoiDung.SDT ?? '').trim(),
    role: chuanHoaVaiTro(nguoiDung.role ?? nguoiDung.vaiTro ?? nguoiDung.VaiTro),
  }
}

const chuanHoaNguoiDungHienTai = (nguoiDung) => {
  const daChuanHoa = chuanHoaNguoiDung(nguoiDung)
  if (!daChuanHoa) return null

  return {
    fullName: daChuanHoa.fullName,
    id: daChuanHoa.id ?? daChuanHoa.maND ?? null,
    maND: daChuanHoa.maND ?? '',
    maKH: daChuanHoa.maKH ?? '',
    username: daChuanHoa.username,
    email: daChuanHoa.email,
    phone: daChuanHoa.phone,
    role: daChuanHoa.role,
  }
}

const laPhamViNoiBo = () => typeof window !== 'undefined' && (window.location.pathname || '').startsWith('/noi-bo')
const layPhamViMacDinh = () => (laPhamViNoiBo() ? PHAM_VI_XAC_THUC.NOI_BO : PHAM_VI_XAC_THUC.KHACH_HANG)
const layKhoaLuuTruTheoPhamVi = (phamVi = phamViXacThucHienTai) => KHOA_LUU_TRU_THEO_PHAM_VI[phamVi] || KHOA_LUU_TRU_THEO_PHAM_VI[PHAM_VI_XAC_THUC.KHACH_HANG]

export const datPhamViXacThuc = (phamVi = layPhamViMacDinh()) => {
  phamViXacThucHienTai = phamVi
  const khoa = layKhoaLuuTruTheoPhamVi(phamVi)
  maXacThucTrongBoNhoTheoPhamVi[phamVi] = layJsonLuuTru(khoa.accessToken, '') || ''
  refreshTokenTrongBoNhoTheoPhamVi[phamVi] = layJsonLuuTru(khoa.refreshToken, '') || ''
}

datPhamViXacThuc(layPhamViMacDinh())

export const layNguoiDungHienTai = (phamVi = phamViXacThucHienTai) => chuanHoaNguoiDungHienTai(layJsonLuuTru(layKhoaLuuTruTheoPhamVi(phamVi).nguoiDung, null))

export const luuNguoiDungHienTai = (nguoiDung, phamVi = phamViXacThucHienTai) => {
  const hienTai = chuanHoaNguoiDungHienTai(nguoiDung)
  if (!hienTai) return
  datJsonLuuTru(layKhoaLuuTruTheoPhamVi(phamVi).nguoiDung, hienTai)
  phatSuKienThayDoiNguoiDung()
}

export const xoaNguoiDungHienTai = (phamVi = phamViXacThucHienTai) => {
  xoaMucLuuTru(layKhoaLuuTruTheoPhamVi(phamVi).nguoiDung)
  phatSuKienThayDoiNguoiDung()
}

export const layMaXacThuc = (phamVi = phamViXacThucHienTai) => maXacThucTrongBoNhoTheoPhamVi[phamVi] || layJsonLuuTru(layKhoaLuuTruTheoPhamVi(phamVi).accessToken, '') || ''
export const layRefreshToken = (phamVi = phamViXacThucHienTai) => refreshTokenTrongBoNhoTheoPhamVi[phamVi] || layJsonLuuTru(layKhoaLuuTruTheoPhamVi(phamVi).refreshToken, '') || ''

export const luuMaXacThuc = (token, phamVi = phamViXacThucHienTai) => {
  const khoa = layKhoaLuuTruTheoPhamVi(phamVi)
  if (!token || typeof token !== 'string') {
    maXacThucTrongBoNhoTheoPhamVi[phamVi] = ''
    xoaMucLuuTru(khoa.accessToken)
    return
  }

  maXacThucTrongBoNhoTheoPhamVi[phamVi] = token.trim()
  datJsonLuuTru(khoa.accessToken, maXacThucTrongBoNhoTheoPhamVi[phamVi])
}

export const luuRefreshToken = (token, phamVi = phamViXacThucHienTai) => {
  const khoa = layKhoaLuuTruTheoPhamVi(phamVi)
  if (!token || typeof token !== 'string') {
    refreshTokenTrongBoNhoTheoPhamVi[phamVi] = ''
    xoaMucLuuTru(khoa.refreshToken)
    return
  }

  refreshTokenTrongBoNhoTheoPhamVi[phamVi] = token.trim()
  datJsonLuuTru(khoa.refreshToken, refreshTokenTrongBoNhoTheoPhamVi[phamVi])
}

export const xoaMaXacThuc = (phamVi = phamViXacThucHienTai) => {
  maXacThucTrongBoNhoTheoPhamVi[phamVi] = ''
  xoaMucLuuTru(layKhoaLuuTruTheoPhamVi(phamVi).accessToken)
}

export const xoaRefreshToken = (phamVi = phamViXacThucHienTai) => {
  refreshTokenTrongBoNhoTheoPhamVi[phamVi] = ''
  xoaMucLuuTru(layKhoaLuuTruTheoPhamVi(phamVi).refreshToken)
}

export const luuXacThuc = (accessToken, refreshToken, phamVi = phamViXacThucHienTai) => {
  luuMaXacThuc(accessToken, phamVi)
  luuRefreshToken(refreshToken, phamVi)
}

export const luuPhienXacThuc = ({ user, accessToken, refreshToken, phamVi = phamViXacThucHienTai }) => {
  datPhamViXacThuc(phamVi)
  luuNguoiDungHienTai(user, phamVi)
  luuXacThuc(accessToken, refreshToken, phamVi)
}

export const xoaPhienXacThuc = (phamVi = phamViXacThucHienTai) => {
  xoaMaXacThuc(phamVi)
  xoaRefreshToken(phamVi)
  xoaNguoiDungHienTai(phamVi)
}
