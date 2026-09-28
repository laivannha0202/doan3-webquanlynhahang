import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { TaoNguoiDungDto } from './dto/tao-nguoi-dung.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  dangKy(@Body() body: TaoNguoiDungDto) {
    return this.authService.dangKy(body);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async dangNhap(
    @Body() body: DangNhapDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const phanHoi = await this.authService.dangNhap(body.email, body.matKhau);
    res.setHeader(
      'Set-Cookie',
      this.authService.taoCookieRefreshToken(
        String((phanHoi.data as any)?.refreshToken || ''),
      ),
    );
    return phanHoi;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('internal-login')
  async dangNhapNoiBo(
    @Body() body: DangNhapDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const phanHoi = await this.authService.dangNhapNoiBo(
      body.email,
      body.matKhau,
    );
    res.setHeader(
      'Set-Cookie',
      this.authService.taoCookieRefreshToken(
        String((phanHoi.data as any)?.refreshToken || ''),
      ),
    );
    return phanHoi;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('logout')
  dangXuat(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Set-Cookie', this.authService.xoaCookieRefreshToken());
    return this.authService.dangXuat();
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('refresh')
  async lamMoiToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const phanHoi = await this.authService.lamMoiTokenTuCookie(
      req.headers.cookie || '',
    );
    res.setHeader(
      'Set-Cookie',
      this.authService.taoCookieRefreshToken(
        String((phanHoi.data as any)?.refreshToken || ''),
      ),
    );
    return phanHoi;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  layThongTinToi(@CurrentUser() user: any) {
    return this.authService.layThongTinToiTuUser(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get('nguoi-dung')
  layDanhSachNguoiDung() {
    return this.authService.layDanhSachNguoiDungQuery();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  capNhatHoSo(@CurrentUser() user: any, @Body() body: Record<string, unknown>) {
    return this.authService.capNhatHoSoTuUser(user, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Put('doi-mat-khau')
  doiMatKhau(@CurrentUser() user: any, @Body() body: Record<string, unknown>) {
    return this.authService.doiMatKhauTuUser(user, body);
  }
}
