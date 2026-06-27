# Astro Migration Plan For `aaron-russell.co.uk`

## Recommendation

Migrate this site from Gatsby to Astro.

Astro is the best fit for the current shape of the site and the likely next phase:

- content-heavy pages
- SEO-sensitive blog posts
- image-led portfolio/case study pages
- a mostly static site with a small amount of interactivity
- Cloudflare hosting and edge-friendly contact handling

It gives you a lower-maintenance static-first architecture than Gatsby, while still leaving room to grow into a portfolio with richer project pages and selective interactive UI.

## Why Astro Fits This Repo

### Current site shape

The current Gatsby app is mostly:

- blog index and blog post pages
- homepage/about-style content
- contact page
- SEO metadata and structured data
- Contentful as the CMS
- Cloudflare Pages middleware for contact submission handling

This is exactly the kind of site Astro is strongest at.

### Why not stay on Gatsby

Gatsby still works, but the repo already shows the usual pain points:

- heavy transitive dependency tree
- recurring vulnerability noise from build-time packages
- more framework/tooling overhead than the site really needs
- higher long-term maintenance cost for a relatively simple site

### Why not Next.js first

Next.js would be a good choice if the site were expected to become more app-like:

- authenticated client areas
- dashboards
- very interactive portfolio filtering
- custom backend-heavy features

For a blog + portfolio + case studies site, it is probably more framework than necessary right now.

### Why not Eleventy first

Eleventy would be a good fit for a pure content site, but it is less attractive if you want:

- a polished portfolio with more component reuse
- richer presentation and layout composition
- selective interactive enhancements

Astro sits in a better middle ground.

## Migration Goals

The migration should aim to:

1. Preserve current URLs and SEO value.
2. Keep Contentful as the source of truth initially.
3. Preserve Cloudflare Pages deployment.
4. Keep the contact flow working with Cloudflare middleware.
5. Reduce dependency and build complexity.
6. Create a clean foundation for portfolio pages and case studies.

## Target Architecture

### Frontend framework

- Astro as the primary site framework
- mostly `.astro` pages and layouts
- minimal client JavaScript
- interactive islands only where needed

### Content source

Keep Contentful initially.

This avoids combining a framework migration with a CMS migration. Once Astro is stable, you can later decide whether to stay on Contentful or move to:

- local Markdown/content collections
- Sanity
- Storyblok
- another headless CMS

### Hosting

Keep Cloudflare Pages.

### Contact flow

Keep the current Cloudflare Pages Functions approach, porting the existing middleware logic rather than redesigning the feature.

## What To Migrate

### 1. Core site structure

Map the current Gatsby pages to Astro routes:

- `/` homepage
- `/blog/` blog index
- `/blog/[slug]/` blog post pages
- `/contact/`
- `404`

### 2. Shared UI

Port these components into Astro equivalents:

- layout
- navigation
- footer
- hero
- article preview
- tags

These can mostly become:

- `.astro` components for static rendering
- small framework islands only if needed later

### 3. SEO

Rebuild the current SEO layer as an Astro-friendly shared head component/helper:

- page title
- meta description
- canonical URL
- Open Graph tags
- Twitter tags
- structured data
- favicon and manifest links

The pure helper work already done in this repo should transfer cleanly.

### 4. Contentful data fetching

Replace Gatsby GraphQL page queries with explicit Contentful fetch utilities.

Recommended structure:

- `src/lib/contentful.ts`
- one fetch function for site author/profile data
- one fetch function for blog post index data
- one fetch function for single post by slug

This is simpler and easier to reason about than Gatsby page queries.

### 5. Images

Replace Gatsby image handling with Astro-compatible image handling.

Recommended first pass:

- use Contentful image URLs directly
- preserve width/height and alt data
- use Astro image optimization where it helps

Do not try to exactly reproduce Gatsby image internals. Match the user experience instead:

- responsive images
- sensible dimensions
- fast loads
- good alt text

### 6. Contact page and middleware

Keep:

- Turnstile
- validation logic
- honeypot
- KV-backed rate limiting
- redirect-based success/error states

The current helper split is a good starting point. Port the existing Pages Function behavior with minimal logic changes.

## Proposed Migration Phases

### Phase 1. Parallel Astro scaffold

