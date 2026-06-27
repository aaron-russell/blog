import React from 'react'
import { Link, graphql } from 'gatsby'
import { BLOCKS } from '@contentful/rich-text-types'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import readingTime from 'reading-time'

import Hero from '../components/hero'
import Layout from '../components/layout'
import Seo from '../components/seo'
import Tags from '../components/tags'
import * as styles from './blog-post.module.css'
import {
  absoluteUrl,
  buildBlogPostingJsonLd,
  CONTENTFUL_PERSON_ID,
} from '../utils/structured-data'

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { gatsbyImageData, description } = node.data.target
      return <GatsbyImage image={getImage(gatsbyImageData)} alt={description} />
    },
  },
}

const BlogPostTemplate = ({ data }) => {
  const post = data.contentfulBlogPost
  const previous = data.previous
  const next = data.next
  const plainTextBody = documentToPlainTextString(JSON.parse(post.body.raw))
  const { minutes: timeToRead } = readingTime(plainTextBody)

  return (
    <Layout>
      <Hero
        image={post.heroImage?.gatsbyImage}
        title={post.title}
        content={post.description}
      />
      <div className={styles.container}>
        <span className={styles.meta}>
          {post.author?.name} &middot;{' '}
          <time dateTime={post.rawDate}>{post.publishDate}</time> - {timeToRead} minute
          read
        </span>
        <div className={styles.article}>
          <div className={styles.body}>
            {post.body?.raw ? renderRichText(post.body, richTextOptions) : null}
          </div>
          <Tags tags={post.tags} />
          {previous || next ? (
            <nav aria-label="Post navigation">
              <ul className={styles.articleNavigation}>
                {previous ? (
                  <li>
                    <Link to={`/blog/${previous.slug}/`} rel="prev">
                      ← {previous.title}
                    </Link>
                  </li>
                ) : null}
                {next ? (
                  <li>
                    <Link to={`/blog/${next.slug}/`} rel="next">
                      {next.title} →
                    </Link>
                  </li>
                ) : null}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

export default BlogPostTemplate

export const Head = ({ data }) => {
  const [author] = data.allContentfulPerson.nodes
  const post = data.contentfulBlogPost
  const plainTextDescription = documentToPlainTextString(
    JSON.parse(post.description.raw)
  )
  const canonicalUrl =
    post.canonical || `${author.website}/blog/${post.slug}/`
  const seoImage = absoluteUrl(author.website, post.heroImage.resize.src)
  const ldJson = buildBlogPostingJsonLd(post, canonicalUrl, seoImage)

  return (
    <Seo
      title={post.title}
      description={plainTextDescription}
      image={seoImage}
      alt={post.heroImage.description}
      canonical={canonicalUrl}
      type="article"
    >
      <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
    </Seo>
  )
}

export const pageQuery = graphql`
  query BlogPostBySlug(
    $slug: String!
    $previousPostSlug: String
    $nextPostSlug: String
  ) {
    allContentfulPerson(
      filter: { contentful_id: { eq: "${CONTENTFUL_PERSON_ID}" } }
    ) {
      nodes {
        website
      }
    }
    contentfulBlogPost(slug: { eq: $slug }) {
      slug
      title
      canonical
      category
      author {
        name
        website
      }
      publishDate(formatString: "MMMM Do, YYYY")
      rawDate: publishDate
      heroImage {
        description
        gatsbyImage(layout: FULL_WIDTH, placeholder: BLURRED, width: 1280)
        resize(height: 630, width: 1200) {
          src
        }
      }
      body {
        raw
        references {
          ... on ContentfulAsset {
            contentful_id
            __typename
            gatsbyImageData
            description
          }
        }
      }
      tags
      description {
        raw
      }
    }
    previous: contentfulBlogPost(slug: { eq: $previousPostSlug }) {
      slug
      title
    }
    next: contentfulBlogPost(slug: { eq: $nextPostSlug }) {
      slug
      title
    }
  }
`
