import { BanCrudService } from './ban-crud.service';

describe('BanCrudService', () => {
  it('tu sinh ma ban tiep theo khi tao ban khong nhap ma ban', async () => {
    const truyVan = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ MaBan: 'B063' }]);
    const thucThi = jest.fn().mockResolvedValue(undefined);
    const service = new BanCrudService({ truyVan, thucThi } as any);

    const ketQua = await service.taoBan({
      tenBan: 'Bàn mới',
      soBan: 64,
      khuVuc: 'Trong nhà',
      viTri: 'Trong nhà',
      soChoNgoi: 4,
      ghiChu: '',
    } as any);

    expect(thucThi).toHaveBeenCalledWith(expect.any(String), [
      'B064',
      'Bàn mới',
      'Trong nhà',
      64,
      4,
      'Trong nhà',
      null,
      expect.any(String),
    ]);
    expect(ketQua.data).toEqual({ maBan: 'B064' });
  });
});
