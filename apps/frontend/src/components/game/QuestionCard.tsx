import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameStore, type Question } from '@/store/gameStore'

interface QuestionCardProps {
  question: Question
  onAnswer: (optionIndex: number) => void
}

export default function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const { answeredThisRound, setAnsweredThisRound } = useGameStore()
  const [timeLeft, setTimeLeft] = useState(question.timeLimit)
  const [selected, setSelected] = useState<number | null>(null)

  // Countdown timer
  useEffect(() => {
    setTimeLeft(question.timeLimit)
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [question.id, question.timeLimit])

  const handleAnswer = useCallback((index: number) => {
    if (answeredThisRound) return
    setSelected(index)
    setAnsweredThisRound(true)
    onAnswer(index)
  }, [answeredThisRound, setAnsweredThisRound, onAnswer])

  const progress = timeLeft / question.timeLimit
  const urgentColor = timeLeft <= 5
    ? 'linear-gradient(90deg, var(--color-accent), #ff4444)'
    : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'

  const optionColors = ['#7c5cfc', '#00d4ff', '#ff6b6b', '#ffd700']

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Timer bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="progress-track" style={{ flex: 1 }}>
          <motion.div
            className="progress-fill"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{ background: urgentColor }}
          />
        </div>
        <span style={{
          fontWeight: 800,
          fontSize: 20,
          color: timeLeft <= 5 ? 'var(--color-accent)' : 'var(--color-secondary)',
          minWidth: 28,
          textAlign: 'right',
        }}>
          {timeLeft}
        </span>
      </div>

      {/* Question text */}
      <div className="glass" style={{ padding: '20px 18px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>
          {question.text}
        </p>
      </div>

      {/* Answer options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {question.options.map((option, idx) => {
          const isSelected = selected === idx
          return (
            <motion.button
              key={idx}
              id={`option-${idx}`}
              whileTap={{ scale: 0.96 }}
              whileHover={!answeredThisRound ? { scale: 1.02 } : {}}
              onClick={() => handleAnswer(idx)}
              disabled={answeredThisRound}
              style={{
                padding: '14px 12px',
                borderRadius: 'var(--radius-md)',
                border: isSelected
                  ? `2px solid ${optionColors[idx]}`
                  : '2px solid var(--color-border)',
                background: isSelected
                  ? `${optionColors[idx]}22`
                  : 'var(--color-surface)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-main)',
                fontWeight: 600,
                fontSize: 14,
                cursor: answeredThisRound ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                lineHeight: 1.4,
                transition: 'var(--transition)',
                opacity: answeredThisRound && !isSelected ? 0.45 : 1,
              }}
            >
              <span style={{ color: optionColors[idx], marginRight: 6, fontWeight: 800 }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </motion.button>
          )
        })}
      </div>

      {answeredThisRound && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-muted"
          style={{ textAlign: 'center', fontSize: 13 }}
        >
          ✅ Answer locked in — waiting for others…
        </motion.p>
      )}
    </motion.div>
  )
}
