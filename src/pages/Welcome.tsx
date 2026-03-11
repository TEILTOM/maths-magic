import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const floatingEmojis = ['✨', '⭐', '🌟', '💫', '🔮', '🧙', '🐉', '🦄', '🦉', '🧚', '🍕', '✖️', '➕', '🔢']

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950">
      {/* Floating background emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none opacity-30"
          style={{ left: `${(i * 7 + 3) % 95}%`, top: `${(i * 13 + 5) % 90}%` }}
          animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
        >
          {emoji}
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 text-center max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="text-8xl mb-4 block"
          animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🪄
        </motion.div>

        <motion.h1
          className="text-6xl font-fredoka text-white mb-2 tracking-wide"
          style={{ textShadow: '0 0 30px rgba(167,139,250,0.8)' }}
          animate={{ textShadow: ['0 0 20px rgba(167,139,250,0.5)', '0 0 40px rgba(167,139,250,1)', '0 0 20px rgba(167,139,250,0.5)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Maths Magic
        </motion.h1>

        <motion.p
          className="text-purple-200 text-xl font-nunito font-semibold mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          A magical maths adventure for young wizards! ✨
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {['🎮 Fun Games', '📚 Reception–Year 6', '🔥 Daily Streaks', '🎩 Magic Tricks', '🏆 Achievements', '🤝 Number Friends'].map((feat) => (
            <span key={feat} className="bg-white/10 text-white/80 text-sm font-semibold px-3 py-1 rounded-full border border-white/20">
              {feat}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
        >
          <Button variant="gold" size="xl" onClick={() => navigate('/create')}>
            ✨ Start Your Adventure!
          </Button>
        </motion.div>

        <motion.p
          className="text-white/40 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Welsh Curriculum aligned • Reception to Year 6
        </motion.p>
      </motion.div>
    </div>
  )
}
