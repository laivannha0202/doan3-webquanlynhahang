export const chuanHoaVaiTroNoiBo = (vaiTro: string) => {
  const giaTri = String(vaiTro || '')
    .trim()
    .toLowerCase();

  if (giaTri === 'admin' || giaTri === 'quantri' || giaTri === 'quan tri' || giaTri === 'quanly')
    return 'Admin';
  if (giaTri === 'nhanvien' || giaTri === 'nhan vien' || giaTri === 'staff')
    return 'NhanVien';
  return 'KhachHang';
};
