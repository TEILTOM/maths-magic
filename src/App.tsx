import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import Welcome from './pages/Welcome'
import CharacterSelect from './pages/CharacterSelect'
import Dashboard from './pages/Dashboard'
import YearHub from './pages/YearHub'
import GamePage from './pages/GamePage'
import Achievements from './pages/Achievements'
import TrickBookPage from './pages/TrickBookPage'
import AchievementToast from './components/AchievementToast'
import LevelUpModal from './components/LevelUpModal'

export default function App() {
  const profile = useGameStore(s => s.profile)
  const recoverInterruptedGame = useGameStore(s => s.recoverInterruptedGame)
  const activeGame = useGameStore(s => s.activeGame)

  // On every app launch: if there's a saved activeGame it means the last session
  // was killed mid-game (swipe-up, crash, etc). Award partial credit immediately.
  useEffect(() => {
    if (profile && activeGame && activeGame.totalSoFar > 0) {
      recoverInterruptedGame()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen stars-bg">
      <Routes>
        <Route path="/" element={profile ? <Navigate to="/dashboard" replace /> : <Welcome />} />
        <Route path="/create" element={profile ? <Navigate to="/dashboard" replace /> : <CharacterSelect />} />
        <Route path="/dashboard" element={profile ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/year/:yearId" element={profile ? <YearHub /> : <Navigate to="/" replace />} />
        <Route path="/game/:topicId/:gameType" element={profile ? <GamePage /> : <Navigate to="/" replace />} />
        <Route path="/achievements" element={profile ? <Achievements /> : <Navigate to="/" replace />} />
        <Route path="/tricks" element={profile ? <TrickBookPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {profile && <AchievementToast />}
      {profile && <LevelUpModal />}
    </div>
  )
}
