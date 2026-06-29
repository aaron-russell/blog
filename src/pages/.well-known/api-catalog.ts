export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: 'https://aaron-russell.co.uk/',
        links: [
          {
            rel: 'service-doc',
            href: 'https://aaron-russell.co.uk/',
            type: 'text/html',
            title: 'Blog Home',
          },
          {
            rel: 'service-desc',
            href: 'https://aaron-russell.co.uk/openapi.json',
            type: 'application/openapi+json',
            title: 'Public discovery OpenAPI description',
          },
          {
            rel: 'status',
            href: 'https://aaron-russell.co.uk/status.json',
            type: 'application/json',
            title: 'Public status document',
          },
          {
            rel: 'service-meta',
            href: 'https://aaron-russell.co.uk/auth.md',
            type: 'text/markdown',
            title: 'Public agent access notes',
          },
          {
            rel: 'agent',
            href: 'https://aaron-russell.co.uk/.well-known/agent-card.json',
            type: 'application/json',
          },
          {
            rel: 'agent-skills',
            href: 'https://aaron-russell.co.uk/.well-known/agent-skills/index.json',
            type: 'application/json',
          },
          {
            rel: 'mcp-server-card',
            href: 'https://aaron-russell.co.uk/.well-known/mcp/server-card.json',
            type: 'application/json',
          },
        ],
      },
    ],
  }

  return new Response(JSON.stringify(catalog, null, 2), {
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
