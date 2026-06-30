const test = require('node:test')
const assert = require('node:assert/strict')

const createContext = (overrides = {}) => {
  const puts = []
  const namespace = {
    get: async () => null,
    put: async (...args) => {
      puts.push(args)
    },
    ...overrides.namespace,
  }

  return {
    puts,
    context: {
      env: {
        NAMESPACE: namespace,
        SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
        TURNSTILE_SECRET: 'secret',
      },
      request: new Request('https://aaron-russell.co.uk/contact', {
        method: 'POST',
      }),
      ...overrides.context,
    },
  }
}

const createFormData = ({
  name = 'Aaron Russell',
  email = 'aaron@example.com',
  message = 'This is a valid contact request.',
  honeypot = '',
  token = 'turnstile-token',
} = {}) => {
  const formData = new FormData()
  formData.set('name', name)
  formData.set('email', email)
  formData.set('message', message)
  formData.set('company', honeypot)
  if (token !== null) {
    formData.set('cf-turnstile-response', token)
  }
  return formData
}

test('contact middleware redirects with success when validation and turnstile pass', async () => {
  const { default: middleware } = await import('../functions/_middleware.ts')
  const { handleContactFormSubmission } = middleware
  const originalFetch = global.fetch
  global.fetch = async () =>
    new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' },
    })

  try {
    const { context, puts } = createContext()
    const response = await handleContactFormSubmission(context, createFormData())

    assert.equal(response.status, 303)
    assert.equal(
      response.headers.get('location'),
      'https://aaron-russell.co.uk/contact?submitted=success'
    )
    assert.equal(puts.length, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test('contact middleware rejects malformed submissions before calling turnstile', async () => {
  const { default: middleware } = await import('../functions/_middleware.ts')
  const { handleContactFormSubmission } = middleware
  const { context, puts } = createContext()
  const response = await handleContactFormSubmission(
    context,
    createFormData({ message: 'short', token: null })
  )

  assert.equal(response.status, 303)
  assert.equal(
    response.headers.get('location'),
    'https://aaron-russell.co.uk/contact?error=invalid'
  )
  assert.equal(puts.length, 0)
})

test('contact middleware rate limits repeated submissions', async () => {
  const { default: middleware } = await import('../functions/_middleware.ts')
  const { handleContactFormSubmission } = middleware
  const { context, puts } = createContext({
    namespace: {
      get: async () => 'already-submitted',
    },
  })
  const response = await handleContactFormSubmission(context, createFormData())

  assert.equal(response.status, 303)
  assert.equal(
    response.headers.get('location'),
    'https://aaron-russell.co.uk/contact?error=rate_limited'
  )
  assert.equal(puts.length, 0)
})

test('contact middleware handles failed turnstile verification', async () => {
  const { default: middleware } = await import('../functions/_middleware.ts')
  const { handleContactFormSubmission } = middleware
  const originalFetch = global.fetch
  global.fetch = async () =>
    new Response(JSON.stringify({ success: false }), {
      headers: { 'content-type': 'application/json' },
    })

  try {
    const { context } = createContext()
    const response = await handleContactFormSubmission(context, createFormData())

    assert.equal(response.status, 303)
    assert.equal(
      response.headers.get('location'),
      'https://aaron-russell.co.uk/contact?error=verification'
    )
  } finally {
    global.fetch = originalFetch
  }
})

test('discovery middleware converts html responses to markdown when requested', async () => {
  const { default: middleware } = await import('../functions/_middleware.ts')
  const { addDiscoveryHeaders } = middleware

  const response = await addDiscoveryHeaders(
    new Response('<main><h1>Hello</h1><p>This is a test.</p></main>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }),
    new Request('https://aaron-russell.co.uk/', {
      headers: { accept: 'text/markdown' },
    })
  )

  const body = await response.text()

  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  assert.equal(response.headers.get('x-markdown-version'), '1.0')
  assert.equal(response.headers.get('x-markdown-from-html'), 'true')
  assert.match(response.headers.get('vary') || '', /Accept/)
  assert.match(response.headers.get('x-markdown-tokens') || '', /^[0-9]+$/)
  assert.match(body, /# Hello/)
})

test('discovery middleware applies the security headers on non-homepage routes', async () => {
  const middlewareModule = await import('../functions/_middleware.ts')
  const {
    addDiscoveryHeaders,
    CONTENT_SECURITY_POLICY,
    PERMISSIONS_POLICY,
  } = middlewareModule

  const response = await addDiscoveryHeaders(
    new Response('<h1>Contact</h1>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }),
    new Request('https://aaron-russell.co.uk/contact/')
  )

  assert.equal(response.headers.get('content-security-policy'), CONTENT_SECURITY_POLICY)
  assert.equal(response.headers.get('permissions-policy'), PERMISSIONS_POLICY)
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
  assert.equal(
    response.headers.get('strict-transport-security'),
    'max-age=31536000; includeSubDomains; preload'
  )
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-frame-options'), 'DENY')
})
