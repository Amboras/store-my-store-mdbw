'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, User, Menu, X, LogIn } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import CartDrawer from '@/components/cart/cart-drawer'

export default function Header() {
  const { itemCount } = useCart()
  const { isLoggedIn } = useAuth()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Focus close button when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      mobileMenuCloseRef.current?.focus()
    }
  }, [isMobileMenuOpen])

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  // Focus trap for mobile menu
  const handleMobileMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !mobileMenuRef.current) return
    const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
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

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-background border-b border-border'
        }`}
      >
        <div className="container-custom">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 lg:hidden hover:text-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-heading text-2xl lg:text-3xl font-medium tracking-[0.25em] uppercase">
                Meridian
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              <Link href="/products" className="text-[11px] tracking-[0.25em] uppercase link-underline py-1" prefetch={true}>
                The Fleet
              </Link>
              <Link href="/about" className="text-[11px] tracking-[0.25em] uppercase link-underline py-1" prefetch={true}>
                Ownership
              </Link>
              <Link href="/shipping" className="text-[11px] tracking-[0.25em] uppercase link-underline py-1" prefetch={true}>
                Delivery
              </Link>
              <Link href="/contact" className="text-[11px] tracking-[0.25em] uppercase link-underline py-1" prefetch={true}>
                Consultation
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link
                href="/search"
                className="p-2.5 hover:text-accent transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                href={isLoggedIn ? '/account' : '/auth/login'}
                className="p-2.5 hover:text-accent transition-colors hidden sm:block"
                aria-label={isLoggedIn ? 'Account' : 'Sign in'}
              >
                {isLoggedIn ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 hover:text-accent transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={handleMobileMenuKeyDown}
            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background animate-slide-in-right"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <span className="font-heading text-xl font-medium tracking-[0.25em] uppercase">Meridian</span>
              <button
                ref={mobileMenuCloseRef}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:text-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-5 space-y-1">
              {[
                { href: '/products', label: 'The Fleet' },
                { href: '/about', label: 'Ownership' },
                { href: '/shipping', label: 'Delivery' },
                { href: '/contact', label: 'Consultation' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-4 text-sm uppercase tracking-[0.2em] border-b border-border/60 hover:text-accent transition-colors"
                  prefetch={true}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-6 space-y-2">
                <Link
                  href={isLoggedIn ? '/account' : '/auth/login'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors"
                >
                  {isLoggedIn ? 'Account' : 'Sign In'}
                </Link>
                <Link
                  href="/search"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors"
                >
                  Search
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
