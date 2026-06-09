import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MySqlService } from '../../database/mysql/mysql.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { layKhachHangTheoMaNd } from '../../common/khach-hang.helper';
import { BanGhi } from '../../common/types';
import {
  TRANG_THAI_BAN,
  TRANG_THAI_DON_HANG_DANG_MO,
  TRANG_THAI_DAT_BAN_GIU_BAN,
  TRANG_THAI_DAT_BAN_SU_DUNG_BAN,
} from '../../common/constants';
import {
  MA_KHU_VUC_BAN,
  chuanHoaMaKhuVucBan,
  chuanHoaTenKhuVucBan,
} from '../../common/khu-vuc-ban';

@Injectable()
export class DatBanQueryService {
  constructor(private readonly mysql: MySqlService) {}

  private chuanNgayThanhChuoi(ngay: unknown): string {
    if (!ngay) return '';
    if (ngay instanceof Date) {
      const nam = ngay.getFullYear();
      const thang = String(ngay.getMonth() + 1).padStart(2, '0');
      const ngayTrongThang = String(ngay.getDate()).padStart(2, '0');
      return `${nam}-${thang}-${ngayTrongThang}`;
    }
    if (typeof ngay === 'string' && ngay.match(/^\d{4}-\d{2}-\d{2}/)) {
      return ngay.substring(0, 10);
    }
    return String(ngay);
  }

  chuyenDatBanSangPhanHoi(
    datBan: BanGhi,
    giaMonTheoMa = new Map<string, number | { gia: number; tenMon: string }>(),
    monTheoDatBan = new Map<string, unknown[]>(),
  ) {
    let chiTietMonAn = [];
    try {
      if (datBan.ChiTietMonAn) {
        chiTietMonAn =
          typeof datBan.ChiTietMonAn === 'string'
            ? JSON.parse(datBan.ChiTietMonAn)
            : datBan.ChiTietMonAn;
      }
    } catch {
      chiTietMonAn = [];
    }
    chiTietMonAn = Array.isArray(chiTietMonAn)
      ? chiTietMonAn.map((mon) => {
          const maMon = String(mon.maMon || mon.MaMon || mon.id || '').trim();
          const thongTinMon = giaMonTheoMa.get(maMon) as any;
          const giaTrongMap =
            typeof thongTinMon === 'number'
              ? thongTinMon
              : Number(thongTinMon?.gia || 0);
          const tenMon = String(
            mon.tenMon ||
              mon.TenMon ||
              mon.tenMonAn ||
              mon.TenMonAn ||
              mon.monAn?.tenMon ||
              thongTinMon?.tenMon ||
              '',
          ).trim();
          const gia = Number(
            mon.gia ?? mon.donGia ?? mon.DonGia ?? mon.priceValue ?? 0,
          );
          return {
            ...mon,
            maMon: maMon || mon.maMon,
            tenMon,
            gia: gia || giaTrongMap || 0,
          };
        })
      : [];
    if (!chiTietMonAn.length) {
      chiTietMonAn = (monTheoDatBan.get(String(datBan.MaDatBan || '').trim()) ||
        []) as never[];
    }
    const maBan = datBan.MaBan || '';
    const danhSachMaBanDaGan = maBan ? [String(maBan)] : [];

    return {
      maDatBan: datBan.MaDatBan,
      maKH: datBan.MaKH || '',
      maBan: maBan,
      maNV: datBan.MaNV || '',
      ngayDat: this.chuanNgayThanhChuoi(datBan.NgayDat),
      gioDat: datBan.GioDat,
      gioKetThuc: datBan.GioKetThuc || '',
      soNguoi: Number(datBan.SoNguoi || 0),
      ghiChu: datBan.GhiChu || '',
      ghiChuNoiBo: datBan.GhiChuNoiBo || '',
      khuVucUuTien: datBan.KhuVucUuTien
        ? chuanHoaMaKhuVucBan(datBan.KhuVucUuTien)
        : '',
      nguonTao: datBan.NguonTao || '',
      source: datBan.NguonTao || '',
      trangThai: datBan.TrangThai,
      ngayTao: datBan.NgayTao,
      ngayCapNhat: datBan.NgayCapNhat,
      tenKhachDatBan: datBan.TenKhachDatBan || datBan.TenKH || '',
      sdtDatBan: datBan.SDTDatBan || datBan.SDT || '',
      emailDatBan: datBan.EmailDatBan || datBan.Email || '',
      chiTietMonAn,
      danhSachMaBanDaGan,
      danhSachBanDaGan: maBan
        ? [
            {
              maBan,
              tenBan: datBan.TenBan || maBan,
              khuVuc: chuanHoaTenKhuVucBan(datBan.KhuVucBan || ''),
            },
          ]
        : [],
    };
  }

