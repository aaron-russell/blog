import { Toucan } from 'toucan-js'

import {
  buildContactEmailHtml,
  buildContactEmailText,
  buildContactSubmission,
  buildRedirectUrl,
  sanitizeContactFields,
  validateContactSubmission,
} from '../contact-form'

interface Env {
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_EMAIL_API_TOKEN: string
  CONTACT_ENABLE_ARCHIVE?: string
  CONTACT_FROM_EMAIL: string
  CONTACT_FROM_NAME?: string
  CONTACT_KV?: KVNamespace
  CONTACT_RATE_LIMIT_TTL_SECONDS?: string
  CONTACT_TO_EMAIL: string
  NAMESPACE?: KVNamespace
  SENTRY_DSN?: string
  TURNSTILE_SECRET?: string
}

type TurnstileResponse = {
  success: boolean
}

type ContactApiResponse = {
  fieldErrors?: Partial<Record<'email' | 'message' | 'name' | 'subject', string>>
  message: string
  ok: boolean
}

const MAX_REQUEST_BYTES = 12_000
const DEFAULT_RATE_LIMIT_TTL_SECONDS = 60 * 10

const CONTACT_MESSAGES = {
  blocked:
    'Your message could not be sent. Please email me directly if this keeps happening.',
  invalid: 'Please check the highlighted fields and try again.',
  method_not_allowed: 'This endpoint only accepts POST requests.',
  rate_limited: 'Please wait a few minutes before sending another message.',
  success: 'Message sent. I will get back to you soon.',
  unavailable:
    'I could not deliver that message just now. Please try again in a moment or email me directly.',
  verification: 'Please complete the spam check before sending your message.',
}

const jsonResponse = (status: number, body: ContactApiResponse) =>
  new Response(JSON.stringify(body), {
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      vary: 'accept',
    },
    status,
  })

const redirectResponse = (
  requestUrl: string,
  params: Record<string, string>
) =>
  Response.redirect(buildRedirectUrl(requestUrl, params), 303)

const wantsJson = (request: Request) =>
  request.headers.get('accept')?.includes('application/json') ?? false

const createResponse = (
  request: Request,
  status: number,
  code: keyof typeof CONTACT_MESSAGES,
  body: Omit<ContactApiResponse, 'message' | 'ok'> & { ok: boolean }
) =>
  wantsJson(request)
    ? jsonResponse(status, {
        ...body,
        message: CONTACT_MESSAGES[code],
      })
    : body.ok
      ? redirectResponse(request.url, { submitted: 'success' })
      : redirectResponse(request.url, { error: code })

const getContactKv = (env: Env) => env.CONTACT_KV || env.NAMESPACE

const createSentry = (context: EventContext<Env, string, unknown>) => {
  if (!context.env.SENTRY_DSN) {
    return null
  }

  return new Toucan({
    context,
    dsn: context.env.SENTRY_DSN,
    request: context.request,
  })
}

const isAllowedOrigin = (request: Request) => {
  const origin = request.headers.get('origin')
  if (!origin) {
    return true
  }

  return origin === new URL(request.url).origin
}

const verifyTurnstile = async (
  secret: string,
  token: string,
  ip: string
) => {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      body: JSON.stringify({
        remoteip: ip,
        response: token,
        secret,
      }),
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
    }
  )

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}`)
  }

  return response.json<TurnstileResponse>()
}

const sendContactEmail = async (
  env: Env,
  submission: ReturnType<typeof buildContactSubmission>
) => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
    {
      body: JSON.stringify({
        from: {
          address: env.CONTACT_FROM_EMAIL,
          name: env.CONTACT_FROM_NAME || 'Aaron Russell contact form',
        },
        html: buildContactEmailHtml(submission),
        reply_to: {
          address: submission.email,
          name: submission.name,
        },
        subject: `[Contact] ${submission.subject}`,
        text: buildContactEmailText(submission),
        to: env.CONTACT_TO_EMAIL,
      }),
      headers: {
        authorization: `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    }
  )

  const payload = await response.json<{
    errors?: Array<{ code: number; message: string }>
    success?: boolean
  }>()

  if (!response.ok || !payload.success) {
    const message = payload.errors?.map((entry) => entry.message).join('; ') || 'Email send failed'
    throw new Error(message)
  }
}

export const handleContactApiRequest = async (
  context: EventContext<Env, string, unknown>
) => {
  const { request } = context

  if (request.method !== 'POST') {
    return createResponse(request, 405, 'method_not_allowed', { ok: false })
  }

  if (!isAllowedOrigin(request)) {
    return createResponse(request, 403, 'blocked', { ok: false })
  }

  const contentLength = Number(request.headers.get('content-length') || '0')
  if (contentLength > MAX_REQUEST_BYTES) {
    return createResponse(request, 413, 'blocked', { ok: false })
  }

  const sentry = createSentry(context)

  try {
    const formData = await request.formData()
    const fields = sanitizeContactFields(formData)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const validation = validateContactSubmission(fields, {
      requireTurnstile: Boolean(context.env.TURNSTILE_SECRET),
    })

    if (validation.status !== 'ok') {
      const status = validation.status === 'blocked' ? 403 : 400

      return createResponse(request, status, validation.status, {
        fieldErrors: validation.fieldErrors,
        ok: false,
      })
    }

    const namespace = getContactKv(context.env)
    const rateLimitTtl = Number(context.env.CONTACT_RATE_LIMIT_TTL_SECONDS || DEFAULT_RATE_LIMIT_TTL_SECONDS)
    const rateLimitKey = `contact:rate:${ip}`

    if (namespace) {
      const existingSubmission = await namespace.get(rateLimitKey)
      if (existingSubmission) {
        return createResponse(request, 429, 'rate_limited', { ok: false })
      }
    }

    if (context.env.TURNSTILE_SECRET) {
      const outcome = await verifyTurnstile(
        context.env.TURNSTILE_SECRET,
        fields.turnstileToken,
        ip
      )

      if (!outcome.success) {
        return createResponse(request, 400, 'verification', { ok: false })
      }
    }

    const submission = buildContactSubmission(fields, {
      ip,
      pageUrl: fields.pageUrl || request.url,
      userAgent,
    })

    if (!context.env.CLOUDFLARE_ACCOUNT_ID ||
        !context.env.CLOUDFLARE_EMAIL_API_TOKEN ||
        !context.env.CONTACT_FROM_EMAIL ||
        !context.env.CONTACT_TO_EMAIL) {
      throw new Error('Missing contact delivery environment configuration')
    }

    await sendContactEmail(context.env, submission)

    if (namespace) {
      await namespace.put(rateLimitKey, submission.submittedAt, {
        expirationTtl: rateLimitTtl,
      })

      if (context.env.CONTACT_ENABLE_ARCHIVE !== 'false') {
        await namespace.put(
          `contact:submission:${submission.submittedAt}:${crypto.randomUUID()}`,
          JSON.stringify(submission)
        )
      }
    }

    return createResponse(request, 200, 'success', { ok: true })
  } catch (error) {
    console.error('Contact form delivery failed', error)
    sentry?.captureException(error)
    return createResponse(request, 502, 'unavailable', { ok: false })
  }
}

export const onRequestPost: PagesFunction<Env> = (context) =>
  handleContactApiRequest(context)

export default {
  handleContactApiRequest,
  onRequestPost,
}
