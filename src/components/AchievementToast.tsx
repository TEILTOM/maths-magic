import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { getAchievement } from '../data/achievements'

export default function AchievementToast() {
  const lastAchievement = useGameStore(s => s.lastUnlockedAchievement)
  const clearLastAchievement = useGameStore(s => s.clearLastAchievement)

  useEffect(() => {
    if (lastAchievement) {
      const timer = setTimeout(clearLastAchievement, 4000)
      return () => clearTimeout(timer)
    }
  }, [lastAchievement, clearLastAchievement])

  const achievement = lastAchievement ? getAchievement(lastAchievement) : null

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed top-4 right-4 z-50 max-w-xs"
          onClick={clearLastAchievement}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-4 shadow-2xl border-2 border-yellow-300">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{achievement.emoji}</span>
              <div>
                <div className="text-xs text-yellow-200 font-bold uppercase tracking-wide">Achievement Unlocked!</div>
                <div className="text-white font-black text-lg leading-tight">{achievement.name}</div>
                <div className="text-yellow-200 text-xs mt-0.5">{achievement.description}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-200 font-semibold">+{achievement.xpReward} XP ✨</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
