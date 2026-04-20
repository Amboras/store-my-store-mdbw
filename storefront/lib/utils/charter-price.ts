/**
 * Charter pricing utilities.
 *
 * Charter rates are derived from the aircraft's purchase price using typical
 * industry multipliers. Real-world hourly charter rates for private jets
 * generally land around 0.025–0.035% of the aircraft's acquisition price per
 * flight hour, depending on size, range, and operating cost.
 *
 * Ultra-long-range heavy jets (≥ $50M) charter ~$18–22k/hr.
 * Super-midsize jets ($15–30M) charter ~$6–10k/hr.
 */

/**
 * Estimate the charter hourly rate (in cents) from a purchase price (in cents).
 */
export function estimateCharterHourlyCents(purchaseCents: number | null | undefined): number | null {
  if (!purchaseCents || purchaseCents <= 0) return null
  // purchase_price / 3500 yields a realistic $/hr in the same currency units.
  const hourly = Math.round(purchaseCents / 3500)
  // Round to the nearest $100 for a cleaner headline number.
  return Math.round(hourly / 10000) * 10000
}

/**
 * Format a purchase price in a compact, luxury-appropriate way.
 * $72,500,000 → "$72.5M"
 * $1,250,000  → "$1.25M"
 */
export function formatPurchasePrice(amountCents: number | null | undefined, currency = 'usd'): string {
  if (amountCents == null) return '—'
  const dollars = amountCents / 100
  const symbol = currency.toUpperCase() === 'USD' ? '$' : ''
  if (dollars >= 1_000_000) {
    const millions = dollars / 1_000_000
    const formatted = millions >= 100
      ? millions.toFixed(0)
      : millions >= 10
        ? millions.toFixed(1)
        : millions.toFixed(2)
    return `${symbol}${formatted.replace(/\.0+$/, '')}M`
  }
  if (dollars >= 1_000) {
    return `${symbol}${(dollars / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(dollars)
}

/**
 * Format an hourly charter rate: $20,000 → "$20,000/hr"
 */
export function formatCharterHourly(amountCents: number | null | undefined, currency = 'usd'): string {
  if (amountCents == null) return '—'
  const dollars = amountCents / 100
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(dollars)
  return `${formatted}/hr`
}
