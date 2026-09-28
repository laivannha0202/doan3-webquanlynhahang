import type { BanGhi } from './types';
import { PHAM_VI_MA_GIAM_GIA } from './constants';

export const MA_TRANG_THAI_VOUCHER = Object.freeze({
  UPCOMING: 'UPCOMING',
  EXPIRED: 'EXPIRED',
  USED_UP: 'USED_UP',
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
} as const);

export const NHAN_TRANG_THAI_VOUCHER = Object.freeze({
  UPCOMING: 'Chưa hiệu lực',
  EXPIRED: 'Hết hạn',
  USED_UP: 'Hết lượt',
  INACTIVE: 'Tạm tắt',
  ACTIVE: 'Hoạt động',
} as const);

const MOC_GIO_VIET_NAM = '+07:00';

const chuyenNgaySangDate = (giaTri: unknown, cuoiNgay = false) => {
  if (giaTri instanceof Date) {
    return new Date(giaTri.getTime());
  }

  const chuoi = String(giaTri || '').trim();
  if (!chuoi) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(chuoi)) {
    const thoiDiem = cuoiNgay ? '23:59:59.999' : '00:00:00.000';
    const ngay = new Date(`${chuoi}T${thoiDiem}${MOC_GIO_VIET_NAM}`);
    return Number.isNaN(ngay.getTime()) ? null : ngay;
  }

  const ngay = new Date(chuoi);
  return Number.isNaN(ngay.getTime()) ? null : ngay;
};

const chuanHoaTrangThaiLuuTru = (giaTri: unknown) =>
  String(giaTri || '')
    .trim()
    .toUpperCase();

const chuanHoaMaThanhChuoi = (giaTri: unknown) =>
  String(giaTri || '')
    .trim()
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();

const layChuoi = (...giaTri: unknown[]) => {
  for (const item of giaTri) {
    if (item == null) continue;
    const chuoi = String(item).trim();
    if (chuoi) return chuoi;
  }
  return '';
};

const boDauTiengViet = (chuoi: string) =>
  chuoi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[Đđ]/g, (kyTu) => (kyTu === 'Đ' ? 'D' : 'd'));

export const chuanHoaMaYeuCau = (maKH: unknown, maYeuCau: unknown) => {
  const phanKhach = chuanHoaMaThanhChuoi(maKH);
  const phanYeuCau = chuanHoaMaThanhChuoi(maYeuCau);
  return [phanKhach, phanYeuCau].filter(Boolean).join('_').slice(0, 32);
};

export const taoMaVoucherDoiDiemTheoYeuCau = (
  maKH: unknown,
  maYeuCau: unknown,
) => {
  const phanMa = chuanHoaMaYeuCau(maKH, maYeuCau);
  return `LOYALTY-${phanMa}`.slice(0, 50);
};

export const taoMaGiaoDichDiemTheoYeuCau = (
  maKH: unknown,
  maYeuCau: unknown,
) => {
  const phanMa = chuanHoaMaYeuCau(maKH, maYeuCau);
  return `GDDL-${phanMa}`.slice(0, 50);
};

export const normalizePhamViMaGiamGia = (phamVi: unknown) => {
  const chuoi = layChuoi(
    typeof phamVi === 'object' && phamVi !== null
      ? (phamVi as BanGhi)?.phamVi ||
          (phamVi as BanGhi)?.PhamVi ||
          (phamVi as BanGhi)?.phamViHienThi ||
          (phamVi as BanGhi)?.PhamViHienThi ||
          (phamVi as BanGhi)?.label ||
          (phamVi as BanGhi)?.Label
      : phamVi,
  );

  if (!chuoi) return PHAM_VI_MA_GIAM_GIA.CA_HAI;

  const khoa = boDauTiengViet(chuoi)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const banDo = {
    DAT_BAN: PHAM_VI_MA_GIAM_GIA.DAT_BAN,
    DATBAN: PHAM_VI_MA_GIAM_GIA.DAT_BAN,
    BOOKING: PHAM_VI_MA_GIAM_GIA.DAT_BAN,
    RESERVATION: PHAM_VI_MA_GIAM_GIA.DAT_BAN,
    DON_HANG: PHAM_VI_MA_GIAM_GIA.DON_HANG,
    DONHANG: PHAM_VI_MA_GIAM_GIA.DON_HANG,
    ORDER: PHAM_VI_MA_GIAM_GIA.DON_HANG,
    CA_HAI: PHAM_VI_MA_GIAM_GIA.CA_HAI,
    CAHAI: PHAM_VI_MA_GIAM_GIA.CA_HAI,
    BOTH: PHAM_VI_MA_GIAM_GIA.CA_HAI,
    ALL: PHAM_VI_MA_GIAM_GIA.CA_HAI,
  } as const;

  return banDo[khoa as keyof typeof banDo] || 'UNKNOWN';
};

