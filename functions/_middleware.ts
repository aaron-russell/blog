import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'
import { v4 as uuidv4 } from 'uuid'

interface Env {
  NAMESPACE: KVNamespace
}

export const onRequest: PagesFunction<Env> = (context) =>
  staticFormsPlugin({
    respondWith: async ({ formData, name }) => {
      const email = formData.get('email')
      const message = formData.get('message')
      const nameOnForm = formData.get('name')

      await context.env.NAMESPACE.put(
        uuidv4(),
        JSON.stringify({
          name: nameOnForm,
          email,
          message,
        })
      )

      return Response.redirect(
        'https://beta.aaron-russell.co.uk/contact?submitted=true'
      )
    },
  })(context)
