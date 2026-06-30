import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { formatBlogDate } from './date'

export type EditorialStatus = 'archived' | 'current' | 'historical' | 'needs-review'
export type ContentGroup = 'Archive' | 'Build notes' | 'Current guides' | 'Personal writing'

export type EditorialOverride = {
  bodyHtml?: string
  bodyPlainText?: string
  category?: string
  contentGroup?: ContentGroup
  descriptionHtml?: string
  descriptionPlainText?: string
  displayDateLabel?: 'Reviewed' | 'Updated'
  noticeHtml?: string
  reviewedDate?: string
  robots?: string
  status?: EditorialStatus
  tags?: string[]
  title?: string
}

const stripHtml = (value = '') =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const readBody = (slug: string) =>
  readFileSync(join(process.cwd(), 'src/content/article-overrides', `${slug}.html`), 'utf8')

const createOverride = ({
  bodyHtml,
  descriptionPlainText,
  ...rest
}: Omit<EditorialOverride, 'bodyPlainText' | 'descriptionHtml'> & {
  bodyHtml?: string
  descriptionPlainText?: string
}) => ({
  ...rest,
  bodyHtml,
  bodyPlainText: bodyHtml ? stripHtml(bodyHtml) : undefined,
  descriptionHtml: descriptionPlainText ? `<p>${descriptionPlainText}</p>` : undefined,
  descriptionPlainText,
})

