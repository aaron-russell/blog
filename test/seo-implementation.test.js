const test = require('node:test')
const assert = require('node:assert/strict')
const { readFile } = require('node:fs/promises')
const path = require('node:path')

test('article cards keep implementation details outside title anchors', async () => {
  const source = await readFile(
    path.join(__dirname, '../src/components/ArticlePreview.astro'),
    'utf8'
  )

  assert.match(source, /<h2[^>]*>[\s\S]*?<a[^>]*>\{post\.title\}<\/a>[\s\S]*?<\/h2>/)
  assert.equal((source.match(/href=\{`\/blog\/\$\{post\.slug\}\//g) || []).length, 1)
  assert.match(source, /<ResponsiveImage[\s\S]*?alt=""/)
})

test('core pages declare the requested document titles', async () => {
  const pages = await Promise.all(
    ['index.astro', 'blog/index.astro', 'about.astro', 'contact.astro'].map((pagePath) =>
      readFile(path.join(__dirname, `../src/pages/${pagePath}`), 'utf8')
    )
  )

  assert.match(pages[0], /Aaron Russell – Software Engineering, AI Workflows & Static Web Notes/)
  assert.match(pages[1], /Blog – Aaron Russell/)
  assert.match(pages[2], /About Aaron Russell – Developer in Leeds, UK/)
  assert.match(pages[3], /Contact Aaron Russell/)
})
