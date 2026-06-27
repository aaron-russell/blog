import { createOgImageResponse } from '../../lib/og'

export const GET = () =>
  createOgImageResponse({
    category: 'Contact',
    description:
      'Get in touch with Aaron Russell about engineering, AI, product systems, and delivery work.',
    domain: 'aaron-russell.co.uk',
    kind: 'page',
    label: 'Contact',
    tags: ['Engineering systems', 'AI-assisted delivery', 'Product work'],
    title: 'Let’s talk about engineering systems that actually ship.',
  })
