/**
 * useTelegram – wraps window.Telegram.WebApp
 *
 * Exposes typed helpers for the Telegram Mini App SDK.
 * The SDK is loaded via the <script> tag in index.html.
 */

export interface TelegramUser {
  id: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  languageCode?: string
  isPremium?: boolean
  starsBalance?: number
}

export interface UseTelegramReturn {
  webApp: typeof window.Telegram.WebApp | null
  user: TelegramUser | null
  initData: string
  initDataUnsafe: Record<string, unknown>
  isReady: boolean
  colorScheme: 'light' | 'dark'
  showAlert: (message: string) => Promise<void>
  showConfirm: (message: string) => Promise<boolean>
  closeMiniApp: () => void
  hapticImpact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  hapticNotification: (type: 'error' | 'success' | 'warning') => void
  expand: () => void
}

// Extend the global Window type for the Telegram SDK
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            photo_url?: string
            language_code?: string
            is_premium?: boolean
          }
          [key: string]: unknown
        }
        colorScheme: 'light' | 'dark'
        isExpanded: boolean
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
        }
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
        openInvoice: (url: string, callback?: (status: string) => void) => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
        }
      }
    }
  }
}

export function useTelegram(): UseTelegramReturn {
  const urlParams = window.location.search
    ? new URLSearchParams(window.location.search)
    : null;
  const mockUserId = urlParams?.get('mockUser');

  if (mockUserId) {
    const user: TelegramUser = {
        id: parseInt(mockUserId),
        firstName: `Mock${mockUserId}`,
        username: `MockUser${mockUserId}`,
    };
    return {
      webApp: null,
      user,
      initData: `mockUser=${mockUserId}`,
      initDataUnsafe: { user },
      isReady: true,
      colorScheme: 'dark',
      showAlert: async (msg: string) => { alert(msg) },
      showConfirm: async (msg: string) => confirm(msg),
      closeMiniApp: () => {},
      hapticImpact: () => {},
      hapticNotification: () => {},
      expand: () => {},
    }
  }

  const webApp = typeof window !== 'undefined' && window.Telegram?.WebApp
    ? window.Telegram.WebApp
    : null

  // Signal to the Telegram client that the app is ready
  if (webApp && !webApp.isExpanded) {
    webApp.ready()
    webApp.expand()
  }

  const rawUser = webApp?.initDataUnsafe?.user

  const user: TelegramUser | null = rawUser
    ? {
        id: rawUser.id,
        firstName: rawUser.first_name,
        lastName: rawUser.last_name,
        username: rawUser.username,
        photoUrl: rawUser.photo_url,
        languageCode: rawUser.language_code,
        isPremium: rawUser.is_premium,
        starsBalance: 0,
      }
    : null

  const showAlert = (message: string): Promise<void> =>
    new Promise((resolve) => {
      if (webApp) {
        webApp.showAlert(message, resolve)
      } else {
        window.alert(message)
        resolve()
      }
    })

  const showConfirm = (message: string): Promise<boolean> =>
    new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, resolve)
      } else {
        resolve(window.confirm(message))
      }
    })

  const hapticImpact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    webApp?.HapticFeedback.impactOccurred(style)
  }

  const hapticNotification = (type: 'error' | 'success' | 'warning') => {
    webApp?.HapticFeedback.notificationOccurred(type)
  }

  return {
    webApp,
    user,
    initData: webApp?.initData ?? '',
    initDataUnsafe: (webApp?.initDataUnsafe ?? {}) as Record<string, unknown>,
    isReady: true, // SDK is synchronously available after script load
    colorScheme: webApp?.colorScheme ?? 'dark',
    showAlert,
    showConfirm,
    closeMiniApp: () => webApp?.close(),
    hapticImpact,
    hapticNotification,
    expand: () => webApp?.expand(),
  }
}
