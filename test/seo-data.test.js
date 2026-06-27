const test = require('node:test')
const assert = require('node:assert/strict')

test('seo data helpers build a page title and website schema', async () => {
  const { default: seoData } = await import('../src/utils/seo-data.js')

  assert.equal(
    seoData.buildPageTitle('Blog', "Aaron Russell's Development Blog"),
    "Blog | Aaron Russell's Development Blog"
  )
  assert.deepEqual(
    seoData.buildWebsiteJsonLd({
      title: "Aaron Russell's Development Blog",
      siteUrl: 'https://aaron-russell.co.uk',
    }),
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "Aaron Russell's Development Blog",
      url: 'https://aaron-russell.co.uk',
    }
  )
})

test('seo data helpers produce stable metadata for social and canonical tags', async () => {
  const { default: seoData } = await import('../src/utils/seo-data.js')
  const tags = seoData.buildSeoMetaTags({
    canonical: 'https://aaron-russell.co.uk/blog',
    description: 'Fresh writing about web development',
    image: 'https://aaron-russell.co.uk/og.png',
    imageAlt: 'A cover image',
    imageHeight: 630,
    imageType: 'image/png',
    imageWidth: 1200,
    siteMetadata: {
      title: "Aaron Russell's Development Blog",
      description: 'Default description',
      social: {
        twitter: '@aaron',
      },
    },
    title: 'Blog',
    type: 'article',
  })

  assert.ok(
    tags.some(
      (tag) =>
        tag.property === 'og:url' &&
        tag.content === 'https://aaron-russell.co.uk/blog'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.name === 'twitter:image:alt' && tag.content === 'A cover image'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.property === 'og:type' && tag.content === 'article'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.property === 'og:image:width' && tag.content === '1200'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.property === 'og:image:height' && tag.content === '630'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.property === 'og:image:type' && tag.content === 'image/png'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.name === 'twitter:image:type' && tag.content === 'image/png'
    )
  )
})
