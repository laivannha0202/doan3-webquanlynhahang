import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { banKhaDungDat } from '../../constants/trangThaiBan.js'

const source = readFileSync(new URL('./apiDatBan.js', import.meta.url), 'utf8')

test('booking availability uses centralized free-table rules', () => {
  assert.match(
    source,
    /import \{ banKhaDungDat \} from '\.\.\/\.\.\/constants\/trangThaiBan'/,
  )
  assert.match(source, /banKhaDungDat\(ban\.status\)/)

  for (const status of ['Reserved', 'GIU_CHO', 'CHO_THANH_TOAN', 'DANG_AN']) {
    assert.equal(banKhaDungDat(status), false, `${status} không được tính là còn trống`)
  }
  assert.equal(banKhaDungDat('TRONG'), true)
})

test('booking availability does not count reserved tables as free', () => {
  // Không lọc trạng thái giữ chỗ bằng chuỗi cứng ngoài helper
  assert.equal(source.includes("ban.status === 'Reserved'"), false)
  assert.equal(source.includes("status === 'GIU_CHO'"), false)
  assert.equal(banKhaDungDat('Reserved'), false)
  assert.equal(banKhaDungDat('GIU_CHO'), false)
})
