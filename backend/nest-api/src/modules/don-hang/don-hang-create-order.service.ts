import { BadRequestException, Injectable } from '@nestjs/common';
import type { PoolConnection } from 'mysql2/promise';
import { MySqlService } from '../../database/mysql/mysql.service';
import { DonHangPricingService } from './don-hang-pricing.service';
import { DiemTichLuyService } from '../diem-tich-luy/diem-tich-luy.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { taoMa } from '../../common/tao-ma';
import { BanGhi } from '../../common/types';
import { TRANG_THAI_BAN, TRANG_THAI_DON_HANG_DANG_MO } from '../../common/constants';

@Injectable()
export class DonHangCreateOrderService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly donHangPricingService: DonHangPricingService,
    private readonly diemTichLuyService: DiemTichLuyService,
  ) {}

  private async thucThi(sql: string, thamSo: any[], ketNoi: PoolConnection) {
    await ketNoi.execute(sql, thamSo);
  }

  private async truyVan(
    sql: string,
    thamSo: any[],
    ketNoi: PoolConnection,
  ): Promise<any[]> {
    const [kq] = await ketNoi.query(sql, thamSo);
    return kq as any[];
  }

  private async taoMaDonHangMoi(ketNoi: PoolConnection) {
    const [donHangGanNhat] = await this.truyVan(
      `SELECT MaDonHang
       FROM DonHang
       WHERE MaDonHang REGEXP '^DH[0-9]+$'
       ORDER BY CAST(SUBSTRING(MaDonHang, 3) AS UNSIGNED) DESC
       LIMIT 1
       FOR UPDATE`,
      [],
      ketNoi,
    );
    const soHienTai = Number(String(donHangGanNhat?.MaDonHang || '').slice(2));
    const soKeTiep = Number.isFinite(soHienTai) ? soHienTai + 1 : 1;
    return `DH${String(soKeTiep).padStart(3, '0')}`;
  }

  private chuanHoaDanhSachChiTiet(dsDauVao: unknown, tienToMaChiTiet: string) {
    const danhSach = Array.isArray(dsDauVao) ? dsDauVao : [];
    return danhSach
      .map((muc: BanGhi, chiSo: number) => ({
        maChiTiet: String(
          muc?.maChiTiet ||
            muc?.MaChiTiet ||
            `${tienToMaChiTiet}_${Date.now()}_${chiSo}`,
        ),
        maMon: String(muc?.maMon || muc?.MaMon || ''),
        soLuong: Number(muc?.soLuong || muc?.SoLuong || 0),
        ghiChu: String(muc?.ghiChu || muc?.GhiChu || ''),
      }))
      .filter((muc) => Boolean(muc.maMon));
  }

  async taoDonHang(payload: BanGhi) {
    const chiTiet = Array.isArray(payload.chiTiet)
      ? payload.chiTiet
      : Array.isArray(payload.monAn)
        ? payload.monAn
        : [];
    const maBan = payload.maBan || payload.maBanAn || null;
    const maDatBan = payload.maDatBan || null;
    const nguonTao = payload.nguonTao || 'Online';
    const loaiDonHang = 'TAI_BAN';
    const trangThai = payload.trangThai || 'DANG_CHUAN_BI';
    const capNhatTrangThaiBan = payload.capNhatTrangThaiBan !== false;
    const soDiem = Number(payload.soDiem || 0);

    const nguoiDung = payload.nguoiDung || { maND: payload.maND };

    if (soDiem > 0 && !nguoiDung.maND) {
      throw new BadRequestException(
        'Không thể đổi điểm khi chưa xác thực người dùng.',
      );
    }

    return this.mysql.giaoDich(async (ketNoi) => {
      const { chiTietDaTinh, tongHopGia, maGiamGia, diemApDung } =
        await this.donHangPricingService.tinhLaiGiaDonHang(
          payload,
          chiTiet,
          ketNoi,
        );

      let maDonHang = String(payload.maDonHang || '');
      let isAppending = false;

      if (maBan && !maDonHang && nguonTao === 'DatBan' && maDatBan) {
        const trangThaiDonHangDangMo = Array.from(TRANG_THAI_DON_HANG_DANG_MO);
        const [donDangMoTheoDatBan] = await this.truyVan(
          `SELECT MaDonHang FROM DonHang
           WHERE MaBan = ?
             AND MaDatBan = ?
             AND TrangThai IN (${trangThaiDonHangDangMo.map(() => '?').join(', ')})
           LIMIT 1`,
          [maBan, maDatBan, ...trangThaiDonHangDangMo],
          ketNoi,
        );
        if (donDangMoTheoDatBan) {
          maDonHang = donDangMoTheoDatBan.MaDonHang;
          isAppending = true;
        }
      }

      if (maBan && !maDonHang && !(nguonTao === 'DatBan' && maDatBan)) {
        const trangThaiDonHangDangMo = Array.from(TRANG_THAI_DON_HANG_DANG_MO);
        const [donDangMo] = await this.truyVan(
          `SELECT MaDonHang FROM DonHang
           WHERE MaBan = ?
             AND TrangThai IN (${trangThaiDonHangDangMo.map(() => '?').join(', ')})
           LIMIT 1`,
          [maBan, ...trangThaiDonHangDangMo],
          ketNoi,
        );
        if (donDangMo) {
          maDonHang = donDangMo.MaDonHang;
          isAppending = true;
        }
      }

      if (!maDonHang) maDonHang = await this.taoMaDonHangMoi(ketNoi);

      let diemDaDoi: any = null;
      if (soDiem > 0) {
        const ketQuaDoiDiem = await this.diemTichLuyService.doiDiem(
          nguoiDung,
          { soDiem, moTa: 'Đổi điểm thanh toán đơn hàng ' + maDonHang, maYeuCau: maDonHang },
          ketNoi,
        );
        diemDaDoi = ketQuaDoiDiem.data || ketQuaDoiDiem;
      }

      if (!isAppending) {
        await this.thucThi(
          'INSERT INTO DonHang (MaDonHang, MaKH, MaBan, MaNV, MaDatBan, LoaiDon, TongTien, TrangThai, NguonTao, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            maDonHang,
            payload.maKH || null,
            maBan,
            payload.maNV || null,
            maDatBan,
            loaiDonHang,
            tongHopGia.tongTien,
            trangThai,
            nguonTao,
            payload.ghiChu || null,
          ],
          ketNoi,
        );
      } else {
        const [donHienTai] = await this.truyVan(
          'SELECT TongTien FROM DonHang WHERE MaDonHang = ? LIMIT 1',
          [maDonHang],
          ketNoi,
        );
        const tongTienCu = Number(donHienTai?.TongTien || 0);
        const tongTienMoi = tongTienCu + tongHopGia.tongTien;
        await this.thucThi(
          'UPDATE DonHang SET TongTien = ? WHERE MaDonHang = ?',
          [tongTienMoi, maDonHang],
          ketNoi,
        );
        tongHopGia.tongTien = tongTienMoi;
      }

      const chiTietPhanHoi: BanGhi[] = [];
      for (const muc of chiTietDaTinh) {
        const maChiTiet = muc.maChiTiet || taoMa('CT');
        await this.thucThi(
          'INSERT INTO ChiTietDonHang (MaChiTiet, MaDonHang, MaMon, SoLuong, DonGia, ThanhTien, GhiChu, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            maChiTiet,
            maDonHang,
            muc.maMon,
            muc.soLuong,
            muc.donGia,
            muc.thanhTien,
            muc.ghiChu || null,
            'DANG_CHUAN_BI',
          ],
          ketNoi,
        );
        chiTietPhanHoi.push({
          MaChiTiet: maChiTiet,
          MaMon: muc.maMon,
          TenMon: muc.tenMon || '',
          SoLuong: muc.soLuong,
          DonGia: muc.donGia,
          ThanhTien: muc.thanhTien,
          GhiChu: muc.ghiChu || '',
          TrangThai: 'DANG_CHUAN_BI',
        });
      }

      if (maBan && capNhatTrangThaiBan) {
        await this.thucThi(
          'UPDATE Ban SET TrangThai = ? WHERE MaBan = ?',
          [TRANG_THAI_BAN.CO_KHACH, maBan],
          ketNoi,
        );
      }

      if (maGiamGia.hopLe && maGiamGia.maGiamGia && !isAppending) {
        await this.thucThi(
          'UPDATE MaGiamGia SET SoLanDaDung = SoLanDaDung + 1 WHERE MaCode = ?',
          [maGiamGia.maGiamGia],
          ketNoi,
        );
      }

      return taoPhanHoi(
        {
          donHang: {
            maDonHang,
            maKH: payload.maKH || null,
            maBan,
            maNV: payload.maNV || null,
            maDatBan,
            tongTien: tongHopGia.tongTien,
            tongHopGia,
            maGiamGia,
            diemApDung,
            trangThai,
            ghiChu: payload.ghiChu || '',
            ngayTao: new Date().toISOString(),
            loaiDon: 'TAI_BAN',
            tenKhachHang: payload.hoTen || payload.tenKhachHang || '',
            soDienThoai: payload.soDienThoai || '',
            email: payload.email || '',
            diaChiKhachHang: payload.diaChiKhachHang || '',
          },
          chiTiet: chiTietPhanHoi,
          diemDaDoi,
        },
        isAppending
          ? 'Thêm món vào đơn hàng hiện tại'
          : 'Tạo đơn hàng thành công',
      );
    });
  }

  async taoOrderTaiBan(maBan: string, payload: BanGhi) {
    const chiTiet = this.chuanHoaDanhSachChiTiet(payload.chiTiet, 'CTBAN');
    const danhSachMon = this.chuanHoaDanhSachChiTiet(
      payload.danhSachMon,
      'CTBAN',
    );
    const items = this.chuanHoaDanhSachChiTiet(payload.items, 'CTBAN');

    return this.taoDonHang({
      ...payload,
      maBan,
      maDonHang: payload.maDonHang,
      chiTiet: chiTiet.length
        ? chiTiet
        : danhSachMon.length
          ? danhSachMon
          : items,
      nguonTao: 'QRCode',
      loaiDon: 'TAI_BAN',
      soDiem: 0,
      nguoiDung: {},
    });
  }
}
