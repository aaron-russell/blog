#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const contentfulManagement = require('contentful-management')
const { documentToPlainTextString } = require('@contentful/rich-text-plain-text-renderer')

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

const normalizeText = (value = '') =>
  String(value)
    .replace(/\s+/g, ' ')
    .trim()

const summarizeChange = (label, from, to) => `${label}: ${from} -> ${to}`

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  const dryRun = args['dry-run'] !== 'false' && !args.write
  const draftOnly = args['draft-only'] === true || args['draft-only'] === 'true'
  const locale = args.locale || process.env.CONTENTFUL_LOCALE || 'en-US'
  const environmentId = args.environment || process.env.CONTENTFUL_ENVIRONMENT || 'master'
  const spaceId = process.env.CONTENTFUL_SPACE_ID
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN
  const slugFilter = String(args.slugs || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!spaceId || !managementToken) {
    throw new Error(
      'Missing required Contentful management credentials: CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN'
    )
  }

  const [htmlConverter, editorial] = await Promise.all([
    import('../src/lib/contentful-html-to-rich-text.js'),
    import('../src/lib/editorial-content.ts'),
  ])
  const htmlToRichText =
    htmlConverter.htmlToRichText || htmlConverter.default?.htmlToRichText

  const syncEntries = Object.entries(editorial.default?.overrides || editorial.overrides || {})
    .filter(([, value]) => value?.bodyHtml && value?.descriptionPlainText && value?.title)
    .filter(([slug]) => slugFilter.length === 0 || slugFilter.includes(slug))
    .map(([slug, value]) => ({
      category: value.category,
      description: htmlToRichText(value.descriptionHtml),
      descriptionPlainText: normalizeText(value.descriptionPlainText),
      slug,
      tags: value.tags || [],
      title: value.title,
      body: htmlToRichText(value.bodyHtml),
      bodyPlainText: normalizeText(value.bodyPlainText),
    }))

  const client = contentfulManagement.createClient(
    {
      accessToken: managementToken,
    },
    {
      type: 'legacy',
    }
  )

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)
  const response = await environment.getEntries({
    content_type: 'blogPost',
    limit: 1000,
  })

  const existingBySlug = new Map(
    response.items.map((item) => [item.fields.slug?.[locale], item]).filter(([slug]) => Boolean(slug))
  )

  const pendingChanges = syncEntries
    .map((entry) => {
      const existing = existingBySlug.get(entry.slug)

      if (!existing) {
        return {
          entry,
          error: `Missing Contentful entry for slug ${entry.slug}`,
        }
      }

      const currentTitle = existing.fields.title?.[locale] || ''
      const currentCategory = existing.fields.category?.[locale] || ''
      const currentTags = existing.fields.tags?.[locale] || []
      const currentDescriptionPlainText = normalizeText(
        documentToPlainTextString(existing.fields.description?.[locale] || {})
      )
      const currentBodyPlainText = normalizeText(
        documentToPlainTextString(existing.fields.body?.[locale] || {})
      )

      const changes = []
      const nextFields = {}

      if (entry.title !== currentTitle) {
        nextFields.title = {
          ...(existing.fields.title || {}),
          [locale]: entry.title,
        }
        changes.push(summarizeChange('title', JSON.stringify(currentTitle), JSON.stringify(entry.title)))
      }

      if (entry.category && entry.category !== currentCategory) {
        nextFields.category = {
          ...(existing.fields.category || {}),
          [locale]: entry.category,
        }
        changes.push(
          summarizeChange('category', JSON.stringify(currentCategory), JSON.stringify(entry.category))
        )
      }

      if (JSON.stringify(entry.tags) !== JSON.stringify(currentTags)) {
        nextFields.tags = {
          ...(existing.fields.tags || {}),
          [locale]: entry.tags,
        }
        changes.push(
          summarizeChange('tags', JSON.stringify(currentTags), JSON.stringify(entry.tags))
        )
      }

      if (entry.descriptionPlainText !== currentDescriptionPlainText) {
        nextFields.description = {
          ...(existing.fields.description || {}),
          [locale]: entry.description,
        }
        changes.push('description: content updated')
      }

      if (entry.bodyPlainText !== currentBodyPlainText) {
        nextFields.body = {
          ...(existing.fields.body || {}),
          [locale]: entry.body,
        }
        changes.push('body: content updated')
      }

      return {
        changes,
        entry,
        existing,
        nextFields,
      }
    })
    .filter((item) => item.error || item.changes.length > 0)

  const failures = pendingChanges.filter((item) => item.error)

  if (failures.length > 0) {
    failures.forEach((item) => console.log(item.error))
    process.exitCode = 1
    return
  }

  if (pendingChanges.length === 0) {
    console.log(`No editorial Contentful updates needed in ${spaceId}/${environmentId}.`)
    return
  }

  console.log(
    `${dryRun ? 'Dry run' : draftOnly ? 'Draft mode' : 'Write mode'}: ${pendingChanges.length} blog post${
      pendingChanges.length === 1 ? '' : 's'
    } need editorial updates in ${spaceId}/${environmentId}.`
  )

  for (const changeSet of pendingChanges) {
    console.log(`- ${changeSet.entry.title} (${changeSet.entry.slug})`)
    changeSet.changes.forEach((change) => console.log(`  • ${change}`))
  }

  if (dryRun) {
    console.log(
      `\nNo changes written. Re-run with --write${draftOnly ? ' --draft-only' : ''} to update${
        draftOnly ? ' drafts without publishing' : ' and publish entries'
      }.`
    )
    return
  }

  for (const changeSet of pendingChanges) {
    Object.entries(changeSet.nextFields).forEach(([fieldId, fieldValue]) => {
      changeSet.existing.fields[fieldId] = fieldValue
    })

    const updatedEntry = await changeSet.existing.update()

    if (!draftOnly) {
      await updatedEntry.publish()
    }
  }

  console.log(
    `\nUpdated ${pendingChanges.length} blog post(s)${draftOnly ? ' as drafts only' : ' and published them'}.`
  )
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
