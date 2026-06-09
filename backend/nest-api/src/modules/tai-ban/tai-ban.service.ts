import { Injectable, NotFoundException } from '@nestjs/common';
import { MySqlService } from '../../database/mysql/mysql.service';
import { DonHangCreateOrderService } from '../don-hang/don-hang-create-order.service';
import { DonHangPaymentStatusService } from '../don-hang/don-hang-payment-status.service';
import { BanGhi } from '../../common/types';
import { resolveMaBan } from '../../common/ban-resolver';

@Injectable()
export class TaiBanService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly donHangCreateOrderService: DonHangCreateOrderService,
    private readonly donHangPaymentStatusService: DonHangPaymentStatusService,
  ) {}

  private async timMaBan(giaTri: string): Promise<string | null> {
    return resolveMaBan(this.mysql, giaTri);
  }

  async taoOrderTaiBan(maBan: string, payload: BanGhi) {
    const ma = await this.timMaBan(maBan);
    if (!ma) throw new NotFoundException('Không tìm thấy bàn.');
    return this.donHangCreateOrderService.taoOrderTaiBan(ma, payload);
  }

  layOrderDangMoTaiBan(maBan: string) {
    return this.donHangPaymentStatusService.layOrderDangMoTaiBan(maBan);
  }

  yeuCauThanhToanTaiBan(maBan: string) {
    return this.donHangPaymentStatusService.yeuCauThanhToanTaiBan(maBan);
  }

  xacNhanThanhToanTaiBan(maBan: string, nguoiDung?: any) {
    return this.donHangPaymentStatusService.xacNhanThanhToanTaiBan(
      maBan,
      nguoiDung,
    );
  }
}
