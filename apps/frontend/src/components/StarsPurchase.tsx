import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTelegram } from '@/hooks/useTelegram'
import { paymentApi } from '@/services/api'
import { useGameStore } from '@/store/gameStore'

interface Product {
  type: string
  icon: string
  label: string
  description: string
  stars: number
}

const PRODUCTS: Product[] = [
  { type: 'STARS_1', icon: '⭐', label: '1 Star (Test)', description: 'Test pack of stars', stars: 1 },
  { type: 'STARS_25', icon: '⭐', label: '25 Stars', description: 'Small pack of stars', stars: 25 },
  { type: 'STARS_50', icon: '⭐', label: '50 Stars', description: 'Medium pack of stars', stars: 50 },
  { type: 'STARS_100', icon: '⭐', label: '100 Stars', description: 'Large pack of stars', stars: 100 },
]

export default function StarsPurchase() {
  const { webApp } = useTelegram()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const purchase = async (product: Product) => {
    setPurchasing(product.type)
    try {
      const { data } = await paymentApi.createStarsInvoice(product.type)
      webApp?.openInvoice(data.invoiceLink, (status) => {
        if (status === 'paid') {
          // Power-up will be credited server-side via the webhook
          console.log(`[Stars] ${product.label} purchased ✅`)
          
          // Optimistically update UI balance
          const store = useGameStore.getState()
          if (store.starsBalance >= 0) {
            store.setStarsBalance(store.starsBalance + product.stars)
          }
          
          // Optional: give user visual feedback
          alert(`Successfully purchased ${product.label}!`)
        } else {
          console.log(`[Stars] Payment status: ${status}`)
        }
      })
    } catch (err) {
      console.error('[Stars] Invoice creation failed', err)
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {PRODUCTS.map((product) => (
        <motion.button
          key={product.type}
          id={`stars-${product.type.toLowerCase()}`}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          disabled={purchasing === product.type}
          onClick={() => purchase(product)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: purchasing ? 'not-allowed' : 'pointer',
            transition: 'var(--transition)',
            opacity: purchasing === product.type ? 0.5 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{product.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
                {product.label}
              </div>
              <div className="text-muted" style={{ fontSize: 12 }}>{product.description}</div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
            padding: '4px 10px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 13,
            color: '#0d0d1a',
          }}>
            ⭐ {product.stars}
          </div>
        </motion.button>
      ))}
    </div>
  )
}
