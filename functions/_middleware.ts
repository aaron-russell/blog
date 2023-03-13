import staticFormsPlugin from '@cloudflare/pages-plugin-static-forms'

export const onRequest: PagesFunction = staticFormsPlugin({
  respondWith: ({ formData, formName }) => {
    const email = formData.get('email')
    const message = formData.get('message')
    const name = formData.get('name')
    return new Response(
      `Hello ${name}, ${email}! Thank you for submitting the ${formName} form.`
    )
  },
})
