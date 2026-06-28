# Agent Discovery & Access

This site publishes public, machine-readable discovery metadata for AI agents and crawlers.

## Overview

This is a personal development blog built with Astro and deployed on Cloudflare Pages. Read access is public and does not require a login, API key, or OAuth flow.

## Capabilities

### Content Discovery
- **Blog Archive**: Full archive of technical articles at [/blog/](/blog/)
- **Agent Card**: Site summary at [/.well-known/agent-card.json](/.well-known/agent-card.json)
- **Agent Skills Index**: Discoverable skills at [/.well-known/agent-skills/index.json](/.well-known/agent-skills/index.json)
- **API Catalog**: RFC 9727 API catalog at [/.well-known/api-catalog](/.well-known/api-catalog)
- **MCP Server Card**: Tool metadata at [/.well-known/mcp/server-card.json](/.well-known/mcp/server-card.json)

### Interaction
- **Contact Form**: Submit inquiries via [/contact/](/contact/)
- **Markdown Support**: Agents can request markdown responses with `Accept: text/markdown`

## Authentication

This site is publicly accessible and does not expose a live OAuth or OpenID Connect login flow today.

### For Protected Actions

If you need anything beyond public reading access, use the [contact form](/contact/) or email [aaron@aaron-russell.co.uk](mailto:aaron@aaron-russell.co.uk).

## Standards Supported

- **RFC 8288**: Link header-based resource discovery
- **RFC 9727**: API Catalog (linkset+json)
- **Content-Signals**: AI content usage preferences via robots.txt
- **WebMCP**: Tool exposure via browser context (when accessed via compatible clients)

## Support

For technical questions about agent integration or API capabilities, please submit an inquiry via the [contact form](/contact/).
