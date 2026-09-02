const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:'])

export const sanitizeUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  if (trimmed.startsWith('/')) return trimmed

  try {
    const parsed = new URL(trimmed)
    return SAFE_SCHEMES.has(parsed.protocol) ? trimmed : undefined
  } catch {
    return undefined
  }
}
