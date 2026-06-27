import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import {
  isCodeBlockEntry,
  normalizeCodeBlockEntry,
  renderCodeBlock,
} from './code-blocks'
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

  const visitNode = (node: any): string => {
    if (!node) {
      return ''
    }

    if (node.nodeType === 'text') {
      return node.value || ''
    }

    if (node.nodeType === BLOCKS.EMBEDDED_ENTRY && isCodeBlockEntry(node?.data?.target)) {
      return normalizeCodeBlockEntry(node.data.target)?.code || ''
    }

    const children = Array.isArray(node.content)
      ? node.content.map((child: any) => visitNode(child)).join('')
      : ''

    if (
      node.nodeType === BLOCKS.PARAGRAPH ||
      node.nodeType === BLOCKS.HEADING_1 ||
      node.nodeType === BLOCKS.HEADING_2 ||
      node.nodeType === BLOCKS.HEADING_3 ||
      node.nodeType === BLOCKS.HEADING_4 ||
      node.nodeType === BLOCKS.HEADING_5 ||
      node.nodeType === BLOCKS.HEADING_6 ||
      node.nodeType === BLOCKS.QUOTE ||
      node.nodeType === BLOCKS.LIST_ITEM ||
      node.nodeType === BLOCKS.EMBEDDED_ENTRY
    ) {
      return `${children}\n`
    }

    return children
  }

  const plainText = visitNode(document).trim()
  return plainText || documentToPlainTextString(document).trim()
}

export const renderRichText = async (document: any) => {
  if (!document) {
    return ''
  }

  const visitNode = async (node: any): Promise<void> => {
    if (!node) {
      return
    }

    if (node.nodeType === BLOCKS.EMBEDDED_ENTRY) {
      const block = normalizeCodeBlockEntry(node?.data?.target)
      if (block) {
        node.data.__renderedHtml = await renderCodeBlock(block)
      }
    }

    if (Array.isArray(node.content)) {
      await Promise.all(node.content.map((child: any) => visitNode(child)))
    }
  }

  await visitNode(document)

  return documentToHtmlString(document, {
    renderNode: {
      [BLOCKS.EMBEDDED_ENTRY]: (node) => node?.data?.__renderedHtml || '',
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

export default {
  renderRichText,
  richTextToPlainText,
}
