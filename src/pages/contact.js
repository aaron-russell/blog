import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'

import Layout from '../components/layout'
import Hero from '../components/hero'
import * as styles from './contact.module.css'
import Seo from '../components/seo'

class ContactIndex extends React.Component {
  render() {
    const [author] = get(this, 'props.data.allContentfulPerson.nodes')

    const submitted =
      typeof window !== 'undefined' &&
      window.location.search.includes('submitted=true')

    return (
      <Layout location={this.props.location}>
        <Seo
          image={`${author.website}${author.heroImage.resize.src}`}
          alt={author.heroImage.description}
          canonical={`${author.website}/contact`}
          title="Contact me"
        >
          <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          ></script>
        </Seo>
        <Hero image={author.heroImage.gatsbyImage} title={'Contact me'} />
        <div className={styles.container}>
          <h2>Email and phone</h2>
          <address>
            <a href="mailto:aaron@russell-tech.co.uk">
              aaron@russell-tech.co.uk
            </a>
            <br />
            <a href="tel:+447411693644">07411693644</a>
          </address>
          {submitted ? (
            <h3>Thank you for your message</h3>
          ) : (
            <form className={styles.form} method="POST">
              <label>
                Name{' '}
                <input
                  placeholder="Aaron Russell"
                  type="text"
                  name="name"
                  autoCorrect={'name'}
                />
              </label>
              <label>
                Email address{' '}
                <input
                  placeholder="aaron@russell-tech.co.uk"
                  type="email"
                  name="email"
                  autoCorrect={'email'}
                />
              </label>
              <label>
                Message{' '}
                <textarea
                  placeholder="I want to know more about..."
                  name="message"
                />
              </label>
              <div
                className="cf-turnstile"
                data-sitekey="0x4AAAAAAADUKX7Xm2l9yHju"
              ></div>
              <input type="hidden" name="static-form-name" value="contact" />
              <button type="Submit">Submit</button>
            </form>
          )}
        </div>
      </Layout>
    )
  }
}

export default ContactIndex

export const pageQuery = graphql`
  query ContactQuery {
    allContentfulPerson(
      filter: { contentful_id: { eq: "4Ff1pPPUTdU7JI822TLc7O" } }
    ) {
      nodes {
        name
        shortBio {
          raw
        }
        title
        heroImage: image {
          resize(height: 630, width: 1200) {
            src
          }
          description
        }
        website
      }
    }
  }
`
