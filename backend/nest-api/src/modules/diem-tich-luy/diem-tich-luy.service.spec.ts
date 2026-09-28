import { BadRequestException } from '@nestjs/common';
import { DiemTichLuyService } from './diem-tich-luy.service';

describe('DiemTichLuyService', () => {
  it('su dung cung ketNoi khi doi diem trong transaction', async () => {
    const ketNoi = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ MaKH: 'KH006', DiemTichLuy: 320 }]])
        .mockResolvedValueOnce([[{ MaKH: 'KH006', DiemTichLuy: 320 }]]),
      execute: jest.fn(async () => undefined),
    };

    const mysql = {
      giaoDich: jest.fn(),
      truyVan: jest.fn(),
      thucThi: jest.fn(),
    };

    const maGiamGiaService = {
      tinhSoTienGiamTuDiem: jest.fn(
        (soDiem: number) => Math.floor(Number(soDiem || 0) / 100) * 10000,
      ),
      taoVoucherTuDoiDiem: jest.fn(async (_payload, con) => ({
        voucher: {
          maCode: 'LOYAL25K',
          tenCode: 'Voucher doi diem',
          maKH: 'KH006',
        },
        maCode: 'LOYAL25K',
        tenCode: 'Voucher doi diem',
        soDiemDaDoi: 100,
        soTienGiam: 10000,
        connection: con,
      })),
    };

    const service = new DiemTichLuyService(
      mysql as any,
      maGiamGiaService as any,
    );

    const ketQua = await service.doiDiem(
      { maND: 'ND010' },
      { soDiem: 100, moTa: 'Doi diem' },
      ketNoi as any,
    );

    expect(mysql.giaoDich).not.toHaveBeenCalled();
    expect(ketNoi.execute).toHaveBeenCalledWith(
      expect.stringContaining(
        'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
      ),
      [220, 'KH006'],
    );
    expect(maGiamGiaService.taoVoucherTuDoiDiem).toHaveBeenCalledWith(
      expect.objectContaining({
        maKH: 'KH006',
        soDiemDaDoi: 100,
        soTienGiam: 10000,
      }),
      ketNoi,
    );
    expect((ketQua.data as any).voucher.maCode).toBe('LOYAL25K');
    expect((ketQua.data as any).maVoucher).toBe('LOYAL25K');
  });

  it('giu dung diem truoc sau khi tru diem lien tiep', async () => {
    const store = {
      diemTichLuy: 245,
      lichSu: [] as any[],
    };

    const ketNoi = {
      query: jest.fn(async (query: string) => {
        if (
          String(query).includes(
            'FROM KhachHang WHERE MaKH = ? LIMIT 1 FOR UPDATE',
          )
        ) {
          return [[{ MaKH: 'KH006', DiemTichLuy: store.diemTichLuy }]];
        }

        return [[]];
      }),
      execute: jest.fn(async (query: string, thamSo: any[]) => {
        if (
          String(query).includes(
            'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
          )
        ) {
          store.diemTichLuy = Number(thamSo?.[0] || 0);
          return;
        }

        if (String(query).includes('INSERT INTO LichSuDiemTichLuy')) {
          store.lichSu.push({
            MaGiaoDichDiem: String(thamSo?.[0] || ''),
            MaKH: String(thamSo?.[1] || ''),
            MaDonHang: thamSo?.[2] || null,
            MaVoucher: thamSo?.[3] || null,
            LoaiBienDong: String(thamSo?.[4] || ''),
            SoDiem: Number(thamSo?.[5] || 0),
            SoDiemTruoc: Number(thamSo?.[6] || 0),
            SoDiemSau: Number(thamSo?.[7] || 0),
            MoTa: String(thamSo?.[8] || ''),
            NguoiThucHien: String(thamSo?.[9] || ''),
          });
        }
      }),
    };

    const mysql = {
      giaoDich: jest.fn(),
      truyVan: jest.fn(async (query: string) => {
        if (String(query).includes('FROM KhachHang WHERE MaKH = ? LIMIT 1')) {
          return [{ MaKH: 'KH006', DiemTichLuy: store.diemTichLuy }];
        }

        if (
          String(query).includes(
            'COALESCE(SUM(CASE WHEN SoDiem < 0 THEN ABS(SoDiem) ELSE 0 END), 0) AS TongDiemDaDung',
          )
        ) {
          return [
            {
              TongDiemDaDung: store.lichSu
                .filter((item) => Number(item.SoDiem || 0) < 0)
                .reduce(
                  (tong, item) => tong + Math.abs(Number(item.SoDiem || 0)),
                  0,
                ),
            },
          ];
        }

        return [[]];
      }),
      thucThi: jest.fn(),
    };

    const maGiamGiaService = {
      tinhSoTienGiamTuDiem: jest.fn(),
      taoVoucherTuDoiDiem: jest.fn(),
    };

    const service = new DiemTichLuyService(
      mysql as any,
      maGiamGiaService as any,
    );

    await service.dieuChinhDiemKhachHang(
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
      'KH006',
      -100,
      'Tru diem 1',
      ketNoi as any,
    );

    await service.dieuChinhDiemKhachHang(
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
      'KH006',
      -100,
      'Tru diem 2',
      ketNoi as any,
    );

    expect(store.lichSu).toHaveLength(2);
    expect(store.lichSu[0]).toMatchObject({
      SoDiemTruoc: 245,
      SoDiemSau: 145,
      SoDiem: -100,
      LoaiBienDong: 'DIEU_CHINH',
    });
    expect(store.lichSu[1]).toMatchObject({
      SoDiemTruoc: 145,
      SoDiemSau: 45,
      SoDiem: -100,
      LoaiBienDong: 'DIEU_CHINH',
    });
    expect(store.diemTichLuy).toBe(45);

    const tongQuan = await service.layTongQuanDiemTichLuyTheoMaKH('KH006');
    expect(tongQuan.data).toMatchObject({
      tongDiem: 45,
      diemDaDung: 200,
    });
  });

  it('khong cho doi diem vuot qua so du', async () => {
    const store = {
      diemTichLuy: 50,
      lichSu: [] as any[],
      voucher: [] as any[],
    };

    const ketNoi = {
      query: jest.fn(async (query: string) => {
        if (String(query).includes('FROM KhachHang WHERE MaND = ?')) {
          return [
            [{ MaKH: 'KH006', MaND: 'ND010', DiemTichLuy: store.diemTichLuy }],
          ];
        }

        if (
          String(query).includes(
            'FROM KhachHang WHERE MaKH = ? LIMIT 1 FOR UPDATE',
          )
        ) {
          return [
            [{ MaKH: 'KH006', MaND: 'ND010', DiemTichLuy: store.diemTichLuy }],
          ];
        }

        if (
          String(query).includes(
            'FROM LichSuDiemTichLuy WHERE MaGiaoDichDiem = ?',
          )
        ) {
          return [[]];
        }

        return [[]];
      }),
      execute: jest.fn(async (query: string, thamSo: any[]) => {
        if (
          String(query).includes(
            'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
          )
        ) {
          store.diemTichLuy = Number(thamSo?.[0] || 0);
          return;
        }

        if (String(query).includes('INSERT INTO LichSuDiemTichLuy')) {
          store.lichSu.push({
            MaGiaoDichDiem: String(thamSo?.[0] || ''),
            MaKH: String(thamSo?.[1] || ''),
            MaDonHang: thamSo?.[2] || null,
            MaVoucher: thamSo?.[3] || null,
            LoaiBienDong: String(thamSo?.[4] || ''),
            SoDiem: Number(thamSo?.[5] || 0),
            SoDiemTruoc: Number(thamSo?.[6] || 0),
            SoDiemSau: Number(thamSo?.[7] || 0),
            MoTa: String(thamSo?.[8] || ''),
            NguoiThucHien: String(thamSo?.[9] || ''),
          });
        }
      }),
    };

    const mysql = {
      giaoDich: jest.fn(async (callback) => callback(ketNoi)),
      truyVan: jest.fn(async (query: string) => {
        if (String(query).includes('FROM KhachHang')) {
          return [
            { MaKH: 'KH006', MaND: 'ND010', DiemTichLuy: store.diemTichLuy },
          ];
        }

        return [];
      }),
      thucThi: jest.fn(),
    };

    const maGiamGiaService = {
      tinhSoTienGiamTuDiem: jest.fn(),
      taoVoucherTuDoiDiem: jest.fn(),
    };

    const service = new DiemTichLuyService(
      mysql as any,
      maGiamGiaService as any,
    );

    await expect(
      service.doiDiem(
        { maND: 'ND010' },
        { soDiem: 100, moTa: 'Doi diem vuot qua so du' } as any,
        ketNoi as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(store.diemTichLuy).toBe(50);
    expect(store.lichSu).toHaveLength(0);
  });

  it('khong tao trung lich su va voucher khi doi diem lap lai cung maYeuCau', async () => {
    const store = {
      diemTichLuy: 245,
      lichSu: [] as any[],
      voucher: [] as any[],
    };

    const ketNoi = {
      query: jest.fn(async (query: string, thamSo: any[]) => {
        if (String(query).includes('FROM KhachHang WHERE MaND = ?')) {
          return [
            [{ MaKH: 'KH006', MaND: 'ND010', DiemTichLuy: store.diemTichLuy }],
          ];
        }

        if (String(query).includes('FROM KhachHang WHERE MaKH = ?')) {
          return [
            [{ MaKH: 'KH006', MaND: 'ND010', DiemTichLuy: store.diemTichLuy }],
          ];
        }

        if (
          String(query).includes(
            'FROM LichSuDiemTichLuy WHERE MaGiaoDichDiem = ?',
          )
        ) {
          const maGiaoDich = String(thamSo?.[0] || '');
          const lichSu = store.lichSu.find(
            (item) => item.MaGiaoDichDiem === maGiaoDich,
          );
          return [[lichSu ? { ...lichSu } : null].filter(Boolean)];
        }

        if (String(query).includes('FROM MaGiamGia WHERE MaCode = ?')) {
          const maCode = String(thamSo?.[0] || '');
          const voucher = store.voucher.find((item) => item.MaCode === maCode);
          return [[voucher ? { ...voucher } : null].filter(Boolean)];
        }

        return [[]];
      }),
      execute: jest.fn(async (query: string, thamSo: any[]) => {
        if (
          String(query).includes(
            'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
          )
        ) {
          store.diemTichLuy = Number(thamSo?.[0] || 0);
          return;
        }

        if (String(query).includes('INSERT INTO LichSuDiemTichLuy')) {
          store.lichSu.push({
            MaGiaoDichDiem: String(thamSo?.[0] || ''),
            MaKH: String(thamSo?.[1] || ''),
            MaDonHang: thamSo?.[2] || null,
            MaVoucher: thamSo?.[3] || null,
            LoaiBienDong: String(thamSo?.[4] || ''),
            SoDiem: Number(thamSo?.[5] || 0),
            SoDiemTruoc: Number(thamSo?.[6] || 0),
            SoDiemSau: Number(thamSo?.[7] || 0),
            MoTa: String(thamSo?.[8] || ''),
            NguoiThucHien: String(thamSo?.[9] || ''),
          });
          return;
        }

        if (String(query).includes('INSERT INTO MaGiamGia')) {
          store.voucher.push({
            MaCode: String(thamSo?.[0] || ''),
            TenCode: String(thamSo?.[1] || ''),
            GiaTri: Number(thamSo?.[2] || 0),
            LoaiGiam: String(thamSo?.[3] || ''),
            LoaiMa: String(thamSo?.[4] || ''),
            MaKH: String(thamSo?.[5] || ''),
            DiemDaDoi: Number(thamSo?.[6] || 0),
            GiaTriToiDa: thamSo?.[7] ?? null,
            DonHangToiThieu: Number(thamSo?.[8] || 0),
            NgayBatDau: thamSo?.[9] || null,
            NgayKetThuc: thamSo?.[10] || null,
            SoLanToiDa: Number(thamSo?.[11] || 0),
            SoLanDaDung: Number(thamSo?.[12] || 0),
            TrangThai: String(thamSo?.[13] || ''),
            NguonTao: String(thamSo?.[14] || ''),
          });
        }
      }),
    };

    const mysql = {
      giaoDich: jest.fn(async (callback) => callback(ketNoi)),
      truyVan: jest.fn(async (query: string) => {
        if (String(query).includes('FROM KhachHang')) {
          return [
            { MaKH: 'KH006', MaND: 'ND010', DiemTichLuy: store.diemTichLuy },
          ];
        }

        return [];
      }),
      thucThi: jest.fn(),
    };

    const maGiamGiaService = {
      tinhSoTienGiamTuDiem: jest.fn(
        (soDiem: number) => Math.floor(Number(soDiem || 0) / 100) * 10000,
      ),
      taoVoucherTuDoiDiem: jest.fn(async (payload) => {
        const maCode = `LOYALTY-KH006_REQ001`;
        const daCo = store.voucher.find((item) => item.MaCode === maCode);
        if (daCo) {
          return {
            voucher: {
              maCode: daCo.MaCode,
              tenCode: daCo.TenCode,
              maKH: daCo.MaKH,
            },
            maCode: daCo.MaCode,
            tenCode: daCo.TenCode,
            soDiemDaDoi: Number(daCo.DiemDaDoi || payload.soDiemDaDoi || 0),
            soTienGiam: Number(daCo.GiaTri || payload.soTienGiam || 0),
          };
        }

        const voucher = {
          MaCode: maCode,
          TenCode: 'Voucher doi diem',
          MaKH: payload.maKH,
          DiemDaDoi: payload.soDiemDaDoi,
          GiaTri: payload.soTienGiam,
        };
        store.voucher.push(voucher);
        return {
          voucher: {
            maCode: voucher.MaCode,
            tenCode: voucher.TenCode,
            maKH: voucher.MaKH,
          },
          maCode: voucher.MaCode,
          tenCode: voucher.TenCode,
          soDiemDaDoi: voucher.DiemDaDoi,
          soTienGiam: voucher.GiaTri,
        };
      }),
    };

    const service = new DiemTichLuyService(
      mysql as any,
      maGiamGiaService as any,
    );

    const lan1 = await service.doiDiem(
      { maND: 'ND010' },
      { soDiem: 100, moTa: 'Doi diem', maYeuCau: 'req-001' } as any,
      ketNoi as any,
    );

    const lan2 = await service.doiDiem(
      { maND: 'ND010' },
      { soDiem: 100, moTa: 'Doi diem', maYeuCau: 'req-001' } as any,
      ketNoi as any,
    );

    expect(lan1.data).toMatchObject({
      diemTruoc: 245,
      diemSau: 145,
      soDiemDaDoi: 100,
      soTienGiam: 10000,
    });
    expect(lan2.data).toMatchObject({
      diemTruoc: 245,
      diemSau: 145,
      soDiemDaDoi: 100,
      soTienGiam: 10000,
    });
    expect(store.diemTichLuy).toBe(145);
    expect(store.lichSu).toHaveLength(1);
    expect(store.voucher).toHaveLength(1);
    expect(maGiamGiaService.taoVoucherTuDoiDiem).toHaveBeenCalledWith(
      expect.objectContaining({
        maKH: 'KH006',
        soDiemDaDoi: 100,
        soTienGiam: 10000,
        maYeuCau: 'req-001',
      }),
      ketNoi,
    );
  });

  it('hoan diem theo MaKH cua don hang va khong phu thuoc nguoi thao tac', async () => {
    const store = {
      diemTichLuy: 150,
      donHang: {
        MaDonHang: 'DH001',
        MaKH: 'KH006',
        TongTien: 100000,
      },
      lichSu: [
        {
          MaGiaoDichDiem: 'GDDL-KH006_DH001',
          MaKH: 'KH006',
          MaDonHang: 'DH001',
          LoaiBienDong: 'CONG',
          SoDiem: 100,
          SoDiemTruoc: 50,
          SoDiemSau: 150,
          MoTa: 'Cong diem tu don hang',
          NguoiThucHien: 'NV002',
          NgayTao: '2026-05-25T09:00:00+07:00',
        },
      ] as any[],
    };

    const ketNoi = {
      query: jest.fn(async (query: string, thamSo: any[]) => {
        if (
          String(query).includes(
            'FROM DonHang WHERE MaDonHang = ? LIMIT 1 FOR UPDATE',
          )
        ) {
          return [[{ ...store.donHang }]];
        }

        if (
          String(query).includes(
            'FROM LichSuDiemTichLuy WHERE MaDonHang = ? AND LoaiBienDong = ?',
          )
        ) {
          const loaiBienDong = String(thamSo?.[1] || '');
          if (loaiBienDong === 'CONG') {
            return [[{ ...store.lichSu[0] }]];
          }
          if (loaiBienDong === 'DIEU_CHINH') {
            const daHoan = store.lichSu.find(
              (item) => item.LoaiBienDong === 'DIEU_CHINH',
            );
            return [[daHoan ? { ...daHoan } : null].filter(Boolean)];
          }
        }

        if (
          String(query).includes(
            'FROM KhachHang WHERE MaKH = ? LIMIT 1 FOR UPDATE',
          )
        ) {
          return [[{ MaKH: 'KH006', DiemTichLuy: store.diemTichLuy }]];
        }

        if (String(query).includes('FROM KhachHang WHERE MaND = ?')) {
          return [[]];
        }

        return [[]];
      }),
      execute: jest.fn(async (query: string, thamSo: any[]) => {
        if (
          String(query).includes(
            'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
          )
        ) {
          store.diemTichLuy = Number(thamSo?.[0] || 0);
          return;
        }

        if (String(query).includes('INSERT INTO LichSuDiemTichLuy')) {
          store.lichSu.push({
            MaGiaoDichDiem: String(thamSo?.[0] || ''),
            MaKH: String(thamSo?.[1] || ''),
            MaDonHang: thamSo?.[2] || null,
            MaVoucher: thamSo?.[3] || null,
            LoaiBienDong: String(thamSo?.[4] || ''),
            SoDiem: Number(thamSo?.[5] || 0),
            SoDiemTruoc: Number(thamSo?.[6] || 0),
            SoDiemSau: Number(thamSo?.[7] || 0),
            MoTa: String(thamSo?.[8] || ''),
            NguoiThucHien: String(thamSo?.[9] || ''),
          });
        }
      }),
    };

    const mysql = {
      giaoDich: jest.fn(),
      truyVan: jest.fn(),
      thucThi: jest.fn(),
    };

    const maGiamGiaService = {
      tinhSoTienGiamTuDiem: jest.fn(),
      taoVoucherTuDoiDiem: jest.fn(),
    };

    const service = new DiemTichLuyService(
      mysql as any,
      maGiamGiaService as any,
    );

    const ketQua = await service.congDiemHuyDon(
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
      {
        maDonHang: 'DH001',
        soDiem: 100,
        moTa: 'Hoan diem khi huy don',
      },
      ketNoi as any,
    );

    expect(ketNoi.execute).toHaveBeenCalledWith(
      expect.stringContaining(
        'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
      ),
      [50, 'KH006'],
    );
    expect(ketQua.data).toMatchObject({
      maKH: 'KH006',
      maDonHang: 'DH001',
      loaiBienDong: 'DIEU_CHINH',
      soDiem: -100,
      soDiemTruoc: 150,
      soDiemSau: 50,
    });
  });

  it('khong hoan diem lap lai cho cung don hang', async () => {
    const store = {
      diemTichLuy: 150,
      donHang: {
        MaDonHang: 'DH001',
        MaKH: 'KH006',
        TongTien: 100000,
      },
      lichSu: [
        {
          MaGiaoDichDiem: 'GDDL-KH006_DH001',
          MaKH: 'KH006',
          MaDonHang: 'DH001',
          LoaiBienDong: 'CONG',
          SoDiem: 100,
          SoDiemTruoc: 50,
          SoDiemSau: 150,
          MoTa: 'Cong diem tu don hang',
          NguoiThucHien: 'NV002',
          NgayTao: '2026-05-25T09:00:00+07:00',
        },
      ] as any[],
    };

    const ketNoi = {
      query: jest.fn(async (query: string, thamSo: any[]) => {
        if (
          String(query).includes(
            'FROM DonHang WHERE MaDonHang = ? LIMIT 1 FOR UPDATE',
          )
        ) {
          return [[{ ...store.donHang }]];
        }

        if (
          String(query).includes(
            'FROM LichSuDiemTichLuy WHERE MaDonHang = ? AND LoaiBienDong = ?',
          )
        ) {
          const loaiBienDong = String(thamSo?.[1] || '');
          if (loaiBienDong === 'CONG') {
            return [[{ ...store.lichSu[0] }]];
          }
          if (loaiBienDong === 'DIEU_CHINH') {
            const daHoan = store.lichSu.find(
              (item) => item.LoaiBienDong === 'DIEU_CHINH',
            );
            return [[daHoan ? { ...daHoan } : null].filter(Boolean)];
          }
        }

        if (
          String(query).includes(
            'FROM KhachHang WHERE MaKH = ? LIMIT 1 FOR UPDATE',
          )
        ) {
          return [[{ MaKH: 'KH006', DiemTichLuy: store.diemTichLuy }]];
        }

        if (String(query).includes('FROM KhachHang WHERE MaND = ?')) {
          return [[]];
        }

        return [[]];
      }),
      execute: jest.fn(async (query: string, thamSo: any[]) => {
        if (
          String(query).includes(
            'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
          )
        ) {
          store.diemTichLuy = Number(thamSo?.[0] || 0);
          return;
        }

        if (String(query).includes('INSERT INTO LichSuDiemTichLuy')) {
          store.lichSu.push({
            MaGiaoDichDiem: String(thamSo?.[0] || ''),
            MaKH: String(thamSo?.[1] || ''),
            MaDonHang: thamSo?.[2] || null,
            MaVoucher: thamSo?.[3] || null,
            LoaiBienDong: String(thamSo?.[4] || ''),
            SoDiem: Number(thamSo?.[5] || 0),
            SoDiemTruoc: Number(thamSo?.[6] || 0),
            SoDiemSau: Number(thamSo?.[7] || 0),
            MoTa: String(thamSo?.[8] || ''),
            NguoiThucHien: String(thamSo?.[9] || ''),
          });
        }
      }),
    };

    const mysql = {
      giaoDich: jest.fn(),
      truyVan: jest.fn(),
      thucThi: jest.fn(),
    };

    const maGiamGiaService = {
      tinhSoTienGiamTuDiem: jest.fn(),
      taoVoucherTuDoiDiem: jest.fn(),
    };

    const service = new DiemTichLuyService(
      mysql as any,
      maGiamGiaService as any,
    );

    await service.congDiemHuyDon(
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
      {
        maDonHang: 'DH001',
        soDiem: 100,
        moTa: 'Hoan diem khi huy don',
      },
      ketNoi as any,
    );

    await service.congDiemHuyDon(
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
      {
        maDonHang: 'DH001',
        soDiem: 100,
        moTa: 'Hoan diem khi huy don',
      },
      ketNoi as any,
    );

    const soLanCapNhat = ketNoi.execute.mock.calls.filter((call: any[]) =>
      String(call[0]).includes(
        'UPDATE KhachHang SET DiemTichLuy = ? WHERE MaKH = ?',
      ),
    ).length;

    expect(soLanCapNhat).toBe(1);
    expect(
      store.lichSu.filter((item) => item.LoaiBienDong === 'DIEU_CHINH'),
    ).toHaveLength(1);
  });
});
