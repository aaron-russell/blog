const test = require('node:test')
const assert = require('node:assert/strict')

test('ai summary helpers build stable source hashes', async () => {
  const module = await import('../src/lib/ai-summaries.js')
  const post = {
    slug: 'testing-gatsby',
    title: 'Testing Gatsby',
    descriptionPlainText: 'A post about test-driving a migration.',
    bodyPlainText: 'We tested the migration path, checked the edge cases, and documented the result.',
    category: 'engineering',
    tags: ['gatsby', 'testing'],
  }

  const source = module.buildSummarySource(post)
  const hash = module.hashSummarySource(source)

  assert.match(source, /Testing Gatsby/)
  assert.equal(typeof hash, 'string')
  assert.equal(hash.length, 8)
  assert.equal(module.getAiSummaryPoints(post), undefined)
})
