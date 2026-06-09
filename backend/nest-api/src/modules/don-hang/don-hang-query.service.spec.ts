import { DonHangQueryService } from './don-hang-query.service';

describe('DonHangQueryService', () => {
  it('returns order items at top level for table order modal compatibility', async () => {
    const mysql = {
      truyVan: jest
        .fn()
        .mockResolvedValueOnce([
          {
            MaDonHang: 'DH020',
            MaKH: 'KH001',
            MaBan: 'B006',
            MaDatBan: 'DB021',
            TongTien: 182000,
            TrangThai: 'DANG_CHUAN_BI',
          },
        ])
        .mockResolvedValueOnce([
          {
            MaChiTiet: 'CT052',
            MaDonHang: 'DH020',
            MaMon: 'M003',
            TenMon: 'Cơm Rang Dương Châu',
            SoLuong: 1,
            DonGia: 55000,
            ThanhTien: 55000,
          },
        ]),
    };
    const pricing = {
      taoTongHopGiaTuDuLieuDonHang: jest.fn(() => ({
        tamTinh: 55000,
        phiDichVu: 3000,
        giamGia: 0,
        tongTien: 58000,
      })),
      taoPhanHoiMaGiam: jest.fn(() => null),
    };
    const service = new DonHangQueryService(mysql as any, pricing as any);

    const response = await service.layChiTietDonHangKhongKiemTraQuyen('DH020');
    const duLieu = response.data as any;

    expect(duLieu.chiTiet).toHaveLength(1);
    expect(duLieu.chiTiet[0]).toEqual(
      expect.objectContaining({
        MaMon: 'M003',
        maMon: 'M003',
        TenMon: 'Cơm Rang Dương Châu',
        tenMon: 'Cơm Rang Dương Châu',
        SoLuong: 1,
        soLuong: 1,
        DonGia: 55000,
        donGia: 55000,
        ThanhTien: 55000,
        thanhTien: 55000,
      }),
    );
    expect(duLieu.donHang.chiTiet).toEqual(duLieu.chiTiet);
  });
});
