import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySqlService } from '../../database/mysql/mysql.service';
import { DonHangQueryService } from './don-hang-query.service';
import { DiemTichLuyService } from '../diem-tich-luy/diem-tich-luy.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { taoMa } from '../../common/tao-ma';
import { resolveMaBan } from '../../common/ban-resolver';
import {
  TRANG_THAI_BAN,
  TRANG_THAI_DON_HANG_DANG_MO,
  TRANG_THAI_DAT_BAN_GIU_BAN,
  TRANG_THAI_DAT_BAN_SU_DUNG_BAN,
  laTrangThaiDonHangKetThuc,
} from '../../common/constants';

const TRANG_THAI_DON_HANG_HOP_LE = new Set([
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Served',
  'Serving',
  'Paid',
  'Cancelled',
  'Completed',
  'CHO_XU_LY',
  'DANG_CHE_BIEN',
  'SAN_SANG',
  'DANG_PHUC_VU',
  'DA_THANH_TOAN',
  'DA_HUY',
]);

@Injectable()
export class DonHangPaymentStatusService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly donHangQueryService: DonHangQueryService,
    private readonly diemTichLuyService: DiemTichLuyService,
  ) {}

  private layNguoiThucHien(nguoiDung?: any) {
    return String(nguoiDung?.maND || nguoiDung?.MaND || 'SYSTEM').trim() || 'SYSTEM';
  }

  private async timMaBan(giaTri: string): Promise<string | null> {
    return resolveMaBan(this.mysql, giaTri);
  }

  private async layDonHangDangMoTaiBan(maBan: string, ketNoi?: any) {
    const thamSoTrangThai = Array.from(TRANG_THAI_DON_HANG_DANG_MO);
    const sql = `SELECT * FROM DonHang
       WHERE MaBan = ?
         AND TrangThai IN (${thamSoTrangThai.map(() => '?').join(', ')})
       ORDER BY NgayTao DESC
       LIMIT 1`;

    if (ketNoi) {
      const [rows] = await ketNoi.query(sql, [maBan, ...thamSoTrangThai]);
      return (rows as any[])[0] || null;
    }

    const rows = await this.mysql.truyVan(sql, [maBan, ...thamSoTrangThai]);
    return (rows as any[])[0] || null;
  }

  private async giaiPhongBanNeuKhongConRangBuoc(
    ketNoi: any,
    maBan: string,
    maDonHangBoQua: string,
  ) {
    const trangThaiDonHangDangMo = Array.from(TRANG_THAI_DON_HANG_DANG_MO);
    const [donHangRows] = await ketNoi.query(
      `SELECT MaDonHang FROM DonHang
       WHERE MaBan = ?
         AND MaDonHang <> ?
         AND TrangThai IN (${trangThaiDonHangDangMo.map(() => '?').join(', ')})
       LIMIT 1`,
      [maBan, maDonHangBoQua, ...trangThaiDonHangDangMo],
    );
    if ((donHangRows as any[]).length > 0) return;

    const trangThaiDatBanDangMo = [
      ...Array.from(TRANG_THAI_DAT_BAN_GIU_BAN),
      ...Array.from(TRANG_THAI_DAT_BAN_SU_DUNG_BAN),
    ];
    const [datBanRows] = await ketNoi.query(
      `SELECT MaDatBan FROM DatBan
       WHERE MaBan = ?
         AND TrangThai IN (${trangThaiDatBanDangMo.map(() => '?').join(', ')})
       LIMIT 1`,
      [maBan, ...trangThaiDatBanDangMo],
    );
    if ((datBanRows as any[]).length > 0) return;

    await ketNoi.execute('UPDATE Ban SET TrangThai = ? WHERE MaBan = ?', [
      TRANG_THAI_BAN.TRONG,
      maBan,
    ]);
  }

  async capNhatTrangThaiDonHang(
    maDonHang: string,
    trangThai: string,
    nguoiDung?: any,
  ) {
    if (!TRANG_THAI_DON_HANG_HOP_LE.has(trangThai)) {
      throw new BadRequestException(`Trạng thái '${trangThai}' không hợp lệ.`);
    }
    const [don] = await this.mysql.truyVan(
      'SELECT * FROM DonHang WHERE MaDonHang = ? LIMIT 1',
      [maDonHang],
    );
    if (!don) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }

    return this.mysql.giaoDich(async (ketNoi) => {
      await ketNoi.execute(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        [trangThai, maDonHang],
      );

      if (laTrangThaiDonHangKetThuc(trangThai) && don.MaBan) {
        await this.giaiPhongBanNeuKhongConRangBuoc(
          ketNoi,
          don.MaBan,
          maDonHang,
        );
      }

      const trangThaiCongDiem = new Set([
        'Paid',
        'Completed',
        'DA_THANH_TOAN',
        'DA_HOAN_THANH',
      ]);
      const trangThaiHoanDiem = new Set([
        'Cancelled',
        'DA_HUY',
      ]);

      if (trangThaiCongDiem.has(trangThai) && don.MaKH) {
        await this.diemTichLuyService.tinhDiemTuDonHang(
          don.MaKH,
          maDonHang,
          Number(don.TongTien || 0),
          undefined,
          this.layNguoiThucHien(nguoiDung),
          ketNoi,
        );
      }

      if (trangThaiHoanDiem.has(trangThai) && don.MaKH) {
        const giaoDichHoan = await this.diemTichLuyService.layGiaoDichDiemTheoDonHang(
          maDonHang,
          'DIEU_CHINH',
        );
        if (giaoDichHoan) {
          return this.donHangQueryService.layChiTietDonHangKhongKiemTraQuyen(
            maDonHang,
            ketNoi,
          );
        }

        const giaoDichCong = await this.diemTichLuyService.layGiaoDichDiemTheoDonHang(
          maDonHang,
          'CONG',
        );
        const soDiemDaCong = Math.abs(Number(giaoDichCong?.soDiem || 0));
        if (soDiemDaCong > 0) {
          await this.diemTichLuyService.congDiemHuyDon(
            nguoiDung,
            {
              maDonHang,
              soDiem: soDiemDaCong,
              moTa: `Hoàn điểm từ đơn hàng bị hủy ${maDonHang}`,
            },
            ketNoi,
          );
        }
      }

      if (trangThaiCongDiem.has(trangThai)) {
        const [hoaDonDaCo] = await ketNoi.query(
          'SELECT MaHoaDon FROM HoaDon WHERE MaDonHang = ? LIMIT 1',
          [maDonHang],
        );
        const maHoaDonDaCo = hoaDonDaCo?.[0]?.MaHoaDon;

        if (!maHoaDonDaCo) {
          const [chiTietRows] = await ketNoi.query(
            'SELECT * FROM ChiTietDonHang WHERE MaDonHang = ?',
            [maDonHang],
          );
          const chiTiet = chiTietRows as any[];
          const tongTienHang = chiTiet.reduce(
            (sum: number, ct: any) => sum + Number(ct.ThanhTien || 0),
            0,
          );
          const tienGiam =
            Number(don.TongTien || 0) > 0
              ? Math.max(0, tongTienHang - Number(don.TongTien || 0))
              : 0;
          const thanhToan = Number(don.TongTien || 0);
          const maHoaDon = taoMa('HD');

          await ketNoi.execute(
            'INSERT INTO HoaDon (MaHoaDon, MaDonHang, TongTien, GiamGia, ThanhTien, GhiChu, NgayXuat) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [maHoaDon, maDonHang, tongTienHang, tienGiam, thanhToan, ''],
          );

          await ketNoi.execute(
            'INSERT INTO ThanhToan (MaThanhToan, MaHoaDon, PhuongThuc, SoTien, TrangThai, ThoiGian) VALUES (?, ?, ?, ?, ?, NOW())',
            [taoMa('TT'), maHoaDon, 'TienMat', thanhToan, 'Success'],
          );
        }
      }

      return this.donHangQueryService.layChiTietDonHangKhongKiemTraQuyen(
        maDonHang,
        ketNoi,
      );
    });
  }

  async yeuCauThanhToanTaiBan(maBan: string) {
    const ma = await this.timMaBan(maBan);
    if (!ma) throw new NotFoundException('Không tìm thấy bàn.');
    const donHangDangMo = await this.layDonHangDangMoTaiBan(ma);
    if (!donHangDangMo) {
      throw new NotFoundException('Bàn chưa có order để thanh toán.');
    }
    await this.mysql.thucThi(
      'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
      ['Ready', donHangDangMo.MaDonHang],
    );
    await this.mysql.thucThi('UPDATE Ban SET TrangThai = ? WHERE MaBan = ?', [
      TRANG_THAI_BAN.DANG_SU_DUNG,
      ma,
    ]);
    return this.donHangQueryService.layChiTietDonHangKhongKiemTraQuyen(
      String(donHangDangMo.MaDonHang),
    );
  }

  async xacNhanThanhToanTaiBan(maBan: string, nguoiDung?: any) {
    const ma = await this.timMaBan(maBan);
    if (!ma) throw new NotFoundException('Không tìm thấy bàn.');
    const donHangDangMo = await this.layDonHangDangMoTaiBan(ma);
    if (!donHangDangMo) {
      throw new NotFoundException('Bàn chưa có order để xác nhận thanh toán.');
    }

    return this.mysql.giaoDich(async (ketNoi) => {
      const donHang = await this.layDonHangDangMoTaiBan(ma, ketNoi);
      if (!donHang) {
        throw new NotFoundException('Bàn chưa có order để xác nhận thanh toán.');
      }

      await ketNoi.execute(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        ['Paid', donHang.MaDonHang],
      );
      await this.giaiPhongBanNeuKhongConRangBuoc(ketNoi, ma, donHang.MaDonHang);

      if (donHang.MaKH) {
        await this.diemTichLuyService.tinhDiemTuDonHang(
          donHang.MaKH,
          donHang.MaDonHang,
          Number(donHang.TongTien || 0),
          undefined,
          this.layNguoiThucHien(nguoiDung),
          ketNoi,
        );
      }

      // Tạo HoaDon + ThanhToan để V_DoanhThuNgay tính đúng doanh thu
      const [chiTietRows] = await ketNoi.query(
        'SELECT * FROM ChiTietDonHang WHERE MaDonHang = ?',
        [donHang.MaDonHang],
      );
      const chiTiet = chiTietRows as any[];
      const tongTienHang = chiTiet.reduce(
        (sum: number, ct: any) => sum + Number(ct.ThanhTien || 0),
        0,
      );
      const tienGiam =
        Number(donHang.TongTien || 0) > 0
          ? Math.max(0, tongTienHang - Number(donHang.TongTien || 0))
          : 0;
      const thanhToan = Number(donHang.TongTien || 0);
      const maHoaDon = taoMa('HD');

      await ketNoi.execute(
        'INSERT INTO HoaDon (MaHoaDon, MaDonHang, TongTien, GiamGia, ThanhTien, GhiChu, NgayXuat) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [maHoaDon, donHang.MaDonHang, tongTienHang, tienGiam, thanhToan, ''],
      );

      await ketNoi.execute(
        'INSERT INTO ThanhToan (MaThanhToan, MaHoaDon, PhuongThuc, SoTien, TrangThai, ThoiGian) VALUES (?, ?, ?, ?, ?, NOW())',
        [taoMa('TT'), maHoaDon, 'TienMat', thanhToan, 'Success'],
      );

      return this.donHangQueryService.layChiTietDonHangKhongKiemTraQuyen(
        String(donHang.MaDonHang),
      );
    });
  }

  async capNhatTrangThaiChiTietMon(
    maDonHang: string,
    maChiTiet: string,
    trangThai: string,
  ) {
    const trangThaiHopLe = new Set(['Preparing', 'Ready', 'Served']);
    if (!trangThaiHopLe.has(trangThai)) {
      throw new BadRequestException(
        `Trạng thái '${trangThai}' không hợp lệ. Chỉ chấp nhận: Preparing, Ready, Served.`,
      );
    }

    return this.mysql.giaoDich(async (ketNoi) => {
      await ketNoi.execute(
        'UPDATE ChiTietDonHang SET TrangThai = ? WHERE MaChiTiet = ? AND MaDonHang = ?',
        [trangThai, maChiTiet, maDonHang],
      );

      const [tatCaRows] = await ketNoi.query(
        'SELECT TrangThai FROM ChiTietDonHang WHERE MaDonHang = ?',
        [maDonHang],
      );
      const tatCa = tatCaRows as any[];

      if (tatCa.length === 0) {
        throw new NotFoundException('Không tìm thấy chi tiết đơn hàng.');
      }

      const tatCaDeuReady = tatCa.every(
        (ct: any) => ct.TrangThai === 'Ready' || ct.TrangThai === 'Served',
      );
      const coMonDangLam = tatCa.some(
        (ct: any) => ct.TrangThai === 'Preparing',
      );

      if (tatCaDeuReady) {
        await ketNoi.execute(
          'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
          ['Ready', maDonHang],
        );
      } else if (coMonDangLam) {
        await ketNoi.execute(
          'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
          ['Preparing', maDonHang],
        );
      }

      return this.donHangQueryService.layChiTietDonHangKhongKiemTraQuyen(
        maDonHang,
      );
    });
  }

  async layOrderDangMoTaiBan(maBan: string) {
    const ma = await this.timMaBan(maBan);
    if (!ma) throw new NotFoundException('Không tìm thấy bàn.');
    const donHangDangMo = await this.layDonHangDangMoTaiBan(ma);
    if (!donHangDangMo) {
      return taoPhanHoi(null, 'Bàn chưa có order đang mở');
    }
    return this.donHangQueryService.layChiTietDonHangKhongKiemTraQuyen(
      String(donHangDangMo.MaDonHang),
    );
  }
}
