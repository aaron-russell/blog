# Aaron Russell's Development Blog

Personal blog built with Astro, Contentful, and Cloudflare Pages.

## Requirements

- Node `24.18.0`
- npm `10+`
- A Contentful space with delivery credentials for local content builds

This repository pins Node in [.nvmrc](/Users/aaronrussell/.codex/worktrees/9f11/blog/.nvmrc:1). The expected verification baseline is:

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

The setup script writes `.env.development` and `.env.production` for you and imports [contentful/export.json](/Users/aaronrussell/.codex/worktrees/9f11/blog/contentful/export.json:1) into the target space.

## Cloudflare Pages

This repo includes:

- Astro static output for the main site
- [functions/_middleware.ts](/Users/aaronrussell/.codex/worktrees/9f11/blog/functions/_middleware.ts:1) for contact form validation, Turnstile verification, and KV-backed rate limiting
- [static/_headers](/Users/aaronrussell/.codex/worktrees/9f11/blog/static/_headers:1) and [static/_redirects](/Users/aaronrussell/.codex/worktrees/9f11/blog/static/_redirects:1) for Pages routing and security policies

Required Cloudflare bindings and secrets:

- `NAMESPACE`
- `SENTRY_DSN`
- `TURNSTILE_SECRET`

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
