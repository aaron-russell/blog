import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import {
  isCodeBlockEntry,
  normalizeCodeBlockEntry,
  renderCodeBlock,
} from './code-blocks'
import {
  buildResponsiveContentfulImage,
  createContentfulImage,
  resolveContentfulAltText,
} from './contentful-images'

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

        const responsiveImage = buildResponsiveContentfulImage(image, {
          fallbackFormat: 'jpg',
          formats: ['avif', 'webp'],
          transform: {
            q: 72,
          },
          widths: [480, 720, 960, 1280],
        })
        const alt = escapeHtml(resolveContentfulAltText(image))

        if (!responsiveImage.fallbackSrc) {
          return ''
        }

        const sourceMarkup = responsiveImage.sources
          .map(
            (source) =>
              `<source type="${source.type}" sizes="(min-width: 960px) 960px, 100vw" srcset="${source.srcSet}" />`
          )
          .join('')

        return `<picture>${sourceMarkup}<img src="${responsiveImage.fallbackSrc}" srcset="${
          responsiveImage.fallbackSrcSet || ''
        }" sizes="(min-width: 960px) 960px, 100vw" alt="${alt}" loading="lazy" decoding="async"${
          responsiveImage.fallbackWidth ? ` width="${responsiveImage.fallbackWidth}"` : ''
        }${
          responsiveImage.fallbackHeight ? ` height="${responsiveImage.fallbackHeight}"` : ''
        } /></picture>`
      },
    },
  })
}

export default {
  renderRichText,
  richTextToPlainText,
}
