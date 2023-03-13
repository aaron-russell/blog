import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'

import Layout from '../components/layout'
import Hero from '../components/hero'
import * as styles from './contact.module.css'

import * as cfStatic from '@cloudflare/pages-plugin-static-forms'

cfStatic
class ContactIndex extends React.Component {
  render() {
    const [author] = get(this, 'props.data.allContentfulPerson.nodes')

    return (
      <Layout location={this.props.location}>
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
          <form className={styles.form} data-static-form-name="contact">
            <label>
              Email address{' '}
              <input
                placeholder="aaron@russell-tech.co.uk"
                type="email"
                name="email"
              />
            </label>
            <label>
              Message{' '}
              <textarea
                placeholder="I want to know more about..."
                name="message"
              />
            </label>
            <button type="Submit">Submit</button>
          </form>
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
          gatsbyImage(layout: CONSTRAINED, placeholder: BLURRED, width: 1180)
        }
      }
    }
  }
`
