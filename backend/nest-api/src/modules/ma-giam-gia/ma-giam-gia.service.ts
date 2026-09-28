import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolConnection } from 'mysql2/promise';
import { MySqlService } from '../../database/mysql/mysql.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { tinhGiamGia } from '../../common/tinh-giam-gia.helper';
import { BanGhi } from '../../common/types';
import {
  GIA_TRI_QUY_DOI,
  LOAI_MA_GIAM_GIA,
  PHAM_VI_MA_GIAM_GIA,
  SO_NGAY_HIEU_LUC_VOUCHER_DOI_DIEM,
  TI_LE_QUY_DOI_DIEM,
} from '../../common/constants';
import { taoMa } from '../../common/tao-ma';
import { layKhachHangTheoMaNd as layKhachHangTheoMaNdHelper } from '../../common/khach-hang.helper';
import {
  getVoucherPhamViLabel,
  kiemTraPhamViMaGiamGia,
  normalizePhamViMaGiamGia,
  taoMaVoucherDoiDiemTheoYeuCau,
  xacDinhTrangThaiMaGiamGia,
} from '../../common/ma-giam-gia.helper';

@Injectable()
export class MaGiamGiaService {
  constructor(private readonly mysql: MySqlService) {}

  private async truyVan(
    sql: string,
    thamSo: any[] = [],
    ketNoi?: PoolConnection,
  ) {
    if (ketNoi) {
      const [kq] = await ketNoi.query(sql, thamSo);
      return kq as any[];
    }
    return this.mysql.truyVan(sql, thamSo);
  }

  private async thucThi(
    sql: string,
    thamSo: any[] = [],
    ketNoi?: PoolConnection,
  ) {
    if (ketNoi) {
      await ketNoi.execute(sql, thamSo);
      return;
    }
    await this.mysql.thucThi(sql, thamSo);
  }

  private async layKhachHangTheoMaNd(maND: string, ketNoi?: PoolConnection) {
    return layKhachHangTheoMaNdHelper(this.mysql, maND, ketNoi);
  }

  private chuanHoaMaGiamGia(ma: BanGhi) {
    const loaiMa = String(ma.LoaiMa || LOAI_MA_GIAM_GIA.CONG_KHAI)
      .trim()
      .toUpperCase();
    const maKhachHang = String(ma.MaKH || '').trim();
    const phamVi = normalizePhamViMaGiamGia(
      ma.PhamVi || ma.phamVi || PHAM_VI_MA_GIAM_GIA.CA_HAI,
    );
    const trangThai = xacDinhTrangThaiMaGiamGia(ma);
    const trangThaiLuuTru = String(ma.TrangThai || 'Active');

    return {
      maCode: String(ma.MaCode || ''),
      tenCode: String(ma.TenCode || ''),
      giaTri: Number(ma.GiaTri || 0),
      loaiGiam: String(ma.LoaiGiam || ''),
      loaiMa,
      maKH: maKhachHang || null,
      maKhachHang: maKhachHang || null,
      diemDaDoi: ma.DiemDaDoi == null ? null : Number(ma.DiemDaDoi),
      giaTriToiDa: ma.GiaTriToiDa == null ? null : Number(ma.GiaTriToiDa),
      donHangToiThieu: Number(ma.DonHangToiThieu || 0),
      ngayBatDau: ma.NgayBatDau || null,
      ngayKetThuc: ma.NgayKetThuc || null,
      soLanToiDa: ma.SoLanToiDa == null ? null : Number(ma.SoLanToiDa),
      soLanDaDung: Number(ma.SoLanDaDung || 0),
      phamVi,
      phamViHienThi: getVoucherPhamViLabel(phamVi),
      trangThai: trangThaiLuuTru,
      trangThaiRuntime: trangThai.maTrangThai,
      trangThaiHienThi: trangThai.nhanTrangThai,
      coTheApDung: trangThai.coTheApDung,
      lyDoTrangThai: trangThai.lyDo,
      nguonTao: ma.NguonTao || null,
    };
  }

