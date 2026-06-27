import React from 'react'
import { graphql } from 'gatsby'

import Hero from '../components/hero'
import Layout from '../components/layout'
import Seo from '../components/seo'
import * as styles from './contact.module.css'
import { absoluteUrl, CONTENTFUL_PERSON_ID } from '../utils/structured-data'

const CONTACT_MESSAGES = {
  success: 'Thank you for your message. I will get back to you soon.',
  invalid: 'Please complete the required fields and try again.',
  verification: 'Please complete the Turnstile check before sending your message.',
  blocked: 'Your message could not be sent. Please email me directly if the issue continues.',
  rate_limited: 'Please wait a few minutes before sending another message.',
}

const ContactIndex = ({ data, location }) => {
  const [author] = data.allContentfulPerson.nodes
  const searchParams = new URLSearchParams(location?.search || '')
  const submitted = searchParams.get('submitted')
  const error = searchParams.get('error')
  const message = submitted === 'success' ? CONTACT_MESSAGES.success : CONTACT_MESSAGES[error]

  return (
    <Layout>
      <Hero image={author.heroImage.gatsbyImage} title="Contact me" />
      <div className={styles.container}>
        <h2>Email and phone</h2>
        <address>
          <a href="mailto:aaron@russell-tech.co.uk">aaron@russell-tech.co.uk</a>
          <br />
          <a href="tel:+447411693644">07411693644</a>
        </address>
        {message ? (
          <p
            className={
              submitted === 'success' ? styles.statusSuccess : styles.statusError
            }
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
        <form className={styles.form} method="POST">
          <label htmlFor="name">
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            placeholder="Aaron Russell"
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
          />

          <label htmlFor="email">
            Email address <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            placeholder="aaron@russell-tech.co.uk"
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={200}
          />

          <label htmlFor="message">
            Message <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            placeholder="I want to know more about..."
            name="message"
            required
            minLength={10}
            maxLength={4000}
          />

          <div className={styles.honeypotField} aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          <div
            className="cf-turnstile"
            data-sitekey="0x4AAAAAAADUKX7Xm2l9yHju"
            data-theme="light"
          ></div>
          <input type="hidden" name="static-form-name" value="contact" />
          <button type="submit">Send message</button>
        </form>
      </div>
    </Layout>
  )
}

export default ContactIndex

export const Head = ({ data }) => {
  const [author] = data.allContentfulPerson.nodes

  return (
    <Seo
      image={absoluteUrl(author.website, author.heroImage.resize.src)}
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
  )
}

export const pageQuery = graphql`
  query ContactQuery {
    allContentfulPerson(
      filter: { contentful_id: { eq: "${CONTENTFUL_PERSON_ID}" } }
    ) {
      nodes {
        heroImage: image {
          gatsbyImage(layout: CONSTRAINED, placeholder: BLURRED, width: 1180)
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
