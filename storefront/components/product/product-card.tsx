import Image from 'next/image'
import Link from 'next/link'
import { getProductImage } from '@/lib/utils/placeholder-images'
import { isProductSoldOut, type VariantExtension } from './product-price'
import OwnershipOptions from './ownership-options'

interface ProductCardProps {
  product: any
  variantExtensions?: Record<string, VariantExtension>
}

export default function ProductCard({ product, variantExtensions }: ProductCardProps) {
  const variant = product.variants?.[0]
  const calculatedPrice = variant?.calculated_price

  const currency = calculatedPrice?.currency_code || 'usd'
  const currentAmount = calculatedPrice?.calculated_amount

  const soldOut = isProductSoldOut(product.variants || [], variantExtensions)

  return (
    <Link href={`/products/${product.handle}`} className="group block" prefetch={true}>
      <div className="space-y-3">
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
          <Image
            src={getProductImage(product.thumbnail, product.id)}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${soldOut ? 'opacity-50' : ''}`}
          />
          {soldOut && (
            <div className="absolute top-2 left-2 bg-muted-foreground/80 text-white text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-sm">
              Sold Out
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2.5">
          <h3 className={`text-sm font-medium line-clamp-1 group-hover:underline underline-offset-4 transition-all ${soldOut ? 'text-muted-foreground' : ''}`}>
            {product.title}
          </h3>
          <div className="pt-1 border-t border-border/60">
            <OwnershipOptions
              purchaseAmount={currentAmount}
              currency={currency}
              variant="card"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
