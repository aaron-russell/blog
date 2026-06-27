import { createOgImageResponse } from '../../lib/og'
import { homeConfig } from '../../lib/site-config'

export const GET = () =>
  createOgImageResponse({
    description: homeConfig.hero.intro,
    domain: 'aaron-russell.co.uk',
    kind: 'site',
    label: 'Home',
    tags: ['Static-first', 'Cloudflare Pages', 'AI-assisted workflows'],
    title: homeConfig.hero.title,
  })
