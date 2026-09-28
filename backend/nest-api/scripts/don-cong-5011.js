#!/usr/bin/env node
const http = require('http');
const { execFileSync, spawn } = require('child_process');
const path = require('path');

const congBackend = 5011;
const duongDanSwagger = `http://localhost:${congBackend}/swagger`;
const thoiGianChoToiDaMs = 5000;
const khoangNgungMs = 200;
const thoiGianChoSwaggerMs = 30000;

function ngu(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function docTienTrinhHeThong() {
  try {
    const ketQua = execFileSync('ps', ['-ww', '-eo', 'pid=,args='], {
      encoding: 'utf8',
    });

    return ketQua
      .split('\n')
      .map((dong) => dong.trim())
      .filter(Boolean)
      .map((dong) => {
        const khop = dong.match(/^(\d+)\s+(.*)$/);
        if (!khop) {
          return null;
        }

        return {
          pid: Number(khop[1]),
          lenh: khop[2],
        };
      })
      .filter(Boolean);
  } catch (loi) {
    console.warn(`[start:dev] Khong doc duoc danh sach process: ${loi.message}`);
    return [];
  }
}

function layPidDangGiCong() {
  try {
    const ketQua = execFileSync('lsof', ['-ti', `tcp:${congBackend}`], {
      encoding: 'utf8',
    });

    return ketQua
      .split(/\s+/)
      .map((pid) => Number(pid.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  } catch (loi) {
    if (loi.status === 1) {
      return [];
    }

    if (loi.code === 'ENOENT') {
      console.warn(
        `[start:dev] Khong tim thay lsof, bo qua buoc kiem tra cong ${congBackend}.`,
      );
      return [];
    }

    throw loi;
  }
}

function layPidBackendCu() {
  return docTienTrinhHeThong()
    .filter(({ pid, lenh }) => {
      if (pid === process.pid) {
        return false;
      }

      return (
        lenh.includes('backend/nest-api/node_modules/.bin/nest start --watch') ||
        lenh.includes('backend/nest-api/dist/main') ||
        lenh.includes('backend/nest-api')
      );
    })
    .map(({ pid }) => pid);
}

function tapHopPidKhongTrung(danhSachPid) {
  return Array.from(
    new Set(danhSachPid.filter((pid) => Number.isInteger(pid) && pid > 0)),
  );
}

function tatTienTrinh(pid) {
  try {
    process.kill(pid, 'SIGKILL');
    return true;
  } catch (loi) {
    if (loi.code !== 'ESRCH') {
      console.warn(`[start:dev] Khong tat duoc PID ${pid}: ${loi.message}`);
    }

    return false;
  }
}

function kiemTraSwaggerSanSang() {
  return new Promise((resolve) => {
    const yeuCau = http.get(duongDanSwagger, (phanHoi) => {
      phanHoi.resume();
      resolve(phanHoi.statusCode >= 200 && phanHoi.statusCode < 500);
    });

    yeuCau.setTimeout(1000, () => {
      yeuCau.destroy();
      resolve(false);
    });

    yeuCau.on('error', () => resolve(false));
  });
}

function moUrlTrenTrinhDuyet(url) {
  const cauHinhLenh =
    process.platform === 'win32'
      ? { lenh: 'cmd', thamSo: ['/c', 'start', '', url] }
      : process.platform === 'darwin'
        ? { lenh: 'open', thamSo: [url] }
        : { lenh: 'xdg-open', thamSo: [url] };

  const tienTrinh = spawn(cauHinhLenh.lenh, cauHinhLenh.thamSo, {
    detached: true,
    stdio: 'ignore',
  });

  tienTrinh.on('error', (loi) => {
    console.warn(`[start:dev] Khong mo duoc Swagger: ${loi.message}`);
  });

  tienTrinh.unref();
}

async function moSwaggerKhiSanSang() {
  const thoiDiemBatDau = Date.now();

  while (Date.now() - thoiDiemBatDau < thoiGianChoSwaggerMs) {
    if (await kiemTraSwaggerSanSang()) {
      moUrlTrenTrinhDuyet(duongDanSwagger);
      console.log(`[start:dev] Da mo Swagger UI: ${duongDanSwagger}`);
      return;
    }

    await ngu(500);
  }

  console.warn(`[start:dev] Swagger chua san sang: ${duongDanSwagger}`);
}

async function donSoiCong() {
  const daTat = new Set();
  const thoiDiemBatDau = Date.now();

  while (Date.now() - thoiDiemBatDau < thoiGianChoToiDaMs) {
    const danhSachPid = tapHopPidKhongTrung([
      ...layPidBackendCu(),
      ...layPidDangGiCong(),
    ]).filter((pid) => pid !== process.pid);

    if (!danhSachPid.length) {
      if (daTat.size > 0) {
        console.log(
          `[start:dev] Da don process cu tren cong ${congBackend}: ${Array.from(
            daTat,
          ).join(', ')}`,
        );
      }

      return;
    }

    for (const pid of danhSachPid) {
      if (tatTienTrinh(pid)) {
        daTat.add(pid);
      }
    }

    await ngu(khoangNgungMs);
  }

  const conLai = tapHopPidKhongTrung([
    ...layPidBackendCu(),
    ...layPidDangGiCong(),
  ]).filter((pid) => pid !== process.pid);

  if (conLai.length > 0) {
    throw new Error(
      `[start:dev] Cong ${congBackend} van bi giu boi PID: ${conLai.join(', ')}`,
    );
  }
}

async function khoiDong() {
  await donSoiCong();

  // Chạy nest CLI trực tiếp bằng node để cross-platform.
  // Không spawn file .cmd với shell:false vì Node 20.12+/22 throw EINVAL (CVE-2024-27980).
  const duongDanNest = path.join(
    __dirname,
    '..',
    'node_modules',
    '@nestjs',
    'cli',
    'bin',
    'nest.js',
  );

  const con = spawn(process.execPath, [duongDanNest, 'start', '--watch'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
    stdio: 'inherit',
    shell: false,
  });

  const thoat = (signal) => {
    if (!con.killed) {
      con.kill(signal);
    }
  };

  process.on('SIGINT', () => thoat('SIGINT'));
  process.on('SIGTERM', () => thoat('SIGTERM'));
  process.on('SIGHUP', () => thoat('SIGHUP'));

  con.on('exit', (maThoat) => {
    process.exit(maThoat ?? 0);
  });

  con.on('error', (loi) => {
    console.error(`[start:dev] Khong khoi dong duoc Nest: ${loi.message}`);
    process.exit(1);
  });

  moSwaggerKhiSanSang();
}

khoiDong().catch((loi) => {
  console.error(`[start:dev] Loi khoi dong: ${loi.message}`);
  process.exit(1);
});
