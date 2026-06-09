import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THU_NGAN_KEY } from '../decorators/thu-ngan.decorator';

const THU_NGAN_VARIANTS = new Set([
  'thu ngan',
  'thungan',
  'thu_ngan',
  'cashier',
]);

function isThuNgan(value?: string): boolean {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase().replace(/[\s_-]/g, '');
  return THU_NGAN_VARIANTS.has(normalized);
}

@Injectable()
export class ThuNganGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const needThuNgan = this.reflector.getAllAndOverride<boolean>(THU_NGAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!needThuNgan) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Không tìm thấy thông tin người dùng.');
    }

    if (user.vaiTro === 'Admin') return true;

    if (isThuNgan(user.chucVu)) return true;

    if (isThuNgan(user.chucNangPhu)) return true;

    throw new ForbiddenException(
      'Chỉ thu ngân hoặc quản lý được xác nhận thanh toán.',
    );
  }
}
