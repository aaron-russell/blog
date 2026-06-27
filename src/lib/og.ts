import { Resvg } from '@resvg/resvg-js'
import { absoluteUrl } from '../utils/structured-data.js'

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_TYPE = 'image/png'

const CATEGORY_GRADIENTS = [
  ['#ff7a18', '#ff4d8d', '#8b5cf6'],
  ['#f97316', '#ec4899', '#7c3aed'],
  ['#ff7a18', '#a855f7', '#7c3aed'],
  ['#ff4d8d', '#ec4899', '#8b5cf6'],
]

type OgImageKind = 'page' | 'post' | 'site'

export type OgImageInput = {
  category?: string
  description?: string
  domain?: string
  featured?: boolean
  kind?: OgImageKind
  label?: string
  publishDate?: string
  readingTime?: string
  tags?: string[]
  title: string
}

const escapeXml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const hashValue = (value = '') =>
  value.split('').reduce((total, character) => total + character.charCodeAt(0), 0)

const getGradient = (category?: string) =>
  CATEGORY_GRADIENTS[hashValue(category || 'default') % CATEGORY_GRADIENTS.length]

const wrapText = (value: string, maxCharsPerLine: number, maxLines: number) => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate
      return
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  if (lines.length <= maxLines) {
    return lines
  }

  const trimmed = lines.slice(0, maxLines)
  trimmed[maxLines - 1] = trimmed[maxLines - 1].replace(/[.,;:!?-]*$/, '').trimEnd()

  if (!trimmed[maxLines - 1].endsWith('...')) {
    trimmed[maxLines - 1] = `${trimmed[maxLines - 1]}...`
  }

  return trimmed
}

const getTitleStyle = (title: string) => {
  if (title.length <= 36) {
    return { fontSize: 72, lineHeight: 82, maxCharsPerLine: 18, maxLines: 3 }
  }

  if (title.length <= 60) {
    return { fontSize: 60, lineHeight: 70, maxCharsPerLine: 22, maxLines: 3 }
  }

  if (title.length <= 90) {
    return { fontSize: 52, lineHeight: 60, maxCharsPerLine: 25, maxLines: 4 }
  }

  return { fontSize: 46, lineHeight: 54, maxCharsPerLine: 28, maxLines: 4 }
}

const getDescriptionLines = (description?: string) => {
  if (!description) {
    return []
  }

  return wrapText(description, 52, 2)
}

const buildMetadata = (input: OgImageInput) => {
  const values = [
    input.publishDate,
    input.readingTime,
    input.category,
    input.domain || 'aaron-russell.co.uk',
  ].filter(Boolean) as string[]

  return values.slice(0, 4)
}

const buildTagMarkup = (tags: string[] = []) =>
  tags
    .slice(0, 3)
    .map((tag, index) => {
      const y = 380 + index * 54

      return `
        <g transform="translate(826 ${y})">
          <rect width="270" height="40" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" />
          <circle cx="24" cy="20" r="5" fill="url(#accent-gradient)" />
          <text x="42" y="25" font-size="18" font-weight="600" fill="#f8f8fb">${escapeXml(tag)}</text>
        </g>
      `
    })
    .join('')

const buildMetadataMarkup = (items: string[]) =>
  items
    .map((item, index) => {
      const x = index * 170

      return `
        <g transform="translate(${x} 0)">
          <rect width="154" height="42" rx="21" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" />
          <text x="18" y="27" font-size="18" font-weight="600" fill="#f8f8fb">${escapeXml(item)}</text>
        </g>
      `
    })
    .join('')

