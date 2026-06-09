export const TRANG_THAI_DON_HANG = Object.freeze({
  DANG_CHUAN_BI: 'DANG_CHUAN_BI',
  DANG_PHUC_VU: 'DANG_PHUC_VU',
  HOAN_THANH: 'HOAN_THANH',
  DA_THANH_TOAN: 'DA_THANH_TOAN',
  DA_HUY: 'DA_HUY',
})

export const LOAI_DON_HANG = Object.freeze({
  TAI_BAN: 'TAI_BAN',
})

// Maps to DB ENUM('percentage','fixed_amount') values
export const LOAI_GIAM_GIA = Object.freeze({
  PHAN_TRAM: 'percentage',
  TIEN_MAT: 'fixed_amount',
})

export const TAO_TONG_HOP_GIA_MAC_DINH = () => ({
  tamTinh: 0,
  giamGia: 0,
  phiDichVu: 0,
  tongTien: 0,
})

const layGiaTri = (nguon, ...khoa) => {
  for (const key of khoa) {
    if (nguon?.[key] !== undefined && nguon?.[key] !== null) {
      return nguon[key]
    }
  }
  return undefined
}

export const chuanHoaTongHopGia = (nguon = {}) => ({
  tamTinh: Number(layGiaTri(nguon, 'tamTinh', 'TamTinh', 'subtotal', 'Subtotal', 'tongTamTinh') || 0),
  giamGia: Number(layGiaTri(nguon, 'giamGia', 'GiamGia', 'discountAmount', 'DiscountAmount') || 0),
  phiDichVu: Number(layGiaTri(nguon, 'phiDichVu', 'PhiDichVu', 'serviceFee', 'ServiceFee') || 0),
  tongTien: Number(layGiaTri(nguon, 'tongTien', 'TongTien', 'total', 'Total') || 0),
})

export const chuanHoaKetQuaVoucher = (nguon = {}) => ({
  hopLe: Boolean(layGiaTri(nguon, 'hopLe', 'HopLe', 'isValid', 'IsValid', 'maCode', 'MaCode')),
  maGiamGia: String(layGiaTri(nguon, 'maGiamGia', 'MaGiamGia', 'maCode', 'MaCode', 'code', 'Code') || '').trim(),
  tenGiamGia: String(layGiaTri(nguon, 'tenGiamGia', 'TenGiamGia', 'tenCode', 'TenCode', 'name', 'Name') || '').trim(),
  loaiGiam: String(layGiaTri(nguon, 'loaiGiam', 'LoaiGiam', 'discountType', 'DiscountType') || '').trim(),
  giaTriGiam: Number(layGiaTri(nguon, 'giaTriGiam', 'GiaTriGiam', 'giaTri', 'GiaTri', 'discountValue', 'DiscountValue') || 0),
  giamToiDa: layGiaTri(nguon, 'giamToiDa', 'GiamToiDa', 'giaTriToiDa', 'GiaTriToiDa', 'maxDiscountAmount', 'MaxDiscountAmount') == null
    ? null
    : Number(layGiaTri(nguon, 'giamToiDa', 'GiamToiDa', 'giaTriToiDa', 'GiaTriToiDa', 'maxDiscountAmount', 'MaxDiscountAmount')),
  dieuKienToiThieu: Number(layGiaTri(nguon, 'dieuKienToiThieu', 'DieuKienToiThieu', 'donHangToiThieu', 'DonHangToiThieu', 'minOrderAmount', 'MinOrderAmount') || 0),
  soTienGiamThucTe: Number(layGiaTri(nguon, 'soTienGiamThucTe', 'SoTienGiamThucTe', 'discountAmount', 'DiscountAmount') || 0),
  thongDiep: String(layGiaTri(nguon, 'thongDiep', 'ThongDiep', 'message', 'Message', 'moTa', 'MoTa', 'description', 'Description') || '').trim(),
})
