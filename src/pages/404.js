import Layout from '../components/layout'
import Seo from '../components/seo'

const NotFoundPage = () => (
  <Layout>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>404: Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </div>
  </Layout>
)

export default NotFoundPage

export const Head = () => (
  <Seo
    title="Page not found"
    meta={[{ name: 'robots', content: 'noindex' }]}
  />
)
