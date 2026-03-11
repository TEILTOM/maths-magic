import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export default function StreakDisplay() {
  const streak = useGameStore(s => s.profile?.streak ?? 0)
  const shields = useGameStore(s => s.profile?.streakShields ?? 0)

  if (streak === 0) return null

  return (
    <motion.div
      className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-400/40 rounded-2xl px-3 py-1.5"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.span
        className="text-2xl"
        animate={{ scale: streak >= 7 ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        🔥
      </motion.span>
      <span className="text-white font-black text-lg">{streak}</span>
      {shields > 0 && (
        <span className="text-blue-300 text-sm ml-1" title="Streak Shield">🛡️</span>
      )}
    </motion.div>
  )
}
