import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

interface PowerUp {
  type: string
  icon: string
  label: string
  cost: number
  description: string
}

const POWER_UPS: PowerUp[] = [
  { type: 'INK_BLOT', icon: '🖋️', label: 'Ink Blot', cost: 1, description: 'Obscure an opponent\'s screen for 5s' },
  { type: 'DOUBLE_POINTS', icon: '⚡', label: '2× Points', cost: 3, description: 'Double your points this round' },
]

interface PowerUpBarProps {
  onUsePowerUp: (type: string, targetId?: string) => void
}

import { useState } from 'react'

export default function PowerUpBar({ onUsePowerUp }: PowerUpBarProps) {
  const { starsBalance, players, powerUpUsedThisGame } = useGameStore()
  const [activeSelectType, setActiveSelectType] = useState<string | null>(null)
  const [insufficientType, setInsufficientType] = useState<string | null>(null)

  const myUserId = sessionStorage.getItem('trivia_uid')
  const enemies = players.filter(p => String(p.userId) !== String(myUserId))

  const handlePress = (type: string) => {
    const p = POWER_UPS.find(u => u.type === type)
    console.log('[PowerUp] handlePress', type, 'starsBalance:', starsBalance, 'cost:', p?.cost, 'enemies:', enemies.length)
    if (!p || starsBalance < p.cost || powerUpUsedThisGame) {
      console.warn('[PowerUp] blocked – not enough stars, unknown type, or already used')
      if (!powerUpUsedThisGame) {
        setInsufficientType(type)
        setTimeout(() => setInsufficientType(null), 2000)
      }
      return;
    }

    if (type === 'DOUBLE_POINTS') {
       onUsePowerUp(type)
    } else {
       setActiveSelectType(type)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
      {/* Insufficient stars flash */}
      {insufficientType && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%', transform: 'translateX(-50%)',
          background: '#c0392b',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12, fontWeight: 700,
          whiteSpace: 'nowrap',
          zIndex: 200,
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          animation: 'fadeIn 0.2s ease',
        }}>
          ★ Not enough stars!
        </div>
      )}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minWidth: 40, 
        background: 'var(--color-surface)', 
        border: '1px solid var(--color-border)', 
        borderRadius: 'var(--radius-md)', 
        fontWeight: 'bold',
        fontSize: 14 
      }}>
        <span>⭐</span>
        <span style={{ fontSize: 12 }}>{starsBalance < 0 ? '…' : starsBalance}</span>
      </div>
      {POWER_UPS.map(({ type, icon, label, description, cost }) => {
        const available = starsBalance >= cost && !powerUpUsedThisGame

        return (
          <motion.button
            key={type}
            id={`powerup-${type.toLowerCase()}`}
            whileTap={available ? { scale: 0.92 } : {}}
            onClick={() => available && handlePress(type)}
            title={description}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 'var(--radius-md)',
              border: available
                ? '1.5px solid rgba(124,92,252,0.4)'
                : '1.5px solid var(--color-border)',
              background: available
                ? 'rgba(124,92,252,0.12)'
                : 'var(--color-surface)',
              cursor: available ? 'pointer' : 'not-allowed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              opacity: available ? 1 : (powerUpUsedThisGame ? 0.15 : 0.35),
              transition: 'var(--transition)',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {label}
            </span>
            {/* Cost badge */}
            <span style={{
              position: 'absolute',
              top: 4, right: 4,
              background: available ? 'var(--color-gold)' : 'var(--color-surface-hover)',
              color: available ? '#000' : '#fff',
              borderRadius: '12px',
              padding: '2px 6px',
              fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              ⭐{cost}
            </span>
          </motion.button>
        )
      })}

      {/* Target Selector Overlay */}
      {activeSelectType && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: 0, right: 0,
          padding: 12,
          background: 'var(--color-surface)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
          zIndex: 100
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
            SELECT TARGET
          </div>
          {enemies.length === 0 ? (
            <div style={{ padding: '8px 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
              No opponents to target in solo mode.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {enemies.map(enemy => (
                <button 
                  key={enemy.userId}
                  className="btn btn-outline"
                  style={{ padding: '8px 12px', flexShrink: 0, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    onUsePowerUp(activeSelectType, enemy.userId)
                    setActiveSelectType(null)
                  }}
                >
                  <div className="avatar" style={{ width: 24, height: 24, fontSize: 12 }}>
                    {enemy.firstName[0]}
                  </div>
                  <span>{enemy.firstName}</span>
                </button>
              ))}
            </div>
          )}
          <button className="btn btn-outline" onClick={() => setActiveSelectType(null)} style={{ marginTop: 8, padding: '8px 12px', borderRadius: 12, opacity: 0.7, width: '100%' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
