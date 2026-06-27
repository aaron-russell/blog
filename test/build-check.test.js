const test = require('node:test')
const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')

const scriptPath = path.join(__dirname, '..', 'bin', 'check-contentful-env.js')

function runBuildCheck(env) {
  const isolatedCwd = mkdtempSync(path.join(tmpdir(), 'build-check-'))

  try {
    return spawnSync(process.execPath, [scriptPath], {
      cwd: isolatedCwd,
      env,
      encoding: 'utf8',
    })
  } finally {
    rmSync(isolatedCwd, { force: true, recursive: true })
  }
}

test('build check fails clearly when required Contentful env vars are missing', () => {
  const result = runBuildCheck({})

  assert.equal(result.status, 1)
  assert.match(result.stderr, /Missing required Contentful environment variables/)
  assert.match(result.stderr, /CONTENTFUL_SPACE_ID/)
  assert.match(result.stderr, /CONTENTFUL_ACCESS_TOKEN/)
})

test('build check passes when required Contentful env vars are present', () => {
  const result = runBuildCheck({
    CONTENTFUL_SPACE_ID: 'abc123def456',
    CONTENTFUL_ACCESS_TOKEN: 'token',
  })

  assert.equal(result.status, 0)
  assert.match(result.stdout, /Contentful build environment looks ready/)
})
