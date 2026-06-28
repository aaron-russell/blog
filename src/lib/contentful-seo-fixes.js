const LOCALE = 'en-US'

const TAG_ALIASES = {
  'my story': 'My Story',
  pagespeed: 'PageSpeed',
  quesrions: 'Questions',
  'web development': 'Web Development',
}

const normalizeWhitespace = (value = '') => value.trim().replace(/\s+/g, ' ')

const dedupeRepeatedTextValue = (value = '') => {
  const trimmedValue = value.trim()

  if (!trimmedValue || trimmedValue.length % 2 !== 0) {
    return value
  }

  const midpoint = trimmedValue.length / 2
  const firstHalf = trimmedValue.slice(0, midpoint)
  const secondHalf = trimmedValue.slice(midpoint)

  if (firstHalf === secondHalf) {
    return firstHalf
  }

  return value
}

const normalizeTagLabel = (value = '') => {
  const cleanedValue = normalizeWhitespace(value)

  if (!cleanedValue) {
    return ''
  }

  return TAG_ALIASES[cleanedValue.toLowerCase()] || cleanedValue
}

const normalizeCanonicalUrl = (canonical, slug, siteUrl) => {
  if (!slug) {
    return canonical
  }

  const expectedUrl = new URL(`/blog/${slug}/`, `${siteUrl}/`).toString()

  if (!canonical) {
    return canonical
  }

  try {
    const configuredUrl = new URL(canonical, `${siteUrl}/`)
    const expectedPath = new URL(expectedUrl).pathname.replace(/\/+$/, '')
    const configuredPath = configuredUrl.pathname.replace(/\/+$/, '')

    if (configuredUrl.origin === new URL(expectedUrl).origin && configuredPath === expectedPath) {
      configuredUrl.pathname = new URL(expectedUrl).pathname
      return configuredUrl.toString()
    }

    return canonical
  } catch {
    return canonical
  }
}

const getTextContent = (node) => {
  if (!node) {
    return ''
  }

  if (node.nodeType === 'text') {
    return node.value || ''
  }

  return (node.content || []).map(getTextContent).join('')
}

const dedupeRepeatedDescriptionParagraphs = (document) => {
  if (!document || document.nodeType !== 'document' || !Array.isArray(document.content)) {
    return { changed: false, value: document }
  }

  const dedupedContent = []
  let previousParagraphText = null
  let changed = false

  for (const node of document.content) {
    if (node?.nodeType !== 'paragraph') {
      dedupedContent.push(node)
      previousParagraphText = null
      continue
    }

    const paragraphText = normalizeWhitespace(getTextContent(node))

    if (paragraphText && paragraphText === previousParagraphText) {
      changed = true
      continue
    }

    dedupedContent.push(node)
    previousParagraphText = paragraphText || null
  }

  if (!changed) {
    return { changed: false, value: document }
  }

  return {
    changed: true,
    value: {
      ...document,
      content: dedupedContent,
    },
  }
}

const dedupeRepeatedDescriptionTextNodes = (node) => {
  if (!node || typeof node !== 'object') {
    return { changed: false, value: node }
  }

  if (node.nodeType === 'text' && typeof node.value === 'string') {
    const nextValue = dedupeRepeatedTextValue(node.value)

    if (nextValue !== node.value) {
      return {
        changed: true,
        value: {
          ...node,
          value: nextValue,
        },
      }
    }

    return { changed: false, value: node }
  }

  if (!Array.isArray(node.content)) {
    return { changed: false, value: node }
  }

  let changed = false
  const nextContent = node.content.map((childNode) => {
    const result = dedupeRepeatedDescriptionTextNodes(childNode)
    changed = changed || result.changed
    return result.value
  })

  if (!changed) {
    return { changed: false, value: node }
  }

  return {
    changed: true,
    value: {
      ...node,
      content: nextContent,
    },
  }
}

export const getSeoFixesForBlogPost = ({
  entry,
  locale = LOCALE,
  siteUrl = 'https://aaron-russell.co.uk',
}) => {
  const fields = entry?.fields || {}
  const slug = fields.slug?.[locale]
  const changes = []
  const nextFields = {}

  if (Array.isArray(fields.tags?.[locale])) {
    const originalTags = fields.tags[locale]
    const normalizedTags = [...new Set(originalTags.map(normalizeTagLabel).filter(Boolean))]

    if (JSON.stringify(normalizedTags) !== JSON.stringify(originalTags)) {
      nextFields.tags = {
        ...(nextFields.tags || fields.tags),
        [locale]: normalizedTags,
      }
      changes.push({
        field: 'tags',
        from: originalTags,
        to: normalizedTags,
      })
    }
  }

  if (typeof fields.canonical?.[locale] === 'string') {
    const originalCanonical = fields.canonical[locale]
    const normalizedCanonical = normalizeCanonicalUrl(originalCanonical, slug, siteUrl)

    if (normalizedCanonical !== originalCanonical) {
      nextFields.canonical = {
        ...(nextFields.canonical || fields.canonical),
        [locale]: normalizedCanonical,
      }
      changes.push({
        field: 'canonical',
        from: originalCanonical,
        to: normalizedCanonical,
      })
    }
  }

  if (fields.description?.[locale]) {
    const paragraphDedupedDescription = dedupeRepeatedDescriptionParagraphs(fields.description[locale])
    const textDedupedDescription = dedupeRepeatedDescriptionTextNodes(
      paragraphDedupedDescription.value
    )

    if (paragraphDedupedDescription.changed || textDedupedDescription.changed) {
      nextFields.description = {
        ...(nextFields.description || fields.description),
        [locale]: textDedupedDescription.value,
      }
      changes.push({
        field: 'description',
        from: 'repeated paragraph or text content',
        to: 'deduplicated repeated paragraph or text content',
      })
    }
  }

  return {
    changed: changes.length > 0,
    changes,
    entryId: entry?.sys?.id,
    nextFields,
    slug,
    title: fields.title?.[locale] || entry?.sys?.id,
  }
}

export default {
  LOCALE,
  getSeoFixesForBlogPost,
}