  async layDanhSachDatBan() {
    const danhSach = await this.mysql.truyVan(
      `SELECT db.*, b.TenBan AS TenBan, b.KhuVuc AS KhuVucBan, b.SoBan AS SoBan
       FROM DatBan db
       LEFT JOIN Ban b ON b.MaBan = db.MaBan
       ORDER BY db.NgayTao DESC`,
    );
    const danhSachMaDatBan = danhSach
      .map((datBan) => String(datBan.MaDatBan || '').trim())
      .filter(Boolean);
    const chiTietDonHang = danhSachMaDatBan.length
      ? await this.mysql.truyVan(
          `SELECT dh.MaDatBan, ct.MaMon, td.TenMon, ct.SoLuong, ct.DonGia
           FROM DonHang dh
           INNER JOIN ChiTietDonHang ct ON ct.MaDonHang = dh.MaDonHang
           LEFT JOIN ThucDon td ON td.MaMon = ct.MaMon
           WHERE dh.MaDatBan IN (${danhSachMaDatBan.map(() => '?').join(',')})
           ORDER BY ct.NgayTao ASC`,
          danhSachMaDatBan,
        )
      : [];
    const monTheoDatBan = new Map<string, unknown[]>();
    chiTietDonHang.forEach((mon) => {
      const maDatBan = String(mon.MaDatBan || '').trim();
      const danhSachMon = monTheoDatBan.get(maDatBan) || [];
      danhSachMon.push({
        maMon: String(mon.MaMon || '').trim(),
        tenMon: String(mon.TenMon || '').trim(),
        soLuong: Number(mon.SoLuong || 0),
        gia: Number(mon.DonGia || 0),
      });
      monTheoDatBan.set(maDatBan, danhSachMon);
    });
    return taoPhanHoi(
      danhSach.map((datBan) =>
        this.chuyenDatBanSangPhanHoi(datBan, new Map(), monTheoDatBan),
      ),
      'Lấy danh sách đặt bàn thành công',
    );
  }

