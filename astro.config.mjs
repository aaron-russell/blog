import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://aaron-russell.co.uk',
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
