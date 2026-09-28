import { DonHangPricingService } from './don-hang-pricing.service';

describe('DonHangPricingService', () => {
  const taoVoucher = (overrides: Record<string, any> = {}) => ({
    MaCode: 'LOYALTY-TEST',
    TenCode: 'Voucher doi diem',
    GiaTri: 10000,
    LoaiGiam: 'fixed_amount',
    LoaiMa: 'LOYALTY',
    MaKH: 'KH001',
    DiemDaDoi: 100,
    GiaTriToiDa: null,
    DonHangToiThieu: 0,
    NgayBatDau: '2026-05-01',
    NgayKetThuc: '2026-06-30',
    SoLanToiDa: 1,
    SoLanDaDung: 0,
    TrangThai: 'Active',
    ...overrides,
  });

  const taoService = (voucher: Record<string, any>) => {
    const ketNoi = {
      query: jest.fn(async (query: string) => {
        if (String(query).includes('FROM ThucDon')) {
          return [[{ MaMon: 'M01', TenMon: 'Mon 1', Gia: 100000 }]];
        }

        if (String(query).includes('FROM MaGiamGia')) {
          return [[voucher]];
        }

        return [[]];
      }),
    };

    const mysql = {
      truyVan: jest.fn(),
    };

    return {
      service: new DonHangPricingService(mysql as any),
      ketNoi,
      mysql,
    };
  };

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-25T09:00:00+07:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('doc dung voucher trong transaction khi kiem tra ma giam gia', async () => {
    const { service, ketNoi, mysql } = taoService(taoVoucher());

    const ketQua = await service.layThongTinMaGiamApDung(
      'LOYALTY-TEST',
      37000,
      'KH001',
      ketNoi as any,
    );

    expect(mysql.truyVan).not.toHaveBeenCalled();
    expect(ketNoi.query).toHaveBeenCalled();
    expect(ketQua.hopLe).toBe(true);
    expect(ketQua.maGiamGia).toBe('LOYALTY-TEST');
    expect(ketQua.soTienGiamThucTe).toBe(10000);
  });

  it('khong cho voucher chua hieu luc khi ngay bat dau nam trong tuong lai', async () => {
    const { service, ketNoi } = taoService(
      taoVoucher({
        NgayBatDau: '2026-05-31',
        NgayKetThuc: '2026-06-30',
      }),
    );

    await expect(
      service.layThongTinMaGiamApDung(
        'LOYALTY-TEST',
        37000,
        'KH001',
        ketNoi as any,
      ),
    ).rejects.toThrow('chưa đến thời gian áp dụng');
  });

  it('khong cho voucher het han khi qua ngay ket thuc', async () => {
    const { service, ketNoi } = taoService(
      taoVoucher({
        NgayBatDau: '2026-05-01',
        NgayKetThuc: '2026-05-24',
      }),
    );

    await expect(
      service.layThongTinMaGiamApDung(
        'LOYALTY-TEST',
        37000,
        'KH001',
        ketNoi as any,
      ),
    ).rejects.toThrow('đã hết hạn');
  });

  it('cho phep voucher dung den het ngay ket thuc', async () => {
    const { service, ketNoi } = taoService(
      taoVoucher({
        NgayBatDau: '2026-05-01',
        NgayKetThuc: '2026-05-25',
      }),
    );

    const ketQua = await service.layThongTinMaGiamApDung(
      'LOYALTY-TEST',
      37000,
      'KH001',
      ketNoi as any,
    );

    expect(ketQua.hopLe).toBe(true);
    expect(ketQua.maGiamGia).toBe('LOYALTY-TEST');
  });

  it('khong cho voucher da dung het luot', async () => {
    const { service, ketNoi } = taoService(
      taoVoucher({
        SoLanToiDa: 1,
        SoLanDaDung: 1,
      }),
    );

    await expect(
      service.layThongTinMaGiamApDung(
        'LOYALTY-TEST',
        37000,
        'KH001',
        ketNoi as any,
      ),
    ).rejects.toThrow('đã đạt giới hạn sử dụng');
  });

  it('khong cho voucher tam tat', async () => {
    const { service, ketNoi } = taoService(
      taoVoucher({
        TrangThai: 'Inactive',
      }),
    );

    await expect(
      service.layThongTinMaGiamApDung(
        'LOYALTY-TEST',
        37000,
        'KH001',
        ketNoi as any,
      ),
    ).rejects.toThrow('không còn hiệu lực');
  });

  it('khong cho ap dung voucher cua khach khac', async () => {
    const { service, ketNoi } = taoService(taoVoucher());

    await expect(
      service.layThongTinMaGiamApDung(
        'LOYALTY-TEST',
        37000,
        'KH999',
        ketNoi as any,
      ),
    ).rejects.toThrow('không thuộc về khách hàng này');
  });

  it('khong cho giam qua tong tien don hang', async () => {
    const { service, ketNoi } = taoService(
      taoVoucher({
        GiaTri: 90000,
        LoaiGiam: 'fixed_amount',
      }),
    );

    await expect(
      service.tinhLaiGiaDonHang(
        {
          maGiamGia: 'LOYALTY-TEST',
          soDiem: 200,
          maKH: 'KH001',
        },
        [{ maMon: 'M01', soLuong: 1 }],
        ketNoi as any,
      ),
    ).rejects.toThrow('vượt quá tổng tiền đơn hàng');
  });
});