export const getVoucherPhamViLabel = (phamVi: unknown) => {
  const khoa = normalizePhamViMaGiamGia(phamVi);
  if (khoa === PHAM_VI_MA_GIAM_GIA.DAT_BAN) return 'Đặt bàn';
  if (khoa === PHAM_VI_MA_GIAM_GIA.DON_HANG) return 'Đơn hàng';
  if (khoa === PHAM_VI_MA_GIAM_GIA.CA_HAI) return 'Cả hai';
  return 'Không xác định';
};

export const kiemTraPhamViMaGiamGia = (
  phamViVoucher: unknown,
  phamViYeuCau: unknown,
) => {
  const maPhamViVoucher = normalizePhamViMaGiamGia(phamViVoucher);
  const maPhamViYeuCau = normalizePhamViMaGiamGia(phamViYeuCau);

  if (maPhamViYeuCau === 'UNKNOWN') {
    return {
      hopLe: false,
      lyDo: 'Phạm vi áp dụng không hợp lệ.',
      phamViVoucher: maPhamViVoucher,
      phamViYeuCau: maPhamViYeuCau,
    };
  }

  if (maPhamViVoucher === 'UNKNOWN') {
    return {
      hopLe: true,
      lyDo: '',
      phamViVoucher: PHAM_VI_MA_GIAM_GIA.CA_HAI,
      phamViYeuCau: maPhamViYeuCau,
    };
  }

  if (
    maPhamViVoucher === PHAM_VI_MA_GIAM_GIA.CA_HAI ||
    maPhamViVoucher === maPhamViYeuCau
  ) {
    return {
      hopLe: true,
      lyDo: '',
      phamViVoucher: maPhamViVoucher,
      phamViYeuCau: maPhamViYeuCau,
    };
  }

  return {
    hopLe: false,
    lyDo:
      maPhamViVoucher === PHAM_VI_MA_GIAM_GIA.DAT_BAN
        ? 'Mã giảm giá này chỉ áp dụng cho đặt bàn.'
        : 'Mã giảm giá này chỉ áp dụng cho đơn hàng.',
    phamViVoucher: maPhamViVoucher,
    phamViYeuCau: maPhamViYeuCau,
  };
};

export const xacDinhTrangThaiMaGiamGia = (
  ma: BanGhi,
  thoiDiem = new Date(),
) => {
  const now = thoiDiem instanceof Date ? thoiDiem : new Date(thoiDiem);
  const ngayBatDau = chuyenNgaySangDate(ma?.NgayBatDau ?? ma?.ngayBatDau);
  const ngayKetThuc = chuyenNgaySangDate(
    ma?.NgayKetThuc ?? ma?.ngayKetThuc,
    true,
  );
  const soLanToiDa =
    ma?.SoLanToiDa == null ? null : Number(ma?.SoLanToiDa || 0);
  const soLanDaDung = Number(ma?.SoLanDaDung || 0);
  const trangThaiLuuTru = chuanHoaTrangThaiLuuTru(
    ma?.TrangThai ?? ma?.trangThai ?? 'Active',
  );

  if (ngayBatDau && now < ngayBatDau) {
    return {
      maTrangThai: MA_TRANG_THAI_VOUCHER.UPCOMING,
      nhanTrangThai: NHAN_TRANG_THAI_VOUCHER.UPCOMING,
      coTheApDung: false,
      lyDo: 'Mã giảm giá chưa đến thời gian áp dụng.',
    };
  }

  if (ngayKetThuc && now > ngayKetThuc) {
    return {
      maTrangThai: MA_TRANG_THAI_VOUCHER.EXPIRED,
      nhanTrangThai: NHAN_TRANG_THAI_VOUCHER.EXPIRED,
      coTheApDung: false,
      lyDo: 'Mã giảm giá đã hết hạn.',
    };
  }

  if (soLanToiDa != null && soLanDaDung >= soLanToiDa) {
    return {
      maTrangThai: MA_TRANG_THAI_VOUCHER.USED_UP,
      nhanTrangThai: NHAN_TRANG_THAI_VOUCHER.USED_UP,
      coTheApDung: false,
      lyDo: 'Mã giảm giá đã đạt giới hạn sử dụng.',
    };
  }

  if (trangThaiLuuTru === 'HETHAN') {
    return {
      maTrangThai: MA_TRANG_THAI_VOUCHER.EXPIRED,
      nhanTrangThai: NHAN_TRANG_THAI_VOUCHER.EXPIRED,
      coTheApDung: false,
      lyDo: 'Mã giảm giá đã hết hạn.',
    };
  }

  if (trangThaiLuuTru !== 'ACTIVE') {
    return {
      maTrangThai: MA_TRANG_THAI_VOUCHER.INACTIVE,
      nhanTrangThai: NHAN_TRANG_THAI_VOUCHER.INACTIVE,
      coTheApDung: false,
      lyDo: 'Mã giảm giá không còn hiệu lực.',
    };
  }

  return {
    maTrangThai: MA_TRANG_THAI_VOUCHER.ACTIVE,
    nhanTrangThai: NHAN_TRANG_THAI_VOUCHER.ACTIVE,
    coTheApDung: true,
    lyDo: '',
  };
};
