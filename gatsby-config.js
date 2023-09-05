require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteUrl: 'https://aaron-russell.co.uk',
    title: "Aaron Russell's Development Blog",
    description:
      'A blog about web and app development as well as personal development',
    social: {
      twitter: '@thisperson',
    },
  },
  plugins: [
    'gatsby-transformer-sharp',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',
    'gatsby-plugin-image',
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-source-contentful',
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        host: process.env.CONTENTFUL_HOST,
      },
    },
    {
      resolve: `gatsby-plugin-posthog`,
      options: {
        apiKey: 'phc_Tx60pBXpFuImoXXYIXUsSbdhQG02IqyouPF8EH0NZqW',
        apiHost: 'https://eu.posthog.com',
        head: true,
        isEnabledDevMode: true,
      },
    },
  ],
}
