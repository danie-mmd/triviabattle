import { Routes, Route, Navigate } from 'react-router-dom'
import { useTelegram } from '@/hooks/useTelegram'
import LoginPage from '@/pages/LoginPage'
import LobbyPage from '@/pages/LobbyPage'
import GamePage from '@/pages/GamePage'
import ResultsPage from '@/pages/ResultsPage'
import HowToPage from '@/pages/HowToPage'
import AdminDashboard from '@/pages/AdminDashboard'

function App() {
  const { isReady } = useTelegram()

  if (!isReady) {
    return (
      <div className="splash-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/lobby" element={<LobbyPage />} />
      <Route path="/game/:roomId" element={<GamePage />} />
      <Route path="/results/:roomId" element={<ResultsPage />} />
      <Route path="/how-to" element={<HowToPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
