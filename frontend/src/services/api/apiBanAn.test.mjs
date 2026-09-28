import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chuanHoaTrangThaiBan } from '../../constants/trangThaiBan.js'

const source = readFileSync(new URL('./apiBanAn.js', import.meta.url), 'utf8')

test('table API mapper keeps backend table statuses distinct', () => {
  // Mapper chuẩn hóa qua helper trung tâm, không gộp chuỗi bằng ||
  assert.equal(
    source.includes("trangThai === 'CHO_THANH_TOAN' || trangThai === 'Reserved'"),
    false,
  )
  assert.match(source, /status: chuanHoaTrangThaiBan\(/)

  // Chuẩn hóa về enum FEAT-07: cả hai rơi vào nhóm đã đặt
  assert.equal(chuanHoaTrangThaiBan('Reserved'), 'DA_DAT')
  assert.equal(chuanHoaTrangThaiBan('CHO_THANH_TOAN'), 'DA_DAT')
  assert.equal(chuanHoaTrangThaiBan('Available'), 'TRONG')
  assert.equal(chuanHoaTrangThaiBan('Occupied'), 'CO_KHACH')
})

test('table API mapper does not default unknown table status to available', () => {
  // Không fallback về TRONG khi không rõ trạng thái
  assert.equal(source.includes("return trangThai || 'TRONG'"), false)
  assert.equal(chuanHoaTrangThaiBan(''), 'BAO_TRI')
  assert.equal(chuanHoaTrangThaiBan('unknown_status'), 'BAO_TRI')
  assert.equal(chuanHoaTrangThaiBan('Maintenance'), 'BAO_TRI')
})
