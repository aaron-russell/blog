#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const { createClient } = require('contentful')
const { documentToPlainTextString } = require('@contentful/rich-text-plain-text-renderer')

const envFiles = [
  '.env.development.local',
  '.env.local',
  '.env.development',
  '.env',
]

envFiles
  .map((file) => path.join(process.cwd(), file))
  .filter((filePath) => fs.existsSync(filePath))
  .forEach((filePath) => {
    dotenv.config({
      path: filePath,
      override: false,
    })
  })

const OUTPUT_FILE = path.join(process.cwd(), 'src/generated/ai-summaries.js')
const DEFAULT_MODEL = process.env.CF_AI_SUMMARY_MODEL || '@cf/meta/llama-3.1-8b-instruct'

const parseArgs = (argv) => {
  const entries = {}

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (!argument.startsWith('--')) {
      continue
    }

    const [rawKey, rawValue] = argument.slice(2).split('=')
    const nextArgument = argv[index + 1]
    const value =
      rawValue !== undefined
        ? rawValue
        : nextArgument && !nextArgument.startsWith('--')
          ? nextArgument
          : true

    entries[rawKey] = value

    if (!rawValue && value !== true) {
      index += 1
    }
  }

  return entries
}

const normalizeSummarySource = (value = '') =>
  String(value)
    .replace(/\s+/g, ' ')
    .trim()

const buildSummarySource = (post) =>
  [
    post.title,
    post.descriptionPlainText,
    post.bodyPlainText,
    post.category,
    ...(post.tags || []),
  ]
    .filter(Boolean)
    .join('\n')

const hashSummarySource = (value = '') => {
  const normalized = normalizeSummarySource(value)
  let hash = 5381

  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(index)) >>> 0
  }

  return hash.toString(16).padStart(8, '0')
}

const toPlainText = (document) => {
  if (!document) {
    return ''
  }

  try {
    return documentToPlainTextString(document)
  } catch {
    return ''
  }
}

const readExistingSummaries = async () => {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return {}
  }

  const moduleUrl = new URL(`file://${OUTPUT_FILE}?t=${Date.now()}`)
  const loaded = await import(moduleUrl.href)
  return loaded.default || {}
}

const renderModule = (entries) => `const aiSummaries = ${JSON.stringify(entries, null, 2)}

export default aiSummaries
`

const getContentfulClient = () => {
  const space = process.env.CONTENTFUL_SPACE_ID
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
  const host = process.env.CONTENTFUL_HOST

  if (!space || !accessToken) {
    throw new Error(
      'Missing required Contentful credentials: CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN'
    )
  }

  return createClient({ accessToken, host, space })
}

const fetchPosts = async () => {
  const client = getContentfulClient()
  const response = await client.getEntries({
    content_type: 'blogPost',
    include: 10,
    order: ['-fields.publishDate'],
    limit: 1000,
  })

  return response.items.map((entry) => ({
    bodyPlainText: toPlainText(entry?.fields?.body),
    category: entry?.fields?.category || '',
    descriptionPlainText: toPlainText(entry?.fields?.description),
    rawUpdatedDate: entry?.sys?.updatedAt,
    slug: entry?.fields?.slug || '',
    tags: Array.isArray(entry?.fields?.tags) ? entry.fields.tags.filter(Boolean) : [],
    title: entry?.fields?.title || '',
  }))
}

const buildPrompt = (post) => ({
  messages: [
    {
      role: 'system',
      content:
        'You create concise article summary bullets. Use only the supplied article content. Never invent facts. Return valid JSON only with the shape {"bullets":["..."]}. Each bullet must be one sentence, under 24 words, and there must be between 3 and 5 bullets.',
    },
    {
      role: 'user',
      content: [
        `Title: ${post.title}`,
        post.category ? `Category: ${post.category}` : '',
        post.tags?.length ? `Tags: ${post.tags.join(', ')}` : '',
        post.descriptionPlainText ? `Description: ${post.descriptionPlainText}` : '',
        `Body:\n${post.bodyPlainText}`,
      ]
        .filter(Boolean)
        .join('\n\n'),
    },
  ],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'article_summary',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['bullets'],
        properties: {
          bullets: {
            type: 'array',
            minItems: 3,
            maxItems: 5,
            items: {
              type: 'string',
              minLength: 8,
              maxLength: 180,
            },
          },
        },
      },
    },
  },
})

const buildGatewayUrl = (accountId, gatewayId) =>
  `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/compat/chat/completions`

