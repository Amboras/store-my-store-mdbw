'use client'

import { Truck, Sparkles } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils/format-price'

const FREE_SHIPPING_THRESHOLD = 7500 // $75 in cents

export default function AnnouncementBar() {
  const { subtotal, cart } = useCart()
  const currency = cart?.currency_code || 'usd'
  const cartSubtotal = subtotal || 0

  const qualifies = cartSubtotal >= FREE_SHIPPING_THRESHOLD
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal)
  const progress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="relative bg-foreground text-background">
      <div className="container-custom flex items-center justify-center gap-3 py-2.5 text-[11px] sm:text-xs uppercase tracking-[0.22em]">
        {qualifies ? (
          <>
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
            <p className="font-medium">
              <span className="text-accent">You qualify for free shipping</span>
              <span className="hidden sm:inline"> · use code </span>
              <span className="hidden sm:inline font-semibold">FREESHIP75</span>
            </p>
          </>
        ) : cartSubtotal > 0 ? (
          <>
            <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
            <p>
              <span className="hidden sm:inline">You&apos;re </span>
              <span className="font-semibold text-accent">{formatPrice(remaining, currency)}</span>
              <span> away from free shipping</span>
            </p>
          </>
        ) : (
          <>
            <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
            <p>
              <span className="hidden sm:inline">Complimentary shipping on </span>
              <span className="sm:hidden">Free shipping over </span>
              <span className="hidden sm:inline">US orders over </span>
              <span className="font-semibold">$75</span>
              <span className="hidden md:inline"> · hand-poured in small batches</span>
            </p>
          </>
        )}
      </div>
      {/* Progress bar when cart has items but doesn't qualify */}
      {cartSubtotal > 0 && !qualifies && (
        <div className="absolute bottom-0 inset-x-0 h-px bg-background/20">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
