import aiSummaries from '../generated/ai-summaries.js'

const normalizeSummarySource = (value = '') =>
  String(value)
    .replace(/\s+/g, ' ')
    .trim()

export const buildSummarySource = (post) =>
  [
    post.title,
    post.descriptionPlainText,
    post.bodyPlainText,
    post.category,
    ...(post.tags || []),
  ]
    .filter(Boolean)
    .join('\n')

export const hashSummarySource = (value = '') => {
  const normalized = normalizeSummarySource(value)
  let hash = 5381

  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(index)) >>> 0
  }

  return hash.toString(16).padStart(8, '0')
}

export const getAiSummaryPoints = (post) => {
  const entry = aiSummaries?.[post.slug]

  if (!entry || !Array.isArray(entry.bullets) || entry.bullets.length < 3) {
    return undefined
  }

  const expectedHash = hashSummarySource(buildSummarySource(post))

  if (entry.sourceHash !== expectedHash) {
    return undefined
  }

  return entry.bullets.filter(Boolean).slice(0, 5)
}

export default {
  buildSummarySource,
  getAiSummaryPoints,
  hashSummarySource,
}
