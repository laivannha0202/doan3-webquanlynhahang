/**
 * Hằng số dùng chung cho hệ thống tích điểm và quy đổi điểm.
 *
 * --- Phân biệt TÍCH ĐIỂM và QUY ĐỔI ---
 *
 * TÍCH ĐIỂM (TiLeTichDiem):
 *   - Xảy ra khi khách hàng thanh toán đơn hàng.
 *   - Số điểm được cộng = Tổng tiền / TiLeTichDiem.
 *   - Điểm thưởng, không ảnh hưởng đến số tiền phải trả.
 *
 * QUY ĐỔI ĐIỂM (TiLeQuyDoiDiem, GiaTriQuyDoi):
 *   - Xảy ra khi khách hàng dùng điểm để giảm trừ tiền mặt.
 *   - Số tiền được giảm = Số điểm * GiaTriQuyDoi.
 *   - TiLeQuyDoiDiem là số điểm tối thiểu để được quy đổi.
 */

/** Cứ 10.000 VNĐ chi tiêu → tích được 1 điểm */
export const TI_LE_TICH_DIEM_MAC_DINH = 10000;

/** Số điểm tối thiểu để được quy đổi (100 điểm) */
export const TI_LE_QUY_DOI_DIEM = 100;

/** Quy đổi điểm: cứ TI_LE_QUY_DOI_DIEM (100) điểm = GIA_TRI_QUY_DOI (10000) VNĐ */
export const GIA_TRI_QUY_DOI = 10000;

export const LOAI_MA_GIAM_GIA = {
  CONG_KHAI: 'PUBLIC',
  RIENG_KHACH: 'CUSTOMER',
  DOI_DIEM: 'LOYALTY',
  THANH_VIEN_VIP: 'VIP',
  SINH_NHAT: 'BIRTHDAY',
} as const;

export const PHAM_VI_MA_GIAM_GIA = {
  DAT_BAN: 'DAT_BAN',
  DON_HANG: 'DON_HANG',
  CA_HAI: 'CA_HAI',
} as const;

export const SO_NGAY_HIEU_LUC_VOUCHER_DOI_DIEM = 30;

// ========== Trạng thái bàn ăn (theo Q1: ENUM Việt) ==========

export const TRANG_THAI_BAN = {
  TRONG: 'TRONG',
  DA_DAT: 'DA_DAT',
  CO_KHACH: 'CO_KHACH',
  DANG_DON: 'DANG_DON',
  BAO_TRI: 'BAO_TRI',
} as const;

export const TRANG_THAI_DAT_BAN = {
  CHO_XAC_NHAN: 'CHO_XAC_NHAN',
  DA_XAC_NHAN: 'DA_XAC_NHAN',
  DA_NHAN_BAN: 'DA_NHAN_BAN',
  HOAN_THANH: 'HOAN_THANH',
  DA_HUY: 'DA_HUY',
  KHONG_DEN: 'KHONG_DEN',
  HET_HAN: 'HET_HAN',
} as const;

export const TRANG_THAI_BAN_KHONG_THE_DAT = [
  TRANG_THAI_BAN.CO_KHACH,
  TRANG_THAI_BAN.DA_DAT,
  TRANG_THAI_BAN.BAO_TRI,
];

export function chuanHoaTrangThaiBan(trangThai: string): string {
  const gt = (trangThai || '').trim().toUpperCase();
  if (['TRONG', 'AVAILABLE'].includes(gt)) return TRANG_THAI_BAN.TRONG;
  if (['DA_DAT', 'RESERVED', 'GIU_CHO'].includes(gt)) return TRANG_THAI_BAN.DA_DAT;
  if (['CO_KHACH', 'DANG_SU_DUNG', 'OCCUPIED'].includes(gt)) return TRANG_THAI_BAN.CO_KHACH;
  if (['DANG_DON'].includes(gt)) return TRANG_THAI_BAN.DANG_DON;
  if (['BAO_TRI', 'BAN', 'CAN_DON', 'MAINTENANCE', 'DIRTY'].includes(gt)) return TRANG_THAI_BAN.BAO_TRI;
  // Fallback an toàn: coi là chờ dọn
  return TRANG_THAI_BAN.BAO_TRI;
}

// ========== Trạng thái đơn hàng (theo Q1: ENUM Việt) ==========