  async layLichSuDatBan(nguoiDung: any, maKh: string) {
    const vaiTro = String(nguoiDung.vaiTro || '');

    if (vaiTro !== 'Admin' && vaiTro !== 'NhanVien') {
      const khachHang = await layKhachHangTheoMaNd(
        this.mysql,
        String(nguoiDung.maND),
      );
      if (
        !khachHang ||
        String(khachHang.MaKH || '') !== String(maKh || '').trim()
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập dữ liệu của khách hàng khác.',
        );
      }
    }

    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM DatBan WHERE MaKH = ? ORDER BY NgayTao DESC',
      [maKh],
    );
    const maMonSet = new Set<string>();
    danhSach.forEach((datBan) => {
      try {
        const chiTietMonAn =
          typeof datBan.ChiTietMonAn === 'string'
            ? JSON.parse(datBan.ChiTietMonAn)
            : datBan.ChiTietMonAn;
        if (Array.isArray(chiTietMonAn)) {
          chiTietMonAn.forEach((mon) => {
            const maMon = String(mon.maMon || mon.MaMon || mon.id || '').trim();
            if (maMon) maMonSet.add(maMon);
          });
        }
      } catch {}
    });
    const danhSachGiaMon = maMonSet.size
      ? await this.mysql.truyVan(
          `SELECT MaMon, TenMon, Gia FROM ThucDon WHERE MaMon IN (${Array.from(
            maMonSet,
          )
            .map(() => '?')
            .join(',')})`,
          Array.from(maMonSet),
        )
      : [];
    const giaMonTheoMa = new Map(
      danhSachGiaMon.map((mon) => [
        String(mon.MaMon || '').trim(),
        {
          gia: Number(mon.Gia || 0),
          tenMon: String(mon.TenMon || '').trim(),
        },
      ]),
    );
    const danhSachMaDatBan = danhSach
      .map((datBan) => String(datBan.MaDatBan || '').trim())
      .filter(Boolean);
    const chiTietDonHang = danhSachMaDatBan.length
      ? await this.mysql.truyVan(
          `SELECT dh.MaDatBan, ct.MaMon, td.TenMon, ct.SoLuong, ct.DonGia
           FROM DonHang dh
           INNER JOIN ChiTietDonHang ct ON ct.MaDonHang = dh.MaDonHang
           LEFT JOIN ThucDon td ON td.MaMon = ct.MaMon
           WHERE dh.MaDatBan IN (${danhSachMaDatBan.map(() => '?').join(',')})
           ORDER BY ct.NgayTao ASC`,
          danhSachMaDatBan,
        )
      : [];
    const monTheoDatBan = new Map<string, unknown[]>();
    chiTietDonHang.forEach((mon) => {
      const maDatBan = String(mon.MaDatBan || '').trim();
      const danhSachMon = monTheoDatBan.get(maDatBan) || [];
      danhSachMon.push({
        maMon: String(mon.MaMon || '').trim(),
        tenMon: String(mon.TenMon || '').trim(),
        soLuong: Number(mon.SoLuong || 0),
        gia: Number(mon.DonGia || 0),
      });
      monTheoDatBan.set(maDatBan, danhSachMon);
    });
    return taoPhanHoi(
      danhSach.map((datBan) =>
        this.chuyenDatBanSangPhanHoi(datBan, giaMonTheoMa, monTheoDatBan),
      ),
      'Lấy lịch sử đặt bàn thành công',
    );
  }

  async layKhaDungDatBan(query: Record<string, unknown>) {
    const ngayDat = String(query.ngayDat || '').trim();
    const gioDat = String(query.gioDat || '').trim();
    const soNguoi = Number(query.soNguoi || 0);
    const khuVucRaw = String(query.khuVuc || '').trim();
    const khuVuc =
      khuVucRaw && khuVucRaw !== 'KHONG_UU_TIEN'
        ? chuanHoaMaKhuVucBan(khuVucRaw)
        : khuVucRaw;
    const thoiLuongMacDinhPhut = 120;

    if (!ngayDat || !gioDat) {
      throw new BadRequestException('Ngày đặt và giờ đặt là bắt buộc.');
    }

    const laySoPhutTuGio = (gio: string) => {
      const match = gio.match(/^(\d{2}):(\d{2})/);
      if (!match) return null;
      return Number(match[1]) * 60 + Number(match[2]);
    };

    const gioBatDauYeuCau = laySoPhutTuGio(gioDat);
    if (gioBatDauYeuCau === null) {
      throw new BadRequestException('Giờ đặt không hợp lệ.');
    }

    const gioKetThucYeuCau = gioBatDauYeuCau + thoiLuongMacDinhPhut;

    const danhSachBan = await this.mysql.truyVan(
      'SELECT * FROM Ban ORDER BY SoBan ASC',
    );
    const danhSachDatBan = await this.mysql.truyVan(
      `SELECT * FROM DatBan
       WHERE NgayDat = ?
         AND TrangThai IN (${[
           ...Array.from(TRANG_THAI_DAT_BAN_GIU_BAN),
           ...Array.from(TRANG_THAI_DAT_BAN_SU_DUNG_BAN),
         ].map(() => '?').join(', ')})`,
      [ngayDat, ...Array.from(TRANG_THAI_DAT_BAN_GIU_BAN), ...Array.from(TRANG_THAI_DAT_BAN_SU_DUNG_BAN)],
    );
    const danhSachDonHangDangMo =
      (await this.mysql.truyVan(
        `SELECT DISTINCT MaBan FROM DonHang
       WHERE MaBan IS NOT NULL
         AND TrangThai IN (${Array.from(TRANG_THAI_DON_HANG_DANG_MO)
           .map(() => '?')
           .join(', ')})`,
        Array.from(TRANG_THAI_DON_HANG_DANG_MO),
      )) || [];

    const tapBanDaDuocDung = new Set(
      danhSachDatBan
        .filter((datBan) => {
          const gioBatDauDatBan = laySoPhutTuGio(String(datBan.GioDat || ''));
          if (gioBatDauDatBan === null) return false;

          const gioKetThucDatBan = datBan.GioKetThuc
            ? laySoPhutTuGio(String(datBan.GioKetThuc || ''))
            : gioBatDauDatBan + thoiLuongMacDinhPhut;
          if (gioKetThucDatBan === null) return false;

          return (
            gioBatDauYeuCau < gioKetThucDatBan &&
            gioKetThucYeuCau > gioBatDauDatBan
          );
        })
        .map((datBan) => String(datBan.MaBan || '').trim())
        .filter(Boolean),
    );
    for (const donHang of danhSachDonHangDangMo) {
      const maBanDangMo = String(donHang.MaBan || '').trim();
      if (maBanDangMo) tapBanDaDuocDung.add(maBanDangMo);
    }

    const danhSachBanKhaDung = danhSachBan
      .filter((ban) => !tapBanDaDuocDung.has(String(ban.MaBan || '').trim()))
      .filter(
        (ban) => String(ban.TrangThai || '') === TRANG_THAI_BAN.TRONG,
      )
      .filter((ban) => {
        if (!khuVuc || khuVuc === 'KHONG_UU_TIEN') return true;

        const maKhuVucBan = chuanHoaMaKhuVucBan(
          `${ban.KhuVuc || ''} ${ban.ViTri || ''}`,
        );
        if (khuVuc === MA_KHU_VUC_BAN.KHU_RIENG)
          return maKhuVucBan === MA_KHU_VUC_BAN.KHU_RIENG;
        if (khuVuc === MA_KHU_VUC_BAN.NGOAI_TROI)
          return maKhuVucBan === MA_KHU_VUC_BAN.NGOAI_TROI;
        if (khuVuc === MA_KHU_VUC_BAN.TRONG_NHA)
          return maKhuVucBan === MA_KHU_VUC_BAN.TRONG_NHA;
        return true;
      });

    const danhSachBanPhuHop =
      soNguoi > 0
        ? danhSachBanKhaDung.filter(
            (ban) => Number(ban.SoChoNgoi || 0) >= soNguoi,
          )
        : danhSachBanKhaDung;
    const tongBanConTrong = danhSachBanKhaDung.length;
    const tongBanPhuHop = danhSachBanPhuHop.length;
    const mucKhaDung =
      tongBanPhuHop <= 0
        ? 'FULL'
        : tongBanPhuHop <= 2
          ? 'LIMITED'
          : 'AVAILABLE';

    return taoPhanHoi(
      {
        ngayDat,
        gioDat,
        soNguoi,
        khuVuc: khuVuc || 'KHONG_UU_TIEN',
        tongBanConTrong,
        tongBanPhuHop,
        mucKhaDung,
        danhSachBan: danhSachBanPhuHop.map((ban) => ({
          maBan: ban.MaBan,
          tenBan: ban.TenBan,
          khuVuc: chuanHoaTenKhuVucBan(
            `${ban.KhuVuc || ''} ${ban.ViTri || ''}`,
          ),
          viTri: chuanHoaTenKhuVucBan(`${ban.KhuVuc || ''} ${ban.ViTri || ''}`),
          soBan: Number(ban.SoBan || 0),
          soChoNgoi: Number(ban.SoChoNgoi || 0),
          trangThai: ban.TrangThai,
        })),
      },
      'Lấy khả dụng đặt bàn thành công',
    );
  }
}
