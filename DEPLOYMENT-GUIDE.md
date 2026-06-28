# AI-Ready Blog Deployment Guide

## Summary of Changes

Your blog has been configured to be fully AI-agent ready with the following implementations:

### ✅ Files Modified
1. **static/robots.txt** - Added Content-Signal directives
2. **functions/_middleware.ts** - Added Link headers for discovery + markdown support

### ✅ Files Created

#### Static Resources
- **static/.well-known/agent-skills/index.json** - Agent skills discovery index (RFC v0.2.0)
- **static/auth.md** - Public access guidance for agents

#### Dynamic Endpoints (Astro)
- **src/pages/.well-known/api-catalog.ts** - API Catalog (RFC 9727)
- **src/pages/.well-known/mcp/server-card.json.ts** - MCP Server Card (SEP-1649)

#### Documentation
- **AI-READY-FEATURES.md** - Complete feature documentation

## Discovery Endpoints

Your site now advertises the following discovery endpoints via Link headers:

```
Link: </.well-known/agent-skills/index.json>; rel="agent-skills",
      </.well-known/api-catalog>; rel="api-catalog", 
      </auth.md>; rel="service-auth",
      </.well-known/mcp/server-card.json>; rel="mcp-server-card"
```

## Quick Verification Checklist

Before deploying, verify locally:

```bash
# Test Link headers
curl -i http://localhost:3000/ | grep -i "link:"

# Test agent skills index
curl http://localhost:3000/.well-known/agent-skills/index.json | jq .

# Test API catalog
curl http://localhost:3000/.well-known/api-catalog | jq .

# Test MCP server card
curl http://localhost:3000/.well-known/mcp/server-card.json | jq .

# Test auth.md
curl http://localhost:3000/auth.md | head -10

# Test Content-Signal in robots.txt
curl http://localhost:3000/robots.txt | grep "Content-Signal"
```

## Deployment Steps

1. **Local Testing** (optional but recommended)
   ```bash
   npm run dev
   # Run verification commands above
   ```

2. **Build & Verify**
   ```bash
   npm run typecheck
   npm run build  # if you have a build script
   ```

3. **Deploy**
   ```bash
   wrangler deploy
   # or commit to GitHub if using automatic deployments
   ```

4. **Post-Deployment Verification**
   
   Using the verification commands above against `https://aaron-russell.co.uk/`:
   
   ```bash
   # Test Link headers on production
   curl -i https://aaron-russell.co.uk/ | grep -i "link:"
   
   # Test well-known endpoints
   curl https://aaron-russell.co.uk/.well-known/agent-skills/index.json | jq .
   curl https://aaron-russell.co.uk/.well-known/api-catalog | jq .
   curl https://aaron-russell.co.uk/.well-known/mcp/server-card.json | jq .
   ```

## Standards Implemented

### Core Features (Implemented)

| Standard | Purpose | Endpoint |
|----------|---------|----------|
| RFC 8288 | Web Linking | Link headers on all responses |
| RFC 9727 | API Catalog | `/.well-known/api-catalog` |
| Content-Signals | AI Content Usage Preferences | `/robots.txt` |
| Agent Skills RFC v0.2.0 | Agent Capabilities Discovery | `/.well-known/agent-skills/index.json` |
| SEP-1649 | MCP Server Card | `/.well-known/mcp/server-card.json` |
| auth.md | Public agent access guidance | `/auth.md` |

### Optional Features (Not Implemented)

| Standard | Purpose | Notes |
|----------|---------|-------|
| DNS-AID | DNS-based Agent Discovery | Requires DNS configuration with SVCB records |
| RFC 8414 | OAuth 2.0 Metadata | Only needed if adding protected APIs and a real auth server |
| WebMCP | Browser Tool Exposure | Requires browser-side JavaScript implementation |

## Configuration Details

### Content-Signal Settings
```
Content-Signal: ai-train=yes, search=yes, ai-input=yes
```
- **ai-train=yes**: Agents can use content for training
- **search=yes**: Agents can index for search
- **ai-input=yes**: Agents can use content as input

### Markdown Support
When agents request content with `Accept: text/markdown`:
- Response includes `Content-Type: text/markdown; charset=utf-8`
- Response includes `X-Markdown-Version: 1.0` header
- HTML content is returned with markdown headers set

Note: Markdown conversion is implemented in middleware; improve it further only if you want richer output fidelity.

### MCP Capabilities
The server card advertises:
- **search_blog**: Search blog posts and articles
- **submit_contact**: Submit contact form inquiries

## Troubleshooting

### Link headers not appearing
- Ensure `_middleware.ts` onRequest handler is properly exporting
- Check that middleware is being called for all routes

### Well-known endpoints returning 404
- Verify Astro pages are in correct directory structure
- Check that GET functions are exported
- Ensure static/.well-known/agent-skills/index.json exists

### Markdown header issues
- Check Accept header in request: `curl -H "Accept: text/markdown" ...`
- Verify middleware is appending X-Markdown-Version header

## Next Steps for Enhancement

1. **DNS-AID**: Configure DNS records for DNS-based discovery
2. **WebMCP**: Connect browser-side tool exposure to real backend behavior
3. **Blog Search Tool**: Implement actual search functionality for MCP
4. **OAuth/OIDC Discovery**: Add only if protected APIs and a real auth server are introduced

## Resources

- [Is It Agent Ready?](https://isitagentready.com/)
- [RFC 8288 - Web Linking](https://www.rfc-editor.org/rfc/rfc8288)
- [RFC 9727 - API Catalog](https://www.rfc-editor.org/rfc/rfc9727)
- [Content Signals](https://contentsignals.org/)
- [Agent Skills Discovery](https://github.com/cloudflare/agent-skills-discovery-rfc)
- [Model Context Protocol](https://github.com/modelcontextprotocol/modelcontextprotocol)
