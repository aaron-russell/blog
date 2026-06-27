const test = require('node:test')
const assert = require('node:assert/strict')

test('isWithinLastSixMonths only returns true for posts within the last six months', async () => {
  const { default: date } = await import('../src/lib/date.ts')
  const now = new Date('2026-06-27T12:00:00.000Z')

  assert.equal(date.isWithinLastSixMonths('2026-06-27T00:00:00.000Z', now), true)
  assert.equal(date.isWithinLastSixMonths('2025-12-27T12:00:00.000Z', now), true)
  assert.equal(date.isWithinLastSixMonths('2025-12-27T11:59:59.000Z', now), false)
  assert.equal(date.isWithinLastSixMonths('not-a-date', now), false)
})