  private kiemTraDieuKienSuDungMa(
    ma: BanGhi,
    tongTien: number,
    maKH?: string,
    phamVi?: string,
  ) {
    const loaiMa = String(ma.LoaiMa || LOAI_MA_GIAM_GIA.CONG_KHAI)
      .trim()
      .toUpperCase();
    const maKhachHang = String(ma.MaKH || '').trim();
    const hopLePhamVi = kiemTraPhamViMaGiamGia(
      ma.PhamVi || ma.phamVi || PHAM_VI_MA_GIAM_GIA.CA_HAI,
      phamVi,
    );
    const trangThai = xacDinhTrangThaiMaGiamGia(ma);

    if (!hopLePhamVi.hopLe) {
      throw new BadRequestException(hopLePhamVi.lyDo);
    }

    if (!trangThai.coTheApDung) {
      throw new BadRequestException(trangThai.lyDo);
    }

    if (tongTien < Number(ma.DonHangToiThieu || 0)) {
      throw new BadRequestException(
        'Đơn hàng chưa đủ điều kiện áp dụng mã giảm giá.',
      );
    }

    if (loaiMa !== LOAI_MA_GIAM_GIA.CONG_KHAI) {
      if (!maKhachHang) {
        throw new BadRequestException(
          'Mã giảm giá riêng chưa được gán khách hàng.',
        );
      }
      if (!maKH || String(maKH).trim() !== maKhachHang) {
        throw new BadRequestException(
          'Mã giảm giá không thuộc về khách hàng này.',
        );
      }
    }

    if (
      loaiMa === LOAI_MA_GIAM_GIA.DOI_DIEM &&
      Number(ma.DiemDaDoi || 0) <= 0
    ) {
      throw new BadRequestException('Mã đổi điểm không hợp lệ.');
    }
  }

  private taoMaVoucherDoiDiem() {
    return taoMa('LOYALTY').replace('LOYALTY_', 'LOYALTY-').toUpperCase();
  }

  tinhSoTienGiamTuDiem(soDiem: number): number {
    const soDiemHopLe = Number(soDiem || 0);
    if (!soDiemHopLe || soDiemHopLe <= 0) return 0;
    return Math.floor(soDiemHopLe / TI_LE_QUY_DOI_DIEM) * GIA_TRI_QUY_DOI;
  }

  async kiemTraMaGiamGia(payload: BanGhi) {
    const maCode = String(payload.maCode || '').trim();
    const tongTien = Number(payload.tongTien || 0);
    const maKH = String(payload.maKH || '').trim();
    const phamVi = String(payload.phamVi || payload.PhamVi || '').trim();
    const [ma] = await this.truyVan(
      'SELECT * FROM MaGiamGia WHERE MaCode = ? LIMIT 1',
      [maCode],
    );

    if (!ma) throw new NotFoundException('Không tìm thấy mã giảm giá.');

    this.kiemTraDieuKienSuDungMa(
      ma,
      tongTien,
      maKH || undefined,
      phamVi || undefined,
    );

    const { giaTriGiam, giamToiDa, soTienGiamThucTe } = tinhGiamGia(
      tongTien,
      ma,
    );

    const duLieu = this.chuanHoaMaGiamGia(ma);
    return taoPhanHoi(
      {
        ...duLieu,
        hopLe: true,
        giaTriGiam,
        giamToiDa,
        dieuKienToiThieu: Number(ma.DonHangToiThieu || 0),
        soTienGiamThucTe,
        thongDiep: '',
        maGiamGia: duLieu.maCode,
        tenGiamGia: duLieu.tenCode,
        loaiGiam: duLieu.loaiGiam,
        giaTri: duLieu.giaTri,
        giaTriToiDa: duLieu.giaTriToiDa,
        donHangToiThieu: duLieu.donHangToiThieu,
      },
      'Kiểm tra mã giảm giá thành công',
    );
  }

  async layDanhSach() {
    const danhSach = await this.truyVan(
      `SELECT MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu,
              NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao, PhamVi
       FROM MaGiamGia
       ORDER BY NgayBatDau DESC, MaCode DESC`,
    );
    return taoPhanHoi(
      danhSach.map((ma) => this.chuanHoaMaGiamGia(ma)),
      'Lấy danh sách mã giảm giá thành công',
    );
  }

  async layDanhSachCongKhaiChoCheckout(
    phamViYeuCau: string = PHAM_VI_MA_GIAM_GIA.DON_HANG,
  ) {
    const danhSach = await this.truyVan(
      `SELECT MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu,
              NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao, PhamVi
       FROM MaGiamGia
       WHERE LoaiMa = 'PUBLIC'
       ORDER BY NgayBatDau DESC, MaCode DESC`,
    );

    return taoPhanHoi(
      danhSach
        .map((ma) => this.chuanHoaMaGiamGia(ma))
        .filter((ma) => kiemTraPhamViMaGiamGia(ma.phamVi, phamViYeuCau).hopLe)
        .filter((ma) => ma.coTheApDung),
      'Lấy voucher công khai thành công',
    );
  }

