import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { MySqlService } from '../../database/mysql/mysql.service';
import { taoPhanHoi } from '../../common/phan-hoi';
import { chuanHoaVaiTroNoiBo } from '../../common/vai-tro';
import { taoMa } from '../../common/tao-ma';
import { layKhachHangTheoMaNd } from '../../common/khach-hang.helper';
import { TaoNguoiDungDto } from './dto/tao-nguoi-dung.dto';
import { BanGhi } from '../../common/types';

const TEN_COOKIE_REFRESH_TOKEN = 'refreshToken';

@Injectable()
export class AuthService {
  constructor(
    private readonly mysql: MySqlService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  layTokenTuDauTrang(dauTrang?: string) {
    if (!dauTrang) {
      return '';
    }

    const [loai, ma] = dauTrang.split(' ');
    return loai?.toLowerCase() === 'bearer' ? ma || '' : '';
  }

  async giaiMaNguoiDung(dauTrang?: string) {
    const token = this.layTokenTuDauTrang(dauTrang);
    if (!token) {
      throw new UnauthorizedException('Thiếu token xác thực.');
    }

    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn.');
    }
  }

  private taoJwt(nguoiDung: BanGhi, chucVu?: string) {
    return this.jwtService.sign({
      maND: nguoiDung.MaND,
      email: nguoiDung.Email,
      vaiTro: nguoiDung.VaiTro,
      ...(chucVu ? { chucVu } : {}),
    });
  }

  private chuyenNguoiDungSangResponse(
    nguoiDung: BanGhi,
    khachHang?: BanGhi | null,
  ) {
    return {
      maND: nguoiDung.MaND,
      maKH: khachHang?.MaKH || '',
      tenND: khachHang?.TenKH || nguoiDung.TenND,
      email: nguoiDung.Email,
      sdt: khachHang?.SDT || '',
      vaiTro: nguoiDung.VaiTro,
      trangThai: nguoiDung.TrangThai,
      diaChi: khachHang?.DiaChi || '',
      diemTichLuy: Number(khachHang?.DiemTichLuy || 0),
    };
  }

