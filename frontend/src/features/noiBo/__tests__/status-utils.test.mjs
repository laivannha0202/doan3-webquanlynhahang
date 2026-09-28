import test from 'node:test'
import assert from 'node:assert/strict'

// Bộ helper trạng thái thực tế của màn nội bộ.
// Node ESM cần đuôi file tường minh cho module cùng repo.
import {
  canXacNhanThuCong,
  laDatBanDaCheckIn,
  laTrangThaiDatBanKetThuc,
} from '../boChon.js'

test('các trạng thái pending (không phân biệt hoa thường) vẫn là trạng thái đang hoạt động', () => {
  assert.equal(canXacNhanThuCong({ status: 'pending' }), true)
  assert.equal(canXacNhanThuCong({ status: 'PENDING' }), true)
  assert.equal(canXacNhanThuCong({ status: 'Pending' }), true)
})

test('trạng thái đã nhận bàn được nhận diện đúng', () => {
  assert.equal(laDatBanDaCheckIn({ status: 'DA_NHAN_BAN' }), true)
  assert.equal(laDatBanDaCheckIn({ status: 'CHO_XAC_NHAN' }), false)
  assert.equal(canXacNhanThuCong({ status: 'CHO_XAC_NHAN' }), true)
})

test('trạng thái kết thúc được chuẩn hóa và không còn là trạng thái xử lý', () => {
  assert.equal(laTrangThaiDatBanKetThuc({ status: 'HOAN_THANH' }), true)
  assert.equal(laTrangThaiDatBanKetThuc({ status: 'DA_HUY' }), true)
  assert.equal(laTrangThaiDatBanKetThuc({ status: 'KHONG_DEN' }), true)
  assert.equal(laTrangThaiDatBanKetThuc({ status: 'pending' }), false)
  assert.equal(canXacNhanThuCong({ status: 'DA_HUY' }), false)
})
