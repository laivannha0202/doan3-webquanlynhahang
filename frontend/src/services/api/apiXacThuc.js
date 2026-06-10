import { trinhKhachApi, tachPhanHoiApi, coSuDungMayChu } from '../trinhKhachApi'
import { layNguoiDungHienTai } from '../dichVuXacThuc'
import { chuanHoaVaiTroNoiBo } from '../../utils/chuanHoaVaiTro'
import {
  taoPhanHoiOffline,
  xacThucDangNhapOffline,
  dangKyTaiKhoanKhachHangOffline,
  capNhatTaiKhoanOffline,
  layDanhSachTaiKhoanOffline,
  taoNguoiDungNoiBoOffline,
  xoaNguoiDungNoiBoOffline,
  timTaiKhoanTheoMaNDOffline,
} from '../offline/dichVuOfflineStore'

const chuanHoaNguoiDung = (nguoiDung) => {
  if (!nguoiDung || typeof nguoiDung !== 'object') return null
  const vaiTroGoc = nguoiDung.vaiTro || nguoiDung.VaiTro || nguoiDung.role || ''
  const vaiTro = chuanHoaVaiTroNoiBo(vaiTroGoc)

  return {
    ...nguoiDung,
    id: nguoiDung.maND || nguoiDung.MaND || nguoiDung.id || null,
    maND: nguoiDung.maND || nguoiDung.MaND || '',
    maKH: nguoiDung.maKH || nguoiDung.MaKH || '',
    fullName: nguoiDung.tenND || nguoiDung.TenND || nguoiDung.fullName || '',
    username: nguoiDung.maND || nguoiDung.MaND || nguoiDung.username || '',
    email: nguoiDung.email || nguoiDung.Email || '',
    phone: nguoiDung.sdt || nguoiDung.SDT || nguoiDung.phone || '',
    role: vaiTro,
    trangThai: nguoiDung.trangThai || nguoiDung.TrangThai || '',
  }
}

const taoPayloadDangNhapThanhCong = (ketQua) => taoPhanHoiOffline({
  user: ketQua.user,
  accessToken: ketQua.accessToken,
}, 'Dang nhap thanh cong')

export const dangNhapApi = async (email, matKhau) => {
  if (!coSuDungMayChu()) {
    const ketQua = xacThucDangNhapOffline({ email, matKhau, noiBo: false })
    if (!ketQua) {
      throw new Error('Email hoặc mật khẩu không đúng.')
    }

    return tachPhanHoiApi(taoPayloadDangNhapThanhCong(ketQua))
  }

  return tachPhanHoiApi(await trinhKhachApi.post('/auth/login', { email, matKhau }))
}

export const dangNhapNoiBoApi = async (email, matKhau) => {
  if (!coSuDungMayChu()) {
    const ketQua = xacThucDangNhapOffline({ email, matKhau, noiBo: true })

    if (ketQua === false) {
      throw new Error('Tài khoản này không có quyền đăng nhập nội bộ.')
    }

    if (!ketQua) {
      throw new Error('Email hoặc mật khẩu không đúng.')
    }

    return tachPhanHoiApi(taoPayloadDangNhapThanhCong(ketQua))
  }

  return tachPhanHoiApi(await trinhKhachApi.post('/auth/internal-login', { email, matKhau }))
}

