import readingTime from 'reading-time'
import { getAllBlogPosts } from '../../../lib/contentful'
import { createOgImageResponse } from '../../../lib/og'

export async function getStaticPaths() {
  const posts = await getAllBlogPosts()

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      post,
    },
  }))
}

export const GET = ({ props }: { props: Awaited<ReturnType<typeof getStaticPaths>>[number]['props'] }) => {
  const { post } = props
  const minutes = Math.max(1, Math.round(readingTime(post.bodyPlainText || '').minutes))

  return createOgImageResponse({
    category: post.category,
    domain: 'aaron-russell.co.uk',
    featured: post.tags.some((tag) => tag.toLowerCase() === 'featured'),
    kind: 'post',
    label: 'Blog post',
    publishDate: post.publishDate,
    readingTime: `${minutes} min read`,
    tags: post.tags,
    title: post.title,
  })
}
