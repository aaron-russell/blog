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

test('static headers apply the site-wide security policy', async () => {
  const headersFile = await readStatic('_headers')

  assert.match(headersFile, /^\/\*/m)
  assert.match(headersFile, /Strict-Transport-Security: max-age=31536000; includeSubDomains; preload/)
  assert.match(headersFile, /X-Frame-Options: DENY/)
  assert.match(headersFile, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/)
  assert.match(headersFile, /upgrade-insecure-requests/)
})

test('static headers allow the Cloudflare features enabled on the live site', async () => {
  const headersFile = await readStatic('_headers')

  assert.match(headersFile, /script-src[^;\n]*https:\/\/static\.cloudflareinsights\.com/)
  assert.match(headersFile, /connect-src[^;\n]*https:\/\/cloudflareinsights\.com/)
})

test('astro-owned scripts opt out of Rocket Loader rewrites', async () => {
  const analytics = await readFile(path.join(__dirname, '..', 'src', 'components', 'Analytics.astro'), 'utf8')
  const baseLayout = await readFile(path.join(__dirname, '..', 'src', 'layouts', 'BaseLayout.astro'), 'utf8')
  const seoHead = await readFile(path.join(__dirname, '..', 'src', 'components', 'SeoHead.astro'), 'utf8')

  assert.match(baseLayout, /<script is:inline data-cfasync="false">/)
  assert.match(analytics, /<script>/)
  assert.match(baseLayout, /<script>\s*\/\/ Initialize WebMCP/)
  assert.match(baseLayout, /if \('modelContext' in navigator\)/)
  assert.match(seoHead, /rel="preload"/)
  assert.match(seoHead, /href="\/fonts\/Inter-roman\.var\.woff2\?v=3\.19"/)
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

test('robots and llms files publish explicit AI crawler guidance', async () => {
  const robots = await readStatic('robots.txt')
  const llms = await readStatic('llms.txt')

  assert.match(robots, /User-agent: GPTBot[\s\S]*Allow: \//)
  assert.match(robots, /User-agent: ChatGPT-User[\s\S]*Allow: \//)
  assert.match(robots, /User-agent: ClaudeBot[\s\S]*Allow: \//)
  assert.match(robots, /User-agent: PerplexityBot[\s\S]*Allow: \//)
  assert.match(llms, /^# Aaron Russell/m)
  assert.match(llms, /Prefer canonical URLs under `https:\/\/aaron-russell\.co\.uk\/`\./)
  assert.match(llms, /cite the original article URL/i)
})
