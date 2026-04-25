import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import { Truck, RotateCcw, ShieldCheck, ChevronRight, Sparkles, Leaf, Flame, Gift } from 'lucide-react'
import ProductAccordion from '@/components/product/product-accordion'
import BundleSelector from '@/components/product/bundle-selector'
import SaleCountdown from '@/components/product/sale-countdown'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

const TRIO_HANDLE = 'the-ritual-trio'

async function getProductByHandle(handle: string, regionId: string) {
  try {
    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')
    return getProductByHandle(handle, regionId)
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getTrioInfo() {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) return null
    const trio = await getProductByHandle(TRIO_HANDLE, regionId)
    if (!trio) return null
    const variant = trio.variants?.[0]
    const cp = variant?.calculated_price as
      | { calculated_amount?: number; original_amount?: number; currency_code?: string }
      | undefined
    if (!variant?.id || cp?.calculated_amount == null) return null
    return {
      productHandle: TRIO_HANDLE,
      variantId: variant.id,
      priceCents: cp.calculated_amount,
      originalPriceCents: cp.original_amount && cp.original_amount > cp.calculated_amount
        ? cp.original_amount
        : null,
    }
  } catch {
    return null
  }
}

async function getVariantExtensions(productId: string): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const [product, trioInfo] = await Promise.all([
    getProduct(handle),
    getTrioInfo(),
  ])

  if (!product) {
    notFound()
  }

  const variantExtensions = await getVariantExtensions(product.id)

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: { url: string }) => img.url !== product.thumbnail),
  ]

  const displayImages =
    allImages.length > 0 ? allImages : [{ url: getProductPlaceholder(product.id) }]

  const variant = product.variants?.[0]
  const variantId = variant?.id || ''
  const cp = variant?.calculated_price as
    | { calculated_amount?: number; original_amount?: number; currency_code?: string }
    | undefined
  const priceCents = cp?.calculated_amount ?? 0
  const currency = cp?.currency_code || 'usd'
  const ext = variant?.id ? variantExtensions[variant.id] : null
  const inventoryQuantity = ext?.inventory_quantity ?? null
  const allowBackorder = ext?.allow_backorder ?? false
  const compareAt = ext?.compare_at_price ?? null

  const isThisProductTheTrio = handle === TRIO_HANDLE

  return (
    <>
      {/* Sale countdown urgency strip */}
      {!isThisProductTheTrio && <SaleCountdown hours={18} />}

      {/* Breadcrumbs */}
      <div className="border-b border-border/60">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-accent transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {compareAt && compareAt > priceCents && (
                <span className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Save {Math.round((1 - priceCents / compareAt) * 100)}%
                </span>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: { url: string }, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden bg-muted"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-7">
            {/* Title & subtitle */}
            <div>
              {product.subtitle && (
                <p className="text-[11px] uppercase tracking-luxe text-accent mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="font-heading text-4xl lg:text-5xl font-medium leading-[1.05]">
                {product.title}
              </h1>
              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-medium tabular-nums">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(priceCents / 100)}
                </span>
                {compareAt && compareAt > priceCents && (
                  <span className="text-base line-through text-muted-foreground tabular-nums">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(compareAt / 100)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">· tax included</span>
              </div>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={variant?.id || null}
              currency={currency}
              value={priceCents}
            />

            {/* Quick perks row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground border-y border-border/60 py-3">
              <span className="flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                100% Soy
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                60+ hr burn
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                Hand-poured
              </span>
            </div>

            {/* Limited batch / urgency callout */}
            {!isThisProductTheTrio && (
              <div className="relative overflow-hidden border border-accent/30 bg-gradient-to-br from-accent/[0.08] via-background to-background">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-destructive text-white px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Limited Batch
                </div>
                <div className="p-5 pr-32">
                  <div className="flex items-center gap-2 text-accent mb-1.5">
                    <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-[0.22em] font-medium">
                      Twin Pack Offer
                    </span>
                  </div>
                  <p className="text-lg font-heading font-medium leading-tight">
                    Buy 2, take <span className="text-accent italic">10% off</span>.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    One for you, one for the friend who keeps asking which candle is in your hallway.
                  </p>
                </div>
              </div>
            )}

            {/* Bundle Selector + Add to Cart */}
            <BundleSelector
              productId={product.id}
              productTitle={product.title}
              variantId={variantId}
              unitPriceCents={priceCents}
              currency={currency}
              inventoryQuantity={inventoryQuantity}
              allowBackorder={allowBackorder}
              trio={isThisProductTheTrio ? null : trioInfo}
            />

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-border">
              <div className="text-center">
                <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-accent" strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground leading-tight">
                  Secure<br />Checkout
                </p>
              </div>
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto mb-2 text-accent" strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground leading-tight">
                  Free Ship<br />Over $75
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 mx-auto mb-2 text-accent" strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground leading-tight">
                  60-Day<br />Promise
                </p>
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-muted/40 border border-border/60 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  {[
                    'bg-accent/80',
                    'bg-foreground/80',
                    'bg-accent/50',
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full border-2 border-background ${c}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">2,400+ candles</span> shipped to thoughtful homes
                </p>
              </div>
              <p className="text-xs italic text-muted-foreground leading-relaxed">
                &ldquo;The crackle alone is worth the price. Lit it for guests last weekend and three of them asked where I got it.&rdquo; — Maya, Brooklyn
              </p>
            </div>

            {/* Accordion */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>
    </>
  )
}
