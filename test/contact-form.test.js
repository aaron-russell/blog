const test = require('node:test')
const assert = require('node:assert/strict')

test('contact form helpers validate and sanitize expected input', async () => {
  const { default: contactForm } = await import('../functions/contact-form.ts')
  const formData = new FormData()
  formData.set('name', '  Aaron Russell  ')
  formData.set('email', ' aaron@example.com ')
  formData.set('message', '  This is a valid contact message.  ')

  const fields = contactForm.sanitizeContactFields(formData)

  assert.deepEqual(fields, {
    name: 'Aaron Russell',
    email: 'aaron@example.com',
    message: 'This is a valid contact message.',
    honeypot: '',
  })
  assert.equal(contactForm.validateContactSubmission(fields), 'ok')
  assert.match(
    contactForm.buildRedirectUrl('https://aaron-russell.co.uk/blog', {
      error: 'verification',
    }),
    /\/contact\?error=verification$/
  )
})

test('contact form helpers reject honeypots and malformed submissions', async () => {
  const { default: contactForm } = await import('../functions/contact-form.ts')

  assert.equal(
    contactForm.validateContactSubmission({
      name: 'Aaron',
      email: 'aaron@example.com',
      message: 'hello there',
      honeypot: 'bot',
    }),
    'blocked'
  )

  assert.equal(
    contactForm.validateContactSubmission({
      name: 'A',
      email: 'not-an-email',
      message: 'short',
      honeypot: '',
    }),
    'invalid'
  )
})
