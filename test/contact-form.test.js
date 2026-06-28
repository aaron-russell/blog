const test = require('node:test')
const assert = require('node:assert/strict')

test('contact form helpers sanitize expected input and build redirect urls', async () => {
  const { default: contactForm } = await import('../functions/contact-form.ts')
  const formData = new FormData()
  formData.set('name', '  Aaron Russell  ')
  formData.set('email', ' aaron@example.com ')
  formData.set('subject', '  Project help ')
  formData.set('message', '  This is a valid contact message with enough detail.  ')
  formData.set('startedAt', new Date(Date.now() - 5_000).toISOString())
  formData.set('pageUrl', ' https://aaron-russell.co.uk/contact/ ')

  const fields = contactForm.sanitizeContactFields(formData)

  assert.deepEqual(fields, {
    email: 'aaron@example.com',
    honeypot: '',
    message: 'This is a valid contact message with enough detail.',
    name: 'Aaron Russell',
    pageUrl: 'https://aaron-russell.co.uk/contact/',
    startedAt: fields.startedAt,
    subject: 'Project help',
    turnstileToken: '',
  })

  assert.deepEqual(contactForm.validateContactSubmission(fields), {
    fieldErrors: {},
    status: 'ok',
  })

  assert.match(
    contactForm.buildRedirectUrl('https://aaron-russell.co.uk/blog', {
      error: 'verification',
    }),
    /\/contact\?error=verification$/
  )
})

test('contact form helpers reject malformed, suspicious, and honeypot submissions', async () => {
  const { default: contactForm } = await import('../functions/contact-form.ts')

  assert.deepEqual(
    contactForm.validateContactSubmission({
      email: 'aaron@example.com',
      honeypot: 'bot',
      message: 'This is a valid message that should be blocked by the honeypot.',
      name: 'Aaron',
      pageUrl: 'https://aaron-russell.co.uk/contact/',
      startedAt: new Date(Date.now() - 5_000).toISOString(),
      subject: 'Project help',
      turnstileToken: 'token',
    }),
    {
      fieldErrors: {},
      status: 'blocked',
    }
  )

  const invalid = contactForm.validateContactSubmission({
    email: 'not-an-email',
    honeypot: '',
    message: 'short',
    name: 'A',
    pageUrl: 'https://aaron-russell.co.uk/contact/',
    startedAt: new Date(Date.now() - 5_000).toISOString(),
    subject: 'Hi',
    turnstileToken: '',
  })

  assert.equal(invalid.status, 'invalid')
  assert.equal(typeof invalid.fieldErrors.email, 'string')
  assert.equal(typeof invalid.fieldErrors.message, 'string')
  assert.equal(typeof invalid.fieldErrors.name, 'string')
  assert.equal(typeof invalid.fieldErrors.subject, 'string')

  assert.deepEqual(
    contactForm.validateContactSubmission(
      {
        email: 'aaron@example.com',
        honeypot: '',
        message: 'Check out https://spam.example and buy now from my seo service.',
        name: 'Aaron',
        pageUrl: 'https://aaron-russell.co.uk/contact/',
        startedAt: new Date(Date.now() - 5_000).toISOString(),
        subject: 'Useful opportunity',
        turnstileToken: 'token',
      },
      { requireTurnstile: true }
    ),
    {
      fieldErrors: {},
      status: 'blocked',
    }
  )
})