const createOgSvg = (input: OgImageInput) => {
  const {
    category,
    description,
    domain = 'aaron-russell.co.uk',
    featured = false,
    kind = 'post',
    label = 'Blog',
    tags = [],
    title,
  } = input
  const [accentStart, accentMiddle, accentEnd] = getGradient(category)
  const metadata = buildMetadata(input)
  const titleStyle = getTitleStyle(title)
  const titleLines = wrapText(title, titleStyle.maxCharsPerLine, titleStyle.maxLines)
  const titleY = description ? 116 : 136
  const descriptionLines = getDescriptionLines(description)
  const rightPanelLabel = category || (kind === 'site' ? 'Engineering notebook' : 'Aaron Russell')

  return `
    <svg width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="background-gradient" x1="0" y1="0" x2="${OG_IMAGE_WIDTH}" y2="${OG_IMAGE_HEIGHT}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#17171b" />
          <stop offset="52%" stop-color="#121216" />
          <stop offset="100%" stop-color="#1a1830" />
        </linearGradient>
        <linearGradient id="accent-gradient" x1="120" y1="72" x2="1060" y2="540" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${accentStart}" />
          <stop offset="50%" stop-color="${accentMiddle}" />
          <stop offset="100%" stop-color="${accentEnd}" />
        </linearGradient>
        <radialGradient id="orange-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(198 118) rotate(42) scale(356 320)">
          <stop stop-color="${accentStart}" stop-opacity="0.56" />
          <stop offset="1" stop-color="${accentStart}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="pink-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(972 154) rotate(124) scale(312 244)">
          <stop stop-color="${accentMiddle}" stop-opacity="0.44" />
          <stop offset="1" stop-color="${accentMiddle}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="purple-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(962 514) rotate(128) scale(376 282)">
          <stop stop-color="${accentEnd}" stop-opacity="0.36" />
          <stop offset="1" stop-color="${accentEnd}" stop-opacity="0" />
        </radialGradient>
        <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="38" />
        </filter>
        <filter id="noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.035" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" rx="38" fill="#0f1118" />
      <rect width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" rx="38" fill="url(#background-gradient)" />
      <circle cx="198" cy="118" r="260" fill="url(#orange-glow)" filter="url(#soft-blur)" />
      <circle cx="972" cy="154" r="220" fill="url(#pink-glow)" filter="url(#soft-blur)" />
      <circle cx="962" cy="514" r="260" fill="url(#purple-glow)" filter="url(#soft-blur)" />
      <rect width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" rx="38" fill="rgba(255,255,255,0.02)" filter="url(#noise)" />
      <rect x="30" y="30" width="1140" height="570" rx="34" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />

      <g transform="translate(48 48)">
        <rect width="744" height="534" rx="36" fill="rgba(25,25,31,0.72)" stroke="rgba(255,255,255,0.12)" />
        <rect width="744" height="534" rx="36" fill="url(#accent-gradient)" opacity="0.1" />
        <rect x="1" y="1" width="742" height="120" rx="36" fill="rgba(255,255,255,0.04)" />

        <g transform="translate(34 30)">
          <rect width="218" height="46" rx="23" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" />
          <rect x="15" y="13" width="34" height="20" rx="10" fill="url(#accent-gradient)" />
          <text x="64" y="30" font-size="18" font-weight="800" letter-spacing="0.22em" fill="#f8f8fb">AARON RUSSELL</text>
        </g>

        <g transform="translate(530 30)">
          <rect width="180" height="46" rx="23" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" />
          <text x="22" y="30" font-size="18" font-weight="700" fill="#f8f8fb">${escapeXml(label)}</text>
          ${
            featured
              ? '<circle cx="148" cy="23" r="5" fill="#ff7a18" /><text x="160" y="30" font-size="16" font-weight="700" fill="#f8f8fb">Featured</text>'
              : ''
          }
        </g>

        <g transform="translate(34 118)">
          ${titleLines
            .map(
              (line, index) => `
                <text
                  x="0"
                  y="${titleY + index * titleStyle.lineHeight}"
                  font-size="${titleStyle.fontSize}"
                  font-weight="800"
                  letter-spacing="-0.045em"
                  fill="#f8f8fb"
                >${escapeXml(line)}</text>
              `
            )
            .join('')}
          ${
            descriptionLines.length > 0
              ? descriptionLines
                  .map(
                    (line, index) => `
                        <text
                          x="0"
                          y="${titleY + titleLines.length * titleStyle.lineHeight + 38 + index * 30}"
                          font-size="24"
                          font-weight="500"
                          fill="#cbd0db"
                        >${escapeXml(line)}</text>
                    `
                  )
                  .join('')
              : ''
          }
        </g>

        <g transform="translate(34 458)">
          ${buildMetadataMarkup(metadata)}
        </g>
      </g>

      <g transform="translate(826 58)">
        <rect width="324" height="514" rx="34" fill="rgba(28,28,34,0.52)" stroke="rgba(255,255,255,0.1)" />
        <rect width="324" height="514" rx="34" fill="url(#accent-gradient)" opacity="0.08" />
        <rect x="26" y="26" width="272" height="186" rx="30" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
        <circle cx="182" cy="128" r="108" fill="url(#accent-gradient)" opacity="0.78" filter="url(#soft-blur)" />
        <circle cx="120" cy="126" r="64" fill="#ffffff" opacity="0.08" />
        <rect x="26" y="238" width="272" height="92" rx="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" />
        <text x="48" y="278" font-size="16" font-weight="700" letter-spacing="0.18em" fill="#98a1b3">CATEGORY</text>
        <text x="48" y="314" font-size="30" font-weight="700" fill="#f8f8fb">${escapeXml(rightPanelLabel)}</text>
        <text x="48" y="350" font-size="20" font-weight="500" fill="#cbd0db">${escapeXml(domain)}</text>
        ${buildTagMarkup(tags)}
      </g>
    </svg>
  `
}

export const renderOgImage = (input: OgImageInput) => {
  const svg = createOgSvg(input)
  const image = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: OG_IMAGE_WIDTH,
    },
    font: {
      defaultFontFamily: 'Arial',
      loadSystemFonts: true,
    },
  }).render()

  return image.asPng()
}

export const buildPostOgImagePath = (slug: string) => `/og/blog/${slug}.png`
export const buildStaticOgImagePath = (name: string) => `/og/${name}.png`
export const buildOgImageUrl = (baseUrl: string, path: string) => absoluteUrl(baseUrl, path)

export const createOgImageResponse = (input: OgImageInput) =>
  new Response(renderOgImage(input), {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': OG_IMAGE_TYPE,
    },
  })
