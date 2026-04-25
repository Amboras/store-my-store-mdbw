'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Minus, Plus, Trash2, Sparkles, Truck, Loader2 } from 'lucide-react'
import { getProductImage } from '@/lib/utils/placeholder-images'
import { formatPrice } from '@/lib/utils/format-price'
import { PromoCodeInput } from '@/components/checkout/promo-code-input'
import { toast } from 'sonner'
import type { CartLineItem } from '@/types'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const FREE_SHIPPING_THRESHOLD = 7500 // $75 in cents

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cart, removeItem, updateItem, itemCount, subtotal, isLoading,
    appliedPromoCodes, discountTotal, applyPromoCode, removePromoCode,
    isApplyingPromo, isRemovingPromo,
  } = useCart()

  const [upsellLoadingFor, setUpsellLoadingFor] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  if (!isOpen) return null

  const currencyCode = cart?.currency_code || cart?.region?.currency_code || 'usd'
  const cartSubtotal = subtotal || 0
  const formattedSubtotal = formatPrice(cartSubtotal, currencyCode)
  const qualifiesFreeShip = cartSubtotal >= FREE_SHIPPING_THRESHOLD
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal)
  const shipProgress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)

  const items: CartLineItem[] = cart?.items || []
  const hasItems = items.length > 0
  const isDouble10Applied = appliedPromoCodes.includes('DOUBLE10')
  const upsellTarget = items[0] // upsell on the first item

  const handleUpsell = async () => {
    if (!upsellTarget) return
    setUpsellLoadingFor(upsellTarget.id)
    try {
      // Add one more of the same variant
      await Promise.resolve(
        updateItem({ lineId: upsellTarget.id, quantity: upsellTarget.quantity + 1 }),
      )
      // Apply 10% off if not already
      if (!isDouble10Applied) {
        try {
          await applyPromoCode('DOUBLE10')
        } catch {
          // promo may already be applied — fine
        }
      }
      toast.success(`Added another ${upsellTarget.title} · 10% off applied`)
    } catch (err) {
      toast.error((err as Error)?.message || 'Could not add upsell')
    } finally {
      setUpsellLoadingFor(null)
    }
  }

  const handleApplyFreeShip = async () => {
    try {
      await applyPromoCode('FREESHIP75')
      toast.success('Free shipping unlocked')
    } catch (err) {
      toast.error((err as Error)?.message || 'Could not apply code')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        onKeyDown={handleKeyDown}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-heading text-xl font-semibold">
            Your Bag {hasItems && <span className="text-muted-foreground font-normal">({itemCount})</span>}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 -mr-2 hover:opacity-70 transition-opacity"
            aria-label="Close bag"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {hasItems && (
          <div className="border-b px-6 py-4 bg-muted/40">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-accent" strokeWidth={1.75} />
              {qualifiesFreeShip ? (
                <p className="text-xs">
                  <span className="font-semibold text-accent">You unlocked free shipping!</span>
                  {!appliedPromoCodes.includes('FREESHIP75') && (
                    <button
                      onClick={handleApplyFreeShip}
                      disabled={isApplyingPromo}
                      className="ml-2 underline hover:text-accent"
                    >
                      Apply FREESHIP75
                    </button>
                  )}
                </p>
              ) : (
                <p className="text-xs">
                  <span className="font-semibold">{formatPrice(remainingForFreeShip, currencyCode)}</span>
                  <span className="text-muted-foreground"> away from free shipping</span>
                </p>
              )}
            </div>
            <div className="h-1 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${shipProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-24 w-20 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-1/4 rounded bg-muted mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasItems ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.25} />
              <p className="mt-4 text-muted-foreground">Your bag is empty</p>
              <button
                onClick={onClose}
                className="mt-6 text-xs uppercase tracking-[0.22em] font-semibold link-underline pb-1"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item: CartLineItem) => {
                const price = item.unit_price
                const formattedPrice = formatPrice(price, currencyCode)

                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={getProductImage(item.thumbnail, item.product_id || item.id)}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                          {item.variant?.title && item.variant.title !== 'Default' && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.variant.title}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 -mr-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateItem({ lineId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateItem({ lineId: item.id, quantity: item.quantity + 1 })}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="text-sm font-medium tabular-nums">
                          {item.quantity > 1 ? (
                            <span>{formattedPrice} × {item.quantity}</span>
                          ) : (
                            formattedPrice
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* UPSELL — Make it a pair, 10% off */}
              {upsellTarget && (
                <div className="border border-accent/40 bg-accent/[0.06] p-4 relative overflow-hidden">
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold">
                    <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
                    10% Off
                  </div>
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={getProductImage(upsellTarget.thumbnail, upsellTarget.product_id || upsellTarget.id)}
                        alt={upsellTarget.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-12">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold mb-1">
                        Make it a pair
                      </p>
                      <h4 className="text-sm font-medium leading-tight">
                        Add another {upsellTarget.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        One on the desk, one by the bath. Save {formatPrice(Math.round(upsellTarget.unit_price * 0.1), currencyCode)} when you do.
                      </p>
                      <button
                        onClick={handleUpsell}
                        disabled={upsellLoadingFor === upsellTarget.id}
                        className="mt-3 self-start inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-foreground hover:text-accent transition-colors disabled:opacity-50"
                      >
                        {upsellLoadingFor === upsellTarget.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        )}
                        Add for {formatPrice(Math.round(upsellTarget.unit_price * 0.9), currencyCode)}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div className="border-t px-6 py-5 space-y-4">
            <PromoCodeInput
              appliedPromoCodes={appliedPromoCodes}
              discountTotal={discountTotal}
              currencyCode={currencyCode}
              isApplyingPromo={isApplyingPromo}
              isRemovingPromo={isRemovingPromo}
              onApply={applyPromoCode}
              onRemove={removePromoCode}
            />
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                <span className="text-lg font-heading font-semibold tabular-nums">{formattedSubtotal}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm text-accent">
                  <span>Discount</span>
                  <span className="tabular-nums">-{formatPrice(discountTotal, currencyCode)}</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Shipping &amp; taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-foreground text-background text-center py-4 text-xs font-semibold uppercase tracking-[0.22em] hover:bg-accent transition-colors"
            >
              Secure Checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-accent transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
