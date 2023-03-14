import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'
import { randomBytes } from 'crypto'

interface Env {
  NAMESPACE: KVNamespace
}

export const onRequest: PagesFunction<Env> = (context) =>
  staticFormsPlugin({
    respondWith: async ({ formData, name }) => {
      const key = randomBytes(16).toString('hex')

      const email = formData.get('email')
      const message = formData.get('message')
      const nameOnForm = formData.get('name')

      await context.env.NAMESPACE.put(key, {
        name: nameOnForm,
        email,
        message,
      })

      return Response.redirect('/contact?submitted=true')
    },
  })(context)
