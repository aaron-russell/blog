const test = require('node:test')
const assert = require('node:assert/strict')
const { existsSync, readFileSync } = require('node:fs')
const path = require('node:path')

test('new developer-site routes have source pages and canonical sitemap entries', () => {
  const routes = [
    ['projects', 'src/pages/projects/index.astro', '/projects/'],
    ['pit crew', 'src/pages/projects/pit-crew.astro', '/projects/pit-crew/'],
    ['now', 'src/pages/now.astro', '/now/'],
    ['uses', 'src/pages/uses.astro', '/uses/'],
  ]
  const sitemap = readFileSync(path.join(__dirname, '..', 'src/pages/sitemap.xml.ts'), 'utf8')

  for (const [name, source, route] of routes) {
    assert.equal(existsSync(path.join(__dirname, '..', source)), true, `${name} page should exist`)
    assert.match(sitemap, new RegExp(route.replaceAll('/', '\\/')))
  }
})

test('project and start-here content only uses internal routes or secure external links', async () => {
  const config = await import('../src/lib/site-config.ts')
  const projects = config.projects || config.default?.projects
  const startHere = config.startHere || config.default?.startHere

  assert.ok(projects.length >= 2)
  assert.ok(projects.some((project) => project.name === 'Pit Crew'))

  for (const project of projects) {
    assert.match(project.href, /^\//)
    if (project.externalUrl) assert.match(project.externalUrl, /^https:\/\//)
  }

  for (const item of startHere) assert.match(item.fallbackHref, /^\//)
})

test('content links resolve real posts and leave missing matches undefined', async () => {
  const links = await import('../src/lib/content-links.ts')
  const findPostByTerms = links.findPostByTerms || links.default?.findPostByTerms
  const posts = [
    { title: 'Building Pit Crew', slug: 'building-pit-crew', tags: ['Angular'] },
    { title: 'A Cloudflare note', slug: 'cloudflare-note', tags: ['Cloudflare'] },
  ]

  assert.equal(findPostByTerms(posts, ['pit crew']).slug, 'building-pit-crew')
  assert.equal(findPostByTerms(posts, ['does not exist']), undefined)
})
