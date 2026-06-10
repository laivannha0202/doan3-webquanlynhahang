import { DonHangPaymentStatusService } from './don-hang-payment-status.service';

describe('DonHangPaymentStatusService', () => {
  it('khong tra ve don da ket thuc khi lay order dang mo tai ban', async () => {
    const mysql = {
      truyVan: jest.fn(async (query: string) => {
        if (query.includes('TrangThai IN')) {
          return [];
        }
        return [
          { MaDonHang: 'DH_TEST', MaBan: 'B003', TrangThai: 'HOAN_THANH' },
        ];
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
    expect(
      mysql.truyVan.mock.calls.some(([sql]) =>
        String(sql).includes('TrangThai IN'),
      ),
    ).toBe(true);
    expect(
      donHangQueryService.layChiTietDonHangKhongKiemTraQuyen,
    ).not.toHaveBeenCalled();
  });

  it('giu ban dang occupied khi yeu cau thanh toan tai ban', async () => {
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([
          {
            MaDonHang: 'DH_TEST',
            MaBan: 'B003',
            MaKH: 'KH001',
            TongTien: 180000,
            TrangThai: 'DANG_CHUAN_BI',
          },
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
    const tinhDiemTuDonHang = jest
      .fn()
      .mockResolvedValue({ success: true, data: null });
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([
          {
            MaDonHang: 'DH_TEST',
            MaBan: 'B003',
            MaKH: 'KH001',
            TongTien: 180000,
            TrangThai: 'DANG_CHUAN_BI',
          },
        ]),
      giaoDich: jest.fn(async (callback) => callback(connection)),
    };
    const donHangQueryService = {
      layChiTietDonHangKhongKiemTraQuyen: jest.fn(
        async (_maDonHang, ketNoi) => ({
          success: true,
          data: {
            donHang: { trangThai: ketNoi ? 'HOAN_THANH' : 'DANG_CHUAN_BI' },
          },
          message: 'ok',
          meta: null,
        }),
      ),
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
    const tinhDiemTuDonHang = jest
      .fn()
      .mockResolvedValue({ success: true, data: null });
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([
          {
            MaDonHang: 'DH_TEST',
            MaBan: 'B003',
            MaKH: 'KH001',
            TongTien: 180000,
            TrangThai: 'DANG_CHUAN_BI',
          },
        ]),
      giaoDich: jest.fn(async (callback) => callback(connection)),
    };
    const donHangQueryService = {
      layChiTietDonHangKhongKiemTraQuyen: jest.fn(
        async (_maDonHang, ketNoi) => ({
          success: true,
          data: {
            donHang: { trangThai: ketNoi ? 'DA_THANH_TOAN' : 'DANG_CHUAN_BI' },
          },
          message: 'ok',
          meta: null,
        }),
      ),
    };
    const service = new DonHangPaymentStatusService(
      mysql as any,
      donHangQueryService as any,
      { tinhDiemTuDonHang } as any,
    );

    await service.capNhatTrangThaiDonHang('DH_TEST', 'DA_THANH_TOAN', {
      maND: 'ND010',
    });

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
        .mockResolvedValue([
          {
            MaDonHang: 'DH_TEST',
            MaBan: 'B003',
            MaKH: 'KH001',
            TongTien: 180000,
            TrangThai: 'DANG_CHUAN_BI',
          },
        ]),
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

  describe('capNhatTrangThaiChiTietMon', () => {
    const taoService = (tatCaChiTiet: any[]) => {
      const execute = jest.fn().mockResolvedValue(undefined);
      const connection = {
        execute,
        query: jest.fn().mockResolvedValue([tatCaChiTiet]),
      };
      const mysql = {
        truyVan: jest.fn(),
        giaoDich: jest.fn(async (callback: any) => callback(connection)),
      };
      const donHangQueryService = {
        layChiTietDonHangKhongKiemTraQuyen: jest.fn(async () => ({
          success: true,
          data: { donHang: { trangThai: 'UPDATED' } },
          message: 'ok',
          meta: null,
        })),
      };
      const service = new DonHangPaymentStatusService(
        mysql as any,
        donHangQueryService as any,
        {} as any,
      );
      return { service, execute };
    };

    it('1. Tat ca HOAN_THANH -> DonHang = HOAN_THANH', async () => {
      const { service, execute } = taoService([
        { TrangThai: 'HOAN_THANH' },
        { TrangThai: 'HOAN_THANH' },
      ]);
      await service.capNhatTrangThaiChiTietMon('DH001', 'CT001', 'HOAN_THANH');
      expect(execute).toHaveBeenCalledWith(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        ['HOAN_THANH', 'DH001'],
      );
    });

    it('2. HOAN_THANH + DA_HUY -> DonHang = HOAN_THANH', async () => {
      const { service, execute } = taoService([
        { TrangThai: 'HOAN_THANH' },
        { TrangThai: 'DA_HUY' },
      ]);
      await service.capNhatTrangThaiChiTietMon('DH001', 'CT001', 'HOAN_THANH');
      expect(execute).toHaveBeenCalledWith(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        ['HOAN_THANH', 'DH001'],
      );
    });

    it('3. Tat ca DA_HUY -> DonHang = DA_HUY', async () => {
      const { service, execute } = taoService([
        { TrangThai: 'DA_HUY' },
        { TrangThai: 'DA_HUY' },
      ]);
      await service.capNhatTrangThaiChiTietMon('DH001', 'CT001', 'DA_HUY');
      expect(execute).toHaveBeenCalledWith(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        ['DA_HUY', 'DH001'],
      );
    });

    it('4. DANG_PHUC_VU + DANG_CHUAN_BI -> DonHang = DANG_PHUC_VU', async () => {
      const { service, execute } = taoService([
        { TrangThai: 'DANG_PHUC_VU' },
        { TrangThai: 'DANG_CHUAN_BI' },
      ]);
      await service.capNhatTrangThaiChiTietMon(
        'DH001',
        'CT001',
        'DANG_PHUC_VU',
      );
      expect(execute).toHaveBeenCalledWith(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        ['DANG_PHUC_VU', 'DH001'],
      );
    });

    it('5. HOAN_THANH + DANG_CHUAN_BI -> DonHang = DANG_PHUC_VU', async () => {
      const { service, execute } = taoService([
        { TrangThai: 'HOAN_THANH' },
        { TrangThai: 'DANG_CHUAN_BI' },
      ]);
      await service.capNhatTrangThaiChiTietMon('DH001', 'CT001', 'HOAN_THANH');
      expect(execute).toHaveBeenCalledWith(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        ['DANG_PHUC_VU', 'DH001'],
      );
    });

    it('6. Tat ca DANG_CHUAN_BI -> DonHang = DANG_CHUAN_BI', async () => {
      const { service, execute } = taoService([
        { TrangThai: 'DANG_CHUAN_BI' },
        { TrangThai: 'DANG_CHUAN_BI' },
      ]);
      await service.capNhatTrangThaiChiTietMon(
        'DH001',
        'CT001',
        'DANG_CHUAN_BI',
      );
      expect(execute).toHaveBeenCalledWith(
        'UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?',
        ['DANG_CHUAN_BI', 'DH001'],
      );
    });
  });
});
