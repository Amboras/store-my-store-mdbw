'use client'

import { useEffect, useRef, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import ProductGrid from '@/components/product/product-grid'
import { trackMetaEvent } from '@/lib/meta-pixel'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const trackedQuery = useRef<string | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) return
    if (trackedQuery.current === normalizedQuery) return

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      trackedQuery.current = normalizedQuery
      trackMetaEvent('Search', {
        search_string: normalizedQuery,
        content_name: normalizedQuery,
      })
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  return (
    <>
      <div className="border-b">
        <div className="container-custom py-section-sm">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full border-b border-foreground/20 bg-transparent pl-8 pr-4 py-4 text-lg font-heading placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {query ? (
          <>
            <p className="text-sm text-muted-foreground mb-8">
              Showing results for &ldquo;{query}&rdquo;
            </p>
            <ProductGrid limit={20} query={query} />
          </>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="mt-4 text-muted-foreground">Start typing to search products</p>
          </div>
        )}
      </div>
    </>
  )
}
