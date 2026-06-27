const test = require('node:test')
const assert = require('node:assert/strict')

test('gatsby config keeps the required source and rendering plugins', () => {
  const config = require('../gatsby-config')

  assert.equal(config.siteMetadata.siteUrl, 'https://aaron-russell.co.uk')
  assert.ok(config.plugins.includes('gatsby-plugin-image'))
  assert.ok(config.plugins.includes('gatsby-plugin-react-helmet'))
  assert.ok(config.plugins.includes('gatsby-plugin-sharp'))

  const contentfulPlugin = config.plugins.find(
    (plugin) =>
      typeof plugin === 'object' && plugin.resolve === 'gatsby-source-contentful'
  )

  assert.ok(contentfulPlugin)
})
