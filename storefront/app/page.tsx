'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight, Plane, ShieldCheck, Award, Globe2 } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2400&q=85'
const EDITORIAL_IMAGE =
  'https://images.unsplash.com/photo-1583416750470-f89e46dbcdb6?w=1600&q=85'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function HomePage() {
  const { data: products, isLoading } = useProducts({ limit: 10 })
  const [consultEmail, setConsultEmail] = useState('')

  const fleet = (products ?? []).slice(0, 5)

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consultEmail.trim()) return
    trackMetaEvent('Lead', {
      content_name: 'private_consultation',
      status: 'submitted',
    })
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 animate-ken-burns">
          <Image
            src={HERO_IMAGE}
            alt="Private jet at altitude"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        {/* Dark overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 h-full container-custom flex flex-col justify-end pb-24 lg:pb-32">
          <div className="max-w-2xl space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-accent" />
              <p className="text-xs uppercase tracking-luxe text-accent">
                Private Aviation, Redefined
              </p>
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-medium leading-[1.05] text-balance text-foreground">
              A new altitude<br />of ownership.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed font-light">
              Five factory-new aircraft from the world's most celebrated manufacturers.
              Delivered, commissioned, and supported — for a lifetime.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
                prefetch={true}
              >
                View the Fleet
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#consultation"
                className="inline-flex items-center gap-3 border border-foreground/40 text-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:border-accent hover:text-accent transition-colors"
              >
                Request a Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom marquee strip */}
        <div className="absolute bottom-0 inset-x-0 border-t border-foreground/10 bg-black/60 backdrop-blur-sm">
          <div className="container-custom py-4 flex flex-wrap items-center justify-center lg:justify-between gap-x-10 gap-y-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>Gulfstream</span>
            <span className="hidden sm:inline">Bombardier</span>
            <span>Dassault</span>
            <span className="hidden sm:inline">Cessna</span>
            <span>Embraer</span>
          </div>
        </div>
      </section>

      {/* The Fleet */}
      <section className="py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
            <p className="text-xs uppercase tracking-luxe text-accent mb-4">
              The Fleet
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-medium text-balance">
              Five aircraft. No compromise.
            </h2>
            <div className="divider-gold mx-auto mt-8" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {fleet.map((product: any, idx: number) => {
                const price = product.variants?.[0]?.calculated_price?.calculated_amount
                const thumb = product.thumbnail || product.images?.[0]?.url
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    prefetch={true}
                    className={`group block ${
                      idx === 0 ? 'lg:col-span-2 lg:row-span-1' : ''
                    }`}
                  >
                    <div
                      className={`relative overflow-hidden bg-muted ${
                        idx === 0 ? 'aspect-[16/10]' : 'aspect-[4/5]'
                      }`}
                    >
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                        <p className="text-[10px] uppercase tracking-luxe text-accent mb-2">
                          {idx === 0 ? 'Flagship' : 'Factory New'}
                        </p>
                        <h3 className="font-heading text-2xl lg:text-3xl font-medium text-foreground mb-2">
                          {product.title}
                        </h3>
                        {price != null && (
                          <p className="text-sm text-muted-foreground font-light">
                            From {formatPrice(price)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent link-underline pb-1"
              prefetch={true}
            >
              Explore All Aircraft
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial / Philosophy */}
      <section className="py-24 lg:py-32 bg-muted/40 border-y border-border">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={EDITORIAL_IMAGE}
                alt="Aircraft craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6 lg:max-w-md">
              <p className="text-xs uppercase tracking-luxe text-accent">
                Our Philosophy
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl font-medium leading-tight">
                Ownership is not a transaction. It's a relationship.
              </h2>
              <div className="divider-gold" />
              <p className="text-muted-foreground leading-relaxed font-light">
                Every Meridian aircraft is delivered with a dedicated acquisition team,
                a white-glove commissioning program, and a lifetime concierge line
                that answers in under a minute — from any hangar on earth.
              </p>
              <p className="text-muted-foreground leading-relaxed font-light">
                We don't sell airplanes. We introduce you to them.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent link-underline pb-1"
                prefetch={true}
              >
                The Meridian Standard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-luxe text-accent mb-4">
              Services
            </p>
            <h2 className="font-heading text-3xl lg:text-4xl font-medium">
              A complete ownership ecosystem.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {[
              {
                icon: Plane,
                title: 'Acquisition',
                body: 'Factory-direct procurement with priority build slots at every major manufacturer.',
              },
              {
                icon: Globe2,
                title: 'Global Hangar Network',
                body: 'Climate-controlled hangars in 40+ cities. 24/7 access, zero hand-offs.',
              },
              {
                icon: ShieldCheck,
                title: 'Managed Ownership',
                body: 'Full crew, maintenance, insurance, and compliance handled by a single team.',
              },
              {
                icon: Award,
                title: 'Lifetime Concierge',
                body: 'One number. Any hangar. Any time. A human answers in under sixty seconds.',
              },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className="text-center lg:text-left">
                  <Icon
                    className="h-8 w-8 text-accent mx-auto lg:mx-0 mb-5"
                    strokeWidth={1.25}
                  />
                  <h3 className="font-heading text-xl font-medium mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {s.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section
        id="consultation"
        className="py-24 lg:py-32 border-t border-border relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative container-custom max-w-2xl text-center">
          <p className="text-xs uppercase tracking-luxe text-accent mb-4">
            Private Consultation
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl font-medium text-balance">
            Begin the conversation.
          </h2>
          <div className="divider-gold mx-auto mt-8 mb-8" />
          <p className="text-muted-foreground leading-relaxed font-light mb-10">
            Share your details and a senior advisor will be in touch within the
            hour to schedule a private briefing — at your office, your hangar,
            or anywhere in between.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            onSubmit={handleConsultSubmit}
          >
            <input
              type="email"
              value={consultEmail}
              onChange={(e) => setConsultEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 border border-border bg-transparent px-4 py-4 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-accent text-accent-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Request Briefing
            </button>
          </form>
          <p className="text-[11px] uppercase tracking-luxe text-muted-foreground mt-8">
            Discretion assured. No mailing lists. No resale.
          </p>
        </div>
      </section>
    </>
  )
}
