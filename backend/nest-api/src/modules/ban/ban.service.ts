import { Injectable } from '@nestjs/common';
import { BanCrudService } from './ban-crud.service';
import { BanTrangThaiQrService } from './ban-trang-thai-qr.service';
import { TaiBanService } from '../tai-ban/tai-ban.service';
import { BanGhi } from '../../common/types';

@Injectable()
export class BanService {
  constructor(
    private readonly banCrudService: BanCrudService,
    private readonly banTrangThaiQrService: BanTrangThaiQrService,
    private readonly taiBanService: TaiBanService,
  ) {}

  layDanhSachBan() {
    return this.banCrudService.layDanhSachBan();
  }

  taoBan(body: BanGhi) {
    return this.banCrudService.taoBan(body);
  }

  capNhatBan(maBan: string, body: BanGhi) {
    return this.banCrudService.capNhatBan(maBan, body);
  }

  xoaBan(maBan: string) {
    return this.banCrudService.xoaBan(maBan);
  }

  capNhatTrangThaiBan(maBan: string, trangThai: string) {
    return this.banTrangThaiQrService.capNhatTrangThaiBan(maBan, trangThai);
  }

  layQrBan(maBan: string) {
    return this.banTrangThaiQrService.layQrBan(maBan);
  }

  layThucDonTheoBan(maBan: string) {
    return this.banTrangThaiQrService.layThucDonTheoBan(maBan);
  }

  taoOrderTaiBan(maBan: string, body: BanGhi) {
    return this.taiBanService.taoOrderTaiBan(maBan, body);
  }

  layOrderDangMoTaiBan(maBan: string) {
    return this.taiBanService.layOrderDangMoTaiBan(maBan);
  }

  yeuCauThanhToanTaiBan(maBan: string) {
    return this.taiBanService.yeuCauThanhToanTaiBan(maBan);
  }

  xacNhanThanhToanTaiBan(maBan: string, nguoiDung?: any) {
    return this.taiBanService.xacNhanThanhToanTaiBan(maBan, nguoiDung);
  }
}
