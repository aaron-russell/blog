import type { BlogPostSummary } from './contentful'

const postHaystack = (post: BlogPostSummary) =>
  [post.title, post.slug, post.category, post.descriptionPlainText, ...(post.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

export const findPostByTerms = (posts: BlogPostSummary[], terms: string[]) =>
  posts
    .map((post) => ({
      post,
      score: terms.filter((term) => postHaystack(post).includes(term.toLowerCase())).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)[0]?.post

export const findPostsByTerms = (posts: BlogPostSummary[], terms: string[], limit = 3) =>
  posts
    .filter((post) => terms.some((term) => postHaystack(post).includes(term.toLowerCase())))
    .slice(0, limit)
