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
  assert.match(response.headers.get('vary') || '', /Accept/)
})

test('api catalog publishes the exact public discovery links', async () => {
  const body = JSON.parse(await readStatic('.well-known/api-catalog'))
  const linksetEntry = body.linkset[0]

  assert.equal(linksetEntry.anchor, 'https://aaron-russell.co.uk')
  assert.ok(linksetEntry['service-meta'].some((link) => link.href.endsWith('/auth.md')))
  assert.ok(linksetEntry['service-desc'].some((link) => link.href.endsWith('/openapi.json')))
  assert.ok(linksetEntry.status.some((link) => link.href.endsWith('/status.json')))
  assert.ok(linksetEntry['service-doc'].some((link) => link.href === 'https://aaron-russell.co.uk/'))
})

test('auth metadata explicitly documents no-login public access', async () => {
  const authDoc = await readStatic('auth.md')

  assert.match(authDoc, /^# Auth\.md/m)
  assert.match(authDoc, /does not require a login, API key, or OAuth flow/i)
  assert.match(authDoc, /does not expose a live OAuth or OpenID Connect login flow today/i)
  assert.match(authDoc, /## Agent Registration/m)
  assert.match(authDoc, /There is no self-service OAuth client registration flow/i)
})

test('static headers include discovery links on the homepage', async () => {
  const headersFile = await readStatic('_headers')

  assert.match(headersFile, /\/\.well-known\/api-catalog/)
  assert.match(headersFile, /\/openapi\.json/)
  assert.match(headersFile, /\/status\.json/)
  assert.match(headersFile, /\/\.well-known\/mcp\/server-card\.json/)
  assert.match(headersFile, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/)
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

test('agent skills and mcp card are published at exact static paths', async () => {
  const skills = JSON.parse(await readStatic('.well-known/agent-skills/index.json'))
  const mcpCard = JSON.parse(await readStatic('.well-known/mcp/server-card.json'))

  assert.equal(skills.$schema, 'https://agentskills.io/schema/v0.2.0')
  assert.equal(skills.skills.length, 2)
  assert.ok(skills.skills.every((skill) => /^[a-f0-9]{64}$/.test(skill.sha256)))
  assert.equal(mcpCard.serverInfo.name, 'Aaron Russell Blog')
  assert.equal(mcpCard.capabilities.tools.enabled, true)
})
