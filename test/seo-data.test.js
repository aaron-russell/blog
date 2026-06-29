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
    modifiedTime: '2026-06-29T10:00:00.000Z',
    publishedTime: '2026-06-28T10:00:00.000Z',
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
  assert.ok(
    tags.some(
      (tag) =>
        tag.name === 'twitter:creator' && tag.content === '@aaron'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.property === 'article:published_time' &&
        tag.content === '2026-06-28T10:00:00.000Z'
    )
  )
  assert.ok(
    tags.some(
      (tag) =>
        tag.property === 'article:modified_time' &&
        tag.content === '2026-06-29T10:00:00.000Z'
    )
  )
})

test('seo data helpers omit empty twitter account tags', async () => {
  const { default: seoData } = await import('../src/utils/seo-data.js')
  const tags = seoData.buildSeoMetaTags({
    description: 'Fresh writing about web development',
    siteMetadata: {
      title: "Aaron Russell's Development Blog",
      description: 'Default description',
      social: {
        twitter: '',
      },
    },
  })

  assert.equal(tags.some((tag) => tag.name === 'twitter:creator'), false)
  assert.equal(tags.some((tag) => tag.name === 'twitter:site'), false)
})

test('meta descriptions are deduplicated and shortened at a word boundary', async () => {
  const { default: seoData } = await import('../src/utils/seo-data.js')
  const repeated = 'A practical engineering note. A practical engineering note.'
  const long = Array.from({ length: 40 }, (_, index) => `engineering${index}`).join(' ')

  assert.equal(
    seoData.normalizeMetaDescription(repeated),
    'A practical engineering note.'
  )
  assert.ok(seoData.normalizeMetaDescription(long).length <= 160)
  assert.match(seoData.normalizeMetaDescription(long), /…$/)
})

test('canonical URLs match the trailing-slash article URL served by Astro', async () => {
  const { default: seoData } = await import('../src/utils/seo-data.js')
  const values = {
    pathname: '/blog/example-article/',
    siteUrl: 'https://aaron-russell.co.uk',
  }

  assert.equal(
    seoData.resolveCanonicalUrl({
      ...values,
      canonical: 'https://aaron-russell.co.uk/blog/example-article',
    }),
    'https://aaron-russell.co.uk/blog/example-article/'
  )
  assert.equal(
    seoData.resolveCanonicalUrl(values),
    'https://aaron-russell.co.uk/blog/example-article/'
  )
  assert.equal(
    seoData.resolveCanonicalUrl({
      ...values,
      canonical: 'https://example.com/original-article',
    }),
    'https://example.com/original-article'
  )
})
