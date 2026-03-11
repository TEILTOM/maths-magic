import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import type { TopicId, Difficulty } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'

interface Props { topicId: TopicId; difficulty: Difficulty; onComplete: () => void }

function getTable(topicId: string): number {
  const match = topicId.match(/(\d+)$/)
  if (match) return parseInt(match[1])
  // Default based on topic
  if (topicId.includes('2-5-10')) return [2, 5, 10][Math.floor(Math.random() * 3)]
  if (topicId.includes('3-4')) return [3, 4][Math.floor(Math.random() * 2)]
  return Math.floor(Math.random() * 11) + 2
}

const ROOMS = [
  { emoji: '🚪', name: 'Entrance Hall' },
  { emoji: '🔮', name: 'Crystal Chamber' },
  { emoji: '🗝️', name: 'Treasure Room' },
  { emoji: '🧪', name: 'Potion Lab' },
  { emoji: '🐉', name: 'Dragon Lair' },
  { emoji: '🏆', name: 'Victory Chamber' },
]

export default function TimesTableQuest({ topicId, difficulty, onComplete }: Props) {
  const profile = useGameStore(s => s.profile)!
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const char = getCharacter(profile.characterId)

  const [phase, setPhase] = useState<'ready' | 'playing' | 'results'>('ready')
  const [table, setTable] = useState(getTable(topicId))
  const [room, setRoom] = useState(0)
  const [score, setScore] = useState(0)
  const [currentFactor, setCurrentFactor] = useState(1)
  const [options, setOptions] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [startTime, setStartTime] = useState(0)

  const TOTAL_ROOMS = 5

  function generateOptions(t: number, f: number) {
    const correct = t * f
    const opts = new Set([correct])
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 6) - 3
      if (offset !== 0) opts.add(correct + offset * t)
    }
    return Array.from(opts).sort(() => Math.random() - 0.5)
  }

  function startGame() {
    const t = getTable(topicId)
    setTable(t)
    const factor = 1
    setCurrentFactor(factor)
    setOptions(generateOptions(t, factor))
    setRoom(0)
    setScore(0)
    setFeedback(null)
    setStartTime(Date.now())
    startActiveGame(topicId, 'times-table-quest')
    setPhase('playing')
  }

  function handleAnswer(ans: number) {
    if (feedback) return
    const correct = table * currentFactor
    if (ans === correct) {
      setFeedback('correct')
      setScore(s => s + 1)
      recordActiveAnswer(true)
      setTimeout(() => {
        setFeedback(null)
        const newRoom = room + 1
        if (newRoom >= TOTAL_ROOMS) {
          completeGame({ topicId, gameType: 'times-table-quest', score: score + 1, totalQuestions: TOTAL_ROOMS, timeMs: Date.now() - startTime })
          setPhase('results')
        } else {
          setRoom(newRoom)
          const nextFactor = currentFactor + (difficulty === 'easy' ? 1 : Math.floor(Math.random() * 3) + 1)
          const clampedFactor = Math.min(12, nextFactor)
          setCurrentFactor(clampedFactor)
          setOptions(generateOptions(table, clampedFactor))
        }
      }, 800)
    } else {
      setFeedback('incorrect')
      recordActiveAnswer(false)
      setTimeout(() => setFeedback(null), 1000)
    }
  }

  const stars = score >= 5 ? 3 : score >= 3 ? 2 : score >= 2 ? 1 : 0
  const currentRoom = ROOMS[room] ?? ROOMS[0]

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-7xl mb-4">🗺️</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Times Table Quest!</h2>
        <p className="text-purple-200 mb-2">Explore the dungeon by answering times table questions!</p>
        <p className="text-white/50 text-sm mb-2">Today's table: <span className="text-yellow-300 font-black text-xl">{table}×</span></p>
        <p className="text-white/40 text-xs mb-6">Complete all {TOTAL_ROOMS} rooms to win the quest!</p>
        <Button variant="gold" size="xl" onClick={startGame}>🗺️ Begin Quest!</Button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {stars >= 2 && <Confetti />}
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Quest Complete!</h2>
        <div className="text-5xl font-black text-white mb-2">{score}/{TOTAL_ROOMS}</div>
        <StarRating stars={stars} size="lg" animate />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={startGame}>🗺️ New Quest!</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-16 pb-4 items-center">
      {/* Room progress */}
      <div className="max-w-lg w-full mb-4">
        <div className="flex gap-1 mb-2">
          {Array.from({ length: TOTAL_ROOMS }, (_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i < room ? 'bg-green-400' : i === room ? 'bg-purple-400' : 'bg-white/20'}`} />
          ))}
        </div>
        <div className="text-center text-white/60 text-sm">{currentRoom.emoji} {currentRoom.name}</div>
      </div>

      {/* Quest scene */}
      <div className="max-w-lg w-full flex flex-col items-center mb-6">
        <motion.div
          key={room}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl mb-3"
        >
          {currentRoom.emoji}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${room}-${currentFactor}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`bg-white/10 border-4 rounded-3xl px-10 py-6 text-center mb-4 transition-colors ${
              feedback === 'correct' ? 'border-green-400 bg-green-500/20' :
              feedback === 'incorrect' ? 'border-red-400 bg-red-500/20' : 'border-purple-400/50'
            }`}
          >
            <div className="text-white/60 text-sm mb-1">What is</div>
            <div className="text-white font-fredoka text-5xl">{table} × {currentFactor}</div>
            <div className="text-white/40 text-sm mt-1">= ?</div>
          </motion.div>
        </AnimatePresence>

        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black mb-2 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
            {feedback === 'correct' ? '⚔️ Correct! Door opens!' : '🛡️ Wrong! Try again!'}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(opt)}
              className="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-purple-400 rounded-2xl py-4 text-white font-black text-2xl transition-all"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-white/50">
        <span>{char.emoji}</span>
        <span>{table}× table — Room {room + 1}/{TOTAL_ROOMS}</span>
      </div>
    </div>
  )
}
