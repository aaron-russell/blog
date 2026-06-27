import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'
import { Toucan } from 'toucan-js'

import {
  buildContactSubmission,
  buildRedirectUrl,
  sanitizeContactFields,
  validateContactSubmission,
} from './contact-form'

interface Env {
  NAMESPACE: KVNamespace
  SENTRY_DSN: string
  TURNSTILE_SECRET: string
}

type TurnstileResponse = {
  success: boolean
}

const RATE_LIMIT_TTL_SECONDS = 300

const redirect = (requestUrl: string, params: Record<string, string>) =>
  Response.redirect(buildRedirectUrl(requestUrl, params), 303)

export const handleContactFormSubmission = async (
  context: EventContext<Env, string, unknown>,
  formData: FormData
) => {
  const sentry = new Toucan({
    dsn: context.env.SENTRY_DSN,
    context,
    request: context.request,
  })

  try {
    const token = formData.get('cf-turnstile-response')
    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown'
    const fields = sanitizeContactFields(formData)
    const validation = validateContactSubmission(fields)

    if (validation !== 'ok') {
      return redirect(context.request.url, { error: validation })
    }

    const rateLimitKey = `contact:${ip}`
    const existingSubmission = await context.env.NAMESPACE.get(rateLimitKey)

    if (existingSubmission) {
      return redirect(context.request.url, { error: 'rate_limited' })
    }

    if (typeof token !== 'string' || token.trim().length === 0) {
      return redirect(context.request.url, { error: 'verification' })
    }

    const turnstileFormData = new FormData()
    turnstileFormData.append('secret', context.env.TURNSTILE_SECRET)
    turnstileFormData.append('response', token)
    turnstileFormData.append('remoteip', ip)

    const outcome = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: turnstileFormData,
      }
    ).then((result) => result.json<TurnstileResponse>())

    if (!outcome.success) {
      return redirect(context.request.url, { error: 'verification' })
    }

    await context.env.NAMESPACE.put(
      rateLimitKey,
      new Date().toISOString(),
      {
        expirationTtl: RATE_LIMIT_TTL_SECONDS,
      }
    )

    await context.env.NAMESPACE.put(
      crypto.randomUUID(),
      JSON.stringify(buildContactSubmission(fields))
    )

    return redirect(context.request.url, { submitted: 'success' })
  } catch (error) {
    sentry.captureException(error)
    return redirect(context.request.url, { error: 'blocked' })
  }
}

export const onRequest: PagesFunction<Env> = (context) =>
  staticFormsPlugin({
    respondWith: ({ formData }) => handleContactFormSubmission(context, formData),
  })(context)

export default {
  handleContactFormSubmission,
  onRequest,
}
