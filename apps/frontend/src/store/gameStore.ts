import { create } from 'zustand'

export type GameState = 'WAITING' | 'DEPOSIT_PHASE' | 'QUESTION_ACTIVE' | 'INTERMISSION' | 'GAME_OVER'

export interface Question {
  id: string
  text: string
  options: string[]
  timeLimit: number // seconds
  index?: number
  total?: number
}

export interface Player {
  userId: string
  firstName: string
  username?: string
}

export type SabotageType = 'INK_BLOT' | 'SHUFFLE'

interface GameStoreState {
  gameState: GameState
  currentQuestion: Question | null
  scores: Record<string, number>
  players: Player[]
  sabotageActive: boolean
  sabotageType: SabotageType | null
  starsBalance: number
  answeredThisRound: boolean
  matchType: 'TON' | 'CREDITS'
  credits: number
  powerUpUsedThisGame: boolean
  isAdmin: boolean
  
  // Actions
  setGameState: (state: GameState) => void
  setCurrentQuestion: (question: Question) => void
  updateScore: (userId: string, score: number) => void
  setPlayers: (players: Player[]) => void
  triggerSabotage: (type: SabotageType) => void
  clearSabotage: () => void
  setStarsBalance: (stars: number) => void
  setCredits: (credits: number) => void
  deductStars: (amount: number) => void
  setAnsweredThisRound: (v: boolean) => void
  setPowerUpUsedThisGame: (v: boolean) => void
  setIsAdmin: (v: boolean) => void
  resetRound: () => void
  setMatchType: (matchType: 'TON' | 'CREDITS') => void
  reset: () => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  gameState: 'WAITING',
  currentQuestion: null,
  scores: {},
  players: [],
  sabotageActive: false,
  sabotageType: null,
  starsBalance: -1,
  answeredThisRound: false,
  matchType: 'TON',
  credits: -1,
  powerUpUsedThisGame: false,
  isAdmin: false,

  setGameState: (gameState) => set({ gameState, answeredThisRound: false }),
  setCurrentQuestion: (question) => set({ currentQuestion: question, answeredThisRound: false }),
  updateScore: (userId, score) =>
    set((state) => ({ scores: { ...state.scores, [userId]: score } })),
  setPlayers: (players) => set({ players }),
  setCredits: (credits) => set({ credits }),

  triggerSabotage: (sabotageType) => {
    set({ sabotageActive: true, sabotageType })
  },
  clearSabotage: () => set({ sabotageActive: false, sabotageType: null }),
  setStarsBalance: (stars) => set({ starsBalance: stars }),
  deductStars: (amount) => set((state) => ({ starsBalance: Math.max(0, state.starsBalance - amount) })),
  setAnsweredThisRound: (v) => set({ answeredThisRound: v }),
  setPowerUpUsedThisGame: (v) => set({ powerUpUsedThisGame: v }),
  setIsAdmin: (v) => set({ isAdmin: v }),

  resetRound: () => set({ currentQuestion: null, answeredThisRound: false }),

  setMatchType: (matchType) => set({ matchType }),

  reset: () => set({
    gameState: 'WAITING',
    currentQuestion: null,
    scores: {},
    players: [],
    sabotageActive: false,
    sabotageType: null,
    answeredThisRound: false,
    credits: -1,
    powerUpUsedThisGame: false,
  }),
}))
