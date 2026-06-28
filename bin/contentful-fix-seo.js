#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const contentfulManagement = require('contentful-management')

const envFiles = [
  '.env.development.local',
  '.env.local',
  '.env.development',
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

const parseArgs = (argv) => {
  const entries = {}

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (!argument.startsWith('--')) {
      continue
    }

    const [rawKey, rawValue] = argument.slice(2).split('=')
    const nextArgument = argv[index + 1]
    const value =
      rawValue !== undefined
        ? rawValue
        : nextArgument && !nextArgument.startsWith('--')
          ? nextArgument
          : true

    entries[rawKey] = value

    if (!rawValue && value !== true) {
      index += 1
    }
  }

  return entries
}

const summarizeChange = (change) => {
  if (Array.isArray(change.to)) {
    return `${change.field}: ${JSON.stringify(change.from)} -> ${JSON.stringify(change.to)}`
  }

  return `${change.field}: ${change.from} -> ${change.to}`
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  const dryRun = args['dry-run'] !== 'false' && !args.write
  const locale = args.locale || process.env.CONTENTFUL_LOCALE || 'en-US'
  const environmentId = args.environment || process.env.CONTENTFUL_ENVIRONMENT || 'master'
  const siteUrl = args.siteUrl || process.env.SITE_URL || 'https://aaron-russell.co.uk'
  const spaceId = process.env.CONTENTFUL_SPACE_ID
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN

  if (!spaceId || !managementToken) {
    throw new Error(
      'Missing required Contentful management credentials: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN'
    )
  }

  const { getSeoFixesForBlogPost } = await import('../src/lib/contentful-seo-fixes.js')

  const client = contentfulManagement.createClient({
    accessToken: managementToken,
  }, {
    type: 'legacy',
  })

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)
  const response = await environment.getEntries({
    content_type: 'blogPost',
    limit: 1000,
  })

  const pendingChanges = response.items
    .map((entry) =>
      getSeoFixesForBlogPost({
        entry,
        locale,
        siteUrl,
      })
    )
    .filter((result) => result.changed)

  if (pendingChanges.length === 0) {
    console.log(`No blog post SEO changes needed in ${spaceId}/${environmentId}.`)
    return
  }

  console.log(
    `${dryRun ? 'Dry run' : 'Write mode'}: ${pendingChanges.length} blog post${
      pendingChanges.length === 1 ? '' : 's'
    } need updates in ${spaceId}/${environmentId}.`
  )

  for (const result of pendingChanges) {
    console.log(`- ${result.title} (${result.slug || result.entryId})`)
    result.changes.forEach((change) => {
      console.log(`  • ${summarizeChange(change)}`)
    })
  }

  if (dryRun) {
    console.log('\nNo changes written. Re-run with --write to update and publish entries.')
    return
  }

  for (const result of pendingChanges) {
    const entry = response.items.find((item) => item.sys.id === result.entryId)

    if (!entry) {
      continue
    }

    Object.entries(result.nextFields).forEach(([fieldId, fieldValue]) => {
      entry.fields[fieldId] = fieldValue
    })

    const updatedEntry = await entry.update()
    await updatedEntry.publish()
  }

  console.log(`\nUpdated and published ${pendingChanges.length} blog post(s).`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
