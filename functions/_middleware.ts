import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'
import { v4 as uuidv4 } from 'uuid'
import { AkismetClient } from 'akismet-api'

interface Env {
  NAMESPACE: KVNamespace
  AKISMET_KEY: string
}

export const onRequest: PagesFunction<Env> = (context) =>
  staticFormsPlugin({
    respondWith: async ({ formData, name }) => {
      try {
        const email = formData.get('email')
        const message = formData.get('message')
        const nameOnForm = formData.get('name')

        const key = context.env.AKISMET_KEY
        const blog = 'https://aaron-russell.co.uk'
        const client = new AkismetClient({ key, blog })

        const comment: {
          name: string
          email: string
          message: string
          isSpam?: boolean
        } = {
          name: nameOnForm,
          email,
          message,
        }

        const isSpam = await client.checkSpam(comment)
        comment.isSpam = isSpam
        await context.env.NAMESPACE.put(uuidv4(), JSON.stringify(comment))

        return Response.redirect(
          'https://aaron-russell.co.uk/contact?submitted=true'
        )
      } catch (error) {
        console.log(error)
      }
    },
  })(context)
