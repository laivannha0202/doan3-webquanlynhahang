import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { CoreModule } from './modules/core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { ThucDonModule } from './modules/thuc-don/thuc-don.module';
import { BanModule } from './modules/ban/ban.module';
import { DatBanModule } from './modules/dat-ban/dat-ban.module';
import { DonHangModule } from './modules/don-hang/don-hang.module';
import { DanhGiaModule } from './modules/danh-gia/danh-gia.module';
import { DiemTichLuyModule } from './modules/diem-tich-luy/diem-tich-luy.module';
import { MaGiamGiaModule } from './modules/ma-giam-gia/ma-giam-gia.module';
import { KhachHangModule } from './modules/khach-hang/khach-hang.module';
import { ThongBaoModule } from './modules/thong-bao/thong-bao.module';
import { ThongKeModule } from './modules/thong-ke/thong-ke.module';

const moiTruong = process.env.NODE_ENV?.trim() || 'development';
const thuMucBackend = join(__dirname, '..');
const tapTinMoiTruong = join(thuMucBackend, `.env.${moiTruong}`);
const tapTinMacDinh = join(thuMucBackend, '.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [tapTinMoiTruong, tapTinMacDinh],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        // Giới hạn tổng: 120 request/phút/IP để dashboard + polling hoạt động
        // bình thường. Các endpoint nhạy cảm (auth) tự khai @Throttle riêng.
        limit: 120,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    CoreModule,
    AuthModule,
    ThucDonModule,
    BanModule,
    DatBanModule,
    DonHangModule,
    DanhGiaModule,
    MaGiamGiaModule,
    KhachHangModule,
    DiemTichLuyModule,
    ThongBaoModule,
    ThongKeModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
