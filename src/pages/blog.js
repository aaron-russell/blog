import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'

import Seo from '../components/seo'
import Layout from '../components/layout'
import Hero from '../components/hero'
import ArticlePreview from '../components/article-preview'

class BlogIndex extends React.Component {
  render() {
    const posts = get(this, 'props.data.allContentfulBlogPost.nodes')
    const [author] = get(this, 'props.data.allContentfulPerson.nodes')

    return (
      <Layout location={this.props.location}>
        <Seo
          image={`${author.website}${author.heroImage.resize.src}`}
          alt={author.heroImage.description}
          canonical={`${author.website}/contact`}
          title="Blog"
        />
        <Hero title="Blog" />
        <ArticlePreview posts={posts} />
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query BlogIndexQuery {
    allContentfulPerson(
      filter: { contentful_id: { eq: "4Ff1pPPUTdU7JI822TLc7O" } }
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
