import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://aaron-russell.co.uk',
  output: 'static',
  publicDir: './static',
  trailingSlash: 'always',
})
