import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySqlService } from '../../database/mysql/mysql.service';
import { DonHangPricingService } from './don-hang-pricing.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { chuanHoaVaiTroNoiBo } from '../../common/vai-tro';
import { layKhachHangTheoMaNd } from '../../common/khach-hang.helper';
import { BanGhi } from '../../common/types';

@Injectable()
export class DonHangQueryService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly donHangPricingService: DonHangPricingService,
  ) {}

  async layChiTietDonHangTheoMa(maDonHang: string, ketNoi?: any) {
    const sql = `SELECT ct.*, td.TenMon
       FROM ChiTietDonHang ct
       LEFT JOIN ThucDon td ON td.MaMon = ct.MaMon
       WHERE ct.MaDonHang = ?
       ORDER BY ct.NgayTao ASC`;
    const chiTiet = ketNoi
      ? ((await ketNoi.query(sql, [maDonHang]))[0] as any[])
      : await this.mysql.truyVan(sql, [maDonHang]);

    return chiTiet.map((dong) => ({
      MaChiTiet: dong.MaChiTiet,
      MaMon: dong.MaMon,
      maMon: dong.MaMon,
      TenMon: dong.TenMon,
      tenMon: dong.TenMon,
      SoLuong: Number(dong.SoLuong || 0),
      soLuong: Number(dong.SoLuong || 0),
      DonGia: Number(dong.DonGia || 0),
      donGia: Number(dong.DonGia || 0),
      ThanhTien: Number(dong.ThanhTien || 0),
      thanhTien: Number(dong.ThanhTien || 0),
      GhiChu: dong.GhiChu || '',
      TrangThai: dong.TrangThai,
    }));
  }

  async layChiTietDonHangKhongKiemTraQuyen(maDonHang: string, ketNoi?: any) {
    const sql = `SELECT dh.*, kh.TenKH, kh.SDT, kh.DiaChi, nd.Email,
              b.TenBan, b.SoBan
       FROM DonHang dh
       LEFT JOIN KhachHang kh ON kh.MaKH = dh.MaKH
       LEFT JOIN NguoiDung nd ON nd.MaND = kh.MaND
       LEFT JOIN Ban b ON b.MaBan = dh.MaBan
       WHERE dh.MaDonHang = ?
       LIMIT 1`;
    const [donHang] = ketNoi
      ? ((await ketNoi.query(sql, [maDonHang]))[0] as any[])
      : await this.mysql.truyVan(sql, [maDonHang]);
    if (!donHang) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }

    const chiTiet = await this.layChiTietDonHangTheoMa(maDonHang, ketNoi);
    return taoPhanHoi(
      {
        donHang: this.taoThongTinDonHang(donHang, chiTiet),
        chiTiet,
      },
      'Lấy chi tiết đơn hàng thành công',
    );
  }

  private taoThongTinDonHang(don: BanGhi, chiTiet: BanGhi[]) {
    const tongHopGia = this.donHangPricingService.taoTongHopGiaTuDuLieuDonHang(
      don,
      chiTiet,
    );
    return {
      maDonHang: don.MaDonHang,
      maKH: don.MaKH,
      maBan: don.MaBan || don.MaBanAn,
      tenBan: don.TenBan || '',
      soBan: don.SoBan ?? '',
      maNV: don.MaNV,
      maDatBan: don.MaDatBan,
      tongTien: Number(don.TongTien || 0),
      tongHopGia,
      maGiamGia: this.donHangPricingService.taoPhanHoiMaGiam(
        {},
        tongHopGia.giamGia,
      ),
      trangThai: don.TrangThai,
      ghiChu: don.GhiChu || '',
      ngayTao: don.NgayTao,
      loaiDon: don.LoaiDon,
      tenKhachHang: don.TenKH || '',
      soDienThoai: don.SDT || '',
      email: don.Email || '',
      diaChiKhachHang: don.DiaChi || '',
      chiTiet,
    };
  }

  async layDanhSachDonHang() {
    const cacDong = await this.mysql.truyVan(
      `SELECT dh.*, kh.TenKH, kh.SDT, kh.DiaChi, nd.Email,
              b.TenBan, b.SoBan,
              ct.MaChiTiet, ct.MaMon, ct.SoLuong, ct.DonGia, ct.ThanhTien, ct.GhiChu AS CtGhiChu, ct.TrangThai AS CtTrangThai,
              td.TenMon
       FROM DonHang dh
       LEFT JOIN KhachHang kh ON kh.MaKH = dh.MaKH
       LEFT JOIN NguoiDung nd ON nd.MaND = kh.MaND
       LEFT JOIN Ban b ON b.MaBan = dh.MaBan
       LEFT JOIN ChiTietDonHang ct ON ct.MaDonHang = dh.MaDonHang
       LEFT JOIN ThucDon td ON td.MaMon = ct.MaMon
       ORDER BY dh.NgayTao DESC, ct.NgayTao ASC`,
    );

    const banDo = new Map<string, { don: any; chiTiet: any[] }>();
    for (const dong of cacDong) {
      const ma = String(dong.MaDonHang);
      if (!banDo.has(ma)) {
        banDo.set(ma, { don: dong, chiTiet: [] });
      }
      if (dong.MaChiTiet) {
        banDo.get(ma)!.chiTiet.push({
          MaChiTiet: dong.MaChiTiet,
          MaMon: dong.MaMon,
          TenMon: dong.TenMon,
          SoLuong: Number(dong.SoLuong || 0),
          DonGia: Number(dong.DonGia || 0),
          ThanhTien: Number(dong.ThanhTien || 0),
          GhiChu: dong.CtGhiChu || '',
          TrangThai: dong.CtTrangThai,
        });
      }
    }

    const ketQua = Array.from(banDo.values()).map(({ don, chiTiet }) =>
      this.taoThongTinDonHang(don, chiTiet),
    );

    return taoPhanHoi(ketQua, 'Lấy danh sách đơn hàng thành công');
  }

  async layDonHangCuaToi(nguoiDung: any) {
    const khachHang = await layKhachHangTheoMaNd(
      this.mysql,
      String(nguoiDung.maND),
    );
    if (!khachHang) {
      return taoPhanHoi([], 'Không có đơn hàng');
    }

    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM DonHang WHERE MaKH = ? ORDER BY NgayTao DESC',
      [khachHang.MaKH],
    );
    const ketQua = await Promise.all(
      danhSach.map(async (don) => {
        const chiTiet = await this.layChiTietDonHangTheoMa(
          String(don.MaDonHang),
        );
        return this.taoThongTinDonHang(don, chiTiet);
      }),
    );
    return taoPhanHoi(ketQua, 'Lấy đơn hàng của tôi thành công');
  }

  async layDonHangCoTheDanhGia(nguoiDung: any) {
    const khachHang = await layKhachHangTheoMaNd(
      this.mysql,
      String(nguoiDung.maND),
    );
    if (!khachHang) {
      return taoPhanHoi([], 'Không có đơn hàng có thể đánh giá');
    }

    const danhSach = await this.mysql.truyVan(
      `SELECT d.*
       FROM DonHang d
       LEFT JOIN DanhGia dg ON dg.MaDonHang = d.MaDonHang AND dg.MaKH = d.MaKH
       WHERE d.MaKH = ?
          AND d.TrangThai IN ('HOAN_THANH', 'DA_THANH_TOAN', 'DANG_PHUC_VU')
         AND dg.MaDanhGia IS NULL
       ORDER BY d.NgayTao DESC`,
      [khachHang.MaKH],
    );

    const ketQua = await Promise.all(
      danhSach.map(async (don) => {
        const chiTiet = await this.layChiTietDonHangTheoMa(
          String(don.MaDonHang),
        );
        return this.taoThongTinDonHang(don, chiTiet);
      }),
    );

    return taoPhanHoi(ketQua, 'Lấy đơn hàng có thể đánh giá thành công');
  }

  async layChiTietDonHang(nguoiDung: any, maDonHang: string) {
    const vaiTro = chuanHoaVaiTroNoiBo(String(nguoiDung.vaiTro || ''));
    const [donHang] = await this.mysql.truyVan(
      'SELECT MaKH FROM DonHang WHERE MaDonHang = ? LIMIT 1',
      [maDonHang],
    );

    if (!donHang) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }

    if (vaiTro !== 'Admin' && vaiTro !== 'NhanVien') {
      const khachHang = await layKhachHangTheoMaNd(
        this.mysql,
        String(nguoiDung.maND),
      );
      if (
        !khachHang ||
        String(khachHang.MaKH || '') !== String(donHang.MaKH || '')
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền xem chi tiết đơn hàng này.',
        );
      }
    }

    return this.layChiTietDonHangKhongKiemTraQuyen(maDonHang);
  }
}
