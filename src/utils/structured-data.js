export const CONTENTFUL_PERSON_ID = '4Ff1pPPUTdU7JI822TLc7O'
export const PERSON_SCHEMA_ID = '#person'
export const ORGANIZATION_SCHEMA_ID = '#organization'

const PERSON_SOCIAL_FIELDS = [
  'website',
  'twitter',
  'github',
  'linkedIn',
  'facebook',
  'stackOverflow',
]

const PROFILE_BASE_URLS = {
  facebook: 'https://www.facebook.com/',
  github: 'https://github.com/',
  linkedIn: 'https://www.linkedin.com/in/',
  stackOverflow: 'https://stackoverflow.com/users/',
  twitter: 'https://x.com/',
}

const normalizeProfileUrl = (field, value) => {
  if (!value) {
    return undefined
  }

  try {
    return new URL(value).toString()
  } catch {
    const baseUrl = PROFILE_BASE_URLS[field]
    return baseUrl ? new URL(String(value).replace(/^@/, ''), baseUrl).toString() : undefined
  }
}

export const absoluteUrl = (baseUrl, path) => {
  if (!path) {
    return undefined
  }

  return new URL(path, baseUrl).toString()
}

export const getPersonSameAs = (author) =>
  PERSON_SOCIAL_FIELDS.map((field) => normalizeProfileUrl(field, author?.[field])).filter(Boolean)

export const buildPersonSchemaId = (baseUrl) => absoluteUrl(baseUrl, PERSON_SCHEMA_ID)
export const buildOrganizationSchemaId = (baseUrl) =>
  absoluteUrl(baseUrl, ORGANIZATION_SCHEMA_ID)

export const buildPersonJsonLd = (author, imageUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': buildPersonSchemaId(author.website),
  name: author.name,
  alternateName: author.name,
  nationality: author.nationality,
  birthPlace: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: author.birthPlace?.city,
      addressRegion: author.birthPlace?.region,
      addressCountry: author.birthPlace?.country,
    },
  },
  affiliation: author.affiliatedWith?.map((company) => ({
    '@type': 'Organization',
    name: company.companyName,
    sameAs: company.website ? [company.website] : undefined,
  })),
  alumniOf: author.alumniOf?.map((company) => ({
    '@type': 'CollegeOrUniversity',
    name: company.companyName,
    sameAs: company.website ? [company.website] : undefined,
  })),
  description: author.description?.description,
  disambiguatingDescription: author.description?.description,
  jobTitle: author.jobTitle,
  worksFor: author.worksFor?.map((company) => ({
    '@type': 'Organization',
    name: company.companyName,
    sameAs: company.website ? [company.website] : undefined,
  })),
  url: author.website,
  image: imageUrl,
  address: author.currentLocations?.map((location) => ({
    '@type': 'PostalAddress',
    addressLocality: location.city,
    addressRegion: location.region,
    addressCountry: location.country,
  })),
  sameAs: getPersonSameAs(author),
})

export const buildProfilePageJsonLd = (author, imageUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': absoluteUrl(author.website, '/about/#profile'),
  url: absoluteUrl(author.website, '/about/'),
  name: `${author.name} profile`,
  description: author.description?.description,
  mainEntity: buildPersonJsonLd(author, imageUrl),
})

/**
 * @param {any} author
 * @param {{ description?: string, knowsAbout?: string[] }} [options]
 */
export const buildOrganizationJsonLd = (author, { description, knowsAbout = /** @type {string[]} */ ([]) } = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': buildOrganizationSchemaId(author.website),
  name: author.name,
  url: author.website,
  description: description || author.description?.description,
  founder: {
    '@type': 'Person',
    '@id': buildPersonSchemaId(author.website),
    name: author.name,
    url: absoluteUrl(author.website, '/about/'),
  },
  sameAs: getPersonSameAs(author),
  knowsAbout: knowsAbout.filter(Boolean),
})

export const buildSpeakableSpecification = (cssSelector = []) => ({
  '@type': 'SpeakableSpecification',
  cssSelector: cssSelector.filter(Boolean),
})

export const buildWebPageJsonLd = ({
  description,
  name,
  speakable,
  url,
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  description,
  url,
  inLanguage: 'en-GB',
  ...(speakable ? { speakable } : {}),
})

export const buildFAQPageJsonLd = (questions = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
})

export const buildBreadcrumbListJsonLd = (items, baseUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(baseUrl, item.path),
  })),
})

export const buildBlogJsonLd = ({ author, description, name, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': url,
  url,
  name,
  description,
  inLanguage: 'en-GB',
  author: {
    '@type': 'Person',
    '@id': buildPersonSchemaId(author.website),
    name: author.name,
    url: absoluteUrl(author.website, '/about/'),
  },
  publisher: {
    '@type': 'Organization',
    '@id': buildOrganizationSchemaId(author.website),
    name: author.name,
    url: author.website,
  },
})

export const buildCollectionPageJsonLd = ({ description, name, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url,
  inLanguage: 'en-GB',
})

export const buildSoftwareApplicationJsonLd = ({ description, name, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name,
  description,
  url,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
})

export const buildBlogPostingJsonLd = (post, locationHref, imageUrl, options = {}) => ({
  '@context': 'https://schema.org',
  '@type': ['Article', 'BlogPosting'],
  description: post.descriptionPlainText || post.bodyPlainText,
  image: imageUrl || post.heroImage?.resize?.src,
  url: locationHref,
  headline: post.title,
  dateModified: post.rawDisplayDate || post.rawDate,
  datePublished: post.rawDate,
  inLanguage: 'en-GB',
  isFamilyFriendly: true,
  copyrightYear: post.rawDate ? new Date(post.rawDate).getFullYear() : undefined,
  copyrightHolder: post.author?.name,
  accountablePerson: {
    '@type': 'Person',
    name: post.author?.name,
    '@id': buildPersonSchemaId(post.author?.website),
    url: absoluteUrl(post.author?.website, '/about/'),
  },
  author: {
    '@type': 'Person',
    '@id': buildPersonSchemaId(post.author?.website),
    name: post.author?.name,
    url: absoluteUrl(post.author?.website, '/about/'),
  },
  creator: {
    '@type': 'Person',
    '@id': buildPersonSchemaId(post.author?.website),
    name: post.author?.name,
    url: absoluteUrl(post.author?.website, '/about/'),
  },
  mainEntityOfPage: locationHref,
  keywords: post.tags,
  genre: post.category,
  publisher: {
    '@type': 'Organization',
    '@id': buildOrganizationSchemaId(post.author?.website),
    name: post.author?.name,
    url: post.author?.website,
  },
  ...(options.speakable ? { speakable: options.speakable } : {}),
})

export default {
  buildBlogJsonLd,
  buildBreadcrumbListJsonLd,
  buildFAQPageJsonLd,
  buildOrganizationJsonLd,
  CONTENTFUL_PERSON_ID,
  ORGANIZATION_SCHEMA_ID,
  PERSON_SCHEMA_ID,
  absoluteUrl,
  buildBlogPostingJsonLd,
  buildCollectionPageJsonLd,
  buildPersonSchemaId,
  buildPersonJsonLd,
  buildProfilePageJsonLd,
  buildOrganizationSchemaId,
  buildSpeakableSpecification,
  buildSoftwareApplicationJsonLd,
  buildWebPageJsonLd,
  getPersonSameAs,
}
