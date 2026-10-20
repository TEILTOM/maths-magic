import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { DRILL_LEVELS } from '../data/drillLevels'
import Button from '../components/ui/Button'

export default function DrillHub() {
  const navigate = useNavigate()
  const getTopicMastery = useGameStore(s => s.getTopicMastery)
  const topicProgress = useGameStore(s => s.profile?.topicProgress ?? {})

  function isUnlocked(index: number) {
    if (index === 0) return true
    return getTopicMastery(DRILL_LEVELS[index - 1].id) > 0
  }

  function isPassed(id: string) {
    const progress = topicProgress[id]
    if (!progress) return false
    return progress.mastery >= 70
  }

  function handlePlay(id: string) {
    navigate(`/game/${id}/drill-sheet`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-indigo-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>← Back</Button>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl px-3 py-1.5">
            <span className="text-2xl">📋</span>
            <span className="text-white font-black">Drill Sheets</span>
          </div>
          <span className="text-white/40 text-xs ml-auto">1:45 per sheet</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-5 text-center">
          <p className="text-white/70 text-sm">
            Complete all 56 questions (28× and 28÷) in <span className="text-yellow-300 font-bold">1 minute 45 seconds</span> to unlock the next level.
          </p>
        </div>

        <div className="space-y-3">
          {DRILL_LEVELS.map((level, i) => {
            const unlocked = isUnlocked(i)
            const passed = isPassed(level.id)
            const mastery = getTopicMastery(level.id)

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: unlocked ? 1 : 0.4, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border p-4 flex items-center gap-4 ${
                  unlocked
                    ? 'bg-white/10 border-white/20 cursor-pointer hover:bg-white/15'
                    : 'bg-white/5 border-white/10 cursor-not-allowed'
                }`}
                onClick={() => unlocked && handlePlay(level.id)}
              >
                {/* Emoji / lock */}
                <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${level.color} shrink-0`}>
                  {unlocked ? level.emoji : '🔒'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-black text-sm">{level.label}</span>
                    {passed && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">✓ Passed</span>}
                  </div>
                  {mastery > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                      <span className="text-white/40 text-xs shrink-0">{mastery}%</span>
                    </div>
                  )}
                  {!unlocked && (
                    <p className="text-white/30 text-xs mt-0.5">Complete {DRILL_LEVELS[i - 1]?.label} first</p>
                  )}
                </div>

                {/* Arrow */}
                {unlocked && (
                  <div className="text-white/40 shrink-0">›</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
