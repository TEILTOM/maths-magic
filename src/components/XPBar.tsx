import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import ProgressBar from './ui/ProgressBar'

const XP_PER_LEVEL = 500

export default function XPBar() {
  const profile = useGameStore(s => s.profile)
  if (!profile) return null

  const levelXP = profile.totalXP % XP_PER_LEVEL
  const levelTitle = getLevelTitle(profile.level)

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white font-black text-sm shadow-lg"
        whileHover={{ scale: 1.1 }}
      >
        {profile.level}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-xs text-yellow-300 font-bold truncate">{levelTitle}</span>
          <span className="text-xs text-white/60">{levelXP}/{XP_PER_LEVEL} XP</span>
        </div>
        <ProgressBar value={levelXP} max={XP_PER_LEVEL} color="from-yellow-400 to-amber-500" height="h-2" />
      </div>
    </div>
  )
}

function getLevelTitle(level: number): string {
  if (level < 3) return 'Apprentice'
  if (level < 5) return 'Spell Caster'
  if (level < 8) return 'Wizard'
  if (level < 12) return 'Grand Wizard'
  if (level < 20) return 'Archmage'
  return 'Supreme Sorcerer'
}
