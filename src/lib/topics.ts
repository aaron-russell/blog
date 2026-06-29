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
  {
    description:
      'Experience-led notes on AI-assisted development, agent workflows, review practices, and keeping human judgement in the delivery loop.',
    intro:
      'A practical reading path for using AI in real engineering work: where it saves time, where verification matters, and how the workflow changes once a prototype has to become maintainable software.',
    keywords: ['ai-assisted', 'artificial intelligence', 'agent', 'copilot', 'ai workflow'],
    name: 'AI-assisted development',
    path: 'ai-assisted-development',
    title: 'AI-assisted development and engineering workflows',
  },
  {
    description:
      'Product notes on taking indie ideas from an early concept through architecture, launch, operations, and iteration.',
    intro:
      'This collection follows the product-building decisions behind independent software: choosing a narrow problem, shipping the first useful version, managing platform trade-offs, and learning from real users.',
    keywords: ['pit crew', 'indie', 'product building', 'fantasy motorsport', 'capacitor', 'app development'],
    name: 'Indie product building',
    path: 'indie-products',
    title: 'Indie product building, from idea to production',
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

export const getPostTopicPaths = (post: BlogPostSummary) =>
  TOPIC_DEFINITIONS.filter((topic) =>
    topic.keywords.some((keyword) => matchesTopicKeyword(post, keyword))
  ).map((topic) => topic.path)

export const getFeaturedTopics = (posts: BlogPostSummary[]) =>
  TOPIC_DEFINITIONS.map((topic) => ({
    ...topic,
    postCount: getTopicPosts(posts, topic.path).length,
  })).filter((topic) => topic.postCount > 0)
