'use client'

import Link from 'next/link'
import { clearConsent } from '@/lib/cookie-consent'
import { usePolicies } from '@/hooks/use-policies'

const footerLinks = {
  fleet: [
    { label: 'All Aircraft', href: '/products' },
    { label: 'Gulfstream G800', href: '/products/gulfstream-g800' },
    { label: 'Bombardier Global 7500', href: '/products/bombardier-global-7500' },
    { label: 'Dassault Falcon 10X', href: '/products/dassault-falcon-10x' },
    { label: 'Citation Longitude', href: '/products/cessna-citation-longitude' },
    { label: 'Embraer Praetor 600', href: '/products/embraer-praetor-600' },
  ],
  ownership: [
    { label: 'Acquisition Process', href: '/about' },
    { label: 'Delivery & Commissioning', href: '/shipping' },
    { label: 'Private Consultation', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
}

export default function Footer() {
  const { policies } = usePolicies()

  const companyLinks = [
    { label: 'About Meridian', href: '/about' },
  ]

  if (policies?.privacy_policy) {
    companyLinks.push({ label: 'Privacy Policy', href: '/privacy' })
  }
  if (policies?.terms_of_service) {
    companyLinks.push({ label: 'Terms of Service', href: '/terms' })
  }
  if (policies?.refund_policy) {
    companyLinks.push({ label: 'Refund Policy', href: '/refund-policy' })
  }
  if (policies?.cookie_policy) {
    companyLinks.push({ label: 'Cookie Policy', href: '/cookie-policy' })
  }

  return (
    <footer className="bg-black border-t border-border">
      <div className="container-custom py-20">
        {/* Brand tagline */}
        <div className="max-w-2xl mb-16">
          <Link href="/" className="inline-block">
            <span className="font-heading text-3xl lg:text-4xl font-medium tracking-[0.25em] uppercase">
              Meridian
            </span>
          </Link>
          <div className="divider-gold mt-6 mb-6" />
          <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-md">
            Factory-new private jets from the world's most celebrated manufacturers.
            Delivered, commissioned, and supported — for a lifetime.
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-[10px] font-semibold uppercase tracking-luxe mb-5 text-accent">
              The Fleet
            </h3>
            <ul className="space-y-3">
              {footerLinks.fleet.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-luxe mb-5 text-accent">
              Ownership
            </h3>
            <ul className="space-y-3">
              {footerLinks.ownership.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-luxe mb-5 text-accent">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors font-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-luxe mb-5 text-accent">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li>Meridian Aviation</li>
              <li>Private Line:<br /><span className="text-foreground">+1 (800) 000-0000</span></li>
              <li>24 / 7 · Worldwide</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            &copy; {new Date().getFullYear()} Meridian Aviation. All rights reserved.
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