const buildWorkersAiUrl = (accountId, model) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`

const parseJsonResponse = (content) => {
  if (!content) {
    throw new Error('AI response was empty.')
  }

  if (typeof content === 'object') {
    return content
  }

  const trimmed = String(content).trim()
  const match = trimmed.match(/\{[\s\S]*\}/)

  if (!match) {
    throw new Error(`AI response did not contain JSON: ${trimmed.slice(0, 160)}`)
  }

  return JSON.parse(match[0])
}

const sanitizeBullets = (bullets) =>
  Array.isArray(bullets)
    ? bullets
        .map((item) => String(item).replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, 5)
    : []

const generateViaGateway = async ({ accountId, gatewayId, model, token, post, prompt }) => {
  const response = await fetch(buildGatewayUrl(accountId, gatewayId), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-aig-authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: `workersai/${model}`,
      messages: prompt.messages,
      response_format: prompt.response_format,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI Gateway failed for ${post.slug}: ${response.status} ${response.statusText}`)
  }

  const body = await response.json()
  return parseJsonResponse(body?.choices?.[0]?.message?.content)
}

const generateViaWorkersAi = async ({ accountId, model, token, post, prompt }) => {
  const response = await fetch(buildWorkersAiUrl(accountId, model), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(prompt),
  })

  if (!response.ok) {
    throw new Error(`Workers AI failed for ${post.slug}: ${response.status} ${response.statusText}`)
  }

  const body = await response.json()
  return parseJsonResponse(body?.result?.response || body?.response || body?.result)
}

const generateSummary = async ({ accountId, gatewayId, model, post, token }) => {
  const prompt = buildPrompt(post)
  const result = gatewayId
    ? await generateViaGateway({ accountId, gatewayId, model, post, prompt, token })
    : await generateViaWorkersAi({ accountId, model, post, prompt, token })

  const bullets = sanitizeBullets(result?.bullets)

  if (bullets.length < 3) {
    throw new Error(`AI returned fewer than 3 bullets for ${post.slug}.`)
  }

  return bullets
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  const dryRun = args['dry-run'] !== 'false' && !args.write
  const force = Boolean(args.force)
  const limit = args.limit ? Number(args.limit) : undefined
  const selectedSlugs = String(args.slugs || '')
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean)
  const accountId = process.env.CF_ACCOUNT_ID
  const token = process.env.CF_API_TOKEN
  const gatewayId = process.env.CF_AI_GATEWAY_ID
  const model = args.model || DEFAULT_MODEL

  if (!accountId || !token) {
    throw new Error('Missing required Cloudflare AI credentials: CF_ACCOUNT_ID and CF_API_TOKEN')
  }

  const [posts, existingEntries] = await Promise.all([fetchPosts(), readExistingSummaries()])
  const filteredPosts = posts
    .filter((post) => post.slug && post.title && post.bodyPlainText)
    .filter((post) => selectedSlugs.length === 0 || selectedSlugs.includes(post.slug))

  const nextEntries = { ...existingEntries }
  const candidates = filteredPosts.filter((post) => {
    const sourceHash = hashSummarySource(buildSummarySource(post))
    return force || existingEntries?.[post.slug]?.sourceHash !== sourceHash
  })

  const queue = typeof limit === 'number' ? candidates.slice(0, limit) : candidates

  if (queue.length === 0) {
    console.log('No AI summaries need regeneration.')
    return
  }

  console.log(
    `${dryRun ? 'Dry run' : 'Write mode'}: generating AI summaries for ${queue.length} post${
      queue.length === 1 ? '' : 's'
    } using ${gatewayId ? `AI Gateway ${gatewayId}` : 'Workers AI direct'} and model ${model}.`
  )

  for (const post of queue) {
    const sourceHash = hashSummarySource(buildSummarySource(post))

    try {
      const bullets = await generateSummary({
        accountId,
        gatewayId,
        model,
        post,
        token,
      })

      nextEntries[post.slug] = {
        bullets,
        generatedAt: new Date().toISOString(),
        model: gatewayId ? `workersai/${model} via ${gatewayId}` : model,
        sourceHash,
        title: post.title,
      }

      console.log(`- ${post.slug}: ${bullets.length} bullet summary ready`)
    } catch (error) {
      console.warn(`- ${post.slug}: ${error instanceof Error ? error.message : error}`)
    }
  }

  if (dryRun) {
    console.log('\nNo file written. Re-run with --write to update src/generated/ai-summaries.js.')
    return
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, renderModule(nextEntries))
  console.log(`\nUpdated ${path.relative(process.cwd(), OUTPUT_FILE)}.`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
