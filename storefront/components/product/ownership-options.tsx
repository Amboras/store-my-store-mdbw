import { Plane, Key } from 'lucide-react'
import {
  estimateCharterHourlyCents,
  formatCharterHourly,
  formatPurchasePrice,
} from '@/lib/utils/charter-price'

interface OwnershipOptionsProps {
  purchaseAmount: number | null | undefined
  currency?: string
  variant?: 'detail' | 'card'
}

/**
 * Side-by-side "Acquire vs. Charter" display used on product detail pages.
 * On product cards we render a compact two-line summary instead.
 */
export default function OwnershipOptions({
  purchaseAmount,
  currency = 'usd',
  variant = 'detail',
}: OwnershipOptionsProps) {
  const charterHourly = estimateCharterHourlyCents(purchaseAmount)

  if (variant === 'card') {
    return (
      <div className="space-y-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Acquire
          </span>
          <span className="text-sm font-medium tabular-nums">
            {formatPurchasePrice(purchaseAmount, currency)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Charter from
          </span>
          <span className="text-sm tabular-nums text-accent">
            {formatCharterHourly(charterHourly, currency)}
          </span>
        </div>
      </div>
    )
  }

  // Detail view — large, editorial, dual-card layout
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
        Ownership Options
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Acquire card */}
        <div className="group relative border border-border bg-background p-5 transition-colors hover:border-accent">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-4 w-4 text-accent" strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Acquire
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-heading font-semibold tabular-nums">
                {formatPurchasePrice(purchaseAmount, currency)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Factory-new delivery, full title transfer
            </p>
          </div>
        </div>

        {/* Charter card */}
        <div className="group relative border border-border bg-background p-5 transition-colors hover:border-accent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-accent" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Charter
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              by the hour
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">from</span>
              <span className="text-3xl font-heading font-semibold tabular-nums">
                {formatCharterHourly(charterHourly, currency)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Flight hours billed on-demand, crew included
            </p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        Charter rates are estimates based on current market averages.
        Final quotes are provided by your Meridian concierge and vary with
        route, positioning, and seasonal demand.
      </p>
    </div>
  )
}
