import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { motion } from 'framer-motion'

export default function WalletConnect() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()

  const shortAddress = wallet?.account?.address
    ? `${wallet.account.address.slice(0, 6)}…${wallet.account.address.slice(-4)}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{ width: '100%', maxWidth: 320 }}
    >
      {wallet ? (
        <div className="glass" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>💎</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Wallet Connected</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{shortAddress}</div>
            </div>
          </div>
          <button
            className="btn btn-outline"
            id="btn-disconnect-wallet"
            onClick={() => tonConnectUI.disconnect()}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="btn btn-outline"
          id="btn-connect-wallet"
          onClick={() => tonConnectUI.openModal()}
          style={{ width: '100%' }}
        >
          <span>💎</span> Connect TON Wallet
        </button>
      )}
    </motion.div>
  )
}
