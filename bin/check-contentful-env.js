const requiredVariables = ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ACCESS_TOKEN']

const missing = requiredVariables.filter((name) => !process.env[name]?.trim())

if (missing.length > 0) {
  console.error(
    [
      'Missing required Contentful environment variables for a production build:',
      ...missing.map((name) => `- ${name}`),
      '',
      'Set them in your shell or .env.production before running the build.',
    ].join('\n')
  )
  process.exit(1)
}

console.log('Contentful build environment looks ready.')
