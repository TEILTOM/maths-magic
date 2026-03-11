import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import Button from './ui/Button'
import Confetti from './Confetti'

export default function LevelUpModal() {
  const showLevelUp = useGameStore(s => s.showLevelUp)
  const newLevel = useGameStore(s => s.newLevel)
  const clearLevelUp = useGameStore(s => s.clearLevelUp)

  return (
    <AnimatePresence>
      {showLevelUp && (
        <>
          <Confetti />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={clearLevelUp}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-gradient-to-b from-yellow-400 to-amber-600 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl border-4 border-yellow-200"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1.2, 1.1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: 2 }}
              >
                🎉
              </motion.div>
              <h2 className="text-white font-fredoka text-4xl mb-2">Level Up!</h2>
              <div className="bg-white/30 rounded-2xl p-4 mb-4">
                <div className="text-6xl font-black text-white">{newLevel}</div>
                <div className="text-yellow-100 font-bold">You reached level {newLevel}!</div>
              </div>
              <Button variant="ghost" onClick={clearLevelUp} size="lg">
                ✨ Keep going!
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
