import Image from 'next/image'
import Link from 'next/link'
import { getProductImage } from '@/lib/utils/placeholder-images'
import { isProductSoldOut, type VariantExtension } from './product-price'
import { formatPrice } from '@/lib/utils/format-price'

interface ProductCardProps {
  product: any
  variantExtensions?: Record<string, VariantExtension>
}

export default function ProductCard({ product, variantExtensions }: ProductCardProps) {
  const variant = product.variants?.[0]
  const calculatedPrice = variant?.calculated_price

  const currency = calculatedPrice?.currency_code || 'usd'
  const currentAmount = calculatedPrice?.calculated_amount
  const originalAmount = calculatedPrice?.original_amount

  // Check for compare-at price from extensions or original_amount
  const ext = variant?.id ? variantExtensions?.[variant.id] : null
  const compareAt: number | null = ext?.compare_at_price ?? (
    originalAmount != null && currentAmount != null && originalAmount > currentAmount
      ? originalAmount
      : null
  )
  const onSale = compareAt != null && currentAmount != null && compareAt > currentAmount

  const soldOut = isProductSoldOut(product.variants || [], variantExtensions)

  return (
    <Link href={`/products/${product.handle}`} className="group block" prefetch={true}>
      <div className="space-y-4">
        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Image
            src={getProductImage(product.thumbnail, product.id)}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${soldOut ? 'opacity-50' : ''}`}
          />
          {soldOut ? (
            <div className="absolute top-3 left-3 bg-foreground/85 text-background text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1">
              Sold Out
            </div>
          ) : onSale && compareAt != null && currentAmount != null ? (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1">
              Save {formatPrice(compareAt - currentAmount, currency)}
            </div>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={`font-heading text-lg font-medium leading-tight group-hover:text-accent transition-colors ${
              soldOut ? 'text-muted-foreground' : ''
            }`}
          >
            {product.title}
          </h3>
          <div className="text-sm tabular-nums whitespace-nowrap">
            {onSale && compareAt != null && (
              <span className="line-through text-muted-foreground mr-1.5 text-xs">
                {formatPrice(compareAt, currency)}
              </span>
            )}
            {currentAmount != null && (
              <span className="font-medium">{formatPrice(currentAmount, currency)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
