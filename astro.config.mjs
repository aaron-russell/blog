import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://aaron-russell.co.uk',
  build: {
    // The site's small, route-specific styles are faster in the initial HTML than
    // behind extra render-blocking requests on mobile connections.
    inlineStylesheets: 'always',
  },
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.contentful.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
  output: 'static',
  publicDir: './static',
  trailingSlash: 'always',
})
