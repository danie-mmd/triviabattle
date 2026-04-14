import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { matchmakingApi, authApi } from '@/services/api'
import StarsPurchase from '@/components/StarsPurchase'
import WalletConnect from '@/components/WalletConnect'
import { useTonWallet } from '@tonconnect/ui-react'
import { useGameStore } from '@/store/gameStore'

const POLL_INTERVAL_MS = 2000

export default function LobbyPage() {
  const navigate = useNavigate()
  const matchType = useGameStore(s => s.matchType)
  const [inQueue, setInQueue] = useState(false)
  const [position, setPosition] = useState(0)
  const [queuePlayers, setQueuePlayers] = useState<{userId: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const credits = useGameStore(s => s.credits)
  const setCredits = useGameStore(s => s.setCredits)

  const wallet = useTonWallet()

  useEffect(() => {
    if (wallet?.account?.address) {
      authApi.updateWallet(wallet.account.address).catch(console.error)
    }
  }, [wallet?.account?.address])

  // Poll for room assignment and queue status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await matchmakingApi.getStatus()
        setInQueue(data.inQueue)
        setPosition(data.position)
        setQueuePlayers(data.queuePlayers || [])
        if (data.credits !== undefined) {
          setCredits(data.credits)
          sessionStorage.setItem('trivia_credits', data.credits.toString())
        }
        if (data.roomId) {
          clearInterval(interval)
          navigate(`/game/${data.roomId}`)
        }
      } catch { /* silent */ }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [navigate, setCredits])

  const joinQueue = async () => {
    if (!wallet && matchType === 'TON') {
      alert("Please connect your TON wallet first!")
      return
    }
    setLoading(true)
    try {
      const firstName = sessionStorage.getItem('trivia_first_name') || 'Player'
      await matchmakingApi.joinQueue(firstName, matchType)
      setInQueue(true)
    } catch (err: any) {
      console.error("Failed to join queue:", err)
      alert("Failed.")
    } finally {
      setLoading(false)
    }
  }

  const leaveQueue = async () => {
    await matchmakingApi.leaveQueue()
    setInQueue(false)
    setPosition(0)
  }

  const displayCredits = credits !== null ? credits : (sessionStorage.getItem('trivia_credits') || '0')

  return (
    <div className="page" style={{ gap: 24, paddingTop: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="btn btn-outline" 
            onClick={() => {
              useGameStore.getState().reset();
              navigate('/');
            }}
            style={{ padding: '8px', minWidth: '40px', borderRadius: '50%', fontSize: '18px' }}
            title="Back to Arena"
          >
            ←
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>🏟️ <span className="text-gradient">Lobby</span></h1>
        </div>
        {(matchType === 'CREDITS' || (sessionStorage.getItem('trivia_credits') !== null)) && (
          <div className="glass" style={{ padding: '6px 12px', borderRadius: 16, fontSize: 14, fontWeight: 700, border: '1px solid var(--color-gold)' }}>
            🪙 {displayCredits} Credits
          </div>
        )}
      </div>

      {/* Prize pool info */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--color-gold)' }}>
          {matchType === 'CREDITS' ? `Up to 4.0 Credits` : `Up to 0.04 TON`}
        </div>
        <div className="text-muted" style={{ marginTop: 4 }}>
          Dynamic pool · 2-5 players · {matchType === 'CREDITS' ? '1 Credit' : '0.01 TON'} entry
        </div>
      </div>

      {/* Queue state */}
      <AnimatePresence mode="wait">
        {!inQueue ? (
          <motion.div key="join"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <button className="btn btn-primary" onClick={joinQueue} disabled={loading} id="btn-join-queue"
              style={{ width: '100%', fontSize: 16, padding: '16px' }}>
              {loading ? '⏳ Joining…' : '⚡ Find a Match'}
            </button>
          </motion.div>
        ) : (
          <motion.div key="queue"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass"
            style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div className="spinner" style={{ margin: '0 auto' }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>Finding opponents…</div>
            <div className="text-muted">
              {position > 0 ? `${position} player${position !== 1 ? 's' : ''} in queue` : 'You\'re first!'}
            </div>
            
            {queuePlayers.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>Players Waiting:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {queuePlayers.map(p => (
                    <motion.div key={p.userId} 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="glass" style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, border: '1px solid var(--color-primary)' }}>
                      👤 {p.name}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-outline" onClick={leaveQueue} id="btn-leave-queue">
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet */}
      <div style={{ marginTop: 24, padding: '0 16px' }}>
        <WalletConnect />
      </div>

      {/* Power-ups shop */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15, color: 'var(--color-text-muted)' }}>
          ⭐ Power-Ups Shop
        </div>
        <StarsPurchase />
      </div>
    </div>
  )
}
