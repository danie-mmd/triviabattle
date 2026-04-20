import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '@/hooks/useTelegram'
import { authApi } from '@/services/api'
import { useGameStore } from '@/store/gameStore'
export default function LoginPage() {
  const { user, initData } = useTelegram()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (type: 'TON' | 'CREDITS') => {
    useGameStore.getState().setMatchType(type)
    
    setLoading(true)
    setError(null)
    try {
      const { data } = await authApi.login(initData)
      sessionStorage.setItem('trivia_jwt', data.token)
      sessionStorage.setItem('trivia_uid', data.userId)
      sessionStorage.setItem('trivia_first_name', data.firstName)
      sessionStorage.setItem('trivia_credits', data.credits.toString())
      sessionStorage.setItem('trivia_stars', data.starsBalance.toString())
      useGameStore.getState().setCredits(data.credits)
      useGameStore.getState().setStarsBalance(data.starsBalance)
      navigate('/lobby')
    } catch {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-centered" style={{ gap: 32 }}>
      {/* Logo / Hero */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        <div style={{
          fontSize: 64,
          filter: 'drop-shadow(0 0 24px rgba(124,92,252,0.6))',
        }}>🧠</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
          <span className="text-gradient">TriviaBattle</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 260 }}>
          5 players. 10 questions. One prize pool. ⚡
        </p>
      </motion.div>

      {/* User card */}
      {user && (
        <motion.div
          className="glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div className="avatar">
            {user.photoUrl
              ? <img src={user.photoUrl} alt={user.firstName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : user.firstName[0].toUpperCase()
            }
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {user.firstName} {user.lastName ?? ''}
            </div>
            {user.username && (
              <div className="text-muted">@{user.username}</div>
            )}
          </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 'auto' }}>
            </div>
          {user.isPremium && (
            <span style={{ marginLeft: 'auto', fontSize: 18 }} title="Telegram Premium">⭐</span>
          )}
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {error && (
          <div style={{ color: 'var(--color-accent)', fontSize: 13, textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <button
          className="btn btn-primary"
          onClick={() => handleLogin('TON')}
          disabled={loading}
          style={{ width: '100%', fontSize: 17, padding: '16px 24px' }}
          id="btn-ton-battle"
        >
          {loading ? '⏳ Authenticating…' : '⚔️ TON Battle'}
        </button>

        <button className="btn btn-primary" onClick={() => handleLogin('CREDITS')} disabled={loading}
          style={{ width: '100%', fontSize: 17, padding: '16px 24px', border: '2px solid var(--color-gold)', color: 'var(--color-gold)', background: 'transparent' }}>
          🪙 Credit Battle
        </button>

        <p className="text-muted" style={{ fontSize: 12, textAlign: 'center' }}>
          Choose your match type.
        </p>
      </motion.div>
    </div>
  )
}
