'use client'

import { useState, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'
import { trackMetaEvent } from '@/lib/meta-pixel'

interface StripePaymentFormProps {
  clientSecret: string
  stripeAccountId: string
  publishableKey: string
  onPaymentSuccess: () => void
  onError: (message: string) => void
  isCompletingOrder?: boolean
  value?: number
  currency?: string
}

function CheckoutForm({
  onPaymentSuccess,
  onError,
  isCompletingOrder,
  value,
  currency,
}: Pick<StripePaymentFormProps, 'onPaymentSuccess' | 'onError' | 'isCompletingOrder' | 'value' | 'currency'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        onError(error.message || 'Payment failed. Please try again.')
      } else {
        trackMetaEvent('AddPaymentInfo', {
          value,
          currency,
        })
        onPaymentSuccess()
      }
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsProcessing(false)
    }
  }

  const busy = isProcessing || isCompletingOrder

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !elements || busy}
        className="w-full bg-foreground text-background py-3.5 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isCompletingOrder ? 'Completing Order...' : isProcessing ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  )
}

export function StripePaymentForm({
  clientSecret,
  stripeAccountId,
  publishableKey,
  onPaymentSuccess,
  onError,
  isCompletingOrder,
  value,
  currency,
}: StripePaymentFormProps) {
  const stripePromise = useMemo(
    () => loadStripe(publishableKey, { stripeAccount: stripeAccountId }),
    [publishableKey, stripeAccountId],
  )

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            borderRadius: '2px',
            fontFamily: 'inherit',
          },
        },
      }}
    >
      <CheckoutForm
        onPaymentSuccess={onPaymentSuccess}
        onError={onError}
        isCompletingOrder={isCompletingOrder}
        value={value}
        currency={currency}
      />
    </Elements>
  )
}
