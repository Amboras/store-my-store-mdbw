import { hasAnalyticsConsent } from '@/lib/cookie-consent'

export type MetaDataSharingLevel = 'disabled' | 'standard' | 'enhanced' | 'maximum'

export interface MetaPixelPublicConfig {
  store_environment_id: string
  pixel_id: string | null
  pixel_enabled: boolean
  data_sharing_level: MetaDataSharingLevel
}

export interface MetaCustomData {
  currency?: string
  value?: number
  content_ids?: string[]
  content_type?: 'product' | 'product_group'
  content_name?: string
  contents?: Array<{
    id: string
    quantity?: number
    item_price?: number
  }>
  num_items?: number
  search_string?: string
  status?: string
  order_id?: string
}

export interface MetaTrackOptions {
  eventId?: string
}

export function toMetaCurrencyValue(amount?: number | null): number | undefined {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return undefined
  }

  return amount / 100
}

const INIT_FLAG = '__amborasMetaPixelInitialized'
const PIXEL_ID_KEY = '__amborasMetaPixelId'
const CONFIG_KEY = '__amborasMetaPixelConfig'
const LOADED_EVENT = 'amboras:meta-pixel-ready'
const EVENT_ID_STORAGE_KEY = 'amboras_meta_event_ids'
const MAX_STORED_EVENT_IDS = 50

function canUseBrowserApi(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function ensureWindowState(): void {
  if (!canUseBrowserApi()) return

  if (!window[CONFIG_KEY]) {
    window[CONFIG_KEY] = null
  }
}

function injectPixelScript(pixelId: string): void {
  if (!canUseBrowserApi()) return
  if (!/^\d{5,32}$/.test(pixelId)) return
  if (document.getElementById('amboras-meta-pixel-script')) return

  const inlineScript = document.createElement('script')
  inlineScript.id = 'amboras-meta-pixel-script'
  inlineScript.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
  `

  const noscript = document.createElement('noscript')
  noscript.id = 'amboras-meta-pixel-noscript'
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`

  document.head.appendChild(inlineScript)
  document.body.appendChild(noscript)
}

export function isMetaPixelReady(): boolean {
  if (!canUseBrowserApi()) return false
  return Boolean(window.fbq && window[INIT_FLAG])
}

export function getMetaPixelConfig(): MetaPixelPublicConfig | null {
  if (!canUseBrowserApi()) return null
  ensureWindowState()
  return window[CONFIG_KEY] || null
}

export function initMetaPixel(config: MetaPixelPublicConfig): boolean {
  if (!canUseBrowserApi()) return false
  if (!hasAnalyticsConsent()) return false
  if (!config.pixel_enabled || !config.pixel_id) return false

  ensureWindowState()

  if (window[INIT_FLAG] && window[PIXEL_ID_KEY] === config.pixel_id) {
    window[CONFIG_KEY] = config
    return true
  }

  injectPixelScript(config.pixel_id)

  window.fbq?.('init', config.pixel_id)
  window[INIT_FLAG] = true
  window[PIXEL_ID_KEY] = config.pixel_id
  window[CONFIG_KEY] = config
  window.dispatchEvent(new CustomEvent(LOADED_EVENT))

  return true
}

export function onMetaPixelReady(callback: () => void): () => void {
  if (!canUseBrowserApi()) return () => {}

  if (isMetaPixelReady()) {
    callback()
    return () => {}
  }

  const handler = () => callback()
  window.addEventListener(LOADED_EVENT, handler)
  return () => window.removeEventListener(LOADED_EVENT, handler)
}

const IS_DEV = process.env.NODE_ENV !== 'production'

function persistEventId(key: string, eventId: string): void {
  if (!canUseBrowserApi()) return

  try {
    const raw = sessionStorage.getItem(EVENT_ID_STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {}
    const nextEntries = Object.entries({
      ...parsed,
      [key]: eventId,
    }).slice(-MAX_STORED_EVENT_IDS)

    sessionStorage.setItem(EVENT_ID_STORAGE_KEY, JSON.stringify(Object.fromEntries(nextEntries)))
  } catch (err) {
    // sessionStorage can throw on quota exceeded, privacy mode, or corrupted
    // JSON. Losing a Meta event_id just means the server-side dedupe key
    // won't match — not fatal — so we swallow. Log in dev so corruption
    // isn't invisible to developers.
    if (IS_DEV) {
      console.warn('[meta-pixel] Failed to persist event id', err)
    }
  }
}

export function getStoredMetaEventId(key: string): string | null {
  if (!canUseBrowserApi()) return null

  try {
    const raw = sessionStorage.getItem(EVENT_ID_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed[key] || null
  } catch (err) {
    if (IS_DEV) {
      console.warn('[meta-pixel] Failed to read stored event id', err)
    }
    return null
  }
}

export function generateMetaEventId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function trackMetaEvent(
  eventName: string,
  customData?: MetaCustomData,
  options?: MetaTrackOptions,
): string | null {
  if (!canUseBrowserApi()) return null
  if (!hasAnalyticsConsent()) return null
  if (!isMetaPixelReady()) return null

  const eventId = options?.eventId || generateMetaEventId(eventName.toLowerCase())
  const payload = customData && Object.keys(customData).length > 0 ? customData : undefined

  if (payload) {
    window.fbq?.('track', eventName, payload, { eventID: eventId })
  } else {
    window.fbq?.('track', eventName, undefined, { eventID: eventId })
  }

  persistEventId(eventName, eventId)
  logMetaPixelEvent(eventName, eventId, payload)
  return eventId
}

function logMetaPixelEvent(
  eventName: string,
  eventId: string,
  customData: MetaCustomData | undefined,
): void {
  if (!canUseBrowserApi()) return

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!backendUrl || !storeId || !publishableKey) return

  const url =
    typeof window.location !== 'undefined' ? window.location.pathname + window.location.search : null
  const referrer = typeof document !== 'undefined' ? document.referrer || null : null

  const payload = {
    event_name: eventName,
    event_id: eventId,
    source: 'browser' as const,
    url,
    metadata: {
      ...(customData ?? {}),
      ...(referrer ? { referrer } : {}),
    },
  }

  try {
    fetch(`${backendUrl}/store/meta-pixel/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Environment-ID': storeId,
        'x-publishable-api-key': publishableKey,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Meta pixel logging must never break the storefront
    })
  } catch {
    // ignore
  }
}

export function trackMetaPageView(url?: string): string | null {
  const eventId = generateMetaEventId('page_view')
  const eventPayload = url ? { content_name: url } : undefined
  return trackMetaEvent('PageView', eventPayload, { eventId })
}

export async function fetchMetaPixelConfig(): Promise<MetaPixelPublicConfig | null> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!storeId || !publishableKey) {
    return null
  }

  const headers: Record<string, string> = {
    'X-Store-Environment-ID': storeId,
    'x-publishable-api-key': publishableKey,
  }

  const response = await fetch(`${backendUrl}/store/meta-pixel/config`, {
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Meta Pixel config')
  }

  const data = await response.json()

  if (
    typeof data !== 'object' ||
    data === null ||
    (data.pixel_id !== null && typeof data.pixel_id !== 'string')
  ) {
    return { store_environment_id: '', pixel_id: null, pixel_enabled: false, data_sharing_level: 'disabled' as const }
  }

  return data as MetaPixelPublicConfig
}
