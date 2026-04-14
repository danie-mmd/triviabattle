import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameApi } from '@/services/api'
import { useGameStore } from '@/store/gameStore'

export default function ResultsPage() {
  const matchType = useGameStore(s => s.matchType)
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<Awaited<ReturnType<typeof gameApi.getResult>>['data'] | null>(null)

  useEffect(() => {
    gameApi.getResult(roomId!).then(({ data }) => setResult(data))
  }, [roomId])

  const myId = sessionStorage.getItem('trivia_uid') ?? ''
  const isWinner = result?.winnerId === myId

  if (!result) {
    return (
      <div className="page-centered">
        <div className="spinner" />
      </div>
    )
  }

  const sortedScores = Object.entries(result.scores).sort(([, a], [, b]) => b - a)

  return (
    <div className="page-centered" style={{ gap: 24 }}>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ fontSize: 80 }}>
        {isWinner ? '🏆' : '🎮'}
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ fontSize: 32, fontWeight: 900 }}>
        {isWinner
          ? <span className="text-gradient">You Won!</span>
          : 'Game Over'}
      </motion.h1>

      {isWinner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ fontSize: 24, color: 'var(--color-gold)', fontWeight: 800 }}>
          +{matchType === 'CREDITS' ? '4.0 Credits' : `${result.prizePool.toFixed(2)} TON`}
        </motion.div>
      )}

      {/* Leaderboard */}
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }} style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Final Scores</div>
        {sortedScores.map(([userId, score], idx) => (
          <div key={userId} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0',
            borderBottom: idx < sortedScores.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
              </span>
              <span style={{ fontWeight: userId === myId ? 700 : 400 }}>
                {userId === myId ? 'You' : (result.playerNames?.[userId] || `Player ${idx + 1}`)}
              </span>
            </div>
            <span className="score-badge">{score} pts</span>
          </div>
        ))}
      </motion.div>

      <button className="btn btn-primary" onClick={() => {
        useGameStore.getState().reset();
        navigate('/lobby');
      }} id="btn-play-again"
        style={{ width: '100%', maxWidth: 320 }}>
        ⚔️ Play Again
      </button>
    </div>
  )
}
