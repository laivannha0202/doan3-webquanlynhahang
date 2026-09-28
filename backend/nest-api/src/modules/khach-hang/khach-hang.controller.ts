import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { KhachHangService } from './khach-hang.service';
import { TaoKhachHangDto } from './dto/tao-khach-hang.dto';
import { CapNhatKhachHangDto } from './dto/cap-nhat-khach-hang.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class PhanTrangKhachHangQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  @IsNumber()
  @Min(1)
  trang?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  @IsNumber()
  @Min(1)
  soLuong?: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  sapXep?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  thuTu?: string;
}

class CapNhatDiemKhachHangDto {
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? value
      : Number(value),
  )
  @IsNumber()
  soDiem: number;

  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  moTa: string;
}

@ApiTags('khach-hang')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/khach-hang')
export class KhachHangController {
  constructor(private readonly khachHangService: KhachHangService) {}

  @Roles('Admin', 'NhanVien')
  @Get()
  layDanhSach(
    @Query() query: PhanTrangKhachHangQueryDto,
    @Query('tuKhoa') tuKhoa?: string,
    @Query('phanLoai') phanLoai?: string,
    @Query('sapXep') sapXep?: string,
    @Query('thuTu') thuTu?: string,
  ) {
    return this.khachHangService.layDanhSach({
      tuKhoa,
      phanLoai,
      sapXep,
      thuTu,
      trang: query.trang,
      soLuong: query.soLuong,
    });
  }

  @Roles('Admin', 'NhanVien')
  @Get(':maKH')
  layChiTiet(@Param('maKH') maKH: string) {
    return this.khachHangService.layChiTiet(maKH);
  }

  @Roles('Admin', 'NhanVien')
  @Get(':maKH/lich-su')
  layLichSu(@Param('maKH') maKH: string) {
    return this.khachHangService.layLichSu(maKH);
  }

  @Roles('Admin', 'NhanVien')
  @Post()
  tao(@CurrentUser() nguoiDung: any, @Body() body: TaoKhachHangDto) {
    return this.khachHangService.tao(
      {
        tenKH: body.tenKH,
        sdt: body.sdt,
        diaChi: body.diaChi,
        diemTichLuy: body.diemTichLuy,
      },
      nguoiDung,
    );
  }

  @Roles('Admin', 'NhanVien')
  @Put(':maKH')
  capNhat(@Param('maKH') maKH: string, @Body() body: CapNhatKhachHangDto) {
    return this.khachHangService.capNhat(maKH, {
      tenKH: body.tenKH,
      sdt: body.sdt,
      diaChi: body.diaChi,
    });
  }

  @Roles('Admin')
  @Delete(':maKH')
  xoa(@Param('maKH') maKH: string) {
    return this.khachHangService.xoa(maKH);
  }

  @Roles('Admin', 'NhanVien')
  @Patch(':maKH/diem')
  capNhatDiem(
    @Param('maKH') maKH: string,
    @CurrentUser() nguoiDung: any,
    @Body() body: CapNhatDiemKhachHangDto,
  ) {
    if (Number.isNaN(body.soDiem))
      throw new BadRequestException('Số điểm không hợp lệ.');
    return this.khachHangService.capNhatDiem(
      maKH,
      {
        soDiem: body.soDiem,
        moTa: body.moTa,
      },
      nguoiDung,
    );
  }
}
