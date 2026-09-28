import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { MySqlService } from './mysql.service';

describe('MySqlService', () => {
  const taoDichVuVoiKetNoiGia = (ketNoi: any) => {
    const service = new MySqlService();
    (service as any).layKetNoi = jest.fn(() => ({
      getConnection: jest.fn(async () => ketNoi),
    }));
    return service;
  };

  it('giu nguyen HttpException va rollback transaction', async () => {
    const ketNoi = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    const service = taoDichVuVoiKetNoiGia(ketNoi);
    const loi = new BadRequestException('Không đủ điểm để đổi.');

    await expect(
      service.giaoDich(async () => {
        throw loi;
      }),
    ).rejects.toBe(loi);

    expect(ketNoi.beginTransaction).toHaveBeenCalledTimes(1);
    expect(ketNoi.commit).not.toHaveBeenCalled();
    expect(ketNoi.rollback).toHaveBeenCalledTimes(1);
    expect(ketNoi.release).toHaveBeenCalledTimes(1);
  });

  it('van boc loi he thong khi khong phai HttpException', async () => {
    const ketNoi = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };
    const service = taoDichVuVoiKetNoiGia(ketNoi);

    await expect(
      service.giaoDich(async () => {
        throw new Error('db exploded');
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(ketNoi.rollback).toHaveBeenCalledTimes(1);
    expect(ketNoi.release).toHaveBeenCalledTimes(1);
  });
});
