const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')

const envFiles = [
  '.env.production.local',
  '.env.local',
  '.env.production',
  '.env',
]

envFiles
  .map((file) => path.join(process.cwd(), file))
  .filter((filePath) => fs.existsSync(filePath))
  .forEach((filePath) => {
    dotenv.config({
      path: filePath,
      override: false,
    })
  })

const requiredVariables = ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ACCESS_TOKEN']

const missing = requiredVariables.filter((name) => !process.env[name]?.trim())

if (missing.length > 0) {
  console.error(
    [
      'Missing required Contentful environment variables for a production build:',
      ...missing.map((name) => `- ${name}`),
      '',
      'Set them in your shell or one of: .env, .env.production, .env.local, .env.production.local.',
    ].join('\n')
  )
  process.exit(1)
}

console.log('Contentful build environment looks ready.')
