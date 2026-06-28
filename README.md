# Aaron Russell's Development Blog

Personal blog built with Astro, Contentful, and Cloudflare Pages.

## Requirements

- Node `24.18.0`
- npm `10+`
- A Contentful space with delivery credentials for local content builds

This repository pins Node in [.nvmrc](.nvmrc). The expected verification baseline is:

```sh
npm ci
npm run verify
```

## Local development

1. Install dependencies with the pinned runtime:

```sh
source "$HOME/.nvm/nvm.sh"
nvm use
npm ci
```

2. Create local environment files:

```sh
cp .env.example .env.development
cp .env.example .env.production
```

3. Fill in your Contentful credentials, then start Astro:

```sh
npm run dev
```

The production build requires `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN`. Optional preview builds can also set `CONTENTFUL_HOST=preview.contentful.com`.

For programmatic Contentful fixes and imports, also set:

- `CONTENTFUL_MANAGEMENT_TOKEN`
- optional `CONTENTFUL_ENVIRONMENT` (defaults to `master`)

Optional analytics environment variables:

- `PUBLIC_POSTHOG_API_KEY`: PostHog project API key. Leave empty to disable analytics.
- `PUBLIC_REQUIRE_ANALYTICS_CONSENT`: Set to `true` to require `localStorage['analytics-consent'] = 'granted'` before tracking.

To verify that a production build has the required credentials before spending time in Astro:

```sh
npm run build:check
```

To run the full credential-checked production build:

```sh
npm run build:contentful
```

## Contentful setup

To bootstrap a fresh Contentful space with the bundled content model and sample content:

```sh
npm run setup
```

The setup script writes `.env.development` and `.env.production` for you and imports [contentful/export.json](contentful/export.json) into the target space.

## Programmatic SEO fixes

The repo includes a dry-run-first Contentful management script for deterministic SEO cleanup on `blogPost` entries.

Dry run:

```sh
npm run contentful:fix-seo
```

Write and publish:

```sh
npm run contentful:fix-seo:write
```

Current automated fixes:

- normalize known tag variants such as `Quesrions`, `pagespeed`, and `Web development`
- normalize same-origin blog canonicals to the trailing-slash URL
- remove duplicated consecutive paragraphs in rich-text descriptions

The script only updates entries that actually change, and `--dry-run` is the default safety mode.

## Cloudflare Pages

This repo includes:

- Astro static output for the main site
- [functions/_middleware.ts](functions/_middleware.ts) for contact form validation, Turnstile verification, and KV-backed rate limiting
- build-time Open Graph image generation under [src/pages/og](src/pages/og), rendered by [src/lib/og.ts](src/lib/og.ts)
- [static/_headers](static/_headers) and [static/_redirects](static/_redirects) for Pages routing and security policies

Required Cloudflare bindings and secrets:

- `NAMESPACE`
- `SENTRY_DSN`
- `TURNSTILE_SECRET`

## Open Graph images

The site now emits branded 1200x630 PNGs for:

- the home page at `/og/site.png`
- the blog index at `/og/blog.png`
- the contact page at `/og/contact.png`
- every post at `/og/blog/<slug>.png`

This is intentionally build-time rather than request-time:

- Astro already has the post metadata during the production build
- Cloudflare Pages can serve the generated PNGs as immutable static assets
- social crawlers avoid worker cold starts and runtime Contentful fetches

The metadata layer in [src/components/SeoHead.astro](src/components/SeoHead.astro) now also emits `og:image:width`, `og:image:height`, and `og:image:type` alongside the Open Graph and Twitter image URLs.

## CI

GitHub Actions runs:

- `npm run lint`
- `npm test`
- `npm run typecheck`

Production deployment additionally runs `npm run build:contentful` when the Contentful secrets are available.

## Image strategy

Contentful-backed UI images are optimized at request time via Contentful's Images API rather than downloaded and reprocessed during the Astro build. This keeps Cloudflare Pages builds simple while still shipping responsive image markup.

- `src/components/ResponsiveImage.astro` emits `<picture>` markup with AVIF and WebP sources plus a progressive JPEG fallback.
- `src/lib/contentful-images.ts` centralizes HTTPS normalization, width clamping, responsive `srcset` generation, intrinsic dimensions, and social image transforms.
- Hero images should use `priority` and must not be lazy-loaded.
- Card and rich-text images should stay lazy-loaded and declare explicit `sizes`, `width`, and `height`.
- Social and structured-data images stay on a stable 1200x630 progressive JPEG path for crawler compatibility.