export const overrides: Record<string, EditorialOverride> = {
  '16-awesome-gulp-plugins': createOverride({
    bodyHtml: readBody('16-awesome-gulp-plugins'),
    category: 'Frontend tooling',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A practical look at whether Gulp still makes sense in 2026, modern replacements, and how I would migrate old workflows today.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Frontend tooling', 'Gulp', 'Vite', 'Astro'],
    title: 'Do People Still Use Gulp in 2026? Modern Alternatives and When It Still Makes Sense',
  }),
  '5-reasons-i-have-changed-to-capacitor': createOverride({
    bodyHtml: readBody('5-reasons-i-have-changed-to-capacitor'),
    category: 'App Development',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'Why I still prefer Capacitor over Cordova for hybrid apps in 2026, including native-project trade-offs, Ionic fit, and migration gotchas.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Capacitor', 'Cordova', 'Ionic', 'Angular'],
    title: 'Cordova to Capacitor in 2026: Why I Still Prefer Capacitor for Hybrid Apps',
  }),
  '9-ways-to-improve-your-page-speed': createOverride({
    bodyHtml: readBody('9-ways-to-improve-your-page-speed'),
    category: 'Performance',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'Nine practical ways to improve page speed in 2026, from image delivery and JavaScript reduction to caching, fonts, and static-first rendering.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Performance', 'PageSpeed', 'SEO', 'Cloudflare'],
    title: '9 Practical Ways to Improve Page Speed in 2026',
  }),
  'advanced-techniques-for-optimizing-database-performance': createOverride({
    bodyHtml: readBody('advanced-techniques-for-optimizing-database-performance'),
    category: 'Database',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A practical guide to database performance optimisation: measuring real bottlenecks, reading query plans, indexing well, and fixing the right thing first.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Database', 'Performance', 'Postgres', 'Firestore'],
    title: 'Database Performance Optimisation: Practical Techniques for Faster Queries',
  }),
  'adverts-with-a-loose-connection': createOverride({
    contentGroup: 'Archive',
    descriptionPlainText:
      'A short archived personal post kept online for continuity rather than active search discovery.',
    displayDateLabel: 'Reviewed',
    noticeHtml:
      '<p><strong>Archive note:</strong> This short post is kept online for historical continuity. It is not an actively maintained article, so it should not be treated as current guidance.</p>',
    reviewedDate: '2026-06-30',
    robots: 'noindex,follow',
    status: 'archived',
  }),
  'angular-vs-react-vs-vue-choosing-the-right-javascript-framework-for-you': createOverride({
    bodyHtml: readBody('angular-vs-react-vs-vue-choosing-the-right-javascript-framework-for-you'),
    category: 'Frontend architecture',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A practical 2026 comparison of Angular, React, and Vue covering architecture, team fit, SSR context, hiring, and what I would actually choose.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Angular', 'React', 'Vue', 'Frontend architecture'],
    title: 'Angular vs React vs Vue in 2026: A Senior Developer’s Practical View',
  }),
  'firebase-vs-supabase-vs-aws-amplify-vs-appwrite': createOverride({
    bodyHtml: readBody('firebase-vs-supabase-vs-aws-amplify-vs-appwrite'),
    category: 'Architecture',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A practical comparison of Firebase, Supabase, AWS Amplify, and Appwrite in 2026 for MVPs, SaaS products, auth, databases, pricing, lock-in, and team fit.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Firebase', 'Supabase', 'AWS Amplify', 'Appwrite'],
    title: 'Firebase vs Supabase vs AWS Amplify vs Appwrite in 2026: Which Should You Choose?',
  }),
  'from-one-digital-partner-to-another': createOverride({
    contentGroup: 'Build notes',
    descriptionPlainText:
      'A historical project reflection kept for context rather than as a current guide.',
    displayDateLabel: 'Reviewed',
    noticeHtml:
      '<p><strong>Historical note:</strong> This article reflects a specific project transition in 2020. I keep it online as a period piece about delivery work and team handover, not as a current process guide.</p>',
    reviewedDate: '2026-06-30',
    robots: 'noindex,follow',
    status: 'historical',
  }),
  'from-wordpress-to-gatsby-contentful-and-cloudflare-pages': createOverride({
    bodyHtml: readBody('from-wordpress-to-gatsby-contentful-and-cloudflare-pages'),
    category: 'Architecture',
    contentGroup: 'Build notes',
    descriptionPlainText:
      'A historical migration story updated to explain how this blog evolved from WordPress to Gatsby and later to Astro on Cloudflare Pages.',
    displayDateLabel: 'Updated',
    noticeHtml:
      '<p><strong>Updated context:</strong> This article started life as a Gatsby migration write-up. It has been reviewed and updated to explain the current Astro, Contentful, and Cloudflare Pages stack behind the site.</p>',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Astro', 'Cloudflare', 'Contentful', 'Migration'],
    title: 'From WordPress to Gatsby to Astro and Cloudflare Pages: How My Blog Evolved',
  }),
  'its-okay-not-to-be-okay-my-mental-health': createOverride({
    contentGroup: 'Personal writing',
    descriptionPlainText:
      "A personal post about anxiety and mental health, kept human rather than heavily optimised.",
    displayDateLabel: 'Reviewed',
    noticeHtml:
      '<p><strong>Content note:</strong> This is a personal article about anxiety and mental health. I have reviewed it for context and clarity, but it reflects a specific time in my life. If you need immediate support in the UK, contact NHS 111, Samaritans on 116 123, or emergency services if you are in danger.</p>',
    reviewedDate: '2026-06-30',
    status: 'historical',
  }),
  'improve-your-seo': createOverride({
    contentGroup: 'Archive',
    descriptionPlainText:
      'An older SEO post kept for site history, but not intended as current ranking guidance.',
    displayDateLabel: 'Reviewed',
    noticeHtml:
      '<p><strong>Archive note:</strong> This SEO article reflects an older period of search advice. I keep it online for context, but it should not be treated as a current guide for rankings, metadata, or content strategy.</p>',
    reviewedDate: '2026-06-30',
    robots: 'noindex,follow',
    status: 'historical',
  }),
  'pagespeed-insights': createOverride({
    bodyHtml: readBody('pagespeed-insights'),
    category: 'Performance',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A current explanation of what a PageSpeed Insights score means in 2026, including lab vs field data, INP, LCP, CLS, and what to fix first.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Performance', 'PageSpeed', 'Core Web Vitals', 'SEO'],
    title: 'What Does My PageSpeed Insights Score Mean in 2026?',
  }),
  'pros-and-cons-of-using-cloudflare': createOverride({
    bodyHtml: readBody('pros-and-cons-of-using-cloudflare'),
    category: 'Cloudflare',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A practical 2026 look at Cloudflare Pages, Workers, R2, D1, KV, Queues, Turnstile, email, pricing, and where Cloudflare is and is not the right choice.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Cloudflare', 'Performance', 'Security', 'Architecture'],
    title: 'Cloudflare Pros and Cons in 2026: What I Use It For on Real Projects',
  }),
  'securing-angular-when-using-firestore': createOverride({
    bodyHtml: readBody('securing-angular-when-using-firestore'),
    category: 'Security',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A practical guide to securing Angular apps that use Firestore, covering Firebase Auth, Security Rules, App Check, emulator tests, and why route guards are not your security boundary.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['Angular', 'Firebase', 'Firestore', 'Security'],
    title: 'Securing Angular Apps That Use Firestore in 2026',
  }),
  'the-strategy-behind-your-seo-6-step-plan-of-attack': createOverride({
    contentGroup: 'Archive',
    descriptionPlainText:
      'An older SEO planning post kept for historical context rather than as current advice.',
    displayDateLabel: 'Reviewed',
    noticeHtml:
      '<p><strong>Historical note:</strong> This article reflects an older SEO planning model. I keep it online for context, but it is not my current recommendation for modern search strategy or measurement.</p>',
    reviewedDate: '2026-06-30',
    robots: 'noindex,follow',
    status: 'historical',
  }),
  'the-trust-behind-backlinks': createOverride({
    contentGroup: 'Archive',
    descriptionPlainText:
      'An older backlinks article kept for history, but not intended as a current explanation of authority and ranking signals.',
    displayDateLabel: 'Reviewed',
    noticeHtml:
      '<p><strong>Historical note:</strong> This article reflects older backlink language and should not be treated as a current explanation of how authority, trust, and relevance work in search. I keep it online for context only.</p>',
    reviewedDate: '2026-06-30',
    robots: 'noindex,follow',
    status: 'historical',
  }),
  'why-seo': createOverride({
    contentGroup: 'Personal writing',
    descriptionPlainText:
      'A historical note about why I became more interested in SEO, kept as part of the site story rather than an actively maintained article.',
    displayDateLabel: 'Reviewed',
    noticeHtml:
      '<p><strong>Historical note:</strong> This article captures why I started taking SEO more seriously. I keep it online as background context, but it is not intended to compete with the more current SEO and performance guides on this site.</p>',
    reviewedDate: '2026-06-30',
    robots: 'noindex,follow',
    status: 'historical',
  }),
  'wordpress-vs-contentful-vs-ghost-vs-medium': createOverride({
    bodyHtml: readBody('wordpress-vs-contentful-vs-ghost-vs-medium'),
    category: 'CMS',
    contentGroup: 'Current guides',
    descriptionPlainText:
      'A practical 2026 comparison of WordPress, Contentful, Ghost, and Medium, with modern static and headless options and clearer recommendations by use case.',
    displayDateLabel: 'Updated',
    reviewedDate: '2026-06-30',
    status: 'current',
    tags: ['CMS', 'Contentful', 'WordPress', 'Astro'],
    title: 'WordPress vs Contentful vs Ghost vs Medium in 2026: What Should You Use for a Blog?',
  }),
}

