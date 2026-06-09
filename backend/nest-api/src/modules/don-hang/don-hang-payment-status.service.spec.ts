import { DonHangPaymentStatusService } from './don-hang-payment-status.service';

describe('DonHangPaymentStatusService', () => {
  it('khong tra ve don da ket thuc khi lay order dang mo tai ban', async () => {
    const mysql = {
      truyVan: jest.fn(async (query: string) => {
        if (query.includes('TrangThai IN')) {
          return [];
        }
        return [{ MaDonHang: 'DH_TEST', MaBan: 'B003', TrangThai: 'HOAN_THANH' }];
      }),
    };
    const donHangQueryService = {
      layChiTietDonHangKhongKiemTraQuyen: jest.fn(),
    };
    const service = new DonHangPaymentStatusService(
      mysql as any,
      donHangQueryService as any,
      { tinhDiemTuDonHang: jest.fn() } as any,
    );

    const ketQua = await service.layOrderDangMoTaiBan('B003');

    expect(ketQua.data).toBeNull();
    expect(mysql.truyVan.mock.calls.some(([sql]) => String(sql).includes('TrangThai IN'))).toBe(true);
    expect(donHangQueryService.layChiTietDonHangKhongKiemTraQuyen).not.toHaveBeenCalled();
  });

  it('giu ban dang occupied khi yeu cau thanh toan tai ban', async () => {
    const mysql = {
      truyVan: jest.fn().mockResolvedValue([
        { MaDonHang: 'DH_TEST', MaBan: 'B003', MaKH: 'KH001', TongTien: 180000, TrangThai: 'DANG_CHUAN_BI' },
      ]),
      thucThi: jest.fn().mockResolvedValue(undefined),
    };
    const donHangQueryService = {
      layChiTietDonHangKhongKiemTraQuyen: jest.fn(async () => ({
        success: true,
        data: { donHang: { maDonHang: 'DH_TEST' } },
        message: 'ok',
        meta: null,
      })),
    };
    const service = new DonHangPaymentStatusService(
      mysql as any,
      donHangQueryService as any,
      { tinhDiemTuDonHang: jest.fn() } as any,
    );

    await service.yeuCauThanhToanTaiBan('B003');

    expect(mysql.thucThi).toHaveBeenCalledWith(
      'UPDATE Ban SET TrangThai = ? WHERE MaBan = ?',
      ['CO_KHACH', 'B003'],
    );
  });

  it('release ban khi xac nhan thanh toan va khong con rang buoc', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    const connection = {
      execute,
      query: jest.fn().mockResolvedValue([[]]),
    };
    const tinhDiemTuDonHang = jest.fn().mockResolvedValue({ success: true, data: null });
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([{ MaDonHang: 'DH_TEST', MaBan: 'B003', MaKH: 'KH001', TongTien: 180000, TrangThai: 'DANG_CHUAN_BI' }]),
      giaoDich: jest.fn(async (callback) => callback(connection)),
    };
    const donHangQueryService = {
      layChiTietDonHangKhongKiemTraQuyen: jest.fn(async (_maDonHang, ketNoi) => ({
        success: true,
        data: {
          donHang: { trangThai: ketNoi ? 'HOAN_THANH' : 'DANG_CHUAN_BI' },
        },
        message: 'ok',
        meta: null,
      })),
    };
    const service = new DonHangPaymentStatusService(
      mysql as any,
      donHangQueryService as any,
      { tinhDiemTuDonHang } as any,
    );

    const ketQua = await service.capNhatTrangThaiDonHang(
      'DH_TEST',
      'HOAN_THANH',
    );

    expect((ketQua.data as any).donHang.trangThai).toBe('HOAN_THANH');
    expect(execute).toHaveBeenCalledWith(
      'UPDATE Ban SET TrangThai = ? WHERE MaBan = ?',
      ['TRONG', 'B003'],
    );
    expect(tinhDiemTuDonHang).toHaveBeenCalledWith(
      'KH001',
      'DH_TEST',
      180000,
      undefined,
      'SYSTEM',
      connection,
    );
  });

  it('cong diem khi don hang chuyen sang Paid', async () => {
    const connection = {
      execute: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue([[{ ThanhTien: 180000 }]]),
    };
    const tinhDiemTuDonHang = jest.fn().mockResolvedValue({ success: true, data: null });
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([{ MaDonHang: 'DH_TEST', MaBan: 'B003', MaKH: 'KH001', TongTien: 180000, TrangThai: 'DANG_CHUAN_BI' }]),
      giaoDich: jest.fn(async (callback) => callback(connection)),
    };
    const donHangQueryService = {
      layChiTietDonHangKhongKiemTraQuyen: jest.fn(async (_maDonHang, ketNoi) => ({
        success: true,
        data: {
          donHang: { trangThai: ketNoi ? 'DA_THANH_TOAN' : 'DANG_CHUAN_BI' },
        },
        message: 'ok',
        meta: null,
      })),
    };
    const service = new DonHangPaymentStatusService(
      mysql as any,
      donHangQueryService as any,
      { tinhDiemTuDonHang } as any,
    );

    await service.capNhatTrangThaiDonHang(
      'DH_TEST',
      'DA_THANH_TOAN',
      { maND: 'ND010' },
    );

    expect(tinhDiemTuDonHang).toHaveBeenCalledWith(
      'KH001',
      'DH_TEST',
      180000,
      undefined,
      'ND010',
      connection,
    );
  });

  it('khong cong diem khi don hang chua den Paid hoac Completed', async () => {
    const tinhDiemTuDonHang = jest.fn();
    const connection = {
      execute: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue([[]]),
    };
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([{ MaDonHang: 'DH_TEST', MaBan: 'B003', MaKH: 'KH001', TongTien: 180000, TrangThai: 'DANG_CHUAN_BI' }]),
      giaoDich: jest.fn(async (callback) => callback(connection)),
    };
    const donHangQueryService = {
      layChiTietDonHangKhongKiemTraQuyen: jest.fn(async () => ({
        success: true,
        data: {
          donHang: { trangThai: 'DANG_CHUAN_BI' },
        },
        message: 'ok',
        meta: null,
      })),
    };
    const service = new DonHangPaymentStatusService(
      mysql as any,
      donHangQueryService as any,
      { tinhDiemTuDonHang } as any,
    );

    await service.capNhatTrangThaiDonHang('DH_TEST', 'DANG_CHUAN_BI');

    expect(tinhDiemTuDonHang).not.toHaveBeenCalled();
  });
});
