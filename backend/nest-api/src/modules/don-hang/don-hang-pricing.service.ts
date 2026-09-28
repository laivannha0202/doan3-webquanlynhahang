import { BadRequestException, Injectable } from '@nestjs/common';
import type { PoolConnection } from 'mysql2/promise';
import { MySqlService } from '../../database/mysql/mysql.service';
import { BanGhi } from '../../common/types';
import { tinhGiamGia } from '../../common/tinh-giam-gia.helper';
import {
  GIA_TRI_QUY_DOI,
  LOAI_MA_GIAM_GIA,
  PHAM_VI_MA_GIAM_GIA,
  TI_LE_QUY_DOI_DIEM,
} from '../../common/constants';
import {
  getVoucherPhamViLabel,
  kiemTraPhamViMaGiamGia,
  normalizePhamViMaGiamGia,
  xacDinhTrangThaiMaGiamGia,
} from '../../common/ma-giam-gia.helper';

@Injectable()
export class DonHangPricingService {
  constructor(private readonly mysql: MySqlService) {}

  taoPhanHoiMaGiam(payload: BanGhi = {}, soTienGiamThucTe = 0) {
    const phamVi = normalizePhamViMaGiamGia(
      payload.phamVi || payload.PhamVi || PHAM_VI_MA_GIAM_GIA.CA_HAI,
    );
    return {
      hopLe: Boolean(payload.maGiamGia || payload.maCode),
      maGiamGia: String(payload.maGiamGia || payload.maCode || '').trim(),
      tenGiamGia: String(payload.tenGiamGia || payload.tenCode || '').trim(),
      loaiGiam: String(payload.loaiGiam || '').trim(),
      loaiMa: String(
        payload.loaiMa || payload.LoaiMa || LOAI_MA_GIAM_GIA.CONG_KHAI,
      )
        .trim()
        .toUpperCase(),
      maKH: String(payload.maKH || payload.MaKH || '').trim(),
      diemDaDoi: payload.diemDaDoi == null ? null : Number(payload.diemDaDoi),
      giaTriGiam: Number(payload.giaTriGiam || payload.giaTri || 0),
      giamToiDa:
        payload.giamToiDa == null && payload.giaTriToiDa == null
          ? null
          : Number(payload.giamToiDa ?? payload.giaTriToiDa),
      dieuKienToiThieu: Number(
        payload.dieuKienToiThieu || payload.donHangToiThieu || 0,
      ),
      soTienGiamThucTe: Number(soTienGiamThucTe || 0),
      thongDiep: String(payload.thongDiep || payload.moTa || '').trim(),
      phamVi,
      phamViHienThi: getVoucherPhamViLabel(phamVi),
      trangThaiRuntime: String(payload.trangThaiRuntime || '').trim(),
      trangThaiHienThi: String(payload.trangThaiHienThi || '').trim(),
      coTheApDung:
        payload.coTheApDung == null ? null : Boolean(payload.coTheApDung),
    };
  }

  tinhPhiDichVuTheoTamTinh(tamTinh: number) {
    return tamTinh > 0
      ? Math.round((Number(tamTinh || 0) * 0.05) / 1000) * 1000
      : 0;
  }

  tinhTongTamTinhTuChiTiet(chiTiet: BanGhi[]) {
    return chiTiet.reduce(
      (tong, muc) => tong + Number(muc.ThanhTien || muc.thanhTien || 0),
      0,
    );
  }

  taoTongHopGia(tamTinh: number, giamGia = 0, phiDichVu = 0) {
    return {
      tamTinh: Number(tamTinh || 0),
      giamGia: Number(giamGia || 0),
      phiDichVu: Number(phiDichVu || 0),
      tongTien: Math.max(
        0,
        Number(tamTinh || 0) + Number(phiDichVu || 0) - Number(giamGia || 0),
      ),
    };
  }

  taoTongHopGiaTuDuLieuDonHang(donHang: BanGhi, chiTiet: BanGhi[]) {
    const tamTinh = this.tinhTongTamTinhTuChiTiet(chiTiet);
    const tongTienDaLuu = Number(donHang.TongTien || donHang.tongTien || 0);
    const phiDichVu = this.tinhPhiDichVuTheoTamTinh(tamTinh);
    const tongTruocGiam = tamTinh + phiDichVu;
    const giamGia = Math.max(0, tongTruocGiam - tongTienDaLuu);
    return this.taoTongHopGia(tamTinh, giamGia, phiDichVu);
  }

