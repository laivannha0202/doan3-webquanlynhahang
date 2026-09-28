import { DonHangCreateOrderService } from './don-hang-create-order.service';

describe('DonHangCreateOrderService', () => {
  it('tu sinh ma don hang tang dan dang DH001 khi tao don moi', async () => {
    const execute = jest.fn(async () => undefined);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes('TrangThai IN')) {
        return [[]];
      }
      if (sql.includes('REGEXP')) {
        return [[{ MaDonHang: 'DH003' }]];
      }
      return [[]];
    });

    const mysql = {
      giaoDich: jest.fn(async (callback) => callback({ execute, query })),
    };

    const donHangPricingService = {
      tinhLaiGiaDonHang: jest.fn().mockResolvedValue({
        chiTietDaTinh: [
          {
            maChiTiet: 'CT_1',
            maMon: 'M01',
            soLuong: 1,
            donGia: 50000,
            thanhTien: 50000,
            tenMon: 'Mon 1',
            ghiChu: '',
          },
        ],
        tongHopGia: {
          tamTinh: 50000,
          phiDichVu: 0,
          giamGia: 0,
          tongTien: 50000,
        },
        maGiamGia: { hopLe: false, maGiamGia: '' },
        diemApDung: { soDiem: 0, soTienGiam: 0 },
      }),
    };

    const diemTichLuyService = {
      doiDiem: jest.fn(),
    };

    const service = new DonHangCreateOrderService(
      mysql as any,
      donHangPricingService as any,
      diemTichLuyService as any,
    );

    const ketQua: any = await service.taoDonHang({
      maBan: 'B001',
      maKH: 'KH006',
      chiTiet: [{ maMon: 'M01', soLuong: 1 }],
    });

    expect(ketQua.data.donHang.maDonHang).toBe('DH004');
    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO DonHang'),
      expect.arrayContaining(['DH004']),
    );
  });

  it('khong tang luot dung voucher khi chi append mon vao don dang mo', async () => {
    const execute = jest.fn(async () => undefined);
    const query = jest
      .fn()
      .mockResolvedValueOnce([[{ MaDonHang: 'DH_EXIST' }]])
      .mockResolvedValueOnce([[{ TongTien: 180000 }]]);

    const mysql = {
      giaoDich: jest.fn(async (callback) => callback({ execute, query })),
    };

    const donHangPricingService = {
      tinhLaiGiaDonHang: jest.fn().mockResolvedValue({
        chiTietDaTinh: [
          {
            maChiTiet: 'CT_1',
            maMon: 'M01',
            soLuong: 1,
            donGia: 50000,
            thanhTien: 50000,
            tenMon: 'Mon 1',
            ghiChu: '',
          },
        ],
        tongHopGia: {
          tamTinh: 50000,
          phiDichVu: 0,
          giamGia: 0,
          tongTien: 50000,
        },
        maGiamGia: { hopLe: true, maGiamGia: 'LOYAL25K' },
        diemApDung: { soDiem: 0, soTienGiam: 0 },
      }),
    };

    const diemTichLuyService = {
      doiDiem: jest.fn(),
    };

    const service = new DonHangCreateOrderService(
      mysql as any,
      donHangPricingService as any,
      diemTichLuyService as any,
    );

    await service.taoDonHang({
      maBan: 'B001',
      maDatBan: 'DB001',
      nguonTao: 'DatBan',
      maKH: 'KH006',
      chiTiet: [{ maMon: 'M01', soLuong: 1 }],
    });

    expect(execute).not.toHaveBeenCalledWith(
      expect.stringContaining(
        'UPDATE MaGiamGia SET SoLanDaDung = SoLanDaDung + 1 WHERE MaCode = ?',
      ),
      expect.anything(),
      expect.anything(),
    );
  });

  it('khong append vao don da ket thuc khi tao don moi tu booking', async () => {
    const execute = jest.fn(async () => undefined);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes('TrangThai IN')) {
        return [[]];
      }
      if (sql.includes('SELECT TongTien FROM DonHang')) {
        return [[{ TongTien: 180000 }]];
      }
      return [[]];
    });

    const mysql = {
      giaoDich: jest.fn(async (callback) => callback({ execute, query })),
    };

    const donHangPricingService = {
      tinhLaiGiaDonHang: jest.fn().mockResolvedValue({
        chiTietDaTinh: [
          {
            maChiTiet: 'CT_1',
            maMon: 'M01',
            soLuong: 1,
            donGia: 50000,
            thanhTien: 50000,
            tenMon: 'Mon 1',
            ghiChu: '',
          },
        ],
        tongHopGia: {
          tamTinh: 50000,
          phiDichVu: 0,
          giamGia: 0,
          tongTien: 50000,
        },
        maGiamGia: { hopLe: true, maGiamGia: 'LOYAL25K' },
        diemApDung: { soDiem: 0, soTienGiam: 0 },
      }),
    };

    const diemTichLuyService = {
      doiDiem: jest.fn(),
    };

    const service = new DonHangCreateOrderService(
      mysql as any,
      donHangPricingService as any,
      diemTichLuyService as any,
    );

    await service.taoDonHang({
      maBan: 'B001',
      maDatBan: 'DB001',
      nguonTao: 'DatBan',
      maKH: 'KH006',
      chiTiet: [{ maMon: 'M01', soLuong: 1 }],
    });

    expect(
      query.mock.calls.some((call: any[]) =>
        String(call[0]).includes('TrangThai IN'),
      ),
    ).toBe(true);
    expect(
      execute.mock.calls.some((call: any[]) =>
        String(call[0]).includes('INSERT INTO DonHang'),
      ),
    ).toBe(true);
    expect(execute).not.toHaveBeenCalledWith(
      expect.stringContaining('UPDATE DonHang SET TongTien = ?'),
      expect.any(Array),
      expect.anything(),
    );
  });

  it('truyen maDonHang lam khoa idempotency khi doi diem thanh toan', async () => {
    const execute = jest.fn(async () => undefined);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes('SELECT TongTien FROM DonHang')) {
        return [[{ TongTien: 180000 }]];
      }
      return [[]];
    });

    const mysql = {
      giaoDich: jest.fn(async (callback) => callback({ execute, query })),
    };

    const donHangPricingService = {
      tinhLaiGiaDonHang: jest.fn().mockResolvedValue({
        chiTietDaTinh: [
          {
            maChiTiet: 'CT_1',
            maMon: 'M01',
            soLuong: 1,
            donGia: 50000,
            thanhTien: 50000,
            tenMon: 'Mon 1',
            ghiChu: '',
          },
        ],
        tongHopGia: {
          tamTinh: 50000,
          phiDichVu: 0,
          giamGia: 0,
          tongTien: 50000,
        },
        maGiamGia: { hopLe: true, maGiamGia: 'LOYAL25K' },
        diemApDung: { soDiem: 0, soTienGiam: 0 },
      }),
    };

    const diemTichLuyService = {
      doiDiem: jest.fn(async () => ({
        success: true,
        data: { maGiaoDichDiem: 'GDDL_TEST' },
      })),
    };

    const service = new DonHangCreateOrderService(
      mysql as any,
      donHangPricingService as any,
      diemTichLuyService as any,
    );

    await service.taoDonHang({
      maDonHang: 'DH_TEST',
      maBan: 'B001',
      maKH: 'KH006',
      chiTiet: [{ maMon: 'M01', soLuong: 1 }],
      soDiem: 100,
      nguoiDung: { maND: 'ND001' },
    });

    expect(diemTichLuyService.doiDiem).toHaveBeenCalledWith(
      { maND: 'ND001' },
      expect.objectContaining({
        soDiem: 100,
        maYeuCau: 'DH_TEST',
      }),
      expect.anything(),
    );
  });
});