const buildDefaultNotice = (
  status: EditorialStatus,
  reviewedDate?: string,
  publishedDate?: string
) => {
  if (status === 'current' && reviewedDate) {
    return `<p><strong>Reviewed and updated:</strong> This article was reviewed and updated in ${new Date(
      reviewedDate
    ).getUTCFullYear()} for current tooling and guidance.</p>`
  }

  if (status === 'historical' || status === 'archived') {
    const year = publishedDate ? new Date(publishedDate).getUTCFullYear() : undefined
    return `<p><strong>Historical context:</strong> This article was originally published${
      year ? ` in ${year}` : ''
    } and may include older tooling or terminology. I keep it online for historical context.</p>`
  }

  if (status === 'needs-review') {
    return '<p><strong>Needs review:</strong> This article is still online because the URL may be useful, but it has not yet been reviewed against current tooling or guidance.</p>'
  }

  return undefined
}

export const getContentGroup = ({
  category,
  publishDate,
  slug,
  status,
}: {
  category?: string
  publishDate?: string
  slug: string
  status: EditorialStatus
}) => {
  if (status === 'archived') {
    return 'Archive'
  }

  if (slug === 'building-pit-crew-creating-a-fantasy-motorsport-prediction-game-from-scratch') {
    return 'Build notes'
  }

  if (slug === 'its-okay-not-to-be-okay-my-mental-health' || slug === 'why-seo') {
    return 'Personal writing'
  }

  if (
    slug === 'from-one-digital-partner-to-another' ||
    slug === 'from-wordpress-to-gatsby-contentful-and-cloudflare-pages'
  ) {
    return 'Build notes'
  }

  if (category?.toLowerCase() === 'mental health') {
    return 'Personal writing'
  }

  if (status === 'historical') {
    return 'Archive'
  }

  if (publishDate && new Date(publishDate).getUTCFullYear() < 2024) {
    return 'Archive'
  }

  return 'Current guides'
}

export const getEditorialOverride = (slug: string, publishDate?: string) => {
  const override = overrides[slug]
  const status = override?.status || 'needs-review'
  const contentGroup =
    override?.contentGroup ||
    getContentGroup({
      category: override?.category,
      publishDate,
      slug,
      status,
    })
  const reviewedDate = override?.reviewedDate

  return {
    contentGroup,
    displayDate: reviewedDate ? formatBlogDate(reviewedDate) : undefined,
    displayDateLabel: override?.displayDateLabel || (reviewedDate ? 'Reviewed' : undefined),
    noticeHtml: override?.noticeHtml || buildDefaultNotice(status, reviewedDate, publishDate),
    reviewedDate,
    robots: override?.robots,
    status,
    ...override,
  }
}

export default {
  getContentGroup,
  getEditorialOverride,
  overrides,
}
