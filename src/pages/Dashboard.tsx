import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { YEARS } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Character from '../components/Character'
import StreakDisplay from '../components/StreakDisplay'
import XPBar from '../components/XPBar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'

const GAME_TILES = [
  { id: 'spell-casting', label: 'Spell Casting', emoji: '⚡', description: 'Quick-fire arithmetic!', color: 'from-purple-500 to-indigo-600' },
  { id: 'number-bonds-potion', label: 'Potion Lab', emoji: '🧪', description: 'Brew number bonds!', color: 'from-green-500 to-teal-600' },
  { id: 'times-table-quest', label: 'Times Tables', emoji: '🗺️', description: 'Dungeon adventure!', color: 'from-orange-500 to-red-600' },
  { id: 'fraction-feast', label: 'Fraction Feast', emoji: '🍕', description: 'Slice the pizza!', color: 'from-pink-500 to-rose-600' },
  { id: 'memory-crystal', label: 'Memory Crystals', emoji: '💎', description: 'Match the pairs!', color: 'from-cyan-500 to-blue-600' },
  { id: 'magic-market', label: 'Magic Market', emoji: '🛒', description: 'Coins & change!', color: 'from-yellow-500 to-amber-600' },
  { id: 'trick-book', label: 'Trick Book', emoji: '📚', description: 'Secret shortcuts!', color: 'from-violet-500 to-purple-700' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const profile = useGameStore(s => s.profile)!
  const updateProfile = useGameStore(s => s.updateProfile)
  const getYearMastery = useGameStore(s => s.getYearMastery)
  const isYearUnlocked = useGameStore(s => s.isYearUnlocked)
  const char = getCharacter(profile.characterId)

  const currentYear = YEARS.find(y => y.id === profile.currentYear)!
  const currentMastery = getYearMastery(profile.currentYear)
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(profile.name)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  function startEditName() {
    setDraftName(profile.name)
    setIsEditingName(true)
  }

  function cancelEditName() {
    setIsEditingName(false)
    setDraftName(profile.name)
  }

  function saveName() {
    const next = draftName.trim()
    if (!next) return
    if (next !== profile.name) {
      updateProfile({ name: next })
    }
    setIsEditingName(false)
  }

  function resetGame() {
    localStorage.removeItem('maths-magic-save')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-indigo-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{char.emoji}</span>
            <div>
              <div className="text-white font-black text-sm leading-none flex items-center gap-2">
                {isEditingName ? (
                  <>
                    <input
                      type="text"
                      name="wizard-name"
                      value={draftName}
                      onChange={e => setDraftName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveName()
                        if (e.key === 'Escape') cancelEditName()
                      }}
                      maxLength={20}
                      autoFocus
                      autoComplete="off"
                      className="bg-white/10 border border-purple-300/60 rounded-lg px-2 py-1 text-white text-sm font-bold w-32 focus:outline-none focus:border-purple-300"
                    />
                    <button
                      type="button"
                      onClick={saveName}
                      className="text-xs font-black bg-green-500/80 text-white px-2 py-0.5 rounded-lg hover:bg-green-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditName}
                      className="text-xs font-black bg-white/10 text-white/80 px-2 py-0.5 rounded-lg hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span>{profile.name}</span>
                    <button
                      type="button"
                      onClick={startEditName}
                      className="text-xs text-white/60 hover:text-white/90 font-bold"
                      aria-label="Edit name"
                    >
                      ✎
                    </button>
                  </>
                )}
              </div>
              <div className="text-white/50 text-xs">{currentYear.label}</div>
            </div>
          </div>
          <div className="flex-1 max-w-[150px]">
            <XPBar />
          </div>
          <StreakDisplay />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Character greeting */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Character characterId={profile.characterId} messageType="greeting" size="md" />
        </motion.div>

        {/* Current year progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-4 cursor-pointer" onClick={() => navigate(`/year/${profile.currentYear}`)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{currentYear.emoji}</span>
                <div>
                  <div className="text-white font-black">{currentYear.label} Journey</div>
                  <div className="text-white/60 text-xs">{currentYear.description}</div>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={e => { e.stopPropagation(); navigate(`/year/${profile.currentYear}`) }}>
                Play →
              </Button>
            </div>
            <ProgressBar value={currentMastery} showLabel label="Mastery" color="from-purple-400 to-pink-500" />
          </Card>
        </motion.div>

        {/* Games grid */}
        <motion.h2
          className="text-white font-fredoka text-xl mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          🎮 Choose a Game
        </motion.h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {GAME_TILES.map((game, i) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (game.id === 'trick-book') {
                  navigate('/tricks')
                } else {
                  navigate(`/game/${profile.currentYear}-general/${game.id}`)
                }
              }}
              className={`bg-gradient-to-br ${game.color} rounded-2xl p-4 text-left shadow-lg border border-white/10 hover:scale-105 transition-transform`}
            >
              <div className="text-3xl mb-2">{game.emoji}</div>
              <div className="text-white font-black text-sm leading-tight">{game.label}</div>
              <div className="text-white/70 text-xs mt-0.5">{game.description}</div>
            </motion.button>
          ))}
        </div>

        {/* All years */}
        <motion.h2
          className="text-white font-fredoka text-xl mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          📚 Year Groups
        </motion.h2>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {YEARS.map((y, i) => {
            const unlocked = isYearUnlocked(y.id)
            const mastery = getYearMastery(y.id)
            const isCurrent = y.id === profile.currentYear
            return (
              <motion.button
                key={y.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileTap={unlocked ? { scale: 0.95 } : {}}
                onClick={() => unlocked && navigate(`/year/${y.id}`)}
                className={`relative p-3 rounded-2xl border text-left transition-all ${
                  isCurrent ? 'border-white/60 bg-white/15' :
                  unlocked ? 'border-white/20 bg-white/5 hover:bg-white/10' :
                  'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl">{y.emoji}</span>
                  <div>
                    <div className="text-white font-black text-sm">{y.label}</div>
                    <div className="text-white/50 text-xs">{y.ageRange}</div>
                  </div>
                  {isCurrent && <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold">Now</span>}
                  {!unlocked && <span className="ml-auto text-base">🔒</span>}
                </div>
                {unlocked && mastery > 0 && (
                  <ProgressBar value={mastery} height="h-1.5" color={`from-${y.color.replace('#', '')} to-pink-500`} />
                )}
                {unlocked && mastery === 0 && (
                  <div className="text-white/40 text-xs">Not started</div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Quick links */}
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/achievements')} className="flex-1">
            🏆 Achievements
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tricks')} className="flex-1">
            🎩 Trick Book
          </Button>
        </div>

        {/* Hidden reset */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-white/40 hover:text-white/70 transition-colors underline decoration-dotted decoration-white/30"
          >
            reset game
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-w-sm w-full rounded-2xl border border-white/10 bg-indigo-950 p-5 text-center shadow-2xl">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="text-white font-fredoka text-xl mb-2">Start from scratch?</h3>
            <p className="text-white/70 text-sm mb-4">This will clear all saved progress on this device.</p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={resetGame} className="flex-1">
                Yes, reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
