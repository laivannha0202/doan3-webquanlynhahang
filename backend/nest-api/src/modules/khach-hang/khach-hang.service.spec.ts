import { KhachHangService } from './khach-hang.service';

describe('KhachHangService', () => {
  it('dieu chinh diem thu cong bang giao dich diem thay vi cap nhat truc tiep', async () => {
    const mysql = {
      truyVan: jest.fn(async (query: string) => {
        if (String(query).includes('FROM KhachHang WHERE MaKH = ? LIMIT 1')) {
          return [
            {
              MaKH: 'KH001',
              MaND: 'ND001',
              TenKH: 'Khach hang demo',
              SDT: '0900000000',
              DiaChi: 'Ha Noi',
              DiemTichLuy: 120,
            },
          ];
        }

        return [];
      }),
      thucThi: jest.fn(),
    };

    const diemTichLuyService = {
      dieuChinhDiemKhachHang: jest.fn(async (nguoiDung, maKH, soDiem, moTa) => ({
        success: true,
        data: {
          maKH,
          soDiem,
          moTa,
          nguoiThucHien: nguoiDung.maND,
          diemTruoc: 120,
          diemSau: 100,
        },
      })),
      layTongQuanDiemTichLuyTheoMaKH: jest.fn(),
      layLichSuDiemTichLuyTheoMaKH: jest.fn(),
    };

    const service = new KhachHangService(
      mysql as any,
      diemTichLuyService as any,
    );

    const ketQua = await service.capNhatDiem(
      'KH001',
      { soDiem: -20, moTa: 'Giảm điểm lỗi đơn' },
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
    );

    expect(diemTichLuyService.dieuChinhDiemKhachHang).toHaveBeenCalledWith(
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
      'KH001',
      -20,
      'Giảm điểm lỗi đơn',
    );
    expect(mysql.thucThi).not.toHaveBeenCalled();
    expect((ketQua as any).data).toMatchObject({
      maKH: 'KH001',
      soDiem: -20,
      moTa: 'Giảm điểm lỗi đơn',
      nguoiThucHien: 'ND_ADMIN',
    });
  });

  it('tra ve tong quan va lich su diem trong lich su khach hang', async () => {
    const mysql = {
      truyVan: jest.fn(async (query: string) => {
        if (String(query).includes('FROM KhachHang WHERE MaKH = ? LIMIT 1')) {
          return [
            {
              MaKH: 'KH001',
              MaND: 'ND001',
              TenKH: 'Khach hang demo',
              SDT: '0900000000',
              DiaChi: 'Ha Noi',
              DiemTichLuy: 120,
            },
          ];
        }

        if (String(query).includes('FROM DatBan')) {
          return [
            {
              MaDatBan: 'DB001',
              NgayDat: '2026-05-25',
              GioDat: '18:00:00',
              SoNguoi: 4,
              TrangThaiDatBan: 'CHO_XAC_NHAN',
              TenBan: 'Bàn 1',
            },
          ];
        }

        if (String(query).includes('FROM DonHang')) {
          return [
            {
              MaDonHang: 'DH001',
              NgayDonHang: '2026-05-25T09:00:00+07:00',
              TongTien: 180000,
              TrangThaiDonHang: 'DA_THANH_TOAN',
              TenBan: 'Bàn 1',
            },
          ];
        }

        return [];
      }),
      thucThi: jest.fn(),
    };

    const diemTichLuyService = {
      dieuChinhDiemKhachHang: jest.fn(),
      layTongQuanDiemTichLuyTheoMaKH: jest.fn(async (maKH) => ({
        success: true,
        data: {
          maKH,
          tongDiem: 120,
          diemDaDung: 80,
          diemCoTheDoi: 100,
          tiLeQuyDoi: 100,
          giaTriQuyDoi: 10000,
        },
      })),
      layLichSuDiemTichLuyTheoMaKH: jest.fn(async (maKH) => ({
        success: true,
        data: [
          {
            maGiaoDichDiem: 'GDDL001',
            maKH,
            maDonHang: 'DH001',
            loaiBienDong: 'CONG',
            soDiem: 20,
            soDiemTruoc: 100,
            soDiemSau: 120,
            moTa: 'Cộng điểm',
            nguoiThucHien: 'NV001',
            ngayTao: '2026-05-25T09:00:00+07:00',
          },
        ],
      })),
    };

    const service = new KhachHangService(
      mysql as any,
      diemTichLuyService as any,
    );

    const ketQua = await service.layLichSu('KH001');

    expect(diemTichLuyService.layTongQuanDiemTichLuyTheoMaKH).toHaveBeenCalledWith('KH001');
    expect(diemTichLuyService.layLichSuDiemTichLuyTheoMaKH).toHaveBeenCalledWith('KH001');
    expect((ketQua as any).data).toMatchObject({
      tongQuanDiemTichLuy: {
        maKH: 'KH001',
        tongDiem: 120,
        diemDaDung: 80,
      },
    });
    expect((ketQua as any).data.lichSuDiemTichLuy).toHaveLength(1);
    expect((ketQua as any).data.datBan).toHaveLength(1);
    expect((ketQua as any).data.donHang).toHaveLength(1);
  });

  it('van tra ve lich su khach hang khi diem tich luy dang loi', async () => {
    const mysql = {
      truyVan: jest.fn(async (query: string) => {
        if (String(query).includes('FROM KhachHang WHERE MaKH = ? LIMIT 1')) {
          return [
            {
              MaKH: 'KH001',
              MaND: 'ND001',
              TenKH: 'Khach hang demo',
              SDT: '0900000000',
              DiaChi: 'Ha Noi',
              DiemTichLuy: 120,
            },
          ];
        }

        if (String(query).includes('FROM DatBan')) {
          return [
            {
              MaDatBan: 'DB001',
              NgayDat: '2026-05-25',
              GioDat: '18:00:00',
              SoNguoi: 4,
              TrangThaiDatBan: 'CHO_XAC_NHAN',
              TenBan: 'Bàn 1',
            },
          ];
        }

        if (String(query).includes('FROM DonHang')) {
          return [];
        }

        return [];
      }),
      thucThi: jest.fn(),
    };

    const diemTichLuyService = {
      dieuChinhDiemKhachHang: jest.fn(),
      layTongQuanDiemTichLuyTheoMaKH: jest.fn(async () => {
        throw new Error('Table LichSuDiemTichLuy does not exist');
      }),
      layLichSuDiemTichLuyTheoMaKH: jest.fn(async () => {
        throw new Error('Table LichSuDiemTichLuy does not exist');
      }),
    };

    const service = new KhachHangService(
      mysql as any,
      diemTichLuyService as any,
    );

    const ketQua = await service.layLichSu('KH001');

    expect((ketQua as any).data).toMatchObject({
      khachHang: { maKH: 'KH001' },
      tongQuanDiemTichLuy: null,
      lichSuDiemTichLuy: [],
    });
    expect((ketQua as any).data.datBan).toHaveLength(1);
  });

  it('tao khach hang co diem khoi tao bang giao dich diem', async () => {
    const store = { diem: 0 };

    const connection = {
      execute: jest.fn(async (query: string) => {
        if (String(query).includes('INSERT INTO KhachHang')) {
          store.diem = 0;
        }
      }),
      query: jest.fn(async (query: string) => {
        if (String(query).includes('SELECT * FROM KhachHang WHERE MaKH = ? LIMIT 1')) {
          return [[{
            MaKH: 'KH777',
            MaND: null,
            TenKH: 'Khach hang moi',
            SDT: '0901111222',
            DiaChi: 'TP HCM',
            DiemTichLuy: store.diem,
          }]];
        }

        return [[]];
      }),
    };

    const mysql = {
      giaoDich: jest.fn(async (callback) => callback(connection)),
      truyVan: jest.fn(),
      thucThi: jest.fn(),
    };

    const diemTichLuyService = {
      dieuChinhDiemKhachHang: jest.fn(async (_nguoiDung, _maKH, soDiem, _moTa, ketNoi) => {
        expect(ketNoi).toBe(connection);
        store.diem += soDiem;
        return { success: true, data: { soDiem, diemSau: store.diem } };
      }),
      layTongQuanDiemTichLuyTheoMaKH: jest.fn(),
      layLichSuDiemTichLuyTheoMaKH: jest.fn(),
    };

    const service = new KhachHangService(
      mysql as any,
      diemTichLuyService as any,
    );

    const ketQua = await service.tao(
      {
        tenKH: 'Khach hang moi',
        sdt: '0901111222',
        diaChi: 'TP HCM',
        diemTichLuy: 50,
      },
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
    );

    expect(diemTichLuyService.dieuChinhDiemKhachHang).toHaveBeenCalledWith(
      { maND: 'ND_ADMIN', vaiTro: 'Admin' },
      expect.stringMatching(/^KH_/),
      50,
      'Khởi tạo điểm khi tạo khách hàng',
      connection,
    );
    expect((ketQua as any).data).toMatchObject({
      maKH: 'KH777',
      diemTichLuy: 50,
    });
  });
});
