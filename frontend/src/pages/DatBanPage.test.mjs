import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { banKhaDungDat } from '../constants/trangThaiBan.js'

const source = readFileSync(
  new URL('./DatBanPage.jsx', import.meta.url),
  'utf8',
)

test('customer booking availability excludes reserved tables', () => {
  // Trang chỉ nhận bàn còn trống qua helper tập trung (không so sánh chuỗi rải rác)
  assert.match(source, /import \{ banKhaDungDat \} from '\.\.\/constants\/trangThaiBan'/)
  assert.match(source, /banKhaDungDat\(table\?\.status\)/)

  for (const status of ['Reserved', 'GIU_CHO', 'CHO_NHAN_BAN', 'CHO_THANH_TOAN', 'DANG_AN']) {
    assert.equal(banKhaDungDat(status), false, `${status} không được tính là còn trống`)
  }
  assert.equal(banKhaDungDat('TRONG'), true)
  assert.equal(banKhaDungDat('Available'), true)
})

test('booking tables are not treated as available offline', () => {
  // Không lọc trạng thái giữ chỗ bằng chuỗi cứng ngoài helper
  assert.equal(source.includes("table.status === 'Reserved'"), false)
  assert.equal(source.includes("=== 'GIU_CHO'"), false)
  assert.equal(banKhaDungDat('Reserved'), false)
  assert.equal(banKhaDungDat('GIU_CHO'), false)
})
