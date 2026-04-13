export {}

declare global {
  interface WindowEventMap {
    'amboras-consent-changed': Event
  }

  interface IdleRequestOptions {
    timeout?: number
  }

  interface IdleDeadline {
    readonly didTimeout: boolean
    timeRemaining: () => number
  }

  interface Window {
    requestIdleCallback?: (
      callback: (deadline: IdleDeadline) => void,
      options?: IdleRequestOptions,
    ) => number
    cancelIdleCallback?: (handle: number) => void
  }

  interface NetworkInformation {
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
    downlink?: number
    rtt?: number
    saveData?: boolean
  }

  interface Navigator {
    connection?: NetworkInformation
  }

  type MetaPixelCommand = 'init' | 'track' | 'trackCustom' | 'consent'

  type MetaPixelEventOptions = {
    eventID?: string
  }

  type MetaPixelCustomData = Record<string, unknown> | undefined

  type FbqFunction = {
    (command: 'init', pixelId: string): void
    (command: 'track', eventName: string, data?: MetaPixelCustomData, options?: MetaPixelEventOptions): void
    (command: 'trackCustom', eventName: string, data?: MetaPixelCustomData, options?: MetaPixelEventOptions): void
    (...args: unknown[]): void
    queue?: unknown[]
    loaded?: boolean
    version?: string
    callMethod?: (...args: unknown[]) => void
    push?: (...args: unknown[]) => void
  }

  interface Window {
    fbq?: FbqFunction
    _fbq?: FbqFunction
    __amborasMetaPixelInitialized?: boolean
    __amborasMetaPixelId?: string | null
    __amborasMetaPixelConfig?: {
      store_environment_id: string
      pixel_id: string | null
      pixel_enabled: boolean
      data_sharing_level: 'disabled' | 'standard' | 'enhanced' | 'maximum'
    } | null
  }
}
