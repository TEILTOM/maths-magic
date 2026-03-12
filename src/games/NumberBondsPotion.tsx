import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import type { TopicId, Difficulty } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'

interface Props { topicId: TopicId; difficulty: Difficulty; onComplete: () => void }

function getTarget(difficulty: Difficulty): number {
  if (difficulty === 'easy') return [5, 10][Math.floor(Math.random() * 2)]
  if (difficulty === 'medium') return [10, 20][Math.floor(Math.random() * 2)]
  if (difficulty === 'hard') return [20, 50, 100][Math.floor(Math.random() * 3)]
  return [20, 50, 100][Math.floor(Math.random() * 3)]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function generateOptions(target: number): number[] {
  const valid = Array.from({ length: target - 1 }, (_, i) => i + 1)
  const validPairBases = valid.filter(n => n !== target - n)
  const a = validPairBases[Math.floor(Math.random() * validPairBases.length)]
  const b = target - a

  const pool = valid.filter(n => n !== a && n !== b)
  const fillers = shuffle(pool).slice(0, 6)
  return shuffle([a, b, ...fillers])
}

export default function NumberBondsPotion({ topicId, difficulty, onComplete }: Props) {
  const profile = useGameStore(s => s.profile)!
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const char = getCharacter(profile.characterId)

  const [phase, setPhase] = useState<'ready' | 'playing' | 'results'>('ready')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [target, setTarget] = useState(10)
  const [options, setOptions] = useState<number[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [startTime, setStartTime] = useState(0)

  const TOTAL_ROUNDS = 8

  const nextRound = useCallback(() => {
    const t = getTarget(difficulty)
    setTarget(t)
    setOptions(generateOptions(t))
    setSelected([])
    setFeedback(null)
  }, [difficulty])

  function startGame() {
    setRound(0); setScore(0)
    setStartTime(Date.now())
    nextRound()
    startActiveGame(topicId, 'number-bonds-potion')
    setPhase('playing')
  }

  function handleSelect(n: number) {
    if (feedback) return
    const newSelected = selected.includes(n) ? selected.filter(x => x !== n) : [...selected, n]
    setSelected(newSelected)

    if (newSelected.length === 2) {
      const sum = newSelected.reduce((a, b) => a + b, 0)
      if (sum === target) {
        setFeedback('correct')
        setScore(s => s + 1)
        recordActiveAnswer(true)
        setTimeout(() => {
          const newRound = round + 1
          setRound(newRound)
          if (newRound >= TOTAL_ROUNDS) {
            completeGame({ topicId, gameType: 'number-bonds-potion', score: score + 1, totalQuestions: TOTAL_ROUNDS, timeMs: Date.now() - startTime })
            setPhase('results')
          } else { nextRound() }
        }, 800)
      } else {
        setFeedback('incorrect')
        recordActiveAnswer(false)
        setTimeout(() => { setSelected([]); setFeedback(null) }, 800)
      }
    }
  }

  const stars = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-7xl mb-4">🧪</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Potion Lab!</h2>
        <p className="text-purple-200 mb-2">Pick TWO numbers that add up to the target!</p>
        <p className="text-white/50 text-sm mb-6">Brew {TOTAL_ROUNDS} potions to complete the level!</p>
        <Button variant="gold" size="xl" onClick={startGame}>🧪 Start Brewing!</Button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {stars === 3 && <Confetti />}
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Potions Brewed!</h2>
        <div className="text-5xl font-black text-white mb-2">{score}/{TOTAL_ROUNDS}</div>
        <StarRating stars={stars} size="lg" animate />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={startGame}>🧪 Again!</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-16 pb-4 items-center">
      <div className="max-w-lg w-full mb-4">
        <div className="flex justify-between text-white/60 text-sm mb-2">
          <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
          <span>✅ {score} correct</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      {/* Cauldron / target display */}
      <motion.div
        key={target}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex flex-col items-center mb-6"
      >
        <div className="text-7xl mb-2">🧪</div>
        <div className={`bg-white/10 border-4 rounded-3xl px-8 py-4 text-center transition-colors ${
          feedback === 'correct' ? 'border-green-400 bg-green-500/20' :
          feedback === 'incorrect' ? 'border-red-400 bg-red-500/20' :
          'border-purple-400/50'
        }`}>
          <div className="text-white/60 text-sm font-semibold mb-1">Make this number:</div>
          <div className="text-white font-fredoka text-6xl">{target}</div>
          {selected.length > 0 && (
            <div className="text-white/60 text-lg mt-1">
              {selected.join(' + ')} = {selected.reduce((a, b) => a + b, 0)}
            </div>
          )}
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`mt-2 text-2xl font-black ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback === 'correct' ? '✨ Perfect potion!' : '💥 Try again!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Number tiles */}
      <div className="max-w-lg w-full grid grid-cols-4 gap-3">
        {options.map(n => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelect(n)}
            className={`py-4 rounded-2xl text-2xl font-black border-2 transition-all ${
              selected.includes(n)
                ? 'bg-purple-500 border-purple-300 text-white scale-110'
                : 'bg-white/10 border-white/20 text-white hover:border-purple-400'
            }`}
          >
            {n}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
        <span>{char.emoji}</span>
        <span>Pick 2 numbers that add up to {target}!</span>
      </div>
    </div>
  )
}
