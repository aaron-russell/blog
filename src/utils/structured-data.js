export const CONTENTFUL_PERSON_ID = '4Ff1pPPUTdU7JI822TLc7O'

const PERSON_SOCIAL_FIELDS = ['website', 'twitter', 'github', 'linkedIn', 'facebook']

export const absoluteUrl = (baseUrl, path) => {
  if (!path) {
    return undefined
  }

  return new URL(path, baseUrl).toString()
}

export const getPersonSameAs = (author) =>
  PERSON_SOCIAL_FIELDS.map((field) => author?.[field]).filter(Boolean)

export const buildPersonJsonLd = (author, imageUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': author.website,
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

export const buildBlogPostingJsonLd = (post, locationHref, imageUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  image: imageUrl || post.heroImage?.resize?.src,
  url: locationHref,
  headline: post.title,
  datePublished: post.rawDate,
  inLanguage: 'en-GB',
  isFamilyFriendly: true,
  copyrightYear: new Date().getFullYear(),
  copyrightHolder: post.author?.name,
  accountablePerson: {
    '@type': 'Person',
    name: post.author?.name,
    url: post.author?.website,
  },
  author: {
    '@type': 'Person',
    name: post.author?.name,
    url: post.author?.website,
  },
  creator: {
    '@type': 'Person',
    name: post.author?.name,
    url: post.author?.website,
  },
  mainEntityOfPage: locationHref,
  keywords: post.tags,
  genre: post.category,
})
