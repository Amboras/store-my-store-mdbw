'use client'

import { useEffect, useRef } from 'react'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'

interface ProductViewTrackerProps {
  productId: string
  productTitle: string
  variantId?: string | null
  currency?: string | null
  value?: number | null
}

export function ProductViewTracker({
  productId,
  productTitle,
  variantId,
  currency,
  value,
}: ProductViewTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return

    tracked.current = true
    trackMetaEvent('ViewContent', {
      content_ids: [variantId || productId],
      content_type: 'product',
      content_name: productTitle,
      value: toMetaCurrencyValue(value),
      currency: currency || 'usd',
    })
  }, [currency, productId, productTitle, value, variantId])

  return null
}
