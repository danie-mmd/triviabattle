import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminApi, AdminStats } from '@/services/api'
import { useGameStore } from '@/store/gameStore'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const isAdmin = useGameStore((state) => state.isAdmin)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }

    const fetchStats = async () => {
      try {
        const { data } = await adminApi.getStats()
        setStats(data)
      } catch (err) {
        setError('Failed to fetch admin statistics.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isAdmin, navigate])

  if (loading) {
    return (
      <div className="page-centered">
        <div className="spinner" />
        <p style={{ marginTop: 16 }}>Loading Dashboard...</p>
      </div>
    )
  }

  const formatTON = (nano: number) => (nano / 1_000_000_000).toFixed(2)

  return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900 }} className="text-gradient">Admin Panel</h1>
          <p className="text-muted">Real-time Game Performance</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/lobby')} style={{ padding: '8px 16px' }}>
          Arena ⚔️
        </button>
      </header>

      {error ? (
        <div className="glass" style={{ padding: 24, textAlign: 'center', color: 'var(--color-accent)' }}>
          {error}
        </div>
      ) : stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <StatCard 
              label="Total Users" 
              value={stats.totalUsers.toLocaleString()} 
              icon="👥" 
              delay={0}
            />
            <StatCard 
              label="Tournaments" 
              value={stats.totalTournaments.toLocaleString()} 
              icon="🏆" 
              delay={0.1}
            />
          </div>

          <motion.div 
            className="glass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ padding: 24 }}
          >
            <h3 style={{ marginBottom: 16, fontSize: 16, color: 'var(--color-text-muted)' }}>Financial Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Net Profit</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--color-gold)' }}>
                       {formatTON(stats.profitNano)} <span style={{ fontSize: 16 }}>TON</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Margin</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: stats.profitMargin > 0 ? 'var(--color-secondary)' : 'var(--color-accent)' }}>
                       {(stats.profitMargin * 100).toFixed(1)}%
                    </div>
                  </div>
               </div>

               <div className="progress-track" style={{ height: 12, borderRadius: 6 }}>
                  <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, stats.profitMargin * 100))}%` }} />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                  <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>Rev (Fees)</div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{formatTON(stats.totalEntryFeesNano)} TON</div>
                  </div>
                  <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>Payouts</div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{formatTON(stats.totalPayoutsNano)} TON</div>
                  </div>
               </div>
            </div>
          </motion.div>

          <StatCard 
            label="Average Payout" 
            value={`${formatTON(stats.totalTournaments > 0 ? stats.totalPayoutsNano / stats.totalTournaments : 0)} TON`} 
            icon="💎" 
            delay={0.3}
            fullWidth
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, delay, fullWidth = false }: { label: string, value: string, icon: string, delay: number, fullWidth?: boolean }) {
  return (
    <motion.div
      className="glass"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      style={{ 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8,
        gridColumn: fullWidth ? 'span 2' : 'auto'
      }}
    >
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
    </motion.div>
  )
}
