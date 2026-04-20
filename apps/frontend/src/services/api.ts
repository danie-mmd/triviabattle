/// <reference types="vite/client" />
import axios, { type AxiosInstance } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Axios instance pre-configured for all TriviaBattle API calls.
 * Automatically attaches the JWT token (stored after login) to
 * every outgoing request as a Bearer token.
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor – attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('trivia_jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor – handle expired tokens ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('trivia_jwt')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  userId: string
  username: string
  firstName: string
  photoUrl?: string
  starsBalance: number
  credits: number
}

export const authApi = {
  login: (initData: string) =>
    api.post<LoginResponse>('/api/auth/login', { initData }),
  updateWallet: (walletAddress: string) =>
    api.put<void>('/api/auth/wallet', { walletAddress }),
}

// ─── Matchmaking ──────────────────────────────────────────────────────────────

export interface QueueStatusResponse {
  inQueue: boolean
  position: number
  roomId?: string
  roomSize?: number
  credits?: number
  starsBalance?: number
  queuePlayers?: { userId: string, name: string }[]
}

export const matchmakingApi = {
  joinQueue: (displayName?: string, matchType?: 'TON' | 'CREDITS') => 
    api.post<QueueStatusResponse>('/api/matchmaking/join', { displayName, matchType }),
  leaveQueue: () => api.post<void>('/api/matchmaking/leave'),
  getStatus: () => api.get<QueueStatusResponse>('/api/matchmaking/status'),
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface InvoiceResponse {
  invoiceLink: string
}

export const paymentApi = {
  createStarsInvoice: (productType: string) =>
    api.post<InvoiceResponse>('/api/payments/stars/invoice', { productType }),
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export interface GameResult {
  roomId: string
  winnerId: string
  scores: Record<string, number>
  playerNames: Record<string, string>
  prizePool: number
  creditMatch?: boolean
  isCreditMatch?: boolean
}

export const gameApi = {
  getResult: (roomId: string) =>
    api.get<GameResult>(`/api/game/${roomId}/result`),
  confirmDeposit: (roomId: string) =>
    api.post<{ status: string }>(`/api/game/${roomId}/confirm-deposit`),
}

export default api
