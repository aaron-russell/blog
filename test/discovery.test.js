const test = require('node:test')
const assert = require('node:assert/strict')
const { readFile } = require('node:fs/promises')
const path = require('node:path')

const readStatic = (relativePath) => readFile(path.join(__dirname, '..', 'static', relativePath), 'utf8')

test('discovery middleware advertises the public AI-readiness endpoints', async () => {
  const middlewareModule = await import('../functions/_middleware.ts')
  const { addDiscoveryHeaders, DISCOVERY_LINKS } = middlewareModule.default

  const response = await addDiscoveryHeaders(
    new Response('<h1>Hello</h1>', {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    }),
    new Request('https://aaron-russell.co.uk/')
  )

  assert.equal(response.headers.get('link'), DISCOVERY_LINKS.join(', '))
})

test('api catalog publishes the exact public discovery links', async () => {
  const routeModule = await import('../src/pages/.well-known/api-catalog.ts')
  const response = await routeModule.default.GET()
  const body = await response.json()
  const links = body.linkset[0].links

  assert.equal(response.headers.get('content-type'), 'application/linkset+json; charset=utf-8')
  assert.ok(links.some((link) => link.rel === 'agent' && link.href.endsWith('/.well-known/agent-card.json')))
  assert.ok(
    links.some((link) => link.rel === 'agent-skills' && link.href.endsWith('/.well-known/agent-skills/index.json'))
  )
  assert.ok(
    links.some((link) => link.rel === 'mcp-server-card' && link.href.endsWith('/.well-known/mcp/server-card.json'))
  )
  assert.ok(links.some((link) => link.rel === 'service-meta' && link.href.endsWith('/auth.md')))
  assert.ok(links.some((link) => link.rel === 'service-desc' && link.href.endsWith('/openapi.json')))
  assert.ok(links.some((link) => link.rel === 'status' && link.href.endsWith('/status.json')))
})

test('auth metadata explicitly documents no-login public access', async () => {
  const authDoc = await readStatic('auth.md')

  assert.match(authDoc, /^# Auth\.md/m)
  assert.match(authDoc, /does not require a login, API key, or OAuth flow/i)
  assert.match(authDoc, /does not expose a live OAuth or OpenID Connect login flow today/i)
})

test('static headers include discovery links on the homepage', async () => {
  const headersFile = await readStatic('_headers')

  assert.match(headersFile, /\/\.well-known\/api-catalog/)
  assert.match(headersFile, /\/openapi\.json/)
  assert.match(headersFile, /\/status\.json/)
  assert.match(headersFile, /\/\.well-known\/mcp\/server-card\.json/)
})

test('openapi and status documents back the API catalog links', async () => {
  const openapi = JSON.parse(await readStatic('openapi.json'))
  const status = JSON.parse(await readStatic('status.json'))

  assert.equal(openapi.openapi, '3.1.0')
  assert.ok(openapi.paths['/.well-known/api-catalog'])
  assert.ok(openapi.paths['/.well-known/mcp/server-card.json'])
  assert.ok(openapi.paths['/status.json'])
  assert.equal(status.status, 'ok')
  assert.equal(status.public_read_access, true)
})
