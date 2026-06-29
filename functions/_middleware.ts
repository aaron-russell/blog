import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'
import { Toucan } from 'toucan-js'

import {
  buildContactSubmission,
  buildRedirectUrl,
  sanitizeContactFields,
  validateContactSubmission,
} from './contact-form'
import { htmlToMarkdown, isHtmlResponse, requestsMarkdown } from './markdown-converter'

interface Env {
  NAMESPACE: KVNamespace
  SENTRY_DSN: string
  TURNSTILE_SECRET: string
}

type TurnstileResponse = {
  success: boolean
}

const RATE_LIMIT_TTL_SECONDS = 300
const estimateTokens = (value: string) => Math.max(1, Math.ceil(value.trim().length / 4))

export const DISCOVERY_LINKS = [
  '</.well-known/agent-card.json>; rel="agent"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"',
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</openapi.json>; rel="service-desc"',
  '</status.json>; rel="status"',
  '</auth.md>; rel="service-auth"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"',
]

const redirect = (requestUrl: string, params: Record<string, string>) =>
  Response.redirect(buildRedirectUrl(requestUrl, params), 303)

// Add Link headers for agent discovery (RFC 8288) and markdown support
export const addDiscoveryHeaders = async (response: Response, request: Request): Promise<Response> => {
  const newResponse = new Response(response.body, response)

  newResponse.headers.append('Link', DISCOVERY_LINKS.join(', '))
  newResponse.headers.append('Vary', 'Accept')
  
  // Handle Markdown for Agents content negotiation
  const acceptHeader = request.headers.get('accept') || ''
  const contentType = newResponse.headers.get('content-type') || ''
  
  if (requestsMarkdown(acceptHeader) && isHtmlResponse(contentType) && newResponse.body) {
    try {
      // Clone the response to read the body
      const clonedResponse = newResponse.clone()
      const htmlText = await clonedResponse.text()
      
      // Convert HTML to markdown
      const markdown = htmlToMarkdown(htmlText)
      
      // Return new response with markdown content
      const markdownResponse = new Response(markdown, {
        status: newResponse.status,
        statusText: newResponse.statusText,
        headers: new Headers(newResponse.headers)
      })
      
      // Set markdown content type and headers
      markdownResponse.headers.set('Content-Type', 'text/markdown; charset=utf-8')
      markdownResponse.headers.set('X-Markdown-Version', '1.0')
      markdownResponse.headers.set('X-Markdown-From-Html', 'true')
      markdownResponse.headers.set('X-Markdown-Tokens', String(estimateTokens(markdown)))
      markdownResponse.headers.set('X-Original-Tokens', String(estimateTokens(htmlText)))
      
      return markdownResponse
    } catch (error) {
      console.warn('Failed to convert HTML to markdown:', error)
      // Fall back to original response with markdown header
      newResponse.headers.set('Content-Type', 'text/markdown; charset=utf-8')
      newResponse.headers.append('X-Markdown-Version', '1.0')
    }
  }
  
  return newResponse
}

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

export const onRequest: PagesFunction<Env> = async (context) => {
  // Handle form submissions
  const formHandler = staticFormsPlugin({
    respondWith: ({ formData }) => handleContactFormSubmission(context, formData),
  })
  
  const response = await formHandler(context)
  
  // Add discovery headers and markdown support to all responses
  return addDiscoveryHeaders(response, context.request)
}

export default {
  handleContactFormSubmission,
  onRequest,
}
