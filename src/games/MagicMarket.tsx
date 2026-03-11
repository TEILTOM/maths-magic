import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import type { TopicId, Difficulty } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'

interface Props { topicId: TopicId; difficulty: Difficulty; onComplete: () => void }

const ITEMS = [
  { name: 'Magic Wand', emoji: '🪄' },
  { name: 'Spell Book', emoji: '📚' },
  { name: 'Crystal Ball', emoji: '🔮' },
  { name: 'Dragon Egg', emoji: '🥚' },
  { name: 'Potion', emoji: '🧪' },
  { name: 'Star Gem', emoji: '💎' },
  { name: 'Wizard Hat', emoji: '🎩' },
  { name: 'Magic Apple', emoji: '🍎' },
]

const COINS = [
  { value: 1, label: '1p', emoji: '🟤' },
  { value: 2, label: '2p', emoji: '🟠' },
  { value: 5, label: '5p', emoji: '🟡' },
  { value: 10, label: '10p', emoji: '⚪' },
  { value: 20, label: '20p', emoji: '🟣' },
  { value: 50, label: '50p', emoji: '🔵' },
  { value: 100, label: '£1', emoji: '🥇' },
  { value: 200, label: '£2', emoji: '🥈' },
]

function getPrice(difficulty: Difficulty): number {
  if (difficulty === 'easy') return Math.floor(Math.random() * 9) * 10 + 10 // 10-90p
  if (difficulty === 'medium') return Math.floor(Math.random() * 18) * 5 + 10 // 10p-95p by 5p
  return Math.floor(Math.random() * 200) + 1 // 1p-200p
}

function formatPrice(p: number): string {
  return p >= 100 ? `£${(p / 100).toFixed(2)}` : `${p}p`
}

