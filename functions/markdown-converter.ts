// Simple HTML to Markdown converter for agent responses
// Handles common HTML elements and converts them to markdown

export function htmlToMarkdown(html: string): string {
  let markdown = html
    // Remove script and style tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    
    // Headings
    .replace(/<h1[^>]*>([^<]*)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>([^<]*)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>([^<]*)<\/h3>/gi, '### $1\n')
    .replace(/<h4[^>]*>([^<]*)<\/h4>/gi, '#### $1\n')
    .replace(/<h5[^>]*>([^<]*)<\/h5>/gi, '##### $1\n')
    .replace(/<h6[^>]*>([^<]*)<\/h6>/gi, '###### $1\n')
    
    // Strong/bold
    .replace(/<strong[^>]*>([^<]*)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([^<]*)<\/b>/gi, '**$1**')
    
    // Emphasis/italic
    .replace(/<em[^>]*>([^<]*)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([^<]*)<\/i>/gi, '*$1*')
    
    // Links
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, '[$2]($1)')
    
    // Code blocks
    .replace(/<pre[^>]*><code[^>]*>([^<]*)<\/code><\/pre>/gi, '\n```\n$1\n```\n')
    .replace(/<code[^>]*>([^<]*)<\/code>/gi, '`$1`')
    
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    
    // Paragraphs
    .replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1\n\n')
    
    // List items
    .replace(/<li[^>]*>([^<]*)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n')
    .replace(/<ol[^>]*>([^<]*)<\/ol>/gi, '$1\n')
    
    // Blockquotes
    .replace(/<blockquote[^>]*>([^<]*)<\/blockquote>/gi, '> $1\n')
    
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return markdown
}

// Check if response is HTML
export function isHtmlResponse(contentType: string): boolean {
  return contentType.includes('text/html')
}

// Check if request accepts markdown
export function requestsMarkdown(acceptHeader: string): boolean {
  return (
    acceptHeader.includes('text/markdown') ||
    acceptHeader.includes('application/markdown')
  )
}
