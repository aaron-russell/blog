# AI-Ready Blog: Optional Features Status

## Summary

This repo currently has two optional agent-facing enhancements implemented:

1. WebMCP browser-side tool exposure
2. HTML-to-markdown negotiation for agent requests

DNS-AID remains documentation-only, and OAuth/OIDC discovery is intentionally not published because this site does not expose protected APIs or a real login flow.

## Implemented

### WebMCP Tool Library
**File**: [src/lib/webmcp.ts](src/lib/webmcp.ts)

Exposes browser-side tool metadata for:
- `search_blog`
- `get_blog_post`
- `list_recent_posts`
- `submit_contact`
- `get_site_info`

### Markdown Conversion
**Files**:
- [functions/markdown-converter.ts](functions/markdown-converter.ts)
- [functions/_middleware.ts](functions/_middleware.ts)

Supports `Accept: text/markdown` for HTML responses and returns:
- `Content-Type: text/markdown; charset=utf-8`
- `X-Markdown-Version: 1.0`
- `X-Markdown-From-Html: true`

### Layout Integration
**File**: [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro)

Loads the WebMCP module on page load with graceful fallback when the browser does not support it.

## Not Published

### OAuth/OIDC Discovery

This repo does **not** publish:
- `/.well-known/openid-configuration`
- `/.well-known/oauth-authorization-server`
- `/.well-known/oauth-protected-resource`

That is deliberate. The site is public and does not currently run a real OAuth or OpenID Connect provider.

### DNS-AID

DNS-AID is not configured in DNS from this repo. The guide in [DNS-AID-SETUP.md](DNS-AID-SETUP.md) is informational only.

## Verification

```bash
curl -i https://aaron-russell.co.uk/ | grep -i link
curl -s https://aaron-russell.co.uk/.well-known/api-catalog | jq .
curl -s https://aaron-russell.co.uk/.well-known/mcp/server-card.json | jq .
curl -s https://aaron-russell.co.uk/.well-known/agent-skills/index.json | jq .
curl -H "Accept: text/markdown" https://aaron-russell.co.uk/ | head -20
```

## Future Additions

Add OAuth/OIDC discovery only if the site later gains:
- protected APIs
- a real authorization server
- a JWKS endpoint
- documented token scopes and grant types