export default function MagicMarket({ topicId, difficulty, onComplete }: Props) {
  const profile = useGameStore(s => s.profile)!
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const char = getCharacter(profile.characterId)

  const [phase, setPhase] = useState<'ready' | 'playing' | 'results'>('ready')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [item, setItem] = useState(ITEMS[0])
  const [price, setPrice] = useState(50)
  const [basket, setBasket] = useState<{ coin: typeof COINS[0]; count: number }[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [startTime, setStartTime] = useState(0)

  const TOTAL_ROUNDS = 6

  const nextItem = useCallback(() => {
    setItem(ITEMS[Math.floor(Math.random() * ITEMS.length)])
    setPrice(getPrice(difficulty))
    setBasket([])
    setFeedback(null)
  }, [difficulty])

  function startGame() {
    setRound(0); setScore(0)
    setStartTime(Date.now())
    nextItem()
    startActiveGame(topicId, 'magic-market')
    setPhase('playing')
  }

  function addCoin(coin: typeof COINS[0]) {
    if (feedback) return
    const existing = basket.find(b => b.coin.value === coin.value)
    if (existing) {
      setBasket(basket.map(b => b.coin.value === coin.value ? { ...b, count: b.count + 1 } : b))
    } else {
      setBasket([...basket, { coin, count: 1 }])
    }
  }

  function removeCoin(coinValue: number) {
    setBasket(basket.map(b => b.coin.value === coinValue ? { ...b, count: b.count - 1 } : b).filter(b => b.count > 0))
  }

  const total = basket.reduce((sum, b) => sum + b.coin.value * b.count, 0)

  function checkAnswer() {
    if (feedback || total === 0) return
    if (total === price) {
      setFeedback('correct')
      setScore(s => s + 1)
      recordActiveAnswer(true)
      setTimeout(() => {
        const newRound = round + 1
        setRound(newRound)
        if (newRound >= TOTAL_ROUNDS) {
          completeGame({ topicId, gameType: 'magic-market', score: score + 1, totalQuestions: TOTAL_ROUNDS, timeMs: Date.now() - startTime })
          setPhase('results')
        } else { nextItem() }
      }, 1000)
    } else {
      setFeedback('incorrect')
      recordActiveAnswer(false)
      setTimeout(() => { setFeedback(null) }, 1000)
    }
  }

  const stars = score >= 5 ? 3 : score >= 3 ? 2 : score >= 2 ? 1 : 0

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Magic Market!</h2>
        <p className="text-purple-200 mb-2">Choose the right coins to pay for each item!</p>
        <p className="text-white/50 text-sm mb-6">Complete {TOTAL_ROUNDS} purchases!</p>
        <Button variant="gold" size="xl" onClick={startGame}>🛒 Open the Market!</Button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {stars >= 2 && <Confetti />}
        <div className="text-7xl mb-4">🛍️</div>
        <h2 className="text-white font-fredoka text-3xl mb-2">Shopping Done!</h2>
        <div className="text-5xl font-black text-white mb-2">{score}/{TOTAL_ROUNDS}</div>
        <StarRating stars={stars} size="lg" animate />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={startGame}>🛒 Shop Again!</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-16 pb-4">
      <div className="max-w-lg mx-auto w-full mb-4">
        <div className="flex justify-between text-white/60 text-sm mb-1">
          <span>Item {round + 1}/{TOTAL_ROUNDS}</span>
          <span>✅ {score}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full">
        {/* Item display */}
        <motion.div key={round} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 border-2 border-yellow-400/40 rounded-2xl p-4 mb-4 flex items-center gap-4">
          <span className="text-5xl">{item.emoji}</span>
          <div>
            <div className="text-white font-black text-lg">{item.name}</div>
            <div className="text-yellow-300 font-fredoka text-3xl">{formatPrice(price)}</div>
          </div>
        </motion.div>

        {/* Coins to pick */}
        <div className="mb-3">
          <p className="text-white/60 text-xs mb-2 font-semibold">TAP coins to add to your basket:</p>
          <div className="grid grid-cols-4 gap-2">
            {COINS.filter(c => c.value <= (difficulty === 'easy' ? 50 : 200)).map(coin => (
              <motion.button key={coin.value} whileTap={{ scale: 0.9 }} onClick={() => addCoin(coin)}
                className="flex flex-col items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-2 transition-colors">
                <span className="text-2xl">{coin.emoji}</span>
                <span className="text-white text-xs font-bold">{coin.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Basket */}
        <div className={`rounded-2xl p-3 mb-3 border-2 transition-colors ${
          feedback === 'correct' ? 'bg-green-500/20 border-green-400' :
          feedback === 'incorrect' ? 'bg-red-500/20 border-red-400' :
          'bg-white/5 border-white/20'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-xs font-semibold">🛒 Your basket</span>
            <span className={`font-black text-lg ${total === price ? 'text-green-400' : total > price ? 'text-red-400' : 'text-white'}`}>
              {formatPrice(total)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {basket.map(b => (
              <button key={b.coin.value} onClick={() => removeCoin(b.coin.value)}
                className="flex items-center gap-1 bg-white/10 hover:bg-red-500/30 rounded-lg px-2 py-1 text-xs font-bold text-white transition-colors">
                {b.coin.emoji} {b.coin.label} ×{b.count} ✕
              </button>
            ))}
            {basket.length === 0 && <span className="text-white/30 text-xs">No coins yet...</span>}
          </div>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`text-center text-xl font-black mb-3 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback === 'correct' ? '🎉 Exact! Great shopping!' : `❌ That's ${formatPrice(total)}, not ${formatPrice(price)}!`}
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="gold" size="lg" fullWidth onClick={checkAnswer} disabled={total === 0 || !!feedback}>
          ✓ Pay {formatPrice(total)}
        </Button>

        {difficulty !== 'easy' && total > price && (
          <p className="text-red-300 text-xs text-center mt-2">Too much! Remove some coins. 🪙</p>
        )}
      </div>
    </div>
  )
}
