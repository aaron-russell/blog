const test = require('node:test')
const assert = require('node:assert/strict')

test('gatsby browser exports the expected lifecycle hooks', () => {
  const browserHooks = require('../gatsby-browser')

  assert.equal(typeof browserHooks.onClientEntry, 'function')
  assert.equal(typeof browserHooks.onRouteUpdate, 'function')
})
