import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { generateBatch } from '../utils/questionGenerator'
import type { TopicId, Difficulty } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'

interface Props { topicId: TopicId; difficulty: Difficulty; onComplete: () => void }

interface Card {
  id: string
  content: string
  pairId: string
  type: 'question' | 'answer'
  matched: boolean
  flipped: boolean
}

export default function MemoryCrystal({ topicId, difficulty, onComplete }: Props) {
  const profile = useGameStore(s => s.profile)!
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const char = getCharacter(profile.characterId)

  const [phase, setPhase] = useState<'ready' | 'playing' | 'results'>('ready')
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(0)

  const PAIRS = 6

  function setupCards() {
    const questions = generateBatch(topicId, difficulty, PAIRS)
    const newCards: Card[] = []
    questions.forEach((q, i) => {
      const pairId = `pair-${i}`
      newCards.push({ id: `q-${i}`, content: q.question.split('\n')[0], pairId, type: 'question', matched: false, flipped: false })
      newCards.push({ id: `a-${i}`, content: q.options[q.correctIndex], pairId, type: 'answer', matched: false, flipped: false })
    })
    // Shuffle
    const shuffled = [...newCards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlipped([])
    setMatches(0)
    setAttempts(0)
  }

  function startGame() {
    setupCards()
    setStartTime(Date.now())
    startActiveGame(topicId, 'memory-crystal')
    setPhase('playing')
  }

  function handleCardClick(cardId: string) {
    const card = cards.find(c => c.id === cardId)
    if (!card || card.matched || card.flipped || flipped.length >= 2) return

    const newFlipped = [...flipped, cardId]
    setCards(cs => cs.map(c => c.id === cardId ? { ...c, flipped: true } : c))
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setAttempts(a => a + 1)
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!)
      if (first.pairId === second.pairId && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          setCards(cs => cs.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c))
          setFlipped([])
          const newMatches = matches + 1
          setMatches(newMatches)
          recordActiveAnswer(true)
          if (newMatches >= PAIRS) {
            const elapsed = Date.now() - startTime
            completeGame({ topicId, gameType: 'memory-crystal', score: PAIRS, totalQuestions: PAIRS, timeMs: elapsed })
            setPhase('results')
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards(cs => cs.map(c => newFlipped.includes(c.id) && !c.matched ? { ...c, flipped: false } : c))
          setFlipped([])
          recordActiveAnswer(false)
        }, 1200)
      }
    }
  }

  const accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 100
  const stars = attempts <= PAIRS ? 3 : attempts <= PAIRS * 1.5 ? 2 : 1

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-7xl mb-4 animate-bounce">💎</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Memory Crystals!</h2>
        <p className="text-purple-200 mb-2">Match each question with its answer!</p>
        <p className="text-white/50 text-sm mb-6">Find all {PAIRS} pairs. Try to do it in as few clicks as possible!</p>
        <div className="flex items-center gap-2 mb-6 text-2xl">{char.emoji}</div>
        <Button variant="gold" size="xl" onClick={startGame}>💎 Start Matching!</Button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {stars === 3 && <Confetti />}
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">All matched!</h2>
        <div className="text-white/70 mb-2">{PAIRS} pairs found in {attempts} attempts</div>
        <StarRating stars={stars} size="lg" animate />
        <div className="text-white/50 text-sm mt-2">Accuracy: {accuracy}%</div>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={startGame}>💎 Play Again!</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-3 pt-16 pb-4">
      <div className="max-w-lg mx-auto w-full mb-3">
        <div className="flex justify-between text-white/60 text-sm">
          <span>💎 {matches}/{PAIRS} matched</span>
          <span>Attempts: {attempts}</span>
        </div>
      </div>
      <div className="max-w-lg mx-auto w-full grid grid-cols-3 gap-2">
        {cards.map(card => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            whileTap={!card.matched && !card.flipped ? { scale: 0.95 } : {}}
            className={`relative aspect-square rounded-2xl border-2 text-sm font-bold transition-all overflow-hidden ${
              card.matched ? 'bg-green-500/30 border-green-400 cursor-default' :
              card.flipped ? 'bg-purple-500/40 border-purple-400' :
              'bg-white/10 border-white/20 hover:border-purple-400 cursor-pointer'
            }`}
          >
            <AnimatePresence>
              {(card.flipped || card.matched) ? (
                <motion.div
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  className="absolute inset-0 flex items-center justify-center p-1 text-white text-xs leading-tight text-center"
                >
                  {card.content}
                </motion.div>
              ) : (
                <motion.div className="absolute inset-0 flex items-center justify-center text-2xl">
                  💎
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
