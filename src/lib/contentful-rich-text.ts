import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import { buildContentfulImageUrl, createContentfulImage } from './contentful-images'

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const richTextToPlainText = (document: any) => {
  if (!document) {
    return ''
  }

  return documentToPlainTextString(document).trim()
}

export const renderRichText = (document: any) => {
  if (!document) {
    return ''
  }

  return documentToHtmlString(document, {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const image = createContentfulImage(node?.data?.target)
        if (!image?.url) {
          return ''
        }

        const src = buildContentfulImageUrl(image.url, {
          fm: 'jpg',
          q: 80,
          w: Math.min(image.width || 1280, 1280),
        })
        const alt = escapeHtml(image.description || image.title || '')

        return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async"${
          image.width ? ` width="${image.width}"` : ''
        }${image.height ? ` height="${image.height}"` : ''} />`
      },
    },
  })
}
