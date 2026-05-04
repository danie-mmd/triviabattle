import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function HowToPage() {
  const navigate = useNavigate()

const sections = [
    {
      title: "🎮 How the Battle Works",
      items: [
        "Select your Arena: 'TON' for real stakes or 'Credits' for practice.",
        "Join the Lobby: The match starts once enough players enter the arena.",
        "Answer 10 fast-paced questions. Speed and precision are your weapons.",
        "Precision counts! Faster correct answers earn significantly more points.",
        "Victory: Winners split the prize pool instantly via the TON Smart Contract."
      ]
    },
    {
      title: "💎 Setting Up Your Wallet",
      items: [
        "Open Telegram Settings and tap 'Wallet'.",
        "Important: Tap the 'TON Space' tab (this is your gaming wallet).",
        "Secure your 24-word recovery phrase. Treat this like your bank PIN!",
        "Once active, this wallet connects directly to the game to manage your deposits."
      ]
    },
    {
      title: "💰 Loading Your Wallet (South Africa)",
      items: [
        "Buy TON: Use the '@wallet' bot P2P market to buy TON via EFT.",
        "Move to TON Space: If your TON is in your 'Main/Crypto' balance, tap 'Deposit' inside 'TON Space' to move it there.",
        "Connect & Play: Go back to TriviaBattle, hit 'Connect Wallet', and enter the arena!",
        "Tip: You only need ~1.1 TON to cover the entry fee and a tiny network gas fee."
      ]
    }
  ]

  return (
    <div className="page" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button 
          className="btn btn-outline" 
          onClick={() => navigate(-1)}
          style={{ padding: '8px', minWidth: '40px', borderRadius: '50%', fontSize: '18px' }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>📖 <span className="text-gradient">How To Play</span></h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card" 
            style={{ padding: 24 }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--color-gold)' }}>
              {section.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ 
                    minWidth: 24, height: 24, borderRadius: '50%', 
                    background: 'var(--color-primary)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    fontSize: 12, fontWeight: 900, color: '#000', marginTop: 2
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, opacity: 0.9 }}>{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        className="btn btn-primary" 
        onClick={() => navigate('/lobby')}
        style={{ width: '100%', marginTop: 32, padding: 16, fontSize: 16 }}
      >
        Got it, let's play! 🚀
      </button>
    </div>
  )
}
