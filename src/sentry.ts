/**
 * Sentry integration — error monitoring for production.
 * DSN goes in VITE_SENTRY_DSN env var (Vercel + .env.local).
 * Does NOT initialize in dev (no VITE_SENTRY_DSN → silent no-op).
 */
import * as Sentry from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    // Only send errors, not performance data (free tier has limits)
    tracesSampleRate: 0,
    // Don't send in dev
    enabled: import.meta.env.PROD,
    // Filter noisy errors
    beforeSend(event) {
      // Skip ResizeObserver loop errors (Chrome bug, not actionable)
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) return null
      return event
    },
  })
}

export { Sentry }
