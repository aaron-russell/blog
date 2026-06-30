# Content Audit

Reviewed on `2026-06-30`.

This is an internal editorial note for the current content-refresh pass. It keeps URL preservation, freshness decisions, and draft/publish state in one place.

## Priority posts

| Slug | Current title / direction | Decision | CMS state |
| --- | --- | --- | --- |
| `pros-and-cons-of-using-cloudflare` | Cloudflare flagship article | Updated in place for 2026 | Draft in Contentful |
| `firebase-vs-supabase-vs-aws-amplify-vs-appwrite` | BaaS comparison | Updated in place for 2026 | Draft in Contentful |
| `advanced-techniques-for-optimizing-database-performance` | Database performance guide | Updated in place for 2026 | Already published |
| `pagespeed-insights` | PageSpeed / CWV explainer | Updated in place for 2026 | Draft in Contentful |
| `9-ways-to-improve-your-page-speed` | Page speed checklist | Updated in place for 2026 | Already published |
| `5-reasons-i-have-changed-to-capacitor` | Cordova to Capacitor | Updated in place for 2026 | Already published |
| `wordpress-vs-contentful-vs-ghost-vs-medium` | CMS comparison | Updated in place for 2026 | Draft in Contentful |
| `from-wordpress-to-gatsby-contentful-and-cloudflare-pages` | Migration history + current stack | Updated in place for 2026 | Draft in Contentful |
| `angular-vs-react-vs-vue-choosing-the-right-javascript-framework-for-you` | Framework comparison | Updated in place for 2026 | Draft in Contentful |
| `16-awesome-gulp-plugins` | Historical Gulp article rewritten for 2026 context | Updated in place for 2026 | Already published |

## Lower-priority decisions

| Slug | Decision | Reason |
| --- | --- | --- |
| `its-okay-not-to-be-okay-my-mental-health` | Keep, reviewed, historical banner | Personal and authentic; not SEO-first |
| `from-one-digital-partner-to-another` | Keep, noindex, historical banner | Career/project reflection, not current evergreen guidance |
| `adverts-with-a-loose-connection` | Keep, noindex, archive banner | Thin post, not worth indexation |
| `why-seo` | Keep, noindex, historical banner | Personal context only |
| `improve-your-seo` | Keep, noindex, archive banner | Older SEO framing with factual drift risk |
| `the-strategy-behind-your-seo-6-step-plan-of-attack` | Keep, noindex, historical banner | Older SEO planning advice |
| `the-trust-behind-backlinks` | Keep, noindex, historical banner | Older authority/backlinks framing |
| `securing-angular-when-using-firestore` | Update | High-value technical post with current security risk if left stale |

## Generic engineering posts still needing manual review

These remain online, but are still effectively `needs-review` unless rewritten later:

- `the-benefits-of-agile-software-development`
- `introduction-to-test-driven-development`
- `5-tips-for-improving-your-code-readability`
- `sql-vs-nosql-vs-newsql`
- `securing-web-applications-best-practices`

## Freshness model now in code

- `publishDate` remains the original post date.
- `updatedDate` only appears when a post was genuinely rewritten or refreshed.
- `reviewedDate` is used for reviewed/archive/historical labelling.
- `status` is handled in the repo overlay with: `current`, `needs-review`, `historical`, `archived`.

## Review state in Contentful

Drafts waiting for review in Contentful after this pass:

- `pros-and-cons-of-using-cloudflare`
- `firebase-vs-supabase-vs-aws-amplify-vs-appwrite`
- `pagespeed-insights`
- `wordpress-vs-contentful-vs-ghost-vs-medium`
- `from-wordpress-to-gatsby-contentful-and-cloudflare-pages`
- `angular-vs-react-vs-vue-choosing-the-right-javascript-framework-for-you`

Already published in Contentful during this pass:

- `advanced-techniques-for-optimizing-database-performance`
- `9-ways-to-improve-your-page-speed`
- `5-reasons-i-have-changed-to-capacitor`
- `16-awesome-gulp-plugins`

## No URL changes

- No slugs were changed.
- No redirects were added in this pass because no article URL was removed or renamed.
