'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getConsent, hasAnalyticsConsent } from '@/lib/cookie-consent'
import {
  fetchMetaPixelConfig,
  getMetaPixelConfig,
  initMetaPixel,
  onMetaPixelReady,
  trackMetaPageView,
} from '@/lib/meta-pixel'

export function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)
  const [consentVersion, setConsentVersion] = useState<string | null>(() => getConsent()?.ts ?? null)

  useEffect(() => {
    const syncConsent = () => {
      const nextConsentVersion = getConsent()?.ts ?? null
      setConsentVersion((prev) => (prev === nextConsentVersion ? prev : nextConsentVersion))
    }

    window.addEventListener('focus', syncConsent)
    document.addEventListener('visibilitychange', syncConsent)
    window.addEventListener('storage', syncConsent)
    window.addEventListener('amboras-consent-changed', syncConsent)

    return () => {
      window.removeEventListener('focus', syncConsent)
      document.removeEventListener('visibilitychange', syncConsent)
      window.removeEventListener('storage', syncConsent)
      window.removeEventListener('amboras-consent-changed', syncConsent)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let unsubscribe = () => {}

    const bootstrap = async () => {
      if (!hasAnalyticsConsent()) {
        if (isMounted) setIsInitialized(false)
        return
      }

      const existingConfig = getMetaPixelConfig()
      if (existingConfig && initMetaPixel(existingConfig)) {
        if (isMounted) setIsInitialized(true)
        return
      }

      try {
        const config = await fetchMetaPixelConfig()
        if (!config) {
          if (isMounted) setIsInitialized(false)
          return
        }

        const ready = initMetaPixel(config)
        if (isMounted) {
          setIsInitialized(ready)
        }
      } catch {
        if (isMounted) setIsInitialized(false)
        // Meta pixel should never break the storefront experience
      }
    }

    bootstrap()
    unsubscribe = onMetaPixelReady(() => {
      if (isMounted) setIsInitialized(true)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [consentVersion])

  useEffect(() => {
    if (!hasAnalyticsConsent()) return
    if (!isInitialized) return

    trackMetaPageView(pathname)
  }, [consentVersion, isInitialized, pathname])

  return <>{children}</>
}
