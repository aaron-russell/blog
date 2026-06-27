import type { BlogPostSummary } from './contentful'

type TocHeading = {
  depth: number
  id: string
  text: string
}

const stripTags = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export const createExcerpt = (value = '', maxLength = 180) => {
  const text = value.trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

export const annotateArticleHtml = (html = '') => {
  const headings: TocHeading[] = []
  const counts = new Map<string, number>()

  const enhancedHtml = html.replace(
    /<h([2-3])>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, content: string) => {
      const text = stripTags(content)
      if (!text) {
        return _match
      }

      const baseId = slugify(text) || 'section'
      const seen = counts.get(baseId) || 0
      counts.set(baseId, seen + 1)
      const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`

      headings.push({
        depth: Number(level),
        id,
        text,
      })

      return `<h${level} id="${id}">${content}</h${level}>`
    }
  )

  return { headings, html: enhancedHtml }
}

export const getTopTags = (posts: BlogPostSummary[], limit = 6) =>
  Array.from(
    posts.reduce((map, post) => {
      post.tags.forEach((tag) => {
        map.set(tag, (map.get(tag) || 0) + 1)
      })

      return map
    }, new Map<string, number>())
  )
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]
      }

      return a[0].localeCompare(b[0])
    })
    .slice(0, limit)
    .map(([tag, count]) => ({ count, tag }))

export const getRelatedPosts = (
  currentPost: BlogPostSummary,
  posts: BlogPostSummary[],
  limit = 3
) =>
  posts
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag)).length

      return {
        post,
        score: sharedTags * 10 + (post.category && post.category === currentPost.category ? 3 : 0),
      }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      return b.post.rawDate.localeCompare(a.post.rawDate)
    })
    .slice(0, limit)
    .map((entry) => entry.post)
