'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Check, Loader2, Minus, Plus, Sparkles, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils/format-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'

type BundleKey = 'single' | 'twin' | 'trio'

interface BundleSelectorProps {
  productId: string
  productTitle: string
  variantId: string
  unitPriceCents: number
  currency: string
  inventoryQuantity?: number | null
  allowBackorder?: boolean
  trio?: {
    productHandle: string
    variantId: string
    priceCents: number
    originalPriceCents?: number | null
  } | null
}

export default function BundleSelector({
  productId,
  productTitle,
  variantId,
  unitPriceCents,
  currency,
  inventoryQuantity,
  allowBackorder,
  trio,
}: BundleSelectorProps) {
  const [selected, setSelected] = useState<BundleKey>('twin') // default to "best value"
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItemAsync, applyPromoCode, isAddingItem } = useCart()

  const isOutOfStock = !allowBackorder && inventoryQuantity != null && inventoryQuantity <= 0
  const isLowStock = inventoryQuantity != null && inventoryQuantity > 0 && inventoryQuantity <= 12

  // Bundle math
  const twinPrice = Math.round(unitPriceCents * 2 * 0.9) // 10% off two
  const twinSavings = unitPriceCents * 2 - twinPrice
  const trioOriginal = trio?.originalPriceCents ?? unitPriceCents * 3
  const trioSavings = trio ? trioOriginal - trio.priceCents : 0

  // Quantity multiplier shown only for the Single bundle
  const showQuantity = selected === 'single'

  const handleAddToCart = async () => {
    if (isOutOfStock) return

    try {
      let addedVariantId = variantId
      let addedQty = 1

      if (selected === 'single') {
        addedVariantId = variantId
        addedQty = quantity
      } else if (selected === 'twin') {
        addedVariantId = variantId
        addedQty = 2
      } else if (selected === 'trio' && trio) {
        addedVariantId = trio.variantId
        addedQty = 1
      }

      await addItemAsync({ variantId: addedVariantId, quantity: addedQty })

      // Apply 10% promo for Twin pack
      if (selected === 'twin') {
        try {
          await applyPromoCode('DOUBLE10')
        } catch {
          // promo may already be applied — ignore
        }
      }

      const valueCents =
        selected === 'twin'
          ? twinPrice
          : selected === 'trio' && trio
          ? trio.priceCents
          : unitPriceCents * addedQty

      trackAddToCart(productId, addedVariantId, addedQty, valueCents)
      const metaValue = toMetaCurrencyValue(valueCents)
      trackMetaEvent('AddToCart', {
        content_ids: [addedVariantId],
        content_type: 'product',
        content_name: productTitle,
        value: metaValue,
        currency,
        contents: [{ id: addedVariantId, quantity: addedQty, item_price: metaValue / addedQty }],
        num_items: addedQty,
      })

      setJustAdded(true)
      toast.success(
        selected === 'twin'
          ? '2 candles added · 10% off applied'
          : selected === 'trio'
          ? 'Ritual Trio added to bag'
          : `${addedQty} added to bag`,
      )
      setTimeout(() => setJustAdded(false), 2200)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to add to bag')
    }
  }

  const buttonLabel = (() => {
    if (isOutOfStock) return 'Sold Out'
    if (justAdded) return 'Added to Bag'
    if (selected === 'twin') {
      return `Add 2 to Bag · ${formatPrice(twinPrice, currency)}`
    }
    if (selected === 'trio' && trio) {
      return `Add Trio · ${formatPrice(trio.priceCents, currency)}`
    }
    return `Add to Bag · ${formatPrice(unitPriceCents * quantity, currency)}`
  })()

  return (
    <div className="space-y-5">
      {/* Bundle option cards */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Choose Your Ritual
        </p>
        <div className="space-y-2.5">
          {/* Single */}
          <button
            type="button"
            onClick={() => setSelected('single')}
            className={`w-full text-left border transition-all ${
              selected === 'single'
                ? 'border-foreground bg-foreground/[0.03]'
                : 'border-border hover:border-foreground/50'
            }`}
          >
            <div className="flex items-center gap-4 p-4">
              <span
                className={`relative h-4 w-4 rounded-full border flex-shrink-0 transition-colors ${
                  selected === 'single' ? 'border-foreground' : 'border-border'
                }`}
              >
                {selected === 'single' && (
                  <span className="absolute inset-1 rounded-full bg-foreground" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">Single Candle</span>
                  <span className="font-medium tabular-nums">
                    {formatPrice(unitPriceCents, currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  One 8 oz vessel · 60+ hours of burn
                </p>
              </div>
            </div>
          </button>

          {/* Twin Pack — Best Value */}
          <button
            type="button"
            onClick={() => setSelected('twin')}
            className={`w-full text-left border transition-all relative ${
              selected === 'twin'
                ? 'border-accent bg-accent/[0.06] ring-1 ring-accent/40'
                : 'border-border hover:border-foreground/50'
            }`}
          >
            <span className="absolute -top-2.5 left-4 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-[0.2em] px-2 py-0.5">
              Most Loved
            </span>
            <div className="flex items-center gap-4 p-4 pt-5">
              <span
                className={`relative h-4 w-4 rounded-full border flex-shrink-0 transition-colors ${
                  selected === 'twin' ? 'border-accent' : 'border-border'
                }`}
              >
                {selected === 'twin' && (
                  <span className="absolute inset-1 rounded-full bg-accent" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium flex items-center gap-2">
                    Twin Pack <span className="text-[10px] uppercase tracking-luxe text-accent">10% off</span>
                  </span>
                  <span className="font-medium tabular-nums">
                    <span className="text-muted-foreground line-through mr-1.5 text-xs">
                      {formatPrice(unitPriceCents * 2, currency)}
                    </span>
                    {formatPrice(twinPrice, currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Two 8 oz candles · save {formatPrice(twinSavings, currency)} with code DOUBLE10
                </p>
              </div>
            </div>
          </button>

          {/* Trio Set */}
          {trio && (
            <button
              type="button"
              onClick={() => setSelected('trio')}
              className={`w-full text-left border transition-all ${
                selected === 'trio'
                  ? 'border-foreground bg-foreground/[0.03]'
                  : 'border-border hover:border-foreground/50'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                <span
                  className={`relative h-4 w-4 rounded-full border flex-shrink-0 transition-colors ${
                    selected === 'trio' ? 'border-foreground' : 'border-border'
                  }`}
                >
                  {selected === 'trio' && (
                    <span className="absolute inset-1 rounded-full bg-foreground" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium flex items-center gap-2">
                      The Ritual Trio
                      {trioSavings > 0 && (
                        <span className="text-[10px] uppercase tracking-luxe text-accent">
                          Save {formatPrice(trioSavings, currency)}
                        </span>
                      )}
                    </span>
                    <span className="font-medium tabular-nums">
                      {trioSavings > 0 && (
                        <span className="text-muted-foreground line-through mr-1.5 text-xs">
                          {formatPrice(trioOriginal, currency)}
                        </span>
                      )}
                      {formatPrice(trio.priceCents, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All three signature scents · 180+ hours · gift-ready
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Low stock warning */}
      {isLowStock && (
        <div className="flex items-center gap-2 text-xs text-accent">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Only {inventoryQuantity} left in this batch
        </div>
      )}

      {/* Quantity (single only) + Add to Cart */}
      <div className="flex gap-3 items-stretch">
        {showQuantity && (
          <div className="flex items-center border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-muted transition-colors"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-muted transition-colors"
              disabled={
                isOutOfStock ||
                (!allowBackorder && inventoryQuantity != null && quantity >= inventoryQuantity)
              }
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingItem}
          className={`flex-1 flex items-center justify-center gap-2.5 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : justAdded
              ? 'bg-accent text-accent-foreground'
              : 'bg-foreground text-background hover:bg-accent'
          }`}
        >
          {isAddingItem ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" />
              {buttonLabel}
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              {buttonLabel}
            </>
          )}
        </button>
      </div>

      {/* Secondary link to trio product page if not already on it */}
      {trio && (
        <Link
          href={`/products/${trio.productHandle}`}
          className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-accent transition-colors pt-1"
        >
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          See the Ritual Trio collection
        </Link>
      )}
    </div>
  )
}
