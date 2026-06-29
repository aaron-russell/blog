export const siteMetadata = {
  description:
    'Aaron Russell is a UK-based software developer building practical web apps, AI-assisted workflows, and indie products.',
  siteUrl: 'https://aaron-russell.co.uk',
  social: {
    twitter: '',
  },
  title: 'Aaron Russell',
}

export const homeConfig = {
  hero: {
    eyebrow: 'Software developer · Leeds, UK',
    intro:
      'I build practical web apps, AI-assisted workflows, and indie products like Pit Crew. This is where I document what I’m building, what broke, and what I’d do differently next time.',
    title: 'I build useful software — and write down the honest version.',
  },
  workbench: [
    {
      description:
        'A live fantasy motorsport product for private leagues, race-by-race podium predictions, and season standings.',
      href: '/projects/pit-crew/',
      title: 'Pit Crew',
    },
    {
      description:
        'Practical notes on shipping real product improvements with AI in the loop, without turning everything into a demo.',
      href: '/blog/',
      title: 'AI-assisted engineering workflows',
    },
    {
      description:
        'Products, experiments, and the decisions behind them — connected to the writing rather than hidden in a portfolio grid.',
      href: '/projects/',
      title: 'The public engineering lab',
    },
  ],
  exploring: [
    'Edge-first web architecture',
    'Agentic developer tooling',
    'Modern frontend performance',
    'Maintainable product design systems',
  ],
  stack: ['Astro', 'Angular', 'Firebase', 'Cloudflare', 'Contentful', 'TypeScript'],
}

export type Project = {
  description: string
  externalUrl?: string
  featured?: boolean
  highlights: string[]
  href: string
  name: string
  relatedPostTerms: string[]
  stack: string[]
  status: string
}

export const projects: Project[] = [
  {
    description:
      'A browser-first fantasy motorsport app for creating private leagues, making race-by-race podium predictions, and following season standings.',
    externalUrl: 'https://pitcrew.team/en/',
    featured: true,
    highlights: ['Private leagues', 'Podium predictions', 'Live scoring', 'Mobile-first PWA'],
    href: '/projects/pit-crew/',
    name: 'Pit Crew',
    relatedPostTerms: ['pit crew', 'fantasy motorsport'],
    stack: ['Angular', 'Firebase', 'Firestore', 'Cloudflare'],
    status: 'Live · actively building',
  },
  {
    description:
      'The site you are reading: a static-first developer notebook and public build log powered by Contentful and deployed at the edge.',
    externalUrl: 'https://github.com/aaron-russell/blog',
    href: '/',
    highlights: ['Static-first', 'Contentful publishing', 'Cloudflare Pages', 'Accessible by default'],
    name: 'Aaron Russell — personal site',
    relatedPostTerms: ['wordpress', 'contentful', 'cloudflare', 'astro'],
    stack: ['Astro', 'TypeScript', 'Contentful', 'Cloudflare Pages'],
    status: 'Live · evolving in public',
  },
]

export const startHere = [
  {
    fallbackHref: '/projects/pit-crew/',
    label: 'Building Pit Crew',
    terms: ['pit crew', 'fantasy motorsport'],
  },
  {
    fallbackHref: '/projects/',
    label: 'How this site is built',
    terms: ['wordpress', 'gatsby', 'contentful', 'astro'],
  },
  {
    fallbackHref: '/topics/cloudflare/',
    label: 'Astro + Cloudflare notes',
    terms: ['astro', 'cloudflare'],
  },
  {
    fallbackHref: '/blog/',
    label: 'AI-assisted development workflows',
    terms: ['ai-assisted', 'artificial intelligence', 'chatgpt', 'ai '],
  },
  {
    fallbackHref: '/topics/angular/',
    label: 'Angular + Firebase architecture',
    terms: ['angular', 'firestore', 'firebase'],
  },
  {
    fallbackHref: '/topics/performance/',
    label: 'Performance and SEO',
    terms: ['page speed', 'pagespeed', 'seo', 'performance'],
  },
]

export const nowConfig = {
  updated: 'June 2026',
  sections: [
    {
      title: 'Building',
      items: [
        'Pit Crew — a fantasy motorsport product for private leagues and race predictions.',
        'This site as a more useful public engineering lab, not just a chronological archive.',
      ],
    },
    {
      title: 'Writing',
      items: [
        'Practical notes from real Angular, Firebase, Astro, and Cloudflare work.',
        'More honest build logs: the trade-offs, the failures, and the second attempt.',
      ],
    },
    {
      title: 'Learning',
      items: [
        'Where AI-assisted development genuinely improves delivery — and where it adds noise.',
        'How static-first sites can still feel ambitious, personal, and product-like.',
      ],
    },
    {
      title: 'Using',
      items: ['Astro, TypeScript, Contentful, and Cloudflare for publishing.', 'Angular and Firebase for product work.'],
    },
    {
      title: 'Recently shipped',
      items: ['A new public site for Pit Crew.', 'Stronger discovery, structured data, and publishing foundations for this site.'],
    },
    {
      title: 'Next up',
      items: ['Deeper Pit Crew architecture notes.', 'More small, evidence-led experiments published while they are still fresh.'],
    },
  ],
}

export const usesConfig = [
  {
    title: 'Editor and development tools',
    items: ['Visual Studio Code', 'Git and GitHub', 'Node.js', 'TypeScript'],
  },
  {
    title: 'Hosting and infrastructure',
    items: ['Cloudflare Pages', 'Cloudflare Pages Functions', 'Contentful'],
  },
  {
    title: 'Frontend stack',
    items: ['Astro', 'Angular', 'Ionic', 'HTML and modern CSS'],
  },
  {
    title: 'Backend and data',
    items: ['Firebase', 'Firestore', 'Cloudflare edge services'],
  },
  {
    title: 'AI-assisted development',
    items: ['Coding agents for implementation and review', 'AI-assisted research, debugging, and delivery workflows'],
  },
  {
    title: 'Analytics',
    items: ['PostHog with minimal page-view tracking', 'Do Not Track and optional consent controls'],
  },
  {
    title: 'Writing and product work',
    items: ['Contentful for structured publishing', 'Markdown and diagrams for technical thinking'],
  },
]
