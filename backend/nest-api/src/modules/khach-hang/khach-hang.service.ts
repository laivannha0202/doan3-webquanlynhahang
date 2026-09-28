import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolConnection } from 'mysql2/promise';
import { MySqlService } from '../../database/mysql/mysql.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { taoMa } from '../../common/tao-ma';
import { BanGhi } from '../../common/types';
import { DiemTichLuyService } from '../diem-tich-luy/diem-tich-luy.service';

@Injectable()
export class KhachHangService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly diemTichLuyService: DiemTichLuyService,
  ) {}

  private laLoiTrungKhoa(err: unknown) {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'ER_DUP_ENTRY'
    );
  }

  private baoLoiSoDienThoaiDaTonTai() {
    throw new ConflictException('Số điện thoại đã tồn tại.');
  }

  private async layKhachHangTheoMaKHTrongTxn(
    maKH: string,
    ketNoi: PoolConnection,
  ) {
    const [rows] = await ketNoi.query(
      'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1 FOR UPDATE',
      [maKH],
    );
    return (rows as BanGhi[])[0] || null;
  }

  private async baoLoiNeuTrungKhoa(err: unknown) {
    if (this.laLoiTrungKhoa(err)) this.baoLoiSoDienThoaiDaTonTai();
    throw err;
  }

  private chuyenKhachHangSangResponse(kh: BanGhi) {
    return {
      maKH: kh.MaKH,
      maND: kh.MaND || null,
      tenKH: kh.TenKH,
      sdt: kh.SDT || '',
      diaChi: kh.DiaChi || '',
      diemTichLuy: Number(kh.DiemTichLuy || 0),
      ngayTao: kh.NgayTao,
      coTaiKhoan: !!kh.MaND,
    };
  }

  async layDanhSach(params: {
    tuKhoa?: string;
    phanLoai?: string;
    sapXep?: string;
    thuTu?: string;
    trang?: number;
    soLuong?: number;
  }) {
    const {
      tuKhoa = '',
      phanLoai = 'tat-ca',
      sapXep = 'ngay-tao',
      thuTu = 'desc',
      trang = 1,
      soLuong = 10,
    } = params;

    let whereClause = '1=1';
    const queryParams: any[] = [];

    if (tuKhoa) {
      whereClause +=
        ' AND (kh.TenKH LIKE ? OR kh.SDT LIKE ? OR kh.MaKH LIKE ?)';
      queryParams.push(`%${tuKhoa}%`, `%${tuKhoa}%`, `%${tuKhoa}%`);
    }

    if (phanLoai === 'co-tai-khoan') {
      whereClause += ' AND kh.MaND IS NOT NULL';
    } else if (phanLoai === 'vang-lai') {
      whereClause += ' AND kh.MaND IS NULL';
    }

    const allowedSorts: Record<string, string> = {
      ten: 'kh.TenKH',
      diem: 'kh.DiemTichLuy',
      'ngay-tao': 'kh.NgayTao',
    };
    const sortCol = allowedSorts[sapXep] || 'kh.NgayTao';
    const sortDir = thuTu === 'asc' ? 'ASC' : 'DESC';

    const countResult = await this.mysql.truyVan(
      `SELECT COUNT(*) as total FROM KhachHang kh WHERE ${whereClause}`,
      queryParams,
    );
    const tongSo = Number(countResult[0]?.total || 0);

    const trangVal = Math.max(1, trang);
    const soLuongVal = Math.max(1, Math.min(100, soLuong));
    const offset = (trangVal - 1) * soLuongVal;
    const danhSach = await this.mysql.truyVan(
      `SELECT kh.* FROM KhachHang kh WHERE ${whereClause} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`,
      [...queryParams, soLuongVal, offset],
    );

    return taoPhanHoi(
      danhSach.map((kh) => this.chuyenKhachHangSangResponse(kh)),
      'Lấy danh sách khách hàng thành công',
      {
        tongSo,
        trang: trangVal,
        soLuong: soLuongVal,
        soTrang: Math.ceil(tongSo / soLuongVal),
      },
    );
  }

  async layChiTiet(maKH: string) {
    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1',
      [maKH],
    );
    if (!danhSach[0]) throw new NotFoundException('Không tìm thấy khách hàng.');
    return taoPhanHoi(
      this.chuyenKhachHangSangResponse(danhSach[0]),
      'Lấy chi tiết khách hàng thành công',
    );
  }

  async tao(
    body: {
      tenKH: string;
      sdt?: string;
      diaChi?: string;
      diemTichLuy?: number;
    },
    nguoiDung?: any,
  ) {
    const tenKH = String(body.tenKH || '').trim();
    const sdt = String(body.sdt || '').trim();
    const diaChi = String(body.diaChi || '').trim();
    const diemTichLuy = Number(body.diemTichLuy ?? 0);
    const diemKhoiTao = Math.max(0, diemTichLuy);

    if (!tenKH) throw new BadRequestException('Tên khách hàng là bắt buộc.');
    if (sdt) {
      const sdtRegex = /^0[0-9]{9}$/;
      if (!sdtRegex.test(sdt))
        throw new BadRequestException(
          'Số điện thoại không hợp lệ (10 số, bắt đầu từ 0).',
        );
    }

    try {
      const maKH = taoMa('KH');
      return await this.mysql.giaoDich(async (ketNoi) => {
        await ketNoi.execute(
          'INSERT INTO KhachHang (MaKH, MaND, TenKH, SDT, DiaChi, DiemTichLuy) VALUES (?, NULL, ?, ?, ?, 0)',
          [maKH, tenKH, sdt || null, diaChi || null],
        );

        if (diemKhoiTao > 0) {
          await this.diemTichLuyService.dieuChinhDiemKhachHang(
            nguoiDung || {},
            maKH,
            diemKhoiTao,
            'Khởi tạo điểm khi tạo khách hàng',
            ketNoi,
          );
        }

        const [kh] = await ketNoi.query(
          'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1',
          [maKH],
        );
        return taoPhanHoi(
          this.chuyenKhachHangSangResponse((kh as BanGhi[])[0]),
          'Tạo khách hàng thành công',
        );
      });
    } catch (err) {
      await this.baoLoiNeuTrungKhoa(err);
    }
  }

  async capNhat(
    maKH: string,
    body: { tenKH?: string; sdt?: string; diaChi?: string },
  ) {
    const [hienTai] = await this.mysql.truyVan(
      'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1',
      [maKH],
    );
    if (!hienTai) throw new NotFoundException('Không tìm thấy khách hàng.');

    const tenKH =
      body.tenKH !== undefined ? String(body.tenKH).trim() : hienTai.TenKH;
    const sdt = body.sdt !== undefined ? String(body.sdt).trim() : hienTai.SDT;
    const diaChi =
      body.diaChi !== undefined ? String(body.diaChi).trim() : hienTai.DiaChi;

    if (!tenKH)
      throw new BadRequestException('Tên khách hàng không được rỗng.');
    if (sdt) {
      const sdtRegex = /^0[0-9]{9}$/;
      if (!sdtRegex.test(sdt))
        throw new BadRequestException('Số điện thoại không hợp lệ.');
    }

    try {
      await this.mysql.thucThi(
        'UPDATE KhachHang SET TenKH = ?, SDT = ?, DiaChi = ? WHERE MaKH = ?',
        [tenKH, sdt || null, diaChi || null, maKH],
      );

      const [kh] = await this.mysql.truyVan(
        'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1',
        [maKH],
      );
      return taoPhanHoi(
        this.chuyenKhachHangSangResponse(kh),
        'Cập nhật khách hàng thành công',
      );
    } catch (err) {
      await this.baoLoiNeuTrungKhoa(err);
    }
  }

  async xoa(maKH: string) {
    return this.mysql.giaoDich(async (ketNoi) => {
      const kh = await this.layKhachHangTheoMaKHTrongTxn(maKH, ketNoi);
      if (!kh) throw new NotFoundException('Không tìm thấy khách hàng.');

      const [coDonHang] = await ketNoi.query(
        'SELECT MaDonHang FROM DonHang WHERE MaKH = ? LIMIT 1',
        [maKH],
      );
      if ((coDonHang as BanGhi[])[0])
        throw new BadRequestException(
          'Khách hàng có đơn hàng liên quan, không thể xóa.',
        );

      const [coDatBan] = await ketNoi.query(
        'SELECT MaDatBan FROM DatBan WHERE MaKH = ? LIMIT 1',
        [maKH],
      );
      if ((coDatBan as BanGhi[])[0])
        throw new BadRequestException(
          'Khách hàng có lịch đặt bàn, không thể xóa.',
        );

      await ketNoi.execute('DELETE FROM KhachHang WHERE MaKH = ?', [maKH]);
      return taoPhanHoi(null, 'Xóa khách hàng thành công');
    });
  }

  async capNhatDiem(
    maKH: string,
    body: { soDiem: number; moTa?: string },
    nguoiDung?: any,
  ) {
    const [kh] = await this.mysql.truyVan(
      'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1',
      [maKH],
    );
    if (!kh) throw new NotFoundException('Không tìm thấy khách hàng.');

    const soDiem = Number(body.soDiem);
    if (isNaN(soDiem)) throw new BadRequestException('Số điểm không hợp lệ.');
    const moTa = String(body.moTa || '').trim();
    if (!moTa) {
      throw new BadRequestException('Lý do điều chỉnh là bắt buộc.');
    }

    return this.diemTichLuyService.dieuChinhDiemKhachHang(
      nguoiDung || {},
      maKH,
      soDiem,
      moTa,
    );
  }

  async layLichSu(maKH: string) {
    const [kh] = await this.mysql.truyVan(
      'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1',
      [maKH],
    );
    if (!kh) throw new NotFoundException('Không tìm thấy khách hàng.');

    const datBanList = await this.mysql.truyVan(
      `SELECT db.MaDatBan, db.NgayDat, db.GioDat, db.SoNguoi, db.TrangThai as TrangThaiDatBan,
              b.TenBan
       FROM DatBan db LEFT JOIN Ban b ON b.MaBan = db.MaBan
       WHERE db.MaKH = ? ORDER BY db.NgayDat DESC LIMIT 20`,
      [maKH],
    );

    const donHangList = await this.mysql.truyVan(
      `SELECT dh.MaDonHang, dh.NgayTao as NgayDonHang, dh.TongTien, dh.TrangThai as TrangThaiDonHang,
              b.TenBan
       FROM DonHang dh LEFT JOIN Ban b ON b.MaBan = dh.MaBan
       WHERE dh.MaKH = ? ORDER BY dh.NgayTao DESC LIMIT 20`,
      [maKH],
    );

    const [tongQuanDiemRes, lichSuDiemRes] = await Promise.allSettled([
      this.diemTichLuyService.layTongQuanDiemTichLuyTheoMaKH(maKH),
      this.diemTichLuyService.layLichSuDiemTichLuyTheoMaKH(maKH),
    ]);
    const tongQuanDiem =
      tongQuanDiemRes.status === 'fulfilled'
        ? tongQuanDiemRes.value?.data || null
        : null;
    const lichSuDiem =
      lichSuDiemRes.status === 'fulfilled' &&
      Array.isArray(lichSuDiemRes.value?.data)
        ? lichSuDiemRes.value.data
        : [];

    return taoPhanHoi(
      {
        khachHang: this.chuyenKhachHangSangResponse(kh),
        datBan: datBanList.map((db: BanGhi) => ({
          maDatBan: db.MaDatBan,
          ngayDat: db.NgayDat,
          gioDen: db.GioDat,
          soNguoi: db.SoNguoi,
          tenBan: db.TenBan || '',
          trangThai: db.TrangThaiDatBan,
        })),
        donHang: donHangList.map((dh: BanGhi) => ({
          maDonHang: dh.MaDonHang,
          ngayDonHang: dh.NgayDonHang,
          tongTien: Number(dh.TongTien || 0),
          tenBan: dh.TenBan || '',
          trangThai: dh.TrangThaiDonHang,
        })),
        tongQuanDiemTichLuy: tongQuanDiem,
        lichSuDiemTichLuy: lichSuDiem,
      },
      'Lấy lịch sử khách hàng thành công',
    );
  }
}
