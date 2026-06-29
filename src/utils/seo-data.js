export const buildPageTitle = (title, siteTitle) =>
  title ? `${title} | ${siteTitle}` : siteTitle

export const resolveCanonicalUrl = ({ canonical, pathname, siteUrl }) => {
  const canonicalPageUrl = new URL(pathname, `${siteUrl}/`)

  if (!canonical) {
    return canonicalPageUrl.toString()
  }

  try {
    const configuredUrl = new URL(canonical, `${siteUrl}/`)
    const configuredPath = configuredUrl.pathname.replace(/\/+$/, '')
    const canonicalPagePath = canonicalPageUrl.pathname.replace(/\/+$/, '')

    if (
      configuredUrl.origin === canonicalPageUrl.origin &&
      configuredPath === canonicalPagePath
    ) {
      configuredUrl.pathname = canonicalPageUrl.pathname
    }

    return configuredUrl.toString()
  } catch {
    return canonicalPageUrl.toString()
  }
}

export const buildWebsiteJsonLd = (siteMetadata) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  ...(siteMetadata.description ? { description: siteMetadata.description } : {}),
  name: siteMetadata.title,
  url: siteMetadata.siteUrl,
})

export const normalizeMetaDescription = (value = '', maxLength = 160) => {
  let description = value.trim().replace(/\s+/g, ' ')
  const repeatedDescription = description.match(/^(.+?)\s+\1$/)

  if (repeatedDescription) {
    description = repeatedDescription[1]
  }

  if (description.length % 2 === 0) {
    const midpoint = description.length / 2
    if (description.slice(0, midpoint) === description.slice(midpoint)) {
      description = description.slice(0, midpoint)
    }
  }

  if (description.length <= maxLength) {
    return description
  }

  const shortened = description.slice(0, maxLength - 1)
  const lastSpace = shortened.lastIndexOf(' ')
  return `${shortened.slice(0, lastSpace > 100 ? lastSpace : shortened.length).trimEnd()}…`
}

export const buildSeoMetaTags = ({
  canonical,
  description,
  image,
  imageAlt,
  imageHeight,
  imageType,
  imageWidth,
  modifiedTime,
  meta = [],
  publishedTime,
  siteMetadata,
  title,
  type = 'website',
}) => {
  const metaDescription = normalizeMetaDescription(
    description || siteMetadata.description
  )

  return [
    {
      name: 'description',
      content: metaDescription,
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
      content: metaDescription,
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
    image && imageWidth
      ? {
          property: 'og:image:width',
          content: String(imageWidth),
        }
      : null,
    image && imageHeight
      ? {
          property: 'og:image:height',
          content: String(imageHeight),
        }
      : null,
    image && imageType
      ? {
          property: 'og:image:type',
          content: imageType,
        }
      : null,
    canonical
      ? {
          property: 'og:url',
          content: canonical,
        }
      : null,
    type === 'article' && publishedTime
      ? {
          property: 'article:published_time',
          content: publishedTime,
        }
      : null,
    type === 'article' && modifiedTime
      ? {
          property: 'article:modified_time',
          content: modifiedTime,
        }
      : null,
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    siteMetadata.social?.twitter
      ? {
          name: 'twitter:creator',
          content: siteMetadata.social.twitter,
        }
      : null,
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
    image && imageType
      ? {
          name: 'twitter:image:type',
          content: imageType,
        }
      : null,
    image
      ? {
          name: 'twitter:image:alt',
          content: imageAlt || title || siteMetadata.title,
        }
      : null,
    siteMetadata.social?.twitter
      ? {
          name: 'twitter:site',
          content: siteMetadata.social.twitter,
        }
      : null,
    {
      name: 'twitter:description',
      content: metaDescription,
    },
    ...meta,
  ].filter(Boolean)
}

export default {
  buildPageTitle,
  buildSeoMetaTags,
  buildWebsiteJsonLd,
  normalizeMetaDescription,
  resolveCanonicalUrl,
}
