import { createOgImageResponse } from '../../lib/og'

export const GET = () =>
  createOgImageResponse({
    category: 'Developer in Leeds, UK',
    description:
      'Software engineering, AI-assisted delivery, static web architecture, and indie product building.',
    domain: 'aaron-russell.co.uk',
    kind: 'page',
    label: 'About',
    tags: ['Angular + Firebase', 'Astro + Cloudflare', 'Pit Crew'],
    title: 'About Aaron Russell',
  })
