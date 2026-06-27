const posthog = require('posthog-js')

const POSTHOG_API_KEY = 'phc_Tx60pBXpFuImoXXYIXUsSbdhQG02IqyouPF8EH0NZqW'
const POSTHOG_API_HOST = 'https://eu.i.posthog.com'

let hasInitialisedPosthog = false

const initialisePosthog = () => {
  if (typeof window === 'undefined' || hasInitialisedPosthog) {
    return
  }

  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_API_HOST,
    capture_pageview: false,
  })

  hasInitialisedPosthog = true
}

exports.onClientEntry = () => {
  initialisePosthog()
}

exports.onRouteUpdate = () => {
  if (typeof window === 'undefined') {
    return
  }

  initialisePosthog()

  if (window.zaraz) {
    window.zaraz.track('Pageview')
  }

  posthog.capture('$pageview')
}
