const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ContactFields = {
  email: string
  honeypot: string
  message: string
  name: string
}

export type ContactSubmission = {
  email: string
  message: string
  name: string
  submittedAt: string
}

export const sanitizeContactFields = (formData: FormData): ContactFields => ({
  email: String(formData.get('email') || '').trim(),
  honeypot: String(formData.get('company') || '').trim(),
  message: String(formData.get('message') || '').trim(),
  name: String(formData.get('name') || '').trim(),
})

export const validateContactSubmission = (
  fields: ContactFields
): 'ok' | 'blocked' | 'invalid' => {
  if (fields.honeypot) {
    return 'blocked'
  }

  if (
    fields.name.length < 2 ||
    fields.name.length > 120 ||
    fields.message.length < 10 ||
    fields.message.length > 4000 ||
    fields.email.length > 200 ||
    !EMAIL_PATTERN.test(fields.email)
  ) {
    return 'invalid'
  }

  return 'ok'
}

export const buildContactSubmission = (
  fields: ContactFields
): ContactSubmission => ({
  email: fields.email,
  message: fields.message,
  name: fields.name,
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

export default {
  buildContactSubmission,
  buildRedirectUrl,
  sanitizeContactFields,
  validateContactSubmission,
}
