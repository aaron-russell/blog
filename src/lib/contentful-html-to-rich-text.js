import { parseFragment } from 'parse5'

const BLOCKS = {
  DOCUMENT: 'document',
  HEADING_2: 'heading-2',
  HEADING_3: 'heading-3',
  HYPERLINK: 'hyperlink',
  LIST_ITEM: 'list-item',
  OL_LIST: 'ordered-list',
  PARAGRAPH: 'paragraph',
  TABLE: 'table',
  TABLE_CELL: 'table-cell',
  TABLE_HEADER_CELL: 'table-header-cell',
  TABLE_ROW: 'table-row',
  TEXT: 'text',
  UL_LIST: 'unordered-list',
}

const collapseWhitespace = (value = '') => value.replace(/\s+/g, ' ')

const trimInlineTextNodes = (nodes) => {
  if (!nodes.length) {
    return nodes
  }

  const nextNodes = [...nodes]
  const first = nextNodes[0]
  const last = nextNodes[nextNodes.length - 1]

  if (first.nodeType === BLOCKS.TEXT) {
    nextNodes[0] = {
      ...first,
      value: first.value.replace(/^\s+/, ''),
    }
  }

  if (last.nodeType === BLOCKS.TEXT) {
    nextNodes[nextNodes.length - 1] = {
      ...last,
      value: last.value.replace(/\s+$/, ''),
    }
  }

  return nextNodes.filter((node) => node.nodeType !== BLOCKS.TEXT || node.value)
}

const createTextNode = (value, marks = []) => ({
  data: {},
  marks,
  nodeType: BLOCKS.TEXT,
  value,
})

const mergeAdjacentTextNodes = (nodes) => {
  const merged = []

  for (const node of nodes) {
    if (!node) {
      continue
    }

    const previous = merged[merged.length - 1]

    if (
      previous?.nodeType === BLOCKS.TEXT &&
      node.nodeType === BLOCKS.TEXT &&
      JSON.stringify(previous.marks) === JSON.stringify(node.marks)
    ) {
      previous.value += node.value
      continue
    }

    merged.push(node)
  }

  return merged
}

const getTagName = (node) => node?.tagName?.toLowerCase()

const convertInlineNodes = (nodes = [], marks = []) =>
  mergeAdjacentTextNodes(
    trimInlineTextNodes(
      nodes.flatMap((node) => convertInlineNode(node, marks)).filter(Boolean)
    )
  )

const convertInlineNode = (node, marks = []) => {
  if (!node) {
    return []
  }

  if (node.nodeName === '#text') {
    const value = collapseWhitespace(node.value || '')
    return value ? [createTextNode(value, marks)] : []
  }

  const tagName = getTagName(node)

  if (!tagName) {
    return convertInlineNodes(node.childNodes || [], marks)
  }

  if (tagName === 'strong' || tagName === 'b') {
    return convertInlineNodes(node.childNodes || [], [...marks, { type: 'bold' }])
  }

  if (tagName === 'em' || tagName === 'i') {
    return convertInlineNodes(node.childNodes || [], [...marks, { type: 'italic' }])
  }

  if (tagName === 'code') {
    return convertInlineNodes(node.childNodes || [], [...marks, { type: 'code' }])
  }

  if (tagName === 'a') {
    const uri = node.attrs?.find((attr) => attr.name === 'href')?.value
    const content = convertInlineNodes(node.childNodes || [], marks)

    if (!uri || content.length === 0) {
      return content
    }

    return [
      {
        content,
        data: {
          uri,
        },
        nodeType: BLOCKS.HYPERLINK,
      },
    ]
  }

  if (tagName === 'br') {
    return [createTextNode('\n', marks)]
  }

  return convertInlineNodes(node.childNodes || [], marks)
}

const ensureParagraphContent = (content) =>
  content.length > 0 ? content : [createTextNode('')]

const createParagraph = (content) => ({
  content: ensureParagraphContent(content),
  data: {},
  nodeType: BLOCKS.PARAGRAPH,
})

const convertTableCell = (node, nodeType) => {
  const blockContent = convertBlockNodes(node.childNodes || [])
  const content = blockContent.length > 0 ? blockContent : [createParagraph(convertInlineNodes(node.childNodes || []))]

  return {
    content,
    data: {},
    nodeType,
  }
}

const flattenTableRows = (nodes = []) =>
  nodes.flatMap((node) => {
    const tagName = getTagName(node)

    if (tagName === 'thead' || tagName === 'tbody') {
      return flattenTableRows(node.childNodes || [])
    }

    if (tagName === 'tr') {
      const cells = (node.childNodes || [])
        .filter((child) => {
          const childTag = getTagName(child)
          return childTag === 'th' || childTag === 'td'
        })
        .map((child) =>
          convertTableCell(
            child,
            getTagName(child) === 'th' ? BLOCKS.TABLE_HEADER_CELL : BLOCKS.TABLE_CELL
          )
        )

      return cells.length
        ? [
            {
              content: cells,
              data: {},
              nodeType: BLOCKS.TABLE_ROW,
            },
          ]
        : []
    }

    return []
  })

const convertListItems = (nodes = []) =>
  nodes
    .filter((node) => getTagName(node) === 'li')
    .map((node) => {
      const blockContent = convertBlockNodes(node.childNodes || [])
      const content =
        blockContent.length > 0
          ? blockContent
          : [createParagraph(convertInlineNodes(node.childNodes || []))]

      return {
        content,
        data: {},
        nodeType: BLOCKS.LIST_ITEM,
      }
    })

const convertBlockNode = (node) => {
  if (!node) {
    return []
  }

  if (node.nodeName === '#text') {
    const value = collapseWhitespace(node.value || '').trim()
    return value ? [createParagraph([createTextNode(value)])] : []
  }

  const tagName = getTagName(node)

  switch (tagName) {
    case 'p':
      return [createParagraph(convertInlineNodes(node.childNodes || []))]
    case 'h2':
      return [
        {
          content: ensureParagraphContent(convertInlineNodes(node.childNodes || [])),
          data: {},
          nodeType: BLOCKS.HEADING_2,
        },
      ]
    case 'h3':
      return [
        {
          content: ensureParagraphContent(convertInlineNodes(node.childNodes || [])),
          data: {},
          nodeType: BLOCKS.HEADING_3,
        },
      ]
    case 'ul':
      return [
        {
          content: convertListItems(node.childNodes || []),
          data: {},
          nodeType: BLOCKS.UL_LIST,
        },
      ]
    case 'ol':
      return [
        {
          content: convertListItems(node.childNodes || []),
          data: {},
          nodeType: BLOCKS.OL_LIST,
        },
      ]
    case 'table':
      return [
        {
          content: flattenTableRows(node.childNodes || []),
          data: {},
          nodeType: BLOCKS.TABLE,
        },
      ]
    case 'div':
    case 'section':
    case 'article':
      return convertBlockNodes(node.childNodes || [])
    default:
      return convertBlockNodes(node.childNodes || [])
  }
}

const convertBlockNodes = (nodes = []) => nodes.flatMap((node) => convertBlockNode(node))

export const htmlToRichText = (html = '') => {
  const fragment = parseFragment(html)

  return {
    content: convertBlockNodes(fragment.childNodes || []),
    data: {},
    nodeType: BLOCKS.DOCUMENT,
  }
}

export default {
  htmlToRichText,
}
