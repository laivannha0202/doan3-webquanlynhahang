import { DatBanCommandService } from './dat-ban-command.service';

describe('DatBanCommandService', () => {
  it('persists internal note when creating a booking', async () => {
    const mysql = {
      truyVan: jest.fn().mockResolvedValue([]),
      thucThi: jest.fn().mockResolvedValue(undefined),
    };
    const datBanQueryService = {
      chuyenDatBanSangPhanHoi: jest.fn((booking) => booking),
    };
    const donHangCreateOrderService = {
      taoDonHang: jest.fn().mockResolvedValue(undefined),
    };
    const service = new DatBanCommandService(
      mysql as any,
      datBanQueryService as any,
      donHangCreateOrderService as any,
    );

    await service.taoDatBan({ vaiTro: 'Admin' }, {
      maDatBan: 'DB_TEST',
      ngayDat: '2026-05-21',
      gioDat: '21:00',
      soNguoi: 9,
      ghiChuNoiBo: 'Nhóm từ 5 người trở lên',
    } as any);

    const [query, params] = mysql.thucThi.mock.calls[0];
    expect(query).toContain('GhiChuNoiBo');
    expect(params).toContain('Nhóm từ 5 người trở lên');
  });

  it('creates table order from booking menu items after booking is inserted', async () => {
    const mysql = {
      truyVan: jest.fn().mockResolvedValue([]),
      thucThi: jest.fn().mockResolvedValue(undefined),
    };
    const datBanQueryService = {
      chuyenDatBanSangPhanHoi: jest.fn((booking) => booking),
    };
    const donHangCreateOrderService = {
      taoDonHang: jest.fn().mockResolvedValue(undefined),
    };
    const service = new (DatBanCommandService as any)(
      mysql,
      datBanQueryService,
      donHangCreateOrderService,
    ) as DatBanCommandService;

    await service.taoDatBan({ vaiTro: 'Admin' }, {
      maDatBan: 'DB_TEST_ORDER',
      maKH: 'KH001',
      maBan: 'B006',
      ngayDat: '2026-05-21',
      gioDat: '21:00',
      soNguoi: 4,
      chiTietMonAn: [{ maMon: 'M001', soLuong: 2, ghiChu: 'Ít cay' }],
    } as any);

    expect(donHangCreateOrderService.taoDonHang).toHaveBeenCalledWith({
      maKH: 'KH001',
      maBan: 'B006',
      maNV: null,
      maDatBan: 'DB_TEST_ORDER',
      chiTiet: [{ maMon: 'M001', soLuong: 2, ghiChu: 'Ít cay' }],
      nguonTao: 'DatBan',
      trangThai: 'CHO_XAC_NHAN',
      capNhatTrangThaiBan: false,
      soDiem: 0,
      nguoiDung: { vaiTro: 'Admin' },
      ghiChu: null,
    });
  });

  it('does not copy booking menu items again when an open order already has details', async () => {
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([{ MaDonHang: 'DH020', TongChiTiet: 3 }]),
      thucThi: jest.fn().mockResolvedValue(undefined),
    };
    const datBanQueryService = {
      chuyenDatBanSangPhanHoi: jest.fn((booking) => booking),
    };
    const donHangCreateOrderService = {
      taoDonHang: jest.fn().mockResolvedValue(undefined),
    };
    const service = new (DatBanCommandService as any)(
      mysql,
      datBanQueryService,
      donHangCreateOrderService,
    ) as DatBanCommandService;

    await (service as any).taoDonHangTuDatBan(
      { vaiTro: 'Admin' },
      {
        maKH: 'KH001',
        maBan: 'B006',
        chiTietMonAn: [{ maMon: 'M003', soLuong: 1 }],
      },
      'DB021',
    );

    expect(donHangCreateOrderService.taoDonHang).not.toHaveBeenCalled();
  });

  it('rejects assigning more than one table to a booking', async () => {
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValue([{ MaDatBan: 'DB001', MaBan: 'B035' }]),
      thucThi: jest.fn().mockResolvedValue(undefined),
      giaoDich: jest.fn(),
    };
    const service = new DatBanCommandService(
      mysql as any,
      { chuyenDatBanSangPhanHoi: jest.fn((booking) => booking) } as any,
      { taoDonHang: jest.fn() } as any,
    );

    await expect(
      service.ganBanChoDatBan('DB001', {
        danhSachMaBan: ['B035', 'B053'],
      } as any),
    ).rejects.toThrow('Chỉ được gán đúng một bàn cho đặt bàn.');
    expect(mysql.giaoDich).not.toHaveBeenCalled();
  });

  it('releases the old table and saves the new table when changing assignment', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValueOnce([
          { MaDatBan: 'DB001', MaBan: 'B035', SoNguoi: 4 },
        ])
        .mockResolvedValueOnce([
          {
            MaBan: 'B053',
            TenBan: 'Bàn 53',
            SoChoNgoi: 6,
            TrangThai: 'Available',
          },
        ])
        .mockResolvedValueOnce([
          {
            MaDatBan: 'DB001',
            MaBan: 'B053',
            SoNguoi: 4,
            TrangThai: 'DA_XAC_NHAN',
          },
        ]),
      thucThi: jest.fn().mockResolvedValue(undefined),
      giaoDich: jest.fn(async (callback) => callback({ execute })),
    };
    const service = new DatBanCommandService(
      mysql as any,
      { chuyenDatBanSangPhanHoi: jest.fn((booking) => booking) } as any,
      { taoDonHang: jest.fn() } as any,
    );

    const ketQua = await service.ganBanChoDatBan('DB001', {
      danhSachMaBan: ['B053'],
    } as any);

    expect(execute).toHaveBeenCalledWith(
      'UPDATE Ban SET TrangThai = ? WHERE MaBan = ?',
      ['TRONG', 'B035'],
    );
    expect(execute).toHaveBeenCalledWith(
      'UPDATE Ban SET TrangThai = ? WHERE MaBan = ?',
      ['DA_DAT', 'B053'],
    );
    expect(execute).toHaveBeenCalledWith(
      'UPDATE DatBan SET MaBan = ?, TrangThai = ? WHERE MaDatBan = ?',
      ['B053', 'DA_XAC_NHAN', 'DB001'],
    );
    expect((ketQua.data as any).maBan).toBe('B053');
    expect((ketQua.data as any).danhSachMaBanDaGan).toEqual(['B053']);
  });

  it('giai phong ban khi huy dat ban va khong con order mo', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValueOnce([
          {
            MaDatBan: 'DB001',
            MaBan: 'B035',
            SoNguoi: 4,
            TrangThai: 'CHO_XAC_NHAN',
          },
        ])
        .mockResolvedValueOnce([]),
      thucThi: jest.fn().mockResolvedValue(undefined),
      giaoDich: jest.fn(async (callback) => callback({ execute, query: jest.fn().mockResolvedValue([[]]) })),
    };
    const service = new DatBanCommandService(
      mysql as any,
      { chuyenDatBanSangPhanHoi: jest.fn((booking) => booking) } as any,
      { taoDonHang: jest.fn() } as any,
    );

    await service.capNhatTrangThaiDatBan('DB001', 'DA_HUY');

    expect(execute).toHaveBeenCalledWith(
      'UPDATE Ban SET TrangThai = ? WHERE MaBan = ?',
      ['TRONG', 'B035'],
    );
  });
});
