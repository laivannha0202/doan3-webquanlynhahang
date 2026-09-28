// Smoke test API backend: boot, swagger, route công khai, guard đăng nhập.
// Chạy được trên Windows (không cần bash source .env).
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const thuMucGoc = dirname(dirname(fileURLToPath(import.meta.url)))

// Đọc .env ở thư mục gốc nếu có (không ghi đè biến môi trường đã set).
const duongDanEnv = join(thuMucGoc, '.env')
if (existsSync(duongDanEnv)) {
  for (const dong of readFileSync(duongDanEnv, 'utf8').split(/\r?\n/)) {
    const khop = dong.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (khop && !(khop[1] in process.env)) {
      process.env[khop[1]] = khop[2].replace(/^["']|["']$/g, '')
    }
  }
}

const cong = process.env.BACKEND_PORT || '5011'
const goc = process.env.BACKEND_URL || `http://localhost:${cong}`
const thoiGianHetHan = Number(process.env.SMOKE_TIMEOUT_MS || 8000)

async function goiDuong(duong) {
  const dong = AbortSignal.timeout(thoiGianHetHan)
  const phanHoi = await fetch(`${goc}${duong}`, { signal: dong })
  const noiDung = await phanHoi.text()
  return { trangThai: phanHoi.status, noiDung }
}

const cacKiemTra = [
  {
    ten: 'Swagger UI (/swagger)',
    duong: '/swagger',
    kiemTra: ({ trangThai }) => trangThai === 200,
    mongDoi: '200',
  },
  {
    ten: 'Route công khai GET /api/thuc-don',
    duong: '/api/thuc-don',
    kiemTra: ({ trangThai }) => trangThai === 200,
    mongDoi: '200 (cần .env backend có DB_PASSWORD đúng)',
    ghiChuThatBai: (phanHoi) =>
      phanHoi.trangThai === 503
        ? 'Backend phản hồi nhưng DB chưa kết nối được — kiểm tra .env (DB_PASSWORD)'
        : '',
  },
  {
    ten: 'Guard đăng nhập GET /api/thong-ke/tong-quan (không token)',
    duong: '/api/thong-ke/tong-quan',
    kiemTra: ({ trangThai }) => trangThai === 401,
    mongDoi: '401 Unauthorized',
    ghiChuThatBai: (phanHoi) =>
      phanHoi.trangThai === 429 ? 'Bị rate limit — thử lại sau 60s' : '',
  },
]

let loi = 0
console.log(`Smoke API: ${goc}\n`)

for (const kiemTra of cacKiemTra) {
  try {
    const phanHoi = await goiDuong(kiemTra.duong)
    if (kiemTra.kiemTra(phanHoi)) {
      console.log(`  PASS  ${kiemTra.ten} -> ${phanHoi.trangThai}`)
    } else {
      loi += 1
      const ghiChu = kiemTra.ghiChuThatBai?.(phanHoi) || ''
      console.log(
        `  FAIL  ${kiemTra.ten} -> ${phanHoi.trangThai} (mong doi ${kiemTra.mongDoi})${ghiChu ? ' — ' + ghiChu : ''}`,
      )
    }
  } catch (loiGoi) {
    loi += 1
    console.log(`  FAIL  ${kiemTra.ten} -> ${loiGoi.message}`)
  }
}

console.log(loi === 0 ? '\nSmoke API: TOAN BO PASS' : `\nSmoke API: ${loi} LOI`)
process.exit(loi === 0 ? 0 : 1)
