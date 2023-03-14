import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'

import Layout from '../components/layout'
import Hero from '../components/hero'
import * as styles from './contact.module.css'

class ContactIndex extends React.Component {
  render() {
    const [author] = get(this, 'props.data.allContentfulPerson.nodes')

    const submitted = window.location.search.includes('submitted=true')

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
          gatsbyImage(layout: CONSTRAINED, placeholder: BLURRED, width: 1180)
        }
      }
    }
  }
`
