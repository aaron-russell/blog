export const CONTENTFUL_PERSON_ID = '4Ff1pPPUTdU7JI822TLc7O'
export const PERSON_SCHEMA_ID = '#person'

const PERSON_SOCIAL_FIELDS = ['website', 'twitter', 'github', 'linkedIn', 'facebook']

export const absoluteUrl = (baseUrl, path) => {
  if (!path) {
    return undefined
  }

  return new URL(path, baseUrl).toString()
}

export const getPersonSameAs = (author) =>
  PERSON_SOCIAL_FIELDS.map((field) => author?.[field]).filter(Boolean)

export const buildPersonSchemaId = (baseUrl) => absoluteUrl(baseUrl, PERSON_SCHEMA_ID)

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
    '@type': 'Person',
    '@id': buildPersonSchemaId(author.website),
    name: author.name,
    url: absoluteUrl(author.website, '/about/'),
  },
})

export const buildBlogPostingJsonLd = (post, locationHref, imageUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  description: post.descriptionPlainText,
  image: imageUrl || post.heroImage?.resize?.src,
  url: locationHref,
  headline: post.title,
  dateModified: post.rawUpdatedDate || post.rawDate,
  datePublished: post.rawDate,
  inLanguage: 'en-GB',
  isFamilyFriendly: true,
  copyrightYear: new Date().getFullYear(),
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
    '@type': 'Person',
    '@id': buildPersonSchemaId(post.author?.website),
    name: post.author?.name,
    url: absoluteUrl(post.author?.website, '/about/'),
  },
})

export default {
  buildBlogJsonLd,
  buildBreadcrumbListJsonLd,
  CONTENTFUL_PERSON_ID,
  PERSON_SCHEMA_ID,
  absoluteUrl,
  buildBlogPostingJsonLd,
  buildPersonSchemaId,
  buildPersonJsonLd,
  buildProfilePageJsonLd,
  getPersonSameAs,
}
