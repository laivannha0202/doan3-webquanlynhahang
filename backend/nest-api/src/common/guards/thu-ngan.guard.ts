import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { THU_NGAN_KEY } from '../decorators/thu-ngan.decorator';

function normalize(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]/g, '');
}

const THU_NGAN_VARIANTS = new Set(['thungan', 'cashier']);
const QUAN_LY_VARIANTS = new Set(['quanly', 'manager']);

function isThuNgan(value?: string): boolean {
  if (!value) return false;
  return THU_NGAN_VARIANTS.has(normalize(value));
}

function isQuanLy(value?: string): boolean {
  if (!value) return false;
  return QUAN_LY_VARIANTS.has(normalize(value));
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

    if (isQuanLy(user.vaiTro)) return true;
    if (isQuanLy(user.chucVu)) return true;
    if (isQuanLy(user.chucNangPhu)) return true;

    if (isThuNgan(user.chucVu)) return true;
    if (isThuNgan(user.chucNangPhu)) return true;

    throw new ForbiddenException(
      'Chỉ thu ngân hoặc quản lý được xác nhận thanh toán.',
    );
  }
}
