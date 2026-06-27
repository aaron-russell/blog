const test = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const scriptPath = path.join(__dirname, '..', 'bin', 'check-contentful-env.js')

test('build check fails clearly when required Contentful env vars are missing', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: {},
    encoding: 'utf8',
  })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /Missing required Contentful environment variables/)
  assert.match(result.stderr, /CONTENTFUL_SPACE_ID/)
  assert.match(result.stderr, /CONTENTFUL_ACCESS_TOKEN/)
})

test('build check passes when required Contentful env vars are present', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: {
      CONTENTFUL_SPACE_ID: 'abc123def456',
      CONTENTFUL_ACCESS_TOKEN: 'token',
    },
    encoding: 'utf8',
  })

  assert.equal(result.status, 0)
  assert.match(result.stdout, /Contentful build environment looks ready/)
})
