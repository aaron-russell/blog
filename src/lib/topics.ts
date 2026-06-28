import type { BlogPostSummary } from './contentful'

export type TopicDefinition = {
  description: string
  intro: string
  keywords: string[]
  name: string
  path: string
  title: string
}

export const TOPIC_DEFINITIONS: TopicDefinition[] = [
  {
    description:
      'Practical notes on Angular architecture, Firebase trade-offs, and building maintainable app foundations.',
    intro:
      'A curated path through framework decisions, app architecture, and backend choices for product teams shipping real software.',
    keywords: ['angular', 'react', 'vue', 'firebase', 'supabase', 'amplify', 'appwrite'],
    name: 'Angular and app architecture',
    path: 'angular',
    title: 'Angular, Firebase, and app architecture',
  },
  {
    description:
      'Notes on Astro, Cloudflare Pages, edge delivery, and static-first systems that stay easy to maintain.',
    intro:
      'These posts focus on the publishing stack behind this site and the Cloudflare-native patterns that keep delivery fast and operationally light.',
    keywords: ['astro', 'cloudflare', 'wordpress', 'contentful', 'ghost', 'medium'],
    name: 'Astro and Cloudflare',
    path: 'cloudflare',
    title: 'Astro, Cloudflare, and static-first delivery',
  },
  {
    description:
      'Performance, Core Web Vitals, SEO, and web platform decisions that improve discovery and real-world usability.',
    intro:
      'A reading path for site speed, search, analytics, and front-end decisions that shape how sites perform and get found.',
    keywords: ['performance', 'pagespeed', 'seo', 'security', 'web development'],
    name: 'Performance and SEO',
    path: 'performance',
    title: 'Performance, SEO, and web platform quality',
  },
]

const matchesTopicKeyword = (post: BlogPostSummary, keyword: string) => {
  const haystack = [
    post.title,
    post.category,
    post.descriptionPlainText,
    post.bodyPlainText,
    ...(post.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(keyword.toLowerCase())
}

export const getTopicPosts = (posts: BlogPostSummary[], topicPath: string) => {
  const topic = TOPIC_DEFINITIONS.find((item) => item.path === topicPath)

  if (!topic) {
    return []
  }

  return posts.filter((post) => topic.keywords.some((keyword) => matchesTopicKeyword(post, keyword)))
}

export const getTopicDefinition = (topicPath: string) =>
  TOPIC_DEFINITIONS.find((item) => item.path === topicPath)

export const getFeaturedTopics = (posts: BlogPostSummary[]) =>
  TOPIC_DEFINITIONS.map((topic) => ({
    ...topic,
    postCount: getTopicPosts(posts, topic.path).length,
  })).filter((topic) => topic.postCount > 0)
