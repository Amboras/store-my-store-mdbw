'use client'

import Link from 'next/link'
import { Flame, Mail } from 'lucide-react'

// Inline Instagram SVG (lucide v1 does not export it)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}
import { clearConsent } from '@/lib/cookie-consent'
import { usePolicies } from '@/hooks/use-policies'

const footerLinks = {
  shop: [
    { label: 'All Candles', href: '/products' },
    { label: 'Maison Noir', href: '/products/maison-noir-cedar-smoke' },
    { label: 'Velvet Rose & Oud', href: '/products/velvet-rose-oud' },
    { label: 'The Ritual Trio', href: '/products/the-ritual-trio' },
  ],
  help: [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Care Guide', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
}

export default function Footer() {
  const { policies } = usePolicies()

  const companyLinks = [
    { label: 'Our Story', href: '/about' },
  ]

  if (policies?.privacy_policy) companyLinks.push({ label: 'Privacy Policy', href: '/privacy' })
  if (policies?.terms_of_service) companyLinks.push({ label: 'Terms of Service', href: '/terms' })
  if (policies?.refund_policy) companyLinks.push({ label: 'Refund Policy', href: '/refund-policy' })
  if (policies?.cookie_policy) companyLinks.push({ label: 'Cookie Policy', href: '/cookie-policy' })

  return (
    <footer className="bg-muted/40 border-t border-border">
      {/* Newsletter strip */}
      <div className="border-b border-border">
        <div className="container-custom py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-luxe text-accent mb-3">Join Lumière</p>
            <h3 className="font-heading text-3xl lg:text-4xl font-medium leading-tight">
              Quiet rituals,<br />delivered monthly.
            </h3>
            <p className="text-sm text-muted-foreground mt-4 max-w-md">
              Be first to know about new scent drops, limited batches, and seasonal offers. Plus 10% off your first order.
            </p>
          </div>
          <form
            className="flex flex-col sm:flex-row gap-3 lg:justify-end"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 lg:w-80 border border-border bg-background px-4 py-3.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-foreground text-background px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-accent transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="container-custom py-16">
        {/* Brand block */}
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <span className="font-heading text-2xl font-medium tracking-[0.2em] uppercase">
                Lumière
              </span>
            </Link>
            <div className="divider-accent mt-6 mb-6" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Hand-poured soy candles in small batches. Crackling wooden wicks, slow-blended fragrances, and minimalist ceramic vessels — designed for the rituals of every day.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 border border-border hover:border-accent hover:text-accent transition-colors rounded-full"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@lumiere.co"
                aria-label="Email"
                className="p-2 border border-border hover:border-accent hover:text-accent transition-colors rounded-full"
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-luxe mb-5 text-accent">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-luxe mb-5 text-accent">
              Help
            </h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-luxe mb-5 text-accent">
              Lumière
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            &copy; {new Date().getFullYear()} Lumière Co. — Hand-poured with care.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                clearConsent()
                window.dispatchEvent(new Event('manage-cookies'))
              }}
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors"
            >
              Manage Cookies
            </button>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Powered by Amboras</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
