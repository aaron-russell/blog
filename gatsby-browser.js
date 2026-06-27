const posthog = require('posthog-js')

const POSTHOG_API_KEY =
  process.env.GATSBY_POSTHOG_API_KEY || 'phc_Tx60pBXpFuImoXXYIXUsSbdhQG02IqyouPF8EH0NZqW'
const POSTHOG_API_HOST = 'https://eu.i.posthog.com'

let hasInitialisedPosthog = false
let lastTrackedPath = null

const shouldTrack = () => {
  if (typeof window === 'undefined' || !POSTHOG_API_KEY) {
    return false
  }

  const doNotTrack = window.navigator?.doNotTrack || window.doNotTrack
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

  return doNotTrack !== '1' && !isLocalhost
}

const initialisePosthog = () => {
  if (!shouldTrack() || hasInitialisedPosthog) {
    return
  }

  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_API_HOST,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
  })

  hasInitialisedPosthog = true
}

exports.onClientEntry = () => {
  initialisePosthog()
}

exports.onRouteUpdate = () => {
  if (!shouldTrack()) {
    return
  }

  initialisePosthog()
  const nextPath = `${window.location.pathname}${window.location.search}`
  if (nextPath === lastTrackedPath) {
    return
  }

  posthog.capture('$pageview', {
    path: window.location.pathname,
  })
  lastTrackedPath = nextPath
}
