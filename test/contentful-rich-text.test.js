const test = require('node:test')
const assert = require('node:assert/strict')

test('code block helpers normalize entries and parse highlighted lines', async () => {
  const { default: codeBlocks } = await import('../src/lib/code-blocks.ts')

  const entry = {
    sys: {
      contentType: {
        sys: {
          id: 'codeBlock',
        },
      },
    },
    fields: {
      code: 'const answer = 42',
      diffMode: 'diff-add',
      filename: 'answer.ts',
      highlightedLines: '1,3-4',
      language: 'ts',
      showLineNumbers: true,
      internalName: 'Answer snippet',
    },
  }

  assert.deepEqual(codeBlocks.normalizeCodeBlockEntry(entry), {
    code: 'const answer = 42',
    diffMode: 'diff-add',
    filename: 'answer.ts',
    highlightedLines: '1,3-4',
    language: 'ts',
    showLineNumbers: true,
    title: 'Answer snippet',
  })
  assert.deepEqual(
    [...codeBlocks.parseHighlightedLines('1,3-4')],
    [1, 3, 4]
  )
  assert.deepEqual(
    [...codeBlocks.parseHighlightedLines('nope')],
    []
  )
})

test('rich text renderer outputs structured highlighted code blocks and plain text', async () => {
  const { default: richText } = await import('../src/lib/contentful-rich-text.ts')

  const document = {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'Before code',
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: 'embedded-entry-block',
        data: {
          target: {
            sys: {
              contentType: {
                sys: {
                  id: 'codeBlock',
                },
              },
            },
            fields: {
              code: 'const answer = 42\nconsole.log(answer)',
              diffMode: 'none',
              filename: 'example.ts',
              highlightedLines: '2',
              language: 'ts',
              showLineNumbers: true,
              internalName: 'Example snippet',
            },
          },
        },
        content: [],
      },
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'After code',
            marks: [
              {
                type: 'code',
              },
            ],
            data: {},
          },
        ],
      },
    ],
  }

  const html = await richText.renderRichText(document)
  const text = richText.richTextToPlainText(document)

  assert.match(html, /<figure class="code-block"/)
  assert.match(html, /code-block__filename/)
  assert.match(html, /data-line="2"/)
  assert.match(html, /code-block__line--highlighted/)
  assert.match(html, /language-typescript|data-language="typescript"/)
  assert.match(html, /<code><span class="line code-block__line/s)
  assert.match(text, /Before code/)
  assert.match(text, /const answer = 42/)
  assert.match(text, /After code/)
})

test('rich text renderer falls back safely for unsupported languages', async () => {
  const { default: richText } = await import('../src/lib/contentful-rich-text.ts')

  const document = {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'embedded-entry-block',
        data: {
          target: {
            sys: {
              contentType: {
                sys: {
                  id: 'codeBlock',
                },
              },
            },
            fields: {
              code: '<section>Hello</section>',
              diffMode: 'none',
              language: 'unsupported-lang',
              showLineNumbers: false,
            },
          },
        },
        content: [],
      },
    ],
  }

  const html = await richText.renderRichText(document)

  assert.match(html, /&lt;section&gt;Hello&lt;\/section&gt;/)
  assert.match(html, /data-language="unsupported-lang"/)
})

test('rich text renderer emits responsive picture markup for embedded assets', async () => {
  const { default: richText } = await import('../src/lib/contentful-rich-text.ts')

  const document = {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'embedded-asset-block',
        data: {
          target: {
            fields: {
              description: 'Embedded example',
              file: {
                url: '//images.ctfassets.net/demo/embedded.jpg',
                details: {
                  image: {
                    width: 1600,
                    height: 900,
                  },
                },
              },
              title: 'Embedded example',
            },
          },
        },
        content: [],
      },
    ],
  }

  const html = await richText.renderRichText(document)

  assert.match(html, /<picture>/)
  assert.match(html, /<source type="image\/avif"/)
  assert.match(html, /<source type="image\/webp"/)
  assert.match(html, /loading="lazy"/)
  assert.match(html, /width="1280"/)
  assert.match(html, /height="720"/)
  assert.match(html, /alt="Embedded example"/)
})
