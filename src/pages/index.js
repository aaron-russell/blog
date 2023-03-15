import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'

import Layout from '../components/layout'
import Hero from '../components/hero'
import ArticlePreview from '../components/article-preview'
import Seo from '../components/seo'

class RootIndex extends React.Component {
  render() {
    const posts = get(this, 'props.data.allContentfulBlogPost.nodes')
    const [author] = get(this, 'props.data.allContentfulPerson.nodes')
    const sources = ['website', 'twitter', 'github', 'linkedIn', 'facebook']
    const sameAs = sources
      .map((source) => author[source])
      .filter((source) => source !== null)

    const personJsonLd = {
      '@context': 'http://www.schema.org',
      '@type': 'Person',
      '@id': author.website,
      name: author.name,
      alternateName: author.name,
      nationality: author.nationality,
      birthPlace: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: author.birthPlace.city,
          addressRegion: author.birthPlace.region,
          addressCountry: author.birthPlace.country,
        },
      },
      affiliation: author.affiliatedWith.map((company) => ({
        '@type': 'Organization',
        name: company.companyName,
        sameAs: [company.website],
      })),
      alumniOf: author.alumniOf.map((company) => ({
        '@type': 'CollegeOrUniversity',
        name: company.companyName,
        sameAs: [company.website],
      })),
      Description: author.shortBio,
      disambiguatingDescription: author.description,
      jobTitle: author.jobTitle,
      worksFor: author.worksFor.map((company) => ({
        '@type': 'Organization',
        name: company.companyName,
        sameAs: [company.website],
      })),
      url: author.website,
      image: `${this.props.location.protocol}//${this.props.location.host}${author.profilePhoto.gatsbyImage.images.fallback.src}`,
      address: author.currentLocations.map((location) => ({
        '@type': 'PostalAddress',
        addressLocality: location.city,
        addressRegion: location.region,
        addressCountry: location.country,
      })),
      sameAs,
    }

    console.log(this.props.location)
    return (
      <Layout location={this.props.location}>
        <Seo canonical={author.website}>
          <script type="application/ld+json">
            {JSON.stringify(personJsonLd)}
          </script>
        </Seo>
        <Hero
          image={author.heroImage.gatsbyImage}
          title={author.name}
          content={author.shortBio}
        />
        <ArticlePreview posts={posts} />
      </Layout>
    )
  }
}

export default RootIndex

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
      filter: { contentful_id: { eq: "4Ff1pPPUTdU7JI822TLc7O" } }
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
        title
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
        }
      }
    }
  }
`
