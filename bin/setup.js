const { writeFileSync } = require('fs')
const path = require('path')
const readline = require('readline/promises')
const { stdin: input, stdout: output } = require('process')

const importContent = require('../contentful/export.json')
const spaceImport = require('contentful-import')

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
      rawValue || (!nextArgument?.startsWith('--') ? nextArgument : undefined)

    if (!rawKey || value === undefined) {
      continue
    }

    entries[rawKey] = value

    if (!rawValue) {
      index += 1
    }
  }

  return entries
}

const promptForValue = async (rl, message, validate) => {
  while (true) {
    const answer = (await rl.question(`${message}: `)).trim()

    if (!validate || validate(answer)) {
      return answer
    }

    output.write('That value does not look valid. Please try again.\n')
  }
}

const formatEnvFile = ({ spaceId, accessToken, includePreviewHint = false }) =>
  [
    '# Local Contentful configuration for Gatsby builds',
    '# Do not commit real credentials to source control',
    `CONTENTFUL_SPACE_ID='${spaceId}'`,
    `CONTENTFUL_ACCESS_TOKEN='${accessToken}'`,
    includePreviewHint
      ? "# CONTENTFUL_HOST='preview.contentful.com'"
      : null,
  ]
    .filter(Boolean)
    .join('\n')
    .concat('\n')

const run = async () => {
  output.write(
    [
      '',
      'This setup script configures Contentful credentials and imports the',
      'starter content model into an empty space.',
      '',
    ].join('\n')
  )

  const argv = parseArgs(process.argv.slice(2))
  const rl = readline.createInterface({ input, output })

  try {
    const spaceId =
      process.env.CONTENTFUL_SPACE_ID ||
      argv.spaceId ||
      (await promptForValue(
        rl,
        'Contentful Space ID',
        (value) => /^[a-z0-9]{12}$/.test(value)
      ))

    const accessToken =
      process.env.CONTENTFUL_ACCESS_TOKEN ||
      argv.accessToken ||
      (await promptForValue(rl, 'Content Delivery API token'))

    const managementToken =
      argv.managementToken ||
      (await promptForValue(rl, 'Content Management API token'))

    const environmentFiles = [
      ['.env.development', true],
      ['.env.production', false],
    ]

    environmentFiles.forEach(([fileName, includePreviewHint]) => {
      const filePath = path.join(__dirname, '..', fileName)
      writeFileSync(
        filePath,
        formatEnvFile({ spaceId, accessToken, includePreviewHint }),
        'utf8'
      )
      output.write(`Wrote ${fileName}\n`)
    })

    await spaceImport({
      spaceId,
      managementToken,
      content: importContent,
    })

    output.write('\nSetup complete. Run `npm run dev` to start Gatsby locally.\n')
  } finally {
    rl.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