export const dangKyApi = async (payload) => {
  if (!coSuDungMayChu()) {
    const hoTen = payload.hoTen || payload.fullName || payload.name || ''
    const email = payload.email || ''
    const soDienThoai = payload.soDienThoai || payload.phone || ''
    const matKhau = payload.matKhau || payload.password || ''
    const xacNhanMatKhau = payload.xacNhanMatKhau || payload.confirmPassword || ''
    const diaChi = payload.diaChi || payload.address || ''

    if (String(matKhau) !== String(xacNhanMatKhau)) {
      throw new Error('Xác nhận mật khẩu không khớp.')
    }

    const ketQua = dangKyTaiKhoanKhachHangOffline({ hoTen, email, soDienThoai, matKhau, diaChi })
    return tachPhanHoiApi(taoPhanHoiOffline({ user: ketQua.user, accessToken: ketQua.accessToken }, 'Dang ky thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.post('/auth/register', {
    hoTen: payload.hoTen || payload.fullName || payload.name || '',
    email: payload.email,
    soDienThoai: payload.soDienThoai || payload.phone || '',
    matKhau: payload.matKhau || payload.password,
    xacNhanMatKhau: payload.xacNhanMatKhau || payload.confirmPassword || '',
    diaChi: payload.diaChi || payload.address || '',
  }))
}

