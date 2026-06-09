import { Injectable } from '@nestjs/common';
import { MySqlService } from '../../database/mysql/mysql.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { TRANG_THAI_BAN } from '../../common/constants';

function layNgayVN(ngay: Date) {
  return ngay.toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

function layDauNgayVN(ngay: string) {
  return `${ngay} 00:00:00`;
}

function layDauNgayTiepTheoVN(ngay: string) {
  const [nam, thang, ngaySo] = ngay.split('-').map(Number);
  const thoiGian = new Date(Date.UTC(nam, thang - 1, ngaySo + 1));
  return layNgayVN(thoiGian) + ' 00:00:00';
}

@Injectable()
export class ThongKeService {
  constructor(private readonly mysql: MySqlService) {}

  async layDoanhThuNgay(tuNgay: string, denNgay: string) {
    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM V_DoanhThuNgay WHERE Ngay BETWEEN ? AND ? ORDER BY Ngay ASC',
      [tuNgay, denNgay],
    );
    return taoPhanHoi(danhSach, 'Lấy doanh thu theo ngày thành công');
  }

  async layMonBanChay(limit: number = 10, tuNgay?: string, denNgay?: string) {
    const params: any[] = [];
    let dateFilter = '';

    if (tuNgay && denNgay) {
      dateFilter = 'AND hd.NgayXuat >= ? AND hd.NgayXuat < ?';
      params.push(layDauNgayVN(tuNgay), layDauNgayTiepTheoVN(denNgay));
    }

    params.push(limit);

    const danhSach = await this.mysql.truyVan(
      `
      SELECT
        td.MaMon,
        td.TenMon,
        dm.TenDanhMuc,
        SUM(ct.SoLuong) AS TongSoLuong,
        SUM(ct.ThanhTien) AS TongDoanhThu
      FROM ChiTietDonHang ct
      JOIN ThucDon td ON td.MaMon = ct.MaMon
      JOIN DanhMuc dm ON dm.MaDanhMuc = td.MaDanhMuc
      JOIN DonHang dh ON dh.MaDonHang = ct.MaDonHang
      JOIN HoaDon hd ON hd.MaDonHang = dh.MaDonHang
      WHERE dh.TrangThai NOT IN ('DA_HUY')
      ${dateFilter}
      GROUP BY td.MaMon, td.TenMon, dm.TenDanhMuc
      ORDER BY TongSoLuong DESC
      LIMIT ?
    `,
      params,
    );

    return taoPhanHoi(danhSach, 'Lấy món bán chạy thành công');
  }

  async layTinhTrangBan() {
    const danhSach = await this.mysql.truyVan('SELECT * FROM V_TinhTrangBan');
    return taoPhanHoi(danhSach, 'Lấy tình trạng bàn thành công');
  }

  async layTongQuan() {
    const homNay = layNgayVN(new Date());
    const homNayBatDau = layDauNgayVN(homNay);
    const homNayKetThuc = layDauNgayTiepTheoVN(homNay);

    const [[doanhThuRow], [donRow], [banRow], [choRow]] = await Promise.all([
      this.mysql.truyVan(
        `SELECT COALESCE(SUM(TongTien), 0) AS tongDoanhThu
         FROM HoaDon
         WHERE NgayXuat >= ? AND NgayXuat < ?`,
        [homNayBatDau, homNayKetThuc],
      ),
      this.mysql.truyVan(
        `SELECT COUNT(*) AS tongDon
         FROM HoaDon
         WHERE NgayXuat >= ? AND NgayXuat < ?`,
        [homNayBatDau, homNayKetThuc],
      ),
      this.mysql.truyVan(
        `SELECT COUNT(*) AS soBanBan
         FROM Ban
         WHERE TrangThai = ?`,
        [TRANG_THAI_BAN.CO_KHACH],
      ),
      this.mysql.truyVan(
        `SELECT COUNT(*) AS soDonCho
         FROM DonHang
          WHERE TrangThai IN ('DANG_CHUAN_BI', 'DANG_PHUC_VU')`,
      ),
    ]);

    return taoPhanHoi(
      {
        tongDoanhThu: Number(doanhThuRow?.tongDoanhThu ?? 0),
        tongDon: Number(donRow?.tongDon ?? 0),
        soBanBan: Number(banRow?.soBanBan ?? 0),
        soDonCho: Number(choRow?.soDonCho ?? 0),
      },
      'Lấy tổng quan thành công',
    );
  }

  async layDoanhThuTheoThang(nam: number) {
    const danhSach = await this.mysql.truyVan(
      `SELECT MONTH(NgayXuat) AS Thang, SUM(TongTien) AS DoanhThu
       FROM HoaDon
       WHERE YEAR(NgayXuat) = ?
       GROUP BY MONTH(NgayXuat)
       ORDER BY Thang ASC`,
      [nam],
    );
    return taoPhanHoi(danhSach, 'Lấy doanh thu theo tháng thành công');
  }

  async layBookingCount(tuNgay: string, denNgay: string) {
    const result = await this.mysql.truyVan(
      `
      SELECT COUNT(*) AS tongBooking
      FROM DatBan
      WHERE NgayDat >= ? AND NgayDat < ?
      AND TrangThai NOT IN ('DA_HUY', 'KHONG_DEN')
    `,
      [layDauNgayVN(tuNgay), layDauNgayTiepTheoVN(denNgay)],
    );

    return taoPhanHoi(result[0], 'Lấy số booking thành công');
  }
}
