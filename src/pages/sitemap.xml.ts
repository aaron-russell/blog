import { getAllBlogPosts } from '../lib/contentful'
import { siteMetadata } from '../lib/site-config'

const toAbsoluteUrl = (path: string) => new URL(path, siteMetadata.siteUrl).toString()

export async function GET() {
  const posts = await getAllBlogPosts()
  const urls = [
    toAbsoluteUrl('/'),
    toAbsoluteUrl('/blog/'),
    toAbsoluteUrl('/contact/'),
    ...posts.map((post) => toAbsoluteUrl(`/blog/${post.slug}/`)),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n')}\n</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
