const test = require('node:test')
const assert = require('node:assert/strict')

test('contentful image helpers normalize urls and build social images', async () => {
  const { buildContentfulSocialImageUrl, normalizeContentfulUrl } = await import(
    '../src/lib/contentful-images.ts'
  )

  assert.equal(
    normalizeContentfulUrl('//images.ctfassets.net/example.jpg'),
    'https://images.ctfassets.net/example.jpg'
  )

  const socialImage = buildContentfulSocialImageUrl('//images.ctfassets.net/example.jpg')

  assert.match(socialImage, /^https:\/\/images\.ctfassets\.net\/example\.jpg\?/)
  assert.match(socialImage, /fit=fill/)
  assert.match(socialImage, /fm=jpg/)
  assert.match(socialImage, /fl=progressive/)
  assert.match(socialImage, /h=630/)
  assert.match(socialImage, /w=1200/)
})

test('contentful image helpers clamp widths and emit modern responsive sources', async () => {
  const { buildResponsiveContentfulImage, clampContentfulWidths } = await import(
    '../src/lib/contentful-images.ts'
  )

  const image = {
    description: 'Example image',
    height: 1200,
    title: 'Example title',
    url: 'https://images.ctfassets.net/demo/example.jpg',
    width: 1800,
  }

  assert.deepEqual(clampContentfulWidths(image, [320, 640, 2400]), [320, 640, 1800])

  const responsiveImage = buildResponsiveContentfulImage(image, {
    fallbackFormat: 'jpg',
    formats: ['avif', 'webp'],
    transform: {
      fit: 'fill',
      h: 240,
      q: 72,
      w: 424,
    },
    widths: [320, 424, 848],
  })

  assert.equal(responsiveImage.fallbackWidth, 848)
  assert.equal(responsiveImage.fallbackHeight, 480)
  assert.match(responsiveImage.fallbackSrc, /fm=jpg/)
  assert.match(responsiveImage.fallbackSrc, /fl=progressive/)
  assert.match(responsiveImage.fallbackSrcSet, /320w/)
  assert.equal(responsiveImage.sources.length, 2)
  assert.equal(responsiveImage.sources[0].type, 'image/avif')
  assert.match(responsiveImage.sources[0].srcSet, /fm=avif/)
  assert.equal(responsiveImage.sources[1].type, 'image/webp')
  assert.match(responsiveImage.sources[1].srcSet, /fm=webp/)
})
