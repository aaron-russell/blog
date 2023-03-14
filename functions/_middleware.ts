import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'
import { v6 as uuidv6 } from 'uuid'

interface Env {
  NAMESPACE: KVNamespace
}

export const onRequest: PagesFunction<Env> = (context) =>
  staticFormsPlugin({
    respondWith: async ({ formData, name }) => {
      const email = formData.get('email')
      const message = formData.get('message')
      const nameOnForm = formData.get('name')

      await context.env.NAMESPACE.put(uuidv6(), {
        name: nameOnForm,
        email,
        message,
      })

      return Response.redirect('/contact?submitted=true')
    },
  })(context)
