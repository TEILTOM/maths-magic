import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import type { TopicId, Difficulty } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'

interface Props { topicId: TopicId; difficulty: Difficulty; onComplete: () => void }

function getFractions(difficulty: Difficulty) {
  const denoms = difficulty === 'easy' ? [2, 4] : difficulty === 'medium' ? [2, 3, 4, 6] : [2, 3, 4, 5, 6, 8]
  const denom = denoms[Math.floor(Math.random() * denoms.length)]
  const numer = Math.floor(Math.random() * (denom - 1)) + 1
  return { numer, denom }
}

export default function FractionFeast({ topicId, difficulty, onComplete }: Props) {
  const profile = useGameStore(s => s.profile)!
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const char = getCharacter(profile.characterId)

  const [phase, setPhase] = useState<'ready' | 'playing' | 'results'>('ready')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [fraction, setFraction] = useState({ numer: 1, denom: 2 })
  const [selectedSlices, setSelectedSlices] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [startTime, setStartTime] = useState(0)

  const TOTAL_ROUNDS = 8
  const foods = ['🍕', '🍰', '🎂', '🥧', '🍩']
  const [food] = useState(() => foods[Math.floor(Math.random() * foods.length)])

  function startGame() {
    setRound(0); setScore(0)
    setFraction(getFractions(difficulty))
    setSelectedSlices([])
    setFeedback(null)
    setStartTime(Date.now())
    startActiveGame(topicId, 'fraction-feast')
    setPhase('playing')
  }

  function toggleSlice(i: number) {
    if (feedback) return
    setSelectedSlices(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  function checkAnswer() {
    if (feedback || selectedSlices.length === 0) return
    if (selectedSlices.length === fraction.numer) {
      setFeedback('correct')
      setScore(s => s + 1)
      recordActiveAnswer(true)
      setTimeout(() => {
        const newRound = round + 1
        setRound(newRound)
        if (newRound >= TOTAL_ROUNDS) {
          completeGame({ topicId, gameType: 'fraction-feast', score: score + 1, totalQuestions: TOTAL_ROUNDS, timeMs: Date.now() - startTime })
          setPhase('results')
        } else {
          setFraction(getFractions(difficulty))
          setSelectedSlices([])
          setFeedback(null)
        }
      }, 1000)
    } else {
      setFeedback('incorrect')
      recordActiveAnswer(false)
      setTimeout(() => { setFeedback(null); setSelectedSlices([]) }, 1000)
    }
  }

  const stars = score >= 7 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-7xl mb-4">🍕</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Fraction Feast!</h2>
        <p className="text-purple-200 mb-2">Tap the right number of slices to show the fraction!</p>
        <p className="text-white/50 text-sm mb-6">Complete {TOTAL_ROUNDS} rounds to finish the feast!</p>
        <Button variant="gold" size="xl" onClick={startGame}>🍕 Start Slicing!</Button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {stars >= 2 && <Confetti />}
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Feast Complete!</h2>
        <div className="text-5xl font-black text-white mb-2">{score}/{TOTAL_ROUNDS}</div>
        <StarRating stars={stars} size="lg" animate />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={startGame}>🍕 More Slices!</Button>
        </div>
      </div>
    )
  }

  const { numer, denom } = fraction

  return (
    <div className="flex flex-col min-h-screen px-4 pt-16 pb-4 items-center">
      <div className="max-w-lg w-full mb-4">
        <div className="flex justify-between text-white/60 text-sm mb-1">
          <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
          <span>✅ {score}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-pink-400 h-2 rounded-full" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      {/* Fraction display */}
      <motion.div key={`${numer}-${denom}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-6 text-center">
        <p className="text-white/60 text-sm mb-2">Tap to show this fraction:</p>
        <div className="bg-white/10 border-2 border-purple-400/50 rounded-2xl px-8 py-4 inline-block">
          <div className="text-white font-fredoka text-6xl leading-none">{numer}</div>
          <div className="border-t-2 border-white/60 my-1" />
          <div className="text-white font-fredoka text-6xl leading-none">{denom}</div>
        </div>
        <p className="text-white/50 text-sm mt-2">Select {numer} slice{numer > 1 ? 's' : ''} out of {denom}</p>
      </motion.div>

      {/* Pizza/food circle */}
      <div className="relative w-56 h-56 mb-6">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {Array.from({ length: denom }, (_, i) => {
            const startAngle = (i / denom) * 360 - 90
            const endAngle = ((i + 1) / denom) * 360 - 90
            const start = { x: 100 + 95 * Math.cos((startAngle * Math.PI) / 180), y: 100 + 95 * Math.sin((startAngle * Math.PI) / 180) }
            const end = { x: 100 + 95 * Math.cos((endAngle * Math.PI) / 180), y: 100 + 95 * Math.sin((endAngle * Math.PI) / 180) }
            const isSelected = selectedSlices.includes(i)
            return (
              <path
                key={i}
                d={`M 100 100 L ${start.x} ${start.y} A 95 95 0 0 1 ${end.x} ${end.y} Z`}
                fill={isSelected ? (feedback === 'correct' ? '#22c55e' : feedback === 'incorrect' ? '#ef4444' : '#a78bfa') : '#ffffff20'}
                stroke="#ffffff40"
                strokeWidth="2"
                className="cursor-pointer transition-colors"
                onClick={() => toggleSlice(i)}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none">
          {food}
        </div>
      </div>

      <div className="text-white/60 text-sm mb-4">
        {selectedSlices.length}/{denom} slices selected
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`mb-4 text-2xl font-black ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
            {feedback === 'correct' ? '🎉 Correct slice!' : `❌ Need exactly ${numer} slice${numer > 1 ? 's' : ''}!`}
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="gold" size="lg" onClick={checkAnswer} disabled={selectedSlices.length === 0 || !!feedback}>
        ✓ Check my answer!
      </Button>
    </div>
  )
}