  async layThongTinMaGiamApDung(
    maCodeDauVao: unknown,
    tongTien: number,
    maKH?: string,
    ketNoi?: import('mysql2/promise').PoolConnection,
    phamVi: string = PHAM_VI_MA_GIAM_GIA.DON_HANG,
  ) {
    const maCode = String(maCodeDauVao || '').trim();
    if (!maCode) {
      return this.taoPhanHoiMaGiam();
    }

    const ma = ketNoi
      ? (
          await ketNoi.query(
            'SELECT * FROM MaGiamGia WHERE MaCode = ? LIMIT 1 FOR UPDATE',
            [maCode],
          )
        )[0]?.[0]
      : (
          await this.mysql.truyVan(
            'SELECT * FROM MaGiamGia WHERE MaCode = ? LIMIT 1 FOR UPDATE',
            [maCode],
          )
        )[0];
    if (!ma) throw new BadRequestException('Mã giảm giá không tồn tại.');
    const loaiMa = String(ma.LoaiMa || LOAI_MA_GIAM_GIA.CONG_KHAI)
      .trim()
      .toUpperCase();
    const maKHGanVoiMa = String(ma.MaKH || '').trim();
    const hopLePhamVi = kiemTraPhamViMaGiamGia(
      ma.PhamVi || PHAM_VI_MA_GIAM_GIA.CA_HAI,
      phamVi || PHAM_VI_MA_GIAM_GIA.DON_HANG,
    );

    if (!hopLePhamVi.hopLe) {
      throw new BadRequestException(hopLePhamVi.lyDo);
    }

    if (loaiMa !== LOAI_MA_GIAM_GIA.CONG_KHAI) {
      if (!maKHGanVoiMa) {
        throw new BadRequestException(
          'Mã giảm giá riêng chưa được gán khách hàng.',
        );
      }
      if (!maKH || String(maKH).trim() !== maKHGanVoiMa) {
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

    const trangThai = xacDinhTrangThaiMaGiamGia(ma);
    if (!trangThai.coTheApDung) {
      throw new BadRequestException(trangThai.lyDo);
    }

    if (tongTien < Number(ma.DonHangToiThieu || 0))
      throw new BadRequestException(
        'Đơn hàng chưa đủ điều kiện áp dụng mã giảm giá.',
      );

    const { giaTriGiam, giamToiDa, soTienGiamThucTe } = tinhGiamGia(
      tongTien,
      ma,
    );

    return this.taoPhanHoiMaGiam(
      {
        maGiamGia: ma.MaCode,
        tenGiamGia: ma.TenCode,
        loaiGiam: ma.LoaiGiam,
        loaiMa: loaiMa,
        maKH: maKHGanVoiMa,
        diemDaDoi: ma.DiemDaDoi == null ? null : Number(ma.DiemDaDoi),
        giaTriGiam,
        giamToiDa,
        dieuKienToiThieu: Number(ma.DonHangToiThieu || 0),
        thongDiep: '',
        trangThaiRuntime: trangThai.maTrangThai,
        trangThaiHienThi: trangThai.nhanTrangThai,
        coTheApDung: trangThai.coTheApDung,
        phamVi: normalizePhamViMaGiamGia(
          ma.PhamVi || PHAM_VI_MA_GIAM_GIA.CA_HAI,
        ),
      },
      soTienGiamThucTe,
    );
  }

  tinhSoTienGiamTuDiem(soDiem: number): number {
    if (!soDiem || soDiem <= 0) return 0;
    return Math.floor(soDiem / TI_LE_QUY_DOI_DIEM) * GIA_TRI_QUY_DOI;
  }

  taoPhanHoiDiem(soDiem: number, soTienGiam: number) {
    return {
      soDiem: Number(soDiem || 0),
      soTienGiam: Number(soTienGiam || 0),
      tiLeQuyDoi: TI_LE_QUY_DOI_DIEM,
      giaTriQuyDoi: GIA_TRI_QUY_DOI,
      thongDiep:
        soDiem > 0
          ? `Đổi ${soDiem} điểm = ${soTienGiam.toLocaleString('vi-VN')}đ`
          : '',
    };
  }

  async tinhLaiGiaDonHang(
    payload: BanGhi,
    chiTietDauVao: BanGhi[],
    ketNoi?: PoolConnection,
  ) {
    const chiTietDaTinh: BanGhi[] = [];
    let tamTinh = 0;

    for (const muc of chiTietDauVao) {
      const [mon] = ketNoi
        ? await ketNoi
            .query('SELECT * FROM ThucDon WHERE MaMon = ? LIMIT 1', [muc.maMon])
            .then(([rows]) => rows as any[])
        : await this.mysql.truyVan(
            'SELECT * FROM ThucDon WHERE MaMon = ? LIMIT 1',
            [muc.maMon],
          );
      if (!mon)
        throw new BadRequestException(`Món ${muc.maMon} không tồn tại.`);

      const soLuong = Number(muc.soLuong || 0);
      const donGia = Number(mon.Gia || 0);
      const thanhTien = soLuong * donGia;
      tamTinh += thanhTien;
      chiTietDaTinh.push({
        ...muc,
        tenMon: String(mon.TenMon || ''),
        donGia,
        soLuong,
        thanhTien,
      });
    }

    const phiDichVu = this.tinhPhiDichVuTheoTamTinh(tamTinh);
    const tongTienTruocGiam = tamTinh + phiDichVu;
    const phamViApDung = String(
      payload.phamViApDung || payload.phamVi || PHAM_VI_MA_GIAM_GIA.DON_HANG,
    )
      .trim()
      .toUpperCase();
    const maGiamGia = await this.layThongTinMaGiamApDung(
      payload.maGiamGia,
      tongTienTruocGiam,
      payload.maKH || payload.nguoiDung?.maKH,
      ketNoi,
      phamViApDung,
    );

    const soDiem = Number(payload.soDiem || 0);
    const giamGiaTuDiem = this.tinhSoTienGiamTuDiem(soDiem);
    if (giamGiaTuDiem > tongTienTruocGiam) {
      throw new BadRequestException(
        'Tổng giảm giá không được vượt quá tổng tiền đơn hàng.',
      );
    }
    const diemApDung = this.taoPhanHoiDiem(soDiem, giamGiaTuDiem);

    const tongGiamGia = maGiamGia.soTienGiamThucTe + giamGiaTuDiem;
    if (tongGiamGia > tongTienTruocGiam) {
      throw new BadRequestException(
        'Tổng giảm giá không được vượt quá tổng tiền đơn hàng.',
      );
    }
    const tongHopGia = this.taoTongHopGia(tamTinh, tongGiamGia, phiDichVu);

    return { chiTietDaTinh, tongHopGia, maGiamGia, diemApDung };
  }
}
