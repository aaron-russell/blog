import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'
import { v4 as uuidv4 } from 'uuid'
import { AkismetClient, Comment } from 'akismet-api'
import { Toucan } from 'toucan-js'

interface Env {
  NAMESPACE: KVNamespace
  AKISMET_KEY: string
  SENTRY_DSN: string
}

export const onRequest: PagesFunction<Env> = (context) =>
  staticFormsPlugin({
    respondWith: async ({ formData, name }) => {
      const sentry = new Toucan({
        dsn: context.env.SENTRY_DSN,
        context,
        request: context.request,
      })
      try {
        const email = formData.get('email')
        const content = formData.get('message')
        const nameOnForm = formData.get('name')

        const key = context.env.AKISMET_KEY
        const blog = 'https://aaron-russell.co.uk'
        const client = new AkismetClient({ key, blog })

        const comment: Comment = {
          user_ip: context.request.headers.get('CF-Connecting-IP') || '',
          user_agent: context.request.headers.get('User-Agent') || '',
          name: nameOnForm,
          email,
          content,
        }

        const isSpam = await client.checkSpam(comment)
        await context.env.NAMESPACE.put(
          uuidv4(),
          JSON.stringify({ ...comment, isSpam })
        )

        return Response.redirect(
          'https://aaron-russell.co.uk/contact?submitted=true'
        )
      } catch (error) {
        sentry.captureException(error)
      }
    },
  })(context)
