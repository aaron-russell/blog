const test = require('node:test')
const assert = require('node:assert/strict')

test('og helpers build stable social image paths and urls', async () => {
  const og = await import('../src/lib/og.ts')

  assert.equal(og.buildPostOgImagePath('edge-functions'), '/og/blog/edge-functions.png')
  assert.equal(og.buildStaticOgImagePath('site'), '/og/site.png')
  assert.equal(
    og.buildOgImageUrl('https://aaron-russell.co.uk', '/og/blog/edge-functions.png'),
    'https://aaron-russell.co.uk/og/blog/edge-functions.png'
  )
})

test('og renderer returns a png buffer with the expected signature', async () => {
  const og = await import('../src/lib/og.ts')
  const buffer = og.renderOgImage({
    category: 'Cloudflare',
    description: 'A premium social card generated at build time for the Astro blog.',
    label: 'Blog post',
    publishDate: '27 June 2026',
    readingTime: '6 min read',
    tags: ['Cloudflare Pages', 'Open Graph', 'Astro'],
    title: 'Generate premium Open Graph images with Cloudflare-native deployment patterns',
  })

  assert.ok(buffer.length > 10_000)
  assert.deepEqual(Array.from(buffer.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10])
})
