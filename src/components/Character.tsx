import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacter, randomMessage, type CharacterId } from '../data/characters'

interface CharacterProps {
  characterId: CharacterId
  message?: string
  messageType?: 'greeting' | 'correct' | 'incorrect' | 'hint' | 'streak' | 'levelup'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  float?: boolean
  showBubble?: boolean
}

const sizes = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
  xl: 'text-9xl',
}

export default function Character({
  characterId, message, messageType = 'greeting',
  size = 'md', float = true, showBubble = true,
}: CharacterProps) {
  const char = getCharacter(characterId)
  const [displayMessage, setDisplayMessage] = useState<string | null>(null)

  useEffect(() => {
    if (message) {
      setDisplayMessage(message)
    } else {
      const msgs: Record<string, string[]> = {
        greeting: char.greetings,
        correct: char.correctMessages,
        incorrect: char.incorrectMessages,
        hint: char.hintMessages,
        streak: char.streakMessages,
        levelup: char.levelUpMessages,
      }
      setDisplayMessage(randomMessage(msgs[messageType] ?? char.greetings))
    }
  }, [message, messageType, characterId, char])

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {showBubble && displayMessage && (
          <motion.div
            key={displayMessage}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="relative bg-white text-gray-800 rounded-2xl px-4 py-2 max-w-xs text-center text-sm font-semibold shadow-xl"
          >
            {displayMessage}
            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`${sizes[size]} cursor-default select-none`}
        animate={float ? {
          y: [0, -8, 0],
          rotate: [0, 3, -3, 0],
        } : {}}
        transition={float ? {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      >
        {char.emoji}
      </motion.div>
    </div>
  )
}