  private async layNguoiDungTheoEmail(email: string) {
    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM NguoiDung WHERE Email = ? LIMIT 1',
      [email],
    );
    return danhSach[0] || null;
  }

  private async layNhanVienTheoMaNd(maND: string) {
    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM NhanVien WHERE MaND = ? LIMIT 1',
      [maND],
    );
    return danhSach[0] || null;
  }

  private async layNguoiDungTheoMaNd(maND: string) {
    const danhSach = await this.mysql.truyVan(
      'SELECT * FROM NguoiDung WHERE MaND = ? LIMIT 1',
      [maND],
    );
    return danhSach[0] || null;
  }

  private xacThucMatKhauManh(matKhau: string) {
    if (matKhau.length < 8) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số.',
      );
    }
    if (!/[A-Z]/.test(matKhau)) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số.',
      );
    }
    if (!/[0-9]/.test(matKhau)) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số.',
      );
    }
  }

  private taoChucVuNoiBo(vaiTro: string) {
    return vaiTro === 'Admin' ? 'QuanLy' : 'NhanVien';
  }

  async dangKy(payload: TaoNguoiDungDto) {
    const hoTen = String(payload.hoTen || '').trim();
    const email = String(payload.email || '')
      .trim()
      .toLowerCase();
    const matKhau = String(payload.matKhau || '').trim();
    const xacNhanMatKhau = String((payload as any).xacNhanMatKhau || '').trim();
    const soDienThoai = String((payload as any).soDienThoai || '').trim();
    const diaChi = String((payload as any).diaChi || '').trim();

    if (!hoTen || !email || !matKhau) {
      throw new BadRequestException('Họ tên, email và mật khẩu là bắt buộc.');
    }

    if (matKhau !== xacNhanMatKhau) {
      throw new BadRequestException('Xác nhận mật khẩu không khớp.');
    }

    const daTonTai = await this.layNguoiDungTheoEmail(email);
    if (daTonTai) {
      throw new BadRequestException('Email đã tồn tại.');
    }

    const maND = taoMa('ND');
    const maKH = taoMa('KH');
    const matKhauMaHoa = await hash(matKhau, 10);

    const ketQua = await this.mysql.giaoDich(async (ketNoi) => {
      await ketNoi.execute(
        'INSERT INTO NguoiDung (MaND, TenND, Email, MatKhau, VaiTro, TrangThai) VALUES (?, ?, ?, ?, ?, ?)',
        [maND, hoTen, email, matKhauMaHoa, 'KhachHang', 'Active'],
      );

      await ketNoi.execute(
        'INSERT INTO KhachHang (MaKH, MaND, TenKH, SDT, DiaChi, DiemTichLuy) VALUES (?, ?, ?, ?, ?, 0)',
        [maKH, maND, hoTen, soDienThoai || null, diaChi || null],
      );

      return { maND, maKH };
    });

    const nguoiDung = await this.layNguoiDungTheoMaNd(ketQua.maND);
    const khachHang = await layKhachHangTheoMaNd(this.mysql, ketQua.maND);
    const user = this.chuyenNguoiDungSangResponse(nguoiDung, khachHang);
    const accessToken = this.taoJwt(nguoiDung);

    return taoPhanHoi({ user, accessToken }, 'Đăng ký thành công');
  }

  async dangNhap(email: string, matKhau: string) {
    const nguoiDung = await this.layNguoiDungTheoEmail(
      String(email || '')
        .trim()
        .toLowerCase(),
    );
    if (!nguoiDung) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    const hopLe = await compare(
      String(matKhau || ''),
      String(nguoiDung.MatKhau || ''),
    );
    if (!hopLe) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    if (nguoiDung.VaiTro !== 'KhachHang') {
      throw new UnauthorizedException(
        'Tài khoản nội bộ vui lòng đăng nhập tại trang nội bộ.',
      );
    }

    const khachHang = await layKhachHangTheoMaNd(this.mysql, nguoiDung.MaND);
    const user = this.chuyenNguoiDungSangResponse(nguoiDung, khachHang);
    const accessToken = this.taoJwt(nguoiDung);
    const refreshToken = this.taoRefreshToken(nguoiDung);

    return taoPhanHoi(
      { user, accessToken, refreshToken },
      'Đăng nhập thành công',
    );
  }

  taoCookieRefreshToken(refreshToken: string) {
    const laMoiTruongSanXuat =
      this.configService.get<string>('NODE_ENV') === 'production';

    return `${TEN_COOKIE_REFRESH_TOKEN}=${encodeURIComponent(refreshToken || '')}; Path=/api/auth; HttpOnly; SameSite=Lax${laMoiTruongSanXuat ? '; Secure' : ''}; Max-Age=${7 * 24 * 60 * 60}`;
  }

  xoaCookieRefreshToken() {
    return `${TEN_COOKIE_REFRESH_TOKEN}=; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=0`;
  }

  private layRefreshTokenTuCookie(cookieHeader?: string) {
    if (!cookieHeader) return '';
    const cacCookie = cookieHeader.split(';').map((item) => item.trim());
    const cookie = cacCookie.find((item) =>
      item.startsWith(`${TEN_COOKIE_REFRESH_TOKEN}=`),
    );
    return cookie
      ? decodeURIComponent(cookie.slice(TEN_COOKIE_REFRESH_TOKEN.length + 1))
      : '';
  }

  async dangNhapNoiBo(email: string, matKhau: string) {
    const nguoiDung = await this.layNguoiDungTheoEmail(
      String(email || '')
        .trim()
        .toLowerCase(),
    );
    if (!nguoiDung) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    const hopLe = await compare(
      String(matKhau || ''),
      String(nguoiDung.MatKhau || ''),
    );
    if (!hopLe) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    if (nguoiDung.VaiTro === 'KhachHang') {
      throw new UnauthorizedException(
        'Tài khoản này không có quyền đăng nhập nội bộ.',
      );
    }

    const nhanVien = await this.layNhanVienTheoMaNd(nguoiDung.MaND);
    const khachHang = await layKhachHangTheoMaNd(this.mysql, nguoiDung.MaND);
    const user = this.chuyenNguoiDungSangResponse(nguoiDung, khachHang);
    const accessToken = this.taoJwt(nguoiDung, nhanVien?.ChucVu);

    return taoPhanHoi({ user, accessToken }, 'Đăng nhập thành công');
  }

  dangXuat() {
    return taoPhanHoi(null, 'Đăng xuất thành công');
  }

  private taoRefreshToken(nguoiDung: BanGhi) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!refreshSecret) {
      throw new Error('Thiếu JWT_REFRESH_SECRET trong môi trường.');
    }
    return this.jwtService.sign(
      {
        maND: nguoiDung.MaND,
        email: nguoiDung.Email,
        vaiTro: nguoiDung.VaiTro,
        loai: 'refresh',
      },
      {
        secret: refreshSecret,
        expiresIn:
          (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any) ||
          '7d',
      },
    );
  }

  async lamMoiTokenTuCookie(cookieHeader?: string) {
    const refreshToken = this.layRefreshTokenTuCookie(cookieHeader);
    if (!refreshToken) {
      throw new UnauthorizedException('Thiếu refresh token.');
    }

    let giaiMa: any;
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET');
      giaiMa = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn.',
      );
    }

    if (giaiMa.loai !== 'refresh') {
      throw new UnauthorizedException('Token không phải là refresh token.');
    }

    const nguoiDung = await this.layNguoiDungTheoMaNd(giaiMa.maND);
    if (!nguoiDung || nguoiDung.TrangThai !== 'Active') {
      throw new UnauthorizedException('Tài khoản không còn hoạt động.');
    }

    const nhanVien = await this.layNhanVienTheoMaNd(giaiMa.maND);
    const khachHang = await layKhachHangTheoMaNd(this.mysql, nguoiDung.MaND);
    const user = this.chuyenNguoiDungSangResponse(nguoiDung, khachHang);
    const accessToken = this.taoJwt(nguoiDung, nhanVien?.ChucVu);
    const refreshTokenMoi = this.taoRefreshToken(nguoiDung);

    return taoPhanHoi(
      { user, accessToken, refreshToken: refreshTokenMoi },
      'Làm mới token thành công',
    );
  }

  async layThongTinToiTuUser(thongTinToken: any) {
    const nguoiDung = await this.layNguoiDungTheoMaNd(
      String(thongTinToken.maND),
    );
    if (!nguoiDung) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const nhanVien = await this.layNhanVienTheoMaNd(String(thongTinToken.maND));
    const khachHang = await layKhachHangTheoMaNd(this.mysql, nguoiDung.MaND);
    const response = this.chuyenNguoiDungSangResponse(nguoiDung, khachHang);
    return taoPhanHoi(
      { ...response, chucVu: nhanVien?.ChucVu || '' },
      'Lấy thông tin thành công',
    );
  }

  async layDanhSachNguoiDungQuery() {
    const danhSachNguoiDung = await this.mysql.truyVan(
      'SELECT nd.MaND, nd.TenND, nd.Email, nd.VaiTro, nd.TrangThai, kh.MaKH, kh.SDT, kh.DiaChi, kh.DiemTichLuy, nv.MaNV, nv.ChucVu, nv.HoTen, nv.TinhTrang FROM NguoiDung nd LEFT JOIN KhachHang kh ON kh.MaND = nd.MaND LEFT JOIN NhanVien nv ON nv.MaND = nd.MaND ORDER BY nd.MaND ASC',
    );

    return taoPhanHoi(
      danhSachNguoiDung.map((nguoiDung) => ({
        maND: nguoiDung.MaND,
        maKH: nguoiDung.MaKH || '',
        maNV: nguoiDung.MaNV || '',
        tenND: nguoiDung.TenND,
        hoTen: nguoiDung.HoTen || nguoiDung.TenND,
        email: nguoiDung.Email,
        sdt: nguoiDung.SDT || '',
        vaiTro: nguoiDung.VaiTro,
        trangThai: nguoiDung.TrangThai,
        tinhTrangNhanVien: nguoiDung.TinhTrang || '',
        chucVu: nguoiDung.ChucVu || '',
        diaChi: nguoiDung.DiaChi || '',
        diemTichLuy: Number(nguoiDung.DiemTichLuy || 0),
      })),
      'Lấy danh sách người dùng thành công',
    );
  }

  async taoNguoiDungNoiBo(payload: BanGhi) {
    const hoTen = String(payload.hoTen || '').trim();
    const email = String(payload.email || '')
      .trim()
      .toLowerCase();
    const soDienThoai = String(payload.soDienThoai || '').trim();
    const matKhau = String(payload.matKhau || '').trim();
    const xacNhanMatKhau = String(payload.xacNhanMatKhau || '').trim();
    const vaiTro = chuanHoaVaiTroNoiBo(
      String(payload.vaiTro || 'NhanVien').trim(),
    );
    const trangThai = String(payload.trangThai || 'Active').trim() || 'Active';
    const chucVu = String(payload.chucVu || this.taoChucVuNoiBo(vaiTro)).trim();

    if (!hoTen || !email || !matKhau) {
      throw new BadRequestException('Họ tên, email và mật khẩu là bắt buộc.');
    }

    if (matKhau !== xacNhanMatKhau) {
      throw new BadRequestException('Xác nhận mật khẩu không khớp.');
    }

    const daTonTai = await this.layNguoiDungTheoEmail(email);
    if (daTonTai) {
      throw new BadRequestException('Email đã tồn tại.');
    }

    const maND = taoMa('ND');
    const maNV = taoMa('NV');
    const matKhauMaHoa = await hash(matKhau, 10);

    const ketQua = await this.mysql.giaoDich(async (ketNoi) => {
      await ketNoi.execute(
        'INSERT INTO NguoiDung (MaND, TenND, Email, MatKhau, VaiTro, TrangThai) VALUES (?, ?, ?, ?, ?, ?)',
        [maND, hoTen, email, matKhauMaHoa, vaiTro, trangThai],
      );

      await ketNoi.execute(
        'INSERT INTO NhanVien (MaNV, MaND, HoTen, SDT, ChucVu, TinhTrang) VALUES (?, ?, ?, ?, ?, ?)',
        [
          maNV,
          maND,
          hoTen,
          soDienThoai || null,
          chucVu || this.taoChucVuNoiBo(vaiTro),
          trangThai === 'Active' ? 'Active' : 'Inactive',
        ],
      );

      return { maND, maNV };
    });

    const nguoiDung = await this.layNguoiDungTheoMaNd(ketQua.maND);
    const nhanVien = await this.layNhanVienTheoMaNd(ketQua.maND);

    return taoPhanHoi(
      {
        maND: nguoiDung?.MaND || maND,
        maNV: nhanVien?.MaNV || maNV,
      },
      'Tạo nhân viên thành công',
    );
  }

  async capNhatNguoiDungNoiBo(maND: string, payload: BanGhi) {
    const nguoiDung = await this.layNguoiDungTheoMaNd(maND);
    if (!nguoiDung) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const hoTen = String(payload.hoTen || nguoiDung.TenND || '').trim();
    const email = String(payload.email || nguoiDung.Email || '')
      .trim()
      .toLowerCase();
    const soDienThoai = String(payload.soDienThoai || '').trim();
    const vaiTro = chuanHoaVaiTroNoiBo(
      String(payload.vaiTro || nguoiDung.VaiTro || 'NhanVien').trim(),
    );
    const trangThai =
      String(payload.trangThai || nguoiDung.TrangThai || 'Active').trim() ||
      'Active';
    const chucVu = String(payload.chucVu || this.taoChucVuNoiBo(vaiTro)).trim();

    const nguoiDungCungEmail = await this.layNguoiDungTheoEmail(email);
    if (nguoiDungCungEmail && String(nguoiDungCungEmail.MaND) !== maND) {
      throw new BadRequestException('Email đã tồn tại.');
    }

    await this.mysql.thucThi(
      'UPDATE NguoiDung SET TenND = ?, Email = ?, VaiTro = ?, TrangThai = ? WHERE MaND = ?',
      [hoTen, email, vaiTro, trangThai, maND],
    );

    const nhanVienHienTai = await this.layNhanVienTheoMaNd(maND);
    const tinhTrangNhanVien = trangThai === 'Active' ? 'Active' : 'Inactive';

    if (nhanVienHienTai) {
      await this.mysql.thucThi(
        'UPDATE NhanVien SET HoTen = ?, SDT = ?, ChucVu = ?, TinhTrang = ? WHERE MaND = ?',
        [
          hoTen,
          soDienThoai || null,
          chucVu || this.taoChucVuNoiBo(vaiTro),
          tinhTrangNhanVien,
          maND,
        ],
      );
    } else {
      await this.mysql.thucThi(
        'INSERT INTO NhanVien (MaNV, MaND, HoTen, SDT, ChucVu, TinhTrang) VALUES (?, ?, ?, ?, ?, ?)',
        [
          taoMa('NV'),
          maND,
          hoTen,
          soDienThoai || null,
          chucVu || this.taoChucVuNoiBo(vaiTro),
          tinhTrangNhanVien,
        ],
      );
    }

    if (payload.matKhau) {
      const matKhau = String(payload.matKhau || '').trim();
      const xacNhanMatKhau = String(payload.xacNhanMatKhau || '').trim();

      if (!matKhau) {
        throw new BadRequestException('Mật khẩu mới không hợp lệ.');
      }

      if (matKhau !== xacNhanMatKhau) {
        throw new BadRequestException('Xác nhận mật khẩu không khớp.');
      }

      await this.mysql.thucThi(
        'UPDATE NguoiDung SET MatKhau = ? WHERE MaND = ?',
        [await hash(matKhau, 10), maND],
      );
    }

    return taoPhanHoi({ maND }, 'Cập nhật nhân viên thành công');
  }

  async xoaNguoiDungNoiBo(maND: string) {
    const nguoiDung = await this.layNguoiDungTheoMaNd(maND);
    if (!nguoiDung) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    if (String(nguoiDung.VaiTro) === 'KhachHang') {
      throw new BadRequestException(
        'Chỉ có thể xóa tài khoản nhân viên hoặc quản lý.',
      );
    }

    await this.mysql.giaoDich(async (ketNoi) => {
      await ketNoi.execute('DELETE FROM NhanVien WHERE MaND = ?', [maND]);
      await ketNoi.execute('DELETE FROM NguoiDung WHERE MaND = ?', [maND]);
    });

    return taoPhanHoi(null, 'Xóa nhân viên thành công');
  }

  async capNhatHoSoTuUser(thongTinToken: any, payload: BanGhi) {
    const maND = String(thongTinToken.maND);
    const hoTen = String(payload.hoTen || '').trim();
    const email = String(payload.email || '')
      .trim()
      .toLowerCase();
    const soDienThoai = String(payload.soDienThoai || '').trim();
    const diaChi = String(payload.diaChi || '').trim();

    await this.mysql.giaoDich(async (ketNoi) => {
      await ketNoi.execute(
        'UPDATE NguoiDung SET TenND = ?, Email = ? WHERE MaND = ?',
        [hoTen, email, maND],
      );
      await ketNoi.execute(
        'UPDATE KhachHang SET TenKH = ?, SDT = ?, DiaChi = ? WHERE MaND = ?',
        [hoTen, soDienThoai || null, diaChi || null, maND],
      );
    });

    return this.layThongTinToiTuUser(thongTinToken);
  }

  async doiMatKhauTuUser(thongTinToken: any, payload: BanGhi) {
    const nguoiDung = await this.layNguoiDungTheoMaNd(
      String(thongTinToken.maND),
    );
    if (!nguoiDung) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const matKhauHienTai = String(payload.matKhauHienTai || '');
    const matKhauMoi = String(payload.matKhauMoi || '');
    const xacNhan = String(payload.xacNhanMatKhauMoi || '');

    if (matKhauMoi !== xacNhan) {
      throw new BadRequestException('Xác nhận mật khẩu mới không khớp.');
    }

    this.xacThucMatKhauManh(matKhauMoi);

    const hopLe = await compare(
      matKhauHienTai,
      String(nguoiDung.MatKhau || ''),
    );
    if (!hopLe) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
    }

    await this.mysql.thucThi(
      'UPDATE NguoiDung SET MatKhau = ? WHERE MaND = ?',
      [await hash(matKhauMoi, 10), nguoiDung.MaND],
    );
    return taoPhanHoi(null, 'Đổi mật khẩu thành công');
  }
}
