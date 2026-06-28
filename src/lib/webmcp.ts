// WebMCP tool definitions and context provider
// Exposes blog tools to AI agents via the Web MCP API

// Extend Navigator interface for WebMCP
declare global {
  interface Navigator {
    modelContext?: {
      provideContext(context: WebMCPContext): void
    }
  }
}

interface WebMCPTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, unknown>
    required: string[]
  }
}

interface WebMCPContext {
  tools: WebMCPTool[]
  execute: (toolName: string, input: Record<string, unknown>) => Promise<unknown>
}

// Define available tools
const tools: WebMCPTool[] = [
  {
    name: "search_blog",
    description: "Search blog posts and articles by keyword",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term to find in blog posts"
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 10)",
          default: 10
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_blog_post",
    description: "Retrieve a specific blog post by slug",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "URL slug of the blog post (e.g., 'my-article')"
        }
      },
      required: ["slug"]
    }
  },
  {
    name: "list_recent_posts",
    description: "List recently published blog posts",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of recent posts to return (default: 5)",
          default: 5
        }
      },
      required: []
    }
  },
  {
    name: "submit_contact",
    description: "Submit a contact form message",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Sender's name"
        },
        email: {
          type: "string",
          description: "Sender's email address"
        },
        message: {
          type: "string",
          description: "Message content"
        }
      },
      required: ["name", "email", "message"]
    }
  },
  {
    name: "get_site_info",
    description: "Get information about the blog site",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
]

// Tool execution handlers
async function executeTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "search_blog":
      return {
        status: "success",
        message: "Blog search available at https://aaron-russell.co.uk/blog/",
        query: input.query,
        note: "Use the blog page search or contact us for specific queries"
      }

    case "get_blog_post":
      return {
        status: "success",
        url: `https://aaron-russell.co.uk/blog/${input.slug}/`,
        note: "Visit the URL to view the blog post"
      }

    case "list_recent_posts":
      return {
        status: "success",
        url: "https://aaron-russell.co.uk/blog/",
        note: "Recent posts are listed on the blog home page"
      }

    case "submit_contact":
      return {
        status: "pending",
        message: "Contact form submission ready",
        url: "https://aaron-russell.co.uk/contact/",
        instructions: "Submit via the contact form at the URL above"
      }

    case "get_site_info":
      return {
        name: "Aaron Russell's Development Blog",
        url: "https://aaron-russell.co.uk",
        description: "Technical articles and insights on web development",
        capabilities: ["blog-discovery", "contact-submission"],
        standards: [
          "RFC 8288 (Web Linking)",
          "RFC 9727 (API Catalog)",
          "RFC 9728 (OAuth Protected Resource)",
          "MCP (Model Context Protocol)",
          "WebMCP"
        ]
      }

    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

// Initialize WebMCP context
export function initializeWebMCP(): void {
  if (!globalThis.navigator?.modelContext) {
    console.warn("WebMCP not available in this browser")
    return
  }

  const context: WebMCPContext = {
    tools,
    execute: executeTool
  }

  try {
    // Provide context to the model
    globalThis.navigator.modelContext?.provideContext(context)
    console.log("WebMCP tools registered:", tools.map(t => t.name))
  } catch (error) {
    console.error("Failed to initialize WebMCP:", error)
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWebMCP)
  } else {
    initializeWebMCP()
  }
}
