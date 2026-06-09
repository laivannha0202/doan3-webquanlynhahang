import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySqlService } from '../../database/mysql/mysql.service';
import { DatBanQueryService } from './dat-ban-query.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { taoMa } from '../../common/tao-ma';
import { layKhachHangTheoMaNd } from '../../common/khach-hang.helper';
import { BanGhi } from '../../common/types';
import {
  TRANG_THAI_BAN,
  TRANG_THAI_DON_HANG_DANG_MO,
  TRANG_THAI_DAT_BAN_GIU_BAN,
  TRANG_THAI_DAT_BAN_SU_DUNG_BAN,
  laTrangThaiDatBanGiuBan,
  laTrangThaiDatBanSuDungBan,
} from '../../common/constants';
import { chuanHoaMaKhuVucBan } from '../../common/khu-vuc-ban';
import { DonHangCreateOrderService } from '../don-hang/don-hang-create-order.service';

@Injectable()
export class DatBanCommandService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly datBanQueryService: DatBanQueryService,
    private readonly donHangCreateOrderService: DonHangCreateOrderService,
  ) {}

  private layChiTietMonAnDatBan(body: BanGhi) {
    const chiTietMonAn = Array.isArray(body.chiTietMonAn)
      ? body.chiTietMonAn
      : Array.isArray(body.ChiTietMonAn)
        ? body.ChiTietMonAn
        : [];

    return chiTietMonAn.filter((mon: BanGhi) =>
      Boolean(String(mon?.maMon || mon?.MaMon || '').trim()),
    );
  }

  private async coRangBuocBanDangMo(
    ketNoi: any,
    maBan: string,
    maDatBanBoQua = '',
  ) {
    const truyVan = ketNoi.query?.bind(ketNoi) || ketNoi.execute?.bind(ketNoi);
    const thamSoDonHang = Array.from(TRANG_THAI_DON_HANG_DANG_MO);
    const [donHangRows = []] =
      (await truyVan?.(
        `SELECT MaDonHang FROM DonHang
       WHERE MaBan = ?
         AND TrangThai IN (${thamSoDonHang.map(() => '?').join(', ')})
       LIMIT 1`,
        [maBan, ...thamSoDonHang],
      )) || [];
    if ((donHangRows as any[]).length > 0) return true;

    const trangThaiDatBanDangMo = [
      ...Array.from(TRANG_THAI_DAT_BAN_GIU_BAN),
      ...Array.from(TRANG_THAI_DAT_BAN_SU_DUNG_BAN),
    ];
    const [datBanRows = []] =
      (await truyVan?.(
        `SELECT MaDatBan FROM DatBan
       WHERE MaBan = ?
         AND MaDatBan <> ?
         AND TrangThai IN (${trangThaiDatBanDangMo.map(() => '?').join(', ')})
       LIMIT 1`,
        [maBan, maDatBanBoQua || '', ...trangThaiDatBanDangMo],
      )) || [];
    return (datBanRows as any[]).length > 0;
  }

  private async coTrungLichDatBan(ketNoi: any, maBan: string, datBan: BanGhi) {
    const truyVan = ketNoi.query?.bind(ketNoi) || ketNoi.execute?.bind(ketNoi);
    const trangThaiDatBanDangMo = [
      ...Array.from(TRANG_THAI_DAT_BAN_GIU_BAN),
      ...Array.from(TRANG_THAI_DAT_BAN_SU_DUNG_BAN),
    ];
    const [datBanRows = []] =
      (await truyVan?.(
        `SELECT MaDatBan FROM DatBan
       WHERE MaBan = ?
         AND MaDatBan <> ?
         AND NgayDat = ?
         AND TrangThai IN (${trangThaiDatBanDangMo.map(() => '?').join(', ')})
         AND TIME(?) < COALESCE(GioKetThuc, ADDTIME(GioDat, '02:00:00'))
         AND TIME(?) > GioDat
       LIMIT 1`,
        [
          maBan,
          String(datBan.MaDatBan || ''),
          datBan.NgayDat,
          ...trangThaiDatBanDangMo,
          datBan.GioDat,
          datBan.GioKetThuc || datBan.GioDat,
        ],
      )) || [];
    return (datBanRows as any[]).length > 0;
  }

  private async coDonHangDangMoTaiBan(ketNoi: any, maBan: string) {
    const truyVan = ketNoi.query?.bind(ketNoi) || ketNoi.execute?.bind(ketNoi);
    const thamSoDonHang = Array.from(TRANG_THAI_DON_HANG_DANG_MO);
    const [donHangRows = []] =
      (await truyVan?.(
        `SELECT MaDonHang FROM DonHang
       WHERE MaBan = ?
         AND TrangThai IN (${thamSoDonHang.map(() => '?').join(', ')})
       LIMIT 1`,
        [maBan, ...thamSoDonHang],
      )) || [];
    return (donHangRows as any[]).length > 0;
  }

  private async taoDonHangTuDatBan(
    nguoiDung: any,
    body: BanGhi,
    maDatBan: string,
  ) {
    const maBan = String(body.maBan || '').trim();
    const chiTiet = this.layChiTietMonAnDatBan(body);
    if (!maBan || !chiTiet.length) return;

    const [donHangDaCoChiTiet] = await this.mysql.truyVan(
      `SELECT dh.MaDonHang, COUNT(ct.MaChiTiet) AS TongChiTiet
       FROM DonHang dh
       LEFT JOIN ChiTietDonHang ct ON ct.MaDonHang = dh.MaDonHang
       WHERE dh.MaBan = ?
         AND dh.MaDatBan = ?
         AND dh.TrangThai IN (${Array.from(TRANG_THAI_DON_HANG_DANG_MO).map(() => '?').join(', ')})
       GROUP BY dh.MaDonHang
       LIMIT 1`,
      [maBan, maDatBan, ...Array.from(TRANG_THAI_DON_HANG_DANG_MO)],
    );
    if (Number(donHangDaCoChiTiet?.TongChiTiet || 0) > 0) return;

    await this.donHangCreateOrderService.taoDonHang({
      maKH: body.maKH || null,
      maBan,
      maNV: body.maNV || null,
      maDatBan,
      chiTiet,
      nguonTao: 'DatBan',
      trangThai: 'CHO_XAC_NHAN',
      capNhatTrangThaiBan: false,
      soDiem: 0,
      nguoiDung: nguoiDung || {},
      ghiChu: body.ghiChu || null,
    });
  }

  private async kiemTraQuyenKhachHang(nguoiDung: any, maKh: string) {
    const vaiTro = String(nguoiDung.vaiTro || '');
    if (vaiTro === 'Admin' || vaiTro === 'NhanVien') return;

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

  async taoDatBan(nguoiDung: any, body: BanGhi) {
    if (body.maKH) {
      await this.kiemTraQuyenKhachHang(nguoiDung, String(body.maKH || ''));
    }

    const [khachHang] = body.maKH
      ? await this.mysql.truyVan(
          `SELECT kh.*, nd.Email
           FROM KhachHang kh
           LEFT JOIN NguoiDung nd ON nd.MaND = kh.MaND
           WHERE kh.MaKH = ?
           LIMIT 1`,
          [body.maKH],
        )
      : [null];

    const maDatBan = String(body.maDatBan || '').trim() || taoMa('DB');
    const vaiTro = String(nguoiDung?.vaiTro || nguoiDung?.role || '').trim();
    const nguonTao = ['Admin', 'NhanVien'].includes(vaiTro) ? 'NOI_BO' : 'WEB';

    await this.mysql.thucThi(
      `INSERT INTO DatBan (MaDatBan, MaKH, MaBan, MaNV, TenKhachDatBan, SDTDatBan, EmailDatBan, NgayDat, GioDat, GioKetThuc, SoNguoi, GhiChu, TrangThai, KhuVucUuTien, GhiChuNoiBo, ChiTietMonAn, NguonTao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maDatBan,
        body.maKH || null,
        body.maBan || null,
        body.maNV || null,
        body.tenKhachDatBan || khachHang?.TenKH || null,
        body.sdtDatBan || khachHang?.SDT || null,
        body.emailDatBan || khachHang?.Email || null,
        body.ngayDat,
        body.gioDat,
        body.gioKetThuc || null,
        Number(body.soNguoi || 0),
        body.ghiChu || null,
        'CHO_XAC_NHAN',
        body.khuVucUuTien ? chuanHoaMaKhuVucBan(body.khuVucUuTien) : null,
        body.ghiChuNoiBo || null,
        body.chiTietMonAn ? JSON.stringify(body.chiTietMonAn) : null,
        nguonTao,
      ],
    );

    await this.taoDonHangTuDatBan(nguoiDung, body, maDatBan);

    const [datBanDaTao] = await this.mysql.truyVan(
      `SELECT db.*, kh.TenKH, kh.SDT, nd.Email
       FROM DatBan db
       LEFT JOIN KhachHang kh ON kh.MaKH = db.MaKH
       LEFT JOIN NguoiDung nd ON nd.MaND = kh.MaND
       WHERE db.MaDatBan = ?
       LIMIT 1`,
      [maDatBan],
    );

    return taoPhanHoi(
      this.datBanQueryService.chuyenDatBanSangPhanHoi(
        datBanDaTao || {
          ...body,
          TenKH: khachHang?.TenKH || body.tenKhachDatBan || '',
          SDT: khachHang?.SDT || body.sdtDatBan || '',
          Email: khachHang?.Email || body.emailDatBan || '',
          NgayTao: new Date().toISOString(),
          NgayCapNhat: new Date().toISOString(),
          TrangThai: 'CHO_XAC_NHAN',
          NguonTao: nguonTao,
        },
      ),
      'Tạo đặt bàn thành công',
    );
  }

  async capNhatDatBan(maDatBan: string, body: BanGhi) {
    const [datBanHienTai] = await this.mysql.truyVan(
      'SELECT * FROM DatBan WHERE MaDatBan = ? LIMIT 1',
      [maDatBan],
    );
    if (!datBanHienTai) {
      throw new NotFoundException('Không tìm thấy đặt bàn.');
    }

    const maKH =
      body.maKH === undefined ? datBanHienTai.MaKH : body.maKH || null;
    const maBan =
      body.maBan === undefined ? datBanHienTai.MaBan : body.maBan || null;
    const maNV =
      body.maNV === undefined ? datBanHienTai.MaNV : body.maNV || null;
    const tenKhachDatBan =
      body.tenKhachDatBan === undefined
        ? datBanHienTai.TenKhachDatBan
        : body.tenKhachDatBan
          ? String(body.tenKhachDatBan).trim()
          : null;
    const sdtDatBan =
      body.sdtDatBan === undefined
        ? datBanHienTai.SDTDatBan
        : body.sdtDatBan
          ? String(body.sdtDatBan).trim()
          : null;
    const emailDatBan =
      body.emailDatBan === undefined
        ? datBanHienTai.EmailDatBan
        : body.emailDatBan
          ? String(body.emailDatBan).trim()
          : null;
    const ngayDat =
      body.ngayDat === undefined
        ? datBanHienTai.NgayDat
        : String(body.ngayDat || '').trim();
    const gioDat =
      body.gioDat === undefined
        ? datBanHienTai.GioDat
        : String(body.gioDat || '').trim();
    const gioKetThuc =
      body.gioKetThuc === undefined
        ? datBanHienTai.GioKetThuc
        : body.gioKetThuc
          ? String(body.gioKetThuc).trim()
          : null;
    const soNguoi =
      body.soNguoi === undefined
        ? Number(datBanHienTai.SoNguoi || 0)
        : Number(body.soNguoi || 0);
    const ghiChu =
      body.ghiChu === undefined
        ? datBanHienTai.GhiChu
        : body.ghiChu
          ? String(body.ghiChu).trim()
          : null;
    const khuVucUuTien =
      body.khuVucUuTien === undefined
        ? datBanHienTai.KhuVucUuTien
        : body.khuVucUuTien
          ? chuanHoaMaKhuVucBan(body.khuVucUuTien)
          : null;
    const ghiChuNoiBo =
      body.ghiChuNoiBo === undefined
        ? datBanHienTai.GhiChuNoiBo
        : body.ghiChuNoiBo
          ? String(body.ghiChuNoiBo).trim()
          : null;
    const trangThai =
      body.trangThai === undefined
        ? datBanHienTai.TrangThai
        : String(body.trangThai || '').trim();

    if (!ngayDat) throw new BadRequestException('Ngày đặt là bắt buộc.');
    if (!gioDat) throw new BadRequestException('Giờ đặt là bắt buộc.');
    if (!Number.isFinite(soNguoi) || soNguoi <= 0)
      throw new BadRequestException('Số người phải lớn hơn 0.');

    await this.mysql.thucThi(
      `UPDATE DatBan
       SET MaKH = ?, MaBan = ?, MaNV = ?, TenKhachDatBan = ?, SDTDatBan = ?, EmailDatBan = ?, NgayDat = ?, GioDat = ?, GioKetThuc = ?, SoNguoi = ?, GhiChu = ?, KhuVucUuTien = ?, GhiChuNoiBo = ?, TrangThai = ?
       WHERE MaDatBan = ?`,
      [
        maKH,
        maBan,
        maNV,
        tenKhachDatBan,
        sdtDatBan,
        emailDatBan,
        ngayDat,
        gioDat,
        gioKetThuc,
        soNguoi,
        ghiChu,
        khuVucUuTien,
        ghiChuNoiBo,
        trangThai || datBanHienTai.TrangThai,
        maDatBan,
      ],
    );

    const [datBanDaCapNhat] = await this.mysql.truyVan(
      'SELECT * FROM DatBan WHERE MaDatBan = ? LIMIT 1',
      [maDatBan],
    );
    return taoPhanHoi(
      this.datBanQueryService.chuyenDatBanSangPhanHoi(datBanDaCapNhat),
      'Cập nhật đặt bàn thành công',
    );
  }

  async capNhatTrangThaiDatBan(maDatBan: string, trangThai: string) {
    const [datBanHienTai] = await this.mysql.truyVan(
      'SELECT * FROM DatBan WHERE MaDatBan = ? LIMIT 1',
      [maDatBan],
    );
    if (!datBanHienTai) {
      throw new NotFoundException('Không tìm thấy đặt bàn.');
    }

    const trangThaiDaChuanHoa = String(trangThai || '').trim();
    if (!trangThaiDaChuanHoa) {
      throw new BadRequestException('Trạng thái đặt bàn là bắt buộc.');
    }

    await this.mysql.giaoDich(async (ketNoi) => {
      await ketNoi.execute(
        'UPDATE DatBan SET TrangThai = ? WHERE MaDatBan = ?',
        [trangThaiDaChuanHoa, maDatBan],
      );

      const maBan = String(datBanHienTai.MaBan || '').trim();
      if (!maBan) return;

      if (laTrangThaiDatBanSuDungBan(trangThaiDaChuanHoa)) {
        await ketNoi.execute('UPDATE Ban SET TrangThai = ? WHERE MaBan = ?', [
          TRANG_THAI_BAN.CO_KHACH,
          maBan,
        ]);
        return;
      }

      if (laTrangThaiDatBanGiuBan(trangThaiDaChuanHoa)) {
        await ketNoi.execute('UPDATE Ban SET TrangThai = ? WHERE MaBan = ?', [
          TRANG_THAI_BAN.DA_DAT,
          maBan,
        ]);
        return;
      }

      const conRangBuoc = await this.coRangBuocBanDangMo(
        ketNoi,
        maBan,
        maDatBan,
      );
      if (!conRangBuoc) {
        await ketNoi.execute('UPDATE Ban SET TrangThai = ? WHERE MaBan = ?', [
          TRANG_THAI_BAN.TRONG,
          maBan,
        ]);
      }
    });

    const [datBan] = await this.mysql.truyVan(
      'SELECT * FROM DatBan WHERE MaDatBan = ? LIMIT 1',
      [maDatBan],
    );
    return taoPhanHoi(
      this.datBanQueryService.chuyenDatBanSangPhanHoi(datBan),
      'Cập nhật đặt bàn thành công',
    );
  }

  async ganBanChoDatBan(maDatBan: string, body: BanGhi) {
    const [datBan] = await this.mysql.truyVan(
      'SELECT * FROM DatBan WHERE MaDatBan = ? LIMIT 1',
      [maDatBan],
    );
    if (!datBan) {
      throw new NotFoundException('Không tìm thấy đặt bàn.');
    }

    const danhSachMaBan = Array.isArray(body.danhSachMaBan)
      ? body.danhSachMaBan
          .map((maBan) => String(maBan || '').trim())
          .filter(Boolean)
      : [];

    if (!danhSachMaBan.length) {
      throw new BadRequestException('Cần ít nhất một bàn để gán cho booking.');
    }

    if (danhSachMaBan.length !== 1) {
      throw new BadRequestException('Chỉ được gán đúng một bàn cho đặt bàn.');
    }

    const [maBan] = danhSachMaBan;
    const maBanHienTai = String(datBan.MaBan || '').trim();
    const danhSachBanHopLe = await this.mysql.truyVan(
      'SELECT * FROM Ban WHERE MaBan = ? LIMIT 1',
      [maBan],
    );

    if (!danhSachBanHopLe.length) {
      throw new BadRequestException('Có bàn không tồn tại hoặc đã bị xóa.');
    }

    const [banHopLe] = danhSachBanHopLe;
    const soKhach = Number(datBan.SoNguoi || 0);
    const tongSucChua = Number(banHopLe.SoChoNgoi || 0);
    if (soKhach > 0 && tongSucChua < soKhach) {
      throw new BadRequestException(
        'Sức chứa của bàn được chọn không đủ cho booking này.',
      );
    }

    if (String(banHopLe.TrangThai || '') === TRANG_THAI_BAN.BAO_TRI) {
      throw new BadRequestException(
        `Bàn ${banHopLe.MaBan} đang bảo trì, không thể gán cho booking.`,
      );
    }

    if (
      maBan !== maBanHienTai &&
      (String(banHopLe.TrangThai || '') === TRANG_THAI_BAN.CO_KHACH ||
        String(banHopLe.TrangThai || '') === TRANG_THAI_BAN.DA_DAT)
    ) {
      throw new BadRequestException(
        `Bàn ${banHopLe.MaBan} đang có khách hoặc đã được đặt, không thể gán cho booking.`,
      );
    }

    await this.mysql.giaoDich(async (ketNoi) => {
      const conDonHangTaiBanMoi = await this.coDonHangDangMoTaiBan(
        ketNoi,
        maBan,
      );
      const trungLichDatBan = await this.coTrungLichDatBan(
        ketNoi,
        maBan,
        datBan,
      );
      if (maBan !== maBanHienTai && (conDonHangTaiBanMoi || trungLichDatBan)) {
        throw new BadRequestException(
          `Bàn ${maBan} đã có booking hoặc đơn hàng đang mở trong khung giờ này.`,
        );
      }

      if (maBanHienTai && maBanHienTai !== maBan) {
        const conRangBuocBanCu = await this.coRangBuocBanDangMo(
          ketNoi,
          maBanHienTai,
          maDatBan,
        );
        if (!conRangBuocBanCu) {
          await ketNoi.execute('UPDATE Ban SET TrangThai = ? WHERE MaBan = ?', [
            TRANG_THAI_BAN.TRONG,
            maBanHienTai,
          ]);
        }
      }

      await ketNoi.execute('UPDATE Ban SET TrangThai = ? WHERE MaBan = ?', [
        TRANG_THAI_BAN.DA_DAT,
        maBan,
      ]);
      await ketNoi.execute(
        'UPDATE DatBan SET MaBan = ?, TrangThai = ? WHERE MaDatBan = ?',
        [maBan, 'DA_XAC_NHAN', maDatBan],
      );
    });

    const [datBanDaCapNhat] = await this.mysql.truyVan(
      'SELECT * FROM DatBan WHERE MaDatBan = ? LIMIT 1',
      [maDatBan],
    );
    return taoPhanHoi(
      {
        maDatBan: datBanDaCapNhat.MaDatBan,
        maKH: datBanDaCapNhat.MaKH,
        maBan: datBanDaCapNhat.MaBan,
        maNV: datBanDaCapNhat.MaNV,
        ngayDat: datBanDaCapNhat.NgayDat,
        gioDat: datBanDaCapNhat.GioDat,
        gioKetThuc: datBanDaCapNhat.GioKetThuc,
        soNguoi: Number(datBanDaCapNhat.SoNguoi || 0),
        ghiChu: datBanDaCapNhat.GhiChu || '',
        trangThai: datBanDaCapNhat.TrangThai,
        ngayTao: datBanDaCapNhat.NgayTao,
        ngayCapNhat: datBanDaCapNhat.NgayCapNhat,
        danhSachMaBanDaGan: danhSachBanHopLe.map((ban) => String(ban.MaBan)),
        danhSachBanDaGan: danhSachBanHopLe.map((ban) => ({
          maBan: String(ban.MaBan),
          tenBan: String(ban.TenBan || ''),
        })),
      },
      'Gán bàn cho đặt bàn thành công',
    );
  }
}
