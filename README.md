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
- [functions/api/contact.ts](/Users/aaronrussell/.codex/worktrees/fb23/blog/functions/api/contact.ts:1) for the contact form API, Turnstile verification, Cloudflare Email delivery, and KV-backed rate limiting/archive
- [static/_headers](/Users/aaronrussell/.codex/worktrees/9f11/blog/static/_headers:1) and [static/_redirects](/Users/aaronrussell/.codex/worktrees/9f11/blog/static/_redirects:1) for Pages routing and security policies

Required Cloudflare bindings and secrets:

- `NAMESPACE` or `CONTACT_KV`
- `TURNSTILE_SECRET`
- `PUBLIC_TURNSTILE_SITE_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_EMAIL_API_TOKEN`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Optional:

- `CONTACT_FROM_NAME`
- `CONTACT_RATE_LIMIT_TTL_SECONDS`
- `CONTACT_ENABLE_ARCHIVE`
- `SENTRY_DSN`

## Contact form setup

The contact page uses the simplest Cloudflare-native path that still gives reliable delivery:

1. Astro renders the form on `/contact/`.
2. `POST /api/contact` runs in a Cloudflare Pages Function.
3. The function validates the payload, checks the honeypot, enforces a minimum fill time, rate-limits by IP with KV, and verifies Turnstile server-side when configured.
4. Valid submissions are emailed to `CONTACT_TO_EMAIL` through Cloudflare Email Service using a server-side API token.
5. Successful submissions are optionally archived in KV for recovery/audit.

Cloudflare setup checklist:

1. Create a Turnstile widget for your production hostname and set `PUBLIC_TURNSTILE_SITE_KEY` plus `TURNSTILE_SECRET`.
2. Create a KV namespace for contact rate limiting/archive and bind it as `CONTACT_KV` or `NAMESPACE`.
3. Enable Cloudflare Email Service for the sender domain you want to use, for example `contact@aaron-russell.co.uk`.
4. Create a Cloudflare API token with permission to send email from that account and store it in `CLOUDFLARE_EMAIL_API_TOKEN`.
5. Set `CLOUDFLARE_ACCOUNT_ID`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` in Cloudflare Pages project variables/secrets.

## CI

GitHub Actions runs:

- `npm run lint`
- `npm test`
- `npm run typecheck`

Production deployment additionally runs `npm run build:contentful` when the Contentful secrets are available.
