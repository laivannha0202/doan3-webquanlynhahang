import { DatBanQueryService } from './dat-ban-query.service';

describe('DatBanQueryService', () => {
  const taoService = () => {
    const mysql = {
      truyVan: jest.fn((query: string) => {
        if (query.includes('FROM DatBan')) {
          return Promise.resolve([
            {
              MaDatBan: 'DB006',
              MaKH: 'KH001',
              NgayDat: '2026-05-20',
              GioDat: '12:00:00',
              SoNguoi: 2,
              TrangThai: 'CHO_XAC_NHAN',
              ChiTietMonAn: null,
            },
          ]);
        }

        if (query.includes('FROM DonHang')) {
          return Promise.resolve([
            {
              MaDatBan: 'DB006',
              MaMon: 'M003',
              TenMon: 'Gỏi cuốn tôm thịt',
              SoLuong: 1,
              DonGia: 55000,
            },
            {
              MaDatBan: 'DB006',
              MaMon: 'M008',
              TenMon: 'Trà đào cam sả',
              SoLuong: 2,
              DonGia: 25000,
            },
          ]);
        }

        return Promise.resolve([]);
      }),
    };

    return {
      service: new DatBanQueryService(mysql as any),
      mysql,
    };
  };

  it('includes menu items from orders linked to booking history', async () => {
    const { service } = taoService();

    const response = await service.layLichSuDatBan(
      { vaiTro: 'Admin' },
      'KH001',
    );

    expect((response.data as any[])[0].chiTietMonAn).toEqual([
      { maMon: 'M003', tenMon: 'Gỏi cuốn tôm thịt', soLuong: 1, gia: 55000 },
      { maMon: 'M008', tenMon: 'Trà đào cam sả', soLuong: 2, gia: 25000 },
    ]);
  });

  it('adds dish names to booking history menu items saved as JSON', async () => {
    const mysql = {
      truyVan: jest.fn((query: string) => {
        if (query.includes('FROM DatBan')) {
          return Promise.resolve([
            {
              MaDatBan: 'DB021',
              MaKH: 'KH001',
              NgayDat: '2026-05-24',
              GioDat: '18:30:00',
              SoNguoi: 3,
              TrangThai: 'DA_XAC_NHAN',
              ChiTietMonAn: JSON.stringify([
                { maMon: 'M003', soLuong: 1 },
                { maMon: 'M008', soLuong: 2 },
                { maMon: 'M014', soLuong: 1 },
              ]),
            },
          ]);
        }

        if (query.includes('FROM ThucDon')) {
          return Promise.resolve([
            { MaMon: 'M003', TenMon: 'Cơm Rang Dương Châu', Gia: 55000 },
            { MaMon: 'M008', TenMon: 'Cà Phê Sữa Đá', Gia: 25000 },
            { MaMon: 'M014', TenMon: 'Salad Cá Ngừ', Gia: 68000 },
          ]);
        }

        return Promise.resolve([]);
      }),
    };
    const service = new DatBanQueryService(mysql as any);

    const response = await service.layLichSuDatBan(
      { vaiTro: 'Admin' },
      'KH001',
    );

    expect((response.data as any[])[0].chiTietMonAn).toEqual([
      { maMon: 'M003', soLuong: 1, tenMon: 'Cơm Rang Dương Châu', gia: 55000 },
      { maMon: 'M008', soLuong: 2, tenMon: 'Cà Phê Sữa Đá', gia: 25000 },
      { maMon: 'M014', soLuong: 1, tenMon: 'Salad Cá Ngừ', gia: 68000 },
    ]);
  });

  it('includes menu items from orders linked to internal booking list', async () => {
    const { service } = taoService();

    const response = await service.layDanhSachDatBan();

    expect((response.data as any[])[0].chiTietMonAn).toEqual([
      { maMon: 'M003', tenMon: 'Gỏi cuốn tôm thịt', soLuong: 1, gia: 55000 },
      { maMon: 'M008', tenMon: 'Trà đào cam sả', soLuong: 2, gia: 25000 },
    ]);
  });

  it('does not treat reserved tables as available for booking', async () => {
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValueOnce([
          {
            MaBan: 'B001',
            TenBan: 'Bàn 1',
            SoBan: 1,
            SoChoNgoi: 4,
            TrangThai: 'DA_DAT',
          },
          {
            MaBan: 'B002',
            TenBan: 'Bàn 2',
            SoBan: 2,
            SoChoNgoi: 4,
            TrangThai: 'TRONG',
          },
        ])
        .mockResolvedValueOnce([]),
    };
    const service = new DatBanQueryService(mysql as any);

    const response = await service.layKhaDungDatBan({
      ngayDat: '2026-05-21',
      gioDat: '12:00',
      soNguoi: 2,
    });

    expect((response.data as any).tongBanConTrong).toBe(1);
    expect((response.data as any).danhSachBan).toEqual([
      expect.objectContaining({ maBan: 'B002', trangThai: 'TRONG' }),
    ]);
  });

  it('ignores expired bookings when computing availability', async () => {
    const mysql = {
      truyVan: jest.fn(async (query: string) => {
        if (query.includes('FROM Ban')) {
          return [
            {
              MaBan: 'B001',
              TenBan: 'Bàn 1',
              SoBan: 1,
              SoChoNgoi: 4,
              TrangThai: 'TRONG',
            },
            {
              MaBan: 'B002',
              TenBan: 'Bàn 2',
              SoBan: 2,
              SoChoNgoi: 4,
              TrangThai: 'TRONG',
            },
          ];
        }

        if (query.includes('FROM DatBan')) {
          if (query.includes('TrangThai IN')) {
            return [];
          }

          return [
            {
              MaDatBan: 'DB999',
              MaBan: 'B001',
              NgayDat: '2026-05-21',
              GioDat: '12:00:00',
              GioKetThuc: '13:30:00',
              TrangThai: 'KHONG_DEN',
            },
          ];
        }

        return [];
      }),
    };
    const service = new DatBanQueryService(mysql as any);

    const response = await service.layKhaDungDatBan({
      ngayDat: '2026-05-21',
      gioDat: '12:00',
      soNguoi: 2,
    });

    expect((response.data as any).tongBanConTrong).toBe(2);
    expect((response.data as any).danhSachBan).toEqual([
      expect.objectContaining({ maBan: 'B001' }),
      expect.objectContaining({ maBan: 'B002' }),
    ]);
    expect(mysql.truyVan.mock.calls.some(([sql]) => String(sql).includes('TrangThai IN'))).toBe(true);
  });
});
