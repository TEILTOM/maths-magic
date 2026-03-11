import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { ACHIEVEMENTS } from '../data/achievements'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🏆' },
  { id: 'streak', label: 'Streaks', emoji: '🔥' },
  { id: 'accuracy', label: 'Accuracy', emoji: '🎯' },
  { id: 'mastery', label: 'Mastery', emoji: '📚' },
  { id: 'explorer', label: 'Explorer', emoji: '🗺️' },
  { id: 'special', label: 'Special', emoji: '✨' },
]

export default function Achievements() {
  const navigate = useNavigate()
  const profile = useGameStore(s => s.profile)!
  const unlocked = new Set(profile.unlockedAchievements)

  const unlockedCount = profile.unlockedAchievements.length
  const totalVisible = ACHIEVEMENTS.filter(a => !a.secret).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 pb-8">
      <div className="sticky top-0 z-20 bg-indigo-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>← Back</Button>
          <h1 className="text-white font-fredoka text-xl">🏆 Achievements</h1>
          <span className="ml-auto text-white/60 text-sm">{unlockedCount}/{totalVisible}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Unlocked', value: unlockedCount, emoji: '🏆' },
            { label: 'XP Earned', value: profile.totalXP, emoji: '✨' },
            { label: 'Level', value: profile.level, emoji: '⭐' },
          ].map(stat => (
            <Card key={stat.label} className="text-center py-3">
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-white font-black text-lg">{stat.value.toLocaleString()}</div>
              <div className="text-white/60 text-xs">{stat.label}</div>
            </Card>
          ))}
        </div>

        {CATEGORIES.slice(1).map(cat => {
          const catAchievements = ACHIEVEMENTS.filter(a => a.category === cat.id)
          const catUnlocked = catAchievements.filter(a => unlocked.has(a.id)).length
          return (
            <div key={cat.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.emoji}</span>
                <h2 className="text-white font-fredoka text-lg">{cat.label}</h2>
                <span className="text-white/40 text-sm">{catUnlocked}/{catAchievements.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {catAchievements.map((ach, i) => {
                  const isUnlocked = unlocked.has(ach.id)
                  const isSecret = ach.secret && !isUnlocked
                  return (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className={`flex items-center gap-3 ${isUnlocked ? 'border-yellow-400/40' : 'opacity-60'}`}>
                        <span className={`text-3xl ${!isUnlocked ? 'grayscale' : ''}`}>
                          {isSecret ? '🔒' : ach.emoji}
                        </span>
                        <div className="flex-1">
                          <div className={`font-black text-sm ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
                            {isSecret ? '???' : ach.name}
                          </div>
                          <div className="text-white/50 text-xs">
                            {isSecret ? 'Secret achievement — keep playing to discover it!' : ach.description}
                          </div>
                        </div>
                        <div className="text-right">
                          {isUnlocked ? (
                            <span className="text-yellow-400 text-xs font-black">+{ach.xpReward} XP</span>
                          ) : (
                            <span className="text-white/30 text-xs">{ach.xpReward} XP</span>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
