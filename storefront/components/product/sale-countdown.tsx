'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface SaleCountdownProps {
  hours?: number // default countdown duration in hours from "now"
}

/**
 * Lightweight sale-urgency strip — counts down to a session-anchored deadline
 * to create real urgency without faking server-side data. Resets per visitor
 * once the session ends.
 */
export default function SaleCountdown({ hours = 18 }: SaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const KEY = 'lumiere_sale_deadline'
    let deadline = Number(typeof window !== 'undefined' ? sessionStorage.getItem(KEY) : 0)
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + hours * 60 * 60 * 1000
      sessionStorage.setItem(KEY, String(deadline))
    }

    const tick = () => {
      const diff = Math.max(0, deadline - Date.now())
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)
      setTimeLeft({ h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [hours])

  if (!timeLeft) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="bg-foreground text-background overflow-hidden">
      <div className="container-custom py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] uppercase tracking-[0.22em]">
        <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
        <span className="text-accent font-semibold">Autumn Sale</span>
        <span className="hidden sm:inline opacity-75">·</span>
        <span>10% off the Twin Pack</span>
        <span className="opacity-75">·</span>
        <span className="font-mono tabular-nums tracking-[0.15em] text-accent">
          {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
        </span>
        <span className="hidden md:inline opacity-75 normal-case tracking-normal italic">
          ends today
        </span>
      </div>
    </div>
  )
}
