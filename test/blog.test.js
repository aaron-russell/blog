const test = require('node:test')
const assert = require('node:assert/strict')

test('blog helpers normalize known tag variants to a single label', async () => {
  const blog = await import('../src/lib/blog.ts')
  const normalizeTagLabel = blog.normalizeTagLabel || blog.default?.normalizeTagLabel

  assert.equal(typeof normalizeTagLabel, 'function')
  assert.equal(normalizeTagLabel('Web development'), 'Web Development')
  assert.equal(normalizeTagLabel('My story'), 'My Story')
  assert.equal(normalizeTagLabel('pagespeed'), 'PageSpeed')
  assert.equal(normalizeTagLabel('Quesrions'), 'Questions')
  assert.equal(normalizeTagLabel('Cloudflare Pages'), 'Cloudflare Pages')
})
