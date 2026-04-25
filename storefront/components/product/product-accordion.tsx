'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ProductAccordionProps {
  description?: string | null
  details?: Record<string, string>
}

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium uppercase tracking-[0.18em]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] pb-5' : 'max-h-0'
        }`}
      >
        <div className="text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProductAccordion({ description }: ProductAccordionProps) {
  return (
    <div className="border-t">
      {description && (
        <AccordionItem title="The Story" defaultOpen>
          <div
            className="prose prose-sm max-w-none [&>p]:mb-3 last:[&>p]:mb-0"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </AccordionItem>
      )}

      <AccordionItem title="How to Burn">
        <ul className="space-y-2">
          <li>· Trim the wooden wick to ¼&quot; before each burn</li>
          <li>· Burn for 2–4 hours at a time, never longer than 4</li>
          <li>· On first burn, allow wax to melt to the edge of the vessel</li>
          <li>· Keep away from drafts, pets, and curious hands</li>
          <li>· When ¼&quot; of wax remains, retire the vessel</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Ingredients">
        <p className="mb-3">
          100% American-grown soy wax, premium fragrance and essential oil blend (phthalate-free), and a single FSC-certified wooden wick.
        </p>
        <p>
          Vessel: hand-thrown stoneware ceramic, designed to be repurposed once your candle is finished — for a desk caddy, a small planter, or your morning espresso.
        </p>
      </AccordionItem>

      <AccordionItem title="Shipping & Returns">
        <ul className="space-y-2">
          <li>· Free US shipping on orders over $75 (use code FREESHIP75)</li>
          <li>· $6 standard shipping under $75 · 3–5 business days</li>
          <li>· Express options available at checkout</li>
          <li>· 60-day love-it guarantee — even if you&apos;ve already lit it</li>
        </ul>
      </AccordionItem>
    </div>
  )
}
