import { getAllBlogPosts } from '../lib/contentful'
import { siteMetadata } from '../lib/site-config'

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export async function GET() {
  const posts = await getAllBlogPosts()
  const items = posts
    .map((post) => {
      const url = new URL(`/blog/${post.slug}/`, siteMetadata.siteUrl).toString()
      const description = escapeXml(post.descriptionPlainText || post.bodyPlainText || '')

      return [
        '<item>',
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid>${post.canonical || url}</guid>`,
        `<pubDate>${new Date(post.rawDate).toUTCString()}</pubDate>`,
        `<description>${description}</description>`,
        ...post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
        '</item>',
      ].join('')
    })
    .join('')

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `<title>${escapeXml(siteMetadata.title)}</title>`,
    `<link>${siteMetadata.siteUrl}</link>`,
    `<description>${escapeXml(siteMetadata.description)}</description>`,
    items,
    '</channel>',
    '</rss>',
  ].join('')

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
