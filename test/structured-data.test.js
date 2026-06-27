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
  assert.equal(person.image, 'https://aaron-russell.co.uk/profile.png')
  assert.equal(post['@type'], 'BlogPosting')
  assert.equal(post.image, 'https://aaron-russell.co.uk/images/testing.png')
  assert.equal(
    post.mainEntityOfPage,
    'https://aaron-russell.co.uk/blog/testing-gatsby/'
  )
})