Create a new Astro app structure in the repo without removing Gatsby yet.

Suggested shape:

- `astro.config.mjs`
- `src/layouts/`
- `src/components/`
- `src/pages/`
- `src/lib/`

Goal:

- build Astro site in parallel
- avoid breaking current Gatsby deployment during the early migration

### Phase 2. Shared design system and layouts

Port:

- global styles
- variables/tokens
- layout shell
- navigation
- footer
- hero

Goal:

- make Astro visually match the current site before wiring all content

### Phase 3. Contentful integration

Build a small Contentful client layer and migrate:

- homepage
- blog index
- blog post pages
- author/profile data

Goal:

- get core content parity with Gatsby

### Phase 4. SEO and metadata parity

Port:

- title logic
- canonical URLs
- OG/Twitter metadata
- JSON-LD
- sitemap
- robots behavior

Goal:

- maintain or improve current SEO output

### Phase 5. Contact flow parity

Port the contact page and verify:

- form posts
- Turnstile
- rate limiting
- success/error redirects

Goal:

- maintain current behavior with no UX regressions

### Phase 6. Portfolio expansion

Once Astro parity is complete, add:

- `/portfolio/`
- project detail pages
- case study layout
- optional featured work section on homepage

Goal:

- use the migration as the foundation for a stronger personal brand site, not just a framework swap

## Portfolio Direction In Astro

Astro is especially attractive if you want to expand into a portfolio because it handles this combination very well:

- static marketing-style pages
- content-driven project pages
- rich typography and images
- selective interactivity

Recommended portfolio additions:

- `Projects` index page
- individual case study pages
- service/offering page if relevant
- improved homepage with featured work
- optional speaking/writing/about sections

Suggested content model additions in Contentful:

- `Project`
- `CaseStudy`
- `Testimonial` optional
- `Service` optional

If you want less CMS complexity later, Astro also makes it easier to move some of this into local content collections.

## Routing And URL Rules

Preserve existing URLs exactly where possible:

- `/`
- `/blog/`
- `/blog/{slug}/`
- `/contact/`

This reduces SEO and redirect risk.

If portfolio is added, recommended routes:

- `/portfolio/`
- `/portfolio/{slug}/`

## Cloudflare Plan

Recommended deployment model:

- Astro site deployed to Cloudflare Pages
- Pages Functions kept for contact handling
- static-first rendering unless a clear SSR need appears later

This keeps the deployment model familiar and avoids mixing migration risk with infrastructure change.

## Testing And Acceptance Criteria

### Required checks

- lint passes
- tests pass
- typecheck passes
- Astro build passes
- Contentful-backed build passes with real env vars

### Functional acceptance

- homepage content matches current intent
- blog index renders correctly
- blog posts render correctly
- canonical URLs are correct
- OG/Twitter metadata is correct
- structured data is present
- contact success and error states work
- Turnstile flow still works

### Regression checks

- no broken internal links
- no missing images
- no route changes for blog posts
- no loss of contact functionality

## Risks

### Low risk

- layout/component porting
- SEO helper migration
- contact middleware reuse

### Medium risk

- replacing Gatsby image behavior cleanly
- reproducing blog page behavior exactly
- ensuring Contentful fetches cover all current query fields

### Higher risk

- trying to migrate framework and CMS at the same time
- redesigning the site during migration
- changing routing structure unnecessarily

## Recommended Implementation Strategy

Use a **parity-first migration**, not a redesign-first migration.

That means:

1. Rebuild the current site in Astro with matching behavior.
2. Verify content, SEO, and contact flow.
3. Switch deployment once parity is proven.
4. Only then expand into portfolio improvements.

This is the safest path and the one most likely to reduce maintenance quickly.

## Final Recommendation

For `aaron-russell.co.uk`, I would choose:

- **Astro now**
- **Contentful retained initially**
- **Cloudflare Pages retained**
- **portfolio expansion after parity**

That gives you the best balance of:

- lower maintenance
- better long-term performance posture
- simpler architecture
- flexibility for a richer portfolio site
- less framework overhead than Gatsby or Next.js

## Suggested Next Step

If you decide to proceed, the next concrete task should be:

**Create an Astro migration spike in parallel with the current Gatsby site, starting with homepage, blog index, and shared layout components.**
