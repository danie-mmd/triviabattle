import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

/**
 * InkBlotOverlay
 *
 * Renders a full-screen animated ink-splatter overlay when a SABOTAGE_EVENT
 * with type 'INK_BLOT' is received. Automatically dismissed after 5s
 * (the store handles the timer).
 */
export default function InkBlotOverlay() {
  const { sabotageType } = useGameStore()

  return (
    <motion.div
      key="inkblot"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        background: 'rgba(0,0,0,0.0)',
        backgroundImage: 'radial-gradient(ellipse 120% 120% at 30% 40%, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)',
        pointerEvents: 'all',
      }}
    >
      {/* Ink blob SVG shapes */}
      <svg
        viewBox="0 0 400 400"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.92 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="blur-ink">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        {/* Central blob */}
        <ellipse cx="200" cy="200" rx="180" ry="160" fill="#0a0a12" filter="url(#blur-ink)" />
        {/* Splatter drops */}
        <circle cx="80"  cy="120" r="55" fill="#0d0d1a" />
        <circle cx="320" cy="90"  r="40" fill="#0d0d1a" />
        <circle cx="350" cy="280" r="60" fill="#0d0d1a" />
        <circle cx="50"  cy="310" r="45" fill="#0d0d1a" />
        <circle cx="200" cy="360" r="35" fill="#0d0d1a" />
        <circle cx="140" cy="50"  r="28" fill="#0a0a12" />
        <circle cx="300" cy="350" r="30" fill="#0a0a12" />
        {/* Purple tint veins */}
        <ellipse cx="190" cy="190" rx="80" ry="60" fill="rgba(124,92,252,0.12)" filter="url(#blur-ink)" />
      </svg>

      {/* Message */}
      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 48 }}>🖋️</div>
        <div style={{
          fontSize: 20, fontWeight: 800, color: '#fff',
          textShadow: '0 0 20px rgba(124,92,252,0.8)',
        }}>
          {sabotageType === 'INK_BLOT' ? 'Ink Blot!' : '💥 Sabotage!'}
        </div>
      </div>
    </motion.div>
  )
}