export const layThongTinToiApi = async () => {
  if (!coSuDungMayChu()) {
    const nguoiDungDangLuu = layNguoiDungHienTai()
    if (!nguoiDungDangLuu?.maND) {
      return tachPhanHoiApi(taoPhanHoiOffline(null, 'Lay thong tin thanh cong'))
    }

    const duLieu = timTaiKhoanTheoMaNDOffline(nguoiDungDangLuu.maND)
    return tachPhanHoiApi(taoPhanHoiOffline(duLieu, 'Lay thong tin thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.get('/auth/me'))
}

export const dangXuatApi = async () => {
  if (!coSuDungMayChu()) {
    return tachPhanHoiApi(taoPhanHoiOffline(null, 'Dang xuat thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.post('/auth/logout', {}))
}

export const capNhatHoSoApi = async (payload) => {
  if (!coSuDungMayChu()) {
    const maND = payload.maND || payload.id || ''
    if (!maND) {
      throw new Error('Không tìm thấy người dùng để cập nhật hồ sơ.')
    }

    const nguoiDung = capNhatTaiKhoanOffline(maND, (currentAccount) => ({
      fullName: payload.hoTen || payload.fullName || currentAccount.fullName || '',
      email: payload.email || currentAccount.email || '',
      phone: payload.soDienThoai || payload.phone || currentAccount.phone || '',
      address: payload.diaChi || payload.address || currentAccount.address || '',
    }))

    return tachPhanHoiApi(taoPhanHoiOffline(nguoiDung, 'Cap nhat ho so thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.put('/auth/profile', {
    hoTen: payload.hoTen || payload.fullName || '',
    email: payload.email || '',
    soDienThoai: payload.soDienThoai || payload.phone || '',
    diaChi: payload.diaChi || payload.address || '',
  }))
}

export const doiMatKhauApi = async (payload) => {
  if (!coSuDungMayChu()) {
    const maND = payload.maND || payload.id || ''
    if (!maND) {
      throw new Error('Không tìm thấy người dùng để đổi mật khẩu.')
    }

    const nguoiDung = timTaiKhoanTheoMaNDOffline(maND)
    if (!nguoiDung) {
      throw new Error('Không tìm thấy người dùng.')
    }

    const matKhauHienTai = payload.matKhauHienTai || payload.currentPassword || ''
    const matKhauMoi = payload.matKhauMoi || payload.newPassword || ''
    const xacNhan = payload.xacNhanMatKhauMoi || payload.confirmPassword || ''

    if (String(nguoiDung.matKhau || '') !== String(matKhauHienTai || '')) {
      throw new Error('Mật khẩu hiện tại không đúng.')
    }

    if (String(matKhauMoi || '') !== String(xacNhan || '')) {
      throw new Error('Xác nhận mật khẩu mới không khớp.')
    }

    capNhatTaiKhoanOffline(maND, () => ({ matKhau: String(matKhauMoi || '') }))
    return tachPhanHoiApi(taoPhanHoiOffline(null, 'Doi mat khau thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.put('/auth/doi-mat-khau', {
    matKhauHienTai: payload.matKhauHienTai || payload.currentPassword || '',
    matKhauMoi: payload.matKhauMoi || payload.newPassword || '',
    xacNhanMatKhauMoi: payload.xacNhanMatKhauMoi || payload.confirmPassword || '',
  }))
}

export const chuanHoaNguoiDungApi = (nguoiDung) => chuanHoaNguoiDung(nguoiDung)

export const layDanhSachNguoiDungApi = async () => {
  if (!coSuDungMayChu()) {
    const duLieu = layDanhSachTaiKhoanOffline().map(chuanHoaNguoiDung).filter(Boolean)
    return {
      ...tachPhanHoiApi(taoPhanHoiOffline(duLieu, 'Lay danh sach nguoi dung thanh cong')),
      duLieu,
    }
  }

  const phanHoi = tachPhanHoiApi(await trinhKhachApi.get('/nguoi-dung'))
  return {
    ...phanHoi,
    duLieu: Array.isArray(phanHoi.duLieu) ? phanHoi.duLieu.map(chuanHoaNguoiDung).filter(Boolean) : [],
  }
}

export const taoNguoiDungNoiBoApi = async (payload) => {
  if (!coSuDungMayChu()) {
    const duLieu = taoNguoiDungNoiBoOffline({
      hoTen: payload.hoTen || payload.fullName || '',
      email: payload.email || '',
      soDienThoai: payload.soDienThoai || payload.phone || '',
      vaiTro: payload.vaiTro || 'NhanVien',
      trangThai: payload.trangThai || 'Active',
      chucVu: payload.chucVu || '',
      matKhau: payload.matKhau || '',
    })

    return tachPhanHoiApi(taoPhanHoiOffline(duLieu, 'Tao nhan vien thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.post('/nguoi-dung', {
    hoTen: payload.hoTen || payload.fullName || '',
    email: payload.email || '',
    soDienThoai: payload.soDienThoai || payload.phone || '',
    vaiTro: payload.vaiTro || 'NhanVien',
    trangThai: payload.trangThai || 'Active',
    chucVu: payload.chucVu || '',
    matKhau: payload.matKhau || '',
    xacNhanMatKhau: payload.xacNhanMatKhau || '',
  }))
}

export const capNhatNguoiDungNoiBoApi = async (maND, payload) => {
  if (!coSuDungMayChu()) {
    const duLieu = capNhatTaiKhoanOffline(maND, (currentAccount) => ({
      fullName: payload.hoTen || payload.fullName || currentAccount.fullName || '',
      email: payload.email || currentAccount.email || '',
      phone: payload.soDienThoai || payload.phone || currentAccount.phone || '',
      vaiTro: payload.vaiTro || currentAccount.vaiTro || 'NhanVien',
      role: (payload.vaiTro || currentAccount.vaiTro || 'NhanVien') === 'Admin' ? 'admin' : 'staff',
      trangThai: payload.trangThai || currentAccount.trangThai || 'Active',
      chucVu: payload.chucVu || currentAccount.chucVu || '',
      ...(payload.matKhau ? { matKhau: payload.matKhau } : {}),
    }))

    return tachPhanHoiApi(taoPhanHoiOffline(duLieu, 'Cap nhat nhan vien thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.put(`/nguoi-dung/${maND}`, {
    hoTen: payload.hoTen || payload.fullName || '',
    email: payload.email || '',
    soDienThoai: payload.soDienThoai || payload.phone || '',
    vaiTro: payload.vaiTro || 'NhanVien',
    trangThai: payload.trangThai || 'Active',
    chucVu: payload.chucVu || '',
    matKhau: payload.matKhau || '',
    xacNhanMatKhau: payload.xacNhanMatKhau || '',
  }))
}

export const xoaNguoiDungNoiBoApi = async (maND) => {
  if (!coSuDungMayChu()) {
    xoaNguoiDungNoiBoOffline(maND)
    return tachPhanHoiApi(taoPhanHoiOffline(null, 'Xoa nhan vien thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.delete(`/nguoi-dung/${maND}`))
}
