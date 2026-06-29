import { getAllBlogPosts } from '../lib/contentful'
import { siteMetadata } from '../lib/site-config'
import { getFeaturedTopics } from '../lib/topics'

const toAbsoluteUrl = (path: string) => new URL(path, siteMetadata.siteUrl).toString()
const toIsoDate = (value?: string) => {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

export async function GET() {
  const posts = await getAllBlogPosts()
  const featuredTopics = getFeaturedTopics(posts)
  const latestPostDate = posts
    .map((post) => post.rawUpdatedDate || post.rawDate)
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left))[0]

  const urls = [
    {
      loc: toAbsoluteUrl('/'),
      lastmod: toIsoDate(latestPostDate),
    },
    {
      loc: toAbsoluteUrl('/blog/'),
      lastmod: toIsoDate(latestPostDate),
    },
    {
      loc: toAbsoluteUrl('/contact/'),
    },
    {
      loc: toAbsoluteUrl('/about/'),
    },
    {
      loc: toAbsoluteUrl('/projects/'),
    },
    {
      loc: toAbsoluteUrl('/projects/pit-crew/'),
    },
    {
      loc: toAbsoluteUrl('/now/'),
    },
    {
      loc: toAbsoluteUrl('/uses/'),
    },
    {
      loc: toAbsoluteUrl('/editorial-policy/'),
    },
    ...featuredTopics.map((topic) => ({
      loc: toAbsoluteUrl(`/topics/${topic.path}/`),
      lastmod: toIsoDate(latestPostDate),
    })),
    ...posts.map((post) => ({
      loc: toAbsoluteUrl(`/blog/${post.slug}/`),
      lastmod: toIsoDate(post.rawUpdatedDate || post.rawDate),
    })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ lastmod, loc }) =>
        `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    )
    .join('\n')}\n</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
