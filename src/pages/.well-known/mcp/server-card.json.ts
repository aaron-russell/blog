export async function GET() {
  const serverCard = {
    serverInfo: {
      name: "Aaron Russell Blog",
      version: "1.0.0",
      description: "Personal development blog with agent-ready capabilities"
    },
    transport: {
      type: "http",
      endpoint: "https://aaron-russell.co.uk"
    },
    capabilities: {
      resources: {
        enabled: true,
        types: ["blog-post", "article"]
      },
      tools: {
        enabled: true,
        definitions: [
          {
            name: "search_blog",
            description: "Search blog posts and articles",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "submit_contact",
            description: "Submit a contact form inquiry",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                message: { type: "string" }
              },
              required: ["name", "email", "message"]
            }
          }
        ]
      }
    }
  }

  return new Response(JSON.stringify(serverCard, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
