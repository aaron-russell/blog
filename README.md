# Aaron Russell's Development Blog

Personal blog built with Gatsby, Contentful, and Cloudflare Pages.

## Requirements

- Node `24.18.0`
- npm `10+`
- A Contentful space with delivery credentials for local content builds

This repository pins Node in [.nvmrc](/Users/aaronrussell/.codex/worktrees/e8f4/blog/.nvmrc:1). The expected verification baseline is:

```sh
npm ci
npm run verify
```

## Local development

1. Install dependencies:

```sh
npm ci
```

2. Create local environment files from the example:

```sh
cp .env.example .env.development
cp .env.example .env.production
```

3. Fill in your Contentful credentials, then start Gatsby:

```sh
npm run dev
```

The production build requires `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN`. Optional preview builds can also set `CONTENTFUL_HOST=preview.contentful.com`.

To verify that a production build has the required credentials before spending time in Gatsby:

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

The setup script writes `.env.development` and `.env.production` for you and imports [contentful/export.json](/Users/aaronrussell/.codex/worktrees/e8f4/blog/contentful/export.json:1) into the target space.

## Cloudflare Pages

This repo includes:

- Gatsby static output for the main site
- [functions/_middleware.ts](/Users/aaronrussell/.codex/worktrees/e8f4/blog/functions/_middleware.ts:1) for contact form validation, Turnstile verification, and KV-backed rate limiting
- [static/_headers](/Users/aaronrussell/.codex/worktrees/e8f4/blog/static/_headers:1) and [static/_redirects](/Users/aaronrussell/.codex/worktrees/e8f4/blog/static/_redirects:1) for Pages routing and security policies

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
