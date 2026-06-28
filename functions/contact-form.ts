const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<]+/gi
const MAX_URLS_IN_MESSAGE = 3
const MIN_SECONDS_TO_SUBMIT = 3
const MAX_SECONDS_TO_SUBMIT = 60 * 60 * 24
const SUSPICIOUS_KEYWORDS = [
  'buy now',
  'casino',
  'crypto',
  'guest post',
  'payday loan',
  'seo service',
  'telegram',
  'viagra',
  'whatsapp',
]

export type ContactFields = {
  email: string
  honeypot: string
  message: string
  name: string
  pageUrl: string
  startedAt: string
  subject: string
  turnstileToken: string
}

export type ContactValidationResult = {
  fieldErrors: Partial<Record<'email' | 'message' | 'name' | 'subject', string>>
  status: 'blocked' | 'invalid' | 'ok' | 'verification'
}

export type ContactSubmission = {
  email: string
  message: string
  metadata: {
    ip: string
    pageUrl: string
    userAgent: string
  }
  name: string
  subject: string
  submittedAt: string
}

const normalizeLineEndings = (value: string) => value.replace(/\r\n/g, '\n')

const stripControlCharacters = (value: string) =>
  value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')

const sanitizeText = (value: FormDataEntryValue | null) =>
  stripControlCharacters(normalizeLineEndings(String(value || ''))).trim()

const looksSuspicious = (subject: string, message: string) => {
  const combined = `${subject}\n${message}`.toLowerCase()
  const urlMatches = combined.match(URL_PATTERN) || []
  const suspiciousKeywordHits = SUSPICIOUS_KEYWORDS.filter((keyword) =>
    combined.includes(keyword)
  ).length

  if (urlMatches.length > MAX_URLS_IN_MESSAGE) {
    return true
  }

  return suspiciousKeywordHits > 0 && urlMatches.length > 0
}

export const sanitizeContactFields = (formData: FormData): ContactFields => ({
  email: sanitizeText(formData.get('email')),
  honeypot: sanitizeText(formData.get('website')),
  message: sanitizeText(formData.get('message')),
  name: sanitizeText(formData.get('name')),
  pageUrl: sanitizeText(formData.get('pageUrl')),
  startedAt: sanitizeText(formData.get('startedAt')),
  subject: sanitizeText(formData.get('subject')),
  turnstileToken: sanitizeText(formData.get('cf-turnstile-response')),
})

export const validateContactSubmission = (
  fields: ContactFields,
  options: {
    minSecondsToSubmit?: number
    requireTurnstile?: boolean
  } = {}
): ContactValidationResult => {
  const fieldErrors: ContactValidationResult['fieldErrors'] = {}
  const minSecondsToSubmit = options.minSecondsToSubmit ?? MIN_SECONDS_TO_SUBMIT
  const requireTurnstile = options.requireTurnstile ?? false

  if (fields.honeypot) {
    return { fieldErrors, status: 'blocked' }
  }

  if (fields.name.length < 2 || fields.name.length > 120) {
    fieldErrors.name = 'Use a name between 2 and 120 characters.'
  }

  if (fields.email.length === 0 || fields.email.length > 200 || !EMAIL_PATTERN.test(fields.email)) {
    fieldErrors.email = 'Use a valid email address so I can reply.'
  }

  if (fields.subject.length < 3 || fields.subject.length > 160) {
    fieldErrors.subject = 'Use a subject between 3 and 160 characters.'
  }

  if (fields.message.length < 20 || fields.message.length > 4000) {
    fieldErrors.message = 'Use a message between 20 and 4000 characters.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, status: 'invalid' }
  }

  const startedAtMs = Date.parse(fields.startedAt)
  if (!Number.isFinite(startedAtMs)) {
    return { fieldErrors, status: 'blocked' }
  }

  const secondsToSubmit = (Date.now() - startedAtMs) / 1000
  if (secondsToSubmit < minSecondsToSubmit || secondsToSubmit > MAX_SECONDS_TO_SUBMIT) {
    return { fieldErrors, status: 'blocked' }
  }

  if (looksSuspicious(fields.subject, fields.message)) {
    return { fieldErrors, status: 'blocked' }
  }

  if (requireTurnstile && fields.turnstileToken.length === 0) {
    return { fieldErrors, status: 'verification' }
  }

  return { fieldErrors, status: 'ok' }
}

export const buildContactSubmission = (
  fields: ContactFields,
  metadata: ContactSubmission['metadata']
): ContactSubmission => ({
  email: fields.email,
  message: fields.message,
  metadata,
  name: fields.name,
  subject: fields.subject,
  submittedAt: new Date().toISOString(),
})

export const buildRedirectUrl = (
  requestUrl: string,
  params: Record<string, string>
) => {
  const redirectUrl = new URL('/contact', requestUrl)

  Object.entries(params).forEach(([key, value]) => {
    redirectUrl.searchParams.set(key, value)
  })

  return redirectUrl.toString()
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const buildContactEmailText = (submission: ContactSubmission) =>
  [
    'New contact form submission',
    '',
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Subject: ${submission.subject}`,
    `Submitted: ${submission.submittedAt}`,
    `Page: ${submission.metadata.pageUrl}`,
    `IP: ${submission.metadata.ip}`,
    `User-Agent: ${submission.metadata.userAgent}`,
    '',
    'Message:',
    submission.message,
  ].join('\n')

export const buildContactEmailHtml = (submission: ContactSubmission) => {
  const messageHtml = escapeHtml(submission.message).replaceAll('\n', '<br />')

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #18181c; line-height: 1.6;">
      <h1 style="font-size: 20px; margin-bottom: 16px;">New contact form submission</h1>
      <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(submission.subject)}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(submission.submittedAt)}</p>
      <p><strong>Page:</strong> ${escapeHtml(submission.metadata.pageUrl)}</p>
      <p><strong>IP:</strong> ${escapeHtml(submission.metadata.ip)}</p>
      <p><strong>User-Agent:</strong> ${escapeHtml(submission.metadata.userAgent)}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${messageHtml}</p>
    </div>
  `.trim()
}

export default {
  buildContactEmailHtml,
  buildContactEmailText,
  buildContactSubmission,
  buildRedirectUrl,
  sanitizeContactFields,
  validateContactSubmission,
}
