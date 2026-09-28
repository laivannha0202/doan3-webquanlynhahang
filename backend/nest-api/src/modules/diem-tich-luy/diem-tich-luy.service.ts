import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolConnection } from 'mysql2/promise';
import { MySqlService } from '../../database/mysql/mysql.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { taoMa } from '../../common/tao-ma';
import { layKhachHangTheoMaNd } from '../../common/khach-hang.helper';
import { BanGhi } from '../../common/types';
import {
  GIA_TRI_QUY_DOI,
  TI_LE_QUY_DOI_DIEM,
  TI_LE_TICH_DIEM_MAC_DINH,
} from '../../common/constants';
import { taoMaGiaoDichDiemTheoYeuCau } from '../../common/ma-giam-gia.helper';
import { MaGiamGiaService } from '../ma-giam-gia/ma-giam-gia.service';

@Injectable()
export class DiemTichLuyService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly maGiamGiaService: MaGiamGiaService,
  ) {}

  private async thucThi(sql: string, thamSo: any[], ketNoi?: PoolConnection) {
    if (ketNoi) {
      await ketNoi.execute(sql, thamSo);
      return;
    }
    await this.mysql.thucThi(sql, thamSo);
  }

  private async truyVan(
    sql: string,
    thamSo: any[],
    ketNoi?: PoolConnection,
  ): Promise<any[]> {
    if (ketNoi) {
      const [kq] = await ketNoi.query(sql, thamSo);
      return kq as any[];
    }
    return this.mysql.truyVan(sql, thamSo);
  }

  private async layKhachHangTheoMaKH(maKH: string, ketNoi?: PoolConnection) {
    const sql = ketNoi
      ? 'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1 FOR UPDATE'
      : 'SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1';
    const danhSach = await this.truyVan(sql, [maKH], ketNoi);
    return danhSach[0] || null;
  }

  private chuyenLichSuDiemSangPhanHoi(giaoDich: BanGhi) {
    return {
      maGiaoDichDiem: giaoDich.MaGiaoDichDiem,
      maKH: giaoDich.MaKH,
      maDonHang: giaoDich.MaDonHang || '',
      maVoucher: giaoDich.MaVoucher || '',
      loaiBienDong: giaoDich.LoaiBienDong,
      soDiem: Number(giaoDich.SoDiem || 0),
      soDiemTruoc: Number(giaoDich.SoDiemTruoc || 0),
      soDiemSau: Number(giaoDich.SoDiemSau || 0),
      moTa: giaoDich.MoTa || '',
      nguoiThucHien: giaoDich.NguoiThucHien || 'SYSTEM',
      nguoiThucHienHienThi:
        giaoDich.NguoiThucHien && giaoDich.NguoiThucHien !== 'SYSTEM'
          ? giaoDich.NguoiThucHien
          : 'Hệ thống',
      ngayTao: giaoDich.NgayTao,
    };
  }

  private async layTongQuanDiemTheoMaKH(maKH: string, ketNoi?: PoolConnection) {
    const khachHang = await this.layKhachHangTheoMaKH(maKH, ketNoi);
    if (!khachHang) return null;

    const [thongKe] = await this.truyVan(
      `SELECT
        COALESCE(SUM(CASE WHEN SoDiem < 0 THEN ABS(SoDiem) ELSE 0 END), 0) AS TongDiemDaDung
       FROM LichSuDiemTichLuy
       WHERE MaKH = ?`,
      [maKH],
      ketNoi,
    );

    return {
      maKH: khachHang.MaKH,
      tongDiem: Number(khachHang.DiemTichLuy || 0),
      diemDaDung: Number(thongKe?.TongDiemDaDung || 0),
      diemCoTheDoi:
        Math.floor(Number(khachHang.DiemTichLuy || 0) / TI_LE_QUY_DOI_DIEM) *
        TI_LE_QUY_DOI_DIEM,
      tiLeQuyDoi: TI_LE_QUY_DOI_DIEM,
      giaTriQuyDoi: GIA_TRI_QUY_DOI,
    };
  }

  private async layLichSuDiemTheoMaKH(maKH: string, ketNoi?: PoolConnection) {
    const lichSu = await this.truyVan(
      `SELECT MaGiaoDichDiem, MaKH, MaDonHang, MaVoucher, LoaiBienDong, SoDiem, SoDiemTruoc, SoDiemSau, MoTa, NguoiThucHien, NgayTao
       FROM LichSuDiemTichLuy
       WHERE MaKH = ?
       ORDER BY NgayTao DESC, MaGiaoDichDiem DESC`,
      [maKH],
      ketNoi,
    );

    return lichSu.map((giaoDich) => this.chuyenLichSuDiemSangPhanHoi(giaoDich));
  }

  private async timLichSuDiemTheoGiaoDich(
    maGiaoDichDiem: string,
    ketNoi?: PoolConnection,
  ) {
    if (!maGiaoDichDiem) return null;
    const danhSach = await this.truyVan(
      'SELECT * FROM LichSuDiemTichLuy WHERE MaGiaoDichDiem = ? LIMIT 1',
      [maGiaoDichDiem],
      ketNoi,
    );
    return danhSach[0] || null;
  }

  private async timLichSuDiemTheoDonHang(
    maDonHang: string,
    loaiBienDong: string,
    ketNoi?: PoolConnection,
  ) {
    if (!maDonHang) return null;
    const danhSach = await this.truyVan(
      'SELECT * FROM LichSuDiemTichLuy WHERE MaDonHang = ? AND LoaiBienDong = ? ORDER BY NgayTao DESC, MaGiaoDichDiem DESC LIMIT 1',
      [maDonHang, loaiBienDong],
      ketNoi,
    );
    return danhSach[0] || null;
  }

  private async ghiLichSuDiem(
    maKH: string,
    maDonHang: string,
    maVoucher: string | null,
    loaiBienDong: string,
    soDiem: number,
    soDiemTruoc: number,
    soDiemSau: number,
    moTa: string,
    nguoiThucHien?: string | null,
    ketNoi?: PoolConnection,
    maGiaoDichDiem?: string,
  ) {
    const maGiaoDich = maGiaoDichDiem || taoMa('GDDL');
    await this.thucThi(
      `INSERT INTO LichSuDiemTichLuy (MaGiaoDichDiem, MaKH, MaDonHang, MaVoucher, LoaiBienDong, SoDiem, SoDiemTruoc, SoDiemSau, MoTa, NguoiThucHien)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maGiaoDich,
        maKH,
        maDonHang || null,
        maVoucher || null,
        loaiBienDong,
        soDiem,
        soDiemTruoc,
        soDiemSau,
        moTa,
        nguoiThucHien || 'SYSTEM',
      ],
      ketNoi,
    );
    return maGiaoDich;
  }

  private layNguoiThucHien(nguoiDung?: any) {
    return (
      String(nguoiDung?.maND || nguoiDung?.MaND || 'SYSTEM').trim() || 'SYSTEM'
    );
  }

  private async xuLyBienDongDiem(
    params: {
      maKH: string;
      maDonHang?: string;
      maVoucher?: string | null;
      soDiem: number;
      loaiBienDong: string;
      moTa: string;
      nguoiThucHien?: string;
      maGiaoDichDiem?: string;
    },
    ketNoi?: PoolConnection,
  ) {
    const maKH = String(params.maKH || '').trim();
    if (!maKH) {
      throw new BadRequestException('Thiếu khách hàng.');
    }

    const soDiem = Number(params.soDiem);
    if (isNaN(soDiem) || soDiem === 0) {
      throw new BadRequestException('Số điểm không hợp lệ.');
    }

    const thucHienTrongTxn = async (giaoDich: PoolConnection) => {
      const khachHangTrongTxn = await this.layKhachHangTheoMaKH(maKH, giaoDich);
      if (!khachHangTrongTxn) {
        throw new NotFoundException('Không tìm thấy khách hàng.');
      }

      if (params.maGiaoDichDiem) {
        const lichSuDaCo = await this.timLichSuDiemTheoGiaoDich(
          params.maGiaoDichDiem,
          giaoDich,
        );
        if (lichSuDaCo) {
          return taoPhanHoi(
            this.chuyenLichSuDiemSangPhanHoi(lichSuDaCo),
            'Biến động điểm đã được xử lý trước đó',
          );
        }
      }

      if (params.maDonHang) {
        const lichSuTheoDon = await this.timLichSuDiemTheoDonHang(
          params.maDonHang,
          params.loaiBienDong,
          giaoDich,
        );
        if (lichSuTheoDon) {
          return taoPhanHoi(
            this.chuyenLichSuDiemSangPhanHoi(lichSuTheoDon),
            'Biến động điểm đã được xử lý trước đó',
          );
        }
      }

      const diemTruoc = Number(khachHangTrongTxn.DiemTichLuy || 0);
      const diemSau = diemTruoc + soDiem;

      if (diemSau < 0) {
        throw new BadRequestException('Không đủ điểm để trừ.');
      }

      await this.thucThi(
        'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
        [diemSau, khachHangTrongTxn.MaKH],
        giaoDich,
      );

      const maGiaoDich = await this.ghiLichSuDiem(
        khachHangTrongTxn.MaKH,
        params.maDonHang || '',
        params.maVoucher || null,
        params.loaiBienDong,
        soDiem,
        diemTruoc,
        diemSau,
        params.moTa,
        params.nguoiThucHien || 'SYSTEM',
        giaoDich,
        params.maGiaoDichDiem,
      );

      return taoPhanHoi(
        {
          maGiaoDichDiem: maGiaoDich,
          maKH: khachHangTrongTxn.MaKH,
          maDonHang: params.maDonHang || '',
          loaiBienDong: params.loaiBienDong,
          soDiem,
          soDiemTruoc: diemTruoc,
          soDiemSau: diemSau,
          moTa: params.moTa,
          nguoiThucHien: params.nguoiThucHien || 'SYSTEM',
        },
        'Cập nhật điểm thành công',
      );
    };

    if (ketNoi) {
      return thucHienTrongTxn(ketNoi);
    }

    return this.mysql.giaoDich(thucHienTrongTxn);
  }

  async layTongQuanDiemTichLuy(nguoiDung: any) {
    const khachHang = await layKhachHangTheoMaNd(
      this.mysql,
      String(nguoiDung.maND),
    );

    if (!khachHang) {
      throw new NotFoundException('Không tìm thấy thông tin điểm tích lũy.');
    }

    const tongQuan = await this.layTongQuanDiemTheoMaKH(khachHang.MaKH);

    return taoPhanHoi(
      tongQuan || {
        maKH: khachHang.MaKH,
        tongDiem: Number(khachHang.DiemTichLuy || 0),
        diemDaDung: 0,
        diemCoTheDoi:
          Math.floor(Number(khachHang.DiemTichLuy || 0) / TI_LE_QUY_DOI_DIEM) *
          TI_LE_QUY_DOI_DIEM,
        tiLeQuyDoi: TI_LE_QUY_DOI_DIEM,
        giaTriQuyDoi: GIA_TRI_QUY_DOI,
      },
      'Lấy tổng quan điểm tích lũy thành công',
    );
  }

  async layLichSuDiemTichLuy(nguoiDung: any) {
    const khachHang = await layKhachHangTheoMaNd(
      this.mysql,
      String(nguoiDung.maND),
    );

    if (!khachHang) {
      return taoPhanHoi([], 'Không có lịch sử điểm tích lũy');
    }

    const lichSu = await this.layLichSuDiemTheoMaKH(khachHang.MaKH);
    return taoPhanHoi(lichSu, 'Lấy lịch sử điểm tích lũy thành công');
  }

  async layTongQuanDiemTichLuyTheoMaKH(maKH: string) {
    const tongQuan = await this.layTongQuanDiemTheoMaKH(
      String(maKH || '').trim(),
    );
    if (!tongQuan) {
      throw new NotFoundException('Không tìm thấy thông tin điểm tích lũy.');
    }

    return taoPhanHoi(tongQuan, 'Lấy tổng quan điểm tích lũy thành công');
  }

  async layLichSuDiemTichLuyTheoMaKH(maKH: string) {
    const khachHang = await this.layKhachHangTheoMaKH(
      String(maKH || '').trim(),
    );
    if (!khachHang) {
      return taoPhanHoi([], 'Không có lịch sử điểm tích lũy');
    }

    return taoPhanHoi(
      await this.layLichSuDiemTheoMaKH(khachHang.MaKH),
      'Lấy lịch sử điểm tích lũy thành công',
    );
  }

  async layGiaoDichDiemTheoDonHang(maDonHang: string, loaiBienDong = 'CONG') {
    const lichSu = await this.timLichSuDiemTheoDonHang(
      String(maDonHang || '').trim(),
      loaiBienDong,
    );
    return lichSu ? this.chuyenLichSuDiemSangPhanHoi(lichSu) : null;
  }

  async tinhDiemTuDonHang(
    maKH: string,
    maDonHang: string,
    tongTien: number,
    moTa?: string,
    nguoiThucHien?: string,
    ketNoi?: PoolConnection,
  ) {
    const tongTienSo = Number(tongTien);
    if (isNaN(tongTienSo) || tongTienSo < 0)
      return taoPhanHoi(null, 'Tổng tiền không hợp lệ');

    const soDiemTichDuoc = Math.floor(tongTienSo / TI_LE_TICH_DIEM_MAC_DINH);
    if (soDiemTichDuoc <= 0) {
      const khachHangHienTai = await this.layKhachHangTheoMaKH(maKH, ketNoi);
      if (!khachHangHienTai)
        return taoPhanHoi(null, 'Không tìm thấy khách hàng');

      return taoPhanHoi(
        {
          maGiaoDichDiem: '',
          maKH: khachHangHienTai.MaKH,
          maDonHang,
          tongTien: tongTienSo,
          soDiemTichDuoc: 0,
          diemTruoc: Number(khachHangHienTai.DiemTichLuy || 0),
          diemSau: Number(khachHangHienTai.DiemTichLuy || 0),
          tiLeQuyDoi: TI_LE_TICH_DIEM_MAC_DINH,
        },
        'Đơn hàng chưa đủ điều kiện tích điểm',
      );
    }

    const maGiaoDich = taoMaGiaoDichDiemTheoYeuCau(maKH, maDonHang);
    return this.xuLyBienDongDiem(
      {
        maKH,
        maDonHang,
        soDiem: soDiemTichDuoc,
        loaiBienDong: 'CONG',
        moTa: moTa || `Tích điểm từ đơn hàng ${maDonHang}`,
        nguoiThucHien: nguoiThucHien || 'SYSTEM',
        maGiaoDichDiem: maGiaoDich,
      },
      ketNoi,
    );
  }

  async tinhDiem(
    nguoiDung: any,
    body: { maDonHang: string; tongTien: number; moTa?: string },
  ) {
    const khachHang = await layKhachHangTheoMaNd(
      this.mysql,
      String(nguoiDung.maND),
    );
    if (!khachHang) throw new NotFoundException('Không tìm thấy khách hàng.');

    const tongTien = Number(body.tongTien);
    if (isNaN(tongTien) || tongTien < 0)
      throw new BadRequestException('Tổng tiền không hợp lệ.');
    const soDiemTichDuoc = Math.floor(tongTien / TI_LE_TICH_DIEM_MAC_DINH);
    if (soDiemTichDuoc <= 0) {
      return taoPhanHoi(
        {
          maGiaoDichDiem: '',
          maKH: khachHang.MaKH,
          maDonHang: body.maDonHang,
          tongTien,
          soDiemTichDuoc: 0,
          diemTruoc: Number(khachHang.DiemTichLuy || 0),
          diemSau: Number(khachHang.DiemTichLuy || 0),
          tiLeQuyDoi: TI_LE_TICH_DIEM_MAC_DINH,
        },
        'Đơn hàng chưa đủ điều kiện tích điểm',
      );
    }

    return this.xuLyBienDongDiem({
      maKH: khachHang.MaKH,
      maDonHang: body.maDonHang,
      soDiem: soDiemTichDuoc,
      loaiBienDong: 'CONG',
      moTa: body.moTa || `Tích điểm từ đơn hàng ${body.maDonHang}`,
      nguoiThucHien: this.layNguoiThucHien(nguoiDung),
      maGiaoDichDiem: taoMaGiaoDichDiemTheoYeuCau(
        khachHang.MaKH,
        body.maDonHang,
      ),
    });
  }

  async doiDiem(
    nguoiDung: any,
    body: { soDiem: number; moTa?: string; maYeuCau?: string },
    ketNoi?: PoolConnection,
  ) {
    const khachHang = await layKhachHangTheoMaNd(
      this.mysql,
      String(nguoiDung.maND),
      ketNoi,
    );
    if (!khachHang) throw new NotFoundException('Không tìm thấy khách hàng.');

    const soDiem = Number(body.soDiem);
    if (isNaN(soDiem) || soDiem <= 0)
      throw new BadRequestException('Số điểm không hợp lệ.');
    if (soDiem % TI_LE_QUY_DOI_DIEM !== 0) {
      throw new BadRequestException(
        `Số điểm đổi phải là bội số của ${TI_LE_QUY_DOI_DIEM}.`,
      );
    }
    const maYeuCau = String(body.maYeuCau || '').trim();
    const maGiaoDichDiemMacDinh = maYeuCau
      ? taoMaGiaoDichDiemTheoYeuCau(khachHang.MaKH, maYeuCau)
      : taoMa('GDDL');

    const xuLyDoiDiem = async (giaoDich: PoolConnection) => {
      const khachHangTrongTxn = await this.layKhachHangTheoMaKH(
        khachHang.MaKH,
        giaoDich,
      );
      if (!khachHangTrongTxn) {
        throw new NotFoundException('Không tìm thấy khách hàng.');
      }

      if (maYeuCau) {
        const [lichSuDaCo] = await this.truyVan(
          'SELECT * FROM LichSuDiemTichLuy WHERE MaGiaoDichDiem = ? LIMIT 1',
          [maGiaoDichDiemMacDinh],
          giaoDich,
        );
        if (lichSuDaCo) {
          const soDiemDaDoi = Math.abs(Number(lichSuDaCo.SoDiem || 0));
          const soTienGiam =
            this.maGiamGiaService.tinhSoTienGiamTuDiem(soDiemDaDoi);
          const voucher = await this.maGiamGiaService.taoVoucherTuDoiDiem(
            {
              maKH: khachHangTrongTxn.MaKH,
              soDiemDaDoi,
              soTienGiam,
              moTa: body.moTa || 'Đổi điểm tích lũy',
              nguonTao: 'DOI_DIEM_TICH_LUY',
              maYeuCau,
            },
            giaoDich,
          );

          return taoPhanHoi(
            {
              maGiaoDichDiem: maGiaoDichDiemMacDinh,
              maKH: khachHangTrongTxn.MaKH,
              soDiemDaDoi,
              soTienGiam,
              maVoucher: voucher.maCode,
              diemTruoc: Number(lichSuDaCo.SoDiemTruoc || 0),
              diemSau: Number(lichSuDaCo.SoDiemSau || 0),
              voucher: voucher.voucher,
            },
            'Đổi điểm thành công',
          );
        }
      }

      const diemTruoc = Number(khachHangTrongTxn.DiemTichLuy || 0);
      const diemSau = diemTruoc - soDiem;
      if (diemSau < 0) {
        throw new BadRequestException('Điểm tích lũy không đủ để đổi.');
      }

      const soTienGiam = this.maGiamGiaService.tinhSoTienGiamTuDiem(soDiem);
      const voucher = await this.maGiamGiaService.taoVoucherTuDoiDiem(
        {
          maKH: khachHangTrongTxn.MaKH,
          soDiemDaDoi: soDiem,
          soTienGiam,
          moTa: body.moTa || 'Đổi điểm tích lũy',
          nguonTao: 'DOI_DIEM_TICH_LUY',
          maYeuCau,
        },
        giaoDich,
      );

      await this.thucThi(
        'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
        [diemSau, khachHangTrongTxn.MaKH],
        giaoDich,
      );

      const maGiaoDich = await this.ghiLichSuDiem(
        khachHangTrongTxn.MaKH,
        '',
        voucher.maCode,
        'TRU',
        -soDiem,
        diemTruoc,
        diemSau,
        body.moTa || 'Đổi điểm tích lũy lấy voucher',
        this.layNguoiThucHien(nguoiDung),
        giaoDich,
        maGiaoDichDiemMacDinh,
      );

      return taoPhanHoi(
        {
          maGiaoDichDiem: maGiaoDich,
          maKH: khachHangTrongTxn.MaKH,
          soDiemDaDoi: soDiem,
          soTienGiam,
          maVoucher: voucher.maCode,
          diemTruoc,
          diemSau,
          voucher: voucher.voucher,
        },
        'Đổi điểm thành công',
      );
    };

    if (ketNoi) {
      return xuLyDoiDiem(ketNoi);
    }

    return this.mysql.giaoDich(xuLyDoiDiem);
  }

  async congDiemHuyDon(
    nguoiDung: any,
    body: { maDonHang: string; soDiem: number; moTa?: string },
    ketNoi?: PoolConnection,
  ) {
    const soDiem = Number(body.soDiem);
    if (isNaN(soDiem) || soDiem <= 0)
      throw new BadRequestException('Số điểm không hợp lệ.');
    const lichSuCong = await this.timLichSuDiemTheoDonHang(
      body.maDonHang,
      'CONG',
      ketNoi,
    );
    if (!lichSuCong) {
      return taoPhanHoi(
        {
          maGiaoDichDiem: '',
          maKH: '',
          maDonHang: body.maDonHang,
          soDiemHoan: 0,
          diemTruoc: 0,
          diemSau: 0,
        },
        'Đơn hàng chưa có điểm để hoàn',
      );
    }

    const maKH = String(lichSuCong.MaKH || '').trim();
    if (!maKH) {
      throw new NotFoundException('Không tìm thấy khách hàng.');
    }

    return this.xuLyBienDongDiem(
      {
        maKH,
        maDonHang: body.maDonHang,
        soDiem: -soDiem,
        loaiBienDong: 'DIEU_CHINH',
        moTa: body.moTa || `Hoàn điểm từ đơn hàng bị hủy ${body.maDonHang}`,
        nguoiThucHien: this.layNguoiThucHien(nguoiDung),
      },
      ketNoi,
    );
  }

  async dieuChinhDiemKhachHang(
    nguoiDung: any,
    maKH: string,
    soDiem: number,
    moTa: string,
    ketNoi?: PoolConnection,
  ) {
    const nguoiThucHien = this.layNguoiThucHien(nguoiDung);
    return this.xuLyBienDongDiem(
      {
        maKH,
        soDiem,
        loaiBienDong: 'DIEU_CHINH',
        moTa,
        nguoiThucHien,
      },
      ketNoi,
    );
  }
}
