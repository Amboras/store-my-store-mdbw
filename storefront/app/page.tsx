'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Flame, Leaf, Package, Heart, Truck, ShieldCheck } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import { formatPrice } from '@/lib/utils/format-price'

const HERO_IMAGE =
  'https://ahjviugsxpwzpkyzgrhi.supabase.co/storage/v1/object/public/product-user-files/1675a1ba-9ee5-4f77-ab44-bb0de70d103c%2Fai-1777079038475-0-01KQ12MCM571SP22V1VZQFA1BV.png'

const EDITORIAL_IMAGE =
  'https://ahjviugsxpwzpkyzgrhi.supabase.co/storage/v1/object/public/product-user-files/1675a1ba-9ee5-4f77-ab44-bb0de70d103c%2Fai-1777079043520-0-01KQ12MHH5Q53W07K3QMYPG7C8.png'

export default function HomePage() {
  const { data: products, isLoading } = useProducts({ limit: 6 })

  const collection = (products ?? []).slice(0, 4)

  return (
    <>
      {/* HERO — full-bleed editorial */}
      <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden bg-foreground">
        <div className="absolute inset-0 animate-ken-burns">
          <Image
            src={HERO_IMAGE}
            alt="Hand-poured artisan candle at dusk"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        {/* Warm gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-foreground/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-transparent to-transparent" />

        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-20 lg:pb-28">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <Flame className="h-4 w-4 text-accent animate-flicker" strokeWidth={1.5} />
              <span className="h-px w-8 bg-accent" />
              <p className="text-[11px] uppercase tracking-luxe text-background/90">
                Hand-poured · small batch · est. 2024
              </p>
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-[88px] font-medium leading-[1.02] text-balance text-background">
              The slow art<br />of light.
            </h1>
            <p className="text-base sm:text-lg text-background/85 max-w-lg leading-relaxed font-light">
              Soy candles poured by hand in small batches, scented with slow-blended fragrance oils and a single crackling wooden wick. Quiet rituals for the home you live in.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] hover:opacity-90 transition-opacity"
                prefetch={true}
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products/the-ritual-trio"
                className="inline-flex items-center gap-3 border border-background/50 text-background px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] hover:border-accent hover:text-accent transition-colors"
              >
                The Ritual Trio
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-background/15 bg-foreground/55 backdrop-blur-sm">
          <div className="container-custom py-4 flex flex-wrap items-center justify-center lg:justify-between gap-x-10 gap-y-2 text-[10px] uppercase tracking-[0.3em] text-background/75">
            <span className="flex items-center gap-2"><Leaf className="h-3 w-3" strokeWidth={1.5} /> 100% Soy Wax</span>
            <span className="flex items-center gap-2"><Flame className="h-3 w-3" strokeWidth={1.5} /> Wooden Wick</span>
            <span className="hidden sm:flex items-center gap-2"><Heart className="h-3 w-3" strokeWidth={1.5} /> Phthalate-Free</span>
            <span className="hidden md:flex items-center gap-2"><Package className="h-3 w-3" strokeWidth={1.5} /> Hand-Poured USA</span>
            <span className="hidden lg:flex items-center gap-2"><Truck className="h-3 w-3" strokeWidth={1.5} /> Free Shipping $75+</span>
          </div>
        </div>
      </section>

      {/* THE COLLECTION */}
      <section className="py-24 lg:py-32">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 lg:mb-20">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-luxe text-accent mb-4">
                The Collection
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl font-medium text-balance leading-[1.1]">
                Three signature scents.<br />A hundred quiet moments.
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent link-underline pb-1 self-start lg:self-end"
              prefetch={true}
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {collection.slice(0, 3).map((product: any) => {
                const priceObj = product.variants?.[0]?.calculated_price
                const price: number | null = priceObj?.calculated_amount ?? null
                const currency = priceObj?.currency_code || 'usd'
                const compareAt: number | null =
                  price != null && priceObj?.original_amount && priceObj.original_amount > price
                    ? priceObj.original_amount
                    : null
                const thumb = product.thumbnail || product.images?.[0]?.url
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    prefetch={true}
                    className="group block"
                  >
                    <div className="relative overflow-hidden bg-muted aspect-[4/5]">
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {compareAt != null && price != null && (
                        <span className="absolute top-4 left-4 bg-accent text-accent-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                          Save {formatPrice(compareAt - price, currency)}
                        </span>
                      )}
                    </div>
                    <div className="pt-5 flex items-baseline justify-between gap-3">
                      <h3 className="font-heading text-xl font-medium group-hover:text-accent transition-colors">
                        {product.title}
                      </h3>
                      <div className="text-sm tabular-nums whitespace-nowrap">
                        {compareAt != null && (
                          <span className="line-through text-muted-foreground mr-2">
                            {formatPrice(compareAt, currency)}
                          </span>
                        )}
                        {price != null && (
                          <span className="font-medium">{formatPrice(price, currency)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* EDITORIAL — the ritual */}
      <section className="py-24 lg:py-32 bg-muted/40 border-y border-border">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={EDITORIAL_IMAGE}
                alt="A morning ritual with Lumière candles"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6 lg:max-w-md">
              <p className="text-[11px] uppercase tracking-luxe text-accent">
                The Ritual
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl font-medium leading-[1.1]">
                Light it slowly.<br />Stay a while.
              </h2>
              <div className="divider-accent" />
              <p className="text-muted-foreground leading-relaxed">
                Every Lumière candle takes seven days to make — from selecting single-origin fragrance oils, to slow-pouring the wax in temperature-controlled batches, to a final 72-hour cure that gives every scent its depth.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The result: a 60-hour burn that throws cleanly across an entire room, with a wooden wick that crackles like a fireplace.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent link-underline pb-1"
                prefetch={true}
              >
                Our Story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROMISE */}
      <section className="py-24 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-[11px] uppercase tracking-luxe text-accent mb-4">
              The Lumière Promise
            </p>
            <h2 className="font-heading text-3xl lg:text-4xl font-medium leading-tight">
              Made by hand.<br />Made to last.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {[
              {
                icon: Leaf,
                title: '100% Soy Wax',
                body: 'Clean-burning, US-grown soy. No paraffin, no phthalates, no synthetic dyes — ever.',
              },
              {
                icon: Flame,
                title: 'Wooden Wicks',
                body: 'Single-origin wood that crackles softly and burns cleaner than cotton.',
              },
              {
                icon: Package,
                title: 'Refillable Vessels',
                body: 'Hand-thrown ceramic that becomes yours long after the wax is gone.',
              },
              {
                icon: ShieldCheck,
                title: '60-Day Promise',
                body: 'Love it or send it back — even if you&apos;ve already lit it. We&apos;ll make it right.',
              },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className="text-center lg:text-left">
                  <Icon
                    className="h-7 w-7 text-accent mx-auto lg:mx-0 mb-5"
                    strokeWidth={1.25}
                  />
                  <h3 className="font-heading text-xl font-medium mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.body.replace(/&apos;/g, "'")}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SCENT PROFILES */}
      <section className="py-24 lg:py-28 bg-foreground text-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-16 lg:gap-12">
            <div className="lg:col-span-1">
              <p className="text-[11px] uppercase tracking-luxe text-accent mb-4">
                Scent Notes
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl font-medium leading-[1.1]">
                A library of moods.
              </h2>
              <p className="text-background/70 mt-6 leading-relaxed">
                Every scent is built like a fragrance: a top, a heart, and a base — designed to evolve over the life of the burn.
              </p>
            </div>

            <div className="lg:col-span-2 space-y-1">
              {[
                {
                  name: 'Maison Noir',
                  scent: 'Cedar & Smoke',
                  notes: 'Smoldering oak · Bergamot · Vetiver · Sandalwood · Leather',
                  mood: 'For long evenings.',
                },
                {
                  name: 'Velvet Rose & Oud',
                  scent: 'Romance, slow-poured',
                  notes: 'Bulgarian rose · Pink pepper · Aged oud · Amber · Cashmere musk',
                  mood: 'For quiet intimacies.',
                },
                {
                  name: 'Ivory Vanilla',
                  scent: 'Soft & sunlit',
                  notes: 'Madagascar vanilla · Brown butter · Tonka · Warm milk',
                  mood: 'For slow mornings.',
                },
              ].map((s) => (
                <div
                  key={s.name}
                  className="grid grid-cols-12 gap-4 py-7 border-t border-background/15 first:border-t-0 lg:first:border-t lg:border-t"
                >
                  <div className="col-span-12 lg:col-span-4">
                    <h3 className="font-heading text-2xl font-medium">{s.name}</h3>
                    <p className="text-xs uppercase tracking-luxe text-accent mt-1.5">
                      {s.scent}
                    </p>
                  </div>
                  <div className="col-span-12 lg:col-span-6">
                    <p className="text-sm text-background/70 leading-relaxed">
                      {s.notes}
                    </p>
                  </div>
                  <div className="col-span-12 lg:col-span-2 lg:text-right">
                    <p className="text-xs italic text-background/60">{s.mood}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden border-t border-border">
        <div className="container-custom relative max-w-2xl text-center">
          <Flame className="h-7 w-7 text-accent mx-auto mb-6 animate-flicker" strokeWidth={1.25} />
          <h2 className="font-heading text-4xl lg:text-5xl font-medium text-balance leading-[1.1]">
            Begin a quieter ritual.
          </h2>
          <div className="divider-accent mx-auto mt-8 mb-8" />
          <p className="text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
            Discover our signature trio — three scents to carry your home through every hour, packaged in a gift-ready keepsake box.
          </p>
          <Link
            href="/products/the-ritual-trio"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] hover:opacity-90 transition-opacity"
            prefetch={true}
          >
            Shop the Trio · Save $26
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
