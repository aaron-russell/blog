import React from 'react'
import { graphql } from 'gatsby'

import ArticlePreview from '../components/article-preview'
import Hero from '../components/hero'
import Layout from '../components/layout'
import Seo from '../components/seo'
import {
  buildPersonJsonLd,
  absoluteUrl,
  CONTENTFUL_PERSON_ID,
} from '../utils/structured-data'

const RootIndex = ({ data }) => {
  const posts = data.allContentfulBlogPost.nodes
  const [author] = data.allContentfulPerson.nodes

  return (
    <Layout>
      <Hero
        image={author.heroImage.gatsbyImage}
        title={author.name}
        content={author.shortBio}
      />
      <ArticlePreview posts={posts} />
    </Layout>
  )
}

export default RootIndex

export const Head = ({ data }) => {
  const [author] = data.allContentfulPerson.nodes
  const personJsonLd = buildPersonJsonLd(
    author,
    absoluteUrl(author.website, author.profilePhoto.gatsbyImage.images.fallback.src)
  )

  return (
    <Seo
      image={absoluteUrl(author.website, author.heroImage.resize.src)}
      alt={author.heroImage.description}
      canonical={author.website}
    >
      <script type="application/ld+json">{JSON.stringify(personJsonLd)}</script>
    </Seo>
  )
}

export const pageQuery = graphql`
  query HomeQuery {
    allContentfulBlogPost(sort: { publishDate: DESC }) {
      nodes {
        title
        slug
        publishDate(formatString: "Do MMMM YYYY")
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
    allContentfulPerson(
      filter: { contentful_id: { eq: "${CONTENTFUL_PERSON_ID}" } }
    ) {
      nodes {
        name
        shortBio {
          raw
        }
        website
        nationality
        birthPlace {
          city
          region
          country
        }
        affiliatedWith {
          companyName
          website
        }
        alumniOf {
          companyName
          website
        }
        description {
          description
        }
        jobTitle
        worksFor {
          companyName
          website
        }
        currentLocations {
          city
          region
          country
        }
        profilePhoto {
          gatsbyImage(layout: CONSTRAINED, placeholder: BLURRED, width: 1180)
        }
        twitter
        linkedIn
        facebook
        github
        heroImage: image {
          gatsbyImage(layout: CONSTRAINED, placeholder: BLURRED, width: 1180)
          resize(height: 630, width: 1200) {
            src
          }
          description
        }
      }
    }
  }
`