  async layCuaToi(nguoiDung: BanGhi) {
    const khachHang = await this.layKhachHangTheoMaNd(
      String(nguoiDung?.maND || ''),
    );
    const maKH = String(khachHang?.MaKH || '').trim();
    if (!maKH) {
      return taoPhanHoi([], 'Không có voucher cá nhân');
    }

    const danhSach = await this.truyVan(
      `SELECT MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu,
              NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao, PhamVi
       FROM MaGiamGia
       WHERE MaKH = ?
         AND LoaiMa IN ('CUSTOMER', 'LOYALTY', 'VIP', 'BIRTHDAY')
       ORDER BY NgayKetThuc DESC, NgayBatDau DESC, MaCode DESC`,
      [maKH],
    );

    return taoPhanHoi(
      danhSach.map((ma) => this.chuanHoaMaGiamGia(ma)),
      'Lấy voucher của khách hàng thành công',
    );
  }

  async layVoucherCuaToiChoCheckout(
    nguoiDung: BanGhi,
    phamViYeuCau: string = PHAM_VI_MA_GIAM_GIA.DON_HANG,
  ) {
    const khachHang = await this.layKhachHangTheoMaNd(
      String(nguoiDung?.maND || ''),
    );
    const maKH = String(khachHang?.MaKH || '').trim();
    if (!maKH) {
      return taoPhanHoi([], 'Không có voucher cá nhân');
    }

    const danhSach = await this.truyVan(
      `SELECT MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu,
              NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao, PhamVi
       FROM MaGiamGia
       WHERE MaKH = ?
         AND LoaiMa IN ('CUSTOMER', 'LOYALTY', 'VIP', 'BIRTHDAY')
       ORDER BY NgayKetThuc DESC, NgayBatDau DESC, MaCode DESC`,
      [maKH],
    );

    return taoPhanHoi(
      danhSach
        .map((ma) => this.chuanHoaMaGiamGia(ma))
        .filter((ma) => kiemTraPhamViMaGiamGia(ma.phamVi, phamViYeuCau).hopLe)
        .filter((ma) => ma.coTheApDung),
      'Lấy voucher checkout của khách hàng thành công',
    );
  }

  async layChiTiet(maCode: string) {
    const [ma] = await this.truyVan(
      'SELECT * FROM MaGiamGia WHERE MaCode = ? LIMIT 1',
      [maCode],
    );
    if (!ma) throw new NotFoundException('Không tìm thấy mã giảm giá.');
    return taoPhanHoi(
      this.chuanHoaMaGiamGia(ma),
      'Lấy chi tiết mã giảm giá thành công',
    );
  }

