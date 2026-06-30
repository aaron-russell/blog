const test = require('node:test')
const assert = require('node:assert/strict')

test('htmlToRichText converts headings, links, lists, and tables', async () => {
  const { htmlToRichText } = await import('../src/lib/contentful-html-to-rich-text.js')

  const richText = htmlToRichText(`
    <h2>Example</h2>
    <p>Read the <a href="/blog/pagespeed-insights/"><strong>guide</strong></a>.</p>
    <ul><li>One</li><li>Two</li></ul>
    <div class="table-scroll">
      <table>
        <thead><tr><th>Feature</th><th>Value</th></tr></thead>
        <tbody><tr><td>INP</td><td>Current</td></tr></tbody>
      </table>
    </div>
  `)

  assert.equal(richText.nodeType, 'document')
  assert.equal(richText.content[0].nodeType, 'heading-2')
  assert.equal(richText.content[1].nodeType, 'paragraph')
  assert.equal(richText.content[2].nodeType, 'unordered-list')
  assert.equal(richText.content[3].nodeType, 'table')
  assert.equal(richText.content[1].content[1].nodeType, 'hyperlink')
  assert.equal(richText.content[3].content[0].content[0].nodeType, 'table-header-cell')
})
