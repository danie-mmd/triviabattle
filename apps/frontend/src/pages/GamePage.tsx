import { useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import QuestionCard from '@/components/game/QuestionCard'
import PowerUpBar from '@/components/game/PowerUpBar'
import InkBlotOverlay from '@/components/game/InkBlotOverlay'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { useState } from 'react'
import { gameApi, matchmakingApi } from '@/services/api'

const getWsUrl = () => {
  const envUrl = import.meta.env.VITE_WS_URL
  if (envUrl && envUrl.startsWith('ws')) return envUrl
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  const path = envUrl || '/ws/game'
  return `${protocol}//${host}${path}`
}

const WS_URL = getWsUrl()

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const wsRef = useRef<WebSocket | null>(null)
  const {
    gameState, currentQuestion, scores, players, sabotageActive, sabotageType, matchType,
    setGameState, setCurrentQuestion, updateScore, setPlayers, triggerSabotage,
  } = useGameStore()

  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const [depositing, setDepositing] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [lobbyInfo, setLobbyInfo] = useState<{playerCount: number, remainingTimeMs: number} | null>(null)

  const sendMessage = useCallback((type: string, payload?: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, roomId, ...payload }))
    }
  }, [roomId])

  const finalizeDeposit = async () => {
    try {
      await gameApi.confirmDeposit(roomId!)
      setHasConfirmed(true)
      localStorage.removeItem(`trivia_pending_deposit_${roomId}`)
    } catch (e) {
      console.error("[GamePage] Deposit finalize failed", e)
    }
  }

  // ── Recovery for Interrupted Deposits ──────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem(`trivia_pending_deposit_${roomId}`)) {
      finalizeDeposit()
    }
  }, [roomId])

  const confirmDeposit = async () => {
    const isCreditMatch = matchType === 'CREDITS'
    console.log("[GamePage] confirmDeposit clicked", { roomId, isCreditMatch, wallet: !!wallet });
    if (!wallet && !isCreditMatch) {
      console.warn("[GamePage] Deposit blocked: no wallet and not in Credit match");
      return
    }
    setDepositing(true)
    try {
      localStorage.setItem(`trivia_pending_deposit_${roomId}`, 'true')
      if (!isCreditMatch) {
        console.log("[GamePage] Sending TON transaction...");
        const escrowAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '0QDZR_bK7KdVtUwIvPFLXUku710yNDKBs2CDe0agO_0G2GHs'
        // 1. Send the TON transaction (may temporarily disconnect WS/kill app)
        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 60,
          messages: [{ address: escrowAddress, amount: "10000000" }]
        })
      } else {
        console.log("[GamePage] Credit match: skipping TON transaction");
      }
      // 2. Use reliable HTTP POST to confirm deposit 
      await finalizeDeposit()
    } catch (err) {
      localStorage.removeItem(`trivia_pending_deposit_${roomId}`)
      console.error("[GamePage] Deposit failed", err)
      alert("Deposit failed. Please try again.")
    } finally {
      setDepositing(false)
    }
  }

  const handleCancelEntry = async () => {
    try {
      await matchmakingApi.leaveQueue()
    } catch (err) {
      console.error("[GamePage] Error leaving queue", err)
    }
    navigate('/lobby')
  }

  // ── WebSocket connection ───────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('trivia_jwt')
    let ws: WebSocket | null = null
    let reconnectTimer: number

    const connect = () => {
      ws = new WebSocket(`${WS_URL}?token=${token}&roomId=${roomId}`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[WS] Connected')
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }))
        }
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        switch (msg.type) {
          case 'GAME_STATE':
            console.log('[WS] GAME_STATE received:', msg)
            setGameState(msg.state)
            if (msg.depositConfirmed) {
              setHasConfirmed(true)
            }
            if (msg.starsBalance !== undefined) {
              console.log('[WS] Setting starsBalance:', msg.starsBalance)
              useGameStore.getState().setStarsBalance(msg.starsBalance)
            }
            if (msg.players) {
              console.log('[WS] Setting players from GAME_STATE:', msg.players)
              setPlayers(msg.players)
            }
            break
          case 'QUESTION':
            useGameStore.getState().clearSabotage()
            setCurrentQuestion(msg.question)
            break
          case 'SCORE_UPDATE':
            updateScore(msg.userId, msg.score)
            break
          case 'PLAYERS':
            console.log('[WS] PLAYERS received:', msg.players)
            setPlayers(msg.players)
            break
          case 'SABOTAGE_EVENT':
            if (msg.sabotageType === 'DOUBLE_POINTS') {
              if (String(msg.initiatorId) === sessionStorage.getItem('trivia_uid')) {
                triggerSabotage(msg.sabotageType)
              }
            } else {
              // Offensive powerups
              if (msg.targetId) {
                if (String(msg.targetId) === sessionStorage.getItem('trivia_uid')) {
                  triggerSabotage(msg.sabotageType)
                }
              } else {
                // Fallback for old message structure
                if (String(msg.initiatorId) !== sessionStorage.getItem('trivia_uid')) {
                  triggerSabotage(msg.sabotageType)
                }
              }
            }
            break
          case 'GAME_OVER':
            navigate(`/results/${roomId}`)
            break
          case 'LOBBY_UPDATE':
            setLobbyInfo({ playerCount: msg.playerCount, remainingTimeMs: msg.remainingTimeMs })
            break
          case 'LOBBY_REFUNDED':
            alert(msg.message || "Lobby refunded due to lack of players.")
            navigate('/lobby')
            break
          case 'LOBBY_KICK':
            if (msg.userId === sessionStorage.getItem('trivia_uid')) {
              alert(msg.message)
              navigate('/lobby')
            }
            break
        }
      }

      ws.onclose = () => {
        console.log('[WS] Disconnected. Reconnecting in 2s...')
        reconnectTimer = window.setTimeout(connect, 2000)
      }
      ws.onerror = (err) => {
        console.error('[WS] Error', err)
      }
    }

    connect()

    return () => {
      window.clearTimeout(reconnectTimer)
      if (ws) {
        ws.onclose = null
        ws.close()
      }
    }
  }, [roomId, setGameState, setCurrentQuestion, updateScore, setPlayers, triggerSabotage, navigate])

  const submitAnswer = (optionIndex: number) => {
    sendMessage('SUBMIT_ANSWER', { optionIndex, timestamp: Date.now() })
  }

  const usePowerUp = (powerUpType: string, targetId?: string) => {
    const cost = powerUpType === 'INK_BLOT' ? 1 : powerUpType === 'FREEZE' ? 2 : powerUpType === 'DOUBLE_POINTS' ? 3 : 0;
    useGameStore.getState().deductStars(cost);
    sendMessage('USE_POWERUP', { powerUpType, targetId })
  }

  return (
    <div className="page" style={{ gap: 16, position: 'relative', overflow: 'hidden' }}>
      {/* Sabotage overlay – rendered on top of everything */}
      <AnimatePresence>
        {sabotageActive && sabotageType === 'INK_BLOT' && <InkBlotOverlay />}
      </AnimatePresence>

      {/* Header: scores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          🧠 <span className="text-gradient">Room {roomId?.slice(-4)}</span>
        </div>
        <div className="score-badge">
          🏆 {scores[sessionStorage.getItem('trivia_uid') ?? ''] ?? 0} pts
        </div>
      </div>

      {/* Player avatars */}
      {players.length > 0 && (
        <div style={{ display: 'flex', gap: 8 }}>
          {players.map((p) => {
            const isLeader = scores[p.userId] > 0 && Object.entries(scores).every(([uid, s]) => uid === p.userId || s < scores[p.userId]);
            return (
              <div key={p.userId} style={{ textAlign: 'center' }}>
                <div 
                  className="avatar" 
                  style={{ 
                    width: 36, 
                    height: 36, 
                    fontSize: 14,
                    border: isLeader ? '2px solid #4ade80' : 'none',
                    backgroundColor: isLeader ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <span style={{ color: isLeader ? '#4ade80' : 'inherit' }}>{p.firstName[0]}</span>
                </div>
                <div style={{ 
                  fontSize: 10, 
                  marginTop: 4, 
                  color: isLeader ? '#4ade80' : 'var(--color-text-muted)',
                  fontWeight: isLeader ? 700 : 400
                }}>
                  {scores[p.userId] ?? 0}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main game area */}
      <AnimatePresence mode="wait">
        {gameState === 'WAITING' && (
          <motion.div key="waiting" className="page-centered" style={{ flex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="spinner" />
            <p style={{ marginTop: 16 }}>Waiting for players…</p>
          </motion.div>
        )}

        {gameState === 'DEPOSIT_PHASE' && (
          <motion.div key="deposit" className="page-centered glass" style={{ flex: 1, margin: 16, padding: 24, borderRadius: 16, textAlign: 'center' }}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💎</div>
            <h2 style={{ marginBottom: 8 }}>Waiting Lobby</h2>
            {lobbyInfo && (
               <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, marginBottom: 16 }}>
                 <div style={{ fontSize: 18, fontWeight: 700 }}>
                   Players: {lobbyInfo.playerCount} / 5
                 </div>
                 <div style={{ fontSize: 14, color: 'var(--color-primary)' }}>
                   Starting in {Math.max(0, Math.ceil(lobbyInfo.remainingTimeMs / 1000))}s...
                 </div>
                  <div style={{ fontSize: 14, color: 'var(--color-gold)', marginTop: 4 }}>
                    Prize Pool: {(lobbyInfo.playerCount * (matchType === 'CREDITS' ? 1.0 : 0.01)).toFixed(2)} {matchType === 'CREDITS' ? 'Credits' : 'TON'}
                  </div>
               </div>
            )}
            <p className="text-muted" style={{ marginBottom: 24 }}>
              {matchType === 'CREDITS' ? 'Use 1 Credit to lock in your spot.' : 'Deposit your 0.01 TON entry fee to lock in your spot.'}
            </p>
            {hasConfirmed ? (
              <div style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                ✓ Deposit Confirmed. Waiting for others...
              </div>
            ) : (
              <>
                <button className="btn btn-primary" onClick={confirmDeposit} disabled={depositing} style={{ width: '100%', padding: 16, marginBottom: 12 }}>
                  {depositing ? 'Processing...' : (matchType === 'CREDITS' ? 'Ready!' : 'Deposit 0.01 TON')}
                </button>
                <button className="btn btn-outline" onClick={handleCancelEntry} disabled={depositing} style={{ width: '100%' }}>
                  Back to Lobby
                </button>
              </>
            )}
          </motion.div>
        )}

        {gameState === 'QUESTION_ACTIVE' && currentQuestion && (
          <motion.div key={`q-${currentQuestion.id}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            
            {currentQuestion.index && currentQuestion.total && (
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: -4 }}>
                QUESTION <span style={{ color: 'var(--color-primary)' }}>{currentQuestion.index}</span> OF {currentQuestion.total}
              </div>
            )}

            <QuestionCard question={currentQuestion} onAnswer={submitAnswer} />
          </motion.div>
        )}

        {gameState === 'INTERMISSION' && (
          <motion.div key="intermission" className="page-centered" style={{ flex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: 48 }}>⏳</div>
            <p style={{ fontWeight: 700, fontSize: 20 }}>Next question in…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power-up bar – always visible during game once active */}
      {(gameState !== 'WAITING' && gameState !== 'DEPOSIT_PHASE') && (
        <PowerUpBar onUsePowerUp={usePowerUp} />
      )}
    </div>
  )
}
