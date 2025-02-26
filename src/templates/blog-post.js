import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import readingTime from 'reading-time'

import Seo from '../components/seo'
import Layout from '../components/layout'
import Hero from '../components/hero'
import Tags from '../components/tags'
import * as styles from './blog-post.module.css'

class BlogPostTemplate extends React.Component {
  render() {
    const post = get(this.props, 'data.contentfulBlogPost')
    const previous = get(this.props, 'data.previous')
    const next = get(this.props, 'data.next')
    const [author] = get(this, 'props.data.allContentfulPerson.nodes')

    const plainTextDescription = documentToPlainTextString(
      JSON.parse(post.description.raw)
    )
    const plainTextBody = documentToPlainTextString(JSON.parse(post.body.raw))
    const { minutes: timeToRead } = readingTime(plainTextBody)

    const options = {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const { gatsbyImageData, description } = node.data.target
          return (
            <GatsbyImage image={getImage(gatsbyImageData)} alt={description} />
          )
        },
      },
    }

    const ldJson = {
      '@context': 'http://schema.org',
      '@type': 'BlogPosting',
      image: post.heroImage.resize.src,
      url: `${this.props.location.href}`,
      headline: post.title,
      datePublished: post.rawDate,
      inLanguage: 'en-GB',
      isFamilyFriendly: 'true',
      copyrightYear: new Date().getFullYear(),
      copyrightHolder: post.author.name,
      accountablePerson: {
        '@type': 'Person',
        name: post.author.name,
        url: post.author.website,
      },
      author: {
        '@type': 'Person',
        name: post.author.name,
        url: post.author.website,
      },
      creator: {
        '@type': 'Person',
        name: post.author.name,
        url: post.author.website,
      },
      mainEntityOfPage: 'True',
      keywords: post.tags,
      genre: post.category,
    }

    return (
      <Layout location={this.props.location}>
        <Seo
          title={post.title}
          description={plainTextDescription}
          image={`${author.website}${post.heroImage.resize.src}`}
          alt={post.heroImage.description}
          canonical={post.canonical}
        >
          <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
        </Seo>
        <Hero
          image={post.heroImage?.gatsbyImage}
          title={post.title}
          content={post.description}
        />
        <div className={styles.container}>
          <span className={styles.meta}>
            {post.author?.name} &middot;{' '}
            <time dateTime={post.rawDate}>{post.publishDate}</time> –{' '}
            {timeToRead} minute read
          </span>
          <div className={styles.article}>
            <div className={styles.body}>
              {post.body?.raw && renderRichText(post.body, options)}
            </div>
            <Tags tags={post.tags} />
            {(previous || next) && (
              <nav>
                <ul className={styles.articleNavigation}>
                  {previous && (
                    <li>
                      <Link to={`/blog/${previous.slug}`} rel="prev">
                        ← {previous.title}
                      </Link>
                    </li>
                  )}
                  {next && (
                    <li>
                      <Link to={`/blog/${next.slug}`} rel="next">
                        {next.title} →
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $slug: String!
    $previousPostSlug: String
    $nextPostSlug: String
  ) {
    allContentfulPerson(
      filter: { contentful_id: { eq: "4Ff1pPPUTdU7JI822TLc7O" } }
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
