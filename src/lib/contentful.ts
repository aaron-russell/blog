import { createClient } from 'contentful'
import { CONTENTFUL_PERSON_ID } from '../utils/structured-data'
import { normalizeTagLabel } from './blog'
import { formatBlogDate, formatHomeDate } from './date'
import { createContentfulImage } from './contentful-images'
import { renderRichText, richTextToPlainText } from './contentful-rich-text'

type ContentfulAuthor = {
  affiliatedWith?: Array<{ companyName?: string; website?: string }>
  alumniOf?: Array<{ companyName?: string; website?: string }>
  birthPlace?: { city?: string; country?: string; region?: string }
  currentLocations?: Array<{ city?: string; country?: string; region?: string }>
  description?: { description?: string }
  facebook?: string
  github?: string
  heroImage?: ReturnType<typeof createContentfulImage>
  jobTitle?: string
  linkedIn?: string
  name: string
  nationality?: string
  profilePhoto?: ReturnType<typeof createContentfulImage>
  shortBioHtml?: string
  twitter?: string
  website: string
  worksFor?: Array<{ companyName?: string; website?: string }>
}

export type BlogPostSummary = {
  author?: { name?: string; website?: string }
  bodyHtml?: string
  bodyPlainText?: string
  canonical?: string
  category?: string
  descriptionHtml?: string
  descriptionPlainText?: string
  heroImage?: ReturnType<typeof createContentfulImage>
  publishDate: string
  rawDate: string
  rawUpdatedDate?: string
  slug: string
  tags: string[]
  title: string
  updatedDate?: string
}

const getContentfulConfig = () => {
  const { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_HOST, CONTENTFUL_SPACE_ID } =
    import.meta.env
  const space = CONTENTFUL_SPACE_ID
  const accessToken = CONTENTFUL_ACCESS_TOKEN
  const host = CONTENTFUL_HOST

  if (!space || !accessToken) {
    throw new Error(
      'Missing required Contentful environment variables: CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN'
    )
  }

  return { accessToken, host, space }
}

const client = createClient(getContentfulConfig())

const mapLinkedCompany = (items: any[] | undefined) =>
  items?.map((item) => ({
    companyName: item?.fields?.companyName,
    website: item?.fields?.website,
  })) || []

const mapAuthor = async (entry: any): Promise<ContentfulAuthor> => ({
  affiliatedWith: mapLinkedCompany(entry?.fields?.affiliatedWith),
  alumniOf: mapLinkedCompany(entry?.fields?.alumniOf),
  birthPlace: entry?.fields?.birthPlace,
  currentLocations: entry?.fields?.currentLocations,
  description: {
    description: entry?.fields?.description,
  },
  facebook: entry?.fields?.facebook,
  github: entry?.fields?.github,
  heroImage: createContentfulImage(entry?.fields?.image),
  jobTitle: entry?.fields?.jobTitle,
  linkedIn: entry?.fields?.linkedIn,
  name: entry?.fields?.name || '',
  nationality: entry?.fields?.nationality,
  profilePhoto: createContentfulImage(entry?.fields?.profilePhoto),
  shortBioHtml: await renderRichText(entry?.fields?.shortBio),
  twitter: entry?.fields?.twitter,
  website: entry?.fields?.website || '',
  worksFor: mapLinkedCompany(entry?.fields?.worksFor),
})

const mapBlogPost = async (entry: any): Promise<BlogPostSummary> => {
  const publishDate = entry?.fields?.publishDate || ''
  const normalizedTags = Array.from(
    new Set(
      ((entry?.fields?.tags || []) as string[])
        .map((tag) => normalizeTagLabel(tag))
        .filter((tag): tag is string => Boolean(tag))
    )
  )

  return {
    author: entry?.fields?.author
      ? {
          name: entry.fields.author.fields?.name,
          website: entry.fields.author.fields?.website,
        }
      : undefined,
    bodyHtml: await renderRichText(entry?.fields?.body),
    bodyPlainText: richTextToPlainText(entry?.fields?.body),
    canonical: entry?.fields?.canonical,
    category: entry?.fields?.category,
    descriptionHtml: await renderRichText(entry?.fields?.description),
    descriptionPlainText: richTextToPlainText(entry?.fields?.description),
    heroImage: createContentfulImage(entry?.fields?.heroImage),
    publishDate: formatBlogDate(publishDate),
    rawDate: publishDate,
    rawUpdatedDate: entry?.sys?.updatedAt,
    slug: entry?.fields?.slug || '',
    tags: normalizedTags,
    title: entry?.fields?.title || '',
    updatedDate: entry?.sys?.updatedAt ? formatBlogDate(entry.sys.updatedAt) : undefined,
  }
}

export const getAuthor = async () => {
  const response = await client.getEntries({
    content_type: 'person',
    'sys.id': CONTENTFUL_PERSON_ID,
    include: 3,
    limit: 1,
  })

  const [author] = response.items
  if (!author) {
    throw new Error(`Unable to find Contentful person entry ${CONTENTFUL_PERSON_ID}`)
  }

  return mapAuthor(author)
}

export const getAllBlogPosts = async () => {
  const response = await client.getEntries({
    content_type: 'blogPost',
    include: 10,
    order: ['-fields.publishDate'],
  })

  return Promise.all(response.items.map(mapBlogPost))
}

export const getHomePagePosts = async () => {
  const posts = await getAllBlogPosts()

  return posts.map((post) => ({
    ...post,
    publishDate: formatHomeDate(post.rawDate),
  }))
}
