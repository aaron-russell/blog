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
        CLOUDFLARE_ACCOUNT_ID: 'account-id',
        CLOUDFLARE_EMAIL_API_TOKEN: 'token',
        CONTACT_FROM_EMAIL: 'contact@aaron-russell.co.uk',
        CONTACT_FROM_NAME: 'Aaron Russell',
        CONTACT_TO_EMAIL: 'aaron@russell-tech.co.uk',
        NAMESPACE: namespace,
        SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
        TURNSTILE_SECRET: 'secret',
      },
      request: new Request('https://aaron-russell.co.uk/api/contact', {
        headers: {
          Accept: 'application/json',
          Origin: 'https://aaron-russell.co.uk',
        },
        method: 'POST',
      }),
      ...overrides.context,
    },
  }
}

const createFormData = ({
  email = 'aaron@example.com',
  honeypot = '',
  message = 'This is a valid contact request with enough detail to pass validation.',
  name = 'Aaron Russell',
  startedAt = new Date(Date.now() - 5_000).toISOString(),
  subject = 'Project enquiry',
  token = 'turnstile-token',
} = {}) => {
  const formData = new FormData()
  formData.set('name', name)
  formData.set('email', email)
  formData.set('subject', subject)
  formData.set('message', message)
  formData.set('website', honeypot)
  formData.set('startedAt', startedAt)
  formData.set('pageUrl', 'https://aaron-russell.co.uk/contact/')
  if (token !== null) {
    formData.set('cf-turnstile-response', token)
  }
  return formData
}

test('contact api returns success json when validation, turnstile, and email delivery pass', async () => {
  const { default: contactApi } = await import('../functions/api/contact.ts')
  const { handleContactApiRequest } = contactApi
  const originalFetch = global.fetch
  global.fetch = async (url) => {
    if (String(url).includes('turnstile')) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, result: { delivered: ['aaron@russell-tech.co.uk'] } }), {
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const { context, puts } = createContext({
      context: {
        request: new Request('https://aaron-russell.co.uk/api/contact', {
          body: createFormData(),
          headers: {
            Accept: 'application/json',
            Origin: 'https://aaron-russell.co.uk',
          },
          method: 'POST',
        }),
      },
    })

    const response = await handleContactApiRequest(context)
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.ok, true)
    assert.equal(puts.length, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test('contact api redirects html form submissions back to /contact on success', async () => {
  const { default: contactApi } = await import('../functions/api/contact.ts')
  const { handleContactApiRequest } = contactApi
  const originalFetch = global.fetch
  global.fetch = async (url) => {
    if (String(url).includes('turnstile')) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, result: { delivered: ['aaron@russell-tech.co.uk'] } }), {
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const { context } = createContext({
      context: {
        request: new Request('https://aaron-russell.co.uk/api/contact', {
          body: createFormData(),
          headers: {
            Accept: 'text/html',
            Origin: 'https://aaron-russell.co.uk',
          },
          method: 'POST',
        }),
      },
    })

    const response = await handleContactApiRequest(context)

    assert.equal(response.status, 303)
    assert.equal(
      response.headers.get('location'),
      'https://aaron-russell.co.uk/contact?submitted=success'
    )
  } finally {
    global.fetch = originalFetch
  }
})

test('contact api rejects malformed submissions before calling remote services', async () => {
  const { default: contactApi } = await import('../functions/api/contact.ts')
  const { handleContactApiRequest } = contactApi
  const { context, puts } = createContext({
    context: {
      request: new Request('https://aaron-russell.co.uk/api/contact', {
        body: createFormData({ message: 'short', token: null }),
        headers: {
          Accept: 'application/json',
          Origin: 'https://aaron-russell.co.uk',
        },
        method: 'POST',
      }),
    },
  })
  const response = await handleContactApiRequest(context)
  const payload = await response.json()

  assert.equal(response.status, 400)
  assert.equal(payload.ok, false)
  assert.equal(typeof payload.fieldErrors.message, 'string')
  assert.equal(puts.length, 0)
})

test('contact api rate limits repeated submissions', async () => {
  const { default: contactApi } = await import('../functions/api/contact.ts')
  const { handleContactApiRequest } = contactApi
  const { context, puts } = createContext({
    context: {
      request: new Request('https://aaron-russell.co.uk/api/contact', {
        body: createFormData(),
        headers: {
          Accept: 'application/json',
          Origin: 'https://aaron-russell.co.uk',
        },
        method: 'POST',
      }),
    },
    namespace: {
      get: async () => 'already-submitted',
    },
  })
  const response = await handleContactApiRequest(context)
  const payload = await response.json()

  assert.equal(response.status, 429)
  assert.equal(payload.message, 'Please wait a few minutes before sending another message.')
  assert.equal(puts.length, 0)
})

test('contact api handles failed turnstile verification', async () => {
  const { default: contactApi } = await import('../functions/api/contact.ts')
  const { handleContactApiRequest } = contactApi
  const originalFetch = global.fetch
  global.fetch = async () =>
    new Response(JSON.stringify({ success: false }), {
      headers: { 'content-type': 'application/json' },
    })

  try {
    const { context } = createContext({
      context: {
        request: new Request('https://aaron-russell.co.uk/api/contact', {
          body: createFormData(),
          headers: {
            Accept: 'application/json',
            Origin: 'https://aaron-russell.co.uk',
          },
          method: 'POST',
        }),
      },
    })

    const response = await handleContactApiRequest(context)
    const payload = await response.json()

    assert.equal(response.status, 400)
    assert.equal(payload.message, 'Please complete the spam check before sending your message.')
  } finally {
    global.fetch = originalFetch
  }
})

test('contact api rejects unsupported methods', async () => {
  const { default: contactApi } = await import('../functions/api/contact.ts')
  const { handleContactApiRequest } = contactApi
  const { context } = createContext({
    context: {
      request: new Request('https://aaron-russell.co.uk/api/contact', {
        headers: {
          Accept: 'application/json',
          Origin: 'https://aaron-russell.co.uk',
        },
        method: 'GET',
      }),
    },
  })

  const response = await handleContactApiRequest(context)
  const payload = await response.json()

  assert.equal(response.status, 405)
  assert.equal(payload.message, 'This endpoint only accepts POST requests.')
})
