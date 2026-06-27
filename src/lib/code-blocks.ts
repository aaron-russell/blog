import { createHighlighter } from 'shiki'

export const SUPPORTED_CODE_LANGUAGES = [
  'astro',
  'bash',
  'css',
  'diff',
  'graphql',
  'html',
  'javascript',
  'js',
  'json',
  'jsx',
  'markdown',
  'md',
  'nginx',
  'scss',
  'shell',
  'sql',
  'text',
  'ts',
  'tsx',
  'typescript',
  'xml',
  'yaml',
  'yml',
] as const

export type DiffMode = 'none' | 'diff' | 'diff-add' | 'diff-remove'

export type ContentfulCodeBlock = {
  code: string
  diffMode: DiffMode
  filename?: string
  highlightedLines?: string
  language: string
  showLineNumbers: boolean
  title?: string
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  md: 'markdown',
  shell: 'bash',
  sh: 'bash',
  text: 'txt',
  ts: 'typescript',
  yml: 'yaml',
}

const SHIKI_LANGUAGES = [
  'astro',
  'bash',
  'css',
  'diff',
  'graphql',
  'html',
  'javascript',
  'json',
  'jsx',
  'markdown',
  'nginx',
  'scss',
  'sql',
  'tsx',
  'typescript',
  'txt',
  'xml',
  'yaml',
] as const

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, '')

const highlighterPromise = createHighlighter({
  langs: [...SHIKI_LANGUAGES],
  themes: ['github-light', 'github-dark'],
})

export const isCodeBlockEntry = (entry: any) =>
  entry?.sys?.contentType?.sys?.id === 'codeBlock'

export const normalizeCodeLanguage = (value?: string) => {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) {
    return 'txt'
  }

  return LANGUAGE_ALIASES[normalized] || normalized
}

export const parseHighlightedLines = (value?: string) => {
  if (!value?.trim()) {
    return new Set<number>()
  }

  const highlighted = new Set<number>()
  const parts = value.split(',').map((item) => item.trim())

  for (const part of parts) {
    if (!part) {
      continue
    }

    if (part.includes('-')) {
      const [startValue, endValue] = part.split('-').map((item) => item.trim())
      const start = Number(startValue)
      const end = Number(endValue)

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start <= 0 ||
        end < start
      ) {
        return new Set<number>()
      }

      for (let line = start; line <= end; line += 1) {
        highlighted.add(line)
      }

      continue
    }

    const line = Number(part)
    if (!Number.isInteger(line) || line <= 0) {
      return new Set<number>()
    }

    highlighted.add(line)
  }

  return highlighted
}

export const normalizeCodeBlockEntry = (entry: any): ContentfulCodeBlock | undefined => {
  if (!isCodeBlockEntry(entry)) {
    return undefined
  }

  const code = entry?.fields?.code
  const language = entry?.fields?.language

  if (typeof code !== 'string' || typeof language !== 'string') {
    return undefined
  }

  const diffMode = entry?.fields?.diffMode
  const normalizedDiffMode: DiffMode =
    diffMode === 'diff' || diffMode === 'diff-add' || diffMode === 'diff-remove'
      ? diffMode
      : 'none'

  return {
    code,
    diffMode: normalizedDiffMode,
    filename: entry?.fields?.filename,
    highlightedLines: entry?.fields?.highlightedLines,
    language,
    showLineNumbers: Boolean(entry?.fields?.showLineNumbers),
    title: entry?.fields?.internalName || entry?.fields?.title,
  }
}

const renderPlainCodeBlock = (block: ContentfulCodeBlock, highlightedLines: Set<number>) => {
  const lines = block.code.split('\n').map((line, index) => {
    const lineNumber = index + 1
    const classes = ['line', 'code-block__line']

    if (block.showLineNumbers) {
      classes.push('code-block__line--numbered')
    }

    if (highlightedLines.has(lineNumber)) {
      classes.push('code-block__line--highlighted')
    }

    if (block.diffMode === 'diff-add') {
      classes.push('code-block__line--added')
    } else if (block.diffMode === 'diff-remove') {
      classes.push('code-block__line--removed')
    }

    return `<span class="${classes.join(' ')}" data-line="${lineNumber}">${escapeHtml(line)}</span>`
  })

  return `<pre class="shiki shiki-themes github-light github-dark code-block__pre" tabindex="0"><code>${lines.join(
    '\n'
  )}</code></pre>`
}

const decorateHighlightedHtml = (
  html: string,
  block: ContentfulCodeBlock,
  highlightedLines: Set<number>
) => {
  const match = html.match(/^<pre([^>]*)><code>([\s\S]*)<\/code><\/pre>$/)
  if (!match) {
    return html
  }

  const [, preAttributes, codeHtml] = match
  const normalizedPreAttributes = preAttributes.replace(/\sclass="[^"]*"/, '')
  const lines = codeHtml.split('\n').map((lineHtml, index) => {
    const lineNumber = index + 1
    const classes = ['code-block__line']

    if (block.showLineNumbers) {
      classes.push('code-block__line--numbered')
    }

    if (highlightedLines.has(lineNumber)) {
      classes.push('code-block__line--highlighted')
    }

    const plainText = stripHtml(lineHtml).trimStart()

    if (block.diffMode === 'diff') {
      if (plainText.startsWith('+')) {
        classes.push('code-block__line--added')
      } else if (plainText.startsWith('-')) {
        classes.push('code-block__line--removed')
      }
    } else if (block.diffMode === 'diff-add') {
      classes.push('code-block__line--added')
    } else if (block.diffMode === 'diff-remove') {
      classes.push('code-block__line--removed')
    }

    return lineHtml.replace(
      /^<span class="line">/,
      `<span class="line ${classes.join(' ')}" data-line="${lineNumber}">`
    )
  })

  return `<pre${normalizedPreAttributes} class="shiki shiki-themes github-light github-dark code-block__pre"><code>${lines.join(
    '\n'
  )}</code></pre>`
}

export const renderCodeBlock = async (block: ContentfulCodeBlock) => {
  const highlightedLines = parseHighlightedLines(block.highlightedLines)
  const normalizedLanguage =
    block.diffMode === 'diff' ? 'diff' : normalizeCodeLanguage(block.language)
  const languageLabel = block.language.trim()

  let codeHtml = ''

  if (SHIKI_LANGUAGES.includes(normalizedLanguage as (typeof SHIKI_LANGUAGES)[number])) {
    const highlighter = await highlighterPromise
    const highlighted = highlighter.codeToHtml(block.code, {
      lang: normalizedLanguage,
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    })

    codeHtml = decorateHighlightedHtml(highlighted, block, highlightedLines)
  } else {
    codeHtml = renderPlainCodeBlock(block, highlightedLines)
  }

  const headerBits = [
    block.filename
      ? `<span class="code-block__filename">${escapeHtml(block.filename)}</span>`
      : '',
    languageLabel
      ? `<span class="code-block__language">${escapeHtml(languageLabel)}</span>`
      : '',
  ].filter(Boolean)

  const header = headerBits.length
    ? `<figcaption class="code-block__header">${headerBits.join('')}</figcaption>`
    : ''

  return `<figure class="code-block" data-language="${escapeHtml(
    normalizedLanguage
  )}" data-diff-mode="${escapeHtml(block.diffMode)}">${header}${codeHtml}</figure>`
}

export default {
  isCodeBlockEntry,
  normalizeCodeBlockEntry,
  normalizeCodeLanguage,
  parseHighlightedLines,
  renderCodeBlock,
  SUPPORTED_CODE_LANGUAGES,
}
