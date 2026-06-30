import type { BlogPostSummary } from './contentful'
import { getPostTopicPaths } from './topics'

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

export const stripHtml = stripTags

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const TAG_ALIASES: Record<string, string> = {
  'my story': 'My Story',
  pagespeed: 'PageSpeed',
  quesrions: 'Questions',
  'web development': 'Web Development',
}

const normalizeTagKey = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()

export const normalizeTagLabel = (value = '') => {
  const cleanedValue = value.trim().replace(/\s+/g, ' ')

  if (!cleanedValue) {
    return ''
  }

  return TAG_ALIASES[normalizeTagKey(cleanedValue)] || cleanedValue
}

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

export const getFirstParagraphText = (html = '') => {
  const match = html.match(/<p>([\s\S]*?)<\/p>/i)
  return match ? stripTags(match[1]) : ''
}

export const buildArticleSummaryPoints = ({
  headings = [],
  post,
  relatedProject,
  timeToRead,
}: {
  headings?: TocHeading[]
  post: BlogPostSummary
  relatedProject?: { name: string } | null
  timeToRead: number
}) => {
  const points = [
    post.descriptionPlainText || createExcerpt(post.bodyPlainText || '', 150),
    headings.length
      ? `Covers ${headings
          .slice(0, 3)
          .map((heading) => heading.text)
          .join(', ')}.`
      : undefined,
    post.tags?.length ? `Key topics: ${post.tags.slice(0, 4).join(', ')}.` : undefined,
    `Published ${post.publishDate}${post.updatedDate ? ` and updated ${post.updatedDate}` : ''}.`,
    relatedProject ? `Connected project: ${relatedProject.name}.` : `${Math.max(1, Math.round(timeToRead))} minute read.`,
  ]

  return points.filter(Boolean).slice(0, 5)
}

export const buildArticleFaqs = ({
  headings = [],
  post,
  relatedProject,
  timeToRead,
}: {
  headings?: TocHeading[]
  post: BlogPostSummary
  relatedProject?: { name: string; description?: string } | null
  timeToRead: number
}) => {
  const firstHeadings = headings.slice(0, 3).map((heading) => heading.text)

  return [
    {
      question: `What is ${post.title} about?`,
      answer:
        post.descriptionPlainText || createExcerpt(post.bodyPlainText || '', 220),
    },
    {
      question: 'Who is this article for?',
      answer: `It is written for developers, product engineers, and technical teams working with ${post.tags?.slice(0, 3).join(', ') || 'modern web tooling'}.`,
    },
    {
      question: 'What does the article cover?',
      answer: firstHeadings.length
        ? `The main sections cover ${firstHeadings.join(', ')}.`
        : `The article covers the main implementation details, trade-offs, and practical notes from the work.`,
    },
    {
      question: 'When was this article published or updated?',
      answer: post.updatedDate
        ? `It was published on ${post.publishDate} and updated on ${post.updatedDate}.`
        : `It was published on ${post.publishDate}.`,
    },
    {
      question: 'How long will this article take to read?',
      answer: `It should take about ${Math.max(1, Math.round(timeToRead))} minutes to read.`,
    },
    {
      question: 'Is this article connected to a broader project?',
      answer: relatedProject
        ? `Yes. It connects back to ${relatedProject.name}, ${relatedProject.description || 'a related project discussed elsewhere on the site'}.`
        : 'It stands on its own, but it also links into the wider project and topic collections on the site.',
    },
  ]
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
      const currentTopics = getPostTopicPaths(currentPost)
      const sharedTopics = getPostTopicPaths(post).filter((topic) =>
        currentTopics.includes(topic)
      ).length

      return {
        post,
        score:
          sharedTags * 10 +
          sharedTopics * 6 +
          (post.category && post.category === currentPost.category ? 3 : 0),
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
