import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySqlService } from '../../database/mysql/mysql.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { BanGhi } from '../../common/types';
import { resolveMaBan } from '../../common/ban-resolver';
import { TRANG_THAI_BAN } from '../../common/constants';
import { chuanHoaTenKhuVucBan } from '../../common/khu-vuc-ban';

@Injectable()
export class BanCrudService {
  constructor(private readonly mysql: MySqlService) {}

  async layDanhSachBan() {
    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM Ban ORDER BY SoBan ASC, NgayCapNhat DESC',
    );
    return taoPhanHoi(
      danhSach.map((ban: BanGhi) => ({
        maBan: ban.MaBan,
        tenBan: ban.TenBan,
        soBan: Number(ban.SoBan || 0),
        soChoNgoi: Number(ban.SoChoNgoi || 0),
        khuVuc: chuanHoaTenKhuVucBan(`${ban.KhuVuc || ''} ${ban.ViTri || ''}`),
        viTri: chuanHoaTenKhuVucBan(`${ban.KhuVuc || ''} ${ban.ViTri || ''}`),
        ghiChu: ban.GhiChu,
        trangThai: ban.TrangThai,
      })),
      'Lay danh sach ban thanh cong',
    );
  }

  private async taoMaBanMoi(maBanNhap?: string) {
    const maBanDaNhap = String(maBanNhap || '').trim();
    if (maBanDaNhap) return maBanDaNhap;

    const [banCuoi] = await this.mysql.truyVan(
      "SELECT MaBan FROM Ban WHERE MaBan REGEXP '^B[0-9]+$' ORDER BY CAST(SUBSTRING(MaBan, 2) AS UNSIGNED) DESC LIMIT 1",
    );
    const soThuTuCuoi = Number(String(banCuoi?.MaBan || '').replace(/^B/, '')) || 0;
    return `B${String(soThuTuCuoi + 1).padStart(3, '0')}`;
  }

  async taoBan(body: BanGhi) {
    const soBan = Number(body.soBan || 0);
    const [banTrungSo] = await this.mysql.truyVan(
      'SELECT MaBan FROM Ban WHERE SoBan = ? LIMIT 1',
      [soBan],
    );
    if (banTrungSo) {
      throw new BadRequestException(`Số bàn ${soBan} đã tồn tại.`);
    }

    const maBan = await this.taoMaBanMoi(body.maBan);
    await this.mysql.thucThi(
      'INSERT INTO Ban (MaBan, TenBan, KhuVuc, SoBan, SoChoNgoi, ViTri, GhiChu, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        maBan,
        body.tenBan,
        chuanHoaTenKhuVucBan(`${body.khuVuc || ''} ${body.viTri || ''}`),
        soBan,
        Number(body.soChoNgoi || 0),
        chuanHoaTenKhuVucBan(`${body.khuVuc || ''} ${body.viTri || ''}`),
        body.ghiChu || null,
        TRANG_THAI_BAN.TRONG,
      ],
    );
    return taoPhanHoi({ maBan }, 'Tao ban thanh cong');
  }

  async capNhatBan(maBan: string, body: BanGhi) {
    const ma = await resolveMaBan(this.mysql, maBan);
    if (!ma) throw new NotFoundException('Không tìm thấy bàn.');
    const soBan = Number(body.soBan || 0);
    const [banTrungSo] = await this.mysql.truyVan(
      'SELECT MaBan FROM Ban WHERE SoBan = ? AND MaBan <> ? LIMIT 1',
      [soBan, ma],
    );
    if (banTrungSo) {
      throw new BadRequestException(`Số bàn ${soBan} đã tồn tại.`);
    }

    await this.mysql.thucThi(
      'UPDATE Ban SET TenBan = ?, KhuVuc = ?, SoBan = ?, SoChoNgoi = ?, ViTri = ?, GhiChu = ? WHERE MaBan = ?',
      [
        body.tenBan,
        chuanHoaTenKhuVucBan(`${body.khuVuc || ''} ${body.viTri || ''}`),
        soBan,
        Number(body.soChoNgoi || 0),
        chuanHoaTenKhuVucBan(`${body.khuVuc || ''} ${body.viTri || ''}`),
        body.ghiChu || null,
        ma,
      ],
    );
    return taoPhanHoi({ maBan: ma }, 'Cap nhat ban thanh cong');
  }

  async xoaBan(maBan: string) {
    const ma = await resolveMaBan(this.mysql, maBan);
    if (!ma) throw new NotFoundException('Không tìm thấy bàn.');
    await this.mysql.thucThi('DELETE FROM Ban WHERE MaBan = ?', [ma]);
    return taoPhanHoi(null, 'Xoa ban thanh cong');
  }
}
