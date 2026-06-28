const test = require('node:test')
const assert = require('node:assert/strict')

test('contentful seo fixes normalize tags and canonical urls', async () => {
  const { default: seoFixes } = await import('../src/lib/contentful-seo-fixes.js')
  const result = seoFixes.getSeoFixesForBlogPost({
    entry: {
      sys: { id: 'entry-1' },
      fields: {
        title: { 'en-US': 'Example post' },
        slug: { 'en-US': 'example-post' },
        canonical: { 'en-US': 'https://aaron-russell.co.uk/blog/example-post' },
        tags: { 'en-US': ['Web development', 'Quesrions', 'pagespeed'] },
      },
    },
  })

  assert.equal(result.changed, true)
  assert.equal(
    result.nextFields.canonical['en-US'],
    'https://aaron-russell.co.uk/blog/example-post/'
  )
  assert.deepEqual(result.nextFields.tags['en-US'], [
    'Web Development',
    'Questions',
    'PageSpeed',
  ])
})

test('contentful seo fixes remove repeated description paragraphs', async () => {
  const { default: seoFixes } = await import('../src/lib/contentful-seo-fixes.js')
  const repeatedParagraph = {
    nodeType: 'paragraph',
    data: {},
    content: [
      {
        nodeType: 'text',
        value: 'Agile helps teams deliver value faster.',
        marks: [],
        data: {},
      },
    ],
  }

  const result = seoFixes.getSeoFixesForBlogPost({
    entry: {
      sys: { id: 'entry-2' },
      fields: {
        title: { 'en-US': 'Agile post' },
        slug: { 'en-US': 'agile-post' },
        description: {
          'en-US': {
            nodeType: 'document',
            data: {},
            content: [repeatedParagraph, repeatedParagraph],
          },
        },
      },
    },
  })

  assert.equal(result.changed, true)
  assert.equal(result.nextFields.description['en-US'].content.length, 1)
})

test('contentful seo fixes remove duplicated text inside one rich text paragraph', async () => {
  const { default: seoFixes } = await import('../src/lib/contentful-seo-fixes.js')
  const doubledSentence =
    'Agile software development helps teams deliver better software faster.'

  const result = seoFixes.getSeoFixesForBlogPost({
    entry: {
      sys: { id: 'entry-3' },
      fields: {
        title: { 'en-US': 'Agile post' },
        slug: { 'en-US': 'agile-post' },
        description: {
          'en-US': {
            nodeType: 'document',
            data: {},
            content: [
              {
                nodeType: 'paragraph',
                data: {},
                content: [
                  {
                    nodeType: 'text',
                    value: `${doubledSentence}${doubledSentence}`,
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
      },
    },
  })

  assert.equal(result.changed, true)
  assert.equal(
    result.nextFields.description['en-US'].content[0].content[0].value,
    doubledSentence
  )
})
