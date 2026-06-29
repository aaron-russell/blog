const test = require('node:test')
const assert = require('node:assert/strict')

test('structured data helpers build absolute URLs and social links', async () => {
  const { default: structuredData } = await import(
    '../src/utils/structured-data.js'
  )
  const author = {
    website: 'https://aaron-russell.co.uk',
    twitter: 'https://twitter.com/example',
    github: 'https://github.com/example',
    linkedIn: null,
    facebook: '',
  }

  assert.equal(
    structuredData.absoluteUrl(author.website, '/images/hero.png'),
    'https://aaron-russell.co.uk/images/hero.png'
  )
  assert.equal(
    structuredData.buildPersonSchemaId(author.website),
    'https://aaron-russell.co.uk/#person'
  )
  assert.deepEqual(structuredData.getPersonSameAs(author), [
    'https://aaron-russell.co.uk',
    'https://twitter.com/example',
    'https://github.com/example',
  ])
})

test('structured data helpers produce stable schema output', async () => {
  const { default: structuredData } = await import(
    '../src/utils/structured-data.js'
  )
  const person = structuredData.buildPersonJsonLd(
    {
      website: 'https://aaron-russell.co.uk',
      name: 'Aaron Russell',
      nationality: 'British',
      birthPlace: {
        city: 'London',
        region: 'England',
        country: 'United Kingdom',
      },
      affiliatedWith: [],
      alumniOf: [],
      description: { description: 'Developer and writer' },
      shortBio: { raw: 'Developer and writer' },
      jobTitle: 'Engineer',
      worksFor: [],
      currentLocations: [],
      twitter: '',
      github: '',
      linkedIn: '',
      facebook: '',
    },
    'https://aaron-russell.co.uk/profile.png'
  )

  const post = structuredData.buildBlogPostingJsonLd(
    {
      title: 'Testing Gatsby',
      heroImage: { resize: { src: '/images/testing.png' } },
      rawDate: '2026-06-27',
      author: {
        name: 'Aaron Russell',
        website: 'https://aaron-russell.co.uk',
      },
      tags: ['gatsby'],
      category: 'engineering',
    },
    'https://aaron-russell.co.uk/blog/testing-gatsby/',
    'https://aaron-russell.co.uk/images/testing.png'
  )

  assert.equal(person['@type'], 'Person')
  assert.equal(person['@id'], 'https://aaron-russell.co.uk/#person')
  assert.equal(person.image, 'https://aaron-russell.co.uk/profile.png')
  assert.equal(post['@type'], 'BlogPosting')
  assert.equal(post.image, 'https://aaron-russell.co.uk/images/testing.png')
  assert.equal(post.author['@id'], 'https://aaron-russell.co.uk/#person')
  assert.equal(post.author.url, 'https://aaron-russell.co.uk/about/')
  assert.equal(post.publisher['@id'], 'https://aaron-russell.co.uk/#person')
  assert.equal(
    post.mainEntityOfPage,
    'https://aaron-russell.co.uk/blog/testing-gatsby/'
  )
})

test('structured data helpers build profile and breadcrumb schema', async () => {
  const { default: structuredData } = await import('../src/utils/structured-data.js')
  const author = {
    website: 'https://aaron-russell.co.uk',
    name: 'Aaron Russell',
    description: { description: 'Developer and writer' },
  }

  const profile = structuredData.buildProfilePageJsonLd(
    author,
    'https://aaron-russell.co.uk/profile.png'
  )
  const breadcrumb = structuredData.buildBreadcrumbListJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog/' },
      { name: 'Article', path: '/blog/article/' },
    ],
    author.website
  )

  assert.equal(profile['@type'], 'ProfilePage')
  assert.equal(profile.url, 'https://aaron-russell.co.uk/about/')
  assert.equal(profile.mainEntity['@id'], 'https://aaron-russell.co.uk/#person')
  assert.equal(breadcrumb['@type'], 'BreadcrumbList')
  assert.equal(breadcrumb.itemListElement[2].item, 'https://aaron-russell.co.uk/blog/article/')
})

test('structured data helpers build blog schema', async () => {
  const { default: structuredData } = await import('../src/utils/structured-data.js')
  const blog = structuredData.buildBlogJsonLd({
    author: {
      website: 'https://aaron-russell.co.uk',
      name: 'Aaron Russell',
    },
    description: 'Engineering notes and implementation details.',
    name: 'Aaron Russell blog',
    url: 'https://aaron-russell.co.uk/blog/',
  })

  assert.equal(blog['@type'], 'Blog')
  assert.equal(blog.author['@id'], 'https://aaron-russell.co.uk/#person')
  assert.equal(blog.publisher.url, 'https://aaron-russell.co.uk/about/')
})

test('structured data helpers describe projects and project collections', async () => {
  const { default: structuredData } = await import('../src/utils/structured-data.js')
  const collection = structuredData.buildCollectionPageJsonLd({
    description: 'Selected products and experiments.',
    name: 'Projects',
    url: 'https://aaron-russell.co.uk/projects/',
  })
  const project = structuredData.buildSoftwareApplicationJsonLd({
    description: 'Fantasy motorsport leagues.',
    name: 'Pit Crew',
    url: 'https://pitcrew.team/en/',
  })

  assert.equal(collection['@type'], 'CollectionPage')
  assert.equal(project['@type'], 'SoftwareApplication')
  assert.equal(project.operatingSystem, 'Web')
  assert.equal(project.offers.price, '0')
})
