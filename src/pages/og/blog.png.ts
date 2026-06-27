import { createOgImageResponse } from '../../lib/og'

export const GET = () =>
  createOgImageResponse({
    category: 'Writing archive',
    description: 'Engineering notes, experiments, and implementation details from Aaron Russell.',
    domain: 'aaron-russell.co.uk',
    kind: 'page',
    label: 'Blog',
    tags: ['Engineering notes', 'Experiments', 'Implementation details'],
    title: 'Browse the full notebook.',
  })
