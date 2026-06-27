import React from 'react'
import { graphql } from 'gatsby'

import ArticlePreview from '../components/article-preview'
import Hero from '../components/hero'
import Layout from '../components/layout'
import Seo from '../components/seo'
import { absoluteUrl, CONTENTFUL_PERSON_ID } from '../utils/structured-data'

const BlogIndex = ({ data }) => {
  const posts = data.allContentfulBlogPost.nodes

  return (
    <Layout>
      <Hero title="Blog" />
      <ArticlePreview posts={posts} />
    </Layout>
  )
}

export default BlogIndex

export const Head = ({ data }) => {
  const [author] = data.allContentfulPerson.nodes

  return (
    <Seo
      image={absoluteUrl(author.website, author.heroImage.resize.src)}
      alt={author.heroImage.description}
      canonical={`${author.website}/blog`}
      title="Blog"
    />
  )
}

export const pageQuery = graphql`
  query BlogIndexQuery {
    allContentfulPerson(
      filter: { contentful_id: { eq: "${CONTENTFUL_PERSON_ID}" } }
    ) {
      nodes {
        website
        heroImage: image {
          resize(height: 630, width: 1200) {
            src
          }
          description
        }
      }
    }
    allContentfulBlogPost(sort: { publishDate: DESC }) {
      nodes {
        title
        slug
        publishDate(formatString: "MMMM Do, YYYY")
        tags
        heroImage {
          gatsbyImage(
            layout: FULL_WIDTH
            placeholder: BLURRED
            width: 424
            height: 212
          )
          description
        }
        description {
          raw
        }
      }
    }
  }
`