  async taoMaGiamGia(payload: BanGhi) {
    const maCode = String(payload.maCode || '')
      .trim()
      .toUpperCase();
    const tenCode = String(payload.tenCode || '').trim();
    const loaiGiam = String(payload.loaiGiam || '').trim();
    const loaiMa = String(payload.loaiMa || LOAI_MA_GIAM_GIA.CONG_KHAI)
      .trim()
      .toUpperCase();
    const phamViRaw =
      payload.phamVi == null ? '' : String(payload.phamVi || '').trim();
    const phamViNhap = phamViRaw ? normalizePhamViMaGiamGia(phamViRaw) : null;
    if (phamViRaw && phamViNhap === 'UNKNOWN') {
      throw new BadRequestException('Phạm vi áp dụng không hợp lệ.');
    }
    const phamVi =
      phamViNhap ||
      (loaiMa === LOAI_MA_GIAM_GIA.DOI_DIEM
        ? PHAM_VI_MA_GIAM_GIA.DON_HANG
        : PHAM_VI_MA_GIAM_GIA.CA_HAI);
    const giaTri = Number(payload.giaTri);
    const giaTriToiDa =
      payload.giaTriToiDa == null ? null : Number(payload.giaTriToiDa);
    const donHangToiThieu =
      payload.donHangToiThieu == null ? null : Number(payload.donHangToiThieu);
    const ngayBatDau = String(payload.ngayBatDau || '').trim();
    const ngayKetThuc = String(payload.ngayKetThuc || '').trim();
    const soLanToiDa =
      payload.soLanToiDa == null ? null : Number(payload.soLanToiDa);
    const diemDaDoi =
      payload.diemDaDoi == null ? null : Number(payload.diemDaDoi);
    const maKH = String(payload.maKH || '').trim();
    const nguonTao = String(payload.nguonTao || 'NOI_BO').trim() || 'NOI_BO';
    const trangThai = String(payload.trangThai || 'Active').trim() || 'Active';

    if (
      !maCode ||
      !tenCode ||
      !loaiGiam ||
      !ngayBatDau ||
      !ngayKetThuc ||
      Number.isNaN(giaTri)
    ) {
      throw new BadRequestException('Thiếu thông tin bắt buộc.');
    }

    if (loaiMa !== LOAI_MA_GIAM_GIA.CONG_KHAI && !maKH) {
      throw new BadRequestException('Mã riêng cần chọn khách hàng sở hữu.');
    }

    if (
      loaiMa === LOAI_MA_GIAM_GIA.DOI_DIEM &&
      (!diemDaDoi || diemDaDoi <= 0)
    ) {
      throw new BadRequestException('Voucher đổi điểm phải có số điểm đã đổi.');
    }

    const [tonTai] = await this.truyVan(
      'SELECT MaCode FROM MaGiamGia WHERE MaCode = ? LIMIT 1',
      [maCode],
    );
    if (tonTai) throw new BadRequestException('Mã code đã tồn tại.');

    await this.thucThi(
      `INSERT INTO MaGiamGia
        (MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu,
         NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao, PhamVi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [
        maCode,
        tenCode,
        giaTri,
        loaiGiam,
        loaiMa,
        loaiMa === LOAI_MA_GIAM_GIA.CONG_KHAI ? null : maKH || null,
        loaiMa === LOAI_MA_GIAM_GIA.DOI_DIEM ? diemDaDoi : null,
        giaTriToiDa,
        donHangToiThieu,
        ngayBatDau,
        ngayKetThuc,
        soLanToiDa,
        trangThai,
        nguonTao,
        phamVi,
      ],
    );

    return taoPhanHoi(
      this.chuanHoaMaGiamGia({
        MaCode: maCode,
        TenCode: tenCode,
        GiaTri: giaTri,
        LoaiGiam: loaiGiam,
        LoaiMa: loaiMa,
        MaKH: loaiMa === LOAI_MA_GIAM_GIA.CONG_KHAI ? null : maKH || null,
        DiemDaDoi: loaiMa === LOAI_MA_GIAM_GIA.DOI_DIEM ? diemDaDoi : null,
        GiaTriToiDa: giaTriToiDa,
        DonHangToiThieu: donHangToiThieu,
        NgayBatDau: ngayBatDau,
        NgayKetThuc: ngayKetThuc,
        SoLanToiDa: soLanToiDa,
        SoLanDaDung: 0,
        TrangThai: trangThai,
        NguonTao: nguonTao,
        PhamVi: phamVi,
      }),
      'Tạo mã giảm giá thành công',
    );
  }

  async taoVoucherTuDoiDiem(
    payload: {
      maKH: string;
      soDiemDaDoi: number;
      soTienGiam: number;
      tenCode?: string;
      moTa?: string;
      nguonTao?: string;
      maYeuCau?: string;
    },
    ketNoi?: PoolConnection,
  ) {
    const maKH = String(payload.maKH || '').trim();
    const soDiemDaDoi = Number(payload.soDiemDaDoi || 0);
    const soTienGiam = Number(payload.soTienGiam || 0);
    const maYeuCau = String(payload.maYeuCau || '')
      .trim()
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 32);

    if (!maKH)
      throw new BadRequestException('Thiếu khách hàng cho voucher đổi điểm.');
    if (soDiemDaDoi <= 0)
      throw new BadRequestException('Số điểm đổi không hợp lệ.');
    if (soTienGiam <= 0)
      throw new BadRequestException('Giá trị voucher đổi điểm không hợp lệ.');

    const maCode = maYeuCau
      ? taoMaVoucherDoiDiemTheoYeuCau(maKH, maYeuCau)
      : this.taoMaVoucherDoiDiem();
    const tenCode =
      String(payload.tenCode || '').trim() || `Voucher đổi ${soDiemDaDoi} điểm`;
    const ngayBatDau = new Date();
    const ngayKetThuc = new Date(ngayBatDau);
    ngayKetThuc.setDate(
      ngayKetThuc.getDate() + SO_NGAY_HIEU_LUC_VOUCHER_DOI_DIEM,
    );

    if (maYeuCau) {
      const [voucherDaCo] = await this.truyVan(
        'SELECT * FROM MaGiamGia WHERE MaCode = ? LIMIT 1',
        [maCode],
        ketNoi,
      );
      if (voucherDaCo) {
        return {
          voucher: this.chuanHoaMaGiamGia(voucherDaCo),
          maCode,
          tenCode: String(voucherDaCo.TenCode || tenCode),
          soDiemDaDoi: Number(voucherDaCo.DiemDaDoi || soDiemDaDoi),
          soTienGiam: Number(voucherDaCo.GiaTri || soTienGiam),
        };
      }
    }

    await this.thucThi(
      `INSERT INTO MaGiamGia
        (MaCode, TenCode, GiaTri, LoaiGiam, LoaiMa, MaKH, DiemDaDoi, GiaTriToiDa, DonHangToiThieu,
         NgayBatDau, NgayKetThuc, SoLanToiDa, SoLanDaDung, TrangThai, NguonTao, PhamVi)
        VALUES (?, ?, ?, 'fixed_amount', 'LOYALTY', ?, ?, NULL, 0, ?, ?, 1, 0, 'Active', ?, 'DON_HANG')`,
      [
        maCode,
        tenCode,
        soTienGiam,
        maKH,
        soDiemDaDoi,
        ngayBatDau,
        ngayKetThuc,
        payload.nguonTao || 'DOI_DIEM_TICH_LUY',
      ],
      ketNoi,
    );

    const duLieu = {
      MaCode: maCode,
      TenCode: tenCode,
      GiaTri: soTienGiam,
      LoaiGiam: 'fixed_amount',
      LoaiMa: 'LOYALTY',
      MaKH: maKH,
      DiemDaDoi: soDiemDaDoi,
      GiaTriToiDa: null,
      DonHangToiThieu: 0,
      NgayBatDau: ngayBatDau,
      NgayKetThuc: ngayKetThuc,
      SoLanToiDa: 1,
      SoLanDaDung: 0,
      TrangThai: 'Active',
      NguonTao: payload.nguonTao || 'DOI_DIEM_TICH_LUY',
      PhamVi: PHAM_VI_MA_GIAM_GIA.DON_HANG,
    };

    return {
      voucher: this.chuanHoaMaGiamGia(duLieu),
      maCode,
      tenCode,
      soDiemDaDoi,
      soTienGiam,
    };
  }

  async capNhatMa(maCode: string, payload: BanGhi) {
    const [tonTai] = await this.truyVan(
      'SELECT * FROM MaGiamGia WHERE MaCode = ? LIMIT 1',
      [maCode],
    );
    if (!tonTai) throw new NotFoundException('Không tìm thấy mã giảm giá.');

    const tenCode =
      payload.tenCode == null ? null : String(payload.tenCode || '').trim();
    const giaTri = payload.giaTri == null ? null : Number(payload.giaTri);
    const loaiGiam =
      payload.loaiGiam == null ? null : String(payload.loaiGiam || '').trim();
    const loaiMa =
      payload.loaiMa == null
        ? null
        : String(payload.loaiMa || '')
            .trim()
            .toUpperCase();
    const phamViRaw =
      payload.phamVi == null ? null : String(payload.phamVi || '').trim();
    const phamVi =
      phamViRaw && phamViRaw.length > 0
        ? normalizePhamViMaGiamGia(phamViRaw)
        : null;
    const maKH =
      payload.maKH == null ? null : String(payload.maKH || '').trim() || null;
    const giaTriToiDa =
      payload.giaTriToiDa == null ? null : Number(payload.giaTriToiDa);
    const donHangToiThieu =
      payload.donHangToiThieu == null ? null : Number(payload.donHangToiThieu);
    const ngayBatDau =
      payload.ngayBatDau == null
        ? null
        : String(payload.ngayBatDau || '').trim();
    const ngayKetThuc =
      payload.ngayKetThuc == null
        ? null
        : String(payload.ngayKetThuc || '').trim();
    const soLanToiDa =
      payload.soLanToiDa == null ? null : Number(payload.soLanToiDa);
    const diemDaDoi =
      payload.diemDaDoi == null ? null : Number(payload.diemDaDoi);
    const nguonTao =
      payload.nguonTao == null ? null : String(payload.nguonTao || '').trim();
    const trangThai =
      payload.trangThai == null ? null : String(payload.trangThai || '').trim();

    const loaiMaSauCapNhat =
      loaiMa ||
      String(tonTai.LoaiMa || LOAI_MA_GIAM_GIA.CONG_KHAI)
        .trim()
        .toUpperCase();
    const phamViSauCapNhat =
      phamVi ||
      (loaiMaSauCapNhat === LOAI_MA_GIAM_GIA.DOI_DIEM
        ? PHAM_VI_MA_GIAM_GIA.DON_HANG
        : normalizePhamViMaGiamGia(
            tonTai.PhamVi || PHAM_VI_MA_GIAM_GIA.CA_HAI,
          ));
    const maKHSauCapNhat =
      loaiMaSauCapNhat === LOAI_MA_GIAM_GIA.CONG_KHAI
        ? null
        : (maKH ?? (String(tonTai.MaKH || '').trim() || null));
    const diemDaDoiSauCapNhat =
      loaiMaSauCapNhat === LOAI_MA_GIAM_GIA.DOI_DIEM
        ? (diemDaDoi ?? Number(tonTai.DiemDaDoi || 0))
        : null;

    if (loaiMaSauCapNhat !== LOAI_MA_GIAM_GIA.CONG_KHAI && !maKHSauCapNhat) {
      throw new BadRequestException('Mã riêng cần chọn khách hàng sở hữu.');
    }
    if (
      loaiMaSauCapNhat === LOAI_MA_GIAM_GIA.DOI_DIEM &&
      diemDaDoiSauCapNhat <= 0
    ) {
      throw new BadRequestException('Voucher đổi điểm phải có số điểm đã đổi.');
    }
    if (phamViRaw && phamVi === 'UNKNOWN') {
      throw new BadRequestException('Phạm vi áp dụng không hợp lệ.');
    }

    await this.thucThi(
      `UPDATE MaGiamGia SET
        TenCode = COALESCE(?, TenCode),
        GiaTri = COALESCE(?, GiaTri),
        LoaiGiam = COALESCE(?, LoaiGiam),
        LoaiMa = COALESCE(?, LoaiMa),
        MaKH = ?,
        DiemDaDoi = ?,
        GiaTriToiDa = ?,
        DonHangToiThieu = COALESCE(?, DonHangToiThieu),
        NgayBatDau = COALESCE(?, NgayBatDau),
        NgayKetThuc = COALESCE(?, NgayKetThuc),
        SoLanToiDa = ?,
        TrangThai = COALESCE(?, TrangThai),
        NguonTao = COALESCE(?, NguonTao),
        PhamVi = COALESCE(?, PhamVi)
       WHERE MaCode = ?`,
      [
        tenCode == null || tenCode === '' ? null : tenCode,
        giaTri == null || Number.isNaN(giaTri) ? null : giaTri,
        loaiGiam == null || loaiGiam === '' ? null : loaiGiam,
        loaiMa == null || loaiMa === '' ? null : loaiMa,
        maKHSauCapNhat,
        diemDaDoiSauCapNhat,
        giaTriToiDa == null || Number.isNaN(giaTriToiDa) ? null : giaTriToiDa,
        donHangToiThieu == null || Number.isNaN(donHangToiThieu)
          ? null
          : donHangToiThieu,
        ngayBatDau == null || ngayBatDau === '' ? null : ngayBatDau,
        ngayKetThuc == null || ngayKetThuc === '' ? null : ngayKetThuc,
        soLanToiDa == null || Number.isNaN(soLanToiDa) ? null : soLanToiDa,
        trangThai == null || trangThai === '' ? null : trangThai,
        nguonTao == null || nguonTao === '' ? null : nguonTao,
        phamViSauCapNhat == null || phamViSauCapNhat === 'UNKNOWN'
          ? null
          : phamViSauCapNhat,
        maCode,
      ],
    );

    return taoPhanHoi(
      {
        maCode,
        phamVi: phamViSauCapNhat,
      },
      'Cập nhật mã giảm giá thành công',
    );
  }

  async xoaMa(maCode: string) {
    const [tonTai] = await this.truyVan(
      'SELECT MaCode FROM MaGiamGia WHERE MaCode = ? LIMIT 1',
      [maCode],
    );
    if (!tonTai) throw new NotFoundException('Không tìm thấy mã giảm giá.');

    await this.thucThi('DELETE FROM MaGiamGia WHERE MaCode = ?', [maCode]);
    return taoPhanHoi({ maCode }, 'Xóa mã giảm giá thành công');
  }
}
