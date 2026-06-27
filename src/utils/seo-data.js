export const buildPageTitle = (title, siteTitle) =>
  title ? `${title} | ${siteTitle}` : siteTitle

export const buildWebsiteJsonLd = (siteMetadata) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  ...(siteMetadata.description ? { description: siteMetadata.description } : {}),
  name: siteMetadata.title,
  url: siteMetadata.siteUrl,
})

export const buildSeoMetaTags = ({
  canonical,
  description,
  image,
  imageAlt,
  meta = [],
  siteMetadata,
  title,
  type = 'website',
}) =>
  [
    {
      name: 'description',
      content: description || siteMetadata.description,
    },
    image
      ? {
          name: 'image',
          content: image,
        }
      : null,
    {
      property: 'og:title',
      content: title || siteMetadata.title,
    },
    {
      property: 'og:description',
      content: description || siteMetadata.description,
    },
    {
      property: 'og:type',
      content: type,
    },
    {
      property: 'og:site_name',
      content: siteMetadata.title,
    },
    image
      ? {
          property: 'og:image',
          content: image,
        }
      : null,
    canonical
      ? {
          property: 'og:url',
          content: canonical,
        }
      : null,
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:creator',
      content: siteMetadata.social?.twitter || '',
    },
    {
      name: 'twitter:title',
      content: title || siteMetadata.title,
    },
    image
      ? {
          name: 'twitter:image',
          content: image,
        }
      : null,
    image
      ? {
          name: 'twitter:image:alt',
          content: imageAlt || title || siteMetadata.title,
        }
      : null,
    {
      name: 'twitter:site',
      content: siteMetadata.social?.twitter || '',
    },
    {
      name: 'twitter:description',
      content: description || siteMetadata.description,
    },
    ...meta,
  ].filter(Boolean)

export default {
  buildPageTitle,
  buildSeoMetaTags,
  buildWebsiteJsonLd,
}
