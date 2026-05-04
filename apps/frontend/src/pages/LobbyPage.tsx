import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { matchmakingApi, authApi } from '@/services/api'
import StarsPurchase from '@/components/StarsPurchase'
import WalletConnect from '@/components/WalletConnect'
import { useTonWallet } from '@tonconnect/ui-react'
import { useGameStore } from '@/store/gameStore'

export default function LobbyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const matchType = useGameStore(s => s.matchType)
  const [inQueue, setInQueue] = useState(false)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [position, setPosition] = useState(0)
  const [queuePlayers, setQueuePlayers] = useState<{userId: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const credits = useGameStore(s => s.credits)
  const setCredits = useGameStore(s => s.setCredits)
  const starsBalance = useGameStore(s => s.starsBalance)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const wallet = useTonWallet()

  useEffect(() => {
    if (wallet?.account?.address) {
      authApi.updateWallet(wallet.account.address).catch(console.error)
    }
  }, [wallet?.account?.address])

  useEffect(() => {
    if (location.state?.errorToast) {
      setToastMessage(location.state.errorToast)
      setTimeout(() => setToastMessage(null), 8000)
      navigate('/lobby', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  // Poll for room assignment and queue status
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>
    const pollInterval = (inQueue || creatingRoom) ? 3000 : 30000

    const poll = async () => {
      try {
        const { data } = await matchmakingApi.getStatus()
        if (data.creatingRoom) {
          setCreatingRoom(true)
          setInQueue(false)
        } else {
          setCreatingRoom(false)
          setInQueue(data.inQueue)
        }
        setPosition(data.position)
        setQueuePlayers(data.queuePlayers || [])
        if (data.credits !== undefined) {
          setCredits(data.credits)
          sessionStorage.setItem('trivia_credits', data.credits.toString())
        }
        if (data.starsBalance !== undefined) {
          useGameStore.getState().setStarsBalance(data.starsBalance)
          sessionStorage.setItem('trivia_stars', data.starsBalance.toString())
        }
        if (data.roomId) {
          clearInterval(intervalId)
          navigate(`/game/${data.roomId}`)
        }
      } catch { /* silent */ }
    }

    // Call immediately and then set interval
    poll()
    intervalId = setInterval(poll, pollInterval)
    
    return () => clearInterval(intervalId)
  }, [navigate, setCredits, inQueue, creatingRoom])

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

  const displayCredits = credits !== -1 ? credits : (sessionStorage.getItem('trivia_credits') || '0')
  const displayStars = starsBalance !== -1 ? starsBalance : (sessionStorage.getItem('trivia_stars') || '0')

  return (
    <div className="page" style={{ gap: 24, paddingTop: 32 }}>
      {/* Toast Notification overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div key="toast"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10000,
              background: 'rgba(0,0,0,0.95)', color: 'var(--color-gold)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              padding: '12px 16px', borderRadius: 8, fontWeight: 700, textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {useGameStore.getState().isAdmin && (
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/admin')}
              style={{ padding: '6px 12px', fontSize: 13, borderRadius: 16, fontWeight: 700, border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)' }}
            >
              🛠️ Admin
            </button>
          )}
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/how-to')}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 16, fontWeight: 700 }}
          >
            ❓ Help
          </button>
          <div className="glass" style={{ padding: '6px 12px', borderRadius: 16, fontSize: 14, fontWeight: 700, border: '1px solid rgba(255, 215, 0, 0.3)', background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700' }}>
            ⭐ {displayStars} Stars
          </div>
          {(matchType === 'CREDITS' || (sessionStorage.getItem('trivia_credits') !== null)) && (
            <div className="glass" style={{ padding: '6px 12px', borderRadius: 16, fontSize: 14, fontWeight: 700, border: '1px solid rgba(74, 222, 128, 0.3)', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
              🪙 {displayCredits} Credits
            </div>
          )}
        </div>
      </div>

      {/* Prize pool info */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--color-gold)' }}>
          {matchType === 'CREDITS' ? `Up to 4.0 Credits` : `Up to 4.0 TON`}
        </div>
        <div className="text-muted" style={{ marginTop: 4 }}>
          Dynamic pool · 2-5 players · {matchType === 'CREDITS' ? '1 Credit' : '1.0 TON'} entry
        </div>
      </div>

      {/* Queue state */}
      <AnimatePresence mode="wait">
        {creatingRoom ? (
          <motion.div key="creating"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="glass"
            style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div className="spinner" style={{ margin: '0 auto', borderColor: 'var(--color-gold) transparent' }} />
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-gold)' }}>Creating the match...</div>
            <div className="text-muted">Communicating with the TON blockchain to secure your room. Please wait.</div>
          </motion.div>
        ) : !inQueue ? (
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
