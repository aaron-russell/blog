import * as React from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'
import { globalHistory } from '@reach/router'

const Seo = ({
  description = '',
  lang = 'en',
  meta = [],
  title,
  image,
  canonical,
  children,
}) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            social {
              twitter
            }
            siteUrl
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description
  const defaultTitle = site.siteMetadata?.title

  globalHistory.listen(({ action }) => {
    if (action === 'PUSH') {
      // eslint-disable-next-line no-undef, no-unused-expressions -- zaraz is defined in the HTML
      typeof zaraz !== 'undefined' ? zaraz.track('Pageview') : null
    }
  })
  console.log(site)
  const websiteLdJson = {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    name: defaultTitle,
    url: site.siteMetadata.siteUrl,
  }

  return (
    <>
      <Helmet
        htmlAttributes={{
          lang,
        }}
        title={title}
        defaultTitle={defaultTitle}
        titleTemplate={defaultTitle ? `%s | ${defaultTitle}` : null}
        meta={[
          {
            name: `description`,
            content: metaDescription,
          },
          {
            name: `image`,
            content: image,
          },
          {
            property: `og:title`,
            content: title,
          },
          {
            property: `og:description`,
            content: metaDescription,
          },
          {
            property: `og:type`,
            content: `website`,
          },
          {
            property: `og:image`,
            content: image,
          },
          {
            name: `twitter:card`,
            content: `summary_large_image`,
          },
          {
            name: `twitter:creator`,
            content: site.siteMetadata?.social?.twitter || ``,
          },
          {
            name: `twitter:title`,
            content: title,
          },
          {
            name: `twitter:description`,
            content: metaDescription,
          },
          {
            name: 'canonical',
            content: canonical,
          },
          {
            name: 'msapplication-TileColor',
            content: '#da532c',
          },
          {
            name: 'theme-color',
            content: '#ffffff',
          },
        ].concat(meta)}
      >
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "4950be0a138f41edbbc64222fe737302"}'
        ></script>
        {children}
        <script type="application/ld+json">
          {JSON.stringify(websiteLdJson)}
        </script>
      </Helmet>
    </>
  )
}

export default Seo