export const TRANG_THAI_DON_HANG = {
  DANG_CHUAN_BI: 'DANG_CHUAN_BI',
  DA_XAC_NHAN: 'DA_XAC_NHAN',
  DANG_CHE_BIEN: 'DANG_CHE_BIEN',
  SAN_SANG: 'SAN_SANG',
  DA_PHUC_VU: 'DA_PHUC_VU',
  HOAN_THANH: 'HOAN_THANH',
  DA_HUY: 'DA_HUY',
  DA_THANH_TOAN: 'DA_THANH_TOAN',
  DA_HOAN_TIEN: 'DA_HOAN_TIEN',
} as const;

export const TRANG_THAI_DON_HANG_DANG_MO = new Set([
  TRANG_THAI_DON_HANG.DANG_CHUAN_BI,
  TRANG_THAI_DON_HANG.DA_XAC_NHAN,
  TRANG_THAI_DON_HANG.DANG_CHE_BIEN,
  TRANG_THAI_DON_HANG.SAN_SANG,
  TRANG_THAI_DON_HANG.DA_PHUC_VU,
]);

export const TRANG_THAI_DON_HANG_KET_THUC = new Set([
  TRANG_THAI_DON_HANG.HOAN_THANH,
  TRANG_THAI_DON_HANG.DA_THANH_TOAN,
  TRANG_THAI_DON_HANG.DA_HOAN_TIEN,
  TRANG_THAI_DON_HANG.DA_HUY,
]);

// ========== Trạng thái đặt bàn (theo Q1: ENUM Việt) ==========

export const TRANG_THAI_DAT_BAN_GIU_BAN = new Set([
  TRANG_THAI_DAT_BAN.CHO_XAC_NHAN,
  TRANG_THAI_DAT_BAN.DA_XAC_NHAN,
]);

export const TRANG_THAI_DAT_BAN_SU_DUNG_BAN = new Set([
  TRANG_THAI_DAT_BAN.DA_NHAN_BAN,
]);

export const TRANG_THAI_DAT_BAN_KET_THUC = new Set([
  TRANG_THAI_DAT_BAN.HOAN_THANH,
  TRANG_THAI_DAT_BAN.DA_HUY,
  TRANG_THAI_DAT_BAN.KHONG_DEN,
  TRANG_THAI_DAT_BAN.HET_HAN,
]);

// ========== Trạng thái chi tiết đơn hàng (theo Q1: ENUM Việt) ==========

export const TRANG_THAI_CHI_TIET_DON_HANG = {
  DANG_CHUAN_BI: 'DANG_CHUAN_BI',
  DANG_CHE_BIEN: 'DANG_CHE_BIEN',
  SAN_SANG: 'SAN_SANG',
  DA_PHUC_VU: 'DA_PHUC_VU',
  HOAN_THANH: 'HOAN_THANH',
  DA_HUY: 'DA_HUY',
} as const;

// ========== Trạng thái thanh toán (theo Q1: ENUM Việt) ==========

export const TRANG_THAI_THANH_TOAN = {
  CHO_THANH_TOAN: 'CHO_THANH_TOAN',
  THANH_CONG: 'THANH_CONG',
  THAT_BAI: 'THAT_BAI',
  DA_HOAN_TIEN: 'DA_HOAN_TIEN',
} as const;

// ========== Helper functions ==========

export const laTrangThaiDonHangDangMo = (trangThai: string) =>
  TRANG_THAI_DON_HANG_DANG_MO.has(String(trangThai || '').trim());

export const laTrangThaiDonHangKetThuc = (trangThai: string) =>
  TRANG_THAI_DON_HANG_KET_THUC.has(String(trangThai || '').trim());

export const laTrangThaiDatBanGiuBan = (trangThai: string) =>
  TRANG_THAI_DAT_BAN_GIU_BAN.has(String(trangThai || '').trim());

export const laTrangThaiDatBanSuDungBan = (trangThai: string) =>
  TRANG_THAI_DAT_BAN_SU_DUNG_BAN.has(String(trangThai || '').trim());

export const laTrangThaiDatBanKetThuc = (trangThai: string) =>
  TRANG_THAI_DAT_BAN_KET_THUC.has(String(trangThai || '').trim());
