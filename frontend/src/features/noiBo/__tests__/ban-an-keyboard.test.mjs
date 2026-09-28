import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = readFileSync(
  new URL('../components/BanAnTab.jsx', import.meta.url),
  'utf8',
)

// Node không parse được file .jsx trong node --test, nên kiểm tra hành vi
// bàn phím bằng nguồn render của component (repo chủ yếu test theo kiểu này).
const cacBoNhan = source.split('onKeyDown=').slice(1).map((phan) => phan.slice(0, 400))

test('mỗi hành động trên bàn đều có handler bàn phím', () => {
  assert.ok(
    cacBoNhan.length >= 2,
    `Cần ít nhất 2 onKeyDown (mở chi tiết + đánh dấu sẵn sàng), tìm thấy ${cacBoNhan.length}`,
  )
})

test('bàn đang hoạt động mở được bằng Enter hoặc Space', () => {
  for (const khuan of cacBoNhan) {
    assert.match(
      khuan,
      /e\.key === 'Enter'|e\.key === ' '/,
      'Handler phải mở khóa bằng Enter hoặc Space (e.key === " ")',
    )
  }
  assert.match(source, /e\.key === 'Enter'/)
  assert.match(source, /e\.key === ' '/)
})

test('không dùng mã phím Spacebar (legacy) của trình duyệt cũ', () => {
  assert.equal(source.includes("e.key === 'Spacebar'"), false)
})
