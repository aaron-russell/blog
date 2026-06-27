const test = require('node:test')
const assert = require('node:assert/strict')

test('astro config keeps Cloudflare Pages friendly static output', async () => {
  const { default: config } = await import('../astro.config.mjs')

  assert.equal(config.site, 'https://aaron-russell.co.uk')
  assert.equal(config.output, 'static')
  assert.equal(config.publicDir, './static')
  assert.equal(config.trailingSlash, 'always')
})
